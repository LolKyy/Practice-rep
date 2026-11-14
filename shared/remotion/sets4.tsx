// Локации и экраны v4 «А что, если GTA 6 переоценена?»: карта с туфелькой, клуб-«туфелька» снаружи, обувной внутри,
// заправка, зал, багажник с оружием, гараж Ultimate. Экраны: плакат розыска, «реализм/веселье», миссии, 30 FPS, годы ожидания.
import React, { useMemo } from "react";
import * as THREE from "three";
import { Box, Cyl, Sign, Screen, Room, Lamp, Palm, canvasTex, fitText, useSec, clamp, lerp, V3 } from "./kit";
import { rr, drawBg, PINK, CYAN, YEL, RED, ORG, INK } from "./sets";
import { Car, StreetLamp } from "./sets3";

type Draw = (g: CanvasRenderingContext2D, s: number, W: number, H: number) => void;
const ease = (x: number) => 1 - Math.pow(1 - clamp(x), 3);

// ------------------------------------------------------------------ рисунок туфельки на canvas
export const heelPath = (g: CanvasRenderingContext2D, x: number, y: number, s: number, col = "#111") => {
  g.save(); g.translate(x, y); g.scale(s, s); g.fillStyle = col; g.beginPath();
  g.moveTo(-55, 30); g.quadraticCurveTo(-60, 12, -40, 12); g.quadraticCurveTo(-10, 10, 10, -6); g.quadraticCurveTo(25, -22, 40, -28);
  g.lineTo(47, -20); g.quadraticCurveTo(45, -8, 36, -6); g.quadraticCurveTo(5, 6, -12, 26); g.lineTo(-20, 31); g.closePath(); g.fill();
  g.beginPath(); g.moveTo(36, -10); g.lineTo(46, -14); g.lineTo(42, 36); g.lineTo(37, 36); g.closePath(); g.fill(); g.restore();
};

// Карта Вайс-Сити (стилизация) с обведённой туфелькой и стрелкой — как в меме
export const viceMapDraw = (tCircle: number): Draw => (g, s, W, H) => {
  g.fillStyle = "#3fa8d8"; g.fillRect(0, 0, W, H);
  g.fillStyle = "#e8e2c8";
  g.beginPath(); g.moveTo(W * 0.12, H * 0.05); g.lineTo(W * 0.62, H * 0.04); g.quadraticCurveTo(W * 0.7, H * 0.4, W * 0.6, H * 0.62); g.quadraticCurveTo(W * 0.5, H * 0.95, W * 0.22, H * 0.96);
  g.quadraticCurveTo(W * 0.05, H * 0.6, W * 0.12, H * 0.05); g.fill();
  g.beginPath(); g.moveTo(W * 0.72, H * 0.1); g.lineTo(W * 0.86, H * 0.12); g.lineTo(W * 0.84, H * 0.8); g.lineTo(W * 0.76, H * 0.82); g.closePath(); g.fill();
  g.fillStyle = "#bfe6b0"; for (const [x, y, r] of [[0.3, 0.3, 0.07], [0.45, 0.7, 0.05], [0.25, 0.8, 0.06]]) { g.beginPath(); g.arc(W * x, H * y, W * r, 0, 7); g.fill(); }
  g.strokeStyle = "#9a9488"; g.lineWidth = W * 0.008;
  for (let i = 1; i < 9; i++) { g.beginPath(); g.moveTo(W * 0.14, H * i * 0.1); g.lineTo(W * 0.62, H * (i * 0.1 + 0.02)); g.stroke(); }
  for (let i = 1; i < 6; i++) { g.beginPath(); g.moveTo(W * (0.12 + i * 0.09), H * 0.06); g.lineTo(W * (0.1 + i * 0.09), H * 0.94); g.stroke(); }
  g.strokeStyle = "#f2c230"; g.lineWidth = W * 0.014; g.beginPath(); g.moveTo(W * 0.62, H * 0.35); g.lineTo(W * 0.78, H * 0.36); g.stroke();
  // другие иконки
  for (const [x, y, c] of [[0.2, 0.2, "#2f8fe0"], [0.5, 0.25, "#3fb27f"], [0.32, 0.6, ORG], [0.8, 0.6, "#b04fd6"], [0.52, 0.85, "#2f8fe0"]] as [number, number, string][]) {
    g.fillStyle = c; g.beginPath(); g.arc(W * x, H * y, W * 0.022, 0, 7); g.fill(); g.strokeStyle = "#fff"; g.lineWidth = 3; g.stroke(); }
  const cx = W * 0.4, cy = H * 0.44;
  g.fillStyle = "#fff"; g.beginPath(); g.arc(cx, cy, W * 0.07, 0, 7); g.fill();
  heelPath(g, cx, cy, W * 0.0009);
  const k = ease((s - tCircle) / 0.35);
  if (k > 0) {
    const pulse = 1 + 0.06 * Math.sin((s - tCircle) * 10);
    g.strokeStyle = RED; g.lineWidth = W * 0.018; g.beginPath(); g.arc(cx, cy, W * 0.12 * pulse, -Math.PI / 2, -Math.PI / 2 + k * Math.PI * 2); g.stroke();
    const ax = cx + W * 0.25, ay = cy + W * 0.2, bx = cx + W * 0.13, by = cy + W * 0.1;
    g.strokeStyle = RED; g.lineWidth = W * 0.03; g.lineCap = "round"; g.beginPath(); g.moveTo(lerp(bx, ax, 1 - k) + (ax - bx) * 0, ay - (ay - by) * k); g.moveTo(ax, ay); g.lineTo(lerp(ax, bx, k), lerp(ay, by, k)); g.stroke();
    if (k > 0.95) { g.fillStyle = RED; g.beginPath(); g.moveTo(bx - W * 0.01, by - W * 0.01); g.lineTo(bx + W * 0.07, by + W * 0.01); g.lineTo(bx + W * 0.01, by + W * 0.07); g.closePath(); g.fill(); }
  }
  g.fillStyle = "rgba(10,10,20,0.75)"; rr(g, W * 0.06, H * 0.86, W * 0.88, H * 0.1, 18); g.fill();
  fitText(g, "КОГДА ПРОШЁЛ ПРОЛОГ:", W / 2, H * 0.91, W * 0.82, H * 0.06, "#fff");
};

