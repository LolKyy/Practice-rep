// Обложки серий (превью для TikTok / Shorts / VK). Важное — в центральной зоне 3:4 (y ≈ 240…1680), без субтитров.
import React from "react";
import { AbsoluteFill } from "remotion";
import "./fonts";
import { setVivid, PAL, cut, rrectP, inkText, text, tape } from "./engine/paper";
import { CanvasArt } from "./engine/CanvasArt";
import { Sema, Extra, EraBackground } from "./components/scenes";
import { stars } from "./components/ep01art";
import { shawarma } from "./StyleFrames";
import { Stage, Plane } from "./engine/stage";
import { seaSky, wave, frigate, lemonCrate } from "./components/ep02art";
import { pistoletov, pirate, deck, sails } from "./StyleFrames2";
import { auroraSky, peaks, fjord, drakkar, snowGround, longhouse, smoke, snowfall, popcornBucket } from "./components/ep03art";
import { leif, viking } from "./StyleFrames3";

setVivid(true);
const VIV: React.CSSProperties = { filter: "saturate(1.4) contrast(1.08) brightness(1.04)" };
const strip = (s: string, bg: string, fg: string, rot: number, size: number): React.CSSProperties => ({ fontFamily: "Montserrat", fontWeight: 900, fontSize: size, lineHeight: 1, padding: "18px 30px 14px", background: bg, color: fg,
  transform: `rotate(${rot}deg)`, clipPath: "polygon(0% 4%, 6% 0%, 30% 3%, 55% 0%, 80% 2%, 100% 0%, 99% 50%, 100% 96%, 70% 100%, 40% 97%, 12% 100%, 0% 97%, 1% 50%)", display: "inline-block" });
export const Ep01Cover: React.FC = () => (
  <AbsoluteFill style={VIV}>
    <EraBackground place="city" tod="gold" cam={[[0, 0, 60, 1.0]]} fg={false}>
      <Extra spec={{ seed: 31, hat: "laurel", toga: true, tunic: "#F2EEE4", skin: "#E3B98E", hair: "#4A3A2A" }} x={310} y={1760} s={4.3} z={5} pose={() => ({ emo: "shock", aR: [0.3, 0.3], aL: [1.75, 1.5], holdL: shawarma, look: [1, -0.3], talk: 0.9 })} />
      <Sema outfit="casual" x={800} s={4.2} y={1760} pose={() => ({ emo: "smile", bag: true, aR: [2.5, 0.3], aL: [0.3, 0.2], look: [-1, 0], t: 0.4, talk: 0.6 })} />
    </EraBackground>
    <CanvasArt draw={(g) => { // плашка «НОВЫЙ ЗАКАЗ» с пятью звёздами
      g.save(); g.translate(540, 720); g.rotate(-0.05); g.shadowColor = "rgba(60,36,12,0.35)"; g.shadowBlur = 18; g.shadowOffsetX = 8; g.shadowOffsetY = 12;
      cut(g, rrectP(-300, -70, 600, 140, 34), "#FFFFFF", { seed: 990, edge: 3, tear: 0.5 }); g.shadowColor = "transparent";
      cut(g, rrectP(-300, -70, 600, 56, 28), "#FFC928", { seed: 991, edge: 0, noEdge: true }); inkText(g, "НОВЫЙ ЗАКАЗ!", 0, -40, 40, PAL.ink); stars(g, -190, 30, 5, 30, 95, 992);
      tape(g, -290, -70, 110, -0.6, 34); g.restore(); }} />
    <AbsoluteFill style={{ alignItems: "center", paddingTop: 300, gap: 14, filter: "drop-shadow(0 0 4px #F6F1E4) drop-shadow(10px 14px 10px rgba(60,36,12,0.45))" }}>
      <span style={strip("ЗАКАЗ ДЛЯ", "#FBF7EC", PAL.ink, -2, 80)}>ЗАКАЗ ДЛЯ</span>
      <span style={strip("ЦЕЗАРЯ", PAL.scarf, "#FBF7EC", 1.5, 118)}>ЦЕЗАРЯ</span>
    </AbsoluteFill>
    <CanvasArt draw={(g) => { g.save(); g.translate(540, 1640); g.rotate(0.03); g.shadowColor = "rgba(60,36,12,0.35)"; g.shadowBlur = 14; g.shadowOffsetX = 6; g.shadowOffsetY = 10;
      cut(g, rrectP(-330, -50, 660, 100, 14), "#2E3A57", { seed: 995, edge: 2.5, tear: 0.5 }); g.shadowColor = "transparent"; inkText(g, "ПОПАЛ В ЭПОХУ", 0, 2, 48, "#FBF7EC"); g.restore(); }} />
  </AbsoluteFill>
);

