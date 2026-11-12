# Graph Report - Practice-rep  (2026-11-12)

## Corpus Check
- 120 files · ~130,569 words
- Verdict: corpus is large enough that graph structure adds value.
- Unclassified: 21 file(s) not represented in the graph (top: (none) 13, .woff2 3, .csv 2)

## Summary
- 915 nodes · 2607 edges · 33 communities (23 shown, 10 thin omitted)
- Extraction: 98% EXTRACTED · 2% INFERRED · 0% AMBIGUOUS · INFERRED: 40 edges (avg confidence: 0.85)
- Token cost: 0 input · 0 output

## Community Hubs (Navigation)
- Epoch Ep01 Art
- Epoch Cut Primitives
- Horror/Protein Asset Builders
- UnseenReps 3D Kit
- MvD 2D Stair Scenes
- Blender Alarm Scene
- Whisper Timing Tools
- UnseenReps Dependencies
- Protein30 Draw Lib
- Cretaceous Dependencies
- Protein30 Style Frames
- Epoch Video Dependencies
- Beat-Synced Edit Template
- Protein30 Scene
- Cretaceous TTS
- Epoch Placeholder TTS
- Epoch Tools Package
- Protein30 Renderer
- UnseenReps TS Config
- Epoch TS Config
- Beat Detector
- Procedural Music
- UnseenReps Composition Root
- C# Practice Project
- Epoch Env Script
- Protein30 Audio Mix

## God Nodes (most connected - your core abstractions)
1. `cut()` - 62 edges
2. `Ep01()` - 43 edges
3. `rectP()` - 38 edges
4. `cut()` - 35 edges
5. `ellP()` - 34 edges
6. `rrectP()` - 33 edges
7. `fillP()` - 33 edges
8. `CanvasArt()` - 27 edges
9. `text()` - 25 edges
10. `Layer()` - 24 edges

## Surprising Connections (you probably didn't know these)
- `load_cues()` --indirect_call--> `f()`  [INFERRED]
  horror_train/tools/project.py → epoch-series/tools/tts-elevenlabs.py
- `load_shots()` --indirect_call--> `f()`  [INFERRED]
  horror_train/tools/project.py → epoch-series/tools/tts-elevenlabs.py
- `semaOnSofa()` --indirect_call--> `phone()`  [INFERRED]
  epoch-series/video/src/components/scenes.tsx → epoch-series/video/src/components/scenery.ts
- `S1()` --indirect_call--> `eo()`  [INFERRED]
  epoch-series/legacy_v1/Video.tsx → epoch-series/legacy_v1/stage2d.tsx
- `S4()` --indirect_call--> `back()`  [INFERRED]
  epoch-series/legacy_v1/Video.tsx → epoch-series/legacy_v1/stage2d.tsx

## Import Cycles
- None detected.

## Communities (33 total, 10 thin omitted)

### Community 0 - "Epoch Ep01 Art"
Cohesion: 0.06
Nodes (159): amphora(), AppOpts, appScreen(), crowd(), insula(), latrineBench(), latrineWall(), laurelFly() (+151 more)

### Community 1 - "Epoch Cut Primitives"
Cohesion: 0.08
Nodes (99): clipTo(), cut(), CutOpts, ellP(), fern(), fernBush(), fillP(), G (+91 more)

### Community 2 - "Horror/Protein Asset Builders"
Cohesion: 0.09
Nodes (63): analog_text(), band(), build_audio(), build_cctv(), build_noise(), build_silhouette(), build_titles(), cctv_frame() (+55 more)

### Community 3 - "UnseenReps 3D Kit"
Cohesion: 0.08
Nodes (42): Block(), camAt(), CamKey, CamRig(), clamp01(), Digits(), ease, FAST (+34 more)

### Community 4 - "MvD 2D Stair Scenes"
Cohesion: 0.11
Nodes (47): arm(), Body(), clamp01(), climb(), Cone(), ease(), FA, Figure() (+39 more)

### Community 5 - "Blender Alarm Scene"
Cohesion: 0.06
Nodes (24): books_on_shelf(), box(), cbox(), clock_show(), cyl(), emit_strength_key(), empty(), Hero (+16 more)

### Community 6 - "Whisper Timing Tools"
Cohesion: 0.09
Nodes (17): accent(), f(), pcm(), tts(), tts(), build_animatic(), card(), main() (+9 more)

### Community 7 - "UnseenReps Dependencies"
Cohesion: 0.07
Nodes (38): @react-three/drei, @remotion/google-fonts, dependencies, postprocessing@6.36.4, react@18.3.1, react-dom@18.3.1, @react-three/drei@9.117.3, @react-three/fiber@8.17.10 (+30 more)

