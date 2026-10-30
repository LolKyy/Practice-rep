// «Бумажный театр» в 2D (быстрый рендер без WebGL): слои-холсты с запечённой тенью между планами,
// параллакс камеры, заранее размытые передний/задний планы. Время — секунды ГОЛОСА.
import React, { createContext, useContext, useLayoutEffect, useMemo, useRef } from "react";
import { AbsoluteFill, Easing, useCurrentFrame } from "remotion";
import type { G } from "./cut";

export const FPS = 30, W = 1080, H = 1920;
const Ctx = createContext<{ t0: number; cam: (t: number) => Cam; shake: (t: number) => number }>({ t0: 0, cam: () => ({ x: 0, y: 0, z: 1 }), shake: () => 0 });
export const useSec = () => { const f = useCurrentFrame(); return useContext(Ctx).t0 + f / FPS; };
export const twos = (t: number) => Math.floor(t * FPS / 2) * 2 / FPS;

export const clamp = (x: number, a = 0, b = 1) => Math.max(a, Math.min(b, x));
export const eio = (x: number) => Easing.inOut(Easing.cubic)(clamp(x));
export const eo = (x: number) => Easing.out(Easing.cubic)(clamp(x));
export const back = (x: number) => Easing.out(Easing.back(1.7))(clamp(x));
export const keys = (t: number, k: [number, number][], ease: (x: number) => number = eio) => {
  if (t <= k[0][0]) return k[0][1];
  for (let i = 1; i < k.length; i++) if (t <= k[i][0]) { const a = k[i - 1], b = k[i]; return a[1] + (b[1] - a[1]) * ease((t - a[0]) / Math.max(1e-6, b[0] - a[0])); }
  return k[k.length - 1][1];
};
export const step = <T,>(t: number, k: [number, T][]): T => { let v = k[0][1]; for (const [tt, x] of k) if (t >= tt) v = x; return v; };

export type Cam = { x: number; y: number; z: number };
export type CamKey = [number, number, number, number];   // [t, x, y, zoom]
export const camKeys = (k: CamKey[]) => (t: number): Cam => ({ x: keys(t, k.map((a) => [a[0], a[1]])), y: keys(t, k.map((a) => [a[0], a[2]])), z: keys(t, k.map((a) => [a[0], a[3]])) });

// Слой. d — глубина параллакса (1 = план фокуса, <1 дальше, >1 ближе). x,y — центр слоя в кадре (px).
// draw(g, t) рисует в px холста; scale — множитель единиц рисования (cut.ts рассчитан на «см»).
export const Layer: React.FC<{
  w?: number; h?: number; x?: number; y?: number; d?: number; draw: (g: G, t: number) => void; dyn?: boolean; scale?: number;
  shadow?: number; blur?: number; opacity?: number; rot?: number; deps?: any[]; style?: React.CSSProperties; dx?: number; dy?: number; s?: number; frame?: boolean;
}> = ({ w = Math.round(W * 1.3), h = Math.round(H * 1.3), x = W / 2, y = H / 2, d = 1, draw, dyn = false, scale = 1, frame = true, shadow = 0.45, blur = 0, opacity = 1, rot = 0, deps = [], style, dx = 0, dy = 0, s = 1 }) => {
  const sec = useSec();
  const { cam, shake } = useContext(Ctx);
  const ref = useRef<HTMLCanvasElement>(null);
  const off = useMemo(() => { const c = document.createElement("canvas"); c.width = w; c.height = h; return c; }, [w, h]);
  const t = twos(sec);
  const key = dyn ? t : 0;
  useLayoutEffect(() => {
    const cv = ref.current!; const g = cv.getContext("2d")!;
    const o = off.getContext("2d")!; o.setTransform(1, 0, 0, 1, 0, 0); o.clearRect(0, 0, w, h); if (frame) o.translate((w - W) / 2, (h - H) / 2); o.scale(scale, scale); draw(o, t);
    g.setTransform(1, 0, 0, 1, 0, 0); g.clearRect(0, 0, w, h);
    g.save();
    if (shadow > 0) { g.shadowColor = `rgba(25,18,8,${shadow})`; g.shadowBlur = 18 + blur; g.shadowOffsetX = 10; g.shadowOffsetY = 16; }
    if (blur > 0) g.filter = `blur(${blur}px)`;
    g.drawImage(off, 0, 0); g.restore();
  }, [key, ...deps]);
  const c = cam(sec); const sh = shake(sec) * Math.min(1.4, d);
  const z = 1 + (c.z - 1) * d;
  const px = W / 2 + (x + dx - W / 2 - c.x * d) * z + Math.sin(sec * 61.3) * sh;
  const py = H / 2 + (y + dy - H / 2 - c.y * d) * z + Math.cos(sec * 47.9) * sh;
  return <canvas ref={ref} width={w} height={h} style={{ position: "absolute", left: 0, top: 0, width: w, height: h, opacity,
    transform: `translate(${px - w / 2}px, ${py - h / 2}px) scale(${z * s}) rotate(${rot}rad)`, transformOrigin: "50% 50%", ...style }} />;
};

// Шот: камера + вибрация + «свет гаснет» (затемнение) + тёплая подсветка-виньетка.
export const Shot: React.FC<{ t0: number; cam?: CamKey[]; shake?: (t: number) => number; dim?: (t: number) => number; bg?: string; children: React.ReactNode; warm?: number }> =
  ({ t0, cam = [[0, 0, 0, 1]], shake = () => 0, dim, bg = "#2b2418", children, warm = 0.18 }) => {
    const f = useCurrentFrame(); const t = t0 + f / FPS;
    const camF = useMemo(() => camKeys(cam), [cam]);
    const dm = dim ? dim(t) : 0;
    return (
      <Ctx.Provider value={{ t0, cam: (tt) => { const c = camF(tt); return { x: c.x + Math.sin(tt * 0.9) * 4, y: c.y + Math.sin(tt * 1.3) * 3, z: c.z }; }, shake }}>
        <AbsoluteFill style={{ backgroundColor: bg, overflow: "hidden" }}>
          {children}
          {/* прожектор сбоку-сверху: тёплое пятно + виньетка */}
          <AbsoluteFill style={{ background: `radial-gradient(ellipse 90% 70% at 30% 28%, rgba(255,214,150,${warm}) 0%, rgba(0,0,0,0) 60%)`, mixBlendMode: "soft-light" }} />
          <AbsoluteFill style={{ background: "radial-gradient(ellipse 85% 75% at 50% 45%, rgba(0,0,0,0) 55%, rgba(20,12,4,0.55) 100%)" }} />
          {dm > 0 ? <AbsoluteFill style={{ backgroundColor: `rgba(8,10,14,${dm})` }} /> : null}
        </AbsoluteFill>
      </Ctx.Provider>
    );
  };
