// «ДОСТАВКА НА АБОРДАЖ» (пираты, 1718). 23 шота голоса + финал — последний припев песни Пистолетова.
// Музыка: песня фоном очень тихо (−26 дБ), выровнена так, что к концу вопроса Сёмы подходит последний припев (200,0 с песни) → нарастание.
import React from "react";
import { AbsoluteFill, Audio, Sequence, staticFile, interpolate, useCurrentFrame } from "remotion";
import "../fonts";
import T from "../ep02_timings.json";
import { FPS, keys, back, step, Stage, Plane, eio } from "../engine/stage";
import { setVivid, G, PAL, cut, rrectP, rectP, ellP, fillP, strokeP, inkText, text, Pt, rng } from "../engine/paper";
import { CanvasArt } from "../engine/CanvasArt";
import { Emo, Pose, extra, sema } from "../engine/puppets";
import { Sema, Extra, Portal, Camera } from "../components/scenes";
import { FactCallout, Subtitles, Tag, Word, Marks, PriceTag } from "../components/overlays";
import { appScreen, stars } from "../components/ep01art";
import { seaSky, wave, harbor, dock, frigate, tentacles, octoEye, lemonCrate, smokePuffs, sabre, cannonball, hold, lanternGlow, rat, gallows, lemon } from "../components/ep02art";
import { blackbeard, pistoletov, pirate, deck, sails } from "../StyleFrames2";
setVivid(true);

const W: Word[] = T.words as Word[];
const S = T.shots;
const TQ = S[22].e + 0.35;            // конец вопроса «…Карибский?» → старт припева
const CHORUS = 200.0, CH_LEN = 7.6, FADE = 1.0; // в песне: «Не сомалийский…» … «…новый пират!»
export const EP02_DUR = Math.ceil((TQ + CH_LEN + FADE + 0.2) * FPS);
const f = (s: number) => Math.round(s * FPS);
const st = (i: number) => (i <= 0 ? 0 : i >= S.length ? TQ : S[i].s - 0.08);
const shot = (a: number, b = a + 1) => ({ from: f(st(a)), durationInFrames: Math.max(1, f(st(b)) - f(st(a))) });
const wt = (i: number, k: number) => W.filter((w) => w.shot === i)[k].s - st(i);
const speak = (t: number, r: [number, number][]) => (r.some(([a, b]) => t >= a && t < b) ? 0.35 + Math.abs(Math.sin(t * 17)) * 0.6 : 0);
const walk = (t: number, sp: number, ph = 0) => Math.sin(t * sp + ph);
const VIV: React.CSSProperties = { filter: "saturate(1.35) contrast(1.06) brightness(1.04)" };
const DARK: React.CSSProperties = { filter: "saturate(1.05) contrast(1.12) brightness(0.95)" };
const Vignette: React.FC<{ a?: number }> = ({ a = 0.72 }) => <AbsoluteFill style={{ background: `radial-gradient(ellipse 72% 58% at 50% 38%, rgba(0,0,0,0) 32%, rgba(8,4,2,${a}) 100%)` }} />;
const Sticker: React.FC<{ s: string; x: number; y: number; at?: number; rot?: number; size?: number; color?: string; bg?: string }> = ({ s, x, y, at = 0, rot = -0.06, size = 60, color = PAL.ink, bg = "#F7D84A" }) => (
  <CanvasArt draw={(g, t) => { const k = back((t - at) / 0.3); if (k <= 0) return; g.save(); g.translate(x, y); g.rotate(rot); g.scale(k, k);
    g.font = `900 ${size}px Montserrat`; const lines = s.split("\n"); const w = Math.max(...lines.map((l) => g.measureText(l).width)) + 70; const h = lines.length * size * 1.15 + 50;
    g.shadowColor = "rgba(60,36,12,0.35)"; g.shadowBlur = 16; g.shadowOffsetX = 8; g.shadowOffsetY = 12; cut(g, rrectP(-w / 2, -h / 2, w, h, 14), bg, { seed: Math.round(x + y), edge: 2.5, tear: 0.6 }); g.shadowColor = "transparent";
    lines.forEach((l, i) => inkText(g, l, 0, -h / 2 + 25 + size * 0.6 + i * size * 1.15, size, color)); g.restore(); }} />
);
const bagPose = (p: Pose): Pose => ({ bag: true, talk: 0, ...p });
const sky = (g: G) => cut(g, rectP(-400, -600, 1880, 3000), "#BFE6F5", { tear: 0, noEdge: true, sort: "water" });
// сцены-заготовки
const Nassau: React.FC<{ cam?: any; dusk?: boolean; children?: React.ReactNode; shake?: (t: number) => number }> = ({ cam = [[0, 0, 0, 1]], dusk = false, children, shake }) => (
  <Stage cam={cam} bg={dusk ? "#3A2A3E" : "#CFF1F7"} light={dusk ? "dusk" : "day"} rays={dusk ? 0 : 0.3} shake={shake}>
    <Plane z={40} dyn shadow={0} draw={dusk ? (g) => { const gr = g.createLinearGradient(0, -200, 0, 1200); gr.addColorStop(0, "#2A2238"); gr.addColorStop(0.6, "#8A3A3A"); gr.addColorStop(1, "#E07A4A"); cut(g, rectP(-400, -400, 1880, 2700), gr as any, { tear: 0, noEdge: true, sort: "water" }); } : seaSky("day")} />
    <Plane z={18} draw={wave(1000, 10, dusk ? "#2A3A5A" : "#3FA7D6", 0, 0.6, 2)} dyn shadow={0.1} />
    {dusk ? <Plane z={14} draw={gallows(760, 1010)} shadow={0} /> : <Plane z={14} draw={frigate({ x: 260, y: 1010, s: 0.55 })} dyn />}
    <Plane z={10} draw={harbor} />
    <Plane z={6} draw={dock} />
    {children}
  </Stage>
);
const Sea: React.FC<{ cam?: any; tod?: "day" | "storm" | "gold"; children?: React.ReactNode; shake?: (t: number) => number }> = ({ cam = [[0, 0, 0, 1]], tod = "day", children, shake }) => (
  <Stage cam={cam} bg={tod === "storm" ? "#B9C6CF" : "#CFF1F7"} light={tod === "storm" ? "dusk" : tod === "gold" ? "gold" : "day"} shake={shake}>
    <Plane z={40} draw={seaSky(tod)} dyn shadow={0} />
    <Plane z={16} draw={wave(1050, tod === "storm" ? 22 : 12, tod === "storm" ? "#3C7FA8" : "#3FA7D6", 1, 1, 3)} dyn shadow={0.1} />
    {children}
  </Stage>
);
const Deck: React.FC<{ cam?: any; children?: React.ReactNode }> = ({ cam = [[0, 0, 0, 1]], children }) => (
  <Stage cam={cam} bg="#FFE29A" light="gold" rays={0.4}>
    <Plane z={40} draw={seaSky("gold")} dyn shadow={0} />
    <Plane z={18} draw={wave(1000, 12, "#3FA7D6", 0, 0.6, 2)} dyn shadow={0.1} />
    <Plane z={12} draw={sails} />
    <Plane z={6.5} draw={deck} />
    {children}
  </Stage>
);
const boat = (g: G) => cut(g, [[300, 1580], [780, 1580], [720, 1700], [360, 1700]], "#8A5A34", { seed: 920, sort: "kraft", rim: 0.5 });
const oar = (t: number) => (g: G) => { const a = Math.sin(t * 5) * 0.5; g.save(); g.translate(560, 1430); g.rotate(0.9 + a); cut(g, rrectP(-8, 0, 16, 360, 6), "#B07A48", { seed: 925, sort: "kraft" }); cut(g, rrectP(-28, 330, 56, 120, 20), "#B07A48", { seed: 926, sort: "kraft" }); g.restore(); };
const hardtack = (g: G, t: number) => { g.save(); g.translate(540, 820); g.rotate(-0.08); cut(g, rrectP(-300, -260, 600, 520, 70), "#D9B47A", { seed: 930, sort: "kraft", rim: 0.5, edge: 3 });
  const r = rng(4); for (let i = 0; i < 16; i++) fillP(g, ellP(-240 + (i % 4) * 160, -190 + Math.floor(i / 4) * 125, 13, 13, 12), "#8A6440", 0.8); for (let i = 0; i < 9; i++) fillP(g, ellP(-260 + r() * 520, -230 + r() * 460, 8, 5, 10), "#A87F4A", 0.6);
  const P: Pt[] = []; const Q: Pt[] = []; for (let k = 0; k <= 14; k++) { const u = k / 14; const x = 60 + u * 230; const y = 40 - Math.sin(u * 7 + t * 8) * 26 * u - u * 150; P.push([x, y - 13]); Q.unshift([x, y + 13]); }
  cut(g, [...P, ...Q], "#F2C4C4", { seed: 931, sort: "felt", edge: 1.5 }); const hx = 290, hy = 40 - Math.sin(7 + t * 8) * 26 - 150; fillP(g, ellP(hx - 6, hy - 6, 4, 4, 8), PAL.ink); fillP(g, ellP(hx + 6, hy - 6, 4, 4, 8), PAL.ink); g.restore(); };
