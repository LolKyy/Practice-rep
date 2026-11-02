// Мягкие звуки Ч3 (всё с плавной атакой и срезанными верхами): node tools/sfx3.mjs
import { writeWav } from "./wav.mjs";
const SR = 44100;
let seed = 11; const rnd = () => { seed = (seed * 1664525 + 1013904223) >>> 0; return seed / 4294967296; };
const buf = (s) => new Float32Array(Math.floor(s * SR));
const lp = (x, a) => { let y = 0; for (let i = 0; i < x.length; i++) { y += a * (x[i] - y); x[i] = y; } return x; };
const hp = (x, a) => { let y = 0, p = 0; for (let i = 0; i < x.length; i++) { y = a * (y + x[i] - p); p = x[i]; x[i] = y; } return x; };
const norm = (x, p = 0.6) => { let m = 0; for (const v of x) m = Math.max(m, Math.abs(v)); for (let i = 0; i < x.length; i++) x[i] *= p / (m || 1); return x; };
const fade = (x, a = 0.02, b = 0.15) => { const A = a * SR, B = b * SR; for (let i = 0; i < x.length; i++) x[i] *= Math.min(1, i / A, (x.length - i) / B); return x; };
const save = (n, x) => writeWav(`public/sfx/${n}.wav`, [x]);
// вжух (нарезка «Ранее»)
{ const x = buf(0.5); for (let i = 0; i < x.length; i++) { const t = i / SR; x[i] = (rnd() - 0.5) * Math.sin(Math.PI * t / 0.5); } save("whoosh", fade(norm(lp(x, 0.12), 0.5), 0.05, 0.1)); }
// капля
{ const x = buf(0.4); for (let i = 0; i < x.length; i++) { const t = i / SR; x[i] = Math.sin(2 * Math.PI * (900 + 900 * Math.exp(-t * 40)) * t) * Math.exp(-t * 22); } save("drip", fade(norm(x, 0.5), 0.004)); }
// щёлканье зубов
{ const x = buf(0.6); for (const st of [0, 0.18, 0.3]) { const o = Math.floor(st * SR); for (let i = 0; i < 0.05 * SR; i++) x[o + i] += (rnd() - 0.5) * Math.exp(-i / SR * 120); } save("teeth", fade(norm(lp(x, 0.4), 0.5), 0.002)); }
// удар по броне (глухой металл)
{ const x = buf(1.4); for (let i = 0; i < x.length; i++) { const t = i / SR; x[i] = (Math.sin(2 * Math.PI * 95 * t) * 0.7 + Math.sin(2 * Math.PI * 233 * t) * 0.35 + Math.sin(2 * Math.PI * 517 * t) * 0.15) * Math.exp(-t * 4) + (rnd() - 0.5) * Math.exp(-t * 40) * 0.5; } save("metalhit", fade(norm(lp(x, 0.25), 0.7), 0.008, 0.3)); }
// когти скребут
{ const x = buf(1.3); let ph = 0; for (let i = 0; i < x.length; i++) { const t = i / SR; ph += (600 + Math.sin(t * 23) * 200) / SR; x[i] = ((rnd() - 0.5) * 0.6 + Math.sin(2 * Math.PI * ph) * 0.3) * (0.5 + 0.5 * Math.abs(Math.sin(t * 9))); } save("scrape", fade(norm(lp(hp(x, 0.7), 0.35), 0.45), 0.08, 0.2)); }
// приземление на крышу
{ const x = buf(0.8); for (let i = 0; i < x.length; i++) { const t = i / SR; x[i] = Math.sin(2 * Math.PI * (60 * Math.exp(-t * 6) + 50) * t) * Math.exp(-t * 7) + (rnd() - 0.5) * Math.exp(-t * 30) * 0.4; } save("roofthump", fade(norm(lp(x, 0.15), 0.7), 0.005, 0.2)); }
// удар в люк
{ const x = buf(1.0); for (let i = 0; i < x.length; i++) { const t = i / SR; x[i] = (Math.sin(2 * Math.PI * 140 * t) * 0.6 + Math.sin(2 * Math.PI * 310 * t) * 0.3) * Math.exp(-t * 6) + (rnd() - 0.5) * Math.exp(-t * 35) * 0.5; } save("hatchhit", fade(norm(lp(x, 0.22), 0.7), 0.006, 0.25)); }
// банка падает в папоротник (мягко)
{ const x = buf(0.35); for (let i = 0; i < x.length; i++) { const t = i / SR; x[i] = Math.sin(2 * Math.PI * (90 * Math.exp(-t * 10) + 60) * t) * Math.exp(-t * 14) + (rnd() - 0.5) * Math.exp(-t * 25) * 0.3; } save("canthud", fade(norm(lp(x, 0.2), 0.6), 0.004, 0.1)); }
// топот стаи
{ const x = buf(2.5); for (let k = 0; k < 16; k++) { const o = Math.floor((k * 0.14 + rnd() * 0.05) * SR); for (let i = 0; i < 0.15 * SR && o + i < x.length; i++) { const t = i / SR; x[o + i] += Math.sin(2 * Math.PI * 70 * t) * Math.exp(-t * 25) * (1 - k / 20); } } save("stomp", fade(norm(lp(x, 0.12), 0.6), 0.02, 0.5)); }
// визг/драка вдали (приглушённо, низкочастотно)
{ const x = buf(2.2); let ph = 0; for (let i = 0; i < x.length; i++) { const t = i / SR; const f = 520 + Math.sin(t * 13) * 160 + Math.sin(t * 3) * 90; ph += f / SR; x[i] = (Math.sin(2 * Math.PI * ph) * 0.5 + (rnd() - 0.5) * 0.4) * Math.max(0, Math.sin(t * 7)) * Math.sin(Math.PI * t / 2.2); } save("squawk", fade(norm(lp(x, 0.1), 0.4), 0.1, 0.4)); }
// птицы на рассвете
{ const x = buf(6); for (let k = 0; k < 14; k++) { const o = Math.floor(rnd() * 5.4 * SR), f0 = 2400 + rnd() * 1600; for (let i = 0; i < 0.22 * SR; i++) { const t = i / SR; x[o + i] += Math.sin(2 * Math.PI * (f0 + Math.sin(t * 60) * 300) * t) * Math.sin(Math.PI * t / 0.22) * 0.5; } } save("birds", fade(norm(lp(x, 0.5), 0.35), 0.5, 0.8)); }
// ветер
{ const x = buf(7); for (let i = 0; i < x.length; i++) x[i] = rnd() - 0.5; lp(x, 0.01); for (let i = 0; i < x.length; i++) x[i] *= 0.6 + 0.4 * Math.sin(i / SR * 0.9); save("wind", fade(norm(x, 0.5), 1, 1)); }
// карандаш
{ const x = buf(1.8); for (let i = 0; i < x.length; i++) { const t = i / SR; x[i] = (rnd() - 0.5) * (0.4 + 0.6 * Math.abs(Math.sin(t * 14))); } save("pencil", fade(norm(lp(hp(x, 0.85), 0.5), 0.3), 0.05, 0.2)); }
// скрип люка
{ const x = buf(1.0); let ph = 0; for (let i = 0; i < x.length; i++) { const t = i / SR; ph += (220 + t * 120) / SR; x[i] = Math.sign(Math.sin(2 * Math.PI * ph)) * (rnd() < 0.35 ? 1 : 0.3) * Math.sin(Math.PI * t); } save("hatchcreak", fade(norm(lp(x, 0.15), 0.35), 0.1, 0.2)); }
console.log("ok");
