import React from "react";
import { AbsoluteFill, useCurrentFrame, useVideoConfig } from "remotion";
import { HUD } from "../components/HUD";
import { Subtitles, TimedWord } from "../components/Subtitles";
import { Callout } from "../components/Callout";

// Мрачные детализированные образцы стиля (D, E, F). Только для выбора направления.
// Настроение — индустриальный космо-хоррор; всё своё, без копирования чужих дизайнов.

const WORDS: TimedWord[] = [
  { word: "Оно", start: 1.0, end: 1.25 },
  { word: "уже", start: 1.25, end: 1.45 },
  { word: "внутри.", start: 1.45, end: 2.0 },
];

/* ============================ ПЕРСОНАЖ ============================ */
// Реалистичные пропорции (~6.5 голов), cel-shading в 2 тона: тень накладывается
// одним полигоном, обрезанным по силуэту. Начало координат — между ступнями.

type Pal = {
  skin: string;
  hair: string;
  suit: string;
  suitDark: string;
  boots: string;
  patch: string;
  rim: string;
  shadow: string; // цвет тени (полупрозрачно поверх)
  shadowOpacity: number;
  eyes?: string;
};

const BODY: { id: string; d: string; part: "skin" | "suit" | "suitDark" | "boots" | "hair" }[] = [
  // ноги
  { id: "legL", part: "suit", d: "M -100 -520 L -6 -520 L -14 -300 L -24 -60 L -86 -60 L -94 -300 Z" },
  { id: "legR", part: "suit", d: "M 6 -520 L 100 -520 L 94 -300 L 86 -60 L 24 -60 L 14 -300 Z" },
  { id: "bootL", part: "boots", d: "M -92 -78 L -18 -78 L -12 0 L -110 0 C -114 -26 -104 -56 -92 -78 Z" },
  { id: "bootR", part: "boots", d: "M 18 -78 L 92 -78 C 104 -56 114 -26 110 0 L 12 0 Z" },
  // корпус
  { id: "torso", part: "suit", d: "M -122 -912 C -80 -936 80 -936 122 -912 L 130 -800 L 110 -620 L 102 -515 L -102 -515 L -110 -620 L -130 -800 Z" },
  // левая рука (висит)
  { id: "armL", part: "suit", d: "M -122 -912 C -152 -898 -164 -860 -162 -800 L -154 -640 L -140 -548 L -108 -548 L -114 -650 L -118 -800 Z" },
  { id: "handL", part: "skin", d: "M -152 -552 C -160 -522 -152 -488 -130 -486 C -110 -488 -104 -516 -108 -552 Z" },
  // правая рука — вперёд с фонарём
  { id: "armR1", part: "suit", d: "M 118 -912 C 152 -902 168 -868 170 -828 L 192 -722 L 160 -708 L 132 -800 Z" },
  { id: "armR2", part: "suit", d: "M 164 -740 L 290 -796 L 302 -764 L 182 -700 Z" },
  { id: "handR", part: "skin", d: "M 286 -800 C 300 -812 322 -806 326 -790 C 330 -774 316 -760 300 -762 Z" },
  // шея, голова, уши
  { id: "neck", part: "skin", d: "M -22 -990 L 22 -990 L 28 -926 L -28 -926 Z" },
  { id: "head", part: "skin", d: "M -52 -1062 C -56 -1122 -30 -1150 0 -1150 C 34 -1150 58 -1122 54 -1062 C 52 -1022 40 -988 18 -974 C 8 -968 -8 -968 -18 -974 C -40 -988 -52 -1022 -52 -1062 Z" },
  { id: "ear", part: "skin", d: "M -50 -1068 C -66 -1070 -66 -1032 -50 -1032 Z" },
  // волосы (короткие, практичные)
  { id: "hair", part: "hair", d: "M -60 -1066 C -68 -1142 -30 -1174 6 -1172 C 48 -1170 70 -1132 60 -1062 C 54 -1098 36 -1114 8 -1110 C -10 -1092 -34 -1088 -48 -1080 C -52 -1072 -56 -1068 -60 -1066 Z" },
];

