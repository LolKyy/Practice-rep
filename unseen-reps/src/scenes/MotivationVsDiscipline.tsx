// «Motivation vs Discipline» v2 (~19.5 с, 60 fps) — по рецепту STYLE_RECIPE.md: тёмный мир, светящиеся герои,
// конусы света в дымке, отражения, 7 шотов (общий → средний → крупный → обгон → проводка → вершина → отъезд).
import React from "react";
import { AbsoluteFill, Audio, interpolate, spring, staticFile, useCurrentFrame, useVideoConfig } from "remotion";
import { COL } from "../kit3d";
import { Grain, MONO } from "../overlay";

export const MVD_FPS = 60;
export const MVD_TOTAL = Math.round(19.5 * MVD_FPS);

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


// ------------------------------------------------------------------ фигура: тонкий тёмный контур + белое тело + ореол
const OUT = "#14151a";
const Body: React.FC<{ s: Skel; color: string; back: string; outline?: boolean }> = ({ s, color, back, outline = true }) => {
  const seg = (a: P, b: P, c: string, w: number, k: string) => (
    <g key={k}>
      {outline ? <line x1={a[0]} y1={a[1]} x2={b[0]} y2={b[1]} stroke={OUT} strokeWidth={w + 7} strokeLinecap="round" /> : null}
      <line x1={a[0]} y1={a[1]} x2={b[0]} y2={b[1]} stroke={c} strokeWidth={w} strokeLinecap="round" />
    </g>
  );
  const foot = (f: P, c: string, k: string) => seg([f[0] - 4 * s.face, f[1] - 5], [f[0] + 16 * s.face, f[1] - 5], c, 14, k);
  return (<g>
    {seg(s.hip, s.kB, back, 20, "1")}{seg(s.kB, s.fB, back, 18, "2")}{foot(s.fB, back, "3")}
    {seg(s.neck, s.eB, back, 17, "4")}{seg(s.eB, s.hB, back, 16, "5")}
    {seg(s.hip, s.neck, color, 30, "6")}
    {seg(s.hip, s.kA, color, 20, "7")}{seg(s.kA, s.fA, color, 18, "8")}{foot(s.fA, color, "9")}
    {seg(s.neck, s.eA, color, 17, "10")}{seg(s.eA, s.hA, color, 16, "11")}
    {outline ? <circle cx={s.head[0]} cy={s.head[1]} r={HEAD + 3.5} fill={OUT} /> : null}
    <circle cx={s.head[0]} cy={s.head[1]} r={HEAD} fill={color} />
  </g>);
};
const Figure: React.FC<{ s: Skel; color?: string; back?: string; glow?: number; glowColor?: string; refl?: number }> =
  ({ s, color = "#f4f4f1", back = "#a9a9a6", glow = 0.55, glowColor = "#ffffff", refl = 0 }) => {
    const floorY = Math.max(s.fA[1], s.fB[1]);
    return (<g>
      {/* отражение в глянцевой ступени: зеркально вниз, размыто, гаснет */}
      {refl > 0 ? <g opacity={refl} filter="url(#reflBlur)" transform={`translate(0,${2 * floorY}) scale(1,-1)`} mask="url(#reflFadeFig)">
        <Body s={s} color={color} back={back} outline={false} />
      </g> : null}
      {/* ореол */}
      {glow > 0 ? <g opacity={glow} filter="url(#heroGlow)"><Body s={s} color={glowColor} back={glowColor} outline={false} /></g> : null}
      <Body s={s} color={color} back={back} />
    </g>);
  };

/** Огонь мотивации над головой. size 0..1. */
const Flame: React.FC<{ at: P; size: number; t: number }> = ({ at, size, t }) => {
  if (size <= 0.01) return null;
  const w = Math.sin(t * 23) * 4 + Math.sin(t * 37) * 3;
  const h = (70 + Math.sin(t * 17) * 8) * size, r = 26 * size;
  const d = `M ${at[0] - r} ${at[1]} Q ${at[0] - r * 1.1} ${at[1] - h * 0.55} ${at[0] + w} ${at[1] - h} Q ${at[0] + r * 1.1} ${at[1] - h * 0.5} ${at[0] + r} ${at[1]} Q ${at[0]} ${at[1] + r * 0.7} ${at[0] - r} ${at[1]} Z`;
  const d2 = `M ${at[0] - r * 0.5} ${at[1]} Q ${at[0] - r * 0.6} ${at[1] - h * 0.4} ${at[0] + w * 0.6} ${at[1] - h * 0.65} Q ${at[0] + r * 0.6} ${at[1] - h * 0.35} ${at[0] + r * 0.5} ${at[1]} Q ${at[0]} ${at[1] + r * 0.4} ${at[0] - r * 0.5} ${at[1]} Z`;
  return (<g>
    <circle cx={at[0]} cy={at[1] - h * 0.4} r={h * 2.2} fill="url(#fireGlow)" opacity={0.9 * size} />
    <g filter="url(#softGlow)" opacity={0.8}><path d={d} fill="#ff7a2a" /></g>
    <path d={d} fill="#ff6a1f" />
    <path d={d2} fill="#ffd36a" />
  </g>);
};
const Smoke: React.FC<{ at: P; t: number }> = ({ at, t }) => {
  if (t < 0 || t > 2.4) return null;
  return (<g filter="url(#reflBlur)">{[0, 1, 2, 3, 4, 5].map((i) => {
    const k = clamp01((t - i * 0.1) / 2);
    if (k <= 0) return null;
    return <circle key={i} cx={at[0] + Math.sin(i * 2.1 + t * 2) * 20 * k} cy={at[1] - 20 - k * 190} r={10 + k * 40} fill="#9a9a9a" opacity={0.5 * (1 - k)} />;
  })}</g>);
};

