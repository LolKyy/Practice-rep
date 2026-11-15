// v5 локации «Тетрис»: зимняя советская улица, ведомство, выставка в Будапеште, западный магазин игр, школьная доска, Game Boy.
import React, { useMemo } from "react";
import * as THREE from "three";
import { Box, Cyl, Sign, Screen, Room, Lamp, canvasTex, fitText, useSec, clamp, lerp, V3 } from "./kit";
import { rr, PINK, CYAN, YEL, RED, ORG, INK } from "./sets";
import { StreetLamp } from "./sets3";
import { Snow, TubeLight, DeskLamp, TeaGlass } from "./sets5";

type Draw = (g: CanvasRenderingContext2D, s: number, W: number, H: number) => void;
export const TET: Record<string, string> = { I: "#2fd0f0", O: "#f2c230", T: "#b04fd6", S: "#3fc060", Z: "#e64b4b", J: "#2f6fd6", L: "#ff8a2f" };
const SH: Record<string, [number, number][]> = { I: [[0, 0], [1, 0], [2, 0], [3, 0]], O: [[0, 0], [1, 0], [0, 1], [1, 1]], T: [[0, 0], [1, 0], [2, 0], [1, 1]],
  S: [[1, 0], [2, 0], [0, 1], [1, 1]], Z: [[0, 0], [1, 0], [1, 1], [2, 1]], J: [[0, 0], [0, 1], [1, 1], [2, 1]], L: [[2, 0], [0, 1], [1, 1], [2, 1]] };
// цветной блок с фаской
export const block = (g: CanvasRenderingContext2D, x: number, y: number, c: number, col: string) => {
  g.fillStyle = col; g.fillRect(x, y, c, c);
  g.fillStyle = "rgba(255,255,255,0.35)"; g.fillRect(x, y, c, c * 0.18); g.fillRect(x, y, c * 0.18, c);
  g.fillStyle = "rgba(0,0,0,0.3)"; g.fillRect(x, y + c * 0.82, c, c * 0.18); g.fillRect(x + c * 0.82, y, c * 0.18, c);
  g.strokeStyle = "#1a1020"; g.lineWidth = Math.max(2, c * 0.06); g.strokeRect(x, y, c, c);
};
export const piece = (g: CanvasRenderingContext2D, k: string, x: number, y: number, c: number) => { for (const [a, b] of SH[k]) block(g, x + a * c, y + b * c, c, TET[k]); };

