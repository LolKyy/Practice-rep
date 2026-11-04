#!/usr/bin/env node
// Быстрый черновик 720×1280 (scale 2/3), H.264 CRF 28.
// node tools/render-draft.mjs <CompositionId> [--ep epNN] [--out file.mp4] [--frames 0-89]
import { parseArgs, outPath, remotionRender, syncAssets } from "./lib.mjs";

const { pos, flags } = parseArgs(process.argv.slice(2));
const comp = pos[0];
if (!comp) {
  console.error("Использование: node tools/render-draft.mjs <CompositionId> [--ep epNN] [--out file.mp4]");
  process.exit(1);
}
syncAssets();
const out = flags.out || outPath(comp, "draft", flags.ep);
const extra = ["--scale=0.6666667", "--codec=h264", "--crf=28", "--jpeg-quality=70", "--pixel-format=yuv420p"];
if (flags.frames) extra.push(`--frames=${flags.frames}`);
const sec = remotionRender(comp, out, extra);
console.log(`\n[render-draft] готово за ${sec.toFixed(1)} с → ${out}`);
