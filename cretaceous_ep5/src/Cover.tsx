// Обложка Ч5: кадр с Вороном (без субтитров), крупно «40 ЛЕТ ОДИН», маленькая плашка «ОТРЯД БТР · 5».
import React from "react";
import { AbsoluteFill, Img, staticFile } from "remotion";
import "./fonts";
import { PAL } from "./cut";

const torn = "polygon(0 6%, 9% 0, 22% 5%, 38% 1%, 55% 5%, 71% 0, 86% 4%, 100% 1%, 99% 52%, 100% 96%, 84% 100%, 66% 95%, 48% 100%, 30% 96%, 13% 100%, 0 95%, 1% 48%)";
const strip = (bg: string, color: string, size: number, rot: number, pad: string): React.CSSProperties => ({
  display: "inline-block", whiteSpace: "nowrap", background: bg, color, fontFamily: "Montserrat", fontWeight: 900, fontSize: size, lineHeight: 1.0, padding: pad,
  transform: `rotate(${rot}deg)`, clipPath: torn, filter: "drop-shadow(12px 16px 0 rgba(10,8,4,0.4))" });
export const Cover: React.FC = () => (
  <AbsoluteFill style={{ backgroundColor: "#121A2B" }}>
    <Img src={staticFile("cover_bg.png")} style={{ width: 1080, height: 1920 }} />
    <AbsoluteFill style={{ background: "linear-gradient(180deg, rgba(8,10,20,0.25) 0%, rgba(8,10,20,0) 30%, rgba(8,10,20,0) 55%, rgba(8,8,12,0.55) 100%)" }} />
    <div style={{ position: "absolute", left: 70, top: 290 }}><div style={{ background: "#1A1712", color: PAL.edge, fontFamily: "JetBrains Mono", fontWeight: 700, fontSize: 44, padding: "12px 30px", transform: "rotate(-1.5deg)", boxShadow: "8px 12px 0 rgba(0,0,0,0.35)" }}>ОТРЯД БТР · 5</div></div>
    <div style={{ position: "absolute", left: 0, width: 1080, top: 1150, textAlign: "center" }}><div style={strip(PAL.edge, PAL.ink, 196, -2, "20px 60px 28px")}>40 ЛЕТ</div></div>
    <div style={{ position: "absolute", left: 0, width: 1080, top: 1395, textAlign: "center" }}><div style={strip(PAL.scarf, PAL.edge, 210, 1.5, "18px 70px 30px")}>ОДИН</div></div>
  </AbsoluteFill>
);
