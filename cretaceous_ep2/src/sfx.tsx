// Звуки Ч2 по секундам голоса + музыка (всегда тише голоса).
import React from "react";
import { Audio, Sequence, interpolate, staticFile } from "remotion";
const FPS = 30;
const CUES: [number, string, number][] = [
  [0, "breath", 0.18], [2.4, "sniff", 0.1], [7.0, "creak", 0.08],
  [14.1, "boomecho", 0.28],
  [20.2, "paper", 0.12], [25.7, "paper", 0.1],
  [27.9, "sizzle", 0.07], [30.0, "bark", 0.07],
  [33.3, "sniff", 0.14], [38.7, "snort", 0.25], [39.4, "steps", 0.28],
  [43.1, "tick1", 0.08], [44.4, "tick1", 0.08], [46.3, "tick1", 0.08],
  [54.5, "glug", 0.12], [56.4, "paper", 0.12],
  [61.35, "cicadas", 0.05], [62.6, "snore", 0.1], [64.1, "click", 0.2], [66.6, "cicadas", 0.05], [66.0, "roar_far", 0.12],
  [69.9, "cicadas", 0.05],
  [74.9, "bass", 0.3], [77.05, "bass", 0.32], [77.95, "bass", 0.34], [79.4, "bass", 0.38],
  [83.0, "static", 0.06], [85.35, "radio_voice", 0.9], [89.6, "hit", 0.3],
];
export const SFX: React.FC = () => (<>
  {CUES.map(([t, n, v], i) => (
    <Sequence key={i} from={Math.round(t * FPS)} durationInFrames={n === "cicadas" && t > 69 ? Math.round((72.9 - t) * FPS) : undefined}>
      <Audio src={staticFile(`sfx/${n}.wav`)} volume={v} /></Sequence>))}
  <Sequence from={0} durationInFrames={Math.round(61.6 * FPS)}>
    <Audio src={staticFile("music_a.wav")} volume={(f) => interpolate(f / FPS, [0, 1.5, 59, 61.6], [0, 0.08, 0.08, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" })} /></Sequence>
  <Sequence from={Math.round(61.0 * FPS)}>
    <Audio src={staticFile("music_b.wav")} volume={(f) => interpolate(f / FPS, [0, 2, 11.5, 12.5, 13.2, 24, 29.4, 30.4], [0, 0.08, 0.08, 0.02, 0.02, 0.09, 0.09, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" })} /></Sequence>
</>);
