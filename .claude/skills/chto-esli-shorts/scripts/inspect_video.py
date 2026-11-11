# «Просмотр» видео за один вызов: лист кадров + расшифровка речи + базовые замеры звука.
#   python3 -I inspect_video.py <video> [out_dir] [--frames 12]
# Выход: <out_dir>/<имя>_sheet.jpg (сетка 6×N кадров с таймкодами) и текст речи в stdout.
import sys, os, subprocess, re, wave, json
import numpy as np

args = [a for a in sys.argv[1:] if not a.startswith("--")]
VIDEO = args[0]
OUT = args[1] if len(args) > 1 else os.path.join(os.environ.get("TMPDIR", "/tmp"), "inspect")
NF = int(sys.argv[sys.argv.index("--frames") + 1]) if "--frames" in sys.argv else 12
MODELS = os.environ.get("MODELS", os.path.expanduser("~/models"))
os.makedirs(OUT, exist_ok=True)
name = re.sub(r"[^\w-]", "_", os.path.splitext(os.path.basename(VIDEO))[0])[:40]

probe = json.loads(subprocess.run(["ffprobe", "-v", "error", "-show_entries", "format=duration:stream=codec_type,width,height", "-of", "json", VIDEO], capture_output=True, text=True).stdout)
dur = float(probe["format"]["duration"])
vs = [s for s in probe["streams"] if s.get("codec_type") == "video"]
print(f"длительность {dur:.1f} с, кадр {vs[0]['width']}×{vs[0]['height']}" if vs else f"длительность {dur:.1f} с, без видео")

if vs:
    sheet = os.path.join(OUT, f"{name}_sheet.jpg")
    cols = 6
    vf = (f"fps={NF}/{dur},scale=288:-2,drawtext=text='%{{pts\\:hms}}':x=6:y=6:fontsize=18:fontcolor=white:box=1:boxcolor=black@0.6,"
          f"tile={cols}x{(NF + cols - 1) // cols}")
    r = subprocess.run(["ffmpeg", "-v", "error", "-y", "-i", VIDEO, "-vf", vf, "-frames:v", "1", sheet])
    if r.returncode:  # без drawtext (нет шрифта) — просто сетка
        subprocess.run(["ffmpeg", "-v", "error", "-y", "-i", VIDEO, "-vf", f"fps={NF}/{dur},scale=288:-2,tile={cols}x{(NF + cols - 1) // cols}", "-frames:v", "1", sheet], check=True)
    print("кадры:", sheet)

lufs = subprocess.run(["ffmpeg", "-hide_banner", "-i", VIDEO, "-af", "ebur128", "-f", "null", "-"], capture_output=True, text=True).stderr
m = re.findall(r"I:\s+(-?[\d.]+) LUFS", lufs)
raw = subprocess.run(["ffmpeg", "-v", "error", "-i", VIDEO, "-ac", "1", "-ar", "16000", "-f", "s16le", "-"], capture_output=True).stdout
if not raw:
    sys.exit(0)
x = np.frombuffer(raw, np.int16).astype(np.float32) / 32768
# высота голоса (грубо) и доля речи
fr, hop, f0, act = 640, 160, [], 0
for i in range(0, len(x) - fr, hop):
    s = x[i:i + fr]
    if np.sqrt((s ** 2).mean()) < 0.02: continue
    act += 1; s = s - s.mean(); ac = np.correlate(s, s, "full")[fr - 1:]; k = 40 + int(np.argmax(ac[40:228]))
    if ac[k] > 0.45 * ac[0]: f0.append(16000 / k)
print(f"громкость {m[-1] if m else '?'} LUFS, голос ~{np.median(f0):.0f} Гц, звук активен {100 * act * hop / len(x):.0f}% времени" if f0 else "")

M = f"{MODELS}/sherpa-onnx-zipformer-ru-2024-09-18"
if not os.path.isdir(M):
    print("нет модели распознавания — запусти scripts/setup.sh"); sys.exit(0)
import sherpa_onnx
rec = sherpa_onnx.OfflineRecognizer.from_transducer(encoder=f"{M}/encoder.int8.onnx", decoder=f"{M}/decoder.int8.onnx",
    joiner=f"{M}/joiner.int8.onnx", tokens=f"{M}/tokens.txt", num_threads=4)
print("речь:")
step = 16000 * 12
for a in range(0, len(x), step):
    st = rec.create_stream(); st.accept_waveform(16000, x[a:a + step]); rec.decode_stream(st)
    if st.result.text.strip(): print(f"  [{a // 16000 // 60}:{a // 16000 % 60:02d}] {st.result.text.strip()}")
