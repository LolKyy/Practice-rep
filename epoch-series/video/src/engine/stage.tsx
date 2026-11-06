// Сцена «Бумажный театр» v2: планы на реальной глубине (z в метрах от камеры), перспективный параллакс,
// малая ГРИП (размытие по |z − фокус|), мягкая тень между слоями, тёплый контровой, «бум» stop-motion,
// поп-ап раскрытие (слои встают из плоскости книжки с перелётом).
// Время внутри шота — секунды от начала Sequence. Марионетки и бумага анимируются «по двойкам» (15 к/с), камера — 30 к/с.
import React, { createContext, useContext, useLayoutEffect, useMemo, useRef } from "react";
import { AbsoluteFill, Easing, useCurrentFrame, useVideoConfig } from "remotion";
import { G, rng, clamp } from "./paper";

export const FPS = 30, W = 1080, H = 1920;
export { clamp };
export const eio = (x: number) => Easing.inOut(Easing.cubic)(clamp(x));
export const eo = (x: number) => Easing.out(Easing.cubic)(clamp(x));
export const back = (x: number, s = 1.7) => Easing.out(Easing.back(s))(clamp(x));
export const twos = (t: number) => Math.floor(t * FPS / 2) * 2 / FPS;
export const keys = (t: number, k: [number, number][], ease: (x: number) => number = eio) => {
  if (t <= k[0][0]) return k[0][1];
  for (let i = 1; i < k.length; i++) if (t <= k[i][0]) { const a = k[i - 1], b = k[i]; return a[1] + (b[1] - a[1]) * ease((t - a[0]) / Math.max(1e-6, b[0] - a[0])); }
  return k[k.length - 1][1];
};
export const step = <T,>(t: number, k: [number, T][]): T => { let v = k[0][1]; for (const [tt, x] of k) if (t >= tt) v = x; return v; };
// пружина с перелётом 5–8 % (для поворотов шарниров и появления предметов)
export const spring = (x: number) => { x = clamp(x); return 1 - Math.exp(-6 * x) * Math.cos(9 * x); };

// ---------------------------------------------------------------- камера
export type Cam = { x: number; y: number; z: number; shake?: number }; // z — «наезд»: 1 = базовый, 1.1 = ближе на 10 %
export type CamKey = [number, number, number, number]; // [t, x px, y px, zoom]
const StageCtx = createContext<{ cam: (t: number) => Cam; focus: number; pop: number; shake: (t: number) => number; t0: number }>({ cam: () => ({ x: 0, y: 0, z: 1 }), focus: 5, pop: -1, shake: () => 0, t0: 0 });
export const useT = () => { const f = useCurrentFrame(); return useContext(StageCtx).t0 + f / FPS; };

// ---------------------------------------------------------------- план
// z — глубина (м). FOCUS — дистанция до героя (по умолчанию 5 м). Масштаб плана = FOCUS / z (перспектива),
// параллакс камеры = сдвиг · FOCUS / z. Размытие = |1/z − 1/FOCUS| · k (как у объектива ~50 мм f/2).
export const Plane: React.FC<{
  z: number; draw: (g: G, t: number) => void; dyn?: boolean; deps?: any[]; x?: number; y?: number; w?: number; h?: number;
  shadow?: number; rim?: number; boil?: boolean; popOrder?: number; opacity?: number; blurK?: number; extraBlur?: number; style?: React.CSSProperties; noScale?: boolean;
}> = ({ z, draw, dyn = false, deps = [], x = 0, y = 0, w = Math.round(W * 1.5), h = Math.round(H * 1.4), shadow = 0.38, rim = 0, boil = true, popOrder = 0, opacity = 1, blurK = 14, extraBlur = 0, style, noScale = false }) => {
  const f = useCurrentFrame();
  const { cam, focus, pop, shake, t0 } = useContext(StageCtx);
  const t = t0 + f / FPS; const tt = twos(t);
  const ref = useRef<HTMLCanvasElement>(null);
  const off = useMemo(() => { const c = document.createElement("canvas"); c.width = w; c.height = h; return c; }, [w, h]);
  const blur = Math.min(9, Math.abs(1 / z - 1 / focus) * blurK * focus) + extraBlur;
  useLayoutEffect(() => {
    if (!ref.current) return;
    const o = off.getContext("2d")!; o.setTransform(1, 0, 0, 1, 0, 0); o.clearRect(0, 0, w, h); o.translate((w - W) / 2, (h - H) / 2); draw(o, tt);
    const g = ref.current!.getContext("2d")!; g.setTransform(1, 0, 0, 1, 0, 0); g.clearRect(0, 0, w, h);
    g.save();
    if (blur > 0.6) g.filter = `blur(${blur.toFixed(1)}px)`;
    if (shadow > 0) { g.shadowColor = `rgba(60,36,12,${shadow})`; g.shadowBlur = 22 + blur * 1.5; g.shadowOffsetX = 12; g.shadowOffsetY = 18; }
    g.drawImage(off, 0, 0); g.restore();
    if (rim > 0) { // контровой: светлая копия, сдвинутая к источнику, видна только по краю
      g.save(); g.globalCompositeOperation = "destination-over"; g.globalAlpha = rim; if (blur > 0.6) g.filter = `blur(${(blur + 3).toFixed(1)}px) brightness(4) sepia(1)`; else g.filter = "blur(3px) brightness(4) sepia(1)";
      g.drawImage(off, -5, -6); g.restore();
    }
  }, [dyn ? tt : 0, blur.toFixed(1), ...deps]);
  const c = cam(t); const k = noScale ? 1 : focus / z;
  const z2 = 1 + (c.z - 1) * Math.min(1.6, k);
  const sh = shake(t) * Math.min(1.4, k);
  const b = boil ? rng(Math.floor(t * 15) * 31 + Math.round(z * 10) + popOrder * 7) : null;  // «бум»: дрожание 1 px по двойкам
  const bx = b ? (b() - 0.5) * 1.6 : 0, by = b ? (b() - 0.5) * 1.6 : 0;
  // масштаб плана авторский (дальний лист физически больше — как в настоящей диораме), глубина даёт параллакс и наезд
  const px = W / 2 + (x - c.x * k) * z2 + Math.sin(t * 61.3) * sh + bx;
  const py = H / 2 + (y - c.y * k) * z2 + Math.cos(t * 47.9) * sh + by;
  const sc = z2;
  // поп-ап: слой встаёт из плоскости (rotateX от 90° к 0°) с перелётом, дальние — раньше
  let popT = "";
  if (pop >= 0) { const p = spring((t - pop - popOrder * 0.045) / 0.5); popT = ` perspective(1600px) rotateX(${(1 - p) * 80}deg)`; }
  return <canvas ref={ref} width={w} height={h} style={{ position: "absolute", left: 0, top: 0, width: w, height: h, opacity,
    transformOrigin: "50% 78%", transform: `translate(${px - w / 2}px, ${py - h / 2 + (popT ? h * 0 : 0)}px) scale(${sc})${popT}`, ...style }} />;
};

