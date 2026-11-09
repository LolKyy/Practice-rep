// «WHAT KEEPS YOU CLIMBING?» (~22 с, 60 fps). Своя история UNSEEN REPS на нашей лестнице.
// Наверх бегут «причины»: HYPE, LIKES, REVENGE, MOTIVATION и неприметный PURPOSE.
// Сверху катятся препятствия из жизни и выбивают причины по одной. MOTIVATION выгорает сама.
// PURPOSE идёт ровно, препятствия перепрыгивают через него — он доходит до вершины.
// Финал: «REASONS FALL. / PURPOSE CLIMBS.»
import React from "react";
import { AbsoluteFill, Audio, interpolate, staticFile, useCurrentFrame, useVideoConfig } from "remotion";
import { COL } from "../kit3d";
import { Grain, MONO } from "../overlay";
import {
  Cone, Figure, Flame, HEAD, N, P, SH, SW, Skel, Smoke, Stairs, clamp01, climb, ease, keys, lerp, lerpP, mixSkel, sitting, standing, stepTop, stepX,
} from "./MotivationVsDiscipline";

export const WKYC_FPS = 60;
export const WKYC_TOTAL = Math.round(22 * WKYC_FPS);
const BEAT = 0.6;                       // 100 BPM — удары и склейки по сетке
const RED = "#ff4a55";

// ------------------------------------------------------------------ герои
type Racer = { name: string; s: (t: number) => number; run: boolean; color?: string; hit?: number };
const lin = (s0: number, v: number, t0 = 0.3) => (t: number) => s0 + v * Math.max(0, t - t0);
const RACERS: Racer[] = [
  { name: "HYPE", s: lin(11, 3.0), run: true, hit: 5 * BEAT },          // 3.0 с
  { name: "LIKES", s: lin(7.6, 2.7), run: true, hit: 9 * BEAT },         // 5.4 с
  { name: "REVENGE", s: lin(4.4, 2.4), run: true, hit: 13 * BEAT },    // 7.8 с
];
const sP = (t: number) => Math.min(N, Math.max(0, (t - 0.5) / 0.52));   // PURPOSE: ровно, ступень за 0.52 с
const tTopP = 0.5 + N * 0.52;                                          // ≈17.1 с
const sMot = (t: number) => keys(t, [[0.3, 1.6], [6.0, 14], [9.0, 18.6], [10.2, 19.6]]);
const MOT_SIT = 19.6;

// ------------------------------------------------------------------ препятствия
type Rock = { label: string; tHit: number; target: (t: number) => number; over?: boolean };
const V_ROCK = 5.2;                                                    // ступеней в секунду вниз
const ROCKS: Rock[] = [
  { label: "NO RESULTS", tHit: RACERS[0].hit!, target: RACERS[0].s },
  { label: "WHAT WILL THEY SAY?", tHit: RACERS[1].hit!, target: RACERS[1].s },
  { label: "BURNOUT", tHit: RACERS[2].hit!, target: RACERS[2].s },
  { label: "BILLS", tHit: 21 * BEAT, target: sP, over: true },          // 12.6 с — перепрыгивает PURPOSE
  { label: "BOREDOM", tHit: 24 * BEAT, target: sP, over: true },        // 14.4 с
];
const rockS = (r: Rock, t: number) => r.target(r.tHit) + V_ROCK * (r.tHit - t);   // s камня во времени
const ROCK_R = 40;

