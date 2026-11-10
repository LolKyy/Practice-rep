// Ролик: шоты (src/shots.tsx) с растворениями 5 кадров + субтитры по одному слову + звук.
import React, { useEffect, useState } from "react";
import { AbsoluteFill, Audio, Sequence, continueRender, delayRender, interpolate, staticFile, useCurrentFrame } from "remotion";
import words from "./words.json";
import { setData, FPS, WORDS } from "./timeline.js";
setData(words);
import { SHOTS } from "./shots";
import { Captions } from "./captions";

const FONTS: [string, string, string][] = [["Rubik", "fonts/Rubik.ttf", "800"], ["Russo One", "fonts/RussoOne.ttf", "400"], ["Oswald", "fonts/Oswald.ttf", "700"]];
const useFonts = () => {
  const [h] = useState(() => delayRender("fonts"));
  useEffect(() => {
    Promise.all(FONTS.map(([n, f, w]) => new FontFace(n, `url(${staticFile(f)})`, { weight: w }).load().then((ff) => (document.fonts as any).add(ff))))
      .then(() => continueRender(h)).catch(() => continueRender(h));
  }, []);
};

console.log("SHOTS " + JSON.stringify(SHOTS.map((s) => [+s.t0.toFixed(2), +s.t1.toFixed(2)])));
const XF = 5; // кадров растворения
const ShotWrap: React.FC<{ i: number; children: React.ReactNode }> = ({ i, children }) => {
  const f = useCurrentFrame();
  const s = SHOTS[i];
  const tr = s.tr ?? "fade";
  const op = i === 0 || tr !== "fade" ? 1 : interpolate(f, [0, XF], [0, 1], { extrapolateRight: "clamp" });
  return <AbsoluteFill style={{ opacity: op }}>{children}
    {tr === "flash" ? <AbsoluteFill style={{ background: "#fff", opacity: interpolate(f, [0, 4], [0.9, 0], { extrapolateRight: "clamp" }) }} /> : null}
  </AbsoluteFill>;
};

export const Video: React.FC = () => {
  useFonts();
  return (
    <AbsoluteFill style={{ backgroundColor: "black" }}>
      {SHOTS.map((s, i) => {
        const from = Math.round(s.t0 * FPS), to = Math.round(s.t1 * FPS);
        const next = SHOTS[i + 1];
        const extra = next && (next.tr ?? "fade") === "fade" ? XF : 0;
        return <Sequence key={i} from={from} durationInFrames={to - from + extra}><ShotWrap i={i}>{s.el}</ShotWrap></Sequence>;
      })}
      <Captions />
      <Audio src={staticFile("audio.mp3")} />
    </AbsoluteFill>
  );
};
