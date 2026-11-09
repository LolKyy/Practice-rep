// Пробные кадры серии «Заказ для Лейфа» (викинги) — визуал v3.1 «2D + объём», меньше размытия, больше деталей.
import React from "react";
import { AbsoluteFill, useCurrentFrame } from "remotion";
import "./fonts";
import { setVivid, PAL, cut, rrectP, inkText } from "./engine/paper";
import { Stage, Plane, FPS, eio, back } from "./engine/stage";
import { CanvasArt } from "./engine/CanvasArt";
import { Sema, Extra } from "./components/scenes";
import { Tag, Subtitles, Word } from "./components/overlays";
import { auroraSky, peaks, fjord, snowGround, longhouse, smoke, drakkar, snowfall, fogBand, sheep, tinyFolk, birds, runestone, vikingMap, fishRack, woodpile, barrels, fence, forgeGlow, boathouse } from "./components/ep03art";
setVivid(true);
const VIV: React.CSSProperties = { filter: "saturate(1.25) contrast(1.06) brightness(1.03)" };
const sub = (s: string, t0 = 0): Word[] => s.split(" ").map((w, i) => ({ w, s: t0 + i * 0.32, e: t0 + 0.3 + i * 0.32 }));
const HAIR = ["#C9A24B", "#8A4A26", "#E2C27A", "#6A4A30"];
// одежда викингов: туника с отделкой, меховая накидка, штаны с обмотками
export const viking = (seed: number, c: string, o: object = {}) => ({ seed, hat: "none" as const, hair: HAIR[seed % 4], beard: HAIR[seed % 4], tunic: c, skin: "#E8C2A0", fur: ["#8A6A4A", "#B9A68A", "#5E4A3A"][seed % 3], trim: "#C9A24B", pants: "#6E5A44", legWraps: "#B9A88A", ...o });
// Лейф Эриксон — наш дизайн (не из аниме): ~30 лет, рыжеватый (сын Эрика Рыжего), усы, мех, брошь, зелёная туника
export const leif = { seed: 140, hat: "none" as const, hair: "#B5562E", beard: "#B5562E", mustache: "#9A4422", fur: "#7A5A3E", brooch: true, tunic: "#4E6B3A", trim: "#D9B04A", pants: "#5E4A3A", legWraps: "#C9B48C", skin: "#E8C2A0" };
const Sticker: React.FC<{ s: string; x: number; y: number; at?: number; rot?: number; size?: number; color?: string; bg?: string }> = ({ s, x, y, at = 0, rot = -0.06, size = 60, color = PAL.ink, bg = "#F7D84A" }) => (
  <CanvasArt draw={(g, t) => { const k = back((t - at) / 0.3); if (k <= 0) return; g.save(); g.translate(x, y); g.rotate(rot); g.scale(k, k); g.font = `900 ${size}px Montserrat`; const L = s.split("\n"); const w = Math.max(...L.map((l) => g.measureText(l).width)) + 70; const h = L.length * size * 1.15 + 50;
    g.shadowColor = "rgba(60,36,12,0.35)"; g.shadowBlur = 16; g.shadowOffsetX = 8; g.shadowOffsetY = 12; cut(g, rrectP(-w / 2, -h / 2, w, h, 14), bg, { seed: Math.round(x + y), edge: 2.5, tear: 0.6 }); g.shadowColor = "transparent"; L.forEach((l, i) => inkText(g, l, 0, -h / 2 + 25 + size * 0.6 + i * size * 1.15, size, color)); g.restore(); }} />
);
const D = 6;
// 1 — ПОСЁЛОК: общий план с проездом (фон читается: blurK меньше)
export const V3Establish: React.FC = () => {
  const t = useCurrentFrame() / FPS; const u = eio(t / D); const turn = -0.9 + 1.4 * u;
  return (
    <AbsoluteFill style={VIV}>
      <Stage cam={[[0, -220, 40, 1.0], [D, 220, -20, 1.1]]} focus={11} bg="#BFE3EE" light="day" rays={0.2}>
        <Plane z={60} draw={auroraSky} dyn shadow={0} boil={false} blurK={3} />
        <Plane z={34} draw={peaks(980, 520, "#9FB8CC", "#F4FAFC", 11)} shadow={0.1} blurK={3} />
        <Plane z={30} dyn draw={birds} shadow={0} blurK={3} />
        <Plane z={24} draw={peaks(1060, 380, "#5E7488", "#EEF5F8", 23)} shadow={0.15} blurK={4} />
        <Plane z={20} draw={fogBand(1040, 0.45, 3)} dyn shadow={0} blurK={4} />
        <Plane z={17} draw={fjord(1080)} dyn shadow={0.1} blurK={4} />
        <Plane z={16} dyn draw={drakkar(820, 1150, 0.42, 0.2, 1, 5)} blurK={4} />
        <Plane z={15} dyn draw={drakkar(330, 1170, 0.3, 0.15, 0.8, 9)} blurK={4} />
        <Plane z={13} draw={(g) => { boathouse(560, 1250, 0.7)(g); }} blurK={4} />
        <Plane z={12} draw={snowGround(1240)} blurK={4} />
        <Plane z={11.5} dyn draw={smoke(230, 1000, 1, 2)} shadow={0} />
        <Plane z={11} dyn draw={(g, tt) => { longhouse(230, 1330, 1.0, turn, 40)(g, tt); longhouse(780, 1360, 1.15, turn, 60)(g, tt); }} />
        <Plane z={11} dyn draw={smoke(780, 1000, 1.1, 7)} shadow={0} />
        <Plane z={10.8} dyn draw={(g, tt) => { fishRack(470, 1400, 0.9)(g, tt); woodpile(1020, 1420, 0.9)(g); barrels(80, 1420, 0.8)(g); forgeGlow(600, 1380)(g, tt); }} />
        <Plane z={10.2} dyn draw={(g, tt) => { fence(-40, 300, 1560)(g); tinyFolk(520, 1470, 1.2, "#8A3A2A", 1, 1)(g, tt); tinyFolk(1010, 1490, 1.2, "#3E5A7A", 4)(g, tt); tinyFolk(-20, 1480, 1.1, "#6E7A3A", 6, 1)(g, tt); sheep(140, 1530, 1.2, 7)(g, tt); sheep(680, 1550, 1.1, 9)(g, tt); sheep(900, 1570, 1, 11)(g, tt); }} />
        <Plane z={9} draw={snowGround(1660, "#F4FAFC")} />
        <Plane z={8} dyn draw={snowfall(60, 4, 90, 21, 0.7)} shadow={0} />
        <Extra spec={viking(31, "#3E5A7A", { hat: "nasal" })} x={360} y={1640} s={3.4} z={10.5} pose={() => ({ emo: "curious", look: [1, 0], aR: [0.4, 0.4] })} />
        <Sema outfit="casual" z={10.5} x={640} s={3.6} y={1660} pose={(tt) => ({ emo: tt > 3.2 ? "shock" : "curious", bag: true, look: [-1, 0], t: tt, aL: [0.4, 0.3], aR: [0.4, 0.3] })} />
        <Plane z={4} dyn draw={snowfall(26, 9, 160, 33, 0.9)} shadow={0} />
        <Plane z={3} draw={runestone(980, 1950, 1.6)} blurK={6} />
        <Plane z={2.6} dyn draw={snowfall(10, 18, 260, 45, 0.85)} shadow={0} />
      </Stage>
      <Tag big x={780} lines={["1000 ГОД", "ГРЕНЛАНДИЯ"]} delay={0.8} />
      <Subtitles words={sub("…И ПАДАЕТ В СНЕГ. ПРЯМО К ВИКИНГАМ.", 3)} keywords={["ВИКИНГАМ"]} />
    </AbsoluteFill>
  );
};
// 2 — КАРТА МИРА ВИКИНГОВ: Ёрмунганд в море, маршрут до Винланда
export const V3Map: React.FC = () => {
  const t = useCurrentFrame() / FPS;
  return (
    <AbsoluteFill style={VIV}>
      <Stage cam={[[0, 0, 40, 0.86], [4, 0, 40, 0.92]]} focus={6} bg="#E9D2A4" light="indoor">
        <Plane z={6} dyn draw={(g, tt) => vikingMap(eio(tt / 3.5))(g, tt)} />
      </Stage>
      <Sticker s="ВИНЛАНД = АМЕРИКА" x={540} y={170} at={2.4} size={50} bg={PAL.scarf} color="#FBF7EC" />
      <Subtitles words={sub("НОВУЮ ЗЕМЛЮ НАЗВАЛИ ВИНЛАНД.", 0.5)} keywords={["ВИНЛАНД"]} />
    </AbsoluteFill>
  );
};
// 3 — МИФ vs ПРАВДА: рогатый шлем
export const V3Horns: React.FC = () => (
  <AbsoluteFill style={VIV}>
    <Stage cam={[[0, 0, 0, 1.0]]} focus={6} bg="#BFE3EE" rays={0.2}>
      <Plane z={40} draw={auroraSky} dyn shadow={0} blurK={3} />
      <Plane z={24} draw={peaks(1060, 380, "#5E7488", "#EEF5F8", 23)} blurK={3} />
      <Plane z={12} draw={snowGround(1300)} blurK={3} />
      <Extra spec={viking(41, "#7A3A2A", { hat: "horns" })} x={280} y={1560} s={4.6} z={6} pose={() => ({ emo: "proud", aR: [2.5, 0.4], look: [1, 0] })} />
      <Extra spec={viking(42, "#3E5A7A", { hat: "nasal" })} x={800} y={1560} s={4.6} z={6} pose={() => ({ emo: "calm", aR: [0.4, 0.4], look: [-1, 0] })} />
    </Stage>
    <CanvasArt draw={(g, t) => { const k = back((t - 0.6) / 0.25); if (k <= 0) return; g.save(); g.translate(280, 820); g.rotate(-0.3); g.scale(k, k); g.lineWidth = 26; g.strokeStyle = "rgba(200,53,43,0.9)"; g.beginPath(); g.moveTo(-200, -200); g.lineTo(200, 200); g.moveTo(200, -200); g.lineTo(-200, 200); g.stroke(); g.restore(); }} />
    <Sticker s="МИФ" x={280} y={330} at={0.2} size={70} bg={PAL.scarf} color="#FBF7EC" />
    <Sticker s="КАК БЫЛО" x={800} y={330} at={0.9} size={60} bg="#3DBE5A" color="#FFFFFF" rot={0.05} />
    <Sticker s={"рога придумали\nв XIX веке"} x={540} y={560} at={1.4} size={36} bg="#FBF7EC" rot={0.02} />
    <Subtitles words={sub("НИКАКИХ РОГАТЫХ ШЛЕМОВ.", 0.2)} keywords={["РОГАТЫХ"]} />
  </AbsoluteFill>
);
// 4 — ПРИЧАЛ: Лейф Эриксон у драккара, Сёма с попкорном
export const V3Leif: React.FC = () => (
  <AbsoluteFill style={VIV}>
    <Stage cam={[[0, 0, 0, 1.0], [3, 0, -30, 1.05]]} focus={6} bg="#BFE3EE" rays={0.25}>
      <Plane z={40} draw={auroraSky} dyn shadow={0} blurK={3} />
      <Plane z={26} draw={peaks(1000, 420, "#7F98AE", "#F4FAFC", 31)} blurK={3} />
      <Plane z={18} draw={fjord(1020)} dyn blurK={3} />
      <Plane z={12} dyn draw={drakkar(560, 1180, 1.05, 0.35, 1, 3)} blurK={3} />
      <Plane z={9} draw={(g) => { cut(g, [[-400, 1330], [1480, 1300], [1480, 2400], [-400, 2400]], "#8A6A4A", { seed: 1600, sort: "kraft", tear: 0.6 }); }} blurK={3} />
      <Plane z={8} dyn draw={(g, tt) => { barrels(980, 1420, 0.9)(g); fishRack(120, 1430, 0.9)(g, tt); }} blurK={3} />
      <Extra spec={leif} x={330} y={1600} s={5} z={5.6} pose={() => ({ emo: "smile", aR: [0.5, 0.4], aL: [0.3, 0.3], look: [1, 0], talk: 0.4 })} />
      <Sema outfit="casual" x={790} s={4.4} y={1620} pose={(tt) => ({ emo: "proud", bag: true, aL: [1.4, 0.8], look: [-1, 0], t: tt })} />
      <Plane z={3} dyn draw={snowfall(14, 12, 180, 61, 0.8)} shadow={0} />
    </Stage>
    <Tag x={330} lines={["ЛЕЙФ ЭРИКСОН"]} />
    <Subtitles words={sub("И ВОТ ОН — ЛЕЙФ ЭРИКСОН.", 0.2)} keywords={["ЛЕЙФ"]} />
  </AbsoluteFill>
);
