// SHOWCASE (эталон стиля v2): комната → портал → Древний Рим (FactCallout, Ruler, PriceTag, SurvivalNotebook) → ChoiceCard.
import React from "react";
import { AbsoluteFill, Audio, Sequence, staticFile } from "remotion";
import "./fonts";
import T from "./showcase_timings.json";
import { FPS, keys, back, step } from "./engine/stage";
import { Room, semaOnSofa, Sema, EraBackground, Portal, Camera, Extra } from "./components/scenes";
import { FactCallout, Ruler, PriceTag, SurvivalNotebook, ChoiceCard, Subtitles, Tag, Word } from "./components/overlays";
import { Emo, GESTURES } from "./engine/puppets";

const W: Word[] = T.words as Word[];
const S = T.shots;
export const SHOWCASE_DUR = Math.ceil((T.duration + 0.3) * FPS);
const f = (s: number) => Math.round(s * FPS);
const seq = (a: number, b: number) => ({ from: f(a), durationInFrames: Math.max(1, f(b) - f(a)) });
const shift = (t0: number) => W.map((w) => ({ ...w, s: w.s - t0, e: w.e - t0 }));

const T_PORTAL = 1.55, T_ROME = 1.9;   // разрыв листа
const legionPose = (t0: number) => (t: number) => {
  const tt = t + t0; // абсолютное время
  const emo: Emo = step<Emo>(tt, [[0, "shock"], [3.2, "curious"], [5.6, "proud"], [7.7, "curious"], [9.0, "relief"], [10.3, "tired"], [12.0, "disgust"], [13.3, "fear"], [14.8, "smile"]]);
  const gi = step(tt, [[0, 3], [3.2, 1], [5.6, 4], [7.7, 0], [9.0, 2], [10.3, 5], [12.0, 1], [13.3, 2]]);
  const g = GESTURES[gi];
  return { emo, aL: g[0], aR: g[1], look: [Math.sin(tt * 0.7) * 0.5, 0] as [number, number], tilt: Math.sin(tt * 1.1) * 0.04, squash: keys(tt, [[2.55, 0], [2.62, 1], [2.85, 0]], back) , talk: 0 };
};