### Community 8 - "Protein30 Draw Lib"
Cohesion: 0.11
Nodes (31): at(), bgMix(), bgPaper(), C(), clamp(), dog(), easeInOut(), easeOut() (+23 more)

### Community 9 - "Cretaceous Dependencies"
Cohesion: 0.08
Nodes (33): dependencies, @fontsource/jetbrains-mono@5.1.1, @fontsource/montserrat@5.1.0, postprocessing@6.36.4, react@18.3.1, react-dom@18.3.1, @react-three/fiber@8.17.10, @react-three/postprocessing@2.16.3 (+25 more)

### Community 10 - "Protein30 Style Frames"
Cohesion: 0.12
Nodes (27): achievement(), arrow(), base, bgMarker(), bgMix(), { chromium }, dayCard(), face() (+19 more)

### Community 11 - "Epoch Video Dependencies"
Cohesion: 0.10
Nodes (27): dependencies, @fontsource/caveat@5.1.0, @fontsource/jetbrains-mono@5.1.1, @fontsource/montserrat@5.1.0, react@18.3.1, react-dom@18.3.1, remotion@4.0.250, @remotion/cli@4.0.250 (+19 more)

### Community 12 - "Beat-Synced Edit Template"
Cohesion: 0.15
Nodes (20): BEATS, C, Edit(), EDIT_PLAN, isVideo(), Media(), Seg, SegText() (+12 more)

### Community 13 - "Protein30 Scene"
Cohesion: 0.12
Nodes (21): ACH, achievement(), CENSOR, COL, DAY, dayCard(), END, firstOf() (+13 more)

### Community 14 - "Cretaceous TTS"
Cohesion: 0.12
Nodes (13): all, DIR, info, o, onnx, out, paras, require (+5 more)

### Community 15 - "Epoch Placeholder TTS"
Cohesion: 0.13
Nodes (13): buf, chunks, DIR, k, onnx, out, paras, require (+5 more)

### Community 16 - "Epoch Tools Package"
Cohesion: 0.17
Nodes (12): author, dependencies, sherpa-onnx-node@^1.12.15, description, sherpa-onnx-node, keywords, license, main (+4 more)

### Community 17 - "Protein30 Renderer"
Cohesion: 0.15
Nodes (8): args, { chromium }, data, FPS, OUT, preview, require, ROOT

### Community 18 - "UnseenReps TS Config"
Cohesion: 0.17
Nodes (11): compilerOptions, esModuleInterop, jsx, lib, module, moduleResolution, noEmit, resolveJsonModule (+3 more)

### Community 19 - "Epoch TS Config"
Cohesion: 0.18
Nodes (10): compilerOptions, esModuleInterop, jsx, lib, module, moduleResolution, resolveJsonModule, skipLibCheck (+2 more)

### Community 20 - "Beat Detector"
Cohesion: 0.18
Nodes (9): beats, bpm, env, flux, iv, n, raw, W (+1 more)

### Community 21 - "Procedural Music"
Cohesion: 0.18
Nodes (8): bpm, buf, drop, dur, L, n, prog, R

### Community 22 - "UnseenReps Composition Root"
Cohesion: 0.33
Nodes (5): EDIT_TOTAL, Root(), MVD_TOTAL, PILOT_TOTAL, WKYC_TOTAL

## Knowledge Gaps
- **2 isolated node(s):** `net6.0`, `Microsoft.NET.Sdk`
  These have ≤1 connection - possible missing edges. (Counts symbols only; 275 node(s) total have ≤1 connection when file, concept and rationale nodes are included.)
- **10 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `@react-three/drei` connect `UnseenReps Dependencies` to `UnseenReps 3D Kit`?**
  _High betweenness centrality (0.041) - this node is a cross-community bridge._
- **Are the 3 inferred relationships involving `Ep01()` (e.g. with `saladBox()` and `shawarma()`) actually correct?**
  _`Ep01()` has 3 INFERRED edges - model-reasoned connections that need verification._
- **What connects `net6.0`, `Microsoft.NET.Sdk` to the rest of the system?**
  _2 weakly-connected nodes found - possible missing edges._
- **Should `Epoch Ep01 Art` be split into smaller, more focused modules?**
  _Cohesion score 0.05529817058683773 - nodes in this community are weakly interconnected._
- **Why does `@fontsource/caveat` connect `Epoch Video Dependencies` to `Epoch Ep01 Art`?**
  _High betweenness centrality (0.030) - this node is a cross-community bridge._
- **Should `Epoch Cut Primitives` be split into smaller, more focused modules?**
  _Cohesion score 0.07662249405368672 - nodes in this community are weakly interconnected._
- **Should `Horror/Protein Asset Builders` be split into smaller, more focused modules?**
  _Cohesion score 0.08578263841421736 - nodes in this community are weakly interconnected._