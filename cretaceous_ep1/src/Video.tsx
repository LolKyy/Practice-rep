// «Что, если…?» · Меловой период · Часть 1 «Провал». Шоты по таймингам голоса (script/voice.srt).
import React from "react";
import { AbsoluteFill, Audio, Sequence, interpolate, spring, staticFile, useCurrentFrame, useVideoConfig } from "remotion";
import "./fonts";
import subs from "./subs.json";
import { SFX } from "./sfx";
import { Layer, Shot, useSec, keys, step, clamp, eo, back, W, H, FPS } from "./stage2d";
import { PAL, G, cut, fillP, strokeP, clipTo, rrectP, ellP, rectP, rng, text, tear, rivet, pencil, tape, fernBush, fern } from "./cut";
import { puppet, Pose, Who, blinkAt, talkAt } from "./puppets";
import { btr, skyDay, trunks, zigRow, fernRow, ground, cabin, rexHead, ptero, jerrycan, rifle, crate } from "./props";

// ===================================================================== общие куски
const OL = [PAL.olive, PAL.oliveD], OL2 = [PAL.oliveD, "#56622E"];
const Pup: React.FC<{ who: Who; x: number; y: number; sc?: number; d?: number; pose: (t: number) => Pose; flip?: boolean; seed?: number; blur?: number }> =
  ({ who, x, y, sc = 4, d = 1, pose, flip = false, seed = 1, blur = 0 }) => (
    <Layer dyn frame={false} w={Math.round(200 * sc)} h={Math.round(250 * sc)} x={x} y={y - 120 * sc} d={d} scale={sc} shadow={0.4} blur={blur}
      draw={(g, t) => { g.translate(100, 245); if (flip) g.scale(-1, 1); puppet(g, who, pose(t), seed); }} />
  );
// лес: небо+солнце, стволы, ели-зигзаги, папоротники, земля
const Forest: React.FC<{ gy?: number; sun?: boolean; scroll?: (t: number) => number; dark?: boolean }> = ({ gy = 1300, sun = true, scroll = () => 0, dark = false }) => {
  const sec = useSec(); const sx = scroll(sec);
  return (<>
    <Layer d={0.25} dx={(sx * 0.25) % 400} w={2200} shadow={0} draw={(g) => { skyDay(g, 2200, H, sun ? [700, 380, 125] : null); g.translate(-560, 0); trunks(g, 2200, H, 3, "#6A6648", 9); }} />
    <Layer d={0.45} dx={(sx * 0.45) % 600} w={2400} blur={2} draw={(g) => { g.translate(-660, 0); zigRow(g, 2400, gy - 60, 600, 1000, [PAL.oliveD, "#4E5A2C"], 4, 12, 70); }} />
    <Layer d={0.7} dx={(sx * 0.7) % 700} w={2600} draw={(g) => { g.translate(-760, 0); fernRow(g, 2600, gy + 20, 260, OL2, 9, 9); }} />
    <Layer d={0.85} shadow={0.25} draw={(g) => ground(g, W, gy, H - gy + 300, dark ? "#6E5A3A" : "#9C7A4E", 4)} />
  </>);
};
const FrontFerns: React.FC<{ y?: number; blur?: number; d?: number; dx?: number; s?: number; seed?: number }> = ({ y = 1900, blur = 7, d = 1.5, dx = 0, s = 1, seed = 2 }) => (
  <Layer d={d} blur={blur} dx={dx} s={s} draw={(g) => { fernBush(g, 60, y, 420, OL, seed, 0.8); fernBush(g, 1040, y + 30, 460, OL2, seed + 5, 0.8); }} />
);

