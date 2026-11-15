// v5 «кино»: частицы (пыль в свете, снег, искры), облачко мыслей с картинкой, советские локации для «Тетриса».
import React, { useMemo } from "react";
import * as THREE from "three";
import { Box, Cyl, Sign, Screen, Room, canvasTex, fitText, useSec, clamp, lerp, V3 } from "./kit";
import { rr, PINK, CYAN, YEL, RED, INK } from "./sets";

type Draw = (g: CanvasRenderingContext2D, s: number, W: number, H: number) => void;
const hash = (i: number, k: number) => { const v = Math.sin((i + 1) * 12.9898 * k + 78.233) * 43758.5453; return v - Math.floor(v); };

// ------------------------------------------------------------------ частицы
// пылинки, медленно плавающие в луче света (светятся — их ловит bloom)
export const Motes: React.FC<{ area: [number, number, number, number, number, number]; n?: number; col?: string; size?: number }> = ({ area, n = 60, col = "#ffe2b0", size = 0.012 }) => {
  const sec = useSec(); const [x0, x1, y0, y1, z0, z1] = area;
  const c = useMemo(() => new THREE.Color(col).multiplyScalar(2.2), [col]);
  return <>{Array.from({ length: n }, (_, i) => {
    const x = lerp(x0, x1, hash(i, 1)) + Math.sin(sec * 0.4 + i) * 0.08, y = lerp(y0, y1, (hash(i, 2) + sec * 0.02 * (0.5 + hash(i, 4))) % 1), z = lerp(z0, z1, hash(i, 3));
    const tw = 0.5 + 0.5 * Math.sin(sec * 2 + i * 3);
    return <mesh key={i} position={[x, y, z]}><sphereGeometry args={[size * (0.6 + hash(i, 5)), 6, 5]} /><meshBasicMaterial color={c} transparent opacity={0.15 + 0.35 * tw} toneMapped={false} /></mesh>;
  })}</>;
};
// снег за окном или на улице
export const Snow: React.FC<{ area: [number, number, number, number, number, number]; n?: number; speed?: number }> = ({ area, n = 120, speed = 0.35 }) => {
  const sec = useSec(); const [x0, x1, y0, y1, z0, z1] = area;
  return <>{Array.from({ length: n }, (_, i) => {
    const h = y1 - y0, y = y1 - ((hash(i, 2) * h + sec * speed * (0.7 + hash(i, 4) * 0.6)) % h);
    const x = lerp(x0, x1, hash(i, 1)) + Math.sin(sec * 1.3 + i) * 0.05, z = lerp(z0, z1, hash(i, 3));
    return <mesh key={i} position={[x, y, z]}><sphereGeometry args={[0.012 + hash(i, 5) * 0.012, 6, 5]} /><meshBasicMaterial color="#ffffff" /></mesh>;
  })}</>;
};
// искры (от огня, вспышки, удачи): летят вверх и гаснут
export const Sparks: React.FC<{ p: V3; t0: number; n?: number; col?: string; spread?: number }> = ({ p, t0, n = 40, col = "#ffb040", spread = 0.6 }) => {
  const sec = useSec(); const u = sec - t0; if (u < 0) return null;
  const c = new THREE.Color(col).multiplyScalar(3);
  return <group position={p}>{Array.from({ length: n }, (_, i) => {
    const life = 0.8 + hash(i, 6) * 1.2, k = ((u + hash(i, 7) * life) % life) / life;
    const a = hash(i, 1) * Math.PI * 2, r = spread * hash(i, 2) * k;
    return <mesh key={i} position={[Math.cos(a) * r, k * (0.6 + hash(i, 3)), Math.sin(a) * r * 0.5]}><sphereGeometry args={[0.01, 5, 4]} /><meshBasicMaterial color={c} transparent opacity={1 - k} toneMapped={false} /></mesh>;
  })}</group>;
};

