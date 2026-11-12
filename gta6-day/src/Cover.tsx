// Обложка 1080×1920: квартира ночью, ТВ с заставкой GTA, чипсы, герой «болеет» по телефону + крупный заголовок.
// Важное — в зоне y 240–1680 (TikTok режет до 3:4), справа x > 940 не ставить текст.
import React from "react";
import { AbsoluteFill } from "remotion";
import { useFonts } from "./Video";
import { Scene3D, Doodle, HEAD_Z, Box, Sign } from "./kit";
import { Apartment, Chips } from "./sets3";
import { titleDraw } from "./sets2";

const stroke = (w: number) => ({ WebkitTextStroke: `${w}px #1a1020`, paintOrder: "stroke fill" as any });
export const Cover: React.FC = () => {
  useFonts();
  return (
    <AbsoluteFill style={{ background: "#1a1030" }}>
      <Scene3D t0={3} light="night" bg="#0b0f2a" focus={[0.2, 1.1, -1.2]}
        cam={[[0, [0.35, 1.2, 1.15], [0.45, 1.12, -1.6], 60], [9, [0.35, 1.2, 1.15], [0.45, 1.12, -1.6], 60]]}>
        <Apartment tv={titleDraw()} night clock={() => "08:00"} />
        {Array.from({ length: 8 }, (_, i) => <Chips key={i} p={[-1.55 + (i % 4) * 0.28, 0.62 + Math.floor(i / 4) * 0.22, -1.05]} rot={[-0.2, (i % 3) * 0.3 - 0.3, (i % 2) * 0.3 - 0.15]} col={["#ff3b3b", "#ffd23f", "#3fb27f", "#2fe0ff"][i % 4]} scale={0.8} />)}
        <Doodle a={{ pos: [-0.12, 0, -0.65], seed: 2, look: { body: "#3fb27f", hair: "bowl" }, expr: [[-5, "holdlaugh"]], scale: 1.25,
          handF: [[0, -0.1, HEAD_Z - 0.15]], handB: [[0, 0.42, HEAD_Z - 0.08]] }} />
        <group position={[0.36, 1.12, -0.45]} scale={0.62} rotation={[0, -0.3, 0]}><Box p={[0, 0, 0]} s={[0.4, 0.78, 0.05]} c="#1a1a22" r={0.3} />
          <Sign p={[0, 0.05, 0.027]} w={0.34} h={0.5} text="📞" bg="#16603a" fg="#fff" glow={0.6} /></group>
      </Scene3D>
      <AbsoluteFill style={{ background: "linear-gradient(180deg, rgba(20,8,40,0.85) 0%, rgba(20,8,40,0) 32%, rgba(20,8,40,0) 70%, rgba(20,8,40,0.8) 100%)" }} />
      <div style={{ position: "absolute", top: 270, left: 40, width: 880, textAlign: "center", fontFamily: "Russo One", lineHeight: 1.0, transform: "rotate(-3deg)" }}>
        <div style={{ fontSize: 150, color: "#ffd23f", ...stroke(26), textShadow: "0 12px 0 rgba(0,0,0,0.5)" }}>19 НОЯБРЯ</div>
        <div style={{ fontSize: 112, color: "#ff3b3b", ...stroke(20), marginTop: 10, textShadow: "0 10px 0 rgba(0,0,0,0.5)" }}>ВСЕ НА</div>
        <div style={{ fontSize: 96, color: "#ffffff", ...stroke(18), textShadow: "0 10px 0 rgba(0,0,0,0.5)" }}>БОЛЬНИЧНОМ?!</div>
      </div>
      <div style={{ position: "absolute", top: 760, left: 470, background: "#fff", border: "8px solid #1a1020", borderRadius: 48, padding: "14px 30px", fontFamily: "Russo One", fontSize: 58, color: "#1a1020", transform: "rotate(4deg)", boxShadow: "0 10px 0 rgba(0,0,0,0.35)" }}>КХА-КХА 🤒</div>
      <div style={{ position: "absolute", top: 1420, left: 60, width: 840, textAlign: "center" }}>
        <span style={{ display: "inline-block", fontFamily: "Rubik", fontWeight: 800, fontSize: 58, whiteSpace: "nowrap", color: "#1a1020", background: "#ffd23f", padding: "14px 36px", borderRadius: 60, border: "8px solid #1a1020", transform: "rotate(2deg)" }}>
          ДЕНЬ ВЫХОДА GTA 6
        </span>
      </div>
    </AbsoluteFill>
  );
};
