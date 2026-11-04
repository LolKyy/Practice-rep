# station-series — анимационный сериал (космо-хоррор)

## ОБЯЗАТЕЛЬНЫЕ ПРАВИЛА ДЛЯ CLAUDE
- **В начале каждой сессии:** `git pull`, затем молча прочитай `bible/STATE.md`, `bible/DECISIONS.md` и последние записи `bible/LOG.md` — и продолжай с того места, где остановились, не переспрашивая пользователя. Если в `bible/` появился `space_series_razbor.md` и он ещё не прочитан (см. STATE.md) — прочитай.
- **После каждого законченного шага:** обнови `bible/STATE.md` (что сделано, что дальше, открытые вопросы), допиши строку в `bible/LOG.md` (`дата — что сделал`), сделай коммит с понятным сообщением и `git push`.
- **Любое решение пользователя** (имя, правило мира, цвет, сюжетный ход, настройка) сразу записывай в `bible/DECISIONS.md`. Не противоречь записанным решениям без согласия пользователя.
- **Перед перезапуском Claude Code** всегда обновляй `STATE.md`, чтобы после перезапуска продолжить с того же места.
- Когда пишешь код сцен — пользуйся навыками Remotion (`.claude/skills/remotion-*`, начинать с `remotion-best-practices`).
- После любого рендера — `tools/check-frames` и сам смотри PNG: кириллица, текст за краем, съехавшие элементы, пустые кадры.
- Звать пользователя только: нужен пароль администратора (дать команду), ключ API / доступ к GitHub, что-то не скачивается (попросить VPN), нужен перезапуск Claude Code (сначала обновить STATE.md, потом сказать «перезапусти меня и напиши "продолжай"»).

## Что за проект
Анимационный сериал для Shorts/Reels/TikTok.
- Вертикальное видео **1080×1920, 30 fps**, серии **80–90 с** (потолок 1:30).
- Язык — **русский**.
- **Плоская векторная 2D-графика**, рисуется кодом в Remotion (никаких стоков/нейрокартинок в кадре).
- Тёмная палитра, HUD-счётчики, караоке-субтитры. Жанр — **космо-хоррор**.

## Статус
Студия настраивается. Сюжет придёт отдельным промтом. (Актуальное — в `bible/STATE.md`.)

## Формула серии
1. **Хук в первые 2 секунды** — правило / ставка / экшен.
2. Одной фразой **«кто ты и где ты»** — для новых зрителей.
3. **Одно правило, одна угроза** на серию.
4. **HUD-счётчики всё время на экране** (таймер, шкала %, расстояние).
5. **Вставки-улики каждые 5–8 с**: рация, журнал, схема, монитор (EvidenceCard / SchemeMap).
6. **Клиффхэнгер** + «Часть N+1 в профиле» (EndCard), иногда **выбор А/Б в комменты**.

## Визуальный стиль
- Плоский вектор, тёмная палитра + **1 акцентный цвет** (`video/src/lib/theme.ts`, сейчас `#FF3B2F`).
- Выноски-подписи к героям: **«ИМЯ, ВОЗРАСТ / РОЛЬ»** (Callout).
- Караоке-субтитры крупно, **по 2–4 слова**, активное слово крупнее, **одно слово цветом** (Subtitles).
- **Монстра никогда не показываем целиком** — тень, часть, след, отражение, датчик.
- Безопасная зона: сверху 160 px, снизу 420 px, слева 60, справа 140. Субтитры по центру, Y≈1370.
- Шрифты: Montserrat Black (субтитры), JetBrains Mono (HUD, мониторы), Oswald Bold (заголовки), Inter Black (выноски/карточки).

## Структура
```
station-series/
  CLAUDE.md            — этот файл
  bible/               — память проекта (STATE, WORLD, CHARACTERS, DECISIONS, LOG)
  video/               — проект Remotion
    src/lib/           — тема, шрифты, утилиты
    src/components/    — переиспользуемые компоненты
    src/episodes/      — композиции серий (пока Showcase)
  episodes/<epNN>/     — script.txt, storyboard.md, voice.mp3, timings.json, renders/
  assets/{sfx,music,fonts}
  tools/               — скрипты пайплайна
  models/              — модели Whisper (не в git)
  INSTALL.md           — что установлено, версии, команды
```

