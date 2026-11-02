// «Отряд БТР в меловом периоде» · Часть 5 «40 лет один». Время — по распознанным словам собранного голоса (script/words_full.json).
import React from "react";
import { getInputProps, AbsoluteFill, Audio, OffthreadVideo, Sequence, interpolate, spring, staticFile, useCurrentFrame, useVideoConfig } from "remotion";
import "./fonts";
import subs from "./subs.json";
import { SFX } from "./sfx";
import { TimeTag } from "./tag";
import { Layer, Shot, useSec, keys, clamp, eo, eio, back, W, H, FPS } from "./stage2d";
import { PAL, G, cut, fillP, strokeP, clipTo, rrectP, ellP, rectP, rng, text, fernBush, fern } from "./cut";
import { puppet, Pose, Who, blinkAt, talkAt } from "./puppets";
import { btr, ground } from "./props";
import { NIGHT, nightSky, nightTrees, nightFerns, fog, btrNight, radioScreen } from "./props2";
import { raptor, photo1986 } from "./props3";
import { rock } from "./props4";
import { voron, VoronPose, palisade, gates, gaz71, stove, crosses, garden, journal, fingerHand } from "./props5";

// ===================================================================== общие куски
const Pup: React.FC<{ who: Who; x: number; y: number; sc?: number; d?: number; pose: (t: number) => Pose; flip?: boolean; seed?: number; extra?: (g: G, t: number) => void }> =
  ({ who, x, y, sc = 4, d = 1, pose, flip = false, seed = 1, extra }) => (
    <Layer dyn frame={false} w={Math.round(200 * sc)} h={Math.round(250 * sc)} x={x} y={y - 120 * sc} d={d} scale={sc} shadow={0.4}
      draw={(g, t) => { g.translate(100, 245); if (flip) g.scale(-1, 1); puppet(g, who, pose(t), seed); if (extra) extra(g, t); }} />
  );
