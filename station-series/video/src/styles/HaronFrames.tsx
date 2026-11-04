import React from "react";
import { AbsoluteFill, useCurrentFrame, useVideoConfig } from "remotion";
import { Person, LOOKS } from "../rig/Person";
import { HaronHUD, HARON } from "../components/HaronHUD";
import { Subtitles, TimedWord } from "../components/Subtitles";
import { Callout } from "../components/Callout";

// Три кадра «ХАРОНА» в утверждённом стиле: «кино-вектор» + чёрная обводка персонажей,
// третий — режим «силуэт» для момента страха.

const words = (list: [string, number, number][]): TimedWord[] => list.map(([word, start, end]) => ({ word, start, end }));

const Fx: React.FC<{ id: string }> = ({ id }) => (
  <defs>
    <filter id={`b6-${id}`} x="-50%" y="-50%" width="200%" height="200%">
      <feGaussianBlur stdDeviation="6" />
    </filter>
    <filter id={`b16-${id}`} x="-50%" y="-50%" width="200%" height="200%">
      <feGaussianBlur stdDeviation="16" />
    </filter>
    <filter id={`b40-${id}`} x="-50%" y="-50%" width="200%" height="200%">
      <feGaussianBlur stdDeviation="40" />
    </filter>
    <radialGradient id={`vig-${id}`} cx="0.5" cy="0.45" r="0.78">
      <stop offset="0.5" stopColor="#000" stopOpacity="0" />
      <stop offset="1" stopColor="#000" stopOpacity="0.75" />
    </radialGradient>
  </defs>
);

