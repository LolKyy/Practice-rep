// Звуки Ч5: удар по брёвнам, скрип блока ворот, скрип ветряка, далёкий рык. Мягко, с плавной атакой.
import { writeWav } from "./wav.mjs";
const SR = 44100;
let seed = 31; const rnd = () => { seed = (seed * 1664525 + 1013904223) >>> 0; return seed / 4294967296; };
const buf = (s) => new Float32Array(Math.floor(s * SR));
const lp = (x, a) => { let y = 0; for (let i = 0; i < x.length; i++) { y += a * (x[i] - y); x[i] = y; } return x; };
const norm = (x, p = 0.6) => { let m = 0; for (const v of x) m = Math.max(m, Math.abs(v)); for (let i = 0; i < x.length; i++) x[i] *= p / (m || 1); return x; };
const fade = (x, a = 0.02, b = 0.15) => { const A = a * SR, B = b * SR; for (let i = 0; i < x.length; i++) x[i] *= Math.min(1, i / A, (x.length - i) / B); return x; };
const save = (n, x) => writeWav(`public/sfx/${n}.wav`, [x]);
{ const x = buf(0.9); for (let i = 0; i < x.length; i++) { const t = i / SR; x[i] = (Math.sin(2 * Math.PI * 120 * t) * 0.6 + Math.sin(2 * Math.PI * 260 * t) * 0.25) * Math.exp(-t * 9) + (rnd() - 0.5) * Math.exp(-t * 30) * 0.7; } save("woodhit", fade(norm(lp(x, 0.25), 0.7), 0.004, 0.2)); }
{ const x = buf(1.6); let ph = 0; for (let i = 0; i < x.length; i++) { const t = i / SR; ph += (180 + Math.sin(t * 7) * 60) / SR; x[i] = (Math.sign(Math.sin(2 * Math.PI * ph)) * (rnd() < 0.4 ? 1 : 0.3)) * Math.sin(Math.PI * t / 1.6); } save("pulley", fade(norm(lp(x, 0.12), 0.35), 0.1, 0.3)); }
{ const x = buf(4); let ph = 0; for (let i = 0; i < x.length; i++) { const t = i / SR; ph += (300 + Math.sin(t * 4.4) * 90) / SR; x[i] = Math.sin(2 * Math.PI * ph) * Math.pow(Math.max(0, Math.sin(t * 4.4)), 6) * 0.6 + (rnd() - 0.5) * 0.05; } save("windmill", fade(norm(lp(x, 0.2), 0.3), 0.3, 0.4)); }
{ const x = buf(2.6); let ph = 0; for (let i = 0; i < x.length; i++) { const t = i / SR; ph += (60 + Math.sin(t * 3) * 12) / SR; x[i] = (2 * (ph % 1) - 1) * 0.6 * Math.sin(Math.PI * t / 2.6) + (rnd() - 0.5) * 0.2 * Math.sin(Math.PI * t / 2.6); } save("roar_dist", fade(norm(lp(x, 0.03), 0.5), 0.3, 0.6)); }
const midi = (m) => 440 * Math.pow(2, (m - 69) / 12);
const music = (dur, root, bpm, maj, drive) => { const L = buf(dur), R = buf(dur); const beat = 60 / bpm; const prog = maj ? [0, 5, -3, 7] : [0, -2, -4, -5]; let la = 0, lb = 0;
  for (let i = 0; i < L.length; i++) { const t = i / SR; const r = root + prog[Math.floor(t / (beat * 4)) % 4]; let s = 0; for (const n of (maj ? [r, r + 4, r + 7] : [r, r + 3, r + 7])) for (const d of [-0.3, 0.3]) s += (2 * ((t * (midi(n) + d)) % 1) - 1) * 0.06;
    s += Math.sin(2 * Math.PI * midi(r - 12) * t) * 0.3 * (0.7 + 0.3 * Math.pow(0.5, (t % beat) / 0.3)); if (drive) { const tk = t % beat; s += Math.sin(2 * Math.PI * (40 * Math.exp(-tk * 30) + 45) * tk) * Math.exp(-tk * 10) * 0.25; }
    la += 0.03 * (s - la); lb += 0.032 * (s - lb); const f = Math.min(1, t / 1, (dur - t) / 2); L[i] = la * f; R[i] = lb * f; }
  let m = 0; for (const v of L) m = Math.max(m, Math.abs(v)); for (let i = 0; i < L.length; i++) { L[i] *= 0.5 / m; R[i] *= 0.5 / m; } return [L, R]; };
writeWav("public/music_a.wav", music(26, 45, 120, false, true)); writeWav("public/music_b.wav", music(75, 50, 60, false, false));
console.log("ok");
