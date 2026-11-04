import React from "react";
import { Audio } from "@remotion/media";
import { AbsoluteFill, CalculateMetadataFunction, interpolate, Sequence, staticFile, useVideoConfig } from "remotion";
import { Subtitles, TimedWord } from "../../components/Subtitles";
import { HARON } from "../../components/HaronHUD";
import { SCENES, SceneLine } from "./scenes";

// «ХАРОН», серия 1 «ПОСЫЛКА». Сцены и тайминги берутся из episodes/ep01/timeline.json и timings.json
// (их пишет tools/make_voice.py), поэтому правка реплик автоматически перестраивает монтаж.

type Scene = { id: string; start: number; end: number };
type Line = { id: string; scene: string; role: string; start: number; end: number };
export type Ep01Props = { scenes: Scene[]; lines: Line[]; words: TimedWord[]; duration: number };

export const EP01_DEFAULTS: Ep01Props = { scenes: [], lines: [], words: [], duration: 10 };

export const calculateEp01Metadata: CalculateMetadataFunction<Ep01Props> = async () => {
  const tl = await (await fetch(staticFile("episodes/ep01/timeline.json"))).json();
  const tm = await (await fetch(staticFile("episodes/ep01/timings.json"))).json();
  return {
    durationInFrames: Math.ceil(tl.duration * 30),
    props: { scenes: tl.scenes, lines: tl.lines, words: tm.words, duration: tl.duration },
  };
};

const KEYWORDS = [
  "тушёнкой", "госизмену", "Хорунжий…", "Хорунжий", "Харон-семь", "ультиматум", "четырнадцать", "дочь", "помилование",
  "падает", "колонию", "спецназ?", "один", "жалко", "допущен", "выбор", "мертво", "прямо", "инее", "живой?", "сканер",
  "приятель", "заложницу", "живого", "голубое", "ты?",
];

export const Ep01: React.FC<Ep01Props> = ({ scenes, lines, words, duration }) => {
  const { fps } = useVideoConfig();
  const f = (s: number) => Math.round(s * fps);
  const sc = (id: string) => scenes.find((s) => s.id === id) ?? { id, start: 0, end: 0 };
  const ln = (id: string) => lines.find((l) => l.id === id) ?? { id, scene: "", role: "", start: 0, end: 0 };
  const q = sc("question");

  // звуковые события (секунды от начала серии)
  const sfx: { at: number; file: string; vol: number }[] = [];
  const add = (at: number, file: string, vol = 0.8) => at >= 0 && sfx.push({ at, file, vol });
  add(0, "boom", 0.9);
  add(0.3, "turret_scan", 0.18);
  add(3.0, "turret_scan", 0.13);
  add(ln("02").end - 1.4, "glitch", 0.6);
  add(sc("styx").start, "whoosh", 0.5);
  add(sc("styx").start + 1.0, "cryo_hiss", 0.7);
  add(ln("06").end - 1.0, "glitch", 0.6);
  add(sc("neograd").start, "glitch", 0.5);
  add(ln("09").start + 5.6, "boom", 0.8);
  add(sc("hold").start + 0.3, "lid_open", 0.6);
  add(sc("approach").start, "whoosh", 0.5);
  add(sc("approach").start + 0.6, "turret_scan", 0.2);
  add(sc("approach").start + 3.2, "turret_scan", 0.15);
  add(ln("15").end - 1.0, "scanner_ping", 0.6);
  add(sc("dock").start, "dock_clamp", 0.9);
  add(sc("dock").start + 0.5, "lid_open", 0.8);
  add(ln("21").end + 0.35, "crowbar_clang", 0.8);
  add(ln("21").end + 0.38, "ice_crack", 1.0);
  add(ln("23").start, "scanner_ping", 0.7);
  for (let k = 0; k < 4; k++) add(sc("empty").start + 0.4 + k * 1.1, "scanner_ping", 0.45);
  add(sc("cliff").start, "ice_crunch_long", 1.0);
  add(sc("cliff").start + 0.15, "scanner_detect", 0.8);
  add(sc("cliff").start + 1.3, "scanner_detect", 0.8);
  add(q.start, "whoosh", 0.5);

  const droneFrom = sc("dock").start;
  const droneTo = sc("cliff").end;
  const music = (frame: number) => {
    const s = frame / fps;
    const base = 0.16;
    const out = interpolate(s, [duration - 2.5, duration], [1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    // в клиффхэнгере музыка исчезает — тишина, только хруст
    const cliff = interpolate(s, [sc("cliff").start - 0.3, sc("cliff").start, q.start, q.start + 0.8], [1, 0, 0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    return base * out * cliff;
  };

  return (
    <AbsoluteFill style={{ background: "#000" }}>
      {scenes.map((s) => {
        const Comp = SCENES[s.id];
        if (!Comp) return null;
        const local: SceneLine[] = lines.filter((l) => l.scene === s.id).map((l) => ({ id: l.id, role: l.role, start: l.start - s.start, end: l.end - s.start }));
        return (
          <Sequence key={s.id} name={s.id} from={f(s.start)} durationInFrames={Math.max(1, f(s.end) - f(s.start))}>
            <Comp dur={s.end - s.start} lines={local} />
          </Sequence>
        );
      })}

      <Sequence name="Субтитры" durationInFrames={Math.max(1, f(q.start))} layout="none">
        <Subtitles words={words} keywords={KEYWORDS} accent={HARON.red} />
      </Sequence>

      {/* звук */}
      <Audio src={staticFile("episodes/ep01/voice.mp3")} />
      <Audio src={staticFile("music/haron_bed.mp3")} volume={music} />
      {droneTo > droneFrom ? (
        <Sequence name="гул станции" from={f(droneFrom)} durationInFrames={f(droneTo - droneFrom)} layout="none">
          <Audio src={staticFile("sfx/drone_station.mp3")} volume={0.35} loop />
        </Sequence>
      ) : null}
      {sfx.map((s, i) => (
        <Sequence key={i} name={`sfx ${s.file}`} from={f(s.at)} layout="none">
          <Audio src={staticFile(`sfx/${s.file}.mp3`)} volume={s.vol} />
        </Sequence>
      ))}
    </AbsoluteFill>
  );
};
