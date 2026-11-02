import React from "react";
import { Composition } from "remotion";
import { Video, TOTAL } from "./Video";
import { Cover } from "./Cover";
import { Endcard } from "./Endcard";
export const Root: React.FC = () => (<>
  <Composition id="Video" component={Video} durationInFrames={TOTAL} fps={30} width={1080} height={1920} />
  <Composition id="Cover" component={Cover} durationInFrames={1} fps={30} width={1080} height={1920} />
  <Composition id="Endcard" component={Endcard as any} defaultProps={{ part: 6 }} durationInFrames={162} fps={30} width={1080} height={1920} />
</>);
