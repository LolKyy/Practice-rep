import React from "react";
import { AbsoluteFill, Easing, interpolate, Sequence, useCurrentFrame, useVideoConfig } from "remotion";
import { Person, LOOKS } from "../../rig/Person";
import { HaronHUD, HARON, ScanDot } from "../../components/HaronHUD";
import { Callout } from "../../components/Callout";
import { RuleCard } from "../../components/RuleCard";
import { FONTS } from "../../lib/theme";
import { ZONES } from "../../haron/layout";
import { Breath, CommLink, Defs, Pod, Vignette } from "../ep01/common";
import { Cam, SEmpty, SFall, SHaron, SHook, SNeograd } from "../ep01/scenes";

// «ХАРОН», серия 2 «НЕ ОТКРЫВАЙ ЗАМЁРЗШУЮ». Палуба 2 — блоки капсул. Таймер 11:05 → 10:12.

export type SceneLine = { id: string; role: string; start: number; end: number };
export type SceneProps = { dur: number; lines: SceneLine[] };

const C = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;
const useT = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  return frame / fps;
};
const L = (lines: SceneLine[], id: string) => lines.find((l) => l.id === id) ?? { id, role: "", start: 0, end: 0 };
const speaking = (lines: SceneLine[], t: number, role = "khor") => lines.some((l) => l.role === role && t >= l.start && t <= l.end);
const fadeIn = (t: number, d = 0.2) => interpolate(t, [0, d], [0, 1], C);

// россыпь холодных точек = замёрзшие капсулы вокруг
const COLD_PODS: ScanDot[] = [
  { angle: 40, dist: 0.7, kind: "cold" },
  { angle: 75, dist: 0.45, kind: "cold" },
  { angle: 130, dist: 0.8, kind: "cold" },
  { angle: 200, dist: 0.6, kind: "cold" },
  { angle: 260, dist: 0.35, kind: "cold" },
  { angle: 300, dist: 0.75, kind: "cold" },
  { angle: 340, dist: 0.5, kind: "cold" },
];

const HUD2: React.FC<{ fall: number; temp?: number; dots: ScanDot[]; label: string; detectAt?: number; frost?: number; dim?: boolean }> = ({ fall, temp = -12, dots, label, detectAt, frost = 0.35, dim }) => (
  <HaronHUD fallSeconds={fall} oxygen={69} temp={temp} deck={2} dots={dots} scanLabel={label} detectAt={detectAt} frost={frost} dim={dim} />
);