// ===================================================================== ШОТЫ
// 1 · 0.0–6.8 — салон БТР, спят; на «раньше» глаза распахиваются, в люк падает лист
const S1: React.FC = () => {
  const sec = useSec();
  const leaf = keys(sec, [[5.5, -200], [6.6, 520]], eo);
  return (<>
    <Layer d={0.6} shadow={0} draw={(g) => cabin(g, W, H, 1)} />
    <Layer d={0.62} shadow={0.3} draw={(g) => { cut(g, rrectP(380, -40, 320, 150, 20), sec > 5.4 ? "#BFE08A" : "#2A2416", { seed: 5 }); }} dyn deps={[sec > 5.4]} />
    {sec > 5.4 ? <Layer d={0.7} dyn draw={(g) => { g.translate(540, leaf); g.rotate(0.8 + Math.sin(sec * 5) * 0.3); fern(g, 0, 0, 180, Math.PI / 2, PAL.olive, 3); }} /> : null}
    <Pup who="kotov" x={360} y={1420} sc={4.3} pose={(t) => ({ expr: t < 5.45 ? "sleep" : t < 6.0 ? "shock" : "fear", tilt: t < 5.45 ? 0.12 + Math.sin(t * 1.4) * 0.02 : 0, aL: [0.15, 0.6], aR: t < 5.45 ? [0.2, 0.3] : [0.6, 1.2], bonk: t > 5.45 && t < 5.8 ? 1 : 0, legs: false })} />
    <Pup who="petrov" x={760} y={1450} sc={4.1} seed={2} pose={(t) => ({ expr: t > 2 && t < 3.4 ? "yawn" : "sleep", tilt: -0.2 + Math.sin(t * 1.1) * 0.03, aR: [0.3, 2.3], aL: [0.1, 0.2], legs: false })} />
    <Layer d={1.1} draw={(g) => { cut(g, rectP(-60, 1080, W + 120, 900), "#2E2A1A", { seed: 8 }); strokeP(g, [[-60, 1084], [W + 60, 1084]], PAL.edge, 4); for (let x = 30; x < W; x += 90) rivet(g, x, 1110, 5); }} />
  </>);
};
// 2 · 6.8–15.7 — а) ночь, зелёная вспышка рвёт небо; б) утро: БТР в папоротниках, пар
const S2: React.FC = () => {
  const sec = useSec();
  if (sec < 10.2) {
    const tearR = keys(sec, [[8.6, 0], [9.6, 1400]], eo);
    return (<>
      <Layer d={0.3} shadow={0} draw={(g) => { g.fillStyle = PAL.night; g.fillRect(-200, -200, W + 400, H + 400); const r = rng(3); for (let i = 0; i < 90; i++) fillP(g, ellP(r() * W, r() * 1100, 2 + r() * 3, 2 + r() * 3, 8), "#F3EDE0", 0.7); }} />
      {tearR > 0 ? <Layer d={0.32} dyn shadow={0} draw={(g) => {
        const pts = tear(ellP(540, 520, tearR * 0.7, tearR * 0.55, 40), 30, 25, 9);
        cut(g, pts, PAL.green, { tear: 0, edge: 6, seed: 9, grain: 0.1 });
        const gl = g.createRadialGradient(540, 520, 10, 540, 520, tearR); gl.addColorStop(0, "rgba(220,255,220,0.95)"); gl.addColorStop(1, "rgba(61,220,132,0)"); g.fillStyle = gl; g.fillRect(-200, -200, W + 400, H + 400);
      }} /> : null}
      <Layer d={0.6} draw={(g) => { cut(g, tear([[-100, 1250], [400, 1200], [800, 1240], [1200, 1210], [1200, 2200], [-100, 2200]], 3, 10, 2), "#1C2433", { seed: 3, tear: 0 }); }} />
      <Layer d={1} draw={(g) => { g.translate(540, 1330); g.scale(1.2, 1.2); btr(g, {}); g.globalCompositeOperation = "source-atop"; g.fillStyle = "rgba(12,16,30,0.82)"; g.fillRect(-500, -500, 1000, 600); }} />
      <Layer d={1.3} blur={6} draw={(g) => { cut(g, rectP(-60, 1500, W + 120, 600), "#121820", { seed: 11 }); }} />
    </>);
  }
  const fly = keys(sec, [[10.2, 2.6], [11.2, 1]], eo);
  return (<>
    <Forest />
    <Layer d={0.9} dyn draw={(g, t) => { for (let i = 0; i < 6; i++) { const k = ((t * 0.18 + i / 6) % 1); g.save(); g.globalAlpha = (1 - k) * (0.35 + (t > 14 ? 0.25 : 0)); cut(g, rrectP(300 + i * 90 + Math.sin(t + i) * 20, 1080 - k * 500, 30, 180, 15), "#F6F2E7", { seed: i, edge: 0.4, thick: false }); g.restore(); } }} />
    <Layer d={1} draw={(g) => { g.translate(540, 1420); g.scale(1.25, 1.25); btr(g, {}); }} />
    <Layer d={1.15} draw={(g) => { fernBush(g, 120, 1460, 330, OL, 21, 1); fernBush(g, 980, 1480, 360, OL2, 23, 1); }} />
    <FrontFerns s={fly} />
  </>);
};
// 3 · 15.7–25.6 — БТР ломится через лес; Бугаев машет вперёд; стрелка топлива ползёт вниз
const S3: React.FC = () => {
  const sec = useSec();
  const go = clamp((sec - 19.4) / 1.5);
  const dist = sec < 19.4 ? 0 : (sec - 19.4 - 0.75 * (1 - go)) * 260;
  const bump = go * (Math.abs(Math.sin(sec * 9)) * 10 + Math.abs(Math.sin(sec * 3.7)) * 8);
  const fuel = keys(sec, [[19.4, 0.97], [25.6, 0.83]]);
  return (<>
    <Forest scroll={() => -dist} />
    <Layer d={0.95} dyn draw={(g, t) => { if (t < 19.4) return; for (let i = 0; i < 7; i++) { const k = (t * 0.6 + i / 7) % 1; g.save(); g.globalAlpha = (1 - k) * 0.5; cut(g, ellP(80 - k * 260, 1150 - k * 180, 30 + k * 80, 24 + k * 50, 18), "#3B3A33", { seed: i, edge: 0.5, thick: false }); g.restore(); } }} />
    <Pup who="bugaev" x={470} y={1330 - bump} sc={3.0} pose={(t) => ({ expr: t < 18.8 ? "resolve" : t < 21.3 ? "stern" : "calm", talk: talkAt(t, [[15.9, 18.7], [19.0, 21.3]]),
      aR: t > 19.0 && t < 21.5 ? [2.1 + Math.sin(t * 8) * 0.25, 0.4] : [0.2, 0.2], aL: [0.15, 0.3], legs: false })} />
    <Pup who="petrov" x={760} y={1300 - bump} sc={2.4} seed={2} pose={(t) => ({ expr: t > 19.2 && t < 20.4 ? "smirk" : "calm", aR: [0.3, 1.0], legs: false, tilt: 0.05 })} />
    <Layer d={1} dyn draw={(g, t) => { g.translate(540, 1450 - bump); g.scale(1.3, 1.3); btr(g, { wheel: dist / 60 }); }} />
    <Layer d={1.6} blur={7} dx={((-dist * 1.6) % 2400) + 1200} w={2800} draw={(g) => { g.translate(-860, 0); for (let i = 0; i < 3; i++) fernBush(g, 300 + i * 900, 1950, 520, OL, 40 + i, 0.8); }} />
    {/* HUD топлива */}
    <AbsoluteFill>
      <div style={{ position: "absolute", left: 640, top: 330, background: PAL.edge, padding: "12px 22px", transform: "rotate(-1.5deg)", boxShadow: "6px 9px 14px rgba(20,12,4,0.45)",
        fontFamily: "JetBrains Mono", fontWeight: 700, fontSize: 30, color: PAL.ink, width: 320 }}>
        <div style={{ display: "flex", justifyContent: "space-between" }}><span>СОЛЯРКА</span><span style={{ color: fuel < 0.9 ? PAL.scarf : PAL.ink }}>{Math.round(fuel * 100)}%</span></div>
        <div style={{ height: 14, background: "#D9D2BF", marginTop: 8 }}><div style={{ height: 14, width: `${fuel * 100}%`, background: PAL.mustard }} /></div>
      </div>
    </AbsoluteFill>
  </>);
};
// 4 · 25.6–33.4 — Лисицын с рацией → экран навигатора «ПОИСК СПУТНИКОВ…»
const S4: React.FC = () => {
  const sec = useSec();
  if (sec >= 30.45) {
    const n = 9;
    return (<AbsoluteFill style={{ backgroundColor: "#1E2220" }}>
      <Layer d={1} dyn shadow={0} draw={(g, t) => {
        cut(g, rrectP(70, 160, 940, 1100, 30), "#14181A", { seed: 2, edge: 2 });
        for (let i = 0; i < n; i++) { const a = (i / n) * Math.PI * 2 + t * 2.4; const k = ((i + Math.floor(t * 9)) % n) / n; fillP(g, ellP(540 + Math.cos(a) * 120, 560 + Math.sin(a) * 120, 13 + 9 * k, 13 + 9 * k, 16), PAL.green, 0.35 + 0.65 * k); }
        text(g, "ПОИСК СПУТНИКОВ" + ".".repeat(1 + (Math.floor(t * 3) % 3)), 540, 820, 54, PAL.green, "JetBrains Mono", 700);
        text(g, "0 / 24", 540, 900, 58, PAL.red, "JetBrains Mono", 700);
      }} />
    </AbsoluteFill>);
  }
  const dial = keys(sec, [[25.7, 0], [27.3, 4], [29.0, 7]]);
  return (<>
    <Layer d={0.5} blur={6} shadow={0} draw={(g) => cabin(g, W, H, 0.8)} />
    <Pup who="lis" x={430} y={1780} sc={6.2} pose={(t) => ({ expr: t < 27.5 ? "curious" : t < 29.8 ? "fear" : "realize", look: [t < 28 ? 0.7 : 0, 0], aR: [0.9, 1.6], aL: [0.1, 0.3], legs: false, blink: blinkAt(t, 3) })} />
    <Layer d={1.05} dyn draw={(g, t) => {
      g.translate(830, 820); g.rotate(-0.05);
      cut(g, rrectP(-150, -230, 300, 460, 22), "#4C5530", { seed: 31 });
      cut(g, rrectP(-60, 20, 120, 160, 10), t < 29 ? "#2DA36A" : "#1E5A3A", { seed: 32 });
      g.save(); g.translate(30, -110); g.rotate(dial + Math.sin(t * 30) * (t < 29 ? 0.03 : 0)); cut(g, ellP(0, 0, 70, 70, 40), "#2E2F26", { seed: 33 }); fillP(g, rectP(-6, -62, 12, 40), PAL.edge); g.restore();
      rivet(g, 30, -110, 7); for (const [x, y] of [[-130, -210], [130, -210], [-130, 210], [130, 210]]) rivet(g, x, y, 6);
      strokeP(g, [[-110, -230], [-140 + Math.sin(t * 40) * 3, -560]], "#2a2a2a", 6);
    }} />
  </>);
};
// 5 · 33.4–38.3 — Котов на броне достаёт блокнот
const S5: React.FC = () => (<>
  <Forest gy={1150} />
  <Pup who="kotov" x={430} y={1420} sc={3.6} pose={(t) => ({ expr: t < 35.0 ? "realize" : t < 36.8 ? "resolve" : "calm", aR: t > 34.0 ? [keys(t, [[34.0, 0.2], [34.6, 1.7]]), keys(t, [[34.0, 0.2], [34.6, 0.9]])] : [0.2, 0.2],
    holdR: t > 34.0 ? (g) => { g.rotate(-0.6); cut(g, rrectP(-6, -50, 52, 66, 3), PAL.paper, { seed: 5 }); for (let y = -40; y < 10; y += 9) strokeP(g, [[0, y], [40, y]], "rgba(60,80,140,0.5)", 1); } : undefined,
    legs: false, blink: blinkAt(t, 1) })} />
  <Layer d={1} draw={(g) => { g.translate(560, 1530); g.scale(1.65, 1.65); btr(g, {}); }} />
  <FrontFerns y={1950} blur={6} />
</>);
// 6 · 38.3–42.34 — блокнот: 40 ИРП каскадом, шкала «ЕДА — 10 ДНЕЙ»
const Notebook: React.FC<{ title: string }> = ({ title }) => (
  <Layer d={1} draw={(g) => {
    cut(g, rectP(150, 260, 780, 1180), PAL.paper, { seed: 12, edge: 2 });
    clipTo(g, rectP(150, 260, 780, 1180), () => { for (let y = 380; y < 1440; y += 44) strokeP(g, [[150, y], [930, y]], "rgba(70,110,170,0.35)", 2); strokeP(g, [[230, 260], [230, 1440]], "rgba(200,60,50,0.6)", 2.5); });
    for (let x = 190; x < 920; x += 46) { fillP(g, ellP(x, 290, 11, 11, 12), "#3B3428"); strokeP(g, ellP(x, 278, 12, 18, 14, Math.PI, Math.PI * 2), "#8A8478", 3); }
    text(g, title, 540, 370, 64, PAL.ink, "Montserrat", 900); tape(g, 900, 1420, 120, -0.5); tape(g, 170, 280, 100, -0.6);
    pencil(g, [[260, 1300], [880, 1300]]);
  }} />
);
const S6: React.FC = () => {
  const sec = useSec();
  const bar = keys(sec, [[40.5, 0], [41.2, 1]], eo);
  return (<>
    <Layer d={0.5} shadow={0} draw={(g) => { g.fillStyle = "#7A5C3C"; g.fillRect(-300, -300, W + 600, H + 600); }} />
    <Notebook title="СУХПАИКИ" />
    <Layer d={1.02} dyn draw={(g, t) => {
      cut(g, rrectP(250, 430, 580, 110, 6), PAL.edge, { seed: 4 }); text(g, "ЕДА", 300, 465, 30, PAL.ink, "JetBrains Mono", 700, "left"); text(g, bar > 0 ? "10 ДНЕЙ" : "? ДНЕЙ", 790, 465, 30, PAL.ink, "Montserrat", 900, "right");
      fillP(g, rectP(280, 500, 520, 18), "#D9D2BF"); fillP(g, rectP(280, 500, 520 * bar, 18), PAL.mustard);
      for (let i = 0; i < 40; i++) {
        const t0 = 38.45 + i * 0.06; const k = clamp((t - t0) / 0.18); if (k <= 0) continue;
        const cx = 268 + (i % 10) * 56, cy = 600 + Math.floor(i / 10) * 52 - (1 - back(k)) * 60;
        cut(g, rrectP(cx, cy, 48, 32, 3), PAL.khaki, { seed: i, edge: 0.5 }); fillP(g, rectP(cx, cy + 12, 48, 7), PAL.oliveD);
      }
      if (t > 40.3) text(g, "40 ÷ 4 = 10", 540, 900, 50, PAL.scarf, "JetBrains Mono", 700);
    }} />
  </>);
};
// 7 · 42.34–52.0 — 4 канистры, «ВОДА — 5 ДНЕЙ» краснеет
const S7: React.FC = () => {
  const sec = useSec();
  const lvl = keys(sec, [[49.0, 0.92], [51.6, 0.25]]);
  const red = sec > 51.0;
  return (<>
    <Forest gy={1220} />
    <Layer d={1} dyn draw={(g, t) => { for (let i = 0; i < 4; i++) { const k = clamp((t - 42.5 - i * 0.35) / 0.3); if (k <= 0) continue; g.save(); g.translate(180 + i * 240, 1240 + (1 - back(k)) * 80); g.scale(1.05, 1.05); jerrycan(g, lvl, t, i + 1); g.restore(); } }} />
    <FrontFerns y={1960} />
    <AbsoluteFill>
      <div style={{ position: "absolute", left: 110, top: 300, width: 860, background: PAL.edge, padding: "16px 26px", boxShadow: "8px 12px 16px rgba(20,12,4,0.45)", transform: "rotate(-0.8deg)" }}>
        <div style={{ display: "flex", justifyContent: "space-between", fontFamily: "JetBrains Mono", fontWeight: 700, fontSize: 34, color: PAL.ink }}>
          <span>ВОДА</span><span style={{ fontFamily: "Montserrat", fontWeight: 900, color: red ? PAL.scarf : PAL.ink }}>{sec > 50.8 ? "5 ДНЕЙ" : "? ДНЕЙ"}</span></div>
        <div style={{ height: 18, background: "#D9D2BF", marginTop: 10 }}><div style={{ height: 18, width: `${(red ? 0.35 : lvl) * 100}%`, background: red ? PAL.red : PAL.blue }} /></div>
      </div>
      {sec > 45.2 ? <div style={{ position: "absolute", left: 200, top: 470, fontFamily: "JetBrains Mono", fontWeight: 700, fontSize: 28, color: "#5A5040", background: "rgba(243,237,224,0.85)", padding: "6px 16px" }}>3–4 Л НА ЧЕЛОВЕКА В ДЕНЬ</div> : null}
      <div style={{ position: "absolute", left: 360, top: 560, fontFamily: "Montserrat", fontWeight: 900, fontSize: 64, color: PAL.ink, background: PAL.edge, padding: "4px 22px", transform: `rotate(1.2deg) scale(${clamp((sec - 42.5) * 4)})`, boxShadow: "6px 9px 12px rgba(20,12,4,0.4)" }}>4 × 20 Л</div>
    </AbsoluteFill>
  </>);
};
// 8 · 52.0–58.3 — карта: круг «600 КМ», дорог нет
const S8: React.FC = () => {
  const sec = useSec();
  const R = keys(sec, [[53.6, 0], [55.0, 330]], back);
  return (<>
    <Layer d={0.5} shadow={0} draw={(g) => { g.fillStyle = "#5E4A34"; g.fillRect(-300, -300, W + 600, H + 600); }} />
    <Layer d={1} draw={(g) => {
      cut(g, rectP(60, 220, 960, 1380), "#D8B47E", { seed: 7, edge: 2 });
      const r = rng(5); for (let i = 0; i < 26; i++) { const x = 100 + r() * 880, y = 260 + r() * 1300; for (let k = 0; k < 5; k++) cut(g, ellP(x + (r() - 0.5) * 80, y + (r() - 0.5) * 60, 45 + r() * 30, 40 + r() * 25, 20), k % 2 ? PAL.olive : "#7C8A44", { seed: i * 9 + k, edge: 0.5, thick: false }); }
      strokeP(g, [[60, 640], [260, 700], [420, 640], [560, 720], [760, 690], [1020, 800]], "#4B86C8", 16); tape(g, 980, 240, 140, 0.4); tape(g, 100, 1580, 140, 0.5);
    }} />
    <Layer d={1.02} dyn draw={(g, t) => {
      fillP(g, ellP(540, 900, 16, 16, 16), PAL.ink); text(g, "БТР", 590, 900, 24, PAL.ink, "Montserrat", 900, "left");
      if (R > 0) { strokeP(g, ellP(540, 900, R, R, 80), PAL.red, 7, true); if (t > 54.6) { cut(g, rectP(700, 600, 180, 56), PAL.scarf, { seed: 3 }); text(g, "600 КМ", 790, 629, 34, "#fff"); } }
      if (t > 56.7) { const k = clamp((t - 56.8) / 0.4); g.save(); g.translate(560, 1340); g.rotate(-0.08); cut(g, rectP(-160, -36, 320, 72, ), PAL.edge, { seed: 4 }); text(g, "ДОРОГ: 0", 0, 2, 42, PAL.scarf); g.restore();
        strokeP(g, [[120, 1180], [300, 1120 + k * 40]], PAL.ink, 4); strokeP(g, [[330, 1110 - k * 30], [520, 1060]], PAL.ink, 4); }
    }} />
  </>);
};
// 9 · 58.3–65.0 — пулемёт и 4 автомата → Петров открывает ящик тушёнки
const S9: React.FC = () => {
  const sec = useSec();
  if (sec < 60.5) return (<>
    <Layer d={0.5} blur={5} shadow={0} draw={(g) => { skyDay(g, W + 300, H + 300, [300, 300, 120]); }} />
    <Layer d={1} draw={(g) => { cut(g, rectP(-60, 760, W + 120, 1300), PAL.khaki, { seed: 3 }); for (let x = 20; x < W; x += 70) rivet(g, x, 790, 5); }} />
    <Layer d={1.03} dyn draw={(g, t) => {
      g.save(); g.translate(560, 700 + (1 - back(clamp((t - 58.4) * 3))) * 400); g.rotate(-0.08);
      cut(g, [[-260, 40], [-240, -70], [120, -80], [200, -20], [200, 40]], PAL.khakiL, { seed: 9 });
      cut(g, rrectP(160, -40, 380, 28, 6), "#3A3B30", { seed: 11 }); rivet(g, 160, -26, 8); g.restore();
      for (let i = 0; i < 4; i++) { const k = clamp((t - 59.25 - i * 0.18) * 4); if (k <= 0) continue; g.save(); g.translate(540, 1000 + i * 150 - (1 - back(k)) * 100); g.scale(2.6, 2.6); rifle(g, i + 1); g.restore(); }
    }} />
  </>);
  const open = keys(sec, [[61.3, 0], [61.9, 1]], back);
  return (<>
    <Layer d={0.6} shadow={0} draw={(g) => cabin(g, W, H, 1)} />
    <Pup who="petrov" x={560} y={1450} sc={4.4} seed={2} pose={(t) => ({ expr: t < 61.4 ? "whisper" : t < 63.5 ? "smirk" : "relief", look: [t < 61.4 ? -0.6 : 0.4, 0.4], aR: [keys(t, [[60.9, 0.2], [61.4, 0.9]]), 0.9], aL: [0.3, 0.6], legs: false, blink: blinkAt(t, 2), tilt: 0.12 })} />
    <Layer d={1.1} draw={(g) => { cut(g, rectP(-60, 1260, W + 120, 900), "#2E2A1A", { seed: 8 }); strokeP(g, [[-60, 1264], [W + 60, 1264]], PAL.edge, 4); }} />
    <Layer d={1.15} dyn draw={(g) => { g.translate(560, 1680); g.scale(2, 2); crate(g, open); }} />
  </>);
};
// 10 · 65.0–70.6 — отряд на броне, над лесом проходит тень птерозавра
const S10: React.FC = () => {
  const sec = useSec();
  const px = keys(sec, [[65.1, 1500], [67.6, -500]], (x) => x);
  const look = clamp((1500 - px) / 2000) * 2 - 1;
  return (<>
    <Layer d={0.25} shadow={0} draw={(g) => { skyDay(g, W + 400, H + 400, [380, 640, 150]); }} />
    <Layer d={0.4} dyn shadow={0.2} draw={(g, t) => { g.translate(px, 420); g.scale(1.1, 1.1); ptero(g, Math.sin(t * 5)); }} />
    <Layer d={0.55} blur={2} draw={(g) => { g.translate(-100, 0); zigRow(g, 1300, 1350, 400, 700, [PAL.oliveD, "#4E5A2C"], 6, 8, 60); }} />
    {(["lis", "kotov", "bugaev"] as Who[]).map((w, i) => (
      <Pup key={w} who={w} x={260 + i * 280} y={1560} sc={2.6} seed={i + 1} pose={(t) => ({ expr: t < 66.6 ? "curious" : t < 69.2 ? "fear" : "shock", look: [-look, -0.8], tilt: -look * 0.15, legs: false, blink: blinkAt(t, i) })} />
    ))}
    <Layer d={1} draw={(g) => { g.translate(540, 1950); g.scale(1.45, 1.45); btr(g, { noTurret: true }); }} />
    <Layer d={1.5} blur={6} draw={(g) => { for (let i = 0; i < 4; i++) fern(g, -60 + i * 380, -60, 520, Math.PI / 2 + (i - 1.5) * 0.25, i % 2 ? PAL.oliveD : PAL.olive, 50 + i, { droop: 0.3 }); }} />
  </>);
};
// 11 · 70.6–77.7 — Котов понимает → нитка времени «66 000 000 ЛЕТ»
const S11: React.FC = () => {
  const sec = useSec();
  if (sec < 74.05) return (<>
    <Forest gy={1250} />
    <Pup who="kotov" x={540} y={1950} sc={6.0} pose={(t) => ({ expr: t < 72.0 ? "curious" : t < 73.3 ? "realize" : "shock", look: [0, t < 72 ? -0.5 : 0], aL: [0.1, 0.3], aR: [0.1, 0.3], legs: false, blink: blinkAt(t, 4), bonk: t > 72 && t < 72.3 ? 1 : 0 })} />
  </>);
  const yrs = Math.round(keys(sec, [[74.6, 0], [76.8, 66000000]], (x) => x * x));
  return (<>
    <Layer d={0.5} shadow={0} draw={(g) => { g.fillStyle = "#8C6E48"; g.fillRect(-300, -300, W + 600, H + 600); const r = rng(2); for (let i = 0; i < 40; i++) pencil(g, [[r() * W, r() * H], [r() * W, r() * H]], 0.08); }} />
    <Layer d={0.9} dyn draw={(g, t) => {
      strokeP(g, [[-200, 760], [1280, 760]], PAL.edge, 3);
      const tags: [number, string][] = [[160, "БТР"], [920, "ДОРОГА"]];
      for (let i = 0; i < 9; i++) { const x = ((i * 150 + t * 260) % 1400) - 160; if (x > 250 && x < 820) { strokeP(g, [[x, 760], [x, 800]], PAL.edge, 2); cut(g, rectP(x - 20, 800, 40, 26), "#E8DFC8", { seed: i, edge: 0.4 }); } }
      tags.forEach(([x, s], i) => { strokeP(g, [[x, 760], [x, 840]], PAL.edge, 2); g.save(); g.translate(x, 840); g.rotate(Math.sin(t * 2 + i) * 0.06); cut(g, rectP(-110, 0, 220, 90), PAL.edge, { seed: 20 + i }); text(g, s, 0, 45, 36, PAL.ink, "JetBrains Mono", 700); g.restore(); });
      g.save(); g.translate(160, 1000); g.scale(0.45, 0.45); btr(g, {}); g.restore();
      g.save(); g.translate(920, 1020); strokeP(g, [[-120, 0], [120, 0]], "#4A4B4E", 30); for (let x = -100; x < 120; x += 50) strokeP(g, [[x, 0], [x + 25, 0]], PAL.edge, 4); g.restore();
    }} />
    <AbsoluteFill><div style={{ position: "absolute", top: 560, width: "100%", textAlign: "center" }}>
      <span style={{ fontFamily: "Montserrat", fontWeight: 900, fontSize: 72, color: "#fff", background: PAL.scarf, padding: "6px 24px", boxShadow: "8px 12px 14px rgba(20,12,4,0.45)", display: "inline-block", transform: "rotate(-1deg)" }}>
        {yrs.toLocaleString("ru-RU")} ЛЕТ</span></div></AbsoluteFill>
  </>);
};
// 12 · 77.7–84.8 — ключ, двигатель глохнет; «НЕ ШУМЕТЬ»
const S12: React.FC = () => {
  const sec = useSec();
  if (sec < 79.8) {
    const k = keys(sec, [[78.2, 0], [78.6, -1.4]], back);
    return (<>
      <Layer d={0.6} blur={4} shadow={0} draw={(g) => cabin(g, W, H, 0.7)} />
      <Layer d={1} draw={(g) => { cut(g, rectP(80, 500, 920, 900), "#5A5634", { seed: 3 }); for (let x = 120; x < 1000; x += 120) rivet(g, x, 530, 6); cut(g, ellP(540, 940, 150, 150, 50), "#2E2F26", { seed: 4 }); text(g, "СТАРТ", 540, 720, 36, PAL.edge, "JetBrains Mono", 700); }} />
      <Layer d={1.05} dyn draw={(g) => { g.translate(540, 940); g.rotate(k); cut(g, rrectP(-22, -110, 44, 220, 10), "#C7CCD6", { seed: 5 }); cut(g, rrectP(-60, -170, 120, 80, 20), "#8E949E", { seed: 6 }); }} />
      <Layer d={1.15} dyn draw={(g) => { g.translate(540, 940); g.rotate(k); g.translate(70, 20); g.scale(5, 5); cut(g, ellP(0, 0, 14, 18, 20), "#D8AE88", { seed: 7 }); cut(g, rrectP(4, -6, 60, 22, 6), PAL.olive, { seed: 8 }); }} />
    </>);
  }
  return (<>
    <Forest gy={1300} />
    <Pup who="bugaev" x={470} y={1320} sc={3.0} pose={(t) => ({ expr: t < 82.2 ? "stern" : "whisper", talk: 0, aR: t > 82.3 ? [2.4, 2.2] : [0.2, 0.2], legs: false, blink: blinkAt(t, 3) })} />
    <Layer d={1} draw={(g) => { g.translate(540, 1450); g.scale(1.3, 1.3); btr(g, {}); }} />
    <FrontFerns />
    <AbsoluteFill>
      {sec > 80.2 ? <div style={{ position: "absolute", left: 120, top: 330, fontFamily: "JetBrains Mono", fontWeight: 700, fontSize: 34, color: PAL.ink, background: PAL.edge, padding: "8px 18px", boxShadow: "6px 9px 12px rgba(20,12,4,0.4)", transform: "rotate(-1deg)" }}>1. БЕРЕЧЬ СОЛЯРКУ</div> : null}
      {sec > 83.3 ? <div style={{ position: "absolute", left: -100, top: 760, width: 1300, textAlign: "center", fontFamily: "Montserrat", fontWeight: 900, fontSize: 92, color: "#fff", background: PAL.scarf,
        transform: `rotate(-12deg) scale(${interpolate(sec, [83.3, 83.5], [1.4, 1], { extrapolateRight: "clamp" })})`, boxShadow: "10px 16px 20px rgba(20,12,4,0.5)", padding: "8px 0" }}>НЕ ШУМЕТЬ · НЕ ШУМЕТЬ</div> : null}
    </AbsoluteFill>
  </>);
};
// 13 · 84.8–89.5 — канистра крупно: круги на воде, театр вздрагивает
const HITS = [85.0, 87.25, 88.5];
const hitAmp = (t: number) => HITS.reduce((a, h) => a + (t >= h ? Math.exp(-(t - h) * 6) : 0), 0);
const S13: React.FC = () => (<>
  <Forest gy={1150} dark />
  <Layer d={1} dyn draw={(g, t) => {
    g.translate(540, 1640); g.scale(2.6, 2.6); jerrycan(g, 0.85, t, 2);
  }} />
  <Layer d={1.05} dyn draw={(g, t) => {
    cut(g, ellP(540, 940, 190, 80, 50), "#232A18", { seed: 4 }); cut(g, ellP(540, 940, 150, 60, 50), PAL.blue, { seed: 5, edge: 0.8 });
    clipTo(g, ellP(540, 940, 150, 60, 50), () => { for (const h of HITS) { const k = t - h; if (k < 0 || k > 1.6) continue; for (let r = 0; r < 3; r++) { const rr = (k * 120 + r * 30) % 170; strokeP(g, ellP(540, 940, rr, rr * 0.4, 40), `rgba(240,248,255,${0.8 * (1 - rr / 170)})`, 3, true); } } });
  }} />
  <FrontFerns blur={8} />
</>);
// 14 · 89.5–97.3 — голова рекса из папоротников; Котов за пулемётом; «Не стреляй»
const S14: React.FC = () => {
  const sec = useSec();
  const rise = keys(sec, [[89.7, 0], [91.6, 1]], (x) => (x < 0.7 ? x / 0.7 * 0.6 : 0.6 + back((x - 0.7) / 0.3) * 0.4));
  const jaw = step(sec, [[89.5, 0], [91.5, 0.22], [92.4, 0.05], [95.6, 0.12]]);
  return (<>
    <Forest gy={1280} dark sun={false} />
    <Layer d={0.8} dyn draw={(g, t) => { g.translate(880, 1300 - rise * 520); g.scale(1.3, 1.3); g.rotate(-0.05 + Math.sin(t * 0.8) * 0.02); rexHead(g, jaw, 1); }} />
    <Layer d={0.85} draw={(g) => { fernRow(g, W, 1340, 330, OL, 77, 4); }} />
    <Pup who="kotov" x={380} y={1320} sc={2.9} pose={(t) => ({ expr: t < 92.0 ? "fear" : t < 95.0 ? "resolve" : "fear", aR: [0.35, 0.9], aL: [0.35, 0.9], legs: false, blink: blinkAt(t, 5), look: [0.6, -0.2] })} />
    <Pup who="bugaev" x={170} y={1330} sc={3.0} seed={3} pose={(t) => ({ expr: t < 94.5 ? "stern" : "whisper", aR: t > 94.4 ? [1.55, 0.2] : [0.2, 0.2], talk: talkAt(t, [[95.3, 96.8]]), legs: false, blink: blinkAt(t, 6), look: [0.5, 0] })} />
    <Layer d={1} dyn draw={(g, t) => { g.translate(500, 1460); g.scale(1.3, 1.3); btr(g, { gun: keys(t, [[93.0, 0], [93.6, -0.18]], back) }); }} />
    <FrontFerns />
  </>);
};
// 15 · 97.3–101.0 — стоп-кадр: «А ты бы выстрелил?», бирка «ЧАСТЬ 2 →»
const S15: React.FC = () => (<>
  <Forest gy={1200} dark sun={false} />
  <Pup who="kotov" x={470} y={1800} sc={5.2} pose={(t) => ({ expr: t < 98.2 ? "resolve" : "stern", aR: [0.35, 0.9], aL: [0.35, 0.9], legs: false, look: [0, 0], blink: blinkAt(t, 1) })} />
  <Layer d={1} draw={(g) => { g.translate(600, 1850); g.scale(1.9, 1.9); btr(g, { gun: -0.18 }); }} />
</>);

