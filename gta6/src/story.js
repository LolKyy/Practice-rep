// «GTA 6 перенесли» v2 — под озвучку. Каждый блок — маленькая сцена с действием, текст — только короткие субтитры.
import { LIB, W, H, FPS } from "./scene.js";
const { O, PINK, CYAN, YEL, RED, ORG, SW, SHIRTS, clamp, lerp, easeOut, easeInOut, easeOutBack, pop, rnd, at, R, C, T, TS, neon, sunset, DEFS, gamer, tiny, monitor, notif, post, bubble, building, smoke } = LIB;
export { W, H, FPS };

let WORDS = [], NP = 0, START = [], END = [], DUR = 0;
export let TOTAL = 88.5;
export function setData(d) {
  WORDS = d.words; NP = d.paras.length; DUR = d.duration; TOTAL = d.duration + 2.3;
  START = Array.from({ length: NP }, (_, i) => (i === 0 ? 0 : Math.max(0, WORDS.find((w) => w.p === i).s - 0.15)));
  END = START.map((s, i) => (i + 1 < NP ? START[i + 1] : TOTAL));
  buildGroups(); buildSfx();
}
function wt(pi, stem, occ = 0) {
  const ws = WORDS.filter((w) => w.p === pi && w.n.startsWith(stem));
  const w = ws[occ] || ws[ws.length - 1];
  return w ? w.s : START[pi];
}

