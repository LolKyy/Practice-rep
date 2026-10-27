#!/usr/bin/env python3
"""Генерирует служебные материалы для монтажа «Поезд № 317».

    python3 tools/build_assets.py            # всё
    python3 tools/build_assets.py titles     # только титры и силуэт
    python3 tools/build_assets.py cctv noise audio animatic

Что получается:
  06_overlays/   титры PNG (прозрачные), силуэт, CCTV-оверлеи и VHS-шум (MP4, режим «Экран»)
  04_audio/temp/ черновой микс temp_mix.wav по audio_cues.csv + заготовки звуков
  07_animatic/   animatic.mp4 — раскадровка во времени с черновым звуком

Нужно: Python 3.10+, numpy, Pillow, ffmpeg в PATH.
"""

import argparse
import shutil
import subprocess
import sys
import textwrap
import wave
from pathlib import Path

import numpy as np
from PIL import Image, ImageDraw, ImageFilter, ImageFont

sys.path.insert(0, str(Path(__file__).resolve().parent))
from project import (  # noqa: E402
    FPS, HEIGHT, ROOT, TOTAL_S, WIDTH, find_font, format_time, load_cues, load_shots, load_srt,
)

OVERLAYS = ROOT / "06_overlays"
AUDIO_TEMP = ROOT / "04_audio" / "temp"
ANIMATIC = ROOT / "07_animatic"

SR = 48000
TEXT_COLOR = (232, 236, 238)
BG_COLOR = (27, 38, 48)
FROST = (143, 163, 173)
AMBER = (201, 138, 58)

# Титры: файл, текст, центр по вертикали (доля высоты), кегль, время показа
TITLES = [
    ("title_hook.png", "ЕСЛИ ПОЕЗД ОСТАНОВИТСЯ\nВ СТЕПИ —\nНЕ ОТКРЫВАЙТЕ ДВЕРЬ", 0.40, 64, (0.0, 2.5)),
    ("title_0317.png", "03:17. ПОЕЗД № 317.\nСТЕПНОЙ УЧАСТОК", 0.40, 60, (2.5, 7.0)),
    ("title_power.png", "ЭЛЕКТРОСНАБЖЕНИЕ\nПОТЕРЯНО", 0.40, 60, (11.5, 14.0)),
    ("title_end.png", "ЗАПИСЬ ПРЕРВАНА\nВ 03:41", 0.45, 72, (76.5, 82.0)),
]

# CCTV-оверлеи: файл, длительность, время на часах камеры в первом кадре
CCTV = [
    ("cctv_03B.mp4", 6.0, (3, 24, 51)),
    ("cctv_07.mp4", 11.0, (3, 40, 49)),  # к обрыву записи (1:16) часы показывают 03:41:00
]


def run(cmd, **kwargs):
    subprocess.run(cmd, check=True, **kwargs)


def need_ffmpeg():
    if not shutil.which("ffmpeg"):
        raise SystemExit("ffmpeg не найден в PATH")


# ---------------------------------------------------------------- титры

