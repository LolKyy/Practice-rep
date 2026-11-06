import React from "react";
import { Audio } from "@remotion/media";
import { AbsoluteFill, CalculateMetadataFunction, interpolate, Sequence, staticFile, useVideoConfig } from "remotion";
import { Subtitles, TimedWord } from "../../components/Subtitles";
import { HARON } from "../../components/HaronHUD";
import { SEndCard } from "../ep01/scenes";
import { SCENES2, SceneLine } from "./scenes";

// «ХАРОН», серия 2 «НЕ ОТКРЫВАЙ ЗАМЁРЗШУЮ». Тайминги — episodes/ep02/timeline.json, timings.json (tools/make_voice.py).

type Scene = { id: string; start: number; end: number };
type Line = { id: string; scene: string; role: string; start: number; end: number };
export type Ep02Props = { scenes: Scene[]; lines: Line[]; words: TimedWord[]; duration: number };
export const EP02_DEFAULTS: Ep02Props = { scenes: [], lines: [], words: [], duration: 10 };

export const calculateEp02Metadata: CalculateMetadataFunction<Ep02Props> = async () => {
  const tl = await (await fetch(staticFile("episodes/ep02/timeline.json"))).json();
  const tm = await (await fetch(staticFile("episodes/ep02/timings.json"))).json();
  return { durationInFrames: Math.ceil(tl.duration * 30), props: { scenes: tl.scenes, lines: tl.lines, words: tm.words, duration: tl.duration } };
};

const KEYWORDS = ["замёрзло", "Никогда.", "госизмену.", "Харон-семь", "падает.", "свободу.", "живого.", "тишина.", "задерживайся.", "инструкции.", "свети!", "Рыжий.", "прячемся.", "стылые.", "полковник,", "лифту.", "брат!", "живой!", "правило", "задыхается!", "трогай.", "Брат…?"];

export const Ep02: React.FC<Ep02Props> = ({ scenes, lines, words, duration }) => {
  const { fps } = useVideoConfig();
  const f = (s: number) => Math.round(s * fps);
  const sc = (id: string) => scenes.find((s) => s.id === id) ?? { id, start: 0, end: 0 };
  const ln = (id: string) => lines.find((l) => l.id === id) ?? { id, scene: "", role: "", start: 0, end: 0 };
  const END_LEN = 2.8;
  const endAt = duration - END_LEN;

  const sfx: { at: number; file: string; vol: number }[] = [];
  const add = (at: number, file: string, vol = 0.8) => at >= 0 && sfx.push({ at, file, vol });
  add(0, "ice_crunch", 0.5);
  add(0.2, "knock_glass", 0.7);
  add(sc("recap").start, "whoosh", 0.5);
  add(sc("recap").start + 0.05, "glitch", 0.35);
  add(sc("hall").start, "whoosh", 0.45);
  add(ln("07").start - 0.9, "boom", 0.35);
  add(ln("12").end - 0.9, "scanner_ping", 0.6);
  add(ln("14").start, "glitch", 0.35);
  add(sc("brother").start + 0.1, "knock_glass", 0.85);
  add(sc("brother").start + 1.9, "knock_glass", 0.7);
  add(ln("16").start, "knock_glass", 0.6);
  add(ln("18").end - 0.1, "alarm_button", 0.6);
  add(sc("cliff").start, "glass_burst", 1.0);
  add(sc("cliff").start + 0.05, "cold_wind", 0.7);
  add(sc("cliff").start + 0.25, "scanner_detect", 0.8);
  add(sc("cliff").start + 2.2, "ice_crunch", 1.0);
  add(endAt, "whoosh", 0.45);

  const music = (frame: number) => {
    const s = frame / fps;
    const out = interpolate(s, [duration - 2.5, duration], [1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    const cliff = interpolate(s, [sc("brother").start + 0.5, sc("cliff").start, endAt, endAt + 0.6], [1, 0, 0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    return 0.16 * out * Math.max(0.35, cliff) * (s > sc("cliff").start && s < endAt ? 0 : 1);
  };

  return (
    <AbsoluteFill style={{ background: "#000" }}>
      {scenes.map((s) => {
        const Comp = SCENES2[s.id];
        if (!Comp) return null;
        const local: SceneLine[] = lines.filter((l) => l.scene === s.id).map((l) => ({ id: l.id, role: l.role, start: l.start - s.start, end: l.end - s.start }));
        return (
          <Sequence key={s.id} name={s.id} from={f(s.start)} durationInFrames={Math.max(1, Math.min(f(s.end), f(endAt)) - f(s.start))}>
            <Comp dur={s.end - s.start} lines={local} />
          </Sequence>
        );
      })}
      <Sequence name="Финал: подпишись" from={f(endAt)}>
        <SEndCard part={3} episode={2} />
      </Sequence>
      <Sequence name="Субтитры" durationInFrames={Math.max(1, f(endAt))} layout="none">
        <Subtitles words={words} keywords={KEYWORDS} accent={HARON.red} />
      </Sequence>

      <Audio src={staticFile("episodes/ep02/voice.mp3")} />
      <Audio src={staticFile("music/haron_bed.mp3")} volume={music} />
      <Sequence name="гул станции" from={f(sc("hall").start)} durationInFrames={Math.max(1, f(endAt) - f(sc("hall").start))} layout="none">
        <Audio src={staticFile("sfx/drone_station.mp3")} volume={0.32} loop />
      </Sequence>
      {sfx.map((s, i) => (
        <Sequence key={i} name={`sfx ${s.file}`} from={f(s.at)} layout="none">
          <Audio src={staticFile(`sfx/${s.file}.mp3`)} volume={s.vol} />
        </Sequence>
      ))}
    </AbsoluteFill>
  );
};
