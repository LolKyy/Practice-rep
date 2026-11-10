import React from "react";
import { Composition } from "remotion";
import { Video } from "./Video";
import { TOTAL, FPS } from "./timeline.js";
export const Root: React.FC = () => <Composition id="Gta6Doodle" component={Video} durationInFrames={Math.round(TOTAL * FPS)} fps={FPS} width={1080} height={1920} />;
