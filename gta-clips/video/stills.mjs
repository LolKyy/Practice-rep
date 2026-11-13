// Стоп-кадры эдита одним бандлом: node stills.mjs <Comp> <outDir> <кадр,кадр,...> [--browser PATH] [--chrome-mode M] [--scale 0.5]
import path from "node:path";
import fs from "node:fs";
import { fileURLToPath } from "node:url";
import { bundle } from "@remotion/bundler";
import { selectComposition, renderStill, ensureBrowser } from "@remotion/renderer";

const [comp, outDir, framesArg, ...rest] = process.argv.slice(2);
const opt = (k, d) => { const i = rest.indexOf(k); return i >= 0 ? rest[i + 1] : d; };
const browserExecutable = opt("--browser", process.env.REMOTION_BROWSER || null);
const chromeMode = opt("--chrome-mode", undefined);
const scale = Number(opt("--scale", 0.5));
const root = path.dirname(fileURLToPath(import.meta.url));
fs.mkdirSync(outDir, { recursive: true });

const serveUrl = await bundle({ entryPoint: path.join(root, "src/index.ts"), publicDir: path.join(root, "public") });
const common = { serveUrl, browserExecutable, chromeMode, chromiumOptions: { gl: "angle" } };
if (!browserExecutable) await ensureBrowser({ chromeMode });
const composition = await selectComposition({ ...common, id: comp });
for (const f of framesArg.split(",").map(Number)) {
  const output = path.join(outDir, `f${String(f).padStart(5, "0")}.jpg`);
  await renderStill({ ...common, composition, frame: f, output, imageFormat: "jpeg", jpegQuality: 88, scale });
  console.log("still", output);
}
