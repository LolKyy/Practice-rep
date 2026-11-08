"""ElevenLabs eleven_v3 (выразительная озвучка потоком) → voice.mp3 + timings.json.
  python3 tools/tts-v3.py episodes/NN [script.txt] [script_tts.txt]
script.txt — чистый текст (абзац = шот, идёт в субтитры). script_tts.txt — тот же текст с аудиотегами
[excited] [sarcastic] [shouting] ..., ударениями (U+0301) и паузами «...»; слова обязаны совпадать (проверяется).
Строка «=====» делит текст на куски-запросы. ПО УМОЛЧАНИЮ — без «=====», одним запросом (решение пользователя: на стыках кусков меняется тембр).
Перегенерировать кусок N с другим дублем: SEED_N=<число> (напр. SEED_2=7). Кэш — <ep>/tts_cache_v3/.
Голос по умолчанию — A: Dmitry, stability 0.0 (Creative)."""
import base64, hashlib, json, os, re, subprocess, sys, pathlib, urllib.request
ep = pathlib.Path(sys.argv[1]); clean_f = ep / (sys.argv[2] if len(sys.argv) > 2 else "script_v3.txt")
tts_f = ep / (sys.argv[3] if len(sys.argv) > 3 else "script_v3_tts.txt")
VOICE, STAB = os.environ.get("VOICE", "hU3rD0Yk7DoiYULTX1pD"), float(os.environ.get("STAB", "0.0"))
SR, LEAD, CHUNK_GAP, PAD = 44100, 0.15, 0.3, 0.05
paras = [p.strip() for p in re.split(r"\n\s*\n", clean_f.read_text("utf8")) if p.strip()]
script_words = [(w, i) for i, p in enumerate(paras) for w in p.split() if re.search(r"\w", w)]
chunks = [c.strip() for c in tts_f.read_text("utf8").split("=====") if c.strip()]
norm = lambda w: re.sub(r"[^\w-]", "", w.replace("́", "").lower().replace("ё", "е"))
untag = lambda t: re.sub(r"\[[^\]]*\]", " ", t)
tts_words = [w for c in chunks for w in untag(c).split() if re.search(r"\w", w)]
assert [norm(w) for w, _ in script_words] == [norm(w) for w in tts_words], "слова script и script_tts не совпадают"
cache = ep / "tts_cache_v3"; cache.mkdir(exist_ok=True)
def tts(n, text):
    body = {"text": re.sub(r"\s*\n\s*", " ", text), "model_id": "eleven_v3",
            "voice_settings": {"stability": STAB, "similarity_boost": 0.8}, "seed": int(os.environ.get(f"SEED_{n + 1}", "1"))}
    f = cache / f"chunk{n + 1}_{hashlib.sha1(json.dumps([VOICE, body], ensure_ascii=False).encode()).hexdigest()[:12]}.json"
    if not f.exists():
        req = urllib.request.Request(f"https://api.elevenlabs.io/v1/text-to-speech/{VOICE}/with-timestamps?output_format=mp3_44100_128",
            json.dumps(body).encode(), {"Content-Type": "application/json", "xi-api-key": os.environ.get("ELEVEN_API_KEY", "proxy")})
        f.write_bytes(urllib.request.urlopen(req, timeout=300).read()); print("  сгенерирован", f.name)
    return json.loads(f.read_text())
out, words, t, wi = bytearray(b"\0\0" * int(LEAD * SR)), [], LEAD, 0
for n, c in enumerate(chunks):
    r = tts(n, c); al = r["alignment"]; ch, cs, ce = al["characters"], al["character_start_times_seconds"], al["character_end_times_seconds"]
    j = "".join(ch); tag = {k for m in re.finditer(r"\[[^\]]*\]", j) for k in range(m.start(), m.end())}
    ch = [" " if k in tag else x for k, x in enumerate(ch)]
    ws = [m for m in re.finditer(r"\S+", "".join(ch)) if re.search(r"\w", m.group())]
    sp = [k for k, x in enumerate(ch) if re.match(r"\w", x)]
    a0, a1 = max(0, cs[sp[0]] - PAD), ce[sp[-1]] + PAD
    raw = subprocess.run(["ffmpeg", "-v", "error", "-i", "-", "-f", "s16le", "-ac", "1", "-ar", str(SR), "-"],
                         input=base64.b64decode(r["audio_base64"]), capture_output=True, check=True).stdout
    seg = raw[int(a0 * SR) * 2:int(a1 * SR) * 2]
    for m in ws:
        idx = [k for k in range(m.start(), m.end()) if re.match(r"\w", ch[k])]
        w, shot = script_words[wi]; wi += 1
        words.append({"w": w, "s": round(t + cs[idx[0]] - a0, 3), "e": round(t + ce[idx[-1]] - a0, 3), "shot": shot})
    out += seg; t += len(seg) / 2 / SR
    if n + 1 < len(chunks): out += b"\0\0" * int(CHUNK_GAP * SR); t += CHUNK_GAP
assert wi == len(script_words), (wi, len(script_words))
out += b"\0\0" * int(0.5 * SR); total = len(out) / 2 / SR
shots = []
for i, p in enumerate(paras):
    ww = [w for w in words if w["shot"] == i]; shots.append({"i": i, "text": p, "s": ww[0]["s"], "e": ww[-1]["e"]})
subprocess.run(["ffmpeg", "-v", "error", "-y", "-f", "s16le", "-ac", "1", "-ar", str(SR), "-i", "-", "-b:a", "192k", str(ep / "voice.mp3")], input=bytes(out), check=True)
json.dump({"source": f"elevenlabs-v3:{VOICE}", "duration": round(total, 3), "shots": shots, "words": words},
          open(ep / "timings.json", "w"), ensure_ascii=False, indent=1)
print(f"voice.mp3 {total:.1f} с · {len(words)} слов · {len(shots)} шотов · {len(chunks)} кусков")