// ------------------------------------------------------------------ 3D-реквизит
export const Heel: React.FC<{ p: V3; col?: string; rotY?: number; scale?: number }> = ({ p, col = RED, rotY = 0, scale = 1 }) => (
  <group position={p} rotation={[0, rotY, 0]} scale={scale}>
    <Box p={[0.02, 0.06, 0]} s={[0.2, 0.025, 0.07]} c={col} rot={[0, 0, 0.45]} r={0.3} line={false} />
    <Box p={[-0.11, 0.012, 0]} s={[0.08, 0.025, 0.07]} c={col} r={0.3} line={false} />
    <Box p={[0.1, 0.1, 0]} s={[0.06, 0.06, 0.075]} c={col} r={0.3} line={false} />
    <Cyl p={[0.11, 0.045, 0]} r={0.01} h={0.09} c="#111" />
  </group>);

export const Rifle: React.FC<{ p: V3; rot?: V3; scale?: number }> = ({ p, rot = [0, 0, 0], scale = 1 }) => (
  <group position={p} rotation={rot} scale={scale}>
    <Box p={[0, 0, 0]} s={[0.6, 0.07, 0.06]} c="#2a2a30" r={0.4} />
    <Box p={[-0.32, -0.03, 0]} s={[0.16, 0.12, 0.06]} c="#6a4a2a" />
    <Box p={[0.05, -0.08, 0]} s={[0.06, 0.12, 0.05]} c="#2a2a30" rot={[0, 0, 0.2]} />
    <Box p={[0.38, 0.01, 0]} s={[0.18, 0.025, 0.025]} c="#1a1a1e" />
  </group>);

export const HotDog: React.FC<{ p: V3; scale?: number; rot?: V3 }> = ({ p, scale = 1, rot = [0, 0, 0] }) => (
  <group position={p} scale={scale} rotation={rot}>
    <Box p={[0, 0, 0]} s={[0.26, 0.07, 0.09]} c="#e8b060" r={0.6} />
    <Box p={[0, 0.04, 0]} s={[0.3, 0.045, 0.045]} c="#c0503a" r={0.5} line={false} />
    <Box p={[0, 0.065, 0]} s={[0.22, 0.012, 0.02]} c={YEL} line={false} />
  </group>);

