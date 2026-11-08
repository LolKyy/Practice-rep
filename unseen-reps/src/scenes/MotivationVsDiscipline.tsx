// «Motivation vs Discipline» (~19 с) — плоский 2D в духе drleonkessel: тёмная лестница вверх, свет, туман, отражение.
// Мотивация (с огнём над головой) бежит, выдыхается, огонь гаснет, садится. Дисциплина идёт ровно до вершины.
import React from "react";
import { AbsoluteFill, Audio, interpolate, spring, staticFile, useCurrentFrame, useVideoConfig } from "remotion";
import { COL, FPS } from "../kit3d";
import { Grain, MONO, PUNCH, SERIF } from "../overlay";

export const MVD_TOTAL = Math.round(19 * FPS);

// ------------------------------------------------------------------ мир: лестница
const SW = 60, SH = 34, N = 32;                        // ширина/высота ступени, число ступеней
const stepTop = (k: number) => -k * SH;
const stepX = (k: number) => k * SW + SW * 0.55;
type P = [number, number];
const lerp = (a: number, b: number, k: number) => a + (b - a) * k;
const lerpP = (a: P, b: P, k: number): P => [lerp(a[0], b[0], k), lerp(a[1], b[1], k)];
const clamp01 = (x: number) => Math.max(0, Math.min(1, x));
const ease = (x: number) => (x < 0.5 ? 2 * x * x : 1 - Math.pow(-2 * x + 2, 2) / 2);
const keys = (t: number, k: [number, number][]) => {
  if (t <= k[0][0]) return k[0][1];
  for (let i = 1; i < k.length; i++) if (t <= k[i][0]) return lerp(k[i - 1][1], k[i][1], ease((t - k[i - 1][0]) / (k[i][0] - k[i - 1][0])));
  return k[k.length - 1][1];
};

// ------------------------------------------------------------------ скелет
const L1 = 76, L2 = 74, TORSO = 118, HEAD = 34, UA = 68, FA = 64, HIP_H = 98;
type Skel = { hip: P; neck: P; head: P; kA: P; fA: P; kB: P; fB: P; eA: P; hA: P; eB: P; hB: P; face: number };

const ik = (hip: P, foot: P, face: number): P => {
  const dx = foot[0] - hip[0], dy = foot[1] - hip[1];
  const d = Math.min(Math.hypot(dx, dy), L1 + L2 - 0.5);
  const a = Math.acos(Math.max(-1, Math.min(1, (L1 * L1 + d * d - L2 * L2) / (2 * L1 * d))));
  const base = Math.atan2(dy, dx);
  const ang = base - a * face;
  return [hip[0] + Math.cos(ang) * L1, hip[1] + Math.sin(ang) * L1];
};
/** Рука: угол от вертикали вниз (вперёд = по направлению взгляда), сгиб локтя вперёд. */
const arm = (sh: P, ang: number, bend: number, face: number): [P, P] => {
  const e: P = [sh[0] + Math.sin(ang) * face * UA, sh[1] + Math.cos(ang) * UA];
  const a2 = ang + bend;
  return [e, [e[0] + Math.sin(a2) * face * FA, e[1] + Math.cos(a2) * FA]];
};
const upper = (hip: P, lean: number, nod: number, face: number) => {
  const neck: P = [hip[0] + Math.sin(lean) * face * TORSO, hip[1] - Math.cos(lean) * TORSO];
  const head: P = [neck[0] + Math.sin(lean + nod) * face * (HEAD + 10), neck[1] - Math.cos(lean + nod) * (HEAD + 10)];
  return { neck, head };
};

