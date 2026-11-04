import React from "react";
import { AbsoluteFill, useCurrentFrame, useVideoConfig } from "remotion";
import { HUD } from "../components/HUD";
import { Subtitles, TimedWord } from "../components/Subtitles";
import { Callout } from "../components/Callout";

// «ХАРОН» — три способа рисовки ОДНОЙ сцены (хук серии 2):
// блок капсул, Глеб с термосканером, в замёрзшей капсуле — стылый, белые пальцы на стекле изнутри.
//   ink  — «Графичный нуар»: плоские цвета + чёрные массы теней, толстый контур.
//   cine — «Кино-вектор»: многослойный свет, градиенты, свечение, объёмные лучи, больше деталей.
//   sil  — «Силуэт»: почти всё чёрное, форму рисует только свет (контровой, свечение льда, красная лампа).

type Mode = "ink" | "cine" | "sil";

const RED = "#FF3B2F";
const ICE = "#9FE3FF";
const ICE_DEEP = "#3E8FB8";

const WORDS: TimedWord[] = [
  { word: "Не", start: 1.0, end: 1.15 },
  { word: "открывай", start: 1.15, end: 1.5 },
  { word: "замёрзшую.", start: 1.5, end: 2.1 },
];

/* ------------------------------- ГЛЕБ ------------------------------- */
// Начало координат — между ступнями, рост ~1150 px. Правая рука поднята: термосканер на запястье.
const GLEB: { id: string; d: string; part: "skin" | "suit" | "boots" }[] = [
  { id: "legL", part: "suit", d: "M -104 -520 L -6 -520 L -14 -300 L -24 -60 L -88 -60 L -96 -300 Z" },
  { id: "legR", part: "suit", d: "M 6 -520 L 104 -520 L 96 -300 L 88 -60 L 24 -60 L 14 -300 Z" },
  { id: "bootL", part: "boots", d: "M -94 -78 L -18 -78 L -12 0 L -114 0 C -118 -26 -106 -56 -94 -78 Z" },
  { id: "bootR", part: "boots", d: "M 18 -78 L 94 -78 C 106 -56 118 -26 114 0 L 12 0 Z" },
  { id: "torso", part: "suit", d: "M -132 -910 C -86 -938 86 -938 132 -910 L 138 -800 L 114 -620 L 106 -515 L -106 -515 L -114 -620 L -138 -800 Z" },
  { id: "armL", part: "suit", d: "M -130 -910 C -162 -896 -172 -858 -170 -798 L -160 -640 L -146 -548 L -112 -548 L -118 -650 L -124 -800 Z" },
  { id: "handL", part: "skin", d: "M -158 -552 C -166 -520 -158 -486 -136 -484 C -114 -486 -108 -516 -112 -552 Z" },
  // правая рука согнута, запястье со сканером перед грудью-вправо
  { id: "armR1", part: "suit", d: "M 126 -910 C 160 -900 176 -866 178 -826 L 196 -716 L 162 -704 L 138 -800 Z" },
  { id: "armR2", part: "suit", d: "M 168 -736 L 270 -830 L 296 -806 L 190 -700 Z" },
  { id: "handR", part: "skin", d: "M 268 -846 C 276 -872 300 -878 314 -862 C 324 -846 316 -824 298 -818 Z" },
  { id: "neck", part: "skin", d: "M -26 -992 L 26 -992 L 32 -926 L -32 -926 Z" },
  { id: "head", part: "skin", d: "M -56 -1062 C -60 -1124 -32 -1152 0 -1152 C 36 -1152 62 -1124 58 -1062 C 58 -1020 50 -986 26 -972 C 12 -965 -12 -965 -26 -972 C -50 -986 -58 -1020 -56 -1062 Z" },
  { id: "ear", part: "skin", d: "M -54 -1070 C -70 -1072 -70 -1032 -54 -1032 Z" },
];

