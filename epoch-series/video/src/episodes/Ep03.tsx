// «ЗАКАЗ ДЛЯ ЛЕЙФА» (викинги, Гренландия ~1000). 29 шотов, визуал v3.1 «2D + объём». Без музыки (голос).
import React from "react";
import { AbsoluteFill, Audio, Sequence, staticFile, useCurrentFrame } from "remotion";
import "../fonts";
import T from "../ep03_timings.json";
import { FPS, keys, back, Stage, Plane, eio } from "../engine/stage";
import { setVivid, G, PAL, cut, rrectP, rectP, inkText, text } from "../engine/paper";
import { CanvasArt } from "../engine/CanvasArt";
import { Pose } from "../engine/puppets";
import { Sema, Extra, Portal, Camera } from "../components/scenes";
import { Subtitles, Tag, Word, Marks, FactCallout } from "../components/overlays";
import { appScreen, stars } from "../components/ep01art";
import { auroraSky, peaks, fjord, snowGround, longhouse, smoke, drakkar, snowfall, fogBand, sheep, tinyFolk, birds, runestone, vikingMap, fishRack, woodpile, barrels, fence, forgeGlow, boathouse,
  hallInterior, hearth, cow, groomingKit, stewPot, keysProp, popcornBucket, badTeeth, slaveMarket, greenSign, iceField } from "../components/ep03art";
import { viking, leif } from "../StyleFrames3";
setVivid(true);

const W: Word[] = T.words as Word[];
const S = T.shots;
export const EP03_DUR = Math.ceil((T.duration + 0.4) * FPS);
const f = (s: number) => Math.round(s * FPS);
const st = (i: number) => (i <= 0 ? 0 : i >= S.length ? T.duration + 0.4 : S[i].s - 0.08);
const shot = (a: number, b = a + 1) => ({ from: f(st(a)), durationInFrames: Math.max(1, f(st(b)) - f(st(a))) });
const wt = (i: number, k: number) => W.filter((w) => w.shot === i)[k].s - st(i);
const dur = (i: number) => st(i + 1) - st(i);
const speak = (t: number, r: [number, number][]) => (r.some(([a, b]) => t >= a && t < b) ? 0.35 + Math.abs(Math.sin(t * 17)) * 0.6 : 0);
const walk = (t: number, sp: number, ph = 0) => Math.sin(t * sp + ph);
const VIV: React.CSSProperties = { filter: "saturate(1.25) contrast(1.06) brightness(1.03)" };
const DARK: React.CSSProperties = { filter: "saturate(0.95) contrast(1.12) brightness(0.92)" };
const Vignette: React.FC<{ a?: number }> = ({ a = 0.7 }) => <AbsoluteFill style={{ background: `radial-gradient(ellipse 72% 58% at 50% 40%, rgba(0,0,0,0) 32%, rgba(8,6,12,${a}) 100%)` }} />;
const Sticker: React.FC<{ s: string; x: number; y: number; at?: number; rot?: number; size?: number; color?: string; bg?: string }> = ({ s, x, y, at = 0, rot = -0.06, size = 56, color = PAL.ink, bg = "#F7D84A" }) => (
  <CanvasArt draw={(g, t) => { const k = back((t - at) / 0.3); if (k <= 0) return; g.save(); g.translate(x, y); g.rotate(rot); g.scale(k, k); g.font = `900 ${size}px Montserrat`; const L = s.split("\n"); const w = Math.max(...L.map((l) => g.measureText(l).width)) + 70; const h = L.length * size * 1.15 + 50;
    g.shadowColor = "rgba(60,36,12,0.35)"; g.shadowBlur = 16; g.shadowOffsetX = 8; g.shadowOffsetY = 12; cut(g, rrectP(-w / 2, -h / 2, w, h, 14), bg, { seed: Math.round(x + y), edge: 2.5, tear: 0.6 }); g.shadowColor = "transparent"; L.forEach((l, i) => inkText(g, l, 0, -h / 2 + 25 + size * 0.6 + i * size * 1.15, size, color)); g.restore(); }} />
);
const bagPose = (p: Pose): Pose => ({ bag: true, talk: 0, ...p });
const T_ = () => useCurrentFrame() / FPS;
const APP = { rows: [["Попкорн", "× 1"]] as [string, string][], addr: "Гренландия,\nферма Эрика", date: "1000 год", client: "Лейф Эриксон", avatar: "leif" as const };

