"""Подготовить присланные пользователем ролики (для эдита mix_v1/mix_v2) → sources/*.mp4.

  python tools/import_mix.py [папка с роликами]   — без папки ищет сам в Загрузках, на Рабочем столе, в F:\\video

Ищет файлы по концу имени (как их отдали TikTok/CapCut), поворачивает TikTok-ролик трейлера в 16:9,
обрезает чёрные полосы у экспортов CapCut. Трейлеры целиком остаются только в sources/ (не в git).
"""
import sys
from pathlib import Path

from common import FFMPEG, SOURCES, ROOT, run

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


REPO = ROOT.parent.resolve()


def candidates():
    """Где обычно лежат скачанные ролики: Загрузки, Рабочий стол, Видео, F:\\video (с подпапками, до 3 уровней)."""
    home = Path.home()
    roots = [home / "Downloads", home / "Desktop", home / "Videos", home / "OneDrive" / "Desktop",
             Path("F:/video"), Path("F:/"), Path("D:/video")]
    seen = set()
    for r in roots:
        if not r.exists():
            continue
        for depth in range(4):
            for p in r.glob("/".join(["*"] * (depth + 1))):
                p = p.resolve()
                if p.suffix.lower() in (".mp4", ".mov") and p not in seen and REPO not in p.parents:
                    seen.add(p)
                    yield p


def main():
    SOURCES.mkdir(exist_ok=True)
    if len(sys.argv) > 1:
        files = list(Path(sys.argv[1]).iterdir())
    else:
        files = []
        need = [m[0] for m in MAP]
        for p in candidates():
            if any(p.name.endswith(n) for n in need):
                files.append(p)
            if all(any(f.name.endswith(n) for f in files) for n in need):
                break
        print("Нашёл ролики:", *sorted({str(f.parent) for f in files}) or ["— ничего"])
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
