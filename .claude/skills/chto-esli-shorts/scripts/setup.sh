#!/usr/bin/env bash
# Ставит всё, что нужно пайплайну канала, если этого ещё нет. Идемпотентно — можно запускать каждый раз.
#   bash .claude/skills/chto-esli-shorts/scripts/setup.sh
set -euo pipefail
MODELS="${MODELS:-$HOME/models}"
mkdir -p "$MODELS"
command -v unar >/dev/null || (apt-get install -y -q unar >/dev/null 2>&1 || (apt-get update -q >/dev/null && apt-get install -y -q unar >/dev/null))
python3 -c "import sherpa_onnx, numpy" 2>/dev/null || pip install -q sherpa-onnx numpy 2>&1 | grep -v WARNING || true
get() { [ -d "$MODELS/$1" ] || curl -sSLf "https://github.com/k2-fsa/sherpa-onnx/releases/download/asr-models/$1.tar.bz2" | tar xj -C "$MODELS"; }
get sherpa-onnx-zipformer-ru-2024-09-18   # русское распознавание с таймингами (Apache 2.0)
node -e "require('playwright')" 2>/dev/null || echo "ВНИМАНИЕ: нет playwright (в облаке он предустановлен)"
command -v ffmpeg >/dev/null || echo "ВНИМАНИЕ: нет ffmpeg"
echo "ok: модели в $MODELS"
