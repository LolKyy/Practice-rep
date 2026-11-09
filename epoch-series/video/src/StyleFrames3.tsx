// Пробный план серии «Заказ для Лейфа» (викинги): визуал v3 «2D + объём». Общий план фьорда с проездом камеры.
import React from "react";
import { AbsoluteFill, useCurrentFrame } from "remotion";
import "./fonts";
import { setVivid } from "./engine/paper";
import { Stage, Plane, FPS, eio } from "./engine/stage";
import { Sema, Extra } from "./components/scenes";
import { Tag, Subtitles, Word } from "./components/overlays";
import { auroraSky, peaks, fjord, snowGround, longhouse, smoke, drakkar, snowfall, fogBand, sheep, tinyFolk, birds, runestone } from "./components/ep03art";
setVivid(true);
const VIV: React.CSSProperties = { filter: "saturate(1.25) contrast(1.06) brightness(1.03)" };
const D = 6; // длительность пробы, с
export const viking = (seed: number, c: string) => ({ seed, hat: "none" as const, hair: ["#C9A24B", "#8A4A26", "#E2C27A"][seed % 3], beard: ["#C9A24B", "#8A4A26", "#E2C27A"][seed % 3], tunic: c, skin: "#E8C2A0" });
export const V3Establish: React.FC = () => {
  const t = useCurrentFrame() / FPS; const u = eio(t / D); const turn = -0.9 + 1.4 * u; // поворот «камеры»: меняет видимые боковые грани домов
  const sub: Word[] = "…И ПАДАЕТ В СНЕГ. ПРЯМО К ВИКИНГАМ.".split(" ").map((w, i) => ({ w, s: 3 + i * 0.32, e: 3.3 + i * 0.32 }));
  return (
    <AbsoluteFill style={VIV}>
      <Stage cam={[[0, -220, 40, 1.0], [D, 220, -20, 1.1]]} focus={11} bg="#BFE3EE" light="day" rays={0.2}>
        <Plane z={60} draw={auroraSky} dyn shadow={0} boil={false} />
        <Plane z={34} draw={peaks(980, 520, "#9FB8CC", "#F4FAFC", 11)} shadow={0.1} />
        <Plane z={30} dyn draw={birds} shadow={0} />
        <Plane z={24} draw={peaks(1060, 380, "#5E7488", "#EEF5F8", 23)} shadow={0.15} />
        <Plane z={20} draw={fogBand(1040, 0.55, 3)} dyn shadow={0} />
        <Plane z={17} draw={fjord(1080)} dyn shadow={0.1} />
        <Plane z={16} dyn draw={drakkar(820, 1150, 0.42, 0.2, 1, 5)} />
        <Plane z={15} dyn draw={drakkar(330, 1170, 0.3, 0.15, 0.8, 9)} />
        <Plane z={12} draw={snowGround(1240)} />
        <Plane z={11.5} dyn draw={smoke(230, 1000, 1, 2)} shadow={0} />
        <Plane z={11} dyn draw={(g, tt) => { longhouse(230, 1330, 1.0, turn, 40)(g, tt); longhouse(780, 1360, 1.15, turn, 60)(g, tt); }} />
        <Plane z={11} dyn draw={smoke(780, 1000, 1.1, 7)} shadow={0} />
        <Plane z={9.5} dyn draw={(g, tt) => { tinyFolk(500, 1460, 1.2, "#8A3A2A", 1, 1)(g, tt); tinyFolk(1010, 1480, 1.2, "#3E5A7A", 4)(g, tt); tinyFolk(-20, 1470, 1.1, "#6E7A3A", 6, 1)(g, tt); sheep(120, 1520, 1.2, 7)(g, tt); sheep(660, 1540, 1.1, 9)(g, tt); sheep(900, 1560, 1, 11)(g, tt); }} />
        <Plane z={9} draw={snowGround(1640, "#F4FAFC")} />
        <Plane z={8} dyn draw={snowfall(60, 4, 90, 21, 0.7)} shadow={0} />
        <Extra spec={viking(31, "#3E5A7A")} x={360} y={1640} s={3.4} z={10.5} pose={(tt) => ({ emo: "curious", look: [1, 0], aR: [0.4, 0.4] })} />
        <Sema outfit="casual" z={10.5} x={640} s={3.6} y={1660} pose={(tt) => ({ emo: tt > 3.2 ? "shock" : "curious", bag: true, look: [-1, 0], t: tt, aL: [0.4, 0.3], aR: [0.4, 0.3] })} />
        <Plane z={4} dyn draw={snowfall(26, 9, 160, 33, 0.9)} shadow={0} />
        <Plane z={3} draw={runestone(980, 1950, 1.6)} />
        <Plane z={2.6} dyn draw={snowfall(10, 18, 260, 45, 0.85)} shadow={0} />
        <Plane z={2.4} draw={fogBand(1880, 0.65, 8)} dyn shadow={0} />
      </Stage>
      <Tag big x={780} lines={["1000 ГОД", "ГРЕНЛАНДИЯ"]} delay={0.8} />
      <Subtitles words={sub} keywords={["ВИКИНГАМ"]} />
    </AbsoluteFill>
  );
};