const Character: React.FC<{
  x: number;
  y: number;
  scale?: number;
  pal: Pal;
  uid: string;
  light?: "left" | "right";
  number?: string; // нашивка/номер
}> = ({ x, y, scale = 1, pal, uid, light = "left", number }) => {
  const fill = (p: string) =>
    p === "skin" ? pal.skin : p === "hair" ? pal.hair : p === "boots" ? pal.boots : p === "suitDark" ? pal.suitDark : pal.suit;
  // тень: со стороны, противоположной свету
  const shadowPoly =
    light === "left"
      ? "M 22 -1250 L 700 -1250 L 700 60 L -18 60 Z"
      : "M -2 -1250 C 18 -1100 26 -1000 4 -930 L -700 -930 L -700 -1250 Z M 30 -930 L -700 -930 L -700 60 L -10 60 Z";
  const dark = "#0B0B0C";
  return (
    <g transform={`translate(${x}, ${y}) scale(${scale})`}>
      <defs>
        <clipPath id={`sil-${uid}`}>
          {BODY.map((b) => (
            <path key={b.id} d={b.d} />
          ))}
        </clipPath>
      </defs>
      <ellipse cx={0} cy={6} rx={170} ry={20} fill="#000" opacity={0.55} />
      {/* контровой свет — обводка под всем */}
      {BODY.map((b) => (
        <path key={`r${b.id}`} d={b.d} fill="none" stroke={pal.rim} strokeWidth={6} strokeLinejoin="round" />
      ))}
      {BODY.map((b) => (
        <path key={b.id} d={b.d} fill={fill(b.part)} />
      ))}
      {/* детали одежды */}
      <g stroke={pal.suitDark} strokeWidth={4} fill="none" strokeLinecap="round">
        <path d="M 0 -918 L 0 -540" />
        <path d="M -60 -420 q 14 -12 32 -4 M 40 -430 q 16 -8 30 4 M -70 -220 q 16 -8 30 0 M 42 -240 q 14 -10 30 0" />
        <path d="M -118 -740 q 30 10 60 4 M 60 -736 q 30 6 58 -6" />
        <path d="M -150 -700 q 14 6 30 0 M 200 -760 q 10 10 26 6" />
      </g>
      {/* ремни-разгрузка */}
      <path d="M -104 -900 L 70 -560 M 104 -900 L -70 -560" stroke={pal.suitDark} strokeWidth={14} />
      <rect x={-106} y={-548} width={212} height={28} fill={pal.suitDark} />
      <rect x={-96} y={-540} width={44} height={46} rx={4} fill={pal.suitDark} stroke={dark} strokeWidth={3} />
      <rect x={52} y={-540} width={44} height={46} rx={4} fill={pal.suitDark} stroke={dark} strokeWidth={3} />
      <rect x={-12} y={-546} width={24} height={24} fill="#8C8C86" />
      {/* наколенники */}
      <rect x={-92} y={-330} width={68} height={60} rx={10} fill={pal.suitDark} />
      <rect x={24} y={-330} width={68} height={60} rx={10} fill={pal.suitDark} />
      {/* нашивка */}
      <rect x={-104} y={-870} width={58} height={36} rx={3} fill={pal.patch} />
      {number ? (
        <text x={-75} y={-845} textAnchor="middle" fontFamily="JetBrains Mono" fontWeight={700} fontSize={20} fill="#111">
          {number}
        </text>
      ) : null}
      {/* луч фонаря */}
      <defs>
        <linearGradient id={`beam-${uid}`} x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stopColor={pal.rim} stopOpacity="0.45" />
          <stop offset="1" stopColor={pal.rim} stopOpacity="0" />
        </linearGradient>
      </defs>
      <path d="M 418 -838 L 1100 -1180 L 1100 -760 Z" fill={`url(#beam-${uid})`} />
      {/* фонарь */}
      <path d="M 300 -808 L 392 -846 L 406 -812 L 314 -774 Z" fill="#3A3D40" stroke={dark} strokeWidth={3} />
      <path d="M 392 -846 L 410 -854 L 424 -820 L 406 -812 Z" fill="#DDE6EE" />
      {/* лицо */}
      <g>
        <path d="M -38 -1060 Q -24 -1072 -8 -1061 Q -24 -1053 -38 -1060 Z" fill="#E9E3DA" />
        <path d="M 8 -1061 Q 24 -1072 38 -1060 Q 24 -1053 8 -1061 Z" fill="#E9E3DA" />
        <circle cx={-21} cy={-1061} r={5.5} fill={pal.eyes ?? "#2A2622"} />
        <circle cx={25} cy={-1061} r={5.5} fill={pal.eyes ?? "#2A2622"} />
        <path d="M -42 -1078 L -8 -1074" stroke={pal.hair} strokeWidth={7} strokeLinecap="round" />
        <path d="M 8 -1074 L 42 -1082" stroke={pal.hair} strokeWidth={7} strokeLinecap="round" />
        <path d="M -36 -1049 q 12 6 24 1 M 12 -1048 q 12 5 24 -1" stroke={dark} strokeWidth={2} opacity={0.45} fill="none" />
        <path d="M 0 -1058 L 8 -1024 L -4 -1020" stroke={dark} strokeWidth={3} fill="none" opacity={0.6} strokeLinejoin="round" />
        <path d="M -14 -998 Q 0 -1002 14 -998" stroke="#4A2A26" strokeWidth={4} fill="none" strokeLinecap="round" />
        {/* шрам */}
        <path d="M -40 -1092 L -26 -1040" stroke="#B07468" strokeWidth={3} opacity={0.8} />
      </g>
      {/* тень (2-й тон) и грязь — только внутри силуэта */}
      <g clipPath={`url(#sil-${uid})`}>
        <path d={shadowPoly} fill={pal.shadow} opacity={pal.shadowOpacity} />
        <path d="M -30 -990 L 30 -990 L 30 -960 L -30 -960 Z" fill={pal.shadow} opacity={0.5} />
        <path d="M -60 -1110 C -20 -1100 20 -1100 60 -1110 L 60 -1095 C 20 -1085 -20 -1085 -60 -1095 Z" fill={pal.shadow} opacity={0.35} />
        {[
          [-80, -700, 18],
          [60, -640, 12],
          [-40, -260, 16],
          [70, -150, 20],
          [-110, -820, 10],
        ].map(([cx, cy, r], i) => (
          <circle key={i} cx={cx} cy={cy} r={r} fill="#000" opacity={0.18} />
        ))}
      </g>
    </g>
  );
};

