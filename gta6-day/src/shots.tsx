// РАСКАДРОВКА «Что будет в день выхода GTA 6»: шоты по таймингам голоса (секунды голоса).
import React from "react";
import words from "./words.json";
import { setData, wt, ps, TOTAL } from "./timeline.js";
setData(words);
import { Scene3D, Doodle, Actor, Box, Cyl, Sign, Screen, crowd, armsUp, padHands, pointKeys, REST_F, REST_B, HIP, HEAD_Z, CamKey, V3, popAt, bonkAt, useSec, fitText, clamp, lerp } from "./kit";
import { GamerRoom, ViceStreet, NewsStudio, SynthSunset, QuestionCard, Smoke, Confetti, Bubble, calDraw, clockDraw, drawBg, drawLogo, rr, PINK, CYAN, YEL, RED, INK } from "./sets";
import { titleDraw, loadDraw, viceDraw, mapDraw, paperDraw, vacDraw, pcDraw, StageSet, PaperSet, Clinic, Shop, PcRoom, Airport, Station, EmptyStreet, OfficeDoor, Kitchen, Cat, Store24 } from "./sets2";
import type { Look } from "./doodle";

export type Shot = { t0: number; t1: number; el: React.ReactNode; tr?: "fade" | "cut" | "flash" };

// ---------------------------------------------------------------- персонажи
const HERO: Look = { body: "#3fb27f", hair: "bowl", pad: true };
const HERO_NOPAD: Look = { body: "#3fb27f", hair: "bowl" };
const CEO: Look = { body: "#2a2a3a", hair: "bald", hairCol: "#8a8580", tie: "#2f6fd6", glasses: true };
const GIRL: Look = { body: "#ff5fa2", hair: "long" };
const DOCTOR: Look = { body: "#f4f4f4", hair: "bun", glasses: true };
const PCBOY: Look = { body: "#1a1a2a", hair: "spiky", glasses: true };
const MAN40: Look = { body: "#7a5a3a", hair: "bald", hairCol: "#3a2a1a", beard: false, wrinkles: true };
const BOSS: Look = { body: "#26263a", hair: "slick", tie: "#e64b4b", glasses: true };
const hero = (pos: V3, expr: [number, string][], extra: Partial<Actor> = {}, look: Look = HERO): Actor => ({ pos, seed: 1, look, expr, ...(look.pad ? padHands : {}), scale: 1.15, ...extra });

// ---------------------------------------------------------------- времена
const W = (p: number, s: string, o = 0) => wt(p, s, o);
const t = {
  p1and: W(1, "и"), p1pause: W(1, "паузу"),
  p2you: W(2, "ты"), p2console: W(2, "приставка"), p2chips: W(2, "чипсы"), p2notalone: W(2, "и"), p2every: W(2, "каждый"), p2young: W(2, "среди"), p2third: W(2, "каждый", 1),
  p3many: W(3, "многие"), p3po: W(3, "по"), p3off: W(3, "официальное"),
  p4you: W(4, "ты"), p4call: W(4, "звонишь"), p4kha: W(4, "кха"), p4flu: W(4, "грипп"),
  p5sym: W(5, "симптомы"), p5shake: W(5, "трясущиеся"), p5steal: W(5, "угнать"),
  p6man: W(6, "мужик"), p6son: W(6, "сына"), p6noson: W(6, "сына", 1),
  p7watch: W(7, "смотрят"), p7date: W(7, "даты"),
  p8air: W(8, "аэропорту"), p8pilots: W(8, "пилоты"), p8trains: W(8, "поезда"), p8streets: W(8, "улицы"), p8door: W(8, "на"), p8closed: W(8, "закрыто"),
  p9mid: W(9, "полночь"), p9millions: W(9, "миллионы"), p9req: W(9, "требуется"), p9one: W(9, "один"), p9thirty: W(9, "тридцать"), p9ninety: W(9, "девяносто"),
  p10kettle: W(10, "чайник"), p10cat: W(10, "кот"), p10vice: W(10, "вот"), p10nosleep: W(10, "ты"),
  p11counter: W(11, "на"), p11turn: W(11, "оборачивается"), p11boss: W(11, "твой"), p11also: W(11, "тоже"), p11nod: W(11, "молча"),
  p12like: W(12, "лайк"),
};
const P = [0, ...Array.from({ length: 12 }, (_, i) => ps(i + 1))];
const END = TOTAL;
const cam = (...k: CamKey[]) => k;
const S = (t0: number, t1: number, el: React.ReactNode, tr?: Shot["tr"]): Shot => ({ t0, t1, el, tr });