export const Dumbbell: React.FC<{ p: V3; rot?: V3; scale?: number }> = ({ p, rot = [0, 0, 0], scale = 1 }) => (
  <group position={p} rotation={rot} scale={scale}>
    <Cyl p={[0, 0, 0]} r={0.018} h={0.32} c="#888" rot={[0, 0, Math.PI / 2]} />
    {[-0.14, 0.14].map((x) => <Cyl key={x} p={[x, 0, 0]} r={0.07} h={0.06} c="#222" rot={[0, 0, Math.PI / 2]} />)}
  </group>);

// перевёрнутая машина (качается, но не встаёт)
export const FlippedCar: React.FC<{ p: V3; col: string; t0: number; rotY?: number }> = ({ p, col, t0, rotY = 0 }) => {
  const sec = useSec(); const u = Math.max(0, sec - t0);
  const rock = Math.sin(u * 5) * 0.06 * Math.min(1, u);
  return (<group position={p} rotation={[0, rotY, 0]}><group position={[0, 1.0, 0]} rotation={[rock, 0, Math.PI]}><Car p={[0, 0, 0]} col={col} /></group></group>);
};

// ------------------------------------------------------------------ локации
// ночная улица у клуба-«туфельки»: неон, очередь у двери, канаты, пальмы
export const ClubFront: React.FC = () => {
  const sec = useSec();
  const neon = useMemo(() => canvasTex(512, 300, (g) => { g.fillStyle = "#14081e"; g.fillRect(0, 0, 512, 300);
    g.shadowColor = PINK; g.shadowBlur = 24; g.strokeStyle = PINK; g.lineWidth = 10; rr(g, 14, 14, 484, 272, 30); g.stroke();
    g.shadowBlur = 30; heelPath(g, 256, 120, 1.9, PINK); fitText(g, "ТУФЕЛЬКА", 256, 240, 440, 64, "#ffd0ec"); }), []);
  const blink = Math.floor(sec * 3) % 5 !== 0 ? 1.4 : 0.6;
  return (<>
    <mesh position={[0, 8, -20]}><planeGeometry args={[60, 24]} /><meshBasicMaterial color="#120a2a" /></mesh>
    <Box p={[0, -0.05, -2]} s={[30, 0.1, 20]} c="#2a2436" line={false} />
    <Box p={[0, 0.06, -1.2]} s={[30, 0.12, 2.4]} c="#4a4258" line={false} />
    <Box p={[0, 2.2, -2.6]} s={[7, 4.4, 0.6]} c="#2a1a3a" />
    <Box p={[0, 1.0, -2.28]} s={[1.0, 2.0, 0.06]} c="#120a1a" />
    <Box p={[0, 2.15, -2.22]} s={[1.6, 0.08, 0.3]} c="#3a2a4a" />
    <mesh position={[0, 3.25, -2.26]}><planeGeometry args={[2.4, 1.4]} /><meshBasicMaterial map={neon} color={new THREE.Color("#ffffff").multiplyScalar(blink)} toneMapped={false} /></mesh>
    {[-2.4, 2.4].map((x) => <mesh key={x} position={[x, 2.2, -2.27]}><planeGeometry args={[0.08, 3.6]} /><meshBasicMaterial color={new THREE.Color(CYAN).multiplyScalar(1.3)} toneMapped={false} /></mesh>)}
    {[-1.0, 1.0].map((x) => <group key={x}><Cyl p={[x, 0.45, -1.7]} r={0.03} h={0.9} c="#d8b040" /><mesh position={[x, 0.92, -1.7]}><sphereGeometry args={[0.05, 12, 10]} /><meshStandardMaterial color="#d8b040" /></mesh></group>)}
    <mesh position={[0, 0.78, -1.7]} rotation={[0, 0, Math.PI / 2]}><cylinderGeometry args={[0.02, 0.02, 2.0, 8]} /><meshStandardMaterial color="#b0203a" /></mesh>
    <Palm p={[-4.2, 0, -2.2]} h={4.2} /><Palm p={[4.4, 0, -2.0]} h={3.8} lean={-0.12} />
    {[-6, 6].map((x) => <StreetLamp key={x} p={[x, 0.1, -1.5]} on />)}
    <pointLight position={[0, 3.0, -1.2]} color={PINK} intensity={6} distance={6} />
  </>);
};

