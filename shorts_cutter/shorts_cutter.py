#!/usr/bin/env python3
"""
shorts_cutter — нарезка длинного видео на вертикальные шортсы (YouTube Shorts / Reels / TikTok).

Что делает:
  1. Берёт локальный файл или ссылку (скачивает через yt-dlp).
  2. Расшифровывает речь через faster-whisper с таймкодами каждого слова.
  3. Сам находит удачные моменты 15–60 с (хук в начале, эмоции, громкость,
     плотность речи, законченные фразы) — или режет по вашим таймкодам.
  4. Вырезает паузы и «эээ», чтобы темп был быстрым.
  5. Делает 9:16 1080×1920: кадрирует по лицу или кладёт видео на размытый фон.
  6. Вжигает крупные субтитры по 2–4 слова с выделением ключевых слов цветом.
  7. Добавляет «панч-зумы» на смене фраз, нормализует громкость, подмешивает музыку.

Пример:
  python shorts_cutter.py "https://youtu.be/XXXX" -n 5 --language ru
  python shorts_cutter.py podcast.mp4 --clips "12:30-13:15, 1:02:10-1:02:50"
  python shorts_cutter.py stream.mp4 --dry-run          # только показать найденные моменты
"""
from __future__ import annotations

import argparse
import json
import math
import os
import re
import shutil
import subprocess
import sys
import wave
from dataclasses import dataclass, field
from pathlib import Path

FPS = 30
OUT_W, OUT_H = 1080, 1920
SAMPLE_RATE = 48000
SAMPLES_PER_FRAME = SAMPLE_RATE // FPS  # 1600: аудиокадры совпадают с видеокадрами

# Слова-«крючки»: повышают оценку момента, если стоят в первой фразе.
HOOK_WORDS = {
    # ru
    "никогда", "всегда", "секрет", "почему", "зачем", "как", "ошибка", "ошибки", "самый",
    "самая", "самое", "лучший", "худший", "правда", "ложь", "шок", "невероятно", "запомните",
    "внимание", "важно", "главное", "стоп", "представьте", "серьёзно", "серьезно", "деньги",
    "миллион", "бесплатно", "опасно", "нельзя", "надо", "никто", "все", "реально", "кошмар",
    "проблема", "лайфхак", "совет", "факт", "вообще", "бред", "ужас", "круто", "офигеть",
    # en
    "never", "always", "secret", "why", "how", "mistake", "worst", "best", "truth", "lie",
    "crazy", "insane", "stop", "imagine", "seriously", "money", "million", "free", "danger",
    "nobody", "everyone", "actually", "problem", "hack", "tip", "fact", "wow",
}
# Начало фразы, которое требует контекста — такой момент плохо смотрится без начала.
WEAK_STARTS = (
    "и ", "а ", "но ", "так вот", "потому что", "поэтому", "то есть", "ну и", "вот и",
    "and ", "but ", "so ", "because ", "which ", "that's why",
)
FILLERS = {"э", "ээ", "эээ", "эм", "эмм", "мм", "ммм", "хм", "uh", "um", "uhm", "erm", "hmm", "ah"}

WORD_RE = re.compile(r"[\wёЁ'-]+", re.UNICODE)


# ───────────────────────────── утилиты ─────────────────────────────

def log(msg: str) -> None:
    print(msg, file=sys.stderr, flush=True)


def run(cmd: list[str], cwd: Path | None = None, quiet: bool = True) -> subprocess.CompletedProcess:
    res = subprocess.run(cmd, cwd=cwd, capture_output=quiet, text=True)
    if res.returncode != 0:
        if quiet:
            log(res.stderr[-4000:])
        raise SystemExit(f"Команда упала: {' '.join(cmd[:3])} ... (код {res.returncode})")
    return res


def need(binary: str) -> None:
    if not shutil.which(binary):
        raise SystemExit(f"Не найден {binary}. Установите его и добавьте в PATH.")


def parse_time(s: str) -> float:
    """'83', '1:23', '01:02:03.5' -> секунды."""
    s = s.strip()
    parts = s.split(":")
    if not 1 <= len(parts) <= 3:
        raise ValueError(f"Неверное время: {s}")
    total = 0.0
    for p in parts:
        total = total * 60 + float(p)
    return total


def fmt_time(t: float) -> str:
    t = max(0.0, t)
    h, rem = divmod(t, 3600)
    m, s = divmod(rem, 60)
    return f"{int(h)}:{int(m):02d}:{s:04.1f}" if h else f"{int(m)}:{s:04.1f}"


