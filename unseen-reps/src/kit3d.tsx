// 3D-набор UNSEEN REPS: тёмный «бесконечный» зал, глянцевый пол с отражениями,
// стикмены на суставах, призрак будущего «я», кинокамера по ключам.
// Единицы — метры. y вверх, z к камере. Время — секунды ролика (sec()).
import React, { createContext, useContext } from "react";
import * as THREE from "three";
import { ThreeCanvas } from "@remotion/three";
import { useThree } from "@react-three/fiber";
import { MeshReflectorMaterial } from "@react-three/drei";
import { EffectComposer, Bloom, Vignette, DepthOfField } from "@react-three/postprocessing";
import { Easing, useCurrentFrame, useVideoConfig } from "remotion";

export const FPS = 30;
/** Быстрый режим для превью без видеокарты: REMOTION_FAST=1 (простой пол, без размытия, мягче тени). */
export const FAST = process.env.REMOTION_FAST === "1";
export type V3 = [number, number, number];

// Палитра канала: белые герои, холодный бирюзовый = «будущее я» и плюсы, красный = минусы.
export const COL = { bg: "#07080b", floor: "#0b0c10", hero: "#f4f4f2", ghost: "#4fe3ff", bad: "#ff3b4a", warm: "#ffcf8a" };

const ShotCtx = createContext({ t0: 0 });
export const useSec = () => useContext(ShotCtx).t0 + useCurrentFrame() / FPS;

// ------------------------------------------------------------ анимационные помощники
export const clamp01 = (x: number) => Math.max(0, Math.min(1, x));
const ease = Easing.inOut(Easing.cubic);
/** Значение по ключам [[сек, значение], ...] с плавностью. */
export const keys = (t: number, k: [number, number][]) => {
  if (t <= k[0][0]) return k[0][1];
  for (let i = 1; i < k.length; i++) if (t <= k[i][0]) {
    const a = k[i - 1], b = k[i];
    return a[1] + (b[1] - a[1]) * ease((t - a[0]) / Math.max(1e-6, b[0] - a[0]));
  }
  return k[k.length - 1][1];
};
const lerp = (a: number, b: number, k: number) => a + (b - a) * k;

// ------------------------------------------------------------ поза стикмена
// Углы в радианах, плоскость «сбоку» (вращение вокруг оси X героя). + = вперёд.
export type Pose = {
  torso: number;            // наклон корпуса вперёд
  head: number;             // кивок
  shL: number; elL: number; // плечо/локоть левой руки
  shR: number; elR: number;
  hipL: number; knL: number; // бедро/колено (колено гнётся назад: >0)
  hipR: number; knR: number;
  armOut?: number;          // развести руки в стороны
};
export const POSE: Record<string, Pose> = {
  stand: { torso: 0, head: 0, shL: 0.08, elL: 0.15, shR: -0.08, elR: 0.15, hipL: 0, knL: 0, hipR: 0, knR: 0 },
  slump: { torso: 0.35, head: 0.45, shL: 0.1, elL: 0.1, shR: 0.1, elR: 0.1, hipL: 0, knL: 0.05, hipR: 0, knR: 0.05 },
  sit:   { torso: -0.05, head: 0.05, shL: 0.5, elL: 0.6, shR: 0.5, elR: 0.6, hipL: 1.57, knL: 1.57, hipR: 1.57, knR: 1.57 },
  phone: { torso: 0.15, head: 0.55, shL: 0.6, elL: 1.6, shR: 0.6, elR: 1.6, hipL: 1.57, knL: 1.57, hipR: 1.57, knR: 1.57 },
  lie:   { torso: 0, head: 0, shL: 0.1, elL: 0.1, shR: 0.1, elR: 0.1, hipL: 0, knL: 0.05, hipR: 0, knR: 0.05 },
  win:   { torso: -0.05, head: -0.25, shL: 2.9, elL: 0.1, shR: 2.9, elR: 0.1, hipL: 0, knL: 0, hipR: 0, knR: 0, armOut: 0.35 },
};
export const mixPose = (a: Pose, b: Pose, k: number): Pose => {
  const o: any = {};
  for (const key of Object.keys(a)) o[key] = lerp((a as any)[key] ?? 0, (b as any)[key] ?? 0, k);
  return o as Pose;
};
/** Цикл ходьбы: phase в шагах. */
export const walkPose = (phase: number, energy = 1): Pose => {
  const s = Math.sin(phase * Math.PI), c = Math.cos(phase * Math.PI);
  return {
    torso: 0.08 * energy, head: 0.02,
    shL: -0.55 * s * energy, elL: 0.35, shR: 0.55 * s * energy, elR: 0.35,
    hipL: 0.5 * s * energy, knL: Math.max(0, -c) * 0.8 * energy,
    hipR: -0.5 * s * energy, knR: Math.max(0, c) * 0.8 * energy,
  };
};