/** Подъём по лестнице: s — положение в ступенях (дробное). run — бег. */
const climb = (s: number, run: boolean, tired = 0): Skel => {
  const face = 1;
  const foot = (o: number): P => {
    const u = Math.max(0, (s - o) / 2), n = Math.floor(u), f = u - n;
    const p = o + 2 * n;
    if (f < 0.5) return [stepX(p), stepTop(p)];
    const k = ease((f - 0.5) / 0.5);
    const a: P = [stepX(p), stepTop(p)], b: P = [stepX(p + 2), stepTop(p + 2)];
    const q = lerpP(a, b, k);
    return [q[0], q[1] - Math.sin(k * Math.PI) * (run ? 34 : 22)];
  };
  const fA = foot(0), fB = foot(1);
  const bob = -Math.abs(Math.sin(s * Math.PI)) * (run ? 8 : 4);
  const hip: P = [s * SW + SW * 0.55 + 12, -s * SH - HIP_H + bob + tired * 10];
  const lean = run ? 0.38 : 0.12 + tired * 0.35;
  const { neck, head } = upper(hip, lean, run ? -0.1 : tired * 0.4, face);
  const sw = Math.sin(s * Math.PI) * (run ? 0.95 : 0.5) * (1 - tired * 0.7);
  const shA: P = [neck[0] - 4, neck[1] + 10], shB: P = [neck[0] + 4, neck[1] + 10];
  const [eA, hA] = arm(shA, -sw + (run ? 0.2 : 0), run ? 1.3 : 0.35, face);
  const [eB, hB] = arm(shB, sw + (run ? 0.2 : 0), run ? 1.3 : 0.35, face);
  return { hip, neck, head, kA: ik(hip, fA, face), fA, kB: ik(hip, fB, face), fB, eA, hA, eB, hB, face };
};
/** Сидит на ступени k лицом вниз по лестнице, голова опущена. */
const sitting = (k: number): Skel => {
  const face = -1;
  const hip: P = [k * SW + SW * 0.35, stepTop(k) - 16];
  const fA: P = [stepX(k - 2) - 6, stepTop(k - 2)], fB: P = [stepX(k - 2) + 14, stepTop(k - 2)];
  const { neck, head } = upper(hip, 0.3, 0.75, face);
  const sh: P = [neck[0], neck[1] + 10];
  const [eA, hA] = arm(sh, 0.55, 0.35, face);
  const [eB, hB] = arm([sh[0] + 4, sh[1]], 0.45, 0.45, face);
  return { hip, neck, head, kA: ik(hip, fA, face), fA, kB: ik(hip, fB, face), fB, eA, hA, eB, hB, face };
};
/** Стоит на площадке (вершина). */
const standing = (x: number, y: number, chin = 0): Skel => {
  const face = 1;
  const hip: P = [x, y - HIP_H - 46];
  const fA: P = [x - 14, y], fB: P = [x + 14, y];
  const { neck, head } = upper(hip, -0.02, -chin, face);
  const sh: P = [neck[0], neck[1] + 10];
  const [eA, hA] = arm([sh[0] - 6, sh[1]], -0.08, 0.1, face);
  const [eB, hB] = arm([sh[0] + 6, sh[1]], 0.08, 0.1, face);
  return { hip, neck, head, kA: ik(hip, fA, face), fA, kB: ik(hip, fB, face), fB, eA, hA, eB, hB, face };
};
const mixSkel = (a: Skel, b: Skel, k: number): Skel => {
  const o: any = { face: k < 0.5 ? a.face : b.face };
  for (const key of Object.keys(a)) if (key !== "face") o[key] = lerpP((a as any)[key], (b as any)[key], k);
  return o as Skel;
};

const Figure: React.FC<{ s: Skel; color?: string; back?: string; glow?: number; glowColor?: string }> = ({ s, color = "#f1f1ee", back = "#9d9d9b", glow = 0, glowColor = COL.ghost }) => {
  const line = (a: P, b: P, c: string, w: number) => <line x1={a[0]} y1={a[1]} x2={b[0]} y2={b[1]} stroke={c} strokeWidth={w} strokeLinecap="round" />;
  const body = (<>
    {line(s.hip, s.kB, back, 20)}{line(s.kB, s.fB, back, 18)}
    {line(s.neck, s.eB, back, 17)}{line(s.eB, s.hB, back, 16)}
    {line(s.hip, s.neck, color, 30)}
    {line(s.hip, s.kA, color, 20)}{line(s.kA, s.fA, color, 18)}
    <line x1={s.fA[0] - 4 * s.face} y1={s.fA[1] - 5} x2={s.fA[0] + 16 * s.face} y2={s.fA[1] - 5} stroke={color} strokeWidth={14} strokeLinecap="round" />
    <line x1={s.fB[0] - 4 * s.face} y1={s.fB[1] - 5} x2={s.fB[0] + 16 * s.face} y2={s.fB[1] - 5} stroke={back} strokeWidth={14} strokeLinecap="round" />
    {line(s.neck, s.eA, color, 17)}{line(s.eA, s.hA, color, 16)}
    <circle cx={s.head[0]} cy={s.head[1]} r={HEAD} fill={color} />
    <circle cx={s.head[0] - 9 * s.face} cy={s.head[1] - 10} r={HEAD * 0.45} fill="#ffffff" opacity={0.35} />
  </>);
  return (<g>
    {glow > 0 ? <g opacity={glow} filter="url(#glow)" style={{ mixBlendMode: "screen" }}>
      <g>{React.Children.map(body.props.children, (c: any) => c && React.cloneElement(c, { stroke: c.props.stroke ? glowColor : undefined, fill: c.props.fill ? glowColor : undefined }))}</g>
    </g> : null}
    {body}
  </g>);
};

