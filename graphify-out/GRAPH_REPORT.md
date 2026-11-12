# Graph Report - Practice-rep  (2026-11-12)

## Corpus Check
- 207 files · ~160,316 words
- Verdict: corpus is large enough that graph structure adds value.
- Unclassified: 26 file(s) not represented in the graph (top: (none) 14, .ttf 9, .csv 2)

## Summary
- 1577 nodes · 3686 edges · 83 communities (63 shown, 20 thin omitted)
- Extraction: 97% EXTRACTED · 3% INFERRED · 0% AMBIGUOUS · INFERRED: 116 edges (avg confidence: 0.86)
- Token cost: 265,471 input · 0 output

## Community Hubs (Navigation)
- Python Tools & Alignment
- vasya1 Draw Library
- pvz1 Draw Library
- gta6-day 3D Kit
- swap1 Draw Library
- gta6-3d Doodle Characters
- gta6-day Doodle Characters
- protein30 Draw Library
- gta6-3d Captions
- gta6 v1 Story Scenes
- cretaceous_ep1 Dependencies
- gta6-3d Sets & Helpers
- pvz1 Scenes
- gta6-day Captions
- protein30 Style Frames
- vasya1 Scenes
- gta6-day SFX Synth
- gta6 SFX Synth
- protein30 SFX Synth
- pvz1 SFX Synth
- swap1 Scenes
- swap1 SFX Synth
- vasya1 SFX Synth
- gta6-3d Dependencies
- gta6-day Dependencies
- gta6-day Props & Furniture
- gta6-day City & Helpers
- gta6 v1 Scene Library
- gta6-day Cover & Sets
- gta6-day Shots & Props
- protein30 Scenes
- gta6-3d Poses & Screens
- gta6 Dependencies
- gta6-3d Props
- Voice & Sound Production
- Playwright Stills Rendering
- cretaceous TTS Tools
- gta6 v1 Gamer Props
- Audio Mix Build
- Characters (Hero, Cretaceous Squad)
- gta6 v1 Remotion Entry
- gta6 TS Config
- Cretaceous Storyboard & Style
- Remotion Config & Stills
- gta6-3d Street Sets
- gta6-3d TS Config
- gta6-day TS Config
- Script Formula & Twists
- pvz1 Locations
- swap1 Locations
- vasya1 Locations
- gta6 v1 Shot Helpers
- Horror Train Director Rules
- Channel Style & Competitors
- protein30 Renderer
- pvz1 Renderer
- swap1 Renderer
- vasya1 Renderer
- Script Formula & Voice Chunking
- Horror Train Concept
- Protein Production Plan
- pvz1 Style Cards
- Render Pipeline & Safe Zones
- swap1 Demo Locations
- Protein Reference Project
- swap1 Style Cards
- Night Shift & Horror Voices
- Zheka & Vas Meme
- vasya1 Style Cards
- Shorts Pipeline Skill
- Skill Setup Script
- C# Practice Project
- gta6-3d TTS Script
- gta6-day TTS Script
- protein30 Mix Script
- pvz1 Mix Script
- swap1 Mix Script
- vasya1 Mix Script

## God Nodes (most connected - your core abstractions)
1. `Box()` - 56 edges
2. `fitText()` - 37 edges
3. `Sign()` - 33 edges
4. `Screen()` - 32 edges
5. `Cyl()` - 26 edges
6. `Room()` - 24 edges
7. `Box()` - 23 edges
8. `fitText()` - 20 edges
9. `useSec()` - 20 edges
10. `canvasTex()` - 20 edges

## Surprising Connections (you probably didn't know these)
- `Mandatory Script Formula (8 rules)` --semantically_similar_to--> `Script Formula (hook, one world rule, counter escalation, twist)`  [INFERRED] [semantically similar]
  brief_scenarist/00_ПРОЧИТАЙ_МЕНЯ.md → .claude/skills/chto-esli-shorts/SKILL.md
- `Visual World for Storyboards` --semantically_similar_to--> `Notebook Grid + Juicy Flat Style`  [INFERRED] [semantically similar]
  brief_scenarist/00_ПРОЧИТАЙ_МЕНЯ.md → .claude/skills/chto-esli-shorts/SKILL.md
