// РАСКАДРОВКА «Тетрис»: реальная история в стиле «Титаника» — крупные планы, тёплый/холодный свет, облачка мыслей, мел на доске.
import React from "react";
import words from "./words.json";
import { setData, wt, ps, TOTAL, AD_T } from "./timeline.js";
setData(words);
import { Scene3D, orbit, dolly, Doodle, Actor, Box, Sign, Screen, Room, crowd, armsUp, pointKeys, HIP, HEAD_Z, CamKey, V3, fitText, useSec, clamp } from "../../shared/remotion/kit";
import { QuestionCard, Confetti, drawBg, drawStamp, rr, PINK, CYAN, YEL, RED, INK } from "../../shared/remotion/sets";
import { PaperSet } from "../../shared/remotion/sets2";
import { VC1984, termDraw, ThoughtCloud, Motes, Sparks, Snow } from "../../shared/remotion/sets5";
import { SovietStreet, SubwayCar, Ministry, ExpoHall, GameShop, ChalkWall, GameBoy, Diskette, GiftBox, Bills, colorTetrisDraw, counterDraw, yearFlipDraw, chalk, chalkText, chalkArrow, block, piece, TET } from "../../shared/remotion/sets6";
import type { Look } from "../../shared/remotion/doodle";

export type Shot = { t0: number; t1: number; el: React.ReactNode; tr?: "fade" | "cut" | "flash" };

// ---------------------------------------------------------------- персонажи (v5: узоры, шапки, жирный контур)
const AP: Look = { body: "#7a4a6a", hair: "slick", glasses: true, mustache: true, pattern: "check", patCol: "#e8c890", scarf: "#c83a2a", ink: 1.25 };
const AP_OLD: Look = { ...AP, hairCol: "#9a968e" };
const COL1: Look = { body: "#3a5a8a", hair: "bald", hairCol: "#3a2a1a", pattern: "stripes", patCol: "#d8e0f0", hat: "ushanka", hatCol: "#6a5040", ink: 1.25 };
const COL2: Look = { body: "#4a7a5a", hair: "bun", glasses: true, pattern: "dots", patCol: "#f4f0e0", ink: 1.25 };
const COL3: Look = { body: "#8a6a3a", hair: "bald", hairCol: "#2a1a10", mustache: true, hat: "flatcap", hatCol: "#5a6a7a", ink: 1.25 };
const VADIM: Look = { body: "#2f4f9a", hair: "bowl", outfit: "jacket", accent: "#f4f4f4", ink: 1.25 };
const OFFICIAL: Look = { body: "#5a5a62", hair: "bald", hairCol: "#3a3a3a", glasses: true, tie: "#2a3a6a", ink: 1.25 };
const STEIN: Look = { body: "#3a3a4a", hair: "slick", hairCol: "#8a6a4a", tie: RED, hat: "beret", hatCol: "#2a2a32", scarf: "#d8c8a0", ink: 1.25 };
const ROGERS: Look = { body: "#2a4a7a", hair: "slick", glasses: true, hat: "flatcap", hatCol: "#6a5a4a", scarf: "#e64b4b", ink: 1.25 };
const MAXWELL: Look = { body: "#4a2a2a", hair: "bald", hairCol: "#5a4a3a", tie: YEL, hat: "beanie", hatCol: "#2a3a5a", patCol: "#e8e0d0", ink: 1.25 };
const ap = (pos: V3, expr: [number, string][], extra: Partial<Actor> = {}, look: Look = AP): Actor => ({ pos, seed: 3, look, expr, scale: 1.18, ...extra });
const who = (look: Look, seed: number, pos: V3, expr: [number, string][], extra: Partial<Actor> = {}): Actor => ({ pos, seed, look, expr, scale: 1.12, ...extra });

// ---------------------------------------------------------------- времена
const W = (p: number, s: string, o = 0) => wt(p, s, o);
const t = {
  p1a: W(1, "а"),
  p2vc: W(2, "вычислительный"), p2young: W(2, "молодой"), p2graph: W(2, "графики"), p2br: W(2, "скобки"),
  p3five: W(3, "пять"), p3but: W(3, "но"), p3four: W(3, "четыре"), p3fig: W(3, "фигуры"), p3gone: W(3, "исчезают"),
  p4show: W(4, "показывает"), p4copy: W(4, "копируют"), p4carry: W(4, "носят"),
  p5ibm: W(5, "ай-би-эм"), p5color: W(5, "цветной"),
  p6hun: W(6, "венгрии"), p6eng: W(6, "англии"), p6usa: W(6, "америке"), p6before: W(6, "ещё"),
  p7state: W(7, "государству"), p7nothing: W(7, "ничего"), p7give: W(7, "в"), p7comp: W(7, "компьютер"),
  p8three: W(8, "три"), p8day: W(8, "день"), p8same: W(8, "одно"),
  p9box: W(9, "игру"), p9mario: W(9, "вместо"),
  p10count: W(10, "больше"), p10world: W(10, "мир"),
  p11kop: W(11, "копейки"),
  p12back: W(12, "возвращает"), p12earn: W(12, "наконец"),
  p13name: W(13, "алексей"), p13game: W(13, "игру") - 0.12, p13tet: W(13, "тетрис"),
  p14row: W(14, "каждый"), p14wait: W(14, "свою"), p14twelve: W(14, "двенадцать"),
};
const P = [0, ...Array.from({ length: 15 }, (_, i) => ps(i + 1))];
const AD_END = AD_T + 0.12; // после рекламы — новый кадр
const END = TOTAL;
const cam = (...k: CamKey[]) => k;
const S = (t0: number, t1: number, el: React.ReactNode, tr?: Shot["tr"]): Shot => ({ t0, t1, el, tr });
const After: React.FC<{ t: number; children: React.ReactNode }> = ({ t: at, children }) => { const s = useSec(); return s >= at ? <>{children}</> : null; };

