import React from "react";
import { AbsoluteFill, Easing, interpolate, interpolateColors, useCurrentFrame, useVideoConfig } from "remotion";
import { Person, LOOKS } from "../../rig/Person";
import { HaronHUD, HARON, ScanDot } from "../../components/HaronHUD";
import { Callout } from "../../components/Callout";
import { FONTS } from "../../lib/theme";
import { ZONES } from "../../haron/layout";
import { Breath, Defs, Vignette } from "../ep01/common";
import { Cam } from "../ep01/scenes";
import { PodHall } from "../ep02/scenes";

// «ХАРОН», серия 3 «БРАТЬЯ». Новый формат: ведёт рассказчик, плашки-заголовки к планам, спокойные субтитры,
// общий план на каждую локацию, мягкая камера (проезды, параллакс, перевод между героями).

export type SceneLine = { id: string; role: string; start: number; end: number };
export type SceneProps = { dur: number; lines: SceneLine[] };

const C = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;
const useT = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  return frame / fps;
};
const L = (lines: SceneLine[], id: string) => lines.find((l) => l.id === id) ?? { id, role: "", start: 0, end: 0 };
const fadeIn = (t: number, d = 0.2) => interpolate(t, [0, d], [0, 1], C);
const ease = { ...C, easing: Easing.inOut(Easing.sin) };

/** Маленькая плашка-заголовок к плану (как в референсе): понятна без звука. */
export const ShotLabel: React.FC<{ text: string; from?: number; color?: string }> = ({ text, from = 0, color = "#9AAAB8" }) => {
  const t = useT() - from;
  if (t < 0) return null;
  const op = interpolate(t, [0, 0.3], [0, 1], C);
  return (
    <div style={{ position: "absolute", left: 0, right: 0, top: ZONES.content.top, textAlign: "center", opacity: op }}>
      <span style={{ fontFamily: FONTS.mono, fontWeight: 700, fontSize: 28, letterSpacing: 6, color, background: "rgba(4,8,14,0.7)", padding: "6px 16px", borderRadius: 6 }}>{text}</span>
    </div>
  );
};

const HUD3: React.FC<{ fall: number; deck: 2 | 3; temp?: number; dots: ScanDot[]; label: string; detectAt?: number; frost?: number; dim?: boolean }> = ({ fall, deck, temp = -12, dots, label, detectAt, frost = 0.3, dim }) => (
  <HaronHUD fallSeconds={fall} oxygen={67} temp={temp} deck={deck} dots={dots} scanLabel={label} detectAt={detectAt} frost={frost} dim={dim} />
);

/** Самодельный обогреватель: спираль светится оранжевым. */
const Heater: React.FC<{ x: number; y: number; s?: number; id: string; t: number }> = ({ x, y, s = 1, id, t }) => (
  <g transform={`translate(${x} ${y}) scale(${s})`}>
    <circle r={150} fill="#FF8A3D" opacity={0.22 + 0.05 * Math.sin(t * 7 + x)} filter={`url(#b24-${id})`} />
    <rect x={-50} y={-40} width={100} height={110} rx={10} fill="#2A2420" stroke="#050608" strokeWidth={6} />
    {[0, 1, 2, 3].map((i) => (
      <path key={i} d={`M -36 ${-24 + i * 22} q 18 -10 36 0 q 18 10 36 0`} stroke="#FFB45A" strokeWidth={6} fill="none" />
    ))}
  </g>
);