// ---------------------------------------------------------------- «Доставка на абордаж». Безопасная зона TikTok:
// центр 3:4 (y 240…1680) — сетка профиля; справа (x > 900) и снизу (y > 1500) в ленте — кнопки и подпись.
export const Ep02Cover: React.FC = () => (
  <AbsoluteFill style={VIV}>
    <Stage cam={[[0, 0, 40, 1.0]]} bg="#FFE29A" light="gold" rays={0.4}>
      <Plane z={40} draw={seaSky("gold")} dyn shadow={0} />
      <Plane z={18} draw={wave(1000, 12, "#3FA7D6", 0, 0.6, 2)} dyn shadow={0.1} />
      <Plane z={14} draw={frigate({ x: 860, y: 1000, s: 0.42, flag: "pist" })} dyn />
      <Plane z={12} draw={sails} />
      <Plane z={6.5} draw={deck} />
      <Extra spec={pirate(93, "#E07B39")} x={110} y={1520} s={3.4} z={5.8} pose={() => ({ emo: "smile", aR: [2.5, 0.4], look: [1, 0] })} />
      <Extra spec={pistoletov} x={360} y={1640} s={4.6} z={5.1} pose={() => ({ emo: "smile", aL: [1.45, 1.65], aR: [1.45, 1.65], look: [0.3, 0], talk: 0.8 })} />
      <Sema outfit="casual" x={700} s={4.1} y={1640} pose={() => ({ emo: "smile", bag: true, aR: [1.2, 0.9], holdR: lemonCrate, look: [-1, 0], t: 0.4 })} />
    </Stage>
    <AbsoluteFill style={{ alignItems: "center", paddingTop: 300, paddingRight: 150, gap: 12, filter: "drop-shadow(0 0 4px #F6F1E4) drop-shadow(10px 14px 10px rgba(60,36,12,0.45))" }}>
      <span style={strip("", "#FBF7EC", PAL.ink, -2, 70)}>ДОСТАВКА</span>
      <span style={strip("", PAL.scarf, "#FBF7EC", 1.5, 88)}>НА АБОРДАЖ</span>
    </AbsoluteFill>
    <CanvasArt draw={(g) => { g.save(); g.translate(500, 1440); g.rotate(0.03); g.shadowColor = "rgba(60,36,12,0.35)"; g.shadowBlur = 14; g.shadowOffsetX = 6; g.shadowOffsetY = 10;
      cut(g, rrectP(-250, -46, 500, 92, 14), "#2E3A57", { seed: 995, edge: 2.5, tear: 0.5 }); g.shadowColor = "transparent"; inkText(g, "ПОПАЛ В ЭПОХУ", 0, 2, 46, "#FBF7EC"); g.restore(); }} />
  </AbsoluteFill>
);

// ---------------------------------------------------------------- «Заказ для Лейфа» (викинги). Те же безопасные зоны TikTok.
export const Ep03Cover: React.FC = () => (
  <AbsoluteFill style={VIV}>
    <Stage cam={[[0, 0, 40, 1.0]]} focus={6} bg="#BFE3EE" rays={0.25}>
      <Plane z={40} draw={auroraSky} dyn shadow={0} blurK={3} />
      <Plane z={26} draw={peaks(1000, 420, "#7F98AE", "#F4FAFC", 31)} blurK={3} />
      <Plane z={18} draw={fjord(1020)} dyn blurK={3} />
      <Plane z={14} dyn draw={drakkar(760, 1130, 0.6, 0.3, 1, 3)} blurK={3} />
      <Plane z={12} draw={snowGround(1240)} blurK={3} />
      <Plane z={11} dyn draw={(g, t) => { smoke(200, 1000, 0.9, 2)(g, t); longhouse(200, 1330, 0.9, 0.5, 40)(g, t); }} blurK={3} />
      <Plane z={9} draw={snowGround(1560, "#F4FAFC")} blurK={3} />
      <Extra spec={viking(31, "#3E5A7A", { hat: "nasal" })} x={110} y={1540} s={3.4} z={5.8} pose={() => ({ emo: "shock", look: [1, 0], aR: [1.9, 0.3] })} />
      <Extra spec={leif} x={370} y={1640} s={4.6} z={5.1} pose={() => ({ emo: "shock", aR: [0.3, 0.3], aL: [1.75, 1.5], holdL: (g) => { g.save(); g.rotate(Math.PI); popcornBucket(g); g.restore(); }, look: [1, 0], talk: 0.8 })} />
      <Sema outfit="casual" x={700} s={4.1} y={1640} pose={() => ({ emo: "smile", bag: true, aR: [1.4, 0.4], look: [-1, 0], t: 0.4 })} />
      <Plane z={3} dyn draw={snowfall(16, 10, 160, 61, 0.85)} shadow={0} />
    </Stage>
    <AbsoluteFill style={{ alignItems: "center", paddingTop: 300, paddingRight: 150, gap: 12, filter: "drop-shadow(0 0 4px #F6F1E4) drop-shadow(10px 14px 10px rgba(60,36,12,0.45))" }}>
      <span style={strip("", "#FBF7EC", PAL.ink, -2, 72)}>ЗАКАЗ ДЛЯ</span>
      <span style={strip("", PAL.scarf, "#FBF7EC", 1.5, 96)}>ВИКИНГОВ</span>
    </AbsoluteFill>
    <CanvasArt draw={(g) => { g.save(); g.translate(500, 1440); g.rotate(0.03); g.shadowColor = "rgba(60,36,12,0.35)"; g.shadowBlur = 14; g.shadowOffsetX = 6; g.shadowOffsetY = 10;
      cut(g, rrectP(-250, -46, 500, 92, 14), "#2E3A57", { seed: 995, edge: 2.5, tear: 0.5 }); g.shadowColor = "transparent"; inkText(g, "ПОПАЛ В ЭПОХУ", 0, 2, 46, "#FBF7EC"); g.restore(); }} />
  </AbsoluteFill>
);
