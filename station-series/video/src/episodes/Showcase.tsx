import React from "react";
import { Audio } from "@remotion/media";
import { AbsoluteFill, CalculateMetadataFunction, Sequence, staticFile, useVideoConfig } from "remotion";
import { COLORS } from "../lib/theme";
import { Camera } from "../components/Camera";
import { CharacterPlaceholder } from "../components/CharacterPlaceholder";
import { Callout } from "../components/Callout";
import { EndCard } from "../components/EndCard";
import { EvidenceCard } from "../components/EvidenceCard";
import { HUD } from "../components/HUD";
import { RuleCard } from "../components/RuleCard";
import { SchemeMap } from "../components/SchemeMap";
import { Subtitles, TimedWord } from "../components/Subtitles";
import { Backdrop } from "../components/Backdrop";

export type ShowcaseProps = {
  words: TimedWord[];
  voice: string | null;
  beep: string | null;
};

// Тестовые слова на случай, если озвучки ещё нет (episodes/_showcase/timings.json).
const FALLBACK: TimedWord[] = [
  { word: "Это", start: 0.3, end: 0.5 },
  { word: "тест.", start: 0.5, end: 0.9 },
  { word: "Субтитры", start: 1.0, end: 1.5 },
  { word: "идут", start: 1.5, end: 1.75 },
  { word: "по", start: 1.75, end: 1.85 },
  { word: "словам.", start: 1.85, end: 2.4 },
  { word: "Проверка", start: 2.6, end: 3.1 },
  { word: "кириллицы:", start: 3.1, end: 3.7 },
  { word: "ЁЖ", start: 3.7, end: 3.95 },
  { word: "ЩИТ", start: 3.95, end: 4.2 },
];

const VOICE_OFFSET = 0.3; // озвучка стартует через 0.3 с

const exists = async (path: string) => {
  try {
    const r = await fetch(staticFile(path), { method: "HEAD" });
    return r.ok;
  } catch {
    return false;
  }
};

export const calculateShowcaseMetadata: CalculateMetadataFunction<ShowcaseProps> = async ({ props }) => {
  let words = props.words;
  try {
    const r = await fetch(staticFile("episodes/_showcase/timings.json"));
    if (r.ok) {
      const j = (await r.json()) as { words: TimedWord[] };
      words = j.words.map((w) => ({ ...w, start: w.start + VOICE_OFFSET, end: w.end + VOICE_OFFSET }));
    }
  } catch {
    /* нет таймингов — тестовые слова */
  }
  const voice = (await exists("episodes/_showcase/voice.mp3")) ? "episodes/_showcase/voice.mp3" : null;
  const beep = (await exists("sfx/sensor_beep.mp3")) ? "sfx/sensor_beep.mp3" : null;
  return { props: { ...props, words, voice, beep } };
};

export const SHOWCASE_DEFAULTS: ShowcaseProps = { words: FALLBACK, voice: null, beep: null };