// ------------------------------------------------------------------ лестница (светлые грани ступеней, тёмные подступенки)
const Stairs: React.FC = () => {
  const pts: string[] = ["-3000,0"];
  for (let k = 0; k <= N; k++) pts.push(`${k * SW},${stepTop(k)}`, `${(k + 1) * SW},${stepTop(k)}`);
  pts.push(`${(N + 1) * SW + 2400},${stepTop(N)}`, `${(N + 1) * SW + 2400},1400`, "-3000,1400");
  return (<g>
    <polygon points={pts.join(" ")} fill="url(#stairBody)" />
    {Array.from({ length: N + 1 }, (_, k) => (
      <g key={k}>
        <rect x={k * SW} y={stepTop(k) - 2} width={SW} height={6} fill="#4b4d55" />
        <rect x={k * SW} y={stepTop(k) + 4} width={SW} height={10} fill="#2a2c32" opacity={0.6} />
      </g>
    ))}
    <rect x={-3000} y={-2} width={3000} height={6} fill="#4b4d55" />
    <rect x={(N + 1) * SW} y={stepTop(N) - 2} width={2400} height={6} fill="#5a5c64" />
  </g>);
};

/** Конус света сверху с пятном на ступени (в мировых координатах). */
const Cone: React.FC<{ x: number; floor: number; h?: number; w?: number; o?: number; color?: string }> = ({ x, floor, h = 900, w = 360, o = 1, color = "#ffffff" }) => (
  <g opacity={o}>
    <polygon points={`${x - 22},${floor - h} ${x + 22},${floor - h} ${x + w / 2},${floor} ${x - w / 2},${floor}`} fill="url(#coneGrad)" filter="url(#coneBlur)" style={{ mixBlendMode: "screen" }} />
    <ellipse cx={x} cy={floor + 2} rx={w * 0.55} ry={26} fill={color} opacity={0.16} filter="url(#coneBlur)" />
    <rect x={x - 26} y={floor - h - 10} width={52} height={12} rx={6} fill="#d9d9d4" opacity={0.6} />
  </g>
);

// ------------------------------------------------------------------ шоты
type Shot = { t0: number; t1: number; cam: (t: number, k: number) => { c: P; z: number }; inT?: "cut" | "flash" | "dip" };

