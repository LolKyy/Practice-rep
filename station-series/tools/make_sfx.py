#!/usr/bin/env python3
"""Синтез звуков «Харона» (numpy) — пока у ключа ElevenLabs нет права sound_generation.

  .venv/bin/python tools/make_sfx.py            # все звуки → assets/sfx/*.mp3, музыка → assets/music/*.mp3

Детерминированно (фиксированные seed): повторный запуск даёт те же файлы.
"""
import os
import subprocess
import wave

import numpy as np

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SR = 44100
SFX = os.path.join(ROOT, "assets", "sfx")
MUS = os.path.join(ROOT, "assets", "music")


def t(d):
    return np.arange(int(d * SR)) / SR


def bandpass(x, lo, hi):
    X = np.fft.rfft(x)
    f = np.fft.rfftfreq(len(x), 1 / SR)
    m = ((f >= lo) & (f <= hi)).astype(float)
    # мягкие края
    m = np.convolve(m, np.hanning(64) / np.hanning(64).sum(), mode="same")
    return np.fft.irfft(X * m, n=len(x))


def env(n, a=0.005, r=0.2, shape=1.0):
    e = np.ones(n)
    na = max(1, int(a * SR))
    e[:na] = np.linspace(0, 1, na)
    rr = np.exp(-np.arange(n - na) / (max(r, 1e-3) * SR)) ** shape
    e[na:] = rr
    return e


def norm(x, peak=0.9):
    m = np.max(np.abs(x)) or 1
    return x / m * peak


def save(name, x, folder=SFX, stereo_width=0.0, br="192k"):
    os.makedirs(folder, exist_ok=True)
    x = np.clip(x, -1, 1)
    if stereo_width:
        d = int(stereo_width * SR)
        r = np.concatenate([np.zeros(d), x[:-d]]) if d else x
        st = np.stack([x, r], 1)
    else:
        st = np.stack([x, x], 1)
    wav = os.path.join(folder, name + ".wav")
    with wave.open(wav, "w") as w:
        w.setnchannels(2)
        w.setsampwidth(2)
        w.setframerate(SR)
        w.writeframes((st * 32767).astype("<i2").tobytes())
    mp3 = os.path.join(folder, name + ".mp3")
    subprocess.run(["ffmpeg", "-nostdin", "-hide_banner", "-loglevel", "error", "-y", "-i", wav, "-b:a", br, mp3], check=True)
    os.remove(wav)
    print("  ", os.path.relpath(mp3, ROOT), f"{len(x) / SR:.2f} с")


rng = np.random.default_rng(7)


def noise(d):
    return rng.standard_normal(int(d * SR))


def brown(d):
    b = np.cumsum(noise(d))
    b -= np.convolve(b, np.ones(2000) / 2000, mode="same")
    return norm(b)


def ice_crunch(d=1.4, density=38, seed=1):
    """Хруст льда: россыпь коротких трескучих импульсов + низкий «скрип»."""
    r = np.random.default_rng(seed)
    x = np.zeros(int(d * SR))
    times = np.sort(r.uniform(0, d - 0.05, density))
    for tt in times:
        L = int(r.uniform(0.004, 0.03) * SR)
        burst = r.standard_normal(L) * env(L, 0.0005, r.uniform(0.003, 0.012))
        burst = bandpass(np.pad(burst, (0, 512)), r.uniform(900, 2000), r.uniform(4000, 9000))[:L]
        i = int(tt * SR)
        x[i : i + L] += burst * r.uniform(0.3, 1.0)
    creak = np.sin(2 * np.pi * np.cumsum(70 + 25 * np.sin(2 * np.pi * 0.9 * t(d))) / SR)
    creak = np.tanh(creak * 3) * 0.12 * env(len(creak), 0.2, d * 0.6)
    return norm(x + creak, 0.95)


def crack(d=1.2, seed=2):
    """Откол льда: резкий щелчок + звон осколков."""
    r = np.random.default_rng(seed)
    n = int(d * SR)
    x = np.zeros(n)
    L = int(0.06 * SR)
    x[:L] += bandpass(np.pad(r.standard_normal(L) * env(L, 0.0003, 0.012), (0, 256)), 300, 9000)[:L] * 1.2
    thump = np.sin(2 * np.pi * 60 * t(0.25)) * env(int(0.25 * SR), 0.001, 0.06)
    x[: len(thump)] += thump * 0.6
    for _ in range(26):  # осколки
        f = r.uniform(2500, 7000)
        st = r.uniform(0.08, d - 0.3)
        dl = r.uniform(0.05, 0.25)
        tone = np.sin(2 * np.pi * f * t(dl)) * env(int(dl * SR), 0.001, dl * 0.25)
        i = int(st * SR)
        x[i : i + len(tone)] += tone * r.uniform(0.05, 0.22)
    x += ice_crunch(d, 14, seed + 10) * 0.35
    return norm(x, 0.95)