/* ============================ 1. ХУК: точка на сканере синеет ============================ */
export const SHook3: React.FC<SceneProps> = ({ dur, lines }) => {
  const t = useT();
  const id = "h3";
  const l1 = L(lines, "01");
  const k = interpolate(t, [l1.start + 1.8, l1.start + 3.6], [0, 1], C);
  const col = interpolateColors(k, [0, 1], [HARON.warm, HARON.ice]);
  const sweep = (t * 140) % 360;
  return (
    <AbsoluteFill style={{ background: "#03070C" }}>
      <Cam dur={dur} z0={1.0} z1={1.12} y0={900} y1={880}>
        <svg width={1080} height={1920}>
          <Defs id={id} />
          <rect width={1080} height={1920} fill="#03070C" />
          <g transform="translate(540 900)">
            <circle r={400} fill="#04110C" stroke="#2C4A3C" strokeWidth={10} />
            {[0.33, 0.66].map((r) => (
              <circle key={r} r={400 * r} fill="none" stroke="#1F3A2E" strokeWidth={5} />
            ))}
            <path d="M 0 -400 L 0 400 M -400 0 L 400 0" stroke="#1F3A2E" strokeWidth={5} />
            <path d={`M 0 0 L 0 -400 A 400 400 0 0 1 ${400 * Math.sin(0.6)} ${-400 * Math.cos(0.6)} Z`} fill="#FF8A3D" opacity={0.22} transform={`rotate(${sweep})`} />
            <path d="M 0 -26 L 20 20 L 0 8 L -20 20 Z" fill="#F2F6F8" />
            {/* брат-стылый — голубая точка, вплотную к Рыжему */}
            <circle cx={150} cy={-60} r={22} fill={HARON.ice} />
            {/* Рыжий: оранжевая → голубая */}
            <circle cx={185} cy={-40} r={46 + 10 * Math.sin(t * 6)} fill={col} opacity={0.3} />
            <circle cx={185} cy={-40} r={28} fill={col} />
          </g>
          <text x={540} y={1400} textAnchor="middle" fontFamily="JetBrains Mono" fontWeight={700} fontSize={40} fill={col}>
            {k < 0.5 ? "РЫЖИЙ • 36,4°" : `РЫЖИЙ • ${Math.round(36 - k * 40)}°`}
          </text>
          <Vignette id={id} />
        </svg>
      </Cam>
      <HUD3 fall={10 * 3600 + 12 * 60} deck={2} temp={-30} dots={[{ angle: 112, dist: 0.4, kind: k > 0.5 ? "cold" : "warm" }, { angle: 108, dist: 0.38, kind: "cold" }]} label={k > 0.5 ? "СТЫЛЫХ: 2 • 3 м" : "СТЫЛЫЙ — 3 м"} frost={0.8} />
      <ShotLabel text="ТЕРМОСКАНЕР" />
    </AbsoluteFill>
  );
};

/* ============================ 2. КАК ОНИ УБИВАЮТ: тепло уходит ============================ */
export const SDrain: React.FC<SceneProps> = ({ dur, lines }) => {
  const t = useT();
  const id = "dr";
  const l2 = L(lines, "02");
  const freeze = interpolate(t, [l2.start + 0.8, l2.start + 4.2], [0, 1], { ...C, easing: Easing.in(Easing.quad) });
  const temp = Math.round(36 - freeze * 40);
  return (
    <AbsoluteFill style={{ background: "#000", opacity: fadeIn(t, 0.15) }}>
      <Cam dur={dur} z0={1.0} z1={1.14} x0={540} x1={600} y0={960} y1={860}>
        <svg width={1080} height={1920}>
          <Defs id={id} />
          <PodHall id={id} t={t} />
          <ellipse cx={620} cy={1000} rx={420} ry={620} fill={HARON.ice} opacity={0.12 + 0.18 * freeze} filter={`url(#b48-${id})`} />
          {/* Рыжий: тёплый слой гаснет, ледяной проявляется */}
          <g opacity={1 - freeze}>
            <Person uid="dr-r" x={520} ground={1660} scale={0.95} look={LOOKS.ryzhy} emotion="fear" facing={1} light={{ x: 1, y: -0.3 }} rim={HARON.ice} pose={{ armL: [-20, -40], armR: [20, 40], legL: [-10, 0], legR: [12, 2], lean: 6, head: 8 }} t={t} />
          </g>
          <g opacity={freeze}>
            <Person uid="dr-rf" x={520} ground={1660} scale={0.95} look={LOOKS.ryzhyFrozen} emotion="closed" facing={1} light={{ x: 1, y: -0.3 }} rim="#FFFFFF" pose={{ armL: [-20, -40], armR: [20, 40], legL: [-10, 0], legR: [12, 2], lean: 6, head: 8 }} t={t} />
          </g>
          {/* брат обнимает: стылый со спины-сбоку, руки обхватывают */}
          <Person uid="dr-s" x={760} ground={1680} scale={0.98} look={LOOKS.stylyy} facing={-1} light={{ x: -1, y: -0.5 }} rim="#FFFFFF" pose={{ armL: [-100, -80], armR: [-60, -100], legL: [-8, 0], legR: [10, 2], lean: -14, head: -12 }} t={t} />
          {/* иней ползёт от рук брата */}
          {Array.from({ length: 10 }, (_, i) => (
            <path key={i} d={`M ${640 - i * 14} ${900 + i * 30} l ${-40 - i * 8} ${-20 + i * 6}`} stroke="#EAF8FF" strokeWidth={4} opacity={freeze} strokeLinecap="round" />
          ))}
          <Vignette id={id} />
        </svg>
      </Cam>
      {/* шкала температуры тела — визуальное объяснение */}
      <div style={{ position: "absolute", left: 410, right: 370, top: 310, background: "rgba(4,8,14,0.85)", border: `3px solid ${freeze > 0.5 ? HARON.ice : HARON.warm}`, borderRadius: 12, padding: "10px 18px", fontFamily: FONTS.mono, fontWeight: 700, color: HARON.white }}>
        <div style={{ fontSize: 22, letterSpacing: 3, color: "#8A9AA8" }}>ТЕМП. ТЕЛА • РЫЖИЙ</div>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <div style={{ fontSize: 48, color: interpolateColors(freeze, [0, 1], [HARON.warm, HARON.ice]), width: 160 }}>{temp > 0 ? "+" : temp < 0 ? "−" : ""}{Math.abs(temp)}°</div>
          <div style={{ flex: 1, height: 16, background: "#1D2630", borderRadius: 4, overflow: "hidden" }}>
            <div style={{ width: `${(1 - freeze) * 100}%`, height: "100%", background: interpolateColors(freeze, [0, 1], [HARON.warm, HARON.ice]) }} />
          </div>
        </div>
      </div>
      <HUD3 fall={10 * 3600 + 11 * 30} deck={2} temp={-30} dots={[{ angle: 112, dist: 0.4, kind: "cold" }, { angle: 108, dist: 0.38, kind: "cold" }]} label="СТЫЛЫХ: 2 • 3 м" frost={0.85} dim />
    </AbsoluteFill>
  );
};

