// Обложка 1080×1920: программист в ВЦ 1984 у терминала, облачко с цветными фигурами, крупный заголовок.
// Важное — в зоне y 240–1680 (TikTok режет до 3:4), справа x > 940 не ставить текст.
import React from "react";
import { AbsoluteFill } from "remotion";
import { useFonts } from "./Video";
import { Scene3D, Doodle } from "../../shared/remotion/kit";
import { VC1984, termDraw, ThoughtCloud } from "../../shared/remotion/sets5";
import { GiftBox, piece } from "../../shared/remotion/sets6";

const stroke = (w: number) => ({ WebkitTextStroke: `${w}px #1a1020`, paintOrder: "stroke fill" as any });
const blocks = (g: CanvasRenderingContext2D, s: number, W: number, H: number) => {
  g.fillStyle = "#fff"; g.fillRect(0, 0, W, H); const c = W / 7;
  piece(g, "T", c * 0.4, c * 0.4, c); piece(g, "L", c * 3.6, c * 0.3, c); piece(g, "O", c * 1.2, c * 2.3, c); piece(g, "I", c * 3.2, c * 2.6, c * 0.8);
};
export const Cover: React.FC = () => {
  const ready = useFonts();
  if (!ready) return <AbsoluteFill style={{ background: "#101828" }} />;
  return (
    <AbsoluteFill style={{ background: "#101828" }}>
      <Scene3D t0={3} light="lab" bg="#101828" cine focus={[-0.3, 1.0, -0.2]}
        cam={[[0, [0.05, 1.35, 1.55], [-0.1, 1.15, -0.5], 54], [9, [0.05, 1.35, 1.55], [-0.1, 1.15, -0.5], 54]]}>
        <VC1984 term={termDraw(-1)} />
        <Doodle a={{ pos: [-0.45, 0, -0.2], seed: 3, look: { body: "#7a4a6a", hair: "slick", glasses: true, mustache: true, pattern: "check", patCol: "#e8c890", scarf: "#c83a2a", ink: 1.25 }, expr: [[-5, "realize"]], scale: 1.2, handB: [[0, 0.32, 0.68]] }} />
        <GiftBox p={[0.1, 0.62, -0.05]} scale={0.8} />
        <ThoughtCloud p={[0.25, 2.1, -0.2]} t={-5} w={0.8} draw={blocks} />
      </Scene3D>
      <AbsoluteFill style={{ background: "linear-gradient(180deg, rgba(10,14,30,0.9) 0%, rgba(10,14,30,0) 30%, rgba(10,14,30,0) 72%, rgba(10,14,30,0.85) 100%)" }} />
      <div style={{ position: "absolute", top: 250, left: 40, width: 880, textAlign: "center", fontFamily: "Russo One", lineHeight: 1.02, transform: "rotate(-2deg)" }}>
        <div style={{ fontSize: 96, color: "#ffffff", ...stroke(18), textShadow: "0 10px 0 rgba(0,0,0,0.5)" }}>ПРИДУМАЛ ИГРУ</div>
        <div style={{ fontSize: 96, color: "#ffd23f", ...stroke(18), textShadow: "0 10px 0 rgba(0,0,0,0.5)" }}>ДЛЯ ВСЕГО МИРА</div>
        <div style={{ fontSize: 70, color: "#ff3b3b", ...stroke(14), marginTop: 6, textShadow: "0 10px 0 rgba(0,0,0,0.5)" }}>…А ПОЛУЧИЛ КОМПЬЮТЕР</div>
      </div>
      <div style={{ position: "absolute", top: 1430, left: 60, width: 840, textAlign: "center" }}>
        <span style={{ display: "inline-block", fontFamily: "Rubik", fontWeight: 800, fontSize: 56, whiteSpace: "nowrap", color: "#1a1020", background: "#ffd23f", padding: "14px 36px", borderRadius: 60, border: "8px solid #1a1020", transform: "rotate(2deg)" }}>
          МОСКВА · 1984
        </span>
      </div>
    </AbsoluteFill>
  );
};
