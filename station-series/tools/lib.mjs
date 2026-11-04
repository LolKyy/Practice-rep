// Общие функции для скриптов tools/*.mjs
import { spawnSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

export const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
export const VIDEO = path.join(ROOT, "video");
const IS_WIN = process.platform === "win32";

export const run = (cmd, args, opts = {}) => {
  const r = spawnSync(cmd, args, { stdio: opts.capture ? "pipe" : "inherit", encoding: "utf8", shell: IS_WIN, ...opts });
  if (r.status !== 0 && !opts.allowFail) {
    if (opts.capture) process.stderr.write((r.stdout || "") + (r.stderr || ""));
    throw new Error(`Команда упала (${r.status}): ${cmd} ${args.join(" ")}`);
  }
  return r;
};

export const parseArgs = (argv) => {
  const pos = [];
  const flags = {};
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (a.startsWith("--")) {
      const [k, v] = a.slice(2).split("=");
      if (v !== undefined) flags[k] = v;
      else if (argv[i + 1] && !argv[i + 1].startsWith("--")) flags[k] = argv[++i];
      else flags[k] = true;
    } else pos.push(a);
  }
  return { pos, flags };
};

export const renderConfig = () => {
  const p = path.join(ROOT, "tools", "render.config.json");
  const def = { gl: null, concurrency: null };
  return fs.existsSync(p) ? { ...def, ...JSON.parse(fs.readFileSync(p, "utf8")) } : def;
};

export const syncAssets = () => run(process.execPath, [path.join(ROOT, "tools", "sync-assets.mjs")]);

/** Рендер композиции Remotion. extra — дополнительные флаги CLI. */
export const remotionRender = (comp, out, extra = [], { gl, concurrency } = renderConfig()) => {
  const args = ["remotion", "render", "src/index.ts", comp, out, "--log=error"];
  if (gl) args.push(`--gl=${gl}`);
  if (concurrency) args.push(`--concurrency=${concurrency}`);
  args.push(...extra);
  const t0 = Date.now();
  run(IS_WIN ? "npx.cmd" : "npx", args, { cwd: VIDEO });
  return (Date.now() - t0) / 1000;
};

export const outPath = (comp, suffix, ep) => {
  const dir = ep ? path.join(ROOT, "episodes", ep, "renders") : path.join(VIDEO, "out");
  fs.mkdirSync(dir, { recursive: true });
  return path.join(dir, `${comp}_${suffix}.mp4`);
};

export const ffprobeJson = (file) =>
  JSON.parse(
    run("ffprobe", ["-v", "error", "-print_format", "json", "-show_format", "-show_streams", file], { capture: true })
      .stdout,
  );
