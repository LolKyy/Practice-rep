// «Что, если…?» · Меловой период · Часть 3 «Ворон». Шоты по script/voice_full.srt (голос + реплики Ворона).
// Камера спокойная, как в Ч1: один плавный наезд/проезд на шот; активная — только в ударных моментах.
import React from "react";
import { getInputProps, AbsoluteFill, Audio, OffthreadVideo, Sequence, interpolate, spring, staticFile, useCurrentFrame, useVideoConfig } from "remotion";
import "./fonts";
import subs from "./subs.json";
import segs from "./segs.json";
import { SFX } from "./sfx";
import { Layer, Shot, useSec, keys, step, clamp, eo, eio, back, W, H, FPS } from "./stage2d";
import { PAL, G, cut, fillP, strokeP, clipTo, rrectP, ellP, rectP, rng, text, tear, rivet, pencil, tape, fernBush, fern } from "./cut";
import { puppet, Pose, Who, blinkAt, talkAt } from "./puppets";
import { btr, ground } from "./props";
import { NIGHT, nightSky, nightTrees, nightFerns, fog, btrNight, cutawayBack, cutawayFront, radioScreen, can, smell } from "./props2";
import { raptor, raptorTop, btrTop, scratches, photo1986, hatchUp, dawnSky, notebook, RapPose } from "./props3";

const VORON = (segs as [number, number, string, string][]).filter((s) => s[3] === "voron").map(([a, b]) => [a, b] as [number, number]);
const voronOn = (t: number) => VORON.some(([a, b]) => t >= a - 0.3 && t < b + 0.2);

// ===================================================================== общие куски
const Pup: React.FC<{ who: Who; x: number; y: number; sc?: number; d?: number; pose: (t: number) => Pose; flip?: boolean; seed?: number; blur?: number }> =
  ({ who, x, y, sc = 4, d = 1, pose, flip = false, seed = 1, blur = 0 }) => (
    <Layer dyn frame={false} w={Math.round(200 * sc)} h={Math.round(250 * sc)} x={x} y={y - 120 * sc} d={d} scale={sc} shadow={0.4} blur={blur}
      draw={(g, t) => { g.translate(100, 245); if (flip) g.scale(-1, 1); puppet(g, who, pose(t), seed); }} />
  );
const Raptor: React.FC<{ x: number; y: number; sc?: number; d?: number; flip?: boolean; pose: (t: number) => RapPose; blur?: number }> = ({ x, y, sc = 1, d = 1, flip = false, pose, blur = 0 }) => (
  <Layer dyn frame={false} w={Math.round(760 * sc)} h={Math.round(420 * sc)} x={x} y={y - 190 * sc} d={d} scale={sc} shadow={0.45} blur={blur}
    draw={(g, t) => { g.translate(380, 400); if (flip) g.scale(-1, 1); raptor(g, pose(t)); }} />
);
// ночь без светлячков (стая рядом — всё затихло)
const NightBG: React.FC<{ gy?: number; moon?: [number, number, number] | null; dx?: number }> = ({ gy = 1300, moon = [760, 360, 95], dx = 0 }) => (<>
  <Layer d={0.2} dyn w={1600} h={2600} shadow={0} draw={(g, t) => { g.translate(-262, -340); nightSky(g, 1600, 2600, t, moon ? [moon[0] + 262, moon[1] + 340, moon[2]] : (null as any)); }} />
  <Layer d={0.45} w={2400} blur={1} dx={dx * 0.45} shadow={0.3} draw={(g) => { g.translate(-660, 0); nightTrees(g, 2400, gy - 40, 700, 1100, 4, 12); }} />
  <Layer d={0.7} w={2600} dx={dx * 0.7} shadow={0.3} draw={(g) => { g.translate(-760, 0); nightFerns(g, 2600, gy + 20, 260, 9, 9); }} />
  <Layer d={0.85} shadow={0.25} draw={(g) => ground(g, W, gy, H - gy + 300, "#2A2A22", 4)} />
  <Layer d={0.9} dyn shadow={0} draw={(g, t) => fog(g, W, gy - 60, t, 0.16)} />
</>);
const DawnBG: React.FC<{ gy?: number; sun?: [number, number, number] }> = ({ gy = 1300, sun = [700, 700, 120] }) => (<>
  <Layer d={0.2} w={1600} h={2600} shadow={0} draw={(g) => { g.translate(-262, -340); dawnSky(g, 1600, 2600, [sun[0] + 262, sun[1] + 340, sun[2]]); }} />
  <Layer d={0.45} w={2400} blur={1} shadow={0.35} draw={(g) => { g.translate(-660, 0); nightTrees(g, 2400, gy - 40, 600, 1000, 6, 12); g.globalCompositeOperation = "source-atop"; g.fillStyle = "rgba(90,60,50,0.55)"; g.fillRect(0, 0, 2400, H); }} />
  <Layer d={0.7} w={2600} shadow={0.35} draw={(g) => { g.translate(-760, 0); fernRowDawn(g, 2600, gy + 20); }} />
  <Layer d={0.85} shadow={0.25} draw={(g) => ground(g, W, gy, H - gy + 300, "#6E5A3A", 4)} />
</>);
const fernRowDawn = (g: G, w: number, base: number) => { const r = rng(9); for (let i = 0; i < 9; i++) { fernBush(g, (i + 0.2 + r() * 0.6) * (w / 9), base, 260 * (0.8 + r() * 0.4), ["#4E5A2C", "#3F4A25"], 63 + i, 0.9); for (let k = 0; k < 5; k++) fillP(g, ellP((i + r()) * (w / 9), base - 80 - r() * 200, 5, 6, 10), "#EAF4FF", 0.75); } };
// БТР в разрезе (ночь), куклы бодрствуют
type PoseMap = Partial<Record<Who, (t: number) => Pose>>;
const Cutaway: React.FC<{ poses?: PoseMap; radio?: (t: number) => number; lamp?: number; crate?: boolean; shake?: (t: number) => number }> = ({ poses = {}, radio = () => 0, lamp = 0.9, crate = false }) => {
  const def = (w: Who) => poses[w] ?? ((t: number) => ({ expr: "fear" as const, legs: false, blink: blinkAt(t, w.length) }));
  return (<>
    <NightBG gy={1500} moon={[860, 300, 80]} />
    <Layer d={0.98} dyn draw={(g, t) => { g.translate(540, 1560); g.scale(1.38, 1.38); cutawayBack(g, lamp, t); radioScreen(g, 245, -270, 50, 32, t, radio(t)); }} />
    <Pup who="bugaev" x={170} y={1540} sc={2.0} seed={3} pose={def("bugaev")} />
    <Pup who="kotov" x={370} y={1540} sc={2.0} pose={def("kotov")} />
    <Pup who="petrov" x={570} y={1540} sc={2.0} seed={2} pose={def("petrov")} />
    <Pup who="lis" x={780} y={1550} sc={1.95} seed={4} pose={def("lis")} />
    <Layer d={1.02} draw={(g) => { g.translate(540, 1560); g.scale(1.38, 1.38); cutawayFront(g); }} />
    {crate ? <Layer d={1.05} draw={(g) => { g.translate(700, 1540); g.scale(0.9, 0.9); cut(g, rrectP(-110, -100, 220, 100, 6), "#8A6440", { seed: 81 }); text(g, "ТУШЁНКА", 0, -50, 30, "#2A1D12"); }} /> : null}
  </>);
};
const radioLive = (t: number) => (voronOn(t) ? 0.55 + 0.45 * Math.abs(Math.sin(t * 9)) : 0.15);
const canHold = (g: G) => { g.rotate(0.3); g.scale(0.11, 0.11); can(g, 1, 0); };

