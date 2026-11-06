// СЕРИЯ 1 «ЗАКАЗ ДЛЯ ЦЕЗАРЯ» (формат «Сёма-курьер»). Сценарий v3, 25 шотов, голос — ElevenLabs v3 (timings.json).
import React from "react";
import { AbsoluteFill, Audio, Sequence, staticFile } from "remotion";
import "../fonts";
import T from "../ep01_timings.json";
import { FPS, keys, back, step, Stage, Plane, eo } from "../engine/stage";
import { setVivid, G, PAL, cut, rrectP, rectP, inkText, text } from "../engine/paper";
import { CanvasArt } from "../engine/CanvasArt";
import { Emo, Pose } from "../engine/puppets";
import { Sema, Extra, EraBackground, Portal, Camera } from "../components/scenes";
import { FactCallout, SurvivalNotebook, Subtitles, Tag, Word, Marks, MapCard } from "../components/overlays";
import { appScreen, insula, latrineWall, latrineBench, spongeStick, stall, amphora, rostra, senate, pigeon, saladBox, saladFloor, shieldProp, laurelFly, crowd, stars } from "../components/ep01art";
import { shawarma } from "../StyleFrames";
setVivid(true);

const W: Word[] = T.words as Word[];
const S = T.shots;
export const EP01_DUR = Math.ceil((T.duration + 0.3) * FPS);
const f = (s: number) => Math.round(s * FPS);
const st = (i: number) => (i <= 0 ? 0 : i >= S.length ? T.duration + 0.3 : S[i].s - 0.08); // смена кадра чуть раньше слова
const shot = (a: number, b = a + 1) => ({ from: f(st(a)), durationInFrames: Math.max(1, f(st(b)) - f(st(a))) });
const wt = (i: number, k: number) => W.filter((w) => w.shot === i)[k].s - st(i); // время k-го слова шота i от начала Sequence
const e = (k: [number, Emo][]) => (t: number) => step<Emo>(t, k);
const speak = (t: number, ranges: [number, number][]) => (ranges.some(([a, b]) => t >= a && t < b) ? 0.35 + Math.abs(Math.sin(t * 17)) * 0.6 : 0);
const VIV: React.CSSProperties = { filter: "saturate(1.35) contrast(1.06) brightness(1.04)" };
const Sticker: React.FC<{ s: string; x: number; y: number; at?: number; rot?: number; size?: number; color?: string; bg?: string }> = ({ s, x, y, at = 0, rot = -0.06, size = 64, color = PAL.ink, bg = "#F7D84A" }) => (
  <CanvasArt draw={(g, t) => { const k = back((t - at) / 0.3); if (k <= 0) return; g.save(); g.translate(x, y); g.rotate(rot); g.scale(k, k);
    g.font = `900 ${size}px Montserrat`; const lines = s.split("\n"); const w = Math.max(...lines.map((l) => g.measureText(l).width)) + 70; const h = lines.length * size * 1.15 + 50;
    g.shadowColor = "rgba(60,36,12,0.35)"; g.shadowBlur = 16; g.shadowOffsetX = 8; g.shadowOffsetY = 12; cut(g, rrectP(-w / 2, -h / 2, w, h, 14), bg, { seed: Math.round(x + y), edge: 2.5, tear: 0.6 }); g.shadowColor = "transparent";
    lines.forEach((l, i) => inkText(g, l, 0, -h / 2 + 25 + size * 0.6 + i * size * 1.15, size, color)); g.restore(); }} />
);
const caesar = { seed: 31, hat: "laurel" as const, toga: true, tunic: "#F2EEE4", skin: "#E3B98E", hair: "#4A3A2A" };
const legio = (seed: number) => ({ seed, hat: "galea" as const, armor: true, tunic: "#C8352B", skin: "#C99B72" });
const bagPose = (p: Pose): Pose => ({ bag: true, talk: 0, ...p });

