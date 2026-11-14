"""Удары трека → сетка склеек.

  python tools/beats.py <трек.mp3> [--out beats/<имя>.json] [--len 16] [--start 31.2] [--bpm 117]
                        [--climax 9.5-12.5] [--no-half] [--plot]

Логика (по RECIPE.md):
  * 1 удар = 1 шот (склейка на каждой доле);
  * в кульминации — полудоли (две склейки на удар);
  * сильные доли (первая доля такта) и пики атаки помечены strong → туда ставим панчи
    (zoom punch / shake / RGB split / вспышка).
Окно 13–20 с подбирается автоматически: начало на первой доле такта, внутри — самый сильный «дроп»
(скачок громкости). Можно задать вручную --start (сек трека) и --climax (сек от начала окна).
Все времена в выходном JSON округлены к кадрам 60 fps.
"""
import argparse
import sys
from pathlib import Path

import numpy as np

from common import ROOT, FPS, save_json

SR = 22050
HOP = 256


def analyze(path, bpm=None):
    import librosa
    y, sr = librosa.load(str(path), sr=SR, mono=True)
    dur = len(y) / sr
    onset = librosa.onset.onset_strength(y=y, sr=sr, hop_length=HOP)
    mel = librosa.feature.melspectrogram(y=y, sr=sr, hop_length=HOP, n_mels=64, fmax=8000)
    low = librosa.onset.onset_strength(S=librosa.power_to_db(mel[:6]), sr=sr, hop_length=HOP)   # бочка/бас
    kw = dict(onset_envelope=onset, sr=sr, hop_length=HOP, tightness=120, units="time")
    if bpm:
        kw["start_bpm"] = bpm
    tempo, beats = librosa.beat.beat_track(**kw)
    tempo = float(np.atleast_1d(tempo)[0])
    beats = np.asarray(beats, float)
    # регулярная сетка: убираем пропуски/двойные удары трекера, достраиваем до конца трека
    period = float(np.median(np.diff(beats))) if len(beats) > 2 else 60 / tempo
    grid = [beats[0]]
    for b in beats[1:]:
        while b - grid[-1] > 1.5 * period:
            grid.append(grid[-1] + period)
        if b - grid[-1] > 0.5 * period:
            grid.append(b)
    while grid[-1] + period < dur:
        grid.append(grid[-1] + period)
    t0 = grid[0]
    while t0 - period > 0:
        t0 -= period
        grid.insert(0, t0)
    beats = np.array(grid)
    times = np.arange(len(onset)) * HOP / sr

    def at(env, t, w=0.05):
        i0, i1 = np.searchsorted(times, [t - w, t + w])
        return float(env[i0:max(i1, i0 + 1)].max()) if i0 < len(env) else 0.0

    low_at = np.array([at(low, b) for b in beats])
    on_at = np.array([at(onset, b) for b in beats])
    phase = int(np.argmax([low_at[p::4].mean() for p in range(4)]))   # где сильная доля такта
    rms = librosa.feature.rms(y=y, hop_length=HOP)[0]
    k = max(1, int(1.0 * sr / HOP))
    rms_s = np.convolve(rms, np.ones(k) / k, mode="same")
    rms_s = rms_s / (rms_s.max() + 1e-9)
    return dict(duration=dur, tempo=60 / period, period=period, beats=beats, phase=phase, low_at=low_at,
                on_at=on_at, times=times, rms=rms_s, onset=onset / (onset.max() + 1e-9))


def energy(a, t0, t1):
    i0, i1 = np.searchsorted(a["times"], [t0, t1])
    return float(a["rms"][i0:max(i1, i0 + 1)].mean())


def pick_window(a, length):
    beats, period = a["beats"], a["period"]
    downs = [i for i in range(len(beats)) if (i - a["phase"]) % 4 == 0]
    best = None
    for i in downs:
        s = beats[i]
        if s + length > a["duration"] - 0.2:
            break
        e = energy(a, s, s + length)
        jump = 0.0
        for j in downs:
            t = beats[j]
            if s + 2.5 <= t <= s + length * 0.6:
                jump = max(jump, energy(a, t, t + 2) - energy(a, t - 2, t))
        score = e + 1.5 * jump
        if best is None or score > best[0]:
            best = (score, i)
    if best is None:
        return 0
    return best[1]


