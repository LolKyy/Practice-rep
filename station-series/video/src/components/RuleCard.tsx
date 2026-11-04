import React from "react";
import { Easing, interpolate, useCurrentFrame, useVideoConfig } from "remotion";
import { COLORS, FONTS, SAFE } from "../lib/theme";

export type RuleCardProps = {
  number: number;
  text: string;
  /** Верх карточки (px). */
  top?: number;
  delay?: number;
  accent?: string;
};

/** «ПРАВИЛО №N» — появляется штампом. */
export const RuleCard: React.FC<RuleCardProps> = ({ number, text, top = 330, delay = 0, accent = COLORS.accent }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const f = frame - delay * fps;
  if (f < 0) return null;
  const stamp = interpolate(f, [0, 6, 10], [1.35, 0.96, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.out(Easing.cubic),
  });
  const op = interpolate(f, [0, 4], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const flash = interpolate(f, [4, 14], [1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });

  return (
    <div
      style={{
        position: "absolute",
        top,
        left: SAFE.left + 20,
        right: SAFE.left + 20,
        scale: String(stamp),
        rotate: "-1.5deg",
        opacity: op,
        background: COLORS.panel,
        border: `5px solid ${accent}`,
        borderRadius: 10,
        padding: "18px 28px 22px",
        boxShadow: `0 0 ${40 * flash}px ${accent}, 0 16px 40px ${COLORS.shadow}`,
      }}
    >
      <div
        style={{
          fontFamily: FONTS.title,
          fontWeight: 700,
          fontSize: 58,
          color: accent,
          letterSpacing: 4,
          lineHeight: 1.05,
        }}
      >
        ПРАВИЛО №{number}
      </div>
      <div
        style={{
          fontFamily: FONTS.ui,
          fontWeight: 900,
          fontSize: 50,
          color: COLORS.text,
          lineHeight: 1.12,
          marginTop: 6,
          textTransform: "uppercase",
        }}
      >
        {text}
      </div>
    </div>
  );
};

