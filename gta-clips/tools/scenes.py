"""Автопоиск ярких шотов в исходнике.

  python tools/scenes.py t2 [--fps 12] [--sheet] [--min-score 0]
    → scenes/t2.json  (+ scenes/t2_sheet_N.jpg — контакт-лист вертикальных кропов 9:16)

Для каждого шота (между склейками исходника):
  brightness (V), saturation (S), colorful (Hasler–Süsstrunk), motion (разница соседних кадров),
  hues — доли тёплых/зелёных/бирюзовых/синих/пурпурных пикселей,
  block — цвет-блок: night (ночь-неон) · day (день-пляж) · sunset (закат/золото) · warm · dark (титры/темнота),
  score 0–100 — насколько шот «сочный» для эдита,
  best — лучший под-отрезок (≤1.2 с) внутри шота, crop_x — центр вертикального кропа 9:16 (0..1).
"""
import argparse
import sys
from pathlib import Path

import numpy as np

from common import ROOT, FFMPEG, source_path, probe, iter_frames, rgb_to_hsv, save_json, run

AW, AH = 192, 108          # разрешение анализа (16:9)


def hue_fracs(h, s, v):
    w = s * v
    w = w * (s > 0.18) * (v > 0.12)
    tot = w.sum() + 1e-6
    f = lambda m: float((w * m).sum() / tot)
    return dict(warm=f((h < 50) | (h >= 335)), green=f((h >= 70) & (h < 160)), cyan=f((h >= 160) & (h < 205)),
                blue=f((h >= 205) & (h < 255)), magenta=f((h >= 255) & (h < 335)), chroma=float(w.mean()))


def classify(v, s, hf):
    if v < 0.11 or (s < 0.12 and v < 0.22):
        return "dark"
    cool = hf["blue"] + hf["magenta"] + hf["cyan"]
    if v < 0.36 and (cool > 0.45 or hf["magenta"] > 0.2):
        return "night"
    if hf["warm"] > 0.55 and 0.2 <= v <= 0.8 and s > 0.3:
        return "sunset"
    if v >= 0.36 and (hf["cyan"] + hf["blue"] + hf["green"]) > 0.4:
        return "day"
    if v < 0.36:
        return "night" if cool > 0.3 else "dark"
    return "warm"


def colorfulness(rgb):
    r, g, b = rgb[..., 0], rgb[..., 1], rgb[..., 2]
    rg = r - g
    yb = 0.5 * (r + g) - b
    return float(np.sqrt(rg.std() ** 2 + yb.std() ** 2) + 0.3 * np.sqrt(rg.mean() ** 2 + yb.mean() ** 2))


def analyze(path, fps):
    info = probe(path)
    feats, hists, grays, cols, colm = [], [], [], [], []
    prev = None
    for fr in iter_frames(path, AW, AH, fps):
        rgb = fr.astype(np.float32) / 255
        h, s, v = rgb_to_hsv(rgb)
        gray = rgb @ np.array([0.299, 0.587, 0.114], np.float32)
        hist = np.histogram2d(h.ravel(), v.ravel(), bins=(18, 6), range=((0, 360), (0, 1)), weights=None)[0].ravel()
        hist /= hist.sum()
        motion = float(np.abs(gray - prev).mean()) if prev is not None else 0.0
        gx = np.abs(np.diff(gray, axis=1, prepend=gray[:, :1]))
        cols.append(gx.mean(0) + 0.5 * (s * v).mean(0))
        colm.append(np.abs(gray - prev).mean(0) if prev is not None else np.zeros(AW, np.float32))
        feats.append(dict(v=float(v.mean()), y=float(gray.mean()), s=float(s.mean()), cf=colorfulness(rgb), motion=motion, **hue_fracs(h, s, v)))
        hists.append(hist)
        prev = gray
    n = len(feats)
    hists = np.array(hists)
    hd = np.zeros(n)
    hd[1:] = 0.5 * np.abs(np.diff(hists, axis=0)).sum(1)
    pd = np.array([f["motion"] for f in feats])
    d = 0.6 * hd + 2.0 * pd
    cuts = [0]
    for i in range(1, n):
        lo = max(1, i - fps)
        med = np.median(d[lo:i + fps]) if i + fps <= n else np.median(d[lo:])
        thr = max(0.32, 3.5 * med)
        if d[i] > thr and d[i] >= d[max(0, i - 1)] and d[i] >= (d[i + 1] if i + 1 < n else 0) and i - cuts[-1] >= max(2, int(0.2 * fps)):
            cuts.append(i)
    cuts.append(n)
    return info, feats, np.array(cols), np.array(colm), cuts


def best_crop(colw, aspect_src):
    """Центр окна 9:16 с максимумом «интересного» (детали + цвет + движение) по столбцам."""
    frac = (9 / 16) / aspect_src
    win = max(1, int(round(frac * len(colw))))
    c = np.convolve(colw, np.ones(win), mode="valid")
    # лёгкое притяжение к центру — трейлерная композиция обычно центральная
    xs = (np.arange(len(c)) + win / 2) / len(colw)
    c = c / (c.max() + 1e-9) - 0.25 * np.abs(xs - 0.5)
    return float(xs[int(np.argmax(c))])


