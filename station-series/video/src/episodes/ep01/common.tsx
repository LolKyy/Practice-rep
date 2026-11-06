import React from "react";
import { interpolate, useCurrentFrame, useVideoConfig } from "remotion";
import { FONTS } from "../../lib/theme";
import { HARON } from "../../components/HaronHUD";
import { safeTop } from "../../haron/layout";

// Общие элементы серий «ХАРОНА»: Марс, станция, звёзды, окно связи, капсулы, контейнер, заголовки.

export const Defs: React.FC<{ id: string }> = ({ id }) => (
  <defs>
    {[3, 6, 12, 24, 48].map((b) => (
      <filter key={b} id={`b${b}-${id}`} x="-60%" y="-60%" width="220%" height="220%">
        <feGaussianBlur stdDeviation={b} />
      </filter>
    ))}
    <radialGradient id={`vig-${id}`} cx="0.5" cy="0.45" r="0.78">
      <stop offset="0.5" stopColor="#000" stopOpacity="0" />
      <stop offset="1" stopColor="#000" stopOpacity="0.8" />
    </radialGradient>
  </defs>
);

export const Vignette: React.FC<{ id: string }> = ({ id }) => <rect width={1080} height={1920} fill={`url(#vig-${id})`} />;

/** Детерминированные звёзды. */
export const Stars: React.FC<{ n?: number; seed?: number; drift?: number }> = ({ n = 160, seed = 3, drift = 0 }) => {
  const frame = useCurrentFrame();
  const pts = Array.from({ length: n }, (_, i) => {
    const a = Math.sin(i * 12.9898 + seed) * 43758.5453;
    const b = Math.sin(i * 78.233 + seed) * 12345.6789;
    return { x: (a - Math.floor(a)) * 1080, y: (b - Math.floor(b)) * 1920, r: 0.8 + ((i * 7) % 3) * 0.7, tw: (i % 5) / 5 };
  });
  return (
    <g>
      {pts.map((p, i) => (
        <circle key={i} cx={(p.x + frame * drift * (0.3 + p.tw)) % 1080} cy={p.y} r={p.r} fill="#DCE8F2" opacity={0.35 + 0.5 * Math.abs(Math.sin(frame / 20 + i))} />
      ))}
    </g>
  );
};

/** Марс: ржавый шар с полосами пыли и кратерами. */
export const Mars: React.FC<{ cx: number; cy: number; r: number; id: string }> = ({ cx, cy, r, id }) => (
  <g>
    <defs>
      <radialGradient id={`mars-${id}`} cx="0.38" cy="0.32" r="0.75">
        <stop offset="0" stopColor="#E0703A" />
        <stop offset="0.55" stopColor="#A9421F" />
        <stop offset="1" stopColor="#3A140A" />
      </radialGradient>
      <clipPath id={`marsclip-${id}`}>
        <circle cx={cx} cy={cy} r={r} />
      </clipPath>
    </defs>
    <circle cx={cx} cy={cy} r={r * 1.04} fill="#FF7A3A" opacity={0.18} filter={`url(#b24-${id})`} />
    <circle cx={cx} cy={cy} r={r} fill={`url(#mars-${id})`} />
    <g clipPath={`url(#marsclip-${id})`} opacity={0.5}>
      {[-0.5, -0.2, 0.15, 0.45].map((k, i) => (
        <ellipse key={i} cx={cx + r * 0.1} cy={cy + k * r} rx={r * 1.2} ry={r * 0.06} fill={i % 2 ? "#7A2A12" : "#C9643A"} />
      ))}
      {[
        [-0.3, -0.2, 0.08],
        [0.25, 0.1, 0.05],
        [-0.1, 0.35, 0.06],
        [0.4, -0.35, 0.04],
      ].map(([x, y, rr], i) => (
        <circle key={i} cx={cx + x * r} cy={cy + y * r} r={rr * r} fill="#5A200E" opacity={0.7} />
      ))}
      <circle cx={cx + r * 0.35} cy={cy + r * 0.3} r={r} fill="#000" opacity={0.45} />
    </g>
  </g>
);