const Voron: React.FC<{ x: number; y: number; sc?: number; d?: number; pose: (t: number) => VoronPose }> = ({ x, y, sc = 4, d = 1, pose }) => (
  <Layer dyn frame={false} w={Math.round(240 * sc)} h={Math.round(340 * sc)} x={x} y={y - 165 * sc} d={d} scale={sc} shadow={0.45}
    draw={(g, t) => { g.translate(110, 335); voron(g, pose(t)); }} />
);
const Raptor: React.FC<{ x: number; y: number; sc?: number; d?: number; flip?: boolean; pose: (t: number) => any; blur?: number }> = ({ x, y, sc = 1, d = 1, flip = false, pose, blur = 0 }) => (
  <Layer dyn frame={false} w={Math.round(760 * sc)} h={Math.round(420 * sc)} x={x} y={y - 190 * sc} d={d} scale={sc} shadow={0.45} blur={blur}
    draw={(g, t) => { g.translate(380, 400); if (flip) g.scale(-1, 1); raptor(g, pose(t)); }} />
);
const NightBG: React.FC<{ gy?: number; moon?: [number, number, number] | null; dx?: number; rockAt?: [number, number, number] }> = ({ gy = 1300, moon = [760, 360, 95], dx = 0, rockAt }) => (<>
  <Layer d={0.2} dyn w={1600} h={2600} shadow={0} draw={(g, t) => { g.translate(-262, -340); nightSky(g, 1600, 2600, t, moon ? [moon[0] + 262, moon[1] + 340, moon[2]] : (null as any)); }} />
  {rockAt ? <Layer d={0.3} draw={(g) => { g.translate(rockAt[0], rockAt[1]); g.scale(rockAt[2], rockAt[2]); rock(g, 0); g.globalCompositeOperation = "source-atop"; g.fillStyle = "rgba(10,14,30,0.55)"; g.fillRect(-400, -700, 800, 800); g.globalCompositeOperation = "source-over"; strokeP(g, [[-20, -520], [-20, -640]], "#1A1A22", 4); strokeP(g, [[-20, -640], [-90, -520]], "#1A1A22", 1.2); strokeP(g, [[-20, -640], [50, -520]], "#1A1A22", 1.2); }} /> : null}
  <Layer d={0.45} w={2400} blur={1} dx={dx * 0.45} shadow={0.3} draw={(g) => { g.translate(-660, 0); nightTrees(g, 2400, gy - 40, 700, 1100, 4, 12); }} />
  <Layer d={0.7} w={2600} dx={dx * 0.7} shadow={0.3} draw={(g) => { g.translate(-760, 0); nightFerns(g, 2600, gy + 20, 260, 9, 9); }} />
  <Layer d={0.85} shadow={0.25} draw={(g) => ground(g, W, gy, H - gy + 300, "#2A2A22", 4)} />
  <Layer d={0.9} dyn shadow={0} draw={(g, t) => fog(g, W, gy - 60, t, 0.16)} />
</>);
// лагерь ночью: тёплый свет печки, всё вокруг синее
const CampBG: React.FC<{ gy?: number }> = ({ gy = 1360 }) => (<>
  <Layer d={0.2} dyn w={1600} h={2600} shadow={0} draw={(g, t) => { g.translate(-262, -340); nightSky(g, 1600, 2600, t, [1100, 600, 80]); }} />
  <Layer d={0.3} draw={(g) => { g.translate(300, gy - 120); g.scale(1.6, 1.6); rock(g, 0); g.globalCompositeOperation = "source-atop"; g.fillStyle = "rgba(10,14,30,0.6)"; g.fillRect(-400, -700, 800, 800); }} />
  <Layer d={0.5} w={2400} shadow={0.3} draw={(g) => { g.translate(-660, 0); palisade(g, 0, 2400, gy - 40, 420, 3, true); }} />
  <Layer d={0.85} shadow={0.25} draw={(g) => ground(g, W, gy, H - gy + 300, "#2E2A20", 6)} />
</>);
const kotovGlasses = (col: string, a: number) => (g: G) => { if (a <= 0) return; for (const s of [-1, 1]) { g.save(); g.globalAlpha = a; fillP(g, ellP(s * 10.3, -154, 8.4, 8.4, 20), col); g.restore(); } };

