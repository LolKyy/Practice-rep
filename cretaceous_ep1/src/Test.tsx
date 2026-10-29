import React from "react";
import { AbsoluteFill } from "remotion";
import "./fonts";
import { Theatre, Sheet, useSec } from "./stage";
import { PAL, fernBush, zigTree, cut, rectP, ellP } from "./cut";
import { puppet } from "./puppets";

export const Test: React.FC = () => (
  <AbsoluteFill>
    <Theatre t0={0} cam={[[0, [0, 1.6, 7], [0, 1.4, 0], 36], [2, [0.2, 1.6, 6.6], [0, 1.4, 0], 36]]} focus={[0, 1.4, 0]}>
      <Sheet p={[0, -0.5, -3]} w={6} h={8} draw={(g) => { cut(g, rectP(0, 0, 600, 800), PAL.sky, { tear: 0, noEdge: true }); cut(g, ellP(200, 250, 70, 70), "#F3EBD0"); }} />
      <Sheet p={[0, 0, -2]} w={5} h={4} draw={(g) => { for (let i = 0; i < 6; i++) zigTree(g, 40 + i * 85, 400, 300 + (i % 3) * 50, 40, i % 2 ? PAL.oliveD : PAL.olive, i); }} />
      <Sheet p={[-0.5, 0, 0]} w={1.8} h={2.1} dyn draw={(g, t) => { g.translate(90, 205); puppet(g, "kotov", { expr: t > 1 ? "shock" : "calm", aR: [0.5 + t * 0.5, 0.8] }); }} />
      <Sheet p={[0.9, 0, -0.3]} w={1.8} h={2.1} dyn draw={(g, t) => { g.translate(90, 205); puppet(g, "bugaev", { expr: "resolve" }); }} />
      <Sheet p={[0, -2.2, 0.6]} rot={[-1.2, 0, 0]} anchor={[0.5, 0]} w={6} h={4} draw={(g) => cut(g, rectP(0, 0, 600, 400), PAL.kraft, { tear: 0, noEdge: true })} />
      <Sheet p={[0, -0.2, 1.2]} w={4} h={1.4} draw={(g) => { fernBush(g, 80, 140, 110, [PAL.olive, PAL.oliveD], 3); fernBush(g, 300, 140, 120, [PAL.oliveD, PAL.olive], 5); }} />
    </Theatre>
  </AbsoluteFill>
);