export const Showcase: React.FC = () => (
  <AbsoluteFill style={{ background: "#F2DDB4" }}>
    <Audio src={staticFile("showcase/voice.wav")} />
    {/* 1. КОМНАТА: сразу светло, движение, голос */}
    <Sequence {...seq(0, T_PORTAL)}><Room cam={Camera.push(0, 2, 0.07, 30, -60)}><Sema outfit="casual" y={1680} pose={semaOnSofa(W, (t) => (t < 1.0 ? "calm" : "shock"))} /></Room></Sequence>
    {/* 2. ПОРТАЛ: вспышка → разрыв → поп-ап Рима; Сёма падает в костюме */}
    <Sequence {...seq(T_PORTAL, S[2].s)}>
      <Portal at={T_ROME - T_PORTAL} before={<Room t0={T_PORTAL} cam={[[0, 30, -60, 1.07], [3, 60, -90, 1.12]]}><Sema outfit="casual" y={1680} pose={semaOnSofa(W, () => "shock")} /></Room>}
        after={<EraBackground place="camp" t0={-(T_ROME - T_PORTAL)} pop={0} cam={Camera.push(0, 3, 0.04)} shake={Camera.shake(0.68, 12)}>
          <Extra spec={{ seed: 7, hat: "galea", armor: true, tunic: "#C9B48C", skin: "#C99B72" }} x={210} y={1480} s={4.4} z={6.5} pose={() => ({ emo: "curious", look: [1, 0] })} />
          <Sema outfit="legion" pose={legionPose(T_ROME)} dy={(t) => keys(t, [[0, -1500], [0.65, 0]], (u) => u * u)} />
        </EraBackground>} />
      <Sequence from={f(T_ROME - T_PORTAL + 0.6)}><Tag big x={700} lines={["117 Г. Н.Э.", "РИМСКИЙ ЛЕГИОН"]} /></Sequence>
    </Sequence>
    {/* 3. БЫТ: снаряжение со стикерами */}
    <Sequence {...seq(S[2].s, S[3].s)}>
      <EraBackground place="camp" t0={S[2].s} cam={[[S[2].s, 0, -80, 1.12], [S[3].s, 20, -60, 1.18]]}>
        <Sema outfit="legion" pose={legionPose(0)} />
      </EraBackground>
      <Sequence from={f(0.15)}><FactCallout text={"ЛОРИКА\n9 КГ"} x={250} y={330} to={[470, 900]} /></Sequence>
      <Sequence from={f(1.3)}><FactCallout text={"ГЛАДИУС\n≈ 50 СМ"} x={840} y={1550} to={[720, 1150]} rot={0.05} w={360} /></Sequence>
    </Sequence>
    {/* рост на линейке */}
    <Sequence {...seq(S[3].s, S[4].s)}>
      <EraBackground place="field" t0={S[3].s} cam={[[S[3].s, 0, 0, 1.0], [S[4].s, 0, 0, 1.03]]} fg={false}>
        <Sema outfit="legion" x={400} pose={legionPose(0)} />
      </EraBackground>
      <Ruler x={720} top={335} bottom={1560} cmTop={200} marks={[{ cm: 170, label: "НОРМА 170", dy: 40 }, { cm: 178, label: "СЁМА 178", color: "#2E3A57", dy: -40 }]} />
    </Sequence>
    {/* ценник */}
    <Sequence {...seq(S[4].s, S[5].s)}>
      <EraBackground place="city" tod="gold" t0={S[4].s} cam={Camera.pan(S[4].s, S[5].s, 60, 1.05)}>
        <Sema outfit="legion" x={380} pose={legionPose(0)} />
      </EraBackground>
      <Tag x={880} lines={["ДЕНЬ 1", "ШАНС 80%"]} />
      <Sequence from={f(0.1)}><PriceTag x={800} y={760} title="Жалованье" price="300 ден." note="в год. минус еда" /></Sequence>
    </Sequence>
    {/* 4. БЛОКНОТ ВЫЖИВАНИЯ */}
    <Sequence {...seq(S[5].s, S[6].s)}>
      <EraBackground place="city" tod="gold" t0={S[5].s} cam={[[0, 0, 0, 1.08]]} fg={false}><Sema outfit="legion" x={380} pose={legionPose(0)} /></EraBackground>
      <AbsoluteFill style={{ backdropFilter: "blur(6px)", background: "rgba(40,30,20,0.18)" }} />
      <SurvivalNotebook rewriteAt={0.2} rows={[{ label: "День", from: "1", to: "14" }, { label: "Еда", from: "4/5", to: "2/5" }, { label: "Шанс выжить", from: "80%", to: "37%" }]} />
    </Sequence>
    {/* 5. ФИНАЛ: куда дальше? (Сёма снова на диване — но в шлеме) */}
    <Sequence {...seq(S[6].s, T.duration + 0.3)}>
      <Room t0={S[6].s} cam={Camera.push(S[6].s, S[6].s + 3, 0.03)}><Sema outfit="casual" y={1680} pose={() => ({ emo: "smile", aR: [1.2, 0.9], aL: [0.12, 0.1], talk: 0 })} /></Room>
      <Sequence from={f(0.1)}><ChoiceCard options={[{ label: "Викинги", icon: "В", color: "#5E7FA8" }, { label: "Титаник", icon: "Т", color: "#2E3A57" }, { label: "1812 год", icon: "Н", color: "#B5893A" }]} /></Sequence>
    </Sequence>
    <Subtitles words={W} keywords={["ВСПЫШКА", "ЛЕГИОНЕР", "ДЕВЯТЬ", "ПОВЕЗЛО", "ТРИСТА", "ТРИДЦАТЬ", "КОММЕНТЫ"]} />
  </AbsoluteFill>
);