def ass_time(t: float) -> str:
    t = max(0.0, t)
    cs = int(round(t * 100))
    h, cs = divmod(cs, 360000)
    m, cs = divmod(cs, 6000)
    s, cs = divmod(cs, 100)
    return f"{h}:{m:02d}:{s:02d}.{cs:02d}"


def srt_time(t: float) -> str:
    ms = int(round(max(0.0, t) * 1000))
    h, ms = divmod(ms, 3600000)
    m, ms = divmod(ms, 60000)
    s, ms = divmod(ms, 1000)
    return f"{h:02d}:{m:02d}:{s:02d},{ms:03d}"


def bare(word: str) -> str:
    return "".join(WORD_RE.findall(word.lower())).replace("ё", "е")


def hex_to_ass(color: str) -> str:
    c = color.lstrip("#")
    if len(c) != 6:
        raise SystemExit(f"Цвет должен быть в формате RRGGBB, получено: {color}")
    return f"&H00{c[4:6]}{c[2:4]}{c[0:2]}&".upper()


def snap(t: float) -> float:
    """Округление к сетке видеокадров — чтобы звук и картинка резались одинаково."""
    return round(t * FPS) / FPS


# ───────────────────────────── данные ─────────────────────────────

@dataclass
class Word:
    start: float
    end: float
    text: str


@dataclass
class Sentence:
    words: list[Word]

    @property
    def start(self) -> float:
        return self.words[0].start

    @property
    def end(self) -> float:
        return self.words[-1].end

    @property
    def text(self) -> str:
        return " ".join(w.text for w in self.words)


@dataclass
class Clip:
    start: float
    end: float
    score: float = 0.0
    text: str = ""
    sentences: list[Sentence] = field(default_factory=list)

    @property
    def duration(self) -> float:
        return self.end - self.start


# ───────────────────────────── источник ─────────────────────────────

def resolve_source(src: str, workdir: Path) -> Path:
    if re.match(r"^https?://", src):
        log(f"⬇  Скачиваю {src}")
        cmd = [
            sys.executable, "-m", "yt_dlp", src,
            "-f", "bv*[height<=1080]+ba/b[height<=1080]/b",
            "--merge-output-format", "mp4",
            "-o", str(workdir / "%(id)s.%(ext)s"),
            "--no-playlist", "--print", "after_move:filepath", "--no-simulate",
        ]
        res = run(cmd)
        path = Path(res.stdout.strip().splitlines()[-1])
        log(f"   → {path}")
        return path
    p = Path(src).expanduser()
    if not p.exists():
        raise SystemExit(f"Файл не найден: {p}")
    return p.resolve()


def probe(video: Path) -> dict:
    res = run([
        "ffprobe", "-v", "error", "-select_streams", "v:0",
        "-show_entries", "stream=width,height:stream_side_data=rotation:format=duration",
        "-of", "json", str(video),
    ])
    data = json.loads(res.stdout)
    st = data["streams"][0]
    w, h = int(st["width"]), int(st["height"])
    rot = 0
    for sd in st.get("side_data_list", []) or []:
        if "rotation" in sd:
            rot = int(sd["rotation"])
    if abs(rot) in (90, 270):
        w, h = h, w
    return {"width": w, "height": h, "duration": float(data["format"]["duration"])}


def extract_wav(video: Path, workdir: Path) -> Path:
    wav = workdir / f"{video.stem}.16k.wav"
    if not wav.exists():
        log("🔊 Извлекаю звук")
        run(["ffmpeg", "-y", "-v", "error", "-i", str(video), "-vn", "-ac", "1", "-ar", "16000",
             "-c:a", "pcm_s16le", str(wav)])
    return wav


# ───────────────────────────── расшифровка ─────────────────────────────

