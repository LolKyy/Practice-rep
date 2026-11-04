#!/usr/bin/env python3
"""Аудио → faster-whisper → timings.json (таймкоды слов).

Использование:
  .venv/bin/python tools/timings.py episodes/ep01/voice.mp3 [--out timings.json] [--script episodes/ep01/script.txt]
                                    [--model models/whisper-small] [--lang ru] [--device auto]

Формат результата:
  {"audio": "...", "language": "ru", "duration": 2.9, "text": "...",
   "words": [{"word": "Проверка", "start": 0.12, "end": 0.71, "prob": 0.98}, ...]}
--script подаёт текст сценария в initial_prompt — Whisper лучше пишет имена и термины.
"""
import argparse
import json
import os
import sys
import time

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("audio")
    ap.add_argument("--out")
    ap.add_argument("--script")
    ap.add_argument("--model", default=os.path.join(ROOT, "models", "whisper-small"))
    ap.add_argument("--lang", default="ru")
    ap.add_argument("--device", default="auto", help="auto | cpu | cuda")
    a = ap.parse_args()

    from faster_whisper import WhisperModel

    device = a.device
    if device == "auto":
        try:
            import ctranslate2

            device = "cuda" if ctranslate2.get_cuda_device_count() > 0 else "cpu"
        except Exception:
            device = "cpu"
    compute = "float16" if device == "cuda" else "int8"
    if not os.path.isdir(a.model):
        sys.exit(f"Нет модели {a.model}. См. INSTALL.md (раздел Whisper).")

    prompt = None
    if a.script and os.path.exists(a.script):
        prompt = open(a.script, encoding="utf-8").read().strip()[-800:]

    t0 = time.time()
    model = WhisperModel(a.model, device=device, compute_type=compute)
    segments, info = model.transcribe(
        a.audio,
        language=a.lang,
        word_timestamps=True,
        vad_filter=False,
        beam_size=5,
        initial_prompt=prompt,
    )
    words, texts = [], []
    for seg in segments:
        texts.append(seg.text.strip())
        for w in seg.words or []:
            words.append(
                {"word": w.word.strip(), "start": round(w.start, 3), "end": round(w.end, 3), "prob": round(w.probability, 3)}
            )
    out = a.out or os.path.join(os.path.dirname(os.path.abspath(a.audio)), "timings.json")
    data = {
        "audio": os.path.relpath(os.path.abspath(a.audio), ROOT).replace("\\", "/"),
        "language": info.language,
        "duration": round(info.duration, 3),
        "text": " ".join(texts),
        "words": words,
    }
    with open(out, "w", encoding="utf-8") as f:
        json.dump(data, f, ensure_ascii=False, indent=2)
    print(f"[timings] {len(words)} слов, {info.duration:.2f} с аудио, {time.time() - t0:.1f} с ({device}/{compute}) → {out}")
    for w in words:
        print(f"  {w['start']:7.2f} – {w['end']:7.2f}  {w['word']}")


if __name__ == "__main__":
    main()
