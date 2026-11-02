// Мягкие звуки Ч4 + музыка: node tools/sfx4.mjs
import { writeWav } from "./wav.mjs";
const SR = 44100;
let seed = 21; const rnd = () => { seed = (seed * 1664525 + 1013904223) >>> 0; return seed / 4294967296; };
const buf = (s) => new Float32Array(Math.floor(s * SR));
const lp = (x, a) => { let y = 0; for (let i = 0; i < x.length; i++) { y += a * (x[i] - y); x[i] = y; } return x; };
const hp = (x, a) => { let y = 0, p = 0; for (let i = 0; i < x.length; i++) { y = a * (y + x[i] - p); p = x[i]; x[i] = y; } return x; };
const norm = (x, p = 0.6) => { let m = 0; for (const v of x) m = Math.max(m, Math.abs(v)); for (let i = 0; i < x.length; i++) x[i] *= p / (m || 1); return x; };
const fade = (x, a = 0.02, b = 0.15) => { const A = a * SR, B = b * SR; for (let i = 0; i < x.length; i++) x[i] *= Math.min(1, i / A, (x.length - i) / B); return x; };
const save = (n, x) => writeWav(`public/sfx/${n}.wav`, [x]);
{ const x = buf(10); for (let i = 0; i < x.length; i++) x[i] = rnd() - 0.5; lp(x, 0.06); hp(x, 0.98); for (let i = 0; i < x.length; i++) x[i] *= 0.7 + 0.3 * Math.sin(i / SR * 1.7); save("river", fade(norm(x, 0.5), 1, 1)); }
{ const x = buf(1.6); for (let i = 0; i < x.length; i++) { const t = i / SR; x[i] = (rnd() - 0.5) * Math.exp(-t * 3) * Math.min(1, t * 30); } save("splash", fade(norm(lp(x, 0.2), 0.6), 0.01, 0.4)); }
{ const x = buf(2.0); let ph = 0; for (let i = 0; i < x.length; i++) { const t = i / SR; const f = 85 + Math.sin(t * 5) * 12 - t * 15; ph += f / SR; x[i] = (2 * (ph % 1) - 1) * 0.6 * Math.sin(Math.PI * t / 2.0) + (rnd() - 0.5) * 0.25 * Math.sin(Math.PI * t / 2.0); } save("bellow", fade(norm(lp(x, 0.05), 0.6), 0.15, 0.4)); }
{ const x = buf(0.25); for (let i = 0; i < x.length; i++) { const t = i / SR; x[i] = (rnd() - 0.5) * Math.exp(-t * 40) + Math.sin(2 * Math.PI * 220 * t) * Math.exp(-t * 30) * 0.5; } save("chop", fade(norm(lp(x, 0.3), 0.5), 0.003, 0.05)); }
{ const x = buf(4); for (let i = 0; i < x.length; i++) x[i] = (rnd() < 0.002 ? (rnd() - 0.5) * 2 : 0) + (rnd() - 0.5) * 0.05; save("crackle", fade(norm(lp(x, 0.35), 0.35), 0.3, 0.5)); }
{ const x = buf(2.5); for (let i = 0; i < x.length; i++) { const t = i / SR; x[i] = (rnd() - 0.5) * (0.3 + 0.7 * Math.abs(Math.sin(t * 11))) * Math.sin(Math.PI * t / 2.5); } save("rustle", fade(norm(lp(hp(x, 0.7), 0.25), 0.35), 0.2, 0.4)); }
{ const pat = [[0, 0.08], [0.15, 0.08], [0.3, 0.24], [0.7, 0.08], [0.85, 0.24], [1.15, 0.24], [1.55, 0.08], [1.7, 0.08], [1.85, 0.24]]; const x = buf(2.3); for (const [st, d] of pat) { const o = Math.floor(st * SR); for (let i = 0; i < d * SR; i++) { const t = i / SR; x[o + i] = Math.sin(2 * Math.PI * 760 * t) * Math.min(1, t * 200, (d - t) * 200); } } save("morse", norm(x, 0.35)); }
{ const x = buf(2); for (let i = 0; i < x.length; i++) { const t = i / SR; x[i] = Math.sin(2 * Math.PI * (32 + 6 * Math.sin(t * 4)) * t) * 0.6 + (rnd() - 0.5) * 0.15; } save("engine_low", fade(norm(lp(x, 0.05), 0.5), 0.3, 0.3)); }
const midi = (m) => 440 * Math.pow(2, (m - 69) / 12);
const music = (dur, root, bpm, maj, drive) => { const L = buf(dur), R = buf(dur); const beat = 60 / bpm; const prog = maj ? [0, 5, -3, 7] : [0, -2, -4, -5]; let la = 0, lb = 0;
  for (let i = 0; i < L.length; i++) { const t = i / SR; const r = root + prog[Math.floor(t / (beat * 4)) % 4]; let s = 0; for (const n of (maj ? [r, r + 4, r + 7] : [r, r + 3, r + 7])) for (const d of [-0.3, 0.3]) s += (2 * ((t * (midi(n) + d)) % 1) - 1) * 0.06;
    s += Math.sin(2 * Math.PI * midi(r - 12) * t) * 0.3 * (0.7 + 0.3 * Math.pow(0.5, (t % beat) / 0.3)); if (drive) { const tk = t % beat; s += Math.sin(2 * Math.PI * (40 * Math.exp(-tk * 30) + 45) * tk) * Math.exp(-tk * 10) * 0.2; }
    la += 0.03 * (s - la); lb += 0.032 * (s - lb); const f = Math.min(1, t / 2, (dur - t) / 3); L[i] = la * f; R[i] = lb * f; }
  let m = 0; for (const v of L) m = Math.max(m, Math.abs(v)); for (let i = 0; i < L.length; i++) { L[i] *= 0.5 / m; R[i] *= 0.5 / m; } return [L, R]; };
writeWav("public/music_a.wav", music(106, 50, 84, true, true)); writeWav("public/music_b.wav", music(34, 45, 66, false, false));
console.log("ok");
