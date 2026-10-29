// Звуки Ч2 по секундам голоса + музыка (всегда тише голоса).
import React from "react";
import { Audio, Sequence, interpolate, staticFile } from "remotion";
const FPS = 30;
const CUES: [number, string, number][] = [
  [0, "breath", 0.45], [2.4, "sniff", 0.35], [7.0, "creak", 0.4], [8.8, "creak", 0.3],
  [14.1, "boomecho", 0.6], [16.6, "tick1", 0.3], [17.6, "tick1", 0.3], [18.5, "tick1", 0.3], [19.3, "tick1", 0.3],
  [20.2, "paper", 0.4], [22.0, "paper", 0.3], [25.7, "paper", 0.4],
  [27.9, "sizzle", 0.3], [29.9, "bark", 0.4], [31.2, "bark", 0.35],
  [33.3, "sniff", 0.55], [35.4, "tick1", 0.35], [36.2, "tick1", 0.35], [36.8, "tick1", 0.35], [37.6, "tuk", 0.4], [38.7, "snort", 0.75], [39.4, "steps", 0.6],
  [43.1, "tick1", 0.4], [44.4, "tick1", 0.4], [46.3, "tick1", 0.4],
  [49.4, "tick", 0.25], [51.6, "sniff", 0.25],
  [54.5, "glug", 0.35], [56.4, "paper", 0.45], [57.6, "paper", 0.3],
  [61.35, "cicadas", 0.12], [62.6, "snore", 0.3], [64.1, "click", 0.7], [64.3, "tuk", 0.3], [66.6, "cicadas", 0.12], [66.0, "roar_far", 0.3],
  [68.3, "tuk", 0.3], [69.9, "cicadas", 0.13],
  [74.9, "bass", 0.8], [77.05, "bass", 0.85], [77.95, "bass", 0.9], [79.4, "bass", 1.0],
  [82.8, "static", 0.3], [85.35, "radio_voice", 1.0], [89.6, "hit", 0.85],
];
export const SFX: React.FC = () => (<>
  {CUES.map(([t, n, v], i) => (
    <Sequence key={i} from={Math.round(t * FPS)} durationInFrames={n === "cicadas" && t > 69 ? Math.round((72.9 - t) * FPS) : undefined}>
      <Audio src={staticFile(`sfx/${n}.wav`)} volume={v} /></Sequence>))}
  <Sequence from={0} durationInFrames={Math.round(61.6 * FPS)}>
    <Audio src={staticFile("music_a.wav")} volume={(f) => interpolate(f / FPS, [0, 1.5, 59, 61.6], [0, 0.11, 0.11, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" })} /></Sequence>
  <Sequence from={Math.round(61.0 * FPS)}>
    <Audio src={staticFile("music_b.wav")} volume={(f) => interpolate(f / FPS, [0, 2, 11.5, 12.5, 13.2, 24, 29.4, 30.4], [0, 0.12, 0.12, 0.03, 0.03, 0.14, 0.14, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" })} /></Sequence>
</>);
