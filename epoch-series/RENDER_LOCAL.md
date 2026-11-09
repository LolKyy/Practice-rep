# Рендер серии у себя на ПК

Нужно: Git, Node.js 20+, Python 3, ffmpeg (в PATH). Windows — команды для PowerShell / Git Bash (на Windows вместо `python3` пишите `python`).

1. Забрать ветку:
   `git clone https://github.com/LolKyy/Practice-rep.git` (или `git pull`), затем `git checkout ccr-5e45347d-h3f681`
2. Зависимости: `cd epoch-series/video` → `npm install`
3. Голос (mp3 не хранится в git — собирается из сохранённого ответа ElevenLabs, ключ НЕ нужен, символы не тратятся):
   из папки `epoch-series`: `python3 tools/tts-v3.py episodes/03_vikingi script.txt script_tts_one.txt`
   и скопировать `episodes/03_vikingi/voice.mp3` → `video/public/ep03/voice.mp3`
4. (по желанию) посмотреть в браузере: в `video` → `npx remotion studio`, выбрать `Ep03`
5. Рендер 1080×1920: в `video` →
   `npx remotion render src/index.ts Ep03 ../episodes/03_vikingi/renders/raw.mp4 --codec=h264 --crf=18 --gl=angle`
   (`--concurrency=N` — число потоков, обычно половина ядер)
6. Громкость −14 LUFS: в `episodes/03_vikingi/renders` →
   `ffmpeg -i raw.mp4 -af loudnorm=I=-14:TP=-1.5:LRA=11 -c:v copy -c:a aac -b:a 192k final.mp4`

Другие серии — так же: Ep01 (`01_rim_cezar`, script_v3.txt + script_v3_tts.txt, голос в `video/public/ep01/`), Ep02 (`02_piraty`, script.txt + script_tts_one.txt, `video/public/ep02/` + песня `song.mp3` — её нет в git, её дал пользователь).