def transcribe(wav: Path, workdir: Path, model_name: str, language: str | None, device: str) -> list[Word]:
    cache = workdir / f"{wav.stem}.{model_name}.{language or 'auto'}.words.json"
    if cache.exists():
        log(f"📝 Беру расшифровку из кэша {cache.name}")
        return load_words(cache)
    try:
        from faster_whisper import WhisperModel
    except ImportError:
        raise SystemExit("Нужен faster-whisper:  pip install faster-whisper")

    if device == "auto":
        try:
            import ctranslate2
            device = "cuda" if ctranslate2.get_cuda_device_count() > 0 else "cpu"
        except Exception:
            device = "cpu"
    compute = "float16" if device == "cuda" else "int8"
    log(f"📝 Расшифровка: модель {model_name}, {device}/{compute} (это самый долгий шаг)")
    model = WhisperModel(model_name, device=device, compute_type=compute)
    segments, info = model.transcribe(
        str(wav), language=language, word_timestamps=True, vad_filter=True,
        vad_parameters={"min_silence_duration_ms": 300},
    )
    log(f"   язык: {info.language}, длительность {fmt_time(info.duration)}")
    words: list[Word] = []
    last_print = 0.0
    for seg in segments:
        for w in seg.words or []:
            text = w.word.strip()
            if text:
                words.append(Word(float(w.start), float(w.end), text))
        if seg.end - last_print > 60:
            last_print = seg.end
            log(f"   … {fmt_time(seg.end)} / {fmt_time(info.duration)}")
    cache.write_text(json.dumps([w.__dict__ for w in words], ensure_ascii=False))
    return words


def load_words(path: Path) -> list[Word]:
    """JSON: [{"start":..,"end":..,"text"|"word":..}, ...] или вывод whisper с segments[].words[]."""
    data = json.loads(Path(path).read_text(encoding="utf-8"))
    if isinstance(data, dict) and "segments" in data:
        data = [w for s in data["segments"] for w in s.get("words", [])]
    words = []
    for w in data:
        text = (w.get("text") or w.get("word") or "").strip()
        if text:
            words.append(Word(float(w["start"]), float(w["end"]), text))
    return words


def split_sentences(words: list[Word], max_gap: float = 1.2, max_words: int = 40) -> list[Sentence]:
    sents, cur = [], []
    for i, w in enumerate(words):
        cur.append(w)
        nxt = words[i + 1] if i + 1 < len(words) else None
        ends = w.text.rstrip("\"'»)").endswith((".", "!", "?", "…"))
        gap = (nxt.start - w.end) if nxt else 99
        if ends or gap > max_gap or len(cur) >= max_words:
            sents.append(Sentence(cur))
            cur = []
    if cur:
        sents.append(Sentence(cur))
    return sents


# ───────────────────────────── громкость ─────────────────────────────

class Loudness:
    """Громкость в дБ по окнам 0.5 с — эмоциональные моменты обычно громче."""

    def __init__(self, wav: Path, win: float = 0.5):
        import numpy as np
        self.np = np
        with wave.open(str(wav), "rb") as f:
            sr = f.getframerate()
            data = np.frombuffer(f.readframes(f.getnframes()), dtype=np.int16).astype(np.float32) / 32768
        n = int(sr * win)
        frames = len(data) // n
        rms = np.sqrt((data[: frames * n].reshape(frames, n) ** 2).mean(axis=1) + 1e-10)
        self.db = 20 * np.log10(rms)
        self.win = win
        voiced = self.db[self.db > -50]
        self.mean = float(voiced.mean()) if len(voiced) else -30.0
        self.std = float(voiced.std()) if len(voiced) > 1 else 6.0

    def z(self, start: float, end: float) -> float:
        a, b = int(start / self.win), max(int(end / self.win), int(start / self.win) + 1)
        seg = self.db[a:b]
        seg = seg[seg > -50]
        if not len(seg):
            return -2.0
        # среднее + вклад пиков (крики, смех)
        peak = float(self.np.percentile(seg, 90))
        return ((float(seg.mean()) - self.mean) + 0.5 * (peak - self.mean - self.std)) / max(self.std, 1.0)


# ───────────────────────────── выбор моментов ─────────────────────────────

def score_clip(sents: list[Sentence], loud: Loudness | None, target: float) -> float:
    words = [w for s in sents for w in s.words]
    start, end = sents[0].start, sents[-1].end
    dur = end - start
    first = sents[0].text
    first_l = first.lower()
    first_words = {bare(w.text) for w in sents[0].words}

    hook = 0.0
    if "?" in first:
        hook += 1.5
    if "!" in first:
        hook += 1.0
    hook += min(2, len(first_words & HOOK_WORDS)) * 0.8
    if any(ch.isdigit() for ch in first):
        hook += 0.5
    if len(sents[0].words) <= 12:
        hook += 0.5
    if first_l.startswith(WEAK_STARTS):
        hook -= 2.0

    all_text = " ".join(s.text for s in sents)
    emotion = min(2.0, (all_text.count("!") + all_text.count("?")) / max(dur, 1) * 15)
    keywords = min(1.5, sum(1 for w in words if bare(w.text) in HOOK_WORDS) * 0.15)
    wps = len(words) / max(dur, 1)
    density = max(-1.0, min(1.0, (wps - 2.3) / 1.0))
    spoken = sum(w.end - w.start for w in words)
    silence = max(0.0, 1 - spoken / max(dur, 1) - 0.3) * -3
    length = -abs(dur - target) / target
    energy = max(-2.0, min(2.5, loud.z(start, end))) if loud else 0.0
    ending = 0.5 if sents[-1].text.rstrip().endswith((".", "!", "?", "…")) else -0.5

    return 1.5 * hook + 1.0 * energy + 0.6 * emotion + 0.5 * density + keywords + silence + length + ending


