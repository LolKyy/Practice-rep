import React from "react";
import { AbsoluteFill, Composition, Still } from "remotion";
import { Sheet } from "./Sheet";
import { Showcase, SHOWCASE_DUR } from "./Showcase";
import { Frame1, Frame2, Frame3 } from "./StyleFrames";
import { Ep01, EP01_DUR } from "./episodes/Ep01";
import { Ep01Cover } from "./Cover";
import { P2Frame1, P2Frame2, P2Frame3 } from "./StyleFrames2";
// Каждая серия регистрируется дважды: <id> (финал 1080×1920) и <id>-draft (черновик 720×1280).
const Draft = (C: React.FC): React.FC => () => (
  <AbsoluteFill style={{ width: 1080, height: 1920, transform: "scale(0.6666667)", transformOrigin: "0 0" }}><C /></AbsoluteFill>
);
const EPISODES: { id: string; C: React.FC; dur: number }[] = [
  { id: "Showcase", C: Showcase, dur: SHOWCASE_DUR },
  { id: "Ep01", C: Ep01, dur: EP01_DUR },
];
export const Root: React.FC = () => (<>
  {EPISODES.map(({ id, C, dur }) => (
    <React.Fragment key={id}>
      <Composition id={id} component={C} durationInFrames={dur} fps={30} width={1080} height={1920} />
      <Composition id={`${id}-draft`} component={Draft(C)} durationInFrames={dur} fps={30} width={720} height={1280} />
    </React.Fragment>
  ))}
  <Composition id="Ep1Frame1" component={Frame1} durationInFrames={60} fps={30} width={1080} height={1920} />
  <Composition id="Ep1Frame2" component={Frame2} durationInFrames={60} fps={30} width={1080} height={1920} />
  <Composition id="Ep1Frame3" component={Frame3} durationInFrames={60} fps={30} width={1080} height={1920} />
  <Composition id="Ep2Frame1" component={P2Frame1} durationInFrames={60} fps={30} width={1080} height={1920} />
  <Composition id="Ep2Frame2" component={P2Frame2} durationInFrames={60} fps={30} width={1080} height={1920} />
  <Composition id="Ep2Frame3" component={P2Frame3} durationInFrames={60} fps={30} width={1080} height={1920} />
  <Still id="Ep01Cover" component={Ep01Cover} width={1080} height={1920} />
  <Still id="HeroSheet" component={Sheet} width={2400} height={1600} />
  
</>);
