import React from "react";
import { AbsoluteFill, interpolate, useCurrentFrame, useVideoConfig, Easing } from "remotion";
import { Person, LOOKS } from "../../rig/Person";
import { HaronHUD, HARON } from "../../components/HaronHUD";
import { Callout } from "../../components/Callout";
import { FONTS } from "../../lib/theme";
import { Breath, CommLink, Container, Defs, DockCorridor, Mars, Plate, Pod, Stars, Station, TitleCard, Vignette } from "./common";

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
const fadeIn = (t: number, d = 0.25) => interpolate(t, [0, d], [0, 1], C);

/** Камера: плавный зум/сдвиг всей сцены. */
const Cam: React.FC<{ children: React.ReactNode; z0?: number; z1?: number; x0?: number; x1?: number; y0?: number; y1?: number; dur: number; shake?: number }> = ({
  children,
  z0 = 1,
  z1 = 1.06,
  x0 = 540,
  x1 = 540,
  y0 = 960,
  y1 = 960,
  dur,
  shake = 0,
}) => {
  const t = useT();
  const p = interpolate(t, [0, dur], [0, 1], { ...C, easing: Easing.inOut(Easing.sin) });
  const z = z0 * Math.pow(z1 / z0, p);
  const cx = x0 + (x1 - x0) * p;
  const cy = y0 + (y1 - y0) * p;
  const sx = shake ? Math.sin(t * 53) * shake + Math.sin(t * 31) * shake * 0.5 : 0;
  const sy = shake ? Math.cos(t * 47) * shake : 0;
  return (
    <AbsoluteFill style={{ overflow: "hidden" }}>
      <AbsoluteFill style={{ transformOrigin: "0 0", transform: `translate(${540 - cx * z + sx}px, ${960 - cy * z + sy}px) scale(${z})` }}>{children}</AbsoluteFill>
    </AbsoluteFill>
  );
};

/* ============================ 1. ХУК: ящик с тушёнкой ============================ */
export const SHook: React.FC<SceneProps> = ({ dur }) => {
  const t = useT();
  const id = "hook";
  const beam = ((t * 0.55) % 1.6) - 0.3; // 0..1 положение красного луча по вертикали
  return (
    <AbsoluteFill style={{ background: "#020203" }}>
      <Cam dur={dur} z0={1.08} z1={1.0} y0={980} y1={960}>
        <svg width={1080} height={1920}>
          <Defs id={id} />
          <rect width={1080} height={1920} fill="#0A0807" />
          {/* банки тушёнки по бокам */}
          {[0, 1, 2, 3, 4, 5].map((i) => (
            <g key={i} transform={`translate(${i % 2 ? 930 : 40}, ${560 + i * 170})`}>
              <rect x={0} y={0} width={130} height={150} rx={10} fill="#2C2622" stroke="#050505" strokeWidth={6} />
              <rect x={0} y={45} width={130} height={56} fill="#6A2A1E" />
              <text x={65} y={82} textAnchor="middle" fontFamily="Oswald" fontWeight={700} fontSize={24} fill="#D9C9A6">
                ТУШЁНКА
              </text>
            </g>
          ))}
          {/* доски ящика: тёмные с щелями, через щели — красный луч турели */}
          {Array.from({ length: 12 }, (_, i) => {
            const y = 120 + i * 150;
            const gapY = y + 118;
            const lit = Math.max(0, 1 - Math.abs(gapY / 1920 - beam) * 7);
            return (
              <g key={i}>
                <rect x={0} y={y} width={1080} height={118} fill="#130F0C" opacity={1} />
                <rect x={0} y={y + 6} width={1080} height={4} fill="#221B16" />
                <rect x={0} y={gapY} width={1080} height={32} fill={HARON.red} opacity={0.08 + 0.85 * lit} />
                <rect x={0} y={gapY - 30} width={1080} height={92} fill={HARON.red} opacity={0.25 * lit} filter={`url(#b24-${id})`} />
              </g>
            );
          })}
          {/* Глеб скрючен в ящике, монтировка в руке */}
          <Person
            uid="hk"
            x={540}
            ground={2080}
            scale={1.55}
            look={LOOKS.glebNoScan}
            emotion="tense"
            facing={1}
            light={{ x: 1, y: -0.2 }}
            rim={HARON.red}
            pose={{ armL: [40, 120], armR: [-30, -150], legL: [-150, -20], legR: [150, 20], head: 8, lean: 4 }}
            item="crowbar"
            itemAngle={-170}
            t={t}
          />
          {/* красные полосы света из щелей ложатся на Глеба */}
          {Array.from({ length: 12 }, (_, i) => {
            const gapY = 120 + i * 150 + 118;
            const lit = Math.max(0, 1 - Math.abs(gapY / 1920 - beam) * 7);
            return <rect key={`l${i}`} x={0} y={gapY - 10} width={1080} height={52} fill={HARON.red} opacity={0.32 * lit} style={{ mixBlendMode: "screen" }} />;
          })}
          <rect width={1080} height={1920} fill="#000" opacity={0.35} />
          <Vignette id={id} />
        </svg>
      </Cam>
      <HaronHUD fallSeconds={11 * 3600 + 12 * 60 + 40} oxygen={71} temp={-12} deck={1} dots={[]} scanLabel="" parts={{ oxygen: false, temp: false, scheme: false, scanner: false }} />
    </AbsoluteFill>
  );
};

