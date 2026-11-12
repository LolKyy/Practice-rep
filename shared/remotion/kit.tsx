// Набор для сцен «дудлы в 3D» на three.js внутри Remotion.
// Всё в метрах: x вправо, y вверх, z к камере. Время — секунды ГОЛОСА (useSec).
import React, { createContext, useContext, useMemo } from "react";
import * as THREE from "three";
import { ThreeCanvas } from "@remotion/three";
import { useThree } from "@react-three/fiber";
import { EffectComposer, DepthOfField, Bloom, Vignette, ChromaticAberration, Noise } from "@react-three/postprocessing";
import { BlendFunction } from "postprocessing";
import { LineSegments2 } from "three/examples/jsm/lines/LineSegments2.js";
import { LineSegmentsGeometry } from "three/examples/jsm/lines/LineSegmentsGeometry.js";
import { LineMaterial } from "three/examples/jsm/lines/LineMaterial.js";
import { Easing, useCurrentFrame, useVideoConfig } from "remotion";
import { CH, CW, PLANE_H, PLANE_W, drawDoodle, Look, Pose } from "./doodle";

export const FPS = 30;
export const LINE = "#20180f";
export type V3 = [number, number, number];
export const FONT = "'Russo One', Arial Black, sans-serif";

const ShotCtx = createContext<{ t0: number; cam: THREE.Vector3 }>({ t0: 0, cam: new THREE.Vector3() });
export const useSec = () => { const f = useCurrentFrame(); const { t0 } = useContext(ShotCtx); return t0 + f / FPS; };
export const clamp = (x: number, a = 0, b = 1) => Math.max(a, Math.min(b, x));
export const ease = (x: number) => Easing.out(Easing.cubic)(clamp(x));
export const lerp = (a: number, b: number, k: number) => a + (b - a) * k;
// «бонк» на ударном слове: 1→1+amt→меньше→1
export const bonkAt = (sec: number, t: number, amt = 0.35) => {
  const tb = (sec - t) * FPS;
  return tb > 0 ? 1 + amt * Math.exp(-tb / 3.5) * Math.cos(tb * 1.25) : 1;
};
// появление с перелётом 0→1
export const popAt = (sec: number, t: number, d = 0.35) => (sec < t ? 0 : Easing.out(Easing.back(2.2))(clamp((sec - t) / d)));

// ------------------------------------------------------------------ обводка рёбер
let lineMat: LineMaterial | null = null;
const getLineMat = (w: number, h: number) => {
  if (!lineMat) lineMat = new LineMaterial({ color: LINE, linewidth: 3.2, worldUnits: false });
  lineMat.resolution.set(w, h);
  return lineMat;
};

export const Box: React.FC<{ p: V3; s: V3; c: string; r?: number; rot?: V3; e?: string; ei?: number; metal?: number;
  line?: boolean; shadow?: boolean; map?: THREE.Texture | null; scale?: number }> =
  ({ p, s, c, r = 0.75, rot = [0, 0, 0], e, ei = 0, metal = 0, line = true, shadow = true, map = null, scale = 1 }) => {
    const { size } = useThree();
    const edges = useMemo(() => {
      if (!line) return null;
      const eg = new THREE.EdgesGeometry(new THREE.BoxGeometry(...s));
      return new LineSegments2(new LineSegmentsGeometry().setPositions(eg.attributes.position.array as Float32Array), getLineMat(size.width, size.height));
    }, [line, s[0], s[1], s[2]]);
    return (
      <group position={p} rotation={rot} scale={scale}>
        <mesh castShadow={shadow} receiveShadow>
          <boxGeometry args={s} />
          <meshStandardMaterial color={c} roughness={r} metalness={metal} emissive={e ?? "#000"} emissiveIntensity={ei} map={map} />
        </mesh>
        {edges ? <primitive object={edges} /> : null}
      </group>
    );
  };

export const Cyl: React.FC<{ p: V3; r: number; h: number; c: string; rot?: V3; seg?: number }> = ({ p, r, h, c, rot = [0, 0, 0], seg = 16 }) => (
  <mesh position={p} rotation={rot} castShadow receiveShadow><cylinderGeometry args={[r, r, h, seg]} /><meshStandardMaterial color={c} roughness={0.7} /></mesh>
);

