#!/usr/bin/env node
// Бенчмарк рендера: Showcase (5 с, 1080×1920) с разными --gl и --concurrency.
// Пишет таблицу в tools/bench-results.md и выбранный вариант в tools/render.config.json.
// Запускать заново на каждом новом компьютере: node tools/bench-render.mjs [--comp Showcase] [--repeat 2]
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { ROOT, parseArgs, remotionRender, run, syncAssets } from "./lib.mjs";

const { flags } = parseArgs(process.argv.slice(2));
const comp = flags.comp || "Showcase";
const repeat = Number(flags.repeat || 1);
const cores = os.cpus().length;
const half = Math.max(1, Math.round(cores / 2));
const plat = process.platform;
const gpuGl = plat === "linux" ? ["angle", "vulkan", "angle-egl"] : ["angle"];
const gls = [null, ...gpuGl, "swiftshader"];
const variants = [];
for (const gl of gls) for (const c of [half, cores]) variants.push({ gl, concurrency: c });

const gpu = (() => {
  try {
    if (plat === "win32") return run("wmic", ["path", "win32_VideoController", "get", "name"], { capture: true }).stdout.split("\n").slice(1).map((s) => s.trim()).filter(Boolean).join(", ");
    if (plat === "darwin") return (run("system_profiler", ["SPDisplaysDataType"], { capture: true }).stdout.match(/Chipset Model: (.*)/) || [])[1];
    const r = run("sh", ["-c", "lspci 2>/dev/null | grep -iE 'vga|3d|display' || ls /dev/dri 2>/dev/null || echo 'нет данных'"], { capture: true, allowFail: true });
    return r.stdout.trim() || "не найдена";
  } catch {
    return "не определена";
  }
})();

syncAssets();
const tmp = path.join(ROOT, "tools", ".bench");
fs.mkdirSync(tmp, { recursive: true });
const results = [];
for (const v of variants) {
  const times = [];
  let err = null;
  for (let i = 0; i < repeat; i++) {
    const out = path.join(tmp, `bench_${v.gl ?? "default"}_${v.concurrency}.mp4`);
    try {
      times.push(remotionRender(comp, out, ["--codec=h264", "--crf=18", "--pixel-format=yuv420p"], v));
    } catch (e) {
      err = String(e.message).slice(0, 120);
      break;
    }
  }
  const best = times.length ? Math.min(...times) : null;
  results.push({ ...v, times, best, ok: !err && times.length === repeat, err });
  console.log(`[bench] gl=${v.gl ?? "по умолчанию"} concurrency=${v.concurrency}: ${best ? best.toFixed(1) + " с" : "ОШИБКА " + err}`);
}
const ok = results.filter((r) => r.ok).sort((a, b) => a.best - b.best);
const chosen = ok[0];
const fps = (r) => (150 / r.best).toFixed(1);
const date = new Date().toISOString().slice(0, 10);
let md = `# Бенчмарк рендера — ${date}\n\nМашина: ${os.hostname()} · ${plat} · ${os.cpus()[0].model} × ${cores} · RAM ${(os.totalmem() / 2 ** 30).toFixed(0)} ГБ\nВидеокарта: ${gpu}\nКомпозиция: ${comp}, 150 кадров 1080×1920, H.264 CRF 18, повторов: ${repeat}\n\n`;
md += `| --gl | --concurrency | время, с | кадров/с | статус |\n|---|---|---|---|---|\n`;
for (const r of results)
  md += `| ${r.gl ?? "(по умолчанию)"} | ${r.concurrency} | ${r.best ? r.best.toFixed(1) : "—"} | ${r.best ? fps(r) : "—"} | ${r.ok ? (r === chosen ? "**ВЫБРАН**" : "ok") : "ошибка: " + r.err} |\n`;
md += `\nВыбрано: gl=${chosen?.gl ?? "(по умолчанию)"}, concurrency=${chosen?.concurrency}.\n`;
fs.writeFileSync(path.join(ROOT, "tools", "bench-results.md"), md);
if (chosen) {
  fs.writeFileSync(
    path.join(ROOT, "tools", "render.config.json"),
    JSON.stringify({ gl: chosen.gl, concurrency: chosen.concurrency, measuredOn: `${os.hostname()} ${plat} ${date}`, seconds: Number(chosen.best.toFixed(1)) }, null, 2) + "\n",
  );
}
console.log("\n" + md);
