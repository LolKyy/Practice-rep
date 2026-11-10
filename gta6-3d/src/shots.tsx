// РАСКАДРОВКА: 45 шотов по таймингам голоса. Время — секунды голоса (wt = время слова, ps = начало абзаца).
import React from "react";
import words from "./words.json";
import { setData, wt, ps, TOTAL } from "./timeline.js";
setData(words);
import { Scene3D, Doodle, Actor, Box, Sign, Screen, crowd, armsUp, padHands, pointKeys, REST_F, REST_B, HIP, HEAD_Z, CamKey, V3, popAt, bonkAt, useSec, fitText, clamp } from "./kit";
import { Web, GamerRoom, ViceStreet, NewsStudio, TvWall, Office, HQ, Security, ServerRoom, StockFloor, GameBox, Smoke, Confetti, Bubble, monitorDraw, calDraw, drawBg, drawLogo, drawStamp, rr, PINK, CYAN, YEL, RED, INK } from "./sets";
import type { Look } from "./doodle";

const ORGC = "#ff7a2f";
export type Shot = { t0: number; t1: number; el: React.ReactNode; tr?: "fade" | "cut" | "flash" };

// ---------------------------------------------------------------- персонажи
const HERO: Look = { body: "#3fb27f", hair: "bowl", pad: true };
const heroAge = (n: number): Look => n === 0 ? HERO : { ...HERO, hairCol: ["#1b1615", "#6d6a66", "#a8a39c", "#e8e4dc"][n], beard: n >= 2, wrinkles: n >= 2, glasses: n >= 3 };
const DIR: Look = { body: "#26263a", hair: "slick", tie: "#e64b4b" };
const DIR_OLD: Look = { ...DIR, hairCol: "#e8e4dc", beard: true, wrinkles: true, glasses: true };
const ANCHOR: Look = { body: "#2f6fd6", hair: "slick", tie: "#f2c230" };
const GUARD: Look = { body: "#2a3a5a", hair: "bowl", cap: "#1a2440", badge: true };
const hero = (pos: V3, expr: [number, string][], n = 0, extra: Partial<Actor> = {}): Actor => ({ pos, seed: 1, look: heroAge(n), expr, ...padHands, scale: 1.15, ...extra });

// ---------------------------------------------------------------- времена
const W = (p: number, s: string, o = 0) => wt(p, s, o);
const t = {
  p1what: W(1, "что"), p1nov: W(1, "девятнадцатого"), p1per: W(1, "перенесли"),
  p2twenty: W(2, "двадцать"), p2hold: W(2, "держат"), p2mid2: W(2, "полночь", 1), p2date: W(2, "дата"), p2chg: W(2, "изменена"),
  p3hundred: W(3, "сто"), p3thousand: W(3, "тысяча"), p3ten: W(3, "десять"), p3phone: W(3, "а"), p3smoke: W(3, "задымится"),
  p4rock: W(4, "rockstar"), p4anchor: W(4, "ведущий"), p4as: W(4, "будто"), p4end: W(4, "конец"),
  p5laugh: W(5, "смеется"), p5wait: W(5, "подождут"), p5nobody: W(5, "никто"), p5stupid: W(5, "глуп"),
  p6one: W(6, "один"), p6ten: W(6, "десять"), p6hund: W(6, "сотни"), p6guard: W(6, "охранник"), p6how: W(6, "сколько"), p6ok: W(6, "понятно"),
  p7plus: W(7, "плюс"), p7two: W(7, "два"), p7server: W(7, "сервер"), p7mercy: W(7, "пощады"),
  p8half: W(8, "half"), p8rdr: W(8, "rdr"), p8witch: W(8, "ведьмак"), p8gta: W(8, "gta"), p8our: W(8, "наша"),
  p9in: W(9, "в"), p9fell: W(9, "упали"), p9ten: W(9, "десять"), p9here: W(9, "тут"), p9third: W(9, "третий"),
  p10y30: W(10, "тридцатый"), p10y40: W(10, "сороковой"), p10gamers: W(10, "геймеры"), p10web: W(10, "паутина"), p10dir: W(10, "директор"), p10wait: W(10, "подождут"),
  p11out: W(11, "вышла"), p11you: W(11, "ты"), p11press: W(11, "жмешь"), p11req: W(11, "требуется"), p11ps: W(11, "playstation"), p11nu: W(11, "ну"),
  p12write: W(12, "пиши"),
};
const P = [0, ...Array.from({ length: 12 }, (_, i) => ps(i + 1))]; // P[1]..P[12]
const END = TOTAL;

// ---------------------------------------------------------------- рамки
const cam = (...k: CamKey[]) => k;
const S = (t0: number, t1: number, el: React.ReactNode, tr?: Shot["tr"]): Shot => ({ t0, t1, el, tr });
// счётчик (форматирование)
const fmt = (n: number) => Math.round(n).toLocaleString("ru-RU").replace(/,/g, " ");