const Gleb: React.FC<{ mode: Mode; x: number; y: number }> = ({ mode, x, y }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const t = frame / fps;
  const skin = mode === "sil" ? "#07090C" : "#B9957C";
  const suit = mode === "sil" ? "#07090C" : mode === "ink" ? "#6E747A" : "#767E85";
  const suitDark = mode === "sil" ? "#07090C" : "#3E4449";
  const boots = mode === "sil" ? "#07090C" : "#1C1E21";
  const fill = (p: string) => (p === "skin" ? skin : p === "boots" ? boots : suit);
  const ink = "#050608";
  const scanPulse = 0.6 + 0.4 * Math.max(0, Math.sin(t * 9));
  return (
    <g transform={`translate(${x}, ${y})`}>
      <defs>
        <clipPath id={`gleb-${mode}`}>
          {GLEB.map((b) => (
            <path key={b.id} d={b.d} />
          ))}
        </clipPath>
        <linearGradient id={`gleb-soft-${mode}`} x1="1" y1="0" x2="0" y2="0">
          <stop offset="0" stopColor="#000" stopOpacity="0" />
          <stop offset="0.45" stopColor="#020611" stopOpacity="0.15" />
          <stop offset="0.7" stopColor="#020611" stopOpacity="0.6" />
          <stop offset="1" stopColor="#020611" stopOpacity="0.8" />
        </linearGradient>
        <filter id={`glow-${mode}`} x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation="6" />
        </filter>
      </defs>
      <ellipse cx={0} cy={6} rx={180} ry={20} fill="#000" opacity={0.6} />

      {/* обводка: ink — толстый чёрный контур; cine/sil — ледяной контровой свет справа */}
      {mode === "ink"
        ? GLEB.map((b) => <path key={`o${b.id}`} d={b.d} fill="none" stroke={ink} strokeWidth={12} strokeLinejoin="round" />)
        : GLEB.map((b) => (
            <path
              key={`o${b.id}`}
              d={b.d}
              fill="none"
              stroke={ICE}
              strokeWidth={mode === "sil" ? 7 : 5}
              strokeLinejoin="round"
              filter={mode === "cine" ? `url(#glow-${mode})` : undefined}
              opacity={mode === "sil" ? 1 : 0.9}
            />
          ))}
      {GLEB.map((b) => (
        <path key={b.id} d={b.d} fill={fill(b.part)} />
      ))}

      {mode !== "sil" ? (
        <>
          {/* роба: молния, номер, складки, ремень */}
          <g stroke={suitDark} strokeWidth={4} fill="none" strokeLinecap="round">
            <path d="M 0 -920 L 0 -540" />
            <path d="M -64 -420 q 14 -12 32 -4 M 42 -430 q 16 -8 30 4 M -74 -220 q 16 -8 30 0 M 44 -240 q 14 -10 30 0" />
            <path d="M -124 -740 q 30 10 60 4 M 60 -736 q 30 6 64 -6 M -156 -700 q 14 6 30 0" />
          </g>
          <rect x={-110} y={-548} width={220} height={26} fill={suitDark} />
          <rect x={-116} y={-872} width={92} height={40} fill="#D8D6CF" />
          <text x={-70} y={-842} textAnchor="middle" fontFamily="JetBrains Mono" fontWeight={700} fontSize={28} fill="#111">
            0731
          </text>
          <rect x={-96} y={-330} width={70} height={56} rx={8} fill={suitDark} />
          <rect x={26} y={-330} width={70} height={56} rx={8} fill={suitDark} />
          {/* лицо: щетина, шрам через бровь, усталые глаза */}
          <path d="M -50 -1030 C -46 -990 -20 -968 0 -968 C 20 -968 48 -990 52 -1030 C 30 -1010 -30 -1010 -50 -1030 Z" fill="#2A2420" opacity={0.45} />
          <path d="M -58 -1070 C -64 -1130 -30 -1160 2 -1158 C 40 -1156 64 -1128 60 -1068 C 52 -1100 30 -1116 0 -1114 C -28 -1112 -48 -1096 -58 -1070 Z" fill="#1D1915" />
          <path d="M -40 -1060 Q -26 -1070 -10 -1060 Q -26 -1054 -40 -1060 Z" fill="#E6E0D6" />
          <path d="M 10 -1060 Q 26 -1070 40 -1060 Q 26 -1054 10 -1060 Z" fill="#E6E0D6" />
          <circle cx={-23} cy={-1061} r={5.5} fill="#22262A" />
          <circle cx={27} cy={-1061} r={5.5} fill="#22262A" />
          <path d="M -44 -1076 L -10 -1078 M 10 -1078 L 44 -1074" stroke="#1D1915" strokeWidth={8} strokeLinecap="round" />
          <path d="M -40 -1050 q 14 6 28 0 M 12 -1050 q 14 6 28 0" stroke="#3A2E28" strokeWidth={2.5} fill="none" opacity={0.6} />
          <path d="M 0 -1058 L 9 -1022 L -4 -1018" stroke="#3A2E28" strokeWidth={3} fill="none" opacity={0.7} />
          <path d="M -16 -996 L 14 -998" stroke="#3E2622" strokeWidth={4} strokeLinecap="round" />
          <path d="M -30 -1100 L -18 -1032" stroke="#E7C6B6" strokeWidth={4} />
          <path d="M -30 -1100 L -18 -1032" stroke="#7E4C42" strokeWidth={1.5} />
        </>
      ) : (
        // силуэт: читаются только «огоньки» — глаза в отсвете и номер
        <path d="M -40 -1060 L -12 -1060 M 12 -1060 L 40 -1060" stroke={ICE} strokeWidth={3} opacity={0.35} />
      )}

      {/* тени внутри силуэта */}
      {mode === "ink" ? (
        <g clipPath={`url(#gleb-${mode})`}>
          {/* жёсткие чёрные массы, свет справа-сверху */}
          <path d="M -180 -1200 L -6 -1200 C -22 -1120 -30 -1030 -8 -968 L 20 -930 L -20 -760 L 10 -560 L -40 -300 L -10 60 L -300 60 Z" fill={ink} />
          <path d="M 40 -560 L 140 -560 L 120 60 L 70 60 Z" fill={ink} opacity={0.9} />
          <path d="M -60 -1110 C -20 -1104 20 -1104 64 -1112 L 64 -1096 C 20 -1088 -20 -1088 -60 -1094 Z" fill={ink} />
        </g>
      ) : null}
      {mode === "cine" ? (
        <g clipPath={`url(#gleb-${mode})`}>
          <rect x={-200} y={-1200} width={540} height={1260} fill={`url(#gleb-soft-${mode})`} />
          {/* тёплый красный отсвет сверху-слева от аварийной лампы */}
          <rect x={-200} y={-1200} width={540} height={300} fill={RED} opacity={0.12} />
          <path d="M -40 -990 L 40 -990 L 40 -960 L -40 -960 Z" fill="#020611" opacity={0.5} />
          {[[-80, -700, 18], [60, -640, 12], [-40, -260, 16], [70, -150, 20]].map(([cx, cy, r], i) => (
            <circle key={i} cx={cx} cy={cy} r={r} fill="#000" opacity={0.15} />
          ))}
        </g>
      ) : null}

      {/* имплант-наушник за ухом */}
      <rect x={-66} y={-1060} width={12} height={22} rx={4} fill="#2A2E33" />
      <circle cx={-60} cy={-1046} r={3.5} fill={RED} opacity={0.5 + 0.5 * Math.sin(t * 4)} />

      {/* термосканер на запястье + свечение экрана */}
      <rect x={240} y={-852} width={52} height={34} rx={6} fill="#15181C" stroke={mode === "ink" ? ink : "#30363C"} strokeWidth={4} transform="rotate(-42 266 -835)" />
      <rect x={248} y={-846} width={36} height={22} rx={3} fill="#FF8A3D" opacity={scanPulse} transform="rotate(-42 266 -835)" />
      <circle cx={268} cy={-836} r={60} fill="#FF8A3D" opacity={0.12 * scanPulse} filter={mode === "ink" ? undefined : `url(#glow-${mode})`} />
    </g>
  );
};