// ------------------------------------------------------------------ текстуры из Canvas
export const canvasTex = (w: number, h: number, draw: (g: CanvasRenderingContext2D) => void) => {
  const cv = document.createElement("canvas"); cv.width = w; cv.height = h;
  draw(cv.getContext("2d")!);
  const t = new THREE.CanvasTexture(cv); t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 8; return t;
};
export const fitText = (g: CanvasRenderingContext2D, txt: string, x: number, y: number, maxW: number, size: number, col: string, font = FONT) => {
  let s = size; g.font = `900 ${s}px ${font}`;
  while (g.measureText(txt).width > maxW && s > 8) { s -= 2; g.font = `900 ${s}px ${font}`; }
  g.fillStyle = col; g.textAlign = "center"; g.textBaseline = "middle"; g.fillText(txt, x, y);
};
export const label = (txt: string, bg: string, fg: string, w = 512, h = 176, sz = 110) => canvasTex(w, h, (g) => {
  g.fillStyle = bg; g.fillRect(0, 0, w, h); fitText(g, txt, w / 2, h / 2 + 4, w * 0.9, sz, fg);
});

// Табличка/вывеска (смотрит на +z)
export const Sign: React.FC<{ p: V3; w: number; h: number; text: string; bg: string; fg: string; glow?: number; rot?: V3; sz?: number; scale?: number }> =
  ({ p, w, h, text, bg, fg, glow = 0.25, rot = [0, 0, 0], sz, scale = 1 }) => {
    const tex = useMemo(() => label(text, bg, fg, 512, Math.round((512 * h) / w), sz ?? Math.round(((512 * h) / w) * 0.62)), [text, bg, fg, w, h]);
    return <mesh position={p} rotation={rot} scale={scale}><planeGeometry args={[w, h]} />
      <meshStandardMaterial map={tex} emissive="#ffffff" emissiveMap={tex} emissiveIntensity={glow} /></mesh>;
  };

// «Живой» экран: canvas перерисовывается каждый кадр функцией draw(g, sec, W, H)
export const Screen: React.FC<{ p: V3; w: number; h: number; draw: (g: CanvasRenderingContext2D, sec: number, W: number, H: number) => void; rot?: V3; glow?: number; res?: number; scale?: number; basic?: boolean; transparent?: boolean }> =
  ({ p, w, h, draw, rot = [0, 0, 0], glow = 0.9, res = 512, scale = 1, basic = true, transparent = false }) => {
    const sec = useSec();
    const W = res, H = Math.round((res * h) / w);
    const { cv, tex } = useMemo(() => {
      const cv = document.createElement("canvas"); cv.width = W; cv.height = H;
      const tex = new THREE.CanvasTexture(cv); tex.colorSpace = THREE.SRGBColorSpace; tex.anisotropy = 8; return { cv, tex };
    }, [W, H]);
    const g = cv.getContext("2d")!; g.save(); draw(g, sec, W, H); g.restore(); tex.needsUpdate = true;
    return <mesh position={p} rotation={rot} scale={scale}><planeGeometry args={[w, h]} />
      {basic ? <meshBasicMaterial map={tex} toneMapped={false} color={[glow, glow, glow]} transparent={transparent} depthWrite={!transparent} /> : <meshStandardMaterial map={tex} emissive="#fff" emissiveMap={tex} emissiveIntensity={glow} />}</mesh>;
  };

