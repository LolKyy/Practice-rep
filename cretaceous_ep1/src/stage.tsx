// «Бумажный театр» на three.js в Remotion: слои-листы с настоящим светом, тенями между планами и малой ГРИП.
// Мир в метрах: x вправо, y вверх, z к камере. Время везде — секунды ГОЛОСА.
import React, { createContext, useContext, useMemo } from "react";
import * as THREE from "three";
import { ThreeCanvas } from "@remotion/three";
import { useThree } from "@react-three/fiber";
import { EffectComposer, DepthOfField, Vignette, Noise, BrightnessContrast } from "@react-three/postprocessing";
import { BlendFunction } from "postprocessing";
import { Easing, getInputProps, useCurrentFrame, useVideoConfig } from "remotion";
const Q = { ms: 0, dof: 1, sh: 1024, soft: 1, post: 1, ...(getInputProps() as any) };
import type { G } from "./cut";

export const FPS = 30;
export type V3 = [number, number, number];

const ShotCtx = createContext<{ t0: number; shake: (t: number, z: number) => [number, number] }>({ t0: 0, shake: () => [0, 0] });
export const useSec = () => { const f = useCurrentFrame(); const { t0 } = useContext(ShotCtx); return t0 + f / FPS; };
// время «по двойкам» (стоп-моушен, 15 фаз в секунду)
export const twos = (t: number) => Math.floor(t * FPS / 2) * 2 / FPS;

// ------------------------------------------------------------------ easing / ключи
export const clamp = (x: number, a = 0, b = 1) => Math.max(a, Math.min(b, x));
export const eo = (x: number) => Easing.out(Easing.cubic)(clamp(x));
export const eio = (x: number) => Easing.inOut(Easing.cubic)(clamp(x));
export const back = (x: number) => Easing.out(Easing.back(1.7))(clamp(x));
// значение по ключам [t, v] с перелётом (спринг-подобно)
export const keys = (t: number, k: [number, number][], ease: (x: number) => number = back) => {
  if (t <= k[0][0]) return k[0][1];
  for (let i = 1; i < k.length; i++) if (t <= k[i][0]) { const a = k[i - 1], b = k[i]; return a[1] + (b[1] - a[1]) * ease((t - a[0]) / Math.max(1e-6, b[0] - a[0])); }
  return k[k.length - 1][1];
};
export const step = <T,>(t: number, k: [number, T][]): T => { let v = k[0][1]; for (const [tt, x] of k) if (t >= tt) v = x; return v; };
export const pulse = (t: number, at: number, dur = 0.5) => (t >= at && t < at + dur ? Math.exp(-((t - at) / dur) * 4) : 0);