// ===================================================================== ШОТЫ
// 0 · 0.0–4.5 — «Ранее»: нарезка из Ч1–Ч2 (жёсткие склейки, толчок на каждый кадр)
const RECAP = ["r1.mp4", "r2.mp4", "r3.mp4", "r4.mp4", "r5.mp4"];
const S0: React.FC = () => {
  const f = useCurrentFrame(); const i = Math.min(4, Math.floor(f / 27)); const k = (f - i * 27) / 27;
  return (<AbsoluteFill style={{ overflow: "hidden", backgroundColor: "#000" }}>
    <AbsoluteFill style={{ transform: `scale(${1 + 0.07 * eo(k * 1.6)})`, filter: "saturate(0.7) contrast(0.95) sepia(0.15)" }}>
      <Sequence from={i * 27} durationInFrames={27}><OffthreadVideo src={staticFile(`recap/${RECAP[i]}`)} muted /></Sequence>
    </AbsoluteFill>
    <AbsoluteFill style={{ background: "radial-gradient(ellipse 80% 70% at 50% 45%, rgba(0,0,0,0) 50%, rgba(10,6,2,0.65) 100%)" }} />
  </AbsoluteFill>);
};
// 1 · 4.5–10.1 — банка в руке Петрова («300 Г») → ОТЪЕЗД в разрез: все смотрят на Петрова
const S1: React.FC = () => {
  const sec = useSec();
  return (<>
    <Cutaway poses={{
      petrov: (t) => ({ expr: t < 7.4 ? "calm" : "fear", aR: [1.0, 1.5], holdR: canHold, aL: [0.7, 1.9], legs: false, look: [0, 0.4], blink: blinkAt(t, 2) }),
      kotov: (t) => ({ expr: t < 7.4 ? "stern" : "fear", look: [0.8, 0], legs: false, blink: blinkAt(t, 1) }),
      bugaev: (t) => ({ expr: "stern", look: [0.9, 0], legs: false, blink: blinkAt(t, 3) }),
      lis: (t) => ({ expr: "fear", look: [-0.9, 0], legs: false, blink: blinkAt(t, 4) }) }} />
    {sec < 8.6 ? <Layer d={1.03} dyn draw={(g, t) => { const sw = Math.sin(t * 2) * 0.08; strokeP(g, [[668, 1180], [668 + sw * 40, 1255]], "rgba(243,237,224,0.85)", 2); g.save(); g.translate(668 + sw * 40, 1270); g.rotate(sw); cut(g, rectP(-40, 0, 80, 34), PAL.edge, { seed: 3 }); text(g, "300 Г", 0, 18, 22, PAL.ink, "JetBrains Mono", 700); g.restore(); }} /> : null}
  </>);
};
// 2 · 10.1–18.72 — POV в щель: раптор вплотную → СВЕРХУ: пятеро кружат вокруг БТР
const S2: React.FC = () => {
  const sec = useSec();
  if (sec < 14.0) {
    const sway = Math.sin(sec * 0.8) * 80;
    return (<>
      <Layer d={0.3} dyn w={1600} h={2600} dx={sway * 0.3} shadow={0} draw={(g, t) => { g.translate(-262, -340); nightSky(g, 1600, 2600, t, null as any); }} />
      <Layer d={0.5} w={2400} dx={sway * 0.5} shadow={0.3} draw={(g) => { g.translate(-660, 0); nightTrees(g, 2400, 1180, 500, 800, 14, 12); }} />
      <Raptor x={560} y={1330} sc={1.9} d={0.85} pose={(t) => ({ head: Math.sin(t * 1.3) * 0.12 + (t > 11.4 && t < 11.8 ? 0.25 : 0), jaw: t > 12.2 && t < 12.6 ? 0.25 : 0.04, night: true, leader: true, claw: t > 12.1 ? 1 : 0, seed: 1 })} />
      <Layer d={1.6} shadow={0.6} draw={(g) => { g.fillStyle = "#14140F"; g.beginPath(); g.rect(-400, -400, W + 800, H + 800); const sl = rrectP(60, 760, 960, 420, 40); g.moveTo(sl[0][0], sl[0][1]); sl.forEach((p) => g.lineTo(p[0], p[1])); g.closePath(); g.fill("evenodd");
        for (let x = -200; x < W + 200; x += 70) { rivet(g, x, 700, 7); rivet(g, x, 1240, 7); } strokeP(g, rrectP(60, 760, 960, 420, 40), "#2E2C20", 10, true); }} />
    </>);
  }
  return (<>
    <Layer d={0.6} shadow={0} draw={(g) => { g.fillStyle = "#1E2418"; g.fillRect(-300, -300, W + 600, H + 600); const r = rng(4); for (let i = 0; i < 40; i++) fernBush(g, r() * W, r() * H + 100, 180, [NIGHT.sil, "#1E2618"], i + 3, 1.6); }} />
    <Layer d={0.9} dyn shadow={0} draw={(g, t) => fog(g, W, 900, t, 0.1)} />
    <Layer d={1} draw={(g) => { g.translate(540, 900); g.scale(0.85, 0.85); btrTop(g, true); }} />
    <Layer d={1.02} dyn draw={(g, t) => {
      for (let i = 0; i < 5; i++) { const a = t * 0.22 + (i / 5) * Math.PI * 2; const R = 470 + Math.sin(t + i) * 30; const x = 540 + Math.cos(a) * R * 0.9, y = 900 + Math.sin(a) * R * 1.25;
        const tang = a + Math.PI / 2; const toC = Math.atan2(900 - y, 540 - x); const turn = clamp((t - 17.7 - i * 0.12) * 4);
        g.save(); g.translate(x, y); g.rotate(tang); g.scale(0.72, 0.72); raptorTop(g, (((toC - tang + Math.PI * 3) % (Math.PI * 2)) - Math.PI) * turn, i + 1, i === 0, t); g.restore(); }
    }} />
  </>);
};
// 3 · 18.72–25.8 — УДАР (внутри, ТРЯСКА) → снаружи: когти по броне, раптор прыгает на крышу к вентиляции
const S3: React.FC = () => {
  const sec = useSec();
  if (sec < 19.75) return <Cutaway lamp={0.9} poses={{ kotov: (t) => ({ expr: "shock", legs: false, bonk: t > 18.8 && t < 19.1 ? 1 : 0 }), petrov: (t) => ({ expr: "shock", legs: false, aR: [1.0, 1.5], holdR: canHold }), bugaev: () => ({ expr: "resolve", legs: false }), lis: () => ({ expr: "shock", legs: false }) }} />;
  const jump = keys(sec, [[21.6, 0], [22.4, 1]], (x) => x);
  const jx = 250 + jump * 410, jy = 1610 - (jump * 300 + Math.sin(jump * Math.PI) * 260);
  return (<>
    <NightBG gy={1500} moon={[260, 330, 90]} />
    <Layer d={1} dyn draw={(g, t) => { g.translate(540, 1620); g.scale(1.35, 1.35); btrNight(g); }} />
    <Layer d={1.01} dyn draw={(g, t) => { const n = Math.floor(clamp((t - 19.8) / 1.3) * 5 + 0.001); g.save(); g.translate(250, 1260); g.scale(0.8, 0.8); scratches(g, 0, 0, n); g.restore();
      if (t > 23.3) smell(g, t, 790, 1180, 720, 1020, 3, "rgba(243,225,190,0.55)", 5); }} />
    <Raptor x={jx} y={jy} sc={1.05} d={1.03} pose={(t) => ({ run: t < 21.6 ? 0 : t < 22.4 ? 1.2 : 0, crouch: t > 22.4 ? 0.35 : 0, head: t > 23.2 ? -0.45 + Math.sin(t * 6) * 0.06 : 0, claw: t > 19.8 && t < 21.2 ? 1 : 0, arm: t > 19.8 && t < 21.2 ? Math.abs(Math.sin(t * 7)) : 0, night: true, seed: 2 })} />
  </>);
};
// 4 · 25.8–31.32 — Петров «курицы» (ухмылка) → люк снизу: коготь бьёт в люк (ТОЛЧОК)
const S4: React.FC = () => {
  const sec = useSec();
  if (sec < 28.95) return (<>
    <Layer d={0.6} blur={5} shadow={0} draw={(g) => { g.fillStyle = "#3E3A26"; g.fillRect(-200, -200, W + 400, H + 400); const gl = g.createRadialGradient(540, 300, 10, 540, 300, 900); gl.addColorStop(0, "rgba(255,190,90,0.45)"); gl.addColorStop(1, "rgba(255,190,90,0)"); g.fillStyle = gl; g.fillRect(-200, -200, W + 400, H + 400); }} />
    <Pup who="petrov" x={540} y={2200} sc={8.0} seed={2} pose={(t) => ({ expr: "smirk", talk: talkAt(t, [[27.3, 28.6]]), aR: [0.3, 1.6], aL: [0.2, 0.3], legs: false, look: [-0.4, 0], blink: blinkAt(t, 2), tilt: 0.06 })} />
  </>);
  const hit = sec > 29.55 ? Math.exp(-(sec - 29.55) * 7) : 0;
  return (<>
    <Layer d={1} dyn shadow={0.4} draw={(g, t) => { hatchUp(g, W, H, (gg) => { nightSky(gg, W, H, t, [700, 420, 70]); }, 1);
      g.save(); g.translate(560, 806 - hit * 30); g.rotate(0.3); g.scale(1.6, 1.6); cut(g, [[0, 0], [30, -60], [80, -90], [52, -50], [18, 6]], "#F3EDE0", { seed: 3, edge: 0.8 }); g.restore();
      const r = rng(Math.floor(t * 10)); if (t > 29.6) for (let i = 0; i < 30; i++) { const k = (t - 29.6) * 1.5; fillP(g, ellP(380 + r() * 340, 820 + r() * 200 + k * 700 * (0.5 + r()), 3, 3, 6), "#B9A880", Math.max(0, 1 - k)); } }} />
  </>);
};
// 5 · 31.32–43.1 — РАЗРЕЗ: рация оживает, все поворачиваются; НАЕЗД на рацию на «Говорит Ворон»
const S5: React.FC = () => <Cutaway lamp={0.35} radio={(t) => (t < 31.5 ? 0 : radioLive(t))} poses={{
  lis: (t) => ({ expr: t < 31.7 ? "fear" : "realize", look: [0.8, -0.3], legs: false, blink: blinkAt(t, 4) }),
  kotov: (t) => ({ expr: t < 35.9 ? "fear" : "curious", look: [t > 31.8 ? 1 : 0, -0.3], legs: false, blink: blinkAt(t, 1) }),
  petrov: (t) => ({ expr: "fear", look: [t > 32.0 ? 1 : 0, -0.3], legs: false, aR: [1.0, 1.5], holdR: canHold, blink: blinkAt(t, 2) }),
  bugaev: (t) => ({ expr: "stern", look: [t > 32.2 ? 1 : 0, -0.3], legs: false, blink: blinkAt(t, 3) }) }} />;
