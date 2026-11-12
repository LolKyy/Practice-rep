// РАСКАДРОВКА v2 «Что будет в день выхода GTA 6»: новые детальные локации, всё в фокусе, твист не раскрыт заранее.
import React from "react";
import words from "./words.json";
import { setData, wt, ps, TOTAL } from "./timeline.js";
setData(words);
import { Scene3D, Doodle, Actor, Box, Sign, Screen, crowd, armsUp, padHands, pointKeys, HIP, HEAD_Z, CamKey, V3, fitText } from "./kit";
import { NewsStudio, SynthSunset, QuestionCard, Smoke, Confetti, drawBg, rr, PINK, CYAN, YEL, RED, INK } from "./sets";
import { titleDraw, loadDraw, viceDraw, mapDraw, paperDraw, vacDraw, pcDraw, PaperSet, PcRoom, OfficeDoor, Cat } from "./sets2";
import { Apartment, City, Cockpit, TrainFront, Clinic2, Shop2, Store2, Kitchen2, Stage2, Chips, SixPack, Console } from "./sets3";
import { boardDraw } from "./sets2";
import type { Look } from "./doodle";

export type Shot = { t0: number; t1: number; el: React.ReactNode; tr?: "fade" | "cut" | "flash" };

// ---------------------------------------------------------------- персонажи
const HERO: Look = { body: "#3fb27f", hair: "bowl", pad: true };
const HERO_NOPAD: Look = { body: "#3fb27f", hair: "bowl" };
const CEO: Look = { body: "#2a2a3a", hair: "bald", hairCol: "#8a8580", tie: "#2f6fd6", glasses: true };
const GIRL: Look = { body: "#ff5fa2", hair: "long" };
const DOCTOR: Look = { body: "#f4f4f4", hair: "bun", glasses: true };
const PCBOY: Look = { body: "#1a1a2a", hair: "spiky", glasses: true };
const MAN40: Look = { body: "#7a5a3a", hair: "bald", hairCol: "#3a2a1a", wrinkles: true };
const BOSS: Look = { body: "#26263a", hair: "slick", tie: "#e64b4b", glasses: true };
const ANCHOR: Look = { body: "#2f6fd6", hair: "slick", tie: "#f2c230" };
const hero = (pos: V3, expr: [number, string][], extra: Partial<Actor> = {}, look: Look = HERO): Actor => ({ pos, seed: 1, look, expr, ...(look.pad ? padHands : {}), scale: 1.15, ...extra });

// ---------------------------------------------------------------- времена
const W = (p: number, s: string, o = 0) => wt(p, s, o);
const t = {
  p1and: W(1, "и"), p1pause: W(1, "паузу"),
  p2console: W(2, "приставка"), p2chips: W(2, "чипсы"), p2every: W(2, "каждый"), p2young: W(2, "среди"),
  p3many: W(3, "многие"), p3po: W(3, "по"), p3off: W(3, "официальное"),
  p4you: W(4, "ты"), p4kha: W(4, "кха"), p4flu: W(4, "грипп"),
  p5sym: W(5, "симптомы"), p5shake: W(5, "трясущиеся"), p5steal: W(5, "угнать"),
  p6man: W(6, "мужик"), p6son: W(6, "сына"), p6noson: W(6, "сына", 1),
  p7watch: W(7, "смотрят"), p7date: W(7, "даты"),
  p8pilots: W(8, "пилоты"), p8trains: W(8, "поезда"), p8streets: W(8, "улицы"), p8door: W(8, "на"), p8closed: W(8, "закрыто"),
  p9mid: W(9, "полночь"), p9req: W(9, "требуется"), p9one: W(9, "один"), p9thirty: W(9, "тридцать"), p9ninety: W(9, "девяносто"),
  p10kettle: W(10, "чайник"), p10cat: W(10, "кот"), p10vice: W(10, "вот"), p10nosleep: W(10, "ты"),
  p11counter: W(11, "на"), p11turn: W(11, "оборачивается"), p11boss: W(11, "твой"), p11also: W(11, "тоже"), p11nod: W(11, "молча"),
};
const P = [0, ...Array.from({ length: 12 }, (_, i) => ps(i + 1))];
const END = TOTAL;
const cam = (...k: CamKey[]) => k;
const S = (t0: number, t1: number, el: React.ReactNode, tr?: Shot["tr"]): Shot => ({ t0, t1, el, tr });

