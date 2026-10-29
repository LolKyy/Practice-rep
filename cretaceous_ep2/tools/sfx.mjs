// Синтез звуков и музыки (без лицензий): node tools/sfx.mjs → public/sfx/*.wav, public/music_a.wav, public/music_b.wav
import fs from "node:fs";
import { writeWav } from "./wav.mjs";
const SR = 44100;
let seed = 1; const rnd = () => { seed = (seed * 1664525 + 1013904223) >>> 0; return seed / 4294967296; };
const buf = (sec) => new Float32Array(Math.floor(sec * SR));
const lp = (x, a) => { let y = 0; for (let i = 0; i < x.length; i++) { y += a * (x[i] - y); x[i] = y; } return x; };
const hp = (x, a) => { let y = 0, px = 0; for (let i = 0; i < x.length; i++) { y = a * (y + x[i] - px); px = x[i]; x[i] = y; } return x; };
const norm = (x, p = 0.9) => { let m = 0; for (const v of x) m = Math.max(m, Math.abs(v)); for (let i = 0; i < x.length; i++) x[i] *= p / (m || 1); return x; };
const fade = (x, a = 0.02, b = 0.1) => { const A = a * SR, B = b * SR; for (let i = 0; i < x.length; i++) x[i] *= Math.min(1, i / A, (x.length - i) / B); return x; };
const save = (n, x) => writeWav(`public/sfx/${n}.wav`, [x]);
const noise = (sec) => { const x = buf(sec); for (let i = 0; i < x.length; i++) x[i] = rnd() * 2 - 1; return x; };
fs.mkdirSync("public/sfx", { recursive: true });