// 6 · 43.1–51.1 — Лисицын шепчет в гарнитуру → ПРОЕЗД по лицам к ящику тушёнки
const S6: React.FC = () => {
  const sec = useSec();
  if (sec < 46.4) return (<>
    <Layer d={0.6} blur={6} shadow={0} draw={(g) => { g.fillStyle = "#2E2C1C"; g.fillRect(-200, -200, W + 400, H + 400); const gl = g.createRadialGradient(900, 500, 10, 900, 500, 700); gl.addColorStop(0, "rgba(61,220,132,0.35)"); gl.addColorStop(1, "rgba(61,220,132,0)"); g.fillStyle = gl; g.fillRect(-200, -200, W + 400, H + 400); }} />
    <Pup who="lis" x={480} y={2150} sc={7.6} seed={4} pose={(t) => ({ expr: "whisper", talk: talkAt(t, [[44.6, 46.0]]), aR: [0.9, 2.2], aL: [0.2, 0.3], legs: false, look: [0.5, 0], blink: blinkAt(t, 4) })} />
  </>);
  return <Cutaway lamp={0.35} crate radio={radioLive} poses={{
    kotov: (t) => ({ expr: "curious", look: [0.8, 0.6], legs: false, blink: blinkAt(t, 1) }), petrov: (t) => ({ expr: "fear", look: [0.8, 0.6], legs: false, blink: blinkAt(t, 2) }),
    bugaev: (t) => ({ expr: "stern", look: [0.8, 0.6], legs: false, blink: blinkAt(t, 3) }), lis: (t) => ({ expr: "curious", look: [-0.6, 0.6], legs: false, blink: blinkAt(t, 4) }) }} />;
};
// 7 · 51.1–59.1 — карточка «ПРАВИЛА ЛАГЕРЯ» поверх салона, пункт 3 подчёркивается красным
const S7: React.FC = () => {
  const sec = useSec();
  const card = keys(sec, [[51.2, 900], [51.7, 0]], back);
  const ul = keys(sec, [[53.6, 0], [54.6, 1]], eo);
  return (<>
    <Layer d={0.6} blur={6} shadow={0} draw={(g) => { g.fillStyle = "#3E3A26"; g.fillRect(-200, -200, W + 400, H + 400); const gl = g.createRadialGradient(540, 400, 10, 540, 400, 900); gl.addColorStop(0, "rgba(255,190,90,0.4)"); gl.addColorStop(1, "rgba(255,190,90,0)"); g.fillStyle = gl; g.fillRect(-200, -200, W + 400, H + 400); }} />
    <AbsoluteFill>
      <div style={{ position: "absolute", left: 130 + card, top: 520, width: 820, background: PAL.paper, padding: "26px 34px", boxShadow: "10px 14px 18px rgba(20,12,4,0.5)", transform: "rotate(-1deg)" }}>
        <div style={{ fontFamily: "Montserrat", fontWeight: 900, fontSize: 56, color: PAL.ink, marginBottom: 14 }}>ПРАВИЛА ЛАГЕРЯ</div>
        {["1. НОЧУЕМ В БТР", "2. ЛЮКИ ЗАДРАЕНЫ", "3. ЕДА — ПОДАЛЬШЕ"].map((s, i) => <div key={s} style={{ fontFamily: "JetBrains Mono", fontWeight: 700, fontSize: 42, color: i === 2 ? PAL.scarf : PAL.ink, padding: "8px 0", borderTop: "2px solid rgba(70,110,170,0.3)", position: "relative" }}>{s}
          {i === 2 ? <div style={{ position: "absolute", left: 0, bottom: 2, height: 7, width: `${ul * 92}%`, background: PAL.scarf, borderRadius: 4, transform: "rotate(-0.6deg)" }} /> : null}</div>)}
      </div>
    </AbsoluteFill>
  </>);
};
// 8 · 59.1–65.5 — POV: люк приоткрыт на ладонь → СВЕРХУ: пять банок летят дугой в папоротники
const CANS = [61.7, 62.4, 63.1, 63.8, 64.5];
const S8: React.FC = () => {
  const sec = useSec();
  if (sec < 61.45) { const op = keys(sec, [[59.4, 0], [60.6, 1]], eo);
    return (<>
      <Layer d={0.6} dyn shadow={0} draw={(g, t) => { nightSky(g, W, H, t, [640, 700, 80]); }} />
      <Layer d={1} dyn shadow={0.5} draw={(g) => { g.fillStyle = "#1A180F"; g.fillRect(-200, -200, W + 400, H + 400 - 0); g.clearRect(-200, 820 - op * 120, W + 400, op * 240);
        cut(g, rectP(-200, 700 - op * 120, W + 400, 120), "#3E3A26", { seed: 4 }); cut(g, rectP(-200, 940 + op * 120, W + 400, 120), "#3E3A26", { seed: 5 }); for (let x = 0; x < W; x += 80) { rivet(g, x, 760 - op * 120, 7); rivet(g, x, 1000 + op * 120, 7); } }} />
      <Pup who="kotov" x={300} y={2650} sc={6} pose={() => ({ expr: "resolve", aR: [2.6, 0.4], legs: false })} />
    </>); }
  return (<>
    <Layer d={0.6} shadow={0} draw={(g) => { g.fillStyle = "#1E2418"; g.fillRect(-300, -300, W + 600, H + 600); const r = rng(4); for (let i = 0; i < 40; i++) fernBush(g, r() * W, r() * H + 100, 180, [NIGHT.sil, "#1E2618"], i + 3, 1.6); }} />
    <Layer d={1} draw={(g) => { g.translate(540, 1300); g.scale(0.85, 0.85); btrTop(g, true); }} />
    <Layer d={1.03} dyn draw={(g, t) => { CANS.forEach((c, i) => { const k = clamp((t - c) / 0.7); if (k <= 0) return; const ex = 140 + i * 200, ey = 260 + (i % 2) * 120;
      const x = 540 + (ex - 540) * k, y = 1300 + (ey - 1300) * k - Math.sin(k * Math.PI) * 220;
      for (let s = 0; s < k; s += 0.06) { const xx = 540 + (ex - 540) * s, yy = 1300 + (ey - 1300) * s - Math.sin(s * Math.PI) * 220; fillP(g, ellP(xx, yy, 5, 5, 6), "rgba(243,237,224,0.75)"); }
      g.save(); g.translate(x, y); g.rotate(t * 6 + i); g.scale(0.3, 0.3); can(g, 0, 0); g.restore(); if (k >= 1) strokeP(g, ellP(ex, ey, 30 + (t - c - 0.7) * 30, 14 + (t - c - 0.7) * 12, 20), `rgba(243,237,224,${Math.max(0, 0.6 - (t - c - 0.7))})`, 3, true); }); }} />
  </>);
};
// 9 · 65.5–71.9 — стук… тишина… визг: стая срывается к папоротникам; ПРОЕЗД вслед, СКВОЗЬ СЛОЙ, перья летят
const S9: React.FC = () => {
  const sec = useSec();
  const run = clamp((sec - 67.8) / 2.5);
  const pan = keys(sec, [[67.6, 0], [71.9, -700]], eio);
  return (<>
    <NightBG gy={1400} moon={[800, 330, 85]} dx={pan} />
    <Layer d={0.75} w={2400} dyn dx={pan * 0.75} draw={(g, t) => { g.translate(-660, 0); if (t < 68.3) return; const r = rng(Math.floor(t * 8)); for (let i = 0; i < 4; i++) { g.save(); g.translate(250 + i * 70 + Math.sin(t * 9 + i) * 30, 1360); g.scale(i % 2 ? -0.55 : 0.55, 0.55); raptor(g, { run: t * 14 + i, night: true, jaw: 0.2, seed: i + 1 }); g.restore(); }
      for (let i = 0; i < 12; i++) { const fx = 200 + r() * 500, fy = 1050 + r() * 300; g.save(); g.translate(fx, fy); g.rotate(r() * 6); cut(g, [[0, 0], [24, -6], [44, 0], [24, 6]], r() > 0.5 ? "#9A5A2E" : "#4A3424", { seed: i, edge: 0.4, thick: false }); g.restore(); } }} />
    {[0, 1, 2].map((i) => <Raptor key={i} x={420 + i * 230 - run * (900 + i * 150)} y={1470 + i * 25} sc={0.7} d={0.95} flip pose={(t) => ({ run: t > 67.8 ? t * 14 + i : 0, head: t < 66.7 ? Math.sin(t * 2 + i) * 0.2 : t < 67.8 ? -0.3 : 0.1, night: true, leader: i === 0, seed: i + 3 })} />)}
    <Layer d={1.5} w={3600} dx={pan * 1.4 + 1100} blur={8} draw={(g) => { g.translate(-1260, 0); nightFerns(g, 3600, 2050, 520, 21, 6); }} />
  </>);
};
// 10 · 71.9–77.5 — рука Бугаева, Петров кладёт последнюю банку
const S10: React.FC = () => {
  const sec = useSec();
  const drop = keys(sec, [[74.8, -420], [75.8, 0]], eo);
  return (<>
    <Layer d={0.6} blur={6} shadow={0} draw={(g) => { g.fillStyle = "#3E3A26"; g.fillRect(-200, -200, W + 400, H + 400); const gl = g.createRadialGradient(540, 300, 10, 540, 300, 900); gl.addColorStop(0, "rgba(255,190,90,0.45)"); gl.addColorStop(1, "rgba(255,190,90,0)"); g.fillStyle = gl; g.fillRect(-200, -200, W + 400, H + 400); }} />
    <Layer d={1} draw={(g) => { g.translate(560, 1020); cut(g, rrectP(-240, 60, 480, 160, 50), PAL.olive, { seed: 8 }); cut(g, rrectP(-160, -90, 320, 200, 80), "#D8AE88", { seed: 7 }); for (let i = 0; i < 4; i++) cut(g, rrectP(-150 + i * 72, -170, 62, 120, 30), "#D8AE88", { seed: 9 + i, edge: 0.8 }); cut(g, rrectP(140, -50, 120, 56, 28), "#D8AE88", { seed: 14 }); }} />
    <Layer d={1.05} dyn draw={(g, t) => { g.translate(560, 900 + drop); g.scale(0.85, 0.85); can(g, 1, 0); if (t < 75.9) { g.translate(60, -300); cut(g, rrectP(-60, -200, 160, 230, 70), "#EBC7A0", { seed: 21 }); } }} />
  </>);
};
// 11 · 77.5–83.05 — рассвет: ПАНОРАМА ВНИЗ с солнца на БТР → НАЕЗД на пять царапин
const S11: React.FC = () => (<>
  <DawnBG gy={1350} sun={[700, 260, 110]} />
  <Layer d={1} draw={(g) => { g.translate(540, 1520); g.scale(1.3, 1.3); btr(g, {}); }} />
  <Layer d={1.01} dyn draw={(g, t) => { const lit = Math.floor(clamp((t - 79.9) / 1.4) * 5 + 0.001); g.translate(270, 1290); g.scale(0.7, 0.7); scratches(g, 0, 0, 5, 0); g.globalAlpha = 1; for (let i = 0; i < lit; i++) { g.save(); g.globalAlpha = 0.6; strokeP(g, [[i * 46 + 6, 0], [i * 46 + 112, 194]], "rgba(255,226,170,0.9)", 10); g.restore(); } }} />
  <Layer d={1.4} blur={6} draw={(g) => { fernBush(g, 60, 1980, 420, ["#4E5A2C", "#3F4A25"], 2, 0.8); fernBush(g, 1040, 2010, 460, ["#3F4A25", "#4E5A2C"], 7, 0.8); }} />
</>);
// 12 · 83.05–92.6 — блокнот Сёмы: стрелка «12 КМ» на север, скала с белой полосой, «ВОРОН?»
const S12: React.FC = () => (<>
  <Layer d={0.5} shadow={0} draw={(g) => { g.fillStyle = "#6E5238"; g.fillRect(-300, -300, W + 600, H + 600); const gl = g.createRadialGradient(300, 200, 10, 300, 200, 1200); gl.addColorStop(0, "rgba(255,210,150,0.35)"); gl.addColorStop(1, "rgba(255,210,150,0)"); g.fillStyle = gl; g.fillRect(-300, -300, W + 600, H + 600); }} />
  <Layer d={1} rot={-0.02} dyn draw={(g, t) => notebook(g, { arrow: keys(t, [[87.6, 0], [89.4, 1]], (x) => x), rock: keys(t, [[89.6, 0], [91.2, 1]], (x) => x), label: clamp((t - 91.7) * 3) })} />
  <Layer d={1.1} dyn draw={(g, t) => { const ar = keys(t, [[87.6, 0], [89.4, 1]], (x) => x), rk = keys(t, [[89.6, 0], [91.2, 1]], (x) => x);
    const p: [number, number] = t < 89.5 ? [540 - Math.sin(ar * 7) * 10, 1000 - ar * 480] : t < 91.3 ? [420 + rk * 250, 500 - Math.sin(rk * Math.PI) * 140] : [700, 470];
    g.save(); g.translate(p[0], p[1]); g.rotate(0.5); cut(g, [[0, 0], [10, -24], [26, -270], [-6, -270], [-10, -24]], PAL.mustard, { seed: 4, edge: 0.8 }); fillP(g, [[0, 0], [8, -22], [-8, -22]], "#E8D2A8"); fillP(g, ellP(0, -1, 2.5, 3, 8), "#333"); cut(g, rectP(-6, -290, 32, 26), "#E07A9A", { seed: 5, edge: 0.6 }); g.restore(); }} />
</>);
// 13 · 92.6–100.22 — Лисицын «Вы кто?» → СКВОЗЬ СЛОЙ во вставку-фото экспедиции 1986
const S13: React.FC = () => {
  const sec = useSec();
  const through = keys(sec, [[95.0, 0], [95.7, 1]], eio);
  return (<>
    <Layer d={0.5} shadow={0} draw={(g) => { g.fillStyle = "#4A3E2C"; g.fillRect(-300, -300, W + 600, H + 600); }} />
    <Layer d={1} dyn draw={(g, t) => { g.translate(540, 900); g.rotate(-0.04); g.scale(1.45, 1.45); photo1986(g, clamp((t - 96) / 4)); }} />
    {through < 1 ? (<>
      <Layer d={1.3} dyn dx={-through * 1500} shadow={0.5} draw={(g) => { g.fillStyle = "#2E2C1C"; g.fillRect(-300, -300, W + 600, H + 600); const gl = g.createRadialGradient(900, 500, 10, 900, 500, 700); gl.addColorStop(0, "rgba(61,220,132,0.3)"); gl.addColorStop(1, "rgba(61,220,132,0)"); g.fillStyle = gl; g.fillRect(-300, -300, W + 600, H + 600); }} />
      <Pup who="lis" x={480 - through * 1500 * 1.3} y={2150} sc={7.6} d={1.3} seed={4} pose={(t) => ({ expr: t < 94.2 ? "curious" : "fear", talk: talkAt(t, [[94.1, 94.75]]), aR: [0.9, 2.2], aL: [0.2, 0.3], legs: false, look: [0.5, 0], blink: blinkAt(t, 4) })} />
    </>) : null}
  </>);
};
// 14 · 100.22–106.0 — РАЗРЕЗ: все замерли; на рации «1986 → 2026»; очень медленный НАЕЗД
const S14: React.FC = () => {
  const sec = useSec();
  return (<>
    <Cutaway lamp={0.25} radio={radioLive} poses={{
      lis: (t) => ({ expr: t < 101.9 ? "whisper" : "fear", talk: talkAt(t, [[100.28, 101.88]]), look: [0.8, -0.3], legs: false }),
      kotov: () => ({ expr: "realize", look: [1, -0.3], legs: false }), petrov: () => ({ expr: "fear", look: [1, -0.3], legs: false }), bugaev: () => ({ expr: "stern", look: [1, -0.3], legs: false }) }} />
    <AbsoluteFill><div style={{ position: "absolute", left: 600, top: 620, fontFamily: "JetBrains Mono", fontWeight: 700, fontSize: 52, color: "#5CF09A", background: "rgba(10,30,18,0.92)", padding: "10px 22px", border: "3px solid #2E3324",
      boxShadow: "0 0 30px rgba(61,220,132,0.35)", opacity: clamp((sec - 101.0) * 3) }}>1986 → 2026</div></AbsoluteFill>
  </>);
};
// 15 · 106.0–110.6 — POV снизу через люк: утреннее небо, облака плывут
const S15: React.FC = () => (<Layer d={1} dyn shadow={0.4} draw={(g, t) => hatchUp(g, W, H, (gg) => { dawnSky(gg, W, H, [W * 0.7, 700, 90]); for (let i = 0; i < 3; i++) { const x = ((t * 40 + i * 400) % 1600) - 300; cut(gg, tear([[x, 500 + i * 130], [x + 300, 490 + i * 130], [x + 320, 560 + i * 130], [x - 10, 570 + i * 130]], 6, 16, i + 2), "#FBE6D2", { seed: i, edge: 0.8 }); } }, 1, 380)} />);
// 16 · 110.6–115.5 — отряд на броне смотрит на север; ОТЪЕЗД 20 %; «ЧАСТЬ 4 →»
const S16: React.FC = () => (<>
  <DawnBG gy={1380} sun={[860, 520, 100]} />
  {(["lis", "kotov", "bugaev", "petrov"] as Who[]).map((w, i) => (
    <Pup key={w} who={w} x={250 + i * 190} y={1610} sc={2.3} seed={i + 1} pose={(t) => ({ expr: w === "kotov" ? (t < 112.0 ? "curious" : "resolve") : "calm", look: [t > 111.2 + i * 0.15 ? 0.9 : 0, -0.6], tilt: t > 111.2 + i * 0.15 ? -0.08 : 0, legs: false, blink: blinkAt(t, i + 1) })} />))}
  <Layer d={1} draw={(g) => { g.translate(540, 1800); g.scale(1.5, 1.5); btr(g, { noTurret: true }); }} />
  <Layer d={1.01} draw={(g) => { g.translate(250, 1500); g.scale(0.6, 0.6); scratches(g, 0, 0, 5); }} />
</>);

