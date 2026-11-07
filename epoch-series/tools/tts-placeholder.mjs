// ЧЕРНОВАЯ озвучка (Piper через sherpa-onnx), пока нет ElevenLabs. Абзац = шот.
//   node tools/tts-placeholder.mjs episodes/00_showcase [скорость=1.15]
// → voice.wav (+ voice.mp3) и timings.json (слова распределены по слогам внутри абзаца; точные — tools/timings)
import fs from "node:fs"; import path from "node:path"; import os from "node:os"; import { execFileSync } from "node:child_process"; import { createRequire } from "node:module";
const require = createRequire(import.meta.url);
const [, , ep, speed = "1.15", voice = "ru_RU-dmitri-medium"] = process.argv;
const DIR = path.join(os.homedir(), ".paper-theatre", "tts"); const vdir = path.join(DIR, `vits-piper-${voice}`);
if (!fs.existsSync(path.join(vdir, "tokens.txt"))) { fs.mkdirSync(DIR, { recursive: true }); const n = `vits-piper-${voice}.tar.bz2`;
  execFileSync("curl", ["-sL", "-f", "-o", n, `https://github.com/k2-fsa/sherpa-onnx/releases/download/tts-models/${n}`], { cwd: DIR, stdio: "inherit" });
  execFileSync("tar", ["xjf", n], { cwd: DIR }); fs.rmSync(path.join(DIR, n)); }
const sherpa = require("sherpa-onnx-node"); const onnx = fs.readdirSync(vdir).find((f) => f.endsWith(".onnx"));
const tts = new sherpa.OfflineTts({ model: { vits: { model: path.join(vdir, onnx), tokens: path.join(vdir, "tokens.txt"), dataDir: path.join(vdir, "espeak-ng-data"), noiseScale: 0.6, noiseScaleW: 0.75, lengthScale: 1 }, numThreads: 4, provider: "cpu" }, maxNumSentences: 1 });
const paras = fs.readFileSync(path.join(ep, "script.txt"), "utf8").split(/\n\s*\n/).map((p) => p.trim()).filter(Boolean);
const LEAD = 0.1, GAP = 0.3; let sr = 22050, t = LEAD; const chunks = [], words = [], shots = [];
const syl = (w) => Math.max(1, (w.match(/[аеёиоуыэюя0-9]/gi) || []).length);
for (const [i, p] of paras.entries()) {
  const a = tts.generate({ text: p, sid: 0, speed: Number(speed) }); sr = a.sampleRate; const s = Float32Array.from(a.samples);
  let i0 = 0, i1 = s.length - 1; while (i0 < s.length && Math.abs(s[i0]) < 0.01) i0++; while (i1 > i0 && Math.abs(s[i1]) < 0.01) i1--;
  const c = s.slice(Math.max(0, i0 - 150), i1 + 150); const d = c.length / sr;
  const ws = p.split(/\s+/).filter((w) => /[\p{L}\d]/u.test(w)); const tot = ws.reduce((a, w) => a + syl(w) + 0.6, 0); let u = t + 0.05;
  for (const w of ws) { const dd = (d - 0.1) * (syl(w) + 0.6) / tot; words.push({ w, s: +u.toFixed(3), e: +(u + dd * 0.92).toFixed(3), shot: i }); u += dd; }
  shots.push({ i, text: p, s: +t.toFixed(3), e: +(t + d).toFixed(3) }); chunks.push(c); t += d + GAP;
}
const total = t + 0.4; const out = new Float32Array(Math.round(total * sr)); let k = Math.round(LEAD * sr);
for (const c of chunks) { out.set(c, k); k += c.length + Math.round(GAP * sr); }
const buf = Buffer.alloc(44 + out.length * 2); buf.write("RIFF", 0); buf.writeUInt32LE(36 + out.length * 2, 4); buf.write("WAVEfmt ", 8); buf.writeUInt32LE(16, 16); buf.writeUInt16LE(1, 20); buf.writeUInt16LE(1, 22); buf.writeUInt32LE(sr, 24); buf.writeUInt32LE(sr * 2, 28); buf.writeUInt16LE(2, 32); buf.writeUInt16LE(16, 34); buf.write("data", 36); buf.writeUInt32LE(out.length * 2, 40);
for (let j = 0; j < out.length; j++) buf.writeInt16LE(Math.max(-32767, Math.min(32767, Math.round(out[j] * 32767))), 44 + j * 2);
fs.writeFileSync(path.join(ep, "voice.wav"), buf);
fs.writeFileSync(path.join(ep, "timings.json"), JSON.stringify({ source: "placeholder-proportional", duration: +total.toFixed(3), shots, words }, null, 1));
console.log("voice", total.toFixed(2), "s,", words.length, "words");