// гул двигателя (холостой)
{ const x = buf(7); for (let i = 0; i < x.length; i++) { const t = i / SR; x[i] = Math.sin(2 * Math.PI * 38 * t) * 0.5 + Math.sin(2 * Math.PI * 76 * t + Math.sin(t * 9)) * 0.3 + (rnd() - 0.5) * 0.25; } save("hum", fade(norm(lp(x, 0.05), 0.7), 0.5, 0.5)); }
// крик птерозавра: скрипучий свист вниз
{ const x = buf(1.3); let ph = 0; for (let i = 0; i < x.length; i++) { const t = i / SR; const f = 1900 - t * 900 + Math.sin(t * 60) * 120; ph += f / SR; x[i] = (Math.sin(2 * Math.PI * ph) + 0.5 * Math.sign(Math.sin(2 * Math.PI * ph * 1.5))) * Math.exp(-t * 2) * Math.min(1, t * 30); } save("screech", fade(norm(lp(x, 0.4), 0.6))); }
// треск рвущейся бумаги
{ const x = noise(1.0); for (let i = 0; i < x.length; i++) { const t = i / SR; x[i] *= (rnd() < 0.08 ? 1 : 0.25) * Math.min(1, t * 20) * (1 - t); } save("tear", fade(norm(hp(x, 0.7), 0.8))); }
// вспышка: низкий удар + шипение
{ const x = buf(2.5); for (let i = 0; i < x.length; i++) { const t = i / SR; x[i] = Math.sin(2 * Math.PI * (60 * Math.exp(-t * 3) + 30) * t) * Math.exp(-t * 2) + (rnd() - 0.5) * Math.exp(-t * 3) * 0.6; } save("boom", fade(norm(lp(x, 0.2), 0.9), 0.005, 0.5)); }
// цикады
{ const x = buf(6); for (let i = 0; i < x.length; i++) { const t = i / SR; x[i] = Math.sin(2 * Math.PI * 4800 * t) * (0.5 + 0.5 * Math.sin(2 * Math.PI * 38 * t)) * (0.6 + 0.4 * Math.sin(t * 2.1)) * (rnd() * 0.4 + 0.6); } save("cicadas", fade(norm(x, 0.5), 0.8, 0.8)); }
// дизель: запуск + рёв
{ const x = buf(6.5); for (let i = 0; i < x.length; i++) { const t = i / SR; const f = t < 0.8 ? 18 + t * 30 : 42 + Math.sin(t * 3) * 3; x[i] = (Math.sign(Math.sin(2 * Math.PI * f * t)) * 0.6 + Math.sin(2 * Math.PI * f * 2 * t) * 0.3 + (rnd() - 0.5) * 0.5) * Math.min(1, t * 2); } save("diesel", fade(norm(lp(x, 0.08), 0.8), 0.05, 1)); }
// хруст стеблей
{ const x = noise(0.35); for (let i = 0; i < x.length; i++) x[i] *= (rnd() < 0.05 ? 1 : 0.1) * Math.exp(-i / SR * 8); save("crunch", fade(norm(hp(x, 0.6), 0.7), 0.002)); }
// белый шум рации
{ const x = noise(4.5); for (let i = 0; i < x.length; i++) { const t = i / SR; x[i] *= 0.6 + 0.4 * Math.sin(t * 13) * Math.sin(t * 3.1); } save("static", fade(norm(lp(hp(x, 0.5), 0.5), 0.5), 0.1, 0.05)); }
// писк навигатора
{ const x = buf(0.18); for (let i = 0; i < x.length; i++) { const t = i / SR; x[i] = Math.sin(2 * Math.PI * 1320 * t) * Math.exp(-t * 18); } save("beep", fade(norm(x, 0.5), 0.003)); }
// шорох бумаги
{ const x = noise(0.6); for (let i = 0; i < x.length; i++) { const t = i / SR; x[i] *= (0.3 + 0.7 * Math.abs(Math.sin(t * 25))) * (rnd() < 0.03 ? 2 : 1); } save("paper", fade(norm(hp(x, 0.8), 0.5), 0.05, 0.2)); }
// тук коробки
{ const x = buf(0.12); for (let i = 0; i < x.length; i++) { const t = i / SR; x[i] = (Math.sin(2 * Math.PI * 180 * t) + (rnd() - 0.5) * 0.6) * Math.exp(-t * 45); } save("tuk", fade(norm(lp(x, 0.3), 0.6), 0.001, 0.02)); }
// бульканье
{ const x = buf(1.2); for (let k = 0; k < 9; k++) { const st = Math.floor(rnd() * 0.9 * SR); const f0 = 300 + rnd() * 400; for (let i = 0; i < 0.12 * SR && st + i < x.length; i++) { const t = i / SR; x[st + i] += Math.sin(2 * Math.PI * (f0 + t * 2500) * t) * Math.exp(-t * 30); } } save("glug", fade(norm(x, 0.5))); }
// тиканье
{ const x = buf(6.5); for (let k = 0; k < 13; k++) { const st = Math.floor(k * 0.5 * SR); for (let i = 0; i < 400; i++) x[st + i] += (rnd() - 0.5) * Math.exp(-i / 60) * (k % 2 ? 0.7 : 1); } save("tick", norm(hp(x, 0.6), 0.4)); }
// музыкальный акцент-смешок (пиццикато вверх)
{ const x = buf(0.9); [0, 0.12, 0.24].forEach((st, j) => { const f = [392, 494, 587][j]; for (let i = 0; i < 0.5 * SR; i++) { const t = i / SR; const k = Math.floor(st * SR) + i; if (k < x.length) x[k] += Math.sin(2 * Math.PI * f * t) * Math.exp(-t * 9); } }); save("sting", fade(norm(x, 0.5))); }
// шелест огромных крыльев
{ const x = noise(2.6); for (let i = 0; i < x.length; i++) { const t = i / SR; x[i] *= (0.2 + 0.8 * Math.max(0, Math.sin(t * 6))) * Math.sin(Math.PI * t / 2.6); } save("wings", fade(norm(lp(x, 0.06), 0.8), 0.2, 0.4)); }
// ключ + дизель глохнет
{ const x = buf(3); for (let i = 0; i < x.length; i++) { const t = i / SR; const f = 42 * Math.max(0.1, 1 - t / 1.6); x[i] = t < 0.04 ? (rnd() - 0.5) * 2 : (Math.sign(Math.sin(2 * Math.PI * f * t)) * 0.6 + (rnd() - 0.5) * 0.3) * Math.max(0, 1 - t / 1.8); } save("shutdown", fade(norm(lp(x, 0.1), 0.8), 0.001, 0.3)); }
{ const x = buf(0.15); for (let i = 0; i < x.length; i++) { const t = i / SR; x[i] = (rnd() - 0.5) * Math.exp(-t * 60) + Math.sin(2 * Math.PI * 2500 * t) * Math.exp(-t * 80) * 0.5; } save("click", norm(x, 0.6)); }
// шаг-удар (глухой бас)
{ const x = buf(1.6); for (let i = 0; i < x.length; i++) { const t = i / SR; x[i] = Math.sin(2 * Math.PI * (45 * Math.exp(-t * 4) + 28) * t) * Math.exp(-t * 3) + (rnd() - 0.5) * Math.exp(-t * 25) * 0.4; } save("thud", fade(norm(lp(x, 0.08), 0.95), 0.002, 0.4)); }
// дыхание рекса
{ const x = noise(7.5); for (let i = 0; i < x.length; i++) { const t = i / SR; x[i] *= Math.pow(Math.max(0, Math.sin(t * 2 * Math.PI / 2.4)), 2); } save("breath", fade(norm(lp(x, 0.03), 0.7), 0.5, 0.5)); }
// финальный удар
{ const x = buf(2.2); for (let i = 0; i < x.length; i++) { const t = i / SR; x[i] = Math.sin(2 * Math.PI * (70 * Math.exp(-t * 6) + 36) * t) * Math.exp(-t * 1.6) + (rnd() - 0.5) * Math.exp(-t * 18); } save("hit", fade(norm(lp(x, 0.15), 0.95), 0.001, 0.6)); }

