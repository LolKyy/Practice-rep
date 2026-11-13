import React from "react";
import { Composition, Still } from "remotion";
import { Cover } from "./Cover";
import { HeroLineup } from "./HeroLineup";
import { Video } from "./Video";
import { TOTAL, FPS } from "./timeline.js";
export const Root: React.FC = () => <><Still id="Cover" component={Cover} width={1080} height={1920} /><Still id="Heroes" component={HeroLineup} width={1080} height={1920} /><Composition id="Gta6Day" component={Video} durationInFrames={Math.round(TOTAL * FPS)} fps={FPS} width={1080} height={1920} /></>;
