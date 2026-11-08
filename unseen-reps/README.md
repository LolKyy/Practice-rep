# UNSEEN REPS — производство роликов

Канал: мотивация / дисциплина / «невидимый счёт». Стиль: тёмный 3D-зал, белые стикмены,
глянцевый пол с отражениями, свет-«пятна», бирюзовый призрак будущего «я», кинокамера.

## Установка (один раз)
Нужны Node.js 18+ и ffmpeg.
```bash
cd unseen-reps
npm install
```

## Посмотреть и поправить вживую
```bash
npm run studio        # откроется редактор в браузере: композиции Pilot и Edit
```

## 1. 3D-ролики (`Pilot` и будущие сцены)
- Сцены: `src/scenes/*.tsx`. Набор деталей: `src/kit3d.tsx`:
  `Stickman` (позы `stand / sit / lie / slump / phone / win` + `walkPose`), `Ghost` (призрак, `power` 0..1),
  `GlossFloor` (пол-зеркало), `SpotPool` (луч света сверху), `Block`, `Glow`, `Digits` (табло «5:47»), `Scene3D` (камера по ключам).
- Слой поверх 3D (`src/overlay.tsx`): `Hook` (зацепка), `RubricTag` (рубрика), `ScorePop` (+1 / −1),
  `EditOutro` (фирменная эдит-концовка), `Grain` (зерно).
- Рендер: `npm run render:pilot` → `out/pilot.mp4` (1080×1920).
  Если WebGL падает: `GL=swiftshader npm run render:pilot` (медленнее, но работает везде).

## 2. Эдиты из ВАШИХ картинок и музыки (`Edit`)
1. Положите картинки/клипы (`.jpg .png .webp .mp4 .mov`) в `public/edit/`, трек — `public/edit/music.mp3`.
2. Найдите удары в треке (нарезка будет точно в такт):
   ```bash
   npm run beats -- public/edit/music.mp3
   ```
3. Откройте `src/edit.json` и заполните (комментарии `//` ниже — пояснения, в сам файл их не пишите):
   ```json
   {
     "music": "edit/music.mp3",
     "musicStart": 12.5,                 // с какой секунды трека начинать (дроп)
     "grade": "bw",                      // "bw" — ч/б с контрастом, "color" — цвет
     "segments": [
       { "src": "edit/01.jpg", "beats": 2, "text": "Do it",    "style": "serif", "fx": "zoom blur" },
       { "src": "edit/02.mp4", "beats": 1, "text": "NO ONE",   "style": "punch", "fx": "punch flash" },
       { "src": "edit/03.jpg", "beats": 2, "text": "REP 1/365","style": "mono",  "fx": "push", "accent": true }
     ],
     "outro": ["One day", "or day one."]
   }
   ```
   - `beats` — сколько ударов держится кадр (1 = быстрая нарезка, 2–4 = спокойнее).
   - `style`: `serif` (крупный «журнальный» с эхо-размытием), `punch` (жирный капс), `mono` («интерфейс»).
   - `fx` (можно несколько через пробел): `zoom` (наезд-отъезд), `push` (медленный наезд), `punch` (удар-рывок),
     `shake` (тряска), `flash` (белая вспышка), `blur` (проявление из размытия), `rgb` (цветовой сдвиг).
   - `accent: true` — текст бирюзовым (фирменный цвет).
   - `"src": null` — тёмная заглушка (удобно для чисто текстовых кадров).
4. Рендер: `npm run render:edit` → `out/edit.mp4`.

## Музыка — важно
- **TikTok:** лучше всего рендерить ролик **без музыки** (`"music": null`) и добавлять трендовый звук
  прямо в TikTok при публикации — так звук легальный и ролик попадает в ленту этого звука.
- Свой трек в шаблоне — только если у вас есть права (купленная/бесплатная лицензия: YouTube Audio Library,
  Pixabay Music, Epidemic Sound и т.п.). Чужие треки из TikTok-роликов вставлять в файл нельзя — блок/страйк.
- Черновая музыка без лицензий: `node tools/music.mjs 15 70` → `public/music.wav` (используется в Pilot).

## Шрифты
Лежат локально в `public/fonts/` (Anton, Playfair Display, JetBrains Mono — все под OFL, можно в коммерции).