// музыка: A — тревожное «выживание» (0–71 с), B — тёмный дрон (77–101 с)
const music = (dur, root, bpm, drive) => {
  const L = buf(dur), R = buf(dur); const beat = 60 / bpm; const midi = (m) => 440 * Math.pow(2, (m - 69) / 12);
  const prog = [0, -2, -4, -5]; let la = 0, lb = 0;
  for (let i = 0; i < L.length; i++) {
    const t = i / SR; const bar = Math.floor(t / (beat * 4)) % 4; const r = root + prog[bar];
    let s = 0;
    for (const n of [r, r + 3, r + 7]) for (const d of [-0.3, 0.3]) s += (2 * ((t * (midi(n) + d)) % 1) - 1) * 0.06;
    s += Math.sin(2 * Math.PI * midi(r - 12) * t) * 0.35 * (0.7 + 0.3 * Math.pow(0.5, (t % beat) / 0.3));
    if (drive) { const tt = t % (beat / 2); s += Math.sin(2 * Math.PI * midi(r + 12) * t) * Math.exp(-tt * 14) * 0.18; const tk = t % beat; s += Math.sin(2 * Math.PI * (40 * Math.exp(-tk * 30) + 45) * tk) * Math.exp(-tk * 10) * 0.35; }
    la += 0.04 * (s - la); lb += 0.042 * (s - lb);
    const f = Math.min(1, t / 2, (dur - t) / 3); L[i] = la * f; R[i] = lb * f;
  }
  let m = 0; for (const v of L) m = Math.max(m, Math.abs(v)); const g = 0.5 / m; for (let i = 0; i < L.length; i++) { L[i] *= g; R[i] *= g; }
  return [L, R];
};
writeWav("public/music_a.wav", music(72, 50, 92, true));
writeWav("public/music_b.wav", music(25, 45, 60, false));
console.log("ok:", fs.readdirSync("public/sfx").length, "sfx");