## Компоненты (video/src/components)
| Компонент | Что делает | Ключевые пропсы |
|---|---|---|
| Subtitles | караоке из timings.json | words, keywords, offset, centerY |
| HUD | до 3 счётчиков | timer{startSeconds,direction}, gauge{percent}, distance{meters} |
| Callout | выноска со стрелкой | targetX/Y, title, subtitle, side, delay |
| EvidenceCard | улика | kind: radio/log/monitor/sign, title, lines |
| SchemeMap | схема в разрезе + «ТЫ ЗДЕСЬ» | compartments, doors, youAreHere, threat, sealed |
| RuleCard | «ПРАВИЛО №N» | number, text |
| Camera | наезд/проезд, тряска по флагу | from, to, start, end, shake |
| EndCard | «ЧАСТЬ N — В ПРОФИЛЕ», выбор А/Б | part, variant, choiceA/B |
| CharacterPlaceholder | силуэт-заглушка | x, y, height, facing |
| Backdrop | фон-заглушка отсека | accent |

Значения, меняющиеся во времени (HUD), задаются как число или `{at:[сек…], values:[…]}`.

## Команды пайплайна
Все команды — из папки `station-series/`. Python-скрипты — через `.venv`.

```bash
# превью в браузере (Remotion Studio)
cd video && npm run dev

# черновик 720×1280
node tools/render-draft.mjs <CompositionId> [--ep epNN]

# финал 1080×1920 H.264 + loudnorm −14 LUFS
node tools/render-final.mjs <CompositionId> [--ep epNN]

# таймкоды слов: аудио → timings.json
.venv/bin/python tools/timings.py episodes/epNN/voice.mp3        # (Windows: .venv\Scripts\python)

# стоп-кадры для проверки: 0 с, 2 с, середина, последняя секунда (+ автопроверка пустых кадров и краёв)
node tools/check-frames.mjs <video.mp4> [outDir]

# озвучка / звук через API ElevenLabs (запасной путь, если MCP недоступен)
.venv/bin/python tools/eleven.py tts "текст" episodes/epNN/voice.mp3 [--voice <voice_id>]
.venv/bin/python tools/eleven.py sfx "описание звука" assets/sfx/name.mp3 [--seconds 1.5]

# бенчмарк рендера (перезапустить на новом ПК) → tools/bench-results.md + tools/render.config.json
node tools/bench-render.mjs --repeat 2

# модель Whisper small (один раз на новом ПК; дальше офлайн)
.venv/bin/python tools/setup-models.py

# скопировать ассеты в video/public (делается автоматически в dev/render-скриптах)
node tools/sync-assets.mjs
```
Рендер-настройки (gl, concurrency) читаются из `tools/render.config.json` (выбраны бенчмарком).
Результаты: `video/out/<Comp>_{draft,final}.mp4` или `episodes/<ep>/renders/…` при `--ep`; кадры check-frames — рядом в `frames/`.

## ElevenLabs
- MCP-сервер `elevenlabs` прописан в `.mcp.json` (появляется после перезапуска Claude Code в папке station-series/).
  Озвучка: инструмент `text_to_speech` (model_id `eleven_multilingual_v2`, language `ru`), звуки: `text_to_sound_effects`,
  музыка: `compose_music`. `output_directory` — внутри `assets/` или `episodes/<ep>/`.
- Голос по умолчанию для тестов: George `JBFqnCBsd6RMkjVDRZzb` (голоса героев выберем с сюжетом → bible/CHARACTERS.md).
- После озвучки файл переименовать в `episodes/<ep>/voice.mp3` и сразу прогнать `tools/timings.py`.

## Пайплайн серии (план)
script.txt → озвучка (ElevenLabs) voice.mp3 → `tools/timings.py` → timings.json → storyboard.md → композиция `video/src/episodes/EpNN.tsx` → render-draft → check-frames → правки → render-final → check-frames.