/** «Харон-7»: кольцо с башнями, дым из бока, красные огни. */
export const Station: React.FC<{ cx: number; cy: number; s: number; id: string; smoke?: boolean }> = ({ cx, cy, s, id, smoke = true }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const t = frame / fps;
  const blink = Math.sin(t * 6) > 0 ? 1 : 0.2;
  return (
    <g transform={`translate(${cx} ${cy}) scale(${s})`}>
      {smoke
        ? [0, 1, 2, 3, 4].map((i) => (
            <ellipse key={i} cx={150 + i * 50 + t * 12 * i} cy={-30 - i * 40 - t * 8 * i} rx={40 + i * 26} ry={26 + i * 16} fill="#3A3436" opacity={0.55 - i * 0.08} filter={`url(#b12-${id})`} />
          ))
        : null}
      {/* кольцо */}
      <ellipse cx={0} cy={0} rx={300} ry={110} fill="none" stroke="#050608" strokeWidth={70} />
      <ellipse cx={0} cy={0} rx={300} ry={110} fill="none" stroke="#5A6672" strokeWidth={54} />
      <ellipse cx={0} cy={-8} rx={300} ry={110} fill="none" stroke="#8C9AA6" strokeWidth={10} opacity={0.6} />
      {/* спицы */}
      {[0, 60, 120].map((a) => (
        <line key={a} x1={-300 * Math.cos((a * Math.PI) / 180)} y1={-110 * Math.sin((a * Math.PI) / 180)} x2={300 * Math.cos((a * Math.PI) / 180)} y2={110 * Math.sin((a * Math.PI) / 180)} stroke="#3A444E" strokeWidth={14} />
      ))}
      {/* центральная башня */}
      <path d="M -40 -230 L 40 -230 L 56 60 L -56 60 Z" fill="#46525E" stroke="#050608" strokeWidth={8} />
      <rect x={-70} y={-120} width={140} height={60} fill="#3A444E" stroke="#050608" strokeWidth={6} />
      <path d="M -10 -300 L 10 -300 L 6 -230 L -6 -230 Z" fill="#46525E" stroke="#050608" strokeWidth={5} />
      {/* башни на кольце */}
      {[-230, -110, 120, 240].map((x, i) => (
        <rect key={i} x={x - 14} y={-150 + Math.abs(x) * 0.25} width={28} height={80} fill="#4C5864" stroke="#050608" strokeWidth={5} />
      ))}
      {/* пробоина */}
      <path d="M 210 -40 L 250 -70 L 270 -20 L 240 10 Z" fill="#0A0A0C" />
      <circle cx={245} cy={-30} r={22} fill="#FF7A2A" opacity={0.6} filter={`url(#b6-${id})`} />
      {/* красные огни */}
      {[
        [-300, 0],
        [300, 0],
        [0, -300],
        [-150, 95],
        [150, 95],
        [0, 110],
      ].map(([x, y], i) => (
        <circle key={i} cx={x} cy={y} r={8} fill={HARON.red} opacity={i % 2 ? blink : 1.2 - blink} />
      ))}
    </g>
  );
};