// ===================================================================== ШОТЫ
// 1 · 0–6.1 — ХУК: створки захлопываются перед камерой, в щели морда раптора, коготь бьёт по брёвнам; щепки
const S1: React.FC = () => {
  const sec = useSec();
  const shut = keys(sec, [[0, 0.55], [0.5, 0.15]], eo);
  return (<>
    <NightBG gy={1500} />
    <Raptor x={880} y={1380} sc={1.7} d={0.8} flip pose={(t) => ({ head: Math.sin(t * 3) * 0.1 - 0.1, jaw: t > 1.2 && t < 1.6 ? 0.3 : 0.08, claw: 1, arm: t > 2.2 && t < 2.6 ? 1 : 0.2, night: true, leader: true, seed: 1 })} />
    <Layer d={1.05} dyn draw={(g) => { gates(g, 540, 1920, 1100, 1700, shut, true); }} />
    <Layer d={1.08} dyn draw={(g, t) => { const hit = [0.5, 2.4, 4.3].reduce((a, h) => a + (t >= h && t < h + 0.5 ? Math.sin(((t - h) / 0.5) * Math.PI) : 0), 0); g.translate(540, 1000 - hit * 120); g.rotate(0.4 + hit * 0.5); g.scale(2.2, 2.2); cut(g, [[0, 0], [14, -48], [40, -76], [24, -38], [8, 6]], "#F3EDE0", { seed: 3, edge: 0.7 }); cut(g, rrectP(-14, 0, 30, 60, 10), "#4A3424", { seed: 4, edge: 0.6 }); }} />
    <Layer d={1.3} dyn shadow={0.3} draw={(g, t) => { for (const h of [0.5, 2.4, 4.3]) { const k = t - h; if (k < 0 || k > 1.2) continue; const r = rng(Math.floor(h * 10)); for (let i = 0; i < 14; i++) { const a = r() * Math.PI * 2, v = 300 + r() * 600; g.save(); g.translate(540 + Math.cos(a) * v * k, 900 + Math.sin(a) * v * k + 400 * k * k); g.rotate(r() * 6 + k * 5); cut(g, [[0, 0], [30, -5], [44, 2], [12, 8]], "#7A5A38", { seed: i, edge: 0.4 }); g.restore(); } } }} />
  </>);
};
// 2 · 6.1–13.2 — БТР несётся через папоротники, за кормой рапторы прыжками → ОТЪЕЗД: частокол у скалы, ворота закрыты
const S2: React.FC = () => {
  const sec = useSec();
  const dist = (sec - 6.1) * 520;
  return (<>
    <NightBG gy={1400} dx={-dist} rockAt={[760, 1260, 1.4]} />
    <Layer d={0.62} w={2400} dyn draw={(g) => { g.translate(-660, 0); palisade(g, 1100, 2100, 1380, 300, 5, true); gates(g, 1600, 1380, 300, 320, 0, true); }} dx={keys(sec, [[6.1, 900], [13.2, 0]], eo)} />
    {[0, 1, 2, 3].map((i) => <Raptor key={i} x={60 + i * 120 + Math.sin(sec * 3 + i) * 40} y={1500 - Math.abs(Math.sin(sec * 7 + i)) * 90} sc={0.55} d={0.95} pose={(t) => ({ run: t * 14 + i, jaw: 0.2, night: true, leader: i === 0, seed: i + 2 })} />)}
    <Layer d={1} dyn draw={(g, t) => { g.translate(640, 1560 - Math.abs(Math.sin(t * 9)) * 10); g.scale(1.2, 1.2); btrNight(g); const gl = g.createLinearGradient(360, -160, 900, -160); gl.addColorStop(0, "rgba(255,240,190,0.55)"); gl.addColorStop(1, "rgba(255,240,190,0)"); g.fillStyle = gl; g.beginPath(); g.moveTo(350, -170); g.lineTo(900, -300); g.lineTo(900, 40); g.closePath(); g.fill(); }} />
    <Layer d={1.6} blur={8} w={3200} dx={((-dist * 1.5) % 2400) + 1100} draw={(g) => { g.translate(-1060, 0); nightFerns(g, 3200, 2050, 520, 21, 6); }} />
  </>);
};
// 3 · 13.2–17.6 — Лисицын орёт «Открывай!» → ворота; на «тишина» всё замирает
const S3: React.FC = () => {
  const sec = useSec();
  if (sec < 16.3) return (<>
    <Layer d={0.6} blur={6} shadow={0} draw={(g) => { g.fillStyle = "#2E2C1C"; g.fillRect(-200, -200, W + 400, H + 400); const gl = g.createRadialGradient(800, 500, 10, 800, 500, 700); gl.addColorStop(0, "rgba(61,220,132,0.3)"); gl.addColorStop(1, "rgba(61,220,132,0)"); g.fillStyle = gl; g.fillRect(-200, -200, W + 400, H + 400); }} />
    <Pup who="lis" x={480} y={2150} sc={7.6} seed={4} pose={(t) => ({ expr: "shock", talk: talkAt(t, [[13.3, 16.0]]), aR: [0.9, 2.2], aL: [1.2, 1.4], legs: false, look: [0.4, 0], tilt: Math.sin(t * 20) * 0.02 })} />
  </>);
  return (<>
    <NightBG gy={1450} rockAt={[540, 1300, 1.7]} />
    <Layer d={0.8} draw={(g) => { palisade(g, -60, 1140, 1440, 520, 7, true); gates(g, 540, 1440, 420, 560, 0, true); }} />
  </>);
};
// 4 · 17.6–24.4 — СВЕРХУ: луч фонаря, створки разъезжаются, БТР влетает, створки закрываются, когти в щели
const S4: React.FC = () => {
  const sec = useSec();
  const open = keys(sec, [[18.8, 0], [20.0, 1], [22.0, 1], [22.6, 0.05]], eio);
  const car = keys(sec, [[20.3, 1700], [21.8, 900]], eo);
  return (<>
    <Layer d={0.6} shadow={0} draw={(g) => { g.fillStyle = "#1A2016"; g.fillRect(-300, -300, W + 600, H + 600); const r = rng(4); for (let i = 0; i < 30; i++) fernBush(g, r() * W, 1400 + r() * 800, 160, [NIGHT.sil, "#1E2618"], i + 3, 1.6); fillP(g, rectP(-300, -300, W + 600, 1250), "#2E2A20"); }} />
    <Layer d={0.95} dyn draw={(g, t) => { const ang = -0.6 + Math.sin(t * 1.2) * 0.5; g.save(); g.translate(540, 300); g.rotate(ang); const gl = g.createLinearGradient(0, 0, 0, 1400); gl.addColorStop(0, "rgba(255,230,170,0.45)"); gl.addColorStop(1, "rgba(255,230,170,0)"); g.fillStyle = gl; g.beginPath(); g.moveTo(-20, 0); g.lineTo(20, 0); g.lineTo(240, 1400); g.lineTo(-240, 1400); g.closePath(); g.fill(); g.restore(); }} />
    <Layer d={1} dyn draw={(g) => { for (let x = -60; x < W + 60; x += 50) if (Math.abs(x + 25 - 540) > 170) { fillP(g, ellP(x + 25, 1240, 24, 24, 14), "#3A3422"); strokeP(g, ellP(x + 25, 1240, 24, 24, 14), NIGHT.rim, 2, true); }
      for (const s of [-1, 1]) { const x0 = 540 + s * (90 + open * 170); for (let k = 0; k < 4; k++) { fillP(g, ellP(x0 + s * k * 44, 1240, 22, 22, 14), "#4A4230"); } } }} />
    <Layer d={1.02} dyn draw={(g, t) => { g.translate(540, car); g.rotate(-Math.PI / 2); g.scale(0.62, 0.62); /* БТР сверху */ for (const x of [-250, -95, 95, 250]) for (const s of [-1, 1]) cut(g, rrectP(x - 50, s * 150 - 22, 100, 44, 14), "#262420", { seed: x + s, edge: 0.8 }); cut(g, [[-370, -140], [230, -140], [370, -60], [370, 60], [230, 140], [-370, 140]], "#7E7852", { seed: 31, edge: 1.4 }); cut(g, ellP(-30, 0, 85, 85, 40), "#9A9468", { seed: 32 }); cut(g, rrectP(40, -10, 240, 20, 6), "#3A3B30", { seed: 33 }); fillP(g, rrectP(-280, -78, 60, 16, 4), "#FFB84D"); fillP(g, rrectP(120, -78, 60, 16, 4), "#FFB84D"); }} />
    {sec > 22.5 ? <Layer d={1.03} dyn draw={(g, t) => { for (const s of [-1, 1]) { g.save(); g.translate(540 + s * 8, 1200); g.rotate(s * 0.3 + Math.sin(t * 12) * 0.1); cut(g, [[0, 0], [12, -40], [30, -60], [18, -30], [6, 4]], "#F3EDE0", { seed: s + 5, edge: 0.6 }); g.restore(); } }} /> : null}
  </>);
};
// 5 · 24.4–34.2 — ПАНОРАМА ВВЕРХ по Ворону: сапоги → штормовка → борода → лицо; опускает фонарь
const S5: React.FC = () => (<>
  <CampBG gy={1700} />
  <Layer d={0.7} shadow={0} draw={(g) => { const gl = g.createLinearGradient(1080, 1300, 0, 900); gl.addColorStop(0, "rgba(255,240,190,0.35)"); gl.addColorStop(1, "rgba(255,240,190,0)"); g.fillStyle = gl; g.fillRect(-200, 300, W + 400, 1600); }} />
  <Voron x={540} y={1760} sc={6.2} d={1} pose={(t) => ({ lamp: keys(t, [[24.4, 0.9], [29.0, 0.9], [29.8, 0.1]], eo), talk: talkAt(t, [[30.2, 31.6], [31.8, 33.6]]), blink: blinkAt(t, 7), lampOn: 1, look: 0.2, tilt: 0.05 })} />
</>);
// 6 · 34.2–36.5 — все у печки, ПРОЕЗД по лицам, искры
const S6: React.FC = () => (<>
  <CampBG gy={1450} />
  <Layer d={0.95} dyn draw={(g, t) => { g.translate(540, 1620); g.scale(1.3, 1.3); stove(g, t); }} />
  {(["lis", "petrov", "kotov", "bugaev"] as Who[]).map((w, i) => <Pup key={w} who={w} x={140 + i * 270 + (i > 1 ? 120 : 0)} y={1700} sc={2.9} seed={i + 1} d={1} pose={(t) => ({ expr: "curious", look: [i < 2 ? 0.7 : -0.7, 0.2], legs: false, blink: blinkAt(t, i + 2), aR: w === "petrov" ? [0.9, 1.6] : [0.2, 0.3] })} />)}
  <AbsoluteFill style={{ background: "radial-gradient(ellipse 60% 40% at 50% 80%, rgba(242,166,90,0.25), rgba(0,0,0,0) 70%)" }} />
</>);
// 7 · 36.5–47.9 — флешбэк: фото 1986 (сепия) → зелёная вспышка → тот же ГАЗ-71 среди папоротников
const S7: React.FC = () => {
  const sec = useSec();
  const flash = clamp(1 - Math.abs(sec - 44.6) / 0.7);
  const after = sec > 44.6;
  return (<>
    <Layer d={0.5} shadow={0} draw={(g) => { g.fillStyle = "#2A2216"; g.fillRect(-300, -300, W + 600, H + 600); }} />
    <Layer d={1} dyn deps={[after]} draw={(g, t) => { g.translate(540, 900); g.rotate(-0.04); g.scale(1.45, 1.45);
      if (!after) photo1986(g, 0.3);
      else { cut(g, rectP(-330, -260, 660, 520), "#F1E9D6", { seed: 91, edge: 1 }); clipTo(g, rectP(-300, -230, 600, 400), () => { g.fillStyle = "#B39A72"; g.fillRect(-300, -230, 600, 400); fernBush(g, -220, 170, 260, ["#6E5A40", "#5E4C36"], 3, 1); fernBush(g, 230, 170, 280, ["#6E5A40", "#5E4C36"], 7, 1); g.save(); g.translate(20, 150); g.scale(0.55, 0.55); gaz71(g, t * 2, 0); g.restore(); g.globalCompositeOperation = "source-atop"; g.fillStyle = "rgba(200,150,60,0.35)"; g.fillRect(-300, -230, 600, 400); }); }
      text(g, after ? "ТОТ ЖЕ ГАЗ-71" : "ЭКСП. 1986", -200, 210, 26, "rgba(40,40,80,0.75)", "JetBrains Mono", 700); }} />
    {flash > 0 ? <AbsoluteFill style={{ background: `radial-gradient(ellipse 80% 60% at 50% 45%, rgba(220,255,220,${flash}) 0%, rgba(61,220,132,${flash * 0.9}) 60%, rgba(61,220,132,${flash * 0.6}) 100%)` }} /> : null}
  </>);
};
// 8 · 47.9–52.0 — Котов крупно, в очках зелёный блик; на «тот же» — кадр вспышки из Ч1
const S8: React.FC = () => {
  const sec = useSec();
  const glow = clamp(1 - Math.abs(sec - 50.9) / 1.2);
  return (<>
    <Layer d={0.6} blur={6} shadow={0} draw={(g) => { g.fillStyle = "#221E14"; g.fillRect(-200, -200, W + 400, H + 400); const gl = g.createRadialGradient(540, 1300, 10, 540, 1300, 900); gl.addColorStop(0, "rgba(242,166,90,0.45)"); gl.addColorStop(1, "rgba(242,166,90,0)"); g.fillStyle = gl; g.fillRect(-200, -200, W + 400, H + 400); }} />
    <Pup who="kotov" x={540} y={2150} sc={8.0} pose={(t) => ({ expr: t < 50.5 ? "curious" : "realize", legs: false, aR: [0.1, 0.2], aL: [0.1, 0.2], blink: blinkAt(t, 1) })} extra={(g) => kotovGlasses("rgba(61,220,132,0.8)", glow)(g)} />
    {sec > 49.0 && sec < 49.6 ? <AbsoluteFill style={{ left: 640, top: 260, width: 360, height: 640, border: "10px solid #F1E9D6", boxShadow: "8px 12px 16px rgba(0,0,0,0.5)", overflow: "hidden" }}>
      <OffthreadVideo src={staticFile("recap/flash.mp4")} muted startFrom={8} style={{ width: 360, height: 640 }} /></AbsoluteFill> : null}
  </>);
};
// 9 · 52.0–60.2 — обзор лагеря: вросший ГАЗ-71 с ветряком, огород, частокол → НАЕЗД на 6 крестов
const S9: React.FC = () => (<>
  <CampBG gy={1420} />
  <Layer d={0.75} w={2000} dyn draw={(g, t) => { g.translate(-460, 0); g.save(); g.translate(1400, 1420); g.scale(1.0, 1.0); crosses(g, 6); g.restore(); g.save(); g.translate(760, 1450); g.scale(1.4, 1.4); gaz71(g, t * 2.2, 0.8); g.restore(); g.save(); g.translate(1160, 1460); garden(g, 300); g.restore(); }} />
  <Layer d={0.9} dyn draw={(g, t) => { g.translate(140, 1560); g.scale(0.8, 0.8); stove(g, t); }} />
</>);
// 10 · 60.2–71.0 — СВЕРХУ на тетрадь: страницы листаются, кружки загораются, повторяющийся пульсирует
const S10: React.FC = () => (<>
  <Layer d={0.5} shadow={0} draw={(g) => { g.fillStyle = "#3A2C1E"; g.fillRect(-300, -300, W + 600, H + 600); const gl = g.createRadialGradient(300, 300, 10, 300, 300, 1300); gl.addColorStop(0, "rgba(242,166,90,0.4)"); gl.addColorStop(1, "rgba(242,166,90,0)"); g.fillStyle = gl; g.fillRect(-300, -300, W + 600, H + 600); }} />
  <Layer d={1} dyn rot={keys(0, [[0, 0.02]])} draw={(g, t) => journal(g, { page: 0, lit: Math.floor(clamp((t - 61.0) / 5) * 10), pulse: t > 68.8 ? 0.6 + 0.4 * Math.sin(t * 6) : 0, flip: clamp((t - 60.3) / 0.6), t })} />
</>);
// 11 · 71.0–85.6 — тетрадь на столе → разворот с Ан-2 и «2000», палец Ворона на кружке; бирка переворачивается
const S11: React.FC = () => {
  const sec = useSec();
  const fin = keys(sec, [[77.0, 700], [78.2, 0]], eo);
  return (<>
    <Layer d={0.5} shadow={0} draw={(g) => { g.fillStyle = "#3A2C1E"; g.fillRect(-300, -300, W + 600, H + 600); const gl = g.createRadialGradient(300, 300, 10, 300, 300, 1300); gl.addColorStop(0, "rgba(242,166,90,0.4)"); gl.addColorStop(1, "rgba(242,166,90,0)"); g.fillStyle = gl; g.fillRect(-300, -300, W + 600, H + 600); }} />
    <Layer d={1} dyn draw={(g, t) => journal(g, { page: t < 76.2 ? 0 : 1, lit: 10, pulse: t > 81.0 ? 0.6 + 0.4 * Math.sin(t * 6) : 0, flip: clamp((t - 75.8) / 0.6), t })} />
    {sec > 76.8 ? <Layer d={1.05} dyn draw={(g) => { g.translate(780 + fin * 0.3, 980 + fin); g.rotate(-0.25); g.scale(1.1, 1.1); fingerHand(g); }} /> : null}
  </>);
};
// 12 · 85.6–91.9 — POV: страницы мелькают, кругов всё больше → Котов поднимает глаза
const S12: React.FC = () => {
  const sec = useSec();
  if (sec < 89.2) return (<>
    <Layer d={0.5} shadow={0} draw={(g) => { g.fillStyle = "#3A2C1E"; g.fillRect(-300, -300, W + 600, H + 600); }} />
    <Layer d={1} dyn draw={(g, t) => journal(g, { page: 0, lit: 10, flip: (t * 2.6) % 1, t })} />
  </>);
  return (<>
    <Layer d={0.6} blur={6} shadow={0} draw={(g) => { g.fillStyle = "#221E14"; g.fillRect(-200, -200, W + 400, H + 400); const gl = g.createRadialGradient(540, 1300, 10, 540, 1300, 900); gl.addColorStop(0, "rgba(242,166,90,0.45)"); gl.addColorStop(1, "rgba(242,166,90,0)"); g.fillStyle = gl; g.fillRect(-200, -200, W + 400, H + 400); }} />
    <Pup who="kotov" x={540} y={2150} sc={8.0} pose={(t) => ({ expr: "curious", look: [0, keys(t, [[89.3, 0.8], [89.8, -0.6]], eo)], legs: false, aR: [0.1, 0.2], aL: [0.1, 0.2], blink: blinkAt(t, 1) })} />
  </>);
};
// 13 · 91.9–97.3 — Ворон закрывает тетрадь ладонью, лицо в полутени; фонарь гаснет на последнем слове
const S13: React.FC = () => {
  const sec = useSec();
  const lamp = sec < 95.4 ? 1 : clamp(1 - (sec - 95.4) / 0.25);
  return (<>
    <CampBG gy={1700} />
    <Voron x={560} y={2600} sc={9.0} pose={(t) => ({ lamp: 0.55, lampOn: lamp, talk: talkAt(t, [[94.1, 95.5]]), blink: blinkAt(t, 7), look: 0, tilt: 0.04 })} />
    <AbsoluteFill style={{ background: `linear-gradient(90deg, rgba(6,8,14,0) 40%, rgba(6,8,14,${0.55 + (1 - lamp) * 0.3}) 100%)` }} />
    {lamp < 1 ? <AbsoluteFill style={{ backgroundColor: `rgba(4,5,8,${(1 - lamp) * 0.75})` }} /> : null}
  </>);
};
const S14: React.FC = () => <AbsoluteFill style={{ backgroundColor: "#050506" }} />;

