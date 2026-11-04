import React from "react";
import { AbsoluteFill, useCurrentFrame, useVideoConfig } from "remotion";
import { HUD } from "../components/HUD";
import { Subtitles, TimedWord } from "../components/Subtitles";
import { Callout } from "../components/Callout";

// Три варианта стиля рисовки одной и той же сцены: героиня в коридоре станции,
// в дальнем проёме — ЧАСТЬ монстра. Только для выбора стиля, не для серий.

const WORDS: TimedWord[] = [
  { word: "Оно", start: 1.0, end: 1.25 },
  { word: "уже", start: 1.25, end: 1.45 },
  { word: "внутри.", start: 1.45, end: 2.0 },
];

const Overlay: React.FC<{ accent: string; title: string; sub: string; tx: number; ty: number }> = ({ accent, title, sub, tx, ty }) => (
  <>
    <HUD
      accent={accent}
      timer={{ label: "КИСЛОРОД", startSeconds: 47 * 60 + 12, direction: "down" }}
      gauge={{ label: "ЗАРЯД ФОНАРЯ", percent: 23, danger: 25 }}
      distance={{ label: "ДО ЦЕЛИ", meters: 14, danger: 15 }}
    />
    <Callout targetX={tx} targetY={ty} title={title} subtitle={sub} side="right" dx={190} dy={-150} accent={accent} />
    <Subtitles words={WORDS} keywords={["внутри"]} centerY={1420} accent={accent} />
  </>
);

/* ------------------------------------------------------------------ */
/* A — «Мягкий плоский»: округлые формы, крупная голова (1:3),          */
/*     холодный сине-бирюзовый + красный акцент, мягкие блики.          */
/* ------------------------------------------------------------------ */
export const StyleA: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const t = frame / fps;
  const accent = "#FF4B3E";
  const VP = { x: 540, y: 880 };
  const ribs = [0, 1, 2, 3, 4, 5];
  return (
    <AbsoluteFill style={{ background: "#0B1626" }}>
      <svg width={1080} height={1920}>
        <defs>
          <radialGradient id="a-glow" cx="0.5" cy="0.5" r="0.5">
            <stop offset="0" stopColor="#3FA7B5" stopOpacity="0.35" />
            <stop offset="1" stopColor="#3FA7B5" stopOpacity="0" />
          </radialGradient>
        </defs>
        {/* коридор: рёбра-арки в перспективе */}
        {ribs.map((k) => {
          const s = 1 / (1 + k * 0.6);
          const w = 1180 * s;
          const h = 1500 * s;
          return (
            <rect
              key={k}
              x={VP.x - w / 2}
              y={VP.y - h * 0.55}
              width={w}
              height={h}
              rx={180 * s}
              fill={k === 0 ? "#12233A" : "none"}
              stroke={k % 2 ? "#1C3350" : "#24456A"}
              strokeWidth={34 * s}
            />
          );
        })}
        {/* световые полосы на полу */}
        <path d={`M ${VP.x - 60} ${VP.y + 150} L 180 1920 L 260 1920 L ${VP.x - 40} ${VP.y + 150} Z`} fill="#3FA7B5" opacity={0.25} />
        <path d={`M ${VP.x + 60} ${VP.y + 150} L 900 1920 L 820 1920 L ${VP.x + 40} ${VP.y + 150} Z`} fill="#3FA7B5" opacity={0.25} />
        {/* дальняя дверь — темнота */}
        <rect x={VP.x - 95} y={VP.y - 150} width={190} height={260} rx={40} fill="#020409" />
        {/* монстр: только длинные пальцы на косяке и глаза */}
        <g fill="#020409" stroke="#020409">
          {[0, 1, 2, 3].map((i) => (
            <path
              key={i}
              d={`M ${VP.x + 95} ${VP.y - 120 + i * 26} q 40 -8 46 ${10 + i * 2} q 4 14 -10 16`}
              strokeWidth={12}
              strokeLinecap="round"
              fill="none"
            />
          ))}
        </g>
        <circle cx={VP.x - 25} cy={VP.y - 70} r={7} fill={accent} opacity={0.6 + 0.4 * Math.sin(t * 3)} />
        <circle cx={VP.x + 15} cy={VP.y - 72} r={7} fill={accent} opacity={0.6 + 0.4 * Math.sin(t * 3)} />
        <ellipse cx={VP.x} cy={VP.y - 40} rx={420} ry={420} fill="url(#a-glow)" />
        {/* героиня: голова 1:3, круглые формы */}
        <g transform="translate(300, 1640)">
          <ellipse cx={0} cy={0} rx={150} ry={22} fill="#000" opacity={0.4} />
          <rect x={-70} y={-200} width={56} height={200} rx={28} fill="#2D3E55" />
          <rect x={14} y={-200} width={56} height={200} rx={28} fill="#2D3E55" />
          <rect x={-120} y={-470} width={240} height={300} rx={110} fill="#E8833A" />
          <rect x={-120} y={-330} width={240} height={30} fill="#C96A28" />
          <rect x={95} y={-430} width={60} height={210} rx={30} fill="#E8833A" transform="rotate(-18 125 -430)" />
          {/* фонарь в руке */}
          <rect x={150} y={-300} width={70} height={36} rx={10} fill="#DDE6EE" transform="rotate(-18 150 -300)" />
          <circle cx={0} cy={-610} r={150} fill="#F2C9A5" />
          <path d="M -150 -620 Q -140 -790 10 -780 Q 160 -770 150 -620 Q 100 -700 -20 -690 Q -110 -680 -150 -620 Z" fill="#2B1B17" />
          <circle cx={-50} cy={-600} r={16} fill="#1B1B1B" />
          <circle cx={50} cy={-600} r={16} fill="#1B1B1B" />
          <circle cx={-44} cy={-606} r={5} fill="#fff" />
          <circle cx={56} cy={-606} r={5} fill="#fff" />
          <path d="M -60 -645 l 35 8 M 60 -645 l -35 8" stroke="#2B1B17" strokeWidth={8} strokeLinecap="round" />
          <ellipse cx={0} cy={-545} rx={20} ry={14} fill="#7A2E2E" />
        </g>
      </svg>
      <Overlay accent={accent} title="МАРА, 24" sub="ТЕХНИК СВЯЗИ" tx={340} ty={1110} />
    </AbsoluteFill>
  );
};

