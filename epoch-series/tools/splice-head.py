"""Заменить начало дубля ElevenLabs началом другого дубля (тот же текст), шов — в паузе перед словом-якорем.
  python3 tools/splice-head.py <base_cache.json> <donor_cache.json> <якорь>
Пример: «Сёме прилетел» плохо в новом дубле → берём из прошлого до слова «Двадцать».
Оригинал base сохраняется как *.orig.json; затем пересобрать озвучку tools/tts-v3.py (возьмёт исправленный кэш)."""
import base64, json, subprocess, sys, shutil, pathlib
base_f, donor_f, anchor = pathlib.Path(sys.argv[1]), pathlib.Path(sys.argv[2]), sys.argv[3]
orig = base_f.with_suffix(".orig.json")
if not orig.exists(): shutil.copy(base_f, orig)
B, D = json.loads(orig.read_text()), json.loads(donor_f.read_text())
def cut_t(r):
    a = r["alignment"]; j = "".join(a["characters"]); k = j.index(anchor)
    return k, (a["character_end_times_seconds"][k - 2] + a["character_start_times_seconds"][k]) / 2
kb, tb = cut_t(B); kd, td = cut_t(D)
assert "".join(B["alignment"]["characters"])[:kb] == "".join(D["alignment"]["characters"])[:kd], "начало текста в дублях не совпадает"
SR = 44100
pcm = lambda r: subprocess.run(["ffmpeg", "-v", "error", "-i", "-", "-f", "s16le", "-ac", "1", "-ar", str(SR), "-"], input=base64.b64decode(r["audio_base64"]), capture_output=True, check=True).stdout
pb, pd = pcm(B), pcm(D); fade = int(0.02 * SR)
import array
a = array.array("h", pd[:int(td * SR) * 2]); b = array.array("h", pb[int(tb * SR) * 2:])
for i in range(fade): a[-fade + i] = int(a[-fade + i] * (1 - i / fade)); b[i] = int(b[i] * (i / fade))  # микро-кроссфейд в тишине
mp3 = subprocess.run(["ffmpeg", "-v", "error", "-f", "s16le", "-ac", "1", "-ar", str(SR), "-i", "-", "-f", "mp3", "-b:a", "192k", "-"], input=a.tobytes() + b.tobytes(), capture_output=True, check=True).stdout
dA, bA = D["alignment"], B["alignment"]; sh = td - tb
al = {"characters": dA["characters"][:kd] + bA["characters"][kb:],
      "character_start_times_seconds": dA["character_start_times_seconds"][:kd] + [x + sh for x in bA["character_start_times_seconds"][kb:]],
      "character_end_times_seconds": dA["character_end_times_seconds"][:kd] + [x + sh for x in bA["character_end_times_seconds"][kb:]]}
base_f.write_text(json.dumps({"audio_base64": base64.b64encode(mp3).decode(), "alignment": al, "spliced_from": donor_f.name, "anchor": anchor}))
print(f"шов: донор до {td:.2f} с, база с {tb:.2f} с; файл {base_f.name} исправлен (оригинал {orig.name})")
