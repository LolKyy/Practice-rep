// Пословные тайминги без SRT: локальное распознавание (sherpa-onnx, русский zipformer).
//   node tools/asr.mjs <audio.mp3> <out.json>   → [{t, s, e}] + печать текста
// Запись режется по паузам на куски ≤ 20 с, каждый распознаётся отдельно, время сдвигается.
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { execFileSync } from "node:child_process";
import { createRequire } from "node:module";
const require = createRequire(import.meta.url);
const sherpa = require(path.resolve("../cretaceous_ep1/node_modules/sherpa-onnx-node"));
const [, , src, out] = process.argv;
const M = path.join(os.homedir(), ".paper-theatre/asr/sherpa-onnx-small-zipformer-ru-2024-09-18");
const rec = new sherpa.OfflineRecognizer({
  featConfig: { sampleRate: 16000, featureDim: 80 },
  modelConfig: { transducer: { encoder: `${M}/encoder.onnx`, decoder: `${M}/decoder.onnx`, joiner: `${M}/joiner.onnx` }, tokens: `${M}/tokens.txt`, numThreads: 4, provider: "cpu" },
  decodingMethod: "greedy_search",
});
const wav = path.join(os.tmpdir(), "asr16k.wav");
execFileSync("ffmpeg", ["-y", "-loglevel", "error", "-i", src, "-ar", "16000", "-ac", "1", wav]);
const w = sherpa.readWave(wav); const SR = w.sampleRate, S = w.samples;
// паузы: окна 20 мс с низкой энергией подряд ≥ 0,25 с
const win = Math.round(SR * 0.02), quiet = [];
for (let i = 0; i + win < S.length; i += win) { let e = 0; for (let k = 0; k < win; k++) e += S[i + k] * S[i + k]; quiet.push(Math.sqrt(e / win) < 0.008); }
const cuts = [0]; let run = 0;
for (let j = 0; j < quiet.length; j++) { run = quiet[j] ? run + 1 : 0; const t = j * 0.02; if (run === 12 && t - cuts[cuts.length - 1] > 6) cuts.push(t - 0.12); else if ((t - cuts[cuts.length - 1] > 12 && run > 2) || t - cuts[cuts.length - 1] > 15) cuts.push(t); }
cuts.push(S.length / SR);
const words = [];
for (let c = 0; c + 1 < cuts.length; c++) {
  const a = Math.floor(cuts[c] * SR), b = Math.floor(cuts[c + 1] * SR);
  const st = rec.createStream(); st.acceptWaveform({ sampleRate: SR, samples: S.subarray(a, b) }); rec.decode(st);
  const r = rec.getResult(st);
  r.tokens.forEach((tok, i) => { const t = cuts[c] + r.timestamps[i];
    if (tok.startsWith("▁") || tok.startsWith(" ") || !words.length || words[words.length - 1].c !== c) words.push({ t: tok.replace("▁", "").trim(), s: +t.toFixed(2), e: +(t + 0.1).toFixed(2), c });
    else { words[words.length - 1].t += tok; words[words.length - 1].e = +(t + 0.1).toFixed(2); } });
}
for (let i = 0; i + 1 < words.length; i++) words[i].e = Math.min(words[i + 1].s, words[i].e + 0.6);
fs.writeFileSync(out, JSON.stringify(words.map(({ t, s, e }) => ({ t, s, e }))));
console.log(words.length, "слов,", cuts.length - 1, "кусков");
console.log(words.map((x) => x.t).join(" "));
