import React from "react";
import { Composition, Still } from "remotion";
import { Cover } from "./Cover";
import { Video } from "./Video";
import { TOTAL, FPS, AD_F } from "./timeline.js";
export const Root: React.FC = () => <><Still id="Cover" component={Cover} width={1080} height={1920} /><Composition id="Gta6Hype" component={Video} durationInFrames={Math.round(TOTAL * FPS) + AD_F} fps={FPS} width={1080} height={1920} /></>;