/** Замёрзшая капсула крупно: иней, силуэт внутри, пальцы на стекле изнутри. */
const FrozenGlass: React.FC<{ id: string; reveal: number; sil?: boolean }> = ({ id, reveal, sil = false }) => {
  const t = useT();
  return (
    <g>
      <defs>
        <clipPath id={`fg-${id}`}>
          <rect x={140} y={240} width={800} height={1500} rx={400} />
        </clipPath>
        <filter id={`fn-${id}`}>
          <feTurbulence type="fractalNoise" baseFrequency="0.03" numOctaves={4} seed={9} />
          <feColorMatrix type="matrix" values="0 0 0 0 0.92  0 0 0 0 0.97  0 0 0 0 1  0 0 0 2.2 -1.1" />
        </filter>
        <linearGradient id={`fr-${id}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#E9F8FF" stopOpacity="0.85" />
          <stop offset="0.5" stopColor="#BFE8FA" stopOpacity="0.7" />
          <stop offset="1" stopColor="#E9F8FF" stopOpacity="0.9" />
        </linearGradient>
      </defs>
      <rect x={110} y={210} width={860} height={1560} rx={430} fill="#1E2B3C" stroke="#050608" strokeWidth={16} />
      <g clipPath={`url(#fg-${id})`}>
        <rect x={140} y={240} width={800} height={1500} fill="#123049" />
        {/* силуэт стылого внутри: голова, плечи, кристаллы */}
        <g filter={`url(#b6-${id})`} opacity={0.9}>
          <ellipse cx={540} cy={640} rx={150} ry={200} fill="#05070A" />
          <path d="M 240 1740 L 250 1000 C 300 860 420 820 540 820 C 660 820 780 860 830 1000 L 840 1740 Z" fill="#05070A" />
          <path d="M 300 900 L 230 680 L 360 860 Z M 780 900 L 860 690 L 730 860 Z" fill="#7FD8FF" opacity={0.6} />
          <ellipse cx={490} cy={630} rx={26} ry={16} fill="#F4FBFF" opacity={0.25 + 0.6 * reveal} />
          <ellipse cx={590} cy={630} rx={26} ry={16} fill="#F4FBFF" opacity={0.25 + 0.6 * reveal} />
        </g>
        <rect x={140} y={240} width={800} height={1500} fill={`url(#fr-${id})`} opacity={sil ? 0.45 : 0.62 - reveal * 0.12} />
        <rect x={140} y={240} width={800} height={1500} filter={`url(#fn-${id})`} opacity={0.5} />
        {/* оттаявшее пятно вокруг ладони */}
        <ellipse cx={520} cy={1020} rx={230} ry={260} fill="#123049" opacity={0.5 * reveal} filter={`url(#b24-${id})`} />
        {/* длинные белые пальцы на стекле изнутри */}
        <g opacity={0.15 + 0.85 * reveal} filter={`url(#b3-${id})`}>
          <path d="M 420 1110 C 400 1030 430 980 520 970 C 610 962 640 1020 630 1100 C 610 1170 440 1180 420 1110 Z" fill="#EEF8FF" />
          {[0, 1, 2, 3].map((k) => {
            const bx = 430 + k * 50;
            const len = [300, 360, 340, 270][k] * (0.85 + 0.15 * reveal);
            const lean = [-30, -10, 10, 28][k];
            return <path key={k} d={`M ${bx} 1000 C ${bx + lean * 0.3} ${1000 - len * 0.5}, ${bx + lean} ${1000 - len * 0.85}, ${bx + lean + 3} ${1000 - len}`} stroke="#EEF8FF" strokeWidth={30 - k * 2} strokeLinecap="round" fill="none" />;
          })}
          <path d="M 625 1080 C 680 1050 710 990 726 930" stroke="#EEF8FF" strokeWidth={26} strokeLinecap="round" fill="none" />
        </g>
        {/* трещины */}
        <g stroke="#FFFFFF" strokeWidth={4} fill="none" opacity={0.6 * reveal}>
          <path d="M 640 980 L 760 880 L 820 920 M 700 930 L 740 800" />
          <path d="M 420 1150 L 330 1260 L 300 1380" />
        </g>
      </g>
      <path d="M 220 520 C 240 400 300 330 380 300" stroke="#FFFFFF" strokeWidth={18} fill="none" opacity={0.35} strokeLinecap="round" />
      <rect x={440} y={1770} width={200} height={22} rx={6} fill={HARON.red} opacity={0.5 + 0.5 * Math.sin(t * 6)} />
    </g>
  );
};

/** Зал капсул: ряды уходят вдаль, синий аварийный свет. */
const PodHall: React.FC<{ id: string; t: number }> = ({ id, t }) => {
  const VP = { x: 540, y: 820 };
  return (
    <g>
      <rect width={1080} height={1920} fill="#08111E" />
      <ellipse cx={540} cy={700} rx={700} ry={500} fill="#2E6FA8" opacity={0.18} filter={`url(#b48-${id})`} />
      {/* потолочные рёбра с синими аварийными лампами */}
      {[0.15, 0.35, 0.55, 0.72, 0.86].map((k, i) => {
        const y = 140 + (VP.y - 200 - 140) * k;
        return (
          <g key={i}>
            <rect x={(VP.x - 160) * k} y={y} width={1080 - 2 * (VP.x - 160) * k} height={24 * (1 - k * 0.7)} fill="#0E1A2C" />
            <rect x={VP.x - 60 * (1 - k * 0.7)} y={y + 24 * (1 - k * 0.7)} width={120 * (1 - k * 0.7)} height={10 * (1 - k * 0.7)} fill="#7FB8FF" opacity={0.55 + 0.25 * Math.sin(t * 2 + i)} />
          </g>
        );
      })}
      {/* ряды капсул слева и справа */}
      {[6, 5, 4, 3, 2, 1].map((k) =>
        ([-1, 1] as const).map((side) => {
          const s = 1 / (1 + k * 0.5);
          return <Pod key={`${k}${side}`} x={VP.x + side * 470 * s} y={VP.y - 420 * s} s={s * 0.95} frosted={(k + (side > 0 ? 1 : 0)) % 3 === 0} glow={(k + side) % 4 === 0 ? HARON.red : "#5F9FD8"} />;
        }),
      )}
      <polygon points={`${VP.x - 120},${VP.y + 120} ${VP.x + 120},${VP.y + 120} 1240,1920 -160,1920`} fill="#050A12" opacity={0.85} />
      {[0, 1, 2, 3, 4, 5, 6].map((i) => (
        <line key={i} x1={VP.x - 120 + i * 40} y1={VP.y + 120} x2={-160 + i * 233} y2={1920} stroke="#0E1828" strokeWidth={4} />
      ))}
    </g>
  );
};

/* ============================ 1. ХУК ============================ */
export const SHook2: React.FC<SceneProps> = ({ dur }) => {
  const t = useT();
  const id = "h2";
  const reveal = interpolate(t, [0, dur * 0.85], [0.2, 1], { ...C, easing: Easing.out(Easing.quad) });
  return (
    <AbsoluteFill style={{ background: "#050A12" }}>
      <Cam dur={dur} z0={1.12} z1={1.0} y0={980} y1={960}>
        <svg width={1080} height={1920}>
          <Defs id={id} />
          <FrozenGlass id={id} reveal={reveal} />
          <Vignette id={id} />
        </svg>
      </Cam>
      <HUD2 fall={10 * 3600 + 20 * 60} dots={[{ angle: 0, dist: 0.08, kind: "cold" }]} label="ХОЛОДНАЯ ЦЕЛЬ — 0,5 м" frost={0.6} />
    </AbsoluteFill>
  );
};

/* ============================ 2. «РАНЕЕ» — нарезка серии 1 ============================ */
export const SRecap: React.FC<SceneProps> = ({ dur, lines }) => {
  const t = useT();
  const { fps } = useVideoConfig();
  const l3 = L(lines, "03");
  const l4 = L(lines, "04");
  const cuts = [0, l3.start - 0.15, l3.start + (l3.end - l3.start) * 0.55, l4.start - 0.15, l4.start + (l4.end - l4.start) * 0.5, dur];
  const comps = [SHook, SHaron, SFall, SNeograd, SEmpty];
  const f = (s: number) => Math.round(s * fps);
  return (
    <AbsoluteFill style={{ background: "#000" }}>
      <AbsoluteFill style={{ filter: "saturate(0.55) contrast(1.08) brightness(0.9)" }}>
        {comps.map((Comp, i) => (
          <Sequence key={i} from={f(cuts[i])} durationInFrames={Math.max(1, f(cuts[i + 1]) - f(cuts[i]))}>
            {/* «фальшивые» реплики, чтобы анимации сцен серии 1 шли по своим местам (без звука — голос свой) */}
            <Comp dur={cuts[i + 1] - cuts[i]} lines={[{ id: ["", "06", "09", "08", ""][i], role: "none", start: 0, end: cuts[i + 1] - cuts[i] }]} />
          </Sequence>
        ))}
      </AbsoluteFill>
      {/* плёночные полосы и метка «РАНЕЕ» */}
      <AbsoluteFill style={{ pointerEvents: "none" }}>
        {Array.from({ length: 48 }, (_, i) => (
          <div key={i} style={{ position: "absolute", left: 0, right: 0, top: i * 40, height: 2, background: "rgba(255,255,255,0.05)" }} />
        ))}
        {cuts.slice(1, -1).map((c, i) => (t > c && t < c + 0.08 ? <AbsoluteFill key={i} style={{ background: "#FFFFFF", opacity: 0.35 }} /> : null))}
      </AbsoluteFill>
      <div style={{ position: "absolute", right: 60, top: ZONES.content.top, fontFamily: FONTS.mono, fontWeight: 700, fontSize: 34, color: "#05070A", background: HARON.white, padding: "6px 18px", borderRadius: 8, letterSpacing: 4 }}>
        ◀◀ РАНЕЕ
      </div>
    </AbsoluteFill>
  );
};

/* ============================ 3. ЗАЛ КАПСУЛ + ПРАВИЛО 1 ============================ */
export const SHall: React.FC<SceneProps> = ({ dur, lines }) => {
  const t = useT();
  const id = "hall";
  const l7 = L(lines, "07");
  const walk = interpolate(t, [0, dur], [0, 1], C);
  const step = Math.sin(t * 5);
  return (
    <AbsoluteFill style={{ background: "#000", opacity: fadeIn(t) }}>
      <Cam dur={dur} z0={1.0} z1={1.1} y0={960} y1={900}>
        <svg width={1080} height={1920}>
          <Defs id={id} />
          <PodHall id={id} t={t} />
          {/* выцарапанное правило на опоре слева */}
          <g transform="translate(60 640) rotate(-2)">
            <rect x={0} y={0} width={300} height={200} fill="#101C2C" stroke="#050608" strokeWidth={6} />
            <text x={14} y={44} fontFamily="Oswald" fontWeight={700} fontSize={30} fill="#E8EEF2" opacity={0.9}>
              1. ЕСЛИ СТЕКЛО
            </text>
            <text x={14} y={84} fontFamily="Oswald" fontWeight={700} fontSize={30} fill="#E8EEF2" opacity={0.9}>
              ЗАМЁРЗЛО ИЗНУТРИ —
            </text>
            <text x={14} y={136} fontFamily="Oswald" fontWeight={700} fontSize={44} fill={HARON.red}>
              НЕ ОТКРЫВАЙ
            </text>
          </g>
          <Person
            uid="hg"
            x={600}
            ground={1560 + walk * 60}
            scale={0.78 + walk * 0.12}
            look={LOOKS.gleb}
            emotion="tense"
            facing={-1}
            light={{ x: -0.4, y: -1 }}
            rim="#7FB8FF"
            pose={{ armL: [8 + step * 6, 4], armR: [-8 - step * 6, -4], legL: [-6 + step * 10, 0], legR: [6 - step * 10, 2], head: t > l7.start - 0.8 ? -14 : 0 }}
            item="crowbar"
            itemAngle={10}
            t={t}
          />
          <Breath x={610} y={700} id={id} />
          <Vignette id={id} />
        </svg>
      </Cam>
      <HUD2 fall={10 * 3600 + 50 * 60} dots={COLD_PODS} label="ХОЛОДНЫХ: 7 • БЛИЖ. 2 м" frost={0.3} />
      {t > l7.start - 0.9 ? <RuleCard number={1} text="Если стекло капсулы замёрзло изнутри — не открывай" top={ZONES.content.top + 20} delay={l7.start - 0.9} accent={HARON.red} /> : null}
      <CommLink speaking={speaking(lines, t)} />
    </AbsoluteFill>
  );
};

/* ============================ 4. РЫЖИЙ ============================ */
export const SRyzhy: React.FC<SceneProps> = ({ dur, lines }) => {
  const t = useT();
  const id = "rz";
  const l10 = L(lines, "10");
  const l12 = L(lines, "12");
  const rise = interpolate(t, [0, 1.6], [0, 1], { ...C, easing: Easing.out(Easing.cubic) });
  const named = t > l12.end - 0.9; // «…стылые»
  const flash = named && t < l12.end - 0.5;
  return (
    <AbsoluteFill style={{ background: "#000", opacity: fadeIn(t) }}>
      <Cam dur={dur} z0={1.02} z1={1.1} x0={540} x1={560}>
        <svg width={1080} height={1920}>
          <Defs id={id} />
          <PodHall id={id} t={t} />
          <Person uid="rg" x={270} ground={1640} scale={0.92} look={LOOKS.gleb} emotion="tense" facing={1} light={{ x: 1, y: -0.6 }} rim="#7FB8FF" pose={{ armL: [10, 4], armR: [40, 100], legL: [-6, -2], legR: [10, 4], head: 6 }} item="crowbar" itemAngle={-20} t={t} />
          {/* Рыжий выползает из-под капсулы и поднимается на корточки */}
          <Person
            uid="ry"
            x={800}
            ground={1660}
            scale={0.86}
            look={LOOKS.ryzhy}
            emotion="fear"
            facing={-1}
            light={{ x: -1, y: -0.5 }}
            rim="#FFB07A"
            pose={{
              armL: [-30 - 50 * (1 - rise), -40 - 50 * (1 - rise)],
              armR: [10 - 40 * (1 - rise), 20],
              legL: [-12 - 70 * (1 - rise), 4 - 4 * (1 - rise)],
              legR: [10 - 72 * (1 - rise), 2],
              lean: -22 * (1 - rise) - 6,
              head: -10,
            }}
            t={t}
          />
          <Breath x={760} y={980} id={id} period={1.6} />
          <Vignette id={id} />
        </svg>
      </Cam>
      <HUD2 fall={10 * 3600 + 41 * 60} dots={[...COLD_PODS, { angle: 95, dist: 0.25, kind: "warm" }]} label={named ? "СТЫЛЫЙ — 2 м" : "ХОЛОДНЫХ: 7 • ТЁПЛЫХ: 1"} frost={0.3} />
      {flash ? <AbsoluteFill style={{ boxShadow: "inset 0 0 120px 30px rgba(159,227,255,0.45)" }} /> : null}
      {t > l10.start ? <Callout targetX={790} targetY={1010} title="РЫЖИЙ" subtitle="ЗАКЛЮЧЁННЫЙ, БЛОК 2" side="left" dx={150} dy={-260} delay={l10.start} accent={HARON.warm} /> : null}
    </AbsoluteFill>
  );
};

/* ============================ 5. ПОДСКАЗКА: Хорунжий перебивает ============================ */
export const SHint: React.FC<SceneProps> = ({ dur, lines }) => {
  const t = useT();
  const id = "hn";
  const l14 = L(lines, "14");
  const cut = t > l14.start;
  return (
    <AbsoluteFill style={{ background: "#000", opacity: fadeIn(t) }}>
      <Cam dur={dur} z0={1.0} z1={1.12} y0={760} y1={700}>
        <svg width={1080} height={1920}>
          <Defs id={id} />
          <rect width={1080} height={1920} fill="#08111E" />
          <ellipse cx={540} cy={600} rx={600} ry={500} fill="#2E6FA8" opacity={0.2} filter={`url(#b48-${id})`} />
          <Person uid="hn" x={540} ground={2700} scale={2.3} look={LOOKS.gleb} emotion={cut ? "tense" : "neutral"} facing={-1} light={{ x: -0.6, y: -1 }} rim="#7FB8FF" pose={{ armL: [-168, 125], armR: [-10, -30], legL: [0, 0], legR: [0, 0], head: -6 }} t={t} />
          <rect x={0} y={0} width={1080} height={380} fill="#000" opacity={0.5} />
          <Vignette id={id} />
        </svg>
      </Cam>
      {cut && t < l14.start + 0.12 ? <AbsoluteFill style={{ background: "rgba(255,138,61,0.18)" }} /> : null}
      <CommLink speaking={speaking(lines, t)} />
      <HUD2 fall={10 * 3600 + 33 * 60} dots={COLD_PODS} label="СТЫЛЫЙ — 2 м" frost={0.3} dim />
    </AbsoluteFill>
  );
};

/* ============================ 6. БРАТ: стук из замёрзшей капсулы ============================ */
export const SBrother: React.FC<SceneProps> = ({ dur, lines }) => {
  const t = useT();
  const id = "br";
  const l16 = L(lines, "16");
  const l18 = L(lines, "18");
  const knock = (t % 1.8) < 0.12;
  const press = t > l18.end - 0.1; // Рыжий бьёт по кнопке
  const grab = t > l16.start && !press;
  return (
    <AbsoluteFill style={{ background: "#000", opacity: fadeIn(t) }}>
      <Cam dur={dur} z0={1.0} z1={1.1} x0={540} x1={600} shake={knock ? 3 : press && t < l18.end + 0.3 ? 8 : 0}>
        <svg width={1080} height={1920}>
          <Defs id={id} />
          <rect width={1080} height={1920} fill="#08111E" />
          <ellipse cx={700} cy={900} rx={500} ry={700} fill="#2E6FA8" opacity={0.22} filter={`url(#b48-${id})`} />
          <g transform="translate(330 120) scale(0.72)">
            <FrozenGlass id={id} reveal={0.35} />
          </g>
          {/* кнопка открытия */}
          <g transform="translate(980 980)">
            <rect x={-46} y={-60} width={92} height={120} rx={10} fill="#1A2638" stroke="#050608" strokeWidth={6} />
            <circle r={30} fill={press ? "#FFE3A0" : HARON.red} />
            {press ? <circle r={70} fill={HARON.red} opacity={0.5} filter={`url(#b12-${id})`} /> : null}
          </g>
          {/* Рыжий у стекла, Глеб хватает за руку */}
          <Person
            uid="br-r"
            x={560}
            ground={1660}
            scale={0.9}
            look={LOOKS.ryzhy}
            emotion="fear"
            facing={1}
            light={{ x: 1, y: -0.3 }}
            rim="#9FE3FF"
            pose={{ armL: [-20, -40], armR: press ? [80, 70] : [110, 150], legL: [-10, 0], legR: [14, 2], lean: 8, head: 8 }}
            t={t}
          />
          <Person
            uid="br-g"
            x={230}
            ground={1690}
            scale={0.95}
            look={LOOKS.gleb}
            emotion={press ? "fear" : "determined"}
            facing={1}
            light={{ x: 1, y: -0.5 }}
            rim="#7FB8FF"
            pose={{ armL: [10, 4], armR: grab ? [70, 80] : [30, 60], legL: [-8, -2], legR: [12, 4], lean: grab ? 6 : 0, head: 6 }}
            t={t}
          />
          {press ? <rect width={1080} height={1920} fill={HARON.red} opacity={0.12 + 0.1 * Math.sin(t * 20)} /> : null}
          <Vignette id={id} />
        </svg>
      </Cam>
      <HUD2 fall={10 * 3600 + 22 * 60} dots={[{ angle: 60, dist: 0.12, kind: "cold" }, { angle: 80, dist: 0.18, kind: "warm" }]} label="СТЫЛЫЙ — 1 м" frost={0.45} />
    </AbsoluteFill>
  );
};

/* ============================ 7. КЛИФФХЭНГЕР: стекло лопается наружу ============================ */
export const SCliff2: React.FC<SceneProps> = ({ dur }) => {
  const t = useT();
  const id = "c2";
  const burst = interpolate(t, [0, 0.7], [0, 1], { ...C, easing: Easing.out(Easing.cubic) });
  const sit = interpolate(t, [0.6, 1.8], [0, 1], { ...C, easing: Easing.out(Easing.cubic) });
  const turn = interpolate(t, [2.2, 2.7], [0, 1], { ...C, easing: Easing.inOut(Easing.cubic) }); // хруст — поворот головы
  return (
    <AbsoluteFill style={{ background: "#000" }}>
      <Cam dur={dur} z0={1.0} z1={1.16} y0={960} y1={860} shake={t < 0.6 ? 16 : t > 2.2 && t < 2.5 ? 5 : 0}>
        <svg width={1080} height={1920}>
          <Defs id={id} />
          <rect width={1080} height={1920} fill="#060C16" />
          <ellipse cx={600} cy={900} rx={600} ry={800} fill="#9FE3FF" opacity={0.18} filter={`url(#b48-${id})`} />
          {/* открытая капсула */}
          <g transform="translate(330 120) scale(0.72)">
            <rect x={110} y={210} width={860} height={1560} rx={430} fill="#1E2B3C" stroke="#050608" strokeWidth={16} />
            <rect x={140} y={240} width={800} height={1500} rx={400} fill="#0A1A28" />
          </g>
          {/* стылый садится в капсуле, голова поворачивается к Рыжему */}
          <Person
            uid="c2s"
            x={720}
            ground={1720 - sit * 80}
            scale={0.95}
            look={LOOKS.stylyy}
            facing={turn > 0.5 ? -1 : 1}
            light={{ x: -1, y: -0.4 }}
            rim="#FFFFFF"
            pose={{ armL: [-20 - 20 * sit, -10], armR: [30, 40], legL: [-4, 0], legR: [4, 0], lean: 18 * (1 - sit) - 4 * turn, head: 20 * (1 - sit) - 22 * turn }}
            t={t}
          />
          <ellipse cx={700 - turn * 60} cy={560} rx={60} ry={24} fill="#F4FBFF" opacity={0.35 * (0.5 + 0.5 * Math.sin(t * 3))} filter={`url(#b6-${id})`} />
          {/* Рыжий слева, оцепенел */}
          <Person uid="c2r" x={220} ground={1690} scale={0.9} look={LOOKS.ryzhy} emotion="fear" facing={1} light={{ x: 1, y: -0.3 }} rim="#9FE3FF" pose={{ armL: [-30, -60], armR: [30, 70], legL: [-12, 0], legR: [12, 2], lean: -8, head: 4 }} t={t} />
          {/* осколки стекла летят наружу — в камеру */}
          {Array.from({ length: 24 }, (_, i) => {
            const a = i * 2.4;
            const r = burst * (300 + (i % 6) * 120);
            return <path key={i} d="M 0 -30 L 14 0 L 0 26 L -10 2 Z" fill="#EAF8FF" stroke="#3E8FB8" strokeWidth={2} opacity={1 - burst * 0.7} transform={`translate(${700 + Math.cos(a) * r} ${900 + Math.sin(a) * r}) rotate(${i * 40 + burst * 300}) scale(${1 + burst * 2.5})`} />;
          })}
          {/* волна холода */}
          <circle cx={700} cy={900} r={200 + burst * 900} fill="none" stroke="#E6F7FF" strokeWidth={60 * (1 - burst)} opacity={0.6 * (1 - burst)} />
          {t < 0.15 ? <rect width={1080} height={1920} fill="#FFFFFF" opacity={0.7} /> : null}
          <Vignette id={id} />
        </svg>
      </Cam>
      <HUD2 fall={10 * 3600 + 13 * 60} temp={t < 0.4 ? -12 : -30} dots={[{ angle: 70, dist: 0.16, kind: "cold" }, { angle: 290, dist: 0.2, kind: "warm" }]} label="СТЫЛЫЙ — 2 м" detectAt={0.25} frost={0.95} />
    </AbsoluteFill>
  );
};

export const SCENES2: Record<string, React.FC<SceneProps>> = {
  hook: SHook2,
  recap: SRecap,
  hall: SHall,
  ryzhy: SRyzhy,
  hint: SHint,
  brother: SBrother,
  cliff: SCliff2,
};