// ------------------------------------------------------------ стикмен
const R_LIMB = 0.034, HEAD_R = 0.15, TORSO = 0.5, UPPER = 0.28, FORE = 0.26, THIGH = 0.42, SHIN = 0.42;
const Limb: React.FC<{ len: number; mat: THREE.Material }> = ({ len, mat }) => (
  <mesh position={[0, -len / 2, 0]} material={mat} castShadow><capsuleGeometry args={[R_LIMB, len, 6, 12]} /></mesh>
);

export type Look = { color?: string; glow?: number; opacity?: number; tie?: string; tag?: string };

/**
 * Стикмен. Корень — таз. rotY — куда смотрит (0 = на камеру). lie=1 — лежит на спине (вдоль X).
 * hipY — высота таза (по умолчанию стоя), удобно для сидения.
 */
export const Stickman: React.FC<{ p: V3; rotY?: number; pose: Pose; look?: Look; lie?: number; hipY?: number; scale?: number }> =
  ({ p, rotY = 0, pose, look = {}, lie = 0, hipY, scale = 1 }) => {
    const color = look.color ?? COL.hero;
    const transparent = (look.opacity ?? 1) < 1;
    const mat = React.useMemo(() => new THREE.MeshStandardMaterial({
      color, emissive: color, emissiveIntensity: look.glow ?? 0.35, roughness: 0.45,
      transparent, opacity: look.opacity ?? 1, depthWrite: !transparent,
    }), [color, look.glow, look.opacity]);
    const legLen = THIGH + SHIN;
    const hy = hipY ?? legLen + R_LIMB;
    const arm = (sh: number, el: number, side: 1 | -1) => (
      <group position={[side * 0.13, TORSO - 0.06, 0]} rotation={[-sh, 0, side * (0.12 + (pose.armOut ?? 0))]}>
        <Limb len={UPPER} mat={mat} />
        <group position={[0, -UPPER, 0]} rotation={[-el, 0, 0]}><Limb len={FORE} mat={mat} />
          <mesh position={[0, -FORE - 0.02, 0]} material={mat}><sphereGeometry args={[0.045, 12, 12]} /></mesh></group>
      </group>
    );
    const leg = (hip: number, kn: number, side: 1 | -1) => (
      <group position={[side * 0.08, 0, 0]} rotation={[-hip, 0, 0]}>
        <Limb len={THIGH} mat={mat} />
        <group position={[0, -THIGH, 0]} rotation={[kn, 0, 0]}><Limb len={SHIN} mat={mat} />
          <mesh position={[0, -SHIN - 0.01, 0.04]} material={mat}><boxGeometry args={[0.08, 0.04, 0.16]} /></mesh></group>
      </group>
    );
    // лёжа: поворот всего тела на спину вокруг X (голова к -x после rotY)
    return (
      <group position={p} rotation={[0, rotY, 0]} scale={scale}>
        <group position={[0, lerp(hy, hipY ?? 0.12, lie), 0]} rotation={[-lie * Math.PI / 2, 0, 0]}>
          <group rotation={[pose.torso, 0, 0]}>
            <mesh position={[0, TORSO / 2, 0]} material={mat} castShadow><capsuleGeometry args={[0.07, TORSO - 0.1, 8, 16]} /></mesh>
            {look.tie ? <mesh position={[0, TORSO - 0.15, 0.075]}><boxGeometry args={[0.04, 0.2, 0.01]} /><meshBasicMaterial color={look.tie} /></mesh> : null}
            <group position={[0, TORSO + 0.04, 0]} rotation={[pose.head, 0, 0]}>
              <mesh position={[0, HEAD_R, 0]} material={mat} castShadow><sphereGeometry args={[HEAD_R, 32, 32]} /></mesh>
            </group>
            {arm(pose.shL, pose.elL, -1)}{arm(pose.shR, pose.elR, 1)}
          </group>
          {leg(pose.hipL, pose.knL, -1)}{leg(pose.hipR, pose.knR, 1)}
        </group>
      </group>
    );
  };