def build_shots(info, feats, cols, colm, cuts, fps):
    aspect = info["width"] / info["height"]
    shots = []
    for k in range(len(cuts) - 1):
        a, b = cuts[k], cuts[k + 1]
        inner = list(range(a + 1, b - 1)) or list(range(a, b))
        F = [feats[i] for i in inner]
        avg = {key: float(np.mean([f[key] for f in F])) for key in F[0]}
        mot = float(np.mean([feats[i]["motion"] for i in inner[1:]] or [0]))
        block = classify(avg["v"], avg["s"], avg)
        dur = (b - a) / fps
        # под-отрезок ≤1.2 с с максимумом цвет×движение
        L = min(len(inner), int(1.2 * fps))
        per = np.array([feats[i]["cf"] * (0.3 + 8 * feats[i]["motion"]) for i in inner])
        j = int(np.argmax(np.convolve(per, np.ones(L), "valid"))) if len(per) >= L and L > 0 else 0
        best_in, best_out = inner[j] / fps, (inner[j] + L) / fps
        colw = cols[a:b].mean(0) + 4 * colm[a + 1:b].mean(0) if b - a > 1 else cols[a]
        score = (min(avg["cf"] / 0.35, 1) * 40 + min(mot / 0.06, 1) * 25 + min(avg["s"] / 0.55, 1) * 15
                 + (1 - min(abs(avg["v"] - 0.45) / 0.45, 1)) * 20)
        if block == "dark":
            score *= 0.3
        if dur < 0.3:
            score *= 0.6
        shots.append(dict(id=k, t_in=round(a / fps, 3), t_out=round(b / fps, 3), dur=round(dur, 3), block=block,
                          score=round(score, 1), brightness=round(avg["v"], 3), saturation=round(avg["s"], 3),
                          colorful=round(avg["cf"], 3), motion=round(mot, 4),
                          hues={h: round(avg[h], 3) for h in ("warm", "green", "cyan", "blue", "magenta")},
                          best=[round(best_in, 3), round(best_out, 3)], crop_x=round(best_crop(colw, aspect), 3)))
    return shots


def contact_sheet(path, src_id, shots, info, out_dir, per_sheet=40, cols=8):
    from PIL import Image, ImageDraw, ImageFont
    tw, th = 180, 320
    tmp = out_dir / f"_thumbs_{src_id}"
    tmp.mkdir(parents=True, exist_ok=True)
    cw = min(info["width"], int(round(info["height"] * 9 / 16)))
    colors = dict(night=(190, 70, 255), day=(40, 200, 230), sunset=(255, 140, 40), warm=(230, 200, 120), dark=(90, 90, 90))
    try:
        font = ImageFont.truetype("DejaVuSans-Bold.ttf", 15)
    except OSError:
        font = ImageFont.load_default()
    pages = []
    for p in range(0, len(shots), per_sheet):
        chunk = shots[p:p + per_sheet]
        rows = (len(chunk) + cols - 1) // cols
        sheet = Image.new("RGB", (cols * (tw + 6) + 6, rows * (th + 46) + 6), (12, 12, 14))
        dr = ImageDraw.Draw(sheet)
        for n, s in enumerate(chunk):
            t = (s["best"][0] + s["best"][1]) / 2
            x0 = int(np.clip(s["crop_x"] * info["width"] - cw / 2, 0, info["width"] - cw))
            png = tmp / f"{s['id']:04d}.jpg"
            if not png.exists():
                run([FFMPEG, "-v", "error", "-y", "-ss", f"{t:.3f}", "-i", str(path), "-frames:v", "1",
                     "-vf", f"crop={cw}:{info['height']}:{x0}:0,scale={tw}:{th}", "-q:v", "3", str(png)])
            x, y = 6 + (n % cols) * (tw + 6), 6 + (n // cols) * (th + 46)
            sheet.paste(Image.open(png), (x, y))
            c = colors.get(s["block"], (200, 200, 200))
            dr.rectangle([x, y + th, x + tw, y + th + 5], fill=c)
            dr.text((x + 2, y + th + 7), f"#{s['id']} {s['t_in']:.2f}s {s['dur']:.1f}s", fill=(255, 255, 255), font=font)
            dr.text((x + 2, y + th + 25), f"{s['block']} {s['score']:.0f}", fill=c, font=font)
        f = out_dir / f"{src_id}_sheet_{p // per_sheet + 1}.jpg"
        sheet.save(f, quality=85)
        pages.append(f)
        print("→", f, file=sys.stderr)
    return pages


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("src")
    ap.add_argument("--fps", type=int, default=12)
    ap.add_argument("--sheet", action="store_true")
    ap.add_argument("--min-score", type=float, default=0)
    args = ap.parse_args()
    path = source_path(args.src)
    src_id = Path(path).stem
    info, feats, cols, colm, cuts = analyze(path, args.fps)
    shots = build_shots(info, feats, cols, colm, cuts, args.fps)
    out_dir = ROOT / "scenes"
    save_json(out_dir / f"{src_id}.json", dict(source=src_id, file=Path(path).name, info=info, analysis_fps=args.fps, shots=shots))
    by = {}
    for s in shots:
        by.setdefault(s["block"], []).append(s)
    print(f"{src_id}: {len(shots)} шотов; " + ", ".join(f"{k} {len(v)}" for k, v in sorted(by.items())))
    for k, v in sorted(by.items()):
        top = sorted(v, key=lambda s: -s["score"])[:6]
        print(f"  {k:7} топ: " + "  ".join(f"#{s['id']}@{s['t_in']:.1f}({s['score']:.0f})" for s in top))
    if args.sheet:
        contact_sheet(path, src_id, [s for s in shots if s["score"] >= args.min_score], info, out_dir)


if __name__ == "__main__":
    main()