// ---------- субтитры: 1–3 слова, внизу, на тёмной подложке ----------
const REDW = ["перенесли", "полночь", "интернет", "перенесла", "сотни", "онлайн", "очередь", "доверию", "последний", "комменты"];
const CENSOR = { "блять": "бл*ть" };
let GROUPS = [], RED_IDX = new Set();
function buildGroups() {
  GROUPS = []; let cur = [];
  const flush = () => { if (cur.length) GROUPS.push(cur); cur = []; };
  WORDS.forEach((w) => {
    if (cur.length && cur[0].p !== w.p) flush();
    cur.push(w);
    const len = cur.reduce((a, x) => a + x.w.length, 0);
    if (cur.length >= 3 || /[.,!?…:»]$/.test(w.w) || len > 14) flush();
  });
  flush();
  RED_IDX = new Set();
  REDW.forEach((stem, pi) => { const ws = WORDS.filter((w) => w.p === pi && w.n.startsWith(stem)); if (ws.length) RED_IDX.add(WORDS.indexOf(ws[0])); });
}
function subtitles(t) {
  const gi = GROUPS.findIndex((g, i) => t >= g[0].s - 0.05 && (i + 1 >= GROUPS.length || t < GROUPS[i + 1][0].s - 0.05));
  if (gi < 0) return "";
  const g = GROUPS[gi];
  if (t > g[g.length - 1].e + 0.5) return "";
  const items = g.map((w) => {
    let s = w.w.replace(/[«»"]/g, "");
    for (const [k, v] of Object.entries(CENSOR)) s = s.replace(new RegExp(k, "i"), v);
    return { t: s.toUpperCase(), key: RED_IDX.has(WORDS.indexOf(w)), on: t >= w.s - 0.03 };
  });
  const txt = items.map((x) => x.t).join(" ");
  const size = txt.length > 16 ? 88 : 104, w = Math.min(980, txt.length * size * 0.5 + 90);
  const k = 0.88 + 0.12 * easeOutBack((t - g[0].s + 0.05) / 0.18);
  return at(520, 1320, k, `<rect x="${520 - w / 2}" y="${1320 - size * 0.82}" width="${w}" height="${size * 1.18}" rx="26" fill="${O}" opacity=".55"/>
    <text x="520" y="1320" text-anchor="middle" font-family="Oswald" font-weight="700" font-size="${size}" stroke="${O}" stroke-width="14" stroke-linejoin="round" paint-order="stroke">${items.map((x) =>
    `<tspan fill="${x.key ? YEL : "#fff"}" fill-opacity="${x.on ? 1 : 0.45}">${x.t}</tspan>`).join(" ")}</text>`);
}

// ---------- мелкие элементы ----------
const card = (x, y, w, h, rot, inner, fill = "#fff") => `<g transform="translate(${x},${y}) rotate(${rot})"><rect x="${-w / 2 + 10}" y="${-h / 2 + 12}" width="${w}" height="${h}" rx="22" fill="${O}" opacity=".35"/>${R(-w / 2, -h / 2, w, h, fill, 22)}${inner}</g>`;
const dateCard = (txt, dx = 0) => `<g transform="translate(${540 + dx},330) rotate(-2)">${R(-250, -70, 500, 140, "#fff", 18)}${T(0, 30, txt, 80, RED)}</g>`;
const sfxT = (t, t0, x, y, rot, txt, size = 90, fill = YEL, life = 0.9) => {
  if (t < t0 || t > t0 + life) return "";
  const k = pop(t, t0, 0.3) * (1 - clamp((t - t0 - life + 0.2) / 0.2));
  return at(x, y, k, `<g transform="translate(${x},${y}) rotate(${rot})">${TS(0, 0, txt, size, fill)}</g>`);
};
const phoneBig = (x, y, s, inner, hot = 0) => `<g transform="translate(${x},${y}) scale(${s})">${R(-230, -420, 460, 840, hot ? `rgb(${46 + hot * 160},42,68)` : "#2E2A44", 50)}<rect x="-205" y="-380" width="410" height="760" rx="30" fill="#140C2A"/>${inner}</g>`;
const appIcon = (x, y, col, sym) => `${R(x - 46, y - 46, 92, 92, col, 22, 'stroke-width="4"')}${T(x, y + 18, sym, 50, "#fff", "Russo One")}`;
const gameBox = (x, y, s, col, title, face = "calm", walk = 0) => {
  const b = Math.abs(Math.sin(walk * 10)) * 10;
  const eyes = face === "sad" ? `<path d="M-30 -60 q10 8 20 0 M10 -60 q10 8 20 0" stroke="${O}" stroke-width="6" fill="none"/>` : `<circle cx="-20" cy="-60" r="9" fill="${O}"/><circle cx="20" cy="-60" r="9" fill="${O}"/>`;
  return `<g transform="translate(${x},${y - b}) scale(${s})"><line x1="-24" y1="80" x2="${-28 + Math.sin(walk * 10) * 12}" y2="130" stroke="${O}" stroke-width="10" stroke-linecap="round"/><line x1="24" y1="80" x2="${28 - Math.sin(walk * 10) * 12}" y2="130" stroke="${O}" stroke-width="10" stroke-linecap="round"/>
    ${R(-75, -110, 150, 200, col, 10)}<rect x="-60" y="-20" width="120" height="60" fill="#fff" opacity=".9"/>${T(0, 18, title, title.length > 6 ? 22 : 30, O, "Russo One")}${eyes}</g>`;
};
const suit = (x, y, s, face = "calm") => gamer({ x, y, s, face, shirt: "#2E2A44", hair: "#3A3550" }).replace('fill="#2E2A44" stroke', 'fill="#2E2A44" stroke') + `<g transform="translate(${x},${y}) scale(${s})"><path d="M-12 -240 L0 -150 L12 -240 Z" fill="${RED}" stroke="${O}" stroke-width="4"/></g>`;
// старение геймера к финалу
const oldGamer = (x, y, s, age) => {
  let g = gamer({ x, y, s, face: age > 0.5 ? "sad" : "calm", shirt: PINK, hair: age > 0.3 ? `rgb(${80 + age * 140},${80 + age * 140},${90 + age * 140})` : "#2B1B12" });
  if (age > 0.4) g += `<g transform="translate(${x},${y}) scale(${s})"><path d="M-70 -270 Q0 ${-150 + age * 90} 70 -270 Q40 -240 0 -238 Q-40 -240 -70 -270 Z" fill="#E8E2EE" stroke="${O}" stroke-width="5" opacity="${clamp((age - 0.4) * 3)}"/></g>`;
  return g;
};

// ---------- сцены по абзацам ----------
const SH = [];
// 0. Хук: календарь 19 ноября → штамп «ПЕРЕНЕСЕНО» → отъезд в неоновый город и «?»
SH[0] = (t) => {
  const tP = wt(0, "перенесли"), tC = wt(0, "что");
  let s = sunset(t, 0.35);
  const k = t < tC ? 1 : lerp(1, 0.55, easeInOut((t - tC) / 0.8));
  let cal = card(540, 800, 560, 620, -3, `<rect x="-280" y="-310" width="560" height="140" rx="22" fill="${RED}"/>${T(0, -215, "НОЯБРЬ 2026", 54, "#fff")}${T(0, 90, "19", 300, O)}`);
  if (t >= tP) cal += at(560, 850, lerp(2.4, 1, easeOut((t - tP) / 0.18)), `<g transform="translate(560,850) rotate(-14)">${R(-300, -75, 600, 150, "none", 16, `stroke="${RED}" stroke-width="14"`)}${T(0, 30, "ПЕРЕНЕСЕНО", 82, RED)}</g>`);
  s += `<g transform="translate(540,800) scale(${k}) translate(-540,-800)">${cal}</g>`;
  if (t >= tC) s += at(840, 560, pop(t, tC + 0.3), TS(840, 620, "?", 220, YEL));
  return { s };
};
// 1. 23:59 → палец на кнопке → полночь → экран зависает → «Дата релиза изменена»
SH[1] = (t) => {
  const tP = wt(1, "держишь"), tN = wt(1, "полночь", 1), tZ = wt(1, "зависает"), tD = wt(1, "дата");
  let s = sunset(t, 0.6);
  const frozen = t >= tZ;
  let scr = t < tZ ? `${R(-110, -40, 220, 80, "#3FB27F", 40)}${T(0, 16, "ИГРАТЬ", 38, "#fff")}` : `${T(0, 0, "ИГРАТЬ", 38, "#5A5A6A")}${[...Array(6)].map((_, i) => `<rect x="-180" y="${-110 + i * 38 + ((t * 40) % 20)}" width="360" height="6" fill="${CYAN}" opacity=".5"/>`).join("")}`;
  s += monitor(540, 760, 1.5, scr);
  // палец
  if (t >= tP && t < tZ) { const d = 12 * Math.sin(t * 6); s += `<g transform="translate(${560 + d},${1010})"><rect x="-26" y="-120" width="52" height="150" rx="26" fill="#F3C6A0" stroke="${O}" stroke-width="${SW}"/></g>`; }
  s += gamer({ x: 300, y: 1260, s: 0.8, back: true, shirt: PINK });
  if (t >= tD) s += notif(540, 600, pop(t, tD), "ROCKSTAR", "Дата релиза изменена");
  s += sfxT(t, tZ, 800, 1010, 8, "ЗАВИС", 80, CYAN, 1.2);
  return { s, hud: dateCard(t < tN ? "19.11 · 23:59" : "20.11 · 00:00") };
};
// 2. Интернет сходит с ума: телефон, 100 → 1 000 → 10 000, посты, дым
SH[2] = (t, u) => {
  const t100 = wt(2, "сто"), t1k = wt(2, "тысяча"), t10k = wt(2, "десять"), tS = wt(2, "соцсети"), tT = wt(2, "телефон");
  let s = sunset(t, 0.65);
  const n = t < t100 ? 3 : t < t1k ? 100 : t < t10k ? 1000 : Math.round(lerp(10000, 99999, clamp((t - t10k) / 4)));
  const hot = clamp((t - tT) / 1.5);
  const sh = hot > 0 ? Math.sin(t * 60) * 6 * hot : (t >= t100 ? Math.sin(t * 50) * 3 : 0);
  let inner = `${T(0, -300, "УВЕДОМЛЕНИЯ", 36, "#BDB6D6", "Russo One")}${TS(0, -200, n.toLocaleString("ru-RU"), 110, RED, "Russo One", 10)}`;
  inner += appIcon(-120, -40, "#FF3B5C", "▶") + appIcon(0, -40, "#12081F", "♪") + appIcon(120, -40, "#5B8DEF", "✉") + appIcon(-120, 90, ORG, "★") + appIcon(0, 90, "#3FB27F", "☎") + appIcon(120, 90, PINK, "♥");
  [[-120, -40], [0, -40], [120, -40], [-120, 90], [0, 90], [120, 90]].forEach(([x, y], i) => { if (t >= t100 + i * 0.1) inner += `${C(x + 40, y - 40, 22, RED, 'stroke-width="3"')}${T(x + 40, y - 31, n > 999 ? "99+" : String(Math.min(n, 99)), 18, "#fff", "Russo One")}`; });
  s += `<g transform="translate(${sh},0)">${phoneBig(540, 820, 0.95, inner, hot)}</g>`;
  if (t >= tS) { const m = ["GTA 6 ПЕРЕНЕСЛИ", "BRO…", "ОПЯТЬ?!", "19 НОЯБРЯ???", "НЕ ВЕРЮ", "ROCKSTAR WHY"]; const k = Math.min(18, Math.floor((t - tS) * 8)); for (let i = 0; i < k; i++) s += post(120 + rnd(i) * 840, 520 + rnd(i + 30) * 620, m[i % m.length], SHIRTS[i % 8], -14 + rnd(i + 7) * 28); }
  if (hot > 0) s += smoke(540, 420, t, 7);
  return { s };
};
// 3. Новости: студия + бегущая строка → 4 экрана с заголовками
SH[3] = (t) => {
  const tR = wt(3, "rockstar") || wt(3, "снова");
  let s = `<rect width="${W}" height="${H}" fill="#1B1F4A"/>${[...Array(8)].map((_, i) => `<rect x="${i * 140}" y="420" width="70" height="740" fill="#24285A"/>`).join("")}`;
  const split = t >= wt(3, "перенесла") + 0.6;
  if (!split) {
    s += `${R(96, 980, 888, 60, "#2E2A44")}` + suit(540, 1180, 0.9, "shock");
    s += `<g>${R(60, 1020, 960, 110, RED, 0)}${T(90, 1095, "СРОЧНО", 54, "#fff", "Russo One", "start")}<rect x="340" y="1032" width="660" height="86" fill="#fff"/>${T(360, 1092, "ROCKSTAR СНОВА ПЕРЕНЕСЛА GTA 6", 34, O, "Russo One", "start")}</g>`;
  } else {
    const hl = ["ИГРОКИ В ШОКЕ", "ЧТО С ROCKSTAR?", "ПЕРЕНОС №3", "GTA 6: 2027?"];
    hl.forEach((h, i) => { const x = 300 + (i % 2) * 480, y = 700 + Math.floor(i / 2) * 330; s += at(x, y, pop(t, wt(3, "перенесла") + 0.6 + i * 0.15), `<g transform="translate(${x},${y})">${R(-210, -140, 420, 280, "#2E2A44", 16)}<rect x="-190" y="-120" width="380" height="200" fill="#5B8DEF"/>${R(-190, 40, 380, 60, RED, 0)}${T(0, 82, h, 28, "#fff", "Russo One")}</g>`); });
  }
  return { s };
};
// 4. Офис: 1 → 10 → сотни, отъезд. Внутри: камеры наблюдения, «Сколько их?» → 12 000 000 → «…Понятно»
SH[4] = (t) => {
  const t1 = wt(4, "один"), t10 = wt(4, "десять"), t100 = wt(4, "сотни"), tIn = wt(4, "внутри"), tSk = wt(4, "сколько"), tPo = wt(4, "понятно");
  if (t < tIn) {
    const count = t < t10 ? 1 : t < t100 ? 10 : 140;
    const zoom = t < t100 ? 1.25 : lerp(1.25, 0.72, easeInOut((t - t100) / 1.4));
    let world = building(0);
    const signs = ["ОТДАВАЙТЕ GTA 6", "МЫ ЖДАЛИ 13 ЛЕТ", "19.11 !!!", "Я ВЗЯЛ ОТПУСК"];
    for (let i = 0; i < count; i++) {
      const row = Math.floor(i / 14), col = i % 14;
      const x = i === 0 ? 540 : 540 + (col - 6.5) * 120 + (row % 2) * 60;
      world += tiny(x, 1180 + row * 70, 1 - row * 0.03, i, t, 0, i % 9 === 3 && row < 4 ? signs[i % 4] : "");
    }
    return { s: sunset(t, 0.35) + `<g transform="translate(540,1100) scale(${zoom}) translate(-540,-1100)">${world}</g>`, hud: `<g transform="translate(540,330)">${R(-340, -60, 680, 120, O, 60, `stroke="${CYAN}"`)}${T(-310, 16, "ФАНАТОВ:", 44, CYAN, "Russo One", "start")}${T(310, 18, String(count === 140 ? "сотни" : count), 50, YEL, "Russo One", "end")}</g>` };
  }
  let s = `<rect width="${W}" height="${H}" fill="#140C2A"/>`;
  for (let i = 0; i < 9; i++) { const x = 240 + (i % 3) * 300, y = 600 + Math.floor(i / 3) * 190; s += `${R(x - 135, y - 80, 270, 160, "#2E2A44", 8)}<rect x="${x - 120}" y="${y - 66}" width="240" height="132" fill="#1E3A2E"/>${[...Array(18)].map((_, k) => `<circle cx="${x - 105 + (k % 9) * 26}" cy="${y - 20 + Math.floor(k / 9) * 40}" r="8" fill="#7CFFB2" opacity=".7"/>`).join("")}`; }
  s += `${R(96, 1120, 888, 40, "#3A2E55")}` + gamer({ x: 540, y: 1330, s: 0.8, face: t >= tSk ? "shock" : "calm", shirt: "#3A3550", hair: "#555" });
  if (t >= tSk && t < tPo) s += bubble(540, 560, "СКОЛЬКО ИХ?", 50, 1, pop(t, tSk)) + at(540, 830, pop(t, tSk + 0.6), `<g transform="translate(540,830)">${R(-330, -80, 660, 160, O, 20, `stroke="${RED}" stroke-width="8"`)}${T(0, 30, "12 000 000", 96, RED)}</g>`);
  if (t >= tPo) s += bubble(540, 560, "…ПОНЯТНО.", 54, 1, pop(t, tPo));
  return { s };
};
// 5. GTA Online: «ONLINE» → один, второй, миллион → сервер «ПОЖАЛУЙСТА, ХВАТИТ!»
SH[5] = (t) => {
  const t1 = wt(5, "один"), t2 = wt(5, "второй"), tM = wt(5, "миллион"), tS = wt(5, "сервер");
  let s = sunset(t, 0.55);
  if (t < tS) {
    s += `<g transform="translate(540,640)">${R(-360, -110, 720, 220, O, 30, `stroke="${PINK}" stroke-width="8"`)}${neon(0, 40, "ONLINE", 130, PINK)}</g>`;
    const n = t < t1 ? 0 : t < t2 ? 1 : t < tM ? 2 : 60;
    for (let i = 0; i < n; i++) { const x = n < 3 ? 400 + i * 280 : 120 + (i % 12) * 76, y = n < 3 ? 1150 : 900 + Math.floor(i / 12) * 60; s += at(x, y, pop(t, (n < 3 ? [t1, t2][i] : tM + i * 0.01)), tiny(x, y, n < 3 ? 1.6 : 0.7, i + 4, t)); }
    if (t >= tM) s += at(540, 820, pop(t, tM), `<g transform="translate(540,820)">${R(-280, -60, 560, 120, O, 60, `stroke="${YEL}"`)}${T(0, 22, "+1 000 000", 64, YEL)}</g>`);
    return { s };
  }
  const sw = Math.sin(t * 40) * 5;
  s += `<g transform="translate(${540 + sw},860)">${R(-200, -330, 400, 620, "#2E2A44", 16)}${[...Array(6)].map((_, i) => `${R(-170, -300 + i * 90, 340, 60, "#1B1F3A", 8)}<circle cx="130" cy="${-270 + i * 90}" r="10" fill="${(Math.floor(t * 10) + i) % 2 ? RED : "#3FB27F"}"/>`).join("")}
    ${C(-70, -110, 34, "#fff")}${C(70, -110, 34, "#fff")}<circle cx="-70" cy="-104" r="10" fill="${O}"/><circle cx="70" cy="-104" r="10" fill="${O}"/><path d="M-50 -20 Q0 -60 50 -20" stroke="#fff" stroke-width="10" fill="none"/>
    <path d="M150 -200 q-14 26 0 38 q14 -12 0 -38 Z" fill="#9FE3FF" stroke="${O}" stroke-width="4"/></g>` + smoke(540, 520, t, 6);
  s += bubble(540, 470, "ПОЖАЛУЙСТА, ХВАТИТ!", 46, 1, pop(t, tS + 0.2));
  return { s };
};
// 6. Другие игры: «Я не выйду» — «Наша очередь!» — забегают в ноябрь
SH[6] = (t, u) => {
  const tQ = wt(6, "очередь");
  let s = sunset(t, 0.5);
  s += `<g transform="translate(820,820)">${R(-150, -260, 300, 460, "#2B1B4A", 12)}<rect x="-130" y="-240" width="260" height="420" fill="${YEL}" opacity=".85"/>${T(0, -280, "НОЯБРЬ", 52, YEL)}</g>`;
  const gx = lerp(560, -150, easeInOut(u / 3.5));
  s += gameBox(gx, 1000, 1.3, PINK, "GTA 6", "sad", u);
  if (u < 2.2) s += bubble(Math.max(260, gx + 40), 600, "Я НЕ ВЫЙДУ", 44, -1, pop(t, START[6] + 0.3));
  const titles = [["ГОНКИ 27", CYAN], ["ФЕРМА 3", "#3FB27F"], ["КОСМОС-ОПС", ORG], ["ДРАКОН 2", "#8E7CC3"]];
  titles.forEach(([tt, col], i) => {
    let x = 150 + i * 190;
    if (i === 0 && t >= tQ) x = lerp(150, 820, easeInOut((t - tQ) / 0.8));
    s += gameBox(x, 1060, 0.95, col, tt, "calm", t >= tQ ? u * 1.5 : 0);
  });
  if (t >= tQ) s += bubble(330, 640, "НАША ОЧЕРЕДЬ!", 46, -1, pop(t, tQ));
  return { s };
};
// 7. Серьёзно: фанаты vs инвесторы, график вниз, «−12% за день (2013)», шкала доверия
SH[7] = (t) => {
  const tA = wt(7, "акции"), t12 = wt(7, "двенадцати"), t3 = wt(7, "третий"), tD = wt(7, "доверию");
  let s = `<rect width="${W}" height="${H}" fill="#140C2A"/>${R(96, 520, 430, 640, "#2B1B4A", 10)}${R(554, 520, 430, 640, "#1B2A4A", 10)}`;
  s += T(311, 580, "ФАНАТЫ", 40, PINK) + T(769, 580, "ИНВЕСТОРЫ", 40, CYAN);
  for (let i = 0; i < 6; i++) s += tiny(170 + (i % 3) * 120, 900 + Math.floor(i / 3) * 140, 1.2, i, t) + sfxT(t, START[7] + 0.2 + i * 0.1, 170 + (i % 3) * 120, 740 + Math.floor(i / 3) * 140, 0, "!!!", 40, RED, 9);
  const fall = clamp((t - tA) / 1.6);
  const pts = [...Array(9)].map((_, i) => `${600 + i * 42},${700 + (i < 4 ? Math.sin(i) * 20 : (i - 3) * 50 * fall)}`).join(" ");
  s += `<polyline points="${pts}" fill="none" stroke="${fall > 0 ? RED : "#3FB27F"}" stroke-width="10" stroke-linejoin="round"/>`;
  s += suit(769, 1150, 0.6, t >= tA ? "shock" : "calm");
  if (t >= t12) s += at(769, 640, pop(t, t12), `<g transform="translate(769,640) rotate(-4)">${R(-190, -50, 380, 100, "#fff", 12)}${T(0, 14, "2013: −12% ЗА ДЕНЬ", 30, RED)}</g>`);
  if (t >= t3 && t < tD) s += bubble(700, 470, "ЗВОНИТЬ ROCKSTAR?", 34, 1, pop(t, t3)) + bubble(380, 470, "УЖЕ.", 44, -1, pop(t, t3 + 1.2));
  if (t >= tD) { const lv = 1 - easeOut((t - tD) / 1.2) * 0.85; s += `<g transform="translate(540,1080)">${R(-360, -50, 720, 100, O, 50, `stroke="#fff"`)}${T(-330, 14, "ДОВЕРИЕ", 36, "#fff", "Russo One", "start")}<rect x="-90" y="-22" width="${420 * lv}" height="44" rx="22" fill="${lv > 0.5 ? "#3FB27F" : RED}"/></g>`; }
  return { s };
};
// 8. Кульминация: календарь 2026 → 2027 → 2028, геймер стареет, «…GTA 7?»
SH[8] = (t) => {
  const tQ = wt(8, "последний"), y6 = wt(8, "двадцать", 0), y7 = wt(8, "двадцать", 1), y8 = wt(8, "двадцать", 2), t7 = wt(8, "gta") || (y8 + 1.6);
  let s = sunset(t, 0.7 - 0.3 * clamp((t - tQ) / 2));
  const yr = t < y7 ? "2026" : t < y8 ? "2027" : "2028";
  const flip = [y7, y8].some((x) => t >= x && t < x + 0.25) ? 0.92 : 1;
  s += at(540, 760, flip, card(540, 760, 520, 560, 3, `<rect x="-260" y="-280" width="520" height="130" rx="22" fill="${RED}"/>${T(0, -195, "НОЯБРЬ", 54, "#fff")}${T(0, 100, t >= y6 ? yr : "2026", 170, O)}`));
  const age = t < y6 ? 0 : t < y7 ? 0.25 : t < y8 ? 0.55 : 0.9;
  s += oldGamer(540, 1390, 1.05, age);
  if (t >= y8 + 1.3) s += bubble(540, 470, "…GTA 7?", 64, 1, pop(t, y8 + 1.3));
  return { s };
};
// 9. Вопрос → заставка
SH[9] = (t) => {
  let s = sunset(t, 0.45);
  if (t < DUR + 0.2) {
    for (let i = 0; i < 28; i++) s += tiny(140 + (i % 7) * 135, 1050 + Math.floor(i / 7) * 60, 0.8, i + 3, t);
    s += at(540, 1540, pop(t, START[9] + 0.5), `<g transform="translate(540,1540)">${R(-330, -55, 660, 110, YEL, 55)}${T(0, 20, "ПИШИ В КОММЕНТЫ ↓", 50, O)}</g>`);
    return { s };
  }
  const u = t - DUR, pk = 1 + 0.05 * Math.sin(u * 7);
  s += TS(540, 560, "ПОДПИШИСЬ,", 96, "#fff", "Oswald") + TS(540, 660, "ЧТОБЫ НЕ ПРОПУСТИТЬ", 70, "#fff", "Oswald");
  s += at(540, 820, pop(t, DUR + 0.3) * pk, `${R(250, 760, 580, 120, RED, 60)}${T(540, 842, "ПОДПИСАТЬСЯ", 60, "#fff")}`);
  return { s, noSubs: true };
};

// ---------- звуки (для микса) ----------
export let SFX = [];
function buildSfx() {
  SFX = [];
  const add = (t, k, v = 1) => SFX.push({ t: +t.toFixed(3), k, v });
  add(wt(0, "перенесли"), "stamp"); add(wt(0, "что") + 0.3, "pop");
  add(wt(1, "зависает"), "flash", 0.6); add(wt(1, "дата"), "ding");
  ["сто", "тысяча", "десять"].forEach((w) => add(wt(2, w), "beep", 0.8)); add(wt(2, "соцсети"), "flutter"); add(wt(2, "телефон"), "puff");
  add(START[3], "swish"); add(wt(3, "перенесла") + 0.6, "pop");
  ["один", "десять", "сотни"].forEach((w) => add(wt(4, w), "pop", 0.7)); add(wt(4, "внутри"), "whoosh", 0.6); add(wt(4, "сколько") + 0.6, "stamp", 0.7);
  ["один", "второй"].forEach((w) => add(wt(5, w), "pop", 0.7)); add(wt(5, "миллион"), "cash"); add(wt(5, "сервер"), "tremble");
  add(START[6] + 0.3, "pff"); add(wt(6, "очередь"), "whoosh");
  add(wt(7, "акции"), "thud"); add(wt(7, "двенадцати"), "stamp", 0.7); add(wt(7, "доверию"), "pff");
  add(wt(8, "двадцать", 1), "swish", 0.6); add(wt(8, "двадцать", 2), "swish", 0.6);
  add(START[9] + 0.5, "pop"); add(DUR + 0.3, "ding");
  SFX.sort((a, b) => a.t - b.t);
}
const SHAKES = () => [[wt(0, "перенесли"), 16], [wt(1, "зависает"), 10], [wt(4, "сколько") + 0.6, 12], [wt(5, "сервер"), 10], [wt(7, "акции"), 10]];

// ---------- кадр ----------
export function frame(t) {
  let si = START.findIndex((a, i) => t >= a && t < END[i]);
  if (si < 0) si = NP - 1;
  const u = t - START[si], d = END[si] - START[si];
  const { s, hud = "", noSubs } = SH[si](t, u, d);
  const k = 1 + 0.04 * easeInOut(u / d);
  let sx = 0, sy = 0;
  for (const [ts, a] of SHAKES()) { const v = t - ts; if (v >= 0 && v < 0.5) { const e = a * Math.exp(-v * 9); sx += e * Math.sin(v * 70); sy += e * Math.cos(v * 55); } }
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">${DEFS}
    <g transform="translate(${sx},${sy}) translate(540,960) scale(${k}) translate(-540,-960)">${s}</g>
    <rect width="${W}" height="${H}" fill="url(#vig)"/>${hud}${noSubs ? "" : subtitles(t)}</svg>`;
}
