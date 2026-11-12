// Детальные локации v2 «День выхода»: тёплая квартира, город с машинами и деревьями, кабина самолёта,
// поезд, поликлиника, магазин техники, ночной магазин 24/7, кухня. Реквизит: приставка, пачки чипсов, банки, чайник, машина.
import React, { useMemo } from "react";
import * as THREE from "three";
import { Box, Cyl, Sign, Screen, Desk, Chair, Shelf, Plant, Lamp, Room, canvasTex, fitText, useSec, popAt, clamp, lerp, FONT, V3 } from "./kit";
import { rr, drawBg, PINK, CYAN, YEL, RED, ORG, INK, Smoke } from "./sets";

type Draw = (g: CanvasRenderingContext2D, s: number, W: number, H: number) => void;
const Sph: React.FC<{ p: V3; r: number; c: string; s?: V3; rough?: number }> = ({ p, r, c, s = [1, 1, 1], rough = 0.7 }) => (
  <mesh position={p} scale={s} castShadow receiveShadow><sphereGeometry args={[r, 24, 18]} /><meshStandardMaterial color={c} roughness={rough} /></mesh>);
const Tex: React.FC<{ p: V3; w: number; h: number; draw: (g: CanvasRenderingContext2D, W: number, H: number) => void; rot?: V3; res?: number; glow?: number; transparent?: boolean }> =
  ({ p, w, h, draw, rot = [0, 0, 0], res = 512, glow = 0, transparent = false }) => {
    const tex = useMemo(() => canvasTex(res, Math.round((res * h) / w), (g) => draw(g, res, Math.round((res * h) / w))), [w, h]);
    return <mesh position={p} rotation={rot} receiveShadow><planeGeometry args={[w, h]} />
      <meshStandardMaterial map={tex} emissive="#fff" emissiveMap={tex} emissiveIntensity={glow} transparent={transparent} alphaTest={transparent ? 0.3 : 0} /></mesh>;
  };

// ------------------------------------------------------------------ реквизит
// приставка: белые «крылья», чёрная середина, синяя полоска света
export const Console: React.FC<{ p: V3; scale?: number; rotY?: number }> = ({ p, scale = 1, rotY = 0 }) => (
  <group position={p} scale={scale} rotation={[0, rotY, 0]}>
    <Box p={[0, 0.2, 0]} s={[0.1, 0.4, 0.3]} c="#15151c" r={0.3} />
    <Box p={[-0.075, 0.21, 0]} s={[0.05, 0.42, 0.31]} c="#f4f4f8" r={0.25} rot={[0, 0, 0.05]} />
    <Box p={[0.075, 0.21, 0]} s={[0.05, 0.42, 0.31]} c="#f4f4f8" r={0.25} rot={[0, 0, -0.05]} />
    <mesh position={[0, 0.2, 0.156]}><boxGeometry args={[0.012, 0.36, 0.005]} /><meshBasicMaterial color={new THREE.Color("#3fa0ff").multiplyScalar(1.2)} toneMapped={false} /></mesh>
  </group>);
// геймпад на столе
export const Pad: React.FC<{ p: V3; scale?: number; rot?: V3 }> = ({ p, scale = 1, rot = [0, 0, 0] }) => (
  <group position={p} scale={scale} rotation={rot}>
    <Box p={[0, 0, 0]} s={[0.18, 0.04, 0.09]} c="#f4f4f8" r={0.3} />
    <Sph p={[-0.08, 0, 0.03]} r={0.04} c="#f4f4f8" /><Sph p={[0.08, 0, 0.03]} r={0.04} c="#f4f4f8" />
    <Box p={[0, 0.022, 0]} s={[0.07, 0.01, 0.05]} c="#15151c" line={false} />
  </group>);
// пачка чипсов: «подушка» + этикетка
export const Chips: React.FC<{ p: V3; rot?: V3; col: string; scale?: number }> = ({ p, rot = [0, 0, 0], col, scale = 1 }) => {
  const tex = useMemo(() => canvasTex(256, 340, (g) => { g.fillStyle = col; g.fillRect(0, 0, 256, 340); g.fillStyle = "#fff"; g.beginPath(); g.ellipse(128, 120, 100, 70, 0, 0, 7); g.fill();
    fitText(g, "ЧИПСЫ", 128, 120, 180, 60, col); g.fillStyle = "#ffd88a"; for (let i = 0; i < 5; i++) { g.beginPath(); g.ellipse(70 + i * 30, 250 + (i % 2) * 20, 30, 20, i, 0, 7); g.fill(); g.strokeStyle = "#c98a3a"; g.lineWidth = 3; g.stroke(); }
    g.fillStyle = "rgba(0,0,0,0.25)"; g.fillRect(0, 0, 256, 18); g.fillRect(0, 322, 256, 18); }), [col]);
  return (<group position={p} rotation={rot} scale={scale}>
    <mesh scale={[0.22, 0.3, 0.07]} castShadow><sphereGeometry args={[1, 24, 16]} /><meshStandardMaterial color={col} roughness={0.35} metalness={0.2} /></mesh>
    <mesh position={[0, 0, 0.062]}><planeGeometry args={[0.3, 0.42]} /><meshStandardMaterial map={tex} roughness={0.35} transparent /></mesh>
    <Box p={[0, 0.3, 0]} s={[0.36, 0.035, 0.04]} c={col} line={false} /><Box p={[0, -0.3, 0]} s={[0.36, 0.035, 0.04]} c={col} line={false} />
  </group>);
};
// банка энергетика
export const Can: React.FC<{ p: V3; col: string; scale?: number }> = ({ p, col, scale = 1 }) => {
  const tex = useMemo(() => canvasTex(256, 256, (g) => { g.fillStyle = col; g.fillRect(0, 0, 256, 256); g.fillStyle = "#111"; g.fillRect(0, 90, 256, 76);
    fitText(g, "⚡ENERGY", 128, 128, 230, 46, col); }), [col]);
  return (<group position={p} scale={scale}>
    <mesh castShadow><cylinderGeometry args={[0.045, 0.045, 0.16, 20]} /><meshStandardMaterial map={tex} metalness={0.5} roughness={0.3} /></mesh>
    <Cyl p={[0, 0.082, 0]} r={0.04} h={0.006} c="#c8c8d0" />
  </group>);
};
// упаковка из 6 банок
export const SixPack: React.FC<{ p: V3; col: string; scale?: number }> = ({ p, col, scale = 1 }) => (
  <group position={p} scale={scale}>{[0, 1, 2, 3, 4, 5].map((i) => <Can key={i} p={[(i % 3 - 1) * 0.095, 0.08, (Math.floor(i / 3) - 0.5) * 0.095]} col={col} />)}
    <Box p={[0, 0.17, 0]} s={[0.3, 0.012, 0.2]} c="#e8e8e8" line={false} /></group>);
