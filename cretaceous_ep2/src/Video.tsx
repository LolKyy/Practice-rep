// «Что, если…?» · Меловой период · Часть 2 «Не стреляй». Шоты по script/voice.srt.
import React from "react";
import { AbsoluteFill, Audio, Sequence, interpolate, spring, staticFile, useCurrentFrame, useVideoConfig } from "remotion";
import "./fonts";
import subs from "./subs.json";
import { SFX } from "./sfx";
import { Layer, Shot, useSec, keys, step, clamp, eo, eio, back, W, H, FPS } from "./stage2d";
import { PAL, G, cut, fillP, strokeP, clipTo, rrectP, ellP, rectP, rng, text, tear, rivet, pencil, tape, fernBush, fern } from "./cut";
import { puppet, Pose, Who, blinkAt, talkAt } from "./puppets";
import { btr, skyDay, trunks, zigRow, fernRow, ground, rexHead, jerrycan } from "./props";
import { NIGHT, nightSky, nightTrees, nightFerns, fireflies, fog, btrNight, cutawayBack, cutawayFront, radioScreen, trigger, skull, smell, fence, dogHead, grill, tent, foodBox, bear, can, rexTail } from "./props2";

// ===================================================================== общие куски (как в Ч1)
const OL = [PAL.olive, PAL.oliveD], OL2 = [PAL.oliveD, "#56622E"];
const Pup: React.FC<{ who: Who; x: number; y: number; sc?: number; d?: number; pose: (t: number) => Pose; flip?: boolean; seed?: number; blur?: number }> =
  ({ who, x, y, sc = 4, d = 1, pose, flip = false, seed = 1, blur = 0 }) => (
    <Layer dyn frame={false} w={Math.round(200 * sc)} h={Math.round(250 * sc)} x={x} y={y - 120 * sc} d={d} scale={sc} shadow={0.4} blur={blur}
      draw={(g, t) => { g.translate(100, 245); if (flip) g.scale(-1, 1); puppet(g, who, pose(t), seed); }} />
  );
const Forest: React.FC<{ gy?: number; sun?: [number, number, number] | null; sky?: (g: G) => void; dark?: boolean }> = ({ gy = 1300, sun = [700, 380, 125], sky, dark = false }) => (<>
  <Layer d={0.25} w={2200} shadow={0} draw={(g) => { if (sky) sky(g); else skyDay(g, 2200, H, sun); g.translate(-560, 0); trunks(g, 2200, H, 3, "#6A6648", 9); }} />
  <Layer d={0.45} w={2400} blur={2} draw={(g) => { g.translate(-660, 0); zigRow(g, 2400, gy - 60, 600, 1000, [PAL.oliveD, "#4E5A2C"], 4, 12, 70); }} />
  <Layer d={0.7} w={2600} draw={(g) => { g.translate(-760, 0); fernRow(g, 2600, gy + 20, 260, OL2, 9, 9); }} />
  <Layer d={0.85} shadow={0.25} draw={(g) => ground(g, W, gy, H - gy + 300, dark ? "#6E5A3A" : "#9C7A4E", 4)} />
</>);
const FrontFerns: React.FC<{ y?: number; blur?: number; d?: number; dx?: number; s?: number; seed?: number; night?: boolean }> = ({ y = 1900, blur = 7, d = 1.5, dx = 0, s = 1, seed = 2, night = false }) => (
  <Layer d={d} blur={blur} dx={dx} s={s} draw={(g) => { const c = night ? [NIGHT.sil, "#1E2618"] : OL; fernBush(g, 60, y, 420, c, seed, 0.8); fernBush(g, 1040, y + 30, 460, night ? c : OL2, seed + 5, 0.8); }} />
);
// ночной фон: небо с луной/звёздами (мерцают), лес-силуэты, туман, светлячки
const NightBG: React.FC<{ gy?: number; moon?: [number, number, number] | null; flies?: number; dx?: number }> = ({ gy = 1300, moon = [760, 360, 95], flies = 14, dx = 0 }) => (<>
  <Layer d={0.2} dyn w={1600} h={2600} shadow={0} draw={(g, t) => { g.translate(-262, -340); nightSky(g, 1600, 2600, t, moon ? [moon[0] + 262, moon[1] + 340, moon[2]] : (null as any)); }} />
  <Layer d={0.45} w={2400} blur={1} dx={dx * 0.45} shadow={0.3} draw={(g) => { g.translate(-660, 0); nightTrees(g, 2400, gy - 40, 700, 1100, 4, 12); }} />
  <Layer d={0.7} w={2600} dx={dx * 0.7} shadow={0.3} draw={(g) => { g.translate(-760, 0); nightFerns(g, 2600, gy + 20, 260, 9, 9); }} />
  <Layer d={0.85} shadow={0.25} draw={(g) => ground(g, W, gy, H - gy + 300, "#2A2A22", 4)} />
  <Layer d={0.9} dyn shadow={0} draw={(g, t) => fog(g, W, gy - 60, t, 0.16)} />
  <Layer d={0.95} dyn shadow={0} draw={(g, t) => fireflies(g, W, H * 0.85, t, flies)} />
</>);