def find_moments(sents: list[Sentence], loud: Loudness | None, n: int,
                 min_len: float, max_len: float) -> list[Clip]:
    target = min(max_len, max(min_len, (min_len + max_len) / 2))
    cands: list[Clip] = []
    for i in range(len(sents)):
        for j in range(i, len(sents)):
            dur = sents[j].end - sents[i].start
            if dur > max_len:
                break
            if dur >= min_len:
                chunk = sents[i: j + 1]
                cands.append(Clip(sents[i].start, sents[j].end, score_clip(chunk, loud, target),
                                  " ".join(s.text for s in chunk), chunk))
    cands.sort(key=lambda c: c.score, reverse=True)
    picked: list[Clip] = []
    for c in cands:
        if all(c.end + 2 <= p.start or c.start >= p.end + 2 for p in picked):
            picked.append(c)
            if len(picked) >= n:
                break
    return picked


def manual_clips(spec: str, sents: list[Sentence]) -> list[Clip]:
    clips = []
    for part in re.split(r"[,;]\s*", spec.strip()):
        if not part:
            continue
        a, b = part.split("-")
        start, end = parse_time(a), parse_time(b)
        if end <= start:
            raise SystemExit(f"Конец раньше начала: {part}")
        inside = [s for s in sents if s.end > start and s.start < end]
        clips.append(Clip(start, end, 0.0, " ".join(s.text for s in inside), inside))
    return clips


# ───────────────────────────── паузы и монтаж ─────────────────────────────

def keep_intervals(words: list[Word], start: float, end: float, max_pause: float,
                   pad: float = 0.08) -> list[tuple[float, float]]:
    """Интервалы речи внутри клипа (абсолютное время), паузы длиннее max_pause выкидываются."""
    spoken = [w for w in words if w.end > start and w.start < end and bare(w.text) not in FILLERS]
    if not spoken:
        return [(snap(start), snap(end))]
    iv: list[list[float]] = []
    for w in spoken:
        a, b = max(start, w.start - pad), min(end, w.end + pad)
        if iv and a - iv[-1][1] <= max_pause:
            iv[-1][1] = max(iv[-1][1], b)
        else:
            iv.append([a, b])
    out = []
    for a, b in iv:
        a, b = snap(a), snap(b)
        if b - a >= 1 / FPS:
            if out and a <= out[-1][1]:
                out[-1] = (out[-1][0], max(out[-1][1], b))
            else:
                out.append((a, b))
    return out


class TimeMap:
    """Перевод исходного времени во время смонтированного клипа (после вырезания пауз)."""

    def __init__(self, intervals: list[tuple[float, float]]):
        self.iv = intervals
        self.offsets, acc = [], 0.0
        for a, b in intervals:
            self.offsets.append(acc)
            acc += b - a
        self.total = acc

    def __call__(self, t: float) -> float:
        for (a, b), off in zip(self.iv, self.offsets):
            if t < a:
                return off
            if t <= b:
                return off + (t - a)
        return self.total


# ───────────────────────────── субтитры ─────────────────────────────

@dataclass
class Caption:
    start: float
    end: float
    words: list[str]
    highlight: int | None


def build_captions(words: list[Word], tmap: TimeMap, start: float, end: float,
                   max_words: int, max_chars: int) -> list[Caption]:
    ws = [w for w in words if w.start >= start - 0.05 and w.end <= end + 0.05 and bare(w.text) not in FILLERS]
    groups: list[list[Word]] = []
    cur: list[Word] = []
    for i, w in enumerate(ws):
        if cur:
            chars = sum(len(x.text) + 1 for x in cur) + len(w.text)
            gap = w.start - cur[-1].end
            if len(cur) >= max_words or chars > max_chars or gap > 0.6:
                groups.append(cur)
                cur = []
        cur.append(w)
        if w.text.endswith((".", "!", "?", "…", ",", ":", ";")) and len(cur) >= 2:
            groups.append(cur)
            cur = []
    if cur:
        groups.append(cur)

    caps = []
    for gi, g in enumerate(groups):
        s = tmap(g[0].start)
        e = tmap(g[-1].end) + 0.25
        if gi + 1 < len(groups):
            e = min(e, tmap(groups[gi + 1][0].start))
        e = min(e, tmap.total)
        if e - s < 0.15:
            e = s + 0.15
        texts = [w.text for w in g]
        caps.append(Caption(s, e, texts, pick_highlight(texts)))
    return caps


