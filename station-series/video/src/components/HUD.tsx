import React from "react";
import { interpolate, useCurrentFrame, useVideoConfig } from "remotion";
import { COLORS, FONTS, SAFE, Track } from "../lib/theme";
import { sampleTrack } from "../lib/track";

export type HudTimer = {
  label?: string;
  /** Стартовое значение в секундах (например 3*3600 = 03:00:00). */
  startSeconds: number;
  /** "down" — обратный отсчёт, "up" — секундомер. */
  direction?: "up" | "down";
  /** Во сколько раз быстрее реального времени тикает (1 = честно). */
  speed?: number;
};
export type HudGauge = { label: string; percent: Track; danger?: number };
export type HudDistance = { label?: string; meters: Track; unit?: string; danger?: number };

export type HUDProps = {
  timer?: HudTimer;
  gauge?: HudGauge;
  distance?: HudDistance;
  top?: number;
  accent?: string;
};

const pad = (n: number) => String(Math.max(0, Math.floor(n))).padStart(2, "0");
export const formatHMS = (s: number) => `${pad(s / 3600)}:${pad((s % 3600) / 60)}:${pad(s % 60)}`;

const Plate: React.FC<{ label: string; children: React.ReactNode; alert?: boolean; accent: string; flex?: number }> = ({
  label,
  children,
  alert,
  accent,
  flex = 1,
}) => (
  <div
    style={{
      flex,
      minWidth: 0,
      background: "rgba(10,14,19,0.86)",
      border: `3px solid ${alert ? accent : COLORS.panelEdge}`,
      borderRadius: 14,
      padding: "12px 16px 14px",
      boxShadow: `0 8px 24px ${COLORS.shadow}`,
      fontFamily: FONTS.mono,
      color: COLORS.text,
    }}
  >
    <div
      style={{
        fontSize: 22,
        letterSpacing: 2,
        color: alert ? accent : COLORS.textDim,
        whiteSpace: "nowrap",
        overflow: "hidden",
        textOverflow: "ellipsis",
      }}
    >
      {label}
    </div>
    {children}
  </div>
);

export const HUD: React.FC<HUDProps> = ({ timer, gauge, distance, top = SAFE.top + 20, accent = COLORS.accent }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const t = frame / fps;
  const appear = interpolate(frame, [0, 8], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });

  return (
    <div
      style={{
        position: "absolute",
        top,
        left: SAFE.left,
        right: SAFE.left,
        display: "flex",
        gap: 16,
        opacity: appear,
        translate: `0px ${(1 - appear) * -20}px`,
      }}
    >
      {timer ? (
        (() => {
          const dir = timer.direction ?? "down";
          const v = timer.startSeconds + (dir === "down" ? -1 : 1) * t * (timer.speed ?? 1);
          return (
            <Plate label={timer.label ?? "ВРЕМЯ"} accent={accent} alert={dir === "down" && v < 60} flex={1.15}>
              <div style={{ fontSize: 50, fontWeight: 700, lineHeight: 1.1, fontVariantNumeric: "tabular-nums" }}>
                {formatHMS(Math.max(0, v))}
              </div>
            </Plate>
          );
        })()
      ) : null}
      {gauge ? (
        (() => {
          const p = Math.max(0, Math.min(100, sampleTrack(gauge.percent, t)));
          const danger = p <= (gauge.danger ?? 25);
          return (
            <Plate label={gauge.label} accent={accent} alert={danger}>
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <div style={{ fontSize: 44, fontWeight: 700, lineHeight: 1.15, width: 120 }}>{Math.round(p)}%</div>
                <div style={{ flex: 1, height: 18, background: "#1D2630", borderRadius: 4, overflow: "hidden" }}>
                  <div style={{ width: `${p}%`, height: "100%", background: danger ? accent : COLORS.text }} />
                </div>
              </div>
            </Plate>
          );
        })()
      ) : null}
      {distance ? (
        (() => {
          const m = sampleTrack(distance.meters, t);
          const danger = m <= (distance.danger ?? 20);
          // пульс: чем ближе, тем чаще
          const hz = interpolate(m, [0, 50], [3, 0.8], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
          const pulse = 0.5 + 0.5 * Math.cos(t * hz * Math.PI * 2);
          return (
            <Plate label={distance.label ?? "ДО ЦЕЛИ"} accent={accent} alert={danger}>
              <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                <div
                  style={{
                    width: 18,
                    height: 18,
                    borderRadius: 9,
                    background: danger ? accent : COLORS.text,
                    opacity: 0.35 + 0.65 * pulse,
                    scale: String(0.8 + 0.4 * pulse),
                    boxShadow: danger ? `0 0 ${10 + 14 * pulse}px ${accent}` : "none",
                    flexShrink: 0,
                  }}
                />
                <div style={{ fontSize: 50, fontWeight: 700, lineHeight: 1.1, color: danger ? accent : COLORS.text }}>
                  {Math.round(m)} {distance.unit ?? "м"}
                </div>
              </div>
            </Plate>
          );
        })()
      ) : null}
    </div>
  );
};
