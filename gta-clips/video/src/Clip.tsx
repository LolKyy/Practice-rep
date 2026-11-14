import React, { useEffect, useState } from "react";
import { AbsoluteFill, Audio, Sequence, continueRender, delayRender, interpolate, staticFile, useCurrentFrame } from "remotion";
import "@fontsource/anton/400.css";
import "@fontsource/oswald/700.css";
import type { Caption as CaptionT, Timeline } from "./types";
import { Shot } from "./Shot";

const FONT = "Anton, Oswald, Impact, sans-serif";

const useFonts = () => {
  const [h] = useState(() => delayRender("fonts"));
  useEffect(() => {
    Promise.all(["400 80px Anton", "700 80px Oswald"].map((f) => document.fonts.load(f, "CLIPSO Вайс")))
      .then(() => continueRender(h)).catch(() => continueRender(h));
  }, [h]);
};

// Плёночное зерно + виньетка — часть единого «лука» канала поверх LUT-грейда фрагментов
const Grain: React.FC = () => {
  const f = useCurrentFrame();
  return (
    <AbsoluteFill style={{ mixBlendMode: "overlay", opacity: 0.16, pointerEvents: "none" }}>
      <svg width="1080" height="1920">
        <filter id="grain">
          <feTurbulence type="fractalNoise" baseFrequency="0.85" numOctaves={2} seed={f % 97} stitchTiles="stitch" />
          <feColorMatrix type="saturate" values="0" />
        </filter>
        <rect width="100%" height="100%" filter="url(#grain)" />
      </svg>
    </AbsoluteFill>
  );
};

const Vignette: React.FC = () => (
  <AbsoluteFill style={{ background: "radial-gradient(ellipse 75% 62% at 50% 48%, rgba(0,0,0,0) 55%, rgba(0,0,0,0.5) 100%)" }} />
);

const Watermark: React.FC<{ text: string }> = ({ text }) => (
  <AbsoluteFill style={{ justifyContent: "flex-end", alignItems: "center", paddingBottom: 395 }}>
    <div style={{ fontFamily: FONT, fontSize: 46, letterSpacing: 16, color: "rgba(255,255,255,0.55)", paddingLeft: 16,
      textShadow: "0 2px 10px rgba(0,0,0,0.55)" }}>{text}</div>
  </AbsoluteFill>
);

// Мем-подпись по центру: *ключевое слово* — цветом канала с неоновым свечением; «прыжок» на каждой склейке.
const Caption: React.FC<{ c: CaptionT; cuts: number[] }> = ({ c, cuts }) => {
  const f = useCurrentFrame();                // от c.from
  const abs = f + c.from;
  const pop = interpolate(f, [0, 5, 9], [0.7, 1.06, 1], { extrapolateRight: "clamp" });
  const last = Math.max(...cuts.filter((x) => x <= abs), -999);
  const bump = 1 + 0.045 * Math.exp(-(abs - last) / 4);
  const out = interpolate(f, [c.to - c.from - 6, c.to - c.from], [1, 0], { extrapolateLeft: "clamp" });
  const parts = c.text.split(/(\*[^*]+\*)/g).filter(Boolean);
  return (
    <AbsoluteFill style={{ justifyContent: "center", alignItems: "center", padding: "0 70px" }}>
      <div style={{ fontFamily: FONT, fontSize: 104, lineHeight: 1.04, textAlign: "center", textTransform: "uppercase",
        color: "#fff", transform: `scale(${pop * bump})`, opacity: out,
        textShadow: "0 0 3px #000, 0 6px 0 rgba(0,0,0,0.85), 0 10px 30px rgba(0,0,0,0.7)" }}>
        {parts.map((p, i) => p.startsWith("*")
          ? <span key={i} style={{ color: c.color, textShadow: `0 0 3px #000, 0 6px 0 rgba(0,0,0,0.85), 0 0 34px ${c.color}` }}>{p.slice(1, -1)}</span>
          : <span key={i}>{p}</span>)}
      </div>
    </AbsoluteFill>
  );
};

// Финал: плавное затемнение в чёрный и затухание трека за tl.outro кадров
const Outro: React.FC<{ tl: Timeline }> = ({ tl }) => {
  const f = useCurrentFrame();
  const n = tl.outro || 0;
  if (!n) return null;
  const o = interpolate(f, [tl.frames - n, tl.frames - 1], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  return <AbsoluteFill style={{ backgroundColor: "#000", opacity: Math.pow(o, 1.4) }} />;
};

export const Clip: React.FC<{ tl: Timeline; withAudio?: boolean }> = ({ tl, withAudio = true }) => {
  useFonts();
  const n = tl.outro || 0;
  const volume = (f: number) => (n ? interpolate(f, [tl.frames - n * 1.4, tl.frames - 1], [1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }) : 1);
  return (
    <AbsoluteFill style={{ backgroundColor: "#000" }}>
      {tl.shots.map((s) => (
        <Sequence key={s.i} from={s.from} durationInFrames={s.frames} name={`#${s.i} ${s.src}@${s.src_in}`}>
          <Shot s={s} />
        </Sequence>
      ))}
      <Vignette />
      <Grain />
      {tl.captions.map((c, i) => (
        <Sequence key={i} from={c.from} durationInFrames={c.to - c.from} name={`caption ${i}`}>
          <Caption c={c} cuts={tl.cuts} />
        </Sequence>
      ))}
      {tl.watermark && <Watermark text={tl.watermark} />}
      <Outro tl={tl} />
      {withAudio && tl.music && <Audio src={staticFile(tl.music.file)} trimBefore={Math.round(tl.music.start * tl.fps)} volume={volume} />}
    </AbsoluteFill>
  );
};
