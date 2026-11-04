#!/usr/bin/env python3
"""Скачивает модель Whisper small (CTranslate2) в models/whisper-small — один раз, дальше работает офлайн.

  .venv/bin/python tools/setup-models.py

1) Пробует официальный источник (Hugging Face, Systran/faster-whisper-small).
2) Если HF недоступен (как в облачной сессии) — собирает модель из npm-зеркала
   @skillninja/shortmovie-telop-model-p0..p3 (int8, сверка sha256 из пакета).
"""
import hashlib
import io
import json
import os
import shutil
import sys
import tarfile
import urllib.request

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
DST = os.path.join(ROOT, "models", "whisper-small")


def have():
    return os.path.exists(os.path.join(DST, "model.bin"))


def from_hf():
    from faster_whisper import download_model

    download_model("small", output_dir=DST)


def from_npm():
    os.makedirs(DST, exist_ok=True)
    parts, expected = [], None
    for i in range(4):
        name = f"@skillninja/shortmovie-telop-model-p{i}"
        meta = json.load(urllib.request.urlopen(f"https://registry.npmjs.org/{name}/latest"))
        print("скачиваю", name, meta["version"])
        tgz = urllib.request.urlopen(meta["dist"]["tarball"]).read()
        with tarfile.open(fileobj=io.BytesIO(tgz)) as tf:
            for m in tf.getmembers():
                base = os.path.basename(m.name)
                data = tf.extractfile(m).read() if m.isfile() else None
                if data is None:
                    continue
                if base.startswith("model.bin.part"):
                    parts.append((int(base.rsplit("part", 1)[1]), data))
                elif base == "model.sha256":
                    expected = data.decode().split()[0]
                elif base.endswith(".json"):
                    open(os.path.join(DST, base), "wb").write(data)
    blob = b"".join(d for _, d in sorted(parts))
    got = hashlib.sha256(blob).hexdigest()
    if expected and got != expected:
        sys.exit(f"sha256 не совпал: {got} != {expected}")
    open(os.path.join(DST, "model.bin"), "wb").write(blob)


if __name__ == "__main__":
    if have():
        print("модель уже есть:", DST)
        sys.exit(0)
    try:
        from_hf()
    except Exception as e:
        print("HF недоступен:", type(e).__name__, "— беру npm-зеркало")
        shutil.rmtree(DST, ignore_errors=True)
        from_npm()
    print("готово:", DST)