// ------------------------------------------------------------------ экраны
// цветной тетрис (IBM PC): чёрный фон, стакан, падающая фигура, при clearT — вспышка ряда
export const colorTetrisDraw = (t0: number, clearT = 1e9, bg = "#05060c"): Draw => (g, s, W, H) => {
  g.fillStyle = bg; g.fillRect(0, 0, W, H);
  const c = Math.floor(Math.min(W / 12, H / 20)), x0 = (W - c * 10) / 2, y0 = (H - c * 18) / 2;
  g.strokeStyle = "#8a8aa0"; g.lineWidth = c * 0.15; g.strokeRect(x0 - c * 0.1, y0 - c * 0.1, c * 10.2, c * 18.2);
  const pile: [number, number, string][] = [];
  const rows = ["ZZ.OOIIII", "LZZOOJ.TTT", "LLLSSJJJT.", ".SS..IIIIL"];
  rows.forEach((r, i) => [...r].forEach((ch, j) => { if (ch !== ".") pile.push([j, 17 - i, TET[ch]]); }));
  const full = s >= clearT && s < clearT + 0.5;
  for (const [x, y, col] of pile) block(g, x0 + x * c, y0 + y * c, c, full && y === 16 ? "#ffffff" : col);
  if (s < clearT || s > clearT + 0.5) { const u = Math.max(0, s - t0), row = Math.min(14, Math.floor(u * 3.2)); piece(g, "I", x0 + 6 * c, y0 + row * c, c); }
  if (full) { g.fillStyle = `rgba(255,255,255,${1 - (s - clearT) * 2})`; g.fillRect(x0, y0 + 16 * c, c * 10, c); }
};
// Game Boy: зелёный экран, монохромный тетрис
export const gbDraw = (t0: number): Draw => (g, s, W, H) => {
  g.fillStyle = "#9bbc0f"; g.fillRect(0, 0, W, H);
  const c = Math.floor(H / 18), x0 = W * 0.1;
  g.fillStyle = "#306230"; g.fillRect(x0 - c * 0.3, 0, c * 0.3, H); g.fillRect(x0 + c * 10, 0, c * 0.3, H);
  const sq = (x: number, y: number) => { g.fillStyle = "#0f380f"; g.fillRect(x0 + x * c + 1, y * c + 1, c - 2, c - 2); g.fillStyle = "#8bac0f"; g.fillRect(x0 + x * c + c * 0.3, y * c + c * 0.3, c * 0.4, c * 0.4); };
  ["XX.XXXXXXX", "XXXXX.XXXX", "X.XXXXXXXX"].forEach((r, i) => [...r].forEach((ch, j) => { if (ch === "X") sq(j, 17 - i); }));
  const row = Math.min(13, Math.floor(Math.max(0, s - t0) * 3)); for (const [a, b] of SH.T) sq(4 + a, row + b);
  fitText(g, "SCORE", x0 + c * 13.2, H * 0.12, c * 5, c * 0.9, "#0f380f"); fitText(g, String(1200 + Math.floor(s * 40) * 10), x0 + c * 13.2, H * 0.22, c * 5, c * 0.9, "#0f380f");
};
// счётчик (35 000 000)
export const counterDraw = (t0: number, t1: number, to: number, label: string): Draw => (g, s, W, H) => {
  const gr = g.createLinearGradient(0, 0, 0, H); gr.addColorStop(0, "#1a0f3a"); gr.addColorStop(1, "#3a1460"); g.fillStyle = gr; g.fillRect(0, 0, W, H);
  const k = clamp((s - t0) / Math.max(0.1, t1 - t0)); const v = Math.round(to * (1 - Math.pow(1 - k, 3)));
  fitText(g, v.toLocaleString("ru-RU"), W / 2, H * 0.45, W * 0.9, H * 0.3, YEL); fitText(g, label, W / 2, H * 0.75, W * 0.8, H * 0.11, "#fff");
  for (let i = 0; i < 8; i++) piece(g, "IOTSZJL"[i % 7], ((i * 137 + s * 60) % (W + 100)) - 80, H * 0.06 + (i % 2) * H * 0.06, H * 0.035);
};
// календарь-перекидка: годы from → to
export const yearFlipDraw = (t0: number, t1: number, from: number, to: number, col = RED): Draw => (g, s, W, H) => {
  g.fillStyle = "#f8f4e8"; g.fillRect(0, 0, W, H); g.fillStyle = col; g.fillRect(0, 0, W, H * 0.24);
  fitText(g, "ГОД", W / 2, H * 0.12, W * 0.5, H * 0.14, "#fff");
  const y = Math.round(lerp(from, to, clamp((s - t0) / Math.max(0.1, t1 - t0)))); fitText(g, String(y), W / 2, H * 0.62, W * 0.86, H * 0.42, INK);
};
// мел на доске: рисует fn(g, W, H) «мелом», доска с рамкой
export const chalk = (fn: (g: CanvasRenderingContext2D, W: number, H: number, s: number) => void): Draw => (g, s, W, H) => {
  g.fillStyle = "#24443a"; g.fillRect(0, 0, W, H);
  g.fillStyle = "rgba(255,255,255,0.04)"; for (let i = 0; i < 40; i++) g.fillRect((i * 97) % W, (i * 53) % H, W * 0.2, 3);
  g.save(); g.strokeStyle = "#f4f2ea"; g.fillStyle = "#f4f2ea"; g.lineWidth = W * 0.008; g.lineCap = "round"; fn(g, W, H, s); g.restore();
};
export const chalkText = (g: CanvasRenderingContext2D, t: string, x: number, y: number, w: number, h: number, col = "#f4f2ea") => fitText(g, t, x, y, w, h, col, "'Oswald', 'Rubik', sans-serif");
export const chalkArrow = (g: CanvasRenderingContext2D, x0: number, y0: number, x1: number, y1: number, k = 1) => {
  const x = lerp(x0, x1, k), y = lerp(y0, y1, k); g.beginPath(); g.moveTo(x0, y0); g.lineTo(x, y); g.stroke();
  if (k > 0.95) { const a = Math.atan2(y1 - y0, x1 - x0), L = 22; g.beginPath(); g.moveTo(x1, y1); g.lineTo(x1 - L * Math.cos(a - 0.5), y1 - L * Math.sin(a - 0.5)); g.moveTo(x1, y1); g.lineTo(x1 - L * Math.cos(a + 0.5), y1 - L * Math.sin(a + 0.5)); g.stroke(); }
};
// обложка коробки с игрой (без названия: только фигуры)
export const boxArtDraw = (col: string): Draw => (g, s, W, H) => {
  const gr = g.createLinearGradient(0, 0, W, H); gr.addColorStop(0, col); gr.addColorStop(1, "#1a1030"); g.fillStyle = gr; g.fillRect(0, 0, W, H);
  piece(g, "T", W * 0.2, H * 0.2, W * 0.15); piece(g, "L", W * 0.35, H * 0.5, W * 0.15); piece(g, "O", W * 0.1, H * 0.65, W * 0.15);
  g.fillStyle = YEL; g.fillRect(0, H * 0.88, W, H * 0.12);
};

