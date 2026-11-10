// Локации и реквизит ролика. Каждая локация — набор 3D-объектов вокруг (0,0,0); задняя стена комнат z = −2.
import React, { useMemo } from "react";
import * as THREE from "three";
import { Box, Cyl, Sign, Screen, Desk, Chair, Shelf, Plant, Couch, Lamp, Neon, Palm, SunsetSky, Building, Room, canvasTex, fitText, useSec, popAt, bonkAt, clamp, lerp, FONT, V3 } from "./kit";

// ------------------------------------------------------------------ рисование на экранах
export const rr = (g: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) => { g.beginPath(); g.roundRect(x, y, w, h, r); };
export const PINK = "#ff3fa4", CYAN = "#2fe0ff", YEL = "#ffd23f", RED = "#ff3b3b", ORG = "#ff7a2f", INK = "#1a1020";
const sgn = (x: number) => (x < 0 ? -1 : 1);

// логотип «VI» (своя отрисовка: розово-оранжевый градиент)
export const drawLogo = (g: CanvasRenderingContext2D, W: number, H: number, cy: number, s = 1) => {
  const gr = g.createLinearGradient(0, cy - 120 * s, 0, cy + 60 * s); gr.addColorStop(0, "#ffb347"); gr.addColorStop(0.5, PINK); gr.addColorStop(1, "#7b2cff");
  g.fillStyle = gr; g.font = `900 ${200 * s}px ${FONT}`; g.textAlign = "center"; g.textBaseline = "middle";
  g.lineWidth = 14 * s; g.strokeStyle = INK; g.strokeText("VI", W / 2, cy); g.fillText("VI", W / 2, cy);
  fitText(g, "GRAND THEFT AUTO", W / 2, cy - 130 * s, W * 0.8, 40 * s, "#fff");
};
export const drawStamp = (g: CanvasRenderingContext2D, W: number, H: number, sec: number, t: number, text = "ПЕРЕНЕСЕНО", cy = H * 0.55) => {
  if (sec < t) return;
  const k = clamp((sec - t) / 0.12), sc = lerp(2.4, 1, k);
  g.save(); g.translate(W / 2, cy); g.rotate(-0.22); g.scale(sc, sc); g.globalAlpha = k;
  g.strokeStyle = RED; g.lineWidth = 12; rr(g, -W * 0.34, -50, W * 0.68, 100, 14); g.stroke();
  fitText(g, text, 0, 4, W * 0.6, 72, RED); g.restore();
};
export const drawBg = (g: CanvasRenderingContext2D, W: number, H: number, a = "#1d0f3a", b = "#4a1468") => {
  const gr = g.createLinearGradient(0, 0, 0, H); gr.addColorStop(0, a); gr.addColorStop(1, b); g.fillStyle = gr; g.fillRect(0, 0, W, H);
};
export const drawButton = (g: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, txt: string, col: string, pulse = 0) => {
  g.save(); g.translate(x, y); g.scale(1 + pulse, 1 + pulse);
  g.shadowColor = col; g.shadowBlur = 30; g.fillStyle = col; rr(g, -w / 2, -h / 2, w, h, h / 2); g.fill(); g.shadowBlur = 0;
  g.lineWidth = 8; g.strokeStyle = "#fff"; g.stroke(); fitText(g, txt, 0, 4, w * 0.8, h * 0.55, "#fff"); g.restore();
};
// экран монитора/ТВ — режимы
export type MonMode = { kind: "title"; stamp?: number } | { kind: "play"; press?: number } | { kind: "changed" } | { kind: "released"; t?: number } | { kind: "ps9"; t?: number } | { kind: "off" } | { kind: "final" };
export const monitorDraw = (m: MonMode) => (g: CanvasRenderingContext2D, sec: number, W: number, H: number) => {
  if (m.kind === "title") { drawBg(g, W, H); drawLogo(g, W, H, H * 0.52, H / 300); fitText(g, "19.11", W / 2, H * 0.86, W * 0.4, H * 0.1, YEL); if (m.stamp) drawStamp(g, W, H, sec, m.stamp); }
  else if (m.kind === "play") { drawBg(g, W, H); drawLogo(g, W, H, H * 0.36, H / 420); const p = m.press && sec > m.press ? -0.08 : 0.04 * Math.sin(sec * 8); drawButton(g, W / 2, H * 0.74, W * 0.5, H * 0.2, "ИГРАТЬ", "#2fbf5f", p); }
  else if (m.kind === "changed") { drawBg(g, W, H, "#1a0a14", "#3a0a1a"); const k = Math.floor(sec * 4) % 2;
    g.fillStyle = k ? RED : "#c42a2a"; rr(g, W * 0.08, H * 0.25, W * 0.84, H * 0.5, 30); g.fill(); g.lineWidth = 8; g.strokeStyle = "#fff"; g.stroke();
    fitText(g, "⚠ ДАТА РЕЛИЗА", W / 2, H * 0.42, W * 0.74, H * 0.13, "#fff"); fitText(g, "ИЗМЕНЕНА", W / 2, H * 0.6, W * 0.74, H * 0.15, YEL); }
  else if (m.kind === "released") { drawBg(g, W, H, "#0d2a1a", "#16603a"); const k = m.t ? popAt(sec, m.t) : 1;
    g.save(); g.translate(W / 2, H / 2); g.scale(k, k); g.fillStyle = "#fff"; rr(g, -W * 0.42, -H * 0.24, W * 0.84, H * 0.48, 30); g.fill();
    fitText(g, "🔔 GTA 6", 0, -H * 0.08, W * 0.7, H * 0.14, INK); fitText(g, "ВЫШЛА!", 0, H * 0.1, W * 0.7, H * 0.17, "#1f9e4f"); g.restore(); }
  else if (m.kind === "ps9") { g.fillStyle = "#0a0a14"; g.fillRect(0, 0, W, H); const k = m.t ? popAt(sec, m.t, 0.2) : 1;
    g.save(); g.translate(W / 2, H / 2); g.scale(k, k); g.fillStyle = RED; rr(g, -W * 0.44, -H * 0.3, W * 0.88, H * 0.6, 24); g.fill();
    fitText(g, "ОШИБКА", 0, -H * 0.15, W * 0.6, H * 0.12, "#fff"); fitText(g, "ТРЕБУЕТСЯ", 0, H * 0.02, W * 0.7, H * 0.12, "#fff"); fitText(g, "PLAYSTATION 9", 0, H * 0.18, W * 0.8, H * 0.15, YEL); g.restore(); }
  else if (m.kind === "final") { drawBg(g, W, H, "#2a1458", "#b0368a"); fitText(g, "А ТЫ ЖДЁШЬ", W / 2, H * 0.3, W * 0.85, H * 0.16, "#fff"); fitText(g, "GTA 6?", W / 2, H * 0.55, W * 0.7, H * 0.3, YEL);
    const p = 0.04 * Math.sin(sec * 6); drawButton(g, W / 2, H * 0.84, W * 0.7, H * 0.16, "ПИШИ В КОММЕНТЫ ↓", PINK, p); }
  else { g.fillStyle = "#08080c"; g.fillRect(0, 0, W, H); }
};
// календарь: страница с текстом
export const calDraw = (top: string, big: string, circle = false, flipAt?: number, prevBig?: string) => (g: CanvasRenderingContext2D, sec: number, W: number, H: number) => {
  g.fillStyle = "#fbf7ea"; g.fillRect(0, 0, W, H); g.fillStyle = RED; g.fillRect(0, 0, W, H * 0.24);
  fitText(g, top, W / 2, H * 0.12, W * 0.85, H * 0.13, "#fff");
  const showPrev = flipAt !== undefined && sec < flipAt && prevBig;
  fitText(g, showPrev ? prevBig! : big, W / 2, H * 0.6, W * 0.86, H * 0.42, INK);
  if (circle && !showPrev) { g.strokeStyle = RED; g.lineWidth = 10; g.beginPath(); g.ellipse(W / 2, H * 0.6, W * 0.42, H * 0.26, -0.1, 0, Math.PI * 2 * clamp(((sec * 3) % 99))); g.stroke(); }
};
// цифровые часы
export const clockDraw = (hhmm: (sec: number) => string, col = RED) => (g: CanvasRenderingContext2D, sec: number, W: number, H: number) => {
  g.fillStyle = "#0b0b12"; g.fillRect(0, 0, W, H); g.shadowColor = col; g.shadowBlur = 24; fitText(g, hhmm(sec), W / 2, H / 2 + 4, W * 0.9, H * 0.75, col, "Oswald, " + FONT); g.shadowBlur = 0;
};