export const Showcase: React.FC<ShowcaseProps> = ({ words, voice, beep }) => {
  const { fps } = useVideoConfig();

  return (
    <AbsoluteFill style={{ background: COLORS.bg }}>
      {/* МИР — всё, что под камерой */}
      <Camera from={{ x: 540, y: 960, zoom: 1 }} to={{ x: 560, y: 930, zoom: 1.08 }} start={0} end={1.8} shake shakeStart={3.2} shakeEnd={3.9}>
        <Backdrop />
        <Sequence name="Герой" durationInFrames={Math.round(1.8 * fps)} layout="none">
          <CharacterPlaceholder x={300} y={1250} height={600} />
        </Sequence>
      </Camera>

      {/* ГРАФИКА — поверх камеры, не трясётся */}
      <Sequence name="Выноска" durationInFrames={Math.round(1.8 * fps)} layout="none">
        <Callout targetX={345} targetY={705} title="ТЕСТ, 30 ЛЕТ" subtitle="ИНЖЕНЕР СТАНЦИИ" side="right" dx={180} dy={-70} delay={0.25} />
      </Sequence>
      <Sequence name="Правило" durationInFrames={Math.round(1.8 * fps)} layout="none">
        <RuleCard number={1} text="ТЕСТ. НЕ ОТВЕЧАЙ, ЕСЛИ ЗОВУТ ПО ИМЕНИ." top={330} delay={-0.2} />
      </Sequence>

      <Sequence name="Схема + рация" from={Math.round(1.8 * fps)} durationInFrames={Math.round(1.4 * fps)} layout="none">
        <SchemeMap
          title="СТАНЦИЯ · РАЗРЕЗ (ТЕСТ)"
          y={330}
          unitsHigh={46}
          compartments={[
            { id: "dock", label: "ШЛЮЗ", x: 0, y: 14, w: 18, h: 18 },
            { id: "hall", label: "КОРИДОР", x: 22, y: 16, w: 30, h: 14 },
            { id: "lab", label: "ЛАБ", x: 56, y: 2, w: 20, h: 20 },
            { id: "core", label: "РЕАКТОР", x: 56, y: 26, w: 20, h: 18 },
            { id: "bridge", label: "МОСТИК", x: 80, y: 12, w: 20, h: 22 },
          ]}
          doors={[
            ["dock", "hall"],
            ["hall", "lab"],
            ["hall", "core"],
            ["lab", "bridge"],
            ["core", "bridge"],
          ]}
          youAreHere="hall"
          threat="core"
          sealed={["dock"]}
        />
        <EvidenceCard kind="radio" title="РАЦИЯ · КАНАЛ 3" lines={["«…ТЕСТ. ПРИЁМ…»"]} y={920} height={250} delay={0.15} talkSeconds={1.1} />
      </Sequence>

      <Sequence name="Улики" from={Math.round(3.2 * fps)} durationInFrames={Math.round(1.1 * fps)} layout="none">
        <EvidenceCard kind="log" title="ЖУРНАЛ · 04:12" lines={["04:12 — ТЕСТ ЖУРНАЛА.", "04:13 — ВСЁ ШТАТНО?"]} y={330} height={250} />
        <EvidenceCard
          kind="monitor"
          title="МОНИТОР · СЕКТОР Б"
          lines={["> ТЕСТ МОНИТОРА", "! ДВИЖЕНИЕ: 1 ОБЪЕКТ"]}
          y={610}
          height={250}
          delay={0.1}
        />
        <EvidenceCard kind="sign" title="ТАБЛИЧКА · ОТСЕК 4" lines={["ТЕСТ", "ВХОД ЗАПРЕЩЁН"]} y={890} height={270} delay={0.2} />
      </Sequence>

      <HUD
        timer={{ label: "КИСЛОРОД · ОСТАЛОСЬ", startSeconds: 2 * 3600 + 59 * 60 + 59, direction: "down" }}
        gauge={{ label: "ЗАРЯД", percent: { at: [0, 5], values: [64, 41] }, danger: 30 }}
        distance={{ label: "ДО ЦЕЛИ", meters: { at: [0, 5], values: [24, 14] }, danger: 15 }}
      />

      <Sequence name="Субтитры" durationInFrames={Math.round(4.3 * fps)} layout="none">
        <Subtitles words={words} keywords={["связи", "тест", "кириллицы"]} centerY={1370} />
      </Sequence>

      <Sequence name="Финал" from={Math.round(4.3 * fps)} layout="none">
        <EndCard part={2} variant="choice" question="ТЕСТ: КУДА ИДТИ?" choiceA="В РЕАКТОР" choiceB="НА МОСТИК" />
      </Sequence>

      {voice ? (
        <Sequence from={Math.round(VOICE_OFFSET * fps)} layout="none">
          <Audio src={staticFile(voice)} />
        </Sequence>
      ) : null}
      {beep ? (
        <Sequence from={Math.round(1.8 * fps)} layout="none">
          <Audio src={staticFile(beep)} volume={0.5} />
        </Sequence>
      ) : null}
    </AbsoluteFill>
  );
};