/* =================== КАДР 1 — серия 1, клиффхэнгер =================== */
// Палуба 1, стыковка. Глеб касается ледяной статуи охранника комиссии. Сзади хруст — вспышка «ОБНАРУЖЕН».
export const HaronFrame1: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const t = frame / fps;
  const VP = { x: 540, y: 900 };
  const flick = Math.sin(t * 37) > 0.85 ? 0.4 : 1;
  const id = "f1";
  return (
    <AbsoluteFill style={{ background: "#0A111D" }}>
      <svg width={1080} height={1920}>
        <Fx id={id} />
        {/* коридор шлюзовой палубы: восьмигранные рамы в перспективе */}
        {[0, 1, 2, 3, 4, 5, 6].reverse().map((k) => {
          const s = 1 / (1 + k * 0.55);
          const w = 1300 * s;
          const h = 1700 * s;
          const c = w * 0.22;
          const x0 = VP.x - w / 2;
          const y0 = VP.y - h * 0.5;
          const pts = `${x0 + c},${y0} ${x0 + w - c},${y0} ${x0 + w},${y0 + c} ${x0 + w},${y0 + h - c} ${x0 + w - c},${y0 + h} ${x0 + c},${y0 + h} ${x0},${y0 + h - c} ${x0},${y0 + c}`;
          return (
            <g key={k}>
              <polygon points={pts} fill={k === 6 ? "#03060B" : "none"} stroke={k % 2 ? "#142238" : "#1B2D47"} strokeWidth={46 * s} strokeLinejoin="round" />
              {/* аварийные лампы на рамах */}
              <rect x={VP.x - 50 * s} y={y0 - 8 * s} width={100 * s} height={16 * s} fill={k === 1 ? HARON.red : "#DDEFF8"} opacity={k === 1 ? 0.9 : 0.5 * flick} />
            </g>
          );
        })}
        {/* иней на стенах — грибница тянется по полу из глубины */}
        <g stroke={HARON.ice} fill="none" strokeLinecap="round" opacity={0.8}>
          <path d="M 540 1150 C 520 1250 470 1330 420 1420 C 380 1490 330 1540 300 1640" strokeWidth={5} />
          <path d="M 460 1360 C 520 1400 560 1450 600 1520" strokeWidth={3} />
          <path d="M 560 1180 C 640 1260 700 1300 760 1400" strokeWidth={3} />
        </g>
        <path d="M 540 1150 C 520 1250 470 1330 420 1420" stroke={HARON.ice} strokeWidth={24} fill="none" opacity={0.25} filter={`url(#b16-${id})`} />
        {/* пол */}
        <polygon points={`${VP.x - 300},${1200} ${VP.x + 300},${1200} 1300,1920 -220,1920`} fill="#070C14" opacity={0.6} />
        {/* вдали, в темноте конца коридора — стылый: только силуэт и бельма */}
        <g opacity={0.95}>
          <ellipse cx={560} cy={960} rx={120} ry={170} fill={HARON.ice} opacity={0.12} filter={`url(#b40-${id})`} />
          <Person uid="f1s" x={560} ground={1110} scale={0.26} mode="sil" look={LOOKS.stylyy} pose={{ armL: [-20, -10], armR: [25, 15], legL: [-6, 0], legR: [10, 4], lean: 6, head: 18 }} t={t} />
        </g>
        {/* ледяная статуя охранника */}
        <ellipse cx={780} cy={900} rx={260} ry={460} fill={HARON.ice} opacity={0.1} filter={`url(#b40-${id})`} />
        <Person
          uid="f1g"
          x={790}
          ground={1600}
          scale={0.9}
          look={LOOKS.guardFrozen}
          emotion="closed"
          facing={-1}
          light={{ x: -1, y: -0.7 }}
          rim="#FFFFFF"
          pose={{ armL: [-40, -85], armR: [20, -30], legL: [-6, 0], legR: [8, 2], head: -6 }}
        />
        {/* Глеб: правая рука на плече статуи */}
        <Person
          uid="f1p"
          x={270}
          ground={1620}
          scale={0.9}
          look={LOOKS.gleb}
          emotion="tense"
          facing={1}
          light={{ x: 1, y: -0.5 }}
          pose={{ armL: [10, 4], armR: [62, 96], legL: [-6, -2], legR: [10, 4], head: 6 }}
          t={t}
        />
        {/* иней ползёт по пальцам — точка контакта */}
        <circle cx={640} cy={770} r={36} fill="#E6F7FF" opacity={0.35} filter={`url(#b6-${id})`} />
        <rect width={1080} height={1920} fill={`url(#vig-${id})`} />
      </svg>
      <HaronHUD
        fallSeconds={11 * 3600 + 5 * 60 + 18}
        oxygen={71}
        temp={-12}
        deck={1}
        dots={[{ angle: 178, dist: 0.48, kind: "cold" }]}
        scanLabel="ХОЛОДНАЯ ЦЕЛЬ — 6 м"
        detectAt={1.0}
        frost={0.35}
      />
      <Subtitles words={words([["Голубое", 0.9, 1.3], ["это", 1.32, 1.5], ["что?", 1.5, 1.9]])} keywords={["голубое"]} accent={HARON.ice} />
    </AbsoluteFill>
  );
};