// ------------------------------------------------------------------ частицы
export const Smoke: React.FC<{ p: V3; t0: number; n?: number; col?: string; size?: number }> = ({ p, t0, n = 14, col = "#8a8a96", size = 1 }) => {
  const sec = useSec(); if (sec < t0) return null;
  return <>{Array.from({ length: n }, (_, i) => {
    const u = ((sec - t0) * 0.6 + i / n) % 1, a = i * 2.4;
    return <mesh key={i} position={[p[0] + Math.sin(a) * 0.15 * size + Math.sin(u * 6 + i) * 0.1 * size, p[1] + u * 1.6 * size, p[2] + Math.cos(a) * 0.1 * size]} scale={(0.12 + u * 0.35) * size}>
      <sphereGeometry args={[1, 12, 10]} /><meshStandardMaterial color={col} transparent opacity={0.75 * (1 - u)} depthWrite={false} /></mesh>; })}</>;
};
export const Confetti: React.FC<{ t0: number; n?: number; area?: [number, number, number, number] }> = ({ t0, n = 60, area = [-2, 2, -1.5, 1] }) => {
  const sec = useSec(); if (sec < t0) return null;
  const cols = [PINK, CYAN, YEL, "#3fb27f", ORG, "#ffffff"];
  return <>{Array.from({ length: n }, (_, i) => {
    const r = (k: number) => { const v = Math.sin((i + 1) * 91.7 * k) * 43758.5; return v - Math.floor(v); };
    const u = sec - t0 - r(1) * 0.4; if (u < 0) return null;
    const y = 3.2 - u * (0.9 + r(2) * 0.6);
    return <mesh key={i} position={[lerp(area[0], area[1], r(3)) + Math.sin(u * 3 + i) * 0.15, y, lerp(area[2], area[3], r(4))]} rotation={[u * 5 + i, u * 4, i]}>
      <planeGeometry args={[0.07, 0.11]} /><meshBasicMaterial color={cols[i % 6]} side={THREE.DoubleSide} toneMapped={false} /></mesh>; })}</>;
};
// паутина (прозрачный канвас)
export const Web: React.FC<{ p: V3; s?: number; rot?: V3 }> = ({ p, s = 0.8, rot = [0, 0, 0] }) => {
  const tex = useMemo(() => canvasTex(256, 256, (g) => {
    g.strokeStyle = "rgba(255,255,255,0.9)"; g.lineWidth = 2.5;
    for (let i = 0; i <= 6; i++) { const a = (i / 6) * Math.PI / 2; g.beginPath(); g.moveTo(0, 0); g.lineTo(Math.cos(a) * 256, Math.sin(a) * 256); g.stroke(); }
    for (let r = 40; r < 256; r += 38) { g.beginPath(); for (let i = 0; i <= 6; i++) { const a = (i / 6) * Math.PI / 2; const x = Math.cos(a) * r, y = Math.sin(a) * r; i ? g.quadraticCurveTo(Math.cos(a - 0.13) * r * 0.9, Math.sin(a - 0.13) * r * 0.9, x, y) : g.moveTo(x, y); } g.stroke(); }
  }), []);
  return <mesh position={p} rotation={rot}><planeGeometry args={[s, s]} /><meshBasicMaterial map={tex} transparent depthWrite={false} toneMapped={false} /></mesh>;
};
// облачко-реплика
export const Bubble: React.FC<{ p: V3; text: string; t: number; w?: number; col?: string; fg?: string }> = ({ p, text, t, w = 1.3, col = "#ffffff", fg = INK }) => {
  const sec = useSec(); const k = popAt(sec, t); if (k <= 0) return null;
  return <group position={p} scale={k}><Screen p={[0, 0, 0]} w={w} h={w * 0.38} res={512} draw={(g, s, W, H) => {
    g.clearRect(0, 0, W, H); g.fillStyle = col; g.strokeStyle = INK; g.lineWidth = 10; rr(g, 8, 8, W - 16, H - 16, 40); g.fill(); g.stroke(); fitText(g, text, W / 2, H / 2 + 4, W * 0.85, H * 0.45, fg); }} /></group>;
};

