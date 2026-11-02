// «Что, если…?» · Меловой период · Часть 4 «Двенадцать километров». Время — по распознанным словам голоса (script/words_take1.json).
// Камера спокойная (как в Ч1), активная — только в ударных моментах: бросок матери, удар и крен, «Газу!», вожак.
import React from "react";
import { getInputProps, AbsoluteFill, Audio, Sequence, interpolate, spring, staticFile, useCurrentFrame, useVideoConfig } from "remotion";
import "./fonts";
import subs from "./subs.json";
import { SFX } from "./sfx";
import { Layer, Shot, useSec, keys, step, clamp, eo, eio, back, W, H, FPS } from "./stage2d";
import { PAL, G, cut, fillP, strokeP, clipTo, rrectP, ellP, rectP, rng, text, tear, rivet, tape, fernBush, fern } from "./cut";
import { puppet, Pose, Who, blinkAt, talkAt } from "./puppets";
import { btr, skyDay, trunks, zigRow, fernRow, ground, jerrycan } from "./props";
import { radioScreen } from "./props2";
import { raptor } from "./props3";
import { triceratops, TriPose, river, jet, swamp, bigTrunk, pot, rock, sunsetSky } from "./props4";

// ===================================================================== общие куски
const OL = [PAL.olive, PAL.oliveD], OL2 = [PAL.oliveD, "#56622E"];
const Pup: React.FC<{ who: Who; x: number; y: number; sc?: number; d?: number; pose: (t: number) => Pose; flip?: boolean; seed?: number; blur?: number }> =
  ({ who, x, y, sc = 4, d = 1, pose, flip = false, seed = 1, blur = 0 }) => (
    <Layer dyn frame={false} w={Math.round(200 * sc)} h={Math.round(250 * sc)} x={x} y={y - 120 * sc} d={d} scale={sc} shadow={0.4} blur={blur}
      draw={(g, t) => { g.translate(100, 245); if (flip) g.scale(-1, 1); puppet(g, who, pose(t), seed); }} />
  );
const Tri: React.FC<{ x: number; y: number; sc?: number; d?: number; flip?: boolean; pose: (t: number) => TriPose; dark?: number; blur?: number }> = ({ x, y, sc = 1, d = 1, flip = false, pose, dark = 0, blur = 0 }) => (
  <Layer dyn frame={false} w={Math.round(1400 * sc)} h={Math.round(800 * sc)} x={x} y={y - 360 * sc} d={d} scale={sc} shadow={0.45} blur={blur}
    draw={(g, t) => { g.translate(700, 760); if (flip) g.scale(-1, 1); triceratops(g, pose(t)); if (dark > 0) { g.globalCompositeOperation = "source-atop"; g.fillStyle = `rgba(12,12,10,${dark})`; g.fillRect(-1000, -1000, 2000, 2000); } }} />
);
// дневной лес (как в Ч1–Ч2)
const Forest: React.FC<{ gy?: number; sun?: [number, number, number] | null; scroll?: (t: number) => number; sky?: (g: G) => void; tint?: string }> = ({ gy = 1300, sun = [700, 380, 125], scroll = () => 0, sky, tint }) => {
  const sec = useSec(); const sx = scroll(sec);
  return (<>
    <Layer d={0.25} dx={(sx * 0.25) % 400} w={2200} shadow={0} draw={(g) => { if (sky) sky(g); else skyDay(g, 2200, H, sun); g.translate(-560, 0); trunks(g, 2200, H, 3, "#6A6648", 9); }} />
    <Layer d={0.45} dx={(sx * 0.45) % 600} w={2400} blur={2} draw={(g) => { g.translate(-660, 0); zigRow(g, 2400, gy - 60, 600, 1000, [PAL.oliveD, "#4E5A2C"], 4, 12, 70); if (tint) { g.globalCompositeOperation = "source-atop"; g.fillStyle = tint; g.fillRect(0, 0, 2400, H); } }} />
    <Layer d={0.7} dx={(sx * 0.7) % 700} w={2600} draw={(g) => { g.translate(-760, 0); fernRow(g, 2600, gy + 20, 260, OL2, 9, 9); if (tint) { g.globalCompositeOperation = "source-atop"; g.fillStyle = tint; g.fillRect(0, 0, 2600, H); } }} />
    <Layer d={0.85} shadow={0.25} draw={(g) => ground(g, W, gy, H - gy + 300, "#9C7A4E", 4)} />
  </>);
};
// берег реки: дальний берег, река, ближний берег
const RiverScene: React.FC<{ farY?: number; waterY?: number; children?: React.ReactNode; sky?: (g: G) => void; tint?: string }> = ({ farY = 1080, waterY = 1150, children, sky, tint }) => (<>
  <Layer d={0.25} w={2200} shadow={0} draw={(g) => { if (sky) sky(g); else skyDay(g, 2200, H, [800, 360, 120]); }} />
  <Layer d={0.4} w={2400} blur={2} draw={(g) => { g.translate(-660, 0); zigRow(g, 2400, farY - 30, 500, 800, [PAL.oliveD, "#4E5A2C"], 7, 12, 60); if (tint) { g.globalCompositeOperation = "source-atop"; g.fillStyle = tint; g.fillRect(0, 0, 2400, H); } }} />
  <Layer d={0.55} w={2600} draw={(g) => { g.translate(-760, 0); cut(g, rectP(-20, farY - 10, 2640, 200), "#8C7448", { seed: 3 }); fernRow(g, 2600, farY + 10, 200, OL2, 13, 10); if (tint) { g.globalCompositeOperation = "source-atop"; g.fillStyle = tint; g.fillRect(0, 0, 2600, H); } }} />
  {children}
  <Layer d={0.9} dyn shadow={0} draw={(g, t) => river(g, W, waterY, H - waterY, t)} />
</>);

