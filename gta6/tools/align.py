# Тайминги слов: распознаём озвучку (Vosk zipformer ru через sherpa-onnx) и выравниваем на текст сценария.
#   python3 align.py <models_dir> <voice.mp3> <voice.txt> <out words.json>
import sys, re, json, subprocess, difflib, wave
import numpy as np, sherpa_onnx
MD, AUDIO, TXT, OUT = sys.argv[1:5]
M = f"{MD}/sherpa-onnx-zipformer-ru-2024-09-18"
rec = sherpa_onnx.OfflineRecognizer.from_transducer(encoder=f"{M}/encoder.int8.onnx", decoder=f"{M}/decoder.int8.onnx",
    joiner=f"{M}/joiner.int8.onnx", tokens=f"{M}/tokens.txt", num_threads=4, decoding_method="greedy_search")
raw = subprocess.run(["ffmpeg", "-v", "error", "-i", AUDIO, "-ac", "1", "-ar", "16000", "-f", "s16le", "-"], capture_output=True, check=True).stdout
x = np.frombuffer(raw, np.int16).astype(np.float32) / 32768; SR = 16000
# режем по паузам на куски <= 14 с
hop = 160; en = np.array([np.sqrt((x[i:i + 400] ** 2).mean()) for i in range(0, len(x) - 400, hop)])
quiet = en < 0.01
cuts = [0]; last = 0
for i in range(len(quiet)):
    t = i * hop
    if quiet[i] and t - last > 6 * SR: cuts.append(t); last = t
    elif t - last > 14 * SR: cuts.append(t); last = t
cuts.append(len(x))
rw = []  # распознанные слова [(слово, t0)]
for a, b in zip(cuts, cuts[1:]):
    st = rec.create_stream(); st.accept_waveform(SR, x[a:b]); rec.decode_stream(st)
    r = st.result
    for tok, ts in zip(r.tokens, r.timestamps):
        t = a / SR + ts
        if tok[:1] in (" ", "▁") or not rw: rw.append([tok.lstrip(" ▁").lower(), t, t])
        else: rw[-1][0] += tok.lower(); rw[-1][2] = t
rw = [w for w in rw if w[0]]
# слова сценария
paras = [p.strip() for p in open(TXT, encoding="utf-8").read().split("\n\n") if p.strip()]
words = []
pending = ""  # латиница/цифры в начале фразы приклеиваем к следующему слову
for pi, p in enumerate(paras):
    for w in re.sub(r"\[[a-z]+\]", " ", p).split():
        n = re.sub(r"[^а-яё]", "", w.lower()).replace("ё", "е")
        if n: words.append({"w": (pending + " " + w).strip(), "n": n, "p": pi}); pending = ""
        elif words and words[-1]["p"] == pi: words[-1]["w"] += " " + w
        else: pending = (pending + " " + w).strip()
hyp = [w[0].replace("ё", "е") for w in rw]
sm = difflib.SequenceMatcher(None, [w["n"] for w in words], hyp, autojunk=False)
for tag, i1, i2, j1, j2 in sm.get_opcodes():
    if tag == "equal" or (tag == "replace" and i2 - i1 == j2 - j1):
        for k in range(i2 - i1): words[i1 + k]["s"] = rw[j1 + k][1]
# интерполяция пропусков
known = [i for i, w in enumerate(words) if "s" in w]
for i, w in enumerate(words):
    if "s" in w: continue
    lo = max([k for k in known if k < i], default=None); hi = min([k for k in known if k > i], default=None)
    if lo is None: w["s"] = words[hi]["s"] - 0.3 * (hi - i)
    elif hi is None: w["s"] = words[lo]["s"] + 0.3 * (i - lo)
    else: w["s"] = words[lo]["s"] + (words[hi]["s"] - words[lo]["s"]) * (i - lo) / (hi - lo)
dur = len(x) / SR
for i, w in enumerate(words):
    nxt = words[i + 1]["s"] if i + 1 < len(words) else dur
    w["e"] = round(min(nxt, w["s"] + 0.9), 3); w["s"] = round(w["s"], 3)
json.dump({"duration": round(dur, 3), "paras": paras, "words": words}, open(OUT, "w", encoding="utf-8"), ensure_ascii=False, indent=0)
print(f"слов {len(words)}, совпало {len(known)} ({100*len(known)/len(words):.0f}%), длительность {dur:.1f}s")
for pi in range(len(paras)):
    ws = [w for w in words if w["p"] == pi]; print(f"абзац {pi+1:2d}: {ws[0]['s']:6.2f}–{ws[-1]['e']:6.2f}  {ws[0]['w']} … {ws[-1]['w']}")
