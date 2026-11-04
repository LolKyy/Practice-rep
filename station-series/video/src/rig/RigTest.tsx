import React from "react";
import { AbsoluteFill } from "remotion";
import { Person, LOOKS } from "./Person";

export const RigTest: React.FC = () => (
  <AbsoluteFill style={{ background: "#0C1424" }}>
    <svg width={1080} height={1920}>
      <Person uid="g" x={270} ground={900} scale={0.62} look={LOOKS.gleb} emotion="tense" pose={{ armL: [8, 4], armR: [40, 120], legL: [-4, 0], legR: [6, 2] }} />
      <Person uid="e" x={800} ground={900} scale={0.62} look={LOOKS.eva} emotion="determined" facing={-1} light={{ x: -1, y: -0.5 }} pose={{ armL: [-150, -110], armR: [-20, -60], legL: [-10, -2], legR: [8, 4], lean: -6 }} />
      <Person uid="s" x={270} ground={1750} scale={0.62} look={LOOKS.stylyy} emotion="neutral" pose={{ armL: [-60, -90], armR: [70, 95], legL: [-20, 10], legR: [25, -5], lean: 10, head: 14 }} />
      <Person uid="f" x={800} ground={1750} scale={0.62} look={LOOKS.guardFrozen} emotion="closed" pose={{ armL: [10, 30], armR: [-10, -40], legL: [-3, 0], legR: [3, 0] }} />
    </svg>
  </AbsoluteFill>
);