// ------------------------------------------------------------------ лист бумаги
// draw(g, t) рисует в координатах «см» листа: (0,0) — левый верх, w*100 × h*100.
// dyn — перерисовывать каждый кадр (по двойкам). anchor — точка привязки листа (по умолчанию центр-низ).
export const Sheet: React.FC<{
  p: V3; w: number; h: number; draw: (g: G, t: number) => void; dyn?: boolean; res?: number; rot?: V3; anchor?: [number, number];
  shadow?: boolean; receive?: boolean; emissive?: number; vib?: number; scale?: number; deps?: any[]; basic?: boolean; opacity?: number;
}> = ({ p, w, h, draw, dyn = false, res = 420, rot = [0, 0, 0], anchor = [0.5, 0], shadow = true, receive = true, emissive = 0, vib = 1, scale = 1, deps = [], basic = false, opacity = 1 }) => {
  const sec = useSec();
  const { shake } = useContext(ShotCtx);
  const px = Math.min(4096 / Math.max(w, h), res);
  const { cv, tex } = useMemo(() => {
    const cv = document.createElement("canvas"); cv.width = Math.round(w * px); cv.height = Math.round(h * px);
    const tex = new THREE.CanvasTexture(cv); tex.colorSpace = THREE.SRGBColorSpace; tex.anisotropy = 8; tex.generateMipmaps = true;
    return { cv, tex };
  }, [w, h, px]);
  const t = twos(sec);
  const key = dyn ? t : 0;
  useMemo(() => {
    const g = cv.getContext("2d")!; g.setTransform(1, 0, 0, 1, 0, 0); g.clearRect(0, 0, cv.width, cv.height);
    g.scale(px / 100, px / 100); draw(g, t); tex.needsUpdate = true;
  }, [key, cv, ...deps]);
  const [sx, sy] = shake(sec, p[2]);
  const cx = (0.5 - anchor[0]) * w, cy = (0.5 - anchor[1]) * h;
  return (
    <group position={[p[0] + sx * vib, p[1] + sy * vib, p[2]]} rotation={rot} scale={scale}>
      <mesh position={[cx, cy, 0]} castShadow={shadow} receiveShadow={receive}>
        <planeGeometry args={[w, h]} />
        {basic ? <meshBasicMaterial map={tex} transparent alphaTest={0.02} opacity={opacity} toneMapped={false} depthWrite={false} />
          : <meshStandardMaterial map={tex} alphaTest={0.5} roughness={0.95} metalness={0} emissive="#ffffff" emissiveMap={tex} emissiveIntensity={emissive} />}
      </mesh>
    </group>
  );
};

// калька: полупрозрачный лист (туман, стекло, вода, свечение)
export const Tracing: React.FC<{ p: V3; w: number; h: number; color: string; opacity?: number; glow?: boolean; draw?: (g: G, t: number) => void; dyn?: boolean; rot?: V3 }> =
  ({ p, w, h, color, opacity = 0.35, glow = false, draw, dyn, rot }) => (
    <Sheet p={p} w={w} h={h} dyn={dyn} rot={rot} anchor={[0.5, 0.5]} basic opacity={opacity} shadow={false} receive={false} res={120}
      draw={(g, t) => { if (draw) draw(g, t); else { g.fillStyle = color; g.fillRect(0, 0, w * 100, h * 100); } }} deps={[color, glow]} />
  );

// ------------------------------------------------------------------ камера, свет, сцена
export type CamKey = [number, V3, V3, number?];
const lerp3 = (a: V3, b: V3, k: number): V3 => [a[0] + (b[0] - a[0]) * k, a[1] + (b[1] - a[1]) * k, a[2] + (b[2] - a[2]) * k];
const camAt = (t: number, k: CamKey[]): [V3, V3, number] => {
  if (t <= k[0][0]) return [k[0][1], k[0][2], k[0][3] ?? 36];
  for (let i = 1; i < k.length; i++) if (t <= k[i][0]) {
    const a = k[i - 1], b = k[i], e = eio((t - a[0]) / (b[0] - a[0]));
    return [lerp3(a[1], b[1], e), lerp3(a[2], b[2], e), (a[3] ?? 36) + ((b[3] ?? 36) - (a[3] ?? 36)) * e];
  }
  const l = k[k.length - 1]; return [l[1], l[2], l[3] ?? 36];
};
const CamRig: React.FC<{ pos: V3; look: V3; fov: number }> = ({ pos, look, fov }) => {
  const { camera } = useThree(); const c = camera as THREE.PerspectiveCamera;
  c.position.set(...pos); c.lookAt(...look); c.fov = fov; c.near = 0.1; c.far = 40; c.updateProjectionMatrix();
  return null;
};

export type Light = { key?: V3; keyColor?: string; keyI?: number; amb?: number; ambSky?: string; ambGround?: string; rim?: V3; rimColor?: string; rimI?: number; fill?: number; angle?: number; target?: V3 };
export const DAY: Light = { key: [-3.5, 6, 15], keyColor: "#FFE2B0", keyI: 3.2, amb: 1.0, ambSky: "#F3EAD6", ambGround: "#6E6A50", rim: [2, 3, -6], rimColor: "#FFB070", rimI: 1.2, fill: 0.35 };