/* ------------------------------------------------------------------ */
/* B — «Графичный нуар»: острые формы, жёсткие тени, почти монохром,    */
/*     реалистичные пропорции (1:7), силуэты с контровым светом.        */
/* ------------------------------------------------------------------ */
export const StyleB: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const t = frame / fps;
  const accent = "#FF2A2A";
  const rim = "#9FB4C4";
  const flicker = 0.85 + 0.15 * Math.sin(t * 23) * Math.sin(t * 7);
  return (
    <AbsoluteFill style={{ background: "#050607" }}>
      <svg width={1080} height={1920}>
        {/* жёсткая перспектива коридора */}
        <polygon points="0,300 420,780 420,1060 0,1700" fill="#0D1114" />
        <polygon points="1080,300 660,780 660,1060 1080,1700" fill="#2A3640" />
        <polygon points="1080,300 660,780 660,1060 1080,1700" fill="#C8D8E4" opacity={0.12 * flicker} />
        <polygon points="0,1700 420,1060 660,1060 1080,1700 1080,1920 0,1920" fill="#08090B" />
        <polygon points="0,300 420,780 660,780 1080,300 1080,0 0,0" fill="#07080A" />
        {/* световой конус от лампы */}
        <polygon points="520,330 560,330 900,1700 180,1700" fill="#C8D8E4" opacity={0.07 * flicker} />
        <rect x={500} y={316} width={80} height={14} fill="#C8D8E4" opacity={flicker} />
        {/* рёбра-переборки — резкие линии */}
        {[0.15, 0.35, 0.6].map((k, i) => (
          <g key={i} stroke="#1A2229" strokeWidth={10 - i * 3} fill="none">
            <polyline points={`${420 * k},${300 + 480 * k} ${420 * k},${1700 - 640 * k}`} />
            <polyline points={`${1080 - 420 * k},${300 + 480 * k} ${1080 - 420 * k},${1700 - 640 * k}`} />
          </g>
        ))}
        {/* дальний проём + огромная тень монстра на стене */}
        <rect x={420} y={780} width={240} height={280} fill="#000" />
        <path
          d="M 660 820 L 760 700 L 900 640 L 1080 560 L 1080 1500 L 940 1300 L 860 1180 L 760 1100 L 660 1060 Z"
          fill="#000"
          opacity={0.95}
        />
        {/* длинные «пальцы» тени */}
        {[0, 1, 2].map((i) => (
          <polygon key={i} points={`${900 + i * 50},${640 - i * 30} ${1000 + i * 40},${380 - i * 60} ${1012 + i * 40},${385 - i * 60} ${930 + i * 50},${650 - i * 30}`} fill="#000" />
        ))}
        <circle cx={500} cy={880} r={6} fill={accent} />
        <circle cx={530} cy={878} r={6} fill={accent} />
        {/* героиня: реалистичные пропорции, силуэт + контровой свет */}
        <g transform="translate(330, 1760)">
          <polygon points="-140,0 140,0 120,20 -120,20" fill="#000" opacity={0.6} />
          <polygon points="-60,0 -20,0 -10,-420 -70,-420" fill="#0B0E11" stroke={rim} strokeWidth={3} />
          <polygon points="20,0 60,0 70,-420 10,-420" fill="#0B0E11" stroke={rim} strokeWidth={3} />
          <polygon points="-95,-420 95,-420 110,-760 60,-820 -60,-820 -110,-760" fill="#0F1418" stroke={rim} strokeWidth={3} />
          <polygon points="95,-780 140,-760 200,-560 170,-550 110,-700" fill="#0F1418" stroke={rim} strokeWidth={3} />
          <polygon points="-95,-780 -140,-760 -150,-480 -120,-480 -110,-700" fill="#0F1418" stroke={rim} strokeWidth={3} />
          {/* голова: половина лица в тени */}
          <polygon points="-50,-830 50,-830 62,-900 50,-980 0,-1000 -50,-980 -62,-900" fill="#C9B8A8" />
          <polygon points="0,-1000 50,-980 62,-900 50,-830 0,-830" fill="#1A1A1A" />
          <polygon points="-62,-940 -10,-1010 60,-990 70,-930 30,-970 -20,-960" fill="#0A0A0A" />
          <rect x={-38} y={-915} width={22} height={6} fill="#111" />
          <polygon points="200,-560 230,-570 520,-760 520,-620" fill="#DDE8F0" opacity={0.08} />
        </g>
      </svg>
      <Overlay accent={accent} title="МАРА, 24" sub="ТЕХНИК СВЯЗИ" tx={340} ty={800} />
    </AbsoluteFill>
  );
};