- `Бумажный театр (Paper Theatre) Visual Bible` --semantically_similar_to--> `Notebook Grid + Juicy Flat Style`  [INFERRED] [semantically similar]
  cretaceous_ep1/script/style.md → .claude/skills/chto-esli-shorts/SKILL.md
- `Twist: «Requires PlayStation 9»` --semantically_similar_to--> `Twist: It Was a Dream, Mom Keeps Flour in the Jar`  [INFERRED] [semantically similar]
  gta6/script/voice.txt → brief_scenarist/01_пример_озвучка_протеин.txt
- `ElevenLabs Eleven v3, голос George, /with-timestamps` --semantically_similar_to--> `ElevenLabs TTS / Voice Design`  [INFERRED] [semantically similar]
  protein30/script/plan.md → horror_train/00_docs/03_voiceover.md

## Import Cycles
- None detected.

## Hyperedges (group relationships)
- **Что, если…? Production Pipeline (voiceover → align → render → publish)** — _claude_skills_chto_esli_shorts_skill_fish_audio_voiceover, _claude_skills_chto_esli_shorts_skill_align_py, _claude_skills_chto_esli_shorts_skill_render_mjs, _claude_skills_chto_esli_shorts_skill_publication_rules [EXTRACTED 1.00]
- **Cretaceous Ep1 Squad & Threat** — cretaceous_ep1_script_characters_ryadovoy_kotov, cretaceous_ep1_script_characters_char_bugaev, cretaceous_ep1_script_characters_char_petrov, cretaceous_ep1_script_characters_char_lis, cretaceous_ep1_script_characters_char_rex, cretaceous_ep1_script_characters_btr_317 [EXTRACTED 1.00]
- **GTA 6 Video Variants** — gta6_script_voice_gta6_delayed_voiceover, gta6_3d_script_voice_gta6_delayed_voiceover, gta6_day_script_voice_gta6_release_day_voiceover, gta6_3d_readme_gta6_3d_project [INFERRED 0.85]
- **Производственный пайплайн «Поезд № 317» (сценарий → кадры → озвучка → звук → монтаж)** — horror_train_00_docs_01_script_train_317_script, horror_train_00_docs_02_visual_prompts_visual_prompts, horror_train_00_docs_03_voiceover_voiceover, horror_train_00_docs_04_sfx_prompts_sfx_prompts, horror_train_00_docs_05_capcut_edit_plan_capcut_edit_plan, horror_train_readme_production_package [EXTRACTED 1.00]
- **Сценарии озвучки канала «Что, если…?» с аудиотегами ElevenLabs** — protein30_script_voice_voice_script, pvz1_script_voice_voice_script, swap1_script_voice_voice_script, vasya1_script_voice_voice_script, protein30_script_voice_audio_tags [INFERRED 0.85]
- **Фирменная визуальная система «Сочный флэт»** — protein30_script_style_mood_backgrounds, protein30_script_style_day_card_achievements, protein30_script_style_red_keyword_subtitles, protein30_script_style_layout_zones, protein30_script_style_hero_ty [EXTRACTED 1.00]

## Communities (83 total, 20 thin omitted)

### Community 0 - "Python Tools & Alignment"
Cohesion: 0.06
Nodes (75): beep(), bloop(), boom(), bul(), cash(), click(), crunch(), ding() (+67 more)

### Community 1 - "vasya1 Draw Library"
Cohesion: 0.10
Nodes (39): at(), bgMix(), bgPaper(), boxMonster(), C(), clamp(), dog(), easeInOut() (+31 more)

### Community 2 - "pvz1 Draw Library"
Cohesion: 0.10
Nodes (38): at(), bgMix(), bgPaper(), boxMonster(), C(), clamp(), dog(), easeInOut() (+30 more)

### Community 3 - "gta6-day 3D Kit"
Cohesion: 0.13
Nodes (42): Box(), Cyl(), getLineMat(), Lamp(), Plant(), popAt(), Room(), Screen() (+34 more)

### Community 4 - "swap1 Draw Library"
Cohesion: 0.10
Nodes (35): at(), bgMix(), bgPaper(), C(), clamp(), dog(), easeInOut(), easeOut() (+27 more)

### Community 5 - "gta6-3d Doodle Characters"
Cohesion: 0.07
Nodes (36): CH, CW, drawDoodle(), EXPR, Look, PLANE_H, PLANE_W, Pose (+28 more)

