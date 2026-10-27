#!/usr/bin/env python3
"""Озвучивает story.json синтезатором RHVoice → animated/voice/<id>.wav.

    python3 animated/make_voice.py                 # все сегменты, голос aleksandr-hq
    python3 animated/make_voice.py --only 05 06    # только указанные
    python3 animated/make_voice.py --voice artemiy --rate 95

После этого `python3 animated/render.py` подстроит тайминг под длину записей.
Свои записи (CapCut, микрофон) кладутся туда же с теми же именами — скрипт не нужен.

Нужно: RHVoice (RHVoice-test в PATH или --rhvoice путь), ffmpeg.
"""

import argparse
import json
import os
import shutil
import subprocess
import tempfile
from pathlib import Path

HERE = Path(__file__).resolve().parent
VOICE = HERE / "voice"
DEFAULT_BIN = "/root/.local/rhvoice/bin/RHVoice-test"

# Голос диктора: тёплее, с лёгкой комнатой, ровная громкость
POST = ("highpass=f=70,lowpass=f=9000,equalizer=f=160:t=q:w=1:g=3,"
        "acompressor=threshold=-20dB:ratio=3:attack=5:release=120,"
        "aecho=0.8:0.6:45:0.12,loudnorm=I=-16:TP=-2:LRA=7")


def speakable(text):
    """Кавычки и многоточия синтезатор читает плохо — заменяем паузами."""
    return text.replace("«", "").replace("»", "").replace("…", ",")


def main():
    ap = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument("--only", nargs="*", help="ID сегментов")
    ap.add_argument("--voice", default="aleksandr-hq")
    ap.add_argument("--rate", type=int, default=88, help="темп, 100 — обычный")
    ap.add_argument("--pitch", type=int, default=92, help="высота, 100 — обычная")
    ap.add_argument("--rhvoice", default=shutil.which("RHVoice-test") or DEFAULT_BIN)
    args = ap.parse_args()

    env = dict(os.environ)
    lib = Path(args.rhvoice).resolve().parent.parent / "lib"
    if lib.exists():
        env["LD_LIBRARY_PATH"] = f"{lib}:{env.get('LD_LIBRARY_PATH', '')}"

    story = json.loads((HERE / "story.json").read_text(encoding="utf-8"))
    VOICE.mkdir(exist_ok=True)
    with tempfile.TemporaryDirectory() as tmp:
        for seg in story["segments"]:
            if args.only and seg["id"] not in args.only:
                continue
            raw = Path(tmp) / f"{seg['id']}.wav"
            subprocess.run([args.rhvoice, "-p", args.voice, "-r", str(args.rate), "-t", str(args.pitch), "-o", str(raw)],
                           input=speakable(seg["text"]).encode("utf-8"), env=env, check=True)
            out = VOICE / f"{seg['id']}.wav"
            subprocess.run(["ffmpeg", "-y", "-loglevel", "error", "-i", str(raw), "-af", POST,
                            "-ar", "48000", "-ac", "1", str(out)], check=True)
            print(f"{seg['id']}: {out.relative_to(HERE)}")


if __name__ == "__main__":
    main()