// ------------------------------------------------------------------ облачко мыслей (как зачёркнутые корабли в референсе)
// появляется с «пружинкой» в момент t, рисунок внутри — draw(g, s, W, H)
export const ThoughtCloud: React.FC<{ p: V3; t: number; w?: number; draw: Draw; tail?: V3 }> = ({ p, t, w = 1.1, draw, tail = [-0.35, -0.55, 0] }) => {
  const sec = useSec(); const u = sec - t; if (u < 0) return null;
  const k = u < 0.25 ? Easing(u / 0.25) : 1;
  const h = w * 0.68;
  const frame: Draw = (g, s, W, H) => {
    g.clearRect(0, 0, W, H); g.fillStyle = "#ffffff"; g.strokeStyle = "#1a1020"; g.lineWidth = W * 0.012;
    const blobs = [[0.5, 0.5, 0.42, 0.36], [0.22, 0.42, 0.18, 0.18], [0.78, 0.42, 0.18, 0.18], [0.35, 0.22, 0.18, 0.15], [0.65, 0.22, 0.18, 0.15], [0.3, 0.75, 0.16, 0.13], [0.7, 0.75, 0.16, 0.13]];
    g.beginPath(); for (const [x, y, rx, ry] of blobs) { g.moveTo(W * (x + rx), H * y); g.ellipse(W * x, H * y, W * rx, H * ry, 0, 0, Math.PI * 2); } g.fill();
    g.save(); g.globalCompositeOperation = "destination-over"; g.lineWidth = W * 0.03; g.beginPath(); for (const [x, y, rx, ry] of blobs) { g.moveTo(W * (x + rx), H * y); g.ellipse(W * x, H * y, W * rx, H * ry, 0, 0, Math.PI * 2); } g.stroke(); g.restore();
    g.save(); g.beginPath(); g.ellipse(W * 0.5, H * 0.5, W * 0.38, H * 0.33, 0, 0, Math.PI * 2); g.clip(); g.translate(W * 0.14, H * 0.19); draw(g, s, W * 0.72, H * 0.62); g.restore();
  };
  return <group position={p} scale={k}>
    <Screen p={[0, 0, 0]} w={w} h={h} res={700} draw={frame} transparent glow={0.95} />
    {[0.12, 0.07].map((r, i) => <mesh key={i} position={[tail[0] * (0.55 + i * 0.4), tail[1] * (0.55 + i * 0.4), -0.01]}><circleGeometry args={[r * w * 0.5, 20]} /><meshBasicMaterial color="#ffffff" /></mesh>)}
  </group>;
};
function Easing(x: number) { const c1 = 1.70158, c3 = c1 + 1; return 1 + c3 * Math.pow(x - 1, 3) + c1 * Math.pow(x - 1, 2); }

// ------------------------------------------------------------------ советский реквизит
export const TeaGlass: React.FC<{ p: V3; scale?: number }> = ({ p, scale = 1 }) => (
  <group position={p} scale={scale}>
    <Cyl p={[0, 0.07, 0]} r={0.045} h={0.14} c="#c8a050" />
    <mesh position={[0, 0.1, 0]}><cylinderGeometry args={[0.04, 0.04, 0.12, 16]} /><meshStandardMaterial color="#b0602a" transparent opacity={0.85} roughness={0.2} /></mesh>
    <mesh position={[0.06, 0.08, 0]} rotation={[0, 0, Math.PI / 2]}><torusGeometry args={[0.03, 0.007, 6, 12, Math.PI]} /><meshStandardMaterial color="#c8a050" metalness={0.6} /></mesh>
  </group>);
