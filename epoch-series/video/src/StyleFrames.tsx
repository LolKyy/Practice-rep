// Пробные кадры серии 1 «Заказ для Цезаря» — яркая аппликация (v2.2). На согласование.
import React from "react";
import { AbsoluteFill } from "remotion";
import "./fonts";
import { setVivid, G, PAL, cut, rectP, rrectP, ellP, fillP, strokeP, text, inkText, tape, Pt } from "./engine/paper";
import { CanvasArt } from "./engine/CanvasArt";
import { Sema, EraBackground, Extra } from "./components/scenes";
import { Subtitles, Tag, FactCallout, Marks, Word } from "./components/overlays";
setVivid(true);
const sub = (s: string): Word[] => s.split(" ").map((w) => ({ w, s: 0, e: 99 }));
const VIV: React.CSSProperties = { filter: "saturate(1.35) contrast(1.06) brightness(1.04)" };
const star = (g: G, x: number, y: number, r: number, c: string, seed: number) => { const P: Pt[] = []; for (let i = 0; i < 10; i++) { const a = -Math.PI / 2 + i * Math.PI / 5; const rr = i % 2 ? r * 0.45 : r; P.push([x + Math.cos(a) * rr, y + Math.sin(a) * rr]); } cut(g, P, c, { seed, edge: 2.4, tear: 0.4 }); };
export const shawarma = (g: G) => { g.save(); g.rotate(-0.5); cut(g, rrectP(-7, -22, 14, 36, 6), "#E9C27A", { seed: 801, edge: 0.8, sort: "kraft" }); cut(g, rectP(-8, -2, 16, 18), "#F4F1EA", { seed: 802, edge: 0.7 }); fillP(g, ellP(0, -20, 5, 3, 10), "#8A4A26"); fillP(g, ellP(-2, -18, 2, 1.5, 8), "#6BAF3A"); g.restore(); };

// 1 — ХУК: экран курьерского приложения
export const Frame1: React.FC = () => (
  <AbsoluteFill style={{ background: "#FFE15A", ...VIV }}>
    <CanvasArt draw={(g) => {
      cut(g, rectP(-20, -20, 1120, 1960), "#FFD43B", { tear: 0, noEdge: true, sort: "water", grain: 0.4 });
      for (let i = 0; i < 9; i++) cut(g, ellP(100 + (i % 3) * 440, 150 + Math.floor(i / 3) * 700, 120, 120, 30), "#FFC21A", { seed: 900 + i, edge: 1, grain: 0.2 });
      g.save(); g.translate(540, 760); g.rotate(-0.06);
      cut(g, rrectP(-330, -640, 660, 1280, 70), "#1E1A17", { seed: 910, edge: 3, tear: 0.2, rim: 0.4 });
      cut(g, rrectP(-300, -600, 600, 1200, 46), "#FFFFFF", { seed: 911, edge: 0, tear: 0, noEdge: true, grain: 0.15 });
      cut(g, rrectP(-300, -600, 600, 200, 46), "#FFC928", { seed: 912, edge: 0, tear: 0, noEdge: true, grain: 0.2 });
      inkText(g, "НОВЫЙ ЗАКАЗ!", 0, -500, 64, PAL.ink);
      const rows: [string, string, string?][] = [["Шаурма", "× 1"], ["Салат «Цезарь»", "× 1"]];
      rows.forEach(([a, b], i) => { const y = -340 + i * 100; cut(g, rrectP(-260, y - 40, 520, 80, 16), "#F4F1EA", { seed: 913 + i, edge: 1.4, tear: 0.3 }); inkText(g, a, -230, y, 40, PAL.ink, "Montserrat", 900, "left"); inkText(g, b, 230, y, 40, PAL.scarf, "Montserrat", 900, "right"); });
      text(g, "АДРЕС:", -260, -100, 30, "#8a8070", "Montserrat", 900, "left"); inkText(g, "Рим, Сенат", -260, -50, 52, PAL.ink, "Montserrat", 900, "left");
      text(g, "15 марта 44 г. до н.э.", -260, 10, 36, PAL.scarf, "Montserrat", 900, "left");
      // клиент + аватар-лавр
      cut(g, ellP(-200, 150, 70, 70, 30), "#F0D2A8", { seed: 920, edge: 2 }); for (let i = 0; i < 7; i++) { const a = Math.PI * 1.05 + i * 0.15; g.save(); g.translate(-200 + Math.cos(a) * 66, 150 + Math.sin(a) * 66); g.rotate(a + 1.2); cut(g, ellP(0, 0, 8, 18, 10), "#5E9A2E", { seed: 921 + i, edge: 1 }); g.restore(); }
      fillP(g, ellP(-222, 145, 6, 8, 8), PAL.ink); fillP(g, ellP(-178, 145, 6, 8, 8), PAL.ink); strokeP(g, [[-212, 180], [-188, 180]], PAL.ink, 4);
      text(g, "КЛИЕНТ", -100, 115, 28, "#8a8070", "Montserrat", 900, "left"); inkText(g, "Юлий Цезарь", -100, 165, 46, PAL.ink, "Montserrat", 900, "left");
      for (let i = 0; i < 5; i++) star(g, -95 + i * 38, 215, 16, "#FFB400", 930 + i);
      // кнопка ПРИНЯТЬ
      cut(g, rrectP(-260, 290, 520, 130, 40), "#3DBE5A", { seed: 940, edge: 2.4, rim: 0.4 }); inkText(g, "ПРИНЯТЬ", 0, 357, 64, "#FFFFFF");
      g.restore();
      // палец Сёмы (горчичный рукав)
      g.save(); g.translate(700, 1300); g.rotate(-0.55);
      cut(g, rrectP(-90, 0, 180, 600, 50), PAL.mustard, { seed: 950, edge: 2.4, sort: "felt", rim: 0.5 }); cut(g, rrectP(-95, -10, 190, 60, 20), "#C48F2E", { seed: 951, edge: 2 });
      cut(g, ellP(0, -70, 85, 95, 30), PAL.skin, { seed: 952, edge: 2.4, sort: "water" }); cut(g, rrectP(-24, -260, 48, 210, 24), PAL.skin, { seed: 953, edge: 2.4, sort: "water" });
      g.restore();
      tape(g, 140, 120, 200, -0.4, 44);
    }} />
    <Subtitles words={sub("КЛИЕНТ — ЮЛИЙ ЦЕЗАРЬ.")} keywords={["ЦЕЗАРЬ"]} />
  </AbsoluteFill>
);