// ------------------------------------------------------------------ реквизит
export const GameBoy: React.FC<{ p: V3; t0: number; scale?: number; rot?: V3 }> = ({ p, t0, scale = 1, rot = [0, 0, 0] }) => (
  <group position={p} scale={scale} rotation={rot}>
    <Box p={[0, 0, 0]} s={[0.9, 1.48, 0.2]} c="#a8a49c" r={0.5} />
    <Box p={[0, 0.3, 0.101]} s={[0.74, 0.6, 0.01]} c="#5a5a6a" line={false} />
    <Screen p={[0, 0.3, 0.108]} w={0.52} h={0.47} res={420} draw={gbDraw(t0)} glow={0.6} />
    <Sign p={[-0.12, -0.06, 0.106]} w={0.5} h={0.07} text="Nintendo GAME BOY" bg="#c8c4bc" fg="#2a2a6a" glow={0.1} />
    <Box p={[-0.22, -0.35, 0.11]} s={[0.24, 0.07, 0.03]} c="#2a2a30" /><Box p={[-0.22, -0.35, 0.11]} s={[0.07, 0.24, 0.03]} c="#2a2a30" />
    {[[0.22, -0.3], [0.08, -0.38]].map(([x, y], i) => <mesh key={i} position={[x, y, 0.11]} rotation={[Math.PI / 2, 0, 0]}><cylinderGeometry args={[0.055, 0.055, 0.03, 20]} /><meshStandardMaterial color="#9a2a5a" /></mesh>)}
    {[0, 1, 2, 3, 4, 5].map((i) => <Box key={i} p={[0.18 + i * 0.03, -0.62, 0.105]} s={[0.012, 0.12, 0.01]} c="#8a8680" line={false} rot={[0, 0, -0.5]} />)}
  </group>);
export const Diskette: React.FC<{ p: V3; rot?: V3; col?: string; scale?: number }> = ({ p, rot = [0, 0, 0], col = "#1a1a22", scale = 1 }) => (
  <group position={p} rotation={rot} scale={scale}>
    <Box p={[0, 0, 0]} s={[0.26, 0.26, 0.012]} c={col} r={0.4} />
    <Box p={[0, 0.075, 0.007]} s={[0.14, 0.09, 0.004]} c="#b8b8c0" line={false} />
    <Box p={[0, -0.06, 0.007]} s={[0.18, 0.1, 0.004]} c="#f4f0e4" line={false} />
  </group>);
export const GiftBox: React.FC<{ p: V3; scale?: number; label?: string }> = ({ p, scale = 1, label = "IBM PC" }) => (
  <group position={p} scale={scale}>
    <Box p={[0, 0.2, 0]} s={[0.55, 0.4, 0.4]} c="#d8c8a0" />
    <Box p={[0.19, 0.2, 0.002]} s={[0.07, 0.41, 0.41]} c={RED} line={false} /><Box p={[0, 0.2, 0.002]} s={[0.56, 0.41, 0.08]} c={RED} line={false} />
    {[-1, 1].map((sx) => <mesh key={sx} position={[0.19 + sx * 0.07, 0.45, 0]} rotation={[0, 0, sx * 0.6]}><torusGeometry args={[0.06, 0.02, 8, 16]} /><meshStandardMaterial color={RED} /></mesh>)}
    <Sign p={[-0.08, 0.27, 0.205]} w={0.28} h={0.09} text={label} bg="#f4f0e4" fg="#1a2a6a" glow={0.2} />
  </group>);