/* ============================ 2. КТО ТЫ: лицо в полосе красного ============================ */
export const SWho: React.FC<SceneProps> = ({ dur, lines }) => {
  const t = useT();
  const id = "who";
  const l = L(lines, "02");
  const glitchAt = l.end - 1.4; // «Ночь ареста ты не помнишь»
  const gl = t > glitchAt && t < glitchAt + 0.35;
  return (
    <AbsoluteFill style={{ background: "#020203", opacity: fadeIn(t, 0.12) }}>
      <Cam dur={dur} z0={1.0} z1={1.12} y0={760} y1={700}>
        <svg width={1080} height={1920}>
          <Defs id={id} />
          <rect width={1080} height={1920} fill="#070506" />
          <Person uid="wh" x={520} ground={2700} scale={2.3} look={LOOKS.glebNoScan} emotion="tense" facing={1} light={{ x: 1, y: -0.3 }} rim={HARON.red} pose={{ armL: [20, 40], armR: [-20, -40], legL: [0, 0], legR: [0, 0], head: 4 }} t={t} />
          {/* полоса красного света из щели */}
          <rect x={0} y={560} width={1080} height={120} fill={HARON.red} opacity={0.22} filter={`url(#b12-${id})`} />
          <rect x={0} y={0} width={1080} height={420} fill="#000" opacity={0.5} />
          <rect x={0} y={760} width={1080} height={1200} fill="#000" opacity={0.45} />
          <Vignette id={id} />
        </svg>
      </Cam>
      {gl ? (
        <AbsoluteFill style={{ background: "linear-gradient(180deg, rgba(255,40,120,0.35), rgba(40,220,255,0.35))", mixBlendMode: "screen" }}>
          {Array.from({ length: 30 }, (_, i) => (
            <div key={i} style={{ position: "absolute", left: (i * 97) % 1080, top: (i * 233 + t * 900) % 1920, width: 2, height: 60, background: "#9FE3FF", opacity: 0.6 }} />
          ))}
        </AbsoluteFill>
      ) : null}
      <Callout targetX={470} targetY={640} title="ГЛЕБ СЕВЕРИН, 35" subtitle="БЫВШИЙ АГЕНТ • ГОСИЗМЕНА" side="left" dx={60} dy={260} delay={0.3} accent={HARON.red} maxWidth={440} />
      <Plate lines={["СРОК — 30 ЛЕТ КРИОСНА"]} top={1060} from={l.start + 3.6} size={34} color={HARON.ice} border={HARON.iceDeep} />
      <HaronHUD fallSeconds={11 * 3600 + 12 * 60 + 34} oxygen={71} temp={-12} deck={1} dots={[]} scanLabel="" parts={{ oxygen: false, temp: false, scheme: false, scanner: false }} />
    </AbsoluteFill>
  );
};

/* ============================ 3. «ЧАС НАЗАД»: криоотсек «Стикса» ============================ */
export const SStyx: React.FC<SceneProps> = ({ dur, lines }) => {
  const t = useT();
  const id = "styx";
  const lid = interpolate(t, [1.0, 1.8], [0, 1], { ...C, easing: Easing.out(Easing.cubic) });
  const sit = interpolate(t, [1.6, 2.6], [0, 1], { ...C, easing: Easing.out(Easing.cubic) });
  return (
    <AbsoluteFill style={{ background: "#05080D" }}>
      <Cam dur={dur} z0={1.0} z1={1.07}>
        <svg width={1080} height={1920}>
          <Defs id={id} />
          <rect width={1080} height={1920} fill="#08101A" />
          {/* ряды капсул */}
          {[0, 1, 2, 3].map((k) => (
            <g key={k}>
              <Pod x={150 + k * 30} y={500 + k * 40} s={0.5 - k * 0.08} frosted={k % 2 === 1} />
              <Pod x={930 - k * 30} y={500 + k * 40} s={0.5 - k * 0.08} frosted={k % 2 === 0} />
            </g>
          ))}
          <rect x={0} y={1420} width={1080} height={500} fill="#050A11" />
          {/* капсула Глеба открывается */}
          <Pod x={540} y={640} s={1.05} lid={lid} frosted />
          {/* Глеб садится */}
          <Person
            uid="sx"
            x={540}
            ground={1480 - sit * 40}
            scale={0.82}
            look={LOOKS.glebNoScan}
            emotion={sit > 0.5 ? "tense" : "closed"}
            facing={1}
            light={{ x: 0.4, y: -1 }}
            rim={HARON.ice}
            pose={{ armL: [20 + sit * 10, 10], armR: [-20 - sit * 10, -10], legL: [-4, 0], legR: [4, 0], head: 8 - sit * 8, lean: 0 }}
            t={t}
          />
          {/* иней и пар из капсулы */}
          {Array.from({ length: 14 }, (_, i) => (
            <ellipse key={i} cx={540 + Math.sin(i * 2.1) * 220} cy={1000 - (t - 1) * 120 - i * 30} rx={120} ry={46} fill="#EAF6FF" opacity={t > 1 ? Math.max(0, 0.22 - (t - 1) * 0.05) : 0} filter={`url(#b12-${id})`} />
          ))}
          {sit > 0.5 ? <Breath x={560} y={700} id={id} /> : null}
          <Vignette id={id} />
        </svg>
      </Cam>
      <TitleCard text="ЧАС НАЗАД" sub="СУДНО «СТИКС» • ПОДЛЁТ К МАРСУ" from={0} to={1.3} />
      <CommLink speaking={speaking(lines, t)} />
      {t > L(lines, "03").start ? (
        <Callout targetX={110} targetY={1030} title="ПОЛК. ХОРУНЖИЙ" subtitle="БЫВШИЙ НАЧАЛЬНИК ГЛЕБА" side="right" dx={120} dy={-120} delay={L(lines, "03").start} accent={HARON.warm} />
      ) : null}
    </AbsoluteFill>
  );
};