// ---------------------------------------------------------------- рисунки (облачка, мел, экраны)
const pentoDraw = (tCross?: number) => (g: CanvasRenderingContext2D, s: number, Wd: number, H: number) => {
  g.fillStyle = "#fff"; g.fillRect(0, 0, Wd, H); const c = Math.min(Wd, H) / 4.2, x0 = Wd / 2 - c * 1.5, y0 = H / 2 - c * 1.5;
  const cells: [number, number][] = [[1, 0], [0, 1], [1, 1], [2, 1], [1, 2]];
  cells.forEach(([x, y], i) => { const cross = tCross !== undefined && s >= tCross && i === 4; g.globalAlpha = cross ? Math.max(0.25, 1 - (s - tCross!) * 1.5) : 1; block(g, x0 + x * c, y0 + y * c, c, TET.T); g.globalAlpha = 1;
    if (cross) { g.strokeStyle = RED; g.lineWidth = c * 0.16; g.beginPath(); g.moveTo(x0 + x * c, y0 + y * c); g.lineTo(x0 + x * c + c, y0 + y * c + c); g.moveTo(x0 + x * c + c, y0 + y * c); g.lineTo(x0 + x * c, y0 + y * c + c); g.stroke(); } });
  fitText(g, tCross !== undefined && s >= tCross ? "4" : "5", Wd * 0.88, H * 0.18, Wd * 0.2, H * 0.3, tCross !== undefined && s >= tCross ? "#2f8f4f" : RED);
};
const mapChalk = chalk((g, Wd, H, s) => {
  // контуры «карты» мелом
  g.globalAlpha = 0.45; g.beginPath(); g.ellipse(Wd * 0.72, H * 0.42, Wd * 0.22, H * 0.25, 0, 0, Math.PI * 2); g.stroke(); g.beginPath(); g.ellipse(Wd * 0.38, H * 0.5, Wd * 0.12, H * 0.2, 0.3, 0, Math.PI * 2); g.stroke();
  g.beginPath(); g.ellipse(Wd * 0.13, H * 0.42, Wd * 0.1, H * 0.3, 0, 0, Math.PI * 2); g.stroke(); g.globalAlpha = 1;
  const pts: [string, number, number, number][] = [["МОСКВА", 0.78, 0.36, 0], ["ВЕНГРИЯ", 0.47, 0.6, P[6] + 0.5], ["АНГЛИЯ", 0.35, 0.3, P[6] + 1.0], ["США", 0.13, 0.5, P[6] + 1.5]];
  pts.forEach(([n, x, y, at], i) => { if (s < at) return; g.beginPath(); g.arc(Wd * x, H * y, Wd * 0.012, 0, Math.PI * 2); g.fill(); chalkText(g, n, Wd * x, H * (y - 0.1), Wd * 0.22, H * 0.09);
    if (i > 0) { const [, px, py] = pts[i - 1]; chalkArrow(g, Wd * px, H * py, Wd * x, H * y, clamp((s - at) / 0.35)); } });
  if (s >= P[6] + 1.9) { chalkText(g, "ДОГОВОР?", Wd * 0.5, H * 0.86, Wd * 0.4, H * 0.12, YEL); g.strokeStyle = YEL; g.beginPath(); g.moveTo(Wd * 0.3, H * 0.93); g.lineTo(Wd * 0.7, H * 0.93); g.stroke(); }
});
const authorChalk = chalk((g, Wd, H, s) => {
  chalkText(g, "ИГРА", Wd * 0.22, H * 0.25, Wd * 0.3, H * 0.15); chalkArrow(g, Wd * 0.36, H * 0.25, Wd * 0.58, H * 0.25, 1); chalkText(g, "ГОСУДАРСТВО", Wd * 0.76, H * 0.25, Wd * 0.4, H * 0.13);
  chalkText(g, "АВТОР", Wd * 0.22, H * 0.62, Wd * 0.3, H * 0.15); chalkArrow(g, Wd * 0.36, H * 0.62, Wd * 0.58, H * 0.62, clamp((s - (AD_END + 0.3)) / 0.4));
  if (s >= t.p7nothing) { chalkText(g, "0 ₽", Wd * 0.76, H * 0.62, Wd * 0.3, H * 0.2, YEL); g.strokeStyle = YEL; g.beginPath(); g.ellipse(Wd * 0.76, H * 0.62, Wd * 0.13, H * 0.14, 0, 0, Math.PI * 2); g.stroke(); }
});
const stampDraw = (g: CanvasRenderingContext2D, s: number, Wd: number, H: number) => {
  g.fillStyle = "#f4efe0"; g.fillRect(0, 0, Wd, H); fitText(g, "ДОГОВОР № 1", Wd / 2, H * 0.1, Wd * 0.6, H * 0.06, INK);
  g.fillStyle = "#b8b0a0"; for (let i = 0; i < 9; i++) g.fillRect(Wd * 0.1, H * (0.2 + i * 0.055), Wd * (0.8 - (i % 3) * 0.12), H * 0.012);
  block(g, Wd * 0.4, H * 0.7, Wd * 0.08, TET.T); block(g, Wd * 0.48, H * 0.7, Wd * 0.08, TET.T); block(g, Wd * 0.56, H * 0.7, Wd * 0.08, TET.T); block(g, Wd * 0.48, H * 0.78, Wd * 0.08, TET.T);
  drawStamp(g, Wd, H, s, t.p7state, "СОБСТВЕННОСТЬ ГОСУДАРСТВА", H * 0.55);
};
const contractDraw = (signT: number) => (g: CanvasRenderingContext2D, s: number, Wd: number, H: number) => {
  g.fillStyle = "#f4efe0"; g.fillRect(0, 0, Wd, H); fitText(g, "THE TETRIS COMPANY · 1996", Wd / 2, H * 0.1, Wd * 0.8, H * 0.06, INK);
  g.fillStyle = "#b8b0a0"; for (let i = 0; i < 8; i++) g.fillRect(Wd * 0.1, H * (0.2 + i * 0.055), Wd * (0.8 - (i % 3) * 0.12), H * 0.012);
  const k = clamp((s - signT) / 0.8); g.strokeStyle = "#1a2a8a"; g.lineWidth = Wd * 0.008; g.beginPath();
  for (let i = 0; i <= 40 * k; i++) { const x = Wd * (0.3 + i * 0.01), y = H * 0.78 + Math.sin(i * 0.7) * H * 0.03; i ? g.lineTo(x, y) : g.moveTo(x, y); } g.stroke();
  g.fillStyle = "#1a2a8a"; fitText(g, "А. Пажитнов", Wd * 0.45, H * 0.86, Wd * 0.4, H * 0.04, "#6a6a7a");
};
const titleDraw = (g: CanvasRenderingContext2D, s: number, Wd: number, H: number) => {
  const gr = g.createRadialGradient(Wd / 2, H / 2, 10, Wd / 2, H / 2, Wd * 0.8); gr.addColorStop(0, "#2a1450"); gr.addColorStop(1, "#08040f"); g.fillStyle = gr; g.fillRect(0, 0, Wd, H);
  const c = Wd / 16; for (let i = 0; i < 14; i++) { const k = "IOTSZJL"[i % 7], x = ((i * 211) % 14) * c, y = ((s * (60 + i * 7) + i * 97) % (H + 200)) - 150; g.globalAlpha = 0.35; piece(g, k, x, y, c * 0.7); } g.globalAlpha = 1;
  const L = "ТЕТРИС", cols = [TET.Z, TET.L, TET.O, TET.S, TET.I, TET.T];
  [...L].forEach((ch, i) => { const at = t.p13tet - 0.1 + i * 0.07; if (s < at) return; const k = clamp((s - at) / 0.25), y = H * 0.5 - (1 - k) * H * 0.5;
    const x = Wd * (0.14 + i * 0.145); g.fillStyle = cols[i]; rr(g, x - c * 1.05, y - c * 1.3, c * 2.1, c * 2.6, c * 0.2); g.fill(); g.strokeStyle = "#1a1020"; g.lineWidth = c * 0.18; g.stroke(); fitText(g, ch, x, y + c * 0.08, c * 1.8, c * 2.1, "#fff"); });
  if (s >= t.p13tet + 0.5) fitText(g, "МОСКВА · 1984", Wd / 2, H * 0.72, Wd * 0.6, H * 0.05, "#d8c8ff");
};
const rowsDraw = (g: CanvasRenderingContext2D, s: number, Wd: number, H: number) => {
  colorTetrisDraw(t.p14row - 1.5, t.p14row + 0.3)(g, s, Wd, H);
  if (s >= t.p14row + 0.3) { const k = clamp((s - t.p14row - 0.3) / 0.6); fitText(g, "+100", Wd / 2, H * 0.62 - k * H * 0.15, Wd * 0.5, H * 0.1, YEL); }
};
const Void: React.FC<{ draw: (g: CanvasRenderingContext2D, s: number, W: number, H: number) => void }> = ({ draw }) => (<>
  <mesh position={[0, 1.6, -3]}><planeGeometry args={[12, 8]} /><meshBasicMaterial color="#08040f" /></mesh>
  <Screen p={[0, 1.6, -2.9]} w={2.4} h={4.27} res={900} draw={draw} glow={1.0} basic />
</>);