/* ============================ 3. БЕГ: общий план зала, проезд, параллакс ============================ */
export const SRun: React.FC<SceneProps> = ({ dur }) => {
  const t = useT();
  const id = "rn";
  const p = interpolate(t, [0, dur], [0, 1], ease);
  const run = Math.sin(t * 9);
  return (
    <AbsoluteFill style={{ background: "#000", opacity: fadeIn(t, 0.12) }}>
      <Cam dur={dur} z0={0.92} z1={1.08} x0={480} x1={600} y0={980} y1={920}>
        <svg width={1080} height={1920}>
          <Defs id={id} />
          <PodHall id={id} t={t} />
          {/* стылый вдали идёт следом */}
          <ellipse cx={540} cy={860} rx={90} ry={150} fill={HARON.ice} opacity={0.18} filter={`url(#b24-${id})`} />
          <Person uid="rn-s" x={540} ground={980 + p * 60} scale={0.24 + p * 0.06} mode="sil" look={LOOKS.stylyy} light={{ x: 0, y: -1 }} rim={HARON.ice} pose={{ armL: [-20, -10], armR: [20, 10], legL: [-12 + 12 * Math.sin(t * 4), 0], legR: [12 - 12 * Math.sin(t * 4), 0], lean: 8, head: 16 }} t={t} />
          {/* Глеб бежит на камеру */}
          <Person uid="rn-g" x={500 + Math.sin(t * 2) * 30} ground={1560 + p * 160} scale={0.75 + p * 0.3} look={LOOKS.gleb} emotion="fear" facing={1} light={{ x: 0.3, y: -1 }} rim="#7FB8FF" pose={{ armL: [-40 * run, -60 * run], armR: [40 * run, 60 * run], legL: [-30 * run, 20], legR: [30 * run, -20], lean: 6, head: 6 }} item="crowbar" itemAngle={-60} t={t} />
          {/* передний план: капсулы проносятся мимо (параллакс) */}
          {[0, 1].map((i) => (
            <rect key={i} x={((i * 900 - t * 520) % 1800) + 900} y={300} width={220} height={1500} rx={110} fill="#05090F" stroke="#0E1A2A" strokeWidth={10} opacity={0.92} />
          ))}
          <Vignette id={id} />
        </svg>
      </Cam>
      <HUD3 fall={10 * 3600 + 5 * 60} deck={2} temp={-20} dots={[{ angle: 180, dist: 0.5 - p * 0.15, kind: "cold" }]} label={`СТЫЛЫЙ — ${Math.round(8 - p * 3)} м`} frost={0.55} />
      <ShotLabel text="ПАЛУБА 2 • БЛОК КАПСУЛ" />
    </AbsoluteFill>
  );
};