/* ============================ 4. «ХАРОН-7» на экране ============================ */
export const SHaron: React.FC<SceneProps> = ({ dur, lines }) => {
  const t = useT();
  const id = "har";
  const l6 = L(lines, "06");
  const lost = t > l6.end - 1.0;
  return (
    <AbsoluteFill style={{ background: "#020306", opacity: fadeIn(t) }}>
      <Cam dur={dur} z0={1.0} z1={1.15} y0={900} y1={860}>
        <svg width={1080} height={1920}>
          <Defs id={id} />
          <rect width={1080} height={1920} fill="#020306" />
          <Stars n={140} />
          <Mars cx={540} cy={1900} r={900} id={id} />
          <Station cx={540} cy={820} s={1.15} id={id} />
          {/* сетка экрана */}
          {Array.from({ length: 40 }, (_, i) => (
            <rect key={i} x={0} y={i * 48} width={1080} height={2} fill="#9FE3FF" opacity={0.04} />
          ))}
          <Vignette id={id} />
        </svg>
      </Cam>
      {lost ? <AbsoluteFill style={{ background: "rgba(255,59,47,0.08)" }} /> : null}
      <Plate lines={["ХАРОН-7", "ТЮРЬМА КОРПОРАЦИИ «ГЕЛИОС»", "2 000 ЗАКЛЮЧЁННЫХ В КРИОСНЕ"]} top={200} from={0.3} size={52} />
      {t > l6.start + 0.4 ? (
        <div style={{ position: "absolute", left: 250, top: 560, rotate: "-6deg", border: `8px solid ${HARON.red}`, padding: "6px 26px", fontFamily: "Oswald", fontWeight: 700, fontSize: 76, color: HARON.red, letterSpacing: 6, opacity: interpolate(t - l6.start - 0.4, [0, 0.1], [0, 1], C), scale: String(interpolate(t - l6.start - 0.4, [0, 0.12], [1.4, 1], C)) }}>
          ЗАХВАЧЕНА
        </div>
      ) : null}
      {lost ? <Plate lines={["СВЯЗЬ ПОТЕРЯНА", "ПОСЛЕДНЕЕ СООБЩЕНИЕ: УЛЬТИМАТУМ"]} top={420} size={40} color={HARON.red} border={HARON.red} /> : null}
      <CommLink speaking={speaking(lines, t)} />
    </AbsoluteFill>
  );
};

/* ============================ 5. НЕОГРАД: запись председателя ============================ */
export const SNeograd: React.FC<SceneProps> = ({ dur, lines }) => {
  const t = useT();
  const frame = useCurrentFrame();
  const id = "neo";
  const l8 = L(lines, "08");
  const showEva = t > l8.start + 1.2;
  const blocks = Array.from({ length: 14 }, (_, i) => ({ x: i * 80 - 40, w: 60 + ((i * 37) % 70), h: 500 + ((i * 131) % 600) }));
  return (
    <AbsoluteFill style={{ background: "#1A0E1A", opacity: fadeIn(t) }}>
      <Cam dur={dur} z0={1.0} z1={1.08} x0={540} x1={570}>
        <svg width={1080} height={1920}>
          <Defs id={id} />
          <defs>
            <linearGradient id="neo-sky" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0" stopColor="#2A1838" />
              <stop offset="0.45" stopColor="#B4486A" />
              <stop offset="0.7" stopColor="#F08A4A" />
              <stop offset="1" stopColor="#3A1A24" />
            </linearGradient>
          </defs>
          <rect width={1080} height={1920} fill="url(#neo-sky)" />
          <circle cx={700} cy={1080} r={160} fill="#FFC27A" opacity={0.7} filter={`url(#b24-${id})`} />
          {/* дальние мегаблоки */}
          {blocks.map((b, i) => (
            <g key={i}>
              <rect x={b.x} y={1400 - b.h} width={b.w} height={b.h + 600} fill="#2A1A2E" opacity={0.85} />
              {Array.from({ length: Math.floor(b.h / 40) }, (_, j) => (
                <rect key={j} x={b.x + 8} y={1400 - b.h + 20 + j * 40} width={b.w - 16} height={3} fill={j % 3 ? "#FF5FA8" : "#5FE3FF"} opacity={0.35} />
              ))}
            </g>
          ))}
          {/* башня «Гелиоса»: чёрный монолит с оранжевым кольцом */}
          <path d="M 640 300 L 800 300 L 830 1920 L 610 1920 Z" fill="#06040A" />
          <ellipse cx={720} cy={380} rx={130} ry={34} fill="none" stroke="#FF8A2A" strokeWidth={16} />
          <ellipse cx={720} cy={380} rx={130} ry={34} fill="none" stroke="#FFB45A" strokeWidth={30} opacity={0.4} filter={`url(#b12-${id})`} />
          {/* аэрокары: цепочки огней */}
          {[0, 1, 2].map((k) =>
            Array.from({ length: 10 }, (_, i) => (
              <circle key={`${k}${i}`} cx={((i * 120 + frame * (2 + k)) % 1300) - 100} cy={700 + k * 140 + Math.sin(i) * 6} r={4} fill={k === 1 ? "#FF5F5F" : "#FFF1C8"} />
            )),
          )}
          {/* голо-реклама */}
          <g opacity={0.75 + 0.25 * Math.sin(t * 9)}>
            <rect x={60} y={820} width={380} height={170} fill="#5FE3FF" opacity={0.12} stroke="#5FE3FF" strokeWidth={3} />
            <text x={250} y={890} textAnchor="middle" fontFamily="Oswald" fontWeight={700} fontSize={40} fill="#9FF0FF">
              МАРС ЖДЁТ ТЕБЯ
            </text>
            <text x={250} y={940} textAnchor="middle" fontFamily="JetBrains Mono" fontWeight={700} fontSize={26} fill="#9FF0FF">
              КОНТРАКТ 10 ЛЕТ
            </text>
          </g>
          {/* панорамное окно кабинета */}
          <rect x={0} y={1500} width={1080} height={420} fill="#0A060C" />
          {[0, 270, 540, 810, 1080].map((x) => (
            <rect key={x} x={x - 14} y={0} width={28} height={1520} fill="#0A060C" />
          ))}
          <rect x={0} y={260} width={1080} height={24} fill="#0A060C" />
          {/* председатель спиной, силуэт */}
          <Person uid="pr" x={330} ground={1720} scale={1.05} mode="sil" look={{ ...LOOKS.gleb, hairStyle: "buzz", extras: [] }} light={{ x: 1, y: -0.5 }} rim="#FFB07A" pose={{ armL: [8, 30], armR: [-8, -30], legL: [-4, 0], legR: [4, 0] }} t={t} />
          <Vignette id={id} />
        </svg>
      </Cam>
      {/* интерфейс записи + помехи */}
      <AbsoluteFill>
        {Array.from({ length: 60 }, (_, i) => (
          <div key={i} style={{ position: "absolute", left: 0, right: 0, top: i * 32, height: 2, background: "rgba(255,255,255,0.05)" }} />
        ))}
        {frame % 23 < 2 ? <div style={{ position: "absolute", left: 0, right: 0, top: (frame * 37) % 1900, height: 18, background: "rgba(255,255,255,0.18)" }} /> : null}
      </AbsoluteFill>
      <div style={{ position: "absolute", left: 60, right: 60, top: 170, display: "flex", justifyContent: "space-between", fontFamily: FONTS.mono, fontWeight: 700, fontSize: 30, color: "#FFFFFF" }}>
        <span>
          <span style={{ color: HARON.red, opacity: frame % 30 < 18 ? 1 : 0.2 }}>●</span> СОВЕТ ЗЕМЛИ • ЗАПИСЬ
        </span>
        <span style={{ color: "#FFC27A" }}>ЗАДЕРЖКА 14:06</span>
      </div>
      {showEva ? (
        <>
          <div style={{ position: "absolute", right: 70, top: 300, width: 300, height: 360, background: "#0B1420", border: "6px solid #E8EEF2", rotate: "3deg", overflow: "hidden", opacity: interpolate(t - l8.start - 1.2, [0, 0.2], [0, 1], C) }}>
            <svg width={300} height={360}>
              <rect width={300} height={360} fill="#2A3A4A" />
              <Person uid="ev" x={150} ground={1250} scale={1.5} look={LOOKS.eva} emotion="determined" facing={-1} light={{ x: -1, y: -0.5 }} rim="#FFE3C8" pose={{ armL: [10, 10], armR: [-10, -10], legL: [0, 0], legR: [0, 0] }} />
            </svg>
          </div>
          <Callout targetX={760} targetY={560} title="ЕВА ЛАНСКАЯ, 24" subtitle="ДОЧЬ ПРЕДСЕДАТЕЛЯ" side="left" dx={130} dy={220} delay={l8.start + 1.4} accent={HARON.red} />
        </>
      ) : null}
    </AbsoluteFill>
  );
};

