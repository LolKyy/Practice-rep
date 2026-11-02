// Звуки Ч4: мало, тихо, мягко (голос главный). Итог выравнивается до −14 LUFS.
import React from "react";
import { Audio, Sequence, interpolate, staticFile } from "remotion";
const FPS = 30;
const CUES: [number, string, number, number?][] = [
  [0, "river", 0.07, 7], [4.8, "bellow", 0.1],
  [7.0, "engine_low", 0.08], [14.8, "engine_low", 0.08], [16.8, "engine_low", 0.07], [18.8, "engine_low", 0.07], [22.1, "splash", 0.12],
  [24.9, "chop", 0.14], [25.4, "chop", 0.14], [25.95, "chop", 0.14], [26.5, "chop", 0.12],
  [27.0, "wind", 0.06],
  [30.6, "river", 0.07, 3], [32.4, "glug", 0.1], [33.4, "crackle", 0.14],
  [36.4, "river", 0.05, 3.7],
  [40.3, "splash", 0.16], [40.4, "river", 0.07, 23.6], [43.3, "engine_low", 0.08], [45.3, "engine_low", 0.07],
  [64.1, "bellow", 0.22], [66.2, "metalhit", 0.3], [66.3, "splash", 0.22], [68.3, "splash", 0.12],
  [64.0, "river", 0.07, 40], [80.4, "bellow", 0.12], [91.3, "engine_low", 0.07], [93.3, "engine_low", 0.07], [95.3, "engine_low", 0.07], [98.0, "splash", 0.1],
  [104.4, "wind", 0.06], [114.6, "static", 0.05], [120.5, "morse", 0.18],
  [124.4, "rustle", 0.16], [127.2, "rustle", 0.1], [128.2, "teeth", 0.08], [133.2, "hit", 0.22],
];
export const SFX: React.FC = () => (<>
  {CUES.map(([t, n, v, d], i) => <Sequence key={i} from={Math.round(t * FPS)} durationInFrames={d ? Math.round(d * FPS) : undefined}><Audio src={staticFile(`sfx/${n}.wav`)} loop={!!d} volume={v} /></Sequence>)}
  <Sequence from={0} durationInFrames={Math.round(105 * FPS)}>
    <Audio src={staticFile("music_a.wav")} volume={(f) => interpolate(f / FPS, [0, 2, 62, 63.6, 64.4, 102, 105], [0, 0.07, 0.07, 0.02, 0.02, 0.06, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" })} /></Sequence>
  <Sequence from={Math.round(104.0 * FPS)}>
    <Audio src={staticFile("music_b.wav")} volume={(f) => interpolate(f / FPS, [0, 2.5, 28, 32], [0, 0.08, 0.08, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" })} /></Sequence>
</>);
