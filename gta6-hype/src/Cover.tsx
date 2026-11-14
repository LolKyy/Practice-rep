// Обложка 1080×1920: обувной магазин вместо «туфельки», герой в шоке, продавщица с туфлей + крупный заголовок.
// Важное — в зоне y 240–1680 (TikTok режет до 3:4), справа x > 940 не ставить текст.
import React from "react";
import { AbsoluteFill } from "remotion";
import { useFonts } from "./Video";
import { Scene3D, Doodle } from "../../shared/remotion/kit";
import { ShoeShop } from "../../shared/remotion/sets4";

const stroke = (w: number) => ({ WebkitTextStroke: `${w}px #1a1020`, paintOrder: "stroke fill" as any });
export const Cover: React.FC = () => {
  const ready = useFonts();
  if (!ready) return <AbsoluteFill style={{ background: "#1a1030" }} />;
  return (
    <AbsoluteFill style={{ background: "#1a1030" }}>
      <Scene3D t0={3} light="office" bg="#ffd8e8" focus={[0, 1.0, -0.6]}
        cam={[[0, [0, 1.25, 1.5], [0, 1.0, -0.7], 56], [9, [0, 1.25, 1.5], [0, 1.0, -0.7], 56]]}>
        <ShoeShop />
        <Doodle a={{ pos: [0.55, 0, -0.65], seed: 41, look: { body: "#ff9ac8", hair: "bun", glasses: true }, expr: [[-5, "proud"]], scale: 1.15 }} />
        <Doodle a={{ pos: [-0.5, 0, -0.45], seed: 1, look: { body: "#ff4f9a", hair: "slick", outfit: "hawaii", accent: "#ffd23f", shades: true, chain: true }, expr: [[-5, "shock"]], scale: 1.25 }} />
      </Scene3D>
      <AbsoluteFill style={{ background: "linear-gradient(180deg, rgba(20,8,40,0.88) 0%, rgba(20,8,40,0) 34%, rgba(20,8,40,0) 70%, rgba(20,8,40,0.8) 100%)" }} />
      <div style={{ position: "absolute", top: 270, left: 40, width: 880, textAlign: "center", fontFamily: "Russo One", lineHeight: 1.0, transform: "rotate(-3deg)" }}>
        <div style={{ fontSize: 150, color: "#ffd23f", ...stroke(26), textShadow: "0 12px 0 rgba(0,0,0,0.5)" }}>GTA 6</div>
        <div style={{ fontSize: 104, color: "#ff3b3b", ...stroke(20), marginTop: 10, textShadow: "0 10px 0 rgba(0,0,0,0.5)" }}>ПЕРЕОЦЕНЕНА?</div>
      </div>
      <div style={{ position: "absolute", top: 590, left: 300, whiteSpace: "nowrap", background: "#fff", border: "8px solid #1a1020", borderRadius: 48, padding: "14px 30px", fontFamily: "Russo One", fontSize: 50, color: "#1a1020", transform: "rotate(4deg)", boxShadow: "0 10px 0 rgba(0,0,0,0.35)" }}>ВАМ КАКОЙ РАЗМЕР? 👠</div>
      <div style={{ position: "absolute", top: 1420, left: 60, width: 840, textAlign: "center" }}>
        <span style={{ display: "inline-block", fontFamily: "Rubik", fontWeight: 800, fontSize: 54, whiteSpace: "nowrap", color: "#1a1020", background: "#ffd23f", padding: "14px 36px", borderRadius: 60, border: "8px solid #1a1020", transform: "rotate(2deg)" }}>
          А ЕСЛИ ТУФЕЛЬКА ОБМАНЕТ?
        </span>
      </div>
    </AbsoluteFill>
  );
};
