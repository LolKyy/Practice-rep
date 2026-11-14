// РАСКАДРОВКА «А что, если GTA 6 переоценена?»: формат вопросов, без наездов. Герой — розовая гавайка, очки, цепь.
import React from "react";
import words from "./words.json";
import { setData, wt, ps, TOTAL } from "./timeline.js";
setData(words);
import { Scene3D, Doodle, Actor, Box, Sign, Screen, crowd, armsUp, padHands, pointKeys, HIP, HEAD_Z, CamKey, V3, fitText, useSec } from "../../shared/remotion/kit";
import { NewsStudio, SynthSunset, QuestionCard, Confetti, drawBg, drawStamp, rr, PINK, CYAN, YEL, RED, INK } from "../../shared/remotion/sets";
import { titleDraw, loadDraw } from "../../shared/remotion/sets2";
import { Apartment, City, Store2, Stage2, Car } from "../../shared/remotion/sets3";
import { viceMapDraw, ClubFront, ShoeShop, GasStation, Gym, TrunkCar, Garage, FlippedCar, HotDog, wantedDraw, realismDraw, choresDraw, missionDraw, fpsDraw, yearsDraw } from "../../shared/remotion/sets4";
import type { Look } from "../../shared/remotion/doodle";

export type Shot = { t0: number; t1: number; el: React.ReactNode; tr?: "fade" | "cut" | "flash" };

// ---------------------------------------------------------------- персонажи
const HERO: Look = { body: "#ff4f9a", hair: "slick", outfit: "hawaii", accent: "#ffd23f", shades: true, chain: true };
const HERO_PAD: Look = { ...HERO, pad: true };
const HERO_OLD: Look = { ...HERO, beard: true, wrinkles: true, hairCol: "#b8b0a8" };
const COP: Look = { body: "#2a3a8a", hair: "bowl", cap: "#1a2440", badge: true, mustache: true };
const SELLER: Look = { body: "#ff9ac8", hair: "bun", glasses: true };
const PED: Look = { body: "#2f8fe0", hair: "bald", hairCol: "#3a2a1a", mustache: true };
const ROCK: Look = { body: "#1a1a2a", hair: "slick", glasses: true, tie: YEL };
const ANCHOR: Look = { body: "#2f6fd6", hair: "slick", tie: "#f2c230" };
const hero = (pos: V3, expr: [number, string][], extra: Partial<Actor> = {}, look: Look = HERO): Actor => ({ pos, seed: 1, look, expr, ...(look.pad ? padHands : {}), scale: 1.15, ...extra });

// ---------------------------------------------------------------- времена
const W = (p: number, s: string, o = 0) => wt(p, s, o);
const t = {
  p1a: W(1, "а"),
  p2go: W(2, "рвануть"), p2shoe: W(2, "туфельке"), p2all: W(2, "все", 1), p2q: W(2, "а"), p2shoe2: W(2, "туфелька"), p2exp: W(2, "оправдает"),
  p3jour: W(3, "журналисты"), p3slow: W(3, "медленнее"), p3red: W(3, "почти"), p3q: W(3, "а"),
  p4cop: W(4, "а"), p4face: W(4, "лицо"), p4cloth: W(4, "одежду"), p4car: W(4, "машину"), p4flip: W(4, "перевернул"), p4back: W(4, "обратно"),
  p5rem: W(5, "запомнил"), p5off: W(5, "обиделся"),
  p6mech: W(6, "механики"), p6rut: W(6, "рутину"), p6gas: W(6, "заправь"), p6gym: W(6, "сходи"), p6eat: W(6, "поешь"), p6over: W(6, "переешь"), p6gun: W(6, "лишнее"),
  p7drive: W(7, "доедь"), p7take: W(7, "забери"), p7run: W(7, "убеги"),
  p8wait: W(8, "ждали"), p8fps: W(8, "чтобы"), p8thirty: W(8, "тридцать"), p8pro: W(8, "даже"),
  p9there: W(10, "там"), p9cars: W(10, "тачки"), p9guns: W(10, "стволы"), p9plus: W(10, "плюшки"),
  p9bug: W(9, "баги"), p9fly: W(9, "летающие"), p9sony: W(9, "и"), p9tho: W(9, "хотя"), p9move: W(9, "переносили"),
  p10how: W(11, "как"),
};
const P = [0, ...Array.from({ length: 12 }, (_, i) => ps(i + 1))];
const END = TOTAL;
const cam = (...k: CamKey[]) => k;
const S = (t0: number, t1: number, el: React.ReactNode, tr?: Shot["tr"]): Shot => ({ t0, t1, el, tr });
// показать детей только после секунды t
const After: React.FC<{ t: number; children: React.ReactNode }> = ({ t: at, children }) => { const s = useSec(); return s >= at ? <>{children}</> : null; };