/* ============================ ОБЩЕЕ ============================ */
const Grain: React.FC<{ id: string; opacity?: number; vignette?: number }> = ({ id, opacity = 0.12, vignette = 0.75 }) => (
  <svg width={1080} height={1920} style={{ position: "absolute", inset: 0 }}>
    <defs>
      <filter id={`grain-${id}`}>
        <feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves={2} seed={3} />
        <feColorMatrix type="saturate" values="0" />
      </filter>
      <radialGradient id={`vig-${id}`} cx="0.5" cy="0.45" r="0.75">
        <stop offset="0.45" stopColor="#000" stopOpacity="0" />
        <stop offset="1" stopColor="#000" stopOpacity={vignette} />
      </radialGradient>
    </defs>
    <rect width={1080} height={1920} filter={`url(#grain-${id})`} opacity={opacity} style={{ mixBlendMode: "overlay" }} />
    <rect width={1080} height={1920} fill={`url(#vig-${id})`} />
  </svg>
);

const Overlay: React.FC<{ accent: string; tx: number; ty: number; timer: string }> = ({ accent, tx, ty, timer }) => (
  <>
    <HUD
      accent={accent}
      timer={{ label: timer, startSeconds: 47 * 60 + 12, direction: "down" }}
      gauge={{ label: "ЗАРЯД ФОНАРЯ", percent: 23, danger: 25 }}
      distance={{ label: "ДО ЦЕЛИ", meters: 14, danger: 15 }}
    />
    <Callout targetX={tx} targetY={ty} title="МАРА, 24" subtitle="ТЕХНИК СВЯЗИ" side="right" dx={200} dy={-130} accent={accent} />
    <Subtitles words={WORDS} keywords={["внутри"]} centerY={1430} accent={accent} />
  </>
);

