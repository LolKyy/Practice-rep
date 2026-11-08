// Пробные кадры серии «Доставка на абордаж» (пираты, 1718). На согласование.
import React from "react";
import { AbsoluteFill } from "remotion";
import "./fonts";
import { setVivid, PAL, cut, rectP, rrectP, strokeP, text } from "./engine/paper";
import { Stage, Plane } from "./engine/stage";
import { CanvasArt } from "./engine/CanvasArt";
import { Sema, Extra } from "./components/scenes";
import { Subtitles, Tag, Marks, FactCallout, Word } from "./components/overlays";
import { stars } from "./components/ep01art";
import { seaSky, wave, harbor, dock, frigate, tentacles, octoEye, lemonCrate, smokePuffs, sabre, cannonball, hold, lanternGlow, rat, gallows } from "./components/ep02art";
import { useCurrentFrame, interpolate } from "remotion";
import { extra, sema } from "./engine/puppets";
import { FPS, eio } from "./engine/stage";
setVivid(true);
const sub = (s: string): Word[] => s.split(" ").map((w) => ({ w, s: 0, e: 99 }));
const VIV: React.CSSProperties = { filter: "saturate(1.35) contrast(1.06) brightness(1.04)" };
export const blackbeard = { seed: 91, hat: "tricorn" as const, bigBeard: true, tunic: "#2B2D3A", hair: "#1A1614", skin: "#D9AE86" };
export const pistoletov = { seed: 92, hat: "tricorn" as const, vest: "#7A6A55", tunic: "#E8B48E", skin: "#E8B48E", hair: "#5A3A24" };
export const pirate = (seed: number, c: string) => ({ seed, hat: "bandana" as const, tunic: c, skin: "#C99B72", beard: seed % 2 ? "#3A2A1E" : undefined });
export const deck = (g: any) => { cut(g, rectP(-400, 1200, 1880, 1000), "#B07A48", { tear: 0, sort: "kraft", noEdge: true }); for (let x = -380; x < 1500; x += 120) strokeP(g, [[x, 1200], [x - 60, 2200]], "rgba(70,40,20,0.35)", 3);
  cut(g, rectP(-400, 1080, 1880, 40), "#7A4E2E", { seed: 900, sort: "kraft" }); for (let x = -360; x < 1500; x += 90) cut(g, rrectP(x, 1110, 22, 100, 8), "#8A5A34", { seed: 901 + x }); };
export const sails = (g: any) => { cut(g, rectP(520, -400, 24, 1500), "#5A3A24", { seed: 910 }); cut(g, [[300, 80], [760, 80], [790, 560], [270, 560]], "#F4ECD8", { seed: 911, sort: "water", rim: 0.5, tear: 0.8 }); };

