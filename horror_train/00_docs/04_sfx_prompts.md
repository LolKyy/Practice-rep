# Звуковой дизайн и промпты для SFX

Звук здесь важнее картинки: ролик можно смотреть без изображения, и он всё равно должен пугать.

**Генератор:** ElevenLabs Sound Effects (английские промпты ниже, *Duration* — как указано, *Prompt influence* 0.6–0.7). Бесплатная замена — freesound.org (лицензия CC0 / CC-BY; автора по CC-BY укажи в описании).
**Временная дорожка:** `04_audio/temp/temp_mix.wav` собрана скриптом из `audio_cues.csv`. Это черновая разметка по таймкодам: ставь её на таймлайн первой и по ней расставляй настоящие звуки. В финальный экспорт её не включай (или оставь только ветер, если он устраивает).

Файлы клади в `04_audio/sfx/` с именами из колонки «Файл».

---

## Слои

| Слой | Что | Уровень в миксе |
|---|---|---|
| AMB | ветер, гул вагона | −16…−24 дБ, в паузах до −34 / −60 |
| SFX | удары, скрипы, щелчки, дуга | −6…−28 дБ |
| VO | голоса | −12…−20 дБ (см. `03_voiceover.md`) |
| MUS | один низкий дрон | −30 дБ, только 0:25–0:59 |

Пиковый уровень мастера — **−1 dBTP**, средняя громкость около **−14 LUFS** (норма TikTok/Shorts).

---

## Промпты

| Файл | Таймкод | Длит. | Промпт (EN) |
|---|---|---|---|
| `amb_wind_blizzard.wav` | 0:00–1:16 (петля) | 22 с | Howling blizzard wind across an open steppe heard from inside a stopped train car, deep low-frequency rumble, gusts pressing against metal walls and glass, no music, seamless loop |
| `amb_wind_outside_close.wav` | 1:05–1:15 | 10 с | Close outdoor blizzard wind heard right next to a microphone standing in the snow, dry and harsh, no reverb, no music |
| `amb_train_running.wav` | 0:00–0:10.8 | 11 с | Interior of an old Soviet passenger train car moving at night, steady clickety-clack of wheels on rail joints, low electrical hum, rattling glass, muffled wind outside, no voices |
| `sfx_brake_screech.wav` | 0:07.0 | 4 с | Old passenger train braking hard, long metallic wheel screech fading as it slows to a stop, heard from inside the car |
| `sfx_coupler_clank.wav` | 0:08.4 | 1 с | Heavy railway car couplers slamming together one after another during an emergency stop, deep metallic clank |
| `sfx_relay_click.wav` | 0:10.2, 0:15.2, 0:21.6, 0:47–0:49 | 0.5 с | Single dry electrical relay click inside an old metal control box, close, no reverb |
| `sfx_power_down.wav` | 0:10.8 | 1.5 с | Electrical hum of a train car abruptly cutting out, fluorescent tubes powering down with a falling whine |
| `sfx_metal_creak.wav` | 0:11.0, 0:27.5 | 2 с | Cold steel train car body creaking slowly under wind pressure, low groaning metal stress |
| `sfx_pa_static.wav` | 0:15.2–0:21.6 | 7 с | Old Soviet train public address loudspeaker hiss and crackle, an open microphone with no voice, worn speaker distortion |
| `sfx_knock_glass.wav` | 0:30.3 / 0:31.1 / 0:31.9 | 1 с | One slow heavy knock of knuckles on a frozen thick train window from outside, dull muffled thud on glass, no reverb |
| `sfx_ice_crackle.wav` | 0:33.5 | 2 с | Thin frost on a glass window crackling and melting quietly, very close, delicate |
| `sfx_door_handle.wav` | 0:39.5 | 1.5 с | Heavy metal lever handle of a train vestibule door slowly pressed down a few centimetres and stopping, stiff mechanism, metal squeak |
| `sfx_lamp_buzz.wav` | 0:46–0:50 | 4 с | Failing emergency lamp buzzing and flickering, electrical sputter, irregular crackle |
| `sfx_arc_crackle.wav` | 0:51.0, 0:56.0, 1:01.5 | 1 с | Sharp electric arc crackle from an iced overhead catenary wire outside a train, short violent buzz-snap, heard through a window |
| `sfx_metal_scrape_far.wav` | 0:57.0 | 3 с | Distant slow metal scraping along the side of a railway car, heard far away through a blizzard, faint |
| `sfx_bass_hit.wav` | 1:01.5 | 3 с | Single deep sub-bass impact with a long low rumble tail, cinematic but subtle, no whoosh, no riser |
| `sfx_signal_cut.wav` | 1:16.0 | 0.5 с | VHS camcorder recording abruptly cutting out, short digital glitch and tape stop, then silence |
| `sfx_knock_metal_door.wav` | 1:19.0 / 1:19.8 / 1:20.6 | 1 с | One slow heavy knock on a thick metal train door from outside, deep hollow boom with metallic ring, no reverb tail |
| `mus_drone_low.wav` | 0:25–0:59 | 34 с | Very low dark ambient drone, barely audible sub tone with slow movement, no melody, no percussion, no risers |

**Шаги** (для запасных вариантов и версии 90 сек): `sfx_steps_snow_outside.wav` — *Slow heavy footsteps crunching in deep snow right outside a train car wall, heard through metal, someone walking along the car* (6 сек), ставить на 0:52–0:56 при −30 дБ.

**Удары:** сгенерируй один удар (по стеклу и по двери отдельно) и поставь **один и тот же файл** три раза с интервалом 0.8 сек. Одинаковые удары страшнее, чем разные.

---

## Правила микса

1. **Тишина — главный инструмент.** Три окна тишины: 0:12.6–0:15.0 (ветер −34 дБ), 0:59.2–1:01.5 (−60 дБ, ветер просто исчезает), 1:16.05–1:19.0 (абсолютный ноль).
2. **Голос существа чище окружения.** Никакой реверберации на VO_05_xx и VO_07_01.
3. **Без скримеров.** Громче −6 дБ — только `sfx_bass_hit` и `sfx_knock_metal_door`.
4. **Ветер не стоит на месте.** Его уровень меняется по `audio_cues.csv` (`wind_level`): в CapCut это ключевые кадры громкости на дорожке ветра.
5. **Музыка почти не слышна.** Дрон должен ощущаться, а не слышаться. Если сомневаешься — убери.