// ------------------------------------------------------------------ коробка-игра с ножками
export const GameBox: React.FC<{ x: number; z: number; title: string; col: string; face?: "calm" | "sad" | "happy"; walk?: [number, number, number][]; scale?: number }> =
  ({ x, z, title, col, face = "calm", walk, scale = 1 }) => {
    const sec = useSec();
    let px = x, pz = z, moving = false;
    if (walk) { const k = walk; if (sec >= k[0][0]) { for (let i = 1; i < k.length; i++) if (sec <= k[i][0]) { const u = (sec - k[i - 1][0]) / (k[i][0] - k[i - 1][0]); px = lerp(k[i - 1][1], k[i][1], u); pz = lerp(k[i - 1][2], k[i][2], u); moving = true; break; } if (sec > k[k.length - 1][0]) { px = k[k.length - 1][1]; pz = k[k.length - 1][2]; } } else { px = k[0][1]; pz = k[0][2]; } }
    const b = moving ? Math.abs(Math.sin(sec * 14)) * 0.08 : Math.abs(Math.sin(sec * 3)) * 0.02;
    const tex = useMemo(() => canvasTex(256, 352, (g) => {
      g.fillStyle = col; g.fillRect(0, 0, 256, 352); g.fillStyle = "rgba(255,255,255,0.92)"; g.fillRect(14, 196, 228, 110);
      const lines = title.split(" "); if (lines.length > 1 && title.length > 7) { fitText(g, lines.slice(0, -1).join(" "), 128, 232, 210, 44, INK); fitText(g, lines[lines.length - 1], 128, 276, 210, 44, INK); } else fitText(g, title, 128, 252, 210, 60, INK);
      g.fillStyle = INK; g.strokeStyle = INK; g.lineWidth = 8;
      if (face === "sad") { for (const s of [-1, 1]) { g.beginPath(); g.arc(128 + s * 40, 100, 16, 0.2, Math.PI - 0.2); g.stroke(); } g.beginPath(); g.arc(128, 168, 24, Math.PI + 0.4, -0.4); g.stroke(); }
      else { for (const s of [-1, 1]) { g.beginPath(); g.arc(128 + s * 40, 100, 14, 0, Math.PI * 2); g.fill(); } g.beginPath(); g.arc(128, 140, face === "happy" ? 30 : 18, 0.3, Math.PI - 0.3); g.stroke(); }
    }), [title, col, face]);
    const leg = Math.sin(sec * 14) * (moving ? 0.35 : 0);
    return (<group position={[px, b, pz]} scale={scale}>
      <Box p={[0, 0.85, 0]} s={[0.7, 0.96, 0.14]} c="#ffffff" map={tex} />
      <group position={[-0.16, 0.38, 0]} rotation={[leg, 0, 0]}><Cyl p={[0, -0.17, 0]} r={0.035} h={0.36} c={INK} /></group>
      <group position={[0.16, 0.38, 0]} rotation={[-leg, 0, 0]}><Cyl p={[0, -0.17, 0]} r={0.035} h={0.36} c={INK} /></group>
    </group>);
  };