### Community 6 - "gta6-day Doodle Characters"
Cohesion: 0.07
Nodes (35): CH, CW, drawDoodle(), EXPR, Look, PLANE_H, PLANE_W, Pose (+27 more)

### Community 7 - "protein30 Draw Library"
Cohesion: 0.11
Nodes (31): at(), bgMix(), bgPaper(), C(), clamp(), dog(), easeInOut(), easeOut() (+23 more)

### Community 8 - "gta6-3d Captions"
Cohesion: 0.10
Nodes (28): build(), Cap, Captions(), CENSOR, norm(), RED, REPL, Cover() (+20 more)

### Community 9 - "gta6 v1 Story Scenes"
Cohesion: 0.07
Nodes (25): LIB, buildGroups(), buildSfx(), CENSOR, END, faceCU(), gameBox(), GROUPS (+17 more)

### Community 10 - "cretaceous_ep1 Dependencies"
Cohesion: 0.08
Nodes (33): dependencies, @fontsource/jetbrains-mono@5.1.1, @fontsource/montserrat@5.1.0, postprocessing@6.36.4, react@18.3.1, react-dom@18.3.1, @react-three/fiber@8.17.10, @react-three/postprocessing@2.16.3 (+25 more)

### Community 11 - "gta6-3d Sets & Helpers"
Cohesion: 0.13
Nodes (33): clamp(), crowd(), ease(), fitText(), FONT, lerp(), popAt(), useSec() (+25 more)

### Community 12 - "pvz1 Scenes"
Cohesion: 0.07
Nodes (25): ACH, achievement(), BROKE, brokenBoard(), CENSOR, clip(), door(), END (+17 more)

### Community 13 - "gta6-day Captions"
Cohesion: 0.10
Nodes (26): build(), Cap, Captions(), CENSOR, norm(), RED, REPL, Root() (+18 more)

### Community 14 - "protein30 Style Frames"
Cohesion: 0.12
Nodes (27): achievement(), arrow(), base, bgMarker(), bgMix(), { chromium }, dayCard(), face() (+19 more)

### Community 15 - "vasya1 Scenes"
Cohesion: 0.08
Nodes (24): ACH, achievement(), CENSOR, CLOCK, END, firstOf(), frame(), GROUPS (+16 more)

### Community 16 - "gta6-day SFX Synth"
Cohesion: 0.19
Nodes (29): beep(), bloop(), boom(), bul(), cash(), click(), crunch(), ding() (+21 more)

### Community 17 - "gta6 SFX Synth"
Cohesion: 0.19
Nodes (29): beep(), bloop(), boom(), bul(), cash(), click(), crunch(), ding() (+21 more)

### Community 18 - "protein30 SFX Synth"
Cohesion: 0.19
Nodes (29): beep(), bloop(), boom(), bul(), cash(), click(), crunch(), ding() (+21 more)

### Community 19 - "pvz1 SFX Synth"
Cohesion: 0.19
Nodes (29): beep(), bloop(), boom(), bul(), cash(), click(), crunch(), ding() (+21 more)

### Community 20 - "swap1 Scenes"
Cohesion: 0.09
Nodes (26): ACH, achievement(), CENSOR, clip(), CLOCK, clockCard(), closeHero(), COL (+18 more)

### Community 21 - "swap1 SFX Synth"
Cohesion: 0.19
Nodes (29): beep(), bloop(), boom(), bul(), cash(), click(), crunch(), ding() (+21 more)

### Community 22 - "vasya1 SFX Synth"
Cohesion: 0.19
Nodes (29): beep(), bloop(), boom(), bul(), cash(), click(), crunch(), ding() (+21 more)

### Community 23 - "gta6-3d Dependencies"
Cohesion: 0.09
Nodes (29): dependencies, postprocessing@6.36.4, react@18.3.1, react-dom@18.3.1, @react-three/fiber@8.17.10, @react-three/postprocessing@2.16.3, remotion@4.0.250, @remotion/cli@4.0.250 (+21 more)

### Community 24 - "gta6-day Dependencies"
Cohesion: 0.09
Nodes (29): dependencies, postprocessing@6.36.4, react@18.3.1, react-dom@18.3.1, @react-three/fiber@8.17.10, @react-three/postprocessing@2.16.3, remotion@4.0.250, @remotion/cli@4.0.250 (+21 more)

