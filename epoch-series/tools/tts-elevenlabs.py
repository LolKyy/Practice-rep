"""ElevenLabs → voice.mp3 + timings.json (точные тайминги из /with-timestamps, whisper не нужен).
  python3 tools/tts-elevenlabs.py episodes/NN [voice_id] [speed]
script.txt: абзац = шот. Внутри абзаца «|» — отдельная фраза с паузой PAUSE (реплики диалога),
«||» — длинная пауза LONG (реакция «не сразу»). Каждая фраза — отдельный запрос с previous_text/next_text.
Реплики в «кавычках» читаются эмоциональнее (EMO). Ударения — tools/stress-ru.txt (в субтитры не попадают).
Кэш в <ep>/tts_cache/ — повторный запуск тратит символы только на изменённые фразы.
Ключ подставляет прокси окружения (заголовок xi-api-key) либо переменная ELEVEN_API_KEY."""
import base64, hashlib, json, os, re, subprocess, sys, pathlib, urllib.request
ROOT = pathlib.Path(__file__).parent
ep = pathlib.Path(sys.argv[1]); VOICE = sys.argv[2] if len(sys.argv) > 2 else "hU3rD0Yk7DoiYULTX1pD"  # Dmitry
SPEED = float(sys.argv[3]) if len(sys.argv) > 3 else 1.0
BASE = {"stability": 0.4, "similarity_boost": 0.8, "style": 0.35, "use_speaker_boost": True, "speed": SPEED}
EMO = {**BASE, "stability": 0.3, "style": 0.6}
MODEL, SR, LEAD, GAP, PAUSE, LONG, PAD = "eleven_multilingual_v2", 44100, 0.15, 0.32, 0.4, 0.75, 0.04
ACC = "́"
stress = {}
for ln in (ROOT / "stress-ru.txt").read_text("utf8").splitlines():
    if ln.strip() and not ln.startswith("#"): a, b = ln.split(); stress[a.lower()] = b.lower()
def accent(text):
    def f(m):
        w = m.group(); r = stress.get(w.lower())
        return w if not r else (r[0].upper() + r[1:] if w[0].isupper() else r)
    return re.sub(r"[А-Яа-яЁё]+", f, text)
paras = [p.strip() for p in re.split(r"\n\s*\n", (ep / "script.txt").read_text("utf8")) if p.strip()]
segs = []                                   # (shot, text, пауза перед следующей фразой)
for i, p in enumerate(paras):
    parts = re.split(r"\s*(\|\|?)\s*", p)
    for k in range(0, len(parts), 2):
        sep = parts[k + 1] if k + 1 < len(parts) else None
        segs.append((i, parts[k], PAUSE if sep == "|" else LONG if sep == "||" else GAP))
cache = ep / "tts_cache"; cache.mkdir(exist_ok=True)
def tts(n):
    txt = segs[n][1]; quoted = txt.lstrip("— ").startswith("«")
    body = {"text": accent(txt), "model_id": MODEL, "voice_settings": EMO if quoted else BASE,
            "previous_text": accent(segs[n - 1][1]) if n else None,
            "next_text": accent(segs[n + 1][1]) if n + 1 < len(segs) else None}
    key = hashlib.sha1(json.dumps([VOICE, body], ensure_ascii=False).encode()).hexdigest()[:12]
    f = cache / f"{segs[n][0]:02d}_{key}.json"
    if not f.exists():
        req = urllib.request.Request(f"https://api.elevenlabs.io/v1/text-to-speech/{VOICE}/with-timestamps?output_format=mp3_44100_128",
            json.dumps(body).encode(), {"Content-Type": "application/json", "xi-api-key": os.environ.get("ELEVEN_API_KEY", "proxy")})
        f.write_bytes(urllib.request.urlopen(req, timeout=120).read())
    return json.loads(f.read_text())
def pcm(mp3):
    return subprocess.run(["ffmpeg", "-v", "error", "-i", "-", "-f", "s16le", "-ac", "1", "-ar", str(SR), "-"],
                          input=mp3, capture_output=True, check=True).stdout
out, words, shots, t = bytearray(b"\0\0" * int(LEAD * SR)), [], {}, LEAD
for n, (i, txt, pause) in enumerate(segs):
    r = tts(n); al = r["alignment"]; ch, cs, ce = al["characters"], al["character_start_times_seconds"], al["character_end_times_seconds"]
    speech = [k for k, c in enumerate(ch) if re.match(r"\w", c)]
    a0, a1 = max(0, cs[speech[0]] - PAD), ce[speech[-1]] + PAD          # обрезаем тишину по выравниванию
    raw = pcm(base64.b64decode(r["audio_base64"])); seg = raw[int(a0 * SR) * 2:int(a1 * SR) * 2]
    for m in re.finditer(r"\S+", "".join(ch)):
        idx = [j for j in range(m.start(), m.end()) if re.match(r"\w", ch[j])]
        if idx: words.append({"w": m.group().replace(ACC, ""), "s": round(t + cs[idx[0]] - a0, 3), "e": round(t + ce[idx[-1]] - a0, 3), "shot": i})
    d = len(seg) / 2 / SR
    sh = shots.setdefault(i, {"i": i, "text": re.sub(r"\s*\|+\s*", " ", paras[i]), "s": round(t, 3)}); sh["e"] = round(t + d, 3)
    last = n + 1 == len(segs)
    out += seg + b"\0\0" * int((0 if last else pause) * SR); t += d + (0 if last else pause)
out += b"\0\0" * int(0.5 * SR); total = len(out) / 2 / SR
subprocess.run(["ffmpeg", "-v", "error", "-y", "-f", "s16le", "-ac", "1", "-ar", str(SR), "-i", "-", "-b:a", "192k", str(ep / "voice.mp3")], input=bytes(out), check=True)
json.dump({"source": f"elevenlabs:{VOICE}", "duration": round(total, 3), "shots": list(shots.values()), "words": words},
          open(ep / "timings.json", "w"), ensure_ascii=False, indent=1)
print(f"voice.mp3 {total:.1f} с · {len(words)} слов · {len(shots)} шотов · {len(segs)} фраз")
