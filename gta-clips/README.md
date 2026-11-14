# Clipso — GTA 6 бит-эдиты (Shorts/TikTok, 13–20 с, 1080×1920, 60 fps)

Монтаж — кодом: исходники → удары трека → подбор шотов → JSON-эдит → Remotion → mp4.
Разбор референсов и правила стиля — в [RECIPE.md](RECIPE.md).

## План
1. **Исходники** — только официальные видео Rockstar (`sources.json`: Trailer 1/2, Launch Trailer, Extended Look…),
   лучше в 4K: из кадра 16:9 вырезается вертикаль 9:16, и из 4K она получается чёткой (из 1080p — апскейл ×1.78).
2. **Трек** → `beats`: сетка склеек (1 удар = 1 шот, в кульминации полудоли, сильные доли помечены под панчи).
3. **Шоты** → `scenes`: детект склеек трейлера + яркость/насыщенность/движение → цвет-блоки
   (night — ночь-неон, day — день-пляж, sunset — закат), score и контакт-лист кропов 9:16 для ручного выбора.
4. **Эдит** → `draft` раскладывает шоты блоками ночь → день → закат, потом я правлю JSON руками по контакт-листу.
5. **Ключевые кадры** (`render.py … keyframes`) → показываю → после «ок» рендер.
6. **Рендер**: `_preview.mp4` (с треком, для просмотра) и `_upload.mp4` (без звука, для загрузки; трек ставится в приложении).

## Структура
```
sources.json          реестр официальных видео      sources/   скачанные исходники (не в git)
tools/fetch.py        скачать исходники / референсы  refs/      референсы для разбора (не в git)
tools/beats.py        трек → beats/<трек>.json (+ .png с сеткой)
tools/scenes.py       исходник → scenes/<id>.json + scenes/<id>_sheet_N.jpg
tools/grade_lut.py    грейд канала → grade/clipso.cube (тот же LUT можно загрузить в CapCut)
tools/draft.py        черновик эдита → edits/<id>.json
tools/prep.py         эдит → фрагменты 1080×1920@60 с грейдом (video/public/clips) + таймлайн для Remotion
tools/render.py       keyframes | video
tools/analyze_ref.py  разбор референса: шоты, склейки vs удары, вспышки, цвет, раскадровка
video/                Remotion: Clip.tsx (слои, подпись, водяной знак), Shot.tsx (эффекты), fx.ts (кривые)
```

## Формат эдита (`edits/<id>.json`)
```json
{ "id": "t2_v1", "beats": "beats/track.json", "music": "track.mp3", "grade": "grade/clipso.cube",
  "watermark": "CLIPSO",
  "captions": [{ "text": "POV: ты наконец в *VICE CITY*", "from": 0, "to": 2.2, "color": "#ff3df2" }],
  "shots": [
    { "src": "t2", "in": 41.20, "crop": 0.55, "fx": ["flash", "zoom"] },
    { "src": "t2", "in": 63.05, "out": 63.95, "ramp": "in", "fx": ["shake", "rgb"] },
    { "src": "t2", "in": 88.40, "beats": 2, "drift": 0.06, "pan": [0.4, 0.6] }
  ] }
```
Шот: `src` (id исходника), `in` / `out` (сек исходника; без `out` — `speed`, по умолч. 1), длина шота — из сетки ударов
(`beats`: сколько ударов занимает), `crop` (центр кропа 0..1), `cy`, `zoom` (доп. приближение), `pan` [x0, x1] (проезд кропа),
`ramp`: `in` (разгон), `out` (в слоумо), `smash` (быстро-медленно-быстро) — на скорости > 1.6× сам включается motion blur
(усреднение соседних кадров исходника), `drift` (медленный наезд за шот),
`fx`: `flash` (белая вспышка 2 кадра), `zoom` (zoom punch), `shake`, `rgb` (RGB split), `whip` (влёт со смазом), `blur`.
Фрагмент исходника ограничен 2.5 с (prep.py не даст взять больше). В подписи `*слово*` — выделение цветом.

## Команды
Нужно: Python 3.10+, Node 20+, ffmpeg в PATH. На Windows вместо `python3` — `python`.
```
pip install -r tools/requirements.txt
cd video && npm install && cd ..

python3 tools/fetch.py get t2                      # или: python3 tools/fetch.py import t2 <скачанный файл>
python3 tools/beats.py <трек.mp3> --len 16 --plot  # трек положить и в video/public/music/; --per 2 — спокойнее (шот на 2 доли)
python3 tools/scenes.py t2 --sheet
python3 tools/draft.py --id t2_v1 --beats beats/<трек>.json --scenes t2 --music <трек.mp3>
python3 tools/render.py edits/t2_v1.json keyframes
python3 tools/render.py edits/t2_v1.json video
```
Рендер на Windows (Chrome вместо скачиваемого браузера):
```
python tools/render.py edits/t2_v1.json video --chrome-mode chrome-for-testing --browser "C:\Program Files\Google\Chrome\Application\chrome.exe"
```
Просмотр/правка в браузере: `cd video && npx remotion studio` (композиция `Clip-<id>`).

## 4K на своём ПК (Windows, RTX 4060)
Качество упирается в исходник: из 720p/464p в 4K деталей не прибавится, поэтому есть два пути (лучше оба):
1. **4K-исходники** — официальные видео Rockstar с YouTube (на домашнем IP yt-dlp качает 4K):
   `python tools/fetch.py get launch t2 extended` → потом в эдите заменить `src` на них.
2. **AI-апскейл** слабых исходников ×4 (Real-ESRGAN на видеокарте): скачать
   `realesrgan-ncnn-vulkan-20220424-windows.zip` со страницы релизов github.com/xinntao/Real-ESRGAN,
   распаковать в `gta-clips/tools/bin/` (рядом с exe должна лежать папка `models`). Ключ `--upscale`.

```
cd F:\video\Practice-rep\gta-clips
pip install -r tools/requirements.txt
cd video && npm install && cd ..
python tools/import_mix.py "<папка с присланными роликами>"
python tools/render.py edits/mix_v2.json video --res 2 --interp --upscale --chrome-mode chrome-for-testing --browser "C:\Program Files\Google\Chrome\Application\chrome.exe"
```
`--res 2` — 2160×3840 (вёрстка та же, Remotion рендерит с `--scale=2`), `--interp` — 30→60 fps интерполяцией движения,
`--upscale` — Real-ESRGAN x4plus для исходников ниже 1920 px. Без `--upscale` всё тоже работает, просто мягче.
Готово: `out/mix_v2_preview.mp4` (с треком) и `out/mix_v2_upload.mp4` (без звука).

## Замеры
- Облако (4 ядра, без GPU): 16 с эдита (954 кадра) — рендер 3 мин 15 с; нарезка 38 фрагментов — ~1 мин 10 с.
- 4K (2160×3840) в облаке: ~0.6 с/кадр → 17 с эдита ≈ 10 мин; на RTX 4060 быстрее.
- Точность: кадр исходника на таймлайне совпадает до кадра (проверено синтетикой со счётчиком кадров).
