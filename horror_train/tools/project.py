"""Общие функции: пути проекта, чтение shotlist.csv, audio_cues.csv и SRT."""

import csv
import re
from dataclasses import dataclass
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
SHOTLIST = ROOT / "01_shotlist" / "shotlist.csv"
CUES = ROOT / "01_shotlist" / "audio_cues.csv"
SRT = ROOT / "05_subtitles" / "subtitles_ru.srt"

WIDTH, HEIGHT, FPS = 1080, 1920, 30
TOTAL_S = 82.0

FONT_CANDIDATES = [
    "/usr/share/fonts/truetype/dejavu/DejaVuSansMono-Bold.ttf",
    "/usr/share/fonts/truetype/dejavu/DejaVuSansMono.ttf",
    "C:/Windows/Fonts/consolab.ttf",
    "C:/Windows/Fonts/consola.ttf",
    "C:/Windows/Fonts/courbd.ttf",
    "/System/Library/Fonts/Menlo.ttc",
    "/Library/Fonts/Courier New Bold.ttf",
]


def find_font(override=None):
    for path in ([override] if override else []) + FONT_CANDIDATES:
        if path and Path(path).exists():
            return path
    raise SystemExit(
        "Не найден моноширинный шрифт с кириллицей. Укажи путь: --font путь/к/шрифту.ttf"
    )


def parse_time(value):
    """'1:05.8' или '0:00.0' -> секунды."""
    minutes, seconds = value.strip().split(":")
    return int(minutes) * 60 + float(seconds)


def format_time(seconds):
    minutes, rest = divmod(seconds, 60)
    return f"{int(minutes)}:{rest:04.1f}"


@dataclass
class Shot:
    id: str
    scene: str
    start: float
    end: float
    duration: float
    type: str
    camera: str
    visual: str
    audio: str
    dialogue: str
    onscreen_text: str
    files_needed: str
    hidden_detail: str


@dataclass
class Cue:
    time: float
    layer: str
    cue: str
    duration: float | None
    gain_db: float
    note: str


@dataclass
class Subtitle:
    index: int
    start: float
    end: float
    text: str


def load_shots(path=SHOTLIST):
    with open(path, encoding="utf-8", newline="") as f:
        return [
            Shot(
                id=row["shot_id"],
                scene=row["scene"],
                start=parse_time(row["start"]),
                end=parse_time(row["end"]),
                duration=float(row["duration_s"]),
                type=row["type"],
                camera=row["camera"],
                visual=row["visual"],
                audio=row["audio"],
                dialogue=row["dialogue"],
                onscreen_text=row["onscreen_text"],
                files_needed=row["files_needed"],
                hidden_detail=row["hidden_detail"],
            )
            for row in csv.DictReader(f)
        ]


def load_cues(path=CUES):
    with open(path, encoding="utf-8", newline="") as f:
        return [
            Cue(
                time=parse_time(row["time"]),
                layer=row["layer"],
                cue=row["cue"],
                duration=float(row["duration_s"]) if row["duration_s"] else None,
                gain_db=float(row["gain_db"]),
                note=row["note"],
            )
            for row in csv.DictReader(f)
        ]


_SRT_TIME = re.compile(r"(\d+):(\d+):(\d+),(\d+)")


def _srt_seconds(value):
    h, m, s, ms = map(int, _SRT_TIME.fullmatch(value.strip()).groups())
    return h * 3600 + m * 60 + s + ms / 1000


def load_srt(path=SRT):
    blocks = Path(path).read_text(encoding="utf-8-sig").strip().split("\n\n")
    subs = []
    for block in blocks:
        lines = block.strip().splitlines()
        start, end = lines[1].split("-->")
        subs.append(Subtitle(int(lines[0]), _srt_seconds(start), _srt_seconds(end), "\n".join(lines[2:])))
    return subs
