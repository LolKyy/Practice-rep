import React from "react";

/**
 * Риг персонажа «ХАРОН».
 * Конечности — капсулы между суставами (углы в градусах: 0 — вниз, 90 — вправо, −90 — влево, 180 — вверх).
 * Чёрная обводка по внешнему силуэту, 2-тоновая светотень (полоса тени + полоса контрового света на каждой
 * конечности), режимы: cine — основной, sil — силуэт для страшных моментов.
 */

export type P = { x: number; y: number };
export type Limb = [number, number]; // [верхний сегмент, нижний сегмент]

export type Pose = {
  lean?: number; // наклон корпуса, ° (+ — верх вправо)
  head?: number; // наклон головы, °
  armL: Limb; // рука слева на экране
  armR: Limb;
  legL: Limb;
  legR: Limb;
};

export type Emotion = "neutral" | "tense" | "fear" | "determined" | "closed";

export type Look = {
  skin: string;
  suit: string;
  suitDark: string;
  boots: string;
  hair: string;
  hairStyle: "buzz" | "bob" | "helmet" | "none";
  extras?: ("stubble" | "scar" | "earpiece" | "scanner" | "tablet" | "number" | "commission" | "crystals" | "veins" | "frost" | "icicles" | "blanket")[];
  number?: string;
  eyes?: string;
  glowEyes?: boolean; // бельма стылых
};

export const LOOKS: Record<string, Look> = {
  gleb: {
    skin: "#B9957C",
    suit: "#7A838A",
    suitDark: "#454C52",
    boots: "#1C1E21",
    hair: "#1D1915",
    hairStyle: "buzz",
    extras: ["stubble", "scar", "earpiece", "scanner", "number"],
    number: "0731",
  },
  eva: {
    skin: "#D8B49B",
    suit: "#D3D8DC",
    suitDark: "#8B959D",
    boots: "#2A2D33",
    hair: "#16110F",
    hairStyle: "bob",
    extras: ["tablet", "commission"],
  },
  guardFrozen: {
    skin: "#CDEBF7",
    suit: "#A9D6EA",
    suitDark: "#6FA6C2",
    boots: "#7FB2CB",
    hair: "#B8E0F2",
    hairStyle: "helmet",
    extras: ["frost", "icicles"],
    eyes: "#7FB2CB",
  },
  stylyy: {
    skin: "#8FA8B6",
    suit: "#B4572A",
    suitDark: "#6A3018",
    boots: "#2B2A2C",
    hair: "#5E6F78",
    hairStyle: "none",
    extras: ["crystals", "veins", "frost"],
    glowEyes: true,
  },
};

const INK = "#050608";
const ICE = "#9FE3FF";

const v = (a: number, len: number): P => {
  const r = (a * Math.PI) / 180;
  return { x: Math.sin(r) * len, y: Math.cos(r) * len };
};
const add = (a: P, b: P): P => ({ x: a.x + b.x, y: a.y + b.y });
const rotAround = (p: P, c: P, deg: number): P => {
  const r = (deg * Math.PI) / 180;
  const dx = p.x - c.x;
  const dy = p.y - c.y;
  return { x: c.x + dx * Math.cos(r) - dy * Math.sin(r), y: c.y + dx * Math.sin(r) + dy * Math.cos(r) };
};

/** Капсула между точками a и b радиусом r (замкнутый путь — годится для clipPath). */
export const capsule = (a: P, b: P, r: number) => {
  const dx = b.x - a.x;
  const dy = b.y - a.y;
  const L = Math.hypot(dx, dy) || 1;
  const nx = (-dy / L) * r;
  const ny = (dx / L) * r;
  return `M ${a.x + nx} ${a.y + ny} L ${b.x + nx} ${b.y + ny} A ${r} ${r} 0 0 0 ${b.x - nx} ${b.y - ny} L ${a.x - nx} ${a.y - ny} A ${r} ${r} 0 0 0 ${a.x + nx} ${a.y + ny} Z`;
};

/** Сужающаяся капсула: радиус ra у точки a, rb у точки b. */
export const taper = (a: P, b: P, ra: number, rb: number) => {
  const dx = b.x - a.x;
  const dy = b.y - a.y;
  const L = Math.hypot(dx, dy) || 1;
  const ux = -dy / L;
  const uy = dx / L;
  return `M ${a.x + ux * ra} ${a.y + uy * ra} L ${b.x + ux * rb} ${b.y + uy * rb} A ${rb} ${rb} 0 0 0 ${b.x - ux * rb} ${b.y - uy * rb} L ${a.x - ux * ra} ${a.y - uy * ra} A ${ra} ${ra} 0 0 0 ${a.x + ux * ra} ${a.y + uy * ra} Z`;
};