// ===================================================================== ШОТЫ
// 1 · 0–7.0 — хук: детёныш трицератопса у воды, к нему тянется рука; за спиной встаёт тень матери
const S1: React.FC = () => {
  const sec = useSec();
  const rise = keys(sec, [[4.6, 0], [6.0, 1]], eo);
  return (<>
    <RiverScene farY={1000} waterY={1420} tint="rgba(30,30,20,0.15)">
      <Tri x={700} y={1080 + 300 - rise * 300} sc={1.7} d={0.7} dark={0.88} pose={() => ({ head: -0.12, seed: 2 })} />
      <Layer d={0.75} draw={(g) => { cut(g, rectP(-100, 1120, W + 200, 400), "#8C7448", { seed: 5 }); }} />
      <Tri x={660} y={1150} sc={1.5} pose={(t) => ({ baby: true, head: Math.sin(t * 2) * 0.08, walk: t * 1.5, seed: 4 })} />
    </RiverScene>
    <Layer d={1.1} dyn draw={(g, t) => { const r = keys(t, [[0.8, -260], [3.0, 0]], eo) + Math.sin(t * 3) * 6; g.translate(r, -180); cut(g, rrectP(-200, 1040, 420, 130, 60), PAL.olive, { seed: 6 }); cut(g, ellP(250, 1100, 70, 58, 24), "#EBC7A0", { seed: 7 }); for (let i = 0; i < 4; i++) cut(g, rrectP(270 + i * 6, 1050 + i * 26, 70, 26, 13), "#EBC7A0", { seed: 8 + i, edge: 0.6 }); }} />
  </>);
};
// 2 · 7.0–14.7 — отряд на БТР в лесу; «двенадцать километров»
const S2: React.FC = () => (<>
  <Forest gy={1380} />
  {(["lis", "kotov", "bugaev", "petrov"] as Who[]).map((w, i) => (
    <Pup key={w} who={w} x={250 + i * 190} y={1610} sc={2.3} seed={i + 1} pose={(t) => ({ expr: w === "petrov" ? "smirk" : w === "bugaev" ? "stern" : "calm", look: [0.7, -0.2], legs: false, blink: blinkAt(t, i + 1) })} />))}
  <Layer d={1} draw={(g) => { g.translate(540, 1800); g.scale(1.5, 1.5); btr(g, { noTurret: true }); }} />
  <AbsoluteFill><div style={{ position: "absolute", left: 120, top: 340, fontFamily: "JetBrains Mono", fontWeight: 700, fontSize: 40, color: PAL.ink, background: PAL.edge, padding: "10px 22px", boxShadow: "6px 9px 12px rgba(20,12,4,0.45)", transform: "rotate(-1.2deg)" }}>ДО ВОРОНА: 12 КМ ↑</div></AbsoluteFill>
</>);
// 3 · 14.7–26.8 — лес: стволы толще машины, БТР садится в болото, рубят ветки
const S3: React.FC = () => {
  const sec = useSec();
  const dist = keys(sec, [[14.7, 0], [21.6, 900]], (x) => x);
  const sink = keys(sec, [[22.0, 0], [23.4, 1]], eo);
  return (<>
    <Forest gy={1300} scroll={() => -dist} />
    <Layer d={0.8} w={3000} dx={-dist * 0.8 + 900} draw={(g) => { g.translate(-960, 0); bigTrunk(g, 200, 260, 1400, 2); bigTrunk(g, 1100, 300, 1400, 5); bigTrunk(g, 2000, 280, 1400, 9); }} />
    <Layer d={0.92} dyn shadow={0} draw={(g, t) => { if (t > 21.4) swamp(g, W, 1450 - sink * 40, t); }} />
    <Layer d={1} dyn draw={(g, t) => { const b = sec < 21.6 ? Math.abs(Math.sin(t * 7)) * 6 : 0; g.translate(540, 1460 + sink * 90 - b); g.scale(1.3, 1.3); btr(g, { wheel: dist / 60 }); }} />
    <Layer d={0.95} dyn shadow={0} draw={(g, t) => { if (t > 21.4) { g.save(); g.globalAlpha = 0.95; cut(g, rectP(-60, 1440 + (1 - sink) * 120, W + 120, 500), "#3E3A22", { seed: 9, edge: 0.6 }); g.restore(); } }} />
    {sec > 24.6 ? <>
      <Pup who="bugaev" x={180} y={1700} sc={3.0} seed={3} d={1.05} pose={(t) => ({ expr: "resolve", aR: [1.4 + Math.max(0, Math.sin(t * 6)) * 1.2, 0.3], legs: false, look: [0.6, 0], blink: blinkAt(t, 3) })} />
      <Pup who="kotov" x={900} y={1700} sc={3.0} d={1.05} flip pose={(t) => ({ expr: "resolve", aR: [1.4 + Math.max(0, Math.sin(t * 6 + 1.5)) * 1.2, 0.3], legs: false, look: [0.6, 0], blink: blinkAt(t, 1) })} />
    </> : null}
    <Layer d={1.6} blur={8} w={3200} dx={-dist * 1.5 + 1100} draw={(g) => { g.translate(-1060, 0); for (let i = 0; i < 4; i++) fernBush(g, 300 + i * 800, 1950, 500, OL, 40 + i, 0.8); }} />
  </>);
};
// 4 · 26.8–30.6 — жара; «ВОДА — 3 ДНЯ»
const S4: React.FC = () => {
  const sec = useSec();
  return (<>
    <Forest gy={1220} sun={[540, 520, 210]} />
    <AbsoluteFill style={{ background: "radial-gradient(ellipse 70% 40% at 50% 28%, rgba(255,210,120,0.35), rgba(0,0,0,0) 70%)" }} />
    <Layer d={1} dyn draw={(g, t) => { for (let i = 0; i < 4; i++) { g.save(); g.translate(180 + i * 240, 1260 + Math.sin(t * 6 + i) * 1.5); g.scale(1.05, 1.05); jerrycan(g, 0.28, t, i + 1); g.restore(); } }} />
    <AbsoluteFill><div style={{ position: "absolute", left: 110, top: 330, width: 860, background: PAL.edge, padding: "16px 26px", boxShadow: "8px 12px 16px rgba(20,12,4,0.45)", transform: "rotate(-0.8deg)" }}>
      <div style={{ display: "flex", justifyContent: "space-between", fontFamily: "JetBrains Mono", fontWeight: 700, fontSize: 34, color: PAL.ink }}><span>ВОДА</span><span style={{ fontFamily: "Montserrat", fontWeight: 900, color: sec > 29.7 ? PAL.scarf : PAL.ink }}>{sec > 29.7 ? "3 ДНЯ" : "? ДНЯ"}</span></div>
      <div style={{ height: 18, background: "#D9D2BF", marginTop: 10 }}><div style={{ height: 18, width: "27%", background: sec > 29.7 ? PAL.red : PAL.blue }} /></div></div></AbsoluteFill>
  </>);
};
// 5 · 30.6–36.4 — река: ты набираешь котелок → котелок кипит на костре
const S5: React.FC = () => {
  const sec = useSec();
  if (sec < 33.4) return (<RiverScene farY={980} waterY={1250}>
    <Pup who="kotov" x={460} y={1560} sc={4.2} d={0.95} pose={(t) => ({ expr: "curious", aR: [1.1, 1.3], aL: [0.3, 0.6], legs: false, look: [0.4, 0.8], tilt: 0.1, blink: blinkAt(t, 1),
      holdR: (g) => { g.rotate(0.4); g.scale(0.12, 0.12); g.translate(0, 160); cut(g, [[-80, -160], [80, -160], [70, -60], [-70, -60]], "#5E6168", { seed: 22 }); } })} />
  </RiverScene>);
  return (<>
    <Forest gy={1300} />
    <Layer d={1} dyn draw={(g, t) => { g.translate(540, 1130); g.scale(1.6, 1.6); pot(g, t, clamp((t - 34.8) * 2)); }} />
  </>);
};
// 6 · 36.4–40.1 — Бугаев смотрит на воду: «А ведь он плавает»
const S6: React.FC = () => (<>
  <RiverScene farY={950} waterY={1150} />
  <Pup who="bugaev" x={500} y={1980} sc={7.4} seed={3} d={1} pose={(t) => ({ expr: t < 38.9 ? "stern" : "smirk", talk: talkAt(t, [[39.1, 40.0]]), look: [t < 38.5 ? 0.8 : 0.2, 0.3], aR: [0.2, 0.3], legs: false, blink: blinkAt(t, 3) })} />
</>);
// 7 · 40.1–46.6 — БТР сползает в реку и плывёт, работает водомёт
const S7: React.FC = () => {
  const sec = useSec();
  const slide = keys(sec, [[40.3, 0], [42.4, 1]], eio);
  const swim = keys(sec, [[42.4, 0], [46.6, 260]], (x) => x);
  return (<RiverScene farY={900} waterY={1180}>
    <Layer d={0.85} dyn draw={(g, t) => { g.translate(260 + slide * 160 + swim, 1130 + slide * 140 + Math.sin(t * 1.6) * 6); g.rotate((1 - slide) * 0.12 * (slide > 0 ? 1 : 0.9)); g.scale(1.35, 1.35); btr(g, {}); if (t > 43.3) jet(g, -380, -90, t); }} />
    <Layer d={0.8} draw={(g) => { cut(g, rectP(-200, 1060, 380, 600), "#8C7448", { seed: 3 }); }} />
  </RiverScene>);
};
// 8 · 46.6–52.7 — на том берегу пасутся трицератопсы
const S8: React.FC = () => (<RiverScene farY={1060} waterY={1250}>
  <Tri x={230} y={1080} sc={0.72} d={0.6} pose={(t) => ({ head: 0.25 + Math.sin(t * 0.7) * 0.08, walk: t * 0.6, seed: 1 })} />
  <Tri x={840} y={1100} sc={0.8} d={0.62} flip pose={(t) => ({ head: 0.1 + Math.sin(t * 0.5 + 1) * 0.1, walk: t * 0.5, seed: 3 })} />
  <Tri x={540} y={1150} sc={0.95} d={0.66} pose={(t) => ({ head: t > 51.0 ? -0.05 : 0.2, walk: t * 0.4, seed: 5 })} />
</RiverScene>);
// 9 · 52.7–58.5 — к самой воде выходит детёныш
const S9: React.FC = () => (<RiverScene farY={900} waterY={1300}>
  <Tri x={330} y={1000} sc={1.05} d={0.6} pose={(t) => ({ head: 0.1, walk: t * 0.4, seed: 5 })} />
  <Layer d={0.75} draw={(g) => { cut(g, rectP(-100, 1130, W + 200, 300), "#8C7448", { seed: 5 }); }} />
  <Tri x={640} y={1160} sc={1.5} pose={(t) => ({ baby: true, head: Math.sin(t * 2.4) * 0.12, walk: keys(t, [[53.0, 0], [57.0, 6]], (x) => x), seed: 4 })} />
</RiverScene>);
// 10 · 58.5–63.9 — Петров высовывается из люка и тянет руку
const S10: React.FC = () => (<RiverScene farY={1000} waterY={1360}>
  <Tri x={880} y={1220} sc={1.25} d={0.8} pose={(t) => ({ baby: true, head: Math.sin(t * 2.4) * 0.12, seed: 4 })} />
  <Pup who="petrov" x={420} y={1440} sc={3.2} seed={2} d={0.86} pose={(t) => ({ expr: t < 60.5 ? "curious" : t < 62.4 ? "smirk" : "calm", talk: talkAt(t, [[60.6, 62.2]]), aR: [keys(t, [[62.4, 0.3], [63.4, 1.45]], eo), 0.2], legs: false, look: [0.8, 0.3], blink: blinkAt(t, 2) })} />
  <Layer d={0.88} dyn draw={(g, t) => { g.translate(380, 1520 + Math.sin(t * 1.6) * 6); g.scale(1.1, 1.1); btr(g, { noTurret: true }); }} />
</RiverScene>);
// 11 · 63.9–72.5 — мать с рёвом бросается в воду, УДАР, крен, вода у люка
const S11: React.FC = () => {
  const sec = useSec();
  const run = keys(sec, [[64.0, 0], [66.2, 1]], (x) => x * x);
  const tilt = keys(sec, [[66.2, 0], [66.8, -0.2], [70.5, -0.24]], back);
  const flood = keys(sec, [[68.2, 0], [70.0, 1]], eo);
  return (<RiverScene farY={1000} waterY={1350 - flood * 60}>
    <Tri x={1150 - run * 470} y={1380} sc={0.95} d={0.84} flip pose={(t) => ({ head: t > 65.3 ? 0.35 : 0.1, jaw: t > 64.1 && t < 66.4 ? 0.3 : 0.05, walk: t * 5, seed: 5 })} />
    <Layer d={0.86} dyn draw={(g, t) => { g.translate(380, 1520 + Math.sin(t * 1.6) * 6); g.rotate(tilt); g.scale(1.1, 1.1); btr(g, { noTurret: true });
      if (t > 66.2 && t < 68.5) { const k = (t - 66.2) / 2.3; for (let i = 0; i < 10; i++) { g.save(); g.globalAlpha = 1 - k; cut(g, ellP(250 + Math.cos(i) * 120 * k * 3, -200 - Math.sin(i * 1.3) * 200 * k - 100 * k, 26, 18, 12), "#EAF4FF", { seed: i, edge: 0.4, thick: false }); g.restore(); } } }} />
    <Pup who="petrov" x={450} y={1350} sc={2.6} seed={2} d={0.87} pose={(t) => ({ expr: "shock", aR: [2.2, 0.4], aL: [2.0, 0.6], legs: false, look: [0.8, 0], tilt: tilt })} />
  </RiverScene>);
};
// 12 · 72.5–80.1 — «Газу! Газу!» (ТОЛЧОК) → Бугаев: «Нет. Задний. Медленно»
const S12: React.FC = () => {
  const sec = useSec();
  const bg = <Layer d={0.6} blur={6} shadow={0} draw={(g) => { g.fillStyle = "#3E3A26"; g.fillRect(-200, -200, W + 400, H + 400); const gl = g.createRadialGradient(540, 300, 10, 540, 300, 900); gl.addColorStop(0, "rgba(120,180,230,0.35)"); gl.addColorStop(1, "rgba(120,180,230,0)"); g.fillStyle = gl; g.fillRect(-200, -200, W + 400, H + 400); }} />;
  if (sec < 75.0) return (<>{bg}<Pup who="petrov" x={540} y={2200} sc={8.0} seed={2} pose={(t) => ({ expr: "shock", talk: talkAt(t, [[73.6, 74.9]]), aR: [2.4, 0.5], aL: [2.4, 0.5], legs: false, look: [0, 0], tilt: Math.sin(t * 9) * 0.03 })} /></>);
  return (<>{bg}<Pup who="bugaev" x={540} y={2250} sc={7.4} seed={3} pose={(t) => ({ expr: t < 77.6 ? "stern" : "resolve", talk: talkAt(t, [[77.7, 78.2], [78.4, 78.9], [79.1, 79.7]]), aR: [0.2, 0.3], legs: false, look: [0.3, 0], blink: blinkAt(t, 3) })} /></>);
};
// 13 · 80.1–86.0 — мать опускает голову для второго удара
const S13: React.FC = () => (<RiverScene farY={980} waterY={1380}>
  <Tri x={660} y={1460} sc={1.2} d={0.88} flip pose={(t) => ({ head: keys(t, [[80.3, 0.1], [81.6, 0.45]], eo), jaw: 0.05, walk: Math.sin(t * 2) * 0.3, seed: 5 })} />
</RiverScene>);
// 14 · 86.0–91.1 — это не хищник: мать стоит между БТР и детёнышем
const S14: React.FC = () => (<RiverScene farY={1000} waterY={1360}>
  <Tri x={960} y={1300} sc={0.6} d={0.7} pose={(t) => ({ baby: true, head: Math.sin(t * 2) * 0.1, seed: 4 })} />
  <Tri x={780} y={1420} sc={0.9} d={0.84} flip pose={(t) => ({ head: 0.3, seed: 5 })} />
  <Layer d={0.86} dyn draw={(g, t) => { g.translate(240, 1520 + Math.sin(t * 1.6) * 6); g.rotate(-0.05); g.scale(1.0, 1.0); btr(g, { noTurret: true }); }} />
</RiverScene>);
// 15 · 91.1–97.6 — БТР медленно пятится, мать не преследует
const S15: React.FC = () => {
  const sec = useSec();
  const back_ = keys(sec, [[91.4, 0], [97.6, 420]], eio);
  return (<RiverScene farY={1000} waterY={1360}>
    <Tri x={980} y={1300} sc={0.6} d={0.7} pose={(t) => ({ baby: true, head: Math.sin(t * 2) * 0.1, seed: 4 })} />
    <Tri x={820} y={1420} sc={0.9} d={0.84} flip pose={(t) => ({ head: keys(t, [[93.6, 0.3], [95.0, 0.05]], eo), seed: 5 })} />
    <Layer d={0.86} dyn draw={(g, t) => { g.translate(300 - back_, 1520 + Math.sin(t * 1.6) * 6); g.scale(1.0, 1.0); btr(g, { noTurret: true }); g.scale(-1, 1); jet(g, -380, -90, t * 0.7); }} />
  </RiverScene>);
};
// 16 · 97.6–104.4 — выбрались на берег ниже по течению → Петров молчит
const S16: React.FC = () => {
  const sec = useSec();
  if (sec < 101.5) { const up = keys(sec, [[97.8, 0], [100.8, 1]], eio);
    return (<RiverScene farY={980} waterY={1400}>
      <Layer d={0.82} draw={(g) => { cut(g, [[-100, 1350], [500, 1330], [800, 1480], [800, 1700], [-100, 1700]], "#8C7448", { seed: 6 }); }} />
      <Layer d={0.86} dyn draw={(g, t) => { g.translate(820 - up * 420, 1560 - up * 200); g.rotate(-0.12 * Math.sin(up * Math.PI)); g.scale(-1.05, 1.05); btr(g, { wheel: up * 6 }); }} />
    </RiverScene>); }
  return (<>
    <Forest gy={1300} />
    <Pup who="petrov" x={540} y={2200} sc={8.0} seed={2} pose={(t) => ({ expr: "relief", aR: [0.15, 0.3], aL: [0.15, 0.3], legs: false, look: [0, 0.6], tilt: 0.1 })} />
  </>);
};
// 17 · 104.4–111.7 — закат: впереди скала с белой полосой
const S17: React.FC = () => (<>
  <Forest gy={1360} sky={(g) => sunsetSky(g, 2200, H, [1300, 1050, 150])} tint="rgba(70,30,20,0.4)" />
  <Layer d={0.4} draw={(g) => { g.translate(540, 1300); g.scale(1.25, 1.25); rock(g, 0); }} />
  <Layer d={1} draw={(g) => { g.translate(420, 1780); g.scale(1.3, 1.3); btr(g, {}); g.globalCompositeOperation = "source-atop"; g.fillStyle = "rgba(60,25,10,0.45)"; g.fillRect(-500, -500, 1000, 600); }} />
</>);
// 18 · 111.7–120.5 — Лисицын вызывает Ворона: в эфире тишина → на вершине мигает фонарик
const S18: React.FC = () => {
  const sec = useSec();
  if (sec < 116.0) return (<>
    <Layer d={0.6} blur={6} shadow={0} draw={(g) => { g.fillStyle = "#3A2A22"; g.fillRect(-200, -200, W + 400, H + 400); const gl = g.createRadialGradient(800, 400, 10, 800, 400, 800); gl.addColorStop(0, "rgba(240,140,70,0.4)"); gl.addColorStop(1, "rgba(240,140,70,0)"); g.fillStyle = gl; g.fillRect(-200, -200, W + 400, H + 400); }} />
    <Pup who="lis" x={460} y={2150} sc={7.6} seed={4} pose={(t) => ({ expr: t < 114.6 ? "curious" : "fear", talk: talkAt(t, [[112.0, 113.9]]), aR: [0.9, 2.2], aL: [0.2, 0.3], legs: false, look: [0.5, 0], blink: blinkAt(t, 4) })} />
    <Layer d={1.05} dyn draw={(g, t) => { g.translate(880, 900); cut(g, rrectP(-110, -150, 220, 300, 14), "#2F3324", { seed: 3 }); radioScreen(g, -80, -110, 160, 100, t, 0); text(g, "· · ·", 0, 60, 30, "#5A6A5A", "JetBrains Mono", 700); }} />
  </>);
  const on = Math.sin((sec - 116.0) * 9) > 0 ? 1 : 0.15;
  return (<>
    <Layer d={0.25} w={2200} shadow={0} draw={(g) => sunsetSky(g, 2200, H, [1500, 1300, 120])} />
    <Layer d={1} dyn draw={(g) => { g.translate(560, 1500); g.scale(2.6, 2.6); rock(g, 0, on); }} />
  </>);
};
// 19 · 120.5–122.9 — морзянка: «ЗА… ВАМИ… ИДУТ»
const S19: React.FC = () => {
  const sec = useSec();
  const on = Math.sin((sec - 120.4) * 11) > 0.2 ? 1 : 0.1;
  const words: [string, number][] = [["ЗА", 120.7], ["ВАМИ", 121.2], ["ИДУТ", 122.0]];
  return (<>
    <Layer d={0.25} w={2200} shadow={0} draw={(g) => sunsetSky(g, 2200, H, [1500, 1300, 120])} />
    <Layer d={1} dyn draw={(g) => { g.translate(560, 1500); g.scale(2.6, 2.6); rock(g, 0, on); }} />
    <AbsoluteFill><div style={{ position: "absolute", left: 0, width: W, top: 420, textAlign: "center" }}>
      <div style={{ display: "inline-block", background: PAL.edge, padding: "14px 30px", fontFamily: "JetBrains Mono", fontWeight: 700, fontSize: 46, color: PAL.ink, boxShadow: "8px 12px 14px rgba(20,12,4,0.5)", transform: "rotate(-1deg)" }}>
        {"· · —   · — —   · · —".slice(0, Math.max(0, Math.floor((sec - 120.4) * 9)))}<br />
        <span style={{ fontFamily: "Montserrat", fontWeight: 900, fontSize: 56 }}>{words.filter(([, t]) => sec >= t).map(([w]) => w).join(" ")}</span></div></div></AbsoluteFill>
  </>);
};
// 20 · 122.9–136.0 — ты оборачиваешься; в папоротниках за кормой — силуэт с рваным пером; «ОН ВСЁ ЕЩЁ ИДЁТ ЗА ВАМИ»
const S20: React.FC = () => {
  const sec = useSec();
  if (sec < 124.4) return (<>
    <Forest gy={1300} sky={(g) => sunsetSky(g, 2200, H, [900, 1000, 130])} tint="rgba(60,25,15,0.45)" />
    <Pup who="kotov" x={540} y={2200} sc={8.0} pose={(t) => ({ expr: "fear", look: [keys(t, [[123.2, 0], [123.6, 0.9]], eo), 0], tilt: keys(t, [[123.2, 0], [123.7, -0.1]], eo), legs: false, aR: [0.2, 0.3], aL: [0.2, 0.3] })} />
  </>);
  const appear = clamp((sec - 128.0) * 2.5);
  return (<>
    <Forest gy={1300} sky={(g) => sunsetSky(g, 2200, H, [900, 1000, 130])} tint="rgba(40,18,12,0.55)" />
    <Layer d={0.82} dyn draw={(g, t) => { if (appear <= 0) return; g.save(); g.globalAlpha = appear; g.translate(560, 1420 - appear * 40); g.scale(-1.25, 1.25); raptor(g, { head: Math.sin(t * 1.4) * 0.1 - 0.15, leader: true, night: true, eye: 1, seed: 1 }); g.globalCompositeOperation = "source-atop"; g.fillStyle = "rgba(8,8,8,0.85)"; g.fillRect(-500, -500, 1000, 600); g.restore();
      if (appear > 0.5) { for (const dx of [-1, 1]) { const gl = g.createRadialGradient(560 - 160 - dx * 6, 1060, 1, 560 - 160 - dx * 6, 1060, 24); gl.addColorStop(0, "rgba(255,214,90,0.9)"); gl.addColorStop(1, "rgba(255,214,90,0)"); g.fillStyle = gl; g.fillRect(560 - 190 - dx * 6, 1030, 60, 60); } } }} />
    <Layer d={0.9} dyn draw={(g, t) => { const sw = t < 127.2 ? Math.sin(t * 9) * 0.06 : Math.sin(t * 2) * 0.02; g.translate(0, 0); for (let i = 0; i < 6; i++) fern(g, 60 + i * 200, 1560, 520, -Math.PI / 2 + (i - 2.5) * 0.25 + sw * (i % 2 ? 1 : -1), i % 2 ? "#2E3820" : "#3F4A25", 50 + i, { droop: 0.3 }); }} />
    <Layer d={1} draw={(g) => { g.translate(540, 2050); g.scale(1.6, 1.6); btr(g, { noTurret: true }); g.globalCompositeOperation = "source-atop"; g.fillStyle = "rgba(40,18,10,0.5)"; g.fillRect(-500, -500, 1000, 600); }} />
    {sec > 133.2 ? <AbsoluteFill><div style={{ position: "absolute", left: -60, top: 700, width: 1200, textAlign: "center", fontFamily: "Montserrat", fontWeight: 900, fontSize: 62, color: "#fff", background: PAL.scarf,
      transform: `rotate(-8deg) scale(${interpolate(sec, [133.2, 133.45], [1.35, 1], { extrapolateRight: "clamp" })})`, boxShadow: "10px 16px 20px rgba(10,6,2,0.55)", padding: "10px 0" }}>ОН ВСЁ ЕЩЁ ИДЁТ ЗА ВАМИ</div></AbsoluteFill> : null}
  </>);
};