// ------------------------------------------------------------------ ЛОКАЦИИ
// Комната геймера. age: 0 — молодой, 1..3 — годы ожидания (пыль, паутина).
export const GamerRoom: React.FC<{ mon: MonMode; cal?: (g: CanvasRenderingContext2D, s: number, W: number, H: number) => void; clock?: (s: number) => string; age?: number; couch?: boolean }> =
  ({ mon, cal, clock, age = 0, couch = true }) => (<>
    <Room wall="#3a2470" floor="#251a44" wain="#2d1a58" ceil="#1e1436" />
    <Neon p={[0, 2.92, -1.93]} s={[5.8, 0.04, 0.04]} col={PINK} /><Neon p={[-2.93, 2.92, 0]} s={[0.04, 0.04, 3.8]} col={CYAN} />
    <Desk p={[0.75, 0, -1.55]} w={1.9} c="#2b2b36" />
    <Box p={[0.75, 1.32, -1.86]} s={[1.6, 0.94, 0.06]} c="#121218" />
    <Screen p={[0.75, 1.32, -1.82]} w={1.5} h={0.84} draw={monitorDraw(mon)} res={640} />
    <Box p={[0.75, 0.82, -1.35]} s={[0.8, 0.04, 0.22]} c="#1a1a22" />
    {[-0.15, 1.65].map((x) => <Box key={x} p={[x, 0.98, -1.7]} s={[0.24, 0.42, 0.24]} c="#1a1a22" />)}
    <Neon p={[0.75, 0.79, -1.2]} s={[1.9, 0.02, 0.02]} col={CYAN} k={1.6} />
    {clock ? <Screen p={[1.45, 0.88, -1.42]} w={0.42} h={0.17} draw={clockDraw(clock)} res={256} /> : null}
    <Sign p={[-1.15, 1.95, -1.98]} w={0.8} h={1.05} text="VI" bg="#ff3fa4" fg="#ffffff" glow={0.5} sz={300} />
    <Sign p={[-2.0, 1.95, -1.98]} w={0.7} h={0.95} text="VICE" bg="#2fe0ff" fg="#1a1020" glow={0.4} sz={170} />
    {cal ? <Screen p={[2.15, 1.8, -1.97]} w={0.75} h={0.95} draw={cal} res={360} basic={false} glow={0.45} /> : null}
    <Shelf p={[-2.45, 0, -1.6]} w={0.9} h={1.7} />
    <Plant p={[2.6, 0, -1.6]} h={0.8} />
    {couch ? <Couch p={[-0.9, 0, -1.25]} c="#6b4fd6" /> : null}
    <Box p={[2.0, 0.02, -0.4]} s={[1.4, 0.03, 1.0]} c="#ff7a2f" line={false} />
    {Array.from({ length: 6 }, (_, i) => <Box key={"c" + i} p={[-2.4 + (i % 3) * 0.18, 1.82, -1.6 + Math.floor(i / 3) * 0.05]} s={[0.12, 0.17, 0.02]} c={[PINK, CYAN, YEL][i % 3]} line={false} />)}
    {age >= 1 ? <><Web p={[-2.9, 2.6, -1.9]} s={1.0} rot={[0, Math.PI / 2, 0]} /><Web p={[2.85, 2.65, -1.95]} s={0.9} rot={[0, 0, Math.PI / 2]} /></> : null}
    {age >= 2 ? <><Web p={[0.75, 1.9, -1.8]} s={0.7} rot={[0, 0, Math.PI]} /><Web p={[-1.2, 0.8, -0.9]} s={0.8} /></> : null}
    <Lamp p={[0, 2.97, -0.4]} col="#ffd0f0" glow={1.2} />
  </>);

// Улица в стиле Vice City
export const ViceStreet: React.FC<{ night?: boolean; board?: (g: CanvasRenderingContext2D, s: number, W: number, H: number) => void; door?: boolean }> = ({ night = false, board, door = false }) => (<>
  <SunsetSky night={night} p={[0, 7, -18]} w={50} h={22} />
  <Box p={[0, -0.05, -3]} s={[40, 0.1, 30]} c={night ? "#241a3a" : "#3a2f4a"} line={false} />
  <Box p={[0, 0.05, -4.2]} s={[40, 0.1, 2.2]} c={night ? "#4a3a6a" : "#d9a6c9"} line={false} />
  {Array.from({ length: 12 }, (_, i) => <Box key={"m" + i} p={[-15 + i * 2.8, 0.01, -1.4]} s={[1.2, 0.02, 0.12]} c="#f2e6a0" line={false} shadow={false} />)}
  <Building p={[-7.5, 0, -8]} s={[4, 5, 3]} c="#ff8fb8" lit={night ? 0.8 : 0.2} />
  <Building p={[-3.2, 0, -8.5]} s={[4.2, 7, 3]} c="#3fd0c9" lit={night ? 0.7 : 0.15} />
  <Building p={[1.4, 0, -8]} s={[4.4, 4.5, 3]} c="#ffd27a" lit={night ? 0.8 : 0.2} />
  <Building p={[6, 0, -8.5]} s={[4.6, 6.2, 3]} c="#b88cff" lit={night ? 0.75 : 0.2} />
  <Building p={[10.5, 0, -8]} s={[4, 4.8, 3]} c="#ff9a6a" lit={night ? 0.8 : 0.2} />
  <Neon p={[-7.5, 4.0, -6.45]} s={[2.6, 0.08, 0.05]} col={PINK} /><Neon p={[6, 5.2, -6.95]} s={[3, 0.08, 0.05]} col={CYAN} />
  <Sign p={[-7.5, 3.4, -6.45]} w={2.2} h={0.6} text="MOTEL" bg="#1a1020" fg="#ff3fa4" glow={1.2} />
  <Sign p={[10.5, 3.6, -6.45]} w={2.0} h={0.6} text="OCEAN" bg="#1a1020" fg="#2fe0ff" glow={1.2} />
  {board ? <><Box p={[1.4, 3.1, -6.4]} s={[3.6, 2.1, 0.1]} c="#1a1020" /><Screen p={[1.4, 3.1, -6.33]} w={3.4} h={1.9} draw={board} res={720} /></> : null}
  {[-11, -5.5, -1.2, 3.8, 8.4, 13].map((x, i) => <Palm key={i} p={[x, 0, -4.4]} h={4.2 + (i % 3) * 0.5} lean={(i % 2 ? -1 : 1) * 0.1} />)}
  {door ? <NovemberDoor p={[3.2, 0, -3.2]} /> : null}
</>);