// внутри: обувной магазин (стеллажи с туфлями, примерочная скамейка, касса)
export const ShoeShop: React.FC = () => (<>
  <Room wall="#ffd8e8" floor="#e8d0c0" wain="#f4b8d0" ceil="#fff4f8" />
  <Sign p={[0, 2.62, -1.97]} w={2.4} h={0.38} text="👠 ОБУВЬ · СКИДКИ" bg={PINK} fg="#fff" glow={0.6} />
  {[-1.8, 0, 1.8].map((x, i) => <group key={i}>
    <Box p={[x, 1.1, -1.8]} s={[1.5, 2.2, 0.35]} c="#fff8fb" />
    {[0.45, 0.95, 1.45, 1.95].map((y, r) => <group key={y}><Box p={[x, y, -1.62]} s={[1.5, 0.035, 0.4]} c="#e8c8d8" />
      {[-0.5, 0, 0.5].map((dx, c) => <Heel key={c} p={[x + dx, y + 0.02, -1.6]} col={[RED, INK, PINK, "#f2c230", "#2f6fd6"][(i * 4 + r * 3 + c) % 5]} rotY={0.4} />)}</group>)}
  </group>)}
  <Box p={[2.4, 0.2, -0.3]} s={[0.9, 0.4, 0.45]} c="#c84a7a" />
  <Box p={[-2.5, 0.5, -0.6]} s={[0.6, 1.0, 0.6]} c="#c84a7a" /><Sign p={[-2.5, 0.85, -0.29]} w={0.5} h={0.18} text="КАССА" bg="#fff" fg={PINK} glow={0.3} />
  <Lamp p={[0, 2.97, -0.4]} len={3} />
</>);

// заправка: навес, колонка со счётчиком, машина
export const GasStation: React.FC<{ t0: number }> = ({ t0 }) => (<>
  <mesh position={[0, 8, -20]}><planeGeometry args={[60, 24]} /><meshBasicMaterial color="#8ac0f0" /></mesh>
  <Box p={[0, -0.05, -2]} s={[30, 0.1, 20]} c="#8a8a94" line={false} />
  <Box p={[0, 3.0, -1.0]} s={[6, 0.25, 3.2]} c="#f4f4f8" /><Box p={[0, 2.82, -1.0]} s={[6, 0.12, 3.2]} c={RED} />
  <Sign p={[0, 3.0, 0.62]} w={2.0} h={0.22} text="⛽ ЗАПРАВКА 24" bg={RED} fg="#fff" glow={0.4} />
  {[-2.6, 2.6].map((x) => <Box key={x} p={[x, 1.45, -1.0]} s={[0.18, 2.9, 0.18]} c="#ddd" />)}
  <group position={[-0.9, 0, -1.4]}>
    <Box p={[0, 0.75, 0]} s={[0.55, 1.5, 0.4]} c="#f4f4f8" /><Box p={[0, 1.42, 0]} s={[0.58, 0.18, 0.43]} c={RED} />
    <Screen p={[0, 1.05, 0.205]} w={0.42} h={0.3} res={300} draw={(g, s, W, H) => { g.fillStyle = "#0a1a10"; g.fillRect(0, 0, W, H);
      const l = Math.max(0, s - t0) * 1.7; fitText(g, l.toFixed(1) + " Л", W / 2, H * 0.35, W * 0.9, H * 0.3, "#3fff8f"); fitText(g, "⛽ 95", W / 2, H * 0.75, W * 0.6, H * 0.22, YEL); }} />
  </group>
  <Car p={[0.7, 0, -1.4]} col="#ff4f9a" rotY={Math.PI} />
  <mesh position={[-0.45, 0.85, -1.2]} rotation={[0, 0, -0.9]}><torusGeometry args={[0.35, 0.02, 6, 24, Math.PI * 0.8]} /><meshStandardMaterial color="#222" /></mesh>
</>);

