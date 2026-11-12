#!/bin/bash
# ../shared/tools/tts.sh <номер абзаца 1..N> <дубль>  → audio/takes/pNN_tK.mp3 (ElevenLabs, ключ подставляет прокси)
# запускать из папки ролика: ../shared/tools/tts.sh <абзац> <дубль>
n=$1; k=$2
txt=$(awk -v RS= -v n="$n" 'NR==n' script/voice.txt)
body=$(python3 -c 'import json,sys;print(json.dumps({"text":sys.argv[1],"model_id":"eleven_v3","voice_settings":{"stability":0.5,"similarity_boost":0.75}}))' "$txt")
out=$(printf "audio/takes/p%02d_t%d.mp3" "$n" "$k")
curl -sS -f -X POST "https://api.elevenlabs.io/v1/text-to-speech/m0OQuJtWCw1V23P0pQmG?output_format=mp3_44100_128" -H "Content-Type: application/json" -d "$body" -o "$out" && echo "$out"