export const NovemberDoor: React.FC<{ p: V3 }> = ({ p }) => (<group position={p}>
  <Box p={[0, 1.3, 0]} s={[1.8, 2.6, 0.2]} c="#2b1b4a" />
  <mesh position={[0, 1.2, 0.11]}><planeGeometry args={[1.4, 2.2]} /><meshBasicMaterial color={new THREE.Color(YEL).multiplyScalar(1.5)} toneMapped={false} /></mesh>
  <Sign p={[0, 2.85, 0.12]} w={1.8} h={0.5} text="НОЯБРЬ" bg="#1a1020" fg={YEL} glow={1.0} />
</group>);

// Студия новостей
export const NewsStudio: React.FC<{ screen: (g: CanvasRenderingContext2D, s: number, W: number, H: number) => void }> = ({ screen }) => (<>
  <Room wall="#14203a" floor="#1b2440" wain="#0f1830" ceil="#0c1224" />
  <Box p={[0, 1.75, -1.97]} s={[3.9, 2.2, 0.06]} c="#0a0a12" />
  <Screen p={[0, 1.75, -1.92]} w={3.7} h={2.05} draw={screen} res={900} />
  <Box p={[0, 0.48, -0.65]} s={[2.4, 0.96, 0.7]} c="#2f6fd6" r={0.4} />
  <Box p={[0, 0.98, -0.65]} s={[2.5, 0.05, 0.8]} c="#e9eef8" r={0.3} />
  <Screen p={[0, 0.55, -0.29]} w={2.3} h={0.32} res={900} draw={(g, s, W, H) => { g.fillStyle = RED; g.fillRect(0, 0, W, H); g.fillStyle = "#fff"; g.fillRect(0, 0, W * 0.22, H);
    fitText(g, "СРОЧНО", W * 0.11, H / 2 + 3, W * 0.18, H * 0.6, RED); g.save(); g.beginPath(); g.rect(W * 0.23, 0, W, H); g.clip();
    g.font = `900 ${H * 0.55}px ${FONT}`; g.fillStyle = "#fff"; g.textBaseline = "middle"; g.textAlign = "left";
    const txt = "ROCKSTAR СНОВА ПЕРЕНЕСЛА GTA 6  •  ФАНАТЫ В ШОКЕ  •  ИНТЕРНЕТ ЛЁГ  •  "; const w = g.measureText(txt).width; const x = W * 0.25 - ((s * 260) % w);
    g.fillText(txt, x, H / 2 + 3); g.fillText(txt, x + w, H / 2 + 3); g.restore(); }} />
  <Box p={[-0.6, 1.08, -0.6]} s={[0.3, 0.14, 0.22]} c="#ddd" />
  <Cyl p={[0.7, 1.08, -0.55]} r={0.05} h={0.14} c={RED} />
  {[-2.4, 2.4].map((x) => <group key={x}><Cyl p={[x, 1.2, -1.2]} r={0.04} h={2.4} c="#333" /><Box p={[x, 2.4, -1.2]} s={[0.4, 0.3, 0.3]} c="#222" /></group>)}
  <Lamp p={[0, 2.95, -0.5]} len={3} glow={1.4} />
</>);

// стена телевизоров (магазин техники) — «по всему миру»
export const TvWall: React.FC<{ heads: [string, string][] }> = ({ heads }) => (<>
  <Room wall="#2a2f3a" floor="#3a3f4a" wain="#22262f" ceil="#cfd4dc" />
  {heads.map(([c, h], i) => { const x = -1.9 + (i % 3) * 1.9, y = 2.15 - Math.floor(i / 3) * 1.1;
    return <group key={i}><Box p={[x, y, -1.92]} s={[1.75, 1.0, 0.1]} c="#111" />
      <Screen p={[x, y, -1.86]} w={1.62} h={0.88} res={480} draw={(g, s, W, H) => { drawBg(g, W, H, "#0e1a3a", "#1d3a7a"); g.fillStyle = RED; g.fillRect(0, H * 0.62, W, H * 0.38);
        fitText(g, c, W / 2, H * 0.28, W * 0.6, H * 0.22, "#fff"); fitText(g, h, W / 2, H * 0.81, W * 0.9, H * 0.22, "#fff");
        g.fillStyle = "#fff"; g.globalAlpha = 0.08 + 0.05 * Math.sin(s * 30 + i); for (let y2 = 0; y2 < H; y2 += 6) g.fillRect(0, y2, W, 2); g.globalAlpha = 1; }} /></group>; })}
  <Box p={[0, 0.45, -1.6]} s={[5.6, 0.9, 0.7]} c="#d9dde5" />
  {[-2, -0.7, 0.6, 1.9].map((x, i) => <Box key={i} p={[x, 1.02, -1.6]} s={[0.5, 0.24, 0.35]} c={["#2f6fd6", "#e64b4b", "#f2c230", "#3fb27f"][i]} />)}
  <Sign p={[0, 2.85, -1.97]} w={2.4} h={0.32} text="ТЕХНИКА 24/7" bg="#ffd23f" fg="#1a1020" glow={0.6} />
</>);

