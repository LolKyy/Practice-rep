// Тёмная фоновая музыка без лицензий (процедурная): пад + глухой бас-удар. Для черновиков/YouTube.
//   node tools/music.mjs <сек> [bpm]   → public/music.wav
import fs from "node:fs";
const SR = 44100, dur = Number(process.argv[2] ?? 15), bpm = Number(process.argv[3] ?? 70);
const n = Math.floor(dur * SR), L = new Float32Array(n), R = new Float32Array(n);
const midi = (m) => 440 * 2 ** ((m - 69) / 12), beat = 60 / bpm, bar = beat * 4;
const prog = [[45, 48, 52, 55], [41, 45, 48, 52], [43, 47, 50, 55], [40, 43, 47, 52]];
let lp = 0;
for (let i = 0; i < n; i++) {
  const t = i / SR, ch = prog[Math.floor(t / bar) % 4];
  let s = 0;
  for (const m of ch) for (const d of [-0.3, 0.3]) s += Math.sin(2 * Math.PI * (midi(m + 12) + d) * t) * 0.05;
  s *= 0.7 + 0.3 * Math.sin(t * 0.5);
  const tb = t % (beat * 2);
  s += Math.sin(2 * Math.PI * (40 * Math.exp(-tb * 18) + 38) * tb) * Math.exp(-tb * 5) * 0.55;
  lp += 0.08 * (s - lp);
  const fade = Math.min(1, t / 1.2, (dur - t) / 1.5);
  L[i] = lp * fade; R[i] = lp * fade;
}
const buf = Buffer.alloc(44 + n * 4);
buf.write("RIFF", 0); buf.writeUInt32LE(36 + n * 4, 4); buf.write("WAVEfmt ", 8); buf.writeUInt32LE(16, 16); buf.writeUInt16LE(1, 20); buf.writeUInt16LE(2, 22);
buf.writeUInt32LE(SR, 24); buf.writeUInt32LE(SR * 4, 28); buf.writeUInt16LE(4, 32); buf.writeUInt16LE(16, 34); buf.write("data", 36); buf.writeUInt32LE(n * 4, 40);
let peak = 1e-6; for (let i = 0; i < n; i++) peak = Math.max(peak, Math.abs(L[i]));
for (let i = 0; i < n; i++) { buf.writeInt16LE(Math.round((L[i] / peak) * 0.6 * 32767), 44 + i * 4); buf.writeInt16LE(Math.round((R[i] / peak) * 0.6 * 32767), 46 + i * 4); }
fs.mkdirSync("public", { recursive: true }); fs.writeFileSync("public/music.wav", buf); console.log("music -> public/music.wav");