// ===================================================================== монтаж
type Tr = "cut" | "dark";
const Transition: React.FC<{ at: number; kind: Tr }> = ({ at, kind }) => {
  const t = useCurrentFrame() / FPS; const k0 = (t - at) / 0.4;
  if (kind === "cut" || k0 < -1 || k0 > 1) return null;
  return <AbsoluteFill style={{ backgroundColor: "#06070A", opacity: 1 - Math.abs(eio((k0 + 1) / 2) * 2 - 1) }} />;
};
type ShotDef = { t0: number; t1: number; el: React.ReactNode; cam?: [number, number, number, number][]; shake?: (t: number) => number; dim?: (t: number) => number; tr?: Tr };
const hitShake = (hits: number[], amp: number) => (t: number) => hits.reduce((a, h) => a + (t >= h ? Math.exp(-(t - h) * 6) : 0), 0) * amp;
const SHOTS: ShotDef[] = [
  { t0: 0, t1: 7.0, el: <S1 />, cam: [[0, 0, 0, 1.0], [7.0, 30, -40, 1.08]] },
  { t0: 7.0, t1: 14.7, el: <S2 />, cam: [[7.0, -60, 40, 1.12], [14.7, 60, 40, 1.12]] },
  { t0: 14.7, t1: 26.8, el: <S3 />, cam: [[14.7, 0, 0, 1.0], [21.5, 0, 0, 1.0], [24.6, 0, 100, 1.06], [26.8, 0, 100, 1.08]] },
  { t0: 26.8, t1: 30.6, el: <S4 />, cam: [[26.8, 0, 0, 1.0], [30.6, 0, 40, 1.04]] },
  { t0: 30.6, t1: 36.4, el: <S5 />, cam: [[30.6, 0, 0, 1.0], [33.35, 0, 20, 1.04], [33.4, 0, 0, 1.0], [36.4, 0, -40, 1.06]] },
  { t0: 36.4, t1: 40.1, el: <S6 />, cam: [[36.4, 0, 0, 1.0], [40.1, 0, -20, 1.05]] },
  { t0: 40.1, t1: 46.6, el: <S7 />, cam: [[40.1, -80, 0, 1.0], [46.6, 120, 0, 1.02]] },
  { t0: 46.6, t1: 52.7, el: <S8 />, cam: [[46.6, 0, 0, 1.0], [51.6, 0, 0, 1.03], [52.2, 0, -40, 1.12], [52.7, 0, -40, 1.13]] },
  { t0: 52.7, t1: 58.5, el: <S9 />, cam: [[52.7, 0, 0, 1.0], [58.5, 60, 60, 1.08]] },
  { t0: 58.5, t1: 63.9, el: <S10 />, cam: [[58.5, 0, 0, 1.0], [63.9, 60, 20, 1.05]] },
  { t0: 63.9, t1: 72.5, el: <S11 />, shake: hitShake([66.2], 26), cam: [[63.9, 60, 0, 1.0], [66.0, 0, 0, 1.02], [66.4, 0, 0, 1.08], [69.6, -40, 60, 1.1], [70.4, -120, 140, 1.3], [72.5, -120, 150, 1.32]] },
  { t0: 72.5, t1: 80.1, el: <S12 />, cam: [[72.5, 0, 0, 1.0], [73.6, 0, 0, 1.0], [73.9, 0, -40, 1.12], [74.95, 0, -40, 1.13], [75.0, 0, 0, 1.0], [80.1, 0, -20, 1.05]] },
  { t0: 80.1, t1: 86.0, el: <S13 />, cam: [[80.1, 0, 0, 1.0], [86.0, 60, -40, 1.1]] },
  { t0: 86.0, t1: 91.1, el: <S14 />, cam: [[86.0, 0, 0, 1.04], [91.1, 0, 0, 1.0]] },
  { t0: 91.1, t1: 97.6, el: <S15 />, cam: [[91.1, 0, 0, 1.0], [97.6, -120, 0, 1.0]] },
  { t0: 97.6, t1: 104.4, el: <S16 />, cam: [[97.6, 0, 0, 1.0], [101.45, -60, 0, 1.03], [101.5, 0, 0, 1.0], [104.4, 0, 0, 1.04]] },
  { t0: 104.4, t1: 111.7, el: <S17 />, tr: "dark", cam: [[104.4, 0, 60, 1.0], [111.7, 0, -40, 1.08]] },
  { t0: 111.7, t1: 120.5, el: <S18 />, cam: [[111.7, 0, 0, 1.0], [115.95, 0, 0, 1.04], [116.0, 0, 0, 1.0], [120.5, 0, -60, 1.08]] },
  { t0: 120.5, t1: 122.9, el: <S19 />, cam: [[120.5, 0, -60, 1.08], [122.9, 0, -70, 1.1]] },
  { t0: 122.9, t1: 136.0, el: <S20 />, dim: () => 0.15, cam: [[122.9, 0, 0, 1.0], [124.35, 0, 0, 1.04], [124.4, 0, 0, 1.0], [127.8, 0, 0, 1.0], [129.0, 0, -80, 1.12], [133.0, 0, -80, 1.14], [136.0, 0, -60, 1.1]] },
];

