import path from "node:path";
import { bundle } from "@remotion/bundler";
import { renderStill, selectComposition } from "@remotion/renderer";
const ROOT = process.cwd();
const serveUrl = await bundle({ entryPoint: path.join(ROOT, "src/index.ts"), webpackOverride: (c) => ({ ...c, resolve: { ...c.resolve, modules: [path.join(ROOT, "node_modules"), "node_modules"] } }) });
const comp = await selectComposition({ serveUrl, id: "Cover", chromiumOptions: { gl: "swiftshader" } });
await renderStill({ composition: comp, serveUrl, output: path.join(ROOT, "cover_gta6_hype.png"), chromiumOptions: { gl: "swiftshader" } });
console.log("ok");