def build(a, start_idx, length, climax=None, half=True, per=1):
    beats, period = a["beats"], a["period"]
    start = beats[start_idx]
    n_beats = int(round(length / period))
    end = start + n_beats * period if start_idx + n_beats >= len(beats) else beats[start_idx + n_beats]
    win = [(i, beats[i]) for i in range(start_idx, start_idx + n_beats) if i < len(beats)]
    strong_thr = np.percentile(a["on_at"], 85)
    if climax is None and half:
        # 2 такта (8 долей; при медленном треке — 1 такт) с макс. атакой во второй половине окна, не на последних долях
        L = 8 if n_beats >= 24 else 4
        best = None
        for k in range(n_beats // 2 - 2, n_beats - L - 1):
            seg = [a["on_at"][win[j][0]] for j in range(k, k + L)]
            if (win[k][0] - a["phase"]) % 4 != 0:
                continue
            v = float(np.mean(seg))
            if best is None or v > best[0]:
                best = (v, k)
        if best:
            climax = (win[best[1]][1] - start, win[best[1]][1] - start + L * period)
    cuts = []
    for n, (i, t) in enumerate(win):
        rel = t - start
        bar_pos = (i - a["phase"]) % 4
        strong = bar_pos == 0 or a["on_at"][i] >= strong_thr
        in_climax = bool(climax) and climax[0] - 1e-3 <= rel < climax[1] - 1e-3
        if n % per and not (in_climax and half):
            continue                     # медленный режим: склейка раз в per долей (в кульминации — каждую долю)
        cuts.append(dict(t=rel, kind="beat", strong=bool(strong), down=bar_pos == 0, beat=n))
        nxt = (win[n + 1][1] if n + 1 < len(win) else end) - start
        if half and per == 1 and in_climax:
            cuts.append(dict(t=(rel + nxt) / 2, kind="half", strong=False, down=False, beat=n))
    for c in cuts:
        c["frame"] = int(round(c["t"] * FPS))
        c["t"] = round(c["frame"] / FPS, 4)
    total_frames = int(round((end - start) * FPS))
    shots = []
    for j, c in enumerate(cuts):
        f1 = cuts[j + 1]["frame"] if j + 1 < len(cuts) else total_frames
        shots.append(dict(i=j, from_=c["frame"], frames=f1 - c["frame"], kind=c["kind"], strong=c["strong"], down=c["down"]))
    for s in shots:
        s["from"] = s.pop("from_")
    return dict(start=round(float(start), 4), end=round(float(end), 4), frames=total_frames,
                climax=[round(x, 3) for x in climax] if climax else None, cuts=cuts, shots=shots)


def plot(a, res, out_png):
    from PIL import Image, ImageDraw
    Wp, Hp = 1600, 300
    im = Image.new("RGB", (Wp, Hp), (16, 16, 20))
    d = ImageDraw.Draw(im)
    dur = a["duration"]
    X = lambda t: int(t / dur * (Wp - 1))
    d.rectangle([X(res["start"]), 0, X(res["end"]), Hp], fill=(36, 30, 52))
    pts = [(X(t), Hp - 20 - int(v * (Hp - 60))) for t, v in zip(a["times"][::8], a["rms"][::8])]
    d.line(pts, fill=(90, 200, 255), width=2)
    pts = [(X(t), Hp - 20 - int(v * 120)) for t, v in zip(a["times"][::2], a["onset"][::2])]
    d.line(pts, fill=(120, 120, 120), width=1)
    for c in res["cuts"]:
        t = res["start"] + c["t"]
        col = (255, 60, 200) if c["strong"] else ((255, 210, 60) if c["kind"] == "half" else (230, 230, 230))
        d.line([X(t), 0, X(t), 40 if c["kind"] == "beat" else 25], fill=col, width=2)
    from PIL import ImageFont
    try:
        font = ImageFont.truetype("DejaVuSans.ttf", 14)
    except OSError:
        font = ImageFont.load_default()
    d.text((8, Hp - 18), f"{a['tempo']:.1f} BPM  окно {res['start']:.2f}–{res['end']:.2f} c  шотов {len(res['shots'])}",
           fill=(255, 255, 255), font=font)
    im.save(out_png)
    print("→", out_png, file=sys.stderr)


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("track")
    ap.add_argument("--out")
    ap.add_argument("--len", type=float, default=16.0, help="длина эдита, с (13–20)")
    ap.add_argument("--start", type=float, help="начало окна в треке, с (снапится к ближайшей доле)")
    ap.add_argument("--bpm", type=float)
    ap.add_argument("--climax", help="a-b в секундах от начала окна: там полудоли")
    ap.add_argument("--no-half", action="store_true", help="без ускорения в кульминации")
    ap.add_argument("--per", type=int, default=1, help="долей на шот: 1 — быстрый эдит, 2 — спокойнее (в кульминации по доле)")
    ap.add_argument("--plot", action="store_true")
    args = ap.parse_args()
    a = analyze(args.track, args.bpm)
    if args.start is not None:
        idx = int(np.argmin(np.abs(a["beats"] - args.start)))
    else:
        idx = pick_window(a, args.len)
    climax = tuple(map(float, args.climax.split("-"))) if args.climax else None
    res = build(a, idx, args.len, climax, half=not args.no_half, per=args.per)
    out = Path(args.out) if args.out else ROOT / "beats" / (Path(args.track).stem + ".json")
    data = dict(track=Path(args.track).name, bpm=round(a["tempo"], 2), period=round(a["period"], 4),
                track_duration=round(a["duration"], 3), fps=FPS, **res,
                all_beats=[round(float(b), 4) for b in a["beats"]], downbeat_phase=a["phase"])
    save_json(out, data)
    print(f"{a['tempo']:.1f} BPM, окно {res['start']:.2f}–{res['end']:.2f} с ({res['frames'] / FPS:.2f} с), "
          f"шотов {len(res['shots'])}, кульминация {res['climax']}")
    if args.plot:
        plot(a, res, out.with_suffix(".png"))


if __name__ == "__main__":
    main()