/* ============================ 6. ПАДЕНИЕ: схема орбиты ============================ */
export const SFall: React.FC<SceneProps> = ({ lines }) => {
  const t = useT();
  const id = "fall";
  const l9 = L(lines, "09");
  const p = interpolate(t, [l9.start + 3, l9.end], [0, 1], { ...C, easing: Easing.in(Easing.quad) });
  const timerAt = l9.start + 5.6; // «…Двенадцать часов»
  // траектория: спираль к колонии
  const path = "M 880 560 C 980 820 860 1040 660 1120 C 520 1180 470 1260 520 1340";
  return (
    <AbsoluteFill style={{ background: "#03060B", opacity: fadeIn(t) }}>
      <svg width={1080} height={1920}>
        <Defs id={id} />
        <Stars n={90} />
        <Mars cx={540} cy={2150} r={900} id={id} />
        {/* купола колонии */}
        {[[430, 1300, 60], [520, 1280, 80], [620, 1310, 54]].map(([x, y, r], i) => (
          <g key={i}>
            <path d={`M ${x - r} ${y} A ${r} ${r} 0 0 1 ${x + r} ${y} Z`} fill="#9FE3FF" opacity={0.25} stroke="#CDEFFF" strokeWidth={3} />
            <circle cx={x} cy={y - r * 0.3} r={6} fill="#FFE3A0" />
          </g>
        ))}
        <path d={path} stroke={HARON.red} strokeWidth={6} fill="none" strokeDasharray="22 16" opacity={0.9} />
        <circle cx={520} cy={1340} r={60 + 20 * Math.sin(t * 6)} fill="none" stroke={HARON.red} strokeWidth={4} opacity={0.8} />
        {/* станция-иконка движется по траектории */}
        <g transform={`translate(${880 - 360 * p} ${560 + 780 * p})`}>
          <ellipse rx={60} ry={22} fill="none" stroke="#C9D3DB" strokeWidth={10} />
          <rect x={-8} y={-44} width={16} height={56} fill="#C9D3DB" />
          <circle r={50} fill={HARON.red} opacity={0.2} filter={`url(#b12-${id})`} />
        </g>
        <Vignette id={id} />
      </svg>
      <Plate lines={["ДВИГАТЕЛИ ОРБИТЫ: ОТКАЗ", "ГЕНЕРАТОРЫ: ОТКАЗ"]} top={420} from={l9.start + 1.0} size={40} color={HARON.red} border={HARON.red} />
      <Plate lines={["НОВЫЙ ВОСТОК", "40 000 ЧЕЛОВЕК"]} top={1040} from={l9.start + 6.5} size={44} color={HARON.ice} border={HARON.iceDeep} />
      <HaronHUD fallSeconds={12 * 3600} oxygen={71} temp={-12} deck={1} dots={[]} scanLabel="" parts={{ oxygen: false, temp: false, scheme: false, scanner: false }} timerFrom={timerAt} timeScale={0.0001} />
      {t > timerAt && t < timerAt + 0.3 ? <AbsoluteFill style={{ boxShadow: "inset 0 0 180px 60px rgba(255,40,30,0.6)" }} /> : null}
      <CommLink speaking={speaking(lines, t)} />
    </AbsoluteFill>
  );
};

