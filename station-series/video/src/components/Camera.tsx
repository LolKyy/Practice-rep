import React from "react";
import { AbsoluteFill, Easing, interpolate, useCurrentFrame, useVideoConfig } from "remotion";
import { wobble } from "../lib/track";

export type CameraKey = { x: number; y: number; zoom: number };

export type CameraProps = {
  children: React.ReactNode;
  /** Откуда: центр кадра в px сцены и зум. */
  from?: CameraKey;
  /** Куда. */
  to?: CameraKey;
  /** Начало и конец движения (сек, внутри секвенции). */
  start?: number;
  end?: number;
  /** Тряска — только по флагу. */
  shake?: boolean;
  shakeStart?: number;
  shakeEnd?: number;
  /** Амплитуда тряски в px. */
  shakeAmount?: number;
};

const CENTER: CameraKey = { x: 540, y: 960, zoom: 1 };

/** Обёртка-камера: плавный наезд/проезд по сцене 1080×1920, тряска по флагу. */
export const Camera: React.FC<CameraProps> = ({
  children,
  from = CENTER,
  to = from,
  start = 0,
  end = 5,
  shake = false,
  shakeStart = 0,
  shakeEnd = Infinity,
  shakeAmount = 14,
}) => {
  const frame = useCurrentFrame();
  const { fps, width, height } = useVideoConfig();
  const t = frame / fps;
  const p = interpolate(t, [start, end], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.inOut(Easing.cubic),
  });
  const zoom = from.zoom * Math.pow(to.zoom / from.zoom, p); // перцептивно ровный зум
  const cx = from.x + (to.x - from.x) * p;
  const cy = from.y + (to.y - from.y) * p;

  let sx = 0;
  let sy = 0;
  let sr = 0;
  if (shake && t >= shakeStart && t <= shakeEnd) {
    const fade = interpolate(t, [shakeStart, shakeStart + 0.08, shakeEnd - 0.15, shakeEnd], [0, 1, 1, 0], {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
    });
    sx = wobble(1, t * 9) * shakeAmount * fade;
    sy = wobble(2, t * 9) * shakeAmount * fade;
    sr = wobble(3, t * 7) * 0.6 * fade;
  }

  // сдвигаем сцену так, чтобы (cx, cy) оказался в центре кадра
  const tx = width / 2 - cx * zoom + sx;
  const ty = height / 2 - cy * zoom + sy;

  return (
    <AbsoluteFill style={{ overflow: "hidden" }}>
      <AbsoluteFill
        style={{
          transformOrigin: "0 0",
          transform: `translate(${tx}px, ${ty}px) scale(${zoom}) rotate(${sr}deg)`,
        }}
      >
        {children}
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
