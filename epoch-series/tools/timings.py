"""faster-whisper → timings.json: слова с s/e + привязка к шотам (абзацы script.txt).
Текст слов берём из script.txt (а не из распознавания), времена — из whisper (выравнивание по порядку)."""
import json, re, sys, pathlib, difflib
from faster_whisper import WhisperModel
ep = pathlib.Path(sys.argv[1]); audio = next(p for p in [ep / "voice.mp3", ep / "voice.wav"] if p.exists())
paras = [p.strip() for p in re.split(r"\n\s*\n", (ep / "script.txt").read_text("utf8")) if p.strip()]
script = [(w, i) for i, p in enumerate(paras) for w in p.split() if re.search(r"\w", w)]
model = WhisperModel("small", device="cpu", compute_type="int8")
segs, info = model.transcribe(str(audio), language="ru", word_timestamps=True, initial_prompt=" ".join(paras)[:800])
rec = [w for s in segs for w in s.words]
norm = lambda s: re.sub(r"[^\wё]", "", s.lower()).replace("ё", "е")
sm = difflib.SequenceMatcher(a=[norm(w) for w, _ in script], b=[norm(w.word) for w in rec], autojunk=False)
times = [None] * len(script)
for a, b, n in sm.get_matching_blocks():
    for k in range(n): times[a + k] = (rec[b + k].start, rec[b + k].end)
for i, t in enumerate(times):  # дыры — интерполяция между соседями
    if t is None:
        prev = next((times[j][1] for j in range(i - 1, -1, -1) if times[j]), 0.0)
        nxt = next((times[j][0] for j in range(i + 1, len(times)) if times[j]), prev + 0.4)
        times[i] = (prev, max(prev + 0.1, (prev + nxt) / 2))
words = [{"w": w, "s": round(s, 3), "e": round(e, 3), "shot": sh} for (w, sh), (s, e) in zip(script, times)]
shots = [{"i": i, "text": p, "s": min(w["s"] for w in words if w["shot"] == i), "e": max(w["e"] for w in words if w["shot"] == i)} for i, p in enumerate(paras)]
json.dump({"source": "faster-whisper-small", "duration": info.duration, "shots": shots, "words": words}, open(ep / "timings.json", "w"), ensure_ascii=False, indent=1)
print(f"timings.json: {len(words)} слов, {len(shots)} шотов, {info.duration:.1f} с")
