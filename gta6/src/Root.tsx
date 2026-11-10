import React from "react";
import { Composition } from "remotion";
import { Gta6Delay } from "./Gta6";
import { TOTAL, FPS, W, H } from "./story.js";
export const Root: React.FC = () => (
  <Composition id="Gta6Delay" component={Gta6Delay} durationInFrames={Math.round(TOTAL * FPS)} fps={FPS} width={W} height={H} />
);