const RockView: React.FC<{ r: Rock; t: number }> = ({ r, t }) => {
  const s = rockS(r, t);
  if (s > N + 3 || s < -6) return null;
  const k = Math.max(0, Math.min(N, Math.floor(s)));
  const frac = s - Math.floor(s);
  let y = stepTop(k) - ROCK_R - Math.abs(Math.sin(frac * Math.PI)) * 26;
  if (r.over) {                                                        // высокий отскок над героем
    const d = (t - r.tHit) / 0.42;
    if (Math.abs(d) < 1) y -= Math.cos((d * Math.PI) / 2) * 260;
  }
  const x = s * SW + SW / 2;
  const rot = -t * 520;
  return (
    <g>
      <ellipse cx={x} cy={stepTop(k) + 2} rx={ROCK_R * 0.9} ry={8} fill="#000" opacity={0.45} filter="url(#reflBlur)" />
      <g transform={`rotate(${rot},${x},${y})`}>
        <circle cx={x} cy={y} r={ROCK_R} fill="#0c0c0f" stroke="#3a3b42" strokeWidth={3} />
        <path d={`M ${x - 20} ${y - 12} Q ${x} ${y - 4} ${x + 14} ${y - 24}`} stroke="#2a2b31" strokeWidth={4} fill="none" />
        <path d={`M ${x - 6} ${y + 18} Q ${x + 10} ${y + 6} ${x + 24} ${y + 14}`} stroke="#2a2b31" strokeWidth={4} fill="none" />
      </g>
      <circle cx={x - 12} cy={y - 14} r={ROCK_R * 0.35} fill="#ffffff" opacity={0.06} />
    </g>
  );
};

/** Сбитый герой: замирает в позе удара, кувыркается назад вниз по лестнице, сереет и исчезает. */
const Knocked: React.FC<{ sk: Skel; dt: number }> = ({ sk, dt }) => {
  const k = clamp01(dt / 1.6);
  const dx = -dt * SW * 5.5, dy = dt * SH * 5.5 + 260 * dt * dt;
  const ang = -dt * 420;
  const g = Math.round(244 - 130 * clamp01(dt / 0.5));
  return (
    <g opacity={1 - k} transform={`translate(${dx},${dy}) rotate(${ang},${sk.hip[0]},${sk.hip[1] - 60})`}>
      <Figure s={sk} glow={0.3 * (1 - k)} color={`rgb(${g},${g},${g - 2})`} back={`rgb(${g - 70},${g - 70},${g - 72})`} />
    </g>
  );
};

