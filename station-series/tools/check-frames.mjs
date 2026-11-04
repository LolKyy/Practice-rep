#!/usr/bin/env node
// Стоп-кадры для проверки: 0 с, 2 с, середина, последняя секунда → PNG.
// Плюс автопроверки: пустой/чёрный кадр, яркие пиксели (текст) у самого края кадра.
// node tools/check-frames.mjs <video.mp4> [outDir] [--at 0,2,5.5]
import fs from "node:fs";
import path from "node:path";
import { ffprobeJson, parseArgs, run } from "./lib.mjs";

const { pos, flags } = parseArgs(process.argv.slice(2));
const file = pos[0];
if (!file || !fs.existsSync(file)) {
  console.error("Использование: node tools/check-frames.mjs <video.mp4> [outDir] [--at 0,2,5.5]");
  process.exit(1);
}
const outDir = pos[1] || path.join(path.dirname(file), "frames", path.basename(file, path.extname(file)));
fs.mkdirSync(outDir, { recursive: true });
const info = ffprobeJson(file);
const v = info.streams.find((s) => s.codec_type === "video");
const dur = Number(info.format.duration);
const W = v.width;
const H = v.height;
const times = flags.at
  ? String(flags.at).split(",").map(Number)
  : [0, Math.min(2, dur - 0.1), dur / 2, Math.max(0, dur - 0.5)];
const names = flags.at ? times.map((t) => `t${t}s`) : ["00_start", "01_2s", "02_middle", "03_last"];

// статистика яркости по области: возвращает {min, max, avg}
const stats = (png, crop) => {
  const vf = (crop ? `crop=${crop},` : "") + "format=gray,signalstats,metadata=print:file=-";
  const r = run("ffmpeg", ["-hide_banner", "-loglevel", "error", "-i", png, "-vf", vf, "-f", "null", "-"], { capture: true });
  const g = (k) => Number(r.stdout.match(new RegExp(`lavfi.signalstats.${k}=([\\d.]+)`))?.[1]);
  return { min: g("YMIN"), max: g("YMAX"), avg: g("YAVG") };
};

const edge = Math.max(4, Math.round(W * 0.008)); // ~8 px на 1080
const strips = {
  верх: `${W}:${edge}:0:0`,
  низ: `${W}:${edge}:0:${H - edge}`,
  лево: `${edge}:${H}:0:0`,
  право: `${edge}:${H}:${W - edge}:0`,
};
let problems = 0;
console.log(`Видео: ${file}\n${W}×${H}, ${dur.toFixed(2)} с, ${v.r_frame_rate} fps\n`);
times.forEach((t, i) => {
  const png = path.join(outDir, `${names[i]}.png`);
  run("ffmpeg", ["-hide_banner", "-loglevel", "error", "-y", "-ss", t.toFixed(3), "-i", file, "-frames:v", "1", png]);
  const s = stats(png);
  const notes = [];
  if (s.max - s.min < 12) notes.push("ПУСТОЙ/ОДНОТОННЫЙ КАДР");
  for (const [side, crop] of Object.entries(strips)) {
    const e = stats(png, crop);
    if (e.max > 200) notes.push(`яркое у края: ${side} (возможно, текст за краем)`);
  }
  problems += notes.length;
  console.log(`${t.toFixed(2).padStart(6)} с → ${png}  яркость ср.${s.avg.toFixed(0)}  ${notes.length ? "⚠ " + notes.join("; ") : "OK"}`);
});
console.log(problems ? `\n⚠ Найдено замечаний: ${problems}. Посмотри PNG глазами.` : "\nАвтопроверка: OK. Всё равно посмотри PNG глазами (кириллица, наложения).");