/* ------------------------------- СЦЕНА ------------------------------- */
const HaronScene: React.FC<{ mode: Mode }> = ({ mode }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const t = frame / fps;
  const VP = { x: 470, y: 830 };
  const lamp = 0.55 + 0.45 * Math.max(0, Math.sin(t * Math.PI * 2 * 0.8));
  const isSil = mode === "sil";
  const isInk = mode === "ink";
  const ink = "#050608";
  const wall = isSil ? "#030406" : isInk ? "#0E1626" : "#0C1424";
  const wall2 = isSil ? "#020304" : isInk ? "#08101C" : "#091120";
  const floor = isSil ? "#020304" : "#060B14";
  const OL = isInk ? { stroke: ink, strokeWidth: 6 } : {};

  // ряды капсул вдоль левой стены (уходят вглубь)
  const rows = [0, 1, 2, 3, 4, 5, 6];
  const pod = (k: number, side: -1 | 1) => {
    const s = 1 / (1 + k * 0.42);
    const w = 200 * s;
    const h = 560 * s;
    const cx = VP.x + side * (480 * s);
    const top = VP.y - h * 0.62;
    const frozen = (k + (side > 0 ? 1 : 0)) % 3 === 0;
    return { s, w, h, cx, top, frozen, k };
  };

  return (
    <AbsoluteFill style={{ background: wall }}>
      <svg width={1080} height={1920}>
        <defs>
          <radialGradient id={`capglow-${mode}`} cx="0.5" cy="0.45" r="0.6">
            <stop offset="0" stopColor={ICE} stopOpacity={isSil ? 0.9 : 0.55} />
            <stop offset="1" stopColor={ICE_DEEP} stopOpacity="0" />
          </radialGradient>
          <linearGradient id={`frost-${mode}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#E9F8FF" stopOpacity="0.9" />
            <stop offset="0.55" stopColor="#BFE8FA" stopOpacity="0.75" />
            <stop offset="1" stopColor="#E9F8FF" stopOpacity="0.92" />
          </linearGradient>
          <radialGradient id={`redcone-${mode}`} cx="0.5" cy="0" r="1">
            <stop offset="0" stopColor={RED} stopOpacity="0.45" />
            <stop offset="1" stopColor={RED} stopOpacity="0" />
          </radialGradient>
          <filter id={`blur-${mode}`} x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="10" />
          </filter>
          <filter id={`blur-s-${mode}`} x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="3" />
          </filter>
          <filter id={`frostnoise-${mode}`}>
            <feTurbulence type="fractalNoise" baseFrequency="0.035" numOctaves={4} seed={7} />
            <feColorMatrix type="matrix" values="0 0 0 0 0.92  0 0 0 0 0.97  0 0 0 0 1  0 0 0 2.2 -1.1" />
          </filter>
          <clipPath id={`glass-${mode}`}>
            <rect x={730} y={640} width={300} height={880} rx={150} />
          </clipPath>
          <radialGradient id={`edgefrost-${mode}`} cx="0.5" cy="0.5" r="0.75">
            <stop offset="0.62" stopColor="#CDEFFF" stopOpacity="0" />
            <stop offset="1" stopColor="#CDEFFF" stopOpacity={isSil ? 0.18 : 0.32} />
          </radialGradient>
        </defs>

        {/* ---------- коридор блока капсул ---------- */}
        <polygon points={`0,170 ${VP.x - 140},${VP.y - 180} ${VP.x + 140},${VP.y - 180} 1080,170 1080,0 0,0`} fill={wall2} />
        <polygon points={`0,1560 ${VP.x - 140},${VP.y + 160} ${VP.x + 140},${VP.y + 160} 1080,1560 1080,1920 0,1920`} fill={floor} />
        {/* решётка пола */}
        {!isSil
          ? [0, 1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
              <line key={i} x1={VP.x - 140 + i * 35} y1={VP.y + 160} x2={-400 + i * 235} y2={1920} stroke="#0E1828" strokeWidth={4} />
            ))
          : null}
        {/* дальний торец */}
        <rect x={VP.x - 140} y={VP.y - 180} width={280} height={340} fill={isSil ? "#05070A" : "#0A1322"} {...OL} />
        <rect x={VP.x - 90} y={VP.y - 130} width={180} height={280} fill={isSil ? "#000" : "#050A12"} />
        {/* потолочные рёбра */}
        {[0.18, 0.4, 0.62, 0.8].map((k, i) => {
          const y1 = 170 + (VP.y - 180 - 170) * k;
          const xl = (VP.x - 140) * k;
          const xr = 1080 - (1080 - VP.x - 140) * k;
          return <line key={i} x1={xl} y1={y1} x2={xr} y2={y1} stroke={isSil ? "#000" : isInk ? ink : "#13213A"} strokeWidth={26 * (1 - k * 0.7)} />;
        })}

        {/* капсулы (дальние → ближние) */}
        {[...rows].reverse().map((k) =>
          ([-1, 1] as const).map((side) => {
            const p = pod(k, side);
            if (side > 0 && k < 2) return null; // справа впереди — большая капсула
            if (k === 0) return null; // ближняя слева режется краем кадра
            return (
              <g key={`${k}${side}`}>
                <rect x={p.cx - p.w / 2 - 12 * p.s} y={p.top - 12 * p.s} width={p.w + 24 * p.s} height={p.h + 24 * p.s} rx={p.w / 2} fill={isSil ? "#030405" : "#1A2638"} {...(isInk ? { stroke: ink, strokeWidth: 5 * p.s } : {})} />
                <rect
                  x={p.cx - p.w / 2}
                  y={p.top}
                  width={p.w}
                  height={p.h}
                  rx={p.w / 2}
                  fill={p.frozen ? (isSil ? "#9FC9DD" : "#CBE9F7") : isSil ? "#0B1A24" : "#16324A"}
                  opacity={p.frozen ? (isSil ? 0.25 : 0.45) : 1}
                />
                {!p.frozen && !isSil ? <ellipse cx={p.cx} cy={p.top + p.h * 0.28} rx={p.w * 0.2} ry={p.w * 0.26} fill="#0A1A28" /> : null}
                <rect x={p.cx - p.w * 0.25} y={p.top + p.h + 4 * p.s} width={p.w * 0.5} height={10 * p.s} fill={p.frozen ? ICE : "#2B5A7A"} opacity={0.8} />
              </g>
            );
          }),
        )}

        {/* аварийная лампа и красный конус */}
        <rect x={150} y={250} width={150} height={24} rx={6} fill={RED} opacity={lamp} />
        {!isSil ? <polygon points="150,274 300,274 470,1300 -40,1300" fill={`url(#redcone-${mode})`} opacity={lamp * (isInk ? 0.6 : 0.9)} /> : null}
        {isSil ? <ellipse cx={225} cy={262} rx={160} ry={50} fill={RED} opacity={0.35 * lamp} filter={`url(#blur-${mode})`} /> : null}

        {/* ---------- ГРИБНИЦА: иней-прожилки по полу от капсулы к Глебу ---------- */}
        <g stroke={ICE} fill="none" strokeLinecap="round" opacity={isSil ? 0.95 : 0.85} filter={mode === "cine" ? `url(#blur-s-${mode})` : undefined}>
          <path d="M 780 1520 C 700 1580 620 1600 540 1660 C 480 1700 420 1720 380 1790" strokeWidth={6} />
          <path d="M 640 1600 C 620 1650 580 1690 520 1720" strokeWidth={3} />
          <path d="M 560 1650 C 520 1640 470 1660 440 1640" strokeWidth={3} />
          <path d="M 760 1530 C 760 1600 700 1680 690 1760 C 685 1800 700 1840 680 1900" strokeWidth={4} />
          <path d="M 720 1680 C 760 1700 790 1730 800 1780" strokeWidth={2.5} />
          <path d="M 1030 1300 C 1060 1250 1050 1180 1080 1120" strokeWidth={4} />
        </g>
        {mode !== "ink" ? (
          <path d="M 780 1520 C 700 1580 620 1600 540 1660 C 480 1700 420 1720 380 1790" stroke={ICE} strokeWidth={22} fill="none" opacity={0.25} filter={`url(#blur-${mode})`} />
        ) : null}

        {/* ---------- ЗАМЁРЗШАЯ КАПСУЛА СО СТЫЛЫМ ---------- */}
        <ellipse cx={880} cy={1080} rx={360} ry={560} fill={`url(#capglow-${mode})`} opacity={isInk ? 0.5 : 1} />
        <rect x={704} y={612} width={352} height={936} rx={176} fill={isSil ? "#030405" : "#1E2B3C"} {...(isInk ? { stroke: ink, strokeWidth: 8 } : {})} />
        <rect x={714} y={1520} width={332} height={40} rx={8} fill={isSil ? "#030405" : "#162231"} />
        <g clipPath={`url(#glass-${mode})`}>
          <rect x={730} y={640} width={300} height={880} fill={isSil ? "#0E2A3A" : "#183C55"} />
          {/* стылый — человеческий силуэт, кристаллы из плеч, бельма, прожилки */}
          <g filter={mode === "cine" ? `url(#blur-s-${mode})` : undefined}>
            <path d="M 760 1520 L 760 1080 C 780 990 830 960 880 960 C 930 960 980 990 1000 1080 L 1000 1520 Z" fill={isSil ? "#000" : "#B95A2A"} opacity={isSil ? 1 : 0.85} />
            <ellipse cx={880} cy={860} rx={70} ry={92} fill={isSil ? "#000" : "#8DA9B8"} />
            {/* кристаллы */}
            {[
              "M 790 1010 L 760 900 L 812 980 Z",
              "M 812 990 L 800 860 L 836 970 Z",
              "M 950 990 L 968 870 L 978 980 Z",
              "M 972 1010 L 1010 910 L 996 1000 Z",
              "M 870 960 L 880 900 L 892 962 Z",
            ].map((d, i) => (
              <path key={i} d={d} fill={isSil ? ICE : "#DDF6FF"} stroke={isInk ? ink : ICE_DEEP} strokeWidth={isInk ? 4 : 2} opacity={isSil ? 0.9 : 1} />
            ))}
            {/* прожилки под кожей */}
            {!isSil ? (
              <path d="M 850 800 L 862 840 L 850 880 M 910 810 L 900 850 L 914 900 M 880 940 L 880 1000" stroke="#5FC8FF" strokeWidth={3} fill="none" />
            ) : null}
            {/* бельма */}
            <ellipse cx={856} cy={852} rx={13} ry={9} fill="#F4FBFF" />
            <ellipse cx={904} cy={852} rx={13} ry={9} fill="#F4FBFF" />
            {/* пар изо рта */}
            <ellipse cx={882 + Math.sin(t * 2) * 6} cy={918 - (t % 1) * 20} rx={34} ry={14} fill="#F4FBFF" opacity={0.35} filter={`url(#blur-s-${mode})`} />
          </g>
          {/* иней на стекле изнутри */}
          <rect x={730} y={640} width={300} height={880} fill={`url(#frost-${mode})`} opacity={isSil ? 0.35 : 0.55} />
          <rect x={730} y={640} width={300} height={880} filter={`url(#frostnoise-${mode})`} opacity={isSil ? 0.25 : 0.35} />
          {/* оттаявшее «окно» вокруг ладони */}
          <ellipse cx={870} cy={1120} rx={110} ry={130} fill={isSil ? "#0E2A3A" : "#183C55"} opacity={0.55} filter={`url(#blur-${mode})`} />
          {/* белые пальцы, прижатые к стеклу изнутри */}
          <g fill="#EEF8FF" opacity={0.92} filter={mode === "ink" ? undefined : `url(#blur-s-${mode})`}>
            <path d="M 834 1200 C 826 1160 836 1130 870 1124 C 906 1120 920 1150 914 1196 C 904 1228 846 1232 834 1200 Z" />
            {[0, 1, 2, 3].map((k) => {
              const bx = 838 + k * 22;
              const len = [150, 178, 168, 132][k];
              const lean = [-14, -5, 4, 12][k];
              return (
                <path
                  key={k}
                  d={`M ${bx} 1140 C ${bx + lean * 0.3} ${1140 - len * 0.5}, ${bx + lean} ${1140 - len * 0.85}, ${bx + lean + 2} ${1140 - len}`}
                  stroke="#EEF8FF"
                  strokeWidth={13 - k}
                  strokeLinecap="round"
                  fill="none"
                />
              );
            })}
            <path d="M 912 1190 C 940 1176 958 1150 966 1124" stroke="#EEF8FF" strokeWidth={12} strokeLinecap="round" fill="none" />
          </g>
          {mode === "ink" ? (
            <g stroke={ink} strokeWidth={3} fill="none" opacity={0.7}>
              {[0, 1, 2, 3].map((k) => (
                <path key={k} d={`M ${838 + k * 22 - 8} ${1100 - k * 4} l 16 0 M ${838 + k * 22 - 6} ${1060 - k * 6} l 14 0`} />
              ))}
            </g>
          ) : null}
          {/* трещины от ладони */}
          <g stroke={isSil ? ICE : "#FFFFFF"} strokeWidth={2.5} fill="none" opacity={0.9}>
            <path d="M 930 1110 L 990 1060 L 1020 1080 M 960 1084 L 980 1010" />
            <path d="M 820 1200 L 770 1260 L 750 1330 M 790 1236 L 740 1240" />
            <path d="M 880 1220 L 900 1300 L 880 1380" />
          </g>
        </g>
        {/* блик стекла */}
        <path d="M 760 760 C 770 700 800 670 840 660" stroke="#FFFFFF" strokeWidth={10} fill="none" opacity={isSil ? 0.2 : 0.45} strokeLinecap="round" />
        <rect x={830} y={1528} width={100} height={14} rx={4} fill={RED} opacity={0.5 + 0.5 * Math.sin(t * 6)} />
        <text x={880} y={1600} textAnchor="middle" fontFamily="JetBrains Mono" fontWeight={700} fontSize={26} fill={isSil ? "#5F7F92" : "#7FA3BA"}>
          КАПСУЛА 2-117
        </text>

        {/* ---------- ГЛЕБ ---------- */}
        <Gleb mode={mode} x={290} y={1820} />

        {/* иней, ползущий по краям кадра (температура падает) */}
        <rect width={1080} height={1920} fill={`url(#edgefrost-${mode})`} />
      </svg>

      {/* общий HUD сериала */}
      <HUD
        accent={RED}
        timer={{ label: "ДО ПАДЕНИЯ", startSeconds: 11 * 3600 + 5 * 60, direction: "down" }}
        gauge={{ label: "КИСЛОРОД", percent: 64, danger: 25 }}
        distance={{ label: "ХОЛОДНЫХ: 1", meters: 6, danger: 10 }}
      />
      <div
        style={{
          position: "absolute",
          top: 316,
          right: 60,
          fontFamily: "JetBrains Mono",
          fontWeight: 700,
          fontSize: 34,
          color: ICE,
          background: "rgba(6,12,20,0.85)",
          border: `3px solid ${ICE_DEEP}`,
          borderRadius: 10,
          padding: "6px 14px",
        }}
      >
        ОТСЕК: −12°C
      </div>
      <Callout targetX={300} targetY={760} title="ГЛЕБ СЕВЕРИН, 35" subtitle="ОСУЖДЁН: ГОСИЗМЕНА" side="right" dx={150} dy={-180} accent={RED} />
      <Subtitles words={WORDS} keywords={["замёрзшую"]} centerY={1440} accent={RED} />
    </AbsoluteFill>
  );
};

export const HaronInk: React.FC = () => <HaronScene mode="ink" />;
export const HaronCine: React.FC = () => <HaronScene mode="cine" />;
export const HaronSil: React.FC = () => <HaronScene mode="sil" />;