/** Огонь мотивации над головой. size 0..1, flicker 0..1. */
const Flame: React.FC<{ at: P; size: number; t: number }> = ({ at, size, t }) => {
  if (size <= 0.01) return null;
  const w = Math.sin(t * 23) * 4 + Math.sin(t * 37) * 3;
  const h = (70 + Math.sin(t * 17) * 8) * size, r = 26 * size;
  const d = `M ${at[0] - r} ${at[1]} Q ${at[0] - r * 1.1} ${at[1] - h * 0.55} ${at[0] + w} ${at[1] - h} Q ${at[0] + r * 1.1} ${at[1] - h * 0.5} ${at[0] + r} ${at[1]} Q ${at[0]} ${at[1] + r * 0.7} ${at[0] - r} ${at[1]} Z`;
  const d2 = `M ${at[0] - r * 0.5} ${at[1]} Q ${at[0] - r * 0.6} ${at[1] - h * 0.4} ${at[0] + w * 0.6} ${at[1] - h * 0.65} Q ${at[0] + r * 0.6} ${at[1] - h * 0.35} ${at[0] + r * 0.5} ${at[1]} Q ${at[0]} ${at[1] + r * 0.4} ${at[0] - r * 0.5} ${at[1]} Z`;
  return (<g>
    <circle cx={at[0]} cy={at[1] - h * 0.4} r={h * 1.3} fill="url(#fireGlow)" opacity={0.8 * size} />
    <path d={d} fill="#ff6a1f" />
    <path d={d2} fill="#ffd36a" />
  </g>);
};
const Smoke: React.FC<{ at: P; t: number }> = ({ at, t }) => {
  if (t < 0 || t > 2.2) return null;
  return (<g>{[0, 1, 2, 3, 4].map((i) => {
    const k = clamp01((t - i * 0.12) / 1.8);
    if (k <= 0) return null;
    return <circle key={i} cx={at[0] + Math.sin(i * 2.1 + t * 2) * 18 * k} cy={at[1] - 30 - k * 160} r={12 + k * 34} fill="#8f8f8f" opacity={0.45 * (1 - k)} />;
  })}</g>);
};

const Label: React.FC<{ at: P; text: string; color: string; o?: number }> = ({ at, text, color, o = 1 }) => (
  <text x={at[0]} y={at[1]} fill={color} opacity={o} fontFamily={MONO} fontWeight={800} fontSize={26} letterSpacing={5} textAnchor="middle">{text}</text>
);

// ------------------------------------------------------------------ лестница
const Stairs: React.FC = () => {
  const pts: string[] = ["-3000,0"];
  for (let k = 0; k <= N; k++) pts.push(`${k * SW},${stepTop(k)}`, `${(k + 1) * SW},${stepTop(k)}`);
  pts.push(`${(N + 1) * SW + 2400},${stepTop(N)}`, `${(N + 1) * SW + 2400},900`, "-3000,900");
  return (<g>
    <polygon points={pts.join(" ")} fill="url(#stairBody)" />
    {Array.from({ length: N + 1 }, (_, k) => (
      <g key={k}>
        <rect x={k * SW} y={stepTop(k) - 2} width={SW} height={5} fill="#5d5f66" />
        <rect x={(k + 1) * SW - 2} y={stepTop(k + 1)} width={3} height={SH} fill="#121318" />
      </g>
    ))}
    <rect x={(N + 1) * SW} y={stepTop(N) - 2} width={2400} height={5} fill="#7a7c84" />
  </g>);
};