// шкаф ЭВМ: две бобины магнитной ленты (крутятся), лампочки мигают
export const Mainframe: React.FC<{ p: V3; rotY?: number; seed?: number }> = ({ p, rotY = 0, seed = 1 }) => {
  const sec = useSec();
  return <group position={p} rotation={[0, rotY, 0]}>
    <Box p={[0, 0.95, 0]} s={[0.8, 1.9, 0.6]} c="#c8c8b8" r={0.6} />
    <Box p={[0, 1.88, 0.01]} s={[0.82, 0.08, 0.62]} c="#8a8a80" />
    {[1.45, 0.95].map((y, i) => <group key={y} position={[0, y, 0.31]}>
      <mesh><circleGeometry args={[0.2, 32]} /><meshStandardMaterial color="#3a3a40" /></mesh>
      <group rotation={[0, 0, sec * (i ? -2.2 : 1.6) + seed]}>
        <mesh position={[0, 0, 0.005]}><ringGeometry args={[0.05, 0.18, 32]} /><meshStandardMaterial color="#5a3a2a" /></mesh>
        {[0, 1, 2].map((k) => <mesh key={k} position={[0, 0, 0.01]} rotation={[0, 0, (k * Math.PI * 2) / 3]}><planeGeometry args={[0.03, 0.34]} /><meshStandardMaterial color="#d8d8d0" /></mesh>)}
      </group></group>)}
    <group position={[0, 0.45, 0.31]}>{Array.from({ length: 12 }, (_, i) => {
      const on = Math.sin(sec * (3 + hash(i, seed) * 5) + i) > 0.2;
      const c = [RED, YEL, "#3fff8f"][i % 3];
      return <mesh key={i} position={[-0.27 + (i % 6) * 0.11, Math.floor(i / 6) * 0.1, 0]}><circleGeometry args={[0.022, 12]} /><meshBasicMaterial color={on ? new THREE.Color(c).multiplyScalar(2.5) : new THREE.Color(c).multiplyScalar(0.25)} toneMapped={!on} /></mesh>;
    })}</group>
  </group>;
};
// лампа дневного света под потолком (светится)
export const TubeLight: React.FC<{ p: V3; len?: number; flicker?: boolean }> = ({ p, len = 1.2, flicker = false }) => {
  const sec = useSec(); const k = flicker && Math.sin(sec * 37) > 0.93 ? 0.4 : 1;
  return <group position={p}><Box p={[0, 0.03, 0]} s={[len + 0.1, 0.05, 0.18]} c="#e8e8e0" line={false} />
    <mesh position={[0, -0.01, 0]} rotation={[0, 0, Math.PI / 2]}><cylinderGeometry args={[0.025, 0.025, len, 10]} /><meshBasicMaterial color={new THREE.Color("#e8fff8").multiplyScalar(2.2 * k)} toneMapped={false} /></mesh></group>;
};
// настольная лампа (тёплый свет)
export const DeskLamp: React.FC<{ p: V3; rotY?: number }> = ({ p, rotY = 0 }) => (
  <group position={p} rotation={[0, rotY, 0]}>
    <Cyl p={[0, 0.015, 0]} r={0.08} h={0.03} c="#2a4a3a" />
    <mesh position={[0, 0.2, 0]} rotation={[0, 0, -0.3]}><cylinderGeometry args={[0.012, 0.012, 0.4, 8]} /><meshStandardMaterial color="#2a4a3a" /></mesh>
    <mesh position={[0.1, 0.38, 0]} rotation={[0, 0, -2.2]}><coneGeometry args={[0.09, 0.14, 20, 1, true]} /><meshStandardMaterial color="#2a6a4a" side={THREE.DoubleSide} /></mesh>
    <mesh position={[0.13, 0.34, 0]}><sphereGeometry args={[0.03, 12, 10]} /><meshBasicMaterial color={new THREE.Color("#ffd090").multiplyScalar(3)} toneMapped={false} /></mesh>
  </group>);

// экран терминала «Электроники-60»: зелёный текст, стакан из «<! . . !>», фигура из [] падает
export const termDraw = (t0: number, label = ""): Draw => (g, s, W, H) => {
  g.fillStyle = "#031208"; g.fillRect(0, 0, W, H);
  const fs = H / 22; g.font = `${fs}px monospace`; g.textBaseline = "top"; g.fillStyle = "#3fff8f";
  g.shadowColor = "#3fff8f"; g.shadowBlur = fs * 0.6;
  const cols = 10, x0 = W / 2 - (cols + 2) * fs * 0.62;
  for (let r = 0; r < 18; r++) { g.fillText("<!" + " .".repeat(cols) + "!>", x0, fs * (1.5 + r)); }
  g.fillText("<!" + "=".repeat(cols * 2) + "!>", x0, fs * 19.5);
  // уже уложенные внизу блоки
  const pile = [[0, 17], [1, 17], [2, 17], [3, 17], [5, 17], [6, 17], [7, 17], [8, 17], [9, 17], [0, 16], [1, 16], [6, 16], [7, 16], [8, 16], [9, 16], [0, 15], [9, 15]];
  const cell = (c: number, r: number) => g.fillText("[]", x0 + fs * 1.24 + c * fs * 1.24, fs * (1.5 + r));
  g.fillStyle = "#031208"; for (const [c, r] of pile) g.fillRect(x0 + fs * 1.24 + c * fs * 1.24, fs * (1.5 + r), fs * 1.2, fs); g.fillStyle = "#3fff8f";
  for (const [c, r] of pile) cell(c, r);
  // падающая «Т»
  const u = Math.max(0, s - t0), row = Math.min(14, Math.floor(u * 3));
  const T = [[3, 0], [4, 0], [5, 0], [4, 1]];
  g.fillStyle = "#031208"; for (const [c, r] of T) g.fillRect(x0 + fs * 1.24 + c * fs * 1.24, fs * (1.5 + r + row), fs * 1.2, fs); g.fillStyle = "#b8ffd0";
  for (const [c, r] of T) cell(c, r + row);
  if (label) fitText(g, label, W / 2, H * 0.03 + fs * 0.2, W * 0.9, fs, "#3fff8f", "monospace");
  g.shadowBlur = 0;
  // скан-линии и виньетка ЭЛТ
  g.fillStyle = "rgba(0,0,0,0.25)"; for (let y = 0; y < H; y += 4) g.fillRect(0, y, W, 2);
  const vg = g.createRadialGradient(W / 2, H / 2, W * 0.3, W / 2, H / 2, W * 0.75); vg.addColorStop(0, "rgba(0,0,0,0)"); vg.addColorStop(1, "rgba(0,0,0,0.6)"); g.fillStyle = vg; g.fillRect(0, 0, W, H);
};
// ЭЛТ-терминал с клавиатурой
export const Terminal: React.FC<{ p: V3; draw: Draw; rotY?: number }> = ({ p, draw, rotY = 0 }) => (
  <group position={p} rotation={[0, rotY, 0]}>
    <Box p={[0, 0.27, -0.05]} s={[0.62, 0.54, 0.5]} c="#d8d0b8" r={0.6} />
    <Box p={[0, 0.29, 0.205]} s={[0.54, 0.42, 0.02]} c="#2a2a26" />
    <Screen p={[0, 0.29, 0.217]} w={0.46} h={0.35} res={640} draw={draw} glow={1.1} />
    <Box p={[0, 0.03, 0.42]} s={[0.6, 0.06, 0.22]} c="#c8c0a8" />
    {Array.from({ length: 30 }, (_, i) => <Box key={i} p={[-0.26 + (i % 10) * 0.058, 0.065, 0.36 + Math.floor(i / 10) * 0.055]} s={[0.045, 0.02, 0.045]} c="#5a5448" line={false} />)}
  </group>);