// ===================================================================== переходы
type Tr = "cut" | "dark" | "fern";
const Transition: React.FC<{ at: number; kind: Tr }> = ({ at, kind }) => {
  const t = useCurrentFrame() / FPS; const HALF = kind === "dark" ? 0.4 : 0.5; const k0 = (t - at) / HALF;
  if (kind === "cut" || k0 < -1 || k0 > 1) return null;
  const k = eio((k0 + 1) / 2) * 2 - 1;
  if (kind === "dark") return <AbsoluteFill style={{ backgroundColor: "#06070A", opacity: 1 - Math.abs(k) }} />;
  const x = interpolate(k, [-1, 1], [W + 200, -W - 1400]);
  return <Layer d={1} frame={false} w={W + 1400} h={H + 400} x={x + (W + 1400) / 2} y={H / 2} shadow={0.5} blur={4}
    draw={(g) => { g.fillStyle = NIGHT.sil; g.fillRect(250, 0, W + 900, H + 400); for (let i = 0; i < 9; i++) { fern(g, 260, 120 + i * 260, 360, Math.PI + 0.2, i % 2 ? "#1E2618" : NIGHT.sil, 70 + i, { droop: 0.2 }); fern(g, W + 1140, 120 + i * 260, 360, -0.2, i % 2 ? "#1E2618" : NIGHT.sil, 90 + i, { droop: 0.2 }); } }} />;
};