// ------------------------------------------------------------------ реквизит
export const Desk: React.FC<{ p: V3; rotY?: number; w?: number; c?: string }> = ({ p, rotY = 0, w = 1.4, c = "#b8784a" }) => (
  <group position={p} rotation={[0, rotY, 0]}>
    <Box p={[0, 0.75, 0]} s={[w, 0.05, 0.7]} c={c} r={0.6} />
    {[-1, 1].map((s) => <Box key={s} p={[s * (w / 2 - 0.2), 0.37, 0]} s={[0.36, 0.72, 0.63]} c="#5a3a2a" />)}
  </group>
);
export const Chair: React.FC<{ p: V3; rotY?: number; c?: string }> = ({ p, rotY = 0, c = "#2f9e9a" }) => (
  <group position={p} rotation={[0, rotY, 0]}>
    <Box p={[0, 0.48, 0]} s={[0.48, 0.08, 0.46]} c={c} /><Box p={[0, 0.85, -0.22]} s={[0.48, 0.6, 0.07]} c={c} />
    <Box p={[0, 0.24, 0]} s={[0.07, 0.44, 0.07]} c="#2a2d33" /><Box p={[0, 0.03, 0]} s={[0.5, 0.05, 0.5]} c="#2a2d33" />
  </group>
);
export const Shelf: React.FC<{ p: V3; rotY?: number; w?: number; h?: number }> = ({ p, rotY = 0, w = 1.0, h = 1.8 }) => {
  const cols = ["#d64545", "#2f6fd6", "#f2c230", "#3f8a4b", "#2f9e9a", "#e46b2b", "#efe6d2", "#b04fd6"];
  const items: JSX.Element[] = [];
  for (let k = 0; k < 4; k++) { let x = -w / 2 + 0.06, i = 0; while (x < w / 2 - 0.1) {
    const bw = 0.05 + ((k * 7 + i * 13) % 6) * 0.012, bh = 0.2 + ((k * 5 + i * 3) % 5) * 0.03;
    items.push(<Box key={k + "_" + i} p={[x + bw / 2, 0.05 + (k * h) / 4 + bh / 2 + 0.015, 0]} s={[bw, bh, 0.22]} c={cols[(k + i) % 8]} line={bh > 0.28} />);
    x += bw + 0.008; i++; } }
  return (<group position={p} rotation={[0, rotY, 0]}>
    {[-1, 1].map((s) => <Box key={s} p={[(s * w) / 2, h / 2, 0]} s={[0.04, h, 0.32]} c="#3a2a4a" />)}
    {[0, 1, 2, 3].map((k) => <Box key={k} p={[0, 0.05 + (k * h) / 4, 0]} s={[w, 0.03, 0.32]} c="#3a2a4a" />)}{items}
  </group>);
};
export const Plant: React.FC<{ p: V3; h?: number }> = ({ p, h = 0.6 }) => (
  <group position={p}>
    <Box p={[0, 0.15, 0]} s={[0.26, 0.3, 0.26]} c="#b5653a" />
    {Array.from({ length: 8 }, (_, i) => <mesh key={i} position={[Math.cos(i) * 0.07, 0.3 + h * 0.4, Math.sin(i) * 0.07]} rotation={[Math.sin(i) * 0.45, i, Math.cos(i) * 0.45]} castShadow>
      <boxGeometry args={[0.07, h * 0.8, 0.02]} /><meshStandardMaterial color="#3f8a4b" /></mesh>)}
  </group>
);
export const Couch: React.FC<{ p: V3; c?: string; rotY?: number }> = ({ p, c = "#6b4fd6", rotY = 0 }) => (
  <group position={p} rotation={[0, rotY, 0]}>
    <Box p={[0, 0.25, 0]} s={[2.0, 0.4, 0.85]} c={c} r={0.9} /><Box p={[0, 0.7, -0.35]} s={[2.0, 0.6, 0.2]} c={c} r={0.9} />
    {[-1, 1].map((s) => <Box key={s} p={[s * 0.95, 0.5, 0]} s={[0.2, 0.35, 0.85]} c={c} r={0.9} />)}
  </group>
);
export const Lamp: React.FC<{ p: V3; len?: number; glow?: number; col?: string }> = ({ p, len = 1.4, glow: g0 = 0.9, col }) => { const glow = Math.min(0.9, g0); return (
  <mesh position={p}><boxGeometry args={[len, 0.04, 0.16]} /><meshBasicMaterial color={col ? new THREE.Color(col).multiplyScalar(glow) : [glow, glow * 0.96, glow * 0.88]} toneMapped={false} /></mesh>
); };
// неоновая полоса
export const Neon: React.FC<{ p: V3; s: V3; col: string; k?: number }> = ({ p, s, col, k = 2.2 }) => (
  <mesh position={p}><boxGeometry args={s} /><meshBasicMaterial color={new THREE.Color(col).multiplyScalar(k)} toneMapped={false} /></mesh>
);
export const Palm: React.FC<{ p: V3; h?: number; lean?: number }> = ({ p, h = 4, lean = 0.12 }) => (
  <group position={p} rotation={[0, 0, lean]}>
    {Array.from({ length: 7 }, (_, i) => <Cyl key={i} p={[Math.sin(i * 0.4) * 0.05, (i + 0.5) * (h / 7), 0]} r={0.13 - i * 0.008} h={h / 7 + 0.02} c={i % 2 ? "#8a5a3a" : "#7a4c30"} />)}
    {Array.from({ length: 7 }, (_, i) => { const a = (i / 7) * Math.PI * 2;
      return <mesh key={"l" + i} position={[Math.cos(a) * 0.7, h - 0.15, Math.sin(a) * 0.7]} rotation={[Math.sin(a) * 0.5, -a, Math.cos(a) * 0.5 - 0.0]} castShadow>
        <boxGeometry args={[1.5, 0.04, 0.32]} /><meshStandardMaterial color={i % 2 ? "#2f8a4b" : "#3fa85a"} /></mesh>; })}
  </group>
);
// небо-закат: градиент + солнце с полосами
export const SunsetSky: React.FC<{ p?: V3; w?: number; h?: number; night?: boolean }> = ({ p = [0, 6, -14], w = 40, h = 18, night = false }) => {
  const tex = useMemo(() => canvasTex(512, 512, (g) => {
    const gr = g.createLinearGradient(0, 0, 0, 512);
    if (night) { gr.addColorStop(0, "#0b0624"); gr.addColorStop(0.6, "#2a0f4a"); gr.addColorStop(1, "#5a1f6a"); }
    else { gr.addColorStop(0, "#2a1458"); gr.addColorStop(0.45, "#b0368a"); gr.addColorStop(0.75, "#ff7a59"); gr.addColorStop(1, "#ffc46b"); }
    g.fillStyle = gr; g.fillRect(0, 0, 512, 512);
    if (!night) { const sg = g.createLinearGradient(0, 230, 0, 420); sg.addColorStop(0, "#ffe66b"); sg.addColorStop(1, "#ff4f9a");
      g.fillStyle = sg; g.beginPath(); g.arc(256, 380, 120, Math.PI, 0); g.fill();
      g.fillStyle = "#ff7a59"; for (let i = 0; i < 5; i++) g.fillRect(130, 300 + i * 18, 252, 3 + i * 1.5); }
    else { g.fillStyle = "#fff"; for (let i = 0; i < 80; i++) g.fillRect((i * 97) % 512, (i * 53) % 300, 2, 2); }
  }), [night]);
  return <mesh position={p}><planeGeometry args={[w, h]} /><meshBasicMaterial map={tex} toneMapped={false} /></mesh>;
};
// здание-коробка с окнами
export const Building: React.FC<{ p: V3; s: V3; c: string; win?: string; lit?: number }> = ({ p, s, c, win = "#ffd27a", lit = 0.5 }) => {
  const tex = useMemo(() => canvasTex(256, Math.round(256 * s[1] / s[0]), (g) => {
    const W = 256, H = Math.round(256 * s[1] / s[0]); g.fillStyle = c; g.fillRect(0, 0, W, H);
    const nx = Math.max(2, Math.round(s[0] * 1.6)), ny = Math.max(2, Math.round(s[1] * 1.4));
    for (let i = 0; i < nx; i++) for (let j = 0; j < ny; j++) {
      const on = ((i * 7 + j * 13) % 10) / 10 < lit; g.fillStyle = on ? win : "rgba(0,0,0,0.35)";
      g.fillRect(((i + 0.25) * W) / nx, ((j + 0.25) * H) / ny, (0.5 * W) / nx, (0.45 * H) / ny);
    }
  }), [c, s[0], s[1]]);
  return <Box p={[p[0], p[1] + s[1] / 2, p[2]]} s={s} c="#ffffff" map={tex} r={0.9} />;
};

