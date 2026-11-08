import React from "react";
import { Composition } from "remotion";
import { Pilot, PILOT_TOTAL } from "./scenes/Pilot";
import { Edit, EDIT_TOTAL } from "./Edit";
export const Root: React.FC = () => (<>
  <Composition id="Pilot" component={Pilot} durationInFrames={PILOT_TOTAL} fps={30} width={1080} height={1920} />
  <Composition id="Edit" component={Edit} durationInFrames={EDIT_TOTAL} fps={30} width={1080} height={1920} />
</>);
