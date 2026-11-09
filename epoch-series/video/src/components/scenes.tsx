// Компоненты сцен: Sema, Extra, Room, EraBackground, Portal, Camera-хелперы.
import React from "react";
import { AbsoluteFill, useCurrentFrame } from "remotion";
import { Plane, Stage, CamKey, FPS, eo, spring, keys } from "../engine/stage";
import { G, setLight, cut, tear, rectP, Pt, rng, fillP } from "../engine/paper";
import { sema, extra, Pose, Outfit, ExtraSpec, blinkAt, talkFromWords, Emo } from "../engine/puppets";
import { CanvasArt } from "../engine/CanvasArt";
import { room, rome, TOD, SKY, phone } from "./scenery";
import type { Word } from "./overlays";

// ---------------------------------------------------------------- Camera: ключи наезд/проезд + тряска
export const Camera = {
  push: (t0: number, t1: number, amt = 0.06, x = 0, y = 0): CamKey[] => [[t0, 0, 0, 1], [t1, x, y, 1 + amt]],
  pan: (t0: number, t1: number, dx: number, z = 1.03): CamKey[] => [[t0, -dx / 2, 0, z], [t1, dx / 2, 0, z]],
  shake: (at: number, amp = 14, dur = 0.5) => (t: number) => (t >= at && t < at + dur ? amp * (1 - (t - at) / dur) : 0),
};

// ---------------------------------------------------------------- Sema: марионетка в плане фокуса
// pose(t) — функция времени; words — для липсинка (рот по «громкости» слов), x,y — ступни в кадре, s — масштаб (см → px)
export const Sema: React.FC<{ outfit: Outfit; pose: (t: number) => Pose; x?: number; y?: number; s?: number; z?: number; words?: Word[]; popOrder?: number; clip?: (g: G) => void; dy?: (t: number) => number }> =
  ({ outfit, pose, x = 540, y = 1560, s = 5.4, z = 5, words = [], popOrder = 5, clip, dy }) => (
    <Plane z={z} dyn popOrder={popOrder} rim={0.5} shadow={0.42} blurK={0} draw={(g, t) => {
      const p = pose(t); const talk = p.talk ?? talkFromWords(t, words);
      if (clip) clip(g);
      g.save(); g.translate(x, y + (dy ? dy(t) : 0)); g.scale(s, s); sema(g, outfit, { blink: blinkAt(t, 1), ...p, talk, t }); g.restore();
    }} />
  );
export const Extra: React.FC<{ spec: ExtraSpec; pose: (t: number) => Pose; x: number; y: number; s?: number; z?: number; popOrder?: number }> = ({ spec, pose, x, y, s = 5, z = 5.2, popOrder = 4 }) => (
  <Plane z={z} dyn popOrder={popOrder} rim={0.3} blurK={0} draw={(g, t) => { g.save(); g.translate(x, y); g.scale(s, s); extra(g, spec, { blink: blinkAt(t, spec.seed ?? 3), ...pose(t), t }); g.restore(); }} />
);

// ---------------------------------------------------------------- Room: бумажная комната Сёмы (диван, лампа, окно с городом)
export const Room: React.FC<{ cam?: CamKey[]; children?: React.ReactNode; t0?: number }> = ({ cam = Camera.push(0, 3, 0.05), children, t0 = 0 }) => {
  setLight({ ang: -2.4, rim: "rgba(255,226,170,0.9)" });
  return (
    <Stage t0={t0} cam={cam} bg="#F2DDB4" light="indoor" rays={0.35}>
      <Plane z={9} draw={room.wall} shadow={0} />
      <Plane z={6} draw={room.floor} shadow={0.2} />
      <Plane z={5.6} draw={room.sofa} />
      {children}
      <Plane z={4.6} draw={room.sofaFront} />
      <Plane z={2.6} draw={room.plant} x={-120} />
      <Plane z={2.2} draw={room.lamp} x={-60} shadow={0} />
    </Stage>
  );
};
export const semaOnSofa = (words: Word[], emo: (t: number) => Emo = () => "curious") => (t: number): Pose => ({
  emo: emo(t), look: [0.6, 1], tilt: 0.08, aR: [0.55, 2.1], aL: [0.3, 1.4], holdR: phone, talk: 0, // рассказчик говорит — Сёма молчит
});