/* ============================ 4. НОЖ: проверка на тепло ============================ */
export const SKnife: React.FC<SceneProps> = ({ dur, lines }) => {
  const t = useT();
  const id = "kn";
  const l5 = L(lines, "05");
  const grab = interpolate(t, [l5.start - 0.3, l5.start + 0.1], [0, 1], C);
  const doors = interpolate(t, [0, 0.5], [0, 1], C);
  return (
    <AbsoluteFill style={{ background: "#000" }}>
      <Cam dur={dur} z0={1.0} z1={1.08} y0={860} y1={820} shake={t > l5.start - 0.3 && t < l5.start ? 12 : 0}>
        <svg width={1080} height={1920}>
          <Defs id={id} />
          <rect width={1080} height={1920} fill="#07090C" />
          {/* створки лифта открываются — тёплый свет */}
          <rect x={300} y={300} width={480} height={1400} fill="#FF8A3D" opacity={0.08 + 0.12 * doors} filter={`url(#b24-${id})`} />
          <rect x={300 - doors * 260} y={300} width={240} height={1400} fill="#0E141B" stroke="#050608" strokeWidth={8} />
          <rect x={540 + doors * 260} y={300} width={240} height={1400} fill="#0E141B" stroke="#050608" strokeWidth={8} />
          <Person uid="kn-g" x={540} ground={2700} scale={2.3} look={LOOKS.gleb} emotion={grab > 0.5 ? "tense" : "fear"} facing={1} light={{ x: 1, y: -0.4 }} rim="#FFB07A" pose={{ armL: [10, 20], armR: [-10, -20], legL: [0, 0], legR: [0, 0], head: -10 * grab }} t={t} />
          {/* нож у горла (рука из-за кадра справа) */}
          <g transform={`translate(${1180 - grab * 360} 860) rotate(-8)`}>
            <path d="M 0 0 L 360 -20 L 380 30 L 0 40 Z" fill="#C8642E" stroke="#050608" strokeWidth={10} />
            <path d="M -10 -6 L -230 10 L -10 34 Z" fill="#C9D3DB" stroke="#050608" strokeWidth={6} />
            <path d="M -40 2 L -200 14" stroke="#FFFFFF" strokeWidth={4} opacity={0.7} />
          </g>
          <Vignette id={id} />
        </svg>
      </Cam>
      <HUD3 fall={10 * 3600 + 1 * 60} deck={3} temp={8} dots={[{ angle: 90, dist: 0.05, kind: "warm" }, { angle: 60, dist: 0.3, kind: "warm" }, { angle: 120, dist: 0.35, kind: "warm" }]} label="ТЁПЛЫХ: 3 • ВПЛОТНУЮ" frost={0} />
      <ShotLabel text="ПРОВЕРКА НА ТЕПЛО" from={l5.start + 1.2} color={HARON.warm} />
    </AbsoluteFill>
  );
};

