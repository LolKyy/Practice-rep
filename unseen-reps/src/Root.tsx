import React from "react";
import { Composition } from "remotion";
import { Pilot, PILOT_TOTAL } from "./scenes/Pilot";
import { Edit, EDIT_TOTAL } from "./Edit";
import { MotivationVsDiscipline, MVD_TOTAL } from "./scenes/MotivationVsDiscipline";
import { WhatKeepsYouClimbing, WKYC_TOTAL } from "./scenes/WhatKeepsYouClimbing";
export const Root: React.FC = () => (<>
  <Composition id="Pilot" component={Pilot} durationInFrames={PILOT_TOTAL} fps={30} width={1080} height={1920} />
  <Composition id="MotivationVsDiscipline" component={MotivationVsDiscipline} durationInFrames={MVD_TOTAL} fps={60} width={1080} height={1920} />
  <Composition id="WhatKeepsYouClimbing" component={WhatKeepsYouClimbing} durationInFrames={WKYC_TOTAL} fps={60} width={1080} height={1920} />
  <Composition id="Edit" component={Edit} durationInFrames={EDIT_TOTAL} fps={30} width={1080} height={1920} />
</>);
