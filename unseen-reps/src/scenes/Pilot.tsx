// ТЕСТ СТИЛЯ «The Invisible Score: 5:47 AM» (~13 с): две кровати, два будильника, один выбор.
// Слева встаёт (его будущее «я» разгорается), справа — снуз и телефон (его будущее «я» гаснет).
import React from "react";
import { AbsoluteFill, Audio, Sequence, interpolate, staticFile, useVideoConfig } from "remotion";
import { Block, COL, Digits, FPS, Ghost, Glow, POSE, Scene3D, SpotPool, Stickman, clamp01, keys, mixPose, useSec, walkPose } from "../kit3d";
import { EditOutro, Grain, Hook, RubricTag, ScorePop } from "../overlay";

const BED_Y = 0.42;
const Bed: React.FC<{ x: number }> = ({ x }) => (<>
  <Block p={[x, 0.2, -0.4]} s={[0.95, 0.4, 2.0]} c="#1a1c22" />
  <Block p={[x, 0.44, -0.4]} s={[0.9, 0.08, 1.95]} c="#2a2d36" />
  <Block p={[x, 0.52, -1.2]} s={[0.6, 0.1, 0.32]} c="#3a3e4a" />
  <Block p={[x, 0.55, -1.42]} s={[0.98, 0.6, 0.08]} c="#14161b" />
</>);
const Nightstand: React.FC<{ x: number; on: boolean }> = ({ x, on }) => (<>
  <Block p={[x, 0.27, -1.1]} s={[0.4, 0.54, 0.4]} c="#17191e" />
  <Block p={[x, 0.6, -1.1]} s={[0.26, 0.12, 0.1]} c="#0c0d10" />
  <Digits p={[x, 0.6, -1.045]} text="5:47" h={0.08} c={on ? COL.bad : "#401015"} />
  {on ? <pointLight position={[x, 0.65, -0.95]} color={COL.bad} intensity={0.8} distance={1.5} /> : null}
</>);

const World: React.FC = () => {
  const t = useSec();
  // --- A (слева): лежит → садится (2.4–3.2) → встаёт у кровати (3.6–4.4) → идёт к свету (5.6–9)
  const aSit = clamp01((t - 2.4) / 0.8), aUp = clamp01((t - 3.6) / 0.8);
  const aWalk = clamp01((t - 5.6) / 3.4);
  const ax = keys(t, [[3.6, -1.1], [4.4, -1.85], [5.6, -1.85], [9, -1.6]]);
  const az = keys(t, [[5.6, -0.25], [9, -4.6]]);
  const aPose = aWalk > 0 && t < 9.2 ? walkPose((t - 5.6) * 3.2, 1) : mixPose(mixPose(POSE.lie, POSE.sit, aSit), POSE.stand, aUp);
  const aRot = t < 3.6 ? 0 : t < 5.6 ? keys(t, [[3.6, 0], [4.4, -0.5]]) : Math.PI - 0.05;
  const aLie = 1 - aSit;
  const aHip = aUp > 0 ? keys(t, [[3.6, BED_Y + 0.14], [4.4, 0.88]]) : BED_Y + 0.14;
  // --- B (справа): лежит, снуз (3.0), телефон светит с 4.2
  const phone = clamp01((t - 4.2) / 0.4);
  // --- призраки: A разгорается на каждом «плюсе», B тускнеет
  const gA = keys(t, [[0, 0.25], [3.3, 0.25], [3.7, 0.65], [7.0, 0.65], [7.4, 1]]);
  const gB = keys(t, [[0, 0.25], [3.6, 0.25], [4.0, 0.12], [7.2, 0.12], [7.6, 0.03]]);
  return (<>
    <SpotPool p={[-1.1, 3.4, -0.4]} intensity={keys(t, [[0, 14], [3.3, 14], [3.8, 34]])} color={COL.warm} beam={0.03} />
    <SpotPool p={[1.1, 3.4, -0.4]} intensity={keys(t, [[0, 14], [3.6, 14], [4.2, 6]])} color="#b9c7ff" beam={0.02} />
    {/* «дверь света» в глубине, куда уходит A */}
    <Glow p={[-1.6, 1.1, -6.2]} w={1.0} h={2.2} c="#ffffff" k={keys(t, [[0, 0.25], [5.5, 0.25], [8, 1.6]])} />
    <pointLight position={[-1.6, 1.2, -5.8]} color="#ffffff" intensity={keys(t, [[0, 0.5], [5.5, 0.5], [8, 6]])} distance={6} />
    <Bed x={-1.1} /><Bed x={1.1} />
    <Nightstand x={-1.85} on={t < 3.3} /><Nightstand x={1.85} on={t < 3.0 || (t > 6.2 && Math.floor(t * 4) % 2 === 0)} />
    <Stickman p={[ax, 0, aLie > 0.01 ? -0.25 : az]} rotY={aRot} pose={aPose} lie={aLie} hipY={aHip} />
    <Stickman p={[1.1, 0, -0.25]} pose={POSE.lie} lie={1} hipY={BED_Y + 0.14} />
    {phone > 0 ? <>
      <Glow p={[1.1, BED_Y + 0.5, -0.75]} w={0.09} h={0.16} c="#7fb6ff" k={1.8 * phone} rot={[Math.PI / 2.4, 0, 0]} />
      <pointLight position={[1.1, BED_Y + 0.4, -0.7]} color="#5d8dff" intensity={2.2 * phone} distance={1.6} />
    </> : null}
    <Ghost p={[-1.1, 0, -2.1]} power={gA} />
    <Ghost p={[1.1, 0, -2.1]} power={gB} />
  </>);
};

export const PILOT_TOTAL = Math.round(13 * FPS);
export const Pilot: React.FC = () => {
  const { durationInFrames } = useVideoConfig();
  return (
    <AbsoluteFill style={{ background: "#000" }}>
      <Sequence durationInFrames={Math.round(9.6 * FPS)}>
        <Scene3D t0={0} focus={[0, 0.7, -0.6]} cam={[
          [0, [0, 2.1, 8.2], [0, 1.05, -1.2], 38],
          [3.2, [0, 1.7, 6.6], [0, 0.95, -1.0], 38],
          [5.4, [0.6, 1.5, 5.8], [-0.5, 0.7, -1.6], 40],
          [9.6, [3.0, 2.4, 3.2], [-1.4, 0.8, -4.0], 42],
        ]}>
          <World />
        </Scene3D>
        <RubricTag text="THE INVISIBLE SCORE" />
        <Hook lines={["5:47 AM.", "Two alarms. One choice."]} to={2.3} />
        <ScorePop t={3.35} x={0.3} y={0.36} text="+1 SELF-TRUST" />
        <ScorePop t={3.05} x={0.72} y={0.33} text="SNOOZE ×1" good={false} dur={1.2} />
        <ScorePop t={4.3} x={0.72} y={0.36} text="−1 SELF-TRUST" good={false} />
        <ScorePop t={7.0} x={0.32} y={0.30} text="+1 IDENTITY: I SHOW UP" dur={2.4} />
        <ScorePop t={7.3} x={0.7} y={0.42} text="×365 = ?" good={false} dur={2.2} />
      </Sequence>
      <EditOutro from={9.6} lines={["Nobody saw it.", "That's why", "it counts."]} />
      <Grain amount={0.1} />
      <Audio src={staticFile("music.wav")} volume={(f) => interpolate(f, [0, 15, durationInFrames - 20, durationInFrames], [0, 0.8, 0.8, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" })} />
    </AbsoluteFill>
  );
};