const HEAD_SCALE = 1.32;

const SIZES = { thigh: 270, shin: 255, upper: 205, fore: 185, thighR: 50, shinR: 40, upperR: 33, foreR: 28, handR: 25, bootR: 30, bootLen: 74 };

const TORSO =
  "M -135 -300 C -140 -338 -60 -348 0 -348 C 60 -348 140 -338 135 -300 L 128 -200 C 120 -150 100 -122 98 -100 L 112 32 L -112 32 L -98 -100 C -100 -122 -120 -150 -128 -200 Z";
const HEAD = "M -58 -10 C -62 -70 -32 -88 0 -88 C 36 -88 62 -70 58 -10 C 58 30 48 58 24 72 C 12 78 -12 78 -24 72 C -48 58 -58 30 -58 -10 Z";
const HAIR: Record<string, string> = {
  buzz: "M -62 -14 C -70 -82 -32 -102 2 -100 C 42 -98 66 -78 62 -12 C 54 -48 32 -62 0 -60 C -28 -58 -50 -44 -62 -14 Z",
  bob: "M -72 34 C -84 -62 -50 -104 0 -104 C 50 -104 84 -62 72 34 L 56 38 C 60 0 56 -30 46 -46 C 20 -38 -10 -42 -36 -54 C -52 -32 -58 0 -56 38 Z",
  helmet: "M -66 -16 C -68 -92 -30 -106 0 -106 C 30 -106 68 -92 66 -16 L 52 -22 C 48 -58 -48 -58 -52 -22 Z",
  none: "",
};

export type PersonProps = {
  x: number; // центр таза по X
  ground: number; // Y пола (подошвы)
  scale?: number;
  pose: Pose;
  look: Look;
  facing?: 1 | -1; // куда смотрит лицо/носки
  emotion?: Emotion;
  light?: P; // направление НА источник света (например {x:1,y:-1} — свет справа сверху)
  rim?: string; // цвет контрового света
  mode?: "cine" | "sil";
  uid: string;
  t?: number; // время (сек) для мигания/пара
};