/* ============================ D — ИНДУСТРИАЛЬНЫЙ ============================ */
// Грязный «рабочий» корабль: трубы, кабели, решётчатый пол, натриевый янтарный свет, пар.
// Монстр: длинные костлявые пальцы снизу, сквозь решётку пола.
export const StyleD: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const t = frame / fps;
  const accent = "#FFA62B";
  const VP = { x: 560, y: 860 };
  const flick = 0.9 + 0.1 * Math.sin(t * 31) * Math.sin(t * 5);
  const steam = (i: number) => 0.18 + 0.08 * Math.sin(t * 1.3 + i);
  return (
    <AbsoluteFill style={{ background: "#07070A" }}>
      <svg width={1080} height={1920}>
        <defs>
          <linearGradient id="d-pipe" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#5B544A" />
            <stop offset="0.35" stopColor="#8D7F6A" />
            <stop offset="1" stopColor="#1C1A17" />
          </linearGradient>
          <radialGradient id="d-lamp" cx="0.5" cy="0" r="1">
            <stop offset="0" stopColor="#FFB45A" stopOpacity="0.55" />
            <stop offset="1" stopColor="#FFB45A" stopOpacity="0" />
          </radialGradient>
          <pattern id="d-grate" width="34" height="34" patternUnits="userSpaceOnUse" patternTransform="skewX(-20)">
            <rect width="34" height="34" fill="#16130F" />
            <rect x="2" y="2" width="30" height="30" fill="#050505" />
          </pattern>
          <pattern id="d-hazard" width="40" height="40" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
            <rect width="20" height="40" fill="#C9962A" />
            <rect x="20" width="20" height="40" fill="#141210" />
          </pattern>
        </defs>
        {/* стены/потолок/пол в перспективе */}
        <polygon points={`0,240 ${VP.x - 150},${VP.y - 170} ${VP.x - 150},${VP.y + 170} 0,1560`} fill="#1A1814" />
        <polygon points={`1080,240 ${VP.x + 150},${VP.y - 170} ${VP.x + 150},${VP.y + 170} 1080,1560`} fill="#121110" />
        <polygon points={`0,240 ${VP.x - 150},${VP.y - 170} ${VP.x + 150},${VP.y - 170} 1080,240 1080,0 0,0`} fill="#0C0B0A" />
        <polygon points={`0,1560 ${VP.x - 150},${VP.y + 170} ${VP.x + 150},${VP.y + 170} 1080,1560 1080,1920 0,1920`} fill="url(#d-grate)" />
        {/* дальний конец — шлюз */}
        <rect x={VP.x - 150} y={VP.y - 170} width={300} height={340} fill="#0E0D0B" />
        <rect x={VP.x - 120} y={VP.y - 140} width={240} height={310} fill="#050505" stroke="#2A2620" strokeWidth={8} />
        <rect x={VP.x - 120} y={VP.y + 130} width={240} height={30} fill="url(#d-hazard)" opacity={0.8} />
        {/* рёбра-шпангоуты */}
        {[0.12, 0.3, 0.52, 0.72].map((k, i) => {
          const lx = (VP.x - 150) * k;
          const rx = 1080 - (1080 - VP.x - 150) * k;
          const ty = 240 + (VP.y - 170 - 240) * k;
          const by = 1560 - (1560 - VP.y - 170) * k;
          const w = 46 * (1 - k * 0.8);
          return (
            <g key={i}>
              <polygon points={`${lx},${ty} ${lx + w},${ty + w * 0.8} ${lx + w},${by - w * 0.8} ${lx},${by}`} fill="#2B2721" />
              <polygon points={`${rx},${ty} ${rx - w},${ty + w * 0.8} ${rx - w},${by - w * 0.8} ${rx},${by}`} fill="#221F1B" />
              <line x1={lx} y1={ty} x2={rx} y2={ty} stroke="#1E1B17" strokeWidth={w * 0.7} />
              {[0, 1, 2, 3, 4].map((j) => (
                <circle key={j} cx={lx + w / 2} cy={ty + ((by - ty) * (j + 0.5)) / 5} r={w * 0.08} fill="#5E564A" />
              ))}
            </g>
          );
        })}
        {/* трубы на левой стене */}
        {[0, 1, 2].map((i) => {
          const y0 = 480 + i * 70;
          return (
            <path
              key={i}
              d={`M 0 ${y0} L ${VP.x - 160} ${VP.y - 120 + i * 24}`}
              stroke="url(#d-pipe)"
              strokeWidth={46 - i * 10}
              strokeLinecap="butt"
            />
          );
        })}
        {/* панели и хазард на правой стене */}
        <polygon points={`1080,1180 ${VP.x + 150},${VP.y + 90} ${VP.x + 150},${VP.y + 130} 1080,1300`} fill="url(#d-hazard)" opacity={0.75} />
        <polygon points="1080,520 880,640 880,900 1080,860" fill="#2A2620" stroke="#3E382F" strokeWidth={4} />
        <text x={960} y={760} fontFamily="Oswald" fontWeight={700} fontSize={44} fill="#8E7C5C" transform="rotate(14 960 760) skewY(-6)" opacity={0.8}>
          С-4
        </text>
        {/* провисающие кабели */}
        <path d="M 120 120 Q 380 330 640 160" stroke="#0A0908" strokeWidth={14} fill="none" />
        <path d="M 300 60 Q 560 300 900 120" stroke="#0A0908" strokeWidth={10} fill="none" />
        {/* натриевая лампа + конус света */}
        <rect x={470} y={250} width={160} height={22} rx={6} fill="#FFC27A" opacity={flick} />
        <polygon points="470,270 630,270 1000,1700 80,1700" fill="url(#d-lamp)" opacity={flick * 0.9} />
        {/* пар */}
        {[0, 1, 2].map((i) => (
          <ellipse key={i} cx={200 + i * 80 + Math.sin(t + i) * 20} cy={760 - i * 50} rx={160} ry={60} fill="#D9CBB2" opacity={steam(i) * 0.5} />
        ))}
        {/* МОНСТР: пальцы сквозь решётку пола, передний план справа */}
        <g>
          {[0, 1, 2, 3].map((i) => {
            const bx = 830 + i * 40;
            const sway = Math.sin(t * 1.6 + i) * 6;
            return (
              <g key={i}>
                <path
                  d={`M ${bx} 1720 C ${bx - 6} ${1620 - i * 6}, ${bx + 20 + sway} ${1520 - i * 14}, ${bx + 46 + sway} ${1470 - i * 10}`}
                  stroke="#0B0A0A"
                  strokeWidth={22 - i * 2}
                  strokeLinecap="round"
                  fill="none"
                />
                <path
                  d={`M ${bx - 4} 1700 C ${bx - 8} ${1620 - i * 6}, ${bx + 14 + sway} ${1530 - i * 14}, ${bx + 40 + sway} ${1478 - i * 10}`}
                  stroke="#5E5547"
                  strokeWidth={3}
                  fill="none"
                  opacity={0.55}
                />
                {/* суставы */}
                <circle cx={bx + 2} cy={1630 - i * 8} r={12 - i} fill="#0B0A0A" />
                {/* коготь */}
                <path d={`M ${bx + 46 + sway} ${1470 - i * 10} l 20 -8 l -16 16 Z`} fill="#C9BFA8" />
              </g>
            );
          })}
          <rect x={790} y={1700} width={260} height={30} fill="url(#d-grate)" />
        </g>
        <Character
          x={300}
          y={1820}
          scale={1}
          uid="d"
          light="right"
          pal={{
            skin: "#C99F80",
            hair: "#1B1512",
            suit: "#4E5245",
            suitDark: "#2C2F27",
            boots: "#18171A",
            patch: accent,
            rim: "#FFB866",
            shadow: "#0A0A0F",
            shadowOpacity: 0.55,
          }}
        />
      </svg>
      <Grain id="d" opacity={0.18} vignette={0.85} />
      <Overlay accent={accent} tx={320} ty={790} timer="КИСЛОРОД" />
    </AbsoluteFill>
  );
};

