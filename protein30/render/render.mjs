// Рендер ролика: SVG-кадры в Chromium (Playwright) → ffmpeg.
//   node render/render.mjs stills 1.0,12.5,60     — PNG-кадры в out/stills
//   node render/render.mjs video [--preview] [--from 0 --to 20]  — out/video_raw.mp4 (без звука) + out/sfx.json
import fs from "node:fs";
import path from "node:path";
import { spawn } from "node:child_process";
import { createRequire } from "node:module";
const require = createRequire(import.meta.url);
const { chromium } = require("playwright");

const ROOT = path.resolve(path.dirname(new URL(import.meta.url).pathname), "..");
const OUT = path.join(ROOT, "out");
fs.mkdirSync(path.join(OUT, "stills"), { recursive: true });
const args = process.argv.slice(2);
const mode = args[0] || "stills";
const opt = (k, d) => { const i = args.indexOf(k); return i >= 0 ? args[i + 1] : d; };
const preview = args.includes("--preview");
const FPS = Number(opt("--fps", 30));

const data = fs.readFileSync(path.join(ROOT, "audio/words.json"), "utf8");
const fontsCss = "https://fonts.googleapis.com/css2?family=Oswald:wght@700&family=Rubik:wght@800;900&family=Caveat:wght@700&display=block";
const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1080, height: 1920 }, deviceScaleFactor: preview ? 0.5 : 1 });
page.on("console", (m) => { if (m.type() === "warning" || m.type() === "error") console.log("[page]", m.text()); });
page.on("pageerror", (e) => { console.error("[pageerror]", e.message); process.exitCode = 1; });
await page.setContent(`<!doctype html><html><head><meta charset="utf-8"><link rel="stylesheet" href="${fontsCss}">
  <style>html,body{margin:0;background:#000;overflow:hidden}#root svg{display:block}</style></head><body><div id="root"></div></body></html>`, { waitUntil: "networkidle" });
await page.addScriptTag({ content: `window.DATA = ${data};` });
await page.addScriptTag({ content: fs.readFileSync(path.join(ROOT, "render/draw.js"), "utf8") });
await page.addScriptTag({ content: fs.readFileSync(path.join(ROOT, "render/scene.js"), "utf8") });
await page.evaluate(async () => {
  await Promise.all(["700 40px Oswald", "900 40px Rubik", "800 40px Rubik", "700 40px Caveat"].map((f) => document.fonts.load(f, "АБВ")));
  await document.fonts.ready;
});
const TOTAL = await page.evaluate(() => window.TOTAL);
fs.writeFileSync(path.join(OUT, "sfx.json"), JSON.stringify(await page.evaluate(() => window.SFX), null, 1));
fs.writeFileSync(path.join(OUT, "shots.json"), JSON.stringify(await page.evaluate(() => window.START)));

if (mode === "stills") {
  const times = (args[1] || "1").split(",").map(Number);
  for (const t of times) {
    await page.evaluate((t) => window.renderFrame(t), t);
    const f = path.join(OUT, "stills", `t${t.toFixed(2).padStart(6, "0")}.png`);
    await page.screenshot({ path: f });
    console.log("still", f);
  }
} else {
  const from = Number(opt("--from", 0)), to = Math.min(TOTAL, Number(opt("--to", TOTAL)));
  const n = Math.round((to - from) * FPS);
  const outFile = path.join(OUT, preview ? "video_preview_raw.mp4" : "video_raw.mp4");
  const ff = spawn("ffmpeg", ["-v", "error", "-y", "-f", "image2pipe", "-framerate", String(FPS), "-c:v", "mjpeg", "-i", "-",
    "-c:v", "libx264", "-preset", preview ? "veryfast" : "medium", "-crf", preview ? "26" : "18", "-pix_fmt", "yuv420p", "-r", String(FPS), outFile], { stdio: ["pipe", "inherit", "inherit"] });
  const t0 = Date.now();
  for (let i = 0; i < n; i++) {
    const t = from + i / FPS;
    await page.evaluate((t) => window.renderFrame(t), t);
    const buf = await page.screenshot({ type: "jpeg", quality: preview ? 80 : 92 });
    if (!ff.stdin.write(buf)) await new Promise((r) => ff.stdin.once("drain", r));
    if (i % 150 === 0) console.log(`кадр ${i}/${n}  ${((Date.now() - t0) / 1000).toFixed(0)}s`);
  }
  ff.stdin.end();
  await new Promise((r) => ff.on("close", r));
  console.log("готово", outFile, `${((Date.now() - t0) / 1000).toFixed(0)}s`);
}
await browser.close();
