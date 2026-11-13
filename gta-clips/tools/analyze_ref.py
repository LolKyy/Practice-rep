"""Разбор референса-шортса (как в RECIPE.md): шоты, склейки vs удары, вспышки, цвет, раскадровка.

  python tools/fetch.py ref <url> refA          → refs/refA.mp4  (или положить файл в refs/ вручную)
  python tools/analyze_ref.py refs/refA.mp4     → refs/refA_report.md + refs/refA_frames.jpg (6 к/с)

Референс — только для разбора, в эдит не идёт.
"""
import argparse
import sys
from pathlib import Path

import numpy as np

import beats as B
import scenes as S
from common import FFMPEG, probe, run


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("file")
    ap.add_argument("--fps", type=int, default=0, help="частота анализа; 0 = как у ролика (ловит вспышки в 1 кадр)")
    ap.add_argument("--sheet-fps", type=float, default=6)
    a = ap.parse_args()
    f = Path(a.file)
    info = probe(f)
    a.fps = a.fps or int(round(info.get("fps", 30)))
    _, feats, cols, colm, cuts = S.analyze(f, a.fps)
    cut_t = [c / a.fps for c in cuts[1:-1]]
    lens = np.diff([0] + cut_t + [info["duration"]])
    y = np.array([x["y"] for x in feats])
    sat = np.array([x["s"] for x in feats])
    flashes = [i / a.fps for i in range(len(y)) if y[i] > 0.78 and sat[i] < 0.3 and (i == 0 or y[i] - y[i - 1] > 0.15)]
    lines = [f"# Разбор {f.name}", "",
             f"- {info['duration']:.2f} с, {info.get('width')}×{info.get('height')}, {info.get('fps', 0):.0f} fps",
             f"- шотов: {len(lens)}, длина: медиана {np.median(lens):.2f} с, мин {lens.min():.2f}, макс {lens.max():.2f}",
             f"- склейки: " + ", ".join(f"{t:.2f}" for t in cut_t)]
    if info["has_audio"]:
        wav = f.with_suffix(".wav")
        run([FFMPEG, "-v", "error", "-y", "-i", str(f), "-vn", "-ac", "1", "-ar", "22050", str(wav)])
        an = B.analyze(wav)
        bt = an["beats"]
        half = np.sort(np.concatenate([bt, bt[:-1] + np.diff(bt) / 2]))
        on_beat = sum(np.min(np.abs(bt - t)) <= 2.5 / a.fps for t in cut_t)
        on_half = sum(np.min(np.abs(half - t)) <= 2.5 / a.fps for t in cut_t) - on_beat
        lines += [f"- трек: ~{an['tempo']:.1f} BPM (доля {an['period']:.3f} с)",
                  f"- склеек на долю: {on_beat}/{len(cut_t)}, на полудолю: {on_half}, мимо: {len(cut_t) - on_beat - on_half}",
                  f"- шотов на удар (в среднем): {np.median(lens) / an['period']:.2f}"]
        wav.unlink()
    lines.append(f"- белые вспышки (кадры): " + (", ".join(f"{t:.2f}" for t in flashes) or "нет"))
    shots = S.build_shots(info, feats, cols, colm, cuts, a.fps)
    lines += ["", "| # | старт | длина | блок | ярк | нас | движ |", "|---|---|---|---|---|---|---|"]
    lines += [f"| {s['id']} | {s['t_in']:.2f} | {s['dur']:.2f} | {s['block']} | {s['brightness']:.2f} | {s['saturation']:.2f} | {s['motion']:.3f} |"
              for s in shots]
    lines += ["", "Текст, переходы и эффекты — смотреть по раскадровке *_frames.jpg (заполняю вручную ниже).", ""]
    rep = f.with_name(f.stem + "_report.md")
    rep.write_text("\n".join(lines), encoding="utf-8")
    sheet = f.with_name(f.stem + "_frames.jpg")
    run([FFMPEG, "-v", "error", "-y", "-i", str(f), "-vf",
         f"fps={a.sheet_fps},scale=180:-2,drawtext=font=Sans:text='%{{pts\\:hms}}':x=4:y=4:fontsize=14:fontcolor=yellow:box=1:boxcolor=black@0.6,tile=12x{int(np.ceil(info['duration'] * a.sheet_fps / 12))}",
         "-frames:v", "1", str(sheet)])
    print("\n".join(lines[:9]))
    print("→", rep, "\n→", sheet)


if __name__ == "__main__":
    main()
