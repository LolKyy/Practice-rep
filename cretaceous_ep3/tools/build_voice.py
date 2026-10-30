# Сборка голоса Ч3: рассказчик + 5 реплик Ворона (эффект рации) + новая фраза шота 12.
# → public/voice.wav, audio/timeline.json (где какой кусок), script/voice_full.srt (субтитры всей дорожки)
import json, subprocess, os
S = "script"
def run(*a): subprocess.run(a, check=True)
def dur(f): return float(subprocess.check_output(["ffprobe", "-v", "error", "-show_entries", "format=duration", "-of", "csv=p=0", f]).decode())
def cut(src, a, b, out, gain=0.0):
    run("ffmpeg", "-y", "-loglevel", "error", "-i", src, "-af", f"atrim={a}:{b},asetpts=N/SR/TB,afade=t=in:d=0.02,afade=t=out:st={max(0, b - a - 0.04)}:d=0.04,volume={gain}dB", "-ar", "44100", "-ac", "1", out)
def radio(src, a, b, out):
    d = b - a + 0.7
    run("ffmpeg", "-y", "-loglevel", "error", "-i", src,
        "-f", "lavfi", "-i", f"anoisesrc=color=white:amplitude=0.035:duration={d}",
        "-f", "lavfi", "-i", f"aevalsrc='if(lt(random(0),0.0012),(random(1)-0.5)*1.2,0)':s=44100:d={d}",
        "-f", "lavfi", "-i", f"anoisesrc=color=pink:amplitude=0.22:duration={d}",
        "-filter_complex",
        f"[0:a]atrim={a}:{b},asetpts=N/SR/TB,aresample=44100,aformat=channel_layouts=mono,adelay=350,apad=pad_dur=0.35,"
        "highpass=f=300,highpass=f=300,lowpass=f=3000,lowpass=f=3000,acompressor=threshold=-20dB:ratio=5:attack=3:release=60,volume=2.0,alimiter=limit=0.8[v];"
        "[1:a]highpass=f=300,lowpass=f=3500[n];[2:a]highpass=f=500,lowpass=f=4000[c];"
        f"[3:a]highpass=f=400,lowpass=f=3500,volume='if(lt(t,0.28)+gt(t,{d - 0.28}),1,0)':eval=frame[sq];"
        "[v][n][c][sq]amix=inputs=4:duration=first:normalize=0,afade=t=in:d=0.02,afade=t=out:st=" + str(d - 0.05) + ":d=0.05[o]",
        "-map", "[o]", "-ac", "1", "-ar", "44100", out)
def silence(sec, out):
    run("ffmpeg", "-y", "-loglevel", "error", "-f", "lavfi", "-i", f"anullsrc=r=44100:cl=mono", "-t", str(sec), out)
M, V, L = f"{S}/voice_main.mp3", f"{S}/voron_all.mp3", f"{S}/line12_zapisyvaesh.mp3"
T = "audio/parts"; os.makedirs(T, exist_ok=True)
# (тип, файл-источник, начало, конец) — main: рассказчик, voron: рация, line: новая фраза
plan = [("main", M, 0.0, 35.3), ("gap", 0.3), ("voron", V, 0.0, 6.62), ("gap", 0.3),
        ("main", M, 35.45, 38.45), ("gap", 0.25), ("voron", V, 6.95, 10.76), ("gap", 0.3),
        ("main", M, 38.55, 70.5), ("line", L, 0.0, 3.68), ("gap", 0.3), ("voron", V, 11.02, 15.66), ("gap", 0.3),
        ("main", M, 72.25, 74.4), ("gap", 0.15), ("voron", V, 16.18, 20.07), ("gap", 0.35),
        ("main", M, 74.45, 76.55), ("gap", 0.2), ("voron", V, 21.5, 28.78), ("gap", 0.45),
        ("main", M, 76.6, dur(M))]
files, tl, t = [], [], 0.0
for i, p in enumerate(plan):
    f = f"{T}/p{i:02d}.wav"
    if p[0] == "gap": silence(p[1], f)
    elif p[0] == "voron": radio(p[1], p[2], p[3], f)
    else: cut(p[1], p[2], p[3], f, -3.8 if p[0] == "line" else 0.0)
    d = dur(f)
    if p[0] != "gap": tl.append({"kind": p[0], "src_a": p[2], "src_b": p[3], "t0": round(t, 3), "t1": round(t + d, 3), "pre": 0.35 if p[0] == "voron" else 0.0})
    files.append(f); t += d
with open(f"{T}/list.txt", "w") as fh: fh.writelines(f"file '{os.path.basename(f)}'\n" for f in files)
run("ffmpeg", "-y", "-loglevel", "error", "-f", "concat", "-safe", "0", "-i", f"{T}/list.txt", "-ar", "44100", "public/voice.wav")
json.dump(tl, open("audio/timeline.json", "w"), ensure_ascii=False, indent=1)
# субтитры всей дорожки: переносим сегменты srt из источников на новую шкалу
def rd(p):
    out = []
    for b in open(p, encoding="utf8").read().strip().split("\n\n"):
        l = b.strip().split("\n"); a, c = l[1].split(" --> ")
        ts = lambda s: (lambda h, m, r: int(h) * 3600 + int(m) * 60 + float(r.replace(",", ".")))(*s.split(":"))
        out.append([ts(a), ts(c), " ".join(l[2:])])
    return out
src = {"main": rd(f"{S}/voice.srt"), "voron": rd(f"{S}/voron_all.srt"), "line": rd(f"{S}/line12_zapisyvaesh.srt")}
# основной srt склеил «Голос старый и спокойный: Лисицын шепчет…» и «Ворон снова на связи: Лисицын спрашивает…» — делим по паузам
fix = []
for a, b, x in src["main"]:
    if x.startswith("Голос старый"): fix += [[33.52, 35.14, "Голос старый и спокойный:"], [35.62, 38.26, "Лисицын шепчет в ответ: «Как их прогнать?»"]]
    elif x.startswith("Ворон снова"): fix += [[72.38, 74.15, "Лисицын спрашивает: «Вы кто?»"]]   # «Ворон снова на связи:» заменено новой фразой
    else: fix.append([a, b, x])
src["main"] = fix
segs = []
for p in tl:
    for a, b, x in src[p["kind"]]:
        m = (a + b) / 2
        if p["src_a"] - 0.05 <= m <= p["src_b"] + 0.05:
            segs.append([round(p["t0"] + p["pre"] + a - p["src_a"], 3), round(p["t0"] + p["pre"] + b - p["src_a"], 3), x, p["kind"]])
segs.sort()
f = lambda x: "%02d:%02d:%02d,%03d" % (x // 3600, x % 3600 // 60, int(x % 60), round((x % 1) * 1000) % 1000)
open(f"{S}/voice_full.srt", "w", encoding="utf8").write("\n\n".join(f"{i+1}\n{f(a)} --> {f(b)}\n{x}" for i, (a, b, x, k) in enumerate(segs)) + "\n")
json.dump(segs, open("audio/segs.json", "w"), ensure_ascii=False, indent=0)
print("голос:", round(t, 2), "с;", len(segs), "сегментов")
for a, b, x, k in segs: print(f"{a:6.2f} {b:6.2f} {k:5} {x}")