### Community 25 - "gta6-day Props & Furniture"
Cohesion: 0.17
Nodes (24): bonkAt(), Chair(), Couch(), Desk(), FONT, Neon(), Shelf(), V3 (+16 more)

### Community 26 - "gta6-day City & Helpers"
Cohesion: 0.15
Nodes (27): clamp(), crowd(), ease(), fitText(), lerp(), EmptyStreet(), loadDraw(), mapDraw() (+19 more)

### Community 27 - "gta6 v1 Scene Library"
Cohesion: 0.12
Nodes (21): building(), CAPS, caption(), clamp(), DRAFTS, easeInOut(), easeOut(), easeOutBack() (+13 more)

### Community 28 - "gta6-day Cover & Sets"
Cohesion: 0.16
Nodes (22): Cover(), stroke(), Building(), canvasTex(), Doodle(), HEAD_Z, label(), Palm() (+14 more)

### Community 29 - "gta6-day Shots & Props"
Cohesion: 0.09
Nodes (18): Actor, padHands, Can(), SixPack(), ANCHOR, BOSS, Bub, CEO (+10 more)

### Community 30 - "protein30 Scenes"
Cohesion: 0.12
Nodes (21): ACH, achievement(), CENSOR, COL, DAY, dayCard(), END, firstOf() (+13 more)

### Community 31 - "gta6-3d Poses & Screens"
Cohesion: 0.11
Nodes (18): armsUp(), bonkAt(), HIP, pointKeys(), REST_B, drawBg(), ANCHOR, DIR (+10 more)

### Community 32 - "gta6 Dependencies"
Cohesion: 0.12
Nodes (20): dependencies, react@18.3.1, react-dom@18.3.1, remotion@4.0.250, @remotion/cli@4.0.250, devDependencies, @types/react@18.3.12, typescript@5.6.3 (+12 more)

### Community 33 - "gta6-3d Props"
Cohesion: 0.30
Nodes (17): Box(), Chair(), Couch(), Cyl(), Desk(), Lamp(), Plant(), Room() (+9 more)

### Community 34 - "Voice & Sound Production"
Cohesion: 0.18
Nodes (14): ElevenLabs TTS / Voice Design, Реплики и озвучка, ElevenLabs Sound Effects / freesound.org, Слои микса AMB / SFX / VO / MUS и уровни (−14 LUFS), Звуковой дизайн и промпты SFX, Монтаж в CapCut — пошаговый план, Раскладка дорожек V1–V5 / A1–A5, Аниматик animatic.mp4 (+6 more)

### Community 35 - "Playwright Stills Rendering"
Cohesion: 0.13
Nodes (12): { chromium }, DIR, OUT, require, { chromium }, DIR, OUT, require (+4 more)

### Community 36 - "cretaceous TTS Tools"
Cohesion: 0.13
Nodes (13): all, DIR, info, o, onnx, out, paras, require (+5 more)

### Community 37 - "gta6 v1 Gamer Props"
Cohesion: 0.28
Nodes (16): C(), consoleBox(), dateCard(), gamer(), monitor(), notif(), post(), R() (+8 more)

### Community 38 - "Audio Mix Build"
Cohesion: 0.15
Nodes (7): OUT, ROOT, MUS, OUT, ROOT, OUT, ROOT

### Community 39 - "Characters (Hero, Cretaceous Squad)"
Cohesion: 0.21
Nodes (11): Hero «Ты» (skinny guy, tomato T-shirt «0»), BTR No. 317 with Heavy Machine Gun, Сержант Бугаев (CHAR_BUGAEV), Лисицын, Signalman (CHAR_LIS), Петров (CHAR_PETROV), Tyrannosaurus (CHAR_REX), Сёма (CHAR_SEMA) — Main Hero, Paper Puppet Character Passports (+3 more)

### Community 40 - "gta6 v1 Remotion Entry"
Cohesion: 0.21
Nodes (9): FONTS, Gta6Delay(), handle, Root(), FPS, H, W, frame() (+1 more)

### Community 41 - "gta6 TS Config"
Cohesion: 0.15
Nodes (12): compilerOptions, allowJs, esModuleInterop, jsx, lib, module, moduleResolution, noEmit (+4 more)