/* ============================ E — КРИОСОН ============================ */
// Отсек гиперсна: ряды капсул, холодный больничный свет, мерцающие лампы, туман.
// Монстр: силуэт и ладонь за заиндевевшим стеклом дальней капсулы.
export const StyleE: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const t = frame / fps;
  const accent = "#8CFFC9";
  const flick = Math.sin(t * 40) > 0.7 ? 0.35 : 1;
  const pods = [
    { x: 600, y: 520, s: 0.55 },
    { x: 760, y: 560, s: 0.7 },
    { x: 950, y: 620, s: 0.9 },
  ];
  return (
    <AbsoluteFill style={{ background: "#05090B" }}>
      <svg width={1080} height={1920}>
        <defs>
          <linearGradient id="e-glass" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0" stopColor="#8FD8D8" stopOpacity="0.55" />
            <stop offset="0.5" stopColor="#DDF7F5" stopOpacity="0.75" />
            <stop offset="1" stopColor="#6AB7BA" stopOpacity="0.5" />
          </linearGradient>
          <linearGradient id="e-fog" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#9FD6D2" stopOpacity="0" />
            <stop offset="1" stopColor="#9FD6D2" stopOpacity="0.28" />
          </linearGradient>
          <filter id="e-blur">
            <feGaussianBlur stdDeviation="6" />
          </filter>
        </defs>
        {/* стены */}
        <rect width={1080} height={1920} fill="#0A1214" />
        <polygon points="0,0 1080,0 1080,300 0,420" fill="#070C0E" />
        <polygon points="0,1420 1080,1300 1080,1920 0,1920" fill="#0B1012" />
        {/* лампы дневного света */}
        {[0, 1, 2].map((i) => (
          <g key={i} opacity={i === 1 ? flick : 1}>
            <rect x={120 + i * 330} y={330 - i * 30} width={220} height={16} fill="#DFF8F6" />
            <polygon points={`${120 + i * 330},${346 - i * 30} ${340 + i * 330},${346 - i * 30} ${420 + i * 330},${1300} ${40 + i * 330},${1360}`} fill="#BFEDEA" opacity={0.05} />
          </g>
        ))}
        {/* кабели и трубки над капсулами */}
        {[0, 1, 2, 3].map((i) => (
          <path key={i} d={`M ${440 + i * 40} 420 C ${520 + i * 60} 600, ${720 + i * 40} 380, ${1080} ${460 + i * 30}`} stroke="#0F1719" strokeWidth={12 - i * 2} fill="none" />
        ))}
        {/* капсулы справа (дальняя — с монстром) */}
        {pods.map((p, i) => {
          const w = 260 * p.s;
          const h = 900 * p.s;
          return (
            <g key={i} transform={`translate(${p.x}, ${p.y})`}>
              <rect x={-w / 2 - 20 * p.s} y={-20 * p.s} width={w + 40 * p.s} height={h + 40 * p.s} rx={w / 2} fill="#1C2629" stroke="#2C3A3E" strokeWidth={6 * p.s} />
              <rect x={-w / 2} y={0} width={w} height={h} rx={w / 2} fill="#0B1517" />
              {i === 1 ? (
                // силуэт за инеем: голова, плечи, вытянутые пальцы на стекле
                <g filter="url(#e-blur)">
                  <ellipse cx={0} cy={h * 0.18} rx={w * 0.2} ry={w * 0.34} fill="#000" />
                  <ellipse cx={-w * 0.07} cy={h * 0.16} rx={w * 0.03} ry={w * 0.015} fill={accent} />
                  <ellipse cx={w * 0.07} cy={h * 0.16} rx={w * 0.03} ry={w * 0.015} fill={accent} />
                  <path d={`M ${-w * 0.42} ${h * 0.55} Q 0 ${h * 0.22} ${w * 0.42} ${h * 0.55} L ${w * 0.42} ${h} L ${-w * 0.42} ${h} Z`} fill="#000" />
                </g>
              ) : (
                <ellipse cx={0} cy={h * 0.25} rx={w * 0.2} ry={w * 0.24} fill="#13262A" filter="url(#e-blur)" />
              )}
              <rect x={-w / 2} y={0} width={w} height={h} rx={w / 2} fill="url(#e-glass)" opacity={i === 1 ? 0.4 : 0.75} />
              {i === 1 ? (
                // отпечаток ладони изнутри — длинные пальцы
                <g fill="#0A1112" opacity={0.85}>
                  <ellipse cx={w * 0.12} cy={h * 0.42} rx={w * 0.09} ry={w * 0.11} />
                  {[0, 1, 2, 3].map((k) => (
                    <rect key={k} x={w * 0.03 + k * w * 0.055} y={h * 0.27 - k * 3} width={w * 0.035} height={h * 0.13} rx={w * 0.02} />
                  ))}
                </g>
              ) : null}
              <rect x={-w * 0.3} y={h + 6 * p.s} width={w * 0.6} height={14 * p.s} fill={i === 1 ? accent : "#3D6B6E"} opacity={i === 1 ? 0.5 + 0.5 * Math.sin(t * 5) : 1} />
            </g>
          );
        })}
        {/* открытая капсула героини — слева сзади */}
        <g transform="translate(120, 760)">
          <rect x={-150} y={-30} width={300} height={940} rx={150} fill="#1C2629" stroke="#2C3A3E" strokeWidth={6} />
          <rect x={-120} y={0} width={240} height={880} rx={120} fill="#071012" />
          <path d="M 120 120 C 240 160 260 520 160 860" stroke="#9FD6D2" strokeWidth={14} fill="none" opacity={0.35} />
        </g>
        {/* туман */}
        <rect x={0} y={1100} width={1080} height={820} fill="url(#e-fog)" />
        {[0, 1, 2, 3].map((i) => (
          <ellipse key={i} cx={(i * 300 + t * 30) % 1300 - 100} cy={1560 + (i % 2) * 60} rx={260} ry={50} fill="#BFE9E6" opacity={0.08} />
        ))}
        <Character
          x={360}
          y={1800}
          scale={1}
          uid="e"
          light="right"
          pal={{
            skin: "#C8BDB2",
            hair: "#2B2A2A",
            suit: "#8F999B",
            suitDark: "#4F5A5D",
            boots: "#2A3134",
            patch: accent,
            rim: "#CFFFF6",
            shadow: "#06191C",
            shadowOpacity: 0.6,
            eyes: "#3C5A5A",
          }}
        />
      </svg>
      <Grain id="e" opacity={0.16} vignette={0.8} />
      <Overlay accent={accent} tx={380} ty={770} timer="ДО ПРОБУЖДЕНИЯ" />
    </AbsoluteFill>
  );
};

