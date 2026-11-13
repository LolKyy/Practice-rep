import React from "react";
import { Composition } from "remotion";
import { timelines } from "./timelines";
import { Clip } from "./Clip";

// Одна композиция на эдит: Clip-<id>. withAudio=false → тот же ролик без трека.
export const Root: React.FC = () => (
  <>
    {timelines.map((t) => (
      <Composition key={t.comp} id={t.comp} component={Clip as any} durationInFrames={t.frames} fps={t.fps}
        width={t.width} height={t.height} defaultProps={{ tl: t, withAudio: true }} />
    ))}
  </>
);
