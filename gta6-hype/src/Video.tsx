// Ролик: шоты (src/shots.tsx) с растворениями 5 кадров + субтитры по одному слову + звук.
import React, { useEffect, useState } from "react";
import { AbsoluteFill, Audio, Freeze, OffthreadVideo, Sequence, continueRender, delayRender, interpolate, staticFile, useCurrentFrame } from "remotion";
import words from "./words.json";
import { setData, FPS, WORDS, AD_T, AD_F } from "./timeline.js";
setData(words);
import { SHOTS, BUBBLES } from "./shots";
import { Captions } from "./captions";

const FONTS: [string, string, string][] = [["Rubik", "fonts/Rubik.ttf", "800"], ["Russo One", "fonts/RussoOne.ttf", "400"], ["Oswald", "fonts/Oswald.ttf", "700"]];
// Шрифты грузятся до первой отрисовки сцен: надписи на 3D-вывесках рисуются в canvas один раз,
// и если шрифт ещё не готов, там навсегда останется запасной шрифт. Поэтому сцены ждут ready.
export const useFonts = () => {
  const [h] = useState(() => delayRender("fonts"));
  const [ready, setReady] = useState(false);
  useEffect(() => {
    Promise.all(FONTS.map(([n, f, w]) => new FontFace(n, `url(${staticFile(f)})`, { weight: w }).load().then((ff) => (document.fonts as any).add(ff))))
      .then(() => document.fonts.ready).then(() => { setReady(true); continueRender(h); }).catch(() => { setReady(true); continueRender(h); });
  }, []);
  return ready;
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

// облачка поверх видео: появляются с «пружинкой», исчезают на конце шота
const Bubbles: React.FC = () => {
  const f = useCurrentFrame(); const t = f / FPS;
  return <>{BUBBLES.filter((b) => t >= b.t0 && t < b.t1).map((b, i) => {
    const u = (t - b.t0) * FPS; const k = Math.min(1, u / 5); const sc = u < 5 ? 0.6 + 0.5 * k : u < 9 ? 1.1 - 0.1 * ((u - 5) / 4) : 1;
    return <div key={i} style={{ position: "absolute", left: b.x, top: b.y, transform: `translate(-50%,-50%) scale(${sc})`, maxWidth: 820,
      background: b.col ?? "#ffffff", border: "8px solid #1a1020", borderRadius: 48, padding: "18px 36px", fontFamily: "Russo One", fontSize: 54,
      color: "#1a1020", whiteSpace: "nowrap", boxShadow: "0 10px 0 rgba(0,0,0,0.35)", opacity: k }}>{b.text}</div>;
  })}</>;
};

// весь ролик без звука (звук целиком в public/audio.mp3, реклама уже вклеена туда)
const Main: React.FC = () => (<AbsoluteFill style={{ backgroundColor: "black" }}>
  {SHOTS.map((s, i) => {
    const from = Math.round(s.t0 * FPS), to = Math.round(s.t1 * FPS);
    const next = SHOTS[i + 1];
    const extra = next && (next.tr ?? "fade") === "fade" ? XF : 0;
    return <Sequence key={i} from={from} durationInFrames={to - from + extra}><ShotWrap i={i}>{s.el}</ShotWrap></Sequence>;
  })}
  <Bubbles />
  <Captions />
</AbsoluteFill>);

const AD0 = Math.round(AD_T * FPS);
// баннер: ровно по центру кадра, 1080×500 (26% площади), плавно 0.3 с
const Banner: React.FC = () => {
  const f = useCurrentFrame();
  const op = interpolate(f, [0, 9, AD_F - 9, AD_F], [0, 1, 1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  return <AbsoluteFill>
    <AbsoluteFill style={{ background: "rgba(0,0,0,0.25)", opacity: op }} />
    <div style={{ position: "absolute", left: 0, top: (1920 - 500) / 2, width: 1080, height: 500, opacity: op }}>
      <OffthreadVideo src={staticFile("banner.webm")} transparent muted style={{ width: 1080, height: 500 }} />
    </div>
  </AbsoluteFill>;
};

export const Video: React.FC = () => {
  const ready = useFonts();
  if (!ready) return <AbsoluteFill style={{ backgroundColor: "black" }} />;
  return (
    <AbsoluteFill style={{ backgroundColor: "black" }}>
      <Sequence from={0} durationInFrames={AD0}><Main /></Sequence>
      <Sequence from={AD0} durationInFrames={AD_F}><Freeze frame={AD0}><Main /></Freeze><Banner /></Sequence>
      <Sequence from={AD0 + AD_F}><Sequence from={-AD0}><Main /></Sequence></Sequence>
      <Audio src={staticFile("audio.mp3")} />
    </AbsoluteFill>
  );
};