// ================================================================= ШОТЫ
export const SHOTS: Shot[] = [
  // 1. Он придумал игру, в которую сыграл весь мир — крупно у терминала, падает фигура
  S(0, t.p1a, (
    <Scene3D t0={0} light="lab" bg="#101828" cine focus={[-0.45, 1.1, -0.2]}
      cam={orbit(0, t.p1a, [-0.3, 1.1, -0.4], { a0: 0.5, a1: -0.1, r0: 1.6, r1: 1.2, h0: 1.5, h1: 1.25, f0: 52, f1: 48 })}>
      <VC1984 term={termDraw(0)} />
      <Doodle a={ap([-0.5, 0, -0.2], [[0, "proud"]])} />
    </Scene3D>), "cut"),
  // 2. …а в награду получил компьютер: коробка с бантом, лицо без эмоций
  S(t.p1a, P[2], (
    <Scene3D t0={t.p1a} light="lab" bg="#101828" cine focus={[-0.3, 1.05, -0.2]}
      cam={orbit(t.p1a, P[2], [-0.25, 1.0, -0.3], { a0: -0.2, a1: 0.15, r0: 1.35, r1: 1.05, h0: 1.22, h1: 1.18, f0: 50, f1: 46 })}>
      <VC1984 term={termDraw(0)} />
      <Doodle a={ap([-0.5, 0, -0.2], [[0, "neutral"], [W(1, "компьютер") + 0.2, "blank"]], { handB: [[0, 0.32, HIP + 0.28]] })} />
      <After t={W(1, "компьютер") - 0.1}><GiftBox p={[0.08, 0.62, -0.05]} scale={0.8} /></After>
    </Scene3D>)),

  // 3. Москва, 1984 — ночная улица, снег, вывеска ВЦ
  S(P[2], t.p2vc, (
    <Scene3D t0={P[2]} light="night" bg="#0a1030" cine={{ dof: 1.5, range: 3 }} focus={[-1.5, 2.5, -6]}
      cam={dolly(P[2], t.p2vc, [1.5, 4.2, 4.6], [0.2, 1.5, 3.2], [-1.0, 3.6, -6], [-1.0, 2.7, -6], 60, 56)}>
      <SovietStreet night sign="ВЫЧИСЛИТЕЛЬНЫЙ ЦЕНТР" />
      {crowd(3, -3, 2, -2.2, -1.2, 41, [[0, "neutral"]]).map((a, i) => <Doodle key={i} a={{ ...a, look: { ...a.look, hat: "ushanka", hatCol: ["#6a5040", "#3a3a4a", "#8a6a4a"][i], ink: 1.25 }, walk: [[P[2], -3 + i * 2, -1.6 - i * 0.3], [t.p2vc, -1.5 + i * 2, -1.6 - i * 0.3]] }} />)}
    </Scene3D>), "cut"),
  // 4. ВЦ: шкафы ЭВМ, бобины, лампы
  S(t.p2vc, t.p2young, (
    <Scene3D t0={t.p2vc} light="lab" bg="#101828" cine focus={[1.6, 1.2, -1.4]}
      cam={dolly(t.p2vc, t.p2young, [-0.6, 1.6, 1.3], [0.9, 1.5, 1.0], [1.2, 1.3, -1.6], [1.9, 1.25, -1.6], 56, 52)}>
      <VC1984 term={termDraw(0)} />
      <Doodle a={who(COL2, 11, [1.75, 0, -0.8], [[0, "neutral"]])} />
    </Scene3D>)),
  // 5. Молодой программист за «Электроникой-60»
  S(t.p2young, t.p2graph, (
    <Scene3D t0={t.p2young} light="lab" bg="#101828" cine focus={[-0.4, 1.05, -0.4]}
      cam={orbit(t.p2young, t.p2graph, [-0.35, 1.05, -0.6], { a0: 0.6, a1: 0.2, r0: 1.45, r1: 1.1, h0: 1.35, h1: 1.25, f0: 52, f1: 48 })}>
      <VC1984 term={termDraw(t.p2young)} />
      <Doodle a={ap([-0.7, 0, -0.2], [[0, "neutral"], [t.p2young + 0.8, "smug"]], { handB: pointKeys(t.p2young + 0.6, 0.6, 0.15, 1.2, "b") })} />
    </Scene3D>)),
  // 6. Графики нет — только буквы и скобки: экран крупно
  S(t.p2graph, P[3], (
    <Scene3D t0={t.p2graph} light="lab" bg="#101828" cine={{ dof: 0 }} focus={[-0.15, 1.04, -0.83]}
      cam={cam([t.p2graph, [-0.15, 1.04, -0.05], [-0.15, 1.04, -0.83], 46], [P[3], [-0.15, 1.04, -0.3], [-0.15, 1.04, -0.83], 44])}>
      <VC1984 term={termDraw(t.p2graph, "ЭЛЕКТРОНИКА-60")} />
    </Scene3D>), "cut"),

  // 7. Головоломка из пяти квадратиков — облачко мыслей
  S(P[3], t.p3but, (
    <Scene3D t0={P[3]} light="lab" bg="#101828" cine focus={[-0.4, 1.1, -0.2]}
      cam={dolly(P[3], t.p3but, [0.3, 1.1, 1.4], [0, 1.5, 1.5], [-0.2, 1.1, -0.4], [-0.15, 1.5, -0.4], 54, 52)}>
      <VC1984 term={termDraw(P[3])} />
      <Doodle a={ap([-0.45, 0, -0.2], [[0, "proud"]])} />
      <ThoughtCloud p={[-0.08, 1.98, -0.1]} t={t.p3five - 0.3} w={0.8} draw={pentoDraw()} />
    </Scene3D>)),
  // 8. Машина слабая — оставляет четыре: один квадрат зачёркнут
  S(t.p3but, t.p3fig, (
    <Scene3D t0={t.p3but} light="lab" bg="#101828" cine focus={[-0.4, 1.1, -0.2]} shakes={[[t.p3four, 0.4]]}
      cam={orbit(t.p3but, t.p3fig, [-0.15, 1.45, -0.3], { a0: 0, a1: -0.3, r0: 1.4, r1: 1.15, h0: 1.5, f0: 52, f1: 50 })}>
      <VC1984 term={termDraw(P[3])} />
      <Doodle a={ap([-0.45, 0, -0.2], [[0, "nervous"], [t.p3four, "realize"]])} />
      <ThoughtCloud p={[-0.08, 1.98, -0.1]} t={t.p3but - 1} w={0.8} draw={pentoDraw(t.p3four - 0.15)} />
    </Scene3D>)),
  // 9. Фигуры падают, полные ряды исчезают — экран крупно
  S(t.p3fig, P[4], (
    <Scene3D t0={t.p3fig} light="lab" bg="#101828" cine={{ dof: 0 }} focus={[-0.15, 1.04, -0.83]}
      cam={cam([t.p3fig, [-0.15, 1.04, -0.15], [-0.15, 1.04, -0.83], 46], [P[4], [-0.15, 1.04, -0.35], [-0.15, 1.04, -0.83], 44])}>
      <VC1984 term={termDraw(t.p3fig - 2.5, "", t.p3gone)} />
    </Scene3D>), "cut"),

  // 10. Шестого июня показывает коллегам — все столпились у терминала
  S(P[4], t.p4copy, (
    <Scene3D t0={P[4]} light="lab" bg="#101828" cine focus={[0, 1.1, -0.4]}
      cam={orbit(P[4], t.p4copy, [0.2, 1.1, -0.6], { a0: -0.5, a1: 0.3, r0: 1.85, r1: 1.5, h0: 1.45, h1: 1.35, f0: 56, f1: 54 })}>
      <VC1984 term={termDraw(P[4])} clock="18:05" />
      <Doodle a={ap([-0.45, 0, -0.3], [[0, "proud"]], { handB: pointKeys(t.p4show, 0.8, 0.4, 1.5, "b") })} />
      <Doodle a={who(COL1, 21, [0.9, 0, -0.7], [[0, "neutral"], [t.p4show + 0.4, "shock"]])} />
      <Doodle a={who(COL2, 22, [1.15, 0, -0.75], [[0, "neutral"], [t.p4show + 0.6, "hype"]])} />
      <Doodle a={who(COL3, 23, [1.45, 0, -1.0], [[0, "neutral"], [t.p4show + 0.5, "grin"]], { scale: 1.05 })} />
    </Scene3D>)),
  // 11. Копируют на дискеты — дискеты сыплются на стол
  S(t.p4copy, t.p4carry, (
    <Scene3D t0={t.p4copy} light="lab" bg="#101828" cine focus={[0.2, 0.85, -0.6]}
      cam={dolly(t.p4copy, t.p4carry, [0.45, 2.0, 0.1], [0.5, 1.3, 0.25], [0.45, 0.8, -0.6], [0.45, 0.8, -0.62], 48, 46)}>
      <VC1984 term={termDraw(P[4])} />
      {Array.from({ length: 9 }, (_, i) => <After key={i} t={t.p4copy + i * 0.12}><Diskette p={[0.2 + (i % 3) * 0.12, 0.765 + i * 0.014, -0.48 - (i % 2) * 0.04]} rot={[-Math.PI / 2, 0, i * 0.5]} col={["#1a1a22", "#2a2a5a", "#5a1a1a"][i % 3]} /></After>)}
    </Scene3D>), "cut"),
  // 12. …и носят по всей Москве: зимняя улица, у прохожих дискеты
  S(t.p4carry, P[5], (
    <Scene3D t0={t.p4carry} light="day" bg="#9ab0d0" cine={{ dof: 1.5, range: 2.5 }} focus={[0, 1, -1.5]}
      cam={dolly(t.p4carry, P[5], [-1.5, 1.4, 3.0], [0.8, 1.4, 2.8], [-0.8, 1.4, -4], [0.8, 1.4, -4], 58, 56)}>
      <SovietStreet night={false} />
      {crowd(5, -2.6, 2.6, -2.0, -0.8, 51, [[0, "grin"]]).map((a, i) => <Doodle key={i} a={{ ...a, look: { ...a.look, hat: (["ushanka", "beanie", "flatcap", "ushanka", "beret"] as const)[i], hatCol: ["#6a5040", "#c83a2a", "#4a5a6a", "#3a3a4a", "#2a2a32"][i], ink: 1.25 },
        walk: [[t.p4carry, -3 + i * 1.4, -1.0 - (i % 2) * 0.8], [P[5] + 1, -1.8 + i * 1.4, -1.0 - (i % 2) * 0.8]], sign: ["💾", "#ffffff", INK] }} />)}
    </Scene3D>), "cut"),

  // 13. 16-летний школьник за IBM
  S(P[5], t.p5color - 0.4, (
    <Scene3D t0={P[5]} light="lab" bg="#101828" cine focus={[-0.4, 1.0, -0.3]}
      cam={orbit(P[5], t.p5color - 0.4, [-0.3, 1.0, -0.5], { a0: -0.4, a1: 0.2, r0: 1.35, r1: 1.1, h0: 1.25, h1: 1.2, f0: 50, f1: 46 })}>
      <VC1984 term={termDraw(P[5])} clock="16:20" />
      <Doodle a={who(VADIM, 31, [-0.6, 0, -0.15], [[0, "smug"], [t.p5ibm, "hype"]], { scale: 1.0, handB: pointKeys(t.p5ibm - 0.3, 0.8, 0.3, 1.2, "b") })} />
    </Scene3D>)),
  // 14. …и игра впервые становится цветной (вспышка)
  S(t.p5color - 0.4, P[6], (
    <Scene3D t0={t.p5color - 0.4} light="lab" bg="#101828" cine={{ dof: 0, bloom: 0.8 }} focus={[-0.15, 1.04, -0.83]}
      cam={cam([t.p5color - 0.4, [-0.15, 1.04, -0.2], [-0.15, 1.04, -0.83], 46], [P[6], [-0.15, 1.04, -0.4], [-0.15, 1.04, -0.83], 44])}>
      <VC1984 term={(g, s, Wd, H) => (s < t.p5color ? termDraw(P[5])(g, s, Wd, H) : colorTetrisDraw(t.p5color)(g, s, Wd, H))} />
    </Scene3D>), "flash"),

  // 15. Игра утекает за границу: мел на доске — Москва → Венгрия → Англия → США
  S(P[6], t.p6hun - 0.6, (
    <Scene3D t0={P[6]} light="office" bg="#d8c8a0" cine={{ dof: 0 }} focus={[0, 1.6, -1.94]}
      cam={cam([P[6], [0, 1.55, 0.6], [0, 1.6, -1.94], 50], [t.p6hun - 0.6, [0, 1.55, 0.3], [0, 1.6, -1.94], 48])}>
      <ChalkWall draw={mapChalk} />
    </Scene3D>), "cut"),
  // 16. Будапешт, 1986: иностранец у стенда, в восторге
  S(t.p6hun - 0.6, t.p6eng + 0.2, (
    <Scene3D t0={t.p6hun - 0.6} light="warm" bg="#2a2a3a" cine focus={[0.3, 1.1, -0.6]}
      cam={orbit(t.p6hun - 0.6, t.p6eng + 0.2, [0.35, 1.15, -0.8], { a0: 0.5, a1: 0, r0: 1.45, r1: 1.1, h0: 1.35, h1: 1.3, f0: 52, f1: 48 })}>
      <ExpoHall t0={t.p6hun - 0.8} />
      <Doodle a={who(STEIN, 41, [0.6, 0, -0.75], [[0, "realize"], [t.p6hun + 0.2, "hype"]], { handF: pointKeys(t.p6hun, -0.8, 0.4, 1.2) })} />
    </Scene3D>)),
  // 17. Англия и Америка: коробки с игрой летят с полок
  S(t.p6eng + 0.2, t.p6before, (
    <Scene3D t0={t.p6eng + 0.2} light="neon" bg="#1a1030" cine focus={[0, 1.1, -0.8]}
      cam={dolly(t.p6eng + 0.2, t.p6before, [-1.2, 1.4, 1.6], [1.0, 1.35, 1.3], [-0.4, 1.2, -1.2], [0.4, 1.2, -1.2], 56, 52)}>
      <GameShop />
      {crowd(4, -1.6, 1.6, -0.9, -0.3, 61, [[0, "hype"]]).map((a, i) => <Doodle key={i} a={{ ...a, look: { ...a.look, ink: 1.25 }, ...armsUp(t.p6eng + 0.4 + i * 0.1, 9) }} />)}
    </Scene3D>), "cut"),
  // 18. …ещё до того, как кто-то договорился с Москвой: доска «ДОГОВОР?» + чиновник ничего не знает
  S(t.p6before, P[7], (
    <Scene3D t0={t.p6before} light="office" bg="#c8b890" cine focus={[0, 1.0, -1.65]}
      cam={dolly(t.p6before, P[7], [0, 1.6, 1.6], [0, 1.3, 1.0], [0, 1.3, -1.3], [0, 1.2, -1.3], 54, 48)}>
      <Ministry />
      <Doodle a={who(OFFICIAL, 51, [0, 0, -1.65], [[0, "blank"], [t.p6before + 1.0, "realize"]], { scale: 1.18 })} />
      <ThoughtCloud p={[0.55, 2.2, -1.5]} t={t.p6before + 0.3} w={0.7} draw={(g, s, Wd, H) => { g.fillStyle = "#fff"; g.fillRect(0, 0, Wd, H); fitText(g, "???", Wd / 2, H / 2, Wd * 0.8, H * 0.7, RED); }} />
    </Scene3D>), "cut"),

  // 19. Права — государству: печать на договоре
  S(P[7], AD_END, (
    <Scene3D t0={P[7]} light="office" bg="#3a2a24" cine={{ dof: 0, bloom: 0.15, exposure: 1.0 }} focus={[0, 0, -0.6]} shakes={[[t.p7state, 0.9]]}
      cam={cam([P[7], [0, 1.25, 0.1], [0, 0, -0.6], 50], [AD_END, [0, 1.05, -0.2], [0, 0, -0.6], 48])}>
      <PaperSet draw={stampDraw} />
    </Scene3D>), "cut"),
  // 20. Автор не получает ничего: мел «АВТОР → 0 ₽», грустный герой у доски
  S(AD_END, t.p7give, (
    <Scene3D t0={AD_END} light="office" bg="#d8c8a0" cine={{ dof: 1.8, range: 1.2 }} focus={[-0.7, 1.1, -0.6]}
      cam={orbit(AD_END, t.p7give, [-0.2, 1.3, -1.0], { a0: -0.35, a1: 0.15, r0: 2.35, r1: 2.05, h0: 1.4, f0: 58, f1: 56 })}>
      <ChalkWall draw={authorChalk} />
      <Doodle a={ap([-0.6, 0, -0.5], [[0, "neutral"], [t.p7nothing, "tired"]], { scale: 1.0 })} />
    </Scene3D>), "cut"),
  // 21. В награду ему дают… компьютер: чиновник вручает коробку
  S(t.p7give, P[8], (
    <Scene3D t0={t.p7give} light="office" bg="#c8b890" cine focus={[0, 1.05, -0.5]}
      cam={orbit(t.p7give, P[8], [0, 1.05, -0.55], { a0: 0.4, a1: -0.2, r0: 1.75, r1: 1.35, h0: 1.3, h1: 1.25, f0: 54, f1: 50 })}>
      <Ministry door={false} />
      <Doodle a={who(OFFICIAL, 51, [0.55, 0, -0.55], [[0, "proud"]], { scale: 1.18, handF: [[0, -0.3, HIP + 0.3]] })} />
      <Doodle a={ap([-0.6, 0, -0.45], [[0, "realize"], [t.p7comp + 0.2, "blank"]])} />
      <GiftBox p={[0.0, 0.5, -0.35]} scale={0.85} />
      <After t={t.p7comp}><Confetti t0={t.p7comp} n={14} area={[-0.6, 0.6, -0.6, 0]} /></After>
    </Scene3D>)),

  // 22. 1989: снова зимняя Москва
  S(P[8], t.p8three, (
    <Scene3D t0={P[8]} light="night" bg="#0a1030" cine={{ dof: 1.5, range: 3 }} focus={[-1.5, 2.5, -6]}
      cam={dolly(P[8], t.p8three, [-2.0, 4.6, 5.0], [0, 1.5, 3.6], [-1.2, 3.8, -6], [-1.2, 2.8, -6], 60, 56)}>
      <SovietStreet night sign="ЭЛЕКТРОНОРГТЕХНИКА" />
    </Scene3D>), "cut"),
  // 23. Три иностранца идут по снегу с дипломатами
  S(t.p8three, t.p8same, (
    <Scene3D t0={t.p8three} light="night" bg="#0a1030" cine={{ dof: 1.2, range: 3 }} focus={[0, 1.1, -1.6]}
      cam={dolly(t.p8three, t.p8same, [0, 0.75, 1.6], [0, 1.0, 2.2], [0, 1.3, -1.5], [0, 1.25, -1.5], 56, 54)}>
      <SovietStreet night />
      {[[STEIN, -1.3, 41], [ROGERS, 0, 42], [MAXWELL, 1.3, 43]].map(([lk, x, sd], i) => <Doodle key={i} a={who(lk as Look, sd as number, [x as number, 0, -1.2], [[0, "stern"]], { walk: [[t.p8three, (x as number) * 1.6, -2.4], [t.p8same, x as number, -1.2]], handB: [[0, 0.3, HIP + 0.05]] })} />)}
    </Scene3D>)),
  // 24. …в одно и то же ведомство: все трое у одной двери, косятся друг на друга
  S(t.p8same, P[9], (
    <Scene3D t0={t.p8same} light="office" bg="#c8b890" cine focus={[1.65, 1.1, -0.8]}
      cam={dolly(t.p8same, P[9], [0.6, 1.35, 1.4], [1.8, 1.3, 1.1], [1.2, 1.2, -1.2], [1.7, 1.2, -1.2], 54, 50)}>
      <Ministry />
      {[[STEIN, 1.1, 41], [ROGERS, 1.65, 42], [MAXWELL, 2.2, 43]].map(([lk, x, sd], i) => <Doodle key={i} a={who(lk as Look, sd as number, [x as number, 0, -0.7 - (i % 2) * 0.25], [[0, "stern"], [t.p8same + 0.4 + i * 0.15, "angry"]])} />)}
    </Scene3D>)),

  // 25. Побеждает Nintendo: Роджерс с договором, двое других злятся
  S(P[9], t.p9box, (
    <Scene3D t0={P[9]} light="office" bg="#c8b890" cine focus={[0, 1.1, -0.8]}
      cam={orbit(P[9], t.p9box, [0, 1.1, -0.85], { a0: -0.5, a1: 0.4, r0: 1.85, r1: 1.45, h0: 1.4, f0: 56, f1: 52 })}>
      <Ministry door={false} />
      <Doodle a={who(ROGERS, 42, [0, 0, -0.75], [[0, "hype"]], { ...armsUp(P[9] + 0.3, 9), scale: 1.18 })} />
      <Doodle a={who(STEIN, 41, [-1.25, 0, -0.65], [[0, "angry"]])} />
      <Doodle a={who(MAXWELL, 43, [1.25, 0, -0.65], [[0, "cry"]])} />
      <Confetti t0={P[9] + 0.2} n={30} area={[-1.2, 1.2, -1.2, 0]} />
    </Scene3D>), "cut"),
  // 26. В коробку к каждому Game Boy: большой Game Boy, игра на экране
  S(t.p9box, t.p9mario, (
    <Scene3D t0={t.p9box} light="office" bg="#2a1450" cine={{ dof: 0, bloom: 0.25, exposure: 1.05 }} focus={[0, 1.2, -0.6]}
      cam={orbit(t.p9box, t.p9mario, [0, 1.25, -0.6], { a0: 0.65, a1: -0.35, r0: 1.7, r1: 1.2, h0: 1.5, h1: 1.3, f0: 50, f1: 46 })}>
      <mesh position={[0, 1.5, -2.2]}><planeGeometry args={[10, 6]} /><meshBasicMaterial color="#2a1450" /></mesh>
      <GameBoy p={[0, 1.25, -0.6]} t0={t.p9box} scale={1.1} rot={[0, -0.15, 0.05]} />
      <Motes area={[-1.2, 1.2, 0.3, 2.4, -1.5, -0.2]} n={30} col="#d8c8ff" size={0.008} />
    </Scene3D>), "cut"),
  // 27. …вместо Марио: облачко — картридж «?» зачёркнут, вместо него фигуры
  S(t.p9mario, P[10], (
    <Scene3D t0={t.p9mario} light="studio" bg="#2a1450" cine={{ dof: 0 }} focus={[0, 1.4, -0.6]}
      cam={cam([t.p9mario, [0, 1.4, 1.1], [0, 1.4, -0.6], 48], [P[10], [0, 1.4, 0.9], [0, 1.4, -0.6], 46])}>
      <mesh position={[0, 1.5, -2.2]}><planeGeometry args={[10, 6]} /><meshBasicMaterial color="#2a1450" /></mesh>
      <ThoughtCloud p={[0, 1.4, -0.6]} t={t.p9mario - 0.05} w={1.25} tail={[0, -0.6, 0]} draw={(g, s, Wd, H) => {
        g.fillStyle = "#fff"; g.fillRect(0, 0, Wd, H);
        g.fillStyle = "#c83a2a"; rr(g, Wd * 0.05, H * 0.2, Wd * 0.35, H * 0.6, 12); g.fill(); fitText(g, "?", Wd * 0.225, H * 0.5, Wd * 0.2, H * 0.4, "#fff");
        if (s > t.p9mario + 0.3) { g.strokeStyle = "#1a1020"; g.lineWidth = Wd * 0.03; g.beginPath(); g.moveTo(Wd * 0.03, H * 0.18); g.lineTo(Wd * 0.42, H * 0.82); g.moveTo(Wd * 0.42, H * 0.18); g.lineTo(Wd * 0.03, H * 0.82); g.stroke(); }
        fitText(g, "→", Wd * 0.5, H * 0.5, Wd * 0.12, H * 0.3, "#1a1020");
        g.fillStyle = "#c8c4bc"; rr(g, Wd * 0.6, H * 0.2, Wd * 0.35, H * 0.6, 12); g.fill(); piece(g, "T", Wd * 0.64, H * 0.3, Wd * 0.08); piece(g, "O", Wd * 0.75, H * 0.55, Wd * 0.08); }} />
    </Scene3D>), "cut"),

  // 28. 35 миллионов копий — счётчик на большом экране
  S(P[10], t.p10world, (
    <Scene3D t0={P[10]} light="office" bg="#0a0d18" cine={{ dof: 0, bloom: 0.5 }} focus={[0, 1.8, -1.92]}
      cam={dolly(P[10], t.p10world, [0, 2.3, 2.9], [0, 1.5, 2.2], [0, 1.4, -1.92], [0, 1.6, -1.92], 58, 56)}>
      <Room wall="#141a2e" floor="#20263c" wain="#10152a" ceil="#0a0d18" />
      <Screen p={[0, 1.75, -1.92]} w={3.6} h={2.0} res={900} draw={counterDraw(t.p10count - 0.3, t.p10world - 0.1, 35000000, "КОПИЙ НА GAME BOY")} />
      {crowd(8, -2.2, 2.2, -1.0, 0.2, 71, [[0, "hype"]]).map((a, i) => <Doodle key={i} a={{ ...a, look: { ...a.look, pad: true, ink: 1.25 } }} />)}
    </Scene3D>)),
  // 29. Мир сходит с ума: вагон метро — все уткнулись в Game Boy
  S(t.p10world, P[11], (
    <Scene3D t0={t.p10world} light="office" bg="#1a1a22" cine={{ dof: 1.4, range: 1.6 }} focus={[0, 1.05, -1.2]} shakes={[[t.p10world + 0.2, 0.5]]}
      cam={dolly(t.p10world, P[11], [-2.5, 1.35, 1.2], [1.5, 1.35, 1.2], [-2.0, 1.05, -1.3], [2.0, 1.05, -1.3], 56, 54)}>
      <SubwayCar />
      {crowd(8, -3.2, 3.2, -1.45, -1.3, 81, [[0, "hype"]]).map((a, i) => <Doodle key={i} a={{ ...a, look: { ...a.look, pad: true, ink: 1.25 }, hop: 0, scale: 0.95 }} />)}
      {crowd(3, -2, 2, -0.85, -0.7, 83, [[0, "hype"]]).map((a, i) => <Doodle key={"s" + i} a={{ ...a, look: { ...a.look, pad: true, ink: 1.25 }, hop: 0 }} />)}
    </Scene3D>), "cut"),

  // 30. Больше 10 лет — ни копейки: одинокий герой в ВЦ, календарь 1984 → 1995
  S(P[11], P[12], (
    <Scene3D t0={P[11]} light="night" bg="#0a1030" cine focus={[-0.4, 1.05, -0.3]}
      cam={orbit(P[11], P[12], [-0.4, 1.1, -0.5], { a0: 0.5, a1: 0.1, r0: 1.65, r1: 1.2, h0: 1.4, h1: 1.25, f0: 54, f1: 48 })}>
      <VC1984 term={termDraw(0)} clock="02:10" />
      <Screen p={[0.95, 1.9, -1.98]} w={0.5} h={0.62} res={300} draw={yearFlipDraw(P[11] + 0.3, t.p11kop, 1984, 1995)} glow={0.5} />
      <Doodle a={ap([-0.5, 0, -0.3], [[0, "tired"]], { shiver: 0 })} />
    </Scene3D>)),

  // 31. 1996: подписывает договор
  S(P[12], t.p12earn, (
    <Scene3D t0={P[12]} light="office" bg="#3a2a24" cine={{ dof: 0, bloom: 0.15, exposure: 1.0 }} focus={[0, 0, -0.6]}
      cam={cam([P[12], [0, 1.2, 0.05], [0, 0, -0.6], 50], [t.p12earn, [0, 1.05, -0.2], [0, 0, -0.6], 48])}>
      <PaperSet draw={contractDraw(t.p12back)} />
    </Scene3D>), "cut"),
  // 32. …и наконец начинает зарабатывать: деньги сыплются, седой герой счастлив
  S(t.p12earn, P[13], (
    <Scene3D t0={t.p12earn} light="warm" bg="#2a1a20" cine focus={[0, 1.05, -0.4]}
      cam={orbit(t.p12earn, P[13], [0, 1.1, -0.4], { a0: -0.6, a1: 0.5, r0: 1.55, r1: 1.3, h0: 1.3, h1: 1.25, f0: 52, f1: 48 })}>
      <VC1984 term={colorTetrisDraw(t.p12earn)} clock="12:00" />
      <Doodle a={ap([0, 0, -0.35], [[0, "proud"], [t.p12earn + 0.6, "laugh"]], armsUp(t.p12earn + 0.3, 9), AP_OLD)} />
      <Bills t0={t.p12earn} />
    </Scene3D>)),

  // 33. Его зовут Алексей Пажитнов: портрет в луче света, табличка с именем
  S(P[13], t.p13game, (
    <Scene3D t0={P[13]} light="warm" bg="#06040c" cine={{ dof: 0, bloom: 0.3, exposure: 1.0 }} focus={[0, 1.1, -0.5]}
      cam={orbit(P[13], t.p13game, [0, 0.95, -0.5], { a0: -0.3, a1: 0.3, r0: 2.05, r1: 1.75, h0: 1.12, h1: 1.08, f0: 50, f1: 48 })}>
      <mesh position={[0, 1.5, -2]}><planeGeometry args={[10, 6]} /><meshBasicMaterial color="#06040c" /></mesh>
      <spotLight position={[0, 3.2, 0.6]} angle={0.4} penumbra={0.5} intensity={7} decay={1} color="#ffe8c8" />
      <Doodle a={ap([0, 0, -0.5], [[0, "smug"]], {}, AP_OLD)} />
      <After t={t.p13name}><Sign p={[0, 0.55, -0.2]} w={1.0} h={0.18} text="АЛЕКСЕЙ ПАЖИТНОВ" bg="#c83a2a" fg="#fff2d0" glow={0.25} /></After>
      <Motes area={[-0.8, 0.8, 0.5, 2.6, -1, 0]} n={25} size={0.006} />
    </Scene3D>), "cut"),
  // 34. А игру ты знаешь с детства — ТЕТРИС: буквы падают как фигуры
  S(t.p13game, P[14], (
    <Scene3D t0={t.p13game} light="studio" bg="#08040f" cine={{ dof: 0, bloom: 0.9 }} focus={[0, 1.6, -2.9]}
      cam={cam([t.p13game, [0, 1.6, 0.6], [0, 1.6, -2.9], 50], [P[14], [0, 1.6, 0.2], [0, 1.6, -2.9], 48])}>
      <Void draw={titleDraw} />
      <Sparks p={[0, 1.2, -2.6]} t0={t.p13tet} n={50} col="#ffd060" spread={1.2} />
    </Scene3D>), "cut"),

  // 35. Каждый собранный ряд — награда
  S(P[14], t.p14wait, (
    <Scene3D t0={P[14]} light="lab" bg="#101828" cine={{ dof: 0, bloom: 0.8 }} focus={[-0.15, 1.04, -0.83]}
      cam={cam([P[14], [-0.15, 1.04, -0.15], [-0.15, 1.04, -0.83], 46], [t.p14wait, [-0.15, 1.04, -0.35], [-0.15, 1.04, -0.83], 44])}>
      <VC1984 term={rowsDraw} />
    </Scene3D>), "cut"),
  // 36. Свою награду он ждал 12 лет: седой герой у окна, снег
  S(t.p14wait, P[15], (
    <Scene3D t0={t.p14wait} light="night" bg="#0a1030" cine focus={[-1.0, 1.1, -1.3]}
      cam={dolly(t.p14wait, P[15], [0.2, 1.4, 1.2], [-0.5, 1.35, 0.75], [-0.6, 1.45, -1.9], [-0.8, 1.45, -1.9], 54, 50)}>
      <VC1984 term={termDraw(0)} clock="23:40" />
      <Doodle a={ap([-1.15, 0, -1.25], [[0, "tired"], [t.p14twelve, "smug"]], {}, AP_OLD)} />
      <Screen p={[-0.45, 1.35, -1.97]} w={0.42} h={0.52} res={300} draw={yearFlipDraw(t.p14wait, t.p14twelve, 1984, 1996)} glow={0.4} />
    </Scene3D>)),

  // 37. Финал: зимняя Москва, падающие фигуры и вопрос
  S(P[15], END, (
    <Scene3D t0={P[15]} light="night" bg="#0a1030" cine={{ dof: 0 }} focus={[0, 2, -3]}
      cam={dolly(P[15], END, [0, 1.2, 2.0], [0, 2.2, 4.4], [0, 2.4, -6], [0, 3.0, -7], 58, 62)}>
      <SovietStreet night lamps={[-5.5, 5]} />
      <QuestionCard p={[0, 4.0, -4]} t={P[15] + 0.15} w={4.6} l1="ТЕТРИС ПРИДУМАЛИ" l2="В МОСКВЕ?" pill="СТАВЬ ❤️ И ПИШИ В КОММЕНТЫ" />
      {crowd(10, -2.6, 2.6, -2.0, 0.4, 91, [[0, "hype"]]).map((a, i) => <Doodle key={i} a={{ ...a, look: { ...a.look, hat: i % 2 ? "ushanka" : "beanie", hatCol: ["#6a5040", "#c83a2a", "#3a3a4a"][i % 3], ink: 1.25 } }} />)}
      <Doodle a={ap([0, 0, 1.0], [[0, "smug"]], {}, AP)} />
    </Scene3D>)),
];

