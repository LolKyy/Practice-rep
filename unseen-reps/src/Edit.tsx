// ШАБЛОН ЭДИТА: ваши картинки/клипы + ваша музыка, нарезка в такт, эффекты, крупный текст.
// Всё настраивается в src/edit.json — код трогать не нужно. Файлы кладите в public/edit/.
import React from "react";
import { AbsoluteFill, Audio, Img, OffthreadVideo, Sequence, interpolate, staticFile, useCurrentFrame, useVideoConfig } from "remotion";
import cfg from "./edit.json";
import beatsFile from "./beats.json";
import { COL, FPS } from "./kit3d";
import { EditOutro, Grain, MONO, PUNCH, SERIF } from "./overlay";

type Seg = { src?: string | null; beats?: number; text?: string; style?: "serif" | "punch" | "mono"; fx?: string; accent?: boolean };
const C = cfg as { music?: string | null; musicStart?: number; musicVolume?: number; bpm?: number; useBeats?: boolean; grade?: "bw" | "color";
  segments: Seg[]; outro?: string[]; outroBeats?: number };

// ---- сетка долей: из tools/beats.mjs (src/beats.json) или ровная по BPM
const beatTimes = (): number[] => {
  const start = C.musicStart ?? 0;
  const detected = (beatsFile as { beats: number[] }).beats.filter((b) => b >= start).map((b) => b - start);
  if (C.useBeats !== false && detected.length > 8) return [0, ...detected.filter((b) => b > 0.05)];
  const step = 60 / (C.bpm ?? 120);
  return Array.from({ length: 400 }, (_, i) => i * step);
};
const BEATS = beatTimes();
export const EDIT_PLAN = (() => {
  let bi = 0;
  const out = C.segments.map((s) => {
    const a = BEATS[bi], b = BEATS[Math.min(BEATS.length - 1, bi + (s.beats ?? 1))];
    bi += s.beats ?? 1;
    return { ...s, t0: a, t1: b };
  });
  const outroT0 = BEATS[bi] ?? out[out.length - 1].t1;
  const outroLen = (C.outro?.length ?? 0) ? Math.max(2.4, (C.outro!.length) * 0.9 + 1.2) : 0;
  return { segs: out, outroT0, total: Math.ceil((outroT0 + outroLen) * FPS) };
})();
export const EDIT_TOTAL = EDIT_PLAN.total;

const isVideo = (s: string) => /\.(mp4|mov|webm|m4v)$/i.test(s);

const Media: React.FC<{ seg: Seg; len: number }> = ({ seg, len }) => {
  const f = useCurrentFrame();
  const t = f / FPS;
  const fx = seg.fx ?? "zoom";
  let scale = 1, x = 0, y = 0, blur = 0;
  if (fx.includes("zoom")) scale *= interpolate(t, [0, len], [1.18, 1.0]);
  if (fx.includes("push")) scale *= interpolate(t, [0, len], [1.0, 1.2]);
  if (fx.includes("punch")) scale *= 1 + 0.25 * Math.exp(-t * 14);
  if (fx.includes("shake")) { x = Math.sin(f * 2.1) * 14 * Math.exp(-t * 3); y = Math.cos(f * 2.7) * 10 * Math.exp(-t * 3); }
  if (fx.includes("blur")) blur = interpolate(t, [0, 0.25], [24, 0], { extrapolateRight: "clamp" });
  const grade = C.grade === "color" ? "contrast(1.15) saturate(1.1)" : "grayscale(1) contrast(1.45) brightness(0.82)";
  const style: React.CSSProperties = { width: "100%", height: "100%", objectFit: "cover", transform: `translate(${x}px,${y}px) scale(${scale})`, filter: `${grade} blur(${blur}px)` };
  const body = seg.src
    ? (isVideo(seg.src) ? <OffthreadVideo src={staticFile(seg.src)} muted style={style} /> : <Img src={staticFile(seg.src)} style={style} />)
    : <div style={{ ...style, background: "radial-gradient(circle at 50% 40%, #2a2d35 0%, #07080b 70%)" }} />; // заглушка, пока нет картинки
  const rgb = fx.includes("rgb") && t < 0.3;
  return (
    <AbsoluteFill style={{ overflow: "hidden" }}>
      {body}
      {rgb ? <AbsoluteFill style={{ mixBlendMode: "screen", opacity: 0.6, transform: `translateX(${12 * (1 - t / 0.3)}px)`, background: "#ff004030" }} /> : null}
      {fx.includes("flash") ? <AbsoluteFill style={{ background: "#fff", opacity: Math.max(0, 1 - t * 7) }} /> : null}
    </AbsoluteFill>
  );
};

const SegText: React.FC<{ seg: Seg }> = ({ seg }) => {
  const f = useCurrentFrame();
  const t = f / FPS;
  if (!seg.text) return null;
  const st = seg.style ?? "serif";
  const k = Math.min(1, t / 0.12);
  const c = seg.accent ? COL.ghost : "#f4f4f0";
  const base: React.CSSProperties = st === "punch"
    ? { fontFamily: PUNCH, fontSize: 170, lineHeight: 0.95, letterSpacing: 2, textTransform: "uppercase" }
    : st === "mono" ? { fontFamily: MONO, fontWeight: 800, fontSize: 58, letterSpacing: 6 }
    : { fontFamily: SERIF, fontWeight: 900, fontSize: 132, lineHeight: 1.0 };
  return (
    <AbsoluteFill style={{ justifyContent: "center", alignItems: "center", padding: 70 }}>
      <div style={{ position: "relative", transform: `scale(${1.25 - 0.25 * k})` }}>
        <div style={{ ...base, color: c, textAlign: "center", position: "absolute", inset: 0, filter: "blur(16px)", opacity: 0.6 * (1 - k * 0.6) }}>{seg.text}</div>
        <div style={{ ...base, color: c, textAlign: "center", textShadow: "0 8px 40px #000" }}>{seg.text}</div>
      </div>
    </AbsoluteFill>
  );
};

export const Edit: React.FC = () => {
  const { durationInFrames } = useVideoConfig();
  return (
    <AbsoluteFill style={{ background: "#000" }}>
      {EDIT_PLAN.segs.map((s, i) => {
        const from = Math.round(s.t0 * FPS), len = Math.max(1, Math.round((s.t1 - s.t0) * FPS));
        return <Sequence key={i} from={from} durationInFrames={len}><Media seg={s} len={len / FPS} /><SegText seg={s} /></Sequence>;
      })}
      {C.outro?.length ? <EditOutro from={EDIT_PLAN.outroT0} lines={C.outro} /> : null}
      <Grain amount={0.14} />
      {C.music ? <Audio src={staticFile(C.music)} startFrom={Math.round((C.musicStart ?? 0) * FPS)}
        volume={(f) => interpolate(f, [0, 6, durationInFrames - 20, durationInFrames], [0, C.musicVolume ?? 1, C.musicVolume ?? 1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" })} /> : null}
    </AbsoluteFill>
  );
};