// Пол / комната
export const Room: React.FC<{ w?: number; d?: number; h?: number; wall?: string; floor?: string; wain?: string; ceil?: string; side?: boolean }> =
  ({ w = 6, d = 4, h = 3, wall = "#4f8f95", floor = "#2f4fa8", wain = "#3f7479", ceil = "#d9d4c8", side = true }) => {
    const L = -w / 2, B = -d / 2;
    return (<>
      <Box p={[0, -0.05, 0]} s={[w, 0.1, d]} c={floor} line={false} r={0.8} />
      <Box p={[0, h + 0.05, 0]} s={[w, 0.1, d]} c={ceil} />
      <Box p={[0, h / 2, B - 0.05]} s={[w, h, 0.1]} c={wall} r={0.85} />
      {side ? <><Box p={[-L + 0.05, h / 2, 0]} s={[0.1, h, d]} c={wall} r={0.85} /><Box p={[L - 0.05, h / 2, 0]} s={[0.1, h, d]} c={wall} r={0.85} /></> : null}
      <Box p={[0, 0.45, B + 0.02]} s={[w, 0.9, 0.04]} c={wain} />
      <Box p={[0, 0.92, B + 0.05]} s={[w, 0.04, 0.05]} c="#e9e2cf" />
    </>);
  };