### Community 42 - "Cretaceous Storyboard & Style"
Cohesion: 0.18
Nodes (11): Cretaceous Ep1 Storyboard (15 shots), Danger Devices (paper tear, black silhouette, light dims, theatre vibration), Genre Palettes (survival, horror, catastrophe, space), Materials as Paper Types, Paper Strip Subtitles & Time Tag, Бумажный театр (Paper Theatre) Visual Bible, Prompt Templates for Reference Generators, Camera & Puppet Motion Rules (+3 more)

### Community 43 - "Remotion Config & Stills"
Cohesion: 0.21
Nodes (4): files, ROOT, files, ROOT

### Community 44 - "gta6-3d Street Sets"
Cohesion: 0.26
Nodes (12): Building(), canvasTex(), label(), Neon(), Palm(), Sign(), SunsetSky(), HQ() (+4 more)

### Community 45 - "gta6-3d TS Config"
Cohesion: 0.17
Nodes (11): compilerOptions, allowJs, esModuleInterop, jsx, lib, module, moduleResolution, resolveJsonModule (+3 more)

### Community 46 - "gta6-day TS Config"
Cohesion: 0.17
Nodes (11): compilerOptions, allowJs, esModuleInterop, jsx, lib, module, moduleResolution, resolveJsonModule (+3 more)

### Community 47 - "Script Formula & Twists"
Cohesion: 0.23
Nodes (9): Абсурд-эскалация «по дням» с твистом, Факты: ≈625 г порошка в день, потеря воды, Раскадровка «30 дней только протеин», Карточка дня, табло и ачивки, Постоянный герой «Ты» (дрыщ с вихром-антенной), Стиль канала «Что, если…?» — «Сочный флэт», Фон-лучи: цвет = настроение дня, Субтитры Oswald 700 с красным ключевым словом (+1 more)

### Community 51 - "gta6 v1 Shot Helpers"
Cohesion: 0.45
Nodes (11): at(), bubble(), pop(), s10(), s2(), s4(), s5(), s8() (+3 more)

### Community 52 - "Horror Train Director Rules"
Cohesion: 0.20
Nodes (8): Вспышки дуги контактной сети, Kling 2.x Image-to-Video, Midjourney v7 / Flux Kontext (генерация и редактирование кадров), Общий негативный промпт (без текста, лиц, монстров), Готовые оверлеи (титры, силуэт, CCTV, VHS-шум), Типы кадров I2V / STILL / STILL_PAIR / BLACK, Промпты для генерации кадров, Цветокоррекция корректирующим слоем + CCTV-монохром

### Community 53 - "Channel Style & Competitors"
Cohesion: 0.24
Nodes (9): Achievements & DAY Card HUD, Competitor _stellarr_, Mom Character, Notebook Grid + Juicy Flat Style, Competitor _stellarr_ Moves to Avoid, Idea Queue (swapped hand/foot, snail million, phone PC…), Scenarist Brief for «Что, если…?» Channel, Viral Reference Videos Analysis (+1 more)

### Community 54 - "protein30 Renderer"
Cohesion: 0.20
Nodes (8): args, { chromium }, data, FPS, OUT, preview, require, ROOT

### Community 55 - "pvz1 Renderer"
Cohesion: 0.20
Nodes (8): args, { chromium }, data, FPS, OUT, preview, require, ROOT

### Community 56 - "swap1 Renderer"
Cohesion: 0.20
Nodes (8): args, { chromium }, data, FPS, OUT, preview, require, ROOT

### Community 57 - "vasya1 Renderer"
Cohesion: 0.20
Nodes (8): args, { chromium }, data, FPS, OUT, preview, require, ROOT

### Community 58 - "Script Formula & Voice Chunking"
Cohesion: 0.28
Nodes (5): Fish Audio Voiceover Chunking (≤480 bytes), GTA 6 Delayed Voiceover (3D version), GTA 6 Release Day Voiceover («грипп GTA»), GTA 6 Delayed Voiceover (original), Twist: «Requires PlayStation 9»

### Community 59 - "Horror Train Concept"
Cohesion: 0.25
Nodes (3): Analog horror / found footage (советский ж/д хоррор), Поезд № 317 — финальный сценарий, Разметка 1080×1920 (безопасные зоны TikTok)

