"""Свести голос + песню по кривой громкости и выровнять громкость ЛИНЕЙНО (два прохода loudnorm, без «подтягивания» тихих мест),
затем подклеить к готовому видео (видео не перерендеривается).
  python3 tools/mix-music.py <video_in.mp4> <voice.mp3> <song.mp3> <song_start_s> <keys> <video_out.mp4>
keys: "t:vol,t:vol,…" — громкость песни (0…1) по времени ролика, между точками линейно. Цель −14 LUFS, пик −1,5 dBTP."""
import json, subprocess, sys
vin, voice, song, ss, keys, vout = sys.argv[1:7]
K = [tuple(map(float, p.split(":"))) for p in keys.split(",")]
# кусочно-линейная громкость как выражение ffmpeg
expr = f"{K[-1][1]}"
for (t0, v0), (t1, v1) in reversed(list(zip(K, K[1:]))):
    expr = f"if(lt(t,{t1}),{v0}+({v1}-{v0})*(t-{t0})/({t1}-{t0}+1e-9),{expr})"
expr = f"if(lt(t,{K[0][0]}),{K[0][1]},{expr})"
mix = f"[1:a]volume='{expr}':eval=frame[m];[0:a][m]amix=inputs=2:duration=longest:normalize=0"
dur = subprocess.run(["ffprobe", "-v", "error", "-show_entries", "format=duration", "-of", "csv=p=0", vin], capture_output=True, text=True).stdout.strip()
base = ["ffmpeg", "-v", "error", "-y", "-i", voice, "-ss", ss, "-i", song]
p1 = subprocess.run(["ffmpeg", "-hide_banner", "-i", voice, "-ss", ss, "-i", song, "-filter_complex", mix + ",apad,atrim=0:" + dur + ",loudnorm=I=-14:TP=-1.5:LRA=11:print_format=json", "-f", "null", "-"], capture_output=True, text=True).stderr
m = json.loads(p1[p1.rindex("{"):p1.rindex("}") + 1])
ln = f"loudnorm=I=-14:TP=-1.5:LRA=11:linear=true:measured_I={m['input_i']}:measured_TP={m['input_tp']}:measured_LRA={m['input_lra']}:measured_thresh={m['input_thresh']}:offset={m['target_offset']}"
subprocess.run(base + ["-i", vin, "-filter_complex", mix + ",apad,atrim=0:" + dur + "," + ln + ",aresample=48000[a]", "-map", "2:v", "-map", "[a]", "-c:v", "copy", "-c:a", "aac", "-b:a", "192k", vout], check=True)
print(f"→ {vout} (исходно {m['input_i']} LUFS → −14 линейно)")
