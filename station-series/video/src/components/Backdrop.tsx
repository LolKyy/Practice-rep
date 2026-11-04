import React from "react";
import { AbsoluteFill, useCurrentFrame, useVideoConfig } from "remotion";
import { COLORS } from "../lib/theme";

/** Нейтральный фон-заглушка: отсек станции в плоском векторе (иллюминатор, переборки, пол). */
export const Backdrop: React.FC<{ accent?: string }> = ({ accent = COLORS.accent }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const t = frame / fps;
  const lamp = 0.55 + 0.45 * Math.max(0, Math.sin(t * Math.PI * 2 * 0.9));
  const stars = new Array(40).fill(0).map((_, i) => ({
    x: (i * 137.5) % 440,
    y: (i * 89.3) % 440,
    r: 1 + (i % 3),
  }));

  return (
    <AbsoluteFill>
      <svg width={1080} height={1920} viewBox="0 0 1080 1920">
        <defs>
          <linearGradient id="wall" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#0B1017" />
            <stop offset="1" stopColor="#05070A" />
          </linearGradient>
          <clipPath id="porthole">
            <circle cx={780} cy={860} r={210} />
          </clipPath>
        </defs>
        <rect width={1080} height={1920} fill="url(#wall)" />
        {/* переборки */}
        {[0, 1, 2, 3].map((i) => (
          <rect key={i} x={i * 300 - 40} y={0} width={36} height={1920} fill={COLORS.bg2} />
        ))}
        <rect x={0} y={560} width={1080} height={18} fill={COLORS.bg2} />
        {/* иллюминатор */}
        <circle cx={780} cy={860} r={232} fill={COLORS.panelEdge} />
        <g clipPath="url(#porthole)">
          <rect x={560} y={640} width={440} height={440} fill="#020306" />
          {stars.map((s, i) => (
            <circle key={i} cx={560 + s.x} cy={640 + s.y} r={s.r} fill="#AFC3D6" opacity={0.6} />
          ))}
        </g>
        {/* пол */}
        <rect x={0} y={1250} width={1080} height={670} fill="#080B10" />
        <rect x={0} y={1250} width={1080} height={8} fill={COLORS.line} />
        {/* аварийная лампа */}
        <rect x={70} y={590} width={140} height={26} rx={8} fill={accent} opacity={lamp} />
        <rect x={0} y={0} width={1080} height={1920} fill={accent} opacity={0.04 * lamp} />
      </svg>
    </AbsoluteFill>
  );
};