### Community 60 - "Protein Production Plan"
Cohesion: 0.28
Nodes (9): ElevenLabs Eleven v3, голос George, /with-timestamps, План производства «30 дней только протеин», Remotion (React) + SVG — рендер в облаке, Субтитры из таймстемпов (1–3 слова, whisper.cpp запасной), Аудиотеги ElevenLabs v3 ([excited], [whispers], [sighs], [tense]), Текст озвучки «30 дней только протеин», Рука и нога поменялись — фрагменты озвучки (9 чанков), Рука и нога меняются местами на один день (+1 more)

### Community 62 - "Render Pipeline & Safe Zones"
Cohesion: 0.25
Nodes (5): align.py Word Timing Alignment, render.mjs Render Pipeline (stills/video/cover, scene.js SHOTS), gta6-3d File Layout (shots.tsx, sets.tsx, kit.tsx, captions.tsx, words.json), GTA 6 Delayed — 3D Doodle Version Project, Remotion + three.js Render (Gta6Doodle composition)

### Community 64 - "Protein Reference Project"
Cohesion: 0.33
Nodes (7): protein30/render/draw.js Element Library, protein30 Reference Project, Twist: It Was a Dream, Mom Keeps Flour in the Jar, Protein 30 Days Voiceover Example, Cover Split Before/After (3:4), Hero Growth Stages (skinny → one arm → giant → mountain), Protein 30 Days Storyboard (16 shots)

### Community 66 - "Night Shift & Horror Voices"
Cohesion: 0.40
Nodes (6): Проводник (голос в громкоговорителе), Существо в буране, подражающее голосам, ПВЗ — фрагменты озвучки (6 чанков), Высокий клиент без лица и без кода, Правила ночной смены ПВЗ, Текст озвучки «Ночная смена в ПВЗ»

### Community 67 - "Zheka & Vas Meme"
Cohesion: 0.33
Nodes (6): Жека (тупой друг), Жека-пришелец «Вась» — фрагменты озвучки (7 чанков), Фраза-мем «А Вась?» / «Вась», Твист: у героя в зеркале антенна, Текст озвучки «Жека проснулся пришельцем», Жека — пришелец на сутки, всем всё равно

### Community 69 - "Shorts Pipeline Skill"
Cohesion: 0.40
Nodes (5): Ad Banner Integration with Freeze-Frame, Что, если…? Shorts Pipeline Skill, inspect_video.py Reference Analysis, Publication Rules (description, 15-20 hashtags, pinned comment), Per-Video Deliverables List

## Knowledge Gaps
- **24 isolated node(s):** `net6.0`, `Microsoft.NET.Sdk`, `inspect_video.py Reference Analysis`, `Ad Banner Integration with Freeze-Frame`, `Idea Queue (swapped hand/foot, snail million, phone PC…)` (+19 more)
  These have ≤1 connection - possible missing edges or undocumented components. (Counts symbols only; 475 node(s) total have ≤1 connection when file, concept and rationale nodes are included.)
- **20 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `Монтаж в CapCut — пошаговый план` connect `Voice & Sound Production` to `Python Tools & Alignment`, `Horror Train Concept`, `Horror Train Director Rules`?**
  _High betweenness centrality (0.012) - this node is a cross-community bridge._
- **What connects `net6.0`, `Microsoft.NET.Sdk`, `inspect_video.py Reference Analysis` to the rest of the system?**
  _24 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `Python Tools & Alignment` be split into smaller, more focused modules?**
  _Cohesion score 0.060328185328185326 - nodes in this community are weakly interconnected._
- **Why does `«Не выходите из поезда» — производственный пакет` connect `Voice & Sound Production` to `Horror Train Concept`, `Horror Train Director Rules`?**
  _High betweenness centrality (0.006) - this node is a cross-community bridge._
- **Should `vasya1 Draw Library` be split into smaller, more focused modules?**
  _Cohesion score 0.10241545893719807 - nodes in this community are weakly interconnected._
- **Why does `Звуковой дизайн и промпты SFX` connect `Voice & Sound Production` to `Horror Train Concept`?**
  _High betweenness centrality (0.006) - this node is a cross-community bridge._
- **Should `pvz1 Draw Library` be split into smaller, more focused modules?**
  _Cohesion score 0.10303030303030303 - nodes in this community are weakly interconnected._