/* =================== КАДР 2 — серия 5, Ева =================== */
// Палуба 5. Стылый уже тянется к двери — его раскалывает струя пара. Ева у вентиля, который сама перенаправила.
export const HaronFrame2: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const t = frame / fps;
  const id = "f2";
  const shards = [
    [300, 640, 30],
    [360, 590, -20],
    [390, 700, 60],
    [320, 760, 10],
    [420, 650, -50],
    [270, 560, 40],
    [430, 770, 80],
  ];
  return (
    <AbsoluteFill style={{ background: "#0B1220" }}>
      <svg width={1080} height={1920}>
        <Fx id={id} />
        <defs>
          <linearGradient id="f2-pipe" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#6B6056" />
            <stop offset="0.4" stopColor="#A08C74" />
            <stop offset="1" stopColor="#2A241F" />
          </linearGradient>
          <linearGradient id="f2-jet" x1="1" y1="0" x2="0" y2="0">
            <stop offset="0" stopColor="#FFFFFF" stopOpacity="0.95" />
            <stop offset="1" stopColor="#FFFFFF" stopOpacity="0.15" />
          </linearGradient>
        </defs>
        {/* стена лаборатории: панели, дверь, кодовая панель */}
        <rect x={0} y={0} width={1080} height={1920} fill="#0D1626" />
        {[0, 1, 2, 3].map((i) => (
          <rect key={i} x={40 + i * 260} y={300} width={230} height={1000} rx={10} fill="#111D30" stroke="#1A2A42" strokeWidth={4} />
        ))}
        <rect x={560} y={340} width={300} height={960} fill="#070C14" stroke="#24364F" strokeWidth={10} />
        <rect x={560} y={1220} width={300} height={40} fill="#C9962A" opacity={0.6} />
        <text x={710} y={400} textAnchor="middle" fontFamily="Oswald" fontWeight={700} fontSize={40} fill="#5F7894">
          ЛАБОРАТОРИЯ 3
        </text>
        <rect x={880} y={700} width={90} height={130} rx={8} fill="#0A1220" stroke="#2D4560" strokeWidth={4} />
        <text x={925} y={760} textAnchor="middle" fontFamily="JetBrains Mono" fontWeight={700} fontSize={22} fill="#7CFFB2">
          4-1-1-9
        </text>
        <circle cx={925} cy={800} r={9} fill="#7CFFB2" />
        {/* пол */}
        <rect x={0} y={1300} width={1080} height={620} fill="#060A12" />
        <rect x={0} y={1300} width={1080} height={8} fill="#1C2A3E" />
        {/* паропровод вдоль потолка, сопло, вентиль — ТЁПЛЫЙ оранжевый */}
        <rect x={0} y={520} width={1080} height={70} fill="url(#f2-pipe)" stroke="#050608" strokeWidth={6} />
        {[120, 360, 600, 840].map((x) => (
          <rect key={x} x={x} y={508} width={26} height={94} fill="#4E443B" stroke="#050608" strokeWidth={4} />
        ))}
        <rect x={0} y={520} width={1080} height={70} fill={HARON.warm} opacity={0.12} />
        <path d="M 360 590 L 400 590 L 388 640 L 372 640 Z" fill="#4E443B" stroke="#050608" strokeWidth={5} />
        {/* вентиль */}
        <g transform={`translate(520, 630) rotate(${t * 40})`}>
          <circle r={52} fill="none" stroke="#B4572A" strokeWidth={14} />
          <path d="M -52 0 L 52 0 M 0 -52 L 0 52" stroke="#B4572A" strokeWidth={10} />
          <circle r={12} fill="#7A3A1C" />
        </g>
        <path d="M 520 590 L 520 580" stroke="#4E443B" strokeWidth={22} />

        {/* струя пара из сопла вниз-влево в стылого */}
        <path d="M 372 636 L 60 860 L 230 1060 L 392 646 Z" fill="url(#f2-jet)" filter={`url(#b16-${id})`} />
        {[0, 1, 2, 3, 4].map((i) => (
          <ellipse
            key={i}
            cx={230 - i * 30 + Math.sin(t * 3 + i) * 20}
            cy={860 + i * 50}
            rx={170 - i * 10}
            ry={110}
            fill="#F4F8FA"
            opacity={0.32 - i * 0.04}
            filter={`url(#b16-${id})`}
          />
        ))}

        {/* стылый: бросается вправо, его раскалывает паром */}
        <ellipse cx={220} cy={900} rx={220} ry={420} fill={HARON.ice} opacity={0.1} filter={`url(#b40-${id})`} />
        <Person
          uid="f2s"
          x={190}
          ground={1640}
          scale={0.86}
          look={LOOKS.stylyy}
          facing={1}
          light={{ x: 1, y: -1 }}
          rim="#FFFFFF"
          pose={{ armL: [125, 165], armR: [150, 178], legL: [-28, 6], legR: [32, -8], lean: -6, head: -14 }}
          t={t}
        />
        {/* осколки льда разлетаются */}
        {shards.map(([x, y, r], i) => (
          <path key={i} d="M 0 -26 L 10 0 L 0 22 L -8 2 Z" fill="#E9F8FF" stroke="#3E8FB8" strokeWidth={2} transform={`translate(${x - t * 30 * (i % 3)}, ${y - t * 20}) rotate(${r + t * 90})`} />
        ))}
        {/* пар поверх (стылый частью в облаке) */}
        <ellipse cx={170} cy={820} rx={190} ry={120} fill="#F4F8FA" opacity={0.35} filter={`url(#b16-${id})`} />

        {/* Ева у вентиля */}
        <ellipse cx={840} cy={880} rx={240} ry={460} fill={HARON.warm} opacity={0.08} filter={`url(#b40-${id})`} />
        <Person
          uid="f2e"
          x={840}
          ground={1580}
          scale={0.9}
          look={LOOKS.eva}
          emotion="determined"
          facing={-1}
          light={{ x: -1, y: -0.6 }}
          rim="#FFE3C8"
          pose={{ armL: [-100, 178], armR: [6, -30], legL: [-12, -2], legR: [10, 4], lean: -6, head: -4 }}
          t={t}
        />
        <rect width={1080} height={1920} fill={`url(#vig-${id})`} />
      </svg>
      <HaronHUD
        fallSeconds={7 * 3600 + 52 * 60}
        oxygen={52}
        temp={-18}
        deck={5}
        dots={[
          { angle: 270, dist: 0.16, kind: "cold" },
          { angle: 80, dist: 0.3, kind: "warm" },
        ]}
        scanLabel="СТЫЛЫЙ — 1 м"
        frost={0.25}
      />
      <Callout targetX={790} targetY={640} title="ЕВА ЛАНСКАЯ, 24" subtitle="ДОЧЬ ПРЕДСЕДАТЕЛЯ, АУДИТОР" side="left" dx={120} dy={-150} maxWidth={430} accent={HARON.red} />
      <Subtitles words={words([["Уходи", 0.9, 1.3], ["один.", 1.3, 1.8]])} keywords={["один"]} accent={HARON.red} />
    </AbsoluteFill>
  );
};