/* ============================ 7. ТРЮМ «СТИКСА»: контейнер ============================ */
export const SHold: React.FC<SceneProps> = ({ dur, lines }) => {
  const t = useT();
  const id = "hold";
  const l14 = L(lines, "14");
  const climb = t > l14.start;
  const lidOpen = interpolate(t, [0.3, 0.9, l14.start, l14.end], [0, 1, 1, 0], C);
  return (
    <AbsoluteFill style={{ background: "#07090C", opacity: fadeIn(t) }}>
      <Cam dur={dur} z0={1.0} z1={1.1} y0={960} y1={900}>
        <svg width={1080} height={1920}>
          <Defs id={id} />
          <rect width={1080} height={1920} fill="#0C1016" />
          {[0, 1, 2, 3].map((i) => (
            <rect key={i} x={i * 300 - 60} y={200} width={40} height={1500} fill="#151B24" />
          ))}
          <rect x={0} y={1420} width={1080} height={500} fill="#080A0E" />
          <rect x={0} y={1420} width={1080} height={10} fill="#C9962A" opacity={0.6} />
          {/* штабель ящиков */}
          {[[60, 1100], [60, 840], [230, 1150]].map(([x, y], i) => (
            <rect key={i} x={x} y={y} width={200} height={260} fill="#3A3E36" stroke="#050608" strokeWidth={8} />
          ))}
          <rect x={0} y={150} width={1080} height={260} fill="#FFE3A0" opacity={0.05} filter={`url(#b48-${id})`} />
          <Container x={640} y={1130} s={0.8} lidOpen={lidOpen} />
          {!climb ? (
            <Person uid="hd" x={300} ground={1700} scale={0.95} look={LOOKS.glebNoScan} emotion={t > L(lines, "13").start ? "tense" : "neutral"} facing={1} light={{ x: 1, y: -0.6 }} rim="#FFE3C8" pose={{ armL: [8, 4], armR: [-12, -6], legL: [-6, -2], legR: [8, 4], head: 6 }} item="crowbar" itemAngle={-10} t={t} />
          ) : null}
          <Vignette id={id} />
        </svg>
      </Cam>
      <CommLink speaking={speaking(lines, t)} />
      {climb ? <AbsoluteFill style={{ background: "#000", opacity: interpolate(t, [l14.end - 0.5, l14.end + 0.3], [0, 0.9], C) }} /> : null}
      <HaronHUD fallSeconds={11 * 3600 + 58 * 60} oxygen={71} temp={-12} deck={1} dots={[]} scanLabel="" parts={{ oxygen: false, temp: false, scheme: false, scanner: false }} dim />
    </AbsoluteFill>
  );
};

/* ============================ 8. ПОДЛЁТ: Марс, «Харон-7», турели ============================ */
export const SApproach: React.FC<SceneProps> = ({ dur, lines }) => {
  const t = useT();
  const id = "app";
  const l15 = L(lines, "15");
  const p = interpolate(t, [0, dur], [0, 1], { ...C, easing: Easing.inOut(Easing.sin) });
  const scanning = t > 0.6 && t < l15.end;
  const ok = t > l15.end - 1.0;
  return (
    <AbsoluteFill style={{ background: "#010204", opacity: fadeIn(t) }}>
      <svg width={1080} height={1920}>
        <Defs id={id} />
        <Stars n={200} drift={0.15} />
        <Mars cx={540} cy={2350 - p * 120} r={1300} id={id} />
        <Station cx={560} cy={760 - p * 60} s={0.55 + p * 0.85} id={id} />
        {/* обломки */}
        {[0, 1, 2, 3, 4, 5].map((i) => (
          <path key={i} d="M 0 -12 L 16 -4 L 10 14 L -12 10 Z" fill="#3A444E" stroke="#050608" strokeWidth={3} transform={`translate(${(i * 190 + t * (40 + i * 15)) % 1200 - 60} ${300 + i * 210}) rotate(${t * 60 * (i % 2 ? 1 : -1) + i * 40}) scale(${1 + (i % 3)})`} />
        ))}
        {/* контейнер летит к станции */}
        <g transform={`translate(${540 + Math.sin(t) * 6} ${1500 - p * 520}) scale(${0.3 - p * 0.14})`}>
          <rect x={-200} y={-200} width={400} height={400} rx={14} fill="#4A4F45" stroke="#050608" strokeWidth={14} />
          <rect x={-200} y={-30} width={400} height={50} fill="#C9962A" />
          <ellipse cx={0} cy={260} rx={60} ry={120} fill="#7FD8FF" opacity={0.5 + 0.3 * Math.sin(t * 30)} filter={`url(#b12-${id})`} />
        </g>
        {/* красные лучи турелей на контейнер */}
        {scanning
          ? [[300, 640], [820, 660]].map(([x, y], i) => (
              <polygon key={i} points={`${x},${y - p * 60} ${540 - 50},${1500 - p * 520} ${540 + 50},${1500 - p * 520}`} fill={ok ? "#7CFFB2" : HARON.red} opacity={0.18 + 0.12 * Math.sin(t * 20 + i)} />
            ))
          : null}
        <Vignette id={id} />
      </svg>
      {t > l15.start ? (
        <div style={{ position: "absolute", left: 60, right: 60, top: 300, textAlign: "center", fontFamily: FONTS.mono, fontWeight: 700, fontSize: 40, color: ok ? "#7CFFB2" : HARON.red, background: "rgba(6,10,16,0.85)", border: `3px solid ${ok ? "#7CFFB2" : HARON.red}`, borderRadius: 12, padding: "14px 10px" }}>
          {ok ? "ГРУЗ: ПАЁК 400 КГ — ДОПУЩЕН" : "СКАН… ГРУЗ: ПАЁК 400 КГ"}
        </div>
      ) : null}
      <HaronHUD fallSeconds={11 * 3600 + 14 * 60} oxygen={71} temp={-12} deck={1} dots={[]} scanLabel="" parts={{ oxygen: false, temp: false, scheme: false, scanner: false }} timeScale={6} />
    </AbsoluteFill>
  );
};

