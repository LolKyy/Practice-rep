// Звуки по секундам голоса + музыка (всегда тише голоса).
import React from "react";
import { Audio, Sequence, interpolate, staticFile } from "remotion";
const FPS = 30;
const nt = (t: number) => t + (t < 25.55 ? 1.23 : t < 33.4 ? 1.13 : 1.32);   // старое время → время склеенного голоса
const CUES: [number, string, number][] = [
  [0, "hum", 0.22], [5.6, "screech", 0.35], [8.7, "tear", 0.5], [9.0, "boom", 0.55], [10.3, "cicadas", 0.12], [12.2, "cicadas", 0.1],
  [19.3, "diesel", 0.3], [20.5, "crunch", 0.4], [21.8, "crunch", 0.35], [23.1, "crunch", 0.4], [24.2, "crunch", 0.3],
  [25.7, "static", 0.25], [30.5, "beep", 0.25], [31.3, "beep", 0.25], [32.1, "beep", 0.25],
  [34.0, "paper", 0.5], [36.8, "paper", 0.4], [38.3, "paper", 0.4],
  ...Array.from({ length: 10 }, (_, i) => [38.45 + i * 0.24, "tuk", 0.35] as [number, string, number]),
  [42.6, "glug", 0.35], [49.0, "glug", 0.35], [52.1, "tick", 0.3], [54.6, "paper", 0.3], [56.8, "tear", 0.4],
  [58.5, "tuk", 0.5], [59.3, "tuk", 0.4], [59.5, "tuk", 0.4], [59.7, "tuk", 0.4], [59.9, "tuk", 0.4], [61.3, "sting", 0.35],
  [65.0, "wings", 0.55], [66.6, "screech", 0.2], [77.9, "click", 0.6], [78.2, "shutdown", 0.45], [80.0, "cicadas", 0.08],
  [85.0, "thud", 0.9], [87.25, "thud", 0.95], [88.5, "thud", 1.0], [89.6, "breath", 0.45], [93.3, "click", 0.6], [98.9, "hit", 0.9],
];
export const SFX: React.FC = () => (<>
  {CUES.map(([t, n, v], i) => <Sequence key={i} from={Math.round((t === 0 ? 0 : nt(t)) * FPS)}><Audio src={staticFile(`sfx/${n}.wav`)} volume={v} /></Sequence>)}
  <Sequence from={0} durationInFrames={Math.round(nt(71.5) * FPS)}>
    <Audio src={staticFile("music_a.wav")} volume={(f) => interpolate(f / FPS, [0, 1.5, nt(68.5), nt(71.5)], [0, 0.12, 0.12, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" })} /></Sequence>
  <Sequence from={Math.round(nt(77.5) * FPS)}>
    <Audio src={staticFile("music_b.wav")} volume={(f) => interpolate(f / FPS, [0, 3, 21, 23.5], [0, 0.14, 0.14, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" })} /></Sequence>
</>);
