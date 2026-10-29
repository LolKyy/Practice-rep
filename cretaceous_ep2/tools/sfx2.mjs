// Доп. звуки Ч2 и музыка: node tools/sfx2.mjs
import { writeWav } from "./wav.mjs";
const SR = 44100;
let seed = 7; const rnd = () => { seed = (seed * 1664525 + 1013904223) >>> 0; return seed / 4294967296; };
const buf = (s) => new Float32Array(Math.floor(s * SR));
const lp = (x, a) => { let y = 0; for (let i = 0; i < x.length; i++) { y += a * (x[i] - y); x[i] = y; } return x; };
const hp = (x, a) => { let y = 0, p = 0; for (let i = 0; i < x.length; i++) { y = a * (y + x[i] - p); p = x[i]; x[i] = y; } return x; };
const norm = (x, p = 0.9) => { let m = 0; for (const v of x) m = Math.max(m, Math.abs(v)); for (let i = 0; i < x.length; i++) x[i] *= p / (m || 1); return x; };
const fade = (x, a = 0.01, b = 0.1) => { const A = a * SR, B = b * SR; for (let i = 0; i < x.length; i++) x[i] *= Math.min(1, i / A, (x.length - i) / B); return x; };
const save = (n, x) => writeWav(`public/sfx/${n}.wav`, [x]);
// лай: несколько «гав» разной высоты
{ const x = buf(3.2); for (let k = 0; k < 9; k++) { const st = Math.floor((0.1 + k * 0.33 + rnd() * 0.1) * SR), f0 = 280 + rnd() * 260; for (let i = 0; i < 0.16 * SR; i++) { const t = i / SR; x[st + i] += (Math.sign(Math.sin(2 * Math.PI * (f0 - t * 900) * t)) * 0.5 + (rnd() - 0.5) * 0.6) * Math.exp(-t * 18) * (0.4 + rnd() * 0.6); } } save("bark", fade(norm(lp(x, 0.25), 0.7))); }
// шипение мяса
{ const x = buf(4); for (let i = 0; i < x.length; i++) x[i] = (rnd() - 0.5) * (0.6 + 0.4 * (rnd() < 0.01 ? 2 : 1)); save("sizzle", fade(norm(hp(x, 0.9), 0.4), 0.3, 0.6)); }
// сопение (вдохи носом)
{ const x = buf(2.2); for (let i = 0; i < x.length; i++) { const t = i / SR; x[i] = (rnd() - 0.5) * Math.pow(Math.max(0, Math.sin(t * Math.PI * 2 / 0.55)), 3); } save("sniff", fade(norm(lp(hp(x, 0.8), 0.3), 0.6))); }
// фырк
{ const x = buf(1.0); for (let i = 0; i < x.length; i++) { const t = i / SR; x[i] = ((rnd() - 0.5) + Math.sin(2 * Math.PI * 70 * t) * 0.5 * Math.sin(t * 90)) * Math.exp(-t * 4) * Math.min(1, t * 40); } save("snort", fade(norm(lp(x, 0.15), 0.85))); }
// удаляющиеся шаги
{ const x = buf(3.5); for (let k = 0; k < 5; k++) { const st = Math.floor(k * 0.7 * SR), a = 1 - k * 0.18; for (let i = 0; i < 0.6 * SR; i++) { const t = i / SR; x[st + i] += Math.sin(2 * Math.PI * (40 * Math.exp(-t * 4) + 26) * t) * Math.exp(-t * 4) * a; } } save("steps", fade(norm(lp(x, 0.06), 0.9))); }
// храп
{ const x = buf(4); for (let i = 0; i < x.length; i++) { const t = i / SR; const env = Math.pow(Math.max(0, Math.sin(t * Math.PI * 2 / 2.0)), 2); x[i] = ((rnd() - 0.5) * 0.6 + Math.sign(Math.sin(2 * Math.PI * 55 * t)) * 0.4) * env; } save("snore", fade(norm(lp(x, 0.05), 0.6), 0.2, 0.3)); }
// выстрел-эхо (глухой бум + повторы)
{ const x = buf(3.5); for (const [st, a] of [[0, 1], [0.45, 0.45], [0.95, 0.25], [1.6, 0.12]]) { const o = Math.floor(st * SR); for (let i = 0; i < 1.5 * SR && o + i < x.length; i++) { const t = i / SR; x[o + i] += (Math.sin(2 * Math.PI * (55 * Math.exp(-t * 5) + 30) * t) + (rnd() - 0.5) * Math.exp(-t * 20)) * Math.exp(-t * 3) * a; } } save("boomecho", fade(norm(lp(x, 0.1), 0.9), 0.001, 0.8)); }
// скрип ремня
{ const x = buf(0.7); let ph = 0; for (let i = 0; i < x.length; i++) { const t = i / SR; ph += (900 + Math.sin(t * 40) * 300) / SR; x[i] = (Math.sign(Math.sin(2 * Math.PI * ph)) * (rnd() < 0.3 ? 1 : 0.2)) * Math.sin(Math.PI * t / 0.7); } save("creak", fade(norm(lp(x, 0.3), 0.4))); }
// писк-щелчок пункта
{ const x = buf(0.08); for (let i = 0; i < x.length; i++) { const t = i / SR; x[i] = (rnd() - 0.5) * Math.exp(-t * 90) + Math.sin(2 * Math.PI * 1800 * t) * Math.exp(-t * 70) * 0.4; } save("tick1", norm(x, 0.5)); }
// бас-удар
{ const x = buf(1.4); for (let i = 0; i < x.length; i++) { const t = i / SR; x[i] = Math.sin(2 * Math.PI * (38 * Math.exp(-t * 3) + 30) * t) * Math.exp(-t * 2.5); } save("bass", fade(norm(lp(x, 0.08), 0.95), 0.002, 0.3)); }
// далёкий рёв
{ const x = buf(3); let ph = 0; for (let i = 0; i < x.length; i++) { const t = i / SR; ph += (70 + Math.sin(t * 3) * 15) / SR; x[i] = (Math.sign(Math.sin(2 * Math.PI * ph)) * 0.6 + (rnd() - 0.5) * 0.6) * Math.sin(Math.PI * t / 3); } save("roar_far", fade(norm(lp(x, 0.03), 0.6), 0.3, 0.6)); }
// музыка: день (тревожно) и ночь (дрон)
const music = (dur, root, bpm, drive) => {
  const L = buf(dur), R = buf(dur); const beat = 60 / bpm; const midi = (m) => 440 * Math.pow(2, (m - 69) / 12); const prog = [0, -2, -4, -5]; let la = 0, lb = 0;
  for (let i = 0; i < L.length; i++) { const t = i / SR; const r = root + prog[Math.floor(t / (beat * 4)) % 4]; let s = 0;
    for (const n of [r, r + 3, r + 7]) for (const d of [-0.3, 0.3]) s += (2 * ((t * (midi(n) + d)) % 1) - 1) * 0.06;
    s += Math.sin(2 * Math.PI * midi(r - 12) * t) * 0.35 * (0.7 + 0.3 * Math.pow(0.5, (t % beat) / 0.3));
    if (drive) { const tt = t % (beat / 2); s += Math.sin(2 * Math.PI * midi(r + 12) * t) * Math.exp(-tt * 14) * 0.15; const tk = t % beat; s += Math.sin(2 * Math.PI * (40 * Math.exp(-tk * 30) + 45) * tk) * Math.exp(-tk * 10) * 0.3; }
    la += 0.04 * (s - la); lb += 0.042 * (s - lb); const f = Math.min(1, t / 2, (dur - t) / 3); L[i] = la * f; R[i] = lb * f; }
  let m = 0; for (const v of L) m = Math.max(m, Math.abs(v)); for (let i = 0; i < L.length; i++) { L[i] *= 0.5 / m; R[i] *= 0.5 / m; } return [L, R];
};
writeWav("public/music_a.wav", music(63, 48, 84, true));
writeWav("public/music_b.wav", music(31, 43, 56, false));
console.log("ok");