// ===================================================================== бирка времени
const TAGS: [number, string][] = [[0, "ДЕНЬ 2 — 08:30"], [30.6, "ДЕНЬ 2 — 12:40"], [104.4, "ДЕНЬ 2 — 19:10"]];
const Tag: React.FC = () => {
  const t = useCurrentFrame() / FPS;
  let txt = "", since = 0; for (const [s, x] of TAGS) if (t >= s) { txt = x; since = s; }
  if (!txt) return null;
  const k = t - since; const sw = Math.exp(-k * 2.2) * Math.sin(k * 7) * 0.12 + Math.sin(t * 1.3) * 0.015;
  const drop = interpolate(k, [0, 0.35], [-200, 0], { extrapolateRight: "clamp" });
  return (<div style={{ position: "absolute", left: 640, top: 0, transformOrigin: "50% 0", transform: `translateY(${drop}px) rotate(${sw}rad)` }}>
    <div style={{ width: 3, height: 210, background: "rgba(243,237,224,0.9)", margin: "0 auto" }} />
    <div style={{ background: PAL.edge, padding: "14px 30px 14px 46px", fontFamily: "JetBrains Mono", fontWeight: 700, fontSize: 34, color: PAL.ink, boxShadow: "7px 11px 14px rgba(20,12,4,0.5)", position: "relative", whiteSpace: "nowrap" }}>
      <div style={{ position: "absolute", left: 16, top: "50%", width: 14, height: 14, marginTop: -7, borderRadius: 7, background: "#3a3020" }} />{txt}</div>
  </div>);
};

