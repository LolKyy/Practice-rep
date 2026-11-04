# STATE — текущее состояние

**Статус:** Студия готова (кроме генерации звуковых эффектов ElevenLabs — ждёт права ключа). Следующий шаг — промт с сюжетом.

## Сделано
- Память проекта: CLAUDE.md, bible/ (STATE, WORLD, CHARACTERS, DECISIONS, LOG).
- Remotion 4.0.540 (video/) + google-fonts, transitions, fonts, media. Навыки Remotion (13) в .agents/skills → .claude/skills.
- .venv (Python 3.11) + faster-whisper 1.2.1, модель small офлайн в models/whisper-small (не в git; `tools/setup-models.py`).
- Шрифты с кириллицей (Inter, Montserrat, JetBrains Mono, Oswald) в assets/fonts.
- Компоненты: Subtitles, HUD, Callout, EvidenceCard, SchemeMap, RuleCard, Camera, EndCard, CharacterPlaceholder, Backdrop; композиция Showcase (5 с) + превью Preview-EndCardNext, Preview-Evidence.
- tools/: render-draft, render-final (loudnorm −14), timings, check-frames, eleven (REST), bench-render, setup-models, sync-assets.
- Бенчмарк: выбрано --gl=angle --concurrency=4 (облако без GPU).
- ElevenLabs MCP прописан в .mcp.json; проверен напрямую по протоколу MCP: text_to_speech ✅ (episodes/_showcase/voice.mp3), text_to_sound_effects ❌ 401 (у ключа нет права sound_generation).
- Финальная проверка: Showcase 1080×1920 через render-final, check-frames ОК, таймкоды озвучки получены.
- Временный писк датчика assets/sfx/sensor_beep.mp3 синтезирован ffmpeg (заглушка до ElevenLabs).

## Дальше
1. Когда пользователь включит право «Sound Effects» у ключа ElevenLabs — сгенерировать «электронный писк датчика» через MCP (text_to_sound_effects, ~1 с) в assets/sfx/sensor_beep.mp3 (заменить заглушку), перерендерить Showcase.
2. Ждать промт с сюжетом → прочитать bible/space_series_razbor.md (если появился) → заполнить WORLD.md, CHARACTERS.md.
3. Пользователь решил работать и рендерить в облаке. Сейчас: выбор стиля рисовки (образцы StyleA/B/C), пользователь придумывает сюжет.

## Выбор стиля (ждём ответ пользователя)
Образцы — композиции Style-A-Soft / Style-B-Noir / Style-C-Retro (video/src/styles/StyleSamples.tsx), сравнение video/out/styles_compare.png:
- A «Мягкий плоский»: округлые формы, голова 1:3, сине-бирюзовый + красный акцент.
- B «Графичный нуар»: острые формы, жёсткие тени, почти монохром, пропорции 1:7, контровой свет.
- C «Ретро-фантастика 70-х»: толстый контур, тёплые приглушённые цвета, растр-точки, шлем-пузырь.
Можно смешивать. После выбора — записать в DECISIONS.md, обновить theme.ts и CHARACTERS.md.

## Открытые вопросы
- Права ключа ElevenLabs: нужен sound_generation (и, вероятно, music_generation для музыки).
- Акцентный цвет #FF3B2F — временный, подтвердить с сюжетом.
- bible/space_series_razbor.md — ещё не появился (не прочитан).
