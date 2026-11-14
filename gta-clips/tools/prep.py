"""Эдит (edits/<id>.json) + сетка ударов → короткие фрагменты 1080×1920@60 с грейдом → таймлайн для Remotion.

  python tools/prep.py edits/t2_v1.json [--force]

Для каждого шота вырезается ТОЛЬКО нужный кусок исходника (≤ ~2 с), кадрируется в 9:16
(crop — центр по горизонтали 0..1, zoom — доп. приближение, pan — [x0, x1] проезд кропа),
красится LUT-ом канала и пишется в video/public/clips/<hash>.mp4 (короткий GOP — точная перемотка
для speed ramp). Таймлайн → video/src/timelines/<id>.json, список эдитов → video/src/timelines/index.ts.

Поля шота: src, in (с), out (с, необязательно), speed (если нет out; 1 = как в исходнике),
ramp: in | out | smash, beats (сколько ударов занимает шот, по умолч. 1), crop, cy, zoom, pan, fx: [...]
"""
import argparse
import hashlib
import sys
from pathlib import Path

import os
import shutil
from common import ROOT, PUBLIC, VIDEO, WORK, FPS, W, H, FFMPEG, source_path, probe, load_json, save_json, run

PAD = 3                              # кадров запаса до/после (для motion blur и перемотки)
MAX_SPAN = 2.5                       # предохранитель: фрагмент исходника не длиннее, с


def comp_id(edit_id):
    return "Clip-" + "".join(c if c.isalnum() else "-" for c in edit_id)


def delogo_filters(src_id, t0, dur):
    """Стирание водяных знаков платформы (TikTok и т.п.) по sources.json: [x, y, w, h, от, до] в сек исходника."""
    reg = load_json(ROOT / "sources.json").get(src_id, {})
    out = []
    for x, y, w, h, a, b in reg.get("delogo", []):
        if b <= t0 or a >= t0 + dur:
            continue
        out.append(f"delogo=x={x}:y={y}:w={w}:h={h}:enable='between(t,{a - t0:.3f},{b - t0:.3f})'")
    return out


def find_upscaler():
    """Real-ESRGAN (ncnn-vulkan, работает на любой видеокарте с Vulkan, в т.ч. RTX 4060): REALESRGAN=путь к exe
    или tools/bin/realesrgan-ncnn-vulkan(.exe). Модели — рядом с exe в папке models/."""
    import shutil as sh
    for c in [os.environ.get("REALESRGAN"), ROOT / "tools/bin/realesrgan-ncnn-vulkan.exe",
              ROOT / "tools/bin/realesrgan-ncnn-vulkan", sh.which("realesrgan-ncnn-vulkan")]:
        if c and Path(c).exists():
            return Path(c)
    return None


def upscale_fragment(src, t0, dur, pre, model, force):
    """Фрагмент исходника (с уже стёртыми водяными знаками) ×4 через Real-ESRGAN → work/up/<hash>.mp4 (почти без потерь)."""
    exe = find_upscaler()
    if not exe:
        sys.exit("нет Real-ESRGAN: скачайте realesrgan-ncnn-vulkan (см. README) или запустите без --upscale")
    key = hashlib.sha1(f"{src}|{t0:.4f}|{dur:.4f}|{pre}|{model}".encode()).hexdigest()[:12]
    out = WORK / "up" / f"{key}.mp4"
    if out.exists() and not force:
        return out
    fin, fout = WORK / "up" / f"{key}_in", WORK / "up" / f"{key}_out"
    for d in (fin, fout):
        shutil.rmtree(d, ignore_errors=True); d.mkdir(parents=True)
    run([FFMPEG, "-v", "error", "-y", "-ss", f"{t0:.4f}", "-i", str(src), "-t", f"{dur:.4f}", "-an", "-vf", ",".join(pre),
         str(fin / "%05d.png")], cwd=str(ROOT))
    run([str(exe), "-i", str(fin), "-o", str(fout), "-n", model, "-s", "4", "-f", "png"], cwd=str(exe.parent))
    run([FFMPEG, "-v", "error", "-y", "-framerate", str(FPS), "-i", str(fout / "%05d.png"), "-c:v", "libx264",
         "-preset", "slow", "-crf", "8", "-pix_fmt", "yuv444p", str(out)])
    shutil.rmtree(fin); shutil.rmtree(fout)
    return out


