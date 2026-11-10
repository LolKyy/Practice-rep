// Сведение: голос (audio/voice.mp3) + мягкие синтезированные звуки → public/audio.mp3
//   node tools/build_audio.mjs
import fs from "node:fs";
import { execFileSync } from "node:child_process";
import path from "node:path";
const ROOT = path.resolve(path.dirname(new URL(import.meta.url).pathname), "..");
const { setData, SFX, TOTAL } = await import(path.join(ROOT, "src/story.js")).then(async (m) => { m.setData(JSON.parse(fs.readFileSync(path.join(ROOT, "src/words.json"), "utf8"))); return { ...m, SFX: m.SFX, TOTAL: m.TOTAL }; });
const OUT = path.join(ROOT, "audio");
fs.writeFileSync(path.join(OUT, "sfx.json"), JSON.stringify(SFX));
execFileSync("python3", ["-I", path.join(ROOT, "tools/sfx.py"), OUT, String(TOTAL)], { stdio: "inherit" });
const run = (args) => execFileSync("ffmpeg", ["-v", "error", "-y", ...args], { stdio: "inherit" });
run(["-i", path.join(OUT, "voice.mp3"), "-af", "loudnorm=I=-16:TP=-2:LRA=9", "-ar", "44100", "-ac", "2", path.join(OUT, "voice_n.wav")]);
run(["-i", path.join(OUT, "sfx.wav"), "-af", "loudnorm=I=-30:TP=-9:LRA=20", "-ar", "44100", "-ac", "2", path.join(OUT, "sfx_n.wav")]);
run(["-i", path.join(OUT, "voice_n.wav"), "-i", path.join(OUT, "sfx_n.wav"), "-filter_complex", "[0][1]amix=inputs=2:duration=longest:normalize=0,loudnorm=I=-14:TP=-1.5:LRA=9", "-ar", "44100", "-b:a", "192k", path.join(ROOT, "public/audio.mp3")]);
console.log("public/audio.mp3 готов, длина", TOTAL.toFixed(1), "с");
