// ТЕСТ СТИЛЯ «The Invisible Score: 5:47 AM» (~13 с): две кровати, два будильника, один выбор.
// Слева встаёт (его будущее «я» разгорается), справа — снуз и телефон (его будущее «я» гаснет).
import React from "react";
import { AbsoluteFill, Audio, Sequence, interpolate, staticFile, useCurrentFrame, useVideoConfig } from "remotion";
import { Block, COL, Digits, FPS, Ghost, Glow, POSE, Scene3D, SpotPool, Stickman, clamp01, keys, mixPose, useSec, walkPose } from "../kit3d";
import { EditOutro, Grain, Hook, MONO, PUNCH, RubricTag, SERIF, ScorePop } from "../overlay";

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


// ===================================================================== ритм
export const BPM = 100;
const B = 60 / BPM;                 // 0.6 с на удар
const b = (n: number) => +(n * B).toFixed(3);
const EDIT_AT = b(16);              // 9.6 с — начало эдита

// ===================================================================== вставки на битах (как в референсе)
/** Вспышка-вставка длиной dur, ровно на ударе: матовая плашка + нарисованный круг и пин. */
const DoodleInsert: React.FC<{ t: number; dur?: number }> = ({ t, dur = 0.3 }) => {
  const s = useCurrentFrame() / FPS;
  if (s < t || s > t + dur) return null;
  const k = (s - t) / dur;
  const draw = Math.min(1, k * 3);
  return (
    <AbsoluteFill style={{ background: "rgba(214,214,210,0.72)" }}>
      <svg width="1080" height="1920" viewBox="0 0 1080 1920">
        <ellipse cx="780" cy="1080" rx="260" ry="190" fill="none" stroke="#1b1b1b" strokeWidth="9" strokeLinecap="round"
          strokeDasharray="1500" strokeDashoffset={1500 * (1 - draw)} transform="rotate(-6 780 1080)" />
        <text x="600" y="860" fontFamily={MONO} fontWeight={800} fontSize="54" fill="#1b1b1b" transform="rotate(-6 600 860)">SNOOZE ZONE</text>
        <path d="M250 520 c0 -55 90 -55 90 0 c0 45 -45 80 -45 120 c0 -40 -45 -75 -45 -120z" fill={COL.bad} stroke="#1b1b1b" strokeWidth="5" />
        <circle cx="295" cy="525" r="16" fill="#fff" />
        <text x="360" y="560" fontFamily={MONO} fontWeight={800} fontSize="50" fill="#1b1b1b">FUTURE YOU</text>
        <path d="M300 660 Q 320 820 250 980" fill="none" stroke="#1b1b1b" strokeWidth="6" strokeDasharray="14 14" />
      </svg>
    </AbsoluteFill>
  );
};

/** Бумажная карточка с фразой и выделением маркером. scale 0..1 — доля экрана. */
const PaperCard: React.FC<{ before: string; mark: string; after?: string; scale: number; blur?: number }> = ({ before, mark, after = "", scale, blur = 0 }) => (
  <AbsoluteFill style={{ justifyContent: "center", alignItems: "center" }}>
    <div style={{ width: 1080, height: 1920, transform: `scale(${scale})`, filter: `blur(${blur}px)`, background: "#e8e4da",
      boxShadow: "0 30px 80px #000c", display: "flex", justifyContent: "center", alignItems: "center",
      backgroundImage: "radial-gradient(circle at 30% 20%, #f2efe7 0%, #e3ded2 60%, #d6d0c3 100%)" }}>
      <div style={{ fontFamily: SERIF, fontSize: 108, color: "#1e1d1a" }}>
        {before}<span style={{ background: "linear-gradient(transparent 18%, #8ff0ff 18%, #8ff0ff 88%, transparent 88%)", padding: "0 10px" }}>{mark}</span>{after}
      </div>
    </div>
  </AbsoluteFill>
);
/** Короткая вспышка карточки внутри истории (анонс фразы эдита). */
const CardFlash: React.FC<{ t: number; dur?: number }> = ({ t, dur = 0.25 }) => {
  const s = useCurrentFrame() / FPS;
  if (s < t || s > t + dur) return null;
  return <AbsoluteFill style={{ opacity: 0.85 }}><PaperCard before="Comfort is a " mark="loan." scale={0.62} /></AbsoluteFill>;
};
/** Переход: карточка появляется маленькой и рывками на каждом ударе растёт до полного экрана. */
const CardGrow: React.FC = () => {
  const s = useCurrentFrame() / FPS;
  const steps: [number, number][] = [[b(14), 0.32], [b(14.5), 0.42], [b(15), 0.56], [b(15.5), 0.74], [EDIT_AT, 1]];
  if (s < steps[0][0] || s >= EDIT_AT + 0.05) return null;
  let i = 0; while (i + 1 < steps.length && s >= steps[i + 1][0]) i++;
  const prev = i ? steps[i - 1][1] : steps[0][1] * 0.6, tgt = steps[i][1];
  const k = Math.min(1, (s - steps[i][0]) / 0.09);
  const sc = prev + (tgt - prev) * k;
  return <PaperCard before="Comfort is a " mark="loan." scale={sc} blur={k < 1 ? 10 * (1 - k) : 0} />;
};