/** Окно связи с Хорунжим: силуэт с погоном, волна голоса. */
export const CommLink: React.FC<{ speaking: boolean; x?: number; y?: number; label?: string }> = ({ speaking, x = 60, y = 1030, label = "ХОРУНЖИЙ • СВЯЗЬ" }) => {
  const frame = useCurrentFrame();
  return (
    <div
      style={{
        position: "absolute",
        left: x,
        top: y,
        width: 400,
        height: 120,
        background: "rgba(6,10,16,0.88)",
        border: `3px solid ${speaking ? HARON.warm : "#1F2A36"}`,
        borderRadius: 14,
        display: "flex",
        alignItems: "center",
        gap: 14,
        padding: "0 14px",
      }}
    >
      <svg width={90} height={96}>
        <rect width={90} height={96} rx={8} fill="#0B1420" />
        <circle cx={45} cy={38} r={20} fill="#05070A" />
        <path d="M 8 96 C 10 66 26 60 45 60 C 64 60 80 66 82 96 Z" fill="#05070A" />
        <rect x={10} y={66} width={22} height={7} fill="#C9A23A" />
        <rect x={58} y={66} width={22} height={7} fill="#C9A23A" />
        {Array.from({ length: 6 }, (_, i) => (
          <rect key={i} x={0} y={i * 16 + ((frame * 2) % 16)} width={90} height={2} fill="#9FE3FF" opacity={0.08} />
        ))}
      </svg>
      <div style={{ flex: 1 }}>
        <div style={{ fontFamily: FONTS.mono, fontWeight: 700, fontSize: 20, color: speaking ? HARON.warm : "#6F8293", letterSpacing: 2 }}>{label}</div>
        <div style={{ display: "flex", alignItems: "center", gap: 3, height: 50, marginTop: 6 }}>
          {Array.from({ length: 22 }, (_, i) => {
            const a = speaking ? 0.2 + 0.8 * Math.abs(Math.sin(frame * 0.45 + i * 1.7) * Math.sin(frame * 0.17 + i)) : 0.06;
            return <div key={i} style={{ flex: 1, height: `${a * 100}%`, background: speaking ? HARON.warm : "#2A3846", borderRadius: 2 }} />;
          })}
        </div>
      </div>
    </div>
  );
};