// ================================================================= ШОТЫ
export const SHOTS: Shot[] = [
  // ---------- 1. ХУК: «GTA 6 перенесли!» — монитор, печать «ПЕРЕНЕСЕНО», герой в шоке
  S(0, t.p1what, (
    <Scene3D t0={0} light="neon" bg="#1a1030" focus={[0.4, 1.2, -1.6]} shakes={[[t.p1per, 1.4]]} roll={[-0.06, 0]}
      cam={cam([0, [1.0, 1.5, 2.8], [0.3, 1.2, -1.5], 64], [0.25, [0.45, 1.35, 2.0], [0.3, 1.15, -1.5], 58], [t.p1what, [0.3, 1.3, 1.6], [0.3, 1.15, -1.5], 56])}>
      <GamerRoom mon={{ kind: "title", stamp: t.p1per }} />
      <Doodle a={hero([-0.35, 0, -0.75], [[0, "hype"], [t.p1per + 0.05, "shock"]], 0, armsUp(t.p1per + 0.05, 2))} />
    </Scene3D>)),
  // ---------- 2. Vice City: толпа в недоумении «что будет, если…»
  S(t.p1what, t.p1nov, (
    <Scene3D t0={t.p1what} light="day" bg="#2a1458" focus={[0, 1, -0.5]} fog="#b0368a"
      cam={cam([t.p1what, [-2.6, 0.7, 4.5], [0, 1.4, -4], 60], [t.p1nov, [-0.4, 1.4, 2.6], [0.3, 1.3, -3], 56])}>
      <ViceStreet board={(g, s, W, H) => { drawBg(g, W, H, "#2a1458", "#7b2cff"); drawLogo(g, W, H, H * 0.55, H / 330); fitText(g, "?", W * 0.88, H * 0.3, W * 0.2, H * 0.5, YEL); }} />
      {crowd(9, -2.6, 2.6, -1.6, 0.4, 3, [[0, "realize"], [t.p1what + 1.2, "nervous"]]).map((a, i) => <Doodle key={i} a={a} />)}
    </Scene3D>)),
  // ---------- 3. Календарь: 19 НОЯБРЯ, обведено
  S(t.p1nov, P[2], (
    <Scene3D t0={t.p1nov} light="neon" bg="#1a1030" focus={[2.15, 1.8, -1.97]}
      cam={cam([t.p1nov, [1.5, 1.6, 0.6], [2.15, 1.8, -1.97], 50], [P[2], [1.95, 1.78, -0.6], [2.15, 1.8, -1.97], 46])}>
      <GamerRoom mon={{ kind: "title" }} cal={calDraw("НОЯБРЬ 2026", "19", true)} />
    </Scene3D>)),

  // ---------- 4. Часы 23:59
  S(P[2], t.p2twenty, (
    <Scene3D t0={P[2]} light="night" bg="#0b0624" focus={[1.45, 0.88, -1.42]} dof={8}
      cam={cam([P[2], [1.15, 1.05, -0.6], [1.45, 0.88, -1.42], 48], [t.p2twenty, [1.38, 0.95, -0.95], [1.45, 0.88, -1.42], 44])}>
      <GamerRoom mon={{ kind: "play" }} clock={(s) => (Math.floor(s * 2) % 2 ? "23:59" : "23 59")} cal={calDraw("НОЯБРЬ 2026", "18")} />
      <Doodle a={hero([-0.3, 0, -0.6], [[0, "hype"]])} />
    </Scene3D>)),
  // ---------- 5. 20 миллионов ждут: ночная улица, у всех геймпады
  S(t.p2twenty, t.p2hold, (
    <Scene3D t0={t.p2twenty} light="night" bg="#0b0624" focus={[0, 1, -0.8]} fog="#2a0f4a"
      cam={cam([t.p2twenty, [0, 3.8, 5], [0, 0.8, -2], 60], [t.p2hold, [0.6, 2.2, 3.4], [0, 1, -1.5], 58])}>
      <ViceStreet night board={(g, s, W, H) => { g.fillStyle = "#0b0b12"; g.fillRect(0, 0, W, H); g.shadowColor = RED; g.shadowBlur = 30; fitText(g, "23:59", W / 2, H / 2, W * 0.8, H * 0.6, RED); }} />
      {crowd(24, -3.5, 3.5, -2.5, 1.2, 7, [[0, "hype"]]).map((a, i) => <Doodle key={i} a={{ ...a, look: { ...a.look, pad: true }, ...padHands }} />)}
    </Scene3D>)),
  // ---------- 6. Палец над «ИГРАТЬ»
  S(t.p2hold, t.p2mid2, (
    <Scene3D t0={t.p2hold} light="neon" bg="#1a1030" focus={[0.75, 1.3, -1.8]}
      cam={cam([t.p2hold, [0.2, 1.3, 0.4], [0.7, 1.25, -1.8], 54], [t.p2mid2, [0.6, 1.3, -0.4], [0.75, 1.28, -1.8], 46])}>
      <GamerRoom mon={{ kind: "play" }} clock={() => "23:59"} />
      <Doodle a={hero([0.05, 0, -1.0], [[0, "nervous"]], 0, { shiver: 1, handB: [[0, 0.1, HIP + 0.16], [t.p2hold + 0.6, 0.35, HEAD_Z + 0.05]] })} />
    </Scene3D>)),
  // ---------- 7. 00:00 — вспышка
  S(t.p2mid2, t.p2date, (
    <Scene3D t0={t.p2mid2} light="night" bg="#0b0624" focus={[1.45, 0.88, -1.42]} shakes={[[t.p2mid2, 0.8]]}
      cam={cam([t.p2mid2, [1.4, 0.92, -0.85], [1.45, 0.88, -1.42], 40], [t.p2date, [1.42, 0.9, -1.0], [1.45, 0.88, -1.42], 38])}>
      <GamerRoom mon={{ kind: "play" }} clock={() => "00:00"} />
    </Scene3D>), "flash"),
  // ---------- 8. «Дата релиза изменена»
  S(t.p2date, t.p2chg + 0.35, (
    <Scene3D t0={t.p2date} light="neon" bg="#1a1030" focus={[0.75, 1.32, -1.82]} shakes={[[t.p2date, 1.0]]}
      cam={cam([t.p2date, [0.75, 1.32, -0.2], [0.75, 1.32, -1.82], 50], [t.p2chg + 0.35, [0.75, 1.32, -0.6], [0.75, 1.32, -1.82], 48])}>
      <GamerRoom mon={{ kind: "changed" }} clock={() => "00:00"} />
    </Scene3D>), "cut"),
  // ---------- 9. Лицо героя
  S(t.p2chg + 0.35, P[3], (
    <Scene3D t0={t.p2chg + 0.35} light="neon" bg="#1a1030" focus={[-0.35, 1.0, -0.75]}
      cam={cam([t.p2chg + 0.35, [-0.25, 1.05, 0.9], [-0.35, 1.0, -0.75], 46], [P[3], [-0.3, 1.02, 0.5], [-0.35, 1.0, -0.75], 44])}>
      <GamerRoom mon={{ kind: "changed" }} />
      <Doodle a={hero([-0.35, 0, -0.75], [[0, "shock"]], 0, armsUp(0, 99))} />
    </Scene3D>)),

  // ---------- 10. Интернет сходит с ума: билборд залит сообщениями
  S(P[3], t.p3hundred, (
    <Scene3D t0={P[3]} light="night" bg="#0b0624" focus={[1.4, 3.1, -6.3]} fog="#2a0f4a" roll={[0.05, -0.02]}
      cam={cam([P[3], [-1.2, 1.2, 3], [1.2, 2.6, -6], 56], [t.p3hundred, [0.2, 2.0, 0.6], [1.4, 3.0, -6.3], 52])}>
      <ViceStreet night board={(g, s, W, H) => { drawBg(g, W, H, "#120a24", "#2a1458"); const n = Math.floor((s - P[3]) * 14);
        for (let i = 0; i < Math.min(n, 30); i++) { const x = ((i * 137) % 70) / 100 * W, y = ((i * 53) % 85) / 100 * H; g.fillStyle = [PINK, CYAN, YEL, "#fff"][i % 4]; rr(g, x, y, W * 0.28, H * 0.12, 16); g.fill();
          fitText(g, ["ЧТО?!", "ОПЯТЬ?!", "😭😭😭", "НЕЕЕТ", "#GTA6", "ROCKSTAR!!", "ПОЧЕМУ", "🤡"][i % 8], x + W * 0.14, y + H * 0.06, W * 0.24, H * 0.08, INK); } }} />
      {crowd(10, -2.5, 2.5, -1.5, 0.5, 11, [[0, "shock"]]).map((a, i) => <Doodle key={i} a={a} />)}
    </Scene3D>)),
  // ---------- 11. Телефон: 100 → 1 000 → 10 000 уведомлений
  S(t.p3hundred, t.p3phone, (
    <Scene3D t0={t.p3hundred} light="neon" bg="#1a1030" focus={[-0.1, 1.15, 0.5]} dof={9} shakes={[[t.p3thousand, 0.5], [t.p3ten, 0.9]]}
      cam={cam([t.p3hundred, [0.1, 1.2, 1.9], [-0.1, 1.15, 0.5], 46], [t.p3phone, [0.0, 1.17, 1.35], [-0.1, 1.15, 0.5], 42])}>
      <GamerRoom mon={{ kind: "changed" }} />
      <Doodle a={hero([-0.35, 0, -0.75], [[0, "nervous"], [t.p3ten, "shock"]])} />
      <Phone p={[-0.1, 1.15, 0.5]} from={t.p3hundred} marks={[[t.p3hundred, 100], [t.p3thousand, 1000], [t.p3ten, 10000]]} heat={(s) => clamp((s - t.p3ten) / 1.5)} />
    </Scene3D>)),
  // ---------- 12. Телефон дымится
  S(t.p3phone, P[4], (
    <Scene3D t0={t.p3phone} light="neon" bg="#1a1030" focus={[-0.35, 1.0, -0.75]} shakes={[[t.p3smoke, 1.2]]}
      cam={cam([t.p3phone, [0.6, 1.1, 1.8], [-0.2, 1.05, -0.3], 54], [P[4], [0.3, 1.1, 1.3], [-0.25, 1.05, -0.3], 50])}>
      <GamerRoom mon={{ kind: "changed" }} />
      <Doodle a={hero([-0.35, 0, -0.75], [[0, "nervous"], [t.p3smoke, "shock"]], 0, { handB: [[0, 0.3, HEAD_Z - 0.15]], handF: [[0, -0.2, HIP + 0.1]] })} />
      <Phone p={[-0.05, 1.05, -0.45]} from={t.p3hundred} marks={[[t.p3hundred, 10000], [t.p3phone, 99999]]} heat={() => 1} scale={0.8} />
      <Smoke p={[-0.05, 1.4, -0.45]} t0={t.p3smoke - 0.6} n={16} col="#6a6a76" />
    </Scene3D>)),

  // ---------- 13. По всему миру: стена ТВ
  S(P[4], t.p4rock, (
    <Scene3D t0={P[4]} light="office" bg="#2a2f3a" focus={[0, 1.6, -1.9]}
      cam={cam([P[4], [-1.8, 1.7, 1.8], [-0.6, 1.6, -1.9], 58], [t.p4rock, [0.4, 1.65, 1.5], [0.2, 1.6, -1.9], 54])}>
      <TvWall heads={[["USA", "GTA 6 DELAYED AGAIN"], ["JAPAN", "GTA 6 延期"], ["BRASIL", "GTA 6 ADIADO"], ["РОССИЯ", "GTA 6 ПЕРЕНЕСЛИ"], ["DEUTSCHLAND", "VERSCHOBEN!"], ["FRANCE", "ENCORE REPORTÉ"]]} />
      {crowd(4, -2, 2, -0.6, 0.2, 21, [[0, "shock"]]).map((a, i) => <Doodle key={i} a={a} />)}
    </Scene3D>)),
  // ---------- 14. Студия: «Rockstar снова перенесла GTA 6»
  S(t.p4rock, t.p4anchor, (
    <Scene3D t0={t.p4rock} light="studio" bg="#0c1224" focus={[0, 1.4, -1.0]}
      cam={cam([t.p4rock, [0, 2.4, 3.6], [0, 1.4, -1.6], 60], [t.p4anchor, [0, 1.7, 2.3], [0, 1.35, -1.4], 56])}>
      <NewsStudio screen={(g, s, W, H) => { drawBg(g, W, H, "#0e1a3a", "#1d3a7a"); g.fillStyle = RED; g.fillRect(0, H * 0.06, W * 0.36, H * 0.14); fitText(g, "СРОЧНО", W * 0.18, H * 0.135, W * 0.3, H * 0.1, "#fff");
        drawLogo(g, W, H, H * 0.52, H / 420); fitText(g, "ПЕРЕНЕСЛИ СНОВА", W / 2, H * 0.86, W * 0.8, H * 0.13, YEL); drawStamp(g, W, H, s, t.p4rock + 0.6, "ПЕРЕНЕСЕНО", H * 0.52); }} />
      <Doodle a={{ pos: [0, 0, -1.15], seed: 5, look: ANCHOR, expr: [[0, "stern"]], talk: [[t.p4rock, 99]], scale: 1.2 }} />
    </Scene3D>)),
  // ---------- 15. Ведущий крупно, трагичное лицо
  S(t.p4anchor, t.p4as, (
    <Scene3D t0={t.p4anchor} light="studio" bg="#0c1224" focus={[0, 1.15, -1.15]}
      cam={cam([t.p4anchor, [0.5, 1.2, 0.8], [0, 1.15, -1.15], 46], [t.p4as, [0.3, 1.18, 0.35], [0, 1.15, -1.15], 42])}>
      <NewsStudio screen={(g, s, W, H) => { drawBg(g, W, H, "#0e1a3a", "#1d3a7a"); drawLogo(g, W, H, H * 0.5, H / 420); }} />
      <Doodle a={{ pos: [0, 0, -1.15], seed: 5, look: ANCHOR, expr: [[0, "tired"], [t.p4anchor + 0.9, "cry"]], talk: [[t.p4anchor, t.p4anchor + 0.9]], scale: 1.2 }} />
    </Scene3D>)),
  // ---------- 16. «…будто объявляет конец света»
  S(t.p4as, P[5], (
    <Scene3D t0={t.p4as} light="studio" bg="#0c1224" focus={[0, 1.3, -1.15]} shakes={[[t.p4end, 1.5, 0.8]]}
      cam={cam([t.p4as, [0, 1.3, 0.9], [0, 1.4, -1.6], 52], [P[5], [0, 1.6, 2.6], [0, 1.5, -1.6], 58])}>
      <NewsStudio screen={(g, s, W, H) => { const u = clamp((s - t.p4as) / 1.6); const gr = g.createLinearGradient(0, 0, 0, H); gr.addColorStop(0, "#3a0a0a"); gr.addColorStop(1, "#ff5a1f"); g.fillStyle = gr; g.fillRect(0, 0, W, H);
        g.fillStyle = "#ffcf6b"; g.beginPath(); g.arc(W * (0.85 - u * 0.4), H * (0.1 + u * 0.5), 60 + u * 90, 0, 7); g.fill(); g.strokeStyle = "#ffcf6b"; g.lineWidth = 30; g.beginPath(); g.moveTo(W * (0.85 - u * 0.4) + 80, H * (0.1 + u * 0.5) - 80); g.lineTo(W * 1.1, -H * 0.2); g.stroke();
        if (s > t.p4end) fitText(g, "КОНЕЦ СВЕТА?", W / 2, H * 0.82, W * 0.8, H * 0.16, "#fff"); }} />
      <Doodle a={{ pos: [0, 0, -1.15], seed: 5, look: ANCHOR, expr: [[0, "cry"]], scale: 1.2, ...armsUp(t.p4end, 9) }} />
    </Scene3D>)),

  // ---------- 17. Директор смеётся
  S(P[5], t.p5wait, (
    <Scene3D t0={P[5]} light="office" bg="#3a2a24" focus={[0.1, 1.1, -1.0]}
      cam={cam([P[5], [1.6, 1.5, 2.6], [0.1, 1.2, -1.2], 58], [t.p5wait, [0.8, 1.35, 1.6], [0.1, 1.15, -1.1], 54])}>
      <Office />
      <Doodle a={{ pos: [0.1, 0, -1.0], seed: 7, look: DIR, expr: [[0, "smug"], [t.p5laugh, "laugh"]], scale: 1.2, handB: [[0, 0.25, HIP + 0.3]] }} />
    </Scene3D>)),
  // ---------- 18. «Подождут.» — крупно
  S(t.p5wait, t.p5nobody, (
    <Scene3D t0={t.p5wait} light="office" bg="#3a2a24" focus={[0.1, 1.15, -1.0]}
      cam={cam([t.p5wait, [-0.35, 1.2, 0.6], [0.1, 1.15, -1.0], 44], [t.p5nobody, [-0.15, 1.18, 0.25], [0.1, 1.15, -1.0], 40])}>
      <Office />
      <Doodle a={{ pos: [0.1, 0, -1.0], seed: 7, look: DIR, expr: [[0, "smug"]], scale: 1.2, talk: [[t.p5wait, t.p5wait + 0.6]], handF: pointKeys(t.p5wait + 0.1, -0.2, 0.6, 1.2, "f") }} />
    </Scene3D>)),
  // ---------- 19. «Никто не настолько глуп…» — облёт, смех
  S(t.p5nobody, P[6], (
    <Scene3D t0={t.p5nobody} light="office" bg="#3a2a24" focus={[0.1, 1.1, -1.0]} roll={[0.08, -0.03]}
      cam={cam([t.p5nobody, [-1.6, 1.4, 1.4], [0.2, 1.2, -1.2], 54], [P[6], [1.2, 1.3, 1.6], [0.2, 1.2, -1.2], 54])}>
      <Office />
      <Doodle a={{ pos: [0.1, 0, -1.0], seed: 7, look: DIR, expr: [[0, "smug"], [t.p5stupid, "laugh"]], scale: 1.2, talk: [[t.p5nobody, t.p5stupid]], ...armsUp(t.p5stupid + 0.2, 9) }} />
      <Bubble p={[-0.9, 2.3, -0.9]} text="ПОДОЖДУТ 😎" t={t.p5nobody + 0.1} w={1.4} />
    </Scene3D>)),

  // ---------- 20. Один фанат у офиса
  S(P[6], t.p6ten, (
    <Scene3D t0={P[6]} light="day" bg="#2a1458" focus={[0, 1, -3.4]} fog="#b0368a"
      cam={cam([P[6], [1.5, 1.2, 3.5], [0, 2.2, -5], 58], [t.p6ten, [0.6, 1.2, 1.6], [0, 1.5, -4], 54])}>
      <HQ />
      <Doodle a={{ pos: [0, 0, -3.4], seed: 31, look: { body: "#ff7a2f", hair: "spiky" }, expr: [[0, "angry"]], hop: 8, sign: ["ГДЕ GTA?!", "#fff", RED] }} />
    </Scene3D>)),
  // ---------- 21. Десять
  S(t.p6ten, t.p6hund, (
    <Scene3D t0={t.p6ten} light="day" bg="#2a1458" focus={[0, 1, -3.2]} fog="#b0368a"
      cam={cam([t.p6ten, [-1.2, 1.6, 3.2], [0, 1.6, -4], 58], [t.p6hund, [-0.4, 1.8, 2.4], [0, 1.6, -4], 56])}>
      <HQ />
      {crowd(10, -2.5, 2.5, -3.9, -2.6, 33, [[0, "angry"]]).map((a, i) => <Doodle key={i} a={{ ...a, sign: i % 3 === 0 ? [["ДАЙТЕ ИГРУ", "ГДЕ GTA?!", "ХВАТИТ!", "19.11 !!!"][(i / 3) % 4], YEL, INK] : undefined }} />)}
    </Scene3D>)),
  // ---------- 22. Сотни — кран вверх
  S(t.p6hund, t.p6guard, (
    <Scene3D t0={t.p6hund} light="day" bg="#2a1458" focus={[0, 1, -2.8]} fog="#b0368a" shakes={[[t.p6hund, 0.6]]}
      cam={cam([t.p6hund, [0, 1.6, 3.0], [0, 1.2, -3], 58], [t.p6guard, [0, 6.5, 5.5], [0, 0.5, -3], 58])}>
      <HQ />
      {crowd(44, -5, 5, -4.2, 1.5, 41, [[0, "angry"]]).map((a, i) => <Doodle key={i} a={{ ...a, sign: i % 4 === 0 ? [["ГДЕ GTA?!", "ХВАТИТ!", "19.11 !!!", "ДАЙТЕ ИГРУ"][(i / 4) % 4], ["#fff", YEL, PINK, CYAN][(i / 4) % 4], INK] : undefined }} />)}
    </Scene3D>)),
  // ---------- 23. Охранник у мониторов
  S(t.p6guard, t.p6how, (
    <Scene3D t0={t.p6guard} light="night" bg="#11161c" focus={[0.3, 1.05, -0.35]}
      cam={cam([t.p6guard, [-1.4, 1.5, 2.2], [0, 1.6, -1.6], 58], [t.p6how, [-0.6, 1.4, 1.6], [0.1, 1.5, -1.5], 54])}>
      <Security count={(s) => 40 + (s - t.p6guard) * 200} total={(s) => 300 + (s - t.p6guard) * 900} />
      <Doodle a={{ pos: [0.3, 0, -0.35], seed: 9, look: GUARD, expr: [[0, "blank"], [t.p6guard + 0.8, "realize"]], scale: 1.15 }} />
    </Scene3D>)),
  // ---------- 24. «Сколько их?» — камера на стену мониторов, счётчик людей крутится
  S(t.p6how, t.p6ok, (
    <Scene3D t0={t.p6how} light="night" bg="#11161c" focus={[0, 2.35, -1.89]} shakes={[[t.p6ok - 0.3, 0.6]]}
      cam={cam([t.p6how, [0.9, 1.5, 0.8], [0, 2.0, -1.9], 52], [t.p6ok, [0.15, 2.1, -0.2], [0, 2.3, -1.9], 46])}>
      <Security count={(s) => 400 + (s - t.p6how) * 1500} total={(s) => Math.pow(10, 3 + clamp((s - t.p6how) / Math.max(0.3, t.p6ok - t.p6how)) * 4.08)} />
      <Doodle a={{ pos: [0.6, 0, -0.2], seed: 9, look: GUARD, expr: [[0, "nervous"]], scale: 1.15, talk: [[t.p6how, t.p6how + 0.7]], handF: [[0, -0.1, HEAD_Z - 0.2]] }} />
    </Scene3D>)),
  // ---------- 25. «…Понятно.» — охранник устало, за ним 12 000 000
  S(t.p6ok, P[7], (
    <Scene3D t0={t.p6ok} light="night" bg="#11161c" focus={[0.3, 1.3, -0.35]}
      cam={cam([t.p6ok, [0.3, 1.5, 1.3], [0.15, 1.75, -1.9], 54], [P[7], [0.3, 1.45, 1.8], [0.15, 1.75, -1.9], 56])}>
      <Security count={() => 3000} total={() => 12000000} />
      <Doodle a={{ pos: [0.3, 0, -0.35], seed: 9, look: GUARD, expr: [[0, "blank"], [t.p6ok + 0.15, "tired"]], scale: 1.15 }} />
    </Scene3D>)),
  // ---------- 26. GTA Online: пролёт по серверной
  S(P[7], t.p7plus, (
    <Scene3D t0={P[7]} light="storm" bg="#05070f" focus={[0, 1.2, -3]} dof={5}
      cam={cam([P[7], [0, 1.4, 3.5], [0, 1.4, -8], 62], [t.p7plus, [0, 1.6, 0.4], [0, 1.7, -8], 58])}>
      <ServerRoom load={(s) => clamp((s - P[7]) / 6) * 0.5} counter={() => "12 480 112"} />
      {crowd(6, -0.6, 0.6, 1.5, 2.6, 51, [[0, "hype"]]).map((a, i) => <Doodle key={i} a={{ ...a, walk: [[P[7], a.pos[0], a.pos[2]], [t.p7plus, a.pos[0], a.pos[2] - 2.8]], look: { ...a.look, pad: true }, ...padHands }} />)}
    </Scene3D>)),
  // ---------- 27. +1 000 000, +2 000 000
  S(t.p7plus, t.p7server - 0.15, (
    <Scene3D t0={t.p7plus} light="storm" bg="#05070f" focus={[0, 2.3, -1.15]} shakes={[[t.p7two, 0.8]]}
      cam={cam([t.p7plus, [0, 2.2, 0.9], [0, 2.3, -1.15], 46], [t.p7server - 0.15, [0, 2.28, 0.45], [0, 2.3, -1.15], 42])}>
      <ServerRoom load={(s) => 0.5 + clamp((s - t.p7plus) / 3) * 0.4} counter={(s) => fmt(12480112 + (s < t.p7two ? clamp((s - t.p7plus) / 0.5) * 1e6 : 1e6 + clamp((s - t.p7two) / 0.5) * 1e6))} />
    </Scene3D>)),
  // ---------- 28. Сервер просит пощады
  S(t.p7server - 0.15, P[8], (
    <Scene3D t0={t.p7server - 0.15} light="storm" bg="#05070f" focus={[0, 1.45, -4.7]} shakes={[[t.p7server, 0.6, 3], [t.p7mercy, 1.4]]}
      cam={cam([t.p7server - 0.15, [0, 1.5, -1.4], [0, 1.45, -5], 50], [P[8], [0, 1.5, -2.6], [0, 1.45, -5], 46])}>
      <ServerRoom load={() => 1} face />
      <Bubble p={[0, 2.85, -4.5]} text="ПОЩАДИТЕ!" t={t.p7mercy - 0.3} w={1.5} col={YEL} />
    </Scene3D>)),

  // ---------- 29. Ноябрь освободился: GTA 6 уходит
  S(P[8], t.p8half, (
    <Scene3D t0={P[8]} light="day" bg="#2a1458" focus={[1.5, 1, -2.8]} fog="#b0368a"
      cam={cam([P[8], [-1, 1.4, 3.4], [1.8, 1.4, -3], 58], [t.p8half, [0.2, 1.3, 2.4], [2.0, 1.3, -3], 54])}>
      <ViceStreet door />
      <GameBox x={2.5} z={-2.4} title="GTA 6" col={PINK} face="sad" walk={[[P[8], 2.5, -2.4], [t.p8half, -2.5, -1.6]]} />
      <Bubble p={[0.8, 2.2, -1.9]} text="Я НЕ ВЫЙДУ…" t={P[8] + 0.6} w={1.4} />
    </Scene3D>)),
  // ---------- 30. Half-Life 3, RDR 3, Ведьмак 4 выпрыгивают
  S(t.p8half, t.p8gta, (
    <Scene3D t0={t.p8half} light="day" bg="#2a1458" focus={[0, 1, -1.2]} fog="#b0368a"
      cam={cam([t.p8half, [-1.6, 1.2, 2.3], [-0.6, 1.0, -1.2], 54], [t.p8gta, [0.8, 1.2, 2.3], [0.4, 1.0, -1.2], 54])}>
      <ViceStreet door />
      {[[t.p8half, -1.3, "HALF-LIFE 3", CYAN], [t.p8rdr, 0, "RDR 3", "#c0392b"], [t.p8witch, 1.3, "ВЕДЬМАК 4", ORGC]].map(([tt, x, ti, c], i) =>
        <PopIn key={i} t={tt as number}><GameBox x={x as number} z={-1.2} title={ti as string} col={c as string} face="happy" /></PopIn>)}
    </Scene3D>)),
  // ---------- 31. «Наша очередь!» — бегут в ноябрь
  S(t.p8gta, P[9], (
    <Scene3D t0={t.p8gta} light="day" bg="#2a1458" focus={[1.8, 1, -2.4]} fog="#b0368a" shakes={[[t.p8our, 0.6]]}
      cam={cam([t.p8gta, [-0.6, 1.3, 2.8], [1, 1.2, -2], 56], [P[9], [0.8, 1.6, 1.6], [3.0, 1.4, -3.2], 52])}>
      <ViceStreet door />
      {[[-1.3, "HALF-LIFE 3", CYAN], [0, "RDR 3", "#c0392b"], [1.3, "ВЕДЬМАК 4", ORGC]].map(([x, ti, c], i) =>
        <GameBox key={i} x={x as number} z={-1.2} title={ti as string} col={c as string} face="happy" walk={[[t.p8our + i * 0.15, x as number, -1.2], [t.p8our + 1.6 + i * 0.15, 3.2, -3.1]]} />)}
      <Bubble p={[-0.3, 2.4, -1.1]} text="НАША ОЧЕРЕДЬ!" t={t.p8our} w={1.6} col={YEL} />
    </Scene3D>)),

  // ---------- 32. Инвесторы
  S(P[9], t.p9in, (
    <Scene3D t0={P[9]} light="studio" bg="#0a0c14" focus={[0, 1.2, 0.4]}
      cam={cam([P[9], [-1.5, 2.0, 3.4], [0, 1.5, -1.5], 60], [t.p9in, [-0.5, 1.8, 2.6], [0, 1.5, -1.5], 56])}>
      <StockFloor drop={() => 0} />
      {[-1.8, 0, 1.8].map((x, i) => <Doodle key={i} a={{ pos: [x, 0, 0.45], seed: 60 + i, look: { body: "#3a3a48", hair: (["slick", "bald", "bowl"] as const)[i], tie: [RED, YEL, CYAN][i] }, expr: [[0, "stern"]], scale: 1.1 }} />)}
    </Scene3D>)),
  // ---------- 33. График: «в прошлый раз…»
  S(t.p9in, t.p9fell, (
    <Scene3D t0={t.p9in} light="studio" bg="#0a0c14" focus={[0, 1.75, -1.92]}
      cam={cam([t.p9in, [-0.8, 1.75, 0.6], [0, 1.75, -1.92], 50], [t.p9fell, [0.2, 1.75, 0.0], [0.3, 1.75, -1.92], 46])}>
      <StockFloor drop={(s) => clamp((s - t.p9fell + 0.4) / 1.5) * 0.3} />
    </Scene3D>)),
  // ---------- 34. Падение −10%, паника
  S(t.p9fell, t.p9here - 0.1, (
    <Scene3D t0={t.p9fell} light="studio" bg="#0a0c14" focus={[0, 1.2, 0.4]} shakes={[[t.p9fell, 1.0], [t.p9ten, 1.5]]}
      cam={cam([t.p9fell, [0, 1.5, 3.0], [0, 1.6, -1.5], 58], [t.p9here - 0.1, [0, 1.3, 2.0], [0, 1.4, -1.5], 54])}>
      <StockFloor drop={(s) => 0.3 + clamp((s - t.p9fell) / 1.4) * 0.7} />
      {[-1.8, 0, 1.8].map((x, i) => <Doodle key={i} a={{ pos: [x, 0, 0.45], seed: 60 + i, look: { body: "#3a3a48", hair: (["slick", "bald", "bowl"] as const)[i], tie: [RED, YEL, CYAN][i] }, expr: [[0, "nervous"], [t.p9ten, i === 1 ? "cry" : "shock"]], scale: 1.1, ...armsUp(t.p9ten + i * 0.1, 9) }} />)}
    </Scene3D>)),
  // ---------- 35. «А тут — уже третий перенос»
  S(t.p9here - 0.1, P[10], (
    <Scene3D t0={t.p9here - 0.1} light="studio" bg="#0a0c14" focus={[0, 1.75, -1.92]} shakes={[[t.p9third, 1.2]]}
      cam={cam([t.p9here - 0.1, [0, 1.8, 1.4], [0, 1.85, -1.92], 52], [P[10], [0, 1.8, 0.9], [0, 1.85, -1.92], 50])}>
      <StockFloor drop={() => 1} stamps={[t.p9here - 0.6, t.p9here - 0.3, t.p9third]} />
    </Scene3D>)),

  // ---------- 36. 2027
  S(P[10], t.p10y30, (
    <Scene3D t0={P[10]} light="night" bg="#0b0624" focus={[-0.35, 1.0, -0.75]}
      cam={cam([P[10], [1.4, 1.4, 1.9], [0.6, 1.4, -1.6], 58], [t.p10y30, [1.0, 1.3, 1.3], [0.6, 1.35, -1.6], 54])}>
      <GamerRoom mon={{ kind: "changed" }} cal={calDraw("ГОД", "2027", false)} age={0} />
      <Doodle a={hero([-0.35, 0, -0.75], [[0, "tired"]], 1)} />
    </Scene3D>), "flash"),
  // ---------- 37. 2030
  S(t.p10y30, t.p10y40, (
    <Scene3D t0={t.p10y30} light="night" bg="#0b0624" focus={[-0.35, 1.0, -0.75]}
      cam={cam([t.p10y30, [1.4, 1.4, 1.9], [0.6, 1.4, -1.6], 58], [t.p10y40, [1.0, 1.3, 1.3], [0.6, 1.35, -1.6], 54])}>
      <GamerRoom mon={{ kind: "changed" }} cal={calDraw("ГОД", "2030", false)} age={1} />
      <Doodle a={hero([-0.35, 0, -0.75], [[0, "blank"]], 2)} />
    </Scene3D>), "flash"),
  // ---------- 38. 2040
  S(t.p10y40, t.p10gamers, (
    <Scene3D t0={t.p10y40} light="night" bg="#0b0624" focus={[-0.35, 1.0, -0.75]}
      cam={cam([t.p10y40, [1.4, 1.4, 1.9], [0.6, 1.4, -1.6], 58], [t.p10gamers, [0.9, 1.3, 1.1], [0.6, 1.35, -1.6], 52])}>
      <GamerRoom mon={{ kind: "changed" }} cal={calDraw("ГОД", "2040", true)} age={2} />
      <Doodle a={hero([-0.35, 0, -0.75], [[0, "tired"]], 3)} />
    </Scene3D>), "flash"),
  // ---------- 39. Седые геймеры, паутина на геймпаде
  S(t.p10gamers, t.p10dir, (
    <Scene3D t0={t.p10gamers} light="night" bg="#0b0624" focus={[-0.35, 0.95, -0.75]}
      cam={cam([t.p10gamers, [-0.2, 0.95, 0.8], [-0.35, 0.85, -0.75], 46], [t.p10dir, [-0.3, 1.0, 0.35], [-0.35, 0.95, -0.75], 42])}>
      <GamerRoom mon={{ kind: "changed" }} cal={calDraw("ГОД", "2040")} age={2} />
      <Doodle a={hero([-0.35, 0, -0.75], [[0, "tired"], [t.p10web, "blank"]], 3)} />
      <WebAt p={[-0.32, 0.72, -0.62]} t={t.p10web} />
    </Scene3D>)),
  // ---------- 40. Седой директор: «Подождут»
  S(t.p10dir, P[11], (
    <Scene3D t0={t.p10dir} light="office" bg="#3a2a24" focus={[0.1, 1.1, -1.0]}
      cam={cam([t.p10dir, [0.9, 1.3, 1.6], [0.1, 1.15, -1.1], 54], [P[11], [0.3, 1.2, 0.7], [0.1, 1.15, -1.0], 46])}>
      <Office old />
      <Doodle a={{ pos: [0.1, 0, -1.0], seed: 7, look: DIR_OLD, expr: [[0, "smug"], [t.p10wait, "laugh"]], scale: 1.2, talk: [[t.p10wait, t.p10wait + 0.6]] }} />
      <Bubble p={[-0.8, 2.2, -0.9]} text="ПОДОЖДУТ 😎" t={t.p10wait} w={1.4} />
    </Scene3D>)),

  // ---------- 41. «GTA 6 вышла!» — конфетти
  S(P[11], t.p11you, (
    <Scene3D t0={P[11]} light="neon" bg="#1a1030" focus={[0.75, 1.32, -1.82]} shakes={[[t.p11out, 0.8]]}
      cam={cam([P[11], [0.5, 1.4, 1.6], [0.6, 1.3, -1.8], 56], [t.p11you, [0.7, 1.33, 0.2], [0.75, 1.32, -1.82], 48])}>
      <GamerRoom mon={{ kind: "released", t: t.p11out - 0.4 }} cal={calDraw("ГОД", "2040")} age={2} />
      <Confetti t0={t.p11out} area={[-0.6, 2, -1.5, 0.6]} />
    </Scene3D>)),
  // ---------- 42. Дед дрожащей рукой жмёт «Играть»
  S(t.p11you, t.p11req, (
    <Scene3D t0={t.p11you} light="neon" bg="#1a1030" focus={[-0.1, 1.0, -1.0]}
      cam={cam([t.p11you, [-0.9, 1.15, 1.2], [0.2, 1.1, -1.4], 52], [t.p11req, [-0.5, 1.15, 0.5], [0.3, 1.15, -1.5], 46])}>
      <GamerRoom mon={{ kind: "play", press: t.p11press + 0.3 }} cal={calDraw("ГОД", "2040")} age={2} />
      <Doodle a={hero([-0.1, 0, -1.0], [[0, "hype"], [t.p11press, "nervous"]], 3, { shiver: 2, handB: [[0, 0.1, HIP + 0.16], [t.p11press, 0.4, HEAD_Z + 0.05]] })} />
    </Scene3D>)),
  // ---------- 43. «Требуется PlayStation 9»
  S(t.p11req, t.p11nu, (
    <Scene3D t0={t.p11req} light="neon" bg="#1a1030" focus={[0.75, 1.32, -1.82]} shakes={[[t.p11ps, 1.3]]}
      cam={cam([t.p11req, [0.75, 1.32, -0.3], [0.75, 1.32, -1.82], 50], [t.p11nu, [0.75, 1.32, -0.75], [0.75, 1.32, -1.82], 46])}>
      <GamerRoom mon={{ kind: "ps9", t: t.p11req }} age={2} />
    </Scene3D>), "cut"),
  // ---------- 44. «Ну п*здец.»
  S(t.p11nu, P[12], (
    <Scene3D t0={t.p11nu} light="neon" bg="#1a1030" focus={[-0.35, 1.0, -0.75]}
      cam={cam([t.p11nu, [-0.3, 1.05, 0.7], [-0.35, 1.0, -0.75], 44], [P[12], [-0.32, 1.03, 0.35], [-0.35, 1.0, -0.75], 40])}>
      <GamerRoom mon={{ kind: "ps9" }} age={2} />
      <Doodle a={hero([-0.35, 0, -0.75], [[0, "tired"], [t.p11nu + 0.5, "cry"]], 3)} />
    </Scene3D>)),

  // ---------- 45. Финал: «А ты ждёшь GTA 6?»
  S(P[12], END, (
    <Scene3D t0={P[12]} light="day" bg="#2a1458" focus={[1.4, 3.1, -6.3]} fog="#b0368a" dof={3}
      cam={cam([P[12], [0.6, 1.6, 1.0], [1.4, 2.9, -6.3], 52], [END, [0.2, 1.7, 3.6], [1.2, 2.6, -6.3], 56])}>
      <ViceStreet board={monitorDraw({ kind: "final" })} />
      {crowd(16, -3.2, 3.6, -2.8, 0.8, 71, [[0, "hype"]]).map((a, i) => <Doodle key={i} a={{ ...a, sign: i % 4 === 0 ? [["ЖДУ!", "2040", "ДА!!!", "УЖЕ НЕТ"][(i / 4) % 4], ["#fff", YEL, PINK, CYAN][(i / 4) % 4], INK] : undefined }} />)}
    </Scene3D>)),
];