// ===================================================================== эдит-сегменты
/** Обёртка сегмента: удар-рывок масштаба и микровспышка на входе. */
const Cut: React.FC<{ children: React.ReactNode; gray?: boolean; flash?: boolean }> = ({ children, gray, flash }) => {
  const t = useCurrentFrame() / FPS;
  const sc = 1 + 0.12 * Math.exp(-t * 16);
  return (
    <AbsoluteFill style={{ background: "#000" }}>
      <AbsoluteFill style={{ transform: `scale(${sc})`, filter: gray ? "grayscale(1) contrast(1.35)" : undefined }}>{children}</AbsoluteFill>
      {flash ? <AbsoluteFill style={{ background: "#fff", opacity: Math.max(0, 0.9 - t * 9) }} /> : null}
    </AbsoluteFill>
  );
};
const BigText: React.FC<{ lines: string[]; font: "serif" | "punch"; accent?: boolean; echo?: boolean; y?: number }> = ({ lines, font, accent, echo, y = 0 }) => {
  const t = useCurrentFrame() / FPS;
  const st: React.CSSProperties = font === "punch"
    ? { fontFamily: PUNCH, fontSize: 190, lineHeight: 0.95, letterSpacing: 3 }
    : { fontFamily: SERIF, fontSize: 128, lineHeight: 1.02 };
  const c = accent ? COL.ghost : "#f3f2ee";
  return (
    <AbsoluteFill style={{ justifyContent: "center", alignItems: "center", transform: `translateY(${y}px)` }}>
      <div style={{ position: "relative", textAlign: "center" }}>
        {echo ? <div style={{ ...st, color: c, position: "absolute", inset: 0, filter: "blur(18px)", opacity: Math.max(0.15, 0.7 - t), transform: `scale(${1.15 - t * 0.1})` }}>{lines.map((l, i) => <div key={i}>{l}</div>)}</div> : null}
        <div style={{ ...st, color: c, textShadow: accent ? `0 0 40px ${COL.ghost}99` : "0 10px 40px #000" }}>{lines.map((l, i) => <div key={i}>{l}</div>)}</div>
      </div>
    </AbsoluteFill>
  );
};
const DarkBg: React.FC = () => <AbsoluteFill style={{ background: "radial-gradient(circle at 50% 42%, #2b2d33 0%, #0b0c0f 55%, #000 100%)" }} />;

/** 3D-кадр эдита: одинокая фигура в луче света (камера медленно наезжает снизу). */
const LoneShot: React.FC<{ t0: number }> = ({ t0 }) => (
  <Scene3D t0={t0} dof={false} cam={[[t0, [0, 0.6, 5.2], [0, 1.4, 0], 36], [t0 + 2, [0, 0.75, 4.2], [0, 1.4, 0], 36]]}>
    <SpotPool p={[0, 4.5, 0]} intensity={60} color="#ffffff" beam={0.06} />
    <Stickman p={[0, 0, 0]} pose={POSE.stand} />
  </Scene3D>
);
/** 3D-кадр эдита: будущее «я» в полную силу, камера облетает. */
const GhostShot: React.FC<{ t0: number }> = ({ t0 }) => (
  <Scene3D t0={t0} dof={false} cam={[[t0, [-1.6, 1.3, 3.6], [0, 1.0, 0], 38], [t0 + 1.4, [1.2, 1.1, 3.3], [0, 1.0, 0], 38]]}>
    <SpotPool p={[0, 4.5, 0]} intensity={18} color={COL.ghost} beam={0.05} />
    <Ghost p={[0, 0, 0]} power={1} pose={POSE.win} />
  </Scene3D>
);