// ------------------------------------------------------------------ сцена
export const WhatKeepsYouClimbing: React.FC = () => {
  const f = useCurrentFrame();
  const { fps, width, height, durationInFrames } = useVideoConfig();
  const t = f / fps;
  const topX = (N + 1) * SW + 120, topY = stepTop(N);

  // PURPOSE: ровный шаг, лёгкий присед под пролетающим камнем, на вершине выпрямляется
  const atTop = clamp01((t - tTopP) / 0.6);
  const duck = ROCKS.filter((r) => r.over).reduce((m, r) => Math.max(m, 1 - Math.abs(t - r.tHit) / 0.3), 0);
  const startK = clamp01((t - 0.2) / 0.4);
  let skP = mixSkel(standing(stepX(0) - 120, 0), climb(sP(t), false, 0.6 * Math.max(0, duck)), ease(startK));
  if (atTop > 0) skP = mixSkel(climb(N, false), standing(topX - 60 + atTop * 60, topY, 0.15 * atTop), atTop);

  // MOTIVATION: бежит, выдыхается (огонь гаснет), садится
  const tired = clamp01((t - 7.8) / 2);
  const sitK = clamp01((t - 10.2) / 0.55);
  const skMrun = climb(sMot(t), t < 8.6, tired);
  const skM = sitK > 0 ? mixSkel(skMrun, sitting(MOT_SIT), ease(sitK)) : skMrun;
  const flame = t < 7.8 ? 1 : t < 9.6 ? (0.55 + 0.45 * Math.abs(Math.sin(t * 19))) * (1 - (t - 7.8) / 1.8) : 0;
  const greyM = clamp01((t - 9.6) / 2);

  // гонщики до удара
  const racerSk = RACERS.map((r) => climb(r.s(Math.min(t, r.hit!)), true));

  // ---------------- шоты (склейки по сетке ударов)
  const at = (sk: Skel, dx = 60, dy = -130): P => [sk.hip[0] + dx, sk.hip[1] + dy];
  const group: P = [(racerSk[0].hip[0] + skP.hip[0]) / 2, (racerSk[0].hip[1] + skP.hip[1]) / 2 - 80];
  type Shot = { t0: number; t1: number; cam: (k: number) => { c: P; z: number }; inT?: "cut" | "flash" | "dip" };
  const SHOTS: Shot[] = [
    { t0: 0, t1: 4 * BEAT, cam: (k) => ({ c: group, z: lerp(0.78, 0.86, k) }) },
    { t0: 4 * BEAT, t1: 7 * BEAT, inT: "cut", cam: (k) => ({ c: at(racerSk[0], 40), z: lerp(1.45, 1.6, k) }) },
    { t0: 7 * BEAT, t1: 11 * BEAT, inT: "cut", cam: (k) => ({ c: at(racerSk[1], 40), z: lerp(1.4, 1.55, k) }) },
    { t0: 11 * BEAT, t1: 15 * BEAT, inT: "cut", cam: (k) => ({ c: at(racerSk[2], 40), z: lerp(1.4, 1.55, k) }) },
    { t0: 15 * BEAT, t1: 19 * BEAT, inT: "dip", cam: (k) => ({ c: lerpP(at(skM, 30, -170), [stepX(MOT_SIT) - 20, stepTop(MOT_SIT) - 200], ease(k)), z: lerp(1.9, 1.6, k) }) },
    { t0: 19 * BEAT, t1: 26 * BEAT, inT: "cut", cam: (k) => ({ c: at(skP, 120, -190), z: lerp(1.25, 1.15, k) }) },
    { t0: 26 * BEAT, t1: 30 * BEAT, inT: "dip", cam: (k) => ({ c: lerpP(at(skP, 140, -170), [topX - 140, topY - 280], ease(clamp01((k - 0.4) / 0.6))), z: lerp(1.6, 1.5, k) }) },
    { t0: 30 * BEAT, t1: 22, cam: (k) => {
      const kk = ease(clamp01(k / 0.7));
      return { c: lerpP([topX - 120, topY - 280], [(N * SW) / 2 + 260, stepTop(N / 2) - 120], kk), z: Math.exp(lerp(Math.log(1.5), Math.log(0.36), kk)) };
    } },
  ];
  let si = SHOTS.findIndex((s) => t >= s.t0 && t < s.t1);
  if (si < 0) si = SHOTS.length - 1;
  const shot = SHOTS[si];
  const { c: cam, z: zoom } = shot.cam(clamp01((t - shot.t0) / (shot.t1 - shot.t0)));
  // тряска на ударах
  const lastHit = ROCKS.map((r) => t - r.tHit).filter((d) => d >= 0 && d < 0.35).sort((a, b) => a - b)[0];
  const shake = lastHit !== undefined ? Math.exp(-lastHit * 14) * 14 : 0;
  const tx = width / 2 - cam[0] * zoom + Math.sin(f * 2.3) * shake, ty = height * 0.5 - cam[1] * zoom + Math.cos(f * 3.1) * shake;
  const toScreen = (p: P): P => [tx + p[0] * zoom, ty + p[1] * zoom];
  const sinceCut = t - shot.t0;

  const beam = keys(t, [[0, 0.15], [16.4, 0.2], [17.4, 1], [22, 0.85]]);
  const lamps = [5, 13, 21, 28];
  const hitFlash = ROCKS.filter((r) => !r.over).reduce((m, r) => Math.max(m, t >= r.tHit ? 1 - (t - r.tHit) / 0.09 : 0), 0);

  const W = (<g transform={`translate(${tx},${ty}) scale(${zoom})`}>
    <ellipse cx={600} cy={-500} rx={1600} ry={260} fill="#2a2d35" opacity={0.35} filter="url(#hazeBlur)" />
    <ellipse cx={1500} cy={-1050} rx={1500} ry={220} fill="#2a2d35" opacity={0.3} filter="url(#hazeBlur)" />
    <Stairs />
    {lamps.map((k) => <Cone key={k} x={stepX(k)} floor={stepTop(k)} o={0.85} />)}
    <g opacity={beam}>
      <polygon points={`${topX - 60},${topY - 2200} ${topX + 60},${topY - 2200} ${topX + 260},${topY} ${topX - 260},${topY}`} fill="url(#beamGrad)" filter="url(#coneBlur)" style={{ mixBlendMode: "screen" }} />
      <ellipse cx={topX} cy={topY} rx={380} ry={40} fill={COL.ghost} opacity={0.35} filter="url(#coneBlur)" />
    </g>
    {/* гонщики */}
    {RACERS.map((r, i) => t < r.hit! ? <Figure key={r.name} s={racerSk[i]} refl={0.2} /> : <Knocked key={r.name} sk={racerSk[i]} dt={t - r.hit!} />)}
    {/* мотивация */}
    <Figure s={skM} refl={0.2} glow={0.55 * (1 - greyM)} color={`rgb(${244 - 120 * greyM},${244 - 120 * greyM},${241 - 118 * greyM})`} back={`rgb(${169 - 70 * greyM},${169 - 70 * greyM},${166 - 70 * greyM})`} />
    <Flame at={[skM.head[0], skM.head[1] - HEAD - 12]} size={flame} t={t} />
    <Smoke at={[skM.head[0], skM.head[1] - HEAD]} t={t - 9.5} />
    {/* purpose */}
    <Figure s={skP} refl={0.22} glow={0.5 + 0.5 * clamp01((t - 16.9) / 0.8)} glowColor={t > 16.9 ? COL.ghost : "#ffffff"} />
    {ROCKS.map((r) => <RockView key={r.label} r={r} t={t} />)}
  </g>);

  // ---------------- подписи в экранных координатах
  const lbl = (p: P, text: string, color: string, size = 24) => (
    <div key={text} style={{ position: "absolute", left: p[0], top: p[1], transform: "translate(-50%,-100%)", fontFamily: MONO, fontWeight: 800, fontSize: size,
      letterSpacing: 7, color, whiteSpace: "nowrap", textShadow: "0 2px 10px #000" }}>{text}</div>
  );
  const showLabels = si < 7;
  const head = (sk: Skel, extra = 30): P => toScreen([sk.head[0], sk.head[1] - HEAD - extra]);
  const labels: React.ReactNode[] = [];
  if (showLabels) {
    RACERS.forEach((r, i) => { if (t < r.hit! + 0.25) labels.push(lbl(head(racerSk[i]), r.name, "#efefec")); });
    labels.push(lbl(head(skM, flame > 0.05 ? 125 : 30), "MOTIVATION", greyM > 0.5 ? "#7b7b7b" : "#ff8a3d"));
    labels.push(lbl(head(skP), "PURPOSE", t > 16.9 ? COL.ghost : "#efefec"));
    ROCKS.forEach((r) => {
      const s = rockS(r, t);
      if (s > N + 2 || s < -3 || t > r.tHit + 0.8) return;
      const k = Math.max(0, Math.min(N, Math.floor(s)));
      const p = toScreen([s * SW + SW / 2, stepTop(k) - ROCK_R * 2 - 20]);
      labels.push(lbl(p, r.label, RED, 22));
    });
  }

  // ---------------- мораль (печать)
  const typed = (txt: string, t0: number) => txt.slice(0, Math.max(0, Math.floor((t - t0) * 15)));
  const m1 = typed("REASONS FALL.", 18.6), m2 = typed("PURPOSE CLIMBS.", 19.6);

  const flashO = Math.max(shot.inT === "flash" ? Math.max(0, 1 - sinceCut / 0.12) : 0, hitFlash * 0.55);
  const dipO = shot.inT === "dip" ? Math.max(0, 1 - sinceCut / 0.3) : 0;
  const fadeIn = Math.max(0, 1 - t / 0.25), fadeOut = clamp01((t - 21.0) / 1.0);

  return (
    <AbsoluteFill style={{ background: "#0e0f12", overflow: "hidden" }}>
      <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`}>
        <defs>
          <radialGradient id="bg" cx="0.6" cy="0.2" r="1"><stop offset="0" stopColor="#262830" /><stop offset="0.6" stopColor="#14151a" /><stop offset="1" stopColor="#0c0d10" /></radialGradient>
          <linearGradient id="stairBody" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#1f2126" /><stop offset="1" stopColor="#111216" /></linearGradient>
          <linearGradient id="coneGrad" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#ffffff" stopOpacity="0.30" /><stop offset="1" stopColor="#ffffff" stopOpacity="0.04" /></linearGradient>
          <linearGradient id="beamGrad" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#e9fbff" stopOpacity="0.05" /><stop offset="0.7" stopColor="#bff3ff" stopOpacity="0.35" /><stop offset="1" stopColor={COL.ghost} stopOpacity="0.5" /></linearGradient>
          <radialGradient id="fireGlow"><stop offset="0" stopColor="#ff9a3d" stopOpacity="0.6" /><stop offset="1" stopColor="#ff6a1f" stopOpacity="0" /></radialGradient>
          <radialGradient id="vig" cx="0.5" cy="0.47" r="0.75"><stop offset="0.55" stopColor="#000" stopOpacity="0" /><stop offset="1" stopColor="#000" stopOpacity="0.75" /></radialGradient>
          <linearGradient id="fog" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#0e0f12" stopOpacity="0" /><stop offset="1" stopColor="#0e0f12" stopOpacity="0.9" /></linearGradient>
          <linearGradient id="reflGrad" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#fff" stopOpacity="1" /><stop offset="0.35" stopColor="#fff" stopOpacity="0" /></linearGradient>
          <mask id="reflFadeFig" maskContentUnits="objectBoundingBox"><rect width="1" height="1" fill="url(#reflGrad)" transform="translate(0,1) scale(1,-1)" /></mask>
          <filter id="heroGlow" x="-60%" y="-60%" width="220%" height="220%"><feGaussianBlur stdDeviation="9" /></filter>
          <filter id="softGlow" x="-80%" y="-80%" width="260%" height="260%"><feGaussianBlur stdDeviation="10" /></filter>
          <filter id="reflBlur" x="-30%" y="-30%" width="160%" height="160%"><feGaussianBlur stdDeviation="4" /></filter>
          <filter id="coneBlur" x="-30%" y="-10%" width="160%" height="120%"><feGaussianBlur stdDeviation="18" /></filter>
          <filter id="hazeBlur" x="-50%" y="-200%" width="200%" height="500%"><feGaussianBlur stdDeviation="60" /></filter>
        </defs>
        <rect width={width} height={height} fill="url(#bg)" />
        {W}
        <rect y={height * 0.74} width={width} height={height * 0.26} fill="url(#fog)" />
        <rect width={width} height={height} fill="url(#vig)" />
      </svg>

      {labels}

      {t < 18.2 ? <AbsoluteFill style={{ alignItems: "center", paddingTop: 290, opacity: 1 - clamp01((t - 17.8) / 0.4) }}>
        <div style={{ fontFamily: MONO, fontWeight: 500, fontSize: 30, letterSpacing: 9, color: "#ffffffd8" }}>WHAT KEEPS YOU CLIMBING?</div>
      </AbsoluteFill> : null}
      {t > 18.6 ? <AbsoluteFill style={{ alignItems: "center", paddingTop: 290 }}>
        <div style={{ fontFamily: MONO, fontWeight: 800, fontSize: 44, letterSpacing: 7, color: "#e6e6e3", minHeight: 56 }}>{m1}</div>
        <div style={{ fontFamily: MONO, fontWeight: 800, fontSize: 44, letterSpacing: 7, color: COL.ghost, marginTop: 14, textShadow: `0 0 24px ${COL.ghost}99` }}>{m2}</div>
      </AbsoluteFill> : null}

      <Grain amount={0.06} />
      <AbsoluteFill style={{ background: "#fff", opacity: flashO }} />
      <AbsoluteFill style={{ background: "#000", opacity: Math.max(dipO, fadeIn, fadeOut) }} />
      <Audio src={staticFile("music_wkyc.wav")} volume={(fr) => interpolate(fr, [0, 10, durationInFrames - 50, durationInFrames], [0, 0.8, 0.8, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" })} />
    </AbsoluteFill>
  );
};