const island = (g: G) => { cut(g, ellP(540, 1380, 900, 260, 40), "#F2D597", { seed: 940, sort: "kraft", rim: 0.4 });
  g.save(); g.translate(180, 1240); cut(g, [[-14, 0], [-6, -460], [8, -460], [16, 0]], "#9C6B3E", { seed: 941, sort: "kraft" }); for (let i = 0; i < 6; i++) { g.save(); g.translate(0, -460); g.rotate(-2.6 + i * 0.75); cut(g, ellP(0, -110, 34, 120, 16), i % 2 ? "#4E8A3C" : "#6FA84E", { seed: 942 + i, sort: "kraft" }); g.restore(); } g.restore(); };
const shipFrame = (p: number) => (g: G) => { const n = Math.floor(2 + p * 7); cut(g, rectP(340, 1210, 620, 26), "#7A4E2E", { seed: 950, sort: "kraft" }); for (let i = 0; i < n; i++) { const x = 360 + i * 70; cut(g, [[x, 1215], [x - 10 - Math.sin(i / 8 * Math.PI) * 30, 1040], [x + 8 - Math.sin(i / 8 * Math.PI) * 30, 1040], [x + 14, 1215]], "#9C6B3E", { seed: 951 + i, sort: "kraft" }); } };

// ---------------------------------------------------------------- ПРОЛЁТ к фрегату Пистолетова
const FlyIn: React.FC<{ fly: number; xf?: number; children: React.ReactNode }> = ({ fly, xf = 0.6, children }) => (
  <>
    <CanvasArt draw={(g, tt) => { const u = eio(tt / fly); const Sc = 0.5 * Math.pow(2.9 / 0.5, u); const fx = -40 * u, fy = -260 + 170 * u;
      seaSky("gold")(g, tt);
      g.save(); g.translate(540, 960); g.scale(Math.pow(Sc, 0.35), Math.pow(Sc, 0.35)); g.translate(-540, -960); wave(1180, 14, "#3FA7D6", 0, 0.6, 2)(g, tt); g.restore();
      g.save(); g.translate(540, 1080); g.scale(Sc, Sc); g.translate(-fx, -fy); frigate({ x: 0, y: 0, s: 1, flag: "pist" })(g, tt);
      g.save(); g.translate(-90, -42 + Math.sin(tt * 1.4) * 8); g.scale(0.62, 0.62); extra(g, pistoletov, { emo: "smile", aL: [1.45, 1.65], aR: [1.45, 1.65], t: tt }); g.restore();
      g.save(); g.translate(60, -42 + Math.sin(tt * 1.4) * 8); g.scale(0.58, 0.58); sema(g, "casual", { emo: "smile", bag: true, t: tt }); g.restore(); g.restore();
      g.save(); g.translate(540, 960); g.scale(Math.pow(Sc, 0.8), Math.pow(Sc, 0.8)); g.translate(-540, -960); wave(1380, 22, "#2F8FC4", 2, 1, 4)(g, tt); g.restore(); }} />
    <Sequence from={f(fly - xf)}><FadeZoom dur={1.6} xf={xf}>{children}</FadeZoom></Sequence>
  </>
);
const FadeZoom: React.FC<{ dur: number; xf: number; children: React.ReactNode }> = ({ dur, xf, children }) => (
  <CanvasArtless render={(t) => <AbsoluteFill style={{ opacity: Math.min(1, t / xf), transform: `scale(${1.25 - 0.25 * eio(t / dur)})` }}>{children}</AbsoluteFill>} />
);
const CanvasArtless: React.FC<{ render: (t: number) => React.ReactNode }> = ({ render }) => { const t = useCurrentFrame() / FPS; return <>{render(t)}</>; };