type Seg = { at: number; beats: number; el: (t0: number) => React.ReactNode };
const EDIT: Seg[] = [
  { at: 16, beats: 2, el: () => <Cut><PaperCard before="Comfort is a " mark="loan." scale={1} /></Cut> },
  { at: 18, beats: 2, el: () => <Cut flash><DarkBg /><BigText font="serif" echo lines={["The interest", "is your future."]} /></Cut> },
  { at: 20, beats: 3, el: (t0) => <Cut gray><LoneShot t0={t0} /><BigText font="serif" lines={["Do it tired."]} y={720} /></Cut> },
  { at: 23, beats: 1, el: () => <Cut flash><BigText font="punch" lines={["NO ONE"]} /></Cut> },
  { at: 24, beats: 1, el: () => <Cut><BigText font="punch" lines={["IS COMING"]} /></Cut> },
  { at: 25, beats: 2, el: () => <Cut><BigText font="punch" accent lines={["TO WAKE", "YOU."]} /></Cut> },
  { at: 27, beats: 2, el: (t0) => <Cut flash><GhostShot t0={t0} /><BigText font="serif" accent lines={["He's waiting."]} y={-640} /></Cut> },
];
const OUTRO_AT = b(29);

export const PILOT_TOTAL = Math.round((OUTRO_AT + 3.8) * FPS);
export const Pilot: React.FC = () => {
  const { durationInFrames } = useVideoConfig();
  return (
    <AbsoluteFill style={{ background: "#000" }}>
      {/* --- 1. 3D-история (0–9.6 с) */}
      <Sequence durationInFrames={Math.round(EDIT_AT * FPS)}>
        <Scene3D t0={0} focus={[0, 0.7, -0.6]} cam={[
          [0, [0, 2.1, 8.2], [0, 1.05, -1.2], 38],
          [3.2, [0, 1.7, 6.6], [0, 0.95, -1.0], 38],
          [5.4, [0.6, 1.5, 5.8], [-0.5, 0.7, -1.6], 40],
          [9.6, [3.0, 2.4, 3.2], [-1.4, 0.8, -4.0], 42],
        ]}>
          <World />
        </Scene3D>
        <RubricTag text="THE INVISIBLE SCORE" />
        <Hook lines={["5:47 AM.", "Two alarms. One choice."]} to={b(4)} />
        <ScorePop t={b(5)} x={0.72} y={0.33} text="SNOOZE ×1" good={false} dur={1.2} />
        <ScorePop t={b(6)} x={0.3} y={0.36} text="+1 SELF-TRUST" />
        <ScorePop t={b(7)} x={0.72} y={0.36} text="−1 SELF-TRUST" good={false} />
        <ScorePop t={b(11)} x={0.34} y={0.30} text="+1 IDENTITY: I SHOW UP" dur={1.8} />
        <ScorePop t={b(12)} x={0.7} y={0.42} text="×365 = ?" good={false} dur={1.6} />
        {/* вставки ровно на ударах */}
        <DoodleInsert t={b(8)} />
        <CardFlash t={b(10)} />
        <CardGrow />
      </Sequence>
      {/* --- 2. эдит (9.6–17.4 с) */}
      {EDIT.map((s, i) => (
        <Sequence key={i} from={Math.round(b(s.at) * FPS)} durationInFrames={Math.round(s.beats * B * FPS)}>{s.el(b(s.at))}</Sequence>
      ))}
      {/* --- 3. фирменная концовка */}
      <EditOutro from={OUTRO_AT} lines={["Nobody saw it.", "That's why", "it counts."]} />
      <Grain amount={0.1} />
      <Audio src={staticFile("music.wav")} volume={(f) => interpolate(f, [0, 10, durationInFrames - 20, durationInFrames], [0, 0.85, 0.85, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" })} />
    </AbsoluteFill>
  );
};
