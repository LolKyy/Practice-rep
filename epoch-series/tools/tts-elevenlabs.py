"""ElevenLabs → voice.mp3 + timings.json (точные тайминги из /with-timestamps, whisper не нужен).
  python3 tools/tts-elevenlabs.py episodes/NN [voice_id] [speed]
Абзац script.txt = шот. Каждый абзац — отдельный запрос (с previous_text/next_text для ровной интонации),
кэш в <ep>/tts_cache/ — повторный запуск не тратит символы, пока текст абзаца не изменился.
Ключ подставляет прокси окружения (заголовок xi-api-key) либо переменная ELEVEN_API_KEY."""
import base64, hashlib, json, os, re, subprocess, sys, pathlib, urllib.request
ep = pathlib.Path(sys.argv[1]); VOICE = sys.argv[2] if len(sys.argv) > 2 else "hU3rD0Yk7DoiYULTX1pD"  # Dmitry
SPEED = float(sys.argv[3]) if len(sys.argv) > 3 else 1.1
SET = {"stability": 0.4, "similarity_boost": 0.8, "style": 0.35, "use_speaker_boost": True, "speed": SPEED}
MODEL, SR, LEAD, GAP, PAD = "eleven_multilingual_v2", 44100, 0.1, 0.22, 0.04
paras = [p.strip() for p in re.split(r"\n\s*\n", (ep / "script.txt").read_text("utf8")) if p.strip()]
cache = ep / "tts_cache"; cache.mkdir(exist_ok=True)
def tts(i):
    body = {"text": paras[i], "model_id": MODEL, "voice_settings": SET,
            "previous_text": paras[i - 1] if i else None, "next_text": paras[i + 1] if i + 1 < len(paras) else None}
    key = hashlib.sha1(json.dumps([VOICE, body], ensure_ascii=False).encode()).hexdigest()[:12]
    f = cache / f"{i:02d}_{key}.json"
    if not f.exists():
        req = urllib.request.Request(f"https://api.elevenlabs.io/v1/text-to-speech/{VOICE}/with-timestamps?output_format=mp3_44100_128",
            json.dumps(body).encode(), {"Content-Type": "application/json", "xi-api-key": os.environ.get("ELEVEN_API_KEY", "proxy")})
        f.write_bytes(urllib.request.urlopen(req, timeout=120).read())
    return json.loads(f.read_text())
def pcm(mp3):
    return subprocess.run(["ffmpeg", "-v", "error", "-i", "-", "-f", "s16le", "-ac", "1", "-ar", str(SR), "-"],
                          input=mp3, capture_output=True, check=True).stdout
out, words, shots, t = bytearray(b"\0\0" * int(LEAD * SR)), [], [], LEAD
for i, p in enumerate(paras):
    r = tts(i); al = r["alignment"]; ch, cs, ce = al["characters"], al["character_start_times_seconds"], al["character_end_times_seconds"]
    speech = [k for k, c in enumerate(ch) if re.match(r"[\w\d]", c)]
    a0, a1 = max(0, cs[speech[0]] - PAD), ce[speech[-1]] + PAD          # обрезаем тишину по выравниванию
    raw = pcm(base64.b64decode(r["audio_base64"])); seg = raw[int(a0 * SR) * 2:int(a1 * SR) * 2]
    k = 0                                                                  # слова: группы символов-букв
    for m in re.finditer(r"\S+", "".join(ch)):
        idx = [j for j in range(m.start(), m.end()) if re.match(r"[\w\d]", ch[j])]
        if not idx: continue
        words.append({"w": m.group(), "s": round(t + cs[idx[0]] - a0, 3), "e": round(t + ce[idx[-1]] - a0, 3), "shot": i})
    d = len(seg) / 2 / SR
    shots.append({"i": i, "text": p, "s": round(t, 3), "e": round(t + d, 3)})
    out += seg + b"\0\0" * int(GAP * SR); t += d + GAP
out += b"\0\0" * int(0.4 * SR); total = len(out) / 2 / SR
subprocess.run(["ffmpeg", "-v", "error", "-y", "-f", "s16le", "-ac", "1", "-ar", str(SR), "-i", "-", "-b:a", "192k", str(ep / "voice.mp3")], input=bytes(out), check=True)
json.dump({"source": f"elevenlabs:{VOICE}", "duration": round(total, 3), "shots": shots, "words": words},
          open(ep / "timings.json", "w"), ensure_ascii=False, indent=1)
print(f"voice.mp3 {total:.1f} с · {len(words)} слов · {len(shots)} шотов")