def clang(d=1.6):
    """Удар монтировкой по металлу/льду: неровные обертоны."""
    x = np.zeros(int(d * SR))
    for f, a, r in [(523, 1.0, 0.5), (1371, 0.6, 0.3), (2153, 0.45, 0.22), (3417, 0.3, 0.12), (4870, 0.2, 0.08)]:
        x += a * np.sin(2 * np.pi * f * t(d)) * env(len(x), 0.0008, r)
    L = int(0.02 * SR)
    x[:L] += noise(0.02) * env(L, 0.0002, 0.004) * 1.5
    return norm(x, 0.85)


def beep(f=2200, d=0.07):
    x = np.sin(2 * np.pi * f * t(d)) * env(int(d * SR), 0.002, 1.0)
    fade = int(0.008 * SR)
    x[-fade:] *= np.linspace(1, 0, fade)
    return x


def double_beep():
    g = np.zeros(int(0.06 * SR))
    return norm(np.concatenate([beep(2300), g, beep(2300), np.zeros(int(0.25 * SR))]), 0.8)


def ping():
    x = np.concatenate([beep(1650, 0.05), np.zeros(int(0.3 * SR))])
    return norm(x * env(len(x), 0.001, 0.12), 0.5)


def turret_scan(d=2.4):
    """Турель: сервопривод + сканирующий тон."""
    tt = t(d)
    servo = np.sin(2 * np.pi * np.cumsum(180 + 60 * np.sin(2 * np.pi * 0.7 * tt)) / SR)
    servo = np.tanh(servo * 2) * 0.25 + bandpass(noise(d), 800, 2500) * 0.05
    scan = np.sin(2 * np.pi * np.cumsum(900 + 500 * np.abs(np.sin(2 * np.pi * 0.8 * tt))) / SR) * 0.25
    e = np.minimum(1, tt / 0.15) * np.minimum(1, (d - tt) / 0.3)
    # смягчено: срезаем верха, сканирующий тон тише сервопривода
    return norm(bandpass((servo + scan * 0.6) * e, 60, 2800), 0.6)


def cryo_hiss(d=2.2):
    x = bandpass(noise(d), 2500, 12000) * env(int(d * SR), 0.02, 0.8)
    thump = np.sin(2 * np.pi * 50 * t(0.4)) * env(int(0.4 * SR), 0.002, 0.1)
    x[: len(thump)] += thump * 2
    return norm(x, 0.8)