const proDraw = (g: CanvasRenderingContext2D, s: number, W: number, H: number) => { drawBg(g, W, H, "#0e1a3a", "#1d3a7a"); fitText(g, "ROCKSTAR", W / 2, H * 0.3, W * 0.7, H * 0.2, "#fff"); fitText(g, "СТАВКА НА РЕАЛИЗМ", W / 2, H * 0.62, W * 0.8, H * 0.13, YEL); };
const previewDraw = (tRed: number) => (g: CanvasRenderingContext2D, s: number, W: number, H: number) => {
  drawBg(g, W, H, "#0e1a3a", "#1d3a7a"); g.fillStyle = RED; g.fillRect(W * 0.42, H * 0.06, W * 0.36, H * 0.14); fitText(g, "ПРЕВЬЮ", W * 0.6, H * 0.135, W * 0.3, H * 0.1, "#fff");
  fitText(g, s < tRed ? "🐢" : "🤠🐎", W * 0.68, H * 0.47, W * 0.4, H * 0.32, "#fff"); fitText(g, s < tRed ? "МЕДЛЕННЕЕ" : "ПОЧТИ RED DEAD", W * 0.68, H * 0.82, W * 0.55, H * 0.14, YEL); };
const soonDraw = (g: CanvasRenderingContext2D, s: number, W: number, H: number) => { titleDraw()(g, s, W, H); g.fillStyle = "rgba(0,0,0,0.55)"; rr(g, W * 0.1, H * 0.72, W * 0.8, H * 0.18, 20); g.fill(); fitText(g, "УВИДИМ ПОСЛЕ ВЫХОДА 👀", W / 2, H * 0.81, W * 0.75, H * 0.11, "#fff"); };
const qDraw = (g: CanvasRenderingContext2D, s: number, W: number, H: number) => { drawBg(g, W, H, "#1a0f2a", "#3a1a4a"); for (let i = 0; i < 7; i++) fitText(g, "?", W * (0.1 + i * 0.13), H * (0.5 + 0.25 * Math.sin(s * 3 + i)), W * 0.12, H * 0.4, [YEL, PINK, CYAN][i % 3]); };

const glitchDraw = (t0: number) => (g: CanvasRenderingContext2D, s: number, W: number, H: number) => {
  titleDraw()(g, s, W, H); if (s < t0) return; const k = Math.min(1, (s - t0) / 0.8);
  for (let i = 0; i < 8; i++) { const y = ((Math.sin(s * 37 + i * 13) + 1) / 2) * H, h = H * 0.03 * (1 + (i % 3));
    g.drawImage(g.canvas, 0, y, W, h, (Math.sin(s * 53 + i) * W * 0.08) * k, y, W, h); g.fillStyle = ["rgba(255,0,80,0.35)", "rgba(0,255,220,0.35)"][i % 2]; g.fillRect(0, y, W * k, h * 0.4); }
};
const bugsDraw = (tFly: number) => (g: CanvasRenderingContext2D, s: number, W: number, H: number) => {
  g.fillStyle = "#7ac0f0"; g.fillRect(0, 0, W, H * 0.6); g.fillStyle = "#4a4a56"; g.fillRect(0, H * 0.6, W, H * 0.4);
  const fy = s < tFly ? H * 0.62 : H * 0.62 - Math.min(1, (s - tFly) / 0.6) * H * 0.42, x = W * 0.62, r = (s - tFly) * 2;
  g.save(); g.translate(x, fy); if (s >= tFly) g.rotate(r); g.fillStyle = "#ffd23f"; rr(g, -W * 0.14, -H * 0.06, W * 0.28, H * 0.1, 14); g.fill(); rr(g, -W * 0.07, -H * 0.13, W * 0.14, H * 0.08, 12); g.fill();
  g.fillStyle = "#111"; for (const dx of [-0.09, 0.09]) { g.beginPath(); g.arc(W * dx, H * 0.04, W * 0.035, 0, 7); g.fill(); } g.restore();
  g.strokeStyle = "#1a1020"; g.lineWidth = W * 0.012; const px = W * 0.22, py = H * 0.5; g.beginPath(); g.arc(px, py - H * 0.13, W * 0.035, 0, 7); g.stroke();
  g.beginPath(); g.moveTo(px, py - H * 0.09); g.lineTo(px, py); g.moveTo(px - W * 0.12, py - H * 0.07); g.lineTo(px + W * 0.12, py - H * 0.07); g.moveTo(px, py); g.lineTo(px - W * 0.03, py + H * 0.1); g.moveTo(px, py); g.lineTo(px + W * 0.03, py + H * 0.1); g.stroke();
  fitText(g, "T-POSE", px, py + H * 0.16, W * 0.25, H * 0.06, RED);
  if (Math.floor(s * 6) % 2) { g.fillStyle = "rgba(255,0,80,0.25)"; g.fillRect(0, H * 0.3, W, H * 0.05); }
  g.fillStyle = RED; rr(g, W * 0.05, H * 0.05, W * 0.5, H * 0.13, 12); g.fill(); fitText(g, "⚠ ERROR 0xBUG", W * 0.3, H * 0.115, W * 0.45, H * 0.08, "#fff");
};
const refundDraw = (tStamp: number) => (g: CanvasRenderingContext2D, s: number, W: number, H: number) => {
  drawBg(g, W, H, "#0a1a4a", "#1d3a9a"); fitText(g, "PS STORE", W / 2, H * 0.14, W * 0.5, H * 0.11, "#fff");
  g.fillStyle = "#fff"; rr(g, W * 0.12, H * 0.27, W * 0.76, H * 0.36, 20); g.fill(); fitText(g, "ИГРА УДАЛЕНА", W / 2, H * 0.45, W * 0.66, H * 0.13, RED);
  if (s >= tStamp) { const k = Math.min(1, (s - tStamp) / 0.3); g.globalAlpha = k; fitText(g, "💸 ВОЗВРАТ ДЕНЕГ", W / 2, H * 0.8, W * 0.8 * (2 - k), H * 0.12, YEL); g.globalAlpha = 1; }
};