// зал: зеркало, стойка с гантелями, скамья, табличка «ЗАЛ»
export const Gym: React.FC = () => (<>
  <Room wall="#3a4256" floor="#2a2a30" wain="#2a3246" ceil="#d8d8e0" />
  <Sign p={[0, 2.55, -1.97]} w={1.6} h={0.4} text="💪 ЗАЛ" bg={YEL} fg={INK} glow={0.5} />
  <Box p={[0, 1.4, -1.94]} s={[3.6, 1.4, 0.03]} c="#bcd8e8" metal={0.6} r={0.1} />
  <group position={[0.95, 0, -1.4]}><Box p={[0, 0.5, 0]} s={[1.2, 0.06, 0.4]} c="#555" /><Box p={[0, 0.9, 0]} s={[1.2, 0.06, 0.4]} c="#555" />
    {[-0.4, 0, 0.4].flatMap((x) => [0.58, 0.98].map((y) => <Dumbbell key={x + "_" + y} p={[x, y, 0]} rot={[0, Math.PI / 2, 0]} scale={0.8} />))}</group>
  <Box p={[-1.8, 0.3, -0.9]} s={[1.3, 0.12, 0.35]} c="#1a1a1a" /><Box p={[-1.8, 0.15, -0.9]} s={[0.2, 0.3, 0.2]} c="#666" />
  <Lamp p={[0, 2.97, -0.4]} len={3} />
</>);

// багажник: машина задом к камере, крышка открыта, внутри стволы
export const TrunkCar: React.FC<{ t0: number }> = ({ t0 }) => {
  const sec = useSec(); const k = ease((sec - t0) / 0.5);
  return (<>
    <mesh position={[0, 8, -20]}><planeGeometry args={[60, 24]} /><meshBasicMaterial color="#9ad0f8" /></mesh>
    <Box p={[0, -0.05, -2]} s={[30, 0.1, 20]} c="#5a5a66" line={false} />
    {Array.from({ length: 6 }, (_, i) => <Box key={i} p={[-4 + i * 1.6, 0.01, -0.2]} s={[0.08, 0.02, 2.2]} c="#f4f4f4" line={false} shadow={false} />)}
    <group position={[0, 0, -1.2]}>
      <Box p={[0, 0.42, 0]} s={[1.3, 0.5, 2.2]} c="#ff4f9a" r={0.35} />
      <Box p={[0, 0.82, -0.3]} s={[1.2, 0.36, 1.1]} c="#ff4f9a" r={0.35} />
      <Box p={[0, 0.5, 1.02]} s={[1.0, 0.3, 0.2]} c="#2a2a30" />
      {[-0.45, 0.45].map((x) => <Box key={x} p={[x, 0.55, 1.11]} s={[0.22, 0.08, 0.02]} c={RED} e={RED} ei={0.6} line={false} />)}
      <group position={[0, 0.67, 0.55]} rotation={[-lerp(0, 1.4, k), 0, 0]}><Box p={[0, 0, 0.27]} s={[1.25, 0.04, 0.55]} c="#ff4f9a" /></group>
      {[0, 1, 2, 3].map((i) => <Rifle key={i} p={[-0.25 + (i % 2) * 0.5, 0.7 + Math.floor(i / 2) * 0.06, 0.7]} rot={[0, Math.PI / 2, 0.15 * (i % 2 ? 1 : -1)]} scale={0.9} />)}
      {[-0.55, 0.55].map((x) => [0.65, -0.65].map((z) => <mesh key={x + "_" + z} position={[x, 0.18, z]} rotation={[0, 0, Math.PI / 2]}><cylinderGeometry args={[0.18, 0.18, 0.1, 18]} /><meshStandardMaterial color="#1a1a1a" /></mesh>))}
    </group>
  </>);
};

