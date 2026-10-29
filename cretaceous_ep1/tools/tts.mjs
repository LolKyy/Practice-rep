// Озвучка Piper (sherpa-onnx), по абзацу = шоту. → public/voice.wav + audio/paras.json (начало/конец каждого абзаца)
//   node tools/tts.mjs [voice] [speed]
import fs from "node:fs";
import path from "node:path";
import os from "node:os";
import { execFileSync } from "node:child_process";
import { createRequire } from "node:module";
import { writeWav } from "./wav.mjs";

const require = createRequire(import.meta.url);
const [, , voice = "ru_RU-dmitri-medium", speed = "1.0"] = process.argv;
const DIR = path.join(os.homedir(), ".paper-theatre", "tts");
const vdir = path.join(DIR, `vits-piper-${voice}`);
if (!fs.existsSync(path.join(vdir, "tokens.txt"))) {
  fs.mkdirSync(DIR, { recursive: true });
  const name = `vits-piper-${voice}.tar.bz2`;
  execFileSync("curl", ["-sL", "-f", "-o", name, `https://github.com/k2-fsa/sherpa-onnx/releases/download/tts-models/${name}`], { cwd: DIR, stdio: "inherit" });
  execFileSync("tar", ["xjf", name], { cwd: DIR, stdio: "inherit" });
  fs.rmSync(path.join(DIR, name), { force: true });
}
const sherpa = require("sherpa-onnx-node");
const onnx = fs.readdirSync(vdir).find((f) => f.endsWith(".onnx"));
const tts = new sherpa.OfflineTts({
  model: { vits: { model: path.join(vdir, onnx), tokens: path.join(vdir, "tokens.txt"), dataDir: path.join(vdir, "espeak-ng-data"),
    noiseScale: 0.55, noiseScaleW: 0.7, lengthScale: 1.0 }, numThreads: 4, provider: "cpu" }, maxNumSentences: 1 });
const paras = fs.readFileSync("script/voice.txt", "utf8").split(/\n\s*\n/).map((p) => p.trim()).filter(Boolean);
const LEAD = 0.15, GAP = 0.65;
const out = [], info = [];
let sr = 22050, t = LEAD;
for (const p of paras) {
  const a = tts.generate({ text: p, sid: 0, speed: Number(speed) });
  sr = a.sampleRate;
  // обрезаем тишину по краям абзаца
  const s = Float32Array.from(a.samples);
  let i0 = 0, i1 = s.length - 1;
  while (i0 < s.length && Math.abs(s[i0]) < 0.01) i0++;
  while (i1 > i0 && Math.abs(s[i1]) < 0.01) i1--;
  const cut = s.slice(Math.max(0, i0 - 200), i1 + 200);
  info.push({ text: p, s: +t.toFixed(3), e: +(t + cut.length / sr).toFixed(3) });
  out.push(cut); t += cut.length / sr + GAP;
}
const total = Math.round((t - GAP + LEAD) * sr);
const all = new Float32Array(total);
let o = Math.round(LEAD * sr);
for (const c of out) { all.set(c, o); o += c.length + Math.round(GAP * sr); }
fs.mkdirSync("audio", { recursive: true });
writeWav("audio/voice_raw.wav", [all], sr);
execFileSync("ffmpeg", ["-y", "-loglevel", "error", "-i", "audio/voice_raw.wav", "-af", "highpass=f=70,acompressor=threshold=-18dB:ratio=3:attack=5:release=80,loudnorm=I=-16:TP=-1.5", "-ar", "44100", "public/voice.wav"]);
fs.writeFileSync("audio/paras.json", JSON.stringify(info, null, 1));
console.log("голос:", (total / sr).toFixed(1), "с");
info.forEach((x, i) => console.log(i + 1, x.s, x.e));
