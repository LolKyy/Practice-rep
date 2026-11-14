// Контрольные кадры: середина каждого шота (или список секунд) → checks/sNN.jpg + листы checks/sheetN.jpg
//   node tools/stills.mjs [секунды через запятую]
import path from "node:path";
import fs from "node:fs";
import { execFileSync } from "node:child_process";
import { bundle } from "@remotion/bundler";
import { renderStill, selectComposition } from "@remotion/renderer";
const ROOT = path.resolve(path.dirname(new URL(import.meta.url).pathname), "..");
// общий движок в ../shared/remotion: его импорты ищем в node_modules этого ролика (как в remotion.config.ts)
const serveUrl = await bundle({ entryPoint: path.join(ROOT, "src/index.ts"),
  webpackOverride: (c) => ({ ...c, resolve: { ...c.resolve, modules: [path.join(ROOT, "node_modules"), "node_modules"] } }) });
let shots = null;
const comp = await selectComposition({ serveUrl, id: "Gta6Hype", chromiumOptions: { gl: "swiftshader" },
  onBrowserLog: (l) => { if (l.text.startsWith("SHOTS ")) shots = JSON.parse(l.text.slice(6)); } });
let secs;
if (process.argv[2]) secs = process.argv[2].split(",").map(Number);
else secs = shots.map(([a, b]) => (a + b) / 2);
fs.mkdirSync(path.join(ROOT, "checks"), { recursive: true });
const files = [];
for (const [i, s] of secs.entries()) {
  const f = path.join(ROOT, "checks", `s${String(i + 1).padStart(2, "0")}.jpg`);
  await renderStill({ composition: comp, serveUrl, output: f, frame: Math.min(comp.durationInFrames - 1, Math.round(s * 30)), scale: 0.4, imageFormat: "jpeg", chromiumOptions: { gl: "swiftshader" } });
  files.push(f); process.stdout.write(`${i + 1} `);
}
// листы по 10 кадров с подписями
for (let k = 0; k < files.length; k += 10) {
  const part = files.slice(k, k + 10);
  const inputs = part.flatMap((f) => ["-i", f]);
  const lab = part.map((_, j) => `[${j}]drawtext=fontfile=/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf:text='${k + j + 1}  ${secs[k + j].toFixed(1)}s':x=6:y=6:fontsize=22:fontcolor=yellow:box=1:boxcolor=black@0.7[v${j}]`).join(";");
  const pad = part.length < 10 ? `;color=black:s=432x768[bk]` : "";
  const ins = part.map((_, j) => `[v${j}]`).join("") + (part.length < 10 ? "[bk]".repeat(0) : "");
  execFileSync("ffmpeg", ["-v", "error", "-y", ...inputs, "-filter_complex", `${lab};${ins}xstack=inputs=${part.length}:layout=${part.map((_, j) => `${(j % 5) * 432}_${Math.floor(j / 5) * 768}`).join("|")}:fill=black`, path.join(ROOT, "checks", `sheet${k / 10 + 1}.jpg`)]);
}
console.log("\nготово");
