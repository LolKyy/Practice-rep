#!/usr/bin/env bash
# Сведение: голос главный (-16 LUFS), эффекты на ~14 дБ тише, итог -14 LUFS / TP -1.5. Склейка с видео.
#   tools/mix.sh <video_raw.mp4> <out.mp4>
set -euo pipefail
cd "$(dirname "$0")/.."
VID="$1"; OUTF="$2"
ffmpeg -v error -y -i audio/voice_x1.15.mp3 -af "loudnorm=I=-16:TP=-2:LRA=9" -ar 44100 -ac 2 out/voice_n.wav
ffmpeg -v error -y -i out/sfx.wav -af "loudnorm=I=-30:TP=-9:LRA=20" -ar 44100 -ac 2 out/sfx_n.wav
ffmpeg -v error -y -i out/voice_n.wav -i out/sfx_n.wav -filter_complex "[0][1]amix=inputs=2:duration=longest:normalize=0,loudnorm=I=-14:TP=-1.5:LRA=9" -ar 44100 out/mix.wav
ffmpeg -v error -y -i "$VID" -i out/mix.wav -map 0:v -map 1:a -c:v copy -c:a aac -b:a 192k -shortest -movflags +faststart "$OUTF"
ffmpeg -hide_banner -i "$OUTF" -af ebur128 -f null - 2>&1 | grep -E "^\s+I:" | tail -1