// ------------------------------------------------------------------ персонажи
type Key = [number, number, number];
export const HIP = 0.4;
export const REST_F: [number, number] = [-0.2, HIP + 0.06], REST_B: [number, number] = [0.2, HIP + 0.06];
export const PAD_F: [number, number] = [-0.1, HIP + 0.16], PAD_B: [number, number] = [0.1, HIP + 0.16];
export const HEAD_Z = HIP + 0.36 + 0.27 * 0.78;
const track = (t: number, keys: Key[]): [number, number] => {
  if (t <= keys[0][0]) return [keys[0][1], keys[0][2]];
  for (let i = 1; i < keys.length; i++) if (t <= keys[i][0]) {
    const a = keys[i - 1], b = keys[i];
    const k = Easing.out(Easing.back(1.8))((t - a[0]) / Math.max(1e-6, b[0] - a[0]));
    return [a[1] + (b[1] - a[1]) * k, a[2] + (b[2] - a[2]) * k];
  }
  const l = keys[keys.length - 1]; return [l[1], l[2]];
};
const trackLin = (t: number, keys: Key[]): [number, number] => {
  if (t <= keys[0][0]) return [keys[0][1], keys[0][2]];
  for (let i = 1; i < keys.length; i++) if (t <= keys[i][0]) {
    const a = keys[i - 1], b = keys[i], k = Easing.inOut(Easing.quad)((t - a[0]) / Math.max(1e-6, b[0] - a[0]));
    return [a[1] + (b[1] - a[1]) * k, a[2] + (b[2] - a[2]) * k];
  }
  const l = keys[keys.length - 1]; return [l[1], l[2]];
};
export type Actor = {
  pos: V3; look: Look; seed: number; scale?: number;
  expr: [number, string][];
  handF?: Key[]; handB?: Key[]; lean?: Key[]; talk?: [number, number][]; walk?: Key[]; hidden?: [number, number][]; shiver?: number; hop?: number; back?: [number, number][];
  sign?: [string, string, string]; // плакат над головой: текст, фон, цвет текста
};
export const pointKeys = (t: number, dx: number, dz: number, hold = 1.0, side: "f" | "b" = "f"): Key[] => {
  const rest = side === "f" ? REST_F : REST_B, sh = side === "f" ? -0.12 : 0.12;
  return [[t - 0.35, ...rest], [t - 0.12, sh * 0.2, HEAD_Z + 0.15], [t, sh + dx * 0.6, HIP + 0.25 + dz * 0.6], [t + hold, sh + dx * 0.6, HIP + 0.25 + dz * 0.6], [t + hold + 0.25, ...rest]];
};
// руки вверх (радость/паника) с t на d секунд
export const armsUp = (t: number, d = 1.2): { handF: Key[]; handB: Key[] } => ({
  handF: [[t - 0.2, ...REST_F], [t, -0.42, HEAD_Z + 0.35], [t + d, -0.42, HEAD_Z + 0.35], [t + d + 0.25, ...REST_F]],
  handB: [[t - 0.2, ...REST_B], [t, 0.42, HEAD_Z + 0.35], [t + d, 0.42, HEAD_Z + 0.35], [t + d + 0.25, ...REST_B]],
});
export const padHands = { handF: [[0, ...PAD_F]] as Key[], handB: [[0, ...PAD_B]] as Key[] };