INTERP = "minterpolate=fps=60:mi_mode=mci:mc_mode=aobmc:me_mode=bidir:vsbmc=1"


def cut_clip(shot, span, lut, force, res=1, upscale=None, interp=False):
    W2, H2 = W * res, H * res
    src = source_path(shot["src"])
    t0 = max(0.0, float(shot["in"]) - PAD / FPS)
    dur = span + 2 * PAD / FPS
    info = probe(src)
    # 30-кадровый исходник → честные 60 кадров (интерполяция движения), иначе каждый кадр просто повторяется дважды
    fps_f = INTERP if interp and info.get("fps", 60) < 50 else f"fps={FPS}"
    pre = [fps_f] + delogo_filters(shot["src"], t0, dur)
    if upscale and info["height"] < H2 / 2:         # мало пикселей → AI-апскейл ×4 до кадрирования
        src, t_in = upscale_fragment(src, t0, dur, pre, upscale, force), 0.0
        info = probe(src)
        pre = [f"fps={FPS}"]          # интерполяция уже сделана до апскейла
    else:
        t_in = t0
    sw, sh = info["width"], info["height"]
    zoom = float(shot.get("zoom", 1.0))
    ch = sh / zoom
    cw = ch * 9 / 16
    if cw > sw:                       # исходник уже вертикальный/узкий
        cw, ch = sw / zoom, sw / zoom * 16 / 9
    cw, ch = int(cw) // 2 * 2, int(ch) // 2 * 2
    cx = float(shot.get("crop", 0.5))
    cy = float(shot.get("cy", 0.5))
    clampx = lambda e: f"max(0,min({sw - cw},{e}))"
    y = max(0, min(sh - ch, int(cy * sh - ch / 2)))
    if shot.get("pan"):
        x0, x1 = shot["pan"]
        xe = clampx(f"({x0}+({x1}-{x0})*t/{dur:.4f})*{sw}-{cw / 2}")
    else:
        xe = str(max(0, min(sw - cw, int(cx * sw - cw / 2))))
    band = shot.get("band")           # широкий кадр полосой по центру на размытом фоне: {"aspect": 1.78, "zoom": 1}
    sharp = "unsharp=5:5:0.7:5:5:0" if H2 / ch > 1.6 else None
    if band:
        bz = float(band.get("zoom", 1.0))
        bh = int(sh / bz) // 2 * 2
        bw = min(sw, int(bh * float(band.get("aspect", sw / sh)))) // 2 * 2
        bx = max(0, min(sw - bw, int(cx * sw - bw / 2)))
        by = max(0, min(sh - bh, int(cy * sh - bh / 2)))
        fh = int(W2 * bh / bw) // 2 * 2
        graph = (",".join(pre) + ",split[a][b];"
                 f"[a]crop={cw}:{ch}:'{xe}':{y},scale={W // 4}:{H // 4},boxblur=12:2,scale={W2}:{H2},eq=brightness=-0.12:saturation=1.25[bg];"
                 f"[b]crop={bw}:{bh}:{bx}:{by},scale={W2}:{fh}:flags=lanczos" + (",unsharp=5:5:0.5:5:5:0" if W2 / bw > 1.2 else "") + "[fg];"
                 f"[bg][fg]overlay=0:(H-h)/2")
    else:
        graph = ",".join(pre + [f"crop={cw}:{ch}:'{xe}':{y}", f"scale={W2}:{H2}:flags=lanczos"] + ([sharp] if sharp else []))
    if lut:
        graph += f",lut3d=file={lut.relative_to(ROOT).as_posix()}:interp=tetrahedral"
    graph += ",format=yuv420p"
    key = f"{src.name}|{t_in:.4f}|{dur:.4f}|{graph}|{lut.stat().st_mtime if lut else 0}"
    name = hashlib.sha1(key.encode()).hexdigest()[:12] + ".mp4"
    out = PUBLIC / "clips" / name
    if out.exists() and not force:
        return name
    out.parent.mkdir(parents=True, exist_ok=True)
    run([FFMPEG, "-v", "error", "-y", "-ss", f"{t_in:.4f}", "-i", str(src), "-t", f"{dur:.4f}", "-an",
         "-filter_complex", graph, "-c:v", "libx264", "-preset", "medium", "-crf", "12" if res > 1 else "14",
         "-g", "6", "-bf", "0", "-movflags", "+faststart", str(out)], cwd=str(ROOT))
    return name


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("edit")
    ap.add_argument("--force", action="store_true")
    ap.add_argument("--res", type=int, help="1 = 1080×1920, 2 = 4K 2160×3840 (по умолч. из эдита или 1)")
    ap.add_argument("--upscale", nargs="?", const="realesrgan-x4plus", help="AI-апскейл слабых исходников (Real-ESRGAN), модель")
    ap.add_argument("--interp", action="store_true", help="30→60 fps интерполяцией движения (плавнее, дольше)")
    args = ap.parse_args()
    edit = load_json(args.edit)
    res = args.res or int(edit.get("res", 1))
    beats = load_json(ROOT / edit["beats"])
    grid = beats["shots"]
    lut = ROOT / edit.get("grade", "grade/clipso.cube") if edit.get("grade", "grade/clipso.cube") else None
    if lut and not lut.exists():
        sys.exit(f"нет LUT {lut} — python tools/grade_lut.py")
    shots, g = [], 0
    for n, s in enumerate(edit["shots"]):
        k = int(s.get("beats", 1))
        if g >= len(grid):
            print(f"! шот {n} лишний — сетка закончилась", file=sys.stderr); break
        seg = grid[g:g + k]
        frm, frames = seg[0]["from"], sum(x["frames"] for x in seg)
        g += k
        dur = frames / FPS
        span = (float(s["out"]) - float(s["in"])) if s.get("out") is not None else dur * float(s.get("speed", 1))
        if span > MAX_SPAN:
            sys.exit(f"шот {n}: фрагмент {span:.2f} с > {MAX_SPAN} с — трейлеры берём только короткими кусками")
        clip = cut_clip(s, span, lut, args.force, res, args.upscale, args.interp or edit.get("interp", False))
        shots.append(dict(i=n, src=s["src"], src_in=s["in"], from_=frm, frames=frames, clip=f"clips/{clip}", pad=PAD,
                          span=round(span * FPS, 3), ramp=s.get("ramp"), fx=s.get("fx", []), strong=seg[0]["strong"],
                          kind=seg[0]["kind"], block=s.get("note", ""), drift=s.get("drift", 0)))
        print(f"  #{n:2} {frm:4}+{frames:3}к  {s['src']}@{s['in']:.2f}  span {span:.2f}c  {s.get('fx', [])}", file=sys.stderr)
    if g < len(grid):
        print(f"! заполнено {g} из {len(grid)} ударов — эдит обрежется на кадре {grid[g]['from']}", file=sys.stderr)
    total = shots[-1]["from_"] + shots[-1]["frames"]
    for s in shots:
        s["from"] = s.pop("from_")
    music = None
    if edit.get("music"):
        mf = PUBLIC / "music" / edit["music"]
        if mf.exists():
            music = dict(file=f"music/{edit['music']}", start=beats["start"])
        else:
            print(f"! нет {mf} — превью будет без трека", file=sys.stderr)
    caps = [dict(text=c["text"], color=c.get("color", "#ff3df2"), from_=int(round(c["from"] * FPS)),
                 to=int(round(c["to"] * FPS))) for c in edit.get("captions", [])]
    for c in caps:
        c["from"] = c.pop("from_")
    tl = dict(id=edit["id"], comp=comp_id(edit["id"]), fps=FPS, width=W, height=H, res=res, frames=total, music=music,
              outro=int(round(float(edit.get("outro", 0)) * FPS)),
              watermark=edit.get("watermark", "CLIPSO"), captions=caps, shots=shots,
              cuts=[s["from"] for s in shots], strong=[s["from"] for s in shots if s["strong"]])
    tdir = VIDEO / "src" / "timelines"
    save_json(tdir / f"{edit['id']}.json", tl)
    ids = sorted(p.stem for p in tdir.glob("*.json"))
    lines = ["// генерирует tools/prep.py", "import type { Timeline } from '../types';"]
    lines += [f"import t{i} from './{x}.json';" for i, x in enumerate(ids)]
    lines += ["export const timelines: Timeline[] = [" + ", ".join(f"t{i} as Timeline" for i in range(len(ids))) + "];", ""]
    (tdir / "index.ts").write_text("\n".join(lines), encoding="utf-8")
    print(f"{tl['comp']}: {len(shots)} шотов, {total} кадров = {total / FPS:.2f} с")


if __name__ == "__main__":
    main()