// падающие купюры
export const Bills: React.FC<{ t0: number; area?: [number, number, number, number]; n?: number }> = ({ t0, area = [-1.5, 1.5, -1.2, 0.6], n = 36 }) => {
  const sec = useSec(); const u = sec - t0; if (u < 0) return null;
  return <>{Array.from({ length: n }, (_, i) => { const h = (k: number) => { const v = Math.sin((i + 1) * 91.7 * k) * 43758.5; return v - Math.floor(v); };
    const y = 3 - ((u * (0.7 + h(1) * 0.6) + h(2) * 3) % 3.2);
    return <mesh key={i} position={[lerp(area[0], area[1], h(3)) + Math.sin(u * 2 + i) * 0.15, y, lerp(area[2], area[3], h(4))]} rotation={[u * 2 + i, u + i, h(5) * 3]}>
      <planeGeometry args={[0.16, 0.08]} /><meshStandardMaterial color={i % 3 ? "#7ac87a" : "#c8a85a"} side={THREE.DoubleSide} /></mesh>; })}</>;
};

// ------------------------------------------------------------------ локации
const panelTex = (lit: number, night: boolean) => canvasTex(512, 768, (g) => {
  g.fillStyle = night ? "#5a5e6a" : "#b8b8b0"; g.fillRect(0, 0, 512, 768);
  g.strokeStyle = night ? "#4a4e58" : "#9a9a94"; g.lineWidth = 3; for (let y = 0; y < 768; y += 64) { g.beginPath(); g.moveTo(0, y); g.lineTo(512, y); g.stroke(); } for (let x = 0; x < 512; x += 128) { g.beginPath(); g.moveTo(x, 0); g.lineTo(x, 768); g.stroke(); }
  for (let y = 16; y < 760; y += 64) for (let x = 24; x < 512; x += 64) { const on = ((x * 7 + y * 13) % 17) / 17 < lit; g.fillStyle = on ? (night ? "#ffcf6a" : "#cfe0ee") : (night ? "#1a2030" : "#5a6a80"); g.fillRect(x, y, 26, 32); }
});
// зимняя советская улица: панельные дома, сугробы, фонари, снег; night — ночь
export const SovietStreet: React.FC<{ night?: boolean; sign?: string }> = ({ night = true, sign }) => {
  const t1 = useMemo(() => panelTex(0.55, night), [night]), t2 = useMemo(() => panelTex(0.4, night), [night]);
  const sky = useMemo(() => canvasTex(256, 256, (g) => { const gr = g.createLinearGradient(0, 0, 0, 256); if (night) { gr.addColorStop(0, "#0a1030"); gr.addColorStop(1, "#3a3a6a"); } else { gr.addColorStop(0, "#9ab0d0"); gr.addColorStop(1, "#e8e8f0"); } g.fillStyle = gr; g.fillRect(0, 0, 256, 256); }), [night]);
  return (<>
    <mesh position={[0, 8, -18]}><planeGeometry args={[60, 24]} /><meshBasicMaterial map={sky} /></mesh>
    <Box p={[0, -0.05, -3]} s={[40, 0.1, 30]} c={night ? "#c8d0e0" : "#f0f2f8"} line={false} />
    <Box p={[0, 0.0, -1.5]} s={[40, 0.02, 2.2]} c={night ? "#5a5a68" : "#8a8a94"} line={false} />
    {[[-6.5, 9, t1], [-1.5, 12, t2], [3.8, 10, t1], [8.5, 8, t2]].map(([x, h, t], i) => <group key={i}>
      <mesh position={[x as number, (h as number) / 2, -9]}><boxGeometry args={[4.6, h as number, 2.5]} /><meshStandardMaterial map={t as THREE.Texture} /></mesh>
      <Box p={[x as number, (h as number) + 0.08, -9]} s={[4.7, 0.16, 2.6]} c="#4a4a52" /></group>)}
    {[-7, -3, 1.5, 5.5, 9].map((x, i) => <mesh key={i} position={[x, 0.15, -3.6]} scale={[1.6, 0.5, 0.9]}><sphereGeometry args={[0.6, 16, 10]} /><meshStandardMaterial color={night ? "#d8e0f0" : "#ffffff"} /></mesh>)}
    {[-5, -0.5, 4].map((x, i) => <StreetLamp key={i} p={[x, 0.05, -3.0]} on={night} />)}
    {night ? [-5, -0.5, 4].map((x, i) => <pointLight key={i} position={[x + 0.5, 3, -2.8]} intensity={4} distance={6} color="#ffc880" />) : null}
    {sign ? <Sign p={[-1.5, 3.2, -7.7]} w={3.2} h={0.6} text={sign} bg="#c83a2a" fg="#fff2d0" glow={night ? 0.9 : 0.3} /> : null}
    <Snow area={[-6, 6, 0, 5, -6, 1.5]} n={160} speed={0.4} />
  </>);
};
// ведомство: кабинет с тяжёлым столом, красной дорожкой, сейфом, телефоном, табличкой на двери
export const Ministry: React.FC<{ door?: boolean }> = ({ door = true }) => (<>
  <Room wall="#c8b890" floor="#6a4a32" wain="#7a5a3a" ceil="#e8e0d0" />
  <Box p={[0, 0.005, -0.2]} s={[1.0, 0.01, 3.6]} c="#a82a2a" line={false} />
  <Box p={[0, 0.006, -0.2]} s={[0.85, 0.01, 3.6]} c="#c83a2a" line={false} />
  <Box p={[0, 0.75, -1.3]} s={[2.0, 0.08, 0.9]} c="#5a3a22" /><Box p={[0, 0.38, -1.3]} s={[1.9, 0.7, 0.8]} c="#6a4a2a" />
  <Box p={[0, 0.795, -1.3]} s={[1.6, 0.01, 0.6]} c="#2a5a3a" line={false} />
  <group position={[-0.6, 0.8, -1.2]}><Box p={[0, 0.05, 0]} s={[0.26, 0.1, 0.2]} c="#1a1a1a" /><Box p={[0, 0.13, 0]} s={[0.26, 0.04, 0.06]} c="#1a1a1a" /></group>
  <DeskLamp p={[0.7, 0.8, -1.45]} rotY={2.4} /><TeaGlass p={[0.45, 0.8, -1.1]} />
  {[0, 1, 2, 3].map((i) => <Box key={i} p={[0.05 + i * 0.02, 0.81 + i * 0.012, -1.2]} s={[0.3, 0.01, 0.4]} c="#f4f0e0" line={false} rot={[0, 0.15 * i, 0]} />)}
  <Box p={[2.3, 0.6, -1.7]} s={[0.7, 1.2, 0.5]} c="#4a5a4a" metal={0.4} /><mesh position={[2.3, 0.7, -1.44]} rotation={[Math.PI / 2, 0, 0]}><cylinderGeometry args={[0.08, 0.08, 0.04, 20]} /><meshStandardMaterial color="#c8b060" metalness={0.7} /></mesh>
  <Box p={[-2.2, 1.0, -1.75]} s={[1.0, 2.0, 0.4]} c="#7a5a3a" />
  {[0.5, 1.0, 1.5].map((y) => <group key={y}>{[0, 1, 2, 3, 4, 5].map((i) => <Box key={i} p={[-2.6 + i * 0.15, y + 0.12, -1.6]} s={[0.1, 0.3, 0.25]} c={["#2a4a8a", "#8a2a2a", "#2a6a4a", "#8a6a2a"][(i + y * 2) % 4]} />)}</group>)}
  {door ? <group position={[1.4, 0, -1.94]}><Box p={[0, 1.05, 0]} s={[0.9, 2.1, 0.08]} c="#5a3a22" /><Box p={[0.32, 1.0, 0.06]} s={[0.05, 0.05, 0.05]} c="#c8a050" />
    <Sign p={[0, 1.55, 0.05]} w={0.75} h={0.2} text="ЭЛЕКТРОНОРГТЕХНИКА" bg="#1a1a1a" fg="#e8c870" glow={0.3} /></group> : null}
  <group position={[-0.5, 1.95, -1.94]}><Box p={[0, 0, 0]} s={[1.1, 0.75, 0.04]} c="#8a6a3a" /><Screen p={[0, 0, 0.025]} w={0.98} h={0.63} res={400} draw={(g, s, W, H) => {
    const gr = g.createLinearGradient(0, 0, 0, H); gr.addColorStop(0, "#9ac0e0"); gr.addColorStop(1, "#e8e0c0"); g.fillStyle = gr; g.fillRect(0, 0, W, H);
    g.fillStyle = "#4a7a4a"; g.beginPath(); g.moveTo(0, H * 0.7); g.quadraticCurveTo(W * 0.3, H * 0.4, W * 0.6, H * 0.65); g.quadraticCurveTo(W * 0.8, H * 0.5, W, H * 0.6); g.lineTo(W, H); g.lineTo(0, H); g.fill();
    g.fillStyle = "#2a5a3a"; for (let i = 0; i < 6; i++) { g.beginPath(); g.moveTo(W * (0.1 + i * 0.15), H * 0.75); g.lineTo(W * (0.13 + i * 0.15), H * 0.45); g.lineTo(W * (0.16 + i * 0.15), H * 0.75); g.fill(); } }} glow={0.2} /></group>
  <Lamp p={[0, 2.97, -0.6]} len={3} />
</>);
// выставка в Будапеште, 1986: стенды, флажки, мониторы с игрой
export const ExpoHall: React.FC<{ t0: number }> = ({ t0 }) => (<>
  <Room wall="#2a2a3a" floor="#8a8a94" wain="#3a3a4a" ceil="#1a1a22" />
  <Sign p={[0, 2.55, -1.97]} w={3.2} h={0.45} text="COMPUTER EXPO · BUDAPEST 1986" bg="#1a1a2a" fg={YEL} glow={0.9} />
  {[-2.4, -1.6, 1.6, 2.4].map((x, i) => <group key={i} position={[x, 2.1, -1.9]}>{["#ce2939", "#ffffff", "#477050"].map((c, k) => <Box key={k} p={[0, -k * 0.12, 0]} s={[0.6, 0.12, 0.02]} c={c} line={false} />)}</group>)}
  {[-1.6, 0, 1.6].map((x, i) => <group key={i} position={[x, 0, -1.4]}>
    <Box p={[0, 0.45, 0]} s={[1.2, 0.9, 0.6]} c={["#2f6fd6", "#e64b4b", "#3fb27f"][i]} />
    <Box p={[0, 1.15, -0.05]} s={[0.55, 0.45, 0.4]} c="#d8d0b8" />
    <Screen p={[0, 1.15, 0.155]} w={0.44} h={0.33} res={400} draw={colorTetrisDraw(t0 + i * 0.7)} glow={1.0} />
  </group>)}
  {[-1.5, 1.5].map((x) => <spotLight key={x} position={[x, 2.9, 0.8]} angle={0.5} penumbra={0.6} intensity={9} decay={1} color="#fff0d8" />)}
</>);
// западный магазин игр: стеллажи с коробками, неон, касса
export const GameShop: React.FC = () => (<>
  <Room wall="#1a1030" floor="#3a2a4a" wain="#2a1a40" ceil="#120a20" />
  <Sign p={[0, 2.6, -1.97]} w={2.8} h={0.42} text="COMPUTER GAMES" bg="#120a20" fg={PINK} glow={1.4} />
  {[-1.8, 0, 1.8].map((x, i) => <group key={i} position={[x, 0, -1.7]}>
    <Box p={[0, 1.0, 0]} s={[1.5, 2.0, 0.35]} c="#3a3048" />
    {[0.35, 0.85, 1.35, 1.85].map((y, r) => <group key={r}><Box p={[0, y - 0.2, 0.15]} s={[1.5, 0.03, 0.4]} c="#5a5068" />
      {[-0.5, -0.17, 0.17, 0.5].map((dx, c) => <group key={c} position={[dx, y, 0.2]}><Box p={[0, 0, 0]} s={[0.28, 0.38, 0.06]} c="#ffffff" />
        <Screen p={[0, 0, 0.032]} w={0.26} h={0.36} res={180} draw={boxArtDraw([PINK, CYAN, ORG, "#6a4fd6"][(r + c + i) % 4])} glow={0.4} basic /></group>)}</group>)}
  </group>)}
  <Box p={[2.5, 0.5, -0.4]} s={[0.7, 1.0, 0.5]} c="#2a2040" /><Sign p={[2.5, 1.15, -0.14]} w={0.5} h={0.18} text="$ 34.99" bg={YEL} fg={INK} glow={0.4} />
  <pointLight position={[0, 2.4, 0.5]} intensity={6} decay={1.3} color="#ff8ad0" /><pointLight position={[-2, 2.2, 0.2]} intensity={5} decay={1.3} color="#5ad8ff" />
</>);
// стена со школьной доской (для схем мелом), рядом полка с книгами
export const ChalkWall: React.FC<{ draw: Draw }> = ({ draw }) => (<>
  <Room wall="#d8c8a0" floor="#7a5432" wain="#5a7a6a" ceil="#efe8d8" />
  <Box p={[0, 1.6, -1.98]} s={[3.0, 1.75, 0.06]} c="#6a4a2a" />
  <Screen p={[0, 1.6, -1.94]} w={2.8} h={1.55} res={1100} draw={draw} glow={0.55} basic />
  <Box p={[0, 0.7, -1.88]} s={[3.0, 0.05, 0.14]} c="#6a4a2a" />
  {[[-0.9, YEL], [-0.75, "#fff"], [0.6, "#7ac8ff"]].map(([x, c], i) => <Box key={i} p={[x as number, 0.74, -1.86]} s={[0.1, 0.025, 0.025]} c={c as string} line={false} />)}
  <TubeLight p={[0, 2.95, -0.8]} len={1.6} />
</>);