export const MotivationVsDiscipline: React.FC = () => {
  const f = useCurrentFrame();
  const { fps, width, height, durationInFrames } = useVideoConfig();
  const t = f / fps;

  // --- дисциплина: 1 ступень / 0.42 с с 1.6 с; на вершине останавливается
  const sD = Math.max(0, Math.min(N, (t - 1.6) / 0.42));
  const tTop = 1.6 + N * 0.42;
  const topX = (N + 1) * SW + 120, topY = stepTop(N);
  const atTop = clamp01((t - tTop) / 0.6);
  const startK = clamp01((t - 1.3) / 0.6);
  const skDclimb = mixSkel(standing(stepX(0) - 150, 0), climb(sD, false), ease(startK));
  const skD = atTop > 0 ? mixSkel(climb(N, false), standing(topX - 60 + atTop * 60, topY, 0.15 * atTop), atTop) : skDclimb;

  // --- мотивация: рывок, выдох, садится на 15-й ступени
  const sM = keys(t, [[1.2, 0], [5.4, 13.4], [6.9, 15]]);
  const tiredK = clamp01((t - 5.2) / 1.6);
  const sitK = clamp01((t - 7.0) / 0.55);
  const skMrun = mixSkel(standing(stepX(0) - 40, 0), climb(sM, t < 5.6, tiredK), ease(clamp01((t - 1.0) / 0.35)));
  const skM = sitK > 0 ? mixSkel(skMrun, sitting(15), ease(sitK)) : skMrun;
  const flame = t < 4.6 ? 1 : t < 6.3 ? (0.55 + 0.45 * Math.abs(Math.sin(t * 19))) * (1 - (t - 4.6) / 1.9) : 0;
  const grey = clamp01((t - 6.3) / 2);

  // --- 7 шотов (крупность героя: общий ~15 %, средний ~25 %, крупный ~45 %, финал ~3 %)
  const headOf = (s: Skel): P => s.head;
  const SHOTS: Shot[] = [
    { t0: 0, t1: 2.4, cam: (_, k) => ({ c: [stepX(0) - 60, -260], z: lerp(0.95, 1.08, k) }) },
    { t0: 2.4, t1: 4.8, inT: "cut", cam: (_, k) => ({ c: [skM.hip[0] + 60, skM.hip[1] - 120], z: lerp(1.5, 1.6, k) }) },
    { t0: 4.8, t1: 6.9, inT: "flash", cam: (_, k) => ({ c: [headOf(skM)[0] + 10, headOf(skM)[1] - 30], z: lerp(2.6, 2.9, k) }) },
    { t0: 6.9, t1: 9.2, inT: "dip", cam: (_, k) => ({ c: [stepX(15) + 40 + 30 * k, stepTop(15) - 190], z: lerp(1.45, 1.55, k) }) },
    { t0: 9.2, t1: 12.4, inT: "cut", cam: (_, k) => ({ c: [skD.hip[0] + 50, skD.hip[1] - 120], z: lerp(1.35, 1.25, k) }) },
    { t0: 12.4, t1: 15.4, inT: "dip", cam: (_, k) => ({ c: lerpP([skD.hip[0] + 140, skD.hip[1] - 170], [topX - 140, topY - 280], ease(clamp01((k - 0.55) / 0.45))), z: lerp(1.6, 1.5, k) }) },
    { t0: 15.4, t1: 19.5, cam: (_, k) => {
      const kk = ease(clamp01(k / 0.85));
      return { c: lerpP([topX - 120, topY - 280], [(N * SW) / 2 + 260, stepTop(N / 2) - 120], kk), z: Math.exp(lerp(Math.log(1.55), Math.log(0.36), kk)) };
    } },
  ];
  const si = Math.max(0, SHOTS.findIndex((s) => t >= s.t0 && t < s.t1));
  const shot = SHOTS[si === -1 ? SHOTS.length - 1 : si];
  const { c: cam, z: zoom } = shot.cam(t, clamp01((t - shot.t0) / (shot.t1 - shot.t0)));
  const tx = width / 2 - cam[0] * zoom, ty = height * 0.5 - cam[1] * zoom;
  const toScreen = (p: P): P => [tx + p[0] * zoom, ty + p[1] * zoom];
  const sinceCut = t - shot.t0;

  // --- атмосфера
  const rain = clamp01((t - 6.9) / 0.6) * (1 - clamp01((t - 13.8) / 1.2));
  const day = Math.round(keys(t, [[1.6, 1], [5.5, 3], [6.9, 4], [9.2, 7], [10.8, 14], [12.4, 21], [14.9, 30]]));
  const beam = keys(t, [[0, 0.15], [13.9, 0.2], [15.0, 1], [19.5, 0.85]]);     // кульминация: луч на вершине
  const lamps = [5, 13, 21, 28];

  const W = (<g transform={`translate(${tx},${ty}) scale(${zoom})`}>
    {/* дальний туман/дымка слоями */}
    <ellipse cx={600} cy={-500} rx={1600} ry={260} fill="#2a2d35" opacity={0.35} filter="url(#hazeBlur)" />
    <ellipse cx={1500} cy={-1050} rx={1500} ry={220} fill="#2a2d35" opacity={0.3} filter="url(#hazeBlur)" />
    <Stairs />
    {lamps.map((k) => <Cone key={k} x={stepX(k)} floor={stepTop(k)} o={0.85} />)}
    {/* вершина: луч сверху (кульминация) */}
    <g opacity={beam}>
      <polygon points={`${topX - 60},${topY - 2200} ${topX + 60},${topY - 2200} ${topX + 260},${topY} ${topX - 260},${topY}`} fill="url(#beamGrad)" filter="url(#coneBlur)" style={{ mixBlendMode: "screen" }} />
      <ellipse cx={topX} cy={topY} rx={380} ry={40} fill={COL.ghost} opacity={0.35} filter="url(#coneBlur)" />
    </g>
    <Figure s={skM} refl={0.22} glow={0.55 * (1 - grey)}
      color={`rgb(${244 - 120 * grey},${244 - 120 * grey},${241 - 118 * grey})`} back={`rgb(${169 - 70 * grey},${169 - 70 * grey},${166 - 70 * grey})`} />
    <Flame at={[skM.head[0], skM.head[1] - HEAD - 12]} size={flame} t={t} />
    <Smoke at={[skM.head[0], skM.head[1] - HEAD]} t={t - 6.2} />
    <Figure s={skD} refl={0.22} glow={0.55 + 0.45 * clamp01((t - 14.6) / 0.8)} glowColor={t > 14.6 ? COL.ghost : "#ffffff"} />
  </g>);

  // --- переходы между шотами
  const flashO = shot.inT === "flash" ? Math.max(0, 1 - sinceCut / 0.12) : 0;
  const dipO = shot.inT === "dip" ? Math.max(0, 1 - sinceCut / 0.3) : 0;
  const fadeIn = Math.max(0, 1 - t / 0.25), fadeOut = clamp01((t - 18.6) / 0.9);

  // --- подписи (в экранных координатах, постоянный мелкий кегль)
  const labelAt = (s: Skel, extra: number) => toScreen([s.head[0], s.head[1] - HEAD - extra]);
  const showLabels = t > 0.4 && si !== 2 && si < 6;
  const lM = labelAt(skM, flame > 0.05 ? 125 : 30), lD = labelAt(skD, 30);

  // --- мораль: печатная машинка в последних ~25 %
  const typed = (txt: string, t0: number) => txt.slice(0, Math.max(0, Math.floor((t - t0) * 16)));
  const m1 = typed("MOTIVATION STARTS IT.", 16.1), m2 = typed("DISCIPLINE FINISHES IT.", 17.4);

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
        {rain > 0 ? <g opacity={0.3 * rain}>{Array.from({ length: 110 }, (_, i) => {
          const x = ((i * 137.5) % width) + ((f * 1.5) % 40);
          const y = ((i * 263 + f * 32) % (height + 200)) - 100;
          return <line key={i} x1={x} y1={y} x2={x - 8} y2={y + 42} stroke="#c3cddb" strokeWidth={2} />;
        })}</g> : null}
        <rect width={width} height={height} fill="url(#vig)" />
      </svg>

      {/* подписи над героями */}
      {showLabels ? <>
        <div style={{ position: "absolute", left: lM[0], top: lM[1], transform: "translate(-50%,-100%)", fontFamily: MONO, fontWeight: 800, fontSize: 24, letterSpacing: 7,
          color: grey > 0.5 ? "#7b7b7b" : "#ff8a3d", whiteSpace: "nowrap" }}>MOTIVATION</div>
        <div style={{ position: "absolute", left: lD[0], top: lD[1], transform: "translate(-50%,-100%)", fontFamily: MONO, fontWeight: 800, fontSize: 24, letterSpacing: 7,
          color: t > 14.6 ? COL.ghost : "#efefec", whiteSpace: "nowrap" }}>DISCIPLINE</div>
      </> : null}

      {/* тема сверху (~16 %) + счётчик дней */}
      {t < 15.6 ? <AbsoluteFill style={{ alignItems: "center", paddingTop: 290, opacity: 1 - clamp01((t - 15.2) / 0.4) }}>
        <div style={{ fontFamily: MONO, fontWeight: 500, fontSize: 30, letterSpacing: 9, color: "#ffffffd8" }}>MOTIVATION VS DISCIPLINE</div>
        {t > 1.6 ? <div style={{ fontFamily: MONO, fontWeight: 500, fontSize: 24, letterSpacing: 8, color: day >= 30 ? COL.ghost : "#ffffff80", marginTop: 14 }}>DAY {day}</div> : null}
      </AbsoluteFill> : null}

      {/* мораль */}
      {t > 16.1 ? <AbsoluteFill style={{ alignItems: "center", paddingTop: 290 }}>
        <div style={{ fontFamily: MONO, fontWeight: 800, fontSize: 40, letterSpacing: 6, color: "#e6e6e3", minHeight: 52 }}>{m1}</div>
        <div style={{ fontFamily: MONO, fontWeight: 800, fontSize: 40, letterSpacing: 6, color: COL.ghost, marginTop: 14, textShadow: `0 0 24px ${COL.ghost}99` }}>{m2}</div>
      </AbsoluteFill> : null}

      <Grain amount={0.06} />
      <AbsoluteFill style={{ background: "#fff", opacity: flashO }} />
      <AbsoluteFill style={{ background: "#000", opacity: Math.max(dipO, fadeIn, fadeOut) }} />
      <Audio src={staticFile("music.wav")} volume={(fr) => interpolate(fr, [0, 10, durationInFrames - 40, durationInFrames], [0, 0.8, 0.8, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" })} />
    </AbsoluteFill>
  );
};
