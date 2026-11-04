import React from "react";
import { Easing, interpolate, useCurrentFrame, useVideoConfig } from "remotion";
import { COLORS, FONTS } from "../lib/theme";
import { wobble } from "../lib/track";

export type EvidenceKind = "radio" | "log" | "monitor" | "sign";

export type EvidenceCardProps = {
  kind: EvidenceKind;
  /** Заголовок карточки: «РАЦИЯ · КАНАЛ 3», «ЖУРНАЛ · 04:12»… (иконка добавляется сама) */
  title: string;
  /** Строки текста (журнал/монитор/табличка) или реплика по рации. */
  lines?: string[];
  x?: number;
  y?: number;
  width?: number;
  height?: number;
  delay?: number;
  /** Рация: сколько секунд «говорит» голос (волна активна). */
  talkSeconds?: number;
  accent?: string;
};

const Header: React.FC<{ title: string; color: string }> = ({ title, color }) => (
  <div
    style={{
      fontFamily: FONTS.mono,
      fontWeight: 700,
      fontSize: 24,
      letterSpacing: 2,
      color,
      paddingBottom: 8,
      borderBottom: `2px solid ${COLORS.panelEdge}`,
      marginBottom: 10,
      whiteSpace: "nowrap",
      overflow: "hidden",
      textOverflow: "ellipsis",
    }}
  >
    {title}
  </div>
);

const Radio: React.FC<{ t: number; talk: number; lines: string[]; accent: string }> = ({ t, talk, lines, accent }) => {
  const bars = 28;
  const live = t < talk;
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 10, flex: 1 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 4, height: 90 }}>
        {new Array(bars).fill(0).map((_, i) => {
          const amp = live ? 0.25 + 0.75 * Math.abs(wobble(i, t * 6 + i * 0.4)) : 0.06;
          return (
            <div
              key={i}
              style={{ flex: 1, height: `${amp * 100}%`, background: live ? accent : COLORS.line, borderRadius: 3 }}
            />
          );
        })}
      </div>
      {lines.map((l, i) => (
        <div key={i} style={{ fontFamily: FONTS.mono, fontSize: 26, color: COLORS.text, lineHeight: 1.25 }}>
          {l}
        </div>
      ))}
    </div>
  );
};

/** Печатная машинка: строки появляются по символу. */
const typed = (lines: string[], chars: number) => {
  let left = chars;
  return lines.map((l) => {
    const s = l.slice(0, Math.max(0, left));
    left -= l.length;
    return s;
  });
};

const Log: React.FC<{ t: number; lines: string[] }> = ({ t, lines }) => {
  const out = typed(lines, Math.floor(t * 60));
  return (
    <div style={{ flex: 1, background: "#E9E2D0", borderRadius: 6, padding: "10px 14px", rotate: "-0.8deg" }}>
      {out.map((l, i) => (
        <div key={i} style={{ fontFamily: FONTS.mono, fontSize: 25, color: "#1B1B1B", lineHeight: 1.3, minHeight: 32 }}>
          {l}
        </div>
      ))}
    </div>
  );
};

const Monitor: React.FC<{ t: number; lines: string[]; accent: string }> = ({ t, lines, accent }) => {
  const out = typed(lines, Math.floor(t * 80));
  const blink = Math.floor(t * 3) % 2 === 0;
  return (
    <div
      style={{
        flex: 1,
        background: "#03140C",
        borderRadius: 12,
        border: "6px solid #1A222A",
        padding: "12px 16px",
        position: "relative",
        overflow: "hidden",
      }}
    >
      {out.map((l, i) => (
        <div
          key={i}
          style={{
            fontFamily: FONTS.mono,
            fontSize: 26,
            color: l.startsWith("!") ? accent : COLORS.ok,
            lineHeight: 1.3,
            textShadow: "0 0 8px rgba(124,255,178,0.5)",
            minHeight: 34,
          }}
        >
          {l}
          {i === out.length - 1 && blink ? "█" : ""}
        </div>
      ))}
      {/* скан-линии */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          background: "repeating-linear-gradient(0deg, rgba(0,0,0,0.25) 0 2px, transparent 2px 5px)",
        }}
      />
    </div>
  );
};

const Sign: React.FC<{ lines: string[]; accent: string }> = ({ lines, accent }) => (
  <div
    style={{
      flex: 1,
      background: "#C9CED3",
      borderRadius: 8,
      border: `8px solid ${accent}`,
      display: "flex",
      flexDirection: "column",
      justifyContent: "center",
      alignItems: "center",
      position: "relative",
      padding: 14,
    }}
  >
    {[
      [10, 10],
      [10, -1],
      [-1, 10],
      [-1, -1],
    ].map(([l, tp], i) => (
      <div
        key={i}
        style={{
          position: "absolute",
          width: 14,
          height: 14,
          borderRadius: 7,
          background: "#6B747C",
          left: l >= 0 ? l : undefined,
          right: l < 0 ? 10 : undefined,
          top: tp >= 0 ? tp : undefined,
          bottom: tp < 0 ? 10 : undefined,
        }}
      />
    ))}
    {lines.map((l, i) => (
      <div
        key={i}
        style={{
          fontFamily: FONTS.title,
          fontWeight: 700,
          fontSize: i === 0 ? 50 : 32,
          color: "#121417",
          letterSpacing: 3,
          lineHeight: 1.1,
          textAlign: "center",
        }}
      >
        {l}
      </div>
    ))}
  </div>
);

/** Карточка-улика: рация с волной, журнал, монитор, табличка. */
export const EvidenceCard: React.FC<EvidenceCardProps> = ({
  kind,
  title,
  lines = [],
  x = 60,
  y = 700,
  width = 960,
  height = 360,
  delay = 0,
  talkSeconds = 2,
  accent = COLORS.accent,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const f = frame - delay * fps;
  if (f < 0) return null;
  const t = f / fps;
  const appear = interpolate(f, [0, 9], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.bezier(0.16, 1, 0.3, 1),
  });
  const icon = { radio: "◉", log: "▤", monitor: "▣", sign: "▲" }[kind];

  return (
    <div
      style={{
        position: "absolute",
        left: x,
        top: y,
        width,
        height,
        opacity: appear,
        scale: String(0.9 + 0.1 * appear),
        background: "rgba(14,19,26,0.95)",
        border: `3px solid ${COLORS.panelEdge}`,
        borderRadius: 16,
        padding: 16,
        boxShadow: `0 18px 50px ${COLORS.shadow}`,
        display: "flex",
        flexDirection: "column",
        overflow: "hidden",
      }}
    >
      <Header title={`${icon} ${title}`} color={kind === "radio" ? accent : COLORS.textDim} />
      {kind === "radio" ? <Radio t={t} talk={talkSeconds} lines={lines} accent={accent} /> : null}
      {kind === "log" ? <Log t={t} lines={lines} /> : null}
      {kind === "monitor" ? <Monitor t={t} lines={lines} accent={accent} /> : null}
      {kind === "sign" ? <Sign lines={lines} accent={accent} /> : null}
    </div>
  );
};