/** Призрак «будущего я»: бирюзовый, полупрозрачный, с ореолом. power 0..1 — насколько он «жив». */
export const Ghost: React.FC<{ p: V3; rotY?: number; pose?: Pose; power: number }> = ({ p, rotY = 0, pose = POSE.stand, power }) => (
  <group>
    <Stickman p={p} rotY={rotY} pose={pose} scale={1.06} look={{ color: COL.ghost, glow: 0.4 + 2.2 * power, opacity: 0.08 + 0.5 * power }} />
    <pointLight position={[p[0], 1.2, p[2]]} color={COL.ghost} intensity={3 * power} distance={3} decay={1.5} />
  </group>
);

// ------------------------------------------------------------ окружение
/** Глянцевый тёмный пол с настоящими (размытыми) отражениями. */
export const GlossFloor: React.FC<{ size?: number; color?: string; mirror?: number }> = ({ size = 60, color = COL.floor, mirror = 0.75 }) => FAST ? (
  <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow><planeGeometry args={[size, size]} /><meshStandardMaterial color={color} roughness={0.25} metalness={0.6} /></mesh>
) : (
  <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
    <planeGeometry args={[size, size]} />
    <MeshReflectorMaterial resolution={1024} blur={[300, 80]} mixBlur={0.9} mixStrength={2.2} mirror={mirror}
      roughness={0.85} depthScale={0.6} minDepthThreshold={0.4} maxDepthThreshold={1.3} color={color} metalness={0.5} />
  </mesh>
);
/** Конус света сверху (как фонарь/лампа в референсах) + видимый «луч». */
export const SpotPool: React.FC<{ p: V3; color?: string; intensity?: number; beam?: number }> = ({ p, color = COL.warm, intensity = 40, beam = 0.025 }) => {
  const target = React.useMemo(() => { const o = new THREE.Object3D(); o.position.set(p[0], 0, p[2]); return o; }, [p[0], p[2]]);
  return (<>
    <primitive object={target} />
    <spotLight position={[p[0], p[1], p[2]]} target={target} angle={0.33} penumbra={0.85} intensity={intensity} decay={1.4} color={color} castShadow
      shadow-mapSize-width={1024} shadow-mapSize-height={1024} shadow-bias={-0.0004} />
    {beam > 0 ? <mesh position={[p[0], p[1] / 2, p[2]]}>
      <coneGeometry args={[Math.tan(0.33) * p[1], p[1], 48, 1, true]} />
      <meshBasicMaterial color={color} transparent opacity={beam} depthWrite={false} side={THREE.DoubleSide} blending={THREE.AdditiveBlending} />
    </mesh> : null}
    <mesh position={[p[0], p[1] + 0.02, p[2]]}><cylinderGeometry args={[0.12, 0.18, 0.06, 24]} /><meshBasicMaterial color={color} toneMapped={false} /></mesh>
  </>);
};
export const Block: React.FC<{ p: V3; s: V3; c?: string; e?: string; ei?: number; rotY?: number }> = ({ p, s, c = "#16181d", e, ei = 0, rotY = 0 }) => (
  <mesh position={p} rotation={[0, rotY, 0]} castShadow receiveShadow>
    <boxGeometry args={s} /><meshStandardMaterial color={c} roughness={0.6} emissive={e ?? "#000"} emissiveIntensity={ei} />
  </mesh>
);
/** Светящаяся плоскость (экран телефона, будильник, дверь-свет). */
export const Glow: React.FC<{ p: V3; w: number; h: number; c: string; k?: number; rot?: V3 }> = ({ p, w, h, c, k = 2, rot = [0, 0, 0] }) => (
  <mesh position={p} rotation={rot}><planeGeometry args={[w, h]} />
    <meshBasicMaterial color={new THREE.Color(c).multiplyScalar(k)} toneMapped={false} /></mesh>
);
const texCache = new Map<string, THREE.Texture>();
/** Цифровое табло (будильник «5:47»). */
export const Digits: React.FC<{ p: V3; text: string; c?: string; h?: number; rot?: V3 }> = ({ p, text, c = COL.bad, h = 0.1, rot = [0, 0, 0] }) => {
  const key = text + c;
  let tex = texCache.get(key);
  if (!tex) {
    const cv = document.createElement("canvas"); cv.width = 512; cv.height = 192;
    const g = cv.getContext("2d")!; g.fillStyle = "#000"; g.fillRect(0, 0, 512, 192);
    g.fillStyle = c; g.font = "700 150px 'Courier New', monospace"; g.textAlign = "center"; g.textBaseline = "middle"; g.fillText(text, 256, 100);
    tex = new THREE.CanvasTexture(cv); tex.colorSpace = THREE.SRGBColorSpace; texCache.set(key, tex);
  }
  return <mesh position={p} rotation={rot}><planeGeometry args={[h * 2.67, h]} /><meshBasicMaterial map={tex} toneMapped={false} /></mesh>;
};