// 2 — ПРИЗЕМЛЕНИЕ В РИМЕ: жёлтый короб, шок
export const Frame2: React.FC = () => (
  <AbsoluteFill style={VIV}>
    <EraBackground place="city" cam={[[0, 0, 0, 1.0]]} fg={false}>
      <Extra spec={{ seed: 21, hat: "none", hair: "#2A1E16", tunic: "#E07B39", skin: "#D9AE86" }} x={170} y={1560} s={3.9} z={6} pose={() => ({ emo: "shock", look: [1, 0], aR: [1.9, 0.3], aL: [0.1, 0.1] })} />
      <Extra spec={{ seed: 22, hat: "hood", cloak: "#4E8FD0", tunic: "#4E8FD0", skin: "#C99B72", beard: "#5A4030" }} x={910} y={1560} s={3.9} z={6} pose={() => ({ emo: "disgust", look: [-1, 0], facing: -1 })} />
      <Sema outfit="casual" x={540} s={4.5} y={1580} pose={() => ({ emo: "shock", bag: true, aL: [1.9, 0.4], aR: [1.9, 0.4], t: 0.5, talk: 0.7 })} />
    </EraBackground>
    <Tag big x={720} lines={["45 Г. ДО Н.Э.", "РИМ"]} />
    <FactCallout text={"В ПУТИ:\n1 ГОД"} x={250} y={300} to={[420, 760]} />
    <Subtitles words={sub("ПРЯМО В ДРЕВНИЙ РИМ.")} keywords={["РИМ"]} />
  </AbsoluteFill>
);

// 3 — ДОСТАВЛЕНО: Цезарь ест шаурму, пять звёзд
export const Frame3: React.FC = () => (
  <AbsoluteFill style={VIV}>
    <EraBackground place="city" tod="gold" cam={[[0, 0, 0, 1.0]]} fg={false}>
      <Extra spec={{ seed: 31, hat: "laurel", toga: true, tunic: "#F2EEE4", skin: "#E3B98E", hair: "#4A3A2A" }} x={340} y={1580} s={4.7} z={5} pose={() => ({ emo: "smile", aR: [1.5, 1.4], holdR: shawarma, look: [1, 0], talk: 0.5 })} />
      <Sema outfit="casual" x={770} s={4.4} y={1580} pose={() => ({ emo: "proud", bag: true, aR: [2.3, 0.3], look: [-1, 0], t: 0.4, talk: 0 })} />
    </EraBackground>
    <CanvasArt draw={(g) => { g.save(); g.translate(540, 330); g.rotate(-0.04); cut(g, rrectP(-380, -90, 760, 180, 30), "#FFFFFF", { seed: 960, edge: 3, tear: 0.5 }); for (let i = 0; i < 5; i++) star(g, -280 + i * 140, -10, 56, "#FFB400", 961 + i); text(g, "чаевые: 1 денарий", 0, 62, 34, "#8a8070", "Montserrat", 900); g.restore(); }} />
    <Subtitles words={sub("И СТАВИТ ПЯТЬ ЗВЁЗД.")} keywords={["ПЯТЬ"]} />
  </AbsoluteFill>
);
