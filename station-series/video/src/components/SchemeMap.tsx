import React from "react";
import { interpolate, useCurrentFrame, useVideoConfig } from "remotion";
import { COLORS, FONTS } from "../lib/theme";

export type Compartment = {
  id: string;
  label: string;
  /** Координаты в условных единицах схемы (0..100 по ширине, 0..aspect*100 по высоте). */
  x: number;
  y: number;
  w: number;
  h: number;
};

export type SchemeMapProps = {
  title?: string;
  compartments: Compartment[];
  /** Переходы между отсеками: пары id. */
  doors?: [string, string][];
  /** Где «ТЫ ЗДЕСЬ». */
  youAreHere: string;
  /** Отсек с угрозой (мигает акцентом). */
  threat?: string;
  /** Отсеки, которые уже закрыты/потеряны (штриховка). */
  sealed?: string[];
  x?: number;
  y?: number;
  width?: number;
  /** Высота схемы в условных единицах (ширина всегда 100). */
  unitsHigh?: number;
  delay?: number;
  accent?: string;
};

/** Схема помещения в разрезе с мигающей точкой «ТЫ ЗДЕСЬ». */
export const SchemeMap: React.FC<SchemeMapProps> = ({
  title = "СХЕМА",
  compartments,
  doors = [],
  youAreHere,
  threat,
  sealed = [],
  x = 60,
  y = 700,
  width = 960,
  unitsHigh = 60,
  delay = 0,
  accent = COLORS.accent,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const f = frame - delay * fps;
  if (f < 0) return null;
  const t = f / fps;
  const k = (width - 40) / 100; // px на единицу
  const h = unitsHigh * k;
  const draw = interpolate(f, [0, 14], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const blink = 0.5 + 0.5 * Math.cos(t * Math.PI * 2 * 1.4);
  const byId = Object.fromEntries(compartments.map((c) => [c.id, c]));
  const here = byId[youAreHere];

  return (
    <div
      style={{
        position: "absolute",
        left: x,
        top: y,
        width,
        background: "rgba(8,14,22,0.94)",
        border: `3px solid ${COLORS.panelEdge}`,
        borderRadius: 16,
        padding: 20,
        opacity: Math.min(1, draw * 2),
        boxShadow: `0 18px 50px ${COLORS.shadow}`,
      }}
    >
      <div style={{ fontFamily: FONTS.mono, fontWeight: 700, fontSize: 24, color: COLORS.textDim, letterSpacing: 2, marginBottom: 10 }}>
        ⌖ {title}
      </div>
      <svg width={width - 40} height={h} style={{ display: "block", overflow: "visible" }}>
        <defs>
          <pattern id="hatch" width="12" height="12" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
            <line x1="0" y1="0" x2="0" y2="12" stroke={COLORS.line} strokeWidth="4" />
          </pattern>
          <pattern id="grid" width={k * 5} height={k * 5} patternUnits="userSpaceOnUse">
            <path d={`M ${k * 5} 0 L 0 0 0 ${k * 5}`} fill="none" stroke="#132030" strokeWidth="1" />
          </pattern>
        </defs>
        <rect x={0} y={0} width={100 * k} height={h} fill="url(#grid)" />
        {doors.map(([a, b], i) => {
          const A = byId[a];
          const B = byId[b];
          if (!A || !B) return null;
          return (
            <line
              key={i}
              x1={(A.x + A.w / 2) * k}
              y1={(A.y + A.h / 2) * k}
              x2={(B.x + B.w / 2) * k}
              y2={(B.y + B.h / 2) * k}
              stroke={COLORS.line}
              strokeWidth={10}
              opacity={draw}
            />
          );
        })}
        {compartments.map((c) => {
          const isThreat = c.id === threat;
          const per = 2 * (c.w + c.h) * k;
          return (
            <g key={c.id}>
              <rect
                x={c.x * k}
                y={c.y * k}
                width={c.w * k}
                height={c.h * k}
                rx={6}
                fill={sealed.includes(c.id) ? "url(#hatch)" : isThreat ? accent : "#0F1A26"}
                fillOpacity={isThreat ? 0.15 + 0.35 * blink : 1}
                stroke={isThreat ? accent : COLORS.text}
                strokeWidth={4}
                strokeDasharray={per}
                strokeDashoffset={per * (1 - draw)}
              />
              <text
                x={(c.x + c.w / 2) * k}
                y={(c.y + c.h) * k - 12}
                textAnchor="middle"
                fontFamily={FONTS.mono}
                fontWeight={700}
                fontSize={22}
                fill={isThreat ? accent : COLORS.textDim}
                opacity={draw}
              >
                {c.label}
              </text>
            </g>
          );
        })}
        {here ? (
          <g transform={`translate(${(here.x + here.w / 2) * k}, ${(here.y + here.h / 2 - 4) * k})`}>
            <circle r={14 + 26 * (1 - blink)} fill="none" stroke={COLORS.text} strokeWidth={3} opacity={blink} />
            <circle r={13} fill={COLORS.text} />
            <g transform="translate(0,-28)">
              <rect x={-92} y={-38} width={184} height={36} rx={6} fill={COLORS.text} />
              <text textAnchor="middle" y={-12} fontFamily={FONTS.mono} fontWeight={700} fontSize={22} fill={COLORS.bg}>
                ТЫ ЗДЕСЬ
              </text>
            </g>
          </g>
        ) : null}
      </svg>
    </div>
  );
};
