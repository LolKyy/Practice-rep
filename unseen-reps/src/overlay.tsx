// 2D-слой поверх 3D: «невидимый счёт» (всплывающие статы), заголовок-зацепка и эдит-концовка.
import React from "react";
import { AbsoluteFill, interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { continueRender, delayRender, staticFile } from "remotion";

// Шрифты лежат локально в public/fonts (работает офлайн, без Google Fonts).
const FONTS: [string, string, string][] = [["UR Mono", "fonts/jbmono.woff2", "500 800"], ["UR Serif", "fonts/playfair900.woff2", "900"], ["UR Punch", "fonts/anton.woff2", "400"]];
if (typeof document !== "undefined" && !(window as any).__urFonts) {
  (window as any).__urFonts = true;
  const h = delayRender("fonts");
  Promise.all(FONTS.map(([fam, file, w]) => new FontFace(fam, `url(${staticFile(file)})`, { weight: w }).load().then((f) => (document as any).fonts.add(f))))
    .then(() => continueRender(h)).catch((e) => { console.error(e); continueRender(h); });
}
import { COL, FPS } from "./kit3d";
export const MONO = "'UR Mono', monospace";
export const SERIF = "'UR Serif', Georgia, serif";
export const PUNCH = "'UR Punch', Impact, sans-serif";

const sec = (f: number) => f / FPS;

/** Всплывающий стат «+1 SELF-TRUST». x,y — в долях кадра. */
export const ScorePop: React.FC<{ t: number; dur?: number; x: number; y: number; text: string; good?: boolean }> =
  ({ t, dur = 2.2, x, y, text, good = true }) => {
    const f = useCurrentFrame();
    const { fps, width, height } = useVideoConfig();
    const s = sec(f);
    if (s < t || s > t + dur) return null;
    const k = spring({ frame: f - t * fps, fps, config: { damping: 12, stiffness: 220, mass: 0.6 } });
    const out = interpolate(s, [t + dur - 0.35, t + dur], [1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    const rise = interpolate(s, [t, t + dur], [0, -60]);
    const c = good ? COL.ghost : COL.bad;
    return (
      <div style={{ position: "absolute", left: x * width, top: y * height + rise, transform: `translate(-50%,-50%) scale(${0.6 + 0.4 * k})`, opacity: out * k,
        fontFamily: MONO, fontWeight: 800, fontSize: 46, letterSpacing: 2, color: c, whiteSpace: "nowrap",
        textShadow: `0 0 18px ${c}, 0 0 42px ${c}88`, padding: "8px 18px", border: `2px solid ${c}`, borderRadius: 6, background: "#000a" }}>
        {text}
      </div>
    );
  };

/** Подпись-метка наверху (фирменная рубрика), как «mindset.» у конкурентов, но своя. */
export const RubricTag: React.FC<{ text: string; from?: number; to?: number }> = ({ text, from = 0, to = 999 }) => {
  const s = sec(useCurrentFrame());
  if (s < from || s > to) return null;
  return (
    <AbsoluteFill style={{ alignItems: "center", paddingTop: 210 }}>
      <div style={{ fontFamily: MONO, fontWeight: 500, fontSize: 30, letterSpacing: 10, color: "#ffffffb0" }}>{text}</div>
    </AbsoluteFill>
  );
};

/** Зацепка первых секунд: крупный текст сверху, слово-акцент бирюзовым. */
export const Hook: React.FC<{ lines: string[]; accent?: string; from?: number; to: number }> = ({ lines, accent, from = 0, to }) => {
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();
  const s = sec(f);
  if (s < from || s > to) return null;
  const out = interpolate(s, [to - 0.3, to], [1, 0], { extrapolateLeft: "clamp" });
  return (
    <AbsoluteFill style={{ alignItems: "center", paddingTop: 300, opacity: out }}>
      {lines.map((l, i) => {
        const k = spring({ frame: f - (from + i * 0.35) * fps, fps, config: { damping: 14, stiffness: 200 } });
        return <div key={i} style={{ fontFamily: PUNCH, fontSize: i ? 64 : 104, color: l === accent ? COL.ghost : "#fff", letterSpacing: 2,
          transform: `translateY(${(1 - k) * 40}px)`, opacity: k, textShadow: "0 6px 30px #000" }}>{l}</div>;
      })}
    </AbsoluteFill>
  );
};

/**
 * Фирменная эдит-концовка: вспышка → строки крупным serif-шрифтом с «эхо»-размытием и дрожью,
 * последнее слово — акцентом. Используется и в 3D-роликах, и в шаблоне эдита.
 */
export const EditOutro: React.FC<{ from: number; lines: string[]; accentLast?: boolean; sign?: string }> = ({ from, lines, accentLast = true, sign = "UNSEEN REPS" }) => {
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();
  const s = sec(f) - from;
  if (s < 0) return null;
  const flash = interpolate(s, [0, 0.12, 0.35], [0, 1, 0], { extrapolateRight: "clamp" });
  const step = 0.9;
  return (
    <AbsoluteFill style={{ background: "#000" }}>
      <AbsoluteFill style={{ justifyContent: "center", alignItems: "center", flexDirection: "column", gap: 10 }}>
        {lines.map((l, i) => {
          const t = s - 0.15 - i * step;
          if (t < 0) return null;
          const k = spring({ frame: t * fps, fps, config: { damping: 9, stiffness: 260, mass: 0.5 } });
          const shake = t < 0.25 ? Math.sin(t * 90) * 8 * (1 - t / 0.25) : 0;
          const isAcc = accentLast && i === lines.length - 1;
          const c = isAcc ? COL.ghost : "#f3f3f0";
          const txt = { fontFamily: SERIF, fontWeight: 900, fontSize: 112, lineHeight: 1.0, color: c, textAlign: "center" as const, maxWidth: 960 };
          return (
            <div key={i} style={{ position: "relative", transform: `translateX(${shake}px) scale(${interpolate(k, [0, 1], [1.35, 1])})` }}>
              <div style={{ ...txt, position: "absolute", inset: 0, filter: "blur(14px)", opacity: 0.55 * (1 - Math.min(1, t)), transform: "scale(1.12)" }}>{l}</div>
              <div style={{ ...txt, opacity: Math.min(1, k * 1.4), textShadow: isAcc ? `0 0 40px ${COL.ghost}aa` : "none" }}>{l}</div>
            </div>
          );
        })}
      </AbsoluteFill>
      <AbsoluteFill style={{ justifyContent: "flex-end", alignItems: "center", paddingBottom: 260 }}>
        <div style={{ fontFamily: MONO, fontSize: 28, letterSpacing: 12, color: "#ffffff70", opacity: s > lines.length * step ? 1 : 0 }}>{sign}</div>
      </AbsoluteFill>
      <AbsoluteFill style={{ background: "#fff", opacity: flash }} />
    </AbsoluteFill>
  );
};

/** Плёночное зерно поверх кадра (SVG-шум, меняется каждый кадр). */
export const Grain: React.FC<{ amount?: number }> = ({ amount = 0.12 }) => {
  const f = useCurrentFrame();
  return (
    <AbsoluteFill style={{ opacity: amount, mixBlendMode: "overlay", pointerEvents: "none" }}>
      <svg width="100%" height="100%"><filter id={`g${f % 8}`}><feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="2" seed={f % 97} /></filter>
        <rect width="100%" height="100%" filter={`url(#g${f % 8})`} /></svg>
    </AbsoluteFill>
  );
};