// ---------------------------------------------------------------- шот
export const Stage: React.FC<{ t0?: number; cam?: CamKey[]; focus?: number; pop?: number; shake?: (t: number) => number; bg?: string; light?: "day" | "gold" | "dusk" | "night" | "indoor";
  rays?: number; children: React.ReactNode }> = ({ t0 = 0, cam = [[0, 0, 0, 1]], focus = 5, pop = -1, shake = () => 0, bg = "#BFE0EE", light = "day", rays = 0, children }) => {
  const f = useCurrentFrame(); const t = t0 + f / FPS;
  const camF = useMemo(() => (tt: number): Cam => ({ x: keys(tt, cam.map((a) => [a[0], a[1]])) + Math.sin(tt * 0.9) * 3, y: keys(tt, cam.map((a) => [a[0], a[2]])) + Math.sin(tt * 1.3) * 2, z: keys(tt, cam.map((a) => [a[0], a[3]])) }), [cam]);
  const L = { day: ["rgba(255,236,190,0.32)", 0.22], gold: ["rgba(255,196,120,0.45)", 0.28], dusk: ["rgba(255,150,110,0.4)", 0.4], night: ["rgba(120,150,220,0.25)", 0.55], indoor: ["rgba(255,210,150,0.38)", 0.3] }[light] as [string, number];
  return (
    <StageCtx.Provider value={{ cam: camF, focus, pop, shake, t0 }}>
      <AbsoluteFill style={{ backgroundColor: bg, overflow: "hidden" }}>
        {children}
        {/* ключевой свет сверху-слева: тёплое пятно */}
        <AbsoluteFill style={{ background: `radial-gradient(ellipse 95% 60% at 22% 18%, ${L[0]} 0%, rgba(0,0,0,0) 65%)`, mixBlendMode: "screen", pointerEvents: "none" }} />
        {rays > 0 ? <Rays t={t} a={rays} /> : null}
        {/* лёгкая виньетка (светлая: первые секунды всегда яркие) */}
        <AbsoluteFill style={{ background: `radial-gradient(ellipse 90% 80% at 50% 45%, rgba(0,0,0,0) 60%, rgba(50,30,10,${L[1]}) 100%)`, pointerEvents: "none" }} />
      </AbsoluteFill>
    </StageCtx.Provider>
  );
};
// лучи света через кальку
const Rays: React.FC<{ t: number; a: number }> = ({ t, a }) => (
  <AbsoluteFill style={{ pointerEvents: "none", mixBlendMode: "screen", opacity: a }}>
    {[0, 1, 2, 3].map((i) => (
      <div key={i} style={{ position: "absolute", left: 80 + i * 170 + Math.sin(t * 0.4 + i) * 12, top: -200, width: 70 + i * 26, height: 2000,
        transform: "rotate(-24deg)", transformOrigin: "50% 0%", background: "linear-gradient(180deg, rgba(255,240,200,0.55), rgba(255,240,200,0) 75%)", filter: "blur(18px)" }} />
    ))}
  </AbsoluteFill>
);

// HTML-«бумажка» поверх сцены (инфографика), с белой кромкой и тенью
export const useVC = () => useVideoConfig();