/* ============================ 9. СТЫКОВКА: крышка, коридор, −12°C ============================ */
export const SDock: React.FC<SceneProps> = ({ dur, lines }) => {
  const t = useT();
  const id = "dock";
  const lid = interpolate(t, [0.5, 1.2], [0, 1], { ...C, easing: Easing.out(Easing.back(1.5)) });
  const walk = interpolate(t, [1.4, dur], [0, 1], C);
  return (
    <AbsoluteFill style={{ background: "#000", opacity: fadeIn(t, 0.1) }}>
      <Cam dur={dur} z0={1.04} z1={1.0} shake={t < 0.4 ? 10 : 0}>
        <svg width={1080} height={1920}>
          <Defs id={id} />
          <DockCorridor id={id} flick={Math.sin(t * 37) > 0.8 ? 0.4 : 1} />
          {/* крышка ящика отлетает */}
          {lid < 1 ? <rect x={0} y={0} width={1080} height={1920} fill="#0A0807" opacity={1 - lid} /> : null}
          <Person uid="dk" x={360 + walk * 40} ground={1640} scale={0.95} look={LOOKS.glebNoScan} emotion="tense" facing={1} light={{ x: 1, y: -0.5 }} rim={HARON.ice} pose={{ armL: [10 - walk * 8 * Math.sin(t * 5), 4], armR: [-20, -60], legL: [-8 + 10 * Math.sin(t * 5), 0], legR: [8 - 10 * Math.sin(t * 5), 4], head: 4 }} item="crowbar" itemAngle={-60} t={t} />
          <Breath x={400 + walk * 40} y={620} id={id} />
        </svg>
      </Cam>
      <HaronHUD fallSeconds={11 * 3600 + 11 * 60} oxygen={71} temp={-12} deck={1} dots={[]} scanLabel="" parts={{ scanner: false }} frost={0.25} />
      <CommLink speaking={speaking(lines, t)} />
    </AbsoluteFill>
  );
};

/* ============================ 10. СТАТУЯ ============================ */
export const SStatue: React.FC<SceneProps> = ({ dur, lines }) => {
  const t = useT();
  const id = "stat";
  const l20 = L(lines, "20");
  const reach = interpolate(t, [l20.start - 0.4, l20.end], [0, 1], C);
  return (
    <AbsoluteFill style={{ background: "#000", opacity: fadeIn(t) }}>
      <Cam dur={dur} z0={1.0} z1={1.1} x0={540} x1={600} y0={960} y1={880}>
        <svg width={1080} height={1920}>
          <Defs id={id} />
          <DockCorridor id={id} flick={Math.sin(t * 29) > 0.85 ? 0.3 : 1} />
          <ellipse cx={790} cy={900} rx={260} ry={460} fill={HARON.ice} opacity={0.12} filter={`url(#b48-${id})`} />
          <Person uid="st" x={790} ground={1600} scale={0.9} look={LOOKS.guardFrozen} emotion="closed" facing={-1} light={{ x: -1, y: -0.7 }} rim="#FFFFFF" pose={{ armL: [-40, -85], armR: [20, -30], legL: [-6, 0], legR: [8, 2], head: -6 }} />
          <Person uid="gl" x={270} ground={1620} scale={0.9} look={LOOKS.glebNoScan} emotion="tense" facing={1} light={{ x: 1, y: -0.5 }} rim={HARON.ice} pose={{ armL: [10, 4], armR: [20 + 42 * reach, 30 + 66 * reach], legL: [-6, -2], legR: [10, 4], head: 6 }} t={t} />
          <Breath x={300} y={600} id={id} />
          {reach > 0.95 ? <circle cx={640} cy={770} r={40} fill="#E6F7FF" opacity={0.4} filter={`url(#b6-${id})`} /> : null}
        </svg>
      </Cam>
      <HaronHUD fallSeconds={11 * 3600 + 9 * 60 + 30} oxygen={71} temp={-14} deck={1} dots={[]} scanLabel="" parts={{ scanner: false }} frost={0.35} />
      <CommLink speaking={speaking(lines, t)} />
    </AbsoluteFill>
  );
};