/** Крупный титр «ЧАС НАЗАД» и т.п. */
export const TitleCard: React.FC<{ text: string; sub?: string; from?: number; to?: number }> = ({ text, sub, from = 0, to = 1.4 }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const t = frame / fps;
  const op = interpolate(t, [from, from + 0.15, to - 0.25, to], [0, 1, 1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  if (op <= 0) return null;
  return (
    <div style={{ position: "absolute", left: 0, right: 0, top: 820, textAlign: "center", opacity: op }}>
      <div style={{ fontFamily: FONTS.mono, fontWeight: 700, fontSize: 84, color: HARON.white, letterSpacing: 10, textShadow: "0 0 30px rgba(0,0,0,0.9)" }}>{text}</div>
      {sub ? <div style={{ fontFamily: FONTS.mono, fontWeight: 700, fontSize: 30, color: "#8A9AA8", letterSpacing: 4, marginTop: 10 }}>{sub}</div> : null}
    </div>
  );
};

/** Плашка-надпись (системная/информационная). */
export const Plate: React.FC<{ lines: string[]; top: number; color?: string; from?: number; size?: number; border?: string; left?: number; right?: number }> = ({
  lines,
  top: topWanted,
  color = HARON.white,
  from = 0,
  size = 34,
  border = "#1F2A36",
  left = 60,
  right = 60,
}) => {
  // страховка от наложений: плашка не может встать на окно связи / субтитры
  const top = safeTop(topWanted, 34 + size * 1.3 + (lines.length - 1) * size * 0.94);
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const t = frame / fps - from;
  if (t < 0) return null;
  const op = interpolate(t, [0, 0.2], [0, 1], { extrapolateRight: "clamp" });
  return (
    <div style={{ position: "absolute", left, right, top, opacity: op, translate: `0px ${(1 - op) * 14}px`, background: "rgba(6,10,16,0.88)", border: `3px solid ${border}`, borderRadius: 12, padding: "14px 22px" }}>
      {lines.map((l, i) => (
        <div key={i} style={{ fontFamily: FONTS.mono, fontWeight: 700, fontSize: i === 0 ? size : size * 0.72, color: i === 0 ? color : "#9AAAB8", letterSpacing: 2, lineHeight: 1.3 }}>
          {l}
        </div>
      ))}
    </div>
  );
};

/** Криокапсула (вид спереди). lid 0..1 — насколько открыта. */
export const Pod: React.FC<{ x: number; y: number; s: number; lid?: number; frosted?: boolean; glow?: string }> = ({ x, y, s, lid = 0, frosted = false, glow = HARON.ice }) => (
  <g transform={`translate(${x} ${y}) scale(${s})`}>
    <rect x={-130} y={-20} width={260} height={640} rx={130} fill="#1A2638" stroke="#050608" strokeWidth={10} />
    <rect x={-110} y={0} width={220} height={600} rx={110} fill="#0B1A28" />
    <ellipse cx={0} cy={180} rx={42} ry={54} fill="#12283A" />
    <g transform={`translate(0 ${-lid * 520})`} opacity={1 - lid * 0.5}>
      <rect x={-110} y={0} width={220} height={600} rx={110} fill={frosted ? "#CBE9F7" : "#5FA9C9"} opacity={frosted ? 0.85 : 0.35} />
      <path d="M -70 60 C -60 30 -30 14 10 10" stroke="#FFFFFF" strokeWidth={10} fill="none" opacity={0.4} strokeLinecap="round" />
    </g>
    <rect x={-60} y={608} width={120} height={14} fill={glow} opacity={0.8} />
  </g>
);

/** Контейнер снабжения «ПАЁК». */
export const Container: React.FC<{ x: number; y: number; s: number; lidOpen?: number }> = ({ x, y, s, lidOpen = 0 }) => (
  <g transform={`translate(${x} ${y}) scale(${s})`}>
    <rect x={-260} y={-300} width={520} height={600} rx={18} fill="#4A4F45" stroke="#050608" strokeWidth={12} />
    {[-180, -60, 60, 180].map((xx) => (
      <rect key={xx} x={xx - 8} y={-290} width={16} height={580} fill="#3A3E36" />
    ))}
    <rect x={-260} y={-60} width={520} height={60} fill="#C9962A" />
    {Array.from({ length: 9 }, (_, i) => (
      <path key={i} d={`M ${-260 + i * 60} -60 l 30 0 l -30 60 l -30 0 Z`} fill="#141210" />
    ))}
    <text x={0} y={-150} textAnchor="middle" fontFamily="Oswald" fontWeight={700} fontSize={110} fill="#D9D2B8" letterSpacing={8}>
      ПАЁК
    </text>
    <text x={0} y={120} textAnchor="middle" fontFamily="JetBrains Mono" fontWeight={700} fontSize={40} fill="#BDB59A">
      400 КГ • ХАРОН-7
    </text>
    <text x={0} y={180} textAnchor="middle" fontFamily="JetBrains Mono" fontWeight={700} fontSize={30} fill="#8E8770">
      ПЛАНОВОЕ СНАБЖЕНИЕ
    </text>
    <g transform={`translate(-260 -300) rotate(${-lidOpen * 70})`}>
      <rect x={0} y={-24} width={520} height={30} fill="#5A6052" stroke="#050608" strokeWidth={8} />
    </g>
  </g>
);

/** Коридор шлюзовой палубы (восьмигранные рамы в перспективе). */
export const DockCorridor: React.FC<{ id: string; flick?: number }> = ({ id, flick = 1 }) => {
  const VP = { x: 540, y: 900 };
  return (
    <g>
      <rect width={1080} height={1920} fill="#0A111D" />
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
            <rect x={VP.x - 50 * s} y={y0 - 8 * s} width={100 * s} height={16 * s} fill={k === 1 ? HARON.red : "#DDEFF8"} opacity={k === 1 ? 0.9 : 0.5 * flick} />
          </g>
        );
      })}
      <polygon points={`${VP.x - 300},1200 ${VP.x + 300},1200 1300,1920 -220,1920`} fill="#070C14" opacity={0.6} />
      <g stroke={HARON.ice} fill="none" strokeLinecap="round" opacity={0.7}>
        <path d="M 540 1150 C 520 1250 470 1330 420 1420 C 380 1490 330 1540 300 1640" strokeWidth={4} />
        <path d="M 560 1180 C 640 1260 700 1300 760 1400" strokeWidth={3} />
      </g>
      <Vignette id={id} />
    </g>
  );
};

/** Пар изо рта (над точкой x,y). */
export const Breath: React.FC<{ x: number; y: number; id: string; period?: number }> = ({ x, y, id, period = 2.4 }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const ph = ((frame / fps) % period) / period;
  if (ph > 0.6) return null;
  const k = ph / 0.6;
  return <ellipse cx={x + k * 40} cy={y - k * 50} rx={20 + k * 50} ry={10 + k * 22} fill="#EAF6FF" opacity={0.45 * (1 - k)} filter={`url(#b6-${id})`} />;
};