export const Ep01: React.FC = () => (
  <AbsoluteFill style={{ background: "#FFD43B", ...VIV }}>
    <Audio src={staticFile("ep01/voice.mp3")} />
    {/* 1. ЗАКАЗ: экран приложения, палец над кнопкой */}
    <Sequence {...shot(0)}>
      <CanvasArt draw={(g, t) => { g.save(); const z = 1 + t * 0.012; g.translate(540, 960); g.scale(z, z); g.translate(-540, -960); appScreen(g, t, { finger: eo(t / 0.6) }); g.restore(); }} />
      <Sticker s="ЛОГИЧНО." x={820} y={1080} at={wt(0, 10) - 0.05} rot={0.1} size={50} />
    </Sequence>
    {/* 2–3. ПРИНЯТЬ → экран рвётся → Рим, Сёма падает (ХРУСТЬ!) */}
    <Sequence {...shot(1, 3)}>
      <Portal at={0.8} before={<CanvasArt draw={(g, t) => appScreen(g, t, { press: keys(t, [[0.25, 0], [0.45, 1]]) })} />}
        after={<EraBackground place="city" t0={-0.8} pop={0} cam={[[0, 0, 0, 1.0], [2.5, 0, -30, 1.05]]} shake={Camera.shake(1.45, 18)} fg={false}>
          <Extra spec={{ seed: 21, hat: "none", hair: "#2A1E16", tunic: "#E07B39", skin: "#D9AE86" }} x={170} y={1560} s={3.9} z={6} pose={(t) => ({ emo: t > 1.5 ? "shock" : "calm", look: [1, 0], aR: t > 1.5 ? [1.9, 0.3] : [0.1, 0.1] })} />
          <Extra spec={{ seed: 22, hat: "hood", cloak: "#4E8FD0", tunic: "#4E8FD0", skin: "#C99B72", beard: "#5A4030" }} x={910} y={1560} s={3.9} z={6} pose={(t) => ({ emo: t > 1.5 ? "disgust" : "calm", look: [-1, 0], facing: -1 })} />
          <Sema outfit="casual" x={540} s={4.5} y={1580} pose={(t) => bagPose({ emo: t > 1.5 ? "shock" : "fear", aL: [2.6, 0.4], aR: [2.6, 0.4], tilt: t < 1.4 ? Math.sin(t * 20) * 0.3 : 0, squash: keys(t, [[1.4, 0], [1.48, 1.6], [1.75, 0]], back), t })}
            dy={(t) => keys(t, [[0.8, -1700], [1.42, 0]], (u) => u * u)} />
        </EraBackground>} />
      <Sequence from={f(1.5)}><Marks kind="crack" label="ХРУСТЬ!" x={760} y={760} s={0.85} /></Sequence>
      <Sequence from={f(1.8)}><Tag big x={760} lines={["44 Г. ДО Н.Э.", "РИМ"]} /></Sequence>
      <Sequence from={f(2.1)}><FactCallout text={"В ПУТИ:\n1 ДЕНЬ"} x={250} y={330} to={[440, 760]} /></Sequence>
    </Sequence>
    {/* 4. МИЛЛИОН: толпа, Сёму зажали */}
    <Sequence {...shot(3)}>
      <Stage cam={[[0, 0, -60, 1.12], [3, 0, 0, 1.0]]} bg="#CDEFF7" light="day" rays={0.3}>
        <Plane z={14} draw={(g) => { cut(g, rectP(-400, -400, 1880, 1500), "#9FD3EE", { tear: 0, noEdge: true, sort: "water" }); }} shadow={0} />
        <Plane z={9} draw={crowd(3, 4)} dyn />
        <Sema outfit="casual" x={540} s={4.4} y={1640} z={5} pose={(t) => bagPose({ emo: "fear", squash: 0.5 + Math.sin(t * 8) * 0.2, aL: [0.2, 0.2], aR: [0.2, 0.2], t })} />
        <Plane z={3.2} draw={crowd(1, 9)} dyn y={420} />
      </Stage>
      <Sticker s={"≈ 1 000 000"} x={540} y={330} at={0.3} size={90} />
      <Sticker s={"БОЛЬШЕ,\nЧЕМ В САМАРЕ"} x={760} y={560} at={wt(3, 4) - 0.1} rot={0.08} size={42} bg="#FBF7EC" />
    </Sequence>
    {/* 5. ИНСУЛА в разрезе, проезд снизу вверх по ценникам */}
    <Sequence {...shot(4)}>
      <Stage cam={[[0, -40, 260, 1.15], [3.6, -40, -260, 1.15]]} bg="#CDEFF7" rays={0.25}>
        <Plane z={14} draw={(g) => cut(g, rectP(-400, -600, 1880, 3000), "#BFE6F5", { tear: 0, noEdge: true, sort: "water" })} shadow={0} />
        <Plane z={5} draw={insula(0)} dyn />
      </Stage>
      <Sticker s="ИНСУЛА" x={300} y={300} at={0.6} />
    </Sequence>
    {/* 6. ВЕРХНИЕ ЭТАЖИ ГОРЯТ — Сёма выбегает с коробом */}
    <Sequence {...shot(5)}>
      <Stage cam={[[0, 0, 0, 0.9], [2.4, 0, 0, 0.95]]} bg="#FFE29A" light="gold" shake={Camera.shake(0.3, 10, 1.5)}>
        <Plane z={14} draw={(g) => cut(g, rectP(-400, -600, 1880, 3000), "#FFD08A", { tear: 0, noEdge: true, sort: "water" })} shadow={0} />
        <Plane z={6} draw={insula(1)} dyn y={-60} />
        <Plane z={5} draw={(g) => cut(g, rectP(-400, 1450, 1880, 900), "#D9C08E", { sort: "kraft", tear: 1 })} />
        <Sema outfit="casual" s={4.6} y={1700} z={4.6} pose={(t) => bagPose({ emo: "fear", aL: [2.4, 0.6], aR: [2.4, 0.6], step: t * 3, t, lean: 0.12 })} dy={() => 0} />
      </Stage>
      <Marks kind="bang" x={300} y={900} at={0.4} />
    </Sequence>
    {/* 7. ОБЩИЙ ТУАЛЕТ: сидят в ряд, Сёме противно */}
    <Sequence {...shot(6)}>
      <Stage cam={Camera.pan(0, 3.6, 120, 1.04)} bg="#E3D3B4" light="indoor">
        <Plane z={9} draw={latrineWall} shadow={0} />
        <Extra spec={{ seed: 41, hat: "none", hair: "#2A1E16", tunic: "#E07B39" }} x={170} y={1330} s={3.6} z={5.6} pose={(t) => ({ emo: "calm", look: [1, 0], talk: Math.abs(Math.sin(t * 9)) * 0.5 })} />
        <Extra spec={{ seed: 42, hat: "none", hair: "#5A4030", tunic: "#4E8FD0", beard: "#5A4030" }} x={380} y={1330} s={3.6} z={5.6} pose={() => ({ emo: "smile", look: [-1, 0] })} />
        <Extra spec={{ seed: 43, hat: "none", bald: true, tunic: "#7DB848" }} x={900} y={1330} s={3.6} z={5.6} pose={() => ({ emo: "calm", look: [-1, 0] })} />
        <Sema outfit="casual" x={640} y={1330} s={3.7} z={5.5} pose={(t) => bagPose({ emo: e([[0, "shock"], [1.2, "disgust"]])(t), aL: [0.3, 1.6], aR: [0.3, 1.6], t, squash: 0.3 })} />
        <Plane z={5.2} draw={latrineBench} />
      </Stage>
      <Sticker s={"20\nМЕСТ"} x={860} y={330} at={wt(6, 3) - 0.1} rot={0.08} />
    </Sequence>
    {/* 8. КРУПНО: губка на палке, «я дурак» */}
    <Sequence {...shot(7)}>
      <Stage cam={Camera.push(0, 3.5, 0.08)} bg="#BFE6F5">
        <Plane z={9} draw={(g) => cut(g, rectP(-400, -600, 1880, 3000), "#8FD3F4", { tear: 0, noEdge: true, sort: "water" })} shadow={0} />
        <Sema outfit="casual" s={7.6} y={2350} x={300} z={5.4} pose={(t) => bagPose({ emo: e([[0, "shock"], [1.6, "facepalm"]])(t), aR: t > 1.6 ? [2.6, 1.9] : [0.4, 0.3], t })} />
        <Plane z={4.6} dyn draw={(g, t) => { g.save(); g.translate(760, 950 + Math.sin(t * 3) * 10); g.rotate(-0.25 + Math.sin(t * 2) * 0.05); spongeStick(g, 3.2); g.restore(); }} />
      </Stage>
      <Sticker s="ТЕРСОРИУМ" x={720} y={300} at={0.3} size={56} />
      <Sticker s={"ОДНА\nНА ВСЕХ"} x={300} y={560} at={wt(7, 6) - 0.1} rot={-0.1} size={48} bg="#FBF7EC" color={PAL.scarf} />
    </Sequence>
    {/* 9. ГАРУМ: рынок, амфора, волны вони */}
    <Sequence {...shot(8)}>
      <EraBackground place="city" tod="gold" cam={Camera.push(0, 4.5, 0.05)} fg={false}>
        <Plane z={5.6} draw={stall} />
        <Extra spec={{ seed: 51, hat: "cap", tunic: "#B9A27A", beard: "#3A2A1E" }} x={720} y={1460} s={3.4} z={5.5} pose={(t) => ({ emo: "smile", aR: [1.8, 0.6], look: [-1, 0], talk: Math.abs(Math.sin(t * 10)) * 0.4 })} />
        <Plane z={5} dyn draw={amphora(1)} />
        <Sema outfit="casual" x={180} y={1640} s={4.5} z={4.8} pose={(t) => bagPose({ emo: t > wt(8, 5) ? "disgust" : "curious", lean: t > wt(8, 5) ? -0.22 : 0, look: [1, -0.4], t })} />
      </EraBackground>
      <Sticker s="ГАРУМ" x={420} y={330} at={0.4} />
      <Sticker s={"ТУХНЕТ\nНЕДЕЛЯМИ"} x={800} y={560} at={wt(8, 6)} rot={0.1} size={44} bg="#C8E6A0" />
    </Sequence>
    {/* 10. Термокороб: шаурма им зайдёт (искры гордости) */}
    <Sequence {...shot(9)}>
      <EraBackground place="city" tod="gold" cam={Camera.push(0, 2.4, 0.07, 0, -60)} fg={false}>
        <Sema outfit="casual" s={7.4} y={2280} x={540} pose={(t) => bagPose({ emo: e([[0, "curious"], [0.9, "proud"]])(t), aR: [2.2, 1.2], look: [1, -0.6], t })} />
      </EraBackground>
      <Marks kind="sparkle" x={760} y={420} at={0.9} />
    </Sequence>
    {/* 11. КАЛЕНДАРЬ: листы с разными датами, «не понять» */}
    <Sequence {...shot(10)}>
      <AbsoluteFill style={{ background: "#FFE29A" }} />
      <CanvasArt draw={(g, t) => { const dates = ["КАЛЕНДЫ", "НОНЫ", "ИДЫ", "XIV", "МЕРКЕДОНИЙ", "III", "?!"]; g.save(); g.translate(540, 760); g.rotate(-0.04); g.scale(1.6, 1.6);
        cut(g, rectP(-200, -250, 400, 500), "#FBF7EC", { seed: 40, edge: 2.5, tear: 0.4 }); cut(g, rectP(-200, -250, 400, 110), PAL.scarf, { seed: 41, edge: 1.5, sort: "felt" });
        inkText(g, "МАРТ?", 0, -195, 40, "#FBF7EC"); const i = Math.floor(t * 5) % dates.length; const d = dates[i]; inkText(g, d, 0, 40, d.length > 4 ? 64 : 140, PAL.ink);
        const u = (t * 5) % 1; g.save(); g.translate(u * 300, -140 + u * 360); g.rotate(u * 1.2); g.globalAlpha = 1 - u; cut(g, rectP(-200, 0, 400, 390), "#FBF7EC", { seed: 42 + i, edge: 2 }); g.restore(); g.restore(); }} />
      <Sticker s={"КАЛЕНДАРЬ:\nНЕ ПОНЯТЬ"} x={540} y={300} at={0.8} rot={0.05} size={52} />
    </Sequence>
    {/* 12. БЛОКНОТ: доставить 15 марта, сроки горят */}
    <Sequence {...shot(11)}>
      <EraBackground place="city" cam={[[0, 0, 0, 1.08]]} fg={false}><Sema outfit="casual" pose={(t) => bagPose({ emo: t > wt(11, 9) ? "fear" : "resolve", t })} /></EraBackground>
      <SurvivalNotebook title="ЗАКАЗ СЁМЫ" rewriteAt={wt(11, 9) - 0.6} rows={[{ label: "Доставка", from: "?", to: "15 марта" }, { label: "Осталось", from: "2 дня", to: "1 день" }, { label: "Шанс успеть", from: "90%", to: "60%" }]} />
    </Sequence>
    {/* 13. ЛЕГИОНЕРЫ: «Я вообще-то курьер» — «Новобранец? Отлично.» */}
    <Sequence {...shot(12)}>
      <EraBackground place="camp" cam={[[0, 0, 0, 1.0], [wt(12, 6), 0, -40, 1.08], [wt(12, 13), 0, -60, 1.14]]} fg>
        <Extra spec={legio(61)} x={250} y={1560} s={4.3} z={5.3} pose={(t) => ({ emo: t > wt(12, 13) ? "calm" : t > wt(12, 9) ? "smile" : "calm", look: [1, 0], aR: t > wt(12, 9) ? [1.6, 0.9] : [0.2, 0.2], talk: speak(t, [[wt(12, 9), wt(12, 11)], [wt(12, 13), 9.5]]) })} />
        <Extra spec={legio(62)} x={930} y={1540} s={3.9} z={5.6} pose={() => ({ emo: "calm", look: [-1, 0], facing: -1 })} />
        <Sema outfit="casual" x={640} s={4.5} y={1580} pose={(t) => bagPose({ emo: step<Emo>(t, [[0, "curious"], [wt(12, 6), "resolve"], [wt(12, 9), "shock"], [wt(12, 11), "resolve"], [wt(12, 13), "facepalm"]]), look: [-1, 0], t,
          aR: t > wt(12, 13) ? [2.6, 1.9] : [0.4, 0.3], holdL: t > wt(12, 9) ? shieldProp : undefined, aL: t > wt(12, 9) ? [0.9, 0.7] : [0.2, 0.2], talk: speak(t, [[wt(12, 6), wt(12, 9)], [wt(12, 11), wt(12, 13)]]) })} />
      </EraBackground>
      <Sequence from={f(wt(12, 9))}><Marks kind="bang" x={640} y={520} /></Sequence>
      <Sticker s={"НОВОБРАНЕЦ-\nКУРЬЕР"} x={540} y={330} at={wt(12, 14)} rot={-0.05} size={56} bg={PAL.scarf} color="#FBF7EC" />
    </Sequence>
    {/* 14. МАРШ: 30 км в день, 30 кг — Сёму сплющило */}
    <Sequence {...shot(13)}>
      <EraBackground place="field" tod="gold" cam={Camera.pan(0, 4, 160, 1.12)} fg>
        <Extra spec={legio(63)} x={160} y={1560} s={4} z={5.6} pose={(t) => ({ emo: "calm", step: t * 4, t, look: [1, 0] })} />
        <Extra spec={legio(64)} x={920} y={1560} s={4} z={5.6} pose={(t) => ({ emo: "tired", step: t * 4 + 1, t, look: [1, 0] })} />
        <Sema outfit="legion" s={4.8} y={1640} pose={(t) => bagPose({ emo: "tired", squash: 1.2 + Math.sin(t * 6) * 0.2, step: t * 4, lean: 0.08, aL: [0.3, 0.2], aR: [0.3, 0.2], t })} />
      </EraBackground>
      <Marks kind="sweat" x={620} y={600} at={0.3} />
      <Sticker s="30 КМ / ДЕНЬ" x={540} y={290} at={0.3} size={58} bg="#2E3A57" color="#FBF7EC" />
      <Sequence from={f(wt(13, 6) - 0.2)}><FactCallout text={"30 КГ"} x={830} y={540} to={[640, 900]} w={280} rot={0.06} /></Sequence>
    </Sequence>
    {/* 15. ЗАТО через легион — к Цезарю (вдали трибуна) */}
    <Sequence {...shot(14)}>
      <EraBackground place="city" cam={Camera.push(0, 2.4, 0.1, 140, -40)} fg={false}>
        <Plane z={9} draw={rostra} />
        <Extra spec={caesar} x={540} y={1100} s={2} z={9} pose={() => ({ emo: "proud", aR: [2.5, 0.4] })} />
        <Extra spec={legio(65)} x={250} y={1580} s={4.2} z={5.2} pose={(t) => ({ emo: "calm", step: t * 4, t })} />
        <Sema outfit="legion" x={600} s={4.5} y={1600} pose={(t) => bagPose({ emo: "smile", step: t * 4, look: [1, -1], t })} />
      </EraBackground>
      <Marks kind="sparkle" x={540} y={760} at={0.7} s={0.7} />
    </Sequence>
    {/* 16. ЦЕЗАРЬ на трибуне в венке */}
    <Sequence {...shot(15)}>
      <EraBackground place="city" tod="day" cam={[[0, 0, 0, 1.0], [2.8, 0, -120, 1.12]]} fg={false}>
        <Plane z={6} draw={rostra} y={180} />
        <Extra spec={caesar} x={540} y={1300} s={4.6} z={5.4} pose={(t) => ({ emo: "proud", aR: [2.6, 0.5], aL: [0.3, 0.3], talk: Math.abs(Math.sin(t * 8)) * 0.6 })} />
        <Plane z={3.4} draw={crowd(1, 17)} dyn y={520} />
      </EraBackground>
    </Sequence>
    {/* 17. Ветер сдувает венок → лысина, «ДЗЫНЬ!» */}
    <Sequence {...shot(16)}>
      <EraBackground place="city" cam={[[0, 0, -320, 1.5]]} fg={false} shake={Camera.shake(0.25, 8)}>
        <Extra spec={{ ...caesar, hat: "none", bald: true }} x={540} y={1300} s={4.6} z={5.4} pose={(t) => ({ emo: t > 0.5 ? "shock" : "proud", aR: [2.6, 0.5], wind: 1 })} />
      </EraBackground>
      <CanvasArt draw={(g, t) => laurelFly(g, 540 + t * 900, 520 - t * 500, t * 4)} />
      <Sequence from={f(0.3)}><Marks kind="crack" label="ДЗЫНЬ!" x={760} y={330} s={0.8} /></Sequence>
    </Sequence>
    {/* 18. 15 МАРТА: карта к Сенату */}
    <Sequence {...shot(17)}>
      <AbsoluteFill style={{ background: "#FFE29A" }} />
      <MapCard title="Рим" route={[[300, 1180], [380, 1060], [470, 1010], [560, 900], [650, 830], [720, 700]]} places={[{ p: [300, 1180], name: "Форум" }, { p: [740, 640], name: "Сенат" }]} />
      <Tag big x={830} lines={["15 МАРТА", "44 Г. ДО Н.Э."]} />
      <Sticker s="ОСТАЛОСЬ 200 М" x={540} y={1500} at={1.2} size={50} bg="#3DBE5A" color="#FFFFFF" />
    </Sequence>
    {/* 19. ГАДАТЕЛЬ кричит, Сёма отмахивается */}
    <Sequence {...shot(18)}>
      <EraBackground place="city" tod="gold" cam={[[0, 0, 0, 1.05], [wt(18, 2), 0, -40, 1.18], [wt(18, 5), 120, -40, 1.12]]} shake={Camera.shake(wt(18, 2), 14, 0.8)} fg={false}>
        <Extra spec={{ seed: 71, hat: "hood", cloak: "#6E4E8E", tunic: "#6E4E8E", skin: "#C99B72", beard: "#DDD6C8" }} x={300} y={1580} s={4.5} z={5.2} pose={(t) => ({ emo: t > wt(18, 2) ? "shock" : "fear", aR: [1.4, 0.2], aL: t > wt(18, 2) ? [2.7, 0.6] : [0.5, 0.4], look: [1, 0], talk: speak(t, [[wt(18, 2), wt(18, 5)]]) })} />
        <Sema outfit="casual" x={720} s={4.5} y={1580} pose={(t) => bagPose({ emo: t > wt(18, 5) ? "resolve" : "shock", look: [-1, 0], t, aL: t > wt(18, 5) ? [1.8, 1.2] : [0.3, 0.2], talk: speak(t, [[wt(18, 5), 6]]) })} />
      </EraBackground>
      <Sequence from={f(wt(18, 2))}><Marks kind="bang" x={300} y={560} /></Sequence>
      <Sticker s="ДЕДЛАЙН" x={760} y={330} at={wt(18, 9)} rot={0.08} bg={PAL.scarf} color="#FBF7EC" />
    </Sequence>
    {/* 20. СЕНАТ: Сёма догоняет Цезаря у дверей — ДОСТАВЛЕНО */}
    <Sequence {...shot(19)}>
      <Stage cam={[[0, 0, 0, 1.0], [1.5, 0, -40, 1.06]]} bg="#CDEFF7" light="day">
        <Plane z={14} draw={(g) => cut(g, rectP(-400, -600, 1880, 3000), "#9FD3EE", { tear: 0, noEdge: true, sort: "water" })} shadow={0} />
        <Plane z={7} draw={senate(0)} />
        <Extra spec={caesar} x={300} y={1560} s={3.9} z={5.6} pose={() => ({ emo: "curious", look: [1, 0], facing: 1 })} />
        <Sema outfit="casual" x={760} s={4.6} y={1700} z={5} pose={(t) => bagPose({ emo: "resolve", step: t * 6, lean: -0.15, aL: [2.2, 0.8], look: [-1, 0], t })} dy={() => 0} />
      </Stage>
      <Sticker s="ДОСТАВЛЕНО!" x={540} y={320} at={0.7} size={64} bg="#3DBE5A" color="#FFFFFF" />
    </Sequence>
    {/* 21. Цезарь пробует шаурму — ★★★★★ */}
    <Sequence {...shot(20)}>
      <EraBackground place="city" tod="gold" cam={Camera.push(0, 3, 0.05)} fg={false}>
        <Extra spec={caesar} x={340} y={1580} s={4.7} z={5} pose={(t) => ({ emo: t > wt(20, 3) ? "smile" : "curious", aR: [1.5 + Math.max(0, Math.sin(t * 5)) * 0.3, 1.4], holdR: shawarma, look: [1, 0], talk: Math.abs(Math.sin(t * 12)) * 0.5 })} />
        <Sema outfit="casual" x={770} s={4.4} y={1580} pose={(t) => bagPose({ emo: t > wt(20, 3) ? "proud" : "curious", aR: t > wt(20, 3) ? [2.3, 0.3] : [0.3, 0.3], look: [-1, 0], t })} />
      </EraBackground>
      <CanvasArt draw={(g, t) => { const k = back((t - wt(20, 3) + 0.2) / 0.35); if (k <= 0) return; g.save(); g.translate(540, 330); g.rotate(-0.04); g.scale(k, k); cut(g, rrectP(-380, -90, 760, 180, 30), "#FFFFFF", { seed: 960, edge: 3, tear: 0.5 }); stars(g, -280, -10, Math.min(5, Math.floor((t - wt(20, 3) + 0.2) * 10)), 56, 140, 961); text(g, "чаевые: 1 денарий", 0, 62, 34, "#8a8070", "Montserrat", 900); g.restore(); }} />
    </Sequence>
    {/* 22. «А это ваш фирменный… салат!» — «Мой… что?» */}
    <Sequence {...shot(21)}>
      <EraBackground place="city" tod="gold" cam={[[0, 0, 0, 1.05], [wt(21, 5), -120, -60, 1.18]]} fg={false}>
        <Extra spec={caesar} x={340} y={1580} s={4.7} z={5} pose={(t) => ({ emo: t > wt(21, 5) ? "shock" : "calm", look: [1, 0], talk: speak(t, [[wt(21, 5), wt(21, 5) + 0.5], [wt(21, 6), wt(21, 6) + 0.5]]) })} />
        <Sema outfit="casual" x={770} s={4.4} y={1580} pose={(t) => bagPose({ emo: "smile", aL: [1.6, 0.8], holdL: saladBox, look: [-1, 0], t, talk: speak(t, [[0, wt(21, 5) - 0.3]]) })} />
      </EraBackground>
      <CanvasArt draw={(g, t) => { const k = back((t - wt(21, 5)) / 0.3); if (k <= 0) return; g.save(); g.translate(330, 420); g.rotate(0.12); g.scale(k, k); text(g, "?", 0, 0, 240, PAL.scarf, "Caveat", 700); g.restore(); }} />
    </Sequence>
    {/* 23. Двери Сената закрываются — БУМ. Тени. */}
    <Sequence {...shot(22)}>
      <Stage cam={[[0, 0, 0, 1.0], [3, 0, -60, 1.1]]} bg="#6E6AA8" light="dusk" shake={Camera.shake(1.3, 16)}>
        <Plane z={14} draw={(g) => cut(g, rectP(-400, -600, 1880, 3000), "#8C86C0", { tear: 0, noEdge: true, sort: "water" })} shadow={0} />
        <Plane z={7} dyn draw={(g, t) => senate(keys(t, [[0.2, 0], [1.3, 1]], (u) => u * u), keys(t, [[0, 0], [0.6, 1]]))(g)} />
        <Sema outfit="casual" s={4.6} y={1720} z={4.8} pose={(t) => bagPose({ emo: t > 1.4 ? "shock" : "calm", look: t > 1.6 ? [0, 0] : [0, -1], t })} />
      </Stage>
      <Sequence from={f(1.3)}><Marks kind="crack" label="БУМ" x={540} y={420} s={0.9} /></Sequence>
    </Sequence>
    {/* 24. Салат достаётся голубю */}
    <Sequence {...shot(23)}>
      <Stage cam={Camera.push(0, 2, 0.06, 0, 80)} bg="#F09A78" light="dusk">
        <Plane z={9} draw={senate(1)} y={-200} />
        <Sema outfit="casual" x={820} s={4.2} y={1560} z={5.4} pose={(t) => bagPose({ emo: "tired", look: [-1, 1], t })} />
        <Plane z={4.6} draw={saladFloor} />
        <Plane z={4.6} dyn draw={pigeon} />
      </Stage>
    </Sequence>
    {/* 25. ФИНАЛ: новый заказ, адрес ??? — один вопрос */}
    <Sequence {...shot(24, 25)}>
      <CanvasArt draw={(g, t) => appScreen(g, t, { rows: [["???", "× 1"]], addr: "???", date: "", unknown: true, finger: 0 })} />
      <Sticker s={"КУДА ВЕЗТИ?\nПИШИ В КОММЕНТЫ!"} x={540} y={1720} at={0.9} rot={-0.04} size={52} bg={PAL.scarf} color="#FBF7EC" />
    </Sequence>
    <Subtitles words={W} keywords={["ЦЕЗАРЬ", "РИМ", "МИЛЛИОН", "ДЕШЕВЛЕ", "ГОРЯТ", "ОБЩИЙ", "ГУБКА", "ГАРУМ", "ЗАЙДЁТ", "КАЛЕНДАРЬ", "ПЯТНАДЦАТОГО", "КУРЬЕР", "НОВОБРАНЕЦ", "ТРИДЦАТЬ", "ЛЕГИОН", "ЛЫСИНУ", "СЕНАТУ", "БЕРЕГИСЬ", "ДЕДЛАЙН", "ПОСЛЕДНИЙ", "ПЯТЬ", "ЧТО", "ПОЕСТЬ", "ГОЛУБЮ", "КОММЕНТАХ"]} />
  </AbsoluteFill>
);