// вагон метро (89-й год, любой мегаполис мира): сиденья вдоль стен, поручни, окна с бегущими огнями туннеля, лампы
export const SubwayCar: React.FC = () => {
  const sec = useSec();
  const tunnel = useMemo(() => canvasTex(512, 128, (g) => { g.fillStyle = "#0a0a10"; g.fillRect(0, 0, 512, 128); for (let i = 0; i < 6; i++) { g.fillStyle = "#ffcf7a"; g.fillRect(i * 90 + 20, 50, 30, 8); } }), []);
  tunnel.wrapS = THREE.RepeatWrapping; tunnel.offset.x = (sec * 1.6) % 1;
  return (<>
    <Box p={[0, -0.05, -0.6]} s={[8, 0.1, 2.6]} c="#5a5a62" line={false} />
    <Box p={[0, 2.45, -0.6]} s={[8, 0.1, 2.6]} c="#e8e4d8" />
    <Box p={[0, 1.2, -1.95]} s={[8, 2.5, 0.1]} c="#c8c0a8" />
    {[-2.6, -0.9, 0.8, 2.5].map((x, i) => <group key={i} position={[x, 1.55, -1.89]}>
      <mesh><planeGeometry args={[1.2, 0.6]} /><meshBasicMaterial map={tunnel} /></mesh>
      <Box p={[0, 0.32, 0.01]} s={[1.28, 0.05, 0.04]} c="#8a8a90" /><Box p={[0, -0.32, 0.01]} s={[1.28, 0.05, 0.04]} c="#8a8a90" /></group>)}
    <Box p={[0, 0.42, -1.65]} s={[7.6, 0.1, 0.5]} c="#b8783a" /><Box p={[0, 0.75, -1.85]} s={[7.6, 0.6, 0.08]} c="#a8683a" />
    <Box p={[0, 0.2, -1.65]} s={[7.6, 0.4, 0.45]} c="#6a4a32" />
    {[-3.2, -1.6, 0, 1.6, 3.2].map((x) => <Cyl key={x} p={[x, 1.2, -1.1]} r={0.025} h={2.5} c="#c8c8d0" />)}
    <mesh position={[0, 2.1, -1.1]} rotation={[0, 0, Math.PI / 2]}><cylinderGeometry args={[0.02, 0.02, 8, 8]} /><meshStandardMaterial color="#c8c8d0" metalness={0.6} /></mesh>
    {[-2.4, 0, 2.4].map((x) => <TubeLight key={x} p={[x, 2.38, -0.6]} len={1.6} />)}
    <Sign p={[0, 2.18, -1.88]} w={1.4} h={0.18} text="◀ ▶  ЛИНИЯ 1" bg="#1a2a6a" fg="#fff" glow={0.3} />
  </>);
};