/* ============================ F — ТЮРЕМНЫЙ БЛОК ============================ */
// Орбитальная тюрьма: ярусы камер, решётки, трафаретные номера, вращающийся красный аварийный свет, дым.
// Монстр: длинная рука из камеры сквозь решётку.
export const StyleF: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const t = frame / fps;
  const accent = "#FF2E2E";
  const beam = (t * 140) % 360;
  const red = 0.45 + 0.55 * Math.max(0, Math.cos(((beam - 200) * Math.PI) / 180));
  const tiers = [380, 760, 1140];
  return (
    <AbsoluteFill style={{ background: "#050404" }}>
      <svg width={1080} height={1920}>
        <defs>
          <linearGradient id="f-red" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#FF2E2E" stopOpacity="0.35" />
            <stop offset="1" stopColor="#FF2E2E" stopOpacity="0" />
          </linearGradient>
        </defs>
        <rect width={1080} height={1920} fill="#0B0807" />
        {/* дальняя стена ярусов камер (правая сторона) */}
        {tiers.map((ty, ti) => (
          <g key={ti}>
            {[0, 1, 2, 3].map((c) => {
              const x = 480 + c * 150;
              return (
                <g key={c}>
                  <rect x={x} y={ty} width={130} height={300} fill="#120D0C" stroke="#2A201D" strokeWidth={6} />
                  {[0, 1, 2, 3, 4, 5].map((b) => (
                    <rect key={b} x={x + 10 + b * 20} y={ty + 6} width={8} height={288} fill="#3A302C" />
                  ))}
                  <text x={x + 65} y={ty - 12} textAnchor="middle" fontFamily="Oswald" fontWeight={700} fontSize={26} fill="#6E5C55">
                    {`Б-${ti + 1}${c + 1}`}
                  </text>
                </g>
              );
            })}
            {/* мостки-ярусы с перилами */}
            <rect x={420} y={ty + 300} width={660} height={22} fill="#1E1715" />
            {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((r) => (
              <rect key={r} x={430 + r * 62} y={ty + 250} width={6} height={52} fill="#2C2320" />
            ))}
            <rect x={420} y={ty + 246} width={660} height={8} fill="#3A2E2A" />
          </g>
        ))}
        {/* ближняя левая стена: массивная переборка */}
        <polygon points="0,0 400,140 400,1600 0,1920" fill="#120D0B" />
        {[0, 1, 2, 3, 4].map((i) => (
          <rect key={i} x={30} y={260 + i * 260} width={330} height={20} fill="#1E1714" />
        ))}
        <text x={200} y={560} textAnchor="middle" fontFamily="Oswald" fontWeight={700} fontSize={140} fill="#2A1F1B" transform="rotate(4 200 560)">
          БЛОК Б
        </text>
        {/* красный аварийный свет: маяк + отсвет */}
        <circle cx={420} cy={150} r={26} fill={accent} opacity={0.6 + 0.4 * red} />
        <rect width={1080} height={1920} fill="url(#f-red)" opacity={red} />
        <rect width={1080} height={1920} fill={accent} opacity={0.06 * red} style={{ mixBlendMode: "screen" }} />
        {/* дым */}
        {[0, 1, 2, 3].map((i) => (
          <ellipse key={i} cx={500 + i * 150 + Math.sin(t * 0.8 + i) * 30} cy={1000 + i * 90} rx={240} ry={70} fill="#5A4642" opacity={0.12} />
        ))}
        {/* МОНСТР: рука из камеры Б-24 (средний ярус), сквозь решётку */}
        <g>
          <rect x={780} y={760} width={130} height={300} fill="#000" />
          {[0, 1, 2, 3, 4, 5].map((b) => (
            <rect key={b} x={790 + b * 20} y={766} width={8} height={288} fill="#3A302C" />
          ))}
          {(() => {
            const sway = Math.sin(t * 1.2) * 10;
            return (
              <g>
                <path
                  d={`M 840 900 C 800 940, 720 980, ${640 + sway} 1040 C ${600 + sway} 1070, ${560 + sway} 1080, ${520 + sway} 1076`}
                  stroke="#090606"
                  strokeWidth={26}
                  strokeLinecap="round"
                  fill="none"
                />
                <path
                  d={`M 840 892 C 800 932, 720 972, ${640 + sway} 1032`}
                  stroke={accent}
                  strokeWidth={3}
                  fill="none"
                  opacity={0.5 * red}
                />
                {[0, 1, 2, 3].map((k) => (
                  <path
                    key={k}
                    d={`M ${520 + sway} 1076 q ${-40 - k * 6} ${-20 + k * 16} ${-90 - k * 8} ${-6 + k * 26}`}
                    stroke="#090606"
                    strokeWidth={9}
                    strokeLinecap="round"
                    fill="none"
                  />
                ))}
              </g>
            );
          })()}
        </g>
        {/* пол-мостик переднего плана */}
        <polygon points="0,1640 1080,1560 1080,1920 0,1920" fill="#0F0B0A" />
        {[0, 1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
          <line key={i} x1={i * 135} y1={1640 - i * 10} x2={i * 135 - 60} y2={1920} stroke="#1E1714" strokeWidth={6} />
        ))}
        <Character
          x={280}
          y={1830}
          scale={1}
          uid="f"
          light="right"
          number="Б-17"
          pal={{
            skin: "#B98E74",
            hair: "#151010",
            suit: "#8A3B22",
            suitDark: "#4A1E12",
            boots: "#151214",
            patch: "#D9D2C5",
            rim: "#FF5A4A",
            shadow: "#100404",
            shadowOpacity: 0.6,
          }}
        />
      </svg>
      <Grain id="f" opacity={0.2} vignette={0.85} />
      <Overlay accent={accent} tx={300} ty={800} timer="ДО БЛОКИРОВКИ" />
    </AbsoluteFill>
  );
};