def analog_text(text, size, font_path, canvas=(WIDTH, HEIGHT), center_y=0.4):
    """Белый моноширинный текст с лёгким свечением и RGB-расхождением, на прозрачном фоне."""
    font = ImageFont.truetype(font_path, size)
    mask = Image.new("L", canvas, 0)
    draw = ImageDraw.Draw(mask)
    box = draw.multiline_textbbox((0, 0), text, font=font, spacing=size // 3, align="center")
    w, h = box[2] - box[0], box[3] - box[1]
    pos = ((canvas[0] - w) // 2 - box[0], int(canvas[1] * center_y - h / 2) - box[1])
    draw.multiline_text(pos, text, font=font, fill=255, spacing=size // 3, align="center")

    out = Image.new("RGBA", canvas, (0, 0, 0, 0))
    glow = mask.filter(ImageFilter.GaussianBlur(10)).point(lambda v: v * 0.45)
    out.paste((*FROST, 255), (0, 0), glow)
    # красный и голубой каналы сдвинуты на 3 px — аналоговое расхождение
    out.paste((255, 70, 70, 255), (-3, 0), mask.point(lambda v: v * 0.5))
    out.paste((70, 220, 255, 255), (3, 0), mask.point(lambda v: v * 0.5))
    out.paste((*TEXT_COLOR, 255), (0, 0), mask)
    return out


def build_titles(font_path):
    OVERLAYS.mkdir(parents=True, exist_ok=True)
    for name, text, center_y, size, _ in TITLES:
        analog_text(text, size, font_path, center_y=center_y).save(OVERLAYS / name)
    build_silhouette()
    print("титры и силуэт →", OVERLAYS.relative_to(ROOT))


def build_silhouette():
    """Высокая тонкая фигура без деталей, размытая метелью. Для S01B (12 %)."""
    w, h = 300, 1100
    mask = Image.new("L", (w, h), 0)
    d = ImageDraw.Draw(mask)
    cx = w // 2
    d.ellipse((cx - 20, 40, cx + 20, 112), fill=255)                      # голова, слишком маленькая
    d.rectangle((cx - 8, 105, cx + 8, 150), fill=255)                      # длинная шея
    d.ellipse((cx - 62, 140, cx + 62, 200), fill=255)                      # покатые плечи
    d.polygon([(cx - 58, 170), (cx + 58, 170), (cx + 36, 480), (cx + 30, 690),
               (cx - 30, 690), (cx - 36, 480)], fill=255)                  # узкий длинный корпус
    for side in (-1, 1):                                                   # руки ниже колен
        d.line([(cx + side * 56, 180), (cx + side * 66, 500), (cx + side * 62, 860)], fill=255, width=14)
        d.line([(cx + side * 16, 680), (cx + side * 20, 1060)], fill=255, width=22)  # ноги
    rng = np.random.default_rng(317)
    # метель «съедает» края: горизонтальные снежные штрихи
    streaks = Image.new("L", (w, h), 0)
    sd = ImageDraw.Draw(streaks)
    for _ in range(260):
        x, y = rng.integers(-60, w), rng.integers(0, h)
        sd.line([(x, y), (x + rng.integers(20, 90), y + rng.integers(-2, 3))], fill=int(rng.integers(90, 200)), width=2)
    mask = Image.fromarray(np.clip(np.array(mask).astype(int) - np.array(streaks), 0, 255).astype(np.uint8))
    mask = mask.filter(ImageFilter.GaussianBlur(6))
    out = Image.new("RGBA", (w, h), (10, 14, 18, 0))
    out.putalpha(mask)
    out.save(OVERLAYS / "overlay_silhouette.png")


# ---------------------------------------------------------------- CCTV и шум

def cctv_frame(font_path, clock, rec_on):
    img = Image.new("RGB", (WIDTH, HEIGHT), (0, 0, 0))
    d = ImageDraw.Draw(img)
    font = ImageFont.truetype(font_path, 44)
    small = ImageFont.truetype(font_path, 36)
    top = 170  # ниже верхней панели TikTok
    d.text((80, top), "КАМ 07-2 · ВАГОН 7", font=font, fill=(225, 225, 225))
    d.text((80, top + 62), f"14.01.1999   {clock}", font=small, fill=(225, 225, 225))
    if rec_on:
        d.ellipse((WIDTH - 250, top + 8, WIDTH - 218, top + 40), fill=(220, 40, 40))
    d.text((WIDTH - 200, top), "REC", font=font, fill=(225, 225, 225))
    # уголки рамки
    m, l, t = 60, 90, 5
    for x, y, dx, dy in [(m, 140, 1, 1), (WIDTH - m, 140, -1, 1),
                         (m, HEIGHT - 140, 1, -1), (WIDTH - m, HEIGHT - 140, -1, -1)]:
        d.line([(x, y), (x + dx * l, y)], fill=(200, 200, 200), width=t)
        d.line([(x, y), (x, y + dy * l)], fill=(200, 200, 200), width=t)
    return img


def build_cctv(font_path):
    need_ffmpeg()
    OVERLAYS.mkdir(parents=True, exist_ok=True)
    tmp = OVERLAYS / "_cctv_frames"
    for name, duration, (h, m, s) in CCTV:
        tmp.mkdir(exist_ok=True)
        start = h * 3600 + m * 60 + s
        steps = int(duration * 2)  # кадр на каждые 0.5 сек: REC мигает, часы тикают раз в секунду
        for i in range(steps):
            t = start + i // 2
            clock = f"{t // 3600:02d}:{t % 3600 // 60:02d}:{t % 60:02d}"
            cctv_frame(font_path, clock, rec_on=i % 2 == 0).save(tmp / f"{i:04d}.png")
        run(["ffmpeg", "-y", "-loglevel", "error", "-framerate", "2", "-i", str(tmp / "%04d.png"),
             "-vf", f"fps={FPS},format=yuv420p", "-t", str(duration),
             "-c:v", "libx264", "-crf", "20", "-preset", "medium", str(OVERLAYS / name)])
        shutil.rmtree(tmp)
    print("CCTV-оверлеи →", OVERLAYS.relative_to(ROOT))


def build_noise():
    """Бесшовная 6-секундная петля VHS-шума 540×960 (CapCut растянет): зерно + бегущая полоса. Режим «Экран»."""
    need_ffmpeg()
    OVERLAYS.mkdir(parents=True, exist_ok=True)
    vf = ("noise=alls=70:allf=t+u,"
          "drawbox=x=0:y='mod(t*320\\,960)':w=540:h=10:color=white@0.18:t=fill,"
          "drawbox=x=0:y='mod(t*320+480\\,960)':w=540:h=3:color=white@0.10:t=fill,"
          "format=yuv420p")
    run(["ffmpeg", "-y", "-loglevel", "error", "-f", "lavfi",
         "-i", f"color=c=0x0c0c0c:s=540x960:r={FPS}:d=6", "-vf", vf,
         "-c:v", "libx264", "-crf", "34", "-preset", "medium", str(OVERLAYS / "vhs_noise.mp4")])
    print("VHS-шум →", (OVERLAYS / "vhs_noise.mp4").relative_to(ROOT))


# ---------------------------------------------------------------- звук

rng = np.random.default_rng(1999)


def t_axis(duration):
    return np.arange(int(duration * SR)) / SR


def band(x, lo=None, hi=None):
    """Полосовой фильтр через FFT с мягкими краями."""
    spec = np.fft.rfft(x)
    f = np.fft.rfftfreq(len(x), 1 / SR)
    mask = np.ones_like(f)
    if lo:
        mask *= 1 / (1 + (lo / np.maximum(f, 1e-3)) ** 4)
    if hi:
        mask *= 1 / (1 + (f / hi) ** 4)
    return np.fft.irfft(spec * mask, len(x))


def norm(x):
    peak = np.max(np.abs(x))
    return x / peak if peak > 0 else x


def smooth_random(duration, step, lo, hi):
    points = int(duration / step) + 3
    xp = np.arange(points) * step
    values = rng.uniform(lo, hi, points)
    y = np.interp(t_axis(duration), xp, values)
    k = int(step * SR / 2) or 1
    return np.convolve(y, np.ones(k) / k, mode="same")


def snd_wind(duration):
    out = []
    gust = smooth_random(duration, 1.6, 0.45, 1.0)
    for _ in range(2):  # два некоррелированных канала
        brown = band(np.cumsum(rng.standard_normal(int(duration * SR))), 25, 700)
        howl = band(rng.standard_normal(int(duration * SR)), 360, 470) * 0.6
        out.append(norm(brown) * gust + norm(howl) * gust ** 3 * 0.5)
    return norm(np.stack(out, axis=1))


def snd_clack():
    t = t_axis(0.15)
    click = band(rng.standard_normal(len(t)), 200, 2200) * np.exp(-t / 0.02)
    thump = np.sin(2 * np.pi * 70 * t) * np.exp(-t / 0.05)
    return norm(click) * 0.7 + thump


def snd_train_run(duration):
    t = t_axis(duration)
    speed = np.clip(1 - np.clip(t - 7.0, 0, None) / (duration - 7.0) * 0.8, 0.2, 1)
    rumble = norm(band(np.cumsum(rng.standard_normal(len(t))), 20, 160)) * speed
    hum = (np.sin(2 * np.pi * 100 * t) + 0.4 * np.sin(2 * np.pi * 200 * t)) * 0.06
    out = rumble * 0.6 + hum
    # «та-дам … та-дам»: две тележки на стыке; позиции в пройденном пути (при скорости 1 = секунды)
    clack = snd_clack()
    hits = [k * 1.15 + p for k in range(int(duration) + 1) for p in (0.0, 0.12, 0.55, 0.67)]
    distance = np.cumsum(speed) / SR
    for hit in hits:
        s = int(np.searchsorted(distance, hit))
        if s >= len(t) - int(0.2 * SR):
            break
        seg = clack[: len(out) - s] * speed[s]
        out[s:s + len(seg)] += seg * 0.8
    fade = np.clip((duration - t) / 0.3, 0, 1)
    return norm(out * fade)


def snd_brake(duration):
    t = t_axis(duration)
    f = 2900 - 500 * t / duration + 120 * np.sin(2 * np.pi * 5.5 * t)
    tone = np.sin(2 * np.pi * np.cumsum(f) / SR) + 0.4 * np.sin(2 * np.pi * np.cumsum(f * 1.41) / SR)
    env = np.clip(t / 0.2, 0, 1) * np.clip((duration - t) / (duration * 0.6), 0, 1)
    hiss = band(rng.standard_normal(len(t)), 2000, 6000) * 0.4
    return norm((tone * 0.6 + norm(hiss)) * env)


def metal_hit(length, f0, decay):
    t = t_axis(length)
    partials = [(1, 1.0), (2.76, 0.5), (5.40, 0.25), (8.93, 0.1)]
    s = sum(a * np.sin(2 * np.pi * f0 * r * t) * np.exp(-t / (decay / r ** 0.3)) for r, a in partials)
    click = band(rng.standard_normal(len(t)), 300, 3000) * np.exp(-t / 0.008)
    return norm(s + norm(click) * 0.5)


def snd_coupler(duration):
    out = np.zeros(int(duration * SR))
    for start, amp in [(0.0, 1.0), (0.22, 0.7), (0.5, 0.45)]:
        hit = metal_hit(duration - start, 140, 0.18) * amp
        s = int(start * SR)
        out[s:s + len(hit)] += hit
    return norm(out)


def snd_relay(_=None):
    t = t_axis(0.06)
    a = band(rng.standard_normal(len(t)), 2000, 9000) * np.exp(-t / 0.002)
    b = np.roll(a, int(0.015 * SR)) * 0.4
    return norm(a + b)


def snd_power_down(duration):
    t = t_axis(duration)
    f = 25 + 75 * np.exp(-t / 0.3)
    ph = 2 * np.pi * np.cumsum(f) / SR
    s = np.sin(ph) + 0.5 * np.sin(2 * ph) + 0.3 * np.sin(3 * ph)
    return norm(s * np.exp(-t / 0.35))


def snd_creak(duration):
    t = t_axis(duration)
    rate = smooth_random(duration, 0.15, 25, 70)
    saw = (np.cumsum(rate) / SR) % 1.0 - 0.5
    env = np.sin(np.pi * t / duration) ** 2 * smooth_random(duration, 0.1, 0.3, 1.0)
    return norm(band(saw, 120, 1400) * env)


def snd_pa_static(duration):
    t = t_axis(duration)
    hiss = band(rng.standard_normal(len(t)), 400, 4000) * 0.35
    crackle = np.zeros(len(t))
    idx = rng.choice(len(t), int(duration * 40), replace=False)
    crackle[idx] = rng.uniform(-1, 1, len(idx))
    crackle = band(crackle, 800, 6000)
    hum = np.sin(2 * np.pi * 50 * t) * 0.05
    env = np.clip(t / 0.05, 0, 1) * np.clip((duration - t) / 0.02, 0, 1)
    return norm((norm(hiss) * 0.6 + norm(crackle) * 0.5 + hum) * env)


def snd_knock_glass(_=None):
    t = t_axis(0.5)
    thump = np.sin(2 * np.pi * 95 * t) * np.exp(-t / 0.06)
    click = band(rng.standard_normal(len(t)), 150, 1800) * np.exp(-t / 0.012)
    return norm(thump + norm(click) * 0.6)


def snd_knock_metal(_=None):
    t = t_axis(1.3)
    boom = np.sin(2 * np.pi * 62 * t) * np.exp(-t / 0.25)
    ring = metal_hit(1.3, 173, 0.35) * 0.45
    return norm(boom + ring)


def snd_lamp_buzz(duration):
    t = t_axis(duration)
    buzz = np.tanh(4 * np.sin(2 * np.pi * 100 * t)) * 0.5 + band(rng.standard_normal(len(t)), 2000, 7000) * 0.2
    gate = (smooth_random(duration, 0.06, 0, 1) > 0.45).astype(float)
    gate = np.convolve(gate, np.ones(96) / 96, mode="same")
    return norm(buzz * gate)


def snd_arc(duration):
    t = t_axis(duration)
    sparks = np.zeros(len(t))
    idx = rng.choice(len(t), int(duration * 900), replace=False)
    sparks[idx] = rng.uniform(-1, 1, len(idx))
    noise = band(rng.standard_normal(len(t)), 1000, 9000)
    am = 0.6 + 0.4 * np.sign(np.sin(2 * np.pi * 50 * t))
    env = np.clip(t / 0.003, 0, 1) * np.exp(-t / (duration * 0.5))
    return norm((band(sparks, 600, 10000) + norm(noise) * 0.5) * am * env)


def snd_scrape(duration):
    t = t_axis(duration)
    f = smooth_random(duration, 0.3, 550, 900)
    tone = np.sin(2 * np.pi * np.cumsum(f) / SR) * 0.4
    grit = band(rng.standard_normal(len(t)), 500, 2000)
    env = np.sin(np.pi * t / duration) * smooth_random(duration, 0.08, 0.2, 1.0)
    return norm(band(tone + norm(grit), None, 1800) * env)


def snd_bass_hit(duration):
    t = t_axis(duration)
    f = 40 + 30 * np.exp(-t / 0.15)
    sub = np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-t / 0.9)
    attack = band(rng.standard_normal(len(t)), 400, 2000) * np.exp(-t / 0.03) * 0.35  # слышно на телефоне
    return norm(sub + attack)


def snd_signal_cut(duration):
    t = t_axis(duration)
    burst = np.round(rng.uniform(-1, 1, len(t)) * 4) / 4 + 0.3 * np.sign(np.sin(2 * np.pi * 1000 * t))
    return norm(band(burst, 200, 8000) * (t < duration * 0.6))


SYNTH = {
    "train_run": snd_train_run, "brake_screech": snd_brake, "coupler_clank": snd_coupler,
    "relay_click": snd_relay, "power_down": snd_power_down, "metal_creak": snd_creak,
    "pa_static": snd_pa_static, "knock_glass": snd_knock_glass, "knock_metal": snd_knock_metal,
    "lamp_buzz": snd_lamp_buzz, "arc_crackle": snd_arc, "metal_scrape": snd_scrape,
    "bass_hit": snd_bass_hit, "signal_cut": snd_signal_cut,
}
PAN = {"knock_glass": -0.25, "metal_scrape": 0.4, "arc_crackle": 0.2}


def write_wav(path, data):
    if data.ndim == 1:
        data = data[:, None]
    pcm = (np.clip(data, -1, 1) * 32767).astype("<i2")
    with wave.open(str(path), "wb") as w:
        w.setnchannels(pcm.shape[1])
        w.setsampwidth(2)
        w.setframerate(SR)
        w.writeframes(pcm.tobytes())


def db(value):
    return 10 ** (value / 20)


def build_audio():
    AUDIO_TEMP.mkdir(parents=True, exist_ok=True)
    cues = load_cues()
    n = int(TOTAL_S * SR)
    mix = np.zeros((n, 2))

    # ветер с автоматизацией уровня по точкам wind_level
    points = [(c.time, c.gain_db) for c in cues if c.cue == "wind_level"]
    times, gains = zip(*points)
    level = db(np.interp(t_axis(TOTAL_S), times, gains))
    mix += snd_wind(TOTAL_S) * level[:, None]

    placeholders = AUDIO_TEMP / "placeholders"
    placeholders.mkdir(exist_ok=True)
    written = set()
    for c in cues:
        if c.cue not in SYNTH:
            continue
        mono = SYNTH[c.cue](c.duration) if c.duration else SYNTH[c.cue]()
        if c.cue not in written:
            write_wav(placeholders / f"ph_{c.cue}.wav", mono * db(-3))
            written.add(c.cue)
        pan = PAN.get(c.cue, 0.0)
        stereo = np.stack([mono * (1 - max(pan, 0)), mono * (1 + min(pan, 0))], axis=1)
        s = int(c.time * SR)
        seg = stereo[: n - s] * db(c.gain_db)
        mix[s:s + len(seg)] += seg
    write_wav(placeholders / "ph_wind_loop.wav", snd_wind(22.0) * db(-3))  # стерео

    peak = np.max(np.abs(mix))
    if peak > db(-1):
        mix *= db(-1) / peak
    write_wav(AUDIO_TEMP / "temp_mix.wav", mix)
    if shutil.which("ffmpeg"):  # лёгкая копия для телефона и CapCut Mobile
        run(["ffmpeg", "-y", "-loglevel", "error", "-i", str(AUDIO_TEMP / "temp_mix.wav"),
             "-b:a", "192k", str(AUDIO_TEMP / "temp_mix.mp3")])
    print("черновой звук →", AUDIO_TEMP.relative_to(ROOT))


# ---------------------------------------------------------------- аниматик

def build_animatic(font_path):
    need_ffmpeg()
    if not (AUDIO_TEMP / "temp_mix.wav").exists():
        build_audio()
    if not all((OVERLAYS / name).exists() for name, *_ in TITLES):
        build_titles(font_path)
    ANIMATIC.mkdir(parents=True, exist_ok=True)

    shots, subs, cues = load_shots(), load_srt(), load_cues()
    titles = [(Image.open(OVERLAYS / name).convert("RGBA"), span) for name, *_, span in TITLES]
    fonts = {size: ImageFont.truetype(font_path, size) for size in (30, 34, 40, 48, 120)}
    flashes = [c.time for c in cues if c.cue == "arc_crackle"]
    marks = [c for c in cues if c.cue not in ("wind_level", "train_run", "pa_static")]

    def card(shot):
        img = Image.new("RGB", (WIDTH, HEIGHT), BG_COLOR)
        d = ImageDraw.Draw(img)
        d.text((60, 120), "АНИМАТИК · НЕ ДЛЯ ПУБЛИКАЦИИ", font=fonts[30], fill=FROST)
        d.text((60, 180), shot.id, font=fonts[120], fill=TEXT_COLOR)
        d.text((60, 330), f"{shot.type}  ·  {format_time(shot.start)}–{format_time(shot.end)}  ·  {shot.duration:g} с",
                font=fonts[34], fill=AMBER)
        d.text((60, 385), f"Сцена {shot.scene}", font=fonts[34], fill=FROST)
        y = 470
        for label, value in [("КАДР", shot.visual), ("КАМЕРА", shot.camera), ("ЗВУК", shot.audio),
                             ("СПРЯТАНО", shot.hidden_detail)]:
            if not value:
                continue
            d.text((60, y), label, font=fonts[30], fill=AMBER)
            y += 44
            for line in textwrap.wrap(value, 44):
                d.text((60, y), line, font=fonts[34], fill=TEXT_COLOR)
                y += 46
            y += 24
        return img

    cards = {s.id: card(s) for s in shots}
    ffmpeg = subprocess.Popen(
        ["ffmpeg", "-y", "-loglevel", "error", "-f", "rawvideo", "-pix_fmt", "rgb24",
         "-s", f"{WIDTH}x{HEIGHT}", "-r", "10", "-i", "-", "-i", str(AUDIO_TEMP / "temp_mix.wav"),
         "-vf", f"fps={FPS},format=yuv420p", "-c:v", "libx264", "-crf", "30", "-preset", "medium",
         "-c:a", "aac", "-b:a", "160k", "-shortest", str(ANIMATIC / "animatic.mp4")],
        stdin=subprocess.PIPE)

    for i in range(int(TOTAL_S * 10)):
        t = i / 10
        shot = next(s for s in shots if s.start <= t < s.end)
        if any(f <= t < f + 0.2 for f in flashes):
            frame = Image.new("RGB", (WIDTH, HEIGHT), (200, 215, 230))
        else:
            frame = cards[shot.id].copy()
        for img, (a, b) in titles:
            if a <= t < b:
                frame.paste(img, (0, 0), img)
        d = ImageDraw.Draw(frame)
        for sub in subs:
            if sub.start <= t < sub.end:
                d.multiline_text((WIDTH // 2, int(HEIGHT * 0.62)), sub.text, font=fonts[40],
                                 fill=(255, 225, 120), anchor="ma", align="center", spacing=10)
        hits = [c.cue for c in marks if c.time <= t < c.time + 0.4]
        if hits:
            d.text((60, HEIGHT - 330), "♪ " + ", ".join(hits), font=fonts[40], fill=(255, 110, 110))
        d.text((60, HEIGHT - 260), format_time(t), font=fonts[48], fill=TEXT_COLOR)
        d.rectangle((60, HEIGHT - 190, 60 + int((WIDTH - 120) * t / TOTAL_S), HEIGHT - 180), fill=AMBER)
        ffmpeg.stdin.write(frame.tobytes())
    ffmpeg.stdin.close()
    if ffmpeg.wait() != 0:
        raise SystemExit("ffmpeg не смог собрать аниматик")
    print("аниматик →", (ANIMATIC / "animatic.mp4").relative_to(ROOT))


def main():
    parser = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    parser.add_argument("steps", nargs="*", choices=["titles", "cctv", "noise", "audio", "animatic"],
                        help="что собрать (по умолчанию всё)")
    parser.add_argument("--font", help="путь к моноширинному шрифту с кириллицей")
    args = parser.parse_args()
    steps = args.steps or ["titles", "cctv", "noise", "audio", "animatic"]
    font = find_font(args.font)
    for step in steps:
        {"titles": lambda: build_titles(font), "cctv": lambda: build_cctv(font), "noise": build_noise,
         "audio": build_audio, "animatic": lambda: build_animatic(font)}[step]()


if __name__ == "__main__":
    main()