// чайник
export const Kettle: React.FC<{ p: V3; col?: string }> = ({ p, col = "#d64545" }) => (
  <group position={p}>
    <Sph p={[0, 0.15, 0]} r={0.17} c={col} s={[1, 0.85, 1]} rough={0.3} />
    <mesh position={[0.2, 0.2, 0]} rotation={[0, 0, -0.9]}><cylinderGeometry args={[0.025, 0.045, 0.2, 12]} /><meshStandardMaterial color={col} roughness={0.3} /></mesh>
    <mesh position={[-0.17, 0.2, 0]} rotation={[0, 0, Math.PI / 2]}><torusGeometry args={[0.08, 0.018, 8, 20, Math.PI]} /><meshStandardMaterial color="#222" /></mesh>
    <Cyl p={[0, 0.3, 0]} r={0.07} h={0.03} c="#222" /><Sph p={[0, 0.33, 0]} r={0.025} c="#222" />
  </group>);
// машина
export const Car: React.FC<{ p: V3; col: string; rotY?: number; scale?: number }> = ({ p, col, rotY = 0, scale = 1 }) => (
  <group position={p} rotation={[0, rotY, 0]} scale={scale}>
    <Box p={[0, 0.38, 0]} s={[2.0, 0.42, 0.9]} c={col} r={0.35} metal={0.2} />
    <Box p={[-0.1, 0.75, 0]} s={[1.1, 0.36, 0.8]} c={col} r={0.35} metal={0.2} />
    <Box p={[-0.1, 0.75, 0.405]} s={[0.95, 0.26, 0.01]} c="#9fd0f0" line={false} /><Box p={[-0.1, 0.75, -0.405]} s={[0.95, 0.26, 0.01]} c="#9fd0f0" line={false} />
    <Box p={[0.46, 0.75, 0]} s={[0.01, 0.28, 0.72]} c="#9fd0f0" line={false} rot={[0, 0, -0.35]} />
    {[[-0.65, 0.42], [0.65, 0.42], [-0.65, -0.42], [0.65, -0.42]].map(([x, z], i) => <mesh key={i} position={[x, 0.18, z]} rotation={[Math.PI / 2, 0, 0]}><cylinderGeometry args={[0.18, 0.18, 0.1, 18]} /><meshStandardMaterial color="#1a1a1a" /></mesh>)}
    <Box p={[1.0, 0.42, 0.3]} s={[0.02, 0.08, 0.15]} c="#fff6c0" e="#fff6c0" ei={0.6} line={false} /><Box p={[1.0, 0.42, -0.3]} s={[0.02, 0.08, 0.15]} c="#fff6c0" e="#fff6c0" ei={0.6} line={false} />
  </group>);
// дерево
export const Tree: React.FC<{ p: V3; h?: number }> = ({ p, h = 2.6 }) => (
  <group position={p}><Cyl p={[0, h * 0.35, 0]} r={0.09} h={h * 0.7} c="#7a5030" />
    <Sph p={[0, h * 0.78, 0]} r={0.7} c="#3fa85a" /><Sph p={[0.35, h * 0.68, 0.1]} r={0.5} c="#4fb868" /><Sph p={[-0.35, h * 0.7, -0.1]} r={0.5} c="#38984f" /></group>);
// фонарь
export const StreetLamp: React.FC<{ p: V3; on?: boolean }> = ({ p, on = false }) => (
  <group position={p}><Cyl p={[0, 1.6, 0]} r={0.05} h={3.2} c="#3a3a44" /><Box p={[0.25, 3.15, 0]} s={[0.6, 0.06, 0.08]} c="#3a3a44" />
    <mesh position={[0.5, 3.08, 0]}><boxGeometry args={[0.22, 0.08, 0.18]} /><meshBasicMaterial color={on ? new THREE.Color("#ffe8a0").multiplyScalar(1.3) : new THREE.Color("#ddd")} toneMapped={!on} /></mesh></group>);

// дом с окнами, дверью, балконами, козырьком и вывеской
export const House: React.FC<{ p: V3; w: number; h: number; c: string; sign?: string; signCol?: string; night?: boolean; seed?: number }> = ({ p, w, h, c, sign, signCol = "#2f6fd6", night = false, seed = 1 }) => {
  const tex = useMemo(() => canvasTex(512, Math.round((512 * h) / w), (g) => {
    const W = 512, H = Math.round((512 * h) / w); g.fillStyle = c; g.fillRect(0, 0, W, H);
    g.fillStyle = "rgba(0,0,0,0.06)"; for (let y = 0; y < H; y += 14) g.fillRect(0, y, W, 2);
    const nx = Math.max(2, Math.round(w * 1.2)), ny = Math.max(2, Math.round((h - 1.2) * 1.0));
    for (let i = 0; i < nx; i++) for (let j = 0; j < ny; j++) {
      const x = ((i + 0.2) * W) / nx, y = (j * (H * (1 - 1.3 / h))) / ny + H * 0.04, ww = (0.6 * W) / nx, hh = (0.6 * H * (1 - 1.3 / h)) / ny;
      const lit = ((i * 7 + j * 13 + seed * 5) % 10) / 10 < (night ? 0.85 : 0.15);
      g.fillStyle = "#f4f0e8"; g.fillRect(x - 5, y - 5, ww + 10, hh + 10);
      g.fillStyle = lit ? (night ? "#7fd0ff" : "#ffe7a8") : "#4a6a8a"; g.fillRect(x, y, ww, hh);
      if (night && lit) { g.fillStyle = "rgba(255,80,200,0.35)"; g.fillRect(x, y + hh * 0.5, ww, hh * 0.5); }
      g.fillStyle = "#f4f0e8"; g.fillRect(x + ww / 2 - 2, y, 4, hh);
    }
  }), [c, w, h, night, seed]);
  return (<group position={p}>
    <Box p={[0, h / 2, 0]} s={[w, h, 2.5]} c="#ffffff" map={tex} r={0.9} />
    <Box p={[0, h + 0.08, 0]} s={[w + 0.2, 0.16, 2.7]} c="#5a4a4a" />
    <Box p={[0, 0.65, 1.26]} s={[0.9, 1.3, 0.04]} c="#6a4a3a" />
    <Box p={[0, 1.45, 1.45]} s={[1.4, 0.06, 0.45]} c={signCol} />
    {sign ? <Sign p={[0, 1.75, 1.27]} w={Math.min(w * 0.8, 2.2)} h={0.42} text={sign} bg={signCol} fg="#fff" glow={night ? 1.0 : 0.3} /> : null}
    {[0.45, 0.75].map((k, i) => <Box key={i} p={[(i ? 1 : -1) * w * 0.25, h * k, 1.35]} s={[w * 0.35, 0.06, 0.3]} c="#e8e2d8" />)}
  </group>);
};

