# Промпты для генерации кадров

## Как пользоваться

**Инструменты (конкретный выбор):**
- **Картинки:** Midjourney v7 (`--ar 9:16 --style raw --v 7`) или Flux 1.1 Pro / Flux Kontext. Пары кадров «до/после» (STILL_PAIR) делай **редактированием первого кадра** (Midjourney *Vary Region*, Flux Kontext, Photoshop Generative Fill), а не новой генерацией. Так поезд и коридор остаются теми же.
- **Видео (только кадры I2V):** Kling 2.x, режим *Image to Video*, 5 сек, *Professional*, без звука. Запасной вариант — Runway Gen-4 или Hailuo.
- Разрешение: генерируй в 9:16, апскейль до **1080 × 1920** (Topaz / встроенный upscale). Видео из генератора в 720p допустимо: шум и CCTV-обработка в CapCut спрячут разницу.

**Типы кадров:**
| Тип | Что делаем | Кадры |
|---|---|---|
| `I2V` | картинка → короткое видео в генераторе | S01A, S01B, S04B, S05A |
| `STILL` | одна картинка + движение/эффекты в CapCut | S02B, S03A, S03B, S04A, S05B, S07A, S07B |
| `STILL_PAIR` | две картинки (состояние A и B), монтажная смена/мерцание в CapCut | S02A, S04C, S05C, S06A, S06B, S06C |
| `BLACK` | чёрный фон + титр | S07C |

Почему так: генераторы плохо держат один и тот же вагон и не умеют точно мигать светом в нужный кадр. Мигание, вспышки и появление отпечатка мы собираем монтажом. Анимируем только то, что статика не передаст: летящий снег, идущий поезд, дрожащие капли и опускающуюся ручку.

**Имена файлов:** `02_images/S03B_v01.png`, видео — `03_video_clips/S01A_v01.mp4`. Финальную версию переименуй без `_vNN` или отметь в `shotlist.csv`.

---

## Якорь непрерывности (входит в каждый промпт ниже)