// ---------------------------------------------------------------- мелочи
function Phone({ p, draw, scale = 1, rot = [0, 0, 0] }: { p: V3; draw: (g: CanvasRenderingContext2D, s: number, W: number, H: number) => void; scale?: number; rot?: V3 }) {
  return (<group position={p} scale={scale} rotation={rot}>
    <Box p={[0, 0, 0]} s={[0.4, 0.78, 0.05]} c="#1a1a22" r={0.3} />
    <Screen p={[0, 0, 0.027]} w={0.36} h={0.72} res={600} draw={draw} />
  </group>);
}
const callDraw = (name: string) => (g: CanvasRenderingContext2D, s: number, W: number, H: number) => {
  drawBg(g, W, H, "#0e2a1a", "#16603a"); g.fillStyle = "#fff"; g.beginPath(); g.arc(W / 2, H * 0.3, W * 0.2, 0, 7); g.fill();
  fitText(g, "👔", W / 2, H * 0.3, W * 0.3, W * 0.25, INK); fitText(g, name, W / 2, H * 0.55, W * 0.85, H * 0.07, "#fff");
  fitText(g, `00:0${Math.floor(s % 10)}`, W / 2, H * 0.63, W * 0.4, H * 0.05, "#bfe"); g.fillStyle = RED; g.beginPath(); g.arc(W / 2, H * 0.85, W * 0.12, 0, 7); g.fill();
};
const streamDraw = (g: CanvasRenderingContext2D, s: number, W: number, H: number) => {
  viceDraw(g, s, W, H * 0.45); g.fillStyle = "#111"; g.fillRect(0, H * 0.45, W, H * 0.55); g.fillStyle = RED; rr(g, W * 0.05, H * 0.48, W * 0.3, H * 0.06, 8); g.fill();
  fitText(g, "● LIVE", W * 0.2, H * 0.51, W * 0.25, H * 0.04, "#fff"); fitText(g, "👁 2 400 000", W * 0.65, H * 0.51, W * 0.5, H * 0.04, "#fff");
  for (let i = 0; i < 6; i++) { const y = H * 0.6 + i * H * 0.065 - ((s * 40) % (H * 0.065)); fitText(g, ["😭😭😭", "где пк версия", "ПК-бояре плачут", "Rockstar 🤡", "смотрю со стрима", "дайте ПК"][(i + Math.floor(s * 3)) % 6], W / 2, y, W * 0.9, H * 0.035, "#ddd"); }
};
const BILLBOARD = (draw: (g: CanvasRenderingContext2D, s: number, W: number, H: number) => void) => (<group position={[-0.4, 6.4, -6.0]}>
  <Box p={[0, 0, 0]} s={[3.8, 2.2, 0.15]} c="#1a1020" /><Screen p={[0, 0, 0.08]} w={3.6} h={2.0} res={900} draw={draw} />
  <Box p={[-1.2, -1.6, -0.1]} s={[0.12, 1.2, 0.12]} c="#333" /><Box p={[1.2, -1.6, -0.1]} s={[0.12, 1.2, 0.12]} c="#333" /></group>);
const CHIPS_COLS = [RED, YEL, "#3fb27f", CYAN, PINK, "#ff7a2f"];