// ---------------------------------------------------------------- EraBackground: набор фонов эпохи из 5–7 планов
export type EraPlace = "camp" | "city" | "field";
export const EraBackground: React.FC<{ era?: "rome"; place: EraPlace; tod?: TOD; cam?: CamKey[]; pop?: number; t0?: number; shake?: (t: number) => number; children?: React.ReactNode; fg?: boolean }> =
  ({ place, tod = "day", cam = [[0, 0, 0, 1]], pop = -1, t0 = 0, shake, children, fg = true }) => {
    setLight({ ang: -2.3, rim: tod === "gold" || tod === "dusk" ? "rgba(255,190,120,0.95)" : "rgba(255,236,190,0.85)" });
    return (
      <Stage t0={t0} cam={cam} pop={pop} shake={shake} bg={SKY[tod][1]} light={tod === "night" ? "night" : tod === "gold" ? "gold" : tod === "dusk" ? "dusk" : "day"} rays={tod === "day" ? 0.28 : 0.45}>
        <Plane z={40} draw={rome.sky(tod)} dyn shadow={0} popOrder={0} boil={false} />
        <Plane z={22} draw={rome.clouds} dyn shadow={0.15} popOrder={1} />
        <Plane z={14} draw={place === "city" ? rome.city : rome.hills} popOrder={2} />
        {place === "camp" ? <Plane z={8} draw={rome.camp} popOrder={3} /> : null}
        <Plane z={6} draw={rome.ground(place === "field" ? "#C9C08A" : "#D9C08E")} popOrder={3} y={60} />
        {children}
        {fg ? <Plane z={2.4} draw={rome.foreground} popOrder={7} x={0} /> : null}
      </Stage>
    );
  };

// ---------------------------------------------------------------- Portal: вспышка → лист комнаты рвётся → под ним раскрывается эпоха
// before — сцена комнаты, after — сцена эпохи (её Stage стоит с pop = момент разрыва). at — секунда разрыва внутри Sequence.
export const Portal: React.FC<{ before: React.ReactNode; after: React.ReactNode; at?: number }> = ({ before, after, at = 0.35 }) => {
  const t = useCurrentFrame() / FPS; const u = t - at;
  const flash = keys(t, [[0, 0], [Math.max(0, at - 0.3), 0], [at - 0.02, 1], [at + 0.3, 0]]);
  const open = eo(u / 0.75);
  // линия разрыва: зигзаг сверху вниз по центру
  const r = rng(17); const line: [number, number][] = []; for (let y = -40; y <= 1960; y += 60) line.push([540 + (r() - 0.5) * 140 + Math.sin(y / 300) * 60, y]);
  const poly = (side: -1 | 1) => { const edge = line.map(([x, y]) => `${x}px ${y}px`); return side < 0 ? `polygon(-50px -50px, ${edge.join(",")}, -50px 1970px)` : `polygon(1130px -50px, ${edge.join(",")}, 1130px 1970px)`; };
  const half = (side: -1 | 1) => (
    <AbsoluteFill style={{ clipPath: poly(side), transform: `translateX(${side * open * 760}px) rotate(${side * open * 14}deg) scale(${1 + open * 0.15})`, transformOrigin: side < 0 ? "0% 100%" : "100% 100%",
      filter: "drop-shadow(0 0 0 #fff)" }}>
      {before}
      {/* белая кромка разрыва с волокнами */}
      <CanvasArt draw={(g) => { const pts: Pt[] = line.map(([x, y]) => [x, y]); const P = tear(pts.concat([[side < 0 ? -60 : 1140, 1980]] as Pt[]), 6, 10, 5);
        g.save(); g.strokeStyle = "#FBF8EF"; g.lineWidth = 22; g.beginPath(); P.slice(0, -1).forEach((p, i) => (i ? g.lineTo(p[0], p[1]) : g.moveTo(p[0], p[1]))); g.stroke(); g.restore(); }} />
    </AbsoluteFill>
  );
  return (
    <AbsoluteFill>
      {u >= 0 ? after : before}
      {u >= 0 && open < 1 ? <>{half(-1)}{half(1)}</> : null}
      <AbsoluteFill style={{ background: "radial-gradient(circle at 50% 42%, #FFFFFF 0%, #FFF4C8 45%, rgba(255,230,160,0.6) 100%)", opacity: flash, pointerEvents: "none" }} />
    </AbsoluteFill>
  );
};