// ------------------------------------------------------------------ ЛОКАЦИИ
// Тёплая квартира: обои, окно с городом, ТВ на тумбе, приставка, диван с пледом, ковёр, полки, торшер
export const Apartment: React.FC<{ tv: Draw; night?: boolean; clock?: (s: number) => string; cal?: Draw; dawn?: boolean; console?: boolean }> = ({ tv, night = false, clock, cal, dawn = false, console: con = true }) => {
  const wall = useMemo(() => canvasTex(512, 256, (g) => { g.fillStyle = "#e8c9a0"; g.fillRect(0, 0, 512, 256); g.fillStyle = "#dcb88c"; for (let x = 0; x < 512; x += 32) g.fillRect(x, 0, 14, 256);
    g.fillStyle = "#c9a074"; for (let x = 16; x < 512; x += 64) for (let y = 20; y < 256; y += 60) { g.beginPath(); g.arc(x, y, 5, 0, 7); g.fill(); } }), []);
  wall.wrapS = wall.wrapT = THREE.RepeatWrapping; wall.repeat.set(3, 1.5);
  const rug = useMemo(() => canvasTex(512, 320, (g) => { g.fillStyle = "#b8483a"; g.fillRect(0, 0, 512, 320); g.strokeStyle = "#f2d29a"; g.lineWidth = 10; g.strokeRect(20, 20, 472, 280);
    g.fillStyle = "#2f6f7a"; for (let i = 0; i < 5; i++) { g.beginPath(); g.moveTo(256, 60 + i * 10); g.lineTo(380 - i * 20, 160); g.lineTo(256, 260 - i * 10); g.lineTo(132 + i * 20, 160); g.closePath(); g.fill(); g.fillStyle = i % 2 ? "#2f6f7a" : "#f2d29a"; } }), []);
  const view = useMemo(() => canvasTex(512, 512, (g) => {
    const gr = g.createLinearGradient(0, 0, 0, 512);
    if (night) { gr.addColorStop(0, "#0a0f2a"); gr.addColorStop(1, "#24305a"); } else if (dawn) { gr.addColorStop(0, "#8ab4e8"); gr.addColorStop(1, "#ffb88a"); } else { gr.addColorStop(0, "#7ab8f0"); gr.addColorStop(1, "#d8ecff"); }
    g.fillStyle = gr; g.fillRect(0, 0, 512, 512);
    for (let i = 0; i < 7; i++) { const x = i * 78, bh = 180 + ((i * 57) % 160); g.fillStyle = night ? "#1a2040" : "#8a9ab8"; g.fillRect(x, 512 - bh, 70, bh);
      for (let yy = 512 - bh + 12; yy < 500; yy += 26) for (let xx = x + 8; xx < x + 62; xx += 18) if ((xx * 3 + yy) % 7 < (night ? 4 : 2)) { g.fillStyle = night ? "#ffd27a" : "#c8d8f0"; g.fillRect(xx, yy, 9, 13); } }
    if (night) { g.fillStyle = "#fff"; g.beginPath(); g.arc(420, 80, 30, 0, 7); g.fill(); }
  }), [night, dawn]);
  return (<>
    <Box p={[0, -0.05, 0]} s={[6, 0.1, 4]} c="#a8784a" line={false} r={0.8} />
    {Array.from({ length: 12 }, (_, i) => <Box key={i} p={[-2.75 + i * 0.5, 0.001, 0]} s={[0.02, 0.002, 4]} c="#8a5e38" line={false} shadow={false} />)}
    <Box p={[0, 3.05, 0]} s={[6, 0.1, 4]} c="#f4ece0" />
    <mesh position={[0, 1.5, -2.0]} receiveShadow><planeGeometry args={[6, 3]} /><meshStandardMaterial map={wall} roughness={0.9} /></mesh>
    <mesh position={[-3.0, 1.5, 0]} rotation={[0, Math.PI / 2, 0]} receiveShadow><planeGeometry args={[4, 3]} /><meshStandardMaterial map={wall} roughness={0.9} /></mesh>
    <mesh position={[3.0, 1.5, 0]} rotation={[0, -Math.PI / 2, 0]} receiveShadow><planeGeometry args={[4, 3]} /><meshStandardMaterial map={wall} roughness={0.9} /></mesh>
    <Box p={[0, 0.06, -1.98]} s={[6, 0.12, 0.04]} c="#f4ece0" />
    {/* окно с видом */}
    <Box p={[-1.6, 1.75, -1.98]} s={[1.5, 1.4, 0.06]} c="#f4f0e8" />
    <mesh position={[-1.6, 1.75, -1.94]}><planeGeometry args={[1.3, 1.2]} /><meshBasicMaterial map={view} toneMapped={false} color={night ? [0.9, 0.9, 0.9] : [1, 1, 1]} /></mesh>
    <Box p={[-1.6, 1.75, -1.92]} s={[0.05, 1.2, 0.03]} c="#f4f0e8" /><Box p={[-1.6, 1.75, -1.92]} s={[1.3, 0.05, 0.03]} c="#f4f0e8" />
    <Box p={[-1.6, 1.03, -1.85]} s={[1.6, 0.05, 0.25]} c="#f4f0e8" />
    <Box p={[-2.5, 1.7, -1.9]} s={[0.35, 1.9, 0.06]} c="#5a7ab8" /><Box p={[-0.72, 1.7, -1.9]} s={[0.35, 1.9, 0.06]} c="#5a7ab8" />
    <Plant p={[-2.0, 1.05, -1.85]} h={0.4} />
    {/* ТВ на тумбе + приставка */}
    <Box p={[1.0, 0.28, -1.7]} s={[1.9, 0.56, 0.5]} c="#6a4a3a" />
    {[0.55, 1.45].map((x) => <Box key={x} p={[x, 0.28, -1.44]} s={[0.7, 0.4, 0.02]} c="#7a5a48" />)}
    <Box p={[1.0, 1.18, -1.85]} s={[1.6, 0.94, 0.06]} c="#121218" />
    <Screen p={[1.0, 1.18, -1.81]} w={1.5} h={0.84} draw={tv} res={1280} />
    <Box p={[1.0, 0.62, -1.75]} s={[0.3, 0.12, 0.2]} c="#222" />
    {con ? <><Console p={[0.3, 0.56, -1.62]} scale={0.9} /><Pad p={[1.5, 0.6, -1.55]} scale={1.0} rot={[0, -0.4, 0]} /></> : null}
    {/* диван с пледом и подушками */}
    <group position={[-1.0, 0, -1.1]}>
      <Box p={[0, 0.25, 0]} s={[1.9, 0.42, 0.85]} c="#4f7a6a" r={0.95} /><Box p={[0, 0.72, -0.35]} s={[1.9, 0.6, 0.2]} c="#4f7a6a" r={0.95} />
      {[-1, 1].map((s) => <Box key={s} p={[s * 0.9, 0.5, 0]} s={[0.15, 0.4, 0.85]} c="#45695b" r={0.95} />)}
      <Box p={[-0.55, 0.62, -0.18]} s={[0.4, 0.34, 0.14]} c="#f2c230" rot={[0.2, 0, 0.15]} /><Box p={[0.6, 0.62, -0.18]} s={[0.4, 0.34, 0.14]} c="#e46b2b" rot={[0.2, 0, -0.1]} />
      <Box p={[0.2, 0.48, 0.1]} s={[0.9, 0.05, 0.75]} c="#c9455a" rot={[0, 0.2, 0]} />
    </group>
    {/* ковёр, журнальный столик, кружка */}
    <mesh position={[0.2, 0.004, -0.2]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow><planeGeometry args={[2.6, 1.6]} /><meshStandardMaterial map={rug} /></mesh>
    {/* полка с книгами, постеры, торшер */}
    <Shelf p={[2.55, 0, -1.55]} w={0.8} h={1.7} />
    <Tex p={[2.2, 2.25, -1.98]} w={0.6} h={0.8} draw={(g, W, H) => { const gr = g.createLinearGradient(0, 0, 0, H); gr.addColorStop(0, "#2a1458"); gr.addColorStop(1, "#ff4f9a"); g.fillStyle = gr; g.fillRect(0, 0, W, H);
      g.fillStyle = "#ffe14d"; g.beginPath(); g.arc(W / 2, H * 0.7, W * 0.3, Math.PI, 0); g.fill(); fitText(g, "VICE", W / 2, H * 0.25, W * 0.8, H * 0.16, "#fff"); g.strokeStyle = "#5a3a2a"; g.lineWidth = 16; g.strokeRect(0, 0, W, H); }} glow={0.15} />
    <Tex p={[0.15, 2.3, -1.98]} w={0.5} h={0.5} draw={(g, W, H) => { g.fillStyle = "#2f6fd6"; g.fillRect(0, 0, W, H); fitText(g, "🎮", W / 2, H / 2, W * 0.7, H * 0.6, "#fff"); g.strokeStyle = "#5a3a2a"; g.lineWidth = 16; g.strokeRect(0, 0, W, H); }} glow={0.15} />
    {cal ? <Screen p={[2.2, 1.35, -1.97]} w={0.6} h={0.75} draw={cal} res={360} basic={false} glow={0.35} /> : null}
    {clock ? <Screen p={[1.55, 0.72, -1.62]} w={0.36} h={0.14} draw={(g, s, W, H) => { g.fillStyle = "#101014"; g.fillRect(0, 0, W, H); fitText(g, "88:88", W / 2, H / 2 + 3, W * 0.86, H * 0.72, "#2a1416", "Oswald, " + FONT); fitText(g, clock(s), W / 2, H / 2 + 3, W * 0.86, H * 0.72, RED, "Oswald, " + FONT); }} res={600} glow={0.85} /> : null}
    <group position={[-2.55, 0, -0.6]}><Cyl p={[0, 0.8, 0]} r={0.03} h={1.6} c="#3a3a3a" /><mesh position={[0, 1.65, 0]}><cylinderGeometry args={[0.12, 0.22, 0.28, 20, 1, true]} /><meshStandardMaterial color="#f4e0b8" emissive="#ffd890" emissiveIntensity={night ? 0.8 : 0.2} side={THREE.DoubleSide} /></mesh></group>
    {night ? <pointLight position={[1.0, 1.2, -1.0]} intensity={6} decay={1.5} color="#8ab8ff" /> : null}
  </>);
};

// Город: дорога, тротуар, детальные дома, деревья, машины, фонари
export const City: React.FC<{ night?: boolean; cars?: boolean; empty?: boolean; t0?: number; sky?: "day" | "night" | "dawn" }> = ({ night = false, cars = true, empty = false, t0 = 0, sky }) => {
  const sec = useSec(); const u = sec - t0; const sk = sky ?? (night ? "night" : "day");
  const skyTex = useMemo(() => canvasTex(512, 512, (g) => { const gr = g.createLinearGradient(0, 0, 0, 512);
    if (sk === "night") { gr.addColorStop(0, "#0a0f2a"); gr.addColorStop(1, "#2a3a6a"); } else if (sk === "dawn") { gr.addColorStop(0, "#6a8ad8"); gr.addColorStop(0.7, "#ffb88a"); gr.addColorStop(1, "#ffd8a8"); } else { gr.addColorStop(0, "#5aa0e8"); gr.addColorStop(1, "#cfe6ff"); }
    g.fillStyle = gr; g.fillRect(0, 0, 512, 512); if (sk === "night") { g.fillStyle = "#fff"; for (let i = 0; i < 60; i++) g.fillRect((i * 97) % 512, (i * 53) % 260, 2, 2); }
    else { g.fillStyle = "rgba(255,255,255,0.85)"; for (const [x, y, r] of [[90, 90, 40], [130, 80, 50], [170, 95, 36], [360, 140, 34], [400, 130, 44]]) { g.beginPath(); g.arc(x, y, r, 0, 7); g.fill(); } } }), [sk]);
  return (<>
    <mesh position={[0, 8, -20]}><planeGeometry args={[60, 24]} /><meshBasicMaterial map={skyTex} toneMapped={false} fog={false} /></mesh>
    <Box p={[0, -0.05, -3]} s={[40, 0.1, 30]} c={night ? "#2a2a36" : "#4a4a56"} line={false} />
    <Box p={[0, 0.06, -4.6]} s={[40, 0.12, 2.6]} c={night ? "#5a5466" : "#b8b0c0"} line={false} />
    <Box p={[0, 0.06, 1.9]} s={[40, 0.12, 1.4]} c={night ? "#5a5466" : "#b8b0c0"} line={false} />
    {Array.from({ length: 14 }, (_, i) => <Box key={i} p={[-18 + i * 2.8, 0.01, -1.4]} s={[1.2, 0.02, 0.12]} c="#f2e6a0" line={false} shadow={false} />)}
    {Array.from({ length: 6 }, (_, i) => <Box key={"z" + i} p={[3.5, 0.012, -0.2 - i * 0.45]} s={[1.6, 0.02, 0.25]} c="#f4f4f4" line={false} shadow={false} />)}
    <House p={[-8.4, 0, -7.5]} w={3.6} h={6} c="#e8a0b8" sign="АПТЕКА" signCol="#3fb27f" night={night} seed={1} />
    <House p={[-4.5, 0, -7.5]} w={3.8} h={8} c="#9fd0c9" sign="КАФЕ" signCol={ORG} night={night} seed={2} />
    <House p={[-0.4, 0, -7.5]} w={4.0} h={5.5} c="#f2d8a0" sign="ПРОДУКТЫ 24" signCol="#2f6fd6" night={night} seed={3} />
    <House p={[3.8, 0, -7.5]} w={3.8} h={7.2} c="#c0a8e8" sign="БАНК" signCol="#5a4a8a" night={night} seed={4} />
    <House p={[7.8, 0, -7.5]} w={3.6} h={6.2} c="#ffb8a0" sign="ТЕХНИКА" signCol={RED} night={night} seed={5} />
    {[-6.4, -2.4, 1.8, 5.8].map((x, i) => <Tree key={i} p={[x, 0.1, -4.6]} h={2.6 + (i % 2) * 0.4} />)}
    {[-9, -3, 3, 9].map((x, i) => <StreetLamp key={i} p={[x, 0.1, -3.6]} on={night} />)}
    {cars ? <><Car p={[-5, 0, -2.6]} col="#e64b4b" /><Car p={[0.5, 0, -2.6]} col="#2f8fe0" rotY={Math.PI} /><Car p={[6, 0, -2.6]} col="#f2c230" /></> : null}
    {empty ? <group position={[lerp(-5, 5, clamp(u / 3.2)), 0.35 + Math.abs(Math.sin(u * 5)) * 0.25, -0.8]} rotation={[0, 0, -u * 4]}>
      {Array.from({ length: 14 }, (_, i) => <mesh key={i} rotation={[i, i * 2, i * 3]}><torusGeometry args={[0.35, 0.025, 6, 18]} /><meshStandardMaterial color="#a8844a" /></mesh>)}</group> : null}
    {empty ? <group position={[2.4, 0.1, -3.4]}><Cyl p={[0, 1.4, 0]} r={0.06} h={2.8} c="#333" /><Box p={[0, 2.95, 0]} s={[0.35, 0.9, 0.3]} c="#222" />
      <mesh position={[0, 2.95, 0.16]}><circleGeometry args={[0.11, 20]} /><meshBasicMaterial color={new THREE.Color(YEL).multiplyScalar(Math.floor(sec * 2) % 2 ? 1.6 : 0.3)} toneMapped={false} /></mesh></group> : null}
  </>);
};

// Кабина самолёта: штурвалы, приборы, окна с полосой
export const Cockpit: React.FC = () => {
  const sec = useSec();
  const win = useMemo(() => canvasTex(512, 256, (g) => { const gr = g.createLinearGradient(0, 0, 0, 256); gr.addColorStop(0, "#5aa0e8"); gr.addColorStop(0.6, "#d8ecff"); gr.addColorStop(0.61, "#6a6a72"); gr.addColorStop(1, "#4a4a52"); g.fillStyle = gr; g.fillRect(0, 0, 512, 256);
    g.fillStyle = "#f4f4f4"; for (let i = 0; i < 6; i++) g.fillRect(250 - i * 6, 160 + i * 16, 12 + i * 4, 10); g.fillStyle = "#8a8a92"; g.fillRect(40, 140, 80, 18); g.fillRect(380, 140, 100, 18); }), []);
  return (<>
    <Box p={[0, -0.05, 0]} s={[4, 0.1, 4]} c="#3a3a44" line={false} />
    <Box p={[0, 3.0, 0]} s={[4, 0.1, 4]} c="#d8dce4" />
    <Box p={[-1.9, 1.5, 0]} s={[0.1, 3, 4]} c="#c8ccd4" /><Box p={[1.9, 1.5, 0]} s={[0.1, 3, 4]} c="#c8ccd4" />
    <Box p={[0, 2.4, -1.6]} s={[3.8, 1.2, 0.1]} c="#c8ccd4" />
    {[-0.85, 0.85].map((x) => <mesh key={x} position={[x, 1.85, -1.54]}><planeGeometry args={[1.5, 0.75]} /><meshBasicMaterial map={win} toneMapped={false} /></mesh>)}
    <Box p={[0, 0.7, -1.3]} s={[3.6, 1.4, 0.6]} c="#2a2d36" />
    <Screen p={[0, 1.15, -0.99]} rot={[-0.5, 0, 0]} w={3.2} h={0.4} res={1000} draw={(g, s, W, H) => { g.fillStyle = "#15171d"; g.fillRect(0, 0, W, H);
      for (let i = 0; i < 6; i++) { const x = W * (0.08 + i * 0.168); g.fillStyle = "#0a0c10"; rr(g, x - W * 0.06, H * 0.1, W * 0.12, H * 0.8, 10); g.fill();
        g.strokeStyle = i % 2 ? "#3fff8f" : "#2fe0ff"; g.lineWidth = 4; g.beginPath(); g.arc(x, H * 0.5, H * 0.3, 0, 7); g.stroke(); g.beginPath(); g.moveTo(x, H * 0.5); g.lineTo(x + Math.cos(s * 2 + i) * H * 0.25, H * 0.5 + Math.sin(s * 2 + i) * H * 0.25); g.stroke(); } }} />
    {[-0.85, 0.85].map((x) => <group key={x} position={[x, 0.95, -0.85]}><Cyl p={[0, 0, 0]} r={0.03} h={0.3} c="#222" rot={[Math.PI / 2, 0, 0]} /><Box p={[0, 0.06, 0.15]} s={[0.5, 0.06, 0.06]} c="#222" /></group>)}
    <Sign p={[0, 2.3, -1.54]} w={1.2} h={0.18} text="✈ БОРТ GTA-6" bg="#2a2d36" fg="#fff" glow={0.4} />
    <Box p={[0.85, 0.5, 0.2]} s={[0.7, 0.1, 0.6]} c="#4a3a2a" /><Box p={[0.85, 1.0, 0.5]} s={[0.7, 1.0, 0.12]} c="#4a3a2a" />
    <mesh position={[0, 2.9, 0]}><boxGeometry args={[0.2, 0.08, 0.2]} /><meshBasicMaterial color={new THREE.Color(RED).multiplyScalar(Math.floor(sec * 2) % 2 ? 1.5 : 0.3)} toneMapped={false} /></mesh>
  </>);
};

// Поезд с кабиной, фарами, колёсами; платформа; табло; записка в окне кабины
export const Train: React.FC<{ board: Draw }> = ({ board }) => (<>
  <mesh position={[0, 8, -20]}><planeGeometry args={[60, 24]} /><meshBasicMaterial color="#9fc8e8" /></mesh>
  <Box p={[0, -0.05, -2]} s={[20, 0.1, 12]} c="#7a7a84" line={false} />
  <Box p={[0, 0.35, 0.6]} s={[20, 0.7, 2.2]} c="#b8b0c0" />
  <Box p={[0, 0.72, -0.48]} s={[20, 0.04, 0.12]} c={YEL} line={false} />
  {[-0.9, -2.0].map((z) => <Box key={z} p={[0, 0.06, z]} s={[20, 0.06, 0.08]} c="#8a8a92" line={false} />)}
  <group position={[-1.5, 0, -1.45]}>
    <Box p={[-1.5, 1.35, 0]} s={[6, 1.9, 1.6]} c="#d64545" r={0.5} />
    <Box p={[-1.5, 2.36, 0]} s={[6, 0.14, 1.5]} c="#f2f2f2" />
    <Box p={[-1.5, 0.95, 0.81]} s={[6, 0.12, 0.02]} c="#f2f2f2" line={false} />
    {[-3.6, -2.6, -1.6, -0.6].map((x) => <Box key={x} p={[x, 1.65, 0.81]} s={[0.7, 0.55, 0.02]} c="#9fd0f0" line={false} />)}
    <Box p={[1.95, 1.2, 0]} s={[0.9, 1.6, 1.6]} c="#d64545" r={0.5} rot={[0, 0, 0]} />
    <Box p={[2.38, 1.8, 0]} s={[0.06, 0.7, 1.3]} c="#9fd0f0" rot={[0, 0, -0.3]} line={false} />
    <Sign p={[2.45, 1.75, 0.0]} w={0.7} h={0.36} text="УШЁЛ В GTA" bg="#ffffff" fg={RED} glow={0.4} rot={[0, Math.PI / 2, 0]} />
    <Box p={[1.95, 1.75, 0.81]} s={[0.6, 0.5, 0.02]} c="#9fd0f0" line={false} />
    <Sign p={[1.95, 1.75, 0.83]} w={0.55} h={0.3} text="УШЁЛ В GTA" bg="#ffffff" fg={RED} glow={0.4} />
    {[[2.42, 0.75, 0.5], [2.42, 0.75, -0.5]].map((q, i) => <mesh key={i} position={q as V3} rotation={[0, Math.PI / 2, 0]}><circleGeometry args={[0.12, 20]} /><meshBasicMaterial color={new THREE.Color("#fff6c0").multiplyScalar(0.9)} toneMapped={false} /></mesh>)}
    {[-4, -2.8, -0.6, 0.6, 1.8].map((x) => <mesh key={x} position={[x, 0.3, 0.82]}><cylinderGeometry args={[0.28, 0.28, 0.08, 20]} /><meshStandardMaterial color="#222" /></mesh>)}
  </group>
  <Box p={[2.6, 2.6, 0.4]} s={[2.4, 0.9, 0.08]} c="#05060a" />
  <Screen p={[2.6, 2.6, 0.45]} w={2.3} h={0.82} res={700} draw={board} />
  <Cyl p={[2.6, 1.6, 0.4]} r={0.05} h={2.2} c="#333" />
</>);

// Поликлиника: стулья, стол врача, плакат симптомов
export const Clinic2: React.FC = () => (<>
  <Room wall="#d8eee8" floor="#a8c0c8" wain="#b8dcd4" ceil="#f4f8f6" />
  <Sign p={[-0.6, 2.6, -1.97]} w={2.2} h={0.34} text="ПОЛИКЛИНИКА №19" bg="#2f8f8f" fg="#fff" glow={0.4} />
  <Screen p={[1.5, 1.85, -1.96]} w={1.5} h={1.15} res={600} basic={false} glow={0.4} draw={(g, s, W, H) => { g.fillStyle = "#fff"; g.fillRect(0, 0, W, H); g.fillStyle = RED; g.fillRect(0, 0, W, H * 0.2); fitText(g, "ГРИПП GTA: СИМПТОМЫ", W / 2, H * 0.1, W * 0.9, H * 0.12, "#fff");
    ["👀 красные глаза", "🤲 трясутся руки", "🚗 хочет угнать машину"].forEach((t, i) => fitText(g, t, W / 2, H * (0.38 + i * 0.22), W * 0.9, H * 0.12, INK)); }} />
  {[-2.5, -1.9, -1.3, -0.7].map((x) => <group key={x}><Box p={[x, 0.45, -1.55]} s={[0.5, 0.06, 0.45]} c="#4a8fd6" /><Box p={[x, 0.75, -1.76]} s={[0.5, 0.6, 0.05]} c="#4a8fd6" />
    <Cyl p={[x - 0.2, 0.22, -1.4]} r={0.02} h={0.44} c="#888" /><Cyl p={[x + 0.2, 0.22, -1.4]} r={0.02} h={0.44} c="#888" /></group>)}
  <Desk p={[1.5, 0, -0.9]} w={1.3} c="#e9eef0" />
  <Box p={[1.2, 0.84, -0.9]} s={[0.35, 0.02, 0.25]} c="#fff" line={false} /><Cyl p={[1.85, 0.86, -0.9]} r={0.04} h={0.12} c="#2f8fe0" />
  <Sign p={[-2.8, 1.6, -1.97]} w={0.4} h={0.4} text="✚" bg="#fff" fg={RED} glow={0.3} sz={160} />
  <Plant p={[2.6, 0, -1.6]} h={0.7} />
  <Lamp p={[0, 2.97, -0.3]} />
</>);

// Магазин техники: стеллажи с пустыми коробками-ценниками, пара оставшихся телевизоров
export const Shop2: React.FC = () => (<>
  <Room wall="#eceaf4" floor="#c9c4d6" wain="#d6d0e6" ceil="#f4f2f8" />
  <Sign p={[0, 2.62, -1.97]} w={2.6} h={0.38} text="МИР ТЕХНИКИ" bg="#ffd23f" fg="#1a1020" glow={0.5} />
  {[-1.7, 0, 1.7].map((x, i) => <group key={i}>
    <Box p={[x, 1.0, -1.75]} s={[1.5, 2.0, 0.4]} c="#f8f8fb" />
    {[0.4, 0.95, 1.5].map((y) => <Box key={y} p={[x, y, -1.55]} s={[1.5, 0.04, 0.45]} c="#bfbccc" />)}
    {[0.45, 1.0, 1.55].map((y, j) => <Sign key={j} p={[x, y - 0.06, -1.32]} w={0.5} h={0.12} text={i === 1 ? "PS5 — 0 шт" : "XBOX — 0 шт"} bg="#fff" fg={RED} glow={0.3} />)}
    <Sign p={[x, 1.25, -1.52]} w={1.1} h={0.28} text={i === 1 ? "PS5 — НЕТ" : "XBOX — НЕТ"} bg={RED} fg="#fff" glow={0.5} />
  </group>)}
  <Box p={[-1.7, 0.56, -1.55]} s={[0.28, 0.24, 0.24]} c="#ddd" rot={[0, 0.4, 0.3]} />
  <Box p={[2.6, 0.4, -0.6]} s={[0.6, 0.8, 0.6]} c="#2f6fd6" />
  <Sign p={[2.6, 0.95, -0.29]} w={0.55} h={0.2} text="КАССА" bg="#fff" fg="#2f6fd6" glow={0.3} />
  <Lamp p={[0, 2.97, -0.4]} len={3} />
</>);

// Ночной магазин 24/7: холодильники с банками, стеллажи со снеками, касса
export const Store2: React.FC = () => {
  const fridge = useMemo(() => canvasTex(256, 512, (g) => { g.fillStyle = "#cfe8f4"; g.fillRect(0, 0, 256, 512);
    for (let r = 0; r < 5; r++) { g.fillStyle = "#9ab8c8"; g.fillRect(0, 96 + r * 100, 256, 6); for (let c = 0; c < 6; c++) { g.fillStyle = ["#3fff8f", "#2f2f2f", "#ffd23f", "#ff4f9a", "#2fe0ff"][(r + c) % 5]; rr(g, 12 + c * 40, 30 + r * 100, 30, 64, 6); g.fill(); } } }), []);
  return (<>
    <Room wall="#e8f0f0" floor="#b8c4c8" wain="#cfe0e0" ceil="#f4f8f8" />
    <Sign p={[0, 2.62, -1.97]} w={1.6} h={0.38} text="24 ЧАСА" bg="#3fb27f" fg="#fff" glow={0.6} />
    {[-2.3, -1.5].map((x) => <group key={x}><Box p={[x, 1.0, -1.7]} s={[0.75, 2.0, 0.6]} c="#d8dce4" /><mesh position={[x, 1.05, -1.39]}><planeGeometry args={[0.65, 1.75]} /><meshStandardMaterial map={fridge} emissive="#fff" emissiveMap={fridge} emissiveIntensity={0.35} /></mesh></group>)}
    <group position={[2.2, 0, -1.55]}>{[0.3, 0.75, 1.2, 1.65].map((y) => <Box key={y} p={[0, y, 0]} s={[1.3, 0.04, 0.5]} c="#c8c0b0" />)}<Box p={[0, 0.95, -0.24]} s={[1.3, 1.9, 0.04]} c="#c8c0b0" />
      {[0.3, 0.75, 1.2].flatMap((y, r) => [-0.4, 0, 0.4].map((x, c) => <Chips key={r + "_" + c} p={[x, y + 0.2, 0]} col={[RED, YEL, "#3fb27f", CYAN, PINK, ORG][(r * 3 + c) % 6]} scale={0.55} />))}</group>
    <Box p={[0.3, 0.5, -0.9]} s={[1.8, 1.0, 0.6]} c="#2f6fd6" /><Box p={[0.3, 1.02, -0.9]} s={[1.9, 0.05, 0.65]} c="#e9eef8" />
    <Box p={[0.95, 1.18, -0.95]} s={[0.35, 0.26, 0.3]} c="#333" /><Box p={[0.95, 1.38, -1.05]} s={[0.3, 0.2, 0.04]} c="#111" />
    <Lamp p={[0, 2.97, -0.4]} len={3} />
  </>);
};

// Кухня: плита, чайник с паром, счётчик «×N»
export const Kitchen2: React.FC<{ t0: number }> = ({ t0 }) => {
  const sec = useSec(); const n = Math.min(4, 1 + Math.floor((sec - t0) * 2.2));
  const tile = useMemo(() => canvasTex(256, 256, (g) => { g.fillStyle = "#f4f0e8"; g.fillRect(0, 0, 256, 256); g.strokeStyle = "#c8c0b0"; g.lineWidth = 3; for (let i = 0; i <= 256; i += 32) { g.beginPath(); g.moveTo(i, 0); g.lineTo(i, 256); g.moveTo(0, i); g.lineTo(256, i); g.stroke(); } }), []);
  tile.wrapS = tile.wrapT = THREE.RepeatWrapping; tile.repeat.set(4, 2);
  return (<>
    <Room wall="#e8d8b8" floor="#a88a6a" wain="#d8c4a0" ceil="#f4ecdc" side={false} />
    <mesh position={[0, 1.35, -1.94]}><planeGeometry args={[4, 0.8]} /><meshStandardMaterial map={tile} /></mesh>
    <Box p={[0, 0.45, -1.5]} s={[3.6, 0.9, 0.8]} c="#f4f0e8" /><Box p={[0, 0.92, -1.5]} s={[3.7, 0.05, 0.85]} c="#6a5a4a" />
    {[-1.2, -0.4, 0.4, 1.2].map((x) => <Box key={x} p={[x, 0.45, -1.09]} s={[0.75, 0.8, 0.02]} c="#e8e0d0" />)}
    <Box p={[0.2, 0.96, -1.45]} s={[0.7, 0.04, 0.55]} c="#222" />
    {[[-0.05, -1.32], [0.45, -1.32], [-0.05, -1.58], [0.45, -1.58]].map(([x, z], i) => <mesh key={i} position={[x, 0.985, z]} rotation={[-Math.PI / 2, 0, 0]}><ringGeometry args={[0.06, 0.1, 20]} /><meshBasicMaterial color={i === 0 ? "#ff5a2a" : "#555"} /></mesh>)}
    <Kettle p={[-0.05, 0.99, -1.32]} />
    <Smoke p={[0.18, 1.25, -1.32]} t0={t0 - 1} n={10} col="#f4f4f4" size={0.55} />
    <Box p={[-1.3, 1.95, -1.8]} s={[1.2, 0.7, 0.35]} c="#f4f0e8" /><Box p={[1.3, 1.95, -1.8]} s={[1.0, 0.7, 0.35]} c="#f4f0e8" />
    <Cyl p={[-1.3, 1.02, -1.4]} r={0.05} h={0.12} c="#2f6fd6" /><Cyl p={[-1.1, 1.02, -1.4]} r={0.05} h={0.12} c={YEL} />
    <Sign p={[1.2, 1.45, -1.9]} w={0.7} h={0.4} text={`×${n}`} bg="#1a1020" fg={YEL} glow={0.8} />
    <Lamp p={[0, 2.97, -0.6]} />
  </>);
};

// Сцена Take-Two v2: экран, трибуна сбоку, микрофон не перед лицом
export const Stage2: React.FC<{ screen: Draw }> = ({ screen }) => (<>
  <Room wall="#141a2e" floor="#20263c" wain="#10152a" ceil="#0a0d18" />
  <Box p={[0, 1.8, -1.97]} s={[4.2, 2.2, 0.06]} c="#05060a" />
  <Screen p={[0, 1.8, -1.92]} w={4.0} h={2.05} res={900} draw={screen} />
  <Box p={[0, 0.15, -0.9]} s={[4.5, 0.3, 1.8]} c="#2a2f45" />
  <Box p={[1.1, 0.75, -0.7]} s={[0.55, 0.9, 0.4]} c="#3a3f55" />
  <Sign p={[1.1, 0.85, -0.49]} w={0.45} h={0.18} text="TAKE-TWO" bg="#1a1a2a" fg="#fff" glow={0.4} />
  {[-1.8, 1.8].map((x) => <spotLight key={x} position={[x, 2.9, 1]} angle={0.5} penumbra={0.7} intensity={25} decay={1} color="#fff2d8" />)}
</>);

// Поезд v2: локомотив смотрит на камеру (нос к +z). Лобовое стекло с запиской «УШЁЛ В GTA», фары, номер,
// токоприёмник, рельсы со шпалами, перрон с табло и часами.
export const TrainFront: React.FC<{ board: Draw }> = ({ board }) => {
  const sec = useSec();
  const blink = Math.floor(sec * 2) % 2 === 0;
  return (<>
    <mesh position={[0, 8, -22]}><planeGeometry args={[60, 24]} /><meshBasicMaterial color="#a8d0f0" /></mesh>
    <Box p={[0, -0.05, -4]} s={[30, 0.1, 30]} c="#8a8478" line={false} />
    {/* рельсы и шпалы */}
    {Array.from({ length: 22 }, (_, i) => <Box key={i} p={[0, 0.03, 3 - i * 0.6]} s={[1.9, 0.06, 0.18]} c="#5a4030" line={false} />)}
    {[-0.6, 0.6].map((x) => <Box key={x} p={[x, 0.09, -3.5]} s={[0.08, 0.08, 14]} c="#b0b0b8" line={false} metal={0.6} r={0.3} />)}
    {/* локомотив */}
    <group position={[0, 0, -2.6]}>
      <Box p={[0, 1.45, -2.5]} s={[1.9, 2.3, 5]} c="#d64545" r={0.45} />
      <Box p={[0, 0.55, -2.5]} s={[1.95, 0.5, 5]} c="#2a2a32" />
      <Box p={[0, 1.15, 0.0]} s={[1.9, 1.5, 0.12]} c="#d64545" r={0.45} />
      <Box p={[0, 2.25, -0.15]} s={[1.9, 0.75, 0.45]} c="#d64545" r={0.45} rot={[-0.35, 0, 0]} />
      <Box p={[0, 2.2, 0.08]} s={[1.6, 0.6, 0.04]} c="#9fd0f0" rot={[-0.35, 0, 0]} />
      <group position={[0, 2.18, 0.14]} rotation={[-0.35, 0, 0]}><Sign p={[0, 0, 0]} w={0.95} h={0.34} text="УШЁЛ В GTA" bg="#ffffff" fg={RED} glow={0.5} /></group>
      <Box p={[0, 1.5, 0.07]} s={[1.9, 0.14, 0.02]} c={YEL} line={false} />
      <Sign p={[0, 1.22, 0.07]} w={0.7} h={0.24} text="GTA-6" bg="#1a1a22" fg="#fff" glow={0.4} />
      {[-0.65, 0.65].map((x) => <mesh key={x} position={[x, 0.85, 0.08]}><circleGeometry args={[0.13, 24]} /><meshBasicMaterial color={new THREE.Color("#fff6c0").multiplyScalar(0.95)} toneMapped={false} /></mesh>)}
      {[-0.3, 0.3].map((x) => <mesh key={x} position={[x, 0.85, 0.08]}><circleGeometry args={[0.07, 18]} /><meshBasicMaterial color={new THREE.Color(RED).multiplyScalar(blink ? 0.9 : 0.3)} toneMapped={false} /></mesh>)}
      <Box p={[0, 0.35, 0.12]} s={[1.6, 0.25, 0.2]} c="#3a3a44" />
      {[-1, -2.2, -3.4, -4.6].map((z) => <Box key={z} p={[0.96, 1.75, z]} s={[0.02, 0.55, 0.7]} c="#9fd0f0" line={false} />)}
      <Box p={[0, 2.66, -2.5]} s={[1.6, 0.06, 4.5]} c="#9a9aa2" />
      <group position={[0, 2.7, -3]}><Box p={[0, 0.35, 0]} s={[0.05, 0.7, 0.05]} c="#333" rot={[0, 0, 0.6]} /><Box p={[0, 0.65, 0]} s={[1.0, 0.04, 0.08]} c="#333" /></group>
      {[-0.6, -1.8, -3.2, -4.4].flatMap((z) => [-0.97, 0.97].map((x) => <mesh key={z + "_" + x} position={[x, 0.4, z]} rotation={[0, 0, Math.PI / 2]}><cylinderGeometry args={[0.3, 0.3, 0.08, 20]} /><meshStandardMaterial color="#222" /></mesh>))}
    </group>
    {/* перрон: табло, часы, скамейка */}
    <Box p={[2.6, 0.45, -3]} s={[2.2, 0.9, 14]} c="#c8c0b0" />
    <Box p={[1.55, 0.92, -3]} s={[0.12, 0.04, 14]} c={YEL} line={false} />
    <group position={[2.2, 0.9, -3.4]}><Cyl p={[0, 1.2, 0]} r={0.05} h={2.4} c="#333" />
      <Box p={[0, 2.5, 0]} s={[1.8, 0.8, 0.08]} c="#05060a" /><Screen p={[0, 2.5, 0.05]} w={1.7} h={0.72} res={700} draw={board} /></group>
    <group position={[3.2, 0.9, -1.6]}><Box p={[0, 0.45, 0]} s={[1.2, 0.06, 0.45]} c="#8a5a3a" /><Box p={[0, 0.75, -0.2]} s={[1.2, 0.4, 0.06]} c="#8a5a3a" /></group>
  </>);
};
