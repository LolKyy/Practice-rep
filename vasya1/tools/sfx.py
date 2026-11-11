# Синтез мягких звуков (без сэмплов и лицензий) и раскладка по таймлайну out/sfx.json → out/sfx.wav
#   python3 sfx.py <out_dir> <total_seconds>
import sys, json, wave
import numpy as np

SR = 44100
rng = np.random.default_rng(7)
OUT, TOTAL = sys.argv[1], float(sys.argv[2])

def t(d): return np.arange(int(d * SR)) / SR
def env(n, a=0.008, r=None):
    """мягкая атака a сек, экспоненциальный спад до конца"""
    e = np.ones(n); na = max(1, int(a * SR)); e[:na] = np.linspace(0, 1, na) ** 2
    rest = n - na
    if rest > 0: e[na:] = np.exp(-np.linspace(0, 5 if r is None else r, rest))
    return e
def lowpass(x, fc):
    a = np.exp(-2 * np.pi * fc / SR); y = np.empty_like(x); s = 0.0
    for i, v in enumerate(x): s = (1 - a) * v + a * s; y[i] = s
    return y
def highpass(x, fc): return x - lowpass(x, fc)
def sweep(f0, f1, d, curve=1.0):
    tt = t(d); f = f0 + (f1 - f0) * (tt / d) ** curve
    return np.sin(2 * np.pi * np.cumsum(f) / SR)
def noise(d): return rng.standard_normal(int(d * SR))
def hann(n): return np.sin(np.linspace(0, np.pi, n)) ** 2

def pop():    x = sweep(900, 280, 0.09, 0.6); return x * env(len(x), 0.004, 6) * 0.8
def bloop():  x = sweep(280, 720, 0.14, 1.5); return x * env(len(x), 0.006, 3) * 0.7
def ding(f=1320):
    tt = t(0.9); x = np.sin(2 * np.pi * f * tt) + 0.35 * np.sin(2 * np.pi * f * 1.5 * tt) + 0.15 * np.sin(2 * np.pi * f * 2 * tt)
    return x * env(len(x), 0.005, 6) * 0.35
def cash():   a = ding(1568); b = ding(2093); y = np.zeros(len(a) + 3500); y[:len(a)] += a; y[3500:] += b; return y * 0.8
def swish(d=0.28):
    n = noise(d); x = highpass(lowpass(n, 3500), 500) * hann(len(n)); return x * 0.5
def whoosh(): x = lowpass(noise(0.6), 1400) * hann(int(0.6 * SR)); return x * 1.4
def pff():    x = lowpass(noise(0.25), 1800) * env(int(0.25 * SR), 0.02, 4); return x * 0.9
def puff():   x = lowpass(noise(0.4), 1100) * env(int(0.4 * SR), 0.015, 4); return x * 1.4
def bul():
    y = np.zeros(int(0.45 * SR))
    for i in range(4):
        f0 = 250 + rng.random() * 200; b = sweep(f0, f0 * 2.4, 0.07, 1.6) * env(int(0.07 * SR), 0.005, 3) * 0.6
        o = int(i * 0.1 * SR); y[o:o + len(b)] += b
    return y
def click():  x = lowpass(noise(0.02), 4000) * env(int(0.02 * SR), 0.001, 6); return x * 0.6
def tick():   x = sweep(1800, 1600, 0.03) * env(int(0.03 * SR), 0.002, 7); return x * 0.35
def beep():
    b = np.sin(2 * np.pi * 1000 * t(0.09)) * hann(int(0.09 * SR)) * 0.25; y = np.zeros(int(0.25 * SR)); y[:len(b)] += b; y[int(0.13 * SR):int(0.13 * SR) + len(b)] += b; return y
def flutter():
    tt = t(0.9); x = lowpass(noise(0.9), 2500) * (0.5 + 0.5 * np.sin(2 * np.pi * 22 * tt)) * hann(len(tt)); return x * 0.35
def strain():
    tt = t(0.9); f = 120 + 6 * np.sin(2 * np.pi * 7 * tt); x = np.sign(np.sin(2 * np.pi * np.cumsum(f) / SR)) * 0.5
    return lowpass(x, 600) * hann(len(tt)) * 0.5
def thud():   x = sweep(140, 55, 0.18, 0.5) * env(int(0.18 * SR), 0.004, 4); return (x + lowpass(noise(0.18), 300) * env(int(0.18 * SR), 0.002, 8) * 0.6) * 0.9
def stamp():  return thud() * 1.1
def crunch():
    n = int(0.35 * SR); x = np.zeros(n)
    for _ in range(40): i = rng.integers(0, n - 200); x[i:i + 200] += rng.standard_normal(200) * np.exp(-np.linspace(0, 6, 200))
    return lowpass(x, 2200) * hann(n) * 0.8
def tremble(): tt = t(0.7); x = np.sin(2 * np.pi * 95 * tt) * (0.6 + 0.4 * np.sin(2 * np.pi * 14 * tt)); return x * hann(len(tt)) * 0.3
def laser():
    tt = t(1.5); f = 820 - 120 * tt / 1.5 + 25 * np.sin(2 * np.pi * 9 * tt)
    x = np.sin(2 * np.pi * np.cumsum(f) / SR) + 0.3 * np.sin(4 * np.pi * np.cumsum(f) / SR)
    e = np.minimum(1, tt / 0.05) * np.minimum(1, (1.5 - tt) / 0.3); return lowpass(x, 3000) * e * 0.22
def boom():
    x = sweep(75, 38, 0.8, 0.5) * env(int(0.8 * SR), 0.012, 4); nz = lowpass(noise(0.8), 250) * env(int(0.8 * SR), 0.01, 5)
    return (x + nz * 0.5) * 1.0
def riser():
    tt = t(1.3); x = lowpass(noise(1.3), 2500) * 0.4 + sweep(200, 900, 1.3, 1.5) * 0.25; return x * (tt / 1.3) ** 2 * 0.8
def flash():
    w = whoosh()[::-1] * 0.7; b = boom() * 0.6; y = np.zeros(len(w) + len(b)); y[:len(w)] += w; y[len(w) - 2000:len(w) - 2000 + len(b)] += b; return y

KIND = dict(pop=pop, bloop=bloop, huh=bloop, ding=ding, cash=cash, swish=swish, whoosh=whoosh, pff=pff, puff=puff, bul=bul, click=click,
            tick=tick, beep=beep, flutter=flutter, strain=strain, thud=thud, stamp=stamp, crunch=crunch, tremble=tremble, laser=laser,
            boom=boom, riser=riser, flash=flash)
ev = json.load(open(f"{OUT}/sfx.json"))
track = np.zeros(int((TOTAL + 2) * SR))
for e in ev:
    x = KIND[e["k"]]() * e.get("v", 1)
    x = x * np.minimum(1, np.linspace(0, len(x) / SR, len(x)) / 0.006)  # ещё раз смягчаем атаку
    o = int(e["t"] * SR); track[o:o + len(x)] += x[:len(track) - o]
track = track[:int(TOTAL * SR)]
track /= max(1e-9, np.abs(track).max()) / 0.7
with wave.open(f"{OUT}/sfx.wav", "w") as w:
    w.setnchannels(1); w.setsampwidth(2); w.setframerate(SR); w.writeframes((track * 32767).astype(np.int16).tobytes())
print("sfx.wav", len(ev), "событий")