> **CONTINUITY:** the same late-1980s Soviet sleeper railcar (kupe type): beige-grey plastic wall panels, dark-brown faux-wood trim, a chrome handrail under the corridor windows, a worn red-and-green carpet runner, small fold-down corridor seats, frosted milk-glass ceiling lamps. Exterior: dark green car body with one thin faded yellow stripe, caked with snow and ice. **PALETTE:** cold blue-grey (deep slate #1B2630, steel #3E5566, frost #8FA3AD); the only warm accent is a dim amber emergency lamp (#C98A3A). **LOOK:** photoreal, like a 1990s camcorder or CCTV frame, high-ISO grain, soft focus, slight chromatic aberration, crushed blacks, vertical 9:16.

> **NEGATIVE (для всех):** text, letters, numbers, signage, logos, watermark, signature, subtitles, UI, cartoon, anime, illustration, painting, 3D render, CGI, monster, creature details, visible face, eyes, teeth, gore, blood, warm sunset colors, oversaturation, lens flare stars, bokeh hearts, people (если не указано иное)

Для Midjourney негатив передаётся как `--no text, letters, logo, watermark, cartoon, CGI, face, monster`.

---

## СЦЕНА 1

### S01A · 0:00–0:04 · `I2V` · Окно купе в буране
**Image prompt:**
POV from inside a dark train compartment looking through a single rectangular train window at night, a vast empty snowy steppe outside lost in a violent blizzard, snow flying almost horizontally past the glass, lit only by the yellowish light spilling from the train's own windows, no horizon visible. Close framing on the window, the window frame and a bit of the dark-brown faux-wood table edge in the lower third, faint reflection of a frosted milk-glass ceiling lamp in the glass, condensation in the corners and thin ice crystals on the outside of the glass. Static camera at seated eye level. Light: weak cool fluorescent light from the ceiling lamp behind the camera. Cold blue-grey palette, deep slate shadows. Lonely, oppressive, cold. The same late-1980s Soviet sleeper railcar: beige-grey plastic wall panels, dark-brown faux-wood trim. Photoreal, 1990s camcorder frame, high-ISO grain, soft focus, slight chromatic aberration, vertical 9:16. No text, no logos, no watermark, not cartoon, not CGI.

**Motion prompt (Kling):** Snow streaks horizontally past the window from right to left at high speed, slight rhythmic vibration of the camera from the rails, the reflection of the ceiling lamp trembles a little. Camera does not move. No new objects appear.

### S01B · 0:04–0:07 · `I2V` · Поезд в метели снаружи
**Image prompt:**
Wide exterior shot at night: an old Soviet passenger train of dark green railcars with one thin faded yellow stripe, caked with snow and ice, moving diagonally from the lower left to the middle right of the frame across an endless flat snowy steppe, a violent blizzard with snow flying almost horizontally. Rows of small dim yellow windows, a single locomotive headlight cutting a cone through the snow, overhead catenary wires and leaning wooden poles barely visible. Camera low and static at the trackside, about 40 meters from the train, a deep dark sky with no stars. Light: only the train windows and the headlight. Cold blue-grey palette, the windows a muted sodium yellow. Vast, empty, hostile. Leave the right third of the frame as empty dark steppe up to the horizon. Photoreal, 1990s camcorder frame, heavy grain, soft focus, vertical 9:16. No text, no number plates, no logos, no watermark, not cartoon, not CGI.

**Motion prompt:** The train moves slowly to the right through the blizzard, snow swirls heavily in the headlight cone, the camera stays perfectly still. Nothing else moves on the steppe.

**Спрятанная деталь:** силуэт **не** генерируем в этом кадре. В CapCut накладывается `06_overlays/overlay_silhouette.png` (готовый файл) в правую треть у горизонта на 0:05.5–0:05.75, прозрачность 12 %.

---

## СЦЕНА 2

### S02A · 0:07–0:11 · `STILL_PAIR` · Коридор, мигает свет
**Image A (`S02A_on.png`):**
POV standing at one end of the long narrow side corridor of a late-1980s Soviet sleeper railcar, looking down its whole length: windows on the left covered in frost with black night behind them, a chrome handrail under the windows, a row of closed compartment doors on the right, a worn red-and-green carpet runner, beige-grey plastic wall panels with dark-brown faux-wood trim, small fold-down seats. Frosted milk-glass ceiling lamps lit with flat cold fluorescent light, one of them noticeably dimmer. At the far end the door to the vestibule with a small dark window. Empty corridor, no people. Camera at eye level, slightly tilted forward, centred one-point perspective. Cold blue-grey palette, greenish fluorescent tint. Photoreal, 1990s camcorder frame, grain, soft focus, vertical 9:16. No text, no signs, no logos, no watermark, not cartoon, not CGI.

**Image B (`S02A_off.png`) — редактирование A:** the same frame with all ceiling lamps switched off; the corridor almost black, only faint blue light from the frosted windows on the left outlines the handrail and door frames.

### S02B · 0:11–0:15 · `STILL` · Аварийная лампа
**Image prompt:**
The same long narrow side corridor of a late-1980s Soviet sleeper railcar, in near darkness after a power failure. The only light is a small dim amber emergency lamp in a wire cage above the far vestibule door, throwing a weak warm glow on the ceiling and the end of the carpet runner, and long shadows of the handrail. Frosted windows on the left faintly blue from the snow outside, the compartment doors on the right closed and black. POV at eye level, one-point perspective down the corridor, slight dutch angle of 2 degrees. Palette: deep slate blacks, the steel blue of the windows, one amber accent. Silent, still, airless. Photoreal, 1990s camcorder at high ISO, heavy grain, soft focus, vertical 9:16. No text, no signs, no logos, no watermark, no people, not cartoon, not CGI.

---

## СЦЕНА 3

### S03A · 0:15–0:19 · `STILL` · Громкоговоритель
**Image prompt:**
Extreme close-up looking up at an old round Soviet ceiling loudspeaker in a train corridor: a scratched off-white metal grille with small holes, dust in the holes, a thin rim of frost at the edges, a painted-over screw, beige-grey plastic ceiling panel around it. Low angle, frame filled by the grille, slightly off-centre. Light: a dim amber emergency lamp from the side raking across the grille, deep cold shadow elsewhere. Palette: steel blue-grey with one amber edge light. Tense, mechanical, old. Photoreal macro, 1990s camcorder, grain, shallow depth of field, vertical 9:16. No text, no brand marks, no logos, no watermark, not cartoon, not CGI.

### S03B · 0:19–0:25 · `STILL` · Камера наблюдения, коридор
**Image prompt:**
Security camera view from a high corner of the ceiling looking down the full length of the side corridor of a late-1980s Soviet sleeper railcar, wide-angle fisheye distortion. Frosted windows along one wall, a chrome handrail, closed compartment doors along the other wall, a worn carpet runner. Emergency lighting only: one dim amber caged lamp at the far end. At the very far end, the narrow service door of the conductor's compartment stands slightly ajar with a thin vertical strip of warm light coming from the gap. The corridor is empty. Palette: desaturated grey-green CCTV monochrome with a faint amber spot. Low-resolution 1990s CCTV frame, heavy noise, smeared highlights, vignette, slight interlacing. Vertical 9:16. No text, no timestamp, no overlays, no logos, no watermark, no people, not cartoon, not CGI.

> Таймкод и надписи CCTV не генерируем — их даёт готовый оверлей `06_overlays/cctv_03B.mp4`.

---

## СЦЕНА 4

### S04A · 0:25–0:30 · `STILL` · Замёрзшее окно
**Image prompt:**
POV close to a single train compartment window at night, absolute blackness outside, no landscape visible at all, the glass covered at the edges with fern-like ice patterns on the outside and fogged with condensation on the inside, a clear dark oval in the centre. Part of the window frame and the faux-wood table edge in the bottom of the frame. Light: very weak amber emergency light from behind the camera reflected softly in the glass. Palette: black, steel blue frost, a faint amber reflection. Claustrophobic, waiting. Photoreal, 1990s camcorder, high-ISO grain, vertical 9:16. No text, no faces in the reflection, no logos, no watermark, not cartoon, not CGI.

### S04B · 0:30–0:33 · `I2V` · Макро стекла
**Image prompt:**
Macro shot of a fogged train window glass at night, droplets of condensation on the inside surface, frost crystals on the outside, pure black behind the glass. The frame filled by the glass texture, shallow focus on the droplets. Light: dim amber emergency light grazing from the left. Palette: black, cold blue-grey frost, tiny amber highlights in the droplets. Photoreal macro, grain, vertical 9:16. No text, no handprint, no logos, no watermark, not cartoon, not CGI.

**Motion prompt:** Three distinct moments where the glass shakes slightly as if struck from outside; the droplets tremble and two of them run down. Camera completely static. Nothing appears outside.

> Если генератор не попадает в ритм — бери 1 сек дрожания и поставь три копии под удары 0:30.3 / 0:31.1 / 0:31.9.

### S04C · 0:33–0:37 · `STILL_PAIR` · След ладони
**Image A (`S04C_clean.png`):** используй кадр S04B без изменений (первый кадр I2V или исходник).

**Image B (`S04C_hand.png`) — редактирование A:**
the same macro of the fogged frosted window, now a handprint pressed from the OUTSIDE of the glass, melting the frost into a clear print: a palm and five fingers that are unnaturally long and thin, about a third longer than a human hand's, slightly blurred, nothing visible behind it except black. Keep the droplets, light and grain identical. No text, no face, no creature, not cartoon.

---

## СЦЕНА 5

### S05A · 0:37–0:42 · `I2V` · Дверь тамбура
**Image prompt:**
POV in the dark corridor of a late-1980s Soviet sleeper railcar facing the closed vestibule door at the end: a heavy grey-painted metal door with a small rectangular window completely covered in frost, a long chrome lever handle, scratched paint around the handle, a thin line of snow on the floor under the door blown in by the wind. A dim amber emergency lamp in a wire cage above the door. Camera at eye level, centred, 2 meters from the door. Palette: slate blue darkness, amber lamp, steel grey door. Dread, nobody visible. Photoreal, 1990s camcorder, high-ISO grain, soft focus, vertical 9:16. No text, no signs, no logos, no watermark, no people, not cartoon, not CGI.

**Motion prompt:** Very slow push-in towards the door. Halfway through, the chrome handle moves down just a few centimetres and stops, as if someone on the other side is testing it. Fine snow drifts in under the door. Nothing else moves.

### S05B · 0:42–0:46 · `STILL` · Другой конец коридора
**Image prompt:**
POV looking down the dark side corridor of the same late-1980s Soviet sleeper railcar towards the opposite end, an identical vestibule door with a frosted window far away, the corridor completely empty, the compartment doors closed, frosted windows faintly blue, the carpet runner leading into darkness. No emergency lamp at this end, almost black, the far door barely visible as a grey rectangle. Eye level, one-point perspective. Palette: deep slate, steel blue window light. Empty, wrong. Photoreal, 1990s camcorder, heavy grain, vertical 9:16. No text, no logos, no watermark, no people, not cartoon, not CGI.

### S05C · 0:46–0:50 · `STILL_PAIR` · Мигающая лампа
**Image A (`S05C_lamp.png`):**
Close-up of a small Soviet emergency lamp in a rusted wire cage mounted above a train vestibule door, the bulb glowing dim amber, a cobweb, peeling grey paint, frost on the metal frame. Slight low angle. Palette: amber bulb, steel-blue darkness. Photoreal, 1990s camcorder, grain, vertical 9:16. No text, no logos, no watermark, not cartoon, not CGI.

**Image B (`S05C_door.png`) — редактирование S05B:** the same view of the far end of the corridor, lit for an instant by a flicker, and the far vestibule door now stands slightly ajar, a black gap of about 10 cm. Keep everything else identical.

---

## СЦЕНА 6

> Вспышки — это дуга на контактной сети (искрение провода при обледенении). Свет холодный, синевато-белый, жёсткий, сверху справа. Это реалистичный железнодорожный источник, который объясняет, почему степь видна только на доли секунды.

### S06A · 0:50–0:54 · `STILL_PAIR` · Силуэт вдали
**Image A (`S06A_dark.png`):** the same compartment window POV as S04A, outside almost black, only blowing snow faintly lit near the glass.

**Image B (`S06A_flash.png`):**
POV through a frosted train compartment window at night at the instant of a harsh blue-white electrical arc flash from the overhead catenary wire above the train, lighting up a vast flat snowy steppe in a blizzard with snow streaking horizontally. Far away near the horizon, roughly 150 meters from the train, a single very tall, impossibly thin, dark upright silhouette stands perfectly still, about twice the height of a man, featureless, edges dissolving in the blowing snow, no visible face or limbs detail. Window frame at the edges, ice crystals on the glass. Hard top-right light, long shadows on the snow. Palette: bleached blue-white snow, black sky, cold steel. Photoreal, 1990s camcorder, blown-out highlights, heavy grain, vertical 9:16. No text, no logos, no watermark, no monster details, no face, not cartoon, not CGI.

### S06B · 0:54–0:59 · `STILL_PAIR` · Следы и фуражка
**Image A (`S06B_dark.png`):** то же, что `S06A_dark.png` (можно продублировать).

**Image B (`S06B_flash.png`):**
POV from a train window looking down and along the side of a snow-caked dark green Soviet railcar at night at the instant of a harsh blue-white arc flash from the catenary above. Below, from the metal step of the car door, a single line of human footprints leads away across the fresh snow into the steppe and simply stops in the middle of the untouched snow, as if the walker vanished. At the end of the footprints lies a dark Soviet railway conductor's peaked cap, half covered with snow. Blizzard, snow streaking horizontally. High angle, the side of the car on the left edge. Hard blue-white top light, deep black beyond the lit area. Photoreal, 1990s camcorder, blown highlights, heavy grain, vertical 9:16. No text, no badges, no emblems, no logos, no watermark, no people, not cartoon, not CGI.

### S06C · 0:59–1:05 · `STILL_PAIR` · Силуэт у окна
**Image A (`S06C_dark.png`):** то же, что `S06A_dark.png`.

**Image B (`S06C_flash.png`):**
POV through a frosted train compartment window at the instant of a harsh blue-white arc flash: right outside the glass, less than a meter away, a tall dark figure stands blocking the view of the steppe, seen only as a black featureless torso shape against the bright snow, much taller than the window — its head and shoulders are cut off by the top of the window frame. Snow streaking past, frost on the glass partially obscuring the shape. Strong backlight, the figure is a pure silhouette with soft dissolving edges. Photoreal, 1990s camcorder, blown highlights, heavy grain, motion blur, vertical 9:16. No face, no eyes, no hands, no monster details, no text, no logos, no watermark, not cartoon, not CGI.

---

## СЦЕНА 7

### S07A · 1:05–1:11 · `STILL` · CCTV, дверь проводника распахнута
**Image prompt — редактирование S03B:** the same security camera frame of the corridor; the conductor's service door at the far end is now wide open, the small compartment behind it empty and lit by a weak lamp, a uniform jacket hanging on a hook, nobody inside. Everything else identical: grey-green CCTV monochrome, fisheye, heavy noise, no text, no timestamp, no people.

### S07B · 1:11–1:16 · `STILL` · CCTV, пятно в окне
**Image prompt — редактирование S07A:** the same CCTV frame; in one of the frosted corridor windows on the near side a pale, blurred, vaguely oval shape is pressed against the glass from outside, too high above the floor for a person, completely indistinct, no features, smeared by noise. Everything else identical. No face, no eyes, no text.

### S07C · 1:16–1:22 · `BLACK`
Не генерируется. Используется `06_overlays/title_end.png` на чёрном фоне.

---

## Готовые оверлеи (генерируются скриптом, см. README)

| Файл | Где | Режим наложения в CapCut |
|---|---|---|
| `title_hook.png` | 0:00–2.5 | Обычный (PNG с прозрачностью) |
| `title_0317.png` | 0:02.5–7.0 | Обычный |
| `title_power.png` | 0:11.5–14.0 | Обычный |
| `title_end.png` | 1:16.5–1:22 | Обычный, поверх чёрного |
| `overlay_silhouette.png` | 0:05.5–0:05.75 | Обычный, непрозрачность 12 % |
| `cctv_03B.mp4` | 0:19–0:25 | **Экран (Screen)** |
| `cctv_07.mp4` | 1:05–1:16 | **Экран (Screen)** |
| `vhs_noise.mp4` | весь ролик | **Экран (Screen)**, 20–35 % |