// ---------------------------------------------------------------- облачка-реплики
export type Bub = { t0: number; t1: number; text: string; x: number; y: number; col?: string };
export const BUBBLES: Bub[] = [
  { t0: t.p4show + 0.5, t1: t.p4copy, text: "ДАЙ ПОИГРАТЬ! 😍", x: 640, y: 380 },
  { t0: t.p6hun, t1: t.p6eng + 0.2, text: "ЧТО ЭТО?! 🤩", x: 600, y: 400, col: YEL },
  { t0: t.p7comp + 0.1, t1: P[8], text: "…СПАСИБО 🙂", x: 360, y: 420 },
  { t0: P[9] + 0.3, t1: t.p9box, text: "NINTENDO! 🎮", x: 540, y: 380, col: YEL },
];
// подписи места и времени сверху (как в «документальных» шортсах)
export type Lab = { t0: number; t1: number; text: string };
export const LABELS: Lab[] = [
  { t0: P[2], t1: P[3], text: "МОСКВА · 1984" },
  { t0: P[4], t1: P[5], text: "6 ИЮНЯ 1984" },
  { t0: t.p6hun - 0.6, t1: t.p6eng + 0.2, text: "БУДАПЕШТ · 1986" },
  { t0: P[8], t1: P[10], text: "МОСКВА · 1989" },
  { t0: P[12], t1: P[13], text: "1996" },
];
