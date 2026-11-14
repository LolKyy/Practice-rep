"""Подготовить присланные пользователем ролики (для эдита mix_v1/mix_v2) → sources/*.mp4.

  python tools/import_mix.py <папка с роликами>

Ищет файлы по концу имени (как их отдали TikTok/CapCut), поворачивает TikTok-ролик трейлера в 16:9,
обрезает чёрные полосы у экспортов CapCut. Трейлеры целиком остаются только в sources/ (не в git).
"""
import sys
from pathlib import Path

from common import FFMPEG, SOURCES, run

ENC = ["-c:v", "libx264", "-preset", "slow", "-crf", "12", "-pix_fmt", "yuv420p"]
MAP = [  # (конец имени файла, id, фильтр, со звуком)
    ("v12044gd0000db8fg2fog65m49c7fttg.mp4", "tt_launch", "crop=414:848:24:0,transpose=2", True),
    ("v12044gd0000da9341fog65tn1fv4d0g.mp4", "tt_para", None, False),
    ("v24044gl0000dbqcttfog65q1cbgoui0.mp4", "tt_ocean", None, False),
    ("202611140159_3.mp4", "cc_launch", "crop=720:404:0:438", False),
    ("202611140159.mp4", "cc_logo", "crop=720:404:0:438", False),
    ("202611140159_2.mp4", "cc_club", "crop=720:404:0:438", False),
    ("202611140159_1.mp4", "cc_flip", "crop=720:404:0:438", False),
]


def main():
    folder = Path(sys.argv[1])
    SOURCES.mkdir(exist_ok=True)
    files = list(folder.iterdir())
    for suffix, sid, vf, audio in MAP:
        f = next((p for p in files if p.name.endswith(suffix) and not (suffix == "202611140159.mp4" and "_" in p.name.split("202611140159")[-1])), None)
        if not f:
            print(f"! не найден *{suffix} → {sid}"); continue
        cmd = [FFMPEG, "-v", "error", "-y", "-i", str(f)]
        if vf:
            cmd += ["-vf", vf] + ENC
        else:
            cmd += ["-c:v", "copy"]
        cmd += (["-c:a", "aac", "-b:a", "256k"] if audio else ["-an"]) + [str(SOURCES / f"{sid}.mp4")]
        run(cmd)
        print(f"{f.name} → sources/{sid}.mp4")
    # трек для превью — музыка из официального трейлера
    music = SOURCES.parent / "video/public/music"
    music.mkdir(parents=True, exist_ok=True)
    if (SOURCES / "tt_launch.mp4").exists():
        run([FFMPEG, "-v", "error", "-y", "-i", str(SOURCES / "tt_launch.mp4"), "-vn", "-b:a", "256k", str(music / "launch_tt.mp3")])
        print("→ video/public/music/launch_tt.mp3")


if __name__ == "__main__":
    main()
