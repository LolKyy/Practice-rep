// Обложки серий (превью для TikTok / Shorts / VK). Важное — в центральной зоне 3:4 (y ≈ 240…1680), без субтитров.
import React from "react";
import { AbsoluteFill } from "remotion";
import "./fonts";
import { setVivid, PAL, cut, rrectP, inkText, text, tape } from "./engine/paper";
import { CanvasArt } from "./engine/CanvasArt";
import { Sema, Extra, EraBackground } from "./components/scenes";
import { stars } from "./components/ep01art";
import { shawarma } from "./StyleFrames";
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
      g.save(); g.translate(540, 650); g.rotate(-0.05); g.shadowColor = "rgba(60,36,12,0.35)"; g.shadowBlur = 18; g.shadowOffsetX = 8; g.shadowOffsetY = 12;
      cut(g, rrectP(-300, -70, 600, 140, 34), "#FFFFFF", { seed: 990, edge: 3, tear: 0.5 }); g.shadowColor = "transparent";
      cut(g, rrectP(-300, -70, 600, 56, 28), "#FFC928", { seed: 991, edge: 0, noEdge: true }); inkText(g, "НОВЫЙ ЗАКАЗ!", 0, -40, 40, PAL.ink); stars(g, -190, 30, 5, 30, 95, 992);
      tape(g, -290, -70, 110, -0.6, 34); g.restore(); }} />
    <AbsoluteFill style={{ alignItems: "center", paddingTop: 250, gap: 14, filter: "drop-shadow(0 0 4px #F6F1E4) drop-shadow(10px 14px 10px rgba(60,36,12,0.45))" }}>
      <span style={strip("ЗАКАЗ ДЛЯ", "#FBF7EC", PAL.ink, -2, 104)}>ЗАКАЗ ДЛЯ</span>
      <span style={strip("ЦЕЗАРЯ", PAL.scarf, "#FBF7EC", 1.5, 150)}>ЦЕЗАРЯ</span>
    </AbsoluteFill>
    <CanvasArt draw={(g) => { g.save(); g.translate(540, 1640); g.rotate(0.03); g.shadowColor = "rgba(60,36,12,0.35)"; g.shadowBlur = 14; g.shadowOffsetX = 6; g.shadowOffsetY = 10;
      cut(g, rrectP(-330, -50, 660, 100, 14), "#2E3A57", { seed: 995, edge: 2.5, tear: 0.5 }); g.shadowColor = "transparent"; inkText(g, "ПОПАЛ В ЭПОХУ", 0, 2, 48, "#FBF7EC"); g.restore(); }} />
  </AbsoluteFill>
);