export const Doodle: React.FC<{ a: Actor }> = ({ a }) => {
  const sec = useSec();
  const { cam } = useContext(ShotCtx);
  const { canvas, tex } = useMemo(() => {
    const cv = document.createElement("canvas"); cv.width = CW; cv.height = CH;
    const t = new THREE.CanvasTexture(cv); t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 8; return { canvas: cv, tex: t };
  }, []);
  const f2 = Math.floor(sec * FPS / 2) * 2;
  const t = f2 / FPS;
  if (a.hidden?.some(([s, e]) => t >= s && t < e)) return null;
  let ex = a.expr[0][1], tc = -10;
  for (const [tt, e] of a.expr) if (t >= tt) { ex = e; tc = tt; }
  const tb = (t - tc) * FPS;
  const bonk = tc > -10 && tb >= 0 ? Math.exp(-tb / 3.5) * Math.cos(tb * 1.25) : 0;
  let sd = (a.seed * 9301 + f2 * 49297) % 233280; const rnd = () => ((sd = (sd * 9301 + 49297) % 233280) / 233280);
  const dart = Math.sin(t * 1.7 + a.seed * 2) > 0.6 ? 0.9 : Math.sin(t * 1.3 + a.seed) < -0.7 ? -0.9 : 0;
  const talking = a.talk?.some(([s, e]) => t >= s && t < e);
  const pose: Pose = {
    expr: ex, blink: (f2 + a.seed * 37) % 79 < 3, bonk, breathe: Math.sin(f2 / 14 + a.seed) * 0.012, lookX: dart,
    talk: talking ? 0.25 + 0.75 * Math.abs(Math.sin(t * FPS * Math.PI / 3.5)) : 0,
    handF: a.handF ? track(t, a.handF) : REST_F, handB: a.handB ? track(t, a.handB) : REST_B,
    lean: a.lean ? track(t, a.lean)[0] : 0, tilt: Math.sin(t * 1.1 + a.seed) * 0.03, shiver: a.shiver, back: a.back?.some(([s, e]) => t >= s && t < e),
  };
  drawDoodle(canvas.getContext("2d")!, a.look, pose, rnd);
  tex.needsUpdate = true;
  const pos = a.walk ? (() => { const [x, z] = trackLin(t, a.walk!); return [x, a.pos[1], z] as V3; })() : a.pos;
  const hop = a.hop ? Math.abs(Math.sin(t * a.hop + a.seed)) * 0.08 : 0;
  const yaw = Math.atan2(cam.x - pos[0], cam.z - pos[2]);
  const sc = a.scale ?? 1;
  return (
    <group position={[pos[0], pos[1] + hop, pos[2]]} rotation={[0, yaw, 0]} scale={sc}>
      <mesh position={[0, PLANE_H / 2, 0]}>
        <planeGeometry args={[PLANE_W, PLANE_H]} />
        <meshLambertMaterial map={tex} emissive="#ffffff" emissiveMap={tex} emissiveIntensity={0.55} transparent alphaTest={0.5} side={THREE.DoubleSide} />
      </mesh>
      {a.sign ? <group position={[0.3, 1.95, -0.02]} rotation={[0, 0, Math.sin(t * 5 + a.seed) * 0.08]}>
        <mesh position={[0, -0.45, -0.01]}><boxGeometry args={[0.04, 0.9, 0.02]} /><meshStandardMaterial color="#8a5a3a" /></mesh>
        <Sign p={[0, 0, 0]} w={0.8} h={0.45} text={a.sign[0]} bg={a.sign[1]} fg={a.sign[2]} glow={0.35} />
      </group> : null}
    </group>
  );
};
// толпа: n дудлов по сетке, появляются к моменту tIn[i]
const BODY = ["#e64b4b", "#2f8fe0", "#f2c230", "#3fb27f", "#b04fd6", "#ff7a2f", "#30c8d0", "#ff5fa2"];
const HAIRS: Look["hair"][] = ["bowl", "spiky", "long", "slick", "bun", "bald"];
export const crowd = (n: number, x0: number, x1: number, z0: number, z1: number, seed = 1, expr: [number, string][] = [[0, "angry"]]) =>
  Array.from({ length: n }, (_, i): Actor => {
    const r = (k: number) => { const v = Math.sin((i + 1) * 12.9898 * k + seed * 78.233) * 43758.5453; return v - Math.floor(v); };
    return { pos: [lerp(x0, x1, r(1)), 0, lerp(z0, z1, r(2))], seed: seed * 100 + i, look: { body: BODY[(i + seed) % 8], hair: HAIRS[(i * 3 + seed) % 6], cap: r(3) > 0.8 ? "#222" : undefined },
      expr: expr.map(([t, e], k) => [t + r(4 + k) * 0.3, e] as [number, string]), hop: 7 + r(5) * 5, scale: 0.9 + r(6) * 0.2 };
  });

