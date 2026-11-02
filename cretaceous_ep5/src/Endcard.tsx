// Заставка в конце серии (как endcard_ep3_next4): «ЧАСТЬ N →», глаза в темноте, «СКОРО», «ПОДПИШИСЬ, ЧТОБЫ НЕ ПРОПУСТИТЬ». 5,4 с.
import React from "react";
import { AbsoluteFill, interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import "./fonts";
import { Layer } from "./stage2d";
import { PAL, fern } from "./cut";

const torn = "polygon(0 6%, 9% 0, 22% 5%, 38% 1%, 55% 5%, 71% 0, 86% 4%, 100% 1%, 99% 52%, 100% 96%, 84% 100%, 66% 95%, 48% 100%, 30% 96%, 13% 100%, 0 95%, 1% 48%)";
const pop = (f: number, at: number, fps: number) => spring({ frame: f - Math.round(at * fps), fps, config: { damping: 11, stiffness: 220, mass: 0.6 } });
export const Endcard: React.FC<{ part: number }> = ({ part }) => {
  const f = useCurrentFrame(); const { fps } = useVideoConfig(); const t = f / fps;
  const tagY = interpolate(t, [0, 0.4], [-260, 0], { extrapolateRight: "clamp" }); const sw = Math.sin(t * 2.2) * 0.04 * Math.exp(-t * 0.6);
  const eye = t < 0.3 ? 0 : (Math.floor(t * 10) % 31 === 0 ? 0.1 : 1) * Math.min(1, (t - 0.3) * 4);
  const s1 = pop(f, 0.47, fps), s2 = pop(f, 2.7, fps), s3 = pop(f, 3.45, fps);
  const strip = (bg: string, color: string, size: number, rot: number, s: number, pad = "14px 50px"): React.CSSProperties => ({ display: "inline-block", whiteSpace: "nowrap", background: bg, color, fontFamily: "Montserrat", fontWeight: 900, fontSize: size, padding: pad,
    clipPath: torn, transform: `rotate(${rot}deg) scale(${interpolate(s, [0, 1], [0.5, 1])})`, opacity: Math.min(1, s * 2), filter: "drop-shadow(8px 12px 0 rgba(0,0,0,0.3))" });
  return (<AbsoluteFill style={{ background: "radial-gradient(ellipse 70% 55% at 50% 45%, #34421F 0%, #222B16 60%, #161C0E 100%)" }}>
    <Layer d={1} shadow={0.3} draw={(g) => { for (const [x, a] of [[150, -1.25], [930, -1.9]] as [number, number][]) for (let i = 0; i < 3; i++) fern(g, x + (i - 1) * 70, 2000, 470 - i * 60, a + (i - 1) * 0.18, i % 2 ? "#1A2412" : "#202C16", 30 + i + x, { droop: 0.2 }); }} />
    <div style={{ position: "absolute", left: 535, top: 0, width: 3, height: 230 + tagY, background: "rgba(243,237,224,0.9)" }} />
    <div style={{ position: "absolute", left: 345, top: 220 + tagY, transformOrigin: "190px 0", transform: `rotate(${sw}rad)`, background: PAL.edge, padding: "18px 70px 18px 56px", fontFamily: "JetBrains Mono", fontWeight: 700, fontSize: 40, color: PAL.ink,
      clipPath: "polygon(0 0, 88% 0, 100% 50%, 88% 100%, 0 100%)", filter: "drop-shadow(6px 9px 0 rgba(0,0,0,0.35))" }}>ЧАСТЬ {part} →</div>
    {[445, 635].map((x) => <div key={x} style={{ position: "absolute", left: x - 34, top: 465, width: 68, height: 46, borderRadius: "50%", background: "#F2C84A", opacity: eye, boxShadow: "0 0 40px 12px rgba(255,210,90,0.35)" }}>
      <div style={{ position: "absolute", left: 30, top: 6, width: 8, height: 34, borderRadius: 4, background: "#120E06" }} /></div>)}
    <div style={{ position: "absolute", left: 0, width: 1080, top: 760, textAlign: "center" }}><div style={strip("#F2C41E", "#1A1712", 120, -2, s1, "16px 70px")}>СКОРО</div></div>
    <div style={{ position: "absolute", left: 0, width: 1080, top: 1020, textAlign: "center" }}><div style={strip(PAL.scarf, PAL.edge, 104, 1.5, s2)}>ПОДПИШИСЬ,</div></div>
    <div style={{ position: "absolute", left: 0, width: 1080, top: 1185, textAlign: "center" }}><div style={strip(PAL.edge, PAL.ink, 60, -1, s3, "12px 40px")}>ЧТОБЫ НЕ ПРОПУСТИТЬ</div></div>
  </AbsoluteFill>);
};