// ===================================================================== субтитры (как в Ч1–Ч3)
type Grp = { s: number; e: number; words: { t: string; hl: boolean; s: number }[] };
const Captions: React.FC = () => {
  const f = useCurrentFrame(); const { fps } = useVideoConfig(); const t = f / fps;
  if (t > 133.2) return null;
  const g = (subs as Grp[]).find((x) => t >= x.s && t < x.e);
  if (!g) return null;
  return (<AbsoluteFill style={{ justifyContent: "flex-start", alignItems: "center", top: 1180 }}>
    <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "center", maxWidth: 900, gap: "14px 12px" }}>
      {g.words.map((w, i) => {
        if (t < w.s - 0.05) return <span key={i} style={{ visibility: "hidden", fontFamily: "Montserrat", fontWeight: 900, fontSize: 74, padding: "2px 16px" }}>{w.t}</span>;
        const sp = spring({ frame: f - Math.round(w.s * fps), fps, config: { damping: 12, stiffness: 260, mass: 0.5 } });
        const rot = ((i * 37 + Math.round(g.s * 10)) % 5 - 2) * 0.7;
        return <span key={i} style={{ fontFamily: "Montserrat", fontWeight: 900, fontSize: 74, lineHeight: 1.1, padding: "2px 16px", color: w.hl ? "#fff" : PAL.ink,
          background: w.hl ? PAL.scarf : PAL.edge, transform: `rotate(${rot}deg) scale(${interpolate(sp, [0, 1], [0.6, 1])})`, boxShadow: "6px 9px 10px rgba(15,10,4,0.5)",
          clipPath: "polygon(0 3%, 12% 0, 30% 4%, 55% 0, 78% 3%, 100% 0, 99% 50%, 100% 97%, 80% 100%, 52% 96%, 25% 100%, 0 97%, 1% 50%)" }}>{w.t}</span>;
      })}
    </div>
  </AbsoluteFill>);
};

const CLEAN = !!(getInputProps() as any).clean;
export const TOTAL = Math.round(SHOTS[SHOTS.length - 1].t1 * FPS);
export const Video: React.FC = () => (
  <AbsoluteFill style={{ backgroundColor: "#1a140c" }}>
    {SHOTS.map((s, i) => (
      <Sequence key={i} from={Math.round(s.t0 * FPS)} durationInFrames={Math.round((s.t1 - s.t0) * FPS)}>
        <Shot t0={s.t0} cam={s.cam} shake={s.shake} dim={s.dim}>{s.el}</Shot>
      </Sequence>
    ))}
    {SHOTS.slice(1).map((s, i) => <Transition key={i} at={s.t0} kind={s.tr ?? "cut"} />)}
    {CLEAN ? null : <Tag />}
    {CLEAN ? null : <Captions />}
    <Audio src={staticFile("voice.mp3")} />
    <SFX />
  </AbsoluteFill>
);