export const Person: React.FC<PersonProps> = ({
  x,
  ground,
  scale = 1,
  pose,
  look,
  facing = 1,
  emotion = "neutral",
  light = { x: 1, y: -0.6 },
  rim = ICE,
  mode = "cine",
  uid,
  t = 0,
}) => {
  const sil = mode === "sil";
  const ex = new Set(look.extras ?? []);
  const lean = pose.lean ?? 0;
  const L = Math.hypot(light.x, light.y) || 1;
  const lv = { x: light.x / L, y: light.y / L };

  // --- суставы (локальные координаты, таз в (0,0)) ---
  const pelvis: P = { x: 0, y: 0 };
  const hipL: P = { x: -54, y: 12 };
  const hipR: P = { x: 54, y: 12 };
  const kneeL = add(hipL, v(pose.legL[0], SIZES.thigh));
  const ankleL = add(kneeL, v(pose.legL[1], SIZES.shin));
  const kneeR = add(hipR, v(pose.legR[0], SIZES.thigh));
  const ankleR = add(kneeR, v(pose.legR[1], SIZES.shin));
  const lowest = Math.max(ankleL.y, ankleR.y) + SIZES.bootR;
  const up = (p: P) => rotAround(p, pelvis, lean);
  const neck = up({ x: 0, y: -340 });
  const shL = up({ x: -118, y: -300 });
  const shR = up({ x: 118, y: -300 });
  const headC = rotAround(up({ x: 0, y: -340 - 112 }), neck, pose.head ?? 0);
  const elL = add(shL, v(pose.armL[0], SIZES.upper));
  const wrL = add(elL, v(pose.armL[1], SIZES.fore));
  const elR = add(shR, v(pose.armR[0], SIZES.upper));
  const wrR = add(elR, v(pose.armR[1], SIZES.fore));
  const handL = add(wrL, v(pose.armL[1], 22));
  const handR = add(wrR, v(pose.armR[1], 22));
  const toe = (a: P) => ({ x: a.x + facing * SIZES.bootLen, y: a.y + 6 });

  type Part = { d: string; fill: string; a?: P; b?: P; r?: number; rb?: number };
  const limb = (a: P, b: P, r: number, fill: string, rb = r): Part => ({ d: taper(a, b, r, rb), fill, a, b, r, rb });
  const C = (c: string) => (sil ? "#07090C" : c);

  const legs: Part[] = [
    limb(hipL, kneeL, 54, C(look.suit), 40),
    limb(kneeL, ankleL, 41, C(look.suit), 31),
    limb(hipR, kneeR, 54, C(look.suit), 40),
    limb(kneeR, ankleR, 41, C(look.suit), 31),
    limb(ankleL, toe(ankleL), SIZES.bootR, C(look.boots)),
    limb(ankleR, toe(ankleR), SIZES.bootR, C(look.boots)),
  ];
  const neckPart = limb(neck, add(neck, v(180 + lean, 52)), 27, C(look.skin));
  const torsoPart: Part = { d: TORSO, fill: C(look.suit) };
  const arms: Part[] = [
    limb(shL, elL, 38, C(look.suit), 29),
    limb(elL, wrL, 30, C(look.suit), 23),
    limb(shR, elR, 38, C(look.suit), 29),
    limb(elR, wrR, 30, C(look.suit), 23),
    limb(wrL, handL, 24, C(look.skin), 28),
    limb(wrR, handR, 24, C(look.skin), 28),
  ];
  const torsoTf = `rotate(${lean} 0 0)`;
  const headTf = `translate(${headC.x} ${headC.y}) rotate(${lean + (pose.head ?? 0)}) scale(${HEAD_SCALE})`;

  // Тень/контровой свет конечности: смещённые капсулы внутри исходной.
  const shade = (p: Part, key: string) => {
    if (!p.a || !p.b || !p.r) return null;
    const dx = p.b.x - p.a.x;
    const dy = p.b.y - p.a.y;
    const len = Math.hypot(dx, dy) || 1;
    let n = { x: -dy / len, y: dx / len };
    if (n.x * lv.x + n.y * lv.y > 0) n = { x: -n.x, y: -n.y }; // n — в сторону тени
    const r1 = p.r;
    const r2 = p.rb ?? p.r;
    const off = (r: number, k: number) => ({ x: n.x * r * k, y: n.y * r * k });
    return (
      <g key={key}>
        {!sil ? <path d={taper(add(p.a, off(r1, 0.45)), add(p.b, off(r2, 0.45)), r1 * 0.52, r2 * 0.52)} fill="#020611" opacity={0.42} /> : null}
        <path d={taper(add(p.a, off(r1, -0.78)), add(p.b, off(r2, -0.78)), r1 * (sil ? 0.2 : 0.14), r2 * (sil ? 0.2 : 0.14))} fill={rim} opacity={sil ? 0.95 : 0.75} />
      </g>
    );
  };

  const all = [...legs, neckPart, ...arms];
  const fx = facing * 5;
  const eyeWhite = look.glowEyes ? "#F4FBFF" : "#E8E2D8";

  // брови и рот по эмоции
  const brow = {
    neutral: ["M -44 -30 L -10 -30", "M 10 -30 L 44 -30"],
    tense: ["M -44 -34 L -10 -27", "M 10 -27 L 44 -34"],
    fear: ["M -44 -28 L -10 -38", "M 10 -38 L 44 -28"],
    determined: ["M -44 -32 L -10 -26", "M 10 -26 L 44 -32"],
    closed: ["M -44 -28 L -10 -28", "M 10 -28 L 44 -28"],
  }[emotion];
  const mouth = {
    neutral: <path d="M -14 46 L 14 46" stroke="#3E2622" strokeWidth={4} strokeLinecap="round" />,
    tense: <path d="M -16 48 Q 0 42 16 48" stroke="#3E2622" strokeWidth={4} fill="none" strokeLinecap="round" />,
    fear: <ellipse cx={0} cy={48} rx={11} ry={13} fill="#2A1514" />,
    determined: <path d="M -16 46 L 16 44" stroke="#3E2622" strokeWidth={5} strokeLinecap="round" />,
    closed: <path d="M -12 46 L 12 46" stroke="#5A7C8E" strokeWidth={3} strokeLinecap="round" />,
  }[emotion];

  return (
    <g transform={`translate(${x}, ${ground - lowest * scale}) scale(${scale})`}>
      <defs>
        {/* clipPath — в локальных координатах того элемента, который его использует */}
        <clipPath id={`torso-${uid}`}>
          <path d={TORSO} />
        </clipPath>
        <clipPath id={`head-${uid}`}>
          <path d={HEAD} />
        </clipPath>
        <linearGradient id={`tshade-${uid}`} x1={lv.x > 0 ? 1 : 0} y1="0" x2={lv.x > 0 ? 0 : 1} y2="0">
          <stop offset="0" stopColor="#020611" stopOpacity="0" />
          <stop offset="0.5" stopColor="#020611" stopOpacity="0.12" />
          <stop offset="0.75" stopColor="#020611" stopOpacity="0.5" />
          <stop offset="1" stopColor="#020611" stopOpacity="0.7" />
        </linearGradient>
        <filter id={`pglow-${uid}`} x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation="6" />
        </filter>
      </defs>

      {/* тень на полу */}
      <ellipse cx={(ankleL.x + ankleR.x) / 2 + facing * 30} cy={lowest} rx={190} ry={22} fill="#000" opacity={0.55} />

      {/* ЧЁРНАЯ ОБВОДКА — весь силуэт, толстым штрихом под заливками */}
      <g stroke={INK} strokeWidth={sil ? 6 : 16} strokeLinejoin="round" fill={INK}>
        {all.map((p, i) => (
          <path key={i} d={p.d} />
        ))}
        <path d={TORSO} transform={torsoTf} />
        <path d={HEAD} transform={headTf} />
        {look.hairStyle !== "none" ? <path d={HAIR[look.hairStyle]} transform={headTf} /> : null}
      </g>

      {/* ноги */}
      {legs.map((p, i) => (
        <path key={`l${i}`} d={p.d} fill={p.fill} />
      ))}
      {legs.map((p, i) => shade(p, `ls${i}`))}
      {!sil ? (
        <g>
          <path d={capsule(add(kneeL, { x: 0, y: -4 }), add(kneeL, { x: 0, y: 22 }), 26)} fill={C(look.suitDark)} opacity={0.8} />
          <path d={capsule(add(kneeR, { x: 0, y: -4 }), add(kneeR, { x: 0, y: 22 }), 26)} fill={C(look.suitDark)} opacity={0.8} />
        </g>
      ) : null}

      {/* корпус + детали */}
      <path d={TORSO} transform={torsoTf} fill={torsoPart.fill} />
      <g transform={torsoTf}>
        {!sil ? (
          <>
            <path d="M 0 -336 L 0 0" stroke={look.suitDark} strokeWidth={4} />
            <path d="M -122 -250 q 30 10 60 4 M 60 -246 q 30 6 62 -6 M -90 -150 q 20 8 40 2" stroke={look.suitDark} strokeWidth={4} fill="none" />
            <rect x={-112} y={-6} width={224} height={26} fill={look.suitDark} />
            {ex.has("number") ? (
              <>
                <rect x={-118} y={-272} width={92} height={40} fill="#D8D6CF" />
                <text x={-72} y={-242} textAnchor="middle" fontFamily="JetBrains Mono" fontWeight={700} fontSize={28} fill="#111">
                  {look.number}
                </text>
              </>
            ) : null}
            {ex.has("commission") ? (
              <>
                <path d="M -128 -200 L 128 -200" stroke="#3A6E8F" strokeWidth={10} />
                <circle cx={-72} cy={-258} r={20} fill="#3A6E8F" />
                <path d="M -80 -258 L -64 -258 M -72 -266 L -72 -250" stroke="#E8EEF2" strokeWidth={4} />
                {/* грязь */}
                <circle cx={60} cy={-120} r={22} fill="#5A5048" opacity={0.25} />
                <circle cx={-40} cy={-60} r={16} fill="#5A5048" opacity={0.25} />
              </>
            ) : null}
          </>
        ) : null}
        {/* светотень корпуса */}
        <g clipPath={`url(#torso-${uid})`}>
          {!sil ? <rect x={-150} y={-360} width={300} height={400} fill={`url(#tshade-${uid})`} transform={`rotate(${-lean} 0 0)`} /> : null}
          <path
            d={lv.x > 0 ? "M 120 -360 L 160 -360 L 160 40 L 100 40 Z" : "M -120 -360 L -160 -360 L -160 40 L -100 40 Z"}
            fill={rim}
            opacity={sil ? 0.9 : 0.55}
          />
        </g>
      </g>

      {/* шея */}
      <path d={neckPart.d} fill={neckPart.fill} />
      {!sil ? <path d={neckPart.d} fill="#020611" opacity={0.35} /> : null}

      {/* руки */}
      {arms.map((p, i) => (
        <path key={`a${i}`} d={p.d} fill={p.fill} />
      ))}
      {arms.map((p, i) => shade(p, `as${i}`))}

      {/* голова */}
      <g transform={headTf}>
        <path d="M -58 -4 C -72 -6 -72 30 -58 30 Z M 58 -4 C 72 -6 72 30 58 30 Z" fill={C(look.skin)} />
        <path d={HEAD} fill={C(look.skin)} />
        {!sil ? (
          <>
            {ex.has("stubble") ? (
              <path d="M -54 20 C -50 56 -20 76 0 76 C 20 76 50 56 54 20 C 30 40 -30 40 -54 20 Z" fill="#2A2420" opacity={0.42} />
            ) : null}
            {/* глаза */}
            <path d={`M ${-40 + fx} -8 Q ${-26 + fx} -20 ${-10 + fx} -8 Q ${-26 + fx} -1 ${-40 + fx} -8 Z`} fill={eyeWhite} />
            <path d={`M ${10 + fx} -8 Q ${26 + fx} -20 ${40 + fx} -8 Q ${26 + fx} -1 ${10 + fx} -8 Z`} fill={eyeWhite} />
            {!look.glowEyes && emotion !== "closed" ? (
              <>
                <circle cx={-24 + fx * 2} cy={-9} r={emotion === "fear" ? 4 : 6} fill={look.eyes ?? "#22262A"} />
                <circle cx={26 + fx * 2} cy={-9} r={emotion === "fear" ? 4 : 6} fill={look.eyes ?? "#22262A"} />
              </>
            ) : null}
            {emotion === "closed" ? (
              <path d={`M ${-40 + fx} -8 Q ${-26 + fx} -2 ${-10 + fx} -8 M ${10 + fx} -8 Q ${26 + fx} -2 ${40 + fx} -8`} stroke={look.eyes ?? "#22262A"} strokeWidth={4} fill={look.skin} />
            ) : null}
            {/* брови */}
            {look.hairStyle !== "none" ? (
              <path d={`${brow[0]} ${brow[1]}`} transform={`translate(${fx} 0)`} stroke={look.hair} strokeWidth={9} strokeLinecap="round" />
            ) : null}
            {/* нос, мешки под глазами */}
            <path d={`M ${fx} -4 L ${fx + 9} 28 L ${fx - 4} 32`} stroke="#3A2E28" strokeWidth={3} fill="none" opacity={0.6} />
            <path d={`M ${-38 + fx} 4 q 14 6 28 0 M ${12 + fx} 4 q 14 6 28 0`} stroke="#3A2E28" strokeWidth={2.5} fill="none" opacity={0.45} />
            <g transform={`translate(${fx} 0)`}>{mouth}</g>
            {ex.has("scar") ? (
              <>
                <path d="M -32 -48 L -18 22" stroke="#E7C6B6" strokeWidth={4.5} />
                <path d="M -32 -48 L -18 22" stroke="#7E4C42" strokeWidth={1.5} />
              </>
            ) : null}
            {ex.has("veins") ? (
              <path d="M -30 10 L -22 30 L -30 52 M 34 -2 L 26 24 L 36 48 M 0 -60 L 6 -40 L -2 -20" stroke="#7FD8FF" strokeWidth={3} fill="none" opacity={0.9} />
            ) : null}
          </>
        ) : null}
        {/* бельма стылых светятся и в силуэте */}
        {look.glowEyes ? (
          <>
            <ellipse cx={-24 + fx} cy={-8} rx={14} ry={9} fill="#F4FBFF" />
            <ellipse cx={26 + fx} cy={-8} rx={14} ry={9} fill="#F4FBFF" />
            <ellipse cx={fx} cy={-8} rx={60} ry={24} fill="#DDF6FF" opacity={0.25} filter={`url(#pglow-${uid})`} />
          </>
        ) : null}
        {look.hairStyle !== "none" ? <path d={HAIR[look.hairStyle]} fill={C(look.hair)} /> : null}
        {/* светотень головы */}
        <g clipPath={`url(#head-${uid})`}>
          <g transform={`rotate(${-(lean + (pose.head ?? 0))})`}>
            {!sil ? <rect x={-110} y={-130} width={220} height={240} fill={`url(#tshade-${uid})`} /> : null}
            <path d={lv.x > 0 ? "M 44 -130 L 110 -130 L 110 110 L 38 110 Z" : "M -44 -130 L -110 -130 L -110 110 L -38 110 Z"} fill={rim} opacity={sil ? 0.9 : 0.45} />
          </g>
        </g>
        {ex.has("earpiece") ? (
          <>
            <rect x={-74} y={-4} width={13} height={24} rx={4} fill="#2A2E33" />
            <circle cx={-67} cy={12} r={4} fill="#FF3B2F" opacity={0.5 + 0.5 * Math.sin(t * 4)} />
          </>
        ) : null}
        {ex.has("frost") && !sil ? <path d={HEAD} fill="#E9F8FF" opacity={0.18} /> : null}
      </g>

      {/* кристаллы стылого: из плеч и позвоночника */}
      {ex.has("crystals") ? (
        <g transform={torsoTf} fill={sil ? ICE : "#DDF6FF"} stroke={sil ? "none" : "#3E8FB8"} strokeWidth={3} opacity={sil ? 0.85 : 1}>
          <path d="M -120 -300 L -170 -420 L -100 -330 Z" />
          <path d="M -96 -316 L -112 -470 L -70 -330 Z" />
          <path d="M 96 -316 L 120 -460 L 74 -330 Z" />
          <path d="M 122 -300 L 186 -400 L 108 -326 Z" />
          <path d="M -20 -340 L 0 -420 L 20 -340 Z" />
        </g>
      ) : null}
      {ex.has("veins") && !sil ? (
        <g stroke="#7FD8FF" strokeWidth={3} fill="none" opacity={0.85}>
          <path d={`M ${shL.x} ${shL.y + 20} L ${elL.x + 6} ${elL.y} L ${wrL.x} ${wrL.y}`} />
          <path d={`M ${shR.x} ${shR.y + 20} L ${elR.x - 6} ${elR.y} L ${wrR.x} ${wrR.y}`} />
        </g>
      ) : null}
      {/* сосульки на руках статуи */}
      {ex.has("icicles") ? (
        <g fill="#EAF8FF" opacity={0.9}>
          {[elL, wrL, elR, wrR].map((p, i) => (
            <path key={i} d={`M ${p.x - 14} ${p.y + 18} L ${p.x - 6} ${p.y + 70} L ${p.x + 2} ${p.y + 18} Z M ${p.x + 6} ${p.y + 20} L ${p.x + 12} ${p.y + 50} L ${p.x + 18} ${p.y + 20} Z`} />
          ))}
          <path d={`M ${-60} ${-20} L -50 40 L -40 -20 Z M 30 -20 L 40 30 L 50 -20 Z`} transform={torsoTf} />
        </g>
      ) : null}
      {ex.has("frost") && !sil ? (
        <g opacity={0.5}>
          {[...legs, ...arms].map((p, i) => (
            <path key={i} d={p.d} fill="#F2FBFF" opacity={0.15} />
          ))}
        </g>
      ) : null}

      {/* термосканер на правом запястье */}
      {ex.has("scanner") ? (
        <g>
          <circle cx={wrR.x} cy={wrR.y} r={30} fill="#15181C" stroke={INK} strokeWidth={5} />
          <circle cx={wrR.x} cy={wrR.y} r={21} fill="#0B2A20" />
          <circle cx={wrR.x} cy={wrR.y} r={21} fill="none" stroke="#FF8A3D" strokeWidth={2} opacity={0.8} />
          <circle cx={wrR.x + 8} cy={wrR.y - 6} r={4} fill={ICE} />
          <circle cx={wrR.x} cy={wrR.y} r={70} fill="#FF8A3D" opacity={0.12} filter={`url(#pglow-${uid})`} />
        </g>
      ) : null}
      {/* планшет на левом запястье (Ева) */}
      {ex.has("tablet") ? (
        <g>
          <path d={capsule(add(wrL, v(pose.armL[1] + 180, 30)), wrL, 24)} fill="#1A1F25" stroke={INK} strokeWidth={4} />
          <path d={capsule(add(wrL, v(pose.armL[1] + 180, 26)), add(wrL, v(pose.armL[1] + 180, 4)), 15)} fill="#57D2E8" opacity={0.85} />
          <circle cx={wrL.x} cy={wrL.y} r={60} fill="#57D2E8" opacity={0.12} filter={`url(#pglow-${uid})`} />
        </g>
      ) : null}
    </g>
  );
};
