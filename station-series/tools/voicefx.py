#!/usr/bin/env python3
"""Обработка голосов (ffmpeg).

  .venv/bin/python tools/voicefx.py radio  in.mp3 out.mp3   # Хорунжий: наушник/рация, щелчки в начале и конце
  .venv/bin/python tools/voicefx.py earth  in.mp3 out.mp3   # Председатель: запись с Земли, помехи и провалы сигнала
  .venv/bin/python tools/voicefx.py system in.mp3 out.mp3   # Система станции: механический, чуть «металла»
  .venv/bin/python tools/voicefx.py clean  in.mp3 out.mp3   # без эффекта, только нормализация формата

Выход: 44.1 кГц, стерео, mp3 192k. Длительность почти не меняется (radio добавляет 0.08 с щелчков с каждой стороны).
"""
import json
import random
import subprocess
import sys


def dur(path):
    out = subprocess.run(
        ["ffprobe", "-v", "error", "-show_entries", "format=duration", "-of", "json", path],
        capture_output=True, text=True, check=True,
    ).stdout
    return float(json.loads(out)["format"]["duration"])


def run(args):
    subprocess.run(["ffmpeg", "-nostdin", "-hide_banner", "-loglevel", "error", "-y", *args], check=True)


def main():
    if len(sys.argv) != 4:
        sys.exit(__doc__)
    preset, src, dst = sys.argv[1:]
    d = dur(src)
    tail = ["-ac", "2", "-ar", "44100", "-b:a", "192k", dst]
    if preset == "clean":
        run(["-i", src, "-af", "aresample=44100", *tail])
    elif preset == "radio":
        fc = (
            "[0:a]aresample=44100,highpass=f=350,lowpass=f=3200,"
            "acompressor=threshold=-20dB:ratio=5:attack=4:release=80,volume=1.6[v];"
            f"anoisesrc=d={d:.3f}:c=pink:a=0.018:r=44100,highpass=f=600,lowpass=f=3000[n];"
            "[v][n]amix=inputs=2:duration=first:normalize=0[m];"
            "anoisesrc=d=0.08:c=white:a=0.22:r=44100,highpass=f=1200,afade=t=out:st=0.03:d=0.05[s1];"
            "anoisesrc=d=0.08:c=white:a=0.22:r=44100,highpass=f=1200,afade=t=out:st=0.03:d=0.05[s2];"
            "[s1][m][s2]concat=n=3:v=0:a=1"
        )
        run(["-i", src, "-filter_complex", fc, *tail])
    elif preset == "earth":
        # 2–3 коротких провала сигнала в случайных местах (детерминированно от длины)
        rnd = random.Random(int(d * 1000))
        gaps = sorted(rnd.uniform(0.6, max(0.7, d - 0.4)) for _ in range(3 if d > 3 else 2))
        enable = "+".join(f"between(t,{g:.2f},{g + rnd.uniform(0.05, 0.11):.2f})" for g in gaps)
        fc = (
            "[0:a]aresample=44100,highpass=f=280,lowpass=f=3600,"
            "acrusher=bits=10:mix=0.3:samples=2:mode=log,tremolo=f=7:d=0.12,"
            "acompressor=threshold=-20dB:ratio=4:attack=5:release=90,"
            f"volume=enable='{enable}':volume=0.08,volume=1.5[v];"
            f"anoisesrc=d={d:.3f}:c=brown:a=0.03:r=44100,highpass=f=200,lowpass=f=4000[n];"
            f"anoisesrc=d={d:.3f}:c=white:a=0.008:r=44100,highpass=f=2500[h];"
            "[v][n][h]amix=inputs=3:duration=first:normalize=0"
        )
        run(["-i", src, "-filter_complex", fc, *tail])
    elif preset == "system":
        fc = (
            "[0:a]aresample=44100,highpass=f=200,lowpass=f=6000,"
            "aecho=0.8:0.6:18:0.25,acompressor=threshold=-18dB:ratio=4,volume=1.2"
        )
        run(["-i", src, "-filter_complex", fc, *tail])
    else:
        sys.exit(f"Неизвестный пресет: {preset}")
    print(f"[voicefx] {preset}: {src} → {dst} ({dur(dst):.2f} с)")


if __name__ == "__main__":
    main()
