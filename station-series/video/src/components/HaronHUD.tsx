import React from "react";
import { AbsoluteFill, interpolate, useCurrentFrame, useVideoConfig } from "remotion";
import { FONTS } from "../lib/theme";
import { formatHMS } from "./HUD";

// HUD сериала «ХАРОН» (библия v3, раздел 7 и 12).
// Таймер ДО ПАДЕНИЯ, КИСЛОРОД, ОТСЕК °C, мини-схема 5 палуб, круглый термосканер,
// фирменная вспышка «ОБНАРУЖЕН», иней по краям кадра.

export const HARON = {
  red: "#FF3B2F",
  ice: "#9FE3FF",
  iceDeep: "#3E8FB8",
  warm: "#FF8A3D",
  white: "#F2F6F8",
  plate: "rgba(6,10,16,0.86)",
  edge: "#1F2A36",
} as const;

export type ScanDot = { angle: number; dist: number; kind: "warm" | "cold" }; // angle° (0 — вверх, по часовой), dist 0..1

export type HaronHUDProps = {
  /** Секунды на таймере в начале секвенции. */
  fallSeconds: number;
  oxygen: number;
  temp: number;
  /** Палуба 1..5 для «ТЫ ЗДЕСЬ». */
  deck: 1 | 2 | 3 | 4 | 5;
  dots: ScanDot[];
  scanLabel: string;
  /** Подпись поля температуры (по умолчанию «ОТСЕК»). */
  tempLabel?: string;
  /** Готовый текст значения температуры (например «35,1°»). */
  tempText?: string;
  /** Момент (сек) вспышки «ОБНАРУЖЕН». */
  detectAt?: number;
  /** Уровень инея по краям 0..1. */
  frost?: number;
  /** Приглушить HUD на 30% (спокойный момент). */
  dim?: boolean;
};

const DECKS = ["СТЫКОВКА", "КАПСУЛЫ", "ЖИЛОЙ", "МЕДБЛОК", "БЛОК 0"];

