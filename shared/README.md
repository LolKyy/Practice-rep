# shared — общий движок роликов «Что, если…?»

Всё, что одинаково во всех 3D-роликах, лежит здесь. Исправил тут — исправилось во всех роликах.

## remotion/ — 3D-движок (Remotion + three.js)
- `kit.tsx` — сцена и камера (`Scene3D`), реквизит-примитивы (`Box`, `Sign`, `Screen`…), персонажи `Doodle`, толпа `crowd`, жесты
- `doodle.ts` — рисовка персонажа-дудла (эмоции, руки, вид со спины)
- `sets.tsx` — неоновые локации, экраны, `SynthSunset`, `QuestionCard`, конфетти, дым
- `sets2.tsx` — экраны и мелкие сцены (заставка GTA, загрузка, карта, бумага, кот, табло)
- `sets3.tsx` — детальные локации: `Apartment`, `City`, `Cockpit`, `TrainFront`, `Clinic2`, `Shop2`, `Store2`, `Kitchen2`, `Stage2` + реквизит (`Chips`, `Can`, `SixPack`, `Console`, `Kettle`, `Car`, `Tree`, `House`)

## tools/ — звук и озвучка
- `tts.sh <абзац> <дубль>` — дубль ElevenLabs (голос Eugene, eleven_v3); запускать из папки ролика
- `align.py` — тайминги слов (sherpa-onnx) → `src/words.json`
- `sfx.py` — синтез мягких звуков по `audio/sfx.json`

## Новый ролик
Скопировать папку `gta6-day` целиком (без `node_modules`, `out`, `audio/takes`) и поменять только своё:
`script/voice.txt`, `src/shots.tsx` (раскадровка), `src/timeline.js` (звуки), `src/captions.tsx` (замены цифр и красные слова), `src/Cover.tsx`.
Импорты движка уже смотрят в `../../shared/remotion/…`, а `remotion.config.ts` подхватывает их из `node_modules` ролика.