/* ------------------------------------------------------------------ */
/* C — «Ретро-фантастика 70-х»: толстый контур, тёплые приглушённые     */
/*     цвета, растр-точки, круглые иллюминаторы, пузырь-шлем.            */
/* ------------------------------------------------------------------ */
export const StyleC: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const t = frame / fps;
  const accent = "#E8642C";
  const ink = "#15110D";
  const OL = { stroke: ink, strokeWidth: 8, strokeLinejoin: "round" as const };
  return (
    <AbsoluteFill style={{ background: "#1F1A15" }}>
      <svg width={1080} height={1920}>
        <defs>
          <clipPath id="c-port">
            <circle cx={720} cy={720} r={176} />
          </clipPath>
          <pattern id="c-dots" width="14" height="14" patternUnits="userSpaceOnUse">
            <circle cx="7" cy="7" r="2.6" fill={ink} opacity="0.35" />
          </pattern>
        </defs>
        {/* стена с панелями */}
        <rect x={0} y={0} width={1080} height={1920} fill="#3A3128" />
        <rect x={0} y={0} width={1080} height={1920} fill="url(#c-dots)" />
        {[0, 1, 2].map((i) => (
          <rect key={i} x={40 + i * 340} y={340} width={320} height={900} rx={40} fill="#4A3F33" {...OL} />
        ))}
        {/* иллюминатор с щупальцем снаружи */}
        <circle cx={720} cy={720} r={220} fill="#C9BB9B" {...OL} />
        <circle cx={720} cy={720} r={180} fill="#0D0B10" {...OL} />
        <g clipPath="url(#c-port)">
          {[0, 1, 2, 3, 4, 5, 6].map((i) => (
            <circle key={i} cx={600 + i * 41} cy={580 + ((i * 53) % 260)} r={3} fill="#E9DFC6" />
          ))}
          <path
            d={`M 900 920 C ${780 + Math.sin(t * 2) * 20} 860, 700 820, 640 700 C 610 640, 650 600, 690 630`}
            stroke={ink}
            strokeWidth={70}
            fill="none"
            strokeLinecap="round"
          />
          <path d={`M 900 920 C ${780 + Math.sin(t * 2) * 20} 860, 700 820, 640 700`} stroke="#5B2A3A" strokeWidth={46} fill="none" strokeLinecap="round" />
          {[0, 1, 2, 3].map((i) => (
            <circle key={i} cx={830 - i * 55} cy={880 - i * 45} r={9} fill="#E9DFC6" opacity={0.7} />
          ))}
        </g>
        {[0, 45, 90, 135, 180, 225, 270, 315].map((a) => (
          <circle key={a} cx={720 + 200 * Math.cos((a * Math.PI) / 180)} cy={720 + 200 * Math.sin((a * Math.PI) / 180)} r={9} fill="#8C7F66" {...OL} strokeWidth={4} />
        ))}
        {/* пульт с лампочками */}
        <rect x={60} y={1180} width={960} height={140} rx={24} fill="#6E5F4B" {...OL} />
        {[0, 1, 2, 3, 4, 5].map((i) => (
          <circle key={i} cx={560 + i * 70} cy={1250} r={20} fill={i === 2 ? accent : "#C9BB9B"} {...OL} strokeWidth={5} opacity={i === 2 ? 0.6 + 0.4 * Math.sin(t * 6) : 1} />
        ))}
        <rect x={0} y={1320} width={1080} height={600} fill="#2A231C" />
        {/* героиня: скафандр-«пузырь», толстый контур */}
        <g transform="translate(300, 1700)">
          <ellipse cx={0} cy={0} rx={160} ry={24} fill={ink} opacity={0.5} />
          <rect x={-90} y={-260} width={80} height={260} rx={30} fill="#E9DFC6" {...OL} />
          <rect x={10} y={-260} width={80} height={260} rx={30} fill="#E9DFC6" {...OL} />
          <rect x={-150} y={-600} width={300} height={380} rx={90} fill="#E9DFC6" {...OL} />
          <rect x={-60} y={-520} width={120} height={90} rx={12} fill={accent} {...OL} strokeWidth={6} />
          <circle cx={-30} cy={-475} r={12} fill="#E9DFC6" />
          <circle cx={20} cy={-475} r={12} fill="#7FB6A6" />
          <rect x={-205} y={-570} width={70} height={250} rx={34} fill="#E9DFC6" {...OL} />
          <rect x={135} y={-570} width={70} height={250} rx={34} fill="#E9DFC6" {...OL} />
          {/* шлем-пузырь и лицо */}
          <circle cx={0} cy={-760} r={170} fill="#9FC4C0" opacity={0.35} {...OL} />
          <circle cx={0} cy={-740} r={95} fill="#E7B48C" {...OL} strokeWidth={6} />
          <path d="M -95 -760 Q -90 -860 0 -855 Q 95 -850 95 -760 Q 60 -820 0 -812 Q -60 -805 -95 -760 Z" fill="#7A3B22" {...OL} strokeWidth={6} />
          <ellipse cx={-34} cy={-735} rx={10} ry={14} fill={ink} />
          <ellipse cx={34} cy={-735} rx={10} ry={14} fill={ink} />
          <path d="M -24 -690 Q 0 -700 24 -690" stroke={ink} strokeWidth={6} fill="none" strokeLinecap="round" />
          <path d="M -110 -840 Q -60 -900 20 -905" stroke="#FFFFFF" strokeWidth={14} fill="none" strokeLinecap="round" opacity={0.6} />
        </g>
      </svg>
      <Overlay accent={accent} title="МАРА, 24" sub="ТЕХНИК СВЯЗИ" tx={330} ty={960} />
    </AbsoluteFill>
  );
};
