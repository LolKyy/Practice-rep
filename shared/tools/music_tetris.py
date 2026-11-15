# Музыка для «Тетриса» (своя запись, мелодия народная — «Коробейники»):
# 0 → reveal: тихий атмосферный эмбиент (пэд A-минор + редкие мягкие ноты); за 0.35 с до reveal — тишина;
# reveal → конец: «Коробейники» в 8-бит (квадрат-лид, треугольный бас, шумовые хэты).
#   python3 music_tetris.py <out.wav> <total_sec> <reveal_sec>
import sys, numpy as np, wave
out, T, R = sys.argv[1], float(sys.argv[2]), float(sys.argv[3])
SR = 44100; N = int(T * SR); mix = np.zeros(N)
f = lambda n: 440.0 * 2 ** ((n - 69) / 12)
def env(n, a=0.005, r=0.08):
    e = np.ones(n); ka = max(1, int(a * SR)); kr = max(1, int(r * SR)); e[:ka] = np.linspace(0, 1, ka); e[-kr:] *= np.linspace(1, 0, kr); return e
def put(sig, t0, gain):
    i = int(t0 * SR); j = min(N, i + len(sig)); 
    if i < N and j > i: mix[i:j] += sig[: j - i] * gain
# ---------- эмбиент
pad_end = R - 0.35
t = np.arange(int(pad_end * SR)) / SR
pad = np.zeros_like(t)
for n, g in [(45, 1.0), (52, 0.7), (57, 0.45), (60, 0.3)]:   # A2 E3 A3 C4
    for d in (-0.15, 0.15):
        ph = 2 * np.pi * f(n) * (1 + d / 100) * t
        pad += g * (np.sin(ph) + 0.25 * np.sin(2 * ph))
pad *= 0.5 + 0.5 * np.sin(2 * np.pi * t / 7.0) ** 2         # медленное «дыхание»
fade = np.minimum(1, t / 3.0) * np.minimum(1, (pad_end - t) / 1.5)
put(pad * fade, 0, 0.022)
rng = np.random.default_rng(7); notes = [69, 72, 76, 74, 72, 69, 67, 64]
for k, tt in enumerate(np.arange(2.0, pad_end - 2, 1.6)):     # редкие «капли»
    n = notes[k % len(notes)]; L = int(1.4 * SR); x = np.arange(L) / SR
    s = np.sin(2 * np.pi * f(n) * x) * np.exp(-x * 2.2); put(s, tt, 0.035)
# ---------- «Коробейники» 8-бит
bpm = 152; b = 60 / bpm
A = [(76,1),(71,.5),(72,.5),(74,1),(72,.5),(71,.5),(69,1),(69,.5),(72,.5),(76,1),(74,.5),(72,.5),(71,1.5),(72,.5),(74,1),(76,1),(72,1),(69,1),(69,1),(None,1)]
B = [(None,.5),(74,1),(77,.5),(81,1),(79,.5),(77,.5),(76,1.5),(72,.5),(76,1),(74,.5),(72,.5),(71,1),(71,.5),(72,.5),(74,1),(76,1),(72,1),(69,1),(69,1),(None,1)]
mel = A + B
bass_roots = [40, 45, 44, 45, 38, 36, 43, 45, 40, 45, 44, 45]   # E A G# A | D C G A | E A G# A
def sq(fr, L, duty=0.25):
    x = np.arange(L) / SR; return np.where((x * fr) % 1 < duty, 1.0, -1.0)
def tri(fr, L):
    x = np.arange(L) / SR; return 2 * np.abs(2 * ((x * fr) % 1) - 1) - 1
t0 = R
for n, d in mel:
    L = int(d * b * SR)
    if n: put(sq(f(n), L) * env(L, 0.004, 0.05) * 0.9, t0, 0.055)
    t0 += d * b
end_mel = t0
for bar, root in enumerate(bass_roots):
    for k in range(8):
        tt = R + bar * 4 * b + k * 0.5 * b
        if tt >= end_mel: break
        L = int(0.45 * b * SR); put(tri(f(root + (12 if k % 2 else 0)), L) * env(L, 0.003, 0.04), tt, 0.07)
for k in range(int((end_mel - R) / (0.5 * b))):
    L = int(0.06 * SR); nz = rng.uniform(-1, 1, L) * np.exp(-np.arange(L) / SR * 60)
    put(nz, R + k * 0.5 * b, 0.018 if k % 2 else 0.03)
# хвост: мягкое затухание к концу ролика
# долгое мягкое затухание «в ноль»: последние ~6 с по косинусу, к концу совсем тихо
FADE = 6.0; k0 = int(max(R + 2.0, T - FADE) * SR); k1 = int((T - 0.15) * SR)
tail = np.ones(N); x = np.linspace(0, 1, max(1, k1 - k0)); tail[k0:k1] = (0.5 + 0.5 * np.cos(np.pi * x)) ** 1.6; tail[k1:] = 0; mix *= tail
mix = np.clip(mix, -1, 1)
w = wave.open(out, "wb"); w.setnchannels(1); w.setsampwidth(2); w.setframerate(SR); w.writeframes((mix * 32767).astype(np.int16).tobytes()); w.close()
print("music", out, round(T, 2), "s, reveal at", R, "melody ends", round(end_mel, 2))