// ===================================================================== монтаж
// Сцены написаны во «внутреннем» времени; склейка голоса сдвинула части: хук +1.23, GPS-абзац +1.13, остальное +1.32.
export const shiftOf = (t: number) => (t < 25.55 ? 1.23 : t < 33.4 ? 1.13 : 1.32);
type ShotDef = { t0: number; t1: number; el: React.ReactNode; cam?: [number, number, number, number][]; shake?: (t: number) => number; dim?: (t: number) => number; bg?: string };
const SHOTS: ShotDef[] = [
  { t0: -1.23, t1: 6.8, el: <S1 />, cam: [[-1.23, 0, -40, 1.12], [5.4, 0, -20, 1.0], [5.8, 0, -60, 1.08], [6.8, 0, -60, 1.1]] },
  { t0: 6.8, t1: 15.7, el: <S2 />, cam: [[6.8, 0, 0, 1.0], [10.1, 0, -20, 1.06], [10.2, 0, 0, 1.0], [15.7, 20, -20, 1.05]], dim: (t) => (t < 10.2 ? 0.15 : 0) },
  { t0: 15.7, t1: 25.6, el: <S3 />, cam: [[15.7, 0, 0, 1.0], [25.6, 0, -20, 1.04]] },
  { t0: 25.6, t1: 33.4, el: <S4 />, cam: [[25.6, 0, 0, 1.0], [30.4, 30, -30, 1.06], [30.45, 0, 0, 1.0], [33.4, 0, 0, 1.03]] },
  { t0: 33.4, t1: 38.3, el: <S5 />, cam: [[33.4, 0, 0, 1.0], [38.3, 0, -30, 1.05]] },
  { t0: 38.3, t1: 42.34, el: <S6 />, cam: [[38.3, 0, 0, 1.0], [42.34, 0, 0, 1.03]] },
  { t0: 42.34, t1: 52.0, el: <S7 />, cam: [[42.34, 0, 0, 1.0], [52, 0, 40, 1.06]] },
  { t0: 52.0, t1: 58.3, el: <S8 />, cam: [[52, 0, 0, 1.0], [58.3, 0, 30, 1.03]] },
  { t0: 58.3, t1: 65.0, el: <S9 />, cam: [[58.3, 0, 0, 1.0], [60.4, 0, 0, 1.04], [60.5, 0, 0, 1.0], [65, 0, -60, 1.12]] },
  { t0: 65.0, t1: 70.6, el: <S10 />, cam: [[65, 0, 0, 1.0], [70.6, 0, 30, 1.05]], dim: (t) => 0.42 * clamp(1 - Math.abs(t - 66.3) / 0.9) },
  { t0: 70.6, t1: 77.7, el: <S11 />, cam: [[70.6, 0, 0, 1.0], [74.0, 0, -20, 1.08], [74.05, 0, 0, 1.15], [77.7, 0, 0, 1.0]] },
  { t0: 77.7, t1: 84.8, el: <S12 />, cam: [[77.7, 0, 0, 1.0], [79.7, 0, 0, 1.05], [79.8, 0, 0, 1.0], [84.8, 0, -20, 1.04]], dim: (t) => (t > 79.8 ? clamp((t - 80) / 4) * 0.3 : 0) },
  { t0: 84.8, t1: 89.5, el: <S13 />, cam: [[84.8, 0, 0, 1.02], [89.5, 0, 0, 1.08]], shake: (t) => hitAmp(t) * 18, dim: () => 0.32 },
  { t0: 89.5, t1: 97.3, el: <S14 />, cam: [[89.5, 0, 0, 1.0], [91.8, 0, 0, 1.0], [92.4, 300, -330, 1.9], [93.2, 300, -330, 1.9], [93.7, 0, 0, 1.05], [97.3, 0, -20, 1.1]], dim: () => 0.25, shake: (t) => (t < 91.6 ? 2 : 0) },
  { t0: 97.3, t1: 101.0, el: <S15 />, cam: [[97.3, 0, -100, 1.0], [101, 0, -110, 1.03]], dim: (t) => (t > 98.9 ? 0.45 : 0.3) },
];