// 1 — НАССАУ: Чёрная Борода тянется к коробу
export const P2Frame1: React.FC = () => (
  <AbsoluteFill style={VIV}>
    <Stage cam={[[0, 0, 0, 1.0]]} bg="#CFF1F7" rays={0.3}>
      <Plane z={40} draw={seaSky("day")} dyn shadow={0} />
      <Plane z={18} draw={wave(1000, 10, "#3FA7D6", 0, 0.6, 2)} dyn shadow={0.1} />
      <Plane z={14} draw={frigate({ x: 260, y: 1010, s: 0.55 })} dyn />
      <Plane z={10} draw={harbor} />
      <Plane z={6} draw={dock} />
      <Extra spec={blackbeard} x={330} y={1580} s={4.8} z={5.2} pose={(t) => ({ emo: "calm", aR: [1.3, 0.3], holdL: sabre, aL: [0.6, 0.6], look: [1, 0], talk: 0.6, t: 0.5 })} />
      <Sema outfit="casual" x={790} s={4.5} y={1590} pose={() => ({ emo: "shock", bag: true, aL: [1.9, 0.4], aR: [1.9, 0.4], look: [-1, 0], t: 0.5, talk: 0.7 })} />
    </Stage>
    <Tag big x={790} lines={["1718", "НАССАУ"]} />
    <FactCallout text={"ФИТИЛИ\nВ БОРОДЕ"} x={260} y={330} to={[330, 790]} />
    <Subtitles words={sub("ЭТО — АБОРДАЖ.")} keywords={["АБОРДАЖ"]} />
  </AbsoluteFill>
);
// 2 — ОСЬМИНОГ против фрегата, Сёма в шлюпке с коробом
export const P2Frame2: React.FC = () => (
  <AbsoluteFill style={VIV}>
    <Stage cam={[[0, 0, 0, 1.0]]} bg="#B9C6CF" light="dusk">
      <Plane z={40} draw={seaSky("storm")} dyn shadow={0} />
      <Plane z={16} draw={wave(1050, 22, "#3C7FA8", 1, 1, 3)} dyn shadow={0.1} />
      <Plane z={12} draw={frigate({ x: 560, y: 1060, s: 0.8, fire: 1, broken: 0.25 })} dyn />
      <Plane z={11} draw={smokePuffs(560, 900, 6, 4)} dyn shadow={0} />
      <Plane z={10} draw={tentacles(0.8, 560, 1250)} dyn />
      <Plane z={7.5} draw={octoEye(880, 1260, 1.0)} />
      <Plane z={8} draw={wave(1220, 30, "#2F6F98", 2, 1.2, 4)} dyn />
      <Plane z={7} draw={cannonball(250, 640)} />
      <Sema outfit="casual" x={540} s={4.3} y={1640} z={5} pose={() => ({ emo: "fear", bag: true, aL: [2.6, 0.4], aR: [2.6, 0.4], t: 0.5 })} />
      <Plane z={4.8} draw={(g) => cut(g, [[300, 1580], [780, 1580], [720, 1700], [360, 1700]], "#8A5A34", { seed: 920, sort: "kraft", rim: 0.5 })} />
      <Plane z={4.5} draw={wave(1660, 26, "#2A6690", 3, 1.4, 5)} dyn />
    </Stage>
    <Marks kind="crack" label="БАБАХ!" x={760} y={420} s={0.8} />
    <Subtitles words={sub("ОСЬМИНОГ. ОГРОМНЫЙ.")} keywords={["ОСЬМИНОГ"]} />
  </AbsoluteFill>
);
// 3 — ДОСТАВЛЕНО: капитан Пистолетов, команда, лимоны, ★★★★★
export const P2Frame3: React.FC = () => (
  <AbsoluteFill style={VIV}>
    <Stage cam={[[0, 0, 0, 1.0]]} bg="#FFE29A" light="gold" rays={0.4}>
      <Plane z={40} draw={seaSky("gold")} dyn shadow={0} />
      <Plane z={18} draw={wave(1000, 12, "#3FA7D6", 0, 0.6, 2)} dyn shadow={0.1} />
      <Plane z={12} draw={sails} />
      <Plane z={6.5} draw={deck} />
      <Extra spec={pirate(93, "#E07B39")} x={120} y={1500} s={3.6} z={5.8} pose={() => ({ emo: "smile", aR: [2.4, 0.5], look: [1, 0] })} />
      <Extra spec={pirate(94, "#4E8FD0")} x={960} y={1500} s={3.6} z={5.8} pose={() => ({ emo: "smile", aL: [2.4, 0.5], look: [-1, 0], facing: -1 })} />
      <Extra spec={pistoletov} x={370} y={1620} s={5} z={5.1} pose={() => ({ emo: "smile", aL: [1.45, 1.65], aR: [1.45, 1.65], look: [0.3, 0], talk: 0.8 })} />
      <Sema outfit="casual" x={790} s={4.3} y={1630} pose={() => ({ emo: "smile", bag: true, aR: [1.2, 0.9], holdR: lemonCrate, look: [-1, 0], t: 0.4 })} />
    </Stage>
    <CanvasArt draw={(g) => { g.save(); g.translate(540, 330); g.rotate(-0.04); cut(g, rrectP(-380, -90, 760, 180, 30), "#FFFFFF", { seed: 960, edge: 3, tear: 0.5 }); stars(g, -280, -10, 5, 56, 140, 961); text(g, "чаевые: 1 дублон", 0, 62, 34, "#8a8070", "Montserrat", 900); g.restore(); }} />

    <Subtitles words={sub("КАПИТАН ПИСТОЛЕТОВ.")} keywords={["ПИСТОЛЕТОВ"]} />
  </AbsoluteFill>
);

