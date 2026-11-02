# Голос Ч5: рассказчик + 4 реплики Ворона вживую (тёплый реверб, без рации) + замена «Котов листает» на «Ты листаешь».
# → public/voice.wav, public/endcard_voice.wav, audio/timeline.json
import json, subprocess, os
S = "script"; T = "audio/parts"; os.makedirs(T, exist_ok=True)
def run(*a): subprocess.run(a, check=True)
def dur(f): return float(subprocess.check_output(["ffprobe", "-v", "error", "-show_entries", "format=duration", "-of", "csv=p=0", f]).decode())
M, V, L = f"{S}/voice_main.mp3", f"{S}/voron_all.mp3", f"{S}/line_listaesh.mp3"
# нормализация источников: рассказчик −16 LUFS, Ворон −17.5 LUFS
run("ffmpeg", "-y", "-loglevel", "error", "-i", M, "-af", "volume='if(between(t,15.0,16.05),0.668,1)':eval=frame,volume='if(between(t,16.6,17.3)+between(t,66.6,68.2),1.334,1)':eval=frame", "-ar", "44100", "-ac", "1", f"{T}/m_raw.wav")
run("ffmpeg", "-y", "-loglevel", "error", "-i", f"{T}/m_raw.wav", "-af", "loudnorm=I=-16:TP=-1.5:LRA=11", "-ar", "44100", "-ac", "1", f"{T}/m.wav")
run("ffmpeg", "-y", "-loglevel", "error", "-i", L, "-af", "loudnorm=I=-16:TP=-1.5:LRA=11", "-ar", "44100", "-ac", "1", f"{T}/l.wav")
run("ffmpeg", "-y", "-loglevel", "error", "-i", V, "-af", "atrim=0:27.68,asetpts=N/SR/TB,atempo=1.05,loudnorm=I=-17.5:TP=-2:LRA=11,lowpass=f=7500,aecho=0.85:0.55:38|67:0.16|0.10", "-ar", "44100", "-ac", "1", f"{T}/v.wav")
k = 1 / 1.05
def cut(src, a, b, out, gain=0.0):
    run("ffmpeg", "-y", "-loglevel", "error", "-i", src, "-af", f"atrim={a}:{b},asetpts=N/SR/TB,afade=t=in:d=0.02,afade=t=out:st={max(0, b - a - 0.05)}:d=0.05,volume={gain}dB", "-ar", "44100", "-ac", "1", out)
def gap(sec, out): run("ffmpeg", "-y", "-loglevel", "error", "-f", "lavfi", "-i", "anullsrc=r=44100:cl=mono", "-t", str(sec), out)
VW = f"{T}/v.wav"
plan = [("main", 0.0, 29.9), ("gap", 0.3), ("voron", 0.0, 3.85 * k), ("gap", 0.35),
        ("main", 30.0, 32.55), ("gap", 0.3), ("voron", 4.70 * k, 15.78 * k), ("gap", 0.4),
        ("main", 32.6, 60.85), ("gap", 0.3), ("voron", 16.42 * k, 25.58 * k), ("gap", 0.45),
        ("line", 0.0, 5.75), ("gap", 0.3), ("main", 66.4, 68.4), ("gap", 0.35), ("voron", 26.08 * k, 27.68 * k + 0.25, 2.5), ("gap", 0.6)]
files, tl, t = [], [], 0.0
for i, p in enumerate(plan):
    f = f"{T}/p{i:02d}.wav"
    if p[0] == "gap": gap(p[1], f)
    else:
        src = {"main": f"{T}/m.wav", "voron": VW, "line": f"{T}/l.wav"}[p[0]]
        cut(src, p[1], p[2], f, p[3] if len(p) > 3 else 0.0)
    d = dur(f)
    if p[0] != "gap": tl.append({"kind": p[0], "t0": round(t, 3), "t1": round(t + d, 3)})
    files.append(f); t += d
open(f"{T}/list.txt", "w").writelines(f"file '{os.path.basename(f)}'\n" for f in files)
run("ffmpeg", "-y", "-loglevel", "error", "-f", "concat", "-safe", "0", "-i", f"{T}/list.txt", "-ar", "44100", "public/voice.wav")
cut(f"{T}/m.wav", 68.45, dur(f"{T}/m.wav"), "public/endcard_voice.wav")
json.dump(tl, open("audio/timeline.json", "w"), indent=1)
print("голос:", round(t, 2), "с"); [print(x) for x in tl]
