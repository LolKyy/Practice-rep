// Звуки Ч5: тихо и мягко, голос главный. Итог выравнивается до −14 LUFS.
import React from "react";
import { Audio, Sequence, interpolate, staticFile } from "remotion";
const FPS = 30;
const CUES: [number, string, number, number?][] = [
  [0.5, "woodhit", 0.3], [2.4, "woodhit", 0.26], [4.3, "woodhit", 0.24], [1.2, "teeth", 0.1],
  [6.1, "diesel", 0.14], [6.3, "stomp", 0.16], [8.7, "stomp", 0.14], [10.9, "stomp", 0.12],
  [16.3, "static", 0.05],
  [18.9, "pulley", 0.16], [20.4, "diesel", 0.1], [22.3, "pulley", 0.12], [22.6, "woodhit", 0.26],
  [24.6, "shutdown", 0.12], [34.2, "crackle", 0.12, 2.3], [44.2, "flash_boom", 0.22],
  [49.0, "flash_boom", 0.1], [52.0, "windmill", 0.1], [56.0, "windmill", 0.08], [52.0, "crackle", 0.06, 8],
  [60.3, "paper", 0.12], [75.8, "paper", 0.12], [85.6, "paper", 0.14], [86.6, "paper", 0.14], [87.6, "paper", 0.12],
  [85.0, "tick1", 0.18], [92.4, "tuk", 0.2], [95.4, "click", 0.12], [96.4, "roar_dist", 0.14],
];
export const SFX: React.FC = () => (<>
  {CUES.map(([t, n, v, d], i) => <Sequence key={i} from={Math.round(t * FPS)} durationInFrames={d ? Math.round(d * FPS) : undefined}><Audio src={staticFile(`sfx/${n}.wav`)} loop={!!d} volume={v} /></Sequence>)}
  <Sequence from={0} durationInFrames={Math.round(25 * FPS)}>
    <Audio src={staticFile("music_a.wav")} volume={(f) => interpolate(f / FPS, [0, 0.5, 23, 25], [0, 0.07, 0.07, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" })} /></Sequence>
  <Sequence from={Math.round(24.5 * FPS)}>
    <Audio src={staticFile("music_b.wav")} volume={(f) => interpolate(f / FPS, [0, 3, 68, 72.5], [0, 0.06, 0.06, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" })} /></Sequence>
</>);
