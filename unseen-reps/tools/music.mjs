// Тёмная фоновая музыка без лицензий (процедурная) с чётким битом и «дропом».
// До дропа: пад + мягкий удар на каждую долю. После дропа: жёсткий удар, хлопок на 2/4, саб-бас.
//   node tools/music.mjs <сек> [bpm=100] [дроп_сек=9.6]   → public/music.wav
// Вставки/склейки в ролике ставьте на кратные 60/bpm — они совпадут с ударами.
import fs from "node:fs";
const SR = 44100, dur = Number(process.argv[2] ?? 20), bpm = Number(process.argv[3] ?? 100), drop = Number(process.argv[4] ?? 9.6);
const n = Math.floor(dur * SR), L = new Float32Array(n), R = new Float32Array(n);
const midi = (m) => 440 * 2 ** ((m - 69) / 12), beat = 60 / bpm, bar = beat * 4;
const prog = [[45, 48, 52, 55], [41, 45, 48, 52], [43, 47, 50, 55], [40, 43, 47, 52]];
let seed = 7; const rnd = () => ((seed = (seed * 1664525 + 1013904223) >>> 0) / 4294967296);
let lp = 0;
for (let i = 0; i < n; i++) {
  const t = i / SR, ch = prog[Math.floor(t / bar) % 4], post = t >= drop;
  let s = 0;
  for (const m of ch) for (const d of [-0.3, 0.3]) s += Math.sin(2 * Math.PI * (midi(m + 12) + d) * t) * (post ? 0.035 : 0.05);
  // удар на каждую долю
  const tb = t % beat;
  const kick = Math.sin(2 * Math.PI * (55 * Math.exp(-tb * 22) + 42) * tb) * Math.exp(-tb * (post ? 7 : 11));
  s += kick * (post ? 0.95 : 0.4);
  if (post) {
    // хлопок на 2 и 4 + саб-бас корня аккорда
    const bi = Math.floor(t / beat) % 4, tc = t % beat;
    if (bi === 1 || bi === 3) s += (rnd() * 2 - 1) * Math.exp(-tc * 28) * 0.35;
    s += Math.sin(2 * Math.PI * midi(ch[0] - 12) * t) * 0.22 * (0.5 + 0.5 * Math.exp(-tb * 4));
  }
  // «вдох» перед дропом
  if (t > drop - beat * 2 && t < drop) s += (rnd() * 2 - 1) * 0.12 * ((t - (drop - beat * 2)) / (beat * 2));
  lp += 0.12 * (s - lp);
  const fade = Math.min(1, t / 0.8, (dur - t) / 1.5);
  L[i] = lp * fade; R[i] = lp * fade;
}
const buf = Buffer.alloc(44 + n * 4);
buf.write("RIFF", 0); buf.writeUInt32LE(36 + n * 4, 4); buf.write("WAVEfmt ", 8); buf.writeUInt32LE(16, 16); buf.writeUInt16LE(1, 20); buf.writeUInt16LE(2, 22);
buf.writeUInt32LE(SR, 24); buf.writeUInt32LE(SR * 4, 28); buf.writeUInt16LE(4, 32); buf.writeUInt16LE(16, 34); buf.write("data", 36); buf.writeUInt32LE(n * 4, 40);
let peak = 1e-6; for (let i = 0; i < n; i++) peak = Math.max(peak, Math.abs(L[i]));
for (let i = 0; i < n; i++) { buf.writeInt16LE(Math.round((L[i] / peak) * 0.8 * 32767), 44 + i * 4); buf.writeInt16LE(Math.round((R[i] / peak) * 0.8 * 32767), 46 + i * 4); }
fs.mkdirSync("public", { recursive: true }); fs.writeFileSync("public/music.wav", buf);
console.log(`music -> public/music.wav (${dur}s, ${bpm} BPM, drop ${drop}s)`);