const Lights: React.FC<{ L: Light; dim: number }> = ({ L, dim }) => {
  const target = useMemo(() => new THREE.Object3D(), []);
  target.position.set(...(L.target ?? [0, 0, 0]));
  return (<>
    <hemisphereLight args={[L.ambSky ?? "#F3EAD6", L.ambGround ?? "#5a5040", (L.amb ?? 1) * dim]} />
    <spotLight position={L.key ?? [-3.5, 6, 15]} target={target} angle={L.angle ?? 0.42} penumbra={0.7} decay={0} intensity={(L.keyI ?? 3) * dim} color={L.keyColor ?? "#FFE2B0"}
      castShadow shadow-mapSize-width={Q.sh} shadow-mapSize-height={Q.sh} shadow-bias={-0.0004} shadow-radius={6} shadow-camera-near={2} shadow-camera-far={40} />
    <primitive object={target} />
    {L.rimI ? <pointLight position={L.rim ?? [2, 3, -6]} intensity={L.rimI * 6 * dim} decay={1.2} color={L.rimColor ?? "#FFB070"} /> : null}
    <directionalLight position={[4, 2, 8]} intensity={(L.fill ?? 0.35) * dim} color="#DDE6FF" />
  </>);
};

// Театр-шот. shakeAmp(t) — вибрация всех слоёв (дальние слабее). dim(t) — «свет гаснет».
export const Theatre: React.FC<{
  t0: number; cam: CamKey[]; focus: V3 | ((t: number) => V3); light?: Light; bg?: string; shakeAmp?: (t: number) => number; dim?: (t: number) => number;
  bokeh?: number; children: React.ReactNode;
}> = ({ t0, cam, focus, light = DAY, bg = "#2b2418", shakeAmp, dim, bokeh = 5, children }) => {
  const frame = useCurrentFrame();
  const { width, height } = useVideoConfig();
  const t = t0 + frame / FPS;
  const [p, l, fov] = camAt(t, cam);
  // «живая» камера: лёгкое покачивание
  const pos: V3 = [p[0] + Math.sin(t * 0.9) * 0.012, p[1] + Math.sin(t * 1.3) * 0.008, p[2]];
  const amp = shakeAmp ? shakeAmp(t) : 0;
  const shake = (tt: number, z: number): [number, number] => {
    if (!amp) return [0, 0];
    const k = amp * clamp((z + 4) / 8, 0.15, 1);  // дальние слабее
    const q = Math.floor(tt * 30);
    return [Math.sin(q * 12.9898 + z * 7) * k, Math.sin(q * 78.233 + z * 3) * k];
  };
  const f = typeof focus === "function" ? focus(t) : focus;
  const d = dim ? dim(t) : 1;
  return (
    <ShotCtx.Provider value={{ t0, shake }}>
      <ThreeCanvas width={width} height={height} shadows={{ type: Q.soft ? THREE.PCFSoftShadowMap : THREE.PCFShadowMap }}
        gl={{ toneMapping: THREE.ACESFilmicToneMapping, toneMappingExposure: 1.0, antialias: false, preserveDrawingBuffer: true }} style={{ backgroundColor: bg }}>
        <ShotCtx.Provider value={{ t0, shake }}>
          <color attach="background" args={[bg]} />
          <CamRig pos={pos} look={l} fov={fov} />
          <Lights L={light} dim={d} />
          {children}
          {Q.post ? <EffectComposer multisampling={Q.ms}>
            {Q.dof ? <DepthOfField target={f} focalLength={0.02} bokehScale={bokeh} height={960} /> : <></>}
            <BrightnessContrast contrast={0.06} />
            <Noise opacity={0.07} blendFunction={BlendFunction.OVERLAY} premultiply />
            <Vignette eskil={false} offset={0.3} darkness={0.55} />
          </EffectComposer> : null}
        </ShotCtx.Provider>
      </ThreeCanvas>
    </ShotCtx.Provider>
  );
};
