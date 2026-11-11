# GTA 6 перенесли — 3D-дудл версия (~1:32)

Remotion + three.js: 3D-локации, дудл-персонажи, камера всегда в движении, растворения 5 кадров, субтитры по слову.

## Рендер на ПК (Windows)
```
cd gta6-3d
npm install
npx remotion studio            # посмотреть/полистать в браузере (необязательно)
npx remotion render src/index.ts Gta6Doodle F:\video\gta6_3d.mp4 --video-bitrate=1800k --gl=angle --chrome-mode=chrome-for-testing --browser-executable="C:\Program Files\Google\Chrome\Application\chrome.exe"
```
Если падает на WebGL — замени `--gl=angle` на `--gl=swiftshader` (медленнее).

## Файлы
- `script/voice.txt` — текст озвучки; `audio/voice.mp3` → `src/words.json` (тайминги) → `public/audio.mp3` (голос + звуки, `node tools/build_audio.mjs`)
- `src/shots.tsx` — 45 шотов (камера, персонажи, эмоции); `src/sets.tsx` — локации; `src/kit.tsx` — движок; `src/captions.tsx` — субтитры
