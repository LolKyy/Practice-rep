import { interpolate } from "remotion";
import type { Track } from "./theme";

/** Значение трека в момент t (секунды). */
export const sampleTrack = (track: Track, t: number): number => {
  if (typeof track === "number") return track;
  const { at, values } = track;
  if (at.length === 1) return values[0];
  return interpolate(t, at, values, {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
};

/** Детерминированный псевдошум [-1..1] — для тряски, волн, мерцания. */
export const wobble = (seed: number, t: number) =>
  Math.sin(t * 1.7 + seed * 12.9898) * 0.5 +
  Math.sin(t * 3.1 + seed * 78.233) * 0.3 +
  Math.sin(t * 7.3 + seed * 37.719) * 0.2;

export const clamp01 = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;