/** Столовая: общий план (баррикады, обогреватели, 40 человек, правило 5 над входом). */
const Canteen: React.FC<{ id: string; t: number; crowd?: boolean }> = ({ id, t, crowd = true }) => (
  <g>
    <rect width={1080} height={1920} fill="#0C0D10" />
    <ellipse cx={540} cy={1000} rx={800} ry={600} fill="#FF8A3D" opacity={0.08} filter={`url(#b48-${id})`} />
    {/* дальняя стена, окна раздачи */}
    <rect x={0} y={300} width={1080} height={700} fill="#14161B" />
    {[0, 1, 2, 3].map((i) => (
      <rect key={i} x={60 + i * 260} y={560} width={220} height={140} fill="#0A0B0E" stroke="#262A31" strokeWidth={6} />
    ))}
    {/* правило 5 — краской над входом */}
    <g transform="rotate(-2 540 780)">
      <text x={540} y={800} textAnchor="middle" fontFamily="Oswald" fontWeight={700} fontSize={50} fill={HARON.red} opacity={0.88} letterSpacing={2}>
        5. НЕ ПОЖИМАЙ ХОЛОДНУЮ РУКУ
      </text>
      <path d="M 200 812 L 880 816" stroke={HARON.red} strokeWidth={4} opacity={0.5} />
    </g>
    {/* пол и баррикады из столов */}
    <rect x={0} y={1000} width={1080} height={920} fill="#0A0B0D" />
    {[0, 1, 2, 3, 4].map((i) => (
      <path key={i} d={`M ${-40 + i * 240} 1010 l 200 0 l -30 80 l -200 0 Z`} fill="#22262C" stroke="#050608" strokeWidth={6} transform={`rotate(${(i % 2 ? 6 : -5)} ${60 + i * 240} 1040)`} />
    ))}
    {/* обогреватели и люди вокруг — силуэты с тёплым контуром */}
    {[
      [220, 1300],
      [540, 1240],
      [860, 1320],
    ].map(([x, y], hi) => (
      <g key={hi}>
        <Heater x={x} y={y} id={id} t={t} s={0.9} />
        {crowd
          ? [-130, -60, 60, 130].map((dx, i) => (
              <Person key={i} uid={`cw${hi}${i}`} x={x + dx} ground={y + 120 + (i % 2) * 20} scale={0.36} mode="sil" look={LOOKS.ryzhy} facing={dx < 0 ? 1 : -1} light={{ x: dx < 0 ? 1 : -1, y: 0 }} rim="#FF8A3D" pose={{ armL: [40, 120], armR: [-40, -120], legL: [-70, 10], legR: [70, -10], lean: dx < 0 ? 8 : -8, head: 10 }} t={t} />
            ))
          : null}
      </g>
    ))}
  </g>
);

/* ============================ 5. СТОЛОВАЯ — общий план ============================ */
export const SCanteen: React.FC<SceneProps> = ({ dur }) => {
  const t = useT();
  const id = "cn";
  return (
    <AbsoluteFill style={{ background: "#000", opacity: fadeIn(t) }}>
      <Cam dur={dur} z0={1.12} z1={1.0} x0={420} x1={620} y0={900} y1={960}>
        <svg width={1080} height={1920}>
          <Defs id={id} />
          <Canteen id={id} t={t} />
          <Vignette id={id} />
        </svg>
      </Cam>
      <HUD3 fall={9 * 3600 + 58 * 60} deck={3} temp={6} dots={[0, 40, 80, 120, 160, 200, 240, 280, 320].map((a, i) => ({ angle: a, dist: 0.3 + (i % 3) * 0.2, kind: "warm" as const }))} label="ТЁПЛЫХ: 40" frost={0} dim />
      <ShotLabel text="ПАЛУБА 3 • СТОЛОВАЯ" />
    </AbsoluteFill>
  );
};

/* ============================ 6. ВАДИМ ============================ */
export const SVadim: React.FC<SceneProps> = ({ dur, lines }) => {
  const t = useT();
  const id = "vd";
  const l10 = L(lines, "10");
  const l11 = L(lines, "11");
  // камера переходит к говорящему: Вадим (справа) → Глеб (слева) на реплике рассказчика про Еву
  const toVadim = interpolate(t, [l10.start - 0.6, l10.start + 0.4], [0, 1], ease);
  const toGleb = interpolate(t, [l11.start - 0.2, l11.start + 0.8], [0, 1], ease);
  const cx = 540 + 90 * toVadim - 180 * toGleb;
  return (
    <AbsoluteFill style={{ background: "#000", opacity: fadeIn(t) }}>
      <Cam dur={dur} z0={1.0} z1={1.12} x0={cx} x1={cx} y0={880} y1={860}>
        <svg width={1080} height={1920}>
          <Defs id={id} />
          <Canteen id={id} t={t} crowd={false} />
          <rect width={1080} height={1920} fill="#000" opacity={0.25} />
          <Person uid="vd-v" x={760} ground={1760} scale={1.05} look={LOOKS.vadim} emotion="neutral" facing={-1} light={{ x: -1, y: -0.4 }} rim="#FFB07A" pose={{ armL: [-20, -60], armR: [10, 30], legL: [-8, 0], legR: [10, 2], head: -4 }} t={t} />
          <Person uid="vd-g" x={250} ground={1740} scale={0.98} look={LOOKS.gleb} emotion="tense" facing={1} light={{ x: 1, y: -0.4 }} rim="#FFB07A" pose={{ armL: [10, 4], armR: [-10, -20], legL: [-6, -2], legR: [10, 4], head: 6 }} t={t} />
          <Vignette id={id} />
        </svg>
      </Cam>
      <HUD3 fall={9 * 3600 + 50 * 60} deck={3} temp={6} dots={[{ angle: 90, dist: 0.15, kind: "warm" }, { angle: 30, dist: 0.5, kind: "warm" }, { angle: 300, dist: 0.6, kind: "warm" }]} label="ТЁПЛЫХ: 40" frost={0} dim />
      <Callout targetX={770} targetY={600} title="ВАДИМ КРЕЧЕТ, 45" subtitle="ГЛАВАРЬ БУНТА" side="left" dx={140} dy={150} delay={0.4} accent={HARON.warm} />
      {t > l11.start ? <ShotLabel text="ЕВА УШЛА ВНИЗ • В ЛАБОРАТОРИИ" from={l11.start} color={HARON.ice} /> : null}
    </AbsoluteFill>
  );
};