// ------------------------------------------------------------------ камера и сцена
export type CamKey = [number, V3, V3, number?];
const lerp3 = (a: V3, b: V3, k: number): V3 => [a[0] + (b[0] - a[0]) * k, a[1] + (b[1] - a[1]) * k, a[2] + (b[2] - a[2]) * k];
// отрезки камеры: быстро в начале, плавно к концу (как в референсе)
const camAt = (t: number, keys: CamKey[]) => {
  if (t <= keys[0][0]) return keys[0];
  for (let i = 1; i < keys.length; i++) if (t <= keys[i][0]) {
    const a = keys[i - 1], b = keys[i], k = Easing.out(Easing.cubic)((t - a[0]) / (b[0] - a[0]));
    return [t, lerp3(a[1], b[1], k), lerp3(a[2], b[2], k), (a[3] ?? 60) + ((b[3] ?? 60) - (a[3] ?? 60)) * k] as CamKey;
  }
  return keys[keys.length - 1];
};
const CamRig: React.FC<{ pos: THREE.Vector3; look: THREE.Vector3; fov: number; roll: number }> = ({ pos, look, fov, roll }) => {
  const { camera } = useThree();
  const c = camera as THREE.PerspectiveCamera;
  c.position.copy(pos); c.up.set(Math.sin(roll), Math.cos(roll), 0); c.lookAt(look); c.fov = fov; c.near = 0.05; c.far = 60;
  c.updateProjectionMatrix();
  return null;
};

export type LightPreset = "day" | "night" | "studio" | "neon" | "office" | "storm";
const Lights: React.FC<{ preset: LightPreset }> = ({ preset }) => {
  const sh = { castShadow: true, "shadow-mapSize-width": 2048, "shadow-mapSize-height": 2048, "shadow-radius": 8, "shadow-bias": -0.0005,
    "shadow-camera-left": -8, "shadow-camera-right": 8, "shadow-camera-top": 8, "shadow-camera-bottom": -8 } as any;
  if (preset === "day") return (<><hemisphereLight args={["#ffe0f0", "#4a3a6a", 1.0]} />
    <directionalLight position={[-4, 6, 3]} intensity={2.6} color="#ffd0a0" {...sh} /><directionalLight position={[4, 3, 6]} intensity={0.6} color="#c0d8ff" /></>);
  if (preset === "night") return (<><hemisphereLight args={["#8a9fe0", "#2c3460", 1.1]} />
    <directionalLight position={[-3, 5, 2]} intensity={1.2} color="#8d9dff" {...sh} /><pointLight position={[0.5, 1.8, 0.8]} intensity={8} decay={1.3} color="#ffc477" castShadow /></>);
  if (preset === "neon") return (<><hemisphereLight args={["#d0b8ff", "#2a1440", 0.8]} />
    <directionalLight position={[-2, 4, 4]} intensity={1.6} color="#ffd8f0" {...sh} />
    <pointLight position={[-2, 2.4, 0]} intensity={10} decay={1.3} color="#ff4fb8" /><pointLight position={[2.2, 2.2, 0.5]} intensity={10} decay={1.3} color="#30d8ff" /></>);
  if (preset === "office") return (<><hemisphereLight args={["#e8f0ff", "#4a4a5a", 1.0]} />
    <directionalLight position={[-3, 5, 3]} intensity={2.4} color="#fff0dd" {...sh} /><pointLight position={[0, 1.8, 1.5]} intensity={1.5} decay={1.4} color="#fff4e0" /></>);
  if (preset === "storm") return (<><hemisphereLight args={["#a0b0d8", "#303048", 1.2]} />
    <directionalLight position={[-3, 6, 3]} intensity={1.2} color="#b0c0ff" {...sh} /></>);
  return (<><hemisphereLight args={["#cfd8ff", "#141a33", 0.7]} />
    <spotLight position={[-1.5, 5, 3]} angle={0.6} penumbra={0.6} intensity={50} decay={1} color="#ffd0c0" castShadow />
    <spotLight position={[1.8, 5, 3]} angle={0.6} penumbra={0.6} intensity={45} decay={1} color="#a0e8ff" castShadow /></>);
};

