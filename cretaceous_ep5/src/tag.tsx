// Бирка времени на нитке. С Ч5 умеет переворачиваться на обратный отсчёт: «ДО ВСПЫШКИ: N ДНЕЙ» (красные цифры).
//   <TimeTag items={[[0, "НОЧЬ 2 — 21:40"]]} countdown={{ at: 85.0, days: 7 }} />
//   countdown.at — секунда переворота (до неё обычные бирки items, после — отсчёт); без countdown — обычная бирка.
import React from "react";
import { interpolate, useCurrentFrame } from "remotion";
import { PAL } from "./cut";

const FPS = 30;
export const daysWord = (n: number) => { const a = n % 10, b = n % 100; return b >= 11 && b <= 14 ? "ДНЕЙ" : a === 1 ? "ДЕНЬ" : a >= 2 && a <= 4 ? "ДНЯ" : "ДНЕЙ"; };
const Face: React.FC<{ children: React.ReactNode; back?: boolean }> = ({ children, back }) => (
  <div style={{ background: PAL.edge, padding: "14px 30px 14px 46px", fontFamily: "JetBrains Mono", fontWeight: 700, fontSize: 34, color: PAL.ink, boxShadow: "7px 11px 14px rgba(20,12,4,0.5)",
    position: back ? "absolute" : "relative", top: 0, left: 0, whiteSpace: "nowrap", backfaceVisibility: "hidden", transform: back ? "rotateY(180deg)" : undefined }}>
    <div style={{ position: "absolute", left: 16, top: "50%", width: 14, height: 14, marginTop: -7, borderRadius: 7, background: "#3a3020" }} />{children}</div>
);
export const TimeTag: React.FC<{ items: [number, string][]; countdown?: { at: number; days: number }; left?: number }> = ({ items, countdown, left = 640 }) => {
  const t = useCurrentFrame() / FPS;
  let txt = "", since = 0; for (const [s, x] of items) if (t >= s) { txt = x; since = s; }
  if (!txt && !(countdown && t >= countdown.at)) return null;
  const k = t - since; const drop = interpolate(k, [0, 0.35], [-200, 0], { extrapolateRight: "clamp" });
  const flip = countdown ? interpolate(t, [countdown.at, countdown.at + 0.7], [0, 180], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }) : 0;
  const settle = countdown && t > countdown.at ? Math.exp(-(t - countdown.at) * 2.5) * Math.sin((t - countdown.at) * 8) * 0.1 : 0;
  const sw = Math.exp(-k * 2.2) * Math.sin(k * 7) * 0.12 + Math.sin(t * 1.3) * 0.015 + settle;
  return (<div style={{ position: "absolute", left, top: 0, transformOrigin: "50% 0", transform: `translateY(${countdown && t >= countdown.at ? 0 : drop}px) rotate(${sw}rad)` }}>
    <div style={{ width: 3, height: 210, background: "rgba(243,237,224,0.9)", margin: "0 auto" }} />
    <div style={{ position: "relative", transformStyle: "preserve-3d", transform: `perspective(800px) rotateY(${flip}deg)` }}>
      <Face>{txt || " "}</Face>
      {countdown ? <Face back>ДО ВСПЫШКИ: <span style={{ color: PAL.scarf }}>{countdown.days}</span> {daysWord(countdown.days)}</Face> : null}
    </div>
  </div>);
};