// ===================================================================== монтаж
type ShotDef = { t0: number; t1: number; el: React.ReactNode; cam?: [number, number, number, number][]; shake?: (t: number) => number; dim?: (t: number) => number; tr?: Tr; raw?: boolean };
const hitShake = (hits: number[], amp: number) => (t: number) => hits.reduce((a, h) => a + (t >= h ? Math.exp(-(t - h) * 7) : 0), 0) * amp;
const SHOTS: ShotDef[] = [
  { t0: 0, t1: 4.5, el: <S0 />, raw: true },
  { t0: 4.5, t1: 10.1, el: <S1 />, tr: "dark", cam: [[4.5, 150, 300, 2.0], [6.6, 140, 300, 2.0], [9.0, 0, 120, 1.0], [10.1, 0, 120, 1.02]] },
  { t0: 10.1, t1: 18.72, el: <S2 />, tr: "cut", cam: [[10.1, 0, 0, 1.0], [13.95, 0, 0, 1.05], [14.0, 0, 0, 1.15], [18.72, 0, 0, 1.0]] },
  { t0: 18.72, t1: 25.8, el: <S3 />, tr: "cut", shake: hitShake([18.8, 21.9], 14), cam: [[18.72, 0, 120, 1.0], [19.74, 0, 120, 1.02], [19.75, 0, 160, 1.05], [21.5, 0, 160, 1.05], [23.2, 120, -100, 1.25], [25.8, 130, -110, 1.28]] },
  { t0: 25.8, t1: 31.32, el: <S4 />, tr: "cut", shake: hitShake([29.55], 12), cam: [[25.8, 0, 0, 1.0], [28.9, 0, -20, 1.05], [28.95, 0, 0, 1.0], [29.5, 0, 0, 1.0], [29.8, 0, -60, 1.12], [31.32, 0, -60, 1.13]] },
  { t0: 31.32, t1: 43.1, el: <S5 />, tr: "cut", dim: () => 0.1, cam: [[31.32, 0, 200, 1.0], [35.8, 0, 200, 1.0], [43.1, 330, 320, 1.4]] },
  { t0: 43.1, t1: 51.1, el: <S6 />, tr: "cut", cam: [[43.1, 0, -40, 1.0], [46.35, 0, -60, 1.05], [46.4, -200, 200, 1.25], [51.1, 140, 260, 1.3]] },
  { t0: 51.1, t1: 59.1, el: <S7 />, tr: "cut", cam: [[51.1, 0, 0, 1.0], [53.4, 0, 0, 1.0], [55.0, 0, 120, 1.12], [59.1, 0, 120, 1.14]] },
  { t0: 59.1, t1: 65.5, el: <S8 />, tr: "cut", cam: [[59.1, 0, 0, 1.0], [61.4, 0, 0, 1.06], [61.45, 0, 0, 1.0], [65.5, 0, -150, 1.08]] },
  { t0: 65.5, t1: 71.9, el: <S9 />, tr: "cut", cam: [[65.5, 0, 0, 1.06], [67.7, 0, 0, 1.06], [71.9, 0, 0, 1.0]] },
  { t0: 71.9, t1: 77.5, el: <S10 />, tr: "fern", cam: [[71.9, 0, 0, 1.0], [77.5, 0, 0, 1.08]] },
  { t0: 77.5, t1: 83.05, el: <S11 />, tr: "dark", cam: [[77.5, 0, -900, 1.0], [79.5, 0, 0, 1.0], [83.05, -150, 350, 1.4]] },
  { t0: 83.05, t1: 92.6, el: <S12 />, tr: "cut", cam: [[83.05, 0, 0, 1.0], [87.4, 0, 0, 1.02], [92.6, 60, -420, 1.3]] },
  { t0: 92.6, t1: 100.22, el: <S13 />, tr: "cut", cam: [[92.6, 0, 0, 1.0], [95.0, 0, 0, 1.04], [95.7, 0, 0, 1.0], [100.22, 0, 0, 1.08]] },
  { t0: 100.22, t1: 106.0, el: <S14 />, tr: "cut", dim: () => 0.1, cam: [[100.22, 0, 120, 1.0], [106.0, 140, 120, 1.12]] },
  { t0: 106.0, t1: 110.6, el: <S15 />, tr: "cut", cam: [[106.0, 0, 0, 1.0], [110.6, 0, 0, 1.05]] },
  { t0: 110.6, t1: 115.6, el: <S16 />, tr: "cut", cam: [[110.6, 60, 120, 1.3], [115.6, 0, 0, 1.0]] },
];

// ===================================================================== бирка времени
const TAGS: [number, string][] = [[0, "РАНЕЕ"], [4.5, "НОЧЬ — 02:16"], [77.5, "ДЕНЬ 2 — 05:50"], [110.6, "ЧАСТЬ 4 →"]];
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

// ===================================================================== субтитры (как в Ч1–Ч2)
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
        {s.raw ? s.el : <Shot t0={s.t0} cam={s.cam} shake={s.shake} dim={s.dim}>{s.el}</Shot>}
      </Sequence>
    ))}
    {SHOTS.slice(1).map((s, i) => <Transition key={i} at={s.t0} kind={s.tr ?? "cut"} />)}
    {CLEAN ? null : <Tag />}
    {CLEAN ? null : <Captions />}
    <Audio src={staticFile("voice.wav")} />
    <SFX />
  </AbsoluteFill>
);
