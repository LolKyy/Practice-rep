// SHOWCASE v2.1 (эталон): блокнот Сёмы → лист рвётся → Рим. Разные планы, гэги, финал — один вопрос.
import React from "react";
import { AbsoluteFill, Audio, Sequence, staticFile } from "remotion";
import "./fonts";
import T from "./showcase_timings.json";
import { FPS, keys, back, step } from "./engine/stage";
import { Room, Sema, EraBackground, Portal, Camera, Extra } from "./components/scenes";
import { FactCallout, Ruler, SurvivalNotebook, Subtitles, Tag, Word, NotebookPage, CoinGag, Marks, QuestionPage } from "./components/overlays";
import { notebookProp, gladiusProp } from "./components/scenery";
import { Emo } from "./engine/puppets";

const W: Word[] = T.words as Word[];
const S = T.shots;
export const SHOWCASE_DUR = Math.ceil((T.duration + 0.4) * FPS);
const f = (s: number) => Math.round(s * FPS);
const seq = (a: number, b: number) => ({ from: f(a), durationInFrames: Math.max(1, f(b) - f(a)) });
const e = (k: [number, Emo][]) => (t: number) => step<Emo>(t, k);

const T_PAGE = 0.95, T_TEAR = 2.75, T_FALL = 3.1;
export const Showcase: React.FC = () => (
  <AbsoluteFill style={{ background: "#FCF9F0" }}>
    <Audio src={staticFile("showcase/voice.wav")} />
    {/* 1. КРУПНО: Сёма что-то пишет в блокноте (сразу светло и движение) */}
    <Sequence {...seq(0, T_PAGE)}>
      <Room cam={Camera.push(0, 1, 0.06, 0, -40)}>
        <Sema outfit="casual" s={9.5} y={2620} x={560} pose={(t) => ({ emo: e([[0, "curious"], [0.5, "proud"]])(t), look: [0.4, 1.2], tilt: 0.1 + Math.sin(t * 9) * 0.03, aR: [0.9, 1.8 + Math.sin(t * 20) * 0.15], aL: [0.7, 1.5], holdL: notebookProp, talk: 0 })} />
      </Room>
    </Sequence>
    {/* 2. ВСТАВКА: страница блокнота → 3. ЛИСТ РВЁТСЯ → поп-ап Рима, Сёма падает */}
    <Sequence {...seq(T_PAGE, S[2].s)}>
      <Portal at={T_TEAR - T_PAGE} before={<NotebookPage doodle={1.25} lines={[{ s: "Рим,", at: 0.05 }, { s: "117 год", at: 0.45, size: 150, color: PAL_RED }]} />}
        after={<EraBackground place="camp" t0={-(T_TEAR - T_PAGE)} pop={0} cam={[[0, 0, 0, 1.0], [1.4, 0, -40, 1.06]]} shake={Camera.shake(T_FALL - T_TEAR + 0.4, 16)}>
          <Extra spec={{ seed: 7, hat: "galea", armor: true, tunic: "#C9B48C", skin: "#C99B72" }} x={190} y={1500} s={4.6} z={6.5} pose={(t) => ({ emo: t > 0.8 ? "shock" : "calm", look: [1, -0.5], aR: t > 0.8 ? [1.9, 0.3] : [0.1, 0.1] })} />
          <Sema outfit="legion" x={600} pose={(t) => ({ emo: t > 0.75 ? "shock" : "fear", aL: [2.6, 0.4], aR: [2.6, 0.4], tilt: t < 0.7 ? Math.sin(t * 20) * 0.3 : 0, squash: keys(t, [[0.7, 0], [0.76, 1.6], [1.0, 0]], back), talk: 0 })}
            dy={(t) => keys(t, [[0, -1700], [0.72, 0]], (u) => u * u)} />
        </EraBackground>} />
      <Sequence from={f(T_FALL - T_PAGE + 0.35)}><Marks kind="crack" label="ХРУСТЬ!" x={790} y={760} s={0.9} /></Sequence>
      <Sequence from={f(T_FALL - T_PAGE + 0.6)}><Tag big x={800} lines={["117 Г. Н.Э.", "РИМ"]} /></Sequence>
    </Sequence>
    {/* 4. ГЭГ: лорика давит — Сёму сплющило */}
    <Sequence {...seq(S[2].s, S[3].s)}>
      <EraBackground place="camp" t0={0} cam={[[0, 0, -260, 1.25], [1.5, 0, -280, 1.32]]} shake={Camera.shake(0.05, 10, 0.3)}>
        <Sema outfit="legion" s={7.6} y={2080} pose={(t) => ({ emo: "tired", squash: 1.3 + Math.sin(t * 6) * 0.15, lean: Math.sin(t * 5) * 0.04, aL: [0.3, 0.2], aR: [0.3, 0.2], talk: 0 })} dy={() => 20} />
      </EraBackground>
      <Marks kind="sweat" x={720} y={330} at={0.2} />
      <Sequence from={f(0.25)}><FactCallout text={"9 КГ\nЖЕЛЕЗА"} x={260} y={300} to={[440, 860]} /></Sequence>
    </Sequence>
    {/* 5. КРУПНО: гладиус — короткий, зато свой (гордость) */}
    <Sequence {...seq(S[3].s, S[4].s)}>
      <EraBackground place="city" t0={0} cam={Camera.push(0, 1.6, 0.05)} fg={false}>
        <Sema outfit="legion" s={8} y={2250} x={500} pose={(t) => ({ emo: t < 0.6 ? "curious" : "proud", aR: [2.5, 0.5], aL: [0.2, 0.2], holdR: gladiusProp, look: [1, -1], talk: 0 })} />
      </EraBackground>
      <Marks kind="sparkle" x={760} y={330} at={0.6} />
      <Sequence from={f(0.2)}><FactCallout text={"≈ 50 СМ"} x={830} y={760} to={[760, 470]} w={300} rot={0.06} /></Sequence>
    </Sequence>
    {/* 6. ЛИНЕЙКА: Сёма проходит, сосед — нет */}
    <Sequence {...seq(S[4].s, S[5].s)}>
      <EraBackground place="field" t0={0} cam={[[0, 0, 0, 1.0], [2, 0, 0, 1.03]]} fg={false}>
        <Extra spec={{ seed: 11, hat: "none", hair: "#2A1E16", tunic: "#B9A27A", skin: "#D9AE86", scale: 0.86 }} x={180} y={1560} s={5.4} z={5.1} pose={(t) => ({ emo: t > 1 ? "disgust" : "calm", look: [1, -1], tilt: 0.1 })} />
        <Sema outfit="legion" x={470} pose={(t) => ({ emo: t > 1 ? "proud" : "calm", aR: t > 1 ? [2.3, 0.2] : [0.1, 0.1], talk: 0 })} />
      </EraBackground>
      <Ruler x={760} top={335} bottom={1560} cmTop={200} marks={[{ cm: 170, label: "НОРМА 170", dy: 40 }, { cm: 178, label: "СЁМА 178", color: "#2E3A57", dy: -40 }]} />
      <Marks kind="bang" x={230} y={560} at={1.1} />
    </Sequence>
    {/* 7. ГЭГ: жалованье утекает */}
    <Sequence {...seq(S[5].s, S[6].s)}>
      <EraBackground place="city" tod="gold" t0={0} cam={Camera.push(0, 3.2, 0.06, 0, -100)}>
        <Sema outfit="legion" x={540} pose={(t) => ({ emo: step<Emo>(t, [[0, "smile"], [1.2, "shock"], [2.2, "tired"]]), aL: [0.9, 0.9], aR: [0.9, 0.9], look: [0, 1], talk: 0 })} />
      </EraBackground>
      <CoinGag hands={[540, 960]} at={0.2} minus={[{ label: "−ЕДА", at: 1.2 }, { label: "−ДОСПЕХ", at: 1.75 }, { label: "−ПАЛАТКА", at: 2.35 }]} />
    </Sequence>
    {/* 8. БЛОКНОТ ВЫЖИВАНИЯ */}
    <Sequence {...seq(S[6].s, S[7].s)}>
      <EraBackground place="camp" tod="gold" t0={0} cam={[[0, 0, 0, 1.08]]} fg={false}><Sema outfit="legion" pose={() => ({ emo: "fear", talk: 0 })} /></EraBackground>
      <SurvivalNotebook rewriteAt={0.2} rows={[{ label: "День", from: "1", to: "14" }, { label: "Еда", from: "4/5", to: "1/5" }, { label: "Шанс выжить", from: "80%", to: "37%" }]} />
    </Sequence>
    {/* 9. ФИНАЛ: один вопрос — без вариантов */}
    <Sequence {...seq(S[7].s, T.duration + 0.4)}>
      <EraBackground place="camp" tod="dusk" t0={0} cam={Camera.push(0, 2.5, 0.04)}>
        <Sema outfit="legion" x={330} s={4.4} y={1800} pose={(t) => ({ emo: "curious", look: [1, -1], tilt: 0.12, aR: [2.4, 0.3], holdL: notebookProp, aL: [0.6, 1.4], talk: 0 })} />
      </EraBackground>
      <QuestionPage q1="КУДА ОТПРАВИТЬ" q2="СЁМУ ДАЛЬШЕ" />
    </Sequence>
    <Subtitles words={W} keywords={["ЗРЯ", "ЛЕГИОНЕР", "ДЕВЯТЬ", "СВОЙ", "ПРОХОДИТ", "МИНУС", "ТРИДЦАТЬ", "ДАЛЬШЕ"]} />
  </AbsoluteFill>
);
const PAL_RED = "#C8352B";