// ================================================================= ШОТЫ
export const SHOTS: Shot[] = [
  // 1. 13 лет ждал: герой у ТВ с заставкой, горящие глаза
  S(0, t.p1a, (
    <Scene3D t0={0} light="night" bg="#0b0f2a" focus={[0.2, 1.0, -0.8]}
      cam={cam([0, [0.7, 1.2, 1.4], [0.3, 1.1, -1.4], 56], [t.p1a, [0.4, 1.15, 0.8], [0.2, 1.05, -1.2], 50])}>
      <Apartment tv={titleDraw()} night clock={() => "23:59"} />
      <Doodle a={hero([-0.2, 0, -0.75], [[0, "hype"]], {}, HERO_PAD)} />
    </Scene3D>), "cut"),
  // 2. «А что, если зря?» — крупно, улыбка сползает
  S(t.p1a, P[2], (
    <Scene3D t0={t.p1a} light="night" bg="#0b0f2a" focus={[-0.2, 1.0, -0.75]} shakes={[[t.p1a + 0.6, 0.5]]}
      cam={cam([t.p1a, [-0.1, 1.08, 0.6], [-0.2, 1.0, -0.75], 44], [P[2], [-0.15, 1.05, 0.35], [-0.2, 1.0, -0.75], 40])}>
      <Apartment tv={titleDraw()} night />
      <Doodle a={hero([-0.2, 0, -0.75], [[0, "hype"], [t.p1a + 0.5, "realize"]], {}, HERO_PAD)} />
    </Scene3D>)),

  // 3. Пролог пройден!
  S(P[2], t.p2go, (
    <Scene3D t0={P[2]} light="night" bg="#0b0f2a" focus={[0.6, 1.1, -1.5]}
      cam={cam([P[2], [0.8, 1.2, 0.6], [0.8, 1.15, -1.85], 52], [t.p2go, [0.5, 1.2, 1.0], [0.6, 1.1, -1.6], 54])}>
      <Apartment tv={loadDraw("ПРОЛОГ ПРОЙДЕН ✓", [[0, 100]])} night />
      <Doodle a={hero([-0.2, 0, -0.9], [[0, "hype"]], armsUp(P[2] + 0.6, 9), HERO_PAD)} />
      <Confetti t0={P[2] + 0.5} n={30} area={[-1.5, 1.8, -1.5, 0.3]} />
    </Scene3D>)),
  // 4. Карта: туфелька в красном круге со стрелкой (как в меме)
  S(t.p2go, t.p2all, (
    <Scene3D t0={t.p2go} light="night" bg="#0b0f2a" focus={[1.0, 1.18, -1.85]}
      cam={cam([t.p2go, [1.0, 1.18, -0.1], [1.0, 1.18, -1.85], 46], [t.p2all, [1.0, 1.18, -0.5], [1.0, 1.18, -1.85], 44])}>
      <Apartment tv={viceMapDraw(t.p2shoe)} night />
    </Scene3D>), "cut"),
  // 5. Все её ждут: очередь к клубу-«туфельке», герой бежит туда
  S(t.p2all, t.p2q, (
    <Scene3D t0={t.p2all} light="night" bg="#120a2a" focus={[0, 1.4, -2]}
      cam={cam([t.p2all, [0, 1.6, 3.6], [0, 2.0, -2.5], 58], [t.p2q, [0, 1.5, 2.8], [0, 1.9, -2.5], 56])}>
      <ClubFront />
      {crowd(7, -2.6, 2.6, -1.3, -0.4, 31, [[0, "hype"]]).map((a, i) => <Doodle key={i} a={a} />)}
      <Doodle a={hero([-2.6, 0, 0.4], [[0, "hype"]], { walk: [[t.p2all, -3.2, 0.5], [t.p2q, -0.4, 0.2]], hop: 14 })} />
    </Scene3D>)),
  // 6. А внутри… обувной магазин. «Вам какой размер?»
  S(t.p2q, P[3], (
    <Scene3D t0={t.p2q} light="office" bg="#ffd8e8" focus={[0, 1.0, -0.6]} shakes={[[t.p2exp, 0.6]]}
      cam={cam([t.p2q, [0, 1.45, 2.4], [0, 1.2, -0.8], 58], [P[3], [0, 1.35, 1.6], [0, 1.15, -0.7], 54])}>
      <ShoeShop />
      <Doodle a={{ pos: [0.6, 0, -0.6], seed: 41, look: SELLER, expr: [[0, "proud"]], scale: 1.12, talk: [[t.p2shoe2, t.p2shoe2 + 1.2]], handB: pointKeys(t.p2shoe2, 0.3, 0.6, 2, "b") }} />
      <Doodle a={hero([-0.6, 0, -0.5], [[0, "hype"], [t.p2shoe2 + 0.3, "blank"], [t.p2exp, "shock"]])} />
    </Scene3D>), "cut"),

  // 7. Rockstar: ставка на реализм
  S(P[3], t.p3jour, (
    <Scene3D t0={P[3]} light="studio" bg="#0a0d18" focus={[0, 1.6, -1.6]}
      cam={cam([P[3], [0, 1.6, 2.2], [0, 1.6, -1.9], 56], [t.p3jour, [0, 1.6, 1.7], [0, 1.6, -1.9], 54])}>
      <Stage2 screen={proDraw} />
    </Scene3D>)),
  // 8. Журналисты: медленнее, серьёзнее, почти Red Dead
  S(t.p3jour, t.p3q, (
    <Scene3D t0={t.p3jour} light="studio" bg="#0c1224" focus={[0, 1.6, -1.6]}
      cam={cam([t.p3jour, [0.3, 1.8, 2.6], [0.2, 1.65, -1.6], 56], [t.p3q, [0.3, 1.75, 1.8], [0.25, 1.65, -1.6], 54])}>
      <NewsStudio ticker="ПРЕВЬЮ GTA 6: МЕДЛЕННЕЕ  •  СЕРЬЁЗНЕЕ  •  ПОЧТИ КАК RED DEAD  •  " screen={previewDraw(t.p3red)} />
      <Doodle a={{ pos: [-0.75, 0, -1.15], seed: 5, look: ANCHOR, expr: [[0, "stern"], [t.p3red, "realize"]], talk: [[t.p3jour, t.p3q]], scale: 1.2 }} />
    </Scene3D>)),
  // 9. «А что, если реализм начнёт мешать игре?» — шкала: реализм ↑, веселье ↓
  S(t.p3q, P[4], (
    <Scene3D t0={t.p3q} light="night" bg="#0b0f2a" focus={[0.6, 1.1, -1.5]}
      cam={cam([t.p3q, [0.7, 1.2, 0.4], [0.9, 1.15, -1.85], 50], [P[4], [0.5, 1.2, 1.0], [0.6, 1.1, -1.6], 54])}>
      <Apartment tv={realismDraw(t.p3q + 0.2)} night />
      <Doodle a={hero([-0.2, 0, -0.9], [[0, "neutral"], [t.p3q + 1.2, "nervous"]], {}, HERO_PAD)} />
    </Scene3D>)),

  // 10. Хочу хаос, как в GTA 5!
  S(P[4], t.p4cop, (
    <Scene3D t0={P[4]} light="day" bg="#5aa0e8" focus={[0, 1, -0.6]}
      cam={cam([P[4], [0, 1.4, 3.2], [0, 1.4, -3], 58], [t.p4cop, [0, 1.3, 2.4], [0, 1.3, -3], 54])}>
      <City />
      <Doodle a={hero([0, 0, -0.4], [[0, "hype"]], { ...armsUp(P[4] + 0.2, 9), hop: 10 })} />
    </Scene3D>)),
  // 11. Коп с плакатом: лицо ✓ одежда ✓ машина ✓
  S(t.p4cop, t.p4flip, (
    <Scene3D t0={t.p4cop} light="day" bg="#5aa0e8" focus={[0.1, 1.1, -0.7]}
      cam={cam([t.p4cop, [0.1, 1.25, 1.6], [0.15, 1.15, -0.8], 52], [t.p4flip, [0.1, 1.2, 1.1], [0.15, 1.15, -0.8], 48])}>
      <City cars={false} />
      <Doodle a={{ pos: [-0.45, 0, -0.85], seed: 61, look: COP, expr: [[0, "stern"]], scale: 1.15, handB: [[0, 0.32, HIP + 0.35]] }} />
      <Screen p={[0.3, 1.05, -0.6]} w={0.55} h={0.75} res={500} draw={wantedDraw([t.p4face, t.p4cloth, t.p4car])} glow={0.4} />
    </Scene3D>), "cut"),
  // 12. Перевернул тачку — обратно не поставить
  S(t.p4flip, P[5], (
    <Scene3D t0={t.p4flip} light="day" bg="#5aa0e8" focus={[-0.3, 0.8, -1.2]} shakes={[[t.p4back, 0.4]]}
      cam={cam([t.p4flip, [0.2, 1.6, 3.4], [0.2, 0.9, -1.2], 60], [P[5], [0.1, 1.5, 2.8], [0.1, 0.9, -1.2], 58])}>
      <City cars={false} />
      <FlippedCar p={[0.5, 0, -1.4]} col="#2f8fe0" t0={t.p4flip + 0.3} />
      <Doodle a={hero([-0.95, 0, -1.0], [[0, "nervous"], [t.p4back, "angry"]], { handF: [[0, 0.32, HIP + 0.3]], handB: [[0, 0.45, HIP + 0.32]], shiver: 2 })} />
    </Scene3D>)),

  // 13. Толкнул прохожего — запомнил — обиделся
  S(P[5], P[6], (
    <Scene3D t0={P[5]} light="day" bg="#5aa0e8" focus={[0, 1.0, -0.6]} shakes={[[P[5] + 0.55, 0.6]]}
      cam={cam([P[5], [0, 1.35, 2.2], [0, 1.15, -0.8], 56], [P[6], [0.2, 1.25, 1.4], [0.2, 1.1, -0.8], 50])}>
      <City cars={false} />
      <Doodle a={hero([-1.6, 0, -0.6], [[0, "smug"]], { walk: [[P[5], -1.6, -0.6], [P[5] + 0.55, -0.4, -0.6], [P[5] + 0.9, -0.55, -0.6]] })} />
      <Doodle a={{ pos: [0.35, 0, -0.6], seed: 71, look: PED, expr: [[0, "neutral"], [P[5] + 0.55, "shock"], [t.p5rem - 0.4, "angry"], [t.p5off + 0.3, "cry"]], scale: 1.1, back: [[t.p5off + 0.2, 999]], shiver: 0 }} />
    </Scene3D>)),

  // 14. А что, если механики превратят игру в рутину? Список дел на ТВ
  S(P[6], t.p6gas, (
    <Scene3D t0={P[6]} light="night" bg="#0b0f2a" focus={[0.6, 1.1, -1.5]}
      cam={cam([P[6], [0.8, 1.2, 0.5], [0.85, 1.15, -1.85], 50], [t.p6gas, [0.5, 1.2, 1.0], [0.6, 1.1, -1.6], 54])}>
      <Apartment tv={choresDraw([[P[6] + 0.3, "⛽ ЗАПРАВИТЬСЯ"], [P[6] + 0.8, "💪 ЗАЛ"], [P[6] + 1.3, "🌭 ПОЕСТЬ"], [P[6] + 1.8, "🔫 В БАГАЖНИК"]])} night />
      <Doodle a={hero([-0.2, 0, -0.9], [[0, "neutral"], [t.p6rut, "tired"]], {}, HERO_PAD)} />
    </Scene3D>)),
  // 15. Заправь машину
  S(t.p6gas, t.p6gym, (
    <Scene3D t0={t.p6gas} light="day" bg="#8ac0f0" focus={[-0.4, 1.0, -1.0]}
      cam={cam([t.p6gas, [-0.2, 1.4, 2.2], [-0.2, 1.0, -1.2], 56], [t.p6gym, [-0.3, 1.3, 1.7], [-0.3, 1.0, -1.2], 52])}>
      <GasStation t0={t.p6gas} />
      <Doodle a={hero([-0.35, 0, -0.75], [[0, "tired"]])} />
    </Scene3D>), "cut"),
  // 16. Сходи в зал
  S(t.p6gym, t.p6eat, (
    <Scene3D t0={t.p6gym} light="office" bg="#3a4256" focus={[0, 1.0, -0.7]}
      cam={cam([t.p6gym, [0.3, 1.3, 1.5], [0.35, 1.1, -0.9], 52], [t.p6eat, [0.3, 1.25, 1.2], [0.35, 1.1, -0.9], 48])}>
      <Gym />
      <Doodle a={hero([0, 0, -0.7], [[0, "nervous"]], { ...armsUp(t.p6gym + 0.15, 0.25), shiver: 2 })} />
      <Sign p={[0, 2.0, -0.6]} w={0.9} h={0.24} text="ДЕНЬ 1 ИЗ 3" bg="#fff" fg={INK} glow={0.4} />
    </Scene3D>), "cut"),
  // 17. Поешь, но не переешь: гора хот-догов → «+5 КГ»
  S(t.p6eat, t.p6gun, (
    <Scene3D t0={t.p6eat} light="office" bg="#e8f0f0" focus={[0.1, 1.0, -0.6]} shakes={[[t.p6over, 0.6]]}
      cam={cam([t.p6eat, [0.1, 1.3, 1.6], [0.15, 1.1, -0.8], 52], [t.p6gun, [0.1, 1.25, 1.2], [0.15, 1.1, -0.8], 48])}>
      <Store2 />
      {Array.from({ length: 9 }, (_, i) => <HotDog key={i} p={[0.0 + (i % 3) * 0.36, 1.1 + Math.floor(i / 3) * 0.12, -0.8 + (i % 2) * 0.06]} scale={1.4} />)}
      <Doodle a={hero([-0.45, 0, -0.45], [[0, "hype"], [t.p6over, "shock"]])} />
      <After t={t.p6over}><Sign p={[-0.45, 2.0, -0.4]} w={0.8} h={0.26} text="⚠️ +5 КГ" bg={RED} fg="#fff" glow={0.6} /></After>
    </Scene3D>), "cut"),
  // 18. Лишнее оружие — в багажник
  S(t.p6gun, P[7], (
    <Scene3D t0={t.p6gun} light="day" bg="#9ad0f8" focus={[0, 0.8, -0.6]}
      cam={cam([t.p6gun, [0.2, 2.1, 2.4], [-0.3, 0.8, -0.6], 58], [P[7], [0.1, 2.0, 2.0], [-0.3, 0.8, -0.6], 56])}>
      <TrunkCar t0={t.p6gun} />
      <Doodle a={hero([-0.95, 0, -0.4], [[0, "tired"]], { handB: pointKeys(t.p6gun + 0.3, 0.6, 0.2, 1.2, "b") })} />
    </Scene3D>), "cut"),

  // 19. Миссии: доедь / забери / убеги — герой зевает
  S(P[7], P[8], (
    <Scene3D t0={P[7]} light="night" bg="#0b0f2a" focus={[0.6, 1.1, -1.5]}
      cam={cam([P[7], [0.5, 1.2, 1.0], [0.6, 1.1, -1.6], 54], [P[8], [0.85, 1.18, 0.2], [0.95, 1.15, -1.85], 50])}>
      <Apartment tv={missionDraw([t.p7drive, t.p7take, t.p7run])} night />
      <Doodle a={hero([-0.2, 0, -0.9], [[0, "neutral"], [t.p7take, "tired"]], {}, HERO_PAD)} />
    </Scene3D>)),

  // 20. Ждали 13 лет: на ТВ 2013 → 2026, герой постарел
  S(P[8], t.p8fps, (
    <Scene3D t0={P[8]} light="night" bg="#0b0f2a" focus={[0.4, 1.1, -1.4]}
      cam={cam([P[8], [0.3, 1.2, 1.1], [0.4, 1.1, -1.6], 54], [t.p8fps, [0.25, 1.15, 0.8], [0.35, 1.1, -1.6], 50])}>
      <Apartment tv={yearsDraw(t.p8wait - 0.2, t.p8fps - 0.3)} night />
      <Doodle a={hero([-0.2, 0, -0.9], [[0, "tired"]], {}, { ...HERO_OLD, pad: true })} />
    </Scene3D>)),
  // 21. …чтобы играть в 30 кадров: ТВ крупно, картинка дёргается
  S(t.p8fps, t.p8pro, (
    <Scene3D t0={t.p8fps} light="night" bg="#0b0f2a" focus={[1.0, 1.18, -1.85]}
      cam={cam([t.p8fps, [1.0, 1.18, -0.2], [1.0, 1.18, -1.85], 46], [t.p8pro, [1.0, 1.18, -0.45], [1.0, 1.18, -1.85], 44])}>
      <Apartment tv={fpsDraw} night />
    </Scene3D>), "cut"),
  // 22. Даже на PS5 Pro: коробка Pro, герой плачет
  S(t.p8pro, P[9], (
    <Scene3D t0={t.p8pro} light="office" bg="#eceaf4" focus={[0, 1.0, -0.8]} shakes={[[t.p8pro + 0.5, 0.5]]}
      cam={cam([t.p8pro, [0.2, 1.25, 1.5], [0.1, 1.15, -0.8], 52], [P[9], [0.1, 1.2, 1.0], [0.1, 1.1, -0.8], 48])}>
      <Apartment tv={fpsDraw} />
      <Doodle a={hero([-0.15, 0, -0.85], [[0, "cry"]], { handB: [[0, 0.3, HIP + 0.3]] })} />
      <group position={[0.35, 0.62, -0.7]} rotation={[0, -0.3, 0.1]}><Box p={[0, 0, 0]} s={[0.3, 0.38, 0.14]} c="#f4f4f8" /><Sign p={[0, 0.03, 0.071]} w={0.27} h={0.1} text="PS5 PRO" bg="#1a1a2a" fg="#fff" glow={0.4} /></group>
    </Scene3D>)),

  // 22a. А вдруг как с Киберпанком? — картинка на ТВ начинает глючить
  S(P[9], t.p9bug, (
    <Scene3D t0={P[9]} light="night" bg="#0b0f2a" focus={[0.6, 1.1, -1.5]} shakes={[[P[9] + 1.6, 0.5]]}
      cam={cam([P[9], [0.5, 1.2, 1.0], [0.6, 1.1, -1.6], 54], [t.p9bug, [0.8, 1.18, 0.3], [0.95, 1.15, -1.85], 50])}>
      <Apartment tv={glitchDraw(P[9] + 1.2)} night />
      <Doodle a={hero([-0.2, 0, -0.9], [[0, "neutral"], [P[9] + 1.3, "nervous"]], {}, HERO_PAD)} />
    </Scene3D>)),
  // 22b. Баги, летающие тачки: ТВ крупно
  S(t.p9bug, t.p9sony, (
    <Scene3D t0={t.p9bug} light="night" bg="#0b0f2a" focus={[1.0, 1.18, -1.85]}
      cam={cam([t.p9bug, [1.0, 1.18, -0.2], [1.0, 1.18, -1.85], 46], [t.p9sony, [1.0, 1.18, -0.45], [1.0, 1.18, -1.85], 44])}>
      <Apartment tv={bugsDraw(t.p9fly)} night />
    </Scene3D>), "cut"),
  // 22c. Sony возвращает деньги
  S(t.p9sony, t.p9tho, (
    <Scene3D t0={t.p9sony} light="night" bg="#0b0f2a" focus={[0.6, 1.1, -1.5]}
      cam={cam([t.p9sony, [0.8, 1.18, 0.3], [0.95, 1.15, -1.85], 50], [t.p9tho, [0.5, 1.2, 1.0], [0.6, 1.1, -1.6], 54])}>
      <Apartment tv={refundDraw(t.p9sony + 0.3)} night />
      <Doodle a={hero([-0.2, 0, -0.9], [[0, "shock"], [t.p9sony + 0.8, "cry"]], {}, HERO_PAD)} />
    </Scene3D>), "cut"),
  // 22d. Хотя игру переносили как раз поэтому — штамп «ПЕРЕНЕСЕНО»
  S(t.p9tho, P[10], (
    <Scene3D t0={t.p9tho} light="studio" bg="#0a0d18" focus={[0, 1.6, -1.6]} shakes={[[t.p9move + 0.2, 0.7]]}
      cam={cam([t.p9tho, [0, 1.6, 2.2], [0, 1.6, -1.9], 56], [P[10], [0, 1.6, 1.7], [0, 1.6, -1.9], 54])}>
      <Stage2 screen={(g, s, W, H) => { drawBg(g, W, H, "#0e1a3a", "#1d3a7a"); fitText(g, "GTA 6", W / 2, H * 0.3, W * 0.6, H * 0.22, "#fff"); drawStamp(g, W, H, s, t.p9move + 0.1, "ПЕРЕНЕСЕНО", H * 0.65); }} />
    </Scene3D>)),

  // 23. Зато Ultimate за $100 — без вопросов: шоурум, золотая тачка
  S(P[10], t.p9there, (
    <Scene3D t0={P[10]} light="office" bg="#1a1a2a" focus={[0, 0.9, -0.6]}
      cam={cam([P[10], [1.6, 1.5, 2.8], [0, 0.9, -0.8], 58], [t.p9there, [0.8, 1.4, 2.2], [0, 0.9, -0.8], 56])}>
      <Garage />
      <Doodle a={hero([1.35, 0, 0.2], [[0, "hype"]])} />
    </Scene3D>)),
  // 24. Тачки, стволы и прочие плюшки — конфетти
  S(t.p9there, P[11], (
    <Scene3D t0={t.p9there} light="office" bg="#1a1a2a" focus={[-0.5, 1.0, -0.8]}
      cam={cam([t.p9there, [-0.2, 1.4, 2.0], [-0.4, 1.0, -0.8], 56], [P[11], [-0.5, 1.4, 1.5], [-0.6, 1.0, -1.0], 54])}>
      <Garage />
      <Doodle a={hero([-1.1, 0, 0.1], [[0, "proud"], [t.p9plus, "hype"]], armsUp(t.p9plus, 9))} />
      <Confetti t0={t.p9plus} n={40} area={[-2, 1.8, -1.5, 0.5]} />
    </Scene3D>)),

  // 25. Это всё только вопросы — герой разводит руками, на ТВ знаки вопроса
  S(P[11], t.p10how, (
    <Scene3D t0={P[11]} light="night" bg="#0b0f2a" focus={[0.2, 1.0, -1.0]}
      cam={cam([P[11], [0.5, 1.2, 1.2], [0.4, 1.1, -1.4], 54], [t.p10how, [0.4, 1.15, 0.8], [0.3, 1.05, -1.3], 50])}>
      <Apartment tv={qDraw} night />
      <Doodle a={hero([-0.2, 0, -0.85], [[0, "nervous"]], { handF: [[0, -0.42, HIP + 0.3]], handB: [[0, 0.42, HIP + 0.3]] })} />
    </Scene3D>)),
  // 26. Как на самом деле — увидим после выхода
  S(t.p10how, P[12], (
    <Scene3D t0={t.p10how} light="night" bg="#0b0f2a" focus={[0.6, 1.1, -1.5]}
      cam={cam([t.p10how, [0.9, 1.18, 0.2], [1.0, 1.18, -1.85], 50], [P[12], [0.5, 1.2, 1.0], [0.6, 1.1, -1.6], 54])}>
      <Apartment tv={soonDraw} night />
      <Doodle a={hero([-0.2, 0, -0.9], [[0, "smug"]], {}, HERO_PAD)} />
    </Scene3D>)),

  // 27. Финал: неоновый закат GTA и вопрос
  S(P[12], END, (
    <Scene3D t0={P[12]} light="neon" bg="#1A0B33" focus={[0, 1.2, -1]}
      cam={cam([P[12], [0, 1.2, 1.6], [0, 1.6, -6], 58], [END, [0, 2.0, 5.2], [0, 3.0, -8], 62])}>
      <SynthSunset />
      <QuestionCard p={[0, 4.3, -5]} t={P[12] + 0.15} w={5.2} l1="GTA 6" l2="ПЕРЕОЦЕНЕНА?" pill="ПИШИ В КОММЕНТЫ 👇" />
      {crowd(16, -3.2, 3.2, -2.4, 0.6, 71, [[0, "hype"]]).map((a, i) => <Doodle key={i} a={{ ...a, sign: i % 4 === 0 ? [["ДА", "НЕТ!", "ШЕДЕВР", "ПОСМОТРИМ"][(i / 4) % 4], ["#fff", YEL, PINK, CYAN][(i / 4) % 4], INK] : undefined }} />)}
      <Doodle a={hero([0, 0, 0.9], [[0, "smug"]])} />
    </Scene3D>)),
];

// ---------------------------------------------------------------- облачка-реплики: плоский слой поверх видео (всегда в кадре)
// x, y — центр в пикселях кадра 1080×1920; зона субтитров (y≈1430–1530) и правый край (x>940) не заняты
export type Bub = { t0: number; t1: number; text: string; x: number; y: number; col?: string };
export const BUBBLES: Bub[] = [
  { t0: t.p2shoe2, t1: P[3], text: "ВАМ КАКОЙ РАЗМЕР? 👠", x: 600, y: 420 },
  { t0: P[4] + 0.3, t1: t.p4cop, text: "ХАОС! 💥", x: 540, y: 400, col: YEL },
  { t0: t.p4back, t1: P[5], text: "НУ ВСТАВАЙ ЖЕ 😤", x: 480, y: 420 },
  { t0: t.p5rem, t1: t.p5off + 0.2, text: "Я ЗАПОМНИЛ 😤", x: 640, y: 420 },
];
