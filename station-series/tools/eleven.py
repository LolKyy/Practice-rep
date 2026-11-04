#!/usr/bin/env python3
"""ElevenLabs через REST API — запасной путь, если MCP недоступен (и для пакетной работы).

  .venv/bin/python tools/eleven.py tts "Текст" out.mp3 [--voice VOICE_ID] [--model eleven_multilingual_v2]
  .venv/bin/python tools/eleven.py sfx "описание звука" out.mp3 [--seconds 1.5]
  .venv/bin/python tools/eleven.py voices              # список голосов (если ключ позволяет)

Ключ: переменная окружения ELEVENLABS_API_KEY. В облачной сессии Claude Code ключ подставляет прокси —
там переменная может быть любой.
"""
import argparse
import json
import os
import sys
import urllib.request

API = "https://api.elevenlabs.io"
DEFAULT_VOICE = os.environ.get("ELEVENLABS_VOICE_ID", "JBFqnCBsd6RMkjVDRZzb")  # «George», мультиязычный


def call(path, body=None, method=None):
    key = os.environ.get("ELEVENLABS_API_KEY", "proxy-injected")
    req = urllib.request.Request(
        API + path,
        data=json.dumps(body).encode() if body is not None else None,
        method=method or ("POST" if body is not None else "GET"),
        headers={"xi-api-key": key, "Content-Type": "application/json"},
    )
    try:
        with urllib.request.urlopen(req, timeout=180) as r:
            return r.read()
    except urllib.error.HTTPError as e:
        sys.exit(f"ElevenLabs {e.code}: {e.read().decode(errors='replace')[:500]}")


def save(data, out):
    os.makedirs(os.path.dirname(os.path.abspath(out)), exist_ok=True)
    with open(out, "wb") as f:
        f.write(data)
    print(f"[eleven] {len(data) // 1024} КБ → {out}")


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("cmd", choices=["tts", "sfx", "voices"])
    ap.add_argument("text", nargs="?")
    ap.add_argument("out", nargs="?")
    ap.add_argument("--voice", default=DEFAULT_VOICE)
    ap.add_argument("--model", default="eleven_multilingual_v2")
    ap.add_argument("--seconds", type=float)
    ap.add_argument("--stability", type=float, default=0.45)
    ap.add_argument("--similarity", type=float, default=0.8)
    ap.add_argument("--style", type=float, default=0.15)
    a = ap.parse_args()

    if a.cmd == "voices":
        d = json.loads(call("/v1/voices"))
        for v in d.get("voices", []):
            print(v["voice_id"], v["name"], v.get("labels", {}))
        return
    if not a.text or not a.out:
        sys.exit("Нужны текст и путь для сохранения")
    if a.cmd == "tts":
        body = {
            "text": a.text,
            "model_id": a.model,
            "language_code": "ru" if a.model in ("eleven_turbo_v2_5", "eleven_flash_v2_5") else None,
            "voice_settings": {"stability": a.stability, "similarity_boost": a.similarity, "style": a.style},
        }
        body = {k: v for k, v in body.items() if v is not None}
        save(call(f"/v1/text-to-speech/{a.voice}?output_format=mp3_44100_128", body), a.out)
    else:
        body = {"text": a.text, "prompt_influence": 0.5}
        if a.seconds:
            body["duration_seconds"] = a.seconds
        save(call("/v1/sound-generation?output_format=mp3_44100_128", body), a.out)


if __name__ == "__main__":
    main()