// ---------------------------------------------------------------- общие сцены
const Village: React.FC<{ cam?: any; turn?: (t: number) => number; children?: React.ReactNode; folk?: boolean }> = ({ cam = [[0, 0, 0, 1]], turn = () => 0.5, children, folk = true }) => (
  <Stage cam={cam} focus={11} bg="#BFE3EE" light="day" rays={0.2}>
    <Plane z={60} draw={auroraSky} dyn shadow={0} boil={false} blurK={3} />
    <Plane z={34} draw={peaks(980, 520, "#9FB8CC", "#F4FAFC", 11)} shadow={0.1} blurK={3} />
    <Plane z={30} dyn draw={birds} shadow={0} blurK={3} />
    <Plane z={24} draw={peaks(1060, 380, "#5E7488", "#EEF5F8", 23)} shadow={0.15} blurK={4} />
    <Plane z={20} draw={fogBand(1040, 0.45, 3)} dyn shadow={0} blurK={4} />
    <Plane z={17} draw={fjord(1080)} dyn shadow={0.1} blurK={4} />
    <Plane z={16} dyn draw={drakkar(820, 1150, 0.42, 0.2, 1, 5)} blurK={4} />
    <Plane z={15} dyn draw={drakkar(330, 1170, 0.3, 0.15, 0.8, 9)} blurK={4} />
    <Plane z={13} draw={boathouse(560, 1250, 0.7)} blurK={4} />
    <Plane z={12} draw={snowGround(1240)} blurK={4} />
    <Plane z={11.5} dyn draw={smoke(230, 1000, 1, 2)} shadow={0} />
    <Plane z={11} dyn draw={(g, tt) => { longhouse(230, 1330, 1.0, turn(tt), 40)(g, tt); longhouse(780, 1360, 1.15, turn(tt), 60)(g, tt); }} />
    <Plane z={11} dyn draw={smoke(780, 1000, 1.1, 7)} shadow={0} />
    <Plane z={10.8} dyn draw={(g, tt) => { fishRack(470, 1400, 0.9)(g, tt); woodpile(1020, 1420, 0.9)(g); barrels(80, 1420, 0.8)(g); forgeGlow(600, 1380)(g, tt); }} />
    {folk ? <Plane z={10.2} dyn draw={(g, tt) => { fence(-40, 300, 1560)(g); tinyFolk(520, 1470, 1.2, "#8A3A2A", 1, 1)(g, tt); tinyFolk(1010, 1490, 1.2, "#3E5A7A", 4)(g, tt); tinyFolk(-20, 1480, 1.1, "#6E7A3A", 6, 1)(g, tt); sheep(140, 1530, 1.2, 7)(g, tt); sheep(680, 1550, 1.1, 9)(g, tt); sheep(900, 1570, 1, 11)(g, tt); }} /> : null}
    <Plane z={9} draw={snowGround(1660, "#F4FAFC")} />
    <Plane z={8} dyn draw={snowfall(60, 4, 90, 21, 0.7)} shadow={0} />
    {children}
    <Plane z={4} dyn draw={snowfall(26, 9, 160, 33, 0.9)} shadow={0} />
    <Plane z={2.6} dyn draw={snowfall(10, 18, 260, 45, 0.85)} shadow={0} />
  </Stage>
);
const Dock: React.FC<{ cam?: any; sail?: (t: number) => number; boatX?: (t: number) => number; fog?: number; children?: React.ReactNode }> = ({ cam = [[0, 0, 0, 1]], sail = () => 1, boatX = () => 560, fog = 0, children }) => (
  <Stage cam={cam} focus={6} bg="#BFE3EE" rays={0.25}>
    <Plane z={40} draw={auroraSky} dyn shadow={0} blurK={3} />
    <Plane z={26} draw={peaks(1000, 420, "#7F98AE", "#F4FAFC", 31)} blurK={3} />
    <Plane z={18} draw={fjord(1020)} dyn blurK={3} />
    <Plane z={12} dyn draw={(g, tt) => drakkar(boatX(tt), 1180, 1.05, 0.35, sail(tt), 3)(g, tt)} blurK={3} />
    {fog > 0 ? <Plane z={11} dyn draw={fogBand(1080, fog, 5)} shadow={0} blurK={3} /> : null}
    <Plane z={9} draw={(g) => { cut(g, [[-400, 1330], [1480, 1300], [1480, 2400], [-400, 2400]], "#8A6A4A", { seed: 1600, sort: "kraft", tear: 0.6 }); for (let x = -380; x < 1500; x += 120) cut(g, rectP(x, 1300, 10, 200), "#5A3A24", { seed: 1601 + x }); }} blurK={3} />
    <Plane z={8} dyn draw={(g, tt) => { barrels(980, 1420, 0.9)(g); fishRack(120, 1430, 0.9)(g, tt); }} blurK={3} />
    {children}
    <Plane z={3} dyn draw={snowfall(14, 12, 180, 61, 0.8)} shadow={0} />
    {fog > 0 ? <Plane z={2.8} dyn draw={fogBand(1700, fog, 9)} shadow={0} /> : null}
  </Stage>
);
const Hall: React.FC<{ cam?: any; children?: React.ReactNode }> = ({ cam = [[0, 0, 0, 1]], children }) => (
  <Stage cam={cam} focus={6} bg="#2A1E14" light="indoor">
    <Plane z={14} draw={hallInterior} shadow={0} blurK={3} />
    <Plane z={9} dyn draw={hearth(540, 1300, 1.1)} shadow={0} blurK={3} />
    {children}
  </Stage>
);
const Mapped: React.FC<{ cam: any; route?: (t: number) => number }> = ({ cam, route = () => 1 }) => (
  <Stage cam={cam} focus={6} bg="#E9D2A4" light="indoor"><Plane z={6} dyn draw={(g, tt) => vikingMap(route(tt))(g, tt)} /></Stage>
);
const Fold: React.FC<{ v?: React.CSSProperties; children: React.ReactNode }> = ({ v = VIV, children }) => <AbsoluteFill style={v}>{children}</AbsoluteFill>;

