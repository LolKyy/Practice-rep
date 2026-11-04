#!/usr/bin/env node
// Финал 1080×1920, H.264 (CRF 18, yuv420p, AAC 320k), затем двухпроходный ffmpeg loudnorm до −14 LUFS / −1 dBTP.
// node tools/render-final.mjs <CompositionId> [--ep epNN] [--out file.mp4] [--lufs -14]
import fs from "node:fs";
import { ffprobeJson, parseArgs, outPath, remotionRender, run, syncAssets } from "./lib.mjs";

const { pos, flags } = parseArgs(process.argv.slice(2));
const comp = pos[0];
if (!comp) {
  console.error("Использование: node tools/render-final.mjs <CompositionId> [--ep epNN] [--out file.mp4] [--lufs -14]");
  process.exit(1);
}
const LUFS = Number(flags.lufs ?? -14);
syncAssets();
const out = flags.out || outPath(comp, "final", flags.ep);
const raw = out.replace(/\.mp4$/, ".raw.mp4");
const sec = remotionRender(comp, raw, [
  "--codec=h264",
  "--crf=18",
  "--pixel-format=yuv420p",
  "--audio-codec=aac",
  "--audio-bitrate=320k",
  "--x264-preset=medium",
]);
console.log(`[render-final] рендер за ${sec.toFixed(1)} с`);

const info = ffprobeJson(raw);
const hasAudio = info.streams.some((s) => s.codec_type === "audio");
let measured = null;
if (hasAudio) {
  const r = run(
    "ffmpeg",
    ["-hide_banner", "-nostats", "-i", raw, "-af", `loudnorm=I=${LUFS}:TP=-1:LRA=11:print_format=json`, "-f", "null", "-"],
    { capture: true },
  );
  const m = r.stderr.match(/\{[\s\S]*?\}/g);
  measured = m ? JSON.parse(m[m.length - 1]) : null;
}

if (!measured || !isFinite(Number(measured.input_i)) || Number(measured.input_i) < -70) {
  console.log("[render-final] звука нет или тишина — loudnorm пропущен");
  fs.renameSync(raw, out);
} else {
  const ln =
    `loudnorm=I=${LUFS}:TP=-1:LRA=11:measured_I=${measured.input_i}:measured_TP=${measured.input_tp}` +
    `:measured_LRA=${measured.input_lra}:measured_thresh=${measured.input_thresh}:offset=${measured.target_offset}:linear=true`;
  const vdur = info.streams.find((s) => s.codec_type === "video").duration;
  run("ffmpeg", ["-hide_banner", "-loglevel", "error", "-y", "-i", raw, "-t", String(vdur), "-c:v", "copy", "-af", ln, "-ar", "48000", "-c:a", "aac", "-b:a", "320k", "-movflags", "+faststart", out]);
  fs.unlinkSync(raw);
  const chk = run("ffmpeg", ["-hide_banner", "-nostats", "-i", out, "-af", "ebur128=peak=true", "-f", "null", "-"], { capture: true }).stderr;
  const I = chk.match(/I:\s+(-?[\d.]+) LUFS/g)?.pop();
  console.log(`[render-final] громкость: было ${measured.input_i} LUFS → стало ${I}`);
}
const v = ffprobeJson(out).streams.find((s) => s.codec_type === "video");
console.log(`[render-final] готово → ${out}  (${v.width}×${v.height}, ${v.codec_name}, ${v.r_frame_rate} fps)`);
