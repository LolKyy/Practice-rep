// node tools/still1.mjs <id> <out.png> [scale]
import path from "node:path";
import { bundle } from "@remotion/bundler";
import { renderStill, selectComposition } from "@remotion/renderer";
const ROOT = path.resolve(path.dirname(new URL(import.meta.url).pathname), "..");
const serveUrl = await bundle({ entryPoint: path.join(ROOT, "src/index.ts"), webpackOverride: (c) => ({ ...c, resolve: { ...c.resolve, modules: [path.join(ROOT, "node_modules"), "node_modules"] } }) });
for (const id of process.argv[2].split(",")) {
  const comp = await selectComposition({ serveUrl, id, chromiumOptions: { gl: "swiftshader" } });
  await renderStill({ composition: comp, serveUrl, output: path.join(ROOT, "checks", `${id}.png`), scale: Number(process.argv[3] ?? 0.5), chromiumOptions: { gl: "swiftshader" }, timeoutInMilliseconds: 240000 });
  console.log("ok", id);
}
