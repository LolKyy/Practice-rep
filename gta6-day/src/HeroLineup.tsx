// Временная витрина вариантов героя (для выбора), не часть ролика
import React from "react";
import { AbsoluteFill } from "remotion";
import { useFonts } from "./Video";
import { Scene3D, Doodle, padHands } from "../../shared/remotion/kit";
import { City } from "../../shared/remotion/sets3";
import type { Look } from "../../shared/remotion/doodle";

const V: [string, Look][] = [
  ["А · ВАЙС-СТИЛЬ", { body: "#ff4f9a", hair: "slick", outfit: "hawaii", accent: "#ffd23f", shades: true, chain: true }],
  ["Б · ГЕЙМЕР", { body: "#6b4fd6", hair: "spiky", outfit: "hoodie", accent: "#ffffff", headphones: "#2fe0ff", pad: true }],
  ["В · ПАРЕНЬ С РАЙОНА", { body: "#f2c230", hair: "bowl", outfit: "jacket", accent: "#e64b4b", cap: "#2f6fd6", capBack: true, mustache: true }],
];
export const HeroLineup: React.FC = () => {
  const ready = useFonts();
  if (!ready) return <AbsoluteFill style={{ background: "#5aa0e8" }} />;
  return (<AbsoluteFill>
    <Scene3D t0={1} light="day" bg="#5aa0e8" focus={[0, 1, 0]} cam={[[0, [0, 1.15, 3.6], [0, 1.0, 0], 50], [9, [0, 1.15, 3.6], [0, 1.0, 0], 50]]}>
      <City cars={false} />
      {V.map(([, look], i) => <Doodle key={i} a={{ pos: [(i - 1) * 1.1, 0, 0], seed: 3 + i, look, expr: [[-5, ["smug", "hype", "grin"][i]]], scale: 1.3, ...(look.pad ? padHands : {}) }} />)}
    </Scene3D>
    {V.map(([n], i) => <div key={i} style={{ position: "absolute", top: 1330, left: 70 + i * 320, width: 300, textAlign: "center", fontFamily: "Russo One", fontSize: 34, color: "#fff",
      background: "#1a1020", borderRadius: 20, padding: "10px 0" }}>{n}</div>)}
  </AbsoluteFill>);
};