// гараж/шоурум Ultimate: золотая тачка на подиуме, стена со стволами, неон
export const Garage: React.FC = () => (<>
  <Room wall="#2e2e48" floor="#3a3a52" wain="#24243a" ceil="#14141e" />
  <Sign p={[0, 2.6, -1.97]} w={2.6} h={0.42} text="ULTIMATE EDITION" bg={YEL} fg={INK} glow={0.8} />
  <Cyl p={[0, 0.05, -0.6]} r={1.4} h={0.1} c="#3a3a50" seg={40} />
  <group position={[0, 0.1, -0.6]}><Car p={[0, 0, 0]} col="#ffc83a" rotY={0.5} /></group>
  <group position={[-2.3, 0, -1.9]}><Box p={[0, 1.3, 0]} s={[1.2, 1.6, 0.08]} c="#3a2a1a" />
    {[0, 1, 2].map((i) => <Rifle key={i} p={[0, 0.8 + i * 0.45, 0.08]} />)}</group>
  {[-2.9, 2.9].map((x) => <mesh key={x} position={[x, 1.5, -1.0]} rotation={[0, x < 0 ? Math.PI / 2 : -Math.PI / 2, 0]}><planeGeometry args={[2.0, 0.06]} /><meshBasicMaterial color={new THREE.Color(PINK).multiplyScalar(1.5)} toneMapped={false} /></mesh>)}
  {[-1.5, 1.5].map((x) => <spotLight key={x} position={[x, 2.9, 0.8]} angle={0.6} penumbra={0.7} intensity={22} decay={1} color="#fff2d8" />)}
</>);

// ------------------------------------------------------------------ экраны
// плакат розыска: фоторобот героя в розовой гавайке + пункты «лицо / одежда / машина» с галочками
export const wantedDraw = (ticks: number[]): Draw => (g, s, W, H) => {
  g.fillStyle = "#f2e2b8"; g.fillRect(0, 0, W, H); g.strokeStyle = "#8a6a3a"; g.lineWidth = 10; g.strokeRect(10, 10, W - 20, H - 20);
  fitText(g, "РОЗЫСК", W / 2, H * 0.1, W * 0.8, H * 0.1, RED);
  g.fillStyle = "#fff"; g.fillRect(W * 0.22, H * 0.18, W * 0.56, H * 0.36);
  g.fillStyle = "#ff4f9a"; g.beginPath(); g.ellipse(W / 2, H * 0.5, W * 0.2, H * 0.1, 0, Math.PI, 0); g.fill();
  g.fillStyle = YEL; for (const [x, y] of [[0.42, 0.46], [0.56, 0.48], [0.5, 0.52]]) { g.beginPath(); g.arc(W * x, H * y, W * 0.025, 0, 7); g.fill(); }
  g.fillStyle = "#fff"; g.strokeStyle = INK; g.lineWidth = 5; g.beginPath(); g.arc(W / 2, H * 0.32, W * 0.12, 0, 7); g.fill(); g.stroke();
  g.fillStyle = INK; rr(g, W * 0.4, H * 0.29, W * 0.2, H * 0.035, 8); g.fill();
  g.fillStyle = "#3a2a1a"; g.beginPath(); g.ellipse(W / 2, H * 0.235, W * 0.11, H * 0.03, 0, Math.PI, 0); g.fill();
  const items = ["ЛИЦО", "ОДЕЖДА", "МАШИНА"];
  items.forEach((it, i) => { const y = H * (0.63 + i * 0.11); fitText(g, it, W * 0.42, y, W * 0.5, H * 0.07, INK);
    g.strokeStyle = INK; g.lineWidth = 5; g.strokeRect(W * 0.7, y - H * 0.035, H * 0.07, H * 0.07);
    if (s >= ticks[i]) { g.strokeStyle = RED; g.lineWidth = 10; g.beginPath(); g.moveTo(W * 0.71, y); g.lineTo(W * 0.73, y + H * 0.025); g.lineTo(W * 0.78, y - H * 0.04); g.stroke(); } });
};

// «реализм ↑ / веселье ↓»
export const realismDraw = (t0: number): Draw => (g, s, W, H) => {
  drawBg(g, W, H, "#141a2e", "#24305a"); const k = ease((s - t0) / 1.6);
  const bar = (y: number, lab: string, v: number, col: string) => { fitText(g, lab, W / 2, y - H * 0.1, W * 0.8, H * 0.1, "#fff");
    g.fillStyle = "#0a0d18"; rr(g, W * 0.1, y, W * 0.8, H * 0.12, 20); g.fill(); g.fillStyle = col; rr(g, W * 0.1, y, W * 0.8 * v, H * 0.12, 20); g.fill();
    fitText(g, Math.round(v * 100) + "%", W / 2, y + H * 0.06, W * 0.3, H * 0.08, "#fff"); };
  bar(H * 0.22, "РЕАЛИЗМ", lerp(0.4, 1.0, k), "#3fb27f"); bar(H * 0.66, "ВЕСЕЛЬЕ", lerp(0.9, 0.15, k), RED);
};