def whoosh(d=0.9, up=True):
    n = int(d * SR)
    x = noise(d)
    out = np.zeros(n)
    steps = 12
    for k in range(steps):
        lo = 300 + (k if up else steps - k) * 400
        seg = slice(k * n // steps, (k + 1) * n // steps)
        out[seg] = bandpass(x, lo, lo * 2.5)[seg]
    e = np.sin(np.pi * np.arange(n) / n) ** 2
    return norm(out * e, 0.6)


def boom(d=2.0):
    x = np.sin(2 * np.pi * np.cumsum(55 * np.exp(-t(d) * 1.2) + 30) / SR) * env(int(d * SR), 0.003, 0.7)
    x += bandpass(noise(d), 40, 400) * env(int(d * SR), 0.002, 0.25) * 0.6
    return norm(np.tanh(x * 1.5), 0.9)


def glitch(d=0.6, seed=5):
    r = np.random.default_rng(seed)
    x = np.zeros(int(d * SR))
    for _ in range(9):
        L = int(r.uniform(0.01, 0.05) * SR)
        i = int(r.uniform(0, d - 0.06) * SR)
        sq = np.sign(np.sin(2 * np.pi * r.uniform(200, 1500) * np.arange(L) / SR))
        x[i : i + L] += sq * r.uniform(0.2, 0.5)
    x += bandpass(noise(d), 3000, 9000) * 0.1
    return norm(x, 0.5)


def clamp(d=1.5):
    x = boom(0.8)[: int(0.8 * SR)] * 0.7
    c = clang(0.7)
    out = np.zeros(int(d * SR))
    out[: len(x)] += x
    out[int(0.15 * SR) : int(0.15 * SR) + len(c)] += c * 0.5
    return norm(out, 0.85)


def lid(d=1.3):
    tt = t(d)
    scrape = bandpass(noise(d), 600, 3000) * (0.4 + 0.6 * np.abs(np.sin(2 * np.pi * 9 * tt)))
    scrape *= np.minimum(1, tt / 0.1) * np.minimum(1, (d - tt) / 0.2)
    out = scrape * 0.4
    c = clang(0.8)
    i = int(0.85 * SR)
    out[i : i + len(c)] += c[: len(out) - i] * 0.8
    return norm(out, 0.8)


def drone(d=30):
    tt = t(d)
    x = brown(d) * 0.5
    x = bandpass(x, 25, 220)
    hum = 0.15 * np.sin(2 * np.pi * 55 * tt) + 0.06 * np.sin(2 * np.pi * 110 * tt)
    lfo = 0.75 + 0.25 * np.sin(2 * np.pi * 0.07 * tt)
    return norm((x + hum) * lfo, 0.6)


def music_bed(d=150):
    """Тёмный эмбиент: низкие тянущиеся аккорды + ледяное мерцание. Тише голоса."""
    tt = t(d)
    out = np.zeros(len(tt))
    chords = [[55.0, 82.41, 130.81], [51.91, 77.78, 123.47], [55.0, 82.41, 138.59], [49.0, 73.42, 116.54]]
    seg = 16.0
    for i in range(int(d / seg) + 1):
        c = chords[i % len(chords)]
        st = int(i * seg * SR)
        L = min(int((seg + 4) * SR), len(tt) - st)
        if L <= 0:
            break
        lt = np.arange(L) / SR
        e = np.minimum(1, lt / 4) * np.minimum(1, (L / SR - lt) / 4)
        v = np.zeros(L)
        for f in c:
            for det in (-0.6, 0.6):
                v += np.sin(2 * np.pi * (f + det) * lt + rng.uniform(0, 6))
        out[st : st + L] += v * e * 0.12
    shimmer = np.zeros(len(tt))
    r = np.random.default_rng(11)
    for _ in range(int(d / 2.5)):
        f = r.choice([1318.5, 1567.98, 1760.0, 2093.0, 2349.3])
        dl = r.uniform(1.5, 3.5)
        st = int(r.uniform(0, d - dl) * SR)
        L = int(dl * SR)
        lt = np.arange(L) / SR
        shimmer[st : st + L] += np.sin(2 * np.pi * f * lt) * np.sin(np.pi * lt / dl) ** 2 * r.uniform(0.01, 0.03)
    sub = bandpass(brown(d), 20, 90) * 0.25
    return norm(out + shimmer + sub, 0.7)


def knock(n=3, seed=21):
    """Глухой стук изнутри по стеклу капсулы."""
    r = np.random.default_rng(seed)
    out = np.zeros(int((0.45 * n + 0.6) * SR))
    for k in range(n):
        d = 0.25
        x = np.sin(2 * np.pi * r.uniform(110, 140) * t(d)) * env(int(d * SR), 0.001, 0.05)
        x += bandpass(noise(d), 300, 1800) * env(int(d * SR), 0.0005, 0.02) * 0.6
        x += np.sin(2 * np.pi * 1900 * t(d)) * env(int(d * SR), 0.001, 0.03) * 0.08  # «стеклянный» призвук
        i = int((k * 0.45 + r.uniform(-0.03, 0.03) + 0.05) * SR)
        out[i : i + len(x)] += x * (0.8 + 0.2 * k / n)
    return norm(out, 0.9)


def glass_burst(d=2.2):
    """Стекло лопается наружу + осколки + выдох холода."""
    x = crack(d, 31) * 0.9
    L = int(0.12 * SR)
    x[:L] += bandpass(noise(0.12), 1500, 12000) * env(L, 0.0003, 0.04) * 1.5
    x += bandpass(noise(d), 200, 3000) * env(int(d * SR), 0.05, 0.6) * 0.35
    return norm(x, 0.95)


def alarm(d=1.2):
    tt = t(d)
    x = np.sign(np.sin(2 * np.pi * np.where((tt * 4).astype(int) % 2 == 0, 880, 660) * tt)) * 0.3
    x = bandpass(x, 300, 4000) * np.minimum(1, (d - tt) / 0.2)
    return norm(x, 0.5)


def cold_wind(d=3.0):
    tt = t(d)
    x = bandpass(noise(d), 300, 2500) * (0.5 + 0.5 * np.sin(2 * np.pi * 0.5 * tt)) * np.minimum(1, tt / 0.3) * np.minimum(1, (d - tt) / 1.0)
    return norm(x, 0.6)


if __name__ == "__main__":
    print("[sfx] синтез:")
    save("ice_crunch", ice_crunch(), stereo_width=0.004)
    save("ice_crunch_long", np.concatenate([ice_crunch(1.4, 38, 1), ice_crunch(1.6, 30, 3) * 0.8]), stereo_width=0.004)
    save("ice_crack", crack(), stereo_width=0.003)
    save("crowbar_clang", clang())
    save("scanner_detect", double_beep())
    save("scanner_ping", ping())
    save("turret_scan", turret_scan(), stereo_width=0.006)
    save("cryo_hiss", cryo_hiss(), stereo_width=0.005)
    save("whoosh", whoosh(), stereo_width=0.008)
    save("boom", boom())
    save("glitch", glitch())
    save("dock_clamp", clamp())
    save("lid_open", lid())
    save("drone_station", drone(), stereo_width=0.012)
    save("haron_bed", music_bed(), folder=MUS, stereo_width=0.015)
    save("knock_glass", knock(), stereo_width=0.003)
    save("glass_burst", glass_burst(), stereo_width=0.006)
    save("alarm_button", alarm())
    save("cold_wind", cold_wind(), stereo_width=0.01)