// ===================================================================== ШОТЫ
// 1 · 0.0–6.35 — НИЗКИЙ РАКУРС из-под папоротника (СКВОЗЬ СЛОЙ) → глаз рекса → Котов у пулемёта, ТОЛЧОК на «ничего»
const S1: React.FC = () => {
  const sec = useSec();
  const leaf = keys(sec, [[0, 0], [0.9, 1300]], eo);
  const nos = 1 + 0.12 * Math.max(0, Math.sin(sec * 3.2));
  const drop = sec > 2.6 ? keys(sec, [[2.6, 0], [3.8, 900]], (x) => x * x) : 0;
  return (<>
    <Forest gy={1280} dark sun={[300, 420, 110]} />
    <Layer d={0.8} dyn draw={(g, t) => { g.translate(860, 820); g.scale(1.3, 1.3); g.rotate(-0.05 + Math.sin(t * 0.8) * 0.015); rexHead(g, 0.08, 1);
      g.save(); g.translate(-350, -50); g.scale(nos, nos); fillP(g, ellP(0, 0, 14, 8, 12), "#0E1209"); g.restore();
      if (drop > 0 && drop < 900) cut(g, ellP(-200, 60 + drop * 0.6, 7, 11, 12), "#CFE0EA", { seed: 9, edge: 0.4, thick: false }); }} />
    <Layer d={0.86} draw={(g) => fernRow(g, W, 1340, 330, OL, 77, 4)} />
    <Pup who="kotov" x={360} y={1330} sc={2.9} pose={(t) => ({ expr: t < 5.5 ? "fear" : "resolve", aR: [0.35, 0.9], aL: [0.35, 0.9], legs: false, blink: blinkAt(t, 5), look: [0.7, -0.3] })} />
    <Pup who="bugaev" x={150} y={1340} sc={3.0} seed={3} pose={(t) => ({ expr: "stern", aR: [1.55, 0.2], legs: false, blink: blinkAt(t, 6), look: [0.5, -0.2] })} />
    <Layer d={1} draw={(g) => { g.translate(470, 1470); g.scale(1.3, 1.3); btr(g, { gun: -0.18 }); }} />
    <Layer d={1.6} blur={8} dx={leaf} draw={(g) => { fernBush(g, 560, 2100, 900, OL, 3, 1.1); }} />
  </>);
};
// 2 · 6.35–13.8 — палец на спуске → ПАНОРАМА ВВЕРХ по руке → лица → ТОЛЧОК на «дальше»
const S2: React.FC = () => {
  const sec = useSec();
  const squeeze = 1 + 0.06 * Math.max(0, Math.sin((sec - 8.6) * 5)) * (sec > 8.6 && sec < 10 ? 1 : 0);
  return (<>
    <Layer d={0.3} blur={6} shadow={0} h={4200} y={H / 2 - 600} draw={(g) => { g.translate(0, 1150); skyDay(g, W + 400, 4200, [300, 300, 140]); }} />
    <Layer d={0.5} blur={4} h={4200} y={H / 2 - 600} draw={(g) => { g.translate(-160, 1150); zigRow(g, 1400, 2600, 1400, 2000, [PAL.oliveD, "#4E5A2C"], 6, 8, 80); }} />
    {/* лица наверху сцены (y ≈ −900 … 0), рука и спуск внизу (y ≈ 1200 … 2400) */}
    <Pup who="bugaev" x={300} y={1400} sc={7.2} seed={3} pose={(t) => ({ expr: t < 10.9 ? "stern" : t < 12.7 ? "whisper" : "resolve", talk: talkAt(t, [[10.9, 12.6], [12.8, 13.4]]), aR: [1.25, 0.35], aL: [0.2, 0.3], legs: false, blink: blinkAt(t, 2), look: [0.6, 0] })} />
    <Pup who="kotov" x={820} y={1460} sc={7.0} pose={(t) => ({ expr: t < 12.9 ? "fear" : "realize", aR: [0.3, 0.3], aL: [0.3, 0.6], legs: false, blink: blinkAt(t, 7), look: [-0.5, 0], tilt: 0.05 })} />
    <Layer d={1.05} dyn draw={(g) => { g.translate(700, 760); g.scale(squeeze, squeeze); cut(g, rrectP(-110, -60, 220, 130, 60), "#D8AE88", { seed: 7 }); for (let i = 0; i < 4; i++) cut(g, rrectP(-110 + i * 50, 30, 46, 90, 20), "#D8AE88", { seed: 8 + i, edge: 0.8 }); }} />
    <Layer d={1.1} dyn y={H / 2 + 1700} draw={(g, t) => { g.translate(480, 760); trigger(g, t, t > 12.8 ? 0.3 : 0); }} />
  </>);
};
// 3 · 13.8–20.1 — СВЕРХУ: от БТР расходятся круги звука, по краям загораются глаза; ОТЪЕЗД 25 %, лёгкое вращение
const EYES3: [number, number, number][] = [[150, 400, 16.6], [930, 520, 17.1], [120, 1250, 17.6], [960, 1380, 18.1], [520, 260, 18.5], [300, 1600, 18.9], [820, 1680, 19.3], [60, 820, 19.6]];
const S3: React.FC = () => {
  const sec = useSec();
  return (<>
    <Layer d={0.5} shadow={0} draw={(g) => { g.fillStyle = "#3A2C1E"; g.fillRect(-300, -300, W + 600, H + 600); }} />
    <Layer d={1} rot={keys(sec, [[13.8, 0.03], [20.1, -0.01]])} draw={(g) => {
      cut(g, rectP(-40, 120, 1160, 1680), "#5E4A34", { seed: 7, edge: 2 });
      const r = rng(5); for (let i = 0; i < 30; i++) { const x = r() * W, y = 160 + r() * 1600; for (let k = 0; k < 4; k++) cut(g, ellP(x + (r() - 0.5) * 80, y + (r() - 0.5) * 60, 45 + r() * 30, 40 + r() * 25, 20), k % 2 ? "#3F4A25" : "#4C5830", { seed: i * 9 + k, edge: 0.5, thick: false }); }
      tape(g, 980, 140, 140, 0.4); tape(g, 100, 1780, 140, 0.5);
    }} />
    <Layer d={1.02} dyn rot={keys(sec, [[13.8, 0.03], [20.1, -0.01]])} draw={(g, t) => {
      for (let k = 0; k < 6; k++) { const st = 14.1 + k * 0.45; if (t < st) continue; const R = (t - st) * 260; if (R > 1100) continue; strokeP(g, ellP(540, 960, R, R, 90), `rgba(229,57,53,${0.85 * (1 - R / 1100)})`, 6, true); }
      g.save(); g.translate(540, 960); g.scale(0.16, 0.16); btr(g, {}); g.restore();
      for (const [x, y, at] of EYES3) { const a = clamp((t - at) * 4); if (a <= 0) continue; for (const s of [-1, 1]) { const gl = g.createRadialGradient(x + s * 16, y, 1, x + s * 16, y, 30); gl.addColorStop(0, `rgba(255,80,60,${0.6 * a})`); gl.addColorStop(1, "rgba(255,80,60,0)"); g.fillStyle = gl; g.fillRect(x + s * 16 - 32, y - 32, 64, 64); fillP(g, ellP(x + s * 16, y, 8, 5, 10), "#FF5A3A", a); } }
    }} />
  </>);
};
// 4 · 20.1–27.85 — РАЗРЕЗ черепа: нюх (жёлтая калька) → НАЕЗД к луковице → соседи «не хуже»
const S4: React.FC = () => {
  const sec = useSec();
  const nb = keys(sec, [[25.7, 0], [26.4, 1]], back);
  return (<>
    <Layer d={0.5} shadow={0} draw={(g) => { g.fillStyle = "#7A5C3C"; g.fillRect(-300, -300, W + 600, H + 600); const r = rng(2); for (let i = 0; i < 40; i++) pencil(g, [[r() * W, r() * H], [r() * W, r() * H]], 0.08); }} />
    <Layer d={0.9} draw={(g) => { cut(g, rectP(70, 300, 940, 1260), PAL.paper, { seed: 12, edge: 2 }); clipTo(g, rectP(70, 300, 940, 1260), () => { for (let y = 340; y < 1560; y += 50) strokeP(g, [[70, y], [1010, y]], "rgba(70,110,170,0.25)", 2); }); tape(g, 980, 320, 120, 0.4); tape(g, 100, 1540, 120, 0.5); }} />
    {nb > 0 ? <Layer d={0.95} dyn draw={(g, t) => { for (const [x, s] of [[-260 + 460 * nb, 1], [1340 - 460 * nb, -1]] as [number, number][]) { g.save(); g.translate(x, 1350); g.scale(0.55 * s, 0.55); skull(g, t + s, 0.9, "#CBBE9F"); g.restore(); } }} /> : null}
    <Layer d={1} dyn draw={(g, t) => { g.translate(560, 820); g.scale(1.25, 1.25); skull(g, t, sec > 21.5 ? 1 : 0.4);
      if (t > 22.2) smell(g, t, -700, -240, -330, -60, 3, "rgba(255,210,90,0.8)", 5);
      if (t > 21.9) { g.save(); g.translate(130, -260); g.rotate(-0.05); cut(g, rectP(-70, -30, 140, 60), PAL.scarf, { seed: 4 }); text(g, "НЮХ", 0, 2, 38, "#fff"); g.restore(); strokeP(g, [[130, -230], [130, -178]], PAL.scarf, 3); } }} />
  </>);
};
// 5 · 27.85–33.3 — дача: мангал → ПРОЕЗД вдоль забора, собаки вырастают по очереди
const DOGS: [number, number, string][] = [[300, 29.9, "#8A6440"], [520, 30.3, "#2E2A22"], [700, 30.65, "#C9A274"], [930, 31.0, "#6B4A30"], [1130, 31.3, "#E0D3B8"], [1330, 31.6, "#3E2E22"], [1540, 31.9, "#A87C50"], [1760, 32.2, "#5A4A3A"]];
const S5: React.FC = () => {
  const sec = useSec();
  return (<>
    <Layer d={0.25} w={2600} shadow={0} draw={(g) => { const gr = g.createLinearGradient(0, 0, 0, H); gr.addColorStop(0, "#E9A86A"); gr.addColorStop(1, "#C9805A"); g.fillStyle = gr; g.fillRect(0, 0, 2600, H); g.translate(-760, 0); cut(g, ellP(1500, 520, 130, 130, 50), "#F6D9A0", { seed: 2 }); }} />
    <Layer d={0.5} w={2600} blur={2} draw={(g) => { g.translate(-760, 0); for (let i = 0; i < 7; i++) { const x = 100 + i * 360; cut(g, [[x, 1100], [x + 90, 980], [x + 180, 1100], [x + 180, 1250], [x, 1250]], i % 2 ? "#9C744A" : "#B98A5A", { seed: i }); cut(g, rectP(x + 60, 1150, 50, 60), "#F2C26A", { seed: i + 20 }); } }} />
    <Layer d={0.75} w={2800} dyn draw={(g, t) => { g.translate(-860, 0); for (const [x, at, c] of DOGS) { const k = back(clamp((t - at) / 0.35)); if (k <= 0) continue; g.save(); g.translate(x + 640, 1250 - 270 * k); g.scale(1.25, 1.25); dogHead(g, Math.round(x), c); g.restore(); } }} />
    <Layer d={0.8} w={2800} draw={(g) => { g.translate(-860, 0); fence(g, 0, 2800, 1330, 260); }} />
    <Layer d={0.85} shadow={0.25} draw={(g) => ground(g, W, 1320, 900, "#7C8A44", 6)} />
    <Layer d={1} dyn draw={(g, t) => { g.translate(330, 1600); g.scale(1.2, 1.2); grill(g, t); }} />
  </>);
};
// 6 · 33.3–40.95 — морда рекса у люка, Котов зажмурился; «солярка, металл, порох» ✕; фырк → рекс уходит
const S6: React.FC = () => {
  const sec = useSec();
  const leave = keys(sec, [[39.1, 0], [40.9, 1]], eio);
  const slide = keys(sec, [[33.3, 360], [35.2, 0]], eo);
  const tags: [string, number][] = [["СОЛЯРКА", 35.4], ["МЕТАЛЛ", 36.2], ["ПОРОХ", 36.8]];
  return (<>
    <Forest gy={1150} dark sun={[250, 380, 110]} />
    <Layer d={0.75} dyn draw={(g, t) => { if (leave <= 0) return; g.translate(760 + leave * 260, 1180 - leave * 40); g.scale(1 - leave * 0.5, 1 - leave * 0.5); rexTail(g); }} />
    <Layer d={0.78} draw={(g) => fernRow(g, W, 1230, 300, OL, 31, 4)} />
    <Pup who="kotov" x={420} y={1560} sc={4.2} pose={(t) => ({ expr: t < 39.4 ? "squeeze" : t < 40.4 ? "fear" : "relief", aR: [0.4, 1.6], aL: [0.4, 1.6], legs: false, tilt: -0.06 })} />
    <Layer d={1} draw={(g) => { g.translate(560, 1880); g.scale(1.75, 1.75); btr(g, { noTurret: true }); cut(g, rrectP(-120, -250, 200, 30, 6), PAL.khakiD, { seed: 3 }); }} />
    <Layer d={1.1} dyn draw={(g, t) => {
      const lx = leave; g.translate(900 + slide + lx * 500, 1060 - lx * 260); g.scale(1.45 * (1 - lx * 0.55), 1.45 * (1 - lx * 0.55)); g.rotate(Math.sin(t * 1.5) * 0.03 - lx * 0.1);
      rexHead(g, 0.06, 1 - lx * 0.5);
      if (t > 38.7 && t < 39.8) { const k = (t - 38.7) / 1.1; g.save(); g.globalAlpha = 1 - k; for (let i = 0; i < 4; i++) cut(g, ellP(-420 - k * 220 - i * 40, -50 + (i - 1.5) * 30, 40 + k * 60, 26 + k * 30, 16), "#E8E4DA", { seed: i, edge: 0.4, thick: false }); g.restore(); }
    }} />
    <AbsoluteFill>{tags.map(([s, at], i) => sec > at && sec < 39.2 ? (
      <div key={s} style={{ position: "absolute", left: 120 + i * 270, top: 360 + (i % 2) * 60, fontFamily: "JetBrains Mono", fontWeight: 700, fontSize: 36, color: PAL.ink, background: PAL.edge, padding: "8px 16px",
        transform: `rotate(${(i - 1) * 3}deg) scale(${interpolate(sec, [at, at + 0.15], [1.3, 1], { extrapolateRight: "clamp" })})`, boxShadow: "6px 9px 12px rgba(20,12,4,0.45)" }}>
        {s}{sec > 37.6 ? <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", color: PAL.scarf, fontSize: 80, fontFamily: "Montserrat", fontWeight: 900 }}>✕</div> : null}</div>) : null)}</AbsoluteFill>
  </>);
};
// 7 · 40.95–48.9 — закат: Бугаев перед строем, ПРОЕЗД вдоль строя, карточка «ПРАВИЛА ЛАГЕРЯ»
const sunsetSky = (g: G) => { const gr = g.createLinearGradient(0, 0, 0, H); gr.addColorStop(0, "#5A4A6A"); gr.addColorStop(0.55, "#E07A3A"); gr.addColorStop(1, "#F2B45A"); g.fillStyle = gr; g.fillRect(0, 0, 2200, H); cut(g, ellP(1300, 1150, 150, 150, 50), "#FBD58A", { seed: 4 }); };
const S7: React.FC = () => {
  const sec = useSec();
  const rules: [string, number, boolean][] = [["1. НОЧУЕМ В БТР", 43.1, false], ["2. ЛЮКИ ЗАДРАЕНЫ", 44.4, false], ["3. ЕДА — ПОДАЛЬШЕ", 46.3, true]];
  const card = keys(sec, [[42.8, 900], [43.2, 0]], back);
  return (<>
    <Forest gy={1300} sky={sunsetSky} dark />
    <Layer d={0.9} draw={(g) => { g.translate(980, 1360); g.scale(0.9, 0.9); btr(g, {}); g.globalCompositeOperation = "source-atop"; g.fillStyle = "rgba(90,40,10,0.25)"; g.fillRect(-500, -500, 1000, 600); }} />
    <Pup who="bugaev" x={230} y={1560} sc={3.6} seed={3} pose={(t) => ({ expr: t < 43 ? "stern" : "resolve", talk: 0, aR: t > 42.9 && t < 47 ? [keys(t, [[42.9, 0.2], [43.2, 1.3], [44.3, 1.3], [44.6, 1.7], [46.1, 1.7], [46.4, 1.4]]), 0.4] : [0.2, 0.2], legs: false, blink: blinkAt(t, 3), look: [0.6, 0] })} />
    {(["kotov", "petrov", "lis"] as Who[]).map((w, i) => (
      <Pup key={w} who={w} x={560 + i * 210} y={1600} sc={3.0} seed={i + 1} d={1.02} pose={(t) => ({ expr: w === "petrov" && t > 46.3 ? "fear" : "calm", look: [-0.7, 0], legs: false, blink: blinkAt(t, i + 4) })} />
    ))}
    <FrontFerns blur={7} />
    <AbsoluteFill>
      <div style={{ position: "absolute", left: 130 + card, top: 300, width: 820, background: PAL.paper, padding: "22px 30px", boxShadow: "10px 14px 18px rgba(20,12,4,0.5)", transform: "rotate(-1deg)" }}>
        <div style={{ fontFamily: "Montserrat", fontWeight: 900, fontSize: 52, color: PAL.ink, marginBottom: 12 }}>ПРАВИЛА ЛАГЕРЯ</div>
        {rules.map(([s, at, hl]) => sec > at ? <div key={s} style={{ fontFamily: "JetBrains Mono", fontWeight: 700, fontSize: 38, color: hl ? PAL.scarf : PAL.ink, padding: "6px 0", borderTop: "2px solid rgba(70,110,170,0.3)",
          transform: `translateX(${interpolate(sec, [at, at + 0.2], [-30, 0], { extrapolateRight: "clamp" })}px)` }}>{s}</div> : null)}
      </div>
    </AbsoluteFill>
  </>);
};
// 8 · 48.9–54.35 — схема: палатка ← пунктир «100 М» → ящик с едой, медведь нюхает; ПРОЕЗД вдоль пунктира
const S8: React.FC = () => {
  const sec = useSec();
  const draw = keys(sec, [[49.4, 0], [53.4, 1]], (x) => x);
  return (<>
    <Layer d={0.4} w={2600} shadow={0} draw={(g) => { g.fillStyle = "#CFD8C8"; g.fillRect(0, 0, 2600, H); }} />
    <Layer d={0.9} w={2800} draw={(g) => { g.translate(-860, 0); cut(g, rectP(80, 380, 2640, 1200), PAL.paper, { seed: 3, edge: 2 }); clipTo(g, rectP(80, 380, 2640, 1200), () => { for (let x = 80; x < 2720; x += 60) strokeP(g, [[x, 380], [x, 1580]], "rgba(70,110,170,0.18)", 2); for (let y = 380; y < 1580; y += 60) strokeP(g, [[80, y], [2720, y]], "rgba(70,110,170,0.18)", 2); });
      strokeP(g, [[80, 1150], [2720, 1150]], "#6E7A3A", 6); tape(g, 2680, 400, 140, 0.4); tape(g, 130, 1560, 140, 0.5);
      g.save(); g.translate(560, 1150); g.scale(1.4, 1.4); tent(g); g.restore(); g.save(); g.translate(2240, 1150); g.scale(1.3, 1.3); foodBox(g); g.restore(); }} />
    <Layer d={0.92} w={2800} dyn draw={(g, t) => { g.translate(-860, 0);
      const x0 = 760, x1 = 2080, xe = x0 + (x1 - x0) * draw; for (let x = x0; x < xe; x += 44) strokeP(g, [[x, 1050], [Math.min(x + 24, xe), 1050]], PAL.scarf, 7);
      if (draw > 0.05) { strokeP(g, [[x0, 1030], [x0, 1070]], PAL.scarf, 5); }
      if (draw > 0.98) { strokeP(g, [[x1, 1030], [x1, 1070]], PAL.scarf, 5); g.save(); g.translate(1420, 980); g.rotate(-0.03); cut(g, rectP(-120, -40, 240, 80), PAL.scarf, { seed: 5 }); text(g, "100 М", 0, 2, 50, "#fff"); g.restore(); }
      if (t > 51.6) { g.save(); g.translate(2480, 1150); g.scale(-1.1, 1.1); bear(g, t); g.restore(); } }} />
  </>);
};
// 9 · 54.35–61.35 — канистры «ВОДА — 4 ДНЯ» → СКВОЗЬ СЛОЙ → СВЕРХУ карта, пунктир к реке
const S9: React.FC = () => {
  const sec = useSec();
  const lvl = keys(sec, [[54.6, 0.62], [56.2, 0.5]]);
  const away = keys(sec, [[56.3, 0], [57.1, 1]], (x) => x * x);
  const route = keys(sec, [[57.6, 0], [60.6, 1]], eio);
  return (<>
    <Layer d={0.5} shadow={0} draw={(g) => { g.fillStyle = "#5E4A34"; g.fillRect(-300, -300, W + 600, H + 600); }} />
    <Layer d={1} rot={-0.02} draw={(g) => {
      cut(g, rectP(60, 220, 960, 1440), "#D8B47E", { seed: 7, edge: 2 });
      const r = rng(15); for (let i = 0; i < 24; i++) { const x = 100 + r() * 880, y = 260 + r() * 1360; for (let k = 0; k < 4; k++) cut(g, ellP(x + (r() - 0.5) * 80, y + (r() - 0.5) * 60, 45 + r() * 30, 40 + r() * 25, 20), k % 2 ? PAL.olive : "#7C8A44", { seed: i * 9 + k, edge: 0.5, thick: false }); }
      strokeP(g, [[60, 520], [260, 580], [420, 520], [560, 600], [760, 570], [1020, 680]], "#4B86C8", 22); tape(g, 980, 240, 140, 0.4);
    }} />
    <Layer d={1.02} rot={-0.02} dyn draw={(g, t) => {
      fillP(g, ellP(540, 1300, 16, 16, 16), PAL.ink); text(g, "БТР", 590, 1300, 26, PAL.ink, "Montserrat", 900, "left");
      const pts: [number, number][] = [[540, 1300], [500, 1150], [600, 980], [520, 820], [580, 640]]; const n = route * (pts.length - 1);
      for (let i = 0; i < Math.floor(n + 1) && i < pts.length - 1; i++) { const k = Math.min(1, n - i); const [a, b] = [pts[i], pts[i + 1]]; const e: [number, number] = [a[0] + (b[0] - a[0]) * k, a[1] + (b[1] - a[1]) * k]; const L = Math.hypot(e[0] - a[0], e[1] - a[1]); for (let s = 0; s < L; s += 34) { const u = s / (L || 1), u2 = Math.min(1, (s + 18) / (L || 1)); strokeP(g, [[a[0] + (e[0] - a[0]) * u, a[1] + (e[1] - a[1]) * u], [a[0] + (e[0] - a[0]) * u2, a[1] + (e[1] - a[1]) * u2]], PAL.scarf, 8); } }
      if (route > 0.95) { g.save(); g.translate(700, 600); g.rotate(-0.06); cut(g, rectP(-110, -34, 220, 68), PAL.edge, { seed: 4 }); text(g, "ПЕШКОМ", 0, 2, 36, PAL.ink); g.restore(); }
    }} />
    {away < 1 ? <Layer d={1.3} dyn draw={(g, t) => { g.translate(-away * 1400, 0); g.fillStyle = "#4A3A28"; g.fillRect(-200, -200, W + 400, H + 400); for (let i = 0; i < 4; i++) { g.save(); g.translate(180 + i * 240, 1350); g.scale(1.05, 1.05); jerrycan(g, lvl, t, i + 1); g.restore(); } }} /> : null}
    {away < 0.6 ? <AbsoluteFill><div style={{ position: "absolute", left: 110 - away * 1400, top: 330, width: 860, background: PAL.edge, padding: "16px 26px", boxShadow: "8px 12px 16px rgba(20,12,4,0.45)", transform: "rotate(-0.8deg)" }}>
      <div style={{ display: "flex", justifyContent: "space-between", fontFamily: "JetBrains Mono", fontWeight: 700, fontSize: 34, color: PAL.ink }}><span>ВОДА</span><span style={{ fontFamily: "Montserrat", fontWeight: 900, color: PAL.scarf }}>4 ДНЯ</span></div>
      <div style={{ height: 18, background: "#D9D2BF", marginTop: 10 }}><div style={{ height: 18, width: `${lvl * 100 * 0.9}%`, background: PAL.blue }} /></div></div></AbsoluteFill> : null}
  </>);
};
// БТР в разрезе со спящими (шоты 10, 11, 14)
const Cutaway: React.FC<{ lisAwake?: (t: number) => Pose["expr"]; petrov?: (t: number) => Pose; radio?: (t: number) => number; lamp?: number }> = ({ lisAwake, petrov, radio = () => 0, lamp = 0.85 }) => (<>
  <NightBG gy={1500} moon={[860, 300, 80]} flies={10} />
  <Layer d={0.98} dyn draw={(g, t) => { g.translate(540, 1560); g.scale(1.38, 1.38); cutawayBack(g, lamp, t); radioScreen(g, 245, -270, 50, 32, t, radio(t)); }} />
  <Pup who="bugaev" x={170} y={1540} sc={2.0} seed={3} pose={(t) => ({ expr: "sleep", tilt: 0.1 + Math.sin(t * 1.2) * 0.02, aR: [0.2, 1.2], aL: [0.2, 1.2], legs: false })} />
  <Pup who="kotov" x={370} y={1540} sc={2.0} pose={(t) => ({ expr: "sleep", tilt: -0.12 + Math.sin(t * 1.0 + 1) * 0.02, aR: [0.2, 1.4], aL: [0.2, 1.4], legs: false })} />
  <Pup who="petrov" x={570} y={1540} sc={2.0} seed={2} pose={petrov ?? ((t) => ({ expr: "sleep", tilt: 0.15, legs: false }))} />
  <Pup who="lis" x={780} y={1550} sc={1.95} seed={4} pose={(t) => ({ expr: lisAwake ? lisAwake(t) : "sleep", tilt: lisAwake && lisAwake(t) !== "sleep" ? 0 : -0.18, aL: [0.2, 1.2], legs: false })} />
  <Layer d={1.02} draw={(g) => { g.translate(540, 1560); g.scale(1.38, 1.38); cutawayFront(g); }} />
</>);
// 10 · 61.35–63.85 — ПАНОРАМА ВНИЗ с луны на БТР → РАЗРЕЗ: все спят, Петров открывает глаз
const S10: React.FC = () => {
  const sec = useSec();
  if (sec < 62.6) return (<>
    <NightBG gy={1350} moon={[700, 330, 110]} />
    <Layer d={1} draw={(g) => { g.translate(540, 1470); g.scale(1.2, 1.2); btrNight(g); }} />
    <FrontFerns night blur={8} />
  </>);
  return <Cutaway petrov={(t) => ({ expr: t < 62.85 ? "sleep" : "peek", tilt: t < 63.3 ? 0.15 : 0.02, legs: false, look: [0.6, 0], aR: [0.2, 0.6] })} />;
};
// 11 · 63.85–68.05 — банка крупно, щелчок → запах ползёт вверх → СКВОЗЬ СЛОЙ крыши → ночное небо
const S11: React.FC = () => {
  const sec = useSec();
  const open = keys(sec, [[64.1, 0], [64.6, 1]], back);
  if (sec < 66.7) return (<>
    <Layer d={0.6} blur={5} shadow={0} h={3400} y={H / 2 - 500} draw={(g) => { g.translate(0, 740); g.fillStyle = "#3E3A26"; g.fillRect(-200, -800, W + 400, 3400); const gl = g.createRadialGradient(540, 200, 10, 540, 200, 700); gl.addColorStop(0, "rgba(255,190,90,0.45)"); gl.addColorStop(1, "rgba(255,190,90,0)"); g.fillStyle = gl; g.fillRect(-200, -800, W + 400, 3400); }} />
    <Layer d={0.9} h={3400} y={H / 2 - 500} draw={(g) => { g.translate(0, 740); cut(g, rrectP(330, -560, 420, 120, 10), "#2E2C1C", { seed: 44 }); for (let x = 350; x < 740; x += 30) fillP(g, rectP(x, -545, 14, 90), "#7A7550"); }} />
    <Pup who="petrov" x={760} y={2000} sc={5.0} seed={2} pose={(t) => ({ expr: "smirk", aL: [0.9, 1.2], aR: [0.9, 1.4], legs: false, look: [-0.6, 0.6], blink: blinkAt(t, 2) })} />
    <Layer d={1} dyn h={3400} y={H / 2 - 500} draw={(g, t) => { g.translate(0, 740); g.save(); g.translate(470, 1180); g.scale(1.25, 1.25); can(g, open, t); g.restore(); if (t > 64.6) smell(g, t, 470, 1020, 540, -450, 3, "rgba(243,225,190,0.7)", 7); }} />
  </>);
  const k = keys(sec, [[66.7, 0], [67.2, 1]], eo);
  return (<>
    <NightBG gy={1500} moon={[300, 420, 100]} />
    <Layer d={1} dyn draw={(g, t) => { g.translate(540, 1620); g.scale(1.3, 1.3); btrNight(g); cut(g, rrectP(-300, -260, 30, 60, 4), "#2a2a22", { seed: 3 }); smell(g, t, -285, -260, -150, -1150, 3, "rgba(243,225,190,0.55)", 6); }} />
    {k < 1 ? <Layer d={1.4} draw={(g) => { g.fillStyle = "#3E3A26"; g.fillRect(-200, -200, W + 400, H + 400); }} dy={-k * 2400} /> : null}
  </>);
};
// 12 · 68.05–74.15 — глаза Котова (ТОЛЧОК) → ПРОЕЗД по ночному лесу, светлячки гаснут, цикады замолкают
const S12: React.FC = () => {
  const sec = useSec();
  if (sec < 69.95) return (<>
    <Layer d={0.6} blur={6} shadow={0} draw={(g) => { g.fillStyle = "#2A2618"; g.fillRect(-200, -200, W + 400, H + 400); const gl = g.createRadialGradient(540, 300, 10, 540, 300, 900); gl.addColorStop(0, "rgba(255,184,77,0.35)"); gl.addColorStop(1, "rgba(255,184,77,0)"); g.fillStyle = gl; g.fillRect(-200, -200, W + 400, H + 400); }} />
    <Pup who="kotov" x={540} y={2150} sc={8.5} pose={(t) => ({ expr: t < 68.4 ? "sleep" : t < 69.4 ? "shock" : "fear", look: [t > 69.2 ? -0.7 : 0, 0], legs: false, aR: [0.1, 0.2], aL: [0.1, 0.2], bonk: t > 68.4 && t < 68.7 ? 1 : 0 })} />
  </>);
  const lit = Math.round(keys(sec, [[70.8, 14], [73.6, 0]], (x) => x));
  const pan = keys(sec, [[69.95, 0], [74.15, -700]], (x) => x);
  return (<>
    <Layer d={0.2} dyn w={1600} h={2600} shadow={0} draw={(g, t) => { g.translate(-262, -340); nightSky(g, 1600, 2600, t, [1100, 640, 90]); }} />
    <Layer d={0.45} w={3200} dx={pan * 0.45 + 900} shadow={0.3} blur={1} draw={(g) => { g.translate(-1060, 0); nightTrees(g, 3200, 1260, 700, 1100, 8, 16); }} />
    <Layer d={0.7} w={3400} dx={pan * 0.7 + 1000} shadow={0.3} draw={(g) => { g.translate(-1160, 0); nightFerns(g, 3400, 1320, 280, 12, 12); }} />
    <Layer d={0.85} shadow={0.25} draw={(g) => ground(g, W, 1300, 900, "#2A2A22", 4)} />
    <Layer d={0.9} dyn shadow={0} draw={(g, t) => fog(g, W, 1240, t, 0.16)} />
    <Layer d={0.95} dyn shadow={0} draw={(g, t) => fireflies(g, W, H * 0.85, t, lit, 9)} />
    <Layer d={1.5} w={3600} dx={pan * 1.4 + 1100} blur={8} draw={(g) => { g.translate(-1260, 0); nightFerns(g, 3600, 2050, 520, 21, 6); }} />
  </>);
};
// 13 · 74.15–80.15 — POV через смотровую щель: загораются пары глаз (каждая ближе)
const EYES13: [number, number, number, number][] = [[380, 900, 74.9, 0.8], [700, 960, 77.05, 1.1], [300, 1000, 77.95, 1.45], [600, 1020, 79.4, 1.9]];
const S13: React.FC = () => {
  const sec = useSec();
  const sway = Math.sin(sec * 0.7) * 120;
  return (<>
    <Layer d={0.3} dyn dx={sway * 0.3} w={1600} h={2600} shadow={0} draw={(g, t) => { g.translate(-262, -340); nightSky(g, 1600, 2600, t, null as any); }} />
    <Layer d={0.5} dx={sway * 0.5} w={2400} shadow={0.3} draw={(g) => { g.translate(-660, 0); nightTrees(g, 2400, 1180, 500, 800, 14, 12); }} />
    <Layer d={0.7} dx={sway * 0.8} w={2400} dyn shadow={0} draw={(g, t) => { g.translate(-660, 0);
      for (const [x, y, at, s] of EYES13) { const a = clamp((t - at) * 5) * (0.85 + 0.15 * Math.sin(t * 3 + x)); if (a <= 0) continue; for (const d of [-1, 1]) { const ex = x + 660 + d * 26 * s, ey = y; const gl = g.createRadialGradient(ex, ey, 1, ex, ey, 44 * s); gl.addColorStop(0, `rgba(255,214,90,${0.65 * a})`); gl.addColorStop(1, "rgba(255,214,90,0)"); g.fillStyle = gl; g.fillRect(ex - 50 * s, ey - 50 * s, 100 * s, 100 * s); cut(g, ellP(ex, ey, 13 * s, 8 * s, 14), `rgba(255,214,90,${a})`, { seed: x + d, edge: 0.4, thick: false }); fillP(g, ellP(ex, ey, 2.2 * s, 7 * s, 10), "#120E06", a); } } }} />
    <Layer d={0.85} dx={sway} w={2400} shadow={0.3} draw={(g) => { g.translate(-660, 0); nightFerns(g, 2400, 1250, 300, 17, 9); }} />
    {/* рамка-маска щели */}
    <Layer d={1.6} shadow={0.6} draw={(g) => { g.fillStyle = "#14140F"; g.beginPath(); g.rect(-400, -400, W + 800, H + 800); const sl = rrectP(60, 760, 960, 420, 40); g.moveTo(sl[0][0], sl[0][1]); sl.forEach((p) => g.lineTo(p[0], p[1])); g.closePath(); g.fill("evenodd");
      for (let x = -200; x < W + 200; x += 70) rivet(g, x, 700, 7); for (let x = -200; x < W + 200; x += 70) rivet(g, x, 1240, 7); strokeP(g, rrectP(60, 760, 960, 420, 40), "#2E2C20", 10, true); }} />
  </>);
};
// 14 · 80.15–86.9 — РАЗРЕЗ → НАЕЗД на рацию (оживает) → ТОЛЧОК на «живой», Лисицын открывает глаза
const S14: React.FC = () => <Cutaway lamp={0.15} radio={(t) => (t < 82.8 ? 0 : clamp((t - 82.8) * 3) * (0.6 + 0.4 * Math.abs(Math.sin(t * 9))))} lisAwake={(t) => (t < 85.7 ? "sleep" : "shock")} />;
// 15 · 86.9–90.5 — Котов между щелью с глазами (жёлтый) и рацией (зелёный); «ЧАСТЬ 3 →»
const S15: React.FC = () => (<>
  <Layer d={0.5} blur={4} shadow={0} draw={(g) => { g.fillStyle = "#1E1D14"; g.fillRect(-200, -200, W + 400, H + 400); }} />
  <Layer d={0.7} blur={2} dyn draw={(g, t) => {
    cut(g, rrectP(-40, 560, 360, 150, 20), "#08080A", { seed: 2 }); for (const [x, y] of [[90, 630], [210, 650]]) for (const d of [-1, 1]) { const gl = g.createRadialGradient(x + d * 18, y, 1, x + d * 18, y, 40); gl.addColorStop(0, "rgba(255,214,90,0.7)"); gl.addColorStop(1, "rgba(255,214,90,0)"); g.fillStyle = gl; g.fillRect(x + d * 18 - 44, y - 44, 88, 88); fillP(g, ellP(x + d * 18, y, 10, 6, 12), "#FFD65A", 0.8 + 0.2 * Math.sin(t * 2)); }
    cut(g, rrectP(820, 520, 220, 300, 14), "#2F3324", { seed: 3 }); radioScreen(g, 850, 560, 160, 100, t, 0.8);
  }} />
  <AbsoluteFill style={{ background: "radial-gradient(ellipse 50% 40% at 10% 35%, rgba(255,214,90,0.25), rgba(0,0,0,0) 70%), radial-gradient(ellipse 50% 40% at 90% 35%, rgba(61,220,132,0.22), rgba(0,0,0,0) 70%)" }} />
  <Pup who="kotov" x={540} y={1950} sc={6.6} pose={(t) => ({ expr: t < 88.8 ? "fear" : "resolve", look: [Math.sin(t * 1.4) > 0 ? -0.8 : 0.8, 0], aR: [0.15, 0.3], aL: [0.15, 0.3], legs: false, blink: blinkAt(t, 3), tilt: Math.sin(t * 1.2) * 0.02 })} />
</>);

// ===================================================================== переходы (не повторяются подряд)
type Tr = "cut" | "wipe" | "tear" | "fern" | "dark" | "flash";
const Transition: React.FC<{ at: number; kind: Tr }> = ({ at, kind }) => {
  const t = useCurrentFrame() / FPS; const HALF = kind === "dark" || kind === "flash" ? 0.3 : 0.45; const k0 = (t - at) / HALF;   // −1..1 вокруг склейки
  const k = k0 < -1 || k0 > 1 ? k0 : eio((k0 + 1) / 2) * 2 - 1;   // плавный разгон и торможение
  if (kind === "cut" || k < -1 || k > 1) return null;
  if (kind === "dark" || kind === "flash") return <AbsoluteFill style={{ backgroundColor: kind === "dark" ? "#06070A" : "#FFF6DC", opacity: 1 - Math.abs(k) }} />;
  const x = interpolate(k, [-1, 1], [W + 200, -W - 1400]);
  if (kind === "wipe") return <AbsoluteFill><div style={{ position: "absolute", top: -100, left: x, width: W + 1200, height: H + 200, background: "#B98A5A", boxShadow: "0 0 40px rgba(20,12,4,0.6)", clipPath: "polygon(2% 0, 100% 0, 100% 100%, 0 100%, 3% 70%, 1% 40%)" }} /></AbsoluteFill>;
  if (kind === "tear") return <AbsoluteFill><div style={{ position: "absolute", left: 0, top: interpolate(k, [-1, 1], [H, -H * 1.6]), width: W, height: H * 1.6, background: "#F3EDE0", boxShadow: "0 0 30px rgba(20,12,4,0.6)",
    clipPath: "polygon(0 2%, 8% 0, 16% 3%, 25% 0.5%, 34% 2.5%, 45% 0, 55% 3%, 66% 1%, 77% 3%, 88% 0, 100% 2%, 100% 98%, 90% 100%, 78% 97%, 64% 99.5%, 50% 97%, 37% 100%, 22% 97.5%, 10% 99.5%, 0 97%)" }} /></AbsoluteFill>;
  return <Layer d={1} frame={false} w={W + 1400} h={H + 400} x={x + (W + 1400) / 2} y={H / 2} shadow={0.5} blur={4}
    draw={(g) => { g.fillStyle = PAL.oliveD; g.fillRect(250, 0, W + 900, H + 400); for (let i = 0; i < 9; i++) { fern(g, 260, 120 + i * 260, 360, Math.PI + 0.2, i % 2 ? PAL.olive : PAL.oliveD, 70 + i, { droop: 0.2 }); fern(g, W + 1140, 120 + i * 260, 360, -0.2, i % 2 ? PAL.olive : PAL.oliveD, 90 + i, { droop: 0.2 }); } }} />;
};

// ===================================================================== монтаж
type ShotDef = { t0: number; t1: number; el: React.ReactNode; cam?: [number, number, number, number][]; shake?: (t: number) => number; dim?: (t: number) => number; bg?: string; tr?: Tr; warm?: number };
// ключи камеры [t, x, y, zoom]; смена ракурса — двумя ключами вплотную (склейка внутри шота)
const SHOTS: ShotDef[] = [
  { t0: 0, t1: 6.35, el: <S1 />, dim: () => 0.12, cam: [[0, 0, 160, 1.0], [2.2, 20, 140, 1.04], [2.21, 330, -260, 2.0], [4.3, 340, -250, 2.08], [4.31, -170, 0, 1.45], [5.5, -170, 0, 1.5], [5.8, -170, -40, 1.66], [6.35, -170, -40, 1.68]] },
  { t0: 6.35, t1: 13.8, el: <S2 />, tr: "cut", cam: [[6.35, -60, 1450, 1.6], [7.9, -40, 1420, 1.66], [9.6, 40, 0, 1.0], [9.61, 40, -20, 1.0], [11.9, -40, -40, 1.04], [11.91, -230, -320, 1.5], [12.8, -230, -320, 1.52], [13.1, -240, -340, 1.68], [13.8, -240, -340, 1.7]] },
  { t0: 13.8, t1: 20.1, el: <S3 />, tr: "wipe", cam: [[13.8, 0, 0, 1.42], [15.9, 0, 0, 1.3], [18.4, 0, 0, 1.06], [18.41, -150, -200, 1.2], [20.1, -150, -220, 1.24]] },
  { t0: 20.1, t1: 27.85, el: <S4 />, tr: "cut", cam: [[20.1, 0, 0, 1.0], [22.4, 0, 0, 1.04], [22.41, 90, -290, 1.7], [25.0, 100, -300, 1.8], [25.01, 0, 100, 0.95], [27.85, 0, 80, 1.0]] },
  { t0: 27.85, t1: 33.3, el: <S5 />, tr: "tear", cam: [[27.85, -200, 220, 1.35], [29.8, -220, 230, 1.4], [29.81, -330, 0, 1.0], [31.7, 300, 0, 1.0], [31.71, 0, 40, 0.86], [33.3, 0, 20, 0.9]] },
  { t0: 33.3, t1: 40.95, el: <S6 />, tr: "fern", cam: [[33.3, 160, -80, 1.35], [35.3, 120, -80, 1.4], [35.31, -100, 60, 1.7], [37.9, -110, 60, 1.76], [37.91, 120, -120, 1.25], [39.0, 120, -120, 1.27], [40.95, 0, 0, 1.0]] },
  { t0: 40.95, t1: 48.9, el: <S7 />, tr: "dark", cam: [[40.95, -260, 40, 1.45], [42.9, -250, 40, 1.5], [42.91, -300, 120, 1.15], [45.3, 260, 120, 1.15], [45.31, 120, 80, 1.3], [48.9, 140, 60, 1.36]] },
  { t0: 48.9, t1: 54.35, el: <S8 />, tr: "wipe", cam: [[48.9, -930, 60, 1.25], [50.8, -900, 60, 1.28], [50.81, -650, 0, 1.0], [52.5, 850, 0, 1.0], [52.51, 1150, 60, 1.25], [54.35, 1180, 60, 1.3]] },
  { t0: 54.35, t1: 61.35, el: <S9 />, tr: "cut", cam: [[54.35, 0, 200, 1.25], [56.3, 0, 180, 1.3], [57.2, 0, 0, 1.0], [59.2, 0, -100, 1.06], [59.21, 40, -280, 1.45], [61.35, 40, -300, 1.5]] },
  { t0: 61.35, t1: 63.85, el: <S10 />, tr: "dark", cam: [[61.35, 0, -900, 1.0], [62.55, 0, 0, 1.0], [62.6, 0, 300, 1.0], [63.0, 0, 300, 1.02], [63.85, 20, 260, 1.4]] },
  { t0: 63.85, t1: 68.05, el: <S11 />, tr: "cut", cam: [[63.85, 0, 570, 1.45], [65.2, 0, 590, 1.5], [65.21, 0, 400, 1.0], [66.65, 0, -1400, 1.0], [66.7, 0, 0, 1.0], [68.05, 0, -60, 1.04]] },
  { t0: 68.05, t1: 74.15, el: <S12 />, tr: "tear", cam: [[68.05, 0, -60, 1.0], [68.35, 0, -60, 1.0], [68.6, 0, -40, 1.12], [69.95, 0, -40, 1.14], [69.96, 0, 0, 1.0], [72.0, 0, 20, 1.02], [72.01, 0, 120, 1.12], [74.15, 0, 120, 1.14]] },
  { t0: 74.15, t1: 80.15, el: <S13 />, tr: "dark", cam: [[74.15, 0, 0, 1.0], [77.0, 0, 0, 1.03], [77.01, 0, 0, 1.12], [79.35, 0, 0, 1.15], [79.6, 0, 0, 1.28], [80.15, 0, 0, 1.3]] },
  { t0: 80.15, t1: 87.7, el: <S14 />, tr: "cut", dim: () => 0.15, cam: [[80.15, 0, 200, 1.0], [82.2, 0, 200, 1.03], [82.21, 373, 340, 1.6], [84.3, 373, 335, 1.76], [84.31, 240, 330, 1.45], [86.3, 240, 330, 1.5], [86.6, 250, 320, 1.7], [87.7, 250, 320, 1.74]] },
  { t0: 87.7, t1: 91.4, el: <S15 />, tr: "wipe", cam: [[87.7, 0, -200, 1.03], [91.4, 0, -200, 1.0]], dim: (t) => (t > 89.5 ? 0.25 : 0.1) },
];

// ===================================================================== бирка времени
const TAGS: [number, string][] = [[0, "ДЕНЬ 1 — 11:35"], [40.95, "ДЕНЬ 1 — 19:40"], [61.35, "НОЧЬ — 02:15"], [87.7, "ЧАСТЬ 3 →"]];
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

// ===================================================================== субтитры: бумажные полоски, красное слово (как в Ч1)
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

export const TOTAL = Math.round(SHOTS[SHOTS.length - 1].t1 * FPS);
// ключи камеры ближе 0,06 с (жёсткая смена ракурса) → быстрый мягкий перелёт за 0,35 с
const soften = (k?: [number, number, number, number][]) => k?.map((c, i) => (i + 1 < k.length && k[i + 1][0] - c[0] < 0.06 && (i === 0 || c[0] - 0.35 > k[i - 1][0] + 0.05) ? [c[0] - 0.35, ...c.slice(1)] as [number, number, number, number] : c));
export const Video: React.FC = () => (
  <AbsoluteFill style={{ backgroundColor: "#1a140c" }}>
    {SHOTS.map((s, i) => (
      <Sequence key={i} from={Math.round(s.t0 * FPS)} durationInFrames={Math.round((s.t1 - s.t0) * FPS)}>
        <Shot t0={s.t0} cam={soften(s.cam)} shake={s.shake} dim={s.dim} bg={s.bg}>{s.el}</Shot>
      </Sequence>
    ))}
    {SHOTS.slice(1).map((s, i) => <Transition key={i} at={s.t0} kind={s.tr ?? "cut"} />)}
    <Tag />
    <Captions />
    <Audio src={staticFile("voice.mp3")} />
    <SFX />
  </AbsoluteFill>
);