def pick_highlight(texts: list[str]) -> int | None:
    best, best_score = None, 0.0
    for i, t in enumerate(texts):
        b = bare(t)
        sc = 0.0
        if b in HOOK_WORDS:
            sc += 3
        if any(ch.isdigit() for ch in b):
            sc += 3
        if len(b) >= 5:
            sc += len(b) / 4
        if t.endswith("!"):
            sc += 1
        if sc > best_score:
            best, best_score = i, sc
    return best if best_score >= 1.5 else None


def ass_escape(s: str) -> str:
    return s.replace("\\", "\\\\").replace("{", "(").replace("}", ")")


def write_ass(caps: list[Caption], path: Path, a) -> None:
    hl = hex_to_ass(a.highlight_color)
    base = hex_to_ass(a.text_color)
    y = int(OUT_H * a.sub_y)
    header = f"""[Script Info]
ScriptType: v4.00+
PlayResX: {OUT_W}
PlayResY: {OUT_H}
WrapStyle: 0
ScaledBorderAndShadow: yes

[V4+ Styles]
Format: Name, Fontname, Fontsize, PrimaryColour, SecondaryColour, OutlineColour, BackColour, Bold, Italic, Underline, StrikeOut, ScaleX, ScaleY, Spacing, Angle, BorderStyle, Outline, Shadow, Alignment, MarginL, MarginR, MarginV, Encoding
Style: Main,{a.font},{a.font_size},{base},{base},&H00000000&,&H80000000&,-1,0,0,0,100,100,1,0,1,{a.outline},3,5,60,60,0,1

[Events]
Format: Layer, Start, End, Style, Name, MarginL, MarginR, MarginV, Effect, Text
"""
    lines = []
    for c in caps:
        parts = []
        for i, t in enumerate(c.words):
            t = ass_escape(t.upper() if a.upper else t)
            if i == c.highlight:
                t = f"{{\\c{hl}}}{t}{{\\c{base}}}"
            parts.append(t)
        pop = "{\\fscx80\\fscy80\\t(0,90,\\fscx105\\fscy105)\\t(90,150,\\fscx100\\fscy100)}"
        text = f"{{\\pos({OUT_W // 2},{y})}}{pop}" + " ".join(parts)
        lines.append(f"Dialogue: 0,{ass_time(c.start)},{ass_time(c.end)},Main,,0,0,0,,{text}")
    path.write_text(header + "\n".join(lines) + "\n", encoding="utf-8")


def write_srt(caps: list[Caption], path: Path) -> None:
    out = []
    for i, c in enumerate(caps, 1):
        out.append(f"{i}\n{srt_time(c.start)} --> {srt_time(c.end)}\n{' '.join(c.words)}\n")
    path.write_text("\n".join(out), encoding="utf-8")


# ───────────────────────────── кадрирование ─────────────────────────────