// задачи-рутина: пункты появляются по времени
export const choresDraw = (keys: [number, string][]): Draw => (g, s, W, H) => {
  g.fillStyle = "#fffdf4"; g.fillRect(0, 0, W, H); g.strokeStyle = "#cfe0f4"; g.lineWidth = 3;
  for (let y = H * 0.2; y < H; y += H * 0.1) { g.beginPath(); g.moveTo(0, y); g.lineTo(W, y); g.stroke(); }
  fitText(g, "ДЕЛА НА СЕГОДНЯ", W / 2, H * 0.1, W * 0.85, H * 0.09, RED);
  keys.forEach(([t, txt], i) => { if (s < t) return; const a = ease((s - t) / 0.25); g.globalAlpha = a; fitText(g, "☐ " + txt, W / 2, H * (0.28 + i * 0.17), W * 0.85, H * 0.1, INK); g.globalAlpha = 1; });
};

// миссия: три карточки «доедь / забери / убеги»
export const missionDraw = (keys: number[]): Draw => (g, s, W, H) => {
  drawBg(g, W, H, "#1a0f2a", "#3a1a4a");
  fitText(g, "МИССИЯ №47", W / 2, H * 0.12, W * 0.7, H * 0.1, YEL);
  ["🚗 ДОЕДЬ", "📦 ЗАБЕРИ", "🏃 УБЕГИ"].forEach((t, i) => { if (s < keys[i]) return; const a = ease((s - keys[i]) / 0.2);
    g.globalAlpha = a; g.fillStyle = "#fff"; rr(g, W * 0.12, H * (0.25 + i * 0.24), W * 0.76, H * 0.18, 22); g.fill(); fitText(g, t, W / 2, H * (0.34 + i * 0.24), W * 0.66, H * 0.1, INK); g.globalAlpha = 1; });
};

// 30 FPS: дёрганая машинка по дороге, счётчик в углу
export const fpsDraw: Draw = (g, s, W, H) => {
  const q = Math.floor(s * 7) / 7;
  g.fillStyle = "#7ac0f0"; g.fillRect(0, 0, W, H * 0.55); g.fillStyle = "#4a4a56"; g.fillRect(0, H * 0.55, W, H * 0.45);
  g.fillStyle = "#f2e6a0"; for (let i = 0; i < 8; i++) g.fillRect(((i * W) / 4 - (q * 300) % (W / 4)), H * 0.75, W * 0.12, H * 0.025);
  const x = W * 0.5 + Math.sin(q * 2) * W * 0.15; g.fillStyle = "#ff4f9a"; rr(g, x - W * 0.16, H * 0.6, W * 0.32, H * 0.12, 18); g.fill(); rr(g, x - W * 0.09, H * 0.52, W * 0.16, H * 0.1, 14); g.fill();
  g.fillStyle = "#111"; for (const dx of [-0.1, 0.1]) { g.beginPath(); g.arc(x + W * dx, H * 0.72, W * 0.04, 0, 7); g.fill(); }
  g.fillStyle = "rgba(0,0,0,0.7)"; rr(g, W * 0.04, H * 0.05, W * 0.42, H * 0.16, 14); g.fill();
  fitText(g, "30 FPS", W * 0.25, H * 0.13, W * 0.36, H * 0.11, YEL);
};

// годы ожидания: 2013 → 2026
export const yearsDraw = (t0: number, t1: number): Draw => (g, s, W, H) => {
  g.fillStyle = "#fff"; g.fillRect(0, 0, W, H); g.fillStyle = RED; g.fillRect(0, 0, W, H * 0.25);
  fitText(g, "ЖДЁМ GTA 6", W / 2, H * 0.13, W * 0.85, H * 0.15, "#fff");
  const y = Math.round(lerp(2013, 2026, ease((s - t0) / Math.max(0.1, t1 - t0))));
  fitText(g, String(y), W / 2, H * 0.62, W * 0.85, H * 0.42, INK);
};
