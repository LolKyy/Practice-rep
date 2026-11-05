// node swap1/render/stills.mjs → swap1/style_frames/*.png
import fs from "node:fs";
import path from "node:path";
import { createRequire } from "node:module";
const require = createRequire(import.meta.url);
const { chromium } = require("playwright");
const DIR = path.dirname(new URL(import.meta.url).pathname);
const OUT = path.join(DIR, "..", "style_frames");
fs.mkdirSync(OUT, { recursive: true });
const b = await chromium.launch();
const page = await b.newPage({ viewport: { width: 1080, height: 1920 } });
page.on("pageerror", (e) => { console.error("[pageerror]", e.message); process.exitCode = 1; });
await page.setContent(`<!doctype html><html><head><meta charset="utf-8"><link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Oswald:wght@700&family=Rubik:wght@800;900&family=Caveat:wght@700&display=block">
  <style>html,body{margin:0}</style></head><body><div id="root"></div></body></html>`, { waitUntil: "networkidle" });
for (const f of ["draw.js", "locations.js", process.argv[2] || "style.js"]) await page.addScriptTag({ content: fs.readFileSync(path.join(DIR, f), "utf8") });
await page.evaluate(async () => { await Promise.all(["700 40px Oswald", "900 40px Rubik", "800 40px Rubik", "700 40px Caveat"].map((f) => document.fonts.load(f, "АБВ"))); });
for (const k of await page.evaluate(() => window.STILL_KEYS)) {
  await page.evaluate((k) => window.renderStill(k), k);
  await page.screenshot({ path: path.join(OUT, `${k}.png`) });
  console.log(k);
}
await b.close();
