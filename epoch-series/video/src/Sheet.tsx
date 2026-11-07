// Лист героя: casual + римский легионер, анфас + 3/4 + эмоции. На утверждение.
import React from "react";
import { AbsoluteFill } from "remotion";
import "./fonts";
import { CanvasArt } from "./engine/CanvasArt";
import { PAL, cut, rectP, tape, pencil, text, G, glue } from "./engine/paper";
import { sema, Emo, EMO_RU, Outfit } from "./engine/puppets";

const bg = (g: G, W: number, H: number) => {
  cut(g, rectP(-20, -20, W + 40, H + 40), "#EFE6D2", { tear: 0, noEdge: true, sort: "water", grain: 0.45, relief: 0 });
  for (let y = 120; y < H; y += 60) pencil(g, [[40, y], [W - 40, y]], 0.08, 0.6);
};
const card = (g: G, x: number, y: number, w: number, h: number, seed: number) => { cut(g, rectP(x, y, w, h), "#FBF7EC", { seed, tear: 0.8, edge: 3, sort: "water", grain: 0.3 }); tape(g, x + w / 2, y + 4, 90, (seed % 3 - 1) * 0.06, 22); };
const head = (g: G, outfit: Outfit, emo: Emo, x: number, y: number, s: number, seed: number) => {
  g.save(); g.translate(x, y); g.scale(s, s); g.translate(0, 215); sema(g, outfit, { emo, t: 0.6, aR: emo === "shock" ? [1.9, 0.3] : [0.12, 0.1], aL: emo === "shock" ? [1.9, 0.3] : emo === "fear" ? [0.5, 1.6] : [0.12, 0.1] }); g.restore();
};
export const Sheet: React.FC = () => (
  <AbsoluteFill style={{ background: "#EFE6D2" }}>
    <CanvasArt w={2400} h={1600} dyn={false} draw={(g) => {
      bg(g, 2400, 1600);
      text(g, "СЁМА КОТОВ · ЛИСТ ГЕРОЯ v2", 60, 70, 54, PAL.ink, "Montserrat", 900, "left");
      text(g, "«ПОПАЛ В ЭПОХУ» · casual + римский легионер · анфас / 3/4 / эмоции", 60, 125, 28, "#5a5048", "Montserrat", 700, "left");
      const rows: [Outfit, string, number][] = [["casual", "БАЗА (КОМНАТА)", 180], ["legion", "ЛЕГИОНЕР · 9 г. н.э.", 900]];
      for (const [o, label, y0] of rows) {
        card(g, 50, y0, 700, 680, y0 + 1);
        text(g, label, 400, y0 + 595, 30, PAL.ink); text(g, "анфас", 225, y0 + 640, 24, "#6a6058", "Caveat", 700); text(g, "3/4", 575, y0 + 640, 28, "#6a6058", "Caveat", 700);
        g.save(); g.translate(225, y0 + 570); g.scale(2.45, 2.45); sema(g, o, { emo: "calm", t: 0.3 }); g.restore();
        g.save(); g.translate(575, y0 + 570); g.scale(2.2, 2.45); sema(g, o, { emo: "curious", t: 0.3, look: [1.5, 0], tilt: 0.06, aR: [1.2, 0.9] }); g.restore();
        const emos: Emo[] = o === "casual" ? ["curious", "shock", "fear", "facepalm"] : ["resolve", "disgust", "tired", "proud"];
        emos.forEach((e, i) => {
          const x = 790 + i * 400; card(g, x, y0, 380, 680, y0 + i * 11);
          g.save(); g.beginPath(); g.rect(x + 8, y0 + 20, 364, 600); g.clip(); head(g, o, e, x + 190, y0 + 120, 3.0, i); g.restore();
          text(g, EMO_RU[e].toUpperCase(), x + 190, y0 + 640, 30, PAL.ink);
        });
      }
      glue(g, 2300, 120, 40, 22, 4);
      text(g, "красная деталь у горла — в любом костюме", 2340, 1560, 30, PAL.scarf, "Caveat", 700, "right");
    }} />
  </AbsoluteFill>
);