/* ============================ 7. СДЕЛКА: схема станции ============================ */
export const SDeal: React.FC<SceneProps> = ({ dur }) => {
  const t = useT();
  const id = "dl";
  const p = interpolate(t, [0, dur], [0, 1], ease);
  const decks = ["1 • СТЫКОВКА", "2 • КАПСУЛЫ", "3 • ЖИЛОЙ / СТОЛОВАЯ", "4 • МЕДБЛОК / ЛАБ.", "5 • БЛОК 0 / РЕАКТОР"];
  return (
    <AbsoluteFill style={{ background: "#000", opacity: fadeIn(t) }}>
      {/* камера едет по схеме сверху вниз — по пути, которым им идти */}
      <Cam dur={dur} z0={1.18} z1={1.05} x0={540} x1={540} y0={700} y1={1050}>
        <svg width={1080} height={1920}>
          <Defs id={id} />
          <rect width={1080} height={1920} fill="#14161B" />
          <rect x={120} y={360} width={840} height={1260} fill="#1E2A2E" stroke="#050608" strokeWidth={10} />
          <rect x={120} y={360} width={840} height={1260} fill="#3A6E8F" opacity={0.08} />
          {decks.map((d, i) => {
            const y = 420 + i * 236;
            const here = i === 2;
            const zero = i === 4;
            return (
              <g key={d}>
                <rect x={170} y={y} width={740} height={190} rx={10} fill={zero ? "#2A1414" : "#16222A"} stroke={here ? HARON.warm : "#3A4E5E"} strokeWidth={6} />
                <text x={200} y={y + 60} fontFamily="JetBrains Mono" fontWeight={700} fontSize={36} fill={zero ? HARON.red : "#C9D3DB"}>
                  {d}
                </text>
                {here ? <circle cx={860} cy={y + 50} r={18 + 6 * Math.sin(t * 6)} fill={HARON.warm} /> : null}
                {i === 4 ? (
                  <>
                    <rect x={660} y={y + 80} width={230} height={96} rx={8} fill="#3A2210" stroke="#FFB45A" strokeWidth={4} />
                    <text x={775} y={y + 120} textAnchor="middle" fontFamily="Oswald" fontWeight={700} fontSize={32} fill="#FFB45A">КОТЕЛЬНАЯ</text>
                    <text x={775} y={y + 158} textAnchor="middle" fontFamily="JetBrains Mono" fontWeight={700} fontSize={22} fill="#FFB45A">КОЧЕГАРЫ ШРАМА</text>
                  </>
                ) : null}
              </g>
            );
          })}
          {/* Блок Ноль перечёркнут: НЕ ХОДИТЬ */}
          <path d="M 200 1440 L 620 1590 M 620 1440 L 200 1590" stroke={HARON.red} strokeWidth={12} opacity={0.8} />
          <text x={410} y={1540} textAnchor="middle" fontFamily="Oswald" fontWeight={700} fontSize={54} fill={HARON.red} transform="rotate(-6 410 1530)">
            НЕ ХОДИТЬ
          </text>
          {/* путь вниз пунктиром */}
          <path d={`M 860 ${470 + 2 * 236} L 860 ${470 + 3 * 236} L 860 ${420 + 4 * 236 + 80}`} stroke={HARON.warm} strokeWidth={8} strokeDasharray="22 14" strokeDashoffset={-t * 60} opacity={p > 0.2 ? 1 : 0} />
          <Vignette id={id} />
        </svg>
      </Cam>
      <HUD3 fall={9 * 3600 + 44 * 60} deck={3} temp={6} dots={[{ angle: 90, dist: 0.15, kind: "warm" }]} label="ТЁПЛЫХ: 40" frost={0} dim />
      <ShotLabel text="ПУТЬ ВНИЗ" />
    </AbsoluteFill>
  );
};

