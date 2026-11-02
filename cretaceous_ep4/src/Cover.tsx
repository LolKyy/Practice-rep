// Обложка Ч4 (как у Ч2): кадр без субтитров + бумажные плашки названия.
import React from "react";
import { AbsoluteFill, Img, staticFile } from "remotion";
import "./fonts";
import { PAL } from "./cut";

const torn = "polygon(0 6%, 9% 0, 22% 5%, 38% 1%, 55% 5%, 71% 0, 86% 4%, 100% 1%, 99% 52%, 100% 96%, 84% 100%, 66% 95%, 48% 100%, 30% 96%, 13% 100%, 0 95%, 1% 48%)";
const strip = (bg: string, color: string, size: number, rot: number, extra: React.CSSProperties = {}): React.CSSProperties => ({
  display: "inline-block", whiteSpace: "nowrap", background: bg, color, fontFamily: "Montserrat", fontWeight: 900, fontSize: size, lineHeight: 1.05, padding: "14px 46px",
  transform: `rotate(${rot}deg)`, clipPath: torn, filter: "drop-shadow(10px 14px 0 rgba(10,8,4,0.35))", ...extra,
});
export const Cover: React.FC = () => (
  <AbsoluteFill style={{ backgroundColor: "#2A2418" }}>
    <Img src={staticFile("cover_bg.png")} style={{ width: 1080, height: 1920 }} />
    <AbsoluteFill style={{ background: "linear-gradient(180deg, rgba(20,24,12,0.45) 0%, rgba(20,24,12,0) 42%, rgba(20,24,12,0) 75%, rgba(10,20,40,0.35) 100%)" }} />
    {/* бирка времени на нитке */}
    <div style={{ position: "absolute", left: 800, top: 0, width: 3, height: 300, background: "rgba(243,237,224,0.9)" }} />
    <div style={{ position: "absolute", left: 645, top: 298, background: PAL.edge, padding: "14px 30px 14px 50px", fontFamily: "JetBrains Mono", fontWeight: 700, fontSize: 40, color: PAL.ink, boxShadow: "7px 11px 14px rgba(0,0,0,0.5)" }}>
      <div style={{ position: "absolute", left: 18, top: "50%", width: 14, height: 14, marginTop: -7, borderRadius: 7, background: "#3a3020" }} />ДЕНЬ 2 — 12:40</div>
    <div style={{ position: "absolute", left: 600, top: 380 }}><div style={{ background: "#1A1712", color: PAL.edge, fontFamily: "JetBrains Mono", fontWeight: 700, fontSize: 56, padding: "12px 34px", transform: "rotate(-1deg)" }}>ЧТО, ЕСЛИ…</div></div>
    <div style={{ position: "absolute", left: 0, width: 1080, top: 470, textAlign: "center" }}><div style={strip(PAL.edge, PAL.ink, 116, -1.5)}>ОТРЯД БТР</div></div>
    <div style={{ position: "absolute", left: 0, width: 1080, top: 620, textAlign: "center" }}><div style={strip(PAL.scarf, PAL.edge, 68, 1.2, { padding: "18px 40px" })}>В МЕЛОВОМ ПЕРИОДЕ</div></div>
    <div style={{ position: "absolute", left: 0, width: 1080, top: 1460, textAlign: "center" }}><div style={strip("#F2C41E", "#1A1712", 110, -1, { padding: "24px 100px" })}>ЧАСТЬ 4</div></div>
  </AbsoluteFill>
);