// Кабинет директора
export const Office: React.FC<{ old?: boolean }> = ({ old = false }) => (<>
  <Room wall="#7a4a34" floor="#3a2a24" wain="#5a3424" ceil="#e9e2cf" />
  <Box p={[0.9, 1.75, -1.97]} s={[2.6, 1.7, 0.06]} c="#1a1020" />
  <Screen p={[0.9, 1.75, -1.93]} w={2.45} h={1.55} res={700} draw={(g, s, W, H) => { const gr = g.createLinearGradient(0, 0, 0, H); gr.addColorStop(0, "#ff9a6a"); gr.addColorStop(1, "#ffd27a"); g.fillStyle = gr; g.fillRect(0, 0, W, H);
    for (let i = 0; i < 9; i++) { const bw = W / 9, bh = H * (0.35 + ((i * 37) % 50) / 100); g.fillStyle = i % 2 ? "#5a3a7a" : "#4a2a6a"; g.fillRect(i * bw, H - bh, bw - 4, bh);
      g.fillStyle = "#ffe08a"; for (let y = H - bh + 12; y < H - 10; y += 22) for (let x = i * bw + 8; x < (i + 1) * bw - 12; x += 16) if ((x * 7 + y * 3) % 5 < 2) g.fillRect(x, y, 6, 8); }
    g.fillStyle = "#1a1020"; g.fillRect(W / 2 - 4, 0, 8, H); g.fillRect(0, H / 2 - 4, W, 8); }} />
  <Sign p={[-1.5, 1.9, -1.98]} w={0.9} h={1.2} text="VI" bg="#ff3fa4" fg="#fff" glow={0.4} sz={300} />
  <Box p={[0, 0.74, -0.6]} s={[2.0, 0.08, 0.9]} c="#4a2a1a" r={0.4} />
  <Box p={[0, 0.37, -0.6]} s={[1.9, 0.7, 0.8]} c="#5a3424" />
  <Sign p={[0, 0.5, -0.19]} w={0.7} h={0.2} text="CEO" bg="#f2c230" fg="#1a1020" glow={0.3} />
  <Cyl p={[0.6, 0.86, -0.5]} r={0.06} h={0.14} c="#ffffff" />
  <Box p={[-0.55, 0.8, -0.65]} s={[0.4, 0.04, 0.3]} c="#e9e2cf" />
  <Shelf p={[2.5, 0, -1.6]} w={0.9} h={1.8} />
  {[2.2, 2.5, 2.8].map((x, i) => <Box key={i} p={[x, 2.05, -1.6]} s={[0.12, 0.2, 0.12]} c="#f2c230" metal={0.8} r={0.3} />)}
  <Plant p={[-2.5, 0, -1.6]} h={0.9} />
  <Chair p={[0.1, 0, -1.25]} c="#2a1a14" />
  {old ? <><Web p={[-2.9, 2.6, -1.9]} s={1.0} rot={[0, Math.PI / 2, 0]} /><Web p={[2.85, 2.65, -1.95]} s={0.9} rot={[0, 0, Math.PI / 2]} /></> : null}
  <Lamp p={[0, 2.97, -0.5]} glow={1.3} />
</>);

// Штаб-квартира снаружи
export const HQ: React.FC = () => (<>
  <SunsetSky p={[0, 7, -20]} w={50} h={24} />
  <Box p={[0, -0.05, -3]} s={[40, 0.1, 30]} c="#5a5468" line={false} />
  <Building p={[0, 0, -8]} s={[9, 8, 4]} c="#2b2b3a" lit={0.35} />
  <Box p={[0, 5.6, -5.9]} s={[2.4, 2.4, 0.15]} c={YEL} />
  <Sign p={[0, 5.6, -5.8]} w={2.2} h={2.2} text="R★" bg={YEL} fg="#1a1020" glow={0.5} sz={300} />
  <Box p={[0, 1.2, -5.95]} s={[2.4, 2.4, 0.1]} c="#7fb8d8" metal={0.4} r={0.2} />
  <Building p={[-9, 0, -9]} s={[5, 5, 3]} c="#ff8fb8" lit={0.2} /><Building p={[9, 0, -9]} s={[5, 6, 3]} c="#3fd0c9" lit={0.2} />
  {[-6, -3.2, 3.2, 6].map((x, i) => <Palm key={i} p={[x, 0, -5.4]} h={4 + (i % 2) * 0.6} />)}
  <Box p={[0, 0.05, -4.6]} s={[10, 0.1, 2]} c="#c9bcd6" line={false} />
</>);