// ===================================================================== монтаж
type Tr = "cut" | "dark" | "white";
const Transition: React.FC<{ at: number; kind: Tr }> = ({ at, kind }) => {
  const t = useCurrentFrame() / FPS; const k0 = (t - at) / 0.35;
  if (kind === "cut" || k0 < -1 || k0 > 1) return null;
  return <AbsoluteFill style={{ backgroundColor: kind === "dark" ? "#06070A" : "#F6F2E7", opacity: 1 - Math.abs(eio((k0 + 1) / 2) * 2 - 1) }} />;
};
type ShotDef = { t0: number; t1: number; el: React.ReactNode; cam?: [number, number, number, number][]; shake?: (t: number) => number; dim?: (t: number) => number; tr?: Tr };
const hitShake = (hits: number[], amp: number) => (t: number) => hits.reduce((a, h) => a + (t >= h ? Math.exp(-(t - h) * 6) : 0), 0) * amp;
const SHOTS: ShotDef[] = [
  { t0: 0, t1: 6.1, el: <S1 />, shake: hitShake([0.5, 2.4, 4.3], 18), cam: [[0, 0, 0, 1.0], [0.45, 0, 0, 1.0], [0.75, 0, -40, 1.1], [6.1, 0, -40, 1.14]] },
  { t0: 6.1, t1: 13.2, el: <S2 />, cam: [[6.1, -120, 60, 1.25], [10.5, -60, 40, 1.15], [13.2, 60, -60, 0.95]] },
  { t0: 13.2, t1: 17.6, el: <S3 />, cam: [[13.2, 0, 0, 1.0], [15.2, 0, -30, 1.08], [16.25, 0, -30, 1.1], [16.3, -200, 0, 1.0], [16.6, 0, 0, 1.0], [17.1, 0, 0, 1.0], [17.6, 0, -20, 1.03]] },
  { t0: 17.6, t1: 24.4, el: <S4 />, tr: "dark", shake: hitShake([22.6], 14), cam: [[17.6, 0, 0, 1.0], [22.4, 0, 120, 1.05], [22.8, 0, 200, 1.25], [24.4, 0, 200, 1.27]] },
  { t0: 24.4, t1: 34.2, el: <S5 />, cam: [[24.4, 0, 700, 1.6], [28.8, 0, -300, 1.6], [30.0, 0, -320, 1.65], [34.2, 0, -330, 1.75]] },
  { t0: 34.2, t1: 36.5, el: <S6 />, cam: [[34.2, -200, 0, 1.15], [36.5, 200, 0, 1.15]] },
  { t0: 36.5, t1: 47.9, el: <S7 />, tr: "white", cam: [[36.5, 0, 0, 1.0], [44.5, 0, -40, 1.08], [45.0, 0, 0, 1.0], [47.9, 0, -30, 1.05]] },
  { t0: 47.9, t1: 52.0, el: <S8 />, cam: [[47.9, 0, 0, 1.0], [50.6, 0, -20, 1.03], [50.9, 0, -60, 1.12], [52.0, 0, -60, 1.13]] },
  { t0: 52.0, t1: 60.2, el: <S9 />, cam: [[52.0, -150, 0, 1.0], [56.0, 150, 0, 1.0], [58.2, 420, 160, 1.25], [60.2, 440, 170, 1.3]] },
  { t0: 60.2, t1: 71.0, el: <S10 />, cam: [[60.2, 0, 0, 1.0], [68.6, 0, 120, 1.08], [71.0, 0, 260, 1.25]] },
  { t0: 71.0, t1: 85.6, el: <S11 />, cam: [[71.0, 0, 0, 1.0], [76.0, 0, 0, 1.03], [77.2, -230, -120, 1.3], [79.6, -230, -120, 1.32], [81.0, 220, 0, 1.3], [84.4, 220, -40, 1.36], [85.6, 0, -200, 1.15]] },
  { t0: 85.6, t1: 91.9, el: <S12 />, cam: [[85.6, 0, 0, 1.1], [89.15, 0, 0, 1.0], [89.2, 0, 0, 1.0], [91.9, 0, -30, 1.06]] },
  { t0: 91.9, t1: 97.3, el: <S13 />, tr: "dark", cam: [[91.9, 0, 0, 1.0], [97.3, -40, -60, 1.1]] },
  { t0: 97.3, t1: 97.9, el: <S14 />, cam: [[97.3, 0, 0, 1.0]] },
];

// ===================================================================== субтитры (как в Ч1–Ч4)
type Grp = { s: number; e: number; words: { t: string; hl: boolean; s: number }[] };
const Captions: React.FC = () => {
  const f = useCurrentFrame(); const { fps } = useVideoConfig(); const t = f / fps;
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
    {CLEAN ? null : <TimeTag items={[[0, "НОЧЬ 2 — 21:40"]]} countdown={{ at: 85.0, days: 7 }} />}
    {CLEAN ? null : <Captions />}
    <Audio src={staticFile("voice.wav")} />
    <SFX />
  </AbsoluteFill>
);