/* ============================ 8. ГОША: слышит их ============================ */
export const SGosha: React.FC<SceneProps> = ({ dur, lines }) => {
  const t = useT();
  const id = "gs";
  const l13 = L(lines, "13");
  const l15 = L(lines, "15");
  const listen = interpolate(t, [l13.start + 2.6, l13.start + 3.4], [0, 1], ease);
  const beepAt = l15.start + 1.9;
  return (
    <AbsoluteFill style={{ background: "#000", opacity: fadeIn(t) }}>
      <Cam dur={dur} z0={1.0} z1={1.2} x0={560} x1={620} y0={940} y1={820}>
        <svg width={1080} height={1920}>
          <Defs id={id} />
          <Canteen id={id} t={t} crowd={false} />
          <rect width={1080} height={1920} fill="#000" opacity={0.3} />
          <Heater x={540} y={1450} id={id} t={t} s={1.2} />
          {/* грибница-иней проступает на стене, к которой прислушивается Гоша */}
          <g stroke={HARON.ice} fill="none" strokeLinecap="round" opacity={listen * 0.9}>
            <path d="M 1080 700 C 980 760 960 860 1000 960 C 1030 1040 990 1120 1040 1200" strokeWidth={5} />
            <path d="M 1000 960 C 940 980 900 1030 880 1090" strokeWidth={3} />
          </g>
          <Person uid="gs-g" x={720} ground={1740} scale={1.0} look={LOOKS.gosha} emotion={listen > 0.5 ? "fear" : "tense"} facing={1} light={{ x: -1, y: -0.2 }} rim="#FFB07A" pose={{ armL: [4, -2], armR: [-4, 2], legL: [-6, 0], legR: [6, 0], lean: 6 * listen, head: 26 * listen }} t={t} />
          <Person uid="gs-v" x={250} ground={1760} scale={1.0} look={LOOKS.vadim} emotion="tense" facing={1} light={{ x: 1, y: -0.4 }} rim="#FFB07A" pose={{ armL: [-10, -30], armR: [10, 30], legL: [-8, 0], legR: [10, 2], head: 6 }} t={t} />
          <Breath x={740} y={720} id={id} period={1.8} />
          <Vignette id={id} />
        </svg>
      </Cam>
      <HUD3 fall={9 * 3600 + 30 * 60} deck={3} temp={4} dots={t > beepAt ? [{ angle: 80, dist: 0.85, kind: "cold" }, { angle: 100, dist: 0.9, kind: "cold" }] : []} label={t > beepAt ? "СТЫЛЫХ: 2 • 18 м" : "ТЁПЛЫХ: 40"} detectAt={beepAt} frost={t > beepAt ? 0.35 : 0} />
      <Callout targetX={730} targetY={650} title="ГОША КРЕЧЕТ, 29" subtitle="БРАТ ВАДИМА" side="left" dx={130} dy={-180} delay={l13.start + 0.4} accent={HARON.warm} />
    </AbsoluteFill>
  );
};

