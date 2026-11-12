// Обложка 1080×1920: комната геймера, монитор с печатью «ПЕРЕНЕСЕНО», герой в шоке + крупный заголовок.
// Важное — в зоне y 240–1680 (TikTok режет до 3:4), справа x > 940 не ставить текст.
import React from "react";
import { AbsoluteFill } from "remotion";
import { useFonts } from "./Video";
import { Scene3D, Doodle, HEAD_Z } from "./kit";
import { GamerRoom } from "./sets";
import { titleDraw } from "./sets2";

const stroke = (w: number) => ({ WebkitTextStroke: `${w}px #1a1020`, paintOrder: "stroke fill" as any });
export const Cover: React.FC = () => {
  useFonts();
  return (
    <AbsoluteFill style={{ background: "#1a1030" }}>
      <Scene3D t0={3} light="neon" bg="#1a1030" focus={[0.2, 1.1, -1.2]} dof={1}
        cam={[[0, [0.3, 1.25, 0.6], [0.35, 1.25, -1.5], 62], [9, [0.3, 1.25, 0.6], [0.35, 1.25, -1.5], 62]]}>
        <GamerRoom screen={titleDraw()} cal={() => {}} />
        <Doodle a={{ pos: [-0.3, 0, -0.8], seed: 2, look: { body: "#3fb27f", hair: "bowl" }, expr: [[-5, "holdlaugh"]], scale: 1.25,
          handF: [[0, -0.36, HEAD_Z + 0.02]], handB: [[0, 0.36, HEAD_Z + 0.02]] }} />
      </Scene3D>
      <AbsoluteFill style={{ background: "linear-gradient(180deg, rgba(20,8,40,0.85) 0%, rgba(20,8,40,0) 32%, rgba(20,8,40,0) 70%, rgba(20,8,40,0.8) 100%)" }} />
      <div style={{ position: "absolute", top: 270, left: 40, width: 880, textAlign: "center", fontFamily: "Russo One", lineHeight: 1.0, transform: "rotate(-3deg)" }}>
        <div style={{ fontSize: 150, color: "#ffd23f", ...stroke(26), textShadow: "0 12px 0 rgba(0,0,0,0.5)" }}>19 НОЯБРЯ</div>
        <div style={{ fontSize: 112, color: "#ff3b3b", ...stroke(20), marginTop: 10, textShadow: "0 10px 0 rgba(0,0,0,0.5)" }}>ВСЕ НА</div>
        <div style={{ fontSize: 112, color: "#ffffff", ...stroke(20), textShadow: "0 10px 0 rgba(0,0,0,0.5)" }}>БОЛЬНИЧНОМ?!</div>
      </div>
      <div style={{ position: "absolute", top: 1420, left: 60, width: 840, textAlign: "center" }}>
        <span style={{ display: "inline-block", fontFamily: "Rubik", fontWeight: 800, fontSize: 70, color: "#1a1020", background: "#ffd23f", padding: "14px 40px", borderRadius: 60, border: "8px solid #1a1020", transform: "rotate(2deg)" }}>
          ДЕНЬ ВЫХОДА GTA 6
        </span>
      </div>
    </AbsoluteFill>
  );
};
