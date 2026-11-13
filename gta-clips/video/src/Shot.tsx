import React from "react";
import { AbsoluteFill, Freeze, OffthreadVideo, staticFile, useCurrentFrame } from "remotion";
import type { Shot as ShotT } from "./types";
import { rampMap, rampSpeed, zoomPunch, shake, rgbOffset, whip, flash } from "./fx";

// Кадр фрагмента. Позиция в исходнике считается по кадру шота (speed ramp), картинка берётся
// через <Freeze> → точный кадр. Если локальная скорость > 1.6× — motion blur: усреднение 2–4 соседних
// кадров исходника (настоящий смаз движения, как затвор камеры).
const Layer: React.FC<{ src: string; frame: number; opacity: number }> = ({ src, frame, opacity }) => (
  <Freeze frame={Math.max(0, Math.round(frame))}>
    <AbsoluteFill style={{ opacity }}>
      <OffthreadVideo src={staticFile(src)} muted style={{ width: "100%", height: "100%", objectFit: "cover" }} />
    </AbsoluteFill>
  </Freeze>
);

export const Shot: React.FC<{ s: ShotT }> = ({ s }) => {
  const f = useCurrentFrame();
  const u = f / s.frames;
  const pos = s.pad + rampMap(s.ramp, u) * s.span;                  // кадр внутри клипа
  const speed = rampSpeed(s.ramp, u, 0.5 / s.frames) * (s.span / s.frames);
  const n = s.fx.includes("blur") || speed > 1.6 ? Math.min(4, Math.max(2, Math.round(speed))) : 1;
  const step = n > 1 ? Math.max(1, speed) / n : 0;

  const has = (x: string) => s.fx.includes(x as any);
  let scale = 1 + (s.drift || 0) * (1 - Math.pow(1 - u, 2));
  let tx = 0, ty = 0, rot = 0, blurX = 0;
  if (has("zoom")) scale *= zoomPunch(f);
  if (has("shake")) {
    const k = shake(f, s.i);
    tx += k.x; ty += k.y; rot += k.r;
    scale *= 1.04;                                                   // чтобы края не открывались
  }
  if (has("whip")) {
    const w = whip(f);
    tx += (s.i % 2 ? -1 : 1) * w.x * 10.8; blurX = w.blur;
  }
  const d = has("rgb") ? rgbOffset(f) : 0;
  const filterId = `fx${s.i}`;
  const useFilter = d > 0.3 || blurX > 0.5;

  return (
    <AbsoluteFill style={{ backgroundColor: "#000", overflow: "hidden" }}>
      {useFilter && (
        <svg width="0" height="0" style={{ position: "absolute" }}>
          <defs>
            <filter id={filterId} x="-5%" y="-5%" width="110%" height="110%" colorInterpolationFilters="sRGB">
              <feGaussianBlur in="SourceGraphic" stdDeviation={`${blurX.toFixed(2)} 0`} result="src" />
              <feColorMatrix in="src" type="matrix" values="1 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 1 0" result="r" />
              <feOffset in="r" dx={-d} dy={d * 0.15} result="r2" />
              <feColorMatrix in="src" type="matrix" values="0 0 0 0 0  0 1 0 0 0  0 0 0 0 0  0 0 0 1 0" result="g" />
              <feColorMatrix in="src" type="matrix" values="0 0 0 0 0  0 0 0 0 0  0 0 1 0 0  0 0 0 1 0" result="b" />
              <feOffset in="b" dx={d} dy={-d * 0.15} result="b2" />
              <feBlend in="r2" in2="g" mode="screen" result="rg" />
              <feBlend in="rg" in2="b2" mode="screen" />
            </filter>
          </defs>
        </svg>
      )}
      <AbsoluteFill style={{
        transform: `translate(${tx}px, ${ty}px) rotate(${rot}deg) scale(${scale})`,
        filter: useFilter ? `url(#${filterId})` : undefined,
      }}>
        {Array.from({ length: n }, (_, k) => (
          <Layer key={k} src={s.clip} frame={pos + (k - (n - 1) / 2) * step} opacity={1 / (k + 1)} />
        ))}
      </AbsoluteFill>
      {has("flash") && flash(f) > 0 && <AbsoluteFill style={{ backgroundColor: "#fff", opacity: flash(f) }} />}
    </AbsoluteFill>
  );
};