// ---------------------------------------------------------------- мелкие компоненты
function PopIn({ t, children }: { t: number; children: React.ReactNode }) {
  const sec = useSec(); const k = popAt(sec, t, 0.4); if (k <= 0) return null;
  return <group scale={[k, k, k]}>{children}</group>;
}
function WebAt({ p, t }: { p: V3; t: number }) {
  const sec = useSec(); const k = clamp((sec - t + 0.3) / 0.5); if (k <= 0) return null;
  return <Web p={[p[0], p[1], p[2] + 0.05]} s={0.45 * k} />;
}

// телефон с уведомлениями
function Phone({ p, from, marks, heat, scale = 1 }: { p: V3; from: number; marks: [number, number][]; heat: (s: number) => number; scale?: number }) {
  const sec = useSec(); const h = heat(sec);
  const sh = h > 0 ? Math.sin(sec * 60) * 0.01 * h : 0;
  return (<group position={[p[0] + sh, p[1], p[2]]} scale={scale}>
    <Box p={[0, 0, 0]} s={[0.4, 0.78, 0.05]} c={`rgb(${Math.round(30 + h * 180)},30,40)`} r={0.3} />
    <Screen p={[0, 0, 0.027]} w={0.36} h={0.72} res={360} draw={(g, s, W, H) => {
      drawBg(g, W, H, "#120a24", "#2a1458");
      let n = marks[0][1]; for (let i = 0; i < marks.length; i++) if (s >= marks[i][0]) { const nx = marks[i + 1] ? marks[i + 1][1] : marks[i][1]; n = marks[i][1] + (nx - marks[i][1]) * 0; }
      const cur = marks.filter((m) => s >= m[0]).pop(); const val = cur ? cur[1] : marks[0][1];
      const k = cur ? bonkAt(s, cur[0], 0.3) : 1;
      g.save(); g.translate(W / 2, H * 0.17); g.scale(k, k); g.fillStyle = RED; rr(g, -W * 0.38, -H * 0.07, W * 0.76, H * 0.14, 30); g.fill(); fitText(g, "🔔 " + fmt(val), 0, 3, W * 0.68, H * 0.09, "#fff"); g.restore();
      const off = ((s - from) * 260) % (H * 0.13);
      for (let i = 0; i < 7; i++) { const y = H * 0.3 + i * H * 0.13 - off; if (y < H * 0.26) continue; g.fillStyle = "rgba(255,255,255,0.92)"; rr(g, W * 0.06, y, W * 0.88, H * 0.11, 14); g.fill();
        g.fillStyle = [PINK, CYAN, YEL, "#3fb27f"][i % 4]; g.beginPath(); g.arc(W * 0.16, y + H * 0.055, W * 0.06, 0, 7); g.fill();
        g.fillStyle = INK; g.font = `900 ${H * 0.035}px Russo One`; g.textAlign = "left"; g.textBaseline = "middle"; g.fillText(["GTA 6 ПЕРЕНЕСЛИ?!", "ты видел??", "ROCKSTAR 🤡", "опять 2027?", "ПОЧЕМУ"][(i + Math.floor((s - from) * 4)) % 5], W * 0.26, y + H * 0.055); }
      if (h > 0.5) { g.fillStyle = `rgba(255,60,30,${(h - 0.5) * 0.5})`; g.fillRect(0, 0, W, H); } }} />
  </group>);
}