// Пункт охраны со стеной мониторов. count(sec) — сколько точек-фанатов на камерах
export const Security: React.FC<{ count: (s: number) => number }> = ({ count }) => (<>
  <Room wall="#1d2630" floor="#252d36" wain="#141a22" ceil="#11161c" />
  {Array.from({ length: 9 }, (_, i) => { const x = -1.6 + (i % 3) * 1.6, y = 2.35 - Math.floor(i / 3) * 0.78;
    return <group key={i}><Box p={[x, y, -1.94]} s={[1.5, 0.72, 0.08]} c="#0a0a0a" />
      <Screen p={[x, y, -1.89]} w={1.4} h={0.64} res={360} draw={(g, s, W, H) => { g.fillStyle = "#16261c"; g.fillRect(0, 0, W, H);
        g.fillStyle = "#2a3e30"; g.fillRect(0, H * 0.55, W, H * 0.45); const n = Math.floor(count(s) / 9 + (i % 4)); g.fillStyle = "#b8f0c0";
        for (let k = 0; k < Math.min(n, 220); k++) { const px = ((k * 73 + i * 31) % 100) / 100 * W, py = H * 0.6 + ((k * 37) % 40) / 100 * H; g.beginPath(); g.arc(px, py, 4, 0, 7); g.fill(); g.fillRect(px - 2, py, 4, 9); }
        g.fillStyle = "#fff"; g.font = `20px monospace`; g.textAlign = "left"; g.fillText(`CAM ${i + 1}  ● REC`, 10, 24);
        g.globalAlpha = 0.1; for (let y2 = 0; y2 < H; y2 += 4) g.fillRect(0, y2, W, 1); g.globalAlpha = 1; }} /></group>; })}
  <Box p={[0, 0.74, -1.1]} s={[4.4, 0.06, 0.8]} c="#3a3a44" /><Box p={[0, 0.36, -1.1]} s={[4.2, 0.72, 0.7]} c="#2a2a32" />
  <Cyl p={[1.2, 0.85, -1.0]} r={0.06} h={0.16} c="#ffffff" /><Box p={[-0.5, 0.79, -1.0]} s={[0.7, 0.03, 0.25]} c="#111" />
  <Box p={[-1.5, 0.83, -1.15]} s={[0.25, 0.12, 0.2]} c="#e64b4b" />
  <Lamp p={[0, 2.97, 0]} glow={0.7} />
</>);

// Серверная GTA Online. load(sec) 0..1 — нагрузка (краснеет)
export const ServerRoom: React.FC<{ load: (s: number) => number; counter?: (s: number) => string; face?: boolean }> = ({ load, counter, face = false }) => {
  const sec = useSec(); const L = load(sec);
  return (<>
    <Box p={[0, -0.05, -4]} s={[8, 0.1, 16]} c="#151a2a" line={false} />
    <Box p={[0, 3.05, -4]} s={[8, 0.1, 16]} c="#0d111c" />
    <Box p={[0, 1.5, -11]} s={[8, 3, 0.1]} c="#1a2036" />
    <Sign p={[0, 2.4, -10.9]} w={3.4} h={0.7} text="GTA ONLINE" bg="#0a0a14" fg={PINK} glow={1.4} />
    {[-1.4, 1.4].flatMap((x) => Array.from({ length: 7 }, (_, i) => { const z = 1 - i * 1.4;
      return <group key={x + "_" + i}><Box p={[x + sgn(x) * 0.0, 1.05, z]} s={[0.8, 2.1, 1.2]} c="#22283a" />
        <Screen p={[x - sgn(x) * 0.41, 1.05, z]} rot={[0, -sgn(x) * Math.PI / 2, 0]} w={1.1} h={1.9} res={160} draw={(g, s, W, H) => {
          g.fillStyle = "#11141f"; g.fillRect(0, 0, W, H); for (let r = 0; r < 14; r++) { g.fillStyle = "#2a3048"; g.fillRect(8, 8 + r * (H / 14), W - 16, H / 14 - 6);
            for (let c = 0; c < 5; c++) { const on = Math.sin(s * (8 + L * 30) + r * 3.1 + c * 1.7 + i) > 0.2 - L * 0.8; g.fillStyle = on ? (L > 0.6 && (r + c) % 2 ? RED : "#3fff8f") : "#203024"; g.fillRect(14 + c * 14, 12 + r * (H / 14), 8, 6); } } }} /></group>; }))}
    <mesh position={[0, 2.9, -3]}><boxGeometry args={[0.3, 0.2, 0.3]} /><meshBasicMaterial color={new THREE.Color(RED).multiplyScalar(0.6 + L * 2 * (0.5 + 0.5 * Math.sin(sec * 12)))} toneMapped={false} /></mesh>
    <pointLight position={[0, 2.6, -3]} intensity={L * 12 * (0.5 + 0.5 * Math.sin(sec * 12))} color={RED} decay={1.2} />
    {counter ? <><Box p={[0, 2.3, -1.2]} s={[2.3, 0.62, 0.08]} c="#0a0a14" /><Screen p={[0, 2.3, -1.15]} w={2.2} h={0.55} res={640} draw={(g, s, W, H) => { g.fillStyle = "#08080f"; g.fillRect(0, 0, W, H);
      fitText(g, "ИГРОКОВ ОНЛАЙН", W / 2, H * 0.24, W * 0.7, H * 0.22, CYAN); g.shadowColor = "#3fff8f"; g.shadowBlur = 20; fitText(g, counter(s), W / 2, H * 0.66, W * 0.9, H * 0.5, "#3fff8f"); g.shadowBlur = 0; }} /></> : null}
    {face ? <group position={[0, 0, -5.2]}>
      <Box p={[0, 1.25, 0]} s={[1.5, 2.5, 1.0]} c={`rgb(${Math.round(40 + L * 160)},40,60)`} />
      <Screen p={[0, 1.45, 0.51]} w={1.3} h={1.3} res={400} draw={(g, s, W, H) => { g.clearRect(0, 0, W, H); g.fillStyle = `rgb(${Math.round(60 + L * 150)},30,50)`; g.fillRect(0, 0, W, H);
        const sh = (Math.random() - 0.5) * 6 * L; g.translate(sh, 0); g.fillStyle = "#fff"; g.strokeStyle = INK; g.lineWidth = 8;
        for (const sx of [-1, 1]) { g.beginPath(); g.ellipse(W / 2 + sx * 95, H * 0.38, 60, 52, 0, 0, 7); g.fill(); g.stroke(); g.fillStyle = INK; g.beginPath(); g.arc(W / 2 + sx * 95, H * 0.4, 16, 0, 7); g.fill(); g.fillStyle = "#fff";
          g.lineWidth = 10; g.beginPath(); g.moveTo(W / 2 + sx * 150, H * 0.2); g.lineTo(W / 2 + sx * 50, H * 0.26 - 10); g.stroke(); g.lineWidth = 8; }
        g.fillStyle = "#5e1f22"; g.beginPath(); g.ellipse(W / 2, H * 0.74, 70, 40 + 12 * Math.sin(s * 20), 0, 0, 7); g.fill(); g.stroke();
        g.fillStyle = "#9fdcff"; for (let k = 0; k < 3; k++) { const y = ((s * 120 + k * 120) % (H * 0.6)) + H * 0.2; g.beginPath(); g.arc(W * 0.86, y, 14, 0, 7); g.fill(); } }} />
      <Smoke p={[0, 2.5, 0]} t0={-99} n={10} col="#5a5a66" />
    </group> : null}
  </>);
};

