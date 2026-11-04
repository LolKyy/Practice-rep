#!/usr/bin/env node
// Копирует ассеты в video/public, чтобы Remotion мог их отдать через staticFile():
//   assets/fonts  -> video/public/fonts
//   assets/sfx    -> video/public/sfx
//   assets/music  -> video/public/music
//   episodes/<ep>/{voice.mp3,timings.json,*.mp3,*.wav,*.json} -> video/public/episodes/<ep>/  (renders/ пропускаем)
// Копируются только изменившиеся файлы. Запускается автоматически из npm-скриптов и tools/render-*.
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const PUB = path.join(ROOT, "video", "public");
let copied = 0;

const copyFile = (src, dst) => {
  const s = fs.statSync(src);
  if (fs.existsSync(dst)) {
    const d = fs.statSync(dst);
    if (d.size === s.size && d.mtimeMs >= s.mtimeMs) return;
  }
  fs.mkdirSync(path.dirname(dst), { recursive: true });
  fs.copyFileSync(src, dst);
  copied++;
};

const copyDir = (src, dst, filter = () => true) => {
  if (!fs.existsSync(src)) return;
  for (const e of fs.readdirSync(src, { withFileTypes: true })) {
    if (e.name.startsWith(".")) continue;
    const s = path.join(src, e.name);
    const d = path.join(dst, e.name);
    if (e.isDirectory()) {
      if (["renders", "src", "casting", "raw", "fx", "frames"].includes(e.name)) continue;
      copyDir(s, d, filter);
    } else if (filter(e.name)) copyFile(s, d);
  }
};

const media = (n) => /\.(mp3|wav|m4a|ogg|json|png|jpg|jpeg|webp|svg|ttf|otf|woff2?)$/i.test(n);
copyDir(path.join(ROOT, "assets", "fonts"), path.join(PUB, "fonts"), (n) => /\.(ttf|otf|woff2?)$/i.test(n));
copyDir(path.join(ROOT, "assets", "sfx"), path.join(PUB, "sfx"), media);
copyDir(path.join(ROOT, "assets", "music"), path.join(PUB, "music"), media);
copyDir(path.join(ROOT, "episodes"), path.join(PUB, "episodes"), media);
console.log(`[sync-assets] обновлено файлов: ${copied}`);
