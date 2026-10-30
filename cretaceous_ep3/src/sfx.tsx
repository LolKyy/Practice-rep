// Звуки Ч3: мало, тихо, мягко (голос всегда главный). Итог потом выравнивается до −14 LUFS.
import React from "react";
import { Audio, Sequence, interpolate, staticFile } from "remotion";
const FPS = 30;
const CUES: [number, string, number][] = [
  [0.85, "whoosh", 0.12], [1.75, "whoosh", 0.12], [2.65, "whoosh", 0.12], [3.55, "whoosh", 0.12],
  [5.0, "drip", 0.12], [7.6, "drip", 0.1],
  [10.3, "breath", 0.12], [12.2, "teeth", 0.12],
  [18.8, "metalhit", 0.3], [19.8, "scrape", 0.14], [21.9, "roofthump", 0.25], [23.4, "sniff", 0.1],
  [29.55, "hatchhit", 0.3],
  [59.4, "hatchcreak", 0.1], [62.4, "canthud", 0.16], [63.1, "canthud", 0.16], [63.8, "canthud", 0.16], [64.5, "canthud", 0.16], [65.2, "canthud", 0.16],
  [65.6, "tuk", 0.12], [67.8, "stomp", 0.22], [68.3, "squawk", 0.12],
  [72.2, "tick", 0.06],
  [77.5, "wind", 0.08], [78.0, "birds", 0.1], [84.0, "birds", 0.07],
  [85.2, "pencil", 0.12], [87.6, "pencil", 0.12], [89.6, "pencil", 0.12], [53.6, "pencil", 0.12],
  [95.0, "paper", 0.1], [113.4, "hit", 0.22],
];
export const SFX: React.FC = () => (<>
  {CUES.map(([t, n, v], i) => <Sequence key={i} from={Math.round(t * FPS)}><Audio src={staticFile(`sfx/${n}.wav`)} volume={v} /></Sequence>)}
  <Sequence from={Math.round(4.5 * FPS)} durationInFrames={Math.round(73.5 * FPS)}>
    <Audio src={staticFile("music_a.wav")} volume={(f) => interpolate(f / FPS, [0, 2, 70, 73.5], [0, 0.07, 0.07, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" })} /></Sequence>
  <Sequence from={Math.round(77.5 * FPS)}>
    <Audio src={staticFile("music_b.wav")} volume={(f) => interpolate(f / FPS, [0, 2.5, 34, 38], [0, 0.07, 0.07, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" })} /></Sequence>
</>);