// ------------------------------------------------------------ камера и сцена
export type CamKey = [number, V3, V3, number?]; // [сек, позиция, цель, fov]
const camAt = (t: number, k: CamKey[]): [V3, V3, number] => {
  const f = (c: CamKey): [V3, V3, number] => [c[1], c[2], c[3] ?? 40];
  if (t <= k[0][0]) return f(k[0]);
  for (let i = 1; i < k.length; i++) if (t <= k[i][0]) {
    const a = f(k[i - 1]), b = f(k[i]), q = ease((t - k[i - 1][0]) / (k[i][0] - k[i - 1][0]));
    const l3 = (x: V3, y: V3): V3 => [lerp(x[0], y[0], q), lerp(x[1], y[1], q), lerp(x[2], y[2], q)];
    return [l3(a[0], b[0]), l3(a[1], b[1]), lerp(a[2], b[2], q)];
  }
  return f(k[k.length - 1]);
};
const CamRig: React.FC<{ pos: V3; look: V3; fov: number }> = ({ pos, look, fov }) => {
  const { camera } = useThree();
  const c = camera as THREE.PerspectiveCamera;
  c.position.set(...pos); c.lookAt(...look); c.fov = fov; c.near = 0.05; c.far = 60; c.updateProjectionMatrix();
  return null;
};

/** Шот: тёмный зал + туман + пол-зеркало + камера + пост-обработка (свечение, размытие фона, виньетка). */
export const Scene3D: React.FC<{ t0: number; cam: CamKey[]; focus?: V3; dof?: boolean; fog?: [number, number]; children: React.ReactNode }> =
  ({ t0, cam, focus = [0, 1, 0], dof = true, fog = [6, 22], children }) => {
    const frame = useCurrentFrame();
    const { width, height } = useVideoConfig();
    const [p, l, fov] = camAt(t0 + frame / FPS, cam);
    const hand: V3 = [p[0] + Math.sin(frame / 29) * 0.01, p[1] + Math.sin(frame / 19) * 0.007, p[2]]; // «живая» камера
    return (
      <ShotCtx.Provider value={{ t0 }}>
        <ThreeCanvas width={width} height={height} shadows={!FAST} gl={{ toneMapping: THREE.ACESFilmicToneMapping, toneMappingExposure: 1.1, antialias: false }}
          style={{ backgroundColor: COL.bg }}>
          <ShotCtx.Provider value={{ t0 }}>
            <color attach="background" args={[COL.bg]} />
            <fog attach="fog" args={[COL.bg, fog[0], fog[1]]} />
            <CamRig pos={hand} look={l} fov={fov} />
            <ambientLight intensity={0.08} />
            <hemisphereLight args={["#9fb4ff", "#000000", 0.12]} />
            <GlossFloor />
            {children}
            <EffectComposer multisampling={4}>
              {dof && !FAST ? <DepthOfField target={focus} focalLength={0.02} bokehScale={4} height={960} /> : <></>}
              <Bloom luminanceThreshold={0.85} intensity={0.9} mipmapBlur radius={0.7} />
              <Vignette eskil={false} offset={0.2} darkness={0.75} />
            </EffectComposer>
          </ShotCtx.Provider>
        </ThreeCanvas>
      </ShotCtx.Provider>
    );
  };