// телефон в руке: экран-звонок
function Phone({ p, draw, scale = 1 }: { p: V3; draw: (g: CanvasRenderingContext2D, s: number, W: number, H: number) => void; scale?: number }) {
  return (<group position={p} scale={scale}>
    <Box p={[0, 0, 0]} s={[0.4, 0.78, 0.05]} c="#1a1a22" r={0.3} />
    <Screen p={[0, 0, 0.027]} w={0.36} h={0.72} res={480} draw={draw} />
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

// ================================================================= ШОТЫ
export const SHOTS: Shot[] = [
  // ---------- 1. Заставка GTA 6 во весь экран → отлёт в комнату (первый кадр — чёткий логотип и «19 НОЯБРЯ»)
  S(0, t.p1and, (
    <Scene3D t0={0} light="neon" bg="#1a1030" focus={[0.75, 1.32, -1.82]} dof={1}
      cam={cam([0, [0.75, 1.32, -0.85], [0.75, 1.32, -1.82], 50], [t.p1and, [0.4, 1.3, 0.6], [0.5, 1.2, -1.6], 56])}>
      <GamerRoom screen={titleDraw()} />
      <Doodle a={hero([-0.35, 0, -0.75], [[0, "hype"]])} />
    </Scene3D>), "cut"),
  // ---------- 2. Мир на паузе: улица замерла, на билборде пауза
  S(t.p1and, P[2], (
    <Scene3D t0={t.p1and} light="day" bg="#2a1458" focus={[0, 1, -0.5]} fog="#b0368a" shakes={[[t.p1pause, 0.8]]}
      cam={cam([t.p1and, [-1.5, 1.0, 4.0], [0.6, 1.8, -4], 58], [P[2], [-0.4, 1.4, 2.6], [0.8, 2.2, -4], 56])}>
      <ViceStreet board={titleDraw(t.p1pause - 0.1)} />
      {crowd(10, -2.6, 2.6, -1.6, 0.4, 3, [[0, "blank"]]).map((a, i) => <Doodle key={i} a={{ ...a, hop: 0 }} />)}
    </Scene3D>)),

  // ---------- 3. Ночь: герой не спит, часы 03:12
  S(P[2], t.p2console, (
    <Scene3D t0={P[2]} light="night" bg="#0b0624" focus={[-0.35, 1.0, -0.75]}
      cam={cam([P[2], [1.4, 1.4, 1.8], [0.2, 1.2, -1.4], 58], [t.p2console, [0.9, 1.3, 1.2], [0.1, 1.15, -1.2], 54])}>
      <GamerRoom screen={titleDraw()} clock={() => "03:12"} cal={calDraw("НОЯБРЬ", "18")} />
      <Doodle a={hero([-0.35, 0, -0.75], [[0, "hype"], [P[2] + 1, "nervous"]])} />
    </Scene3D>)),
  // ---------- 4. Приставка протёрта, геймпад заряжен — блестит
  S(t.p2console, t.p2chips, (
    <Scene3D t0={t.p2console} light="night" bg="#0b0624" focus={[0.75, 0.95, -1.45]}
      cam={cam([t.p2console, [0.4, 1.2, 0.2], [0.75, 0.95, -1.45], 46], [t.p2chips, [0.6, 1.1, -0.2], [0.75, 0.95, -1.45], 42])}>
      <GamerRoom screen={titleDraw()} clock={() => "03:12"} />
      <Box p={[0.75, 0.95, -1.45]} s={[0.36, 0.06, 0.26]} c="#f4f4f8" metal={0.3} r={0.2} />
      <Box p={[0.75, 0.99, -1.45]} s={[0.1, 0.02, 0.2]} c="#111" />
      <Confetti t0={t.p2console + 0.2} n={18} area={[0.4, 1.1, -1.6, -1.3]} />
      <Doodle a={hero([0.05, 0, -0.95], [[0, "proud"]], { handB: [[0, 0.1, HIP + 0.16], [t.p2console + 0.3, 0.42, HIP + 0.3], [t.p2console + 0.6, 0.3, HIP + 0.32], [t.p2console + 0.9, 0.42, HIP + 0.3]] })} />
    </Scene3D>)),
  // ---------- 5. Чипсы на неделю — гора пачек
  S(t.p2chips, t.p2every, (
    <Scene3D t0={t.p2chips} light="night" bg="#0b0624" focus={[-0.6, 0.8, -0.9]}
      cam={cam([t.p2chips, [-1.3, 1.1, 1.4], [-0.6, 0.8, -0.9], 52], [t.p2every, [-0.9, 1.15, 1.0], [-0.6, 0.85, -0.9], 48])}>
      <GamerRoom screen={titleDraw()} clock={() => "03:13"} />
      {Array.from({ length: 22 }, (_, i) => { const r = (k: number) => { const v = Math.sin((i + 1) * 77.7 * k) * 43758.5; return v - Math.floor(v); };
        return <Box key={i} p={[-1.0 + r(1) * 0.9, 0.12 + (i % 5) * 0.16 + r(2) * 0.05, -1.0 + r(3) * 0.4]} s={[0.22, 0.3, 0.08]} rot={[r(4) * 0.6, r(5) * 3, r(6) * 0.6]} c={[YEL, RED, "#3fb27f", CYAN, PINK][i % 5]} />; })}
      <Sign p={[-0.55, 1.35, -0.8]} w={0.9} h={0.3} text="НА НЕДЕЛЮ" bg="#fff" fg={INK} glow={0.4} />
      <Doodle a={hero([0.3, 0, -0.75], [[0, "proud"]])} />
    </Scene3D>)),
  // ---------- 6. Карта США: каждый пятый → молодые каждый третий
  S(t.p2every, P[3], (
    <Scene3D t0={t.p2every} light="studio" bg="#0c1224" focus={[0, 1.75, -1.92]}
      cam={cam([t.p2every, [-0.6, 1.75, 0.9], [0, 1.75, -1.92], 52], [P[3], [0.3, 1.75, 0.3], [0, 1.75, -1.92], 48])}>
      <NewsStudio screen={mapDraw(t.p2young)} />
      {crowd(5, -1.6, 1.6, -0.5, 0.2, 13, [[0, "proud"], [t.p2young, "hype"]]).map((a, i) => <Doodle key={i} a={{ ...a, look: { ...a.look, pad: true }, ...padHands }} />)}
    </Scene3D>)),

  // ---------- 7. Глава Take-Two на сцене
  S(P[3], t.p3many, (
    <Scene3D t0={P[3]} light="studio" bg="#0a0d18" focus={[0.4, 1.3, -0.6]}
      cam={cam([P[3], [-1.2, 1.6, 3.2], [0.3, 1.5, -1.2], 60], [t.p3many, [-0.4, 1.5, 2.2], [0.3, 1.45, -1.0], 56])}>
      <StageSet />
      <Doodle a={{ pos: [0.3, 0.3, -0.7], seed: 21, look: CEO, expr: [[0, "smug"]], scale: 1.2, talk: [[P[3] + 0.3, t.p3many]] }} />
      {crowd(8, -2.5, 2.5, 1.0, 1.6, 23, [[0, "realize"]]).map((a, i) => <Doodle key={i} a={a} />)}
    </Scene3D>)),
  // ---------- 8. «Многие возьмут больничный» — крупно, облачко
  S(t.p3many, t.p3po, (
    <Scene3D t0={t.p3many} light="studio" bg="#0a0d18" focus={[0.3, 1.3, -0.7]}
      cam={cam([t.p3many, [0.0, 1.4, 0.9], [0.3, 1.35, -0.7], 46], [t.p3po, [0.1, 1.38, 0.55], [0.3, 1.35, -0.7], 42])}>
      <StageSet />
      <Doodle a={{ pos: [0.3, 0.3, -0.7], seed: 21, look: CEO, expr: [[0, "grin"], [t.p3many + 1.0, "proud"]], scale: 1.2, talk: [[t.p3many, t.p3po]], handF: pointKeys(t.p3many + 0.4, -0.3, 0.5, 1.2, "f") }} />
      <Bubble p={[-0.6, 2.25, -0.6]} text="БЕРИТЕ БОЛЬНИЧНЫЙ 😎" t={t.p3many + 0.2} w={1.5} />
    </Scene3D>)),
  // ---------- 9. «Официальное разрешение» — бумага и печать
  S(t.p3po, P[4], (
    <Scene3D t0={t.p3po} light="office" bg="#3a2a24" focus={[0, 0, -0.6]} shakes={[[t.p3off, 0.8]]}
      cam={cam([t.p3po, [0, 1.25, 0.1], [0, 0, -0.6], 50], [P[4], [0, 1.05, -0.2], [0, 0, -0.6], 48])}>
      <PaperSet draw={paperDraw(t.p3off)} />
    </Scene3D>), "cut"),

  // ---------- 10. Девушка взяла отпуск 19–27
  S(P[4], t.p4you, (
    <Scene3D t0={P[4]} light="office" bg="#e8d8b8" focus={[0.3, 1.3, -1.6]}
      cam={cam([P[4], [-0.9, 1.4, 1.8], [0.4, 1.5, -1.9], 56], [t.p4you, [-0.3, 1.45, 1.1], [0.6, 1.6, -1.9], 52])}>
      <GamerRoom screen={titleDraw()} cal={vacDraw} couch={false} />
      <Doodle a={{ pos: [-0.5, 0, -1.0], seed: 31, look: GIRL, expr: [[0, "proud"], [P[4] + 1.5, "grin"]], scale: 1.15, handB: pointKeys(P[4] + 1.2, 1.0, 1.0, 2.5, "b") }} />
    </Scene3D>)),
  // ---------- 11. 8:00 — звонок начальнику
  S(t.p4you, t.p4kha, (
    <Scene3D t0={t.p4you} light="day" bg="#cfe0ff" focus={[-0.1, 1.05, -0.4]}
      cam={cam([t.p4you, [0.9, 1.3, 1.6], [0.1, 1.2, -1.0], 56], [t.p4kha, [0.5, 1.2, 1.0], [0.0, 1.1, -0.8], 50])}>
      <GamerRoom screen={titleDraw()} clock={() => "08:00"} />
      <Doodle a={hero([-0.35, 0, -0.75], [[0, "nervous"]], { handB: [[0, 0.3, HEAD_Z - 0.05]] }, HERO_NOPAD)} />
      <Phone p={[0.15, 1.05, -0.35]} draw={callDraw("НАЧАЛЬНИК")} scale={0.6} />
    </Scene3D>)),
  // ---------- 12. «Кха… у меня GTA… то есть грипп!»
  S(t.p4kha, P[5], (
    <Scene3D t0={t.p4kha} light="day" bg="#cfe0ff" focus={[-0.35, 1.0, -0.75]} shakes={[[t.p4kha, 0.4], [t.p4flu, 0.7]]}
      cam={cam([t.p4kha, [-0.2, 1.05, 0.7], [-0.35, 1.0, -0.75], 44], [P[5], [-0.25, 1.03, 0.35], [-0.35, 1.0, -0.75], 40])}>
      <GamerRoom screen={titleDraw()} clock={() => "08:01"} />
      <Doodle a={hero([-0.35, 0, -0.75], [[0, "holdlaugh"], [t.p4flu, "nervous"]], { handB: [[0, 0.3, HEAD_Z - 0.05]], handF: [[0, -0.1, HEAD_Z - 0.15]], talk: [[t.p4kha, P[5]]] }, HERO_NOPAD)} />
      <Bubble p={[0.5, 1.9, -0.6]} text="КХА-КХА 🤒" t={t.p4kha + 0.05} w={1.0} />
    </Scene3D>)),

  // ---------- 13. «Грипп GTA» в новостях
  S(P[5], t.p5sym, (
    <Scene3D t0={P[5]} light="studio" bg="#0c1224" focus={[0, 1.6, -1.6]}
      cam={cam([P[5], [0, 2.0, 3.0], [0, 1.6, -1.6], 58], [t.p5sym, [0, 1.75, 1.8], [0, 1.65, -1.6], 54])}>
      <NewsStudio screen={(g, s, W, H) => { drawBg(g, W, H, "#0e1a3a", "#1d3a7a"); g.fillStyle = RED; g.fillRect(0, H * 0.06, W * 0.36, H * 0.14); fitText(g, "LONDON", W * 0.18, H * 0.135, W * 0.3, H * 0.1, "#fff");
        fitText(g, "🤒", W / 2, H * 0.45, W * 0.3, H * 0.35, "#fff"); fitText(g, "«ГРИПП GTA»", W / 2, H * 0.82, W * 0.8, H * 0.16, YEL); }} />
      <Doodle a={{ pos: [0, 0, -1.15], seed: 5, look: { body: "#2f6fd6", hair: "slick", tie: "#f2c230" }, expr: [[0, "stern"], [P[5] + 1.5, "realize"]], talk: [[P[5], t.p5sym]], scale: 1.2 }} />
    </Scene3D>)),
  // ---------- 14. Поликлиника: одинаковые симптомы
  S(t.p5sym, P[6], (
    <Scene3D t0={t.p5sym} light="office" bg="#cfe6e0" focus={[0, 1, -0.6]} shakes={[[t.p5steal, 0.6]]}
      cam={cam([t.p5sym, [-1.4, 1.5, 2.6], [0, 1.2, -1.2], 58], [P[6], [-0.6, 1.4, 1.8], [0.2, 1.2, -1.2], 54])}>
      <Clinic />
      {[-2.2, -1.5, -0.8, -0.1].map((x, i) => <Doodle key={i} a={{ pos: [x, 0, -0.9 + (i % 2) * 0.2], seed: 40 + i, look: { body: ["#e64b4b", "#2f8fe0", "#f2c230", "#b04fd6"][i], hair: (["spiky", "bowl", "long", "slick"] as const)[i], pad: true }, ...padHands,
        expr: [[0, "tired"], [t.p5steal, "smug"]], shiver: t.p5shake ? 1.5 : 0, scale: 1.05 }} />)}
      <Doodle a={{ pos: [1.5, 0, -0.8], seed: 47, look: DOCTOR, expr: [[0, "blank"], [t.p5shake, "shock"]], scale: 1.15 }} />
      <Bubble p={[-1.2, 2.2, -0.7]} text="ХОЧУ УГНАТЬ МАШИНУ" t={t.p5steal} w={1.6} col={YEL} />
    </Scene3D>)),

  // ---------- 15. Приставки сметают с полок
  S(P[6], t.p6man, (
    <Scene3D t0={P[6]} light="office" bg="#e9e6f2" focus={[0, 1.2, -1.5]}
      cam={cam([P[6], [1.2, 1.6, 2.4], [0, 1.2, -1.5], 58], [t.p6man, [0.4, 1.4, 1.6], [0, 1.2, -1.5], 54])}>
      <Shop />
      {crowd(7, -2.3, 2.3, -1.0, 0.0, 51, [[0, "angry"]]).map((a, i) => <Doodle key={i} a={{ ...a, ...armsUp(P[6] + i * 0.1, 9) }} />)}
    </Scene3D>)),
  // ---------- 16. Мужик 40 лет: «для сына»
  S(t.p6man, t.p6noson, (
    <Scene3D t0={t.p6man} light="office" bg="#e9e6f2" focus={[0, 1.0, -0.7]}
      cam={cam([t.p6man, [0.9, 1.3, 1.6], [0, 1.1, -0.8], 54], [t.p6noson, [0.4, 1.2, 0.9], [0, 1.05, -0.8], 48])}>
      <Shop />
      <Doodle a={{ pos: [0, 0, -0.8], seed: 55, look: MAN40, expr: [[0, "proud"], [t.p6son, "smug"]], scale: 1.2, handF: [[0, -0.12, HIP + 0.3]], handB: [[0, 0.12, HIP + 0.3]] }} />
      <Box p={[0, 0.72, -0.55]} s={[0.5, 0.36, 0.12]} c="#f4f4f8" />
      <Sign p={[0, 0.72, -0.48]} w={0.46} h={0.16} text="PS5" bg="#1a1a2a" fg="#fff" glow={0.4} />
      <Bubble p={[0.8, 2.0, -0.7]} text="ДЛЯ СЫНА 🙂" t={t.p6son - 0.1} w={1.2} />
    </Scene3D>)),
  // ---------- 17. «Сына у него нет»
  S(t.p6noson, P[7], (
    <Scene3D t0={t.p6noson} light="office" bg="#e9e6f2" focus={[0, 1.0, -0.8]}
      cam={cam([t.p6noson, [0.0, 1.05, 0.5], [0, 1.0, -0.8], 42], [P[7], [0.0, 1.03, 0.3], [0, 1.0, -0.8], 40])}>
      <Shop />
      <Doodle a={{ pos: [0, 0, -0.8], seed: 55, look: MAN40, expr: [[0, "smug"], [t.p6noson + 0.6, "holdlaugh"]], scale: 1.2, handF: [[0, -0.12, HIP + 0.3]], handB: [[0, 0.12, HIP + 0.3]] }} />
      <Box p={[0, 0.72, -0.55]} s={[0.5, 0.36, 0.12]} c="#f4f4f8" />
    </Scene3D>)),

  // ---------- 18. ПК-бояре: RGB-комната, гордый
  S(P[7], t.p7watch, (
    <Scene3D t0={P[7]} light="neon" bg="#0a0814" focus={[-0.6, 1.0, -0.7]}
      cam={cam([P[7], [1.6, 1.5, 2.0], [0.2, 1.2, -1.4], 58], [t.p7watch, [0.9, 1.35, 1.3], [0.0, 1.15, -1.2], 54])}>
      <PcRoom mon={pcDraw(t.p7date)} />
      <Doodle a={{ pos: [-0.7, 0, -0.75], seed: 61, look: PCBOY, expr: [[0, "smug"]], scale: 1.15 }} />
    </Scene3D>)),
  // ---------- 19. …смотрит стрим с телефона и плачет
  S(t.p7watch, t.p7date, (
    <Scene3D t0={t.p7watch} light="neon" bg="#0a0814" focus={[-0.6, 1.0, -0.6]}
      cam={cam([t.p7watch, [-0.4, 1.1, 0.7], [-0.6, 1.0, -0.7], 46], [t.p7date, [-0.5, 1.05, 0.4], [-0.6, 1.0, -0.7], 42])}>
      <PcRoom mon={pcDraw(t.p7date)} />
      <Doodle a={{ pos: [-0.7, 0, -0.75], seed: 61, look: PCBOY, expr: [[0, "cry"]], scale: 1.15, handB: [[0, 0.25, HIP + 0.45]] }} />
      <Phone p={[-0.38, 0.95, -0.5]} draw={streamDraw} scale={0.55} />
    </Scene3D>)),
  // ---------- 20. «Даты на ПК нет»
  S(t.p7date, P[8], (
    <Scene3D t0={t.p7date} light="neon" bg="#0a0814" focus={[0.2, 1.3, -1.71]} shakes={[[t.p7date + 0.2, 0.8]]}
      cam={cam([t.p7date, [0.2, 1.3, 0.4], [0.2, 1.3, -1.71], 50], [P[8], [0.2, 1.3, 0.0], [0.2, 1.3, -1.71], 48])}>
      <PcRoom mon={pcDraw(t.p7date)} />
    </Scene3D>), "cut"),

  // ---------- 21. Аэропорт: все рейсы задержаны, пилот с геймпадом
  S(P[8], t.p8trains, (
    <Scene3D t0={P[8]} light="office" bg="#d8dde6" focus={[0.6, 1.0, -0.5]}
      cam={cam([P[8], [-1.0, 1.7, 2.6], [0, 1.6, -1.6], 58], [t.p8trains, [0.2, 1.5, 1.6], [0.3, 1.4, -1.4], 54])}>
      <Airport />
      <Doodle a={{ pos: [0.9, 0, -0.55], seed: 71, look: { body: "#2a3a6a", hair: "bowl", cap: "#1a2440", badge: true, pad: true }, ...padHands, expr: [[0, "hype"]], scale: 1.15 }} />
      <Bubble p={[1.5, 2.1, -0.5]} text="Я В GTA ✈" t={t.p8pilots} w={1.1} />
    </Scene3D>)),
  // ---------- 22. Вокзал: поезда стоят, машиниста нет
  S(t.p8trains, t.p8streets, (
    <Scene3D t0={t.p8trains} light="day" bg="#9fc8e8" focus={[2.0, 1.0, -2.7]}
      cam={cam([t.p8trains, [-1.5, 1.6, 2.4], [0.5, 1.2, -3], 58], [t.p8streets, [0.8, 1.4, 1.2], [2.6, 1.0, -2.8], 54])}>
      <Station />
    </Scene3D>)),
  // ---------- 23. Пустые улицы, как в ковид
  S(t.p8streets, t.p8door, (
    <Scene3D t0={t.p8streets} light="day" bg="#9fc8e8" focus={[0, 0.5, -1]}
      cam={cam([t.p8streets, [0, 1.6, 4.5], [0, 1.4, -4], 60], [t.p8door, [0, 1.3, 3.0], [0, 1.2, -4], 58])}>
      <EmptyStreet t0={t.p8streets} />
    </Scene3D>)),
  // ---------- 24. Дверь офиса: «Закрыто. Мы в Вайс-Сити»
  S(t.p8door, P[9], (
    <Scene3D t0={t.p8door} light="office" bg="#8a9aaa" focus={[0, 1.35, -1.88]} shakes={[[t.p8closed, 0.6]]}
      cam={cam([t.p8door, [0.5, 1.4, 1.2], [0, 1.35, -1.88], 52], [P[9], [0.1, 1.38, 0.3], [0, 1.35, -1.88], 46])}>
      <OfficeDoor />
    </Scene3D>)),

  // ---------- 25. Предзагрузка 100%
  S(P[9], t.p9mid, (
    <Scene3D t0={P[9]} light="night" bg="#0b0624" focus={[0.75, 1.32, -1.82]}
      cam={cam([P[9], [0.75, 1.32, 0.5], [0.75, 1.32, -1.82], 50], [t.p9mid, [0.75, 1.32, 0.15], [0.75, 1.32, -1.82], 48])}>
      <GamerRoom screen={loadDraw("ПРЕДЗАГРУЗКА ✓", [[0, 100]])} clock={() => "23:59"} />
    </Scene3D>), "cut"),
  // ---------- 26. Полночь: миллионы жмут «Играть» — светятся все окна города
  S(t.p9mid, t.p9req, (
    <Scene3D t0={t.p9mid} light="night" bg="#0b0624" focus={[0, 3, -8]} fog="#2a0f4a"
      cam={cam([t.p9mid, [0, 1.5, 4.5], [0, 3.2, -8], 58], [t.p9req, [0, 2.2, 3.0], [0, 3.4, -8], 56])}>
      <ViceStreet night board={(g, s, W, H) => { g.fillStyle = "#0b0b12"; g.fillRect(0, 0, W, H); fitText(g, "00:00", W / 2, H * 0.4, W * 0.7, H * 0.45, RED); fitText(g, "▶ ИГРАТЬ", W / 2, H * 0.82, W * 0.6, H * 0.16, "#3fff8f"); }} />
      {crowd(16, -3.5, 3.5, -2.5, 1.0, 81, [[0, "hype"]]).map((a, i) => <Doodle key={i} a={{ ...a, look: { ...a.look, pad: true }, ...padHands }} />)}
    </Scene3D>)),
  // ---------- 27. «Требуется обновление» 1% → 37% → 99%, роутер дымится
  S(t.p9req, P[10], (
    <Scene3D t0={t.p9req} light="night" bg="#0b0624" focus={[0.75, 1.32, -1.82]} shakes={[[t.p9req, 1.0], [t.p9ninety, 0.6]]}
      cam={cam([t.p9req, [0.75, 1.32, 0.5], [0.75, 1.32, -1.82], 50], [P[10], [0.6, 1.3, 0.9], [0.6, 1.25, -1.82], 54])}>
      <GamerRoom screen={loadDraw("ТРЕБУЕТСЯ ОБНОВЛЕНИЕ", [[0, 0], [t.p9one, 1], [t.p9thirty, 37], [t.p9ninety, 99]], "#ffd23f", "не выключайте консоль")} clock={() => "00:01"} />
      <Box p={[1.7, 1.25, -1.7]} s={[0.3, 0.06, 0.2]} c="#222" />
      <Smoke p={[1.7, 1.3, -1.7]} t0={t.p9thirty} n={10} col="#5a5a66" size={0.5} />
    </Scene3D>), "cut"),

  // ---------- 28. Час на 99% — герой устал
  S(P[10], t.p10kettle, (
    <Scene3D t0={P[10]} light="night" bg="#0b0624" focus={[-0.35, 1.0, -0.75]}
      cam={cam([P[10], [0.2, 1.1, 0.9], [-0.2, 1.05, -0.8], 50], [t.p10kettle, [0.0, 1.08, 0.5], [-0.25, 1.03, -0.8], 46])}>
      <GamerRoom screen={loadDraw("ТРЕБУЕТСЯ ОБНОВЛЕНИЕ", [[0, 99]], "#ffd23f")} clock={() => "01:04"} />
      <Doodle a={hero([-0.35, 0, -0.75], [[0, "tired"]])} />
    </Scene3D>)),
  // ---------- 29. Чайник вскипел ×4
  S(t.p10kettle, t.p10cat, (
    <Scene3D t0={t.p10kettle} light="office" bg="#e8d8b8" focus={[0.2, 1.1, -1.4]}
      cam={cam([t.p10kettle, [0.6, 1.4, 0.8], [0.4, 1.3, -1.6], 50], [t.p10cat, [0.5, 1.35, 0.3], [0.5, 1.4, -1.6], 46])}>
      <Kitchen t0={t.p10kettle} />
    </Scene3D>)),
  // ---------- 30. Кот ушёл к соседям
  S(t.p10cat, t.p10vice, (
    <Scene3D t0={t.p10cat} light="night" bg="#0b0624" focus={[1.5, 0.4, -1.0]}
      cam={cam([t.p10cat, [0.2, 0.9, 1.6], [1.2, 0.6, -1.2], 50], [t.p10vice, [0.6, 0.8, 1.2], [1.8, 0.6, -1.2], 48])}>
      <GamerRoom screen={loadDraw("ТРЕБУЕТСЯ ОБНОВЛЕНИЕ", [[0, 99]], "#ffd23f")} />
      <Cat x0={0.0} x1={2.9} z={-1.0} t0={t.p10cat + 0.2} />
      <Sign p={[2.7, 1.4, -1.0]} w={0.7} h={0.3} text="К СОСЕДЯМ →" bg="#fff" fg={INK} rot={[0, -1.2, 0]} />
    </Scene3D>)),
  // ---------- 31. И вот — Вайс-Сити! Вспышка
  S(t.p10vice, t.p10nosleep, (
    <Scene3D t0={t.p10vice} light="neon" bg="#1a1030" focus={[0.75, 1.32, -1.82]} shakes={[[t.p10vice, 0.8]]}
      cam={cam([t.p10vice, [0.75, 1.32, 0.0], [0.75, 1.32, -1.82], 48], [t.p10nosleep, [0.5, 1.3, 0.9], [0.5, 1.2, -1.7], 56])}>
      <GamerRoom screen={viceDraw} />
      <Doodle a={hero([-0.35, 0, -0.75], [[0, "hype"]], armsUp(t.p10vice + 0.2, 9))} />
      <Confetti t0={t.p10vice} n={40} area={[-1.5, 1.8, -1.5, 0.3]} />
    </Scene3D>), "flash"),
  // ---------- 32. Не спит до утра: рассвет, красные глаза
  S(t.p10nosleep, P[11], (
    <Scene3D t0={t.p10nosleep} light="day" bg="#ffd8b8" focus={[-0.35, 1.0, -0.75]}
      cam={cam([t.p10nosleep, [-0.2, 1.05, 0.8], [-0.35, 1.0, -0.75], 46], [P[11], [-0.3, 1.03, 0.45], [-0.35, 1.0, -0.75], 42])}>
      <GamerRoom screen={viceDraw} clock={() => "05:59"} />
      <Doodle a={hero([-0.35, 0, -0.75], [[0, "hype"], [t.p10nosleep + 1.0, "tired"]])} />
    </Scene3D>)),

  // ---------- 33. 6 утра: бежит за энергетиками (пустая улица на рассвете)
  S(P[11], t.p11counter, (
    <Scene3D t0={P[11]} light="day" bg="#ffcfa8" focus={[0, 0.8, -1]}
      cam={cam([P[11], [-2.0, 1.2, 3.5], [0, 1.0, -2], 58], [t.p11counter, [-0.6, 1.2, 2.4], [0.6, 1.0, -2], 54])}>
      <EmptyStreet t0={P[11] - 5} />
      <Doodle a={hero([-2, 0, -0.8], [[0, "nervous"]], { walk: [[P[11], -2.5, -0.8], [t.p11counter, 2.5, -1.2]], hop: 14 }, HERO_NOPAD)} />
    </Scene3D>)),
  // ---------- 34. Касса: перед ним мужик с тремя упаковками (лицом к кассе — видим издали)
  S(t.p11counter, t.p11turn, (
    <Scene3D t0={t.p11counter} light="office" bg="#e8f0f0" focus={[0.3, 1.1, -0.5]}
      cam={cam([t.p11counter, [-1.2, 1.5, 2.2], [0.2, 1.2, -1.0], 56], [t.p11turn, [-0.6, 1.4, 1.5], [0.3, 1.2, -0.8], 52])}>
      <Store24 />
      <Doodle a={{ pos: [0.3, 0, -0.3], seed: 91, look: BOSS, expr: [[0, "blank"]], scale: 1.2, lean: [[0, 0.25, 0]] }} />
      {[0, 1, 2].map((i) => <Box key={i} p={[0.75, 1.15 + i * 0.22, -0.55]} s={[0.4, 0.2, 0.28]} c={["#3fff8f", "#2f2f2f", "#ffd23f"][i]} />)}
      <Doodle a={hero([-0.7, 0, 0.3], [[0, "tired"]], {}, HERO_NOPAD)} />
    </Scene3D>)),
  // ---------- 35. Оборачивается — твой начальник!
  S(t.p11turn, t.p11also, (
    <Scene3D t0={t.p11turn} light="office" bg="#e8f0f0" focus={[0.3, 1.2, -0.3]} shakes={[[t.p11boss, 1.2]]}
      cam={cam([t.p11turn, [0.0, 1.3, 1.2], [0.3, 1.2, -0.3], 46], [t.p11also, [0.15, 1.25, 0.7], [0.3, 1.2, -0.3], 40])}>
      <Store24 />
      <Doodle a={{ pos: [0.3, 0, -0.3], seed: 91, look: BOSS, expr: [[0, "blank"], [t.p11boss, "shock"]], scale: 1.2 }} />
      {[0, 1, 2].map((i) => <Box key={i} p={[0.75, 1.15 + i * 0.22, -0.55]} s={[0.4, 0.2, 0.28]} c={["#3fff8f", "#2f2f2f", "#ffd23f"][i]} />)}
    </Scene3D>), "cut"),
  // ---------- 36. Тоже «на больничном» — смотрят друг на друга
  S(t.p11also, t.p11nod, (
    <Scene3D t0={t.p11also} light="office" bg="#e8f0f0" focus={[0, 1.1, -0.4]}
      cam={cam([t.p11also, [0, 1.3, 1.9], [0, 1.15, -0.5], 54], [t.p11nod, [0, 1.25, 1.4], [0, 1.15, -0.5], 50])}>
      <Store24 />
      <Doodle a={{ pos: [0.55, 0, -0.4], seed: 91, look: BOSS, expr: [[0, "nervous"]], scale: 1.2 }} />
      <Doodle a={hero([-0.55, 0, -0.4], [[0, "shock"], [t.p11also + 0.6, "nervous"]], {}, HERO_NOPAD)} />
      <Sign p={[0.55, 2.3, -0.4]} w={1.0} h={0.32} text="🤒 БОЛЬНИЧНЫЙ" bg="#fff" fg={RED} glow={0.4} />
      <Sign p={[-0.55, 2.3, -0.4]} w={1.0} h={0.32} text="🤒 БОЛЬНИЧНЫЙ" bg="#fff" fg={RED} glow={0.4} />
    </Scene3D>)),
  // ---------- 37. Молча кивают и расходятся
  S(t.p11nod, P[12], (
    <Scene3D t0={t.p11nod} light="office" bg="#e8f0f0" focus={[0, 1.1, -0.4]}
      cam={cam([t.p11nod, [0, 1.3, 1.4], [0, 1.15, -0.5], 50], [P[12], [0, 1.4, 2.4], [0, 1.15, -0.5], 56])}>
      <Store24 />
      <Doodle a={{ pos: [0.55, 0, -0.4], seed: 91, look: BOSS, expr: [[0, "smug"]], scale: 1.2, walk: [[t.p11nod + 1.0, 0.55, -0.4], [P[12], 2.6, 0.2]] }} />
      <Doodle a={hero([-0.55, 0, -0.4], [[0, "smug"]], { walk: [[t.p11nod + 1.0, -0.55, -0.4], [P[12], -2.6, 0.2]] }, HERO_NOPAD)} />
    </Scene3D>)),

  // ---------- 38. Финал: неоновый закат и вопрос
  S(P[12], END, (
    <Scene3D t0={P[12]} light="neon" bg="#1A0B33" focus={[0, 1.2, -1]} dof={2}
      cam={cam([P[12], [0, 1.2, 1.6], [0, 1.6, -6], 58], [END, [0, 2.0, 5.2], [0, 3.0, -8], 62])}>
      <SynthSunset />
      <QuestionCard p={[0, 4.3, -5]} t={P[12] + 0.15} w={5.2} l1="А ТЫ ВОЗЬМЁШЬ" l2="ОТГУЛ 19-ГО?" pill="СТАВЬ ❤️ И ПИШИ В КОММЕНТЫ" />
      {crowd(16, -3.2, 3.2, -2.4, 0.6, 71, [[0, "hype"]]).map((a, i) => <Doodle key={i} a={{ ...a, sign: i % 4 === 0 ? [["УЖЕ ВЗЯЛ!", "КХА-КХА 🤒", "Я БОЛЕЮ", "ДА!!!"][(i / 4) % 4], ["#fff", YEL, PINK, CYAN][(i / 4) % 4], INK] : undefined }} />)}
    </Scene3D>)),
];
