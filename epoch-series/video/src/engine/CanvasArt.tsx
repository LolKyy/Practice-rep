// Статичный/анимированный холст на весь кадр (для листов, карточек, инфографики).
import React, { useLayoutEffect, useRef } from "react";
import { useCurrentFrame } from "remotion";
import { G } from "./paper";
import { FPS, twos } from "./stage";
export const CanvasArt: React.FC<{ w?: number; h?: number; draw: (g: G, t: number) => void; dyn?: boolean; style?: React.CSSProperties; t0?: number }> = ({ w = 1080, h = 1920, draw, dyn = true, style, t0 = 0 }) => {
  const f = useCurrentFrame(); const t = twos(t0 + f / FPS); const ref = useRef<HTMLCanvasElement>(null);
  useLayoutEffect(() => { const g = ref.current!.getContext("2d")!; g.setTransform(1, 0, 0, 1, 0, 0); g.clearRect(0, 0, w, h); draw(g, t); }, [dyn ? t : 0]);
  return <canvas ref={ref} width={w} height={h} style={{ position: "absolute", left: 0, top: 0, width: w, height: h, ...style }} />;
};
