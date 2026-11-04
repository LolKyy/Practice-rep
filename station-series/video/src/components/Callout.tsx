import React from "react";
import { Easing, interpolate, useCurrentFrame, useVideoConfig } from "remotion";
import { COLORS, FONTS } from "../lib/theme";

export type CalloutProps = {
  /** Точка на объекте, куда указывает стрелка (px кадра). */
  targetX: number;
  targetY: number;
  /** Верхняя строка: «ИМЯ, ВОЗРАСТ». */
  title: string;
  /** Нижняя строка: роль / подпись. */
  subtitle?: string;
  /** Где стоит плашка относительно цели. */
  side?: "left" | "right";
  /** Смещение плашки от цели (px). */
  dx?: number;
  dy?: number;
  /** Задержка появления (сек). */
  delay?: number;
  accent?: string;
  maxWidth?: number;
};

export const Callout: React.FC<CalloutProps> = ({
  targetX,
  targetY,
  title,
  subtitle,
  side = "right",
  dx = 150,
  dy = -120,
  delay = 0,
  accent = COLORS.accent,
  maxWidth = 460,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const f = frame - delay * fps;
  const ease = { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: Easing.bezier(0.16, 1, 0.3, 1) } as const;
  const line = interpolate(f, [0, 8], [0, 1], ease);
  const box = interpolate(f, [6, 16], [0, 1], ease);
  if (f < 0) return null;

  const sign = side === "right" ? 1 : -1;
  const elbowX = targetX + sign * dx * 0.55;
  const elbowY = targetY + dy;
  const endX = targetX + sign * dx;
  const endY = elbowY;
  const len1 = Math.hypot(elbowX - targetX, elbowY - targetY);
  const len2 = Math.abs(endX - elbowX);
  const total = len1 + len2;

  return (
    <>
      <svg style={{ position: "absolute", inset: 0, width: "100%", height: "100%", overflow: "visible" }}>
        <circle cx={targetX} cy={targetY} r={9 * line} fill={accent} />
        <circle cx={targetX} cy={targetY} r={18 * line} fill="none" stroke={accent} strokeWidth={3} opacity={0.6} />
        <polyline
          points={`${targetX},${targetY} ${elbowX},${elbowY} ${endX},${endY}`}
          fill="none"
          stroke={COLORS.text}
          strokeWidth={4}
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeDasharray={total}
          strokeDashoffset={total * (1 - line)}
        />
      </svg>
      <div
        style={{
          position: "absolute",
          top: endY,
          left: side === "right" ? endX + 8 : undefined,
          right: side === "left" ? 1080 - endX + 8 : undefined,
          translate: `${(1 - box) * sign * -20}px -50%`,
          opacity: box,
          maxWidth,
          background: "rgba(10,14,19,0.92)",
          borderLeft: side === "right" ? `8px solid ${accent}` : undefined,
          borderRight: side === "left" ? `8px solid ${accent}` : undefined,
          borderRadius: 8,
          padding: "12px 20px",
          boxShadow: `0 10px 28px ${COLORS.shadow}`,
          textAlign: side === "right" ? "left" : "right",
        }}
      >
        <div style={{ fontFamily: FONTS.ui, fontWeight: 900, fontSize: 40, color: COLORS.text, lineHeight: 1.1 }}>
          {title}
        </div>
        {subtitle ? (
          <div
            style={{
              fontFamily: FONTS.mono,
              fontWeight: 700,
              fontSize: 26,
              color: accent,
              marginTop: 4,
              letterSpacing: 1,
            }}
          >
            {subtitle}
          </div>
        ) : null}
      </div>
    </>
  );
};