export const Ep03: React.FC = () => (
  <AbsoluteFill style={{ background: "#FFD43B" }}>
    <Audio src={staticFile("ep03/voice.mp3")} />
    {/* 1. ЗАКАЗ */}
    <Sequence {...shot(0)}><Fold>
      <CanvasArt draw={(g, t) => { g.save(); const z = 1 + t * 0.012; g.translate(540, 960); g.scale(z, z); g.translate(-540, -960); appScreen(g, t, { ...APP, finger: keys(t, [[0, 0], [0.6, 1]]) }); g.restore(); }} />
    </Fold></Sequence>
    {/* 2–3. ПРИНЯТЬ → рвётся → Гренландия, падает в снег */}
    <Sequence {...shot(1, 3)}><Fold>
      <Portal at={0.8} before={<CanvasArt draw={(g, t) => appScreen(g, t, { ...APP, press: keys(t, [[0.25, 0], [0.45, 1]]) })} />}
        after={<Village cam={[[0, -200, 40, 1.0], [3.5, 0, 0, 1.06]]} turn={(t) => -0.6 + t * 0.25}>
          <Extra spec={viking(31, "#3E5A7A", { hat: "nasal" })} x={360} y={1640} s={3.4} z={10.5} pose={(t) => ({ emo: t > 1.5 ? "shock" : "calm", look: [1, 0], aR: t > 1.5 ? [1.9, 0.3] : [0.3, 0.3] })} />
          <Sema outfit="casual" z={10.5} x={640} s={3.6} y={1660} pose={(t) => bagPose({ emo: t > 1.5 ? "shock" : "fear", aL: [2.6, 0.4], aR: [2.6, 0.4], tilt: t < 1.4 ? Math.sin(t * 20) * 0.3 : 0, squash: keys(t, [[1.4, 0], [1.48, 1.6], [1.75, 0]], back), t })}
            dy={(t) => keys(t, [[0.8, -1700], [1.42, 0]], (u) => u * u)} />
        </Village>} />
      <Sequence from={f(1.5)}><Marks kind="crack" label="ХРУСТЬ!" x={300} y={640} s={0.8} /></Sequence>
      <Sequence from={f(1.8)}><Tag big x={780} lines={["1000 ГОД", "ГРЕНЛАНДИЯ"]} /></Sequence>
    </Fold></Sequence>
    {/* 4. РОГА: миф vs как было */}
    <Sequence {...shot(3)}><Fold>
      <Stage cam={Camera.push(0, dur(3), 0.05)} focus={6} bg="#BFE3EE" rays={0.2}>
        <Plane z={40} draw={auroraSky} dyn shadow={0} blurK={3} />
        <Plane z={24} draw={peaks(1060, 380, "#5E7488", "#EEF5F8", 23)} blurK={3} />
        <Plane z={12} draw={snowGround(1300)} blurK={3} />
        <Extra spec={viking(41, "#7A3A2A", { hat: "horns" })} x={280} y={1560} s={4.6} z={6} pose={() => ({ emo: "proud", aR: [2.5, 0.4], look: [1, 0] })} />
        <Extra spec={viking(42, "#3E5A7A", { hat: "nasal" })} x={800} y={1560} s={4.6} z={6} pose={(t) => ({ emo: t > wt(3, 6) ? "smile" : "calm", aR: [0.4, 0.4], look: [-1, 0] })} />
        <Plane z={3} dyn draw={snowfall(14, 12, 180, 61, 0.8)} shadow={0} />
      </Stage>
      <Sticker s="МИФ" x={280} y={330} at={0.3} size={70} bg={PAL.scarf} color="#FBF7EC" />
      <CanvasArt draw={(g, t) => { const k = back((t - wt(3, 6)) / 0.25); if (k <= 0) return; g.save(); g.translate(280, 820); g.rotate(-0.3); g.scale(k, k); g.lineWidth = 26; g.strokeStyle = "rgba(200,53,43,0.9)"; g.beginPath(); g.moveTo(-200, -200); g.lineTo(200, 200); g.moveTo(200, -200); g.lineTo(-200, 200); g.stroke(); g.restore(); }} />
      <Sticker s="КАК БЫЛО" x={800} y={330} at={wt(3, 6) + 0.3} size={60} bg="#3DBE5A" color="#FFFFFF" rot={0.05} />
      <Sticker s={"рога придумали\nв XIX веке"} x={540} y={560} at={wt(3, 9)} size={36} bg="#FBF7EC" rot={0.02} />
    </Fold></Sequence>
    {/* 5. «Викинг» — не народ, а работа: морской поход */}
    <Sequence {...shot(4)}><Fold>
      <Stage cam={Camera.pan(0, dur(4), 200, 1.04)} focus={7} bg="#BFE3EE" rays={0.2}>
        <Plane z={40} draw={auroraSky} dyn shadow={0} blurK={3} />
        <Plane z={26} draw={peaks(1000, 420, "#7F98AE", "#F4FAFC", 31)} blurK={3} />
        <Plane z={18} draw={fjord(1000)} dyn blurK={3} />
        <Plane z={7} dyn draw={(g, tt) => { drakkar(540, 1300, 1.1, 0.45, 1, 7)(g, tt); for (let i = 0; i < 5; i++) tinyFolk(310 + i * 110, 1240, 1.5, ["#8A3A2A", "#3E5A7A", "#6E7A3A", "#7A3A2A", "#5E4A3A"][i], 20 + i, 1)(g, tt); }} />
        <Plane z={5} draw={(g, tt) => {}} />
      </Stage>
      <Sticker s={"ВИКИНГ —\nНЕ НАРОД"} x={300} y={320} at={0.4} size={52} bg={PAL.scarf} color="#FBF7EC" />
      <Sticker s={"= МОРСКОЙ\nПОХОД"} x={780} y={540} at={wt(4, 6)} size={48} rot={0.06} />
    </Fold></Sequence>
    {/* 6. Дорога к Лейфу: показывают на Браттахлид */}
    <Sequence {...shot(5)}><Fold>
      <Village cam={[[0, 0, 0, 1.04], [dur(5), 160, -20, 1.1]]} turn={(t) => 0.2 + t * 0.08}>
        <Extra spec={viking(33, "#6E7A3A")} x={300} y={1640} s={3.5} z={10.5} pose={(t) => ({ emo: "smile", look: [1, -0.3], aR: t > wt(5, 6) ? [1.6, 0.1] : [0.3, 0.3], talk: speak(t, [[wt(5, 6) - 0.2, wt(5, 9)]]) })} />
        <Sema outfit="casual" z={10.5} x={640} s={3.6} y={1660} pose={(t) => bagPose({ emo: "curious", look: [-1, 0], t, talk: speak(t, [[0, wt(5, 5)]]) })} />
      </Village>
      <Sticker s="БРАТТАХЛИД →" x={760} y={330} at={wt(5, 9)} size={54} bg="#FBF7EC" color={PAL.scarf} />
    </Fold></Sequence>
    {/* 7. Пахали, пасли овец, чинили корабли — общий план с поворотом домов */}
    <Sequence {...shot(6)}><Fold>
      <Village cam={[[0, -220, 40, 1.0], [dur(6), 220, -20, 1.1]]} turn={(t) => -0.9 + 1.4 * eio(t / dur(6))}>
        <Sema outfit="casual" z={10.5} x={640} s={3.4} y={1660} pose={(t) => bagPose({ emo: "curious", step: walk(t, 8), look: [1, 0], t })} />
      </Village>
      <Sticker s="ПАХАЛИ" x={220} y={300} at={wt(6, 6)} size={46} />
      <Sticker s="ПАСЛИ ОВЕЦ" x={760} y={420} at={wt(6, 7) + 0.1} size={46} rot={0.05} />
      <Sticker s="ЧИНИЛИ КОРАБЛИ" x={420} y={560} at={wt(6, 10)} size={46} rot={-0.03} />
    </Fold></Sequence>
    {/* 8. Длинный дом: одна комната, один огонь, вся семья */}
    <Sequence {...shot(7)}><Fold>
      <Hall cam={Camera.push(0, dur(7), 0.06)}>
        <Extra spec={viking(51, "#7A3A2A")} x={150} y={1560} s={3.8} z={6} pose={() => ({ emo: "smile", look: [1, 0], aR: [1.2, 1.4] })} />
        <Extra spec={viking(52, "#4E6B3A", { beard: undefined, hair: "#C9A24B" })} x={940} y={1560} s={3.6} z={6.2} pose={(t) => ({ emo: "smile", look: [-1, 0], facing: -1, talk: Math.abs(Math.sin(t * 7)) * 0.3 })} />
        <Sema outfit="casual" x={560} s={4.2} y={1680} z={5} pose={(t) => bagPose({ emo: "relief", aL: [0.9, 1.2], aR: [0.9, 1.2], t })} />
      </Hall>
      <Sticker s={"1 КОМНАТА\n1 ОГОНЬ"} x={760} y={320} at={wt(7, 7)} size={46} />
    </Fold></Sequence>
    {/* 9. Коровы за стенкой */}
    <Sequence {...shot(8)}><Fold>
      <Hall cam={[[0, 200, 0, 1.06], [dur(8), 260, -20, 1.1]]}>
        <Plane z={7} dyn draw={(g, tt) => { cow(760, 1500, 1.4, 3)(g, tt); cow(1100, 1520, 1.2, 9)(g, tt); }} />
        <Sema outfit="casual" x={380} s={4.2} y={1680} z={5} pose={(t) => bagPose({ emo: t > wt(8, 12) ? "disgust" : "shock", look: [1, 0], lean: t > wt(8, 12) ? -0.15 : 0, t })} />
      </Hall>
      <Sequence from={f(wt(8, 12))}><Marks kind="sweat" x={380} y={740} /></Sequence>
      <Sticker s="ТЕПЛО +" x={300} y={320} at={wt(8, 10)} size={48} bg="#3DBE5A" color="#FFFFFF" />
      <Sticker s="ЗАПАХ +++" x={760} y={460} at={wt(8, 12)} size={48} bg={PAL.scarf} color="#FBF7EC" rot={0.06} />
    </Fold></Sequence>
    {/* 10. Похлёбка — крупно */}
    <Sequence {...shot(9)}><Fold>
      <CanvasArt draw={(g, t) => { g.save(); g.translate(540, 900); g.scale(1 + t * 0.04, 1 + t * 0.04); g.translate(-540, -900); stewPot(g, t); g.restore(); }} />
      <Sticker s="ПОХЛЁБКА × 100" x={540} y={320} at={wt(9, 3)} size={58} />
    </Fold></Sequence>
    {/* 11. Чистюли: гребни, пинцеты, ложечки для ушей — крупно */}
    <Sequence {...shot(10)}><Fold>
      <CanvasArt draw={(g, t) => groomingKit(g, t)} />
      <Sticker s="ГРЕБЕНЬ" x={540} y={560} at={wt(10, 4)} size={42} bg="#FBF7EC" />
      <Sticker s="ПИНЦЕТ" x={260} y={1000} at={wt(10, 5)} size={42} bg="#FBF7EC" rot={0.1} />
      <Sticker s="ЛОЖЕЧКА ДЛЯ УШЕЙ" x={720} y={1520} at={wt(10, 7)} size={40} bg="#FBF7EC" rot={-0.05} />
      <Sticker s="ЧИСТЮЛИ" x={540} y={300} at={wt(10, 3) - 0.1} size={64} bg="#3DBE5A" color="#FFFFFF" />
    </Fold></Sequence>
    {/* 12. «Так вы тут самые культурные?!» */}
    <Sequence {...shot(11)}><Fold>
      <Hall cam={[[0, 0, -60, 1.12]]}>
        <Extra spec={viking(53, "#3E5A7A")} x={330} y={1600} s={4.6} z={5.4} pose={(t) => ({ emo: "proud", aR: [2.6, 1.6 + Math.sin(t * 9) * 0.2], look: [1, 0] })} />
        <Sema outfit="casual" x={790} s={4.4} y={1620} pose={(t) => bagPose({ emo: "shock", look: [-1, 0], t, talk: speak(t, [[0, 1.6]]) })} />
      </Hall>
      <Marks kind="bang" x={790} y={560} />
    </Fold></Sequence>
    {/* 13. Зубы так себе — мрачновато */}
    <Sequence {...shot(12)}><Fold v={DARK}>
      <CanvasArt draw={(g, t) => { g.save(); g.translate(540, 860); g.scale(1 + t * 0.03, 1 + t * 0.03); g.translate(-540, -860); badTeeth(g, t); g.restore(); }} />
      <Vignette a={0.55} />
      <Sticker s="СТОМАТОЛОГА НЕТ" x={540} y={320} at={wt(12, 4) - 0.1} size={50} bg={PAL.scarf} color="#FBF7EC" />
    </Fold></Sequence>
    {/* 14. Хозяйка с ключами — права женщин */}
    <Sequence {...shot(13)}><Fold>
      <Hall cam={Camera.push(0, dur(13), 0.06, 0, -40)}>
        <Extra spec={viking(54, "#8A3A5A", { beard: undefined, hair: "#E2C27A", trim: "#F2C14E" })} x={420} y={1620} s={4.8} z={5.3} pose={() => ({ emo: "proud", aR: [0.5, 0.4], holdR: keysProp, look: [1, 0], talk: 0 })} />
        <Sema outfit="casual" x={840} s={4.2} y={1640} pose={(t) => bagPose({ emo: "curious", look: [-1, 0], t })} />
      </Hall>
      <FactCallout text={"КЛЮЧИ =\nХОЗЯЙКА"} x={300} y={330} to={[440, 1180]} />
      <Sticker s={"ИМУЩЕСТВО +\nРАЗВОД +"} x={800} y={420} at={wt(13, 9)} size={42} bg="#FBF7EC" rot={0.05} />
    </Fold></Sequence>
    {/* 15. Эрик Рыжий открыл Гренландию */}
    <Sequence {...shot(14)}><Fold>
      <Village cam={[[0, 0, -40, 1.08], [dur(14), 0, -60, 1.14]]} turn={() => 0.6} folk={false}>
        <Extra spec={{ ...viking(61, "#7A2A22"), hair: "#C8452A", beard: "#C8452A", mustache: "#A83A22", fur: "#5E4A3A", brooch: true }} x={420} y={1640} s={4} z={10.5} pose={(t) => ({ emo: "proud", aR: [1.6, 0.2], look: [1, -0.4] })} />
        <Sema outfit="casual" z={10.5} x={760} s={3.5} y={1660} pose={(t) => bagPose({ emo: "curious", look: [-1, 0], t })} />
      </Village>
      <Tag big x={420} lines={["ЭРИК", "РЫЖИЙ"]} />
      <Sticker s={"«ЗЕЛЁНАЯ\nЗЕМЛЯ»"} x={780} y={560} at={wt(14, 12) - 0.2} size={48} bg="#6FA84E" color="#FBF7EC" rot={0.06} />
    </Fold></Sequence>
    {/* 16. Хотя вокруг лёд → маркетинг */}
    <Sequence {...shot(15)}><Fold>
      <Stage cam={Camera.push(0, dur(15), 0.06)} focus={6} bg="#BFE3EE">
        <Plane z={40} draw={auroraSky} dyn shadow={0} blurK={3} />
        <Plane z={24} draw={peaks(1000, 420, "#9FB8CC", "#F4FAFC", 41)} blurK={3} />
        <Plane z={10} draw={iceField} blurK={3} />
        <Plane z={6} dyn draw={greenSign} x={-150} />
        <Sema outfit="casual" x={900} s={3.4} y={1720} z={5} pose={(t) => bagPose({ emo: t > wt(15, 8) ? "facepalm" : "shock", aR: t > wt(15, 8) ? [2.6, 1.9] : [0.3, 0.3], t })} />
        <Plane z={3} dyn draw={snowfall(20, 12, 200, 71, 0.9)} shadow={0} />
      </Stage>
      <Sticker s="МАРКЕТИНГ" x={540} y={320} at={wt(15, 8)} size={66} bg={PAL.scarf} color="#FBF7EC" />
    </Fold></Sequence>
    {/* 17. Мрачно: работорговля (без насилия) */}
    <Sequence {...shot(16)}><Fold v={DARK}>
      <Stage cam={Camera.push(0, dur(16), 0.05)} focus={6} bg="#2A2632" light="night">
        <Plane z={8} dyn draw={slaveMarket} shadow={0} />
        <Plane z={3} dyn draw={snowfall(30, 8, 140, 81, 0.6)} shadow={0} />
      </Stage>
      <Vignette a={0.75} />
      <Sticker s="ТЁМНАЯ СТОРОНА" x={540} y={320} at={wt(16, 6)} size={48} bg="#2E3A57" color="#FBF7EC" />
    </Fold></Sequence>
    {/* 18. Сёма бежит к причалу */}
    <Sequence {...shot(17)}><Fold>
      <Dock cam={Camera.pan(0, dur(17), -220, 1.06)}>
        <Sema outfit="casual" x={540} s={4.3} y={1640} z={5.4} pose={(t) => bagPose({ emo: "resolve", step: walk(t, 14), lean: 0.12, aL: [0.9 + Math.sin(t * 14) * 0.5, 0.6], aR: [0.9 - Math.sin(t * 14) * 0.5, 0.6], t })} />
      </Dock>
      <Sticker s="КОРАБЛЬ ГОТОВ!" x={540} y={320} at={wt(17, 4)} size={52} bg="#3DBE5A" color="#FFFFFF" />
    </Fold></Sequence>
    {/* 19. Драккар: малая осадка — и море, и река */}
    <Sequence {...shot(18)}><Fold>
      <Stage cam={Camera.pan(0, dur(18), 160, 1.02)} focus={7} bg="#CFF1F7" rays={0.25}>
        <Plane z={40} draw={auroraSky} dyn shadow={0} blurK={3} />
        <Plane z={22} draw={(g) => { cut(g, [[-400, 1000], [1480, 960], [1480, 2400], [-400, 2400]], "#6E8A4E", { seed: 1950, sort: "felt", tear: 1 }); }} blurK={3} />
        <Plane z={14} draw={(g) => { cut(g, [[-400, 1180], [1480, 1150], [1480, 1560], [-400, 1600]], "#4E8FC0", { seed: 1951, sort: "water", tear: 0.8 }); }} blurK={3} />
        <Plane z={7} dyn draw={drakkar(540, 1340, 0.95, 0.3, 1, 11)} />
        <Plane z={6} draw={(g) => { cut(g, [[-400, 1600], [1480, 1560], [1480, 2400], [-400, 2400]], "#7A9A5A", { seed: 1952, sort: "felt", tear: 1 }); }} />
      </Stage>
      <FactCallout text={"ОСАДКА\n≈ 1 МЕТР"} x={820} y={330} to={[640, 1330]} rot={0.05} />
      <Sticker s="МОРЕ + РЕКА" x={300} y={560} at={wt(18, 8)} size={48} />
    </Fold></Sequence>
    {/* 20. И вот он — Лейф Эриксон (Лейф Счастливый) */}
    <Sequence {...shot(19)}><Fold>
      <Dock cam={[[0, 0, 0, 1.0], [dur(19), 0, -40, 1.08]]}>
        <Extra spec={leif} x={330} y={1600} s={5} z={5.6} pose={(t) => ({ emo: "smile", aR: [0.5, 0.4], aL: [0.3, 0.3], look: [1, 0] })} />
        <Sema outfit="casual" x={790} s={4.4} y={1620} pose={(t) => bagPose({ emo: "proud", aL: [1.4, 0.8], look: [-1, 0], t })} />
      </Dock>
      <Tag x={330} lines={["ЛЕЙФ ЭРИКСОН"]} />
      <Sticker s="«СЧАСТЛИВЫЙ»" x={760} y={480} at={wt(19, 8) - 0.1} size={48} bg="#F7D84A" rot={0.06} />
    </Fold></Sequence>
    {/* 21. Лейф пробует попкорн: «Что это за зерно?» — «Кукуруза.» */}
    <Sequence {...shot(20)}><Fold>
      <Dock cam={[[0, 0, -60, 1.12], [dur(20), -40, -80, 1.18]]}>
        <Extra spec={leif} x={330} y={1600} s={5} z={5.6} pose={(t) => ({ emo: t > wt(20, 3) ? "curious" : "smile", aR: [1.5 + (t > 0.4 && t < 1.5 ? Math.max(0, Math.sin(t * 6)) * 0.3 : 0), 1.4], holdR: popcornBucket, look: [1, 0], talk: speak(t, [[wt(20, 3), wt(20, 7) - 0.1]]) })} />
        <Sema outfit="casual" x={790} s={4.4} y={1620} pose={(t) => bagPose({ emo: "smile", look: [-1, 0], t, talk: speak(t, [[wt(20, 7), dur(20)]]) })} />
      </Dock>
      <CanvasArt draw={(g, t) => { const k = back((t - wt(20, 3)) / 0.3); if (k <= 0) return; g.save(); g.translate(330, 520); g.rotate(-0.1); g.scale(k, k); text(g, "?", 0, 0, 220, PAL.scarf, "Caveat", 700); g.restore(); }} />
    </Fold></Sequence>
    {/* 22. Озарение: кукурузы в Европе нет — она из Америки */}
    <Sequence {...shot(21)}><Fold>
      <Dock cam={[[0, 120, -80, 1.25]]}>
        <Sema outfit="casual" x={790} s={4.4} y={1620} pose={(t) => bagPose({ emo: t > wt(21, 4) ? "shock" : "curious", look: [0, 0], t, aR: t > wt(21, 4) ? [2.6, 1.9] : [0.3, 0.3] })} />
      </Dock>
      <Sequence from={f(wt(21, 4))}><Marks kind="bang" x={760} y={540} /></Sequence>
      <Sticker s={"КУКУРУЗА —\nИЗ АМЕРИКИ"} x={430} y={360} at={wt(21, 9) - 0.2} size={50} bg="#F7D84A" />
    </Fold></Sequence>
    {/* 23. «А где эта Америка?» — Сёма показывает на запад */}
    <Sequence {...shot(22)}><Fold>
      <Dock cam={[[0, 0, -40, 1.1]]}>
        <Extra spec={leif} x={330} y={1600} s={5} z={5.6} pose={(t) => ({ emo: "curious", aR: [1.5, 1.4], holdR: popcornBucket, look: [1, 0], talk: speak(t, [[0, wt(22, 4) - 0.1]]) })} />
        <Sema outfit="casual" x={790} s={4.4} y={1620} pose={(t) => bagPose({ emo: "proud", look: [-1, 0], t, aL: t > wt(22, 4) ? [1.55, 0.05] : [0.3, 0.3] })} />
      </Dock>
      <Sticker s="← ЗАПАД" x={540} y={330} at={wt(22, 7) - 0.1} size={60} bg={PAL.scarf} color="#FBF7EC" />
    </Fold></Sequence>
    {/* 24. Лейф поднимает парус */}
    <Sequence {...shot(23)}><Fold>
      <Dock cam={[[0, 0, 0, 1.0], [dur(23), 0, -80, 0.96]]} sail={(t) => Math.min(1, 0.1 + t / 1.2)}>
        <Extra spec={leif} x={330} y={1600} s={5} z={5.6} pose={() => ({ emo: "resolve", aR: [2.7, 0.2], aL: [0.3, 0.3], look: [1, -0.6] })} />
      </Dock>
    </Fold></Sequence>
    {/* 25. Карта: до Америки за 500 лет до Колумба */}
    <Sequence {...shot(24)}><Fold>
      <Mapped cam={[[0, 0, 40, 0.86], [dur(24), 0, 40, 0.92]]} route={(t) => eio(t / 3)} />
      <Sticker s={"ЗА 500 ЛЕТ\nДО КОЛУМБА"} x={540} y={170} at={wt(24, 9) - 0.3} size={46} bg={PAL.scarf} color="#FBF7EC" />
    </Fold></Sequence>
    {/* 26. Винланд — «Страна вина»: наезд на Винланд */}
    <Sequence {...shot(25)}><Fold>
      <Mapped cam={[[0, 0, 40, 0.92], [2.2, -330, 300, 1.45]]} />
      <Sticker s="ВИНЛАНД = АМЕРИКА" x={540} y={260} at={0.3} size={46} bg={PAL.scarf} color="#FBF7EC" />
      <Sticker s={"«СТРАНА ВИНА»"} x={540} y={420} at={wt(25, 4)} size={46} rot={0.04} />
      <Sticker s={"МАРКЕТИНГ —\nСЕМЕЙНОЕ"} x={540} y={1520} at={wt(25, 8)} size={44} bg="#FBF7EC" rot={-0.04} />
    </Fold></Sequence>
    {/* 27. Пять звёзд, чаевые серебром — драккар уходит */}
    <Sequence {...shot(26)}><Fold>
      <Dock cam={[[0, 0, -40, 1.05], [dur(26), 0, 0, 0.95]]} boatX={(t) => 560 - t * 120}>
        <Sema outfit="casual" x={790} s={4.4} y={1620} pose={(t) => bagPose({ emo: "proud", look: [-1, -0.5], aR: [2.6 + Math.sin(t * 8) * 0.2, 0.3], t })} />
      </Dock>
      <CanvasArt draw={(g, t) => { const k = back(t / 0.35); g.save(); g.translate(540, 330); g.rotate(-0.04); g.scale(k, k); cut(g, rrectP(-380, -90, 760, 180, 30), "#FFFFFF", { seed: 960, edge: 3, tear: 0.5 }); stars(g, -280, -10, Math.min(5, Math.floor(t * 10)), 56, 140, 961); text(g, "чаевые: серебром", 0, 62, 34, "#8a8070", "Montserrat", 900); g.restore(); }} />
    </Fold></Sequence>
    {/* 28. Туман: «кукуруза растёт гораздо южнее» */}
    <Sequence {...shot(27)}><Fold v={DARK}>
      <Dock cam={[[0, 0, 0, 1.0], [dur(27), 0, -20, 1.06]]} boatX={(t) => 300 - t * 100} sail={() => 0.7} fog={0.85}>
        <Sema outfit="casual" x={760} s={4.4} y={1620} pose={(t) => bagPose({ emo: t > wt(27, 6) ? "fear" : "calm", look: [-1, 0], t })} />
      </Dock>
      <Vignette a={0.5} />
      <Sticker s={"КУКУРУЗА РАСТЁТ\nГОРАЗДО ЮЖНЕЕ"} x={540} y={330} at={wt(27, 6)} size={42} bg="#FBF7EC" />
    </Fold></Sequence>
    {/* 29. Новый заказ: адрес ??? */}
    <Sequence {...shot(28, 29)}><Fold>
      <CanvasArt draw={(g, t) => appScreen(g, t, { rows: [["???", "× 1"]], addr: "???", date: "", unknown: true, finger: 0 })} />
      <Sticker s={"КУДА ВЕЗТИ?\nПИШИ В КОММЕНТЫ!"} x={540} y={1720} at={0.9} rot={-0.04} size={52} bg={PAL.scarf} color="#FBF7EC" />
    </Fold></Sequence>
    <Subtitles words={W} keywords={["ПОПКОРН", "ЛЕЙФ", "СНЕГ", "РОГАТЫХ", "ВОСЕМЬСОТ", "НАРОД", "РАБОТА", "БРАТТАХЛИД", "ГРАБЕЖА", "ОГОНЬ", "КОРОВЫ", "ЗАПАХ", "ПОХЛЁБКИ", "ЧИСТЮЛИ", "КУЛЬТУРНЫЕ", "СТОМАТОЛОГА", "РАЗВОД", "ЭРИК", "МАРКЕТИНГ", "РАБСТВО", "ПРИЧАЛУ", "РЕКЕ", "СЧАСТЛИВЫЙ", "КУКУРУЗА", "АМЕРИКЕ", "ЗАПАД", "ПАРУС", "КОЛУМБА", "ВИНЛАНД", "ЗВЁЗД", "ЮЖНЕЕ", "КОММЕНТАХ"]} />
  </AbsoluteFill>
);