/* =================== КАДР 3 — серия 5, хук (СИЛУЭТ) =================== */
// Мостик над шахтой. Глеб замер, подогрев робы выключен. Внизу в синем свечении проходит стая.
export const HaronFrame3: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const t = frame / fps;
  const id = "f3";
  const pack = [
    { x: 250, g: 1250, s: 0.3, lean: 10, ph: 0 },
    { x: 430, g: 1225, s: 0.27, lean: -6, ph: 1 },
    { x: 640, g: 1260, s: 0.31, lean: 8, ph: 2 },
    { x: 820, g: 1230, s: 0.26, lean: -10, ph: 3 },
  ];
  return (
    <AbsoluteFill style={{ background: "#020305" }}>
      <svg width={1080} height={1920}>
        <Fx id={id} />
        {/* шахта: стены, трубы, синий свет снизу */}
        <rect x={0} y={0} width={1080} height={1920} fill="#030508" />
        {[60, 160, 900, 1000].map((x, i) => (
          <rect key={x} x={x} y={0} width={i % 2 ? 26 : 40} height={1920} fill="#07101A" />
        ))}
        <ellipse cx={540} cy={1240} rx={620} ry={260} fill={HARON.iceDeep} opacity={0.55} filter={`url(#b40-${id})`} />
        <ellipse cx={540} cy={1250} rx={420} ry={120} fill={HARON.ice} opacity={0.35} filter={`url(#b40-${id})`} />
        {/* грибница по стенам шахты */}
        <g stroke={HARON.ice} fill="none" opacity={0.85} strokeLinecap="round">
          <path d="M 90 1500 C 110 1300 70 1150 120 980 C 140 900 110 820 130 700" strokeWidth={4} />
          <path d="M 120 980 C 170 960 200 920 230 860" strokeWidth={2.5} />
          <path d="M 990 1480 C 960 1320 1010 1200 970 1060 C 950 980 990 900 960 820" strokeWidth={4} />
        </g>
        {/* стая стылых внизу: силуэты, бельма, прожилки, пар */}
        {pack.map((p, i) => (
          <g key={i}>
            <Person
              uid={`f3s${i}`}
              x={p.x + Math.sin(t * 0.8 + p.ph) * 6}
              ground={p.g}
              scale={p.s}
              mode="sil"
              look={LOOKS.stylyy}
              facing={i % 2 ? -1 : 1}
              light={{ x: 0, y: 1 }}
              pose={{ armL: [-15 - i * 4, -5], armR: [18 + i * 3, 10], legL: [-14 + i * 4, 4], legR: [16 - i * 3, -4], lean: p.lean, head: 16 }}
              t={t}
            />
            <ellipse cx={p.x + 4} cy={p.g - 470 * p.s - (t % 1.2) * 30} rx={40 * p.s * 2} ry={16 * p.s * 2} fill="#F4FBFF" opacity={0.25} filter={`url(#b6-${id})`} />
          </g>
        ))}
        {/* мостик: настил, перила, табличка-правило */}
        <rect x={0} y={880} width={1080} height={36} fill="#0B1118" stroke="#000" strokeWidth={4} />
        <rect x={0} y={916} width={1080} height={80} fill="#070B10" />
        {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((i) => (
          <rect key={i} x={20 + i * 104} y={720} width={10} height={170} fill="#0B1118" />
        ))}
        <rect x={0} y={714} width={1080} height={14} fill="#111A24" />
        <rect x={0} y={800} width={1080} height={8} fill="#0E151E" />
        <rect x={0} y={714} width={1080} height={4} fill={HARON.ice} opacity={0.35} />
        {/* ПРАВИЛО 2 — выцарапано на настиле */}
        <text x={540} y={970} textAnchor="middle" fontFamily="Oswald" fontWeight={700} fontSize={40} fill={HARON.white} opacity={0.85} letterSpacing={3} transform="rotate(-1 540 960)">
          2. ХРУСТИТ — ЗАМРИ И НЕ ГРЕЙСЯ
        </text>
        {/* красный аварийный сверху */}
        <ellipse cx={540} cy={300} rx={420} ry={140} fill={HARON.red} opacity={0.22} filter={`url(#b40-${id})`} />
        {/* Глеб замер на мостике — силуэт */}
        <Person
          uid="f3g"
          x={500}
          ground={890}
          scale={0.5}
          mode="sil"
          look={LOOKS.gleb}
          facing={1}
          light={{ x: 0.3, y: 1 }}
          pose={{ armL: [-14, -6], armR: [22, 150], legL: [-5, 0], legR: [7, 2], head: 22 }}
          t={t}
        />
        <rect width={1080} height={1920} fill={`url(#vig-${id})`} />
      </svg>
      <HaronHUD
        fallSeconds={8 * 3600 + 28 * 60}
        oxygen={58}
        temp={35}
        tempLabel="ТЕМП. ТЕЛА"
        tempText="35,1°"
        deck={5}
        dots={[
          { angle: 165, dist: 0.26, kind: "cold" },
          { angle: 185, dist: 0.32, kind: "cold" },
          { angle: 200, dist: 0.4, kind: "cold" },
          { angle: 215, dist: 0.36, kind: "cold" },
        ]}
        scanLabel="СТЫЛЫХ: 4 • БЛИЖАЙШИЙ 3 м"
        frost={0.75}
      />
      <Subtitles words={words([["Замри.", 0.9, 1.3], ["Не", 1.4, 1.5], ["грейся.", 1.5, 2.0]])} keywords={["замри"]} accent={HARON.red} />
    </AbsoluteFill>
  );
};