export const HaronHUD: React.FC<HaronHUDProps> = ({
  fallSeconds,
  oxygen,
  temp,
  deck,
  dots,
  scanLabel,
  tempLabel = "ОТСЕК",
  tempText,
  detectAt,
  frost = 0,
  dim = false,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const t = frame / fps;
  // вспышка «ОБНАРУЖЕН»: 0.5 с, помеха в первые 0.15 с
  const dt = detectAt === undefined ? -1 : t - detectAt;
  const flash = dt >= 0 ? interpolate(dt, [0, 0.06, 0.5], [0, 1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }) : 0;
  const glitch = dt >= 0 && dt < 0.15 ? (Math.floor(dt * 60) % 2 ? 8 : -6) : 0;
  const detected = dt >= 0;
  const op = dim && !detected ? 0.7 : 1;
  const nearest = dots.filter((d) => d.kind === "cold").reduce((m, d) => Math.min(m, d.dist), 1);
  const beepHz = detected ? interpolate(nearest, [0, 1], [6, 1.5]) : 1;
  const blink = 0.5 + 0.5 * Math.cos(t * Math.PI * 2 * beepHz);
  const sweep = (t * 160) % 360;
  const R = 104;

  return (
    <AbsoluteFill style={{ pointerEvents: "none" }}>
      {/* иней по краям */}
      {frost > 0 ? (
        <svg width={1080} height={1920} style={{ position: "absolute", inset: 0 }}>
          <defs>
            <radialGradient id="hud-frost" cx="0.5" cy="0.5" r="0.72">
              <stop offset={String(0.78 - frost * 0.2)} stopColor="#CDEFFF" stopOpacity="0" />
              <stop offset="1" stopColor="#E6F7FF" stopOpacity={0.25 + frost * 0.35} />
            </radialGradient>
            <filter id="hud-frost-n">
              <feTurbulence type="fractalNoise" baseFrequency="0.045" numOctaves={3} seed={11} />
              <feColorMatrix type="matrix" values="0 0 0 0 0.9  0 0 0 0 0.97  0 0 0 0 1  0 0 0 3 -1.6" />
            </filter>
            <mask id="hud-frost-m">
              <rect width={1080} height={1920} fill="url(#hud-frost)" />
            </mask>
          </defs>
          <rect width={1080} height={1920} fill="url(#hud-frost)" />
          <rect width={1080} height={1920} filter="url(#hud-frost-n)" mask="url(#hud-frost-m)" opacity={0.45} />
        </svg>
      ) : null}

      {/* красная вспышка по краям */}
      {flash > 0 ? (
        <AbsoluteFill style={{ boxShadow: `inset 0 0 ${160 * flash}px ${60 * flash}px rgba(255,40,30,${0.75 * flash})` }} />
      ) : null}

      <div style={{ position: "absolute", inset: 0, opacity: op, translate: `${glitch}px 0px` }}>
        {/* ТАЙМЕР */}
        <div
          style={{
            position: "absolute",
            top: 160,
            left: 60,
            width: 560,
            background: HARON.plate,
            border: `3px solid ${HARON.red}`,
            borderRadius: 14,
            padding: "10px 20px 12px",
            fontFamily: FONTS.mono,
          }}
        >
          <div style={{ fontSize: 24, letterSpacing: 3, color: HARON.red, fontWeight: 700 }}>ДО ПАДЕНИЯ</div>
          <div style={{ fontSize: 76, lineHeight: 1, fontWeight: 700, color: HARON.red, textShadow: `0 0 18px rgba(255,59,47,0.55)` }}>
            {formatHMS(Math.max(0, fallSeconds - t))}
          </div>
        </div>
        {/* КИСЛОРОД */}
        <div
          style={{
            position: "absolute",
            top: 160,
            right: 60,
            width: 380,
            background: HARON.plate,
            border: `3px solid ${HARON.edge}`,
            borderRadius: 14,
            padding: "10px 18px 14px",
            fontFamily: FONTS.mono,
            color: HARON.white,
          }}
        >
          <div style={{ fontSize: 24, letterSpacing: 3, color: "#8A9AA8", fontWeight: 700 }}>КИСЛОРОД</div>
          <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
            <div style={{ fontSize: 58, fontWeight: 700, lineHeight: 1.05 }}>{oxygen}%</div>
            <div style={{ flex: 1, height: 16, background: "#1D2630", borderRadius: 4, overflow: "hidden" }}>
              <div style={{ width: `${oxygen}%`, height: "100%", background: oxygen < 30 ? HARON.red : HARON.white }} />
            </div>
          </div>
        </div>
        {/* ОТСЕК °C */}
        <div
          style={{
            position: "absolute",
            top: 302,
            left: 60,
            background: HARON.plate,
            border: `3px solid ${HARON.iceDeep}`,
            borderRadius: 12,
            padding: "6px 16px",
            fontFamily: FONTS.mono,
            fontWeight: 700,
            fontSize: 38,
            color: HARON.ice,
          }}
        >
          {tempLabel}: {tempText ?? `${temp > 0 ? "+" : temp < 0 ? "−" : ""}${Math.abs(temp)}°C`}
        </div>
        {/* МИНИ-СХЕМА 5 палуб */}
        <svg width={190} height={250} style={{ position: "absolute", top: 380, left: 60 }}>
          <rect x={0} y={0} width={190} height={250} rx={12} fill={HARON.plate} stroke={HARON.edge} strokeWidth={3} />
          <text x={14} y={26} fontFamily={FONTS.mono} fontWeight={700} fontSize={18} fill="#8A9AA8">
            «ХАРОН-7»
          </text>
          {DECKS.map((name, i) => {
            const y = 40 + i * 41;
            const here = i + 1 === deck;
            return (
              <g key={name}>
                <rect x={12} y={y} width={166} height={34} rx={6} fill={here ? "rgba(255,59,47,0.18)" : "#0E1722"} stroke={here ? HARON.red : "#2A3846"} strokeWidth={2} />
                <text x={22} y={y + 23} fontFamily={FONTS.mono} fontWeight={700} fontSize={16} fill={here ? HARON.white : "#6F8293"}>
                  {i + 1} {name}
                </text>
                {here ? <circle cx={162} cy={y + 17} r={7 + 3 * blink} fill={HARON.red} /> : null}
              </g>
            );
          })}
        </svg>
        {/* ТЕРМОСКАНЕР */}
        <svg width={300} height={330} style={{ position: "absolute", top: 302, right: 60 }}>
          <defs>
            <radialGradient id="scan-bg" cx="0.5" cy="0.5" r="0.5">
              <stop offset="0" stopColor="#0B2A20" />
              <stop offset="1" stopColor="#04110C" />
            </radialGradient>
            <linearGradient id="scan-sweep" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0" stopColor={HARON.warm} stopOpacity="0" />
              <stop offset="1" stopColor={HARON.warm} stopOpacity="0.35" />
            </linearGradient>
          </defs>
          <rect x={0} y={0} width={300} height={330} rx={16} fill={HARON.plate} stroke={detected ? HARON.red : HARON.edge} strokeWidth={3} />
          <g transform="translate(150, 128)">
            <circle r={R} fill="url(#scan-bg)" stroke="#2C4A3C" strokeWidth={3} />
            {[0.33, 0.66].map((k) => (
              <circle key={k} r={R * k} fill="none" stroke="#1F3A2E" strokeWidth={2} />
            ))}
            <path d={`M 0 ${-R} L 0 ${R} M ${-R} 0 L ${R} 0`} stroke="#1F3A2E" strokeWidth={2} />
            <path d={`M 0 0 L 0 ${-R} A ${R} ${R} 0 0 1 ${R * Math.sin(0.6)} ${-R * Math.cos(0.6)} Z`} fill="url(#scan-sweep)" transform={`rotate(${sweep})`} />
            {/* «я» в центре */}
            <path d="M 0 -9 L 7 7 L 0 3 L -7 7 Z" fill={HARON.white} />
            {dots.map((d, i) => {
              const a = (d.angle * Math.PI) / 180;
              const cx = Math.sin(a) * d.dist * R;
              const cy = -Math.cos(a) * d.dist * R;
              const col = d.kind === "warm" ? HARON.warm : HARON.ice;
              return (
                <g key={i}>
                  <circle cx={cx} cy={cy} r={d.kind === "cold" ? 10 + 8 * blink : 8} fill={col} opacity={d.kind === "cold" ? 0.25 : 0.2} />
                  <circle cx={cx} cy={cy} r={d.kind === "cold" ? 8 : 7} fill={col} opacity={d.kind === "cold" ? 0.6 + 0.4 * blink : 1} />
                </g>
              );
            })}
          </g>
          <text x={150} y={268} textAnchor="middle" fontFamily={FONTS.mono} fontWeight={700} fontSize={19} fill="#8A9AA8" letterSpacing={2}>
            {detected ? "▲ ОБНАРУЖЕН" : "ТЕРМОСКАНЕР"}
          </text>
          <text x={150} y={304} textAnchor="middle" fontFamily={FONTS.mono} fontWeight={700} fontSize={scanLabel.length > 18 ? 20 : 24} fill={detected ? HARON.ice : HARON.white}>
            {scanLabel}
          </text>
        </svg>
      </div>
    </AbsoluteFill>
  );
};