/* ============================ 9. КЛИФФХЭНГЕР: рукопожатие ============================ */
export const SCliff3: React.FC<SceneProps> = ({ dur, lines }) => {
  const t = useT();
  const id = "c3";
  const l17 = L(lines, "17");
  const l18 = L(lines, "18");
  const shake = interpolate(t, [l17.start + 1.4, l17.start + 2.4], [0, 1], { ...C, easing: Easing.out(Easing.cubic) });
  const frost = interpolate(t, [l17.start + 2.6, l17.end + 0.4], [0, 1], C);
  const face = t > l18.start - 0.4;
  return (
    <AbsoluteFill style={{ background: "#000" }}>
      {!face ? (
        <Cam dur={l18.start} z0={1.0} z1={1.22} y0={960} y1={940}>
          <svg width={1080} height={1920}>
            <Defs id={id} />
            <rect width={1080} height={1920} fill="#0C0D10" />
            <ellipse cx={540} cy={960} rx={600} ry={500} fill="#FF8A3D" opacity={0.1} filter={`url(#b48-${id})`} />
            <ellipse cx={600} cy={960} rx={300} ry={260} fill={HARON.ice} opacity={0.2 * frost} filter={`url(#b48-${id})`} />
            {/* рука Глеба (слева, тёплая, рукав робы) */}
            <g transform={`translate(${-80 + shake * 300} 0)`}>
              <path d="M -100 900 L 360 900 L 360 1060 L -100 1060 Z" fill="#7A838A" stroke="#050608" strokeWidth={14} />
              <path d="M 340 890 C 420 870 520 880 560 930 L 560 1040 C 500 1080 400 1080 340 1060 Z" fill="#B9957C" stroke="#050608" strokeWidth={12} />
            </g>
            {/* рука Гоши (справа, бледная, белые кончики, иней) */}
            <g transform={`translate(${200 - shake * 300} 0)`}>
              <path d="M 1300 880 L 860 900 L 860 1080 L 1300 1080 Z" fill="#7A6E58" stroke="#050608" strokeWidth={14} />
              <path d="M 880 900 C 800 880 700 900 650 950 L 640 1030 C 700 1080 800 1080 870 1070 Z" fill="#D2C8C0" stroke="#050608" strokeWidth={12} />
              {[0, 1, 2, 3].map((i) => (
                <path key={i} d={`M ${660 - i * 4} ${948 + i * 26} l -70 ${6 - i * 2}`} stroke="#050608" strokeWidth={32} strokeLinecap="round" />
              ))}
              {[0, 1, 2, 3].map((i) => (
                <path key={i} d={`M ${660 - i * 4} ${948 + i * 26} l -70 ${6 - i * 2}`} stroke="#D2C8C0" strokeWidth={20} strokeLinecap="round" />
              ))}
              {[0, 1, 2, 3].map((i) => (
                <circle key={i} cx={590 - i * 4} cy={954 + i * 24 - i * 2} r={11} fill="#F2FAFF" />
              ))}
            </g>
            {/* иней с его руки ползёт на руку Глеба */}
            <g stroke="#EAF8FF" strokeWidth={4} opacity={frost} strokeLinecap="round" fill="none">
              <path d="M 560 960 l -60 -30 l -40 10 M 540 1000 l -80 10 l -30 30 M 520 1040 l -50 30" />
            </g>
            <rect width={1080} height={1920} fill="#9FE3FF" opacity={0.06 * frost} />
            <Vignette id={id} />
          </svg>
        </Cam>
      ) : (
        <Cam dur={dur - l18.start + 0.4} z0={1.0} z1={1.1} y0={760} y1={700}>
          <svg width={1080} height={1920}>
            <Defs id={id} />
            <rect width={1080} height={1920} fill="#0C0D10" />
            <Person uid="c3g" x={540} ground={2700} scale={2.3} look={LOOKS.gosha} emotion="tense" facing={-1} light={{ x: 1, y: -0.3 }} rim={HARON.ice} pose={{ armL: [4, -2], armR: [-4, 2], legL: [0, 0], legR: [0, 0], head: -6 }} t={t} />
            {/* иней на ресницах */}
            <path d="M 470 610 l 60 0 M 560 610 l 60 0" stroke="#F2FAFF" strokeWidth={6} opacity={0.8} />
            <Vignette id={id} />
          </svg>
        </Cam>
      )}
      <HUD3 fall={9 * 3600 + 21 * 60} deck={3} temp={4} dots={[{ angle: 0, dist: 0.06, kind: frost > 0.5 ? "cold" : "warm" }]} label={frost > 0.5 ? "ГОША • 31°… 30°…" : "ГОША • ТЁПЛЫЙ?"} frost={0.2 + 0.4 * frost} />
    </AbsoluteFill>
  );
};

export const SCENES3: Record<string, React.FC<SceneProps>> = {
  hook: SHook3,
  drain: SDrain,
  run: SRun,
  knife: SKnife,
  canteen: SCanteen,
  vadim: SVadim,
  deal: SDeal,
  gosha: SGosha,
  cliff: SCliff3,
};