// 4 — МРАЧНО: трюм, цинга. Темнота, фонарь, крысы.
export const P2Frame4: React.FC = () => (
  <AbsoluteFill style={{ filter: "saturate(1.05) contrast(1.12) brightness(0.95)" }}>
    <Stage cam={[[0, 0, 0, 1.0], [2, 0, -30, 1.05]]} bg="#1A120C" light="night">
      <Plane z={12} draw={hold} shadow={0} />
      <Extra spec={pirate(95, "#6E6658")} x={210} y={1480} s={4} z={5.6} pose={() => ({ emo: "tired", lean: 0.18, tilt: 0.35, aL: [0.2, 0.2], aR: [0.4, 1.0] })} />
      <Extra spec={{ ...pirate(96, "#5E6A70"), hat: "none" as const, hair: "#3A2A1E" }} x={880} y={1480} s={4} z={5.6} pose={() => ({ emo: "fear", lean: -0.12, look: [-1, 0], aR: [0.3, 0.2] })} />
      <Sema outfit="casual" x={540} s={4.4} y={1600} z={5} pose={() => ({ emo: "fear", bag: true, aL: [0.4, 0.3], aR: [0.4, 0.3], look: [-1, 0.3], t: 0.4 })} />
      <Plane z={4.6} dyn draw={rat(760, 1700)} />
      <Plane z={4} dyn draw={lanternGlow(560, 520)} shadow={0} />
    </Stage>
    <AbsoluteFill style={{ background: "radial-gradient(ellipse 70% 55% at 52% 35%, rgba(0,0,0,0) 30%, rgba(8,4,2,0.75) 100%)" }} />
    <FactCallout text={"ЦИНГА:\nВЫПАДАЮТ ЗУБЫ"} x={300} y={330} to={[230, 860]} />
    <Subtitles words={sub("ГЛАВНЫЙ ВРАГ ПИРАТА — ЦИНГА.")} keywords={["ЦИНГА"]} />
  </AbsoluteFill>
);
// 5 — МРАЧНО: Нассау в сумерках, виселица, Чёрная Борода в дыму
export const P2Frame5: React.FC = () => (
  <AbsoluteFill style={{ filter: "saturate(1.15) contrast(1.1)" }}>
    <Stage cam={[[0, 0, 0, 1.08], [2, 0, -40, 1.14]]} bg="#3A2A3E" light="dusk">
      <Plane z={40} draw={(g, t) => { const gr = g.createLinearGradient(0, -200, 0, 1200); gr.addColorStop(0, "#2A2238"); gr.addColorStop(0.6, "#8A3A3A"); gr.addColorStop(1, "#E07A4A"); cut(g, rectP(-400, -400, 1880, 2700), gr as any, { tear: 0, noEdge: true, sort: "water" }); }} shadow={0} />
      <Plane z={18} draw={wave(1000, 10, "#2A3A5A", 0, 0.6, 2)} dyn shadow={0} />
      <Plane z={14} draw={gallows(760, 1010)} shadow={0} />
      <Plane z={10} draw={harbor} />
      <Plane z={6} draw={dock} />
      <Plane z={5.6} dyn draw={smokePuffs(330, 900, 7, 9)} shadow={0} />
      <Extra spec={blackbeard} x={330} y={1580} s={5} z={5.2} pose={(t) => ({ emo: "calm", aR: [0.3, 0.2], holdL: sabre, aL: [0.5, 0.5], look: [1, 0.2], t: t + 0.5 })} />
      <Sema outfit="casual" x={820} s={4.3} y={1600} pose={() => ({ emo: "fear", bag: true, aL: [0.3, 0.2], aR: [0.3, 0.2], look: [-1, 0], t: 0.4 })} />
    </Stage>
    <AbsoluteFill style={{ background: "radial-gradient(ellipse 75% 60% at 45% 40%, rgba(0,0,0,0) 35%, rgba(10,4,8,0.7) 100%)", mixBlendMode: "multiply" }} />
    <FactCallout text={"1718: В НАССАУ\nВЕШАЮТ ПИРАТОВ"} x={700} y={330} to={[800, 640]} rot={0.05} />
    <Subtitles words={sub("ТУТ ПОЯВЛЯЕТСЯ ЧЁРНАЯ БОРОДА.")} keywords={["ЧЁРНАЯ"]} />
  </AbsoluteFill>
);
// ПРОЛЁТ: общий план фрегата в море → камера плавно летит к палубе → основной план (палуба, Пистолетов)
const FLY = 3.4, XF = 0.6;
export const P2FlyIn: React.FC = () => {
  const t = useCurrentFrame() / FPS; const u = eio(t / FLY);
  const S = 0.5 * Math.pow(2.9 / 0.5, u); // экспоненциальный зум — ощущение «полёта»
  const fx = -40 * u, fy = -260 + 170 * u;
  const deckOp = interpolate(t, [FLY - XF, FLY], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  return (
    <AbsoluteFill style={VIV}>
      <CanvasArt draw={(g, tt) => {
        seaSky("gold")(g, tt);
        g.save(); g.translate(540, 960); g.scale(Math.pow(S, 0.35), Math.pow(S, 0.35)); g.translate(-540, -960); wave(1180, 14, "#3FA7D6", 0, 0.6, 2)(g, tt); g.restore();
        g.save(); g.translate(540, 1080); g.scale(S, S); g.translate(-fx, -fy);
        frigate({ x: 0, y: 0, s: 1, flag: "pist" })(g, tt);
        g.save(); g.translate(-90, -42 + Math.sin(tt * 1.4) * 8); g.scale(0.62, 0.62); extra(g, pistoletov, { emo: "smile", aL: [1.45, 1.65], aR: [1.45, 1.65], t: tt }); g.restore();
        g.save(); g.translate(60, -42 + Math.sin(tt * 1.4) * 8); g.scale(0.58, 0.58); sema(g, "casual", { emo: "smile", bag: true, t: tt }); g.restore();
        g.restore();
        g.save(); g.translate(540, 960); g.scale(Math.pow(S, 0.8), Math.pow(S, 0.8)); g.translate(-540, -960); wave(1380, 22, "#2F8FC4", 2, 1, 4)(g, tt); g.restore();
      }} />
      <AbsoluteFill style={{ opacity: deckOp, transform: `scale(${1.25 - 0.25 * eio((t - FLY + XF) / 1.6)})` }}><P2Frame3 /></AbsoluteFill>
    </AbsoluteFill>
  );
};