// ---------------------------------------------------------------- музыка: громкость песни по времени ролика
// Решение пользователя: до встречи двух фрегатов песни НЕ слышно; со встречи — фон тише прежнего (0,03 ≈ −30 дБ);
// припев — в 2 раза тише прежнего (0,31 вместо 0,62).
const BED = 0.03, PEAK = 0.31, BED_IN = S[14].s - 0.3;
const songVol = (fr: number) => { const t = fr / FPS; return interpolate(t, [0, BED_IN, BED_IN + 1.2, TQ - 1.3, TQ, TQ + CH_LEN, TQ + CH_LEN + FADE], [0, 0, BED, BED, PEAK, PEAK, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }); };

export const Ep02: React.FC = () => (
  <AbsoluteFill style={{ background: "#FFD43B" }}>
    <Audio src={staticFile("ep02/voice.mp3")} />
    <Audio src={staticFile("ep02/song.mp3")} startFrom={f(CHORUS - TQ)} volume={songVol} />
    {/* 1. ЗАКАЗ */}
    <Sequence {...shot(0)}><AbsoluteFill style={VIV}>
      <CanvasArt draw={(g, t) => { g.save(); const z = 1 + t * 0.012; g.translate(540, 960); g.scale(z, z); g.translate(-540, -960);
        appScreen(g, t, { rows: [["Лимоны", "× 20"], ["Пицца", "× 1"]], addr: "Карибское море,\nфрегат", date: "1718 год", client: "Кап. Пистолетов", avatar: "pistoletov", finger: keys(t, [[0, 0], [0.6, 1]]) }); g.restore(); }} />
      <Sticker s={"КООРДИНАТЫ\nМЕНЯЮТСЯ"} x={810} y={1090} at={wt(0, 7) - 0.1} rot={0.1} size={40} />
    </AbsoluteFill></Sequence>
    {/* 2–3. ПРИНЯТЬ → экран рвётся → Нассау после бури, Сёма падает мокрый */}
    <Sequence {...shot(1, 3)}><AbsoluteFill style={VIV}>
      <Portal at={0.8} before={<CanvasArt draw={(g, t) => appScreen(g, t, { rows: [["Лимоны", "× 20"], ["Пицца", "× 1"]], addr: "Карибское море,\nфрегат", date: "1718 год", client: "Кап. Пистолетов", avatar: "pistoletov", press: keys(t, [[0.25, 0], [0.45, 1]]) })} />}
        after={<Nassau cam={[[0, 0, 0, 1.0], [3, 0, -30, 1.05]]} shake={Camera.shake(1.45, 18)}>
          <Extra spec={pirate(97, "#E07B39")} x={160} y={1560} s={3.9} z={5.6} pose={(t) => ({ emo: t > 1.5 ? "shock" : "calm", look: [1, 0], aR: t > 1.5 ? [1.9, 0.3] : [0.1, 0.1] })} />
          <Sema outfit="casual" x={600} s={4.5} y={1590} pose={(t) => bagPose({ emo: t > 1.5 ? (t > 3 ? "tired" : "shock") : "fear", aL: [2.6, 0.4], aR: [2.6, 0.4], tilt: t < 1.4 ? Math.sin(t * 20) * 0.3 : 0, squash: keys(t, [[1.4, 0], [1.48, 1.6], [1.75, 0]], back), t })}
            dy={(t) => keys(t, [[0.8, -1700], [1.42, 0]], (u) => u * u)} />
        </Nassau>} />
      <Sequence from={f(1.5)}><Marks kind="crack" label="ПЛЮХ!" x={300} y={600} s={0.8} /></Sequence>
      <Sequence from={f(1.6)}><Marks kind="sweat" x={600} y={620} /></Sequence>
      <Sequence from={f(1.9)}><Tag big x={780} lines={["1718", "НАССАУ"]} /></Sequence>
    </AbsoluteFill></Sequence>
    {/* 4. ПИРАТСКАЯ РЕСПУБЛИКА */}
    <Sequence {...shot(3)}><AbsoluteFill style={VIV}>
      <Nassau cam={Camera.pan(0, 4, 140, 1.04)}>
        <Extra spec={pirate(101, "#4E8FD0")} x={130} y={1560} s={4} z={5.6} pose={(t) => ({ emo: "smile", look: [1, 0], aR: [0.4, 0.5], talk: Math.abs(Math.sin(t * 9)) * 0.4 })} />
        <Extra spec={{ ...pirate(102, "#E07B39"), hat: "tricorn" as const }} x={380} y={1560} s={4.2} z={5.4} pose={() => ({ emo: "proud", look: [1, 0], aR: [1.2, 0.4], holdR: sabre })} />
        <Extra spec={pirate(103, "#7DB848")} x={950} y={1560} s={4} z={5.6} pose={() => ({ emo: "smile", look: [-1, 0], facing: -1 })} />
        <Sema outfit="casual" x={680} s={4.4} y={1600} pose={(t) => bagPose({ emo: "curious", look: [-1, -0.3], t })} />
      </Nassau>
      <Sticker s={"РЕСПУБЛИКА\nПИРАТОВ"} x={540} y={330} at={0.5} size={60} />
      <Sticker s="КОРОЛЕЙ НЕТ" x={790} y={600} at={wt(3, 5) - 0.1} rot={0.08} size={40} bg="#FBF7EC" color={PAL.scarf} />
    </AbsoluteFill></Sequence>
    {/* 5. ВЫБОРЫ КАПИТАНА: голосуют руками */}
    <Sequence {...shot(4)}><AbsoluteFill style={VIV}>
      <Deck cam={[[0, 0, -40, 1.1], [3.7, 0, 0, 1.0]]}>
        {[0, 1, 2, 3].map((i) => <Extra key={i} spec={pirate(110 + i, ["#E07B39", "#4E8FD0", "#7DB848", "#C8A2D8"][i])} x={130 + i * 270} y={1560} s={3.9} z={5.6 - (i % 2) * 0.2}
          pose={(t) => ({ emo: "smile", aR: t > 0.4 + i * 0.15 ? [2.9, 0.1] : [0.2, 0.2], look: [0, -1] })} />)}
        <Sema outfit="casual" x={540} s={4.6} y={1700} z={4.8} pose={(t) => bagPose({ emo: t > wt(4, 3) ? "shock" : "curious", aR: t > 1 ? [2.9, 0.1] : [0.2, 0.2], t })} />
      </Deck>
      <Sticker s="ДЕМОКРАТИЯ" x={540} y={320} at={0.6} size={64} bg="#3DBE5A" color="#FFFFFF" />
      <Sticker s="ПЕРЕИЗБРАН!" x={760} y={560} at={wt(4, 5)} rot={0.1} size={44} bg={PAL.scarf} color="#FBF7EC" />
    </AbsoluteFill></Sequence>
    {/* 6. КОДЕКС: страховка за руку (мрачновато) */}
    <Sequence {...shot(5)}><AbsoluteFill style={DARK}>
      <Stage cam={Camera.push(0, 5.5, 0.06)} bg="#1A120C" light="night">
        <Plane z={12} draw={hold} shadow={0} />
        <Extra spec={{ ...pirate(120, "#5E6A70"), hat: "tricorn" as const }} x={300} y={1600} s={4.6} z={5.2} pose={(t) => ({ emo: "calm", aL: [0.2, 0.2], aR: [0.05, 0.05], look: [1, 0], talk: Math.abs(Math.sin(t * 8)) * 0.3 })} />
        <Plane z={4} dyn draw={lanternGlow(700, 460)} shadow={0} />
      </Stage>
      <Vignette a={0.6} />
      <Sticker s={"ПИРАТСКИЙ\nКОДЕКС"} x={330} y={320} at={0.3} size={50} bg="#E9D8B0" />
      <PriceTag x={780} y={700} title="Правая рука" price="600" note="пиастров" delay={wt(5, 5) - 0.2} />
    </AbsoluteFill></Sequence>
    {/* 7. ОТБОЙ в 8 — фонарь гаснет */}
    <Sequence {...shot(6)}><AbsoluteFill style={DARK}>
      <Stage cam={[[0, 0, 0, 1.05]]} bg="#1A120C" light="night">
        <Plane z={12} draw={hold} shadow={0} />
        <Sema outfit="casual" x={540} s={4.5} y={1640} pose={(t) => bagPose({ emo: t > 1.2 ? "tired" : "shock", t })} />
        <Plane z={4} dyn draw={(g, t) => { if (t < wt(6, 2)) lanternGlow(540, 430)(g, t); else { strokeP(g, [[540, -400], [540, 370]], "#1A1410", 3); cut(g, rrectP(506, 370, 68, 100, 10), "#2A2A2E", { seed: 980, edge: 1 }); } }} shadow={0} />
      </Stage>
      <Sequence from={f(wt(6, 2))}><AbsoluteFill style={{ background: "rgba(5,3,2,0.55)" }} /></Sequence>
      <Sticker s="ОТБОЙ 20:00" x={540} y={330} at={0.3} size={64} bg="#FBF7EC" />
      <Sticker s="КАК В ЛАГЕРЕ" x={760} y={560} at={wt(6, 4)} rot={0.08} size={40} />
    </AbsoluteFill></Sequence>
    {/* 8. КРУПНО: сухарь с червём */}
    <Sequence {...shot(7)}><AbsoluteFill style={VIV}>
      <AbsoluteFill style={{ background: "#E9C27A" }} />
      <CanvasArt draw={(g, t) => { g.save(); g.translate(540, 820); g.scale(1 + t * 0.04, 1 + t * 0.04); g.translate(-540, -820); hardtack(g, t); g.restore(); }} />
      <Sticker s="ГАЛЕТЫ" x={300} y={300} at={0.2} />
      <Sticker s="+ ЧЕРВИ" x={800} y={420} at={wt(7, 2) - 0.1} rot={0.1} bg={PAL.scarf} color="#FBF7EC" />
    </AbsoluteFill></Sequence>
    {/* 9. ЦИНГА — трюм, темно */}
    <Sequence {...shot(8)}><AbsoluteFill style={DARK}>
      <Stage cam={[[0, 0, 0, 1.0], [3.5, 0, -30, 1.06]]} bg="#1A120C" light="night">
        <Plane z={12} draw={hold} shadow={0} />
        <Extra spec={pirate(95, "#6E6658")} x={210} y={1480} s={4} z={5.6} pose={() => ({ emo: "tired", lean: 0.18, tilt: 0.35, aL: [0.2, 0.2], aR: [0.4, 1.0] })} />
        <Extra spec={{ ...pirate(96, "#5E6A70"), hat: "none" as const, hair: "#3A2A1E" }} x={880} y={1480} s={4} z={5.6} pose={() => ({ emo: "fear", lean: -0.12, look: [-1, 0], aR: [0.3, 0.2] })} />
        <Sema outfit="casual" x={540} s={4.4} y={1600} z={5} pose={(t) => bagPose({ emo: "fear", look: [-1, 0.3], t })} />
        <Plane z={4.6} dyn draw={rat(760, 1700)} />
        <Plane z={4} dyn draw={lanternGlow(560, 520)} shadow={0} />
      </Stage>
      <Vignette />
      <Sequence from={f(wt(8, 6) - 0.2)}><FactCallout text={"ЦИНГА:\nВЫПАДАЮТ ЗУБЫ"} x={300} y={330} to={[230, 860]} /></Sequence>
    </AbsoluteFill></Sequence>
    {/* 10. Сёма смотрит в короб — лимоны! */}
    <Sequence {...shot(9)}><AbsoluteFill style={VIV}>
      <Deck cam={Camera.push(0, 2.8, 0.07, 0, -60)}>
        <Sema outfit="casual" s={7.2} y={2250} x={540} pose={(t) => bagPose({ emo: t > wt(9, 4) ? "proud" : "curious", aR: [1.2, 0.9], holdR: lemonCrate, look: [1, 0.6], t })} />
      </Deck>
      <Sequence from={f(wt(9, 4))}><Marks kind="sparkle" x={760} y={1000} /></Sequence>
      <Sticker s="ЛИМОНЫ = ЛЕКАРСТВО" x={540} y={320} at={wt(9, 4)} size={50} bg="#3DBE5A" color="#FFFFFF" />
    </AbsoluteFill></Sequence>
    {/* 11. ЧЁРНАЯ БОРОДА — сумерки, виселица, дым */}
    <Sequence {...shot(10)}><AbsoluteFill style={{ filter: "saturate(1.15) contrast(1.1)" }}>
      <Nassau dusk cam={[[0, 0, 0, 1.08], [4.5, 0, -40, 1.16]]}>
        <Plane z={5.6} dyn draw={smokePuffs(330, 900, 7, 9)} shadow={0} />
        <Extra spec={blackbeard} x={330} y={1580} s={5} z={5.2} pose={(t) => ({ emo: "calm", aR: [0.3, 0.2], holdL: sabre, aL: [0.5, 0.5], look: [1, 0.2], t: t + 0.5 })} />
        <Sema outfit="casual" x={820} s={4.3} y={1600} pose={(t) => bagPose({ emo: "fear", look: [-1, 0], t })} />
      </Nassau>
      <AbsoluteFill style={{ background: "radial-gradient(ellipse 75% 60% at 45% 40%, rgba(0,0,0,0) 35%, rgba(10,4,8,0.7) 100%)", mixBlendMode: "multiply" }} />
      <Sequence from={f(0.6)}><FactCallout text={"1718: В НАССАУ\nВЕШАЮТ ПИРАТОВ"} x={700} y={330} to={[800, 640]} rot={0.05} /></Sequence>
      <Sequence from={f(wt(10, 5) - 0.1)}><FactCallout text={"ФИТИЛИ\nВ БОРОДЕ"} x={260} y={560} to={[330, 790]} /></Sequence>
    </AbsoluteFill></Sequence>
    {/* 12. «Лимоны — мне!» — «Это заказ!» — «Это абордаж.» */}
    <Sequence {...shot(11)}><AbsoluteFill style={{ filter: "saturate(1.15) contrast(1.08)" }}>
      <Nassau dusk cam={[[0, 0, -60, 1.16], [wt(11, 4), 60, -80, 1.24]]} shake={Camera.shake(wt(11, 4), 10, 0.5)}>
        <Plane z={5.6} dyn draw={smokePuffs(330, 900, 7, 9)} shadow={0} />
        <Extra spec={blackbeard} x={330} y={1580} s={5} z={5.2} pose={(t) => ({ emo: t > wt(11, 4) ? "proud" : "calm", aR: t < wt(11, 2) ? [1.4, 0.3] : [0.3, 0.2], holdL: sabre, aL: t > wt(11, 4) ? [2.2, 0.3] : [0.5, 0.5], look: [1, 0], t: t + 0.5, talk: speak(t, [[0, wt(11, 2) - 0.1], [wt(11, 4), 3.8]]) })} />
        <Sema outfit="casual" x={790} s={4.3} y={1600} pose={(t) => bagPose({ emo: t > wt(11, 4) ? "shock" : t > wt(11, 2) ? "resolve" : "fear", look: [-1, 0], t, aL: t > wt(11, 2) && t < wt(11, 4) ? [1.6, 0.4] : [0.3, 0.2], talk: speak(t, [[wt(11, 2), wt(11, 4) - 0.1]]) })} />
      </Nassau>
      <Vignette a={0.5} />
      <Sequence from={f(wt(11, 4))}><Marks kind="crack" label="АБОРДАЖ!" x={540} y={400} s={0.85} /></Sequence>
    </AbsoluteFill></Sequence>
    {/* 13. «Вы же сами в Чарльстоне вместо золота аптечку требовали!» */}
    <Sequence {...shot(12)}><AbsoluteFill style={{ filter: "saturate(1.15) contrast(1.08)" }}>
      <Nassau dusk cam={[[0, 120, -60, 1.2]]}>
        <Extra spec={blackbeard} x={330} y={1580} s={5} z={5.2} pose={(t) => ({ emo: t > 1.6 ? "facepalm" : "shock", aL: [0.5, 0.5], holdL: sabre, aR: t > 1.6 ? [2.6, 1.9] : [0.3, 0.2], look: [1, 0], t: t + 0.5 })} />
        <Sema outfit="casual" x={790} s={4.3} y={1600} pose={(t) => bagPose({ emo: "resolve", look: [-1, 0], aL: [1.9, 0.6], t, talk: speak(t, [[0, 3]]) })} />
      </Nassau>
      <Sticker s={"1718, ЧАРЛЬСТОН:\nВЫКУП — АПТЕЧКА"} x={540} y={330} at={wt(12, 4)} size={46} bg="#FBF7EC" color={PAL.scarf} />
    </AbsoluteFill></Sequence>
    {/* 14. Сёма гребёт к клиенту */}
    <Sequence {...shot(13)}><AbsoluteFill style={VIV}>
      <Sea cam={Camera.pan(0, 2.5, 120, 1.02)}>
        <Plane z={12} draw={frigate({ x: 860, y: 1060, s: 0.5, flag: "pist" })} dyn />
        <Plane z={8} draw={wave(1220, 20, "#2F8FC4", 2, 1, 4)} dyn />
        <Sema outfit="casual" x={540} s={4.3} y={1640} z={5} pose={(t) => bagPose({ emo: "resolve", aL: [1.4 + Math.sin(t * 5) * 0.4, 0.6], aR: [1.4 + Math.sin(t * 5) * 0.4, 0.6], t })} />
        <Plane z={4.9} dyn draw={(g, t) => oar(t)(g)} />
        <Plane z={4.8} draw={boat} />
        <Plane z={4.5} draw={wave(1660, 22, "#2A6690", 3, 1.2, 5)} dyn />
      </Sea>
      <Sticker s="КЛИЕНТ: 2 МИЛИ" x={540} y={320} at={0.4} size={54} bg="#3DBE5A" color="#FFFFFF" />
    </AbsoluteFill></Sequence>
    {/* 15. Встречаются два фрегата */}
    <Sequence {...shot(14)}><AbsoluteFill style={VIV}>
      <Sea cam={[[0, 0, 0, 1.0], [1.8, 0, -20, 1.06]]}>
        <Plane z={12} dyn draw={(g, t) => frigate({ x: 160 + t * 60, y: 1060, s: 0.62, flag: "jolly", hull: "#3A2A24" })(g, t)} />
        <Plane z={12} dyn draw={(g, t) => frigate({ x: 920 - t * 60, y: 1080, s: 0.62, flag: "pist" })(g, t)} />
        <Plane z={8} draw={wave(1240, 22, "#2F8FC4", 2, 1, 4)} dyn />
      </Sea>
      <Sequence from={f(wt(14, 3))}><Marks kind="bang" x={540} y={700} /></Sequence>
    </AbsoluteFill></Sequence>
    {/* 16. БОЙ: пушки, картечь, сабли — Сёма проносит заказ */}
    <Sequence {...shot(15)}><AbsoluteFill style={VIV}>
      <Sea tod="storm" cam={[[0, 0, 0, 1.05], [3.9, 0, -40, 1.12]]} shake={(t) => (Math.floor(t * 2.5) % 2 ? 8 : 0)}>
        <Plane z={12} draw={frigate({ x: 560, y: 1060, s: 0.8, fire: 1 })} dyn />
        <Plane z={11} draw={smokePuffs(560, 900, 6, 4)} dyn shadow={0} />
        <Plane z={8} draw={wave(1220, 30, "#2F6F98", 2, 1.2, 4)} dyn />
        <Plane z={7} dyn draw={(g, t) => cannonball(1100 - ((t * 900) % 1500), 600 + Math.sin(t * 3) * 60)(g)} />
        <Sema outfit="casual" x={540} s={4.3} y={1640 + 0} z={5} pose={(t) => bagPose({ emo: "fear", squash: 0.6 + Math.sin(t * 7) * 0.3, aL: [2.6, 0.4], aR: [2.6, 0.4], t })} />
        <Plane z={4.8} draw={boat} />
        <Plane z={4.5} draw={wave(1660, 26, "#2A6690", 3, 1.4, 5)} dyn />
      </Sea>
      <Marks kind="crack" label="БАБАХ!" x={760} y={420} s={0.8} />
      <Sequence from={f(wt(15, 3))}><Marks kind="crack" label="ДЗЫНЬ!" x={300} y={640} s={0.7} /></Sequence>
    </AbsoluteFill></Sequence>
    {/* 17. ОСЬМИНОГ — шторм, мрачно */}
    <Sequence {...shot(16)}><AbsoluteFill style={{ filter: "saturate(1.1) contrast(1.1)" }}>
      <Sea tod="storm" cam={[[0, 0, -40, 1.12], [3.2, 0, 0, 1.0]]}>
        <Plane z={12} draw={frigate({ x: 560, y: 1060, s: 0.8, fire: 0.6, broken: 0.1 })} dyn />
        <Plane z={10} dyn draw={(g, t) => tentacles(keys(t, [[0, 0], [1.8, 0.85]]), 560, 1250)(g, t)} />
        <Plane z={7.5} dyn draw={(g, t) => { if (t > wt(16, 4) - 0.3) octoEye(880, 1260 + keys(t, [[wt(16, 4) - 0.3, 300], [wt(16, 4) + 0.2, 0]], back), 1.0)(g); }} />
        <Plane z={8} draw={wave(1220, 30, "#2F6F98", 2, 1.2, 4)} dyn />
        <Sema outfit="casual" x={540} s={4.3} y={1640} z={5} pose={(t) => bagPose({ emo: "shock", aL: [2.6, 0.4], aR: [2.6, 0.4], t })} />
        <Plane z={4.8} draw={boat} />
        <Plane z={4.5} draw={wave(1660, 26, "#2A6690", 3, 1.4, 5)} dyn />
      </Sea>
      <Vignette a={0.5} />
      <Sticker s={"КРАКЕН — ЛЕГЕНДА.\nКАЛЬМАРЫ ДО 12 М — НЕТ"} x={540} y={320} at={wt(16, 4)} size={40} bg="#FBF7EC" />
    </AbsoluteFill></Sequence>
    {/* 18. Фрегат — на дно. КЛИЕНТ НЕ НАЙДЕН */}
    <Sequence {...shot(17)}><AbsoluteFill style={{ filter: "saturate(0.95) contrast(1.12) brightness(0.9)" }}>
      <Sea tod="storm" cam={[[0, 0, 0, 1.05]]}>
        <Plane z={12} dyn draw={(g, t) => frigate({ x: 560, y: 1060 + keys(t, [[0, 0], [2.8, 520]]), s: 0.8, broken: keys(t, [[0, 0.15], [2.8, 0.9]]) })(g, t)} />
        <Plane z={10} dyn draw={(g, t) => tentacles(0.9, 560, 1250 + keys(t, [[0, 0], [2.8, 300]]))(g, t)} />
        <Plane z={8} draw={wave(1220, 30, "#2F6F98", 2, 1.2, 4)} dyn />
      </Sea>
      <Vignette />
      <Sticker s="КЛИЕНТ НЕ НАЙДЕН" x={540} y={330} at={wt(17, 4) - 0.1} size={54} bg={PAL.scarf} color="#FBF7EC" />
    </AbsoluteFill></Sequence>
    {/* 19. Остров: строят новый корабль */}
    <Sequence {...shot(18)}><AbsoluteFill style={VIV}>
      <Sea cam={Camera.push(0, 3.8, 0.05)}>
        <Plane z={10} draw={island} />
        <Plane z={9} dyn draw={(g, t) => shipFrame(keys(t, [[0, 0], [3.5, 1]]))(g)} />
        <Extra spec={pirate(130, "#E07B39")} x={330} y={1480} s={3.4} z={6} pose={(t) => ({ emo: "resolve", aR: [2.2 + Math.sin(t * 10) * 0.5, 0.4], look: [1, 0] })} />
        <Extra spec={pistoletov} x={760} y={1500} s={3.6} z={5.8} pose={(t) => ({ emo: "resolve", aR: [2.4, 0.3], aL: [0.4, 0.4], look: [-1, 0] })} />
        <Sema outfit="casual" x={540} s={4.2} y={1680} z={5} pose={(t) => bagPose({ emo: "tired", look: [0, 0], t })} />
      </Sea>
      <Sticker s="ЗАДЕРЖКА +3 НЕДЕЛИ" x={540} y={320} at={0.5} size={50} bg="#2E3A57" color="#FBF7EC" />
      <Sticker s="ПРОЧНЕЕ" x={800} y={560} at={wt(18, 7) - 0.1} rot={0.1} size={44} />
    </AbsoluteFill></Sequence>
    {/* 20. РЕВАНШ: пушки по осьминогу, лимон в глаз */}
    <Sequence {...shot(19)}><AbsoluteFill style={VIV}>
      <Sea tod="day" cam={[[0, 0, 0, 1.0], [wt(19, 3), -60, -40, 1.1]]} shake={Camera.shake(wt(19, 2), 14, 0.5)}>
        <Plane z={10} dyn draw={(g, t) => tentacles(0.6, 640, 1300)(g, t)} />
        <Plane z={9} dyn draw={(g, t) => octoEye(700, 1180, 1.05, t > wt(19, 5) ? 1 : 0)(g)} />
        <Plane z={8} draw={wave(1240, 22, "#2F8FC4", 2, 1, 4)} dyn />
        <Plane z={6} dyn draw={(g, t) => { if (t > wt(19, 1)) smokePuffs(160, 1100, 5, 13)(g, t - wt(19, 1)); }} shadow={0} />
        <Plane z={5.5} dyn draw={(g, t) => { const u = (t - wt(19, 3) + 0.4) / 0.4; if (u > 0 && u < 1) lemon(g, 200 + u * 440, 1500 - u * 340 - Math.sin(u * Math.PI) * 200, 3, 990); }} />
        <Sema outfit="casual" x={200} s={4.4} y={1700} z={5} pose={(t) => bagPose({ emo: t > wt(19, 5) ? "proud" : "resolve", aR: t > wt(19, 3) - 0.4 && t < wt(19, 3) ? [2.6, 0.3] : [1.2, 0.6], look: [1, -0.5], t })} />
      </Sea>
      <Sequence from={f(wt(19, 2))}><Marks kind="crack" label="БАХ!" x={300} y={600} s={0.8} /></Sequence>
      <Sequence from={f(wt(19, 5))}><Marks kind="crack" label="КИСЛО!" x={760} y={760} s={0.9} /></Sequence>
    </AbsoluteFill></Sequence>
    {/* 21–22. ПРОЛЁТ к фрегату Пистолетова → палуба: «Пять звёзд», чаевые 1 дублон */}
    <Sequence {...shot(20, 22)}><AbsoluteFill style={VIV}>
      <FlyIn fly={st(21) - st(20) + 1.0}>
        <Deck>
          <Extra spec={pirate(93, "#E07B39")} x={120} y={1500} s={3.6} z={5.8} pose={(t) => ({ emo: "smile", aR: [2.4 + Math.sin(t * 6) * 0.3, 0.5], look: [1, 0] })} />
          <Extra spec={pirate(94, "#4E8FD0")} x={960} y={1500} s={3.6} z={5.8} pose={(t) => ({ emo: "smile", aL: [2.4 + Math.sin(t * 6 + 1) * 0.3, 0.5], look: [-1, 0], facing: -1 })} />
          <Extra spec={pistoletov} x={370} y={1620} s={5} z={5.1} pose={() => ({ emo: "smile", aL: [1.45, 1.65], aR: [1.45, 1.65], look: [0.3, 0] })} />
          <Sema outfit="casual" x={790} s={4.3} y={1630} pose={(t) => bagPose({ emo: "proud", aR: [1.2, 0.9], holdR: lemonCrate, look: [-1, 0], t })} />
        </Deck>
      </FlyIn>
      <Sequence from={f(st(21) - st(20) + wt(21, 5) - 0.2)}>
        <CanvasArt draw={(g, t) => { const k = back(t / 0.35); g.save(); g.translate(540, 330); g.rotate(-0.04); g.scale(k, k); cut(g, rrectP(-380, -90, 760, 180, 30), "#FFFFFF", { seed: 960, edge: 3, tear: 0.5 }); stars(g, -280, -10, Math.min(5, Math.floor(t * 10)), 56, 140, 961); text(g, "чаевые: 1 дублон", 0, 62, 34, "#8a8070", "Montserrat", 900); g.restore(); }} />
      </Sequence>
    </AbsoluteFill></Sequence>
    {/* 23. «Капитан, а вы какой пират? Карибский?» */}
    <Sequence {...shot(22)}><AbsoluteFill style={VIV}>
      <Deck cam={[[0, 0, -60, 1.12], [2.4, -60, -90, 1.2]]}>
        <Extra spec={pistoletov} x={370} y={1620} s={5} z={5.1} pose={(t) => ({ emo: t > wt(22, 5) ? "smile" : "curious", aL: [0.3, 0.3], aR: [0.3, 0.3], look: [1, 0] })} />
        <Sema outfit="casual" x={790} s={4.3} y={1630} pose={(t) => bagPose({ emo: "curious", look: [-1, 0], aL: [1.3, 0.5], t, talk: speak(t, [[0, 2.4]]) })} />
      </Deck>
    </AbsoluteFill></Sequence>
    {/* 24. ФИНАЛ: припев — Пистолетов поёт, команда пляшет, салют из пушек */}
    <Sequence from={f(TQ)}><AbsoluteFill style={VIV}>
      <Deck cam={[[0, 0, -40, 1.1], [CH_LEN, 0, 0, 1.0]]}>
        <Plane z={9} dyn draw={(g, t) => smokePuffs(540, 700, 6, 21)(g, t)} shadow={0} />
        <Extra spec={pirate(93, "#E07B39")} x={120} y={1500} s={3.6} z={5.8} pose={(t) => ({ emo: "smile", aR: [2.6 + Math.sin(t * 8) * 0.3, 0.4], aL: [2.6 + Math.sin(t * 8 + 1) * 0.3, 0.4], lean: Math.sin(t * 4) * 0.08 })} />
        <Extra spec={pirate(94, "#4E8FD0")} x={960} y={1500} s={3.6} z={5.8} pose={(t) => ({ emo: "smile", aR: [2.6 + Math.sin(t * 8 + 2) * 0.3, 0.4], aL: [2.6 + Math.sin(t * 8 + 3) * 0.3, 0.4], lean: Math.sin(t * 4 + 1) * 0.08, facing: -1 })} />
        <Extra spec={pistoletov} x={400} y={1620} s={5.2} z={5.1} pose={(t) => ({ emo: "smile", aL: [1.45, 1.65 + Math.sin(t * 6) * 0.15], aR: [1.45, 1.65 + Math.sin(t * 6 + 1.5) * 0.15], lean: Math.sin(t * 3) * 0.05, talk: 0.4 + Math.abs(Math.sin(t * 9)) * 0.6 })} />
        <Sema outfit="casual" x={800} s={4.3} y={1630} pose={(t) => bagPose({ emo: "smile", look: [-1, 0], aR: [2.6 + Math.sin(t * 8) * 0.25, 0.3], step: walk(t, 8), t })} />
      </Deck>
      <Marks kind="sparkle" x={400} y={700} s={0.9} />
      <Sticker s={"КУДА СЁМЕ ВЕЗТИ\nСЛЕДУЮЩИЙ ЗАКАЗ?"} x={540} y={330} at={0.6} size={52} bg="#FBF7EC" />
      <Sticker s="ПИШИ В КОММЕНТЫ!" x={540} y={1760} at={1.4} size={54} bg={PAL.scarf} color="#FBF7EC" />
      <Sequence from={f(CH_LEN)}><AbsoluteFill style={{ background: "#000", opacity: 0 }} /></Sequence>
    </AbsoluteFill></Sequence>
    <Subtitles words={W} keywords={["ЛИМОН", "ПИЦЦА", "ФРЕГАТ", "ТЫСЯЧА", "НАССАУ", "ПИРАТ", "ГОЛОСОВАНИЕМ", "ПЕРЕИЗБЕРУТ", "КОДЕКС", "ШЕСТЬСОТ", "ВОСЕМЬ", "ЧЕРВЯМИ", "ЦИНГА", "ЗУБЫ", "ЧЁРНАЯ", "ФИТИЛИ", "ЗАКАЗ", "АБОРДАЖ", "АПТЕЧКУ", "КЛИЕНТУ", "ДВА", "БОЙ", "ОСЬМИНОГ", "ДНО", "ПРОЧНЕЕ", "РЕВАНШ", "ГЛАЗ", "ПИСТОЛЕТОВ", "ЗВЁЗД", "КАРИБСКИЙ"]} />
  </AbsoluteFill>
);