// Биржа: стена-график. drop(sec) 0..1 — насколько упал график
export const StockFloor: React.FC<{ drop: (s: number) => number; stamps?: number[] }> = ({ drop, stamps }) => (<>
  <Room wall="#101420" floor="#1a1f2e" wain="#0b0e18" ceil="#0a0c14" />
  <Box p={[0, 1.75, -1.97]} s={[4.6, 2.3, 0.06]} c="#05060a" />
  <Screen p={[0, 1.75, -1.92]} w={4.4} h={2.15} res={1000} draw={(g, s, W, H) => {
    g.fillStyle = "#070a14"; g.fillRect(0, 0, W, H); g.strokeStyle = "#1a2440"; g.lineWidth = 2; for (let x = 0; x < W; x += 60) { g.beginPath(); g.moveTo(x, 0); g.lineTo(x, H); g.stroke(); } for (let y = 0; y < H; y += 60) { g.beginPath(); g.moveTo(0, y); g.lineTo(W, y); g.stroke(); }
    if (stamps) {
      stamps.forEach((t, i) => { g.save(); g.translate(W * (0.2 + i * 0.3), H * 0.45); drawLogoMini(g, i);
        if (s >= t) { const k = clamp((s - t) / 0.12), sc = lerp(2.2, 1, k); g.rotate(-0.25); g.scale(sc, sc); g.globalAlpha = k; g.strokeStyle = RED; g.lineWidth = 9; rr(g, -140, -40, 280, 80, 10); g.stroke(); fitText(g, "ПЕРЕНОС", 0, 4, 250, 52, RED); }
        g.restore(); });
      fitText(g, "ПЕРЕНОСОВ: " + stamps.filter((t) => s >= t).length, W / 2, H * 0.9, W * 0.6, H * 0.11, RED); return; }
    const d = drop(s); fitText(g, "TAKE-TWO", W * 0.18, H * 0.1, W * 0.3, H * 0.09, "#fff");
    const pct = (-10 * d).toFixed(1).replace(".", ","); fitText(g, d > 0.01 ? `${pct}%` : "+0,4%", W * 0.82, H * 0.1, W * 0.3, H * 0.1, d > 0.01 ? RED : "#3fff8f");
    g.lineWidth = 10; g.lineJoin = "round"; g.strokeStyle = d > 0.01 ? RED : "#3fff8f"; g.beginPath();
    for (let i = 0; i <= 40; i++) { const x = W * 0.05 + (i / 40) * W * 0.9; let y = H * 0.45 - Math.sin(i * 0.9) * 18 - i * 3; if (i > 26) y += (i - 26) * 38 * d; i ? g.lineTo(x, y) : g.moveTo(x, y); } g.stroke();
    if (d > 0.5) { g.fillStyle = RED; g.globalAlpha = 0.15 + 0.1 * Math.sin(s * 14); g.fillRect(0, 0, W, H); g.globalAlpha = 1; } }} />
  {[-1.8, 0, 1.8].map((x, i) => <group key={i}><Box p={[x, 0.74, -0.2]} s={[1.3, 0.06, 0.7]} c="#2a2f3a" /><Box p={[x, 0.37, -0.2]} s={[1.2, 0.7, 0.6]} c="#1f232c" />
    <Box p={[x, 1.0, -0.4]} s={[0.6, 0.36, 0.04]} c="#111" /><Screen p={[x, 1.0, -0.37]} w={0.55} h={0.3} res={200} draw={(g, s, W, H) => { const d = drop(s); g.fillStyle = d > 0.3 ? "#3a0a10" : "#0a2a14"; g.fillRect(0, 0, W, H); fitText(g, d > 0.3 ? "▼ SELL" : "▲ BUY", W / 2, H / 2, W * 0.8, H * 0.5, d > 0.3 ? RED : "#3fff8f"); }} /></group>)}
  <Lamp p={[0, 2.97, 0]} glow={0.8} />
</>);
const drawLogoMini = (g: CanvasRenderingContext2D, i: number) => {
  g.fillStyle = "#2a1458"; rr(g, -120, -160, 240, 300, 20); g.fill(); g.strokeStyle = PINK; g.lineWidth = 6; g.stroke();
  const gr = g.createLinearGradient(0, -100, 0, 60); gr.addColorStop(0, "#ffb347"); gr.addColorStop(1, PINK); g.fillStyle = gr; g.font = `900 150px ${FONT}`; g.textAlign = "center"; g.textBaseline = "middle"; g.fillText("VI", 0, -20);
  fitText(g, ["ОСЕНЬ 2025", "МАЙ 2026", "НОЯБРЬ 2026"][i], 0, 100, 200, 34, "#fff");
};