/* ============================ 11. СКАНЕР: удар, откол кисти, браслет ============================ */
export const SScanner: React.FC<SceneProps> = ({ lines }) => {
  const t = useT();
  const id = "scan";
  const l21 = L(lines, "21");
  const l22 = L(lines, "22");
  const l23 = L(lines, "23");
  const hit = l21.end + 0.35; // удар монтировкой
  const close = t < l23.start - 0.2; // крупный план запястья до снятия браслета
  const k = interpolate(t, [hit, hit + 0.9], [0, 1], { ...C, easing: Easing.out(Easing.cubic) });
  const swing = interpolate(t, [hit - 0.5, hit], [0, 1], { ...C, easing: Easing.in(Easing.cubic) });
  return (
    <AbsoluteFill style={{ background: "#000", opacity: fadeIn(t) }}>
      {close ? (
        <Cam dur={l23.start} z0={1.0} z1={1.08} shake={t > hit && t < hit + 0.25 ? 18 : 0}>
          <svg width={1080} height={1920}>
            <Defs id={id} />
            <rect width={1080} height={1920} fill="#0A111D" />
            <ellipse cx={540} cy={900} rx={520} ry={520} fill={HARON.ice} opacity={0.1} filter={`url(#b48-${id})`} />
            {/* ледяное предплечье статуи (крупно) */}
            <path d="M -60 640 L 560 820 L 520 980 L -60 860 Z" fill="#A9D6EA" stroke="#050608" strokeWidth={14} />
            <path d="M -60 660 L 540 830" stroke="#FFFFFF" strokeWidth={8} opacity={0.6} />
            {/* браслет со сканером, вмёрзший */}
            <g transform="translate(470 880) rotate(16)">
              <rect x={-70} y={-110} width={110} height={220} rx={16} fill="#15181C" stroke="#050608" strokeWidth={10} />
              <circle cx={-15} cy={0} r={62} fill="#0B2A20" stroke="#2C4A3C" strokeWidth={6} />
              <circle cx={-15} cy={0} r={62} fill="#DDF3FF" opacity={0.45} />
            </g>
            {/* кисть — откалывается и улетает */}
            <g transform={`translate(${600 + k * 260} ${900 + k * 520}) rotate(${k * 140})`} opacity={1 - k * 0.3}>
              <path d="M -50 -80 L 70 -60 L 120 -20 L 130 30 L 60 80 L -40 70 Z" fill="#BFE6F5" stroke="#050608" strokeWidth={12} />
              {[0, 1, 2, 3].map((i) => (
                <path key={i} d={`M ${100 + i * 4} ${-30 + i * 24} l 70 ${-6 + i * 4}`} stroke="#050608" strokeWidth={30} strokeLinecap="round" />
              ))}
              {[0, 1, 2, 3].map((i) => (
                <path key={i} d={`M ${100 + i * 4} ${-30 + i * 24} l 70 ${-6 + i * 4}`} stroke="#BFE6F5" strokeWidth={18} strokeLinecap="round" />
              ))}
            </g>
            {/* осколки */}
            {t > hit
              ? Array.from({ length: 16 }, (_, i) => (
                  <path key={i} d="M 0 -20 L 8 0 L 0 18 L -6 2 Z" fill="#EAF8FF" stroke="#3E8FB8" strokeWidth={2} transform={`translate(${560 + Math.cos(i * 1.7) * k * (200 + i * 20)} ${880 + Math.sin(i * 1.7) * k * (200 + i * 15) + k * k * 200}) rotate(${i * 50 + k * 400})`} opacity={1 - k * 0.6} />
                ))
              : null}
            {/* монтировка замахивается */}
            <g transform={`translate(1100 ${300 + swing * 420}) rotate(${-40 + swing * 40})`}>
              <path d="M 0 0 L -520 120 L -560 80" stroke="#050608" strokeWidth={44} fill="none" strokeLinecap="round" strokeLinejoin="round" />
              <path d="M 0 0 L -520 120 L -560 80" stroke="#8E2A20" strokeWidth={26} fill="none" strokeLinecap="round" strokeLinejoin="round" />
            </g>
            {t > hit && t < hit + 0.12 ? <rect width={1080} height={1920} fill="#FFFFFF" opacity={0.5} /> : null}
            <Vignette id={id} />
          </svg>
        </Cam>
      ) : (
        <Cam dur={3} z0={1.12} z1={1.0} y0={820} y1={900}>
          <svg width={1080} height={1920}>
            <Defs id={id} />
            <DockCorridor id={id} />
            <Person uid="sg" x={420} ground={1640} scale={1.0} look={LOOKS.gleb} emotion="tense" facing={1} light={{ x: 1, y: -0.5 }} rim="#FF8A3D" pose={{ armL: [10, 4], armR: [30, 150], legL: [-6, -2], legR: [8, 4], head: 18 }} t={t} />
            <Breath x={440} y={560} id={id} />
          </svg>
        </Cam>
      )}
      <HaronHUD fallSeconds={11 * 3600 + 8 * 60} oxygen={71} temp={-14} deck={1} dots={[]} scanLabel="ЖИВЫХ: 0" scannerFrom={l23.start} frost={0.4} />
      {!close ? <Callout targetX={600} targetY={640} title="ТЕРМОСКАНЕР" subtitle="ИЩЕТ ЛЮДЕЙ ПО ТЕПЛУ" side="left" dx={160} dy={-30} delay={l23.start + 0.4} accent={HARON.warm} /> : null}
      <CommLink speaking={speaking(lines, t)} />
      {/* реплика Глеба «Извини, приятель» — без окна связи */}
      {t > l22.start && t < l22.end ? null : null}
    </AbsoluteFill>
  );
};

/* ============================ 12. ПУСТОЙ СКАНЕР ============================ */
export const SEmpty: React.FC<SceneProps> = ({ dur }) => {
  const t = useT();
  const id = "emp";
  const sweep = (t * 140) % 360;
  return (
    <AbsoluteFill style={{ background: "#000", opacity: fadeIn(t) }}>
      <Cam dur={dur} z0={1.0} z1={1.08}>
        <svg width={1080} height={1920}>
          <Defs id={id} />
          <rect width={1080} height={1920} fill="#05080D" />
          <g transform="translate(540 900)">
            <circle r={380} fill="#04110C" stroke="#2C4A3C" strokeWidth={10} />
            {[0.33, 0.66].map((k) => (
              <circle key={k} r={380 * k} fill="none" stroke="#1F3A2E" strokeWidth={5} />
            ))}
            <path d="M 0 -380 L 0 380 M -380 0 L 380 0" stroke="#1F3A2E" strokeWidth={5} />
            <path d={`M 0 0 L 0 -380 A 380 380 0 0 1 ${380 * Math.sin(0.6)} ${-380 * Math.cos(0.6)} Z`} fill="#FF8A3D" opacity={0.3} transform={`rotate(${sweep})`} />
            <path d="M 0 -26 L 20 20 L 0 8 L -20 20 Z" fill="#F2F6F8" />
          </g>
          <text x={540} y={470} textAnchor="middle" fontFamily="JetBrains Mono" fontWeight={700} fontSize={64} fill="#FF8A3D">
            ЖИВЫХ: 0
          </text>
          <Vignette id={id} />
        </svg>
      </Cam>
      <HaronHUD fallSeconds={11 * 3600 + 6 * 60 + 20} oxygen={71} temp={-15} deck={1} dots={[]} scanLabel="ЖИВЫХ: 0" frost={0.45} parts={{ scanner: false }} />
    </AbsoluteFill>
  );
};

