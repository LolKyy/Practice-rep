// Находит доли (удары) в вашем треке, чтобы шаблон эдита резал картинки точно в такт.
//   node tools/beats.mjs public/edit/music.mp3     → src/beats.json  {bpm, beats:[сек...]}
// Только локально (ffmpeg), без интернета.
import fs from "node:fs";
import { execFileSync } from "node:child_process";

const src = process.argv[2] ?? "public/edit/music.mp3";
const SR = 22050, HOP = 512;
const raw = execFileSync("ffmpeg", ["-loglevel", "error", "-i", src, "-ac", "1", "-ar", String(SR), "-f", "f32le", "-"], { maxBuffer: 1 << 30 });
const x = new Float32Array(raw.buffer, raw.byteOffset, raw.length / 4);
// энергия низов+середины по кадрам → положительный прирост (onset)
const n = Math.floor(x.length / HOP), env = new Float32Array(n);
let lp = 0;
for (let i = 0; i < n; i++) { let e = 0; for (let j = 0; j < HOP; j++) { const v = x[i * HOP + j]; lp += 0.15 * (v - lp); e += lp * lp + 0.3 * v * v; } env[i] = Math.log1p(e * 100); }
const flux = new Float32Array(n);
for (let i = 1; i < n; i++) flux[i] = Math.max(0, env[i] - env[i - 1]);
const fps = SR / HOP, W = Math.round(fps * 0.5), beats = [];
let last = -1e9;
for (let i = 1; i < n - 1; i++) {
  let s = 0, c = 0; for (let k = Math.max(0, i - W); k < Math.min(n, i + W); k++) { s += flux[k]; c++; }
  const thr = (s / c) * 1.6 + 0.02;
  if (flux[i] > thr && flux[i] >= flux[i - 1] && flux[i] >= flux[i + 1] && i - last > fps * 0.22) { beats.push(+(i / fps).toFixed(3)); last = i; }
}
// темп: медиана интервалов
const iv = beats.slice(1).map((b, i) => b - beats[i]).sort((a, b) => a - b);
let med = iv[Math.floor(iv.length / 2)] || 0.5; while (med < 0.4) med *= 2; while (med > 0.9) med /= 2;
const bpm = Math.round(60 / med);
fs.writeFileSync("src/beats.json", JSON.stringify({ bpm, beats }, null, 0));
console.log(`найдено ударов: ${beats.length}, темп ≈ ${bpm} BPM → src/beats.json`);
console.log("первые:", beats.slice(0, 12).join("  "));