export const CAM_DIST = 1.55, CAM_FOV = 6;
export type Shake = [number, number, number?]; // [секунда, сила, длительность]
export const Scene3D: React.FC<{ t0: number; cam: CamKey[]; focus: V3; light?: LightPreset; bg?: string; roll?: [number, number]; shakes?: Shake[]; dof?: number; fog?: string; children: React.ReactNode }> =
  ({ t0, cam, focus, light = "day", bg = "#9fbfe0", roll = [0, 0], shakes = [], dof = 0, fog, children }) => {
    const frame = useCurrentFrame();
    const { width, height } = useVideoConfig();
    const t = t0 + frame / FPS;
    const [, p, l, fov] = camAt(t, cam);
    // общий отъезд: камера дальше от цели в CAM_DIST раз и чуть шире угол — чтобы ничего не обрезалось
    const look = new THREE.Vector3(...l);
    const pos = new THREE.Vector3(...p).sub(look).multiplyScalar(CAM_DIST).add(look);
    pos.x += Math.sin(frame / 23) * 0.01; pos.y += Math.sin(frame / 17) * 0.007;
    for (const [ts, amp, d = 0.45] of shakes) {
      const u = t - ts; if (u < 0 || u > d) continue;
      const k = amp * (1 - u / d) * 0.06;
      pos.x += Math.sin(frame * 2.7 + ts) * k; pos.y += Math.cos(frame * 3.3 + ts) * k; look.x += Math.sin(frame * 2.1) * k;
    }
    const rk = clamp((t - cam[0][0]) / Math.max(0.01, cam[cam.length - 1][0] - cam[0][0]));
    const r = lerp(roll[0], roll[1], Easing.out(Easing.cubic)(rk));
    return (
      <ShotCtx.Provider value={{ t0, cam: pos }}>
        <ThreeCanvas width={width} height={height} shadows={{ type: THREE.PCFSoftShadowMap }}
          gl={{ toneMapping: THREE.AgXToneMapping, toneMappingExposure: 1.55, antialias: false }} style={{ backgroundColor: bg }}>
          <ShotCtx.Provider value={{ t0, cam: pos }}>
            <CamRig pos={pos} look={look} fov={(fov ?? 60) + CAM_FOV} roll={r} />
            {fog ? <fog attach="fog" args={[fog, 8, 40]} /> : null}
            <Lights preset={light} />
            {children}
            <EffectComposer multisampling={4}>
              {dof > 0 ? <DepthOfField target={focus} focalLength={0.05} bokehScale={dof * 0.3} height={1080} /> : <></>}
              <Bloom luminanceThreshold={1.05} intensity={0.35} mipmapBlur />
              <ChromaticAberration offset={new THREE.Vector2(0.0005, 0.0003) as any} radialModulation={true} modulationOffset={0.6} />
              <Noise opacity={0.025} blendFunction={BlendFunction.OVERLAY} />
              <Vignette eskil={false} offset={0.3} darkness={0.35} />
            </EffectComposer>
          </ShotCtx.Provider>
        </ThreeCanvas>
      </ShotCtx.Provider>
    );
  };