// ===================================================================== бирка времени
const TAGS: [number, string][] = ([[0, ""], [10.2, "ДЕНЬ 1 — 05:40"], [15.7, "ДЕНЬ 1 — 06:52"], [33.4, "ДЕНЬ 1 — 07:15"], [65.0, "ДЕНЬ 1 — 11:20"], [77.7, "ДЕНЬ 1 — 11:31"], [84.8, "ДЕНЬ 1 — 11:34"], [97.3, "ЧАСТЬ 2 →"]] as [number, string][]).map(([t, x]) => [t ? t + shiftOf(t) : 0, x]);
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

// ===================================================================== субтитры: бумажные полоски, красное слово
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

export const TOTAL = Math.round((SHOTS[SHOTS.length - 1].t1 + 1.32) * FPS);
export const Video: React.FC = () => (
  <AbsoluteFill style={{ backgroundColor: "#1a140c" }}>
    {SHOTS.map((s, i) => {
      const a = i === 0 ? 0 : Math.round((s.t0 + shiftOf(s.t0)) * FPS);
      const b = i === SHOTS.length - 1 ? TOTAL : Math.round((SHOTS[i + 1].t0 + shiftOf(SHOTS[i + 1].t0)) * FPS);
      return (
      <Sequence key={i} from={a} durationInFrames={b - a}>
        <Shot t0={i === 0 ? s.t0 : s.t0 + (a / FPS - (s.t0 + shiftOf(s.t0)))} cam={s.cam} shake={s.shake} dim={s.dim} bg={s.bg}>{s.el}</Shot>
      </Sequence>); })}
    <Tag />
    <Captions />
    <Audio src={staticFile("voice.mp3")} />
    <SFX />
  </AbsoluteFill>
);
