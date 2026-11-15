// Тестовый кадр «было / стало»: одна и та же сцена ВЦ 1984 в старом и в новом (cine) режиме
import React from "react";
import { AbsoluteFill } from "remotion";
import { useFonts } from "./Video";
import { Scene3D, Doodle } from "../../shared/remotion/kit";
import { VC1984, termDraw, ThoughtCloud } from "../../shared/remotion/sets5";
import type { Look } from "../../shared/remotion/doodle";

const OLD: Look = { body: "#6a5a8a", hair: "slick", glasses: true };
const NEW: Look = { body: "#7a4a6a", hair: "slick", glasses: true, mustache: true, pattern: "check", patCol: "#e8c890", scarf: "#c83a2a", ink: 1.25 };
const COLLEAGUE: Look = { body: "#3a5a8a", hair: "bald", hairCol: "#3a2a1a", pattern: "stripes", patCol: "#d8e0f0", hat: "ushanka", hatCol: "#6a5040", ink: 1.25 };
const blocks = (g: CanvasRenderingContext2D, s: number, W: number, H: number) => {
  g.fillStyle = "#fff"; g.fillRect(0, 0, W, H);
  const c = W / 6; const P: [number, number, string][] = [[1, 1, "#e64b4b"], [2, 1, "#e64b4b"], [3, 1, "#e64b4b"], [2, 2, "#e64b4b"], [0, 3, "#2f8fe0"], [1, 3, "#2f8fe0"], [4, 3, "#f2c230"], [5, 3, "#f2c230"], [4, 2, "#f2c230"], [5, 2, "#f2c230"]];
  for (const [x, y, col] of P) { g.fillStyle = col; g.fillRect(x * c + 4, y * c * 0.8 + 4, c - 8, c * 0.8 - 8); g.strokeStyle = "#1a1020"; g.lineWidth = 6; g.strokeRect(x * c + 4, y * c * 0.8 + 4, c - 8, c * 0.8 - 8); }
};
const shot = (cine: boolean) => (
  <Scene3D t0={3} light={cine ? "lab" : "office"} bg="#1a2030" focus={[-0.5, 1.1, -0.2]} cine={cine}
    cam={[[0, [0.15, 1.3, 1.35], [-0.1, 1.1, -0.6], 52], [9, [0.15, 1.3, 1.35], [-0.1, 1.1, -0.6], 52]]}>
    <VC1984 term={termDraw(0)} />
    <Doodle a={{ pos: [-0.55, 0, -0.2], seed: 3, look: cine ? NEW : OLD, expr: [[-9, "realize"]], scale: 1.18 }} />
    {cine ? <Doodle a={{ pos: [0.95, 0, -0.55], seed: 8, look: COLLEAGUE, expr: [[-9, "smug"]], scale: 1.1 }} /> : null}
    {cine ? <ThoughtCloud p={[-0.05, 2.0, -0.15]} t={-1} w={0.75} draw={blocks} /> : null}
  </Scene3D>);
export const StyleOld: React.FC = () => { const r = useFonts(); return r ? <AbsoluteFill>{shot(false)}</AbsoluteFill> : <AbsoluteFill style={{ background: "#000" }} />; };
export const StyleNew: React.FC = () => { const r = useFonts(); return r ? <AbsoluteFill>{shot(true)}</AbsoluteFill> : <AbsoluteFill style={{ background: "#000" }} />; };