// ================================================================= ШОТЫ
export const SHOTS: Shot[] = [
  // 1. Заставка GTA 6 во весь экран телевизора → отлёт в квартиру
  S(0, t.p1and, (
    <Scene3D t0={0} light="night" bg="#0b0f2a" focus={[1.0, 1.18, -1.85]}
      cam={cam([0, [1.0, 1.18, -1.15], [1.0, 1.18, -1.85], 50], [t.p1and, [0.5, 1.3, 1.0], [0.4, 1.1, -1.5], 58])}>
      <Apartment tv={titleDraw()} night clock={() => "23:58"} />
      <Doodle a={hero([-0.2, 0, -0.6], [[0, "hype"]])} />
    </Scene3D>), "cut"),
  // 2. Мир на паузе: улица, машины стоят, люди замерли, на билборде «⏸»
  S(t.p1and, P[2], (
    <Scene3D t0={t.p1and} light="day" bg="#5aa0e8" focus={[0, 1, -1]} shakes={[[t.p1pause, 0.6]]}
      cam={cam([t.p1and, [-2.0, 1.2, 4.2], [0, 2.6, -5], 58], [P[2], [-0.6, 1.5, 3.0], [-0.2, 3.0, -5], 58])}>
      <City />
      {BILLBOARD(titleDraw(t.p1pause - 0.1))}
      {crowd(9, -3, 3, -0.6, 1.4, 3, [[0, "blank"]]).map((a, i) => <Doodle key={i} a={{ ...a, hop: 0 }} />)}
    </Scene3D>)),

  // 3. Ночь: не спит, часы 03:12, свет от ТВ
  S(P[2], t.p2console, (
    <Scene3D t0={P[2]} light="night" bg="#0b0f2a" focus={[0, 1, -0.6]}
      cam={cam([P[2], [0.6, 1.4, 2.0], [0.2, 1.1, -1.2], 58], [t.p2console, [0.3, 1.3, 1.4], [0.1, 1.05, -1.0], 54])}>
      <Apartment tv={titleDraw()} night clock={() => "03:12"} />
      <Doodle a={hero([0.0, 0, -0.6], [[0, "hype"], [P[2] + 1, "nervous"]])} />
    </Scene3D>)),
  // 4. Приставка протёрта, геймпад заряжен — крупно приставка и геймпад, блеск
  S(t.p2console, t.p2chips, (
    <Scene3D t0={t.p2console} light="night" bg="#0b0f2a" focus={[0.3, 0.75, -1.62]}
      cam={cam([t.p2console, [0.2, 1.05, 0.3], [0.3, 0.8, -1.5], 52], [t.p2chips, [0.25, 1.0, 0.0], [0.3, 0.8, -1.5], 50])}>
      <Apartment tv={titleDraw()} night />
      <Confetti t0={t.p2console + 0.2} n={16} area={[0.1, 0.6, -1.65, -1.4]} />
      <Doodle a={hero([-0.35, 0, -1.25], [[0, "proud"]], { handB: [[0, 0.1, HIP + 0.16], [t.p2console + 0.3, 0.42, HIP + 0.3], [t.p2console + 0.6, 0.3, HIP + 0.32], [t.p2console + 0.9, 0.42, HIP + 0.3]] }, HERO_NOPAD)} />
    </Scene3D>)),
  // 5. Гора чипсов на диване, герой рядом целиком в кадре
  S(t.p2chips, t.p2every, (
    <Scene3D t0={t.p2chips} light="night" bg="#0b0f2a" focus={[-0.8, 0.8, -1.0]}
      cam={cam([t.p2chips, [-0.5, 1.2, 1.8], [-0.55, 0.9, -1.0], 56], [t.p2every, [-0.5, 1.15, 1.4], [-0.55, 0.9, -1.0], 54])}>
      <Apartment tv={titleDraw()} night />
      {Array.from({ length: 16 }, (_, i) => { const r = (k: number) => { const v = Math.sin((i + 1) * 77.7 * k) * 43758.5; return v - Math.floor(v); };
        return <Chips key={i} p={[-1.6 + (i % 6) * 0.25 + r(1) * 0.1, 0.62 + Math.floor(i / 6) * 0.22, -1.0 + r(2) * 0.2]} rot={[-0.3 + r(3) * 0.4, r(4) - 0.5, r(5) - 0.5]} col={CHIPS_COLS[i % 6]} scale={0.8} />; })}
      <Sign p={[-1.0, 1.55, -1.3]} w={0.9} h={0.28} text="НА НЕДЕЛЮ" bg="#fff" fg={INK} glow={0.4} />
      <Doodle a={hero([0.05, 0, -0.8], [[0, "proud"]])} />
    </Scene3D>)),
  // 6. Опрос: карта США на экране студии, без голов на переднем плане
  S(t.p2every, P[3], (
    <Scene3D t0={t.p2every} light="studio" bg="#0c1224" focus={[0, 1.75, -1.92]}
      cam={cam([t.p2every, [0, 1.6, 2.0], [0, 1.6, -1.92], 56], [P[3], [0, 1.6, 1.5], [0, 1.6, -1.92], 54])}>
      <NewsStudio screen={mapDraw(t.p2young)} ticker="ОПРОС: КАЖДЫЙ 5-Й ВОЗЬМЁТ ВЫХОДНОЙ 19 НОЯБРЯ  •  СРЕДИ МОЛОДЫХ — КАЖДЫЙ 3-Й  •  " />
    </Scene3D>)),

  // 7. Глава Take-Two на сцене (ничто не загораживает)
  S(P[3], t.p3many, (
    <Scene3D t0={P[3]} light="studio" bg="#0a0d18" focus={[0.3, 1.3, -0.8]}
      cam={cam([P[3], [-0.4, 1.6, 2.0], [0.25, 1.45, -1.0], 56], [t.p3many, [-0.1, 1.5, 1.4], [0.25, 1.4, -0.9], 52])}>
      <Stage2 screen={(g, s, W, H) => { drawBg(g, W, H, "#0e1a3a", "#1d3a7a"); fitText(g, "TAKE-TWO", W / 2, H * 0.36, W * 0.7, H * 0.25, "#fff"); fitText(g, "19.11 — GTA VI", W / 2, H * 0.66, W * 0.6, H * 0.12, CYAN); }} />
      <Doodle a={{ pos: [0.3, 0.3, -0.85], seed: 21, look: CEO, expr: [[0, "smug"]], scale: 1.2, talk: [[P[3] + 0.3, t.p3many]] }} />
    </Scene3D>)),
  // 8. «Многие возьмут больничный» — средний план, облачко в кадре
  S(t.p3many, t.p3po, (
    <Scene3D t0={t.p3many} light="studio" bg="#0a0d18" focus={[0.3, 1.3, -0.85]}
      cam={cam([t.p3many, [0.0, 1.45, 1.1], [0.15, 1.45, -0.85], 50], [t.p3po, [0.05, 1.45, 0.8], [0.15, 1.45, -0.85], 48])}>
      <Stage2 screen={(g, s, W, H) => { drawBg(g, W, H, "#0e1a3a", "#1d3a7a"); fitText(g, "TAKE-TWO", W / 2, H * 0.36, W * 0.7, H * 0.25, "#fff"); }} />
      <Doodle a={{ pos: [0.3, 0.3, -0.85], seed: 21, look: CEO, expr: [[0, "grin"], [t.p3many + 1.0, "proud"]], scale: 1.2, talk: [[t.p3many, t.p3po]], handF: pointKeys(t.p3many + 0.4, -0.3, 0.5, 1.2, "f") }} />
    </Scene3D>)),
  // 9. «Официальное разрешение» — бумага и печать
  S(t.p3po, P[4], (
    <Scene3D t0={t.p3po} light="office" bg="#3a2a24" focus={[0, 0, -0.6]} shakes={[[t.p3off, 0.8]]}
      cam={cam([t.p3po, [0, 1.25, 0.1], [0, 0, -0.6], 50], [P[4], [0, 1.05, -0.2], [0, 0, -0.6], 48])}>
      <PaperSet draw={paperDraw(t.p3off)} />
    </Scene3D>), "cut"),

  // 10. Девушка и календарь 19–27 крупно
  S(P[4], t.p4you, (
    <Scene3D t0={P[4]} light="day" bg="#cfe6ff" focus={[1.8, 1.3, -1.6]}
      cam={cam([P[4], [1.0, 1.35, 1.0], [1.85, 1.3, -1.9], 50], [t.p4you, [1.5, 1.35, 0.4], [1.95, 1.32, -1.9], 46])}>
      <Apartment tv={titleDraw()} cal={vacDraw} />
      <Doodle a={{ pos: [1.3, 0, -1.2], seed: 31, look: GIRL, expr: [[0, "proud"], [P[4] + 1.5, "grin"]], scale: 1.15, handB: pointKeys(P[4] + 1.0, 1.0, 1.0, 3, "b") }} />
    </Scene3D>)),
  // 11. 8:00 — звонок начальнику, телефон крупно
  S(t.p4you, t.p4kha, (
    <Scene3D t0={t.p4you} light="day" bg="#cfe6ff" focus={[-0.1, 1.0, -0.6]}
      cam={cam([t.p4you, [0.3, 1.15, 1.0], [0.0, 1.05, -0.7], 50], [t.p4kha, [0.15, 1.1, 0.6], [-0.05, 1.05, -0.7], 46])}>
      <Apartment tv={titleDraw()} clock={() => "08:00"} />
      <Doodle a={hero([-0.35, 0, -0.75], [[0, "nervous"]], { handB: [[0, 0.3, HEAD_Z - 0.05]] }, HERO_NOPAD)} />
      <Phone p={[0.18, 1.12, -0.45]} draw={callDraw("НАЧАЛЬНИК")} scale={0.75} rot={[0, -0.3, 0]} />
    </Scene3D>)),
  // 12. «Кха… у меня… GTA. То есть грипп!»
  S(t.p4kha, P[5], (
    <Scene3D t0={t.p4kha} light="day" bg="#cfe6ff" focus={[-0.35, 1.0, -0.75]} shakes={[[t.p4kha, 0.4], [t.p4flu, 0.7]]}
      cam={cam([t.p4kha, [-0.2, 1.05, 0.7], [-0.35, 1.0, -0.75], 44], [P[5], [-0.25, 1.03, 0.4], [-0.35, 1.0, -0.75], 40])}>
      <Apartment tv={titleDraw()} clock={() => "08:01"} />
      <Doodle a={hero([-0.35, 0, -0.75], [[0, "holdlaugh"], [t.p4flu, "nervous"]], { handB: [[0, 0.3, HEAD_Z - 0.05]], handF: [[0, -0.1, HEAD_Z - 0.15]], talk: [[t.p4kha, P[5]]] }, HERO_NOPAD)} />
    </Scene3D>)),

  // 13. Новости: «грипп GTA», ведущий сбоку, экран виден
  S(P[5], t.p5sym, (
    <Scene3D t0={P[5]} light="studio" bg="#0c1224" focus={[0, 1.6, -1.6]}
      cam={cam([P[5], [0.3, 1.8, 2.6], [0.2, 1.65, -1.6], 56], [t.p5sym, [0.3, 1.75, 1.8], [0.25, 1.65, -1.6], 54])}>
      <NewsStudio ticker="ВСПЫШКА «ГРИППА GTA» В БРИТАНИИ  •  ПОЛИКЛИНИКИ ПЕРЕПОЛНЕНЫ  •  " screen={(g, s, W, H) => { drawBg(g, W, H, "#0e1a3a", "#1d3a7a"); g.fillStyle = RED; g.fillRect(W * 0.42, H * 0.06, W * 0.36, H * 0.14); fitText(g, "LONDON", W * 0.6, H * 0.135, W * 0.3, H * 0.1, "#fff");
        fitText(g, "🤒", W * 0.68, H * 0.45, W * 0.3, H * 0.35, "#fff"); fitText(g, "«ГРИПП GTA»", W * 0.68, H * 0.82, W * 0.55, H * 0.16, YEL); }} />
      <Doodle a={{ pos: [-0.75, 0, -1.15], seed: 5, look: ANCHOR, expr: [[0, "stern"], [P[5] + 1.5, "realize"]], talk: [[P[5], t.p5sym]], scale: 1.2 }} />
    </Scene3D>)),
  // 14. Поликлиника: у всех трясутся руки, врач в шоке
  S(t.p5sym, P[6], (
    <Scene3D t0={t.p5sym} light="office" bg="#d8eee8" focus={[0, 1, -1]} shakes={[[t.p5steal, 0.6]]}
      cam={cam([t.p5sym, [-0.3, 1.45, 2.8], [-0.2, 1.2, -1.2], 60], [P[6], [-0.2, 1.4, 2.2], [-0.15, 1.2, -1.2], 58])}>
      <Clinic2 />
      {[-2.3, -1.6, -0.9].map((x, i) => <Doodle key={i} a={{ pos: [x, 0, -0.95 + (i % 2) * 0.15], seed: 40 + i, look: { body: ["#e64b4b", "#2f8fe0", "#b04fd6"][i], hair: (["spiky", "long", "slick"] as const)[i] },
        handF: [[0, -0.22, HIP + 0.35]], handB: [[0, 0.22, HIP + 0.35]], expr: [[0, "tired"], [t.p5steal, "smug"]], shiver: 2.5, scale: 1.05 }} />)}
      <Doodle a={{ pos: [1.1, 0, -0.45], seed: 47, look: DOCTOR, expr: [[0, "blank"], [t.p5shake, "shock"]], scale: 1.15 }} />
    </Scene3D>)),

  // 15. Приставки сметают с полок
  S(P[6], t.p6man, (
    <Scene3D t0={P[6]} light="office" bg="#eceaf4" focus={[0, 1.2, -1.5]}
      cam={cam([P[6], [1.0, 1.6, 2.5], [0, 1.2, -1.5], 58], [t.p6man, [0.4, 1.45, 1.8], [0, 1.2, -1.5], 54])}>
      <Shop2 />
      {crowd(6, -2.2, 2.0, -1.0, 0.0, 51, [[0, "angry"]]).map((a, i) => <Doodle key={i} a={{ ...a, ...armsUp(P[6] + i * 0.1, 9) }} />)}
    </Scene3D>)),
  // 16. Мужик 40 лет с PS5 под мышкой: «для сына»
  S(t.p6man, t.p6noson, (
    <Scene3D t0={t.p6man} light="office" bg="#eceaf4" focus={[0, 1.0, -0.8]}
      cam={cam([t.p6man, [0.2, 1.25, 1.5], [0, 1.15, -0.8], 52], [t.p6noson, [0.1, 1.2, 1.0], [0, 1.1, -0.8], 48])}>
      <Shop2 />
      <Doodle a={{ pos: [-0.1, 0, -0.8], seed: 55, look: MAN40, expr: [[0, "proud"], [t.p6son, "smug"]], scale: 1.2, handB: [[0, 0.3, HIP + 0.3]] }} />
      <group position={[0.38, 0.62, -0.68]} rotation={[0, -0.3, 0.1]}><Box p={[0, 0, 0]} s={[0.28, 0.36, 0.14]} c="#f4f4f8" /><Sign p={[0, 0.02, 0.071]} w={0.24} h={0.1} text="PS5" bg="#1a1a2a" fg="#fff" glow={0.4} /></group>
    </Scene3D>)),
  // 17. «Сына у него нет»
  S(t.p6noson, P[7], (
    <Scene3D t0={t.p6noson} light="office" bg="#eceaf4" focus={[-0.1, 1.0, -0.8]}
      cam={cam([t.p6noson, [-0.05, 1.08, 0.6], [-0.05, 1.0, -0.8], 44], [P[7], [-0.05, 1.06, 0.4], [-0.05, 1.0, -0.8], 42])}>
      <Shop2 />
      <Doodle a={{ pos: [-0.1, 0, -0.8], seed: 55, look: MAN40, expr: [[0, "smug"], [t.p6noson + 0.6, "holdlaugh"]], scale: 1.2, handB: [[0, 0.3, HIP + 0.3]] }} />
      <group position={[0.38, 0.62, -0.68]} rotation={[0, -0.3, 0.1]}><Box p={[0, 0, 0]} s={[0.28, 0.36, 0.14]} c="#f4f4f8" /></group>
    </Scene3D>)),

  // 18. ПК-бояре: RGB-комната, гордо стоит у компа
  S(P[7], t.p7watch, (
    <Scene3D t0={P[7]} light="neon" bg="#0a0814" focus={[-0.4, 1.0, -0.7]}
      cam={cam([P[7], [0.6, 1.3, 1.1], [-0.1, 1.1, -1.1], 54], [t.p7watch, [0.3, 1.25, 0.7], [-0.15, 1.1, -1.0], 50])}>
      <PcRoom mon={pcDraw(t.p7date)} />
      <Doodle a={{ pos: [-0.5, 0, -0.75], seed: 61, look: PCBOY, expr: [[0, "smug"]], scale: 1.15 }} />
    </Scene3D>)),
  // 19. …смотрит стрим с телефона и плачет
  S(t.p7watch, t.p7date, (
    <Scene3D t0={t.p7watch} light="neon" bg="#0a0814" focus={[-0.5, 1.0, -0.7]}
      cam={cam([t.p7watch, [-0.35, 1.1, 0.7], [-0.5, 1.0, -0.75], 46], [t.p7date, [-0.4, 1.05, 0.45], [-0.5, 1.0, -0.75], 42])}>
      <PcRoom mon={pcDraw(t.p7date)} />
      <Doodle a={{ pos: [-0.5, 0, -0.75], seed: 61, look: PCBOY, expr: [[0, "cry"]], scale: 1.15, handB: [[0, 0.25, HIP + 0.45]] }} />
      <Phone p={[-0.18, 0.95, -0.5]} draw={streamDraw} scale={0.55} />
    </Scene3D>)),
  // 20. «Даты на ПК нет»
  S(t.p7date, P[8], (
    <Scene3D t0={t.p7date} light="neon" bg="#0a0814" focus={[0.2, 1.3, -1.71]} shakes={[[t.p7date + 0.2, 0.8]]}
      cam={cam([t.p7date, [0.2, 1.3, 0.4], [0.2, 1.3, -1.71], 50], [P[8], [0.2, 1.3, 0.0], [0.2, 1.3, -1.71], 48])}>
      <PcRoom mon={pcDraw(t.p7date)} />
    </Scene3D>), "cut"),

  // 21. Кабина самолёта: пилот играет в GTA
  S(P[8], t.p8trains, (
    <Scene3D t0={P[8]} light="day" bg="#9fc8e8" focus={[-0.5, 1, -0.4]}
      cam={cam([P[8], [0.6, 1.6, 2.2], [-0.1, 1.4, -1.2], 58], [t.p8trains, [0.4, 1.5, 1.5], [-0.2, 1.35, -1.2], 54])}>
      <Cockpit />
      <Doodle a={{ pos: [-0.65, 0, -0.35], seed: 71, look: { body: "#2a3a6a", hair: "bowl", cap: "#1a2440", badge: true, pad: true }, ...padHands, expr: [[0, "hype"]], scale: 1.15 }} />
    </Scene3D>)),
  // 22. Поезд стоит: локомотив носом в кадр, в лобовом стекле «УШЁЛ В GTA», на перроне злые пассажиры
  S(t.p8trains, t.p8streets, (
    <Scene3D t0={t.p8trains} light="day" bg="#a8d0f0" focus={[0, 1.6, -2.6]}
      cam={cam([t.p8trains, [-0.4, 1.6, 3.4], [1.0, 1.6, -2.4], 60], [t.p8streets, [-0.1, 1.7, 2.4], [1.0, 1.7, -2.4], 56])}>
      <TrainFront board={boardDraw("ПОЕЗДА", [["№ 19", "08:00"], ["№ 66", "09:30"], ["№ 06", "11:11"]], "ОПАЗДЫВАЕТ")} />
      {[[1.9, -1.4], [2.5, -2.2], [2.2, -0.6]].map(([x, z], i) => <Doodle key={i} a={{ pos: [x, 0.9, z], seed: 120 + i, look: { body: ["#2f8fe0", "#e64b4b", "#b04fd6"][i], hair: (["bowl", "long", "spiky"] as const)[i] }, expr: [[0, "angry"], [t.p8trains + 0.8, "tired"]], scale: 1.0 }} />)}
    </Scene3D>)),
  // 23. Пустые улицы как в ковид: перекати-поле, мигающий светофор, ни машин ни людей
  S(t.p8streets, t.p8door, (
    <Scene3D t0={t.p8streets} light="day" bg="#5aa0e8" focus={[0, 0.5, -1]}
      cam={cam([t.p8streets, [0, 1.7, 4.8], [0, 1.8, -5], 60], [t.p8door, [0, 1.4, 3.4], [0, 1.6, -5], 58])}>
      <City cars={false} empty t0={t.p8streets} />
    </Scene3D>)),
  // 24. Дверь офиса: «Закрыто. Мы в Вайс-Сити»
  S(t.p8door, P[9], (
    <Scene3D t0={t.p8door} light="office" bg="#8a9aaa" focus={[0, 1.35, -1.88]} shakes={[[t.p8closed, 0.6]]}
      cam={cam([t.p8door, [0.5, 1.4, 1.2], [0, 1.35, -1.88], 52], [P[9], [0.1, 1.38, 0.3], [0, 1.35, -1.88], 46])}>
      <OfficeDoor />
    </Scene3D>)),

  // 25. Предзагрузка 100% на телевизоре
  S(P[9], t.p9mid, (
    <Scene3D t0={P[9]} light="night" bg="#0b0f2a" focus={[1.0, 1.18, -1.85]}
      cam={cam([P[9], [0.9, 1.2, 0.4], [1.0, 1.18, -1.85], 50], [t.p9mid, [0.95, 1.18, 0.0], [1.0, 1.18, -1.85], 48])}>
      <Apartment tv={loadDraw("ПРЕДЗАГРУЗКА ✓", [[0, 100]])} night clock={() => "23:59"} />
    </Scene3D>), "cut"),
  // 26. Полночь: весь город светится экранами, люди с геймпадами
  S(t.p9mid, t.p9req, (
    <Scene3D t0={t.p9mid} light="night" bg="#0a0f2a" focus={[0, 1.5, -2]}
      cam={cam([t.p9mid, [0, 1.3, 4.0], [0, 3.0, -7], 58], [t.p9req, [0, 2.0, 2.8], [0, 3.6, -7], 58])}>
      <City night cars={false} />
      {BILLBOARD((g, s, W, H) => { g.fillStyle = "#0b0b12"; g.fillRect(0, 0, W, H); fitText(g, "00:00", W / 2, H * 0.4, W * 0.7, H * 0.45, RED); fitText(g, "▶ ИГРАТЬ", W / 2, H * 0.82, W * 0.6, H * 0.16, "#3fff8f"); })}
      {crowd(10, -3, 3, -0.4, 1.4, 81, [[0, "hype"]]).map((a, i) => <Doodle key={i} a={{ ...a, look: { ...a.look, pad: true }, ...padHands }} />)}
    </Scene3D>)),
  // 27. «Требуется обновление» 1% → 37% → 99%: ТВ крупно + герой в кадре
  S(t.p9req, P[10], (
    <Scene3D t0={t.p9req} light="night" bg="#0b0f2a" focus={[0.6, 1.1, -1.5]} shakes={[[t.p9req, 1.0], [t.p9ninety, 0.6]]}
      cam={cam([t.p9req, [0.8, 1.2, 0.5], [0.8, 1.15, -1.85], 50], [P[10], [0.5, 1.2, 1.0], [0.6, 1.1, -1.6], 54])}>
      <Apartment tv={loadDraw("ТРЕБУЕТСЯ ОБНОВЛЕНИЕ", [[0, 0], [t.p9one, 1], [t.p9thirty, 37], [t.p9ninety, 99]], "#ffd23f", "не выключайте консоль")} night clock={() => "00:01"} />
      <Doodle a={hero([-0.2, 0, -0.9], [[0, "shock"], [t.p9thirty, "nervous"]])} />
    </Scene3D>), "cut"),

  // 28. Час на 99% — устал
  S(P[10], t.p10kettle, (
    <Scene3D t0={P[10]} light="night" bg="#0b0f2a" focus={[-0.2, 1.0, -0.8]}
      cam={cam([P[10], [0.3, 1.15, 1.0], [0.1, 1.05, -1.1], 52], [t.p10kettle, [0.2, 1.1, 0.6], [0.05, 1.05, -1.1], 48])}>
      <Apartment tv={loadDraw("ТРЕБУЕТСЯ ОБНОВЛЕНИЕ", [[0, 99]], "#ffd23f")} night clock={() => "01:04"} />
      <Doodle a={hero([-0.25, 0, -0.85], [[0, "tired"]])} />
    </Scene3D>)),
  // 29. Чайник вскипел ×4
  S(t.p10kettle, t.p10cat, (
    <Scene3D t0={t.p10kettle} light="office" bg="#e8d8b8" focus={[0, 1.1, -1.4]}
      cam={cam([t.p10kettle, [0.3, 1.45, 0.8], [0.2, 1.2, -1.5], 50], [t.p10cat, [0.25, 1.4, 0.35], [0.2, 1.2, -1.5], 46])}>
      <Kitchen2 t0={t.p10kettle} />
    </Scene3D>)),
  // 30. Кот ушёл к соседям
  S(t.p10cat, t.p10vice, (
    <Scene3D t0={t.p10cat} light="night" bg="#0b0f2a" focus={[1.0, 0.4, -0.6]}
      cam={cam([t.p10cat, [0.2, 0.8, 1.6], [1.0, 0.55, -0.8], 48], [t.p10vice, [0.6, 0.8, 1.3], [1.5, 0.55, -0.8], 46])}>
      <Apartment tv={loadDraw("ТРЕБУЕТСЯ ОБНОВЛЕНИЕ", [[0, 99]], "#ffd23f")} night />
      <group scale={1.6} position={[0, -0.2, 0.3]}><Cat x0={-0.3} x1={1.9} z={-0.6} t0={t.p10cat + 0.2} d={1.4} /></group>
    </Scene3D>)),
  // 31. Вайс-Сити! Вспышка, конфетти
  S(t.p10vice, t.p10nosleep, (
    <Scene3D t0={t.p10vice} light="night" bg="#0b0f2a" focus={[0.6, 1.1, -1.5]} shakes={[[t.p10vice, 0.8]]}
      cam={cam([t.p10vice, [1.0, 1.18, -0.6], [1.0, 1.18, -1.85], 48], [t.p10nosleep, [0.5, 1.25, 1.0], [0.5, 1.1, -1.6], 56])}>
      <Apartment tv={viceDraw} night />
      <Doodle a={hero([-0.25, 0, -0.85], [[0, "hype"]], armsUp(t.p10vice + 0.2, 9))} />
      <Confetti t0={t.p10vice} n={40} area={[-1.5, 1.8, -1.5, 0.3]} />
    </Scene3D>), "flash"),
  // 32. Рассвет: так и не спал
  S(t.p10nosleep, P[11], (
    <Scene3D t0={t.p10nosleep} light="day" bg="#ffd8b8" focus={[-0.35, 1.0, -0.75]}
      cam={cam([t.p10nosleep, [-0.2, 1.08, 0.8], [-0.35, 1.0, -0.75], 46], [P[11], [-0.3, 1.04, 0.45], [-0.35, 1.0, -0.75], 42])}>
      <Apartment tv={viceDraw} dawn clock={() => "05:59"} />
      <Doodle a={hero([-0.35, 0, -0.75], [[0, "hype"], [t.p10nosleep + 1.0, "tired"]])} />
    </Scene3D>)),

  // 33. 6:00 — бежит за энергетиками по рассветной улице
  S(P[11], t.p11counter, (
    <Scene3D t0={P[11]} light="day" bg="#ffcfa8" focus={[0, 0.8, -1]}
      cam={cam([P[11], [-1.2, 1.2, 3.0], [0, 1.1, -2], 56], [t.p11counter, [0.2, 1.2, 2.4], [1.0, 1.1, -2], 54])}>
      <City cars sky="dawn" />
      <Doodle a={hero([-2, 0, -0.6], [[0, "nervous"]], { walk: [[P[11], -2.2, -0.6], [t.p11counter, 2.4, -0.9]], hop: 14 }, HERO_NOPAD)} />
    </Scene3D>)),
  // 34. Касса: мужик в пиджаке СПИНОЙ, три упаковки энергетиков; герой в очереди
  S(t.p11counter, t.p11turn, (
    <Scene3D t0={t.p11counter} light="office" bg="#e8f0f0" focus={[0.2, 1.1, -0.4]}
      cam={cam([t.p11counter, [-0.8, 1.45, 2.0], [0.2, 1.15, -0.8], 56], [t.p11turn, [-0.4, 1.35, 1.4], [0.25, 1.15, -0.6], 52])}>
      <Store2 />
      <Doodle a={{ pos: [0.3, 0, -0.3], seed: 91, look: BOSS, expr: [[0, "blank"]], scale: 1.2, back: [[0, 999]] }} />
      {[0, 1, 2].map((i) => <SixPack key={i} p={[0.75, 1.045 + i * 0.18, -0.85]} col={["#3fff8f", "#2fe0ff", YEL][i]} scale={1.1} />)}
      <Chips p={[-0.1, 1.2, -0.9]} col={RED} scale={0.6} />
      <Doodle a={hero([-0.9, 0, 0.35], [[0, "tired"]], {}, HERO_NOPAD)} />
    </Scene3D>)),
  // 35. Оборачивается — твой начальник!
  S(t.p11turn, t.p11also, (
    <Scene3D t0={t.p11turn} light="office" bg="#e8f0f0" focus={[0.3, 1.2, -0.3]} shakes={[[t.p11boss, 1.2]]}
      cam={cam([t.p11turn, [0.1, 1.3, 1.3], [0.3, 1.2, -0.3], 46], [t.p11also, [0.2, 1.25, 0.8], [0.3, 1.2, -0.3], 42])}>
      <Store2 />
      <Doodle a={{ pos: [0.3, 0, -0.3], seed: 91, look: BOSS, expr: [[0, "blank"], [t.p11boss, "shock"]], scale: 1.2, back: [[0, t.p11boss - 0.15]] }} />
      {[0, 1, 2].map((i) => <SixPack key={i} p={[0.75, 1.045 + i * 0.18, -0.85]} col={["#3fff8f", "#2fe0ff", YEL][i]} scale={1.1} />)}
    </Scene3D>), "cut"),
  // 36. Оба «на больничном» — таблички в кадре
  S(t.p11also, t.p11nod, (
    <Scene3D t0={t.p11also} light="office" bg="#e8f0f0" focus={[0, 1.1, -0.4]}
      cam={cam([t.p11also, [0, 1.4, 2.4], [0, 1.25, -0.5], 54], [t.p11nod, [0, 1.35, 1.9], [0, 1.25, -0.5], 52])}>
      <Store2 />
      <Doodle a={{ pos: [0.55, 0, -0.4], seed: 91, look: BOSS, expr: [[0, "nervous"]], scale: 1.2 }} />
      <Doodle a={hero([-0.55, 0, -0.4], [[0, "shock"], [t.p11also + 0.6, "nervous"]], {}, HERO_NOPAD)} />
      <Sign p={[0.55, 1.95, -0.35]} w={0.95} h={0.28} text="🤒 БОЛЬНИЧНЫЙ" bg="#fff" fg={RED} glow={0.4} />
      <Sign p={[-0.55, 1.95, -0.35]} w={0.95} h={0.28} text="🤒 БОЛЬНИЧНЫЙ" bg="#fff" fg={RED} glow={0.4} />
    </Scene3D>)),
  // 37. Молча кивают и расходятся
  S(t.p11nod, P[12], (
    <Scene3D t0={t.p11nod} light="office" bg="#e8f0f0" focus={[0, 1.1, -0.4]}
      cam={cam([t.p11nod, [0, 1.35, 1.9], [0, 1.2, -0.5], 52], [P[12], [0, 1.45, 2.6], [0, 1.2, -0.5], 56])}>
      <Store2 />
      <Doodle a={{ pos: [0.55, 0, -0.4], seed: 91, look: BOSS, expr: [[0, "smug"]], scale: 1.2, walk: [[t.p11nod + 1.0, 0.55, -0.4], [P[12], 2.4, 0.2]] }} />
      <Doodle a={hero([-0.55, 0, -0.4], [[0, "smug"]], { walk: [[t.p11nod + 1.0, -0.55, -0.4], [P[12], -2.4, 0.2]] }, HERO_NOPAD)} />
    </Scene3D>)),

  // 38. Финал: неоновый закат GTA (как было) и вопрос
  S(P[12], END, (
    <Scene3D t0={P[12]} light="neon" bg="#1A0B33" focus={[0, 1.2, -1]}
      cam={cam([P[12], [0, 1.2, 1.6], [0, 1.6, -6], 58], [END, [0, 2.0, 5.2], [0, 3.0, -8], 62])}>
      <SynthSunset />
      <QuestionCard p={[0, 4.3, -5]} t={P[12] + 0.15} w={5.2} l1="А ТЫ ВОЗЬМЁШЬ" l2="ОТГУЛ 19-ГО?" pill="СТАВЬ ❤️ И ПИШИ В КОММЕНТЫ" />
      {crowd(16, -3.2, 3.2, -2.4, 0.6, 71, [[0, "hype"]]).map((a, i) => <Doodle key={i} a={{ ...a, sign: i % 4 === 0 ? [["УЖЕ ВЗЯЛ!", "КХА-КХА 🤒", "Я БОЛЕЮ", "ДА!!!"][(i / 4) % 4], ["#fff", YEL, PINK, CYAN][(i / 4) % 4], INK] : undefined }} />)}
    </Scene3D>)),
];

// ---------------------------------------------------------------- облачка-реплики: плоский слой поверх видео (всегда в кадре)
// x, y — центр в пикселях кадра 1080×1920; зона субтитров (y≈1430–1530) и правый край (x>940) не заняты
export type Bub = { t0: number; t1: number; text: string; x: number; y: number; col?: string };
export const BUBBLES: Bub[] = [
  { t0: t.p3many + 0.2, t1: t.p3po, text: "БЕРИТЕ БОЛЬНИЧНЫЙ 😎", x: 500, y: 430 },
  { t0: t.p4kha + 0.05, t1: P[5], text: "КХА-КХА 🤒", x: 690, y: 330 },
  { t0: t.p5steal, t1: P[6], text: "ХОЧУ УГНАТЬ МАШИНУ 🚗", x: 500, y: 420, col: YEL },
  { t0: t.p6son - 0.1, t1: t.p6noson, text: "ДЛЯ СЫНА 🙂", x: 520, y: 430 },
  { t0: t.p8pilots, t1: t.p8trains, text: "Я В GTA ✈", x: 640, y: 820 },
  { t0: t.p10cat + 0.2, t1: t.p10vice, text: "УШЁЛ К СОСЕДЯМ →", x: 540, y: 400 },
];
