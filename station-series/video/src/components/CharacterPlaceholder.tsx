import React from "react";
import { useCurrentFrame, useVideoConfig } from "remotion";
import { COLORS } from "../lib/theme";

export type CharacterPlaceholderProps = {
  /** Позиция ступней (центр) в px. */
  x: number;
  y: number;
  /** Рост в px. */
  height?: number;
  color?: string;
  /** Цвет обводки-контура (rim light). */
  rim?: string;
  /** Смотрит влево/вправо. */
  facing?: "left" | "right";
  /** Сдвиг фазы дыхания, чтобы двое не дышали синхронно. */
  seed?: number;
};

/** Силуэт-заглушка: голова, корпус-капсула, руки, ноги. Дышит. */
export const CharacterPlaceholder: React.FC<CharacterPlaceholderProps> = ({
  x,
  y,
  height = 520,
  color = "#1A2430",
  rim = COLORS.line,
  facing = "right",
  seed = 0,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const t = frame / fps;
  const breath = Math.sin(t * Math.PI * 2 * 0.35 + seed) * 0.012;
  const s = height / 520; // рисуем в системе 520 px роста
  const flip = facing === "left" ? -1 : 1;

  return (
    <svg
      style={{ position: "absolute", left: 0, top: 0, width: "100%", height: "100%", overflow: "visible" }}
    >
      <g transform={`translate(${x}, ${y}) scale(${s * flip}, ${s * (1 + breath)})`}>
        {/* тень */}
        <ellipse cx={0} cy={0} rx={110} ry={16} fill="#000" opacity={0.45} />
        <g stroke={rim} strokeWidth={5} fill={color} strokeLinejoin="round">
          {/* ноги */}
          <rect x={-58} y={-200} width={46} height={200} rx={20} />
          <rect x={12} y={-200} width={46} height={200} rx={20} />
          {/* руки */}
          <rect x={-112} y={-390} width={40} height={190} rx={20} transform="rotate(6 -92 -390)" />
          <rect x={72} y={-390} width={40} height={190} rx={20} transform="rotate(-6 92 -390)" />
          {/* корпус */}
          <rect x={-84} y={-410} width={168} height={240} rx={64} />
          {/* голова */}
          <circle cx={6} cy={-462} r={58} />
        </g>
        {/* визор/глаз — обозначает направление взгляда */}
        <rect x={20} y={-478} width={40} height={14} rx={7} fill={COLORS.textDim} opacity={0.8} />
      </g>
    </svg>
  );
};
