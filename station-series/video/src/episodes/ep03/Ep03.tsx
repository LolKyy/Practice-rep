import React from "react";
import { Audio } from "@remotion/media";
import { AbsoluteFill, CalculateMetadataFunction, interpolate, Sequence, staticFile, useVideoConfig } from "remotion";
import { Subtitles, TimedWord } from "../../components/Subtitles";
import { HARON } from "../../components/HaronHUD";
import { SEndCard } from "../ep01/scenes";
import { SCENES3, SceneLine } from "./scenes";

// «ХАРОН», серия 3 «БРАТЬЯ». Новый формат: рассказчик ведёт, спокойные субтитры по 1–2 слова. Тайминги — episodes/ep03/timeline.json, timings.json (tools/make_voice.py).

type Scene = { id: string; start: number; end: number };
type Line = { id: string; scene: string; role: string; start: number; end: number };
export type Ep03Props = { scenes: Scene[]; lines: Line[]; words: TimedWord[]; duration: number };
export const EP03_DEFAULTS: Ep03Props = { scenes: [], lines: [], words: [], duration: 10 };

export const calculateEp03Metadata: CalculateMetadataFunction<Ep03Props> = async () => {
  const tl = await (await fetch(staticFile("episodes/ep03/timeline.json"))).json();
  const tm = await (await fetch(staticFile("episodes/ep03/timings.json"))).json();
  return { durationInFrames: Math.ceil(tl.duration * 30), props: { scenes: tl.scenes, lines: tl.lines, words: tm.words, duration: tl.duration } };
};

const KEYWORDS = ["голубой.", "стоял.", "выпили.", "статую", "бежишь.", "знает,", "Руку.", "знакомятся.", "живой.", "холодную", "Кречет.", "мы.", "бунт.", "файлами.", "Кочегары", "врут.", "одеяла.", "слушает.", "Идут.", "сканер.", "приборов.", "ледяная.", "говори."];

export const Ep03: React.FC<Ep03Props> = ({ scenes, lines, words, duration }) => {
  const { fps } = useVideoConfig();
  const f = (s: number) => Math.round(s * fps);
  const sc = (id: string) => scenes.find((s) => s.id === id) ?? { id, start: 0, end: 0 };
  const ln = (id: string) => lines.find((l) => l.id === id) ?? { id, scene: "", role: "", start: 0, end: 0 };
  const END_LEN = 2.8;
  const endAt = duration - END_LEN;

  const sfx: { at: number; file: string; vol: number }[] = [];
  const add = (at: number, file: string, vol = 0.8) => at >= 0 && sfx.push({ at, file, vol });
  add(0, "scanner_ping", 0.6);
  add(ln("01").start + 1.8, "ice_crunch", 0.6);
  add(sc("drain").start + 1.0, "cold_wind", 0.6);
  add(sc("drain").start + 2.4, "ice_crunch_long", 0.8);
  add(sc("drain").start + 4.6, "ice_crack", 0.5);
  add(sc("run").start, "whoosh", 0.5);
  add(sc("run").start + 2.0, "ice_crunch", 0.7);
  add(sc("run").start + 6.0, "ice_crunch", 0.8);
  add(sc("knife").start, "dock_clamp", 0.6);
  add(ln("05").start - 0.3, "boom", 0.5);
  add(sc("canteen").start, "whoosh", 0.4);
  add(sc("deal").start, "whoosh", 0.35);
  add(ln("15").start + 1.9, "scanner_detect", 0.8);
  add(sc("cliff").start + (ln("17").start - sc("cliff").start) + 2.4, "ice_crunch", 0.6);
  add(endAt, "whoosh", 0.45);

  const music = (frame: number) => {
    const s = frame / fps;
    const out = interpolate(s, [duration - 2.5, duration], [1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    const cliff = interpolate(s, [sc("cliff").start - 0.5, sc("cliff").start + 1.5, endAt, endAt + 0.6], [1, 0, 0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    return 0.16 * out * cliff;
  };

  return (
    <AbsoluteFill style={{ background: "#000" }}>
      {scenes.map((s) => {
        const Comp = SCENES3[s.id];
        if (!Comp) return null;
        const local: SceneLine[] = lines.filter((l) => l.scene === s.id).map((l) => ({ id: l.id, role: l.role, start: l.start - s.start, end: l.end - s.start }));
        return (
          <Sequence key={s.id} name={s.id} from={f(s.start)} durationInFrames={Math.max(1, Math.min(f(s.end), f(endAt)) - f(s.start))}>
            <Comp dur={s.end - s.start} lines={local} />
          </Sequence>
        );
      })}
      <Sequence name="Финал: подпишись" from={f(endAt)}>
        <SEndCard part={4} episode={3} />
      </Sequence>
      <Sequence name="Субтитры" durationInFrames={Math.max(1, f(endAt))} layout="none">
        <Subtitles words={words} keywords={KEYWORDS} accent={HARON.red} maxWords={2} maxChars={14} fontSize={70} />
      </Sequence>

      <Audio src={staticFile("episodes/ep03/voice.mp3")} />
      <Audio src={staticFile("music/haron_bed.mp3")} volume={music} />
      <Sequence name="гул станции" from={0} durationInFrames={Math.max(1, f(endAt))} layout="none">
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