def detect_face_x(video: Path, start: float, end: float, samples: int = 16) -> tuple[float | None, float]:
    """Медианная X-координата лица (0..1) и доля кадров, где лицо найдено."""
    try:
        import cv2
        cv2.CascadeClassifier  # в OpenCV 5 Haar-каскады убраны из основного пакета
    except (ImportError, AttributeError):
        log("   (OpenCV 4.x не найден — лицо не ищу, кадр по центру)")
        return None, 0.0
    cap = cv2.VideoCapture(str(video))
    if not cap.isOpened():
        return None, 0.0
    cascade = cv2.CascadeClassifier(cv2.data.haarcascades + "haarcascade_frontalface_default.xml")
    xs = []
    for k in range(samples):
        t = start + (end - start) * (k + 0.5) / samples
        cap.set(cv2.CAP_PROP_POS_MSEC, t * 1000)
        ok, frame = cap.read()
        if not ok:
            continue
        h, w = frame.shape[:2]
        scale = 640 / w if w > 640 else 1.0
        small = cv2.resize(frame, (int(w * scale), int(h * scale))) if scale != 1.0 else frame
        gray = cv2.cvtColor(small, cv2.COLOR_BGR2GRAY)
        faces = cascade.detectMultiScale(gray, 1.1, 6, minSize=(int(small.shape[0] * 0.08),) * 2)
        if len(faces):
            x, y, fw, fh = max(faces, key=lambda f: f[2] * f[3])
            xs.append((x + fw / 2) / small.shape[1])
    cap.release()
    if not xs:
        return None, 0.0
    xs.sort()
    return xs[len(xs) // 2], len(xs) / samples


def layout_filter(layout: str, info: dict, face_x: float | None, blur: int) -> str:
    w, h = info["width"], info["height"]
    if w / h <= OUT_W / OUT_H + 0.01:  # уже вертикальное
        return f"scale={OUT_W}:{OUT_H}:force_original_aspect_ratio=increase,crop={OUT_W}:{OUT_H},setsar=1"
    if layout == "crop":
        cw = int(h * OUT_W / OUT_H) // 2 * 2
        cx = (face_x if face_x is not None else 0.5) * w
        x = int(max(0, min(w - cw, cx - cw / 2))) // 2 * 2
        return f"crop={cw}:{h}:{x}:0,scale={OUT_W}:{OUT_H},setsar=1"
    # blur: видео по центру/сверху, сзади размытая растянутая копия
    return (
        f"split=2[bg][fg];"
        f"[bg]scale={OUT_W // 4}:{OUT_H // 4}:force_original_aspect_ratio=increase,crop={OUT_W // 4}:{OUT_H // 4},"
        f"boxblur={max(1, blur // 4)}:3,scale={OUT_W}:{OUT_H},eq=brightness=-0.08:saturation=1.2[bgb];"
        f"[fg]scale={OUT_W}:-2[fgs];[bgb][fgs]overlay=(W-w)/2:(H-h)/2,setsar=1"
    )


def zoom_filter(boundaries: list[float], total: float, amount: float) -> str:
    """«Панч-зумы»: на каждой новой фразе картинка чуть приближается/отдаляется."""
    if amount <= 0 or not boundaries:
        return ""
    zoomed = []
    pts = sorted(set([0.0] + [b for b in boundaries if 0 < b < total] + [total]))
    for k in range(len(pts) - 1):
        if k % 2 == 1:
            zoomed.append(f"between(on/{FPS},{pts[k]:.3f},{pts[k + 1]:.3f})")
    if not zoomed:
        return ""
    z = f"if({'+'.join(zoomed)},{1 + amount:.3f},1)"
    return (f",zoompan=z='{z}':x='iw/2-(iw/zoom/2)':y='ih/2-(ih/zoom/2)'"
            f":d=1:s={OUT_W}x{OUT_H}:fps={FPS}")


# ───────────────────────────── рендер ─────────────────────────────

def render_clip(idx: int, clip: Clip, video: Path, info: dict, words: list[Word],
                outdir: Path, workdir: Path, a) -> dict:
    name = f"short_{idx:02d}"
    if a.cut_pauses and words:
        intervals = keep_intervals(words, clip.start, clip.end, a.max_pause)
    else:
        intervals = [(snap(clip.start), snap(clip.end))]
    src_start = intervals[0][0]
    src_end = intervals[-1][1]
    rel = [(x - src_start, y - src_start) for x, y in intervals]
    tmap = TimeMap(intervals)

    # раскладка
    layout = a.layout
    face_x, face_ratio = (None, 0.0)
    if layout in ("auto", "crop") and info["width"] / info["height"] > OUT_W / OUT_H + 0.01:
        face_x, face_ratio = detect_face_x(video, src_start, src_end)
        if layout == "auto":
            layout = "crop" if face_ratio >= 0.5 else "blur"
    elif layout == "auto":
        layout = "blur"

    # субтитры
    vf_subs = ""
    caps: list[Caption] = []
    if a.subs and words:
        caps = build_captions(words, tmap, clip.start, clip.end, a.words, a.max_chars)
        write_ass(caps, workdir / f"{name}.ass", a)
        write_srt(caps, outdir / f"{name}.srt")
        fontsdir = f":fontsdir='{Path(a.fonts_dir).resolve().as_posix()}'" if a.fonts_dir else ""
        vf_subs = f",ass={name}.ass{fontsdir}"

    sent_starts = [tmap(s.start) for s in clip.sentences[1:]] if clip.sentences else []
    zoom = zoom_filter(sent_starts, tmap.total, a.zoom)

    sel = "+".join(f"between(t,{x:.4f},{y - 0.5 / FPS:.4f})" for x, y in rel)
    asel = "+".join(f"between(t,{x - 0.0005:.4f},{y - 0.0005:.4f})" for x, y in rel)

    fc = (
        f"[0:v]fps={FPS},select='{sel}',setpts=N/{FPS}/TB,"
        f"{layout_filter(layout, info, face_x, a.blur)}{zoom}{vf_subs},format=yuv420p[vout];"
        f"[0:a]aresample={SAMPLE_RATE},asetnsamples=n={SAMPLES_PER_FRAME}:p=0,"
        f"aselect='{asel}',asetpts=N/SR/TB,"
        f"loudnorm=I=-14:TP=-1.5:LRA=11,aresample={SAMPLE_RATE},"
        f"afade=t=in:d=0.05,afade=t=out:st={max(0, tmap.total - 0.12):.3f}:d=0.12"
    )
    inputs = ["-ss", f"{src_start:.3f}", "-to", f"{src_end:.3f}", "-i", str(video)]
    if a.music:
        inputs += ["-stream_loop", "-1", "-i", str(Path(a.music).resolve())]
        fc += (f"[voice];[1:a]aresample={SAMPLE_RATE},volume={a.music_volume}[m];"
               f"[voice][m]amix=inputs=2:duration=first:normalize=0[aout]")
    else:
        fc += "[aout]"

    out = outdir / f"{name}.mp4"
    (workdir / f"{name}.filter.txt").write_text(fc, encoding="utf-8")
    cmd = [
        "ffmpeg", "-y", "-v", "error", "-stats", *inputs,
        "-filter_complex", fc, "-map", "[vout]", "-map", "[aout]",
        "-t", f"{tmap.total:.3f}",
        "-c:v", "libx264", "-preset", a.preset, "-crf", str(a.crf), "-r", str(FPS),
        "-c:a", "aac", "-b:a", "192k", "-ar", str(SAMPLE_RATE), "-movflags", "+faststart",
        str(out.resolve()),
    ]
    log(f"🎬 {name}: {fmt_time(clip.start)}–{fmt_time(clip.end)} "
        f"({clip.duration:.0f} с → {tmap.total:.0f} с без пауз), раскладка: {layout}")
    run(cmd, cwd=workdir, quiet=not a.verbose)

    first = clip.sentences[0].text if clip.sentences else clip.text
    return {
        "file": out.name,
        "source_start": round(clip.start, 2),
        "source_end": round(clip.end, 2),
        "source_range": f"{fmt_time(clip.start)}-{fmt_time(clip.end)}",
        "duration": round(tmap.total, 2),
        "score": round(clip.score, 2),
        "layout": layout,
        "cuts": len(intervals) - 1,
        "title_idea": suggest_title(first),
        "text": clip.text,
    }


def suggest_title(first: str) -> str:
    t = first.strip().strip("-—– ")
    if len(t) > 70:
        t = t[:67].rsplit(" ", 1)[0] + "…"
    return t[:1].upper() + t[1:]


# ───────────────────────────── main ─────────────────────────────

def main() -> None:
    p = argparse.ArgumentParser(
        description="Нарезка длинного видео на вертикальные шортсы с субтитрами (ffmpeg + whisper).",
        formatter_class=argparse.ArgumentDefaultsHelpFormatter,
    )
    p.add_argument("source", help="путь к видео или ссылка (YouTube и др. через yt-dlp)")
    p.add_argument("-o", "--out", default="shorts_out", help="папка для результата")
    p.add_argument("-n", "--count", type=int, default=5, help="сколько шортсов сделать")
    p.add_argument("--min", dest="min_len", type=float, default=20, help="мин. длина момента, с")
    p.add_argument("--max", dest="max_len", type=float, default=55, help="макс. длина момента, с")
    p.add_argument("--clips", help='свои таймкоды вместо автопоиска: "1:20-2:05, 10:00-10:45"')
    p.add_argument("--dry-run", action="store_true", help="только найти моменты, не рендерить")

    g = p.add_argument_group("распознавание речи")
    g.add_argument("--model", default="small", help="модель whisper: tiny/base/small/medium/large-v3")
    g.add_argument("--language", default=None, help="язык речи (ru, en, …); по умолчанию — автоопределение")
    g.add_argument("--device", default="auto", choices=["auto", "cpu", "cuda"])
    g.add_argument("--transcript", help="готовая расшифровка JSON со словами (пропустить whisper)")

    g = p.add_argument_group("монтаж")
    g.add_argument("--layout", default="auto", choices=["auto", "crop", "blur"],
                   help="crop — кадр по лицу; blur — видео на размытом фоне; auto — crop, если есть лицо")
    g.add_argument("--no-cut-pauses", dest="cut_pauses", action="store_false", help="не вырезать паузы")
    g.add_argument("--max-pause", type=float, default=0.35, help="паузы длиннее этого вырезаются, с")
    g.add_argument("--zoom", type=float, default=0.08, help="сила панч-зума на смене фраз (0 — выкл.)")
    g.add_argument("--blur", type=int, default=40, help="сила размытия фона в режиме blur")
    g.add_argument("--music", help="фоновая музыка (mp3/wav), зацикливается")
    g.add_argument("--music-volume", type=float, default=0.12, help="громкость музыки (0..1)")

    g = p.add_argument_group("субтитры")
    g.add_argument("--no-subs", dest="subs", action="store_false", help="без субтитров")
    g.add_argument("--words", type=int, default=3, help="макс. слов на экране")
    g.add_argument("--max-chars", type=int, default=22, help="макс. символов в строке")
    g.add_argument("--font", default="Arial", help="шрифт (должен поддерживать кириллицу)")
    g.add_argument("--fonts-dir", help="папка с .ttf/.otf, если шрифта нет в системе")
    g.add_argument("--font-size", type=int, default=92)
    g.add_argument("--outline", type=int, default=7, help="толщина обводки")
    g.add_argument("--text-color", default="FFFFFF", help="цвет текста RRGGBB")
    g.add_argument("--highlight-color", default="FFE11A", help="цвет ключевых слов RRGGBB")
    g.add_argument("--sub-y", type=float, default=0.62, help="высота субтитров (0 — верх, 1 — низ)")
    g.add_argument("--upper", action="store_true", help="субтитры капсом")

    g = p.add_argument_group("кодирование")
    g.add_argument("--crf", type=int, default=20, help="качество x264 (меньше — лучше)")
    g.add_argument("--preset", default="medium", help="скорость x264: veryfast … slow")
    g.add_argument("-v", "--verbose", action="store_true", help="показывать вывод ffmpeg")
    a = p.parse_args()

    need("ffmpeg")
    need("ffprobe")
    outdir = Path(a.out).resolve()
    workdir = outdir / ".work"
    workdir.mkdir(parents=True, exist_ok=True)

    video = resolve_source(a.source, workdir)
    info = probe(video)
    log(f"🎞  {video.name}: {info['width']}×{info['height']}, {fmt_time(info['duration'])}")

    need_words = a.subs or a.cut_pauses or not a.clips
    wav = extract_wav(video, workdir)
    words: list[Word] = []
    if a.transcript:
        words = load_words(Path(a.transcript))
    elif need_words:
        words = transcribe(wav, workdir, a.model, a.language, a.device)
    sents = split_sentences(words)

    if a.clips:
        clips = manual_clips(a.clips, sents)
    else:
        if not sents:
            raise SystemExit("Речь не найдена — автопоиск невозможен. Укажите --clips.")
        loud = None
        try:
            loud = Loudness(wav)
        except Exception as e:  # numpy не установлен и т.п.
            log(f"   (громкость не учитывается: {e})")
        clips = find_moments(sents, loud, a.count, a.min_len, a.max_len)
        clips.sort(key=lambda c: c.start)

    if not clips:
        raise SystemExit("Подходящих моментов не найдено. Попробуйте уменьшить --min или увеличить --max.")

    log(f"\n✂  Моменты ({len(clips)}):")
    for i, c in enumerate(clips, 1):
        preview = c.text[:110] + ("…" if len(c.text) > 110 else "")
        log(f"  {i:2d}. {fmt_time(c.start)}–{fmt_time(c.end)}  ({c.duration:4.1f} с, оценка {c.score:5.2f})  {preview}")
    if a.dry_run:
        return
    log("")

    report = []
    for i, c in enumerate(clips, 1):
        report.append(render_clip(i, c, video, info, words, outdir, workdir, a))
    (outdir / "shorts.json").write_text(json.dumps(report, ensure_ascii=False, indent=2), encoding="utf-8")
    log(f"\n✅ Готово: {len(report)} шортс(ов) в {outdir}")
    log("   Описание моментов, идеи названий и таймкоды — в shorts.json, субтитры для загрузки — *.srt")


if __name__ == "__main__":
    main()
