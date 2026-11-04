import React from "react";
import { AbsoluteFill, Easing, interpolate, useCurrentFrame, useVideoConfig } from "remotion";
import { COLORS, FONTS, SAFE } from "../lib/theme";

export type EndCardProps = {
  /** Номер СЛЕДУЮЩЕЙ части. */
  part: number;
  /** "next" — «ЧАСТЬ N — В ПРОФИЛЕ», "choice" — плюс выбор А/Б в комментарии. */
  variant?: "next" | "choice";
  question?: string;
  choiceA?: string;
  choiceB?: string;
  delay?: number;
  accent?: string;
};

export const EndCard: React.FC<EndCardProps> = ({
  part,
  variant = "next",
  question = "ЧТО ДЕЛАТЬ?",
  choiceA = "ВАРИАНТ А",
  choiceB = "ВАРИАНТ Б",
  delay = 0,
  accent = COLORS.accent,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const f = frame - delay * fps;
  if (f < 0) return null;
  const ease = { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: Easing.bezier(0.16, 1, 0.3, 1) } as const;
  const bg = interpolate(f, [0, 8], [0, 1], ease);
  const title = interpolate(f, [3, 13], [0, 1], ease);
  const opts = interpolate(f, [8, 18], [0, 1], ease);
  const arrow = Math.sin((f / fps) * Math.PI * 2 * 1.5) * 10;

  const choiceBox = (letter: string, text: string, i: number) => (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: 20,
        background: COLORS.panel,
        border: `4px solid ${i === 0 ? accent : COLORS.text}`,
        borderRadius: 14,
        padding: "18px 24px",
        opacity: opts,
        translate: `${(1 - opts) * (i === 0 ? -40 : 40)}px 0px`,
      }}
    >
      <div
        style={{
          fontFamily: FONTS.title,
          fontWeight: 700,
          fontSize: 64,
          width: 76,
          height: 76,
          lineHeight: "76px",
          textAlign: "center",
          borderRadius: 10,
          background: i === 0 ? accent : COLORS.text,
          color: COLORS.bg,
          flexShrink: 0,
        }}
      >
        {letter}
      </div>
      <div style={{ fontFamily: FONTS.ui, fontWeight: 900, fontSize: 42, color: COLORS.text, lineHeight: 1.1 }}>{text}</div>
    </div>
  );

  return (
    <AbsoluteFill style={{ background: `rgba(4,6,9,${0.88 * bg})` }}>
      <div
        style={{
          position: "absolute",
          left: SAFE.left + 20,
          right: SAFE.left + 20,
          top: variant === "choice" ? 470 : 640,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: 26,
        }}
      >
        <div
          style={{
            fontFamily: FONTS.title,
            fontWeight: 700,
            fontSize: 120,
            color: COLORS.text,
            letterSpacing: 6,
            lineHeight: 1,
            opacity: title,
            scale: String(0.85 + 0.15 * title),
          }}
        >
          ЧАСТЬ {part}
        </div>
        <div
          style={{
            fontFamily: FONTS.mono,
            fontWeight: 700,
            fontSize: 46,
            color: COLORS.bg,
            background: accent,
            padding: "8px 26px",
            borderRadius: 8,
            letterSpacing: 3,
            opacity: title,
          }}
        >
          — В ПРОФИЛЕ —
        </div>
        {variant === "choice" ? (
          <div style={{ width: "100%", display: "flex", flexDirection: "column", gap: 18, marginTop: 30 }}>
            <div
              style={{
                fontFamily: FONTS.ui,
                fontWeight: 900,
                fontSize: 48,
                color: COLORS.text,
                textAlign: "center",
                opacity: opts,
              }}
            >
              {question}
            </div>
            {choiceBox("А", choiceA, 0)}
            {choiceBox("Б", choiceB, 1)}
            <div
              style={{
                fontFamily: FONTS.mono,
                fontWeight: 700,
                fontSize: 32,
                color: COLORS.textDim,
                textAlign: "center",
                opacity: opts,
                translate: `0px ${arrow}px`,
              }}
            >
              ↓ ПИШИ «А» ИЛИ «Б» В КОММЕНТАХ ↓
            </div>
          </div>
        ) : null}
      </div>
    </AbsoluteFill>
  );
};