// Вычислительный центр АН СССР, 1984: крашеные стены (низ зелёный, верх кремовый), паркет, окна с ночной Москвой и снегом,
// шкафы ЭВМ с бобинами, лампы дневного света, стол с терминалом, лампой, стаканом чая и бумагами, часы, плакат
export const VC1984: React.FC<{ term: Draw; clock?: string; chair?: boolean }> = ({ term, clock = "23:40", chair = false }) => {
  const parquet = useMemo(() => { const t = canvasTex(512, 512, (g) => { for (let y = 0; y < 8; y++) for (let x = 0; x < 8; x++) {
    g.fillStyle = ["#8a5a32", "#9a6a3a", "#7a4e2a"][(x + y * 3) % 3]; g.fillRect(x * 64, y * 64, 64, 64);
    g.strokeStyle = "rgba(0,0,0,0.3)"; g.lineWidth = 2; for (let k = 0; k < 4; k++) { const v = (x + y) % 2; g.beginPath(); if (v) { g.moveTo(x * 64 + k * 16, y * 64); g.lineTo(x * 64 + k * 16, y * 64 + 64); } else { g.moveTo(x * 64, y * 64 + k * 16); g.lineTo(x * 64 + 64, y * 64 + k * 16); } g.stroke(); } } });
    t.wrapS = t.wrapT = THREE.RepeatWrapping; t.repeat.set(3, 2); return t; }, []);
  const view = useMemo(() => canvasTex(512, 512, (g) => { const gr = g.createLinearGradient(0, 0, 0, 512); gr.addColorStop(0, "#0a1230"); gr.addColorStop(1, "#2a3a6a"); g.fillStyle = gr; g.fillRect(0, 0, 512, 512);
    for (let i = 0; i < 8; i++) { const x = i * 66, bh = 160 + ((i * 53) % 150); g.fillStyle = "#141c3a"; g.fillRect(x, 512 - bh, 60, bh); for (let yy = 512 - bh + 10; yy < 500; yy += 22) for (let xx = x + 6; xx < x + 54; xx += 14) if ((xx * 7 + yy * 3) % 9 < 4) { g.fillStyle = "#ffcf7a"; g.fillRect(xx, yy, 7, 10); } }
    g.fillStyle = "#e8ecff"; g.fillRect(0, 488, 512, 24); }), []);
  return (<>
    <mesh position={[0, 0, 0]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow><planeGeometry args={[7, 5]} /><meshStandardMaterial map={parquet} roughness={0.6} /></mesh>
    <Box p={[0, 3.05, 0]} s={[7, 0.1, 5]} c="#e8e4d8" />
    {/* задняя стена: низ зелёный, верх кремовый, полоса */}
    <Box p={[0, 0.75, -2.05]} s={[7, 1.5, 0.1]} c="#3f6a5a" r={0.8} line={false} />
    <Box p={[0, 2.25, -2.05]} s={[7, 1.5, 0.1]} c="#e8dcc0" r={0.9} line={false} />
    <Box p={[0, 1.5, -1.99]} s={[7, 0.04, 0.02]} c="#2a4a3a" line={false} />
    <Box p={[-3.05, 0.75, 0]} s={[0.1, 1.5, 5]} c="#3f6a5a" line={false} /><Box p={[-3.05, 2.25, 0]} s={[0.1, 1.5, 5]} c="#e8dcc0" line={false} />
    <Box p={[3.05, 0.75, 0]} s={[0.1, 1.5, 5]} c="#3f6a5a" line={false} /><Box p={[3.05, 2.25, 0]} s={[0.1, 1.5, 5]} c="#e8dcc0" line={false} />
    {/* окно: ночная Москва, снег */}
    <group position={[-1.6, 1.9, -1.98]}>
      <mesh><planeGeometry args={[1.3, 1.1]} /><meshBasicMaterial map={view} /></mesh>
      <Box p={[0, 0, 0.02]} s={[1.38, 0.06, 0.05]} c="#f0ece0" /><Box p={[0, 0.56, 0.02]} s={[1.38, 0.06, 0.05]} c="#f0ece0" /><Box p={[0, -0.56, 0.02]} s={[1.45, 0.08, 0.12]} c="#f0ece0" />
      <Box p={[0, 0, 0.02]} s={[0.06, 1.18, 0.05]} c="#f0ece0" /><Box p={[-0.67, 0, 0.02]} s={[0.06, 1.18, 0.05]} c="#f0ece0" /><Box p={[0.67, 0, 0.02]} s={[0.06, 1.18, 0.05]} c="#f0ece0" />
      <Box p={[0, -0.85, 0.08]} s={[1.2, 0.3, 0.1]} c="#d8d0c0" />
    </group>
    <Snow area={[-2.2, -1.0, 1.4, 2.4, -1.97, -1.96]} n={50} speed={0.25} />
    {/* шкафы ЭВМ справа */}
    <Mainframe p={[1.3, 0, -1.6]} seed={1} /><Mainframe p={[2.2, 0, -1.6]} seed={2} />
    <Mainframe p={[2.65, 0, -0.6]} rotY={-Math.PI / 2} seed={3} />
    {/* плакат и часы */}
    <Sign p={[0.05, 2.35, -1.99]} w={1.0} h={0.42} text="ВЦ АН СССР" bg="#c83a2a" fg="#fff2d0" glow={0.3} />
    <group position={[0.05, 1.85, -1.99]}><mesh><circleGeometry args={[0.16, 32]} /><meshStandardMaterial color="#f8f4e8" /></mesh>
      <Screen p={[0, 0, 0.005]} w={0.26} h={0.1} res={200} draw={(g, s, W, H) => { g.fillStyle = "#f8f4e8"; g.fillRect(0, 0, W, H); fitText(g, clock, W / 2, H / 2, W * 0.9, H * 0.8, "#1a1020"); }} glow={0.2} /></group>
    {/* лампы дневного света */}
    <TubeLight p={[-0.8, 2.95, -0.6]} /><TubeLight p={[0.9, 2.95, -0.6]} flicker /><TubeLight p={[0, 2.95, 0.9]} />
    {/* стол: терминал, лампа, чай, бумаги, дискеты */}
    <Box p={[0, 0.72, -0.85]} s={[1.6, 0.06, 0.8]} c="#a8784a" />
    {[-0.72, 0.72].map((x) => <Box key={x} p={[x, 0.35, -0.85]} s={[0.06, 0.7, 0.7]} c="#8a5e38" />)}
    <Terminal p={[-0.15, 0.75, -1.05]} draw={term} />
    <DeskLamp p={[0.55, 0.75, -1.1]} rotY={2.6} />
    <TeaGlass p={[0.42, 0.75, -0.7]} />
    {[0, 1, 2].map((i) => <Box key={i} p={[-0.62 + i * 0.03, 0.76 + i * 0.006, -0.75]} s={[0.24, 0.005, 0.32]} c="#f4f0e4" line={false} rot={[0, 0.2 * i - 0.2, 0]} />)}
    {[0, 1, 2].map((i) => <Box key={"d" + i} p={[0.25 + i * 0.05, 0.765, -0.62 - i * 0.02]} s={[0.13, 0.008, 0.13]} c={["#1a1a22", "#2a2a5a", "#1a1a22"][i]} line={false} rot={[0, 0.3 * i, 0]} />)}
    {/* стул */}
    {chair ? <><Box p={[0, 0.45, -0.2]} s={[0.5, 0.06, 0.45]} c="#5a3a22" /><Box p={[0, 0.8, 0.02]} s={[0.5, 0.6, 0.05]} c="#5a3a22" /></> : null}
    <Motes area={[-1.2, 1.2, 1.0, 2.6, -1.6, -0.6]} n={30} size={0.005} />
  </>);
};