/* ============================ 13. КЛИФФХЭНГЕР: хруст, «ОБНАРУЖЕН» ============================ */
export const SCliff: React.FC<SceneProps> = ({ dur }) => {
  const t = useT();
  const id = "clf";
  const turn = interpolate(t, [0.4, 1.0], [0, 1], { ...C, easing: Easing.out(Easing.cubic) });
  return (
    <AbsoluteFill style={{ background: "#000" }}>
      <Cam dur={dur} z0={1.0} z1={1.18} y0={960} y1={860} shake={t < 0.5 ? 6 : 0}>
        <svg width={1080} height={1920}>
          <Defs id={id} />
          <DockCorridor id={id} flick={Math.sin(t * 41) > 0.7 ? 0.2 : 1} />
          <ellipse cx={560} cy={960} rx={140} ry={190} fill={HARON.ice} opacity={0.14 + 0.06 * Math.sin(t * 4)} filter={`url(#b48-${id})`} />
          <Person uid="cs" x={560} ground={1110} scale={0.28} mode="sil" look={LOOKS.stylyy} pose={{ armL: [-20, -10], armR: [25, 15], legL: [-6, 0], legR: [10, 4], lean: 6 + Math.sin(t * 3) * 3, head: 18 }} t={t} />
          <Person uid="cg" x={300} ground={1700} scale={1.0} look={LOOKS.gleb} emotion="fear" facing={turn > 0.5 ? -1 : 1} light={{ x: 1, y: -0.4 }} rim={HARON.ice} pose={{ armL: [10, 4], armR: [30, 150], legL: [-6, -2], legR: [8, 4], head: 10 - turn * 20, lean: -turn * 4 }} item="crowbar" itemAngle={160} t={t} />
          <Breath x={320} y={600} id={id} period={1.4} />
        </svg>
      </Cam>
      <HaronHUD fallSeconds={11 * 3600 + 5 * 60 + 40} oxygen={71} temp={-16} deck={1} dots={[{ angle: 178, dist: 0.5, kind: "cold" }]} scanLabel="ХОЛОДНАЯ ЦЕЛЬ — 6 м" detectAt={0.15} frost={0.6} />
    </AbsoluteFill>
  );
};

/* ============================ 14. ВОПРОС + «ЧАСТЬ 2» ============================ */
export const SQuestion: React.FC<SceneProps> = ({ dur, lines }) => {
  const t = useT();
  const l26 = L(lines, "26");
  const end = t > l26.end + 0.2;
  const op = interpolate(t, [0, 0.4], [0, 1], C);
  return (
    <AbsoluteFill style={{ background: "#03050A" }}>
      <svg width={1080} height={1920} style={{ position: "absolute" }}>
        <Defs id="q" />
        <Stars n={80} />
        <Mars cx={540} cy={2300} r={1100} id="q" />
      </svg>
      {!end ? (
        <div style={{ position: "absolute", left: 70, right: 70, top: 560, opacity: op, textAlign: "center" }}>
          <div style={{ fontFamily: FONTS.mono, fontWeight: 700, fontSize: 34, color: "#8A9AA8", letterSpacing: 4 }}>ВОПРОС</div>
          <div style={{ fontFamily: FONTS.ui, fontWeight: 900, fontSize: 64, color: HARON.white, lineHeight: 1.12, marginTop: 20 }}>
            30 ЛЕТ КРИОСНА
            <br />
            <span style={{ color: "#8A9AA8", fontSize: 44 }}>ИЛИ</span>
            <br />
            <span style={{ color: HARON.red }}>12 ЧАСОВ</span> НА ПАДАЮЩЕЙ СТАНЦИИ?
          </div>
          <div style={{ fontFamily: FONTS.mono, fontWeight: 700, fontSize: 36, color: HARON.ice, marginTop: 40, letterSpacing: 2 }}>↓ ЧТО ВЫБРАЛ БЫ ТЫ? ПИШИ В КОММЕНТАХ ↓</div>
        </div>
      ) : (
        <div style={{ position: "absolute", left: 0, right: 0, top: 700, textAlign: "center", opacity: interpolate(t - l26.end - 0.2, [0, 0.3], [0, 1], C) }}>
          <div style={{ fontFamily: "Oswald", fontWeight: 700, fontSize: 150, color: HARON.white, letterSpacing: 8 }}>ЧАСТЬ 2</div>
          <div style={{ display: "inline-block", marginTop: 16, fontFamily: FONTS.mono, fontWeight: 700, fontSize: 52, background: HARON.red, color: "#05070A", padding: "8px 30px", borderRadius: 8, letterSpacing: 4 }}>— В ПРОФИЛЕ —</div>
          <div style={{ fontFamily: FONTS.mono, fontWeight: 700, fontSize: 32, color: "#8A9AA8", marginTop: 40, letterSpacing: 6 }}>«ХАРОН» • СЕРИЯ 1 «ПОСЫЛКА»</div>
        </div>
      )}
    </AbsoluteFill>
  );
};

export const SCENES: Record<string, React.FC<SceneProps>> = {
  hook: SHook,
  who: SWho,
  styx: SStyx,
  haron: SHaron,
  neograd: SNeograd,
  fall: SFall,
  hold: SHold,
  approach: SApproach,
  dock: SDock,
  statue: SStatue,
  scanner: SScanner,
  empty: SEmpty,
  cliff: SCliff,
  question: SQuestion,
};