// ------------------------------------------------------------------ сцена
export const MotivationVsDiscipline: React.FC = () => {
  const f = useCurrentFrame();
  const { fps, width, height, durationInFrames } = useVideoConfig();
  const t = f / fps;

  // --- дисциплина: ровно 1 ступень / 0.42 с, с 1.6 с; на вершине стоит
  const sD = Math.max(0, Math.min(N, (t - 1.6) / 0.42));
  const topX = (N + 1) * SW + 120, topY = stepTop(N);
  const atTop = clamp01((t - (1.6 + N * 0.42)) / 0.6);
  const startK = clamp01((t - 1.3) / 0.6);   // дисциплина стоит позади на полу, потом подходит к лестнице
  const skDclimb = mixSkel(standing(stepX(0) - 150, 0), climb(sD, false), ease(startK));
  const skD = atTop > 0 ? mixSkel(climb(N, false), standing(topX - 60 + atTop * 60, topY, 0.15 * atTop), atTop) : skDclimb;

  // --- мотивация: рывок бегом, замедление, остановка, садится
  const sM = keys(t, [[1.2, 0], [5.4, 13.4], [6.9, 15]]);
  const tiredK = clamp01((t - 5.2) / 1.6);
  const sitK = clamp01((t - 7.0) / 0.55);
  const skMrun = mixSkel(standing(stepX(0) - 40, 0), climb(sM, t < 5.6, tiredK), ease(clamp01((t - 1.0) / 0.35)));
  const skM = sitK > 0 ? mixSkel(skMrun, sitting(15), ease(sitK)) : skMrun;
  const flame = t < 4.6 ? 1 : t < 6.3 ? (0.55 + 0.45 * Math.abs(Math.sin(t * 19))) * (1 - (t - 4.6) / 1.9) : 0;
  const grey = clamp01((t - 6.3) / 2);

  // --- камера (мировые координаты центра кадра + масштаб)
  const mid: P = [(skD.hip[0] + skM.hip[0]) / 2, (skD.hip[1] + skM.hip[1]) / 2];
  const followD: P = [skD.hip[0] + 40, skD.hip[1] - 40];
  const kFollow = clamp01((t - 6.6) / 1.6);
  let cam = lerpP(mid, followD, ease(kFollow));
  let zoom = keys(t, [[0, 1.35], [2, 1.15], [7, 1.15], [9, 1.05]]);
  const kOut = clamp01((t - 15.4) / 2.0);
  const wide: P = [(N * SW) / 2 + 200, stepTop(N / 2) - 160];
  cam = lerpP(cam, wide, ease(kOut));
  zoom = lerp(zoom, 0.43, ease(kOut));
  const camY = 1080;                                     // точка кадра, куда ставим «центр» (чуть ниже середины)
  const tx = width / 2 - cam[0] * zoom, ty = camY - cam[1] * zoom;

  // --- дождь
  const rain = clamp01((t - 6.6) / 0.8) * (1 - clamp01((t - 13.6) / 1.2));
  const day = Math.round(keys(t, [[1.6, 1], [5.5, 3], [6.6, 4], [9, 7], [11, 14], [13, 21], [14.9, 30]]));
  const topLight = keys(t, [[0, 0.35], [13.6, 0.4], [15, 1]]);

  const W = (<g transform={`translate(${tx},${ty}) scale(${zoom})`}>
    <Stairs />
    {/* отсвет вершины в мире */}
    <circle cx={topX + 80} cy={topY - 260} r={900} fill="url(#summit)" opacity={topLight} />
    <Figure s={skM} color={grey > 0 ? `rgb(${241 - 110 * grey},${241 - 110 * grey},${238 - 108 * grey})` : undefined} back={`rgb(${157 - 60 * grey},${157 - 60 * grey},${155 - 60 * grey})`} />
    <Flame at={[skM.head[0], skM.head[1] - HEAD - 14]} size={flame} t={t} />
    <Smoke at={[skM.head[0], skM.head[1] - HEAD]} t={t - 6.2} />
    <Figure s={skD} glow={clamp01((t - 14.6) / 0.8)} />
    {kOut < 0.6 && t > 2.2 ? (<>
      <Label at={[skM.head[0], skM.head[1] - HEAD - (flame > 0.05 ? 120 : 30)]} text="MOTIVATION" color={grey > 0.5 ? "#7d7d7d" : "#ff8a3d"} o={1 - kOut * 1.6} />
      <Label at={[skD.head[0], skD.head[1] - HEAD - 30]} text="DISCIPLINE" color={atTop > 0.5 ? COL.ghost : "#f1f1ee"} o={1 - kOut * 1.6} />
    </>) : null}
  </g>);

  // заголовок и финал
  const sp = (t0: number) => spring({ frame: f - t0 * fps, fps, config: { damping: 14, stiffness: 180 } });
  const titleO = 1 - clamp01((t - 2.2) / 0.4);
  const fin1 = t > 16.2 ? sp(16.2) : 0, fin2 = t > 17.1 ? sp(17.1) : 0;

  return (
    <AbsoluteFill style={{ background: "#08090c", overflow: "hidden" }}>
      <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`}>
        <defs>
          <radialGradient id="bg" cx="0.7" cy="0.15" r="0.9"><stop offset="0" stopColor="#2a2d36" /><stop offset="0.55" stopColor="#101116" /><stop offset="1" stopColor="#060608" /></radialGradient>
          <linearGradient id="stairBody" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#2b2d34" /><stop offset="1" stopColor="#111216" /></linearGradient>
          <radialGradient id="summit"><stop offset="0" stopColor="#dff8ff" stopOpacity="0.9" /><stop offset="0.25" stopColor={COL.ghost} stopOpacity="0.25" /><stop offset="1" stopColor="#000" stopOpacity="0" /></radialGradient>
          <radialGradient id="fireGlow"><stop offset="0" stopColor="#ff9a3d" stopOpacity="0.55" /><stop offset="1" stopColor="#ff6a1f" stopOpacity="0" /></radialGradient>
          <radialGradient id="spot" cx="0.5" cy="0.45" r="0.55"><stop offset="0" stopColor="#ffffff" stopOpacity="0.10" /><stop offset="1" stopColor="#000" stopOpacity="0" /></radialGradient>
          <linearGradient id="fog" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#08090c" stopOpacity="0" /><stop offset="1" stopColor="#08090c" stopOpacity="0.95" /></linearGradient>
          <linearGradient id="reflFade" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#fff" stopOpacity="0.28" /><stop offset="0.5" stopColor="#fff" stopOpacity="0" /></linearGradient>
          <mask id="reflMask" maskUnits="userSpaceOnUse" x="0" y="0" width={width} height={height}><rect x="0" y={ty} width={width} height={height} fill="url(#reflFade)" /></mask>
          <filter id="glow" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="14" /></filter>
        </defs>
        <rect width={width} height={height} fill="url(#bg)" />
        {/* отражение на полу (глянец): зеркальная копия мира под линией пола */}
        <g mask="url(#reflMask)"><g transform={`translate(0,${2 * ty}) scale(1,-1)`}>{W}</g></g>
        {W}
        <rect width={width} height={height} fill="url(#spot)" />
        <rect y={height * 0.72} width={width} height={height * 0.28} fill="url(#fog)" />
        {/* дождь */}
        {rain > 0 ? <g opacity={0.35 * rain}>{Array.from({ length: 90 }, (_, i) => {
          const x = ((i * 137.5) % width) + ((f * 3) % 40);
          const y = ((i * 263 + f * 58) % (height + 200)) - 100;
          return <line key={i} x1={x} y1={y} x2={x - 10} y2={y + 46} stroke="#b8c4d6" strokeWidth={2} />;
        })}</g> : null}
      </svg>

      {/* счётчик дней */}
      {t > 1.6 && kOut < 0.5 ? <AbsoluteFill style={{ alignItems: "center", paddingTop: 200 }}>
        <div style={{ fontFamily: MONO, fontWeight: 800, fontSize: 40, letterSpacing: 10, color: day >= 30 ? COL.ghost : "#ffffffb0", opacity: 1 - kOut * 2 }}>DAY {day}</div>
      </AbsoluteFill> : null}

      {/* заголовок */}
      {titleO > 0 ? <AbsoluteFill style={{ alignItems: "center", paddingTop: 170, opacity: titleO }}>
        <div style={{ fontFamily: PUNCH, fontSize: 104, color: "#ff8a3d", transform: `translateY(${(1 - sp(0.1)) * 40}px)` }}>MOTIVATION</div>
        <div style={{ fontFamily: SERIF, fontSize: 56, color: "#ffffff90", margin: "-6px 0" }}>vs</div>
        <div style={{ fontFamily: PUNCH, fontSize: 104, color: "#f1f1ee", transform: `translateY(${(1 - sp(0.45)) * 40}px)`, opacity: sp(0.45) }}>DISCIPLINE</div>
      </AbsoluteFill> : null}

      {/* финальные фразы */}
      {t > 16.2 ? <AbsoluteFill style={{ alignItems: "center", paddingTop: 250 }}>
        <div style={{ fontFamily: SERIF, fontSize: 78, color: "#d9d9d6", opacity: fin1, transform: `translateY(${(1 - fin1) * 30}px)` }}>Motivation starts it.</div>
        <div style={{ fontFamily: SERIF, fontSize: 78, color: COL.ghost, opacity: fin2, transform: `translateY(${(1 - fin2) * 30}px)`, textShadow: `0 0 30px ${COL.ghost}88`, marginTop: 10 }}>Discipline finishes it.</div>
      </AbsoluteFill> : null}

      <Grain amount={0.1} />
      <Audio src={staticFile("music.wav")} volume={(fr) => interpolate(fr, [0, 10, durationInFrames - 20, durationInFrames], [0, 0.8, 0.8, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" })} />
    </AbsoluteFill>
  );
};
