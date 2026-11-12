// Сведение: голос (audio/voice.mp3) + мягкие синтезированные звуки → public/audio.mp3
//   node tools/build_audio.mjs
import fs from "node:fs";
import path from "node:path";
import { execFileSync } from "node:child_process";
const ROOT = path.resolve(path.dirname(new URL(import.meta.url).pathname), "..");
const tl = await import(path.join(ROOT, "src/timeline.js"));
tl.setData(JSON.parse(fs.readFileSync(path.join(ROOT, "src/words.json"), "utf8")));
const OUT = path.join(ROOT, "audio");
fs.writeFileSync(path.join(OUT, "sfx.json"), JSON.stringify(tl.sfxList()));
execFileSync("python3", ["-I", path.join(ROOT, "tools/sfx.py"), OUT, String(tl.TOTAL)], { stdio: "inherit" });
const run = (args) => execFileSync("ffmpeg", ["-v", "error", "-y", ...args], { stdio: "inherit" });
run(["-i", path.join(OUT, "voice.mp3"), "-af", "loudnorm=I=-16:TP=-2:LRA=9", "-ar", "44100", "-ac", "2", path.join(OUT, "voice_n.wav")]);
run(["-i", path.join(OUT, "sfx.wav"), "-af", "loudnorm=I=-30:TP=-9:LRA=20", "-ar", "44100", "-ac", "2", path.join(OUT, "sfx_n.wav")]);
// фоновая музыка (если есть audio/music_src.wav): тихо, ~на 15 дБ ниже голоса, плавное начало и конец
const MUS = path.join(OUT, "music_src.wav");
if (fs.existsSync(MUS)) {
  const T = tl.TOTAL;
  run(["-i", MUS, "-t", String(T), "-af", `loudnorm=I=-31:TP=-9:LRA=11,afade=t=in:d=1.2,afade=t=out:st=${(T - 2.5).toFixed(2)}:d=2.5`, "-ar", "44100", "-ac", "2", path.join(OUT, "music_n.wav")]);
  run(["-i", path.join(OUT, "voice_n.wav"), "-i", path.join(OUT, "sfx_n.wav"), "-i", path.join(OUT, "music_n.wav"), "-filter_complex", "[0][1][2]amix=inputs=3:duration=first:normalize=0,loudnorm=I=-14:TP=-1.5:LRA=9", "-ar", "44100", "-b:a", "192k", path.join(ROOT, "public/audio.mp3")]);
} else
run(["-i", path.join(OUT, "voice_n.wav"), "-i", path.join(OUT, "sfx_n.wav"), "-filter_complex", "[0][1]amix=inputs=2:duration=longest:normalize=0,loudnorm=I=-14:TP=-1.5:LRA=9", "-ar", "44100", "-b:a", "192k", path.join(ROOT, "public/audio.mp3")]);
console.log("public/audio.mp3 готов, длина", tl.TOTAL, "с");
