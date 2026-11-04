import "./lib/fonts";
import React from "react";
import { AbsoluteFill, Composition, Folder } from "remotion";
import { VIDEO, COLORS } from "./lib/theme";
import { Showcase, SHOWCASE_DEFAULTS, calculateShowcaseMetadata } from "./episodes/Showcase";
import { EndCard } from "./components/EndCard";
import { EvidenceCard } from "./components/EvidenceCard";
import { StyleA, StyleB, StyleC } from "./styles/StyleSamples";
import { StyleD, StyleE, StyleF } from "./styles/DarkStyles";
import { HaronInk, HaronCine, HaronSil } from "./styles/HaronStyles";

// Превью отдельных компонентов (для Studio), не для публикации.
const EndCardNextPreview: React.FC = () => (
  <AbsoluteFill style={{ background: COLORS.bg }}>
    <EndCard part={2} variant="next" />
  </AbsoluteFill>
);

const EvidencePreview: React.FC = () => (
  <AbsoluteFill style={{ background: COLORS.bg }}>
    <EvidenceCard kind="radio" title="РАЦИЯ · КАНАЛ 3" lines={["«…ТЕСТ…»"]} y={200} height={320} talkSeconds={3} />
    <EvidenceCard kind="log" title="ЖУРНАЛ · 04:12" lines={["ТЕСТ 1", "ТЕСТ 2"]} y={560} height={320} />
    <EvidenceCard kind="monitor" title="МОНИТОР · СЕКТОР Б" lines={["> ТЕСТ", "! ТРЕВОГА"]} y={920} height={320} />
    <EvidenceCard kind="sign" title="ТАБЛИЧКА · ОТСЕК 4" lines={["ТЕСТ", "ОТСЕК 4"]} y={1280} height={300} />
  </AbsoluteFill>
);

export const RemotionRoot: React.FC = () => {
  return (
    <>
      <Composition
        id="Showcase"
        component={Showcase}
        durationInFrames={5 * VIDEO.fps}
        fps={VIDEO.fps}
        width={VIDEO.width}
        height={VIDEO.height}
        defaultProps={SHOWCASE_DEFAULTS}
        calculateMetadata={calculateShowcaseMetadata}
      />
      <Folder name="Previews">
        <Composition id="Preview-EndCardNext" component={EndCardNextPreview} durationInFrames={60} fps={VIDEO.fps} width={VIDEO.width} height={VIDEO.height} />
        <Composition id="Preview-Evidence" component={EvidencePreview} durationInFrames={90} fps={VIDEO.fps} width={VIDEO.width} height={VIDEO.height} />
      </Folder>
      <Folder name="Styles">
        <Composition id="Style-A-Soft" component={StyleA} durationInFrames={90} fps={VIDEO.fps} width={VIDEO.width} height={VIDEO.height} />
        <Composition id="Style-B-Noir" component={StyleB} durationInFrames={90} fps={VIDEO.fps} width={VIDEO.width} height={VIDEO.height} />
        <Composition id="Style-C-Retro" component={StyleC} durationInFrames={90} fps={VIDEO.fps} width={VIDEO.width} height={VIDEO.height} />
        <Composition id="Style-D-Industrial" component={StyleD} durationInFrames={90} fps={VIDEO.fps} width={VIDEO.width} height={VIDEO.height} />
        <Composition id="Style-E-Cryo" component={StyleE} durationInFrames={90} fps={VIDEO.fps} width={VIDEO.width} height={VIDEO.height} />
        <Composition id="Haron-1-Ink" component={HaronInk} durationInFrames={90} fps={VIDEO.fps} width={VIDEO.width} height={VIDEO.height} />
        <Composition id="Haron-2-Cine" component={HaronCine} durationInFrames={90} fps={VIDEO.fps} width={VIDEO.width} height={VIDEO.height} />
        <Composition id="Haron-3-Silhouette" component={HaronSil} durationInFrames={90} fps={VIDEO.fps} width={VIDEO.width} height={VIDEO.height} />
        <Composition id="Style-F-Prison" component={StyleF} durationInFrames={90} fps={VIDEO.fps} width={VIDEO.width} height={VIDEO.height} />
      </Folder>
    </>
  );
};
