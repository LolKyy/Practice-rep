// «GTA 6 перенесли» v3 — под озвучку. Крупные планы, смена плана каждые 2–3 с, текст всегда внутри кадра.
import { LIB, W, H, FPS } from "./scene.js";
const { O, PINK, CYAN, YEL, RED, ORG, SW, SHIRTS, clamp, lerp, easeOut, easeInOut, easeOutBack, pop, rnd, at, R, C, T, TS, neon, sunset, DEFS, gamer, tiny, monitor, building, smoke } = LIB;
export { W, H, FPS };

let WORDS = [], NP = 0, START = [], END = [], DUR = 0;
export let TOTAL = 87;
export function setData(d) {
  WORDS = d.words; NP = d.paras.length; DUR = d.duration; TOTAL = d.duration + 2.3;
  START = Array.from({ length: NP }, (_, i) => (i === 0 ? 0 : Math.max(0, WORDS.find((w) => w.p === i).s - 0.15)));
  END = START.map((s, i) => (i + 1 < NP ? START[i + 1] : TOTAL));
  buildGroups(); buildSfx();
}
// время слова (n начинается со stem); occ — какое по счёту в абзаце
function wt(pi, stem, occ = 0) {
  const ws = WORDS.filter((w) => w.p === pi && w.n.startsWith(stem));
  const w = ws[occ] || ws[ws.length - 1];
  return w ? w.s : START[pi];
}

// ---------- сцена-«окно» и безопасные зоны ----------
// всё действие — в прямоугольнике STAGE; субтитры ниже, табло выше
const SX = 40, SY = 420, SWD = 1000, SHT = 760;
const STAGE_CLIP = `<clipPath id="stage"><rect x="${SX}" y="${SY}" width="${SWD}" height="${SHT}" rx="36"/></clipPath>`;
// без рамки: сцена на весь экран (фон каждой сцены и так полноэкранный)
const stage = (inner) => inner;

// ---------- субтитры: 1–3 слова, автоподгон размера, 2 строки при нужде ----------
const REDW = ["перенесли", "полночь", "интернет", "перенесла", "сотни", "онлайн", "очередь", "rockstar", "последний", "требуется", "ждешь"];
const CENSOR = { "блять": "бл*ть", "пиздец": "п*здец" };
let GROUPS = [], RED_IDX = new Set();
function buildGroups() {
  GROUPS = []; let cur = [];
  const flush = () => { if (cur.length) GROUPS.push(cur); cur = []; };
  WORDS.forEach((w) => {
    if (cur.length && cur[0].p !== w.p) flush();
    cur.push(w);
    const len = cur.reduce((a, x) => a + x.w.length + 1, 0);
    if (cur.length >= 3 || /[.,!?…:»]$/.test(w.w) || len > 15) flush();
  });
  flush();
  RED_IDX = new Set();
  REDW.forEach((stem, pi) => { const ws = WORDS.filter((w) => w.p === pi && (w.n.startsWith(stem) || w.w.toLowerCase().includes(stem))); if (ws.length) RED_IDX.add(WORDS.indexOf(ws[0])); });
}
const textW = (s, size) => s.length * size * 0.5; // Oswald 700, заглавные ≈ 0.5em
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
  const MAXW = 900;
  let lines = [items], size = 100;
  const lw = (ln, sz) => textW(ln.map((x) => x.t).join(" "), sz);
  if (lw(items, size) > MAXW && items.length > 1) { const h = Math.ceil(items.length / 2); lines = [items.slice(0, h), items.slice(h)]; }
  while (Math.max(...lines.map((l) => lw(l, size))) > MAXW && size > 56) size -= 4;
  const lh = size * 1.08, y0 = 1330 - ((lines.length - 1) * lh) / 2;
  const boxW = Math.max(...lines.map((l) => lw(l, size))) + 80, boxH = lines.length * lh + size * 0.4;
  const k = 0.9 + 0.1 * easeOutBack((t - g[0].s + 0.05) / 0.18);
  return at(540, 1330, k, `<rect x="${540 - boxW / 2}" y="${y0 - size * 0.86}" width="${boxW}" height="${boxH}" rx="26" fill="${O}" opacity=".6"/>` +
    lines.map((ln, i) => `<text x="540" y="${y0 + i * lh}" text-anchor="middle" font-family="Oswald" font-weight="700" font-size="${size}" stroke="${O}" stroke-width="12" stroke-linejoin="round" paint-order="stroke">${ln.map((x) =>
      `<tspan fill="${x.key ? YEL : "#fff"}" fill-opacity="${x.on ? 1 : 0.45}">${x.t}</tspan>`).join(" ")}</text>`).join(""));
}

// ---------- элементы ----------
const card = (x, y, w, h, rot, inner, fill = "#fff") => `<g transform="translate(${x},${y}) rotate(${rot})"><rect x="${-w / 2 + 10}" y="${-h / 2 + 12}" width="${w}" height="${h}" rx="22" fill="${O}" opacity=".35"/>${R(-w / 2, -h / 2, w, h, fill, 22)}${inner}</g>`;
const topPill = (label, value, col = CYAN, vcol = YEL) => `<g transform="translate(540,300)">${R(-360, -58, 720, 116, O, 58, `stroke="${col}" stroke-width="6"`)}${T(-330, 16, label, 40, col, "Russo One", "start")}${T(330, 18, value, 52, vcol, "Russo One", "end")}</g>`;
const dateCard = (txt) => `<g transform="translate(540,300) rotate(-2)">${R(-260, -66, 520, 132, "#fff", 18)}${T(0, 28, txt, 76, RED)}</g>`;
const sfxT = (t, t0, x, y, rot, txt, size = 90, fill = YEL, life = 0.9) => {
  if (t < t0 || t > t0 + life) return "";
  const k = pop(t, t0, 0.3) * (1 - clamp((t - t0 - life + 0.2) / 0.2));
  return at(x, y, k, `<g transform="translate(${x},${y}) rotate(${rot})">${TS(0, 0, txt, size, fill)}</g>`);
};
function bub(x, y, txt, size = 46, tail = -1, k = 1) {
  if (k <= 0) return "";
  const w = Math.min(940, txt.length * size * 0.62 + 70);
  const cx = Math.max(SX + w / 2 + 10, Math.min(SX + SWD - w / 2 - 10, x));
  return at(cx, y, k, `<g transform="translate(${cx},${y})"><rect x="${-w / 2}" y="-60" width="${w}" height="120" rx="44" fill="#fff" stroke="${O}" stroke-width="${SW}"/><path d="M${tail * 40} 57 L${tail * 70} 112 L${tail * -10} 59" fill="#fff" stroke="${O}" stroke-width="${SW}" stroke-linejoin="round"/>${T(0, 16, txt, size, O)}</g>`);
}
function postCard(x, y, txt, col, rot) {
  const w = txt.length * 17 + 90;
  return `<g transform="translate(${x},${y}) rotate(${rot})">${R(-w / 2, -44, w, 88, "#fff", 18, 'stroke-width="4"')}${C(-w / 2 + 40, 0, 22, col, 'stroke-width="3"')}${T(20, 11, txt, 28, O, "Russo One")}</g>`;
}
const phoneBig = (x, y, s, inner, hot = 0) => `<g transform="translate(${x},${y}) scale(${s})">${R(-230, -420, 460, 840, hot ? `rgb(${46 + hot * 170},42,68)` : "#2E2A44", 50)}<rect x="-205" y="-380" width="410" height="760" rx="30" fill="#140C2A"/>${inner}</g>`;
const appIcon = (x, y, col, sym) => `${R(x - 46, y - 46, 92, 92, col, 22, 'stroke-width="4"')}${T(x, y + 18, sym, 50, "#fff", "Russo One")}`;
// надпись на коробке: длинное название — в две строки, размер под ширину плашки
const titleFit = (title) => {
  const i = title.lastIndexOf(" ");
  const lines = title.length > 7 && i > 0 ? [title.slice(0, i), title.slice(i + 1)] : [title];
  const fs = Math.min(lines.length > 1 ? 24 : 30, 128 / (Math.max(...lines.map((l) => l.length)) * 0.68));
  return lines.length > 1 ? T(0, 6, lines[0], fs, O, "Russo One") + T(0, 6 + fs * 1.05, lines[1], fs, O, "Russo One") : T(0, 18, title, fs, O, "Russo One");
};
const gameBox = (x, y, s, col, title, face = "calm", walk = 0) => {
  const b = Math.abs(Math.sin(walk * 10)) * 10;
  const eyes = face === "sad" ? `<path d="M-30 -60 q10 8 20 0 M10 -60 q10 8 20 0" stroke="${O}" stroke-width="6" fill="none"/>` : `<circle cx="-20" cy="-60" r="9" fill="${O}"/><circle cx="20" cy="-60" r="9" fill="${O}"/>`;
  return `<g transform="translate(${x},${y - b}) scale(${s})"><line x1="-24" y1="80" x2="${-28 + Math.sin(walk * 10) * 12}" y2="130" stroke="${O}" stroke-width="10" stroke-linecap="round"/><line x1="24" y1="80" x2="${28 - Math.sin(walk * 10) * 12}" y2="130" stroke="${O}" stroke-width="10" stroke-linecap="round"/>
    ${R(-75, -110, 150, 200, col, 10)}<rect x="-68" y="-20" width="136" height="60" fill="#fff" opacity=".9"/>${titleFit(title)}${eyes}</g>`;
};
const tie = (x, y, s) => `<g transform="translate(${x},${y}) scale(${s})"><path d="M-14 -245 L0 -140 L14 -245 Z" fill="${RED}" stroke="${O}" stroke-width="4"/></g>`;
const suit = (x, y, s, face = "calm") => gamer({ x, y, s, face, shirt: "#2E2A44", hair: "#3A3550" }) + tie(x, y, s);
const sweat = (x, y, s = 1) => `<path transform="translate(${x},${y}) scale(${s})" d="M0 0 q-14 26 0 38 q14 -12 0 -38 Z" fill="#9FE3FF" stroke="${O}" stroke-width="4"/>`;
// старый геймер: седина, борода, очки
function oldGamer(x, y, s, age, face = "calm") {
  const hair = age > 0.25 ? `rgb(${Math.round(60 + age * 170)},${Math.round(55 + age * 170)},${Math.round(70 + age * 170)})` : "#2B1B12";
  let g = gamer({ x, y, s, face: age > 0.6 && face === "calm" ? "sad" : face, shirt: PINK, hair });
  let e = "";
  if (age > 0.3) e += `<path d="M-80 -275 Q0 ${-175 + age * 120} 80 -275 Q45 -238 0 -236 Q-45 -238 -80 -275 Z" fill="#E8E2EE" stroke="${O}" stroke-width="5" opacity="${clamp((age - 0.3) * 2.5)}"/>`;
  if (age > 0.75) e += `<circle cx="-34" cy="-335" r="27" fill="none" stroke="${O}" stroke-width="6"/><circle cx="34" cy="-335" r="27" fill="none" stroke="${O}" stroke-width="6"/><line x1="-7" y1="-335" x2="7" y2="-335" stroke="${O}" stroke-width="6"/>`;
  if (age > 0.5) e += `<path d="M-60 -400 l-8 -10 M-30 -412 l-4 -12 M40 -408 l6 -12" stroke="#fff" stroke-width="4" opacity=".6"/>`;
  return g + `<g transform="translate(${x},${y}) scale(${s})">${e}</g>`;
}
// крупный план лица (персонаж «смотрит в камеру»)
const faceCU = (fn) => stage(`<rect x="0" y="0" width="${W}" height="${H}" fill="#2B1055"/>${sunset(0, 0.5)}${fn}`);
const cobweb = (x, y, s) => `<g transform="translate(${x},${y}) scale(${s})" opacity=".8">${[0, 25, 50, 75, 90].map((a) => `<line x1="0" y1="0" x2="${Math.cos((a * Math.PI) / 180) * 160}" y2="${Math.sin((a * Math.PI) / 180) * 160}" stroke="#E8E2EE" stroke-width="3"/>`).join("")}${[50, 95, 140].map((r) => `<path d="M${r} 0 Q${r * 0.75} ${r * 0.4} ${r * 0.7} ${r * 0.7} Q${r * 0.4} ${r * 0.75} 0 ${r}" fill="none" stroke="#E8E2EE" stroke-width="3"/>`).join("")}</g>`;

// ---------- сцены по абзацам ----------
const SH = [];
// 0. Хук
SH[0] = (t) => {
  const tP = wt(0, "перенесли"), tC = wt(0, "что");
  if (t < tC) {
    let s = sunset(t, 0.35) + card(540, 800, 600, 660, -3, `<rect x="-300" y="-330" width="600" height="150" rx="22" fill="${RED}"/>${T(0, -232, "НОЯБРЬ 2026", 58, "#fff")}${T(0, 110, "19", 330, O)}`);
    if (t >= tP) s += at(560, 860, lerp(2.4, 1, easeOut((t - tP) / 0.18)), `<g transform="translate(560,860) rotate(-14)">${R(-320, -80, 640, 160, "none", 16, `stroke="${RED}" stroke-width="14"`)}${T(0, 32, "ПЕРЕНЕСЕНО", 88, RED)}</g>`);
    return { s: stage(s) };
  }
  // отъезд: неоновый город, толпа силуэтов, огромный «?»
  let s = sunset(t, 0.2);
  for (let i = 0; i < 26; i++) s += tiny(80 + (i % 13) * 75, 1120 + Math.floor(i / 13) * 50, 0.8, i, t);
  s += at(540, 700, pop(t, tC + 0.1, 0.5), TS(540, 800, "?", 380, YEL, "Russo One", 18));
  return { s: stage(s) };
};
// 1. Полночь: общий план → палец над «ИГРАТЬ» → часы 23:59→00:00 → экран завис → «дата изменена» + лицо
SH[1] = (t) => {
  const tP = wt(1, "держишь"), tN = wt(1, "полночь", 1), tZ = wt(1, "зависает"), tD = wt(1, "дата");
  let s;
  if (t < tP) s = sunset(t, 0.55) + monitor(540, 740, 1.6, `${R(-110, -40, 220, 80, "#3FB27F", 40)}${T(0, 16, "ИГРАТЬ", 38, "#fff")}`) + gamer({ x: 540, y: 1420, s: 1.35, back: true, shirt: PINK });
  else if (t < tN) { const d = 10 * Math.sin(t * 7); s = `<rect width="${W}" height="${H}" fill="#0E0A22"/>${R(220, 600, 640, 260, "#3FB27F", 130)}${T(540, 770, "ИГРАТЬ", 120, "#fff")}<g transform="translate(${600 + d},1000) rotate(-8)"><rect x="-60" y="-260" width="120" height="420" rx="60" fill="#F3C6A0" stroke="${O}" stroke-width="${SW}"/><path d="M-40 -200 q40 -20 80 0" stroke="${O}" stroke-width="5" fill="none" opacity=".4"/></g>`; }
  else if (t < tZ) { const flip = easeOut((t - tN) / 0.3); s = `<rect width="${W}" height="${H}" fill="#0E0A22"/>${R(140, 600, 800, 420, "#1A1033", 40)}${T(540, 900, flip < 0.5 ? "23:59" : "00:00", 230, flip < 0.5 ? "#fff" : RED, "Russo One")}`; }
  else if (t < tD) { s = `<rect width="${W}" height="${H}" fill="#0E0A22"/>` + monitor(540, 800, 2.2, `${T(0, 0, "ИГРАТЬ", 38, "#5A5A6A")}${[...Array(7)].map((_, i) => `<rect x="-180" y="${-110 + i * 32 + ((t * 60) % 16)}" width="360" height="6" fill="${CYAN}" opacity=".6"/>`).join("")}`); }
  else { s = sunset(t, 0.5) + gamer({ x: 540, y: 1560, s: 2.1, face: "shock", shirt: PINK }) + `<g transform="translate(540,600)">${R(-430, -110, 860, 220, "#fff", 28)}${C(-350, -10, 46, RED)}${T(-350, 10, "!", 56, "#fff")}${T(-280, -28, "ROCKSTAR", 40, O, "Russo One", "start")}${T(-280, 34, "Дата релиза изменена", 40, "#5A4A6A", "Rubik", "start", 'font-weight="800"')}</g>`; }
  s = stage(s) + sfxT(t, tZ, 820, 1080, 8, "ЗАВИС", 70, CYAN, 1.0);
  return { s, hud: dateCard(t < tN ? "18.11 · 23:59" : "19.11 · 00:00") };
};
// 2. Интернет: телефон 100 → 1 000 → 10 000, посты, телефон дымится, лицо в панике
SH[2] = (t) => {
  const t100 = wt(2, "сто"), t1k = wt(2, "тысяча"), t10k = wt(2, "десять"), tT = wt(2, "телефон");
  const n = t < t100 ? 3 : t < t1k ? 100 : t < t10k ? 1000 : Math.round(lerp(10000, 99999, clamp((t - t10k) / 3)));
  const hot = clamp((t - tT) / 1.2);
  const sh = hot > 0 ? Math.sin(t * 60) * 8 * hot : t >= t100 ? Math.sin(t * 50) * 4 : 0;
  let inner = `${T(0, -300, "УВЕДОМЛЕНИЯ", 36, "#BDB6D6", "Russo One")}${TS(0, -190, n.toLocaleString("ru-RU"), 116, RED, "Russo One", 10)}`;
  const icons = [[-120, -20, "#FF3B5C", "▶"], [0, -20, "#12081F", "♪"], [120, -20, "#5B8DEF", "✉"], [-120, 110, ORG, "★"], [0, 110, "#3FB27F", "☎"], [120, 110, PINK, "♥"]];
  icons.forEach(([x, y, c, sym], i) => { inner += appIcon(x, y, c, sym); if (t >= t100 + i * 0.08) inner += `${C(x + 40, y - 40, 24, RED, 'stroke-width="3"')}${T(x + 40, y - 31, n > 99 ? "99+" : String(n), 18, "#fff", "Russo One")}`; });
  let s = sunset(t, 0.65) + `<g transform="translate(${sh},0)">${phoneBig(540, 800, 0.85, inner, hot)}</g>`;
  if (t >= t1k) { const m = ["GTA 6 ПЕРЕНЕСЛИ", "BRO…", "ОПЯТЬ?!", "НЕ ВЕРЮ", "19 НОЯБРЯ???", "ROCKSTAR, WHY"]; const k = Math.min(14, Math.floor((t - t1k) * 6)); for (let i = 0; i < k; i++) s += postCard(240 + rnd(i) * 600, 500 + rnd(i + 30) * 620, m[i % m.length], SHIRTS[i % 8], -12 + rnd(i + 7) * 24); }
  if (hot > 0) s += smoke(540, 430, t, 8);
  if (t >= tT + 0.6) s = sunset(t, 0.5) + gamer({ x: 540, y: 1560, s: 2.1, face: "crazy", shirt: PINK, crazy: 0.6 }) + `<g transform="translate(760,760) rotate(12)">${phoneBig(0, 0, 0.35, "", 1)}</g>` + smoke(760, 640, t, 6) + sweat(420, 820, 1.4);
  return { s: stage(s) };
};
// 3. Новости: ведущий крупно + бегущая строка → стена экранов с заголовками
SH[3] = (t) => {
  const tR = wt(3, "перенесла");
  let s = `<rect width="${W}" height="${H}" fill="#1B1F4A"/>${[...Array(8)].map((_, i) => `<rect x="${i * 140}" y="400" width="70" height="800" fill="#24285A"/>`).join("")}`;
  if (t < tR + 0.5) {
    s += suit(540, 1500, 2.0, "shock");
    const off = ((t * 220) % 1400);
    s += `${R(40, 1010, 1000, 120, RED, 0)}${T(70, 1092, "СРОЧНО", 58, "#fff", "Russo One", "start")}<rect x="330" y="1022" width="710" height="96" fill="#fff"/>
      <clipPath id="tick"><rect x="330" y="1022" width="710" height="96"/></clipPath><g clip-path="url(#tick)">${T(1040 - off, 1088, "ROCKSTAR СНОВА ПЕРЕНЕСЛА GTA 6 ★ ИГРОКИ В ШОКЕ ★", 38, O, "Russo One", "start")}</g>`;
  } else {
    const hl = ["ИГРОКИ В ШОКЕ", "ЧТО С ROCKSTAR?", "ПЕРЕНОС №3", "GTA 6: 2027?"];
    hl.forEach((h, i) => { const x = 290 + (i % 2) * 500, y = 640 + Math.floor(i / 2) * 330; s += at(x, y, pop(t, tR + 0.5 + i * 0.15), `<g transform="translate(${x},${y})">${R(-230, -150, 460, 300, "#2E2A44", 16)}<rect x="-208" y="-128" width="416" height="210" fill="#5B8DEF"/>${suit(0, 70, 0.42, i % 2 ? "shock" : "calm")}${R(-208, 40, 416, 64, RED, 0)}${T(0, 84, h, 30, "#fff", "Russo One")}</g>`); });
  }
  return { s: stage(s) };
};
// 4. Офис: 1 → 10 → сотни (камера отъезжает) → внутри: стена камер, «Сколько их?», 12 000 000, «…Понятно» крупно
SH[4] = (t) => {
  const t1 = wt(4, "один"), t10 = wt(4, "десять"), t100 = wt(4, "сотни"), tIn = wt(4, "внутри"), tSk = wt(4, "сколько"), tPo = wt(4, "понятно");
  if (t < tIn) {
    const count = t < t10 ? 1 : t < t100 ? 10 : 140;
    const zoom = t < t10 ? 1.7 : t < t100 ? 1.3 : lerp(1.3, 0.8, easeInOut((t - t100) / 1.2));
    let world = building(0);
    const signs = ["ОТДАВАЙТЕ GTA 6", "МЫ ЖДАЛИ 13 ЛЕТ", "19.11 !!!", "Я ВЗЯЛ ОТПУСК"];
    for (let i = 0; i < count; i++) {
      const row = Math.floor(i / 14), col = i % 14;
      const x = i === 0 ? 540 : 540 + (col - 6.5) * 110 + (row % 2) * 55;
      world += tiny(x, 1170 + row * 66, 1.1 - row * 0.04, i, t, 0, (i === 0 || (i % 9 === 3 && row < 4)) ? signs[i % 4] : "");
    }
    return { s: stage(sunset(t, 0.35) + `<g transform="translate(540,1080) scale(${zoom}) translate(-540,-1080)">${world}</g>`), hud: topPill("ФАНАТОВ:", count === 140 ? "СОТНИ" : String(count)) };
  }
  if (t < tPo) {
    let s = `<rect width="${W}" height="${H}" fill="#140C2A"/>`;
    for (let i = 0; i < 9; i++) { const x = 230 + (i % 3) * 310, y = 560 + Math.floor(i / 3) * 175; s += `${R(x - 140, y - 75, 280, 150, "#2E2A44", 8)}<rect x="${x - 125}" y="${y - 62}" width="250" height="124" fill="#1E3A2E"/>${[...Array(18)].map((_, k) => `<circle cx="${x - 108 + (k % 9) * 27}" cy="${y - 20 + Math.floor(k / 9) * 40 + Math.sin(t * 6 + k) * 3}" r="8" fill="#7CFFB2" opacity=".75"/>`).join("")}`; }
    s += gamer({ x: 540, y: 1480, s: 1.5, back: true, shirt: "#3A3550", hair: "#555" });
    s += bub(540, 520, "СКОЛЬКО ИХ?", 50, 1, pop(t, tSk));
    if (t >= tSk + 0.5) s += at(540, 800, pop(t, tSk + 0.5), `<g transform="translate(540,800)">${R(-360, -90, 720, 180, O, 20, `stroke="${RED}" stroke-width="8"`)}${T(0, 34, "12 000 000", 110, RED)}</g>`);
    return { s: stage(s) };
  }
  return { s: stage(sunset(t, 0.6) + gamer({ x: 540, y: 1560, s: 2.1, face: "calm", shirt: "#3A3550", hair: "#555" }) + bub(540, 520, "…ПОНЯТНО.", 56, 1, pop(t, tPo))) };
};
// 5. GTA Online: игроки втекают в сервер, счётчик, сервер потеет «ПОЖАЛУЙСТА, ХВАТИТ!»
SH[5] = (t, u) => {
  const t1 = wt(5, "один"), t2 = wt(5, "второй"), tM = wt(5, "миллион"), tS = wt(5, "сервер");
  const rate = t < t1 ? 0 : t < tM ? 2 : 20;
  let s = sunset(t, 0.55);
  if (t < tS) {
    s += `<g transform="translate(540,540)">${R(-330, -80, 660, 160, O, 30, `stroke="${PINK}" stroke-width="8"`)}${neon(0, 34, "ONLINE", 110, PINK)}</g>`;
    s += `<g transform="translate(860,900)">${R(-110, -230, 220, 400, "#2E2A44", 14)}${[...Array(4)].map((_, i) => `${R(-90, -205 + i * 90, 180, 60, "#1B1F3A", 8)}<circle cx="60" cy="${-175 + i * 90}" r="9" fill="${(Math.floor(t * 8) + i) % 2 ? RED : "#3FB27F"}"/>`).join("")}</g>`;
    const N = Math.min(30, Math.floor((t - t1) * rate));
    for (let i = 0; i < N; i++) { const ph = ((t - t1) * 0.7 + i / Math.max(N, 1)) % 1; const x = lerp(80, 780, ph), y = 1050 + Math.sin(i * 1.7) * 60; s += tiny(x, y, rate > 2 ? 0.9 : 1.6, i + 4, t); }
    if (t >= t1 && t < tM) s += sfxT(t, t1, 260, 760, -6, "+1", 90, YEL, 0.8) + sfxT(t, t2, 300, 760, 6, "+1", 90, YEL, 0.8);
    if (t >= tM) { const v = Math.round(lerp(2, 1000000, easeOut((t - tM) / 0.8))); s += `<g transform="translate(460,760)">${R(-300, -60, 600, 120, O, 60, `stroke="${YEL}" stroke-width="6"`)}${T(0, 22, "+" + v.toLocaleString("ru-RU"), 62, YEL)}</g>`; }
    return { s: stage(s) };
  }
  const sw = Math.sin(t * 40) * 6, red = clamp((t - tS) / 1.5);
  s += `<g transform="translate(${540 + sw},880) scale(1.25)">${R(-200, -330, 400, 620, `rgb(${46 + red * 140},42,68)`, 16)}${[...Array(6)].map((_, i) => `${R(-170, -300 + i * 90, 340, 60, "#1B1F3A", 8)}<circle cx="130" cy="${-270 + i * 90}" r="10" fill="${(Math.floor(t * 12) + i) % 2 ? RED : "#3FB27F"}"/>`).join("")}
    ${C(-70, -110, 38, "#fff")}${C(70, -110, 38, "#fff")}<circle cx="-70" cy="-104" r="12" fill="${O}"/><circle cx="70" cy="-104" r="12" fill="${O}"/><path d="M-60 -10 Q0 -60 60 -10" stroke="#fff" stroke-width="12" fill="none"/>${sweat(150, -220, 1.3)}${sweat(-170, -150, 1)}</g>` + smoke(540, 480, t, 7);
  s += bub(540, 500, "ПОЖАЛУЙСТА, ХВАТИТ!", 48, 1, pop(t, tS + 0.15));
  return { s: stage(s) };
};
// 6. Ноябрь: GTA 6 уходит «Я не выйду» → «Наша очередь!» и забег в ноябрь
SH[6] = (t, u) => {
  const tQ = wt(6, "наша") || wt(6, "очередь");
  let s = sunset(t, 0.5) + `<g transform="translate(840,800)">${R(-150, -280, 300, 500, "#2B1B4A", 12)}<rect x="-130" y="-260" width="260" height="460" fill="${YEL}" opacity=".85"/>${T(0, -300, "НОЯБРЬ", 54, YEL)}</g>`;
  const gx = lerp(560, -160, easeInOut(u / 3.2));
  s += gameBox(gx, 980, 1.35, PINK, "GTA 6", "sad", u);
  if (u < 2.4) s += bub(Math.max(300, gx + 40), 560, "Я НЕ ВЫЙДУ", 46, -1, pop(t, START[6] + 0.2));
  [["HALF-LIFE 3", CYAN], ["RDR 3", "#3FB27F"], ["ВЕДЬМАК 4", ORG]].forEach(([tt, col], i) => {
    let x = 160 + i * 200;
    if (t >= tQ) x = lerp(x, 840, easeInOut((t - tQ - i * 0.25) / 0.8));
    s += gameBox(x, 1060, 1.0, col, tt, "calm", t >= tQ ? u * 1.5 : 0);
  });
  if (t >= tQ) s += bub(320, 560, "НАША ОЧЕРЕДЬ!", 48, -1, pop(t, tQ));
  return { s: stage(s) };
};
// 7. Rockstar: тучи над офисом → график 2013 −12% крупно → костюм потеет, «Звонить Rockstar?» — «Уже.»
SH[7] = (t) => {
  const t13 = wt(7, "две"), t12 = wt(7, "двенадцати"), t3 = wt(7, "третий");
  let s;
  if (t < t13) {
    s = sunset(t, 0.6) + building(0) + `<g opacity=".95">${[[300, 470, 90], [460, 450, 110], [640, 460, 100], [780, 480, 80]].map(([x, y, r]) => C(x, y, r, "#3A3550")).join("")}</g>`;
    for (let i = 0; i < 12; i++) { const ph = (t * 1.6 + i / 12) % 1; s += `<line x1="${200 + i * 60}" y1="${520 + ph * 400}" x2="${190 + i * 60}" y2="${560 + ph * 400}" stroke="#9FE3FF" stroke-width="4" opacity=".7"/>`; }
    if (Math.floor(t * 3) % 5 === 0) s += `<path d="M600 520 l-60 120 l50 0 l-50 120" stroke="${YEL}" stroke-width="10" fill="none"/>`;
    return { s: stage(s) };
  }
  if (t < t3) {
    const fall = clamp((t - t13) / 2.5);
    s = `<rect width="${W}" height="${H}" fill="#140C2A"/>${[...Array(6)].map((_, i) => `<line x1="80" y1="${520 + i * 110}" x2="1000" y2="${520 + i * 110}" stroke="#2E2A55" stroke-width="3"/>`).join("")}`;
    const pts = [...Array(12)].map((_, i) => `${100 + i * 80},${620 + (i < 4 ? Math.sin(i) * 20 : (i - 3) * 55 * fall)}`).join(" ");
    s += `<polyline points="${pts}" fill="none" stroke="${RED}" stroke-width="16" stroke-linejoin="round"/>${T(140, 520, "TAKE-TWO · 2013", 44, CYAN, "Russo One", "start")}`;
    if (t >= t12) s += at(720, 640, pop(t, t12), `<g transform="translate(720,640) rotate(-6)">${R(-200, -70, 400, 140, RED, 16)}${T(0, 24, "−12%", 90, "#fff")}</g>`);
    return { s: stage(s) };
  }
  const tU = t3 + 1.3;
  s = sunset(t, 0.6) + suit(540, 1560, 2.1, t < tU ? "shock" : "sad") + sweat(380, 800, 1.6) + sweat(700, 760, 1.2);
  s += t < tU ? bub(540, 520, "ЗВОНИТЬ ROCKSTAR?", 46, 1, pop(t, t3)) : bub(540, 520, "УЖЕ.", 60, 1, pop(t, tU));
  return { s: stage(s) };
};
// 8. Кульминация: листы календаря отрываются 2026 → 2027 → 2028 → 2040, геймер стареет, паутина
SH[8] = (t) => {
  const tQ = wt(8, "последний"), y7 = wt(8, "двадцать", 0), y8 = wt(8, "двадцать", 1), y40 = wt(8, "сороковой");
  const yr = t < y7 ? "2026" : t < y8 ? "2027" : t < y40 ? "2028" : "2040";
  const lastFlip = t >= y40 ? y40 : t >= y8 ? y8 : t >= y7 ? y7 : -9;
  const prevYr = t >= y40 ? "2028" : t >= y8 ? "2027" : "2026";
  let s = sunset(t, 0.75 - 0.25 * clamp((t - tQ) / 2));
  const calIn = (txt) => `<rect x="-240" y="-250" width="480" height="120" rx="22" fill="${RED}"/>${T(0, -170, "НОЯБРЬ", 52, "#fff")}${T(0, 90, txt, 160, O)}`;
  s += card(540, 700, 480, 500, 2, calIn(yr));
  const fl = clamp((t - lastFlip) / 0.7);
  if (lastFlip > 0 && fl < 1) s += `<g transform="translate(${540 + fl * 520},${700 - fl * 260}) rotate(${fl * 70})" opacity="${1 - fl}">${card(0, 0, 480, 500, 2, calIn(prevYr))}</g>`;
  const age = t < y7 ? 0 : t < y8 ? 0.3 : t < y40 ? 0.55 : 0.95;
  s += oldGamer(540, 1470, 1.3, age);
  if (age > 0.9) s += cobweb(60, 440, 1.3) + `<g transform="translate(1020,440) scale(-1,1)">${cobweb(0, 0, 1.3)}</g>`;
  return { s: stage(s), hud: topPill("ЖДЁМ УЖЕ:", `${Number(yr) - 2013} ЛЕТ`, PINK, RED) };
};
// 9. Финал: «GTA 6 вышла!» → дед жмёт «Играть» → «Требуется PlayStation 9» → лицо «ну п*здец»
SH[9] = (t) => {
  const tU = wt(9, "уведомление"), tV = wt(9, "вышла"), tI = wt(9, "играть"), tT = wt(9, "требуется"), tN = wt(9, "ну");
  let s;
  if (t < tI) {
    s = sunset(t, 0.5) + oldGamer(540, 1560, 2.0, 1, "shock");
    if (t >= tU) s += at(540, 580, pop(t, tU), `<g transform="translate(540,580)">${R(-420, -100, 840, 200, "#fff", 28)}${C(-340, 0, 46, "#3FB27F")}${T(-340, 18, "✓", 54, "#fff")}${T(-270, -16, "ROCKSTAR", 40, O, "Russo One", "start")}${T(-270, 44, "GTA 6 ВЫШЛА!", 50, RED, "Russo One", "start")}</g>`);
    if (t >= tV) for (let i = 0; i < 26; i++) { const ph = ((t - tV) * 0.9 + rnd(i)) % 1; s += `<rect x="${80 + rnd(i + 5) * 900}" y="${420 + ph * 760}" width="16" height="26" fill="${SHIRTS[i % 8]}" transform="rotate(${ph * 360 + i * 30} ${88 + rnd(i + 5) * 900} ${433 + ph * 760})"/>`; }
  } else if (t < tN) {
    const shake = t < tT ? Math.sin(t * 50) * 10 : 0;
    s = `<rect width="${W}" height="${H}" fill="#0E0A22"/>` + monitor(540, 760, 2.0, t < tT ? `${R(-110, -40, 220, 80, "#3FB27F", 40)}${T(0, 16, "ИГРАТЬ", 38, "#fff")}` : `<rect x="-180" y="-120" width="360" height="220" fill="#3A0A14"/>${T(0, -40, "ОШИБКА", 40, RED)}${T(0, 10, "Требуется", 30, "#fff", "Rubik", "middle", 'font-weight="800"')}${T(0, 60, "PLAYSTATION 9", 40, YEL)}`);
    if (t < tT) s += `<g transform="translate(${640 + shake},1080) rotate(-12)"><rect x="-50" y="-240" width="100" height="380" rx="50" fill="#F0D2BA" stroke="${O}" stroke-width="${SW}"/>${[0, 1, 2].map((i) => `<path d="M-30 ${-150 + i * 60} q30 10 60 0" stroke="${O}" stroke-width="4" fill="none" opacity=".5"/>`).join("")}</g>`;
  } else {
    s = sunset(t, 0.6) + oldGamer(540, 1560, 2.0, 1, "calm") + cobweb(60, 440, 1.2);
  }
  return { s: stage(s), hud: topPill("ГОД:", "2040", PINK, YEL) };
};
// 10. Вопрос → заставка
SH[10] = (t) => {
  if (t < DUR + 0.2) {
    let s = sunset(t, 0.4);
    const signs = ["ЖДУ!", "2040", "ДА!!!", "УЖЕ НЕТ"];
    for (let i = 0; i < 4; i++) s += `<g transform="translate(${190 + i * 235},1170) scale(1.9)">${tiny(0, 0, 1, i + 2, t, 0, signs[i]).replace(/^<g transform="[^"]*">/, "<g>")}</g>`;
    return { s: stage(s) + at(540, 1560, pop(t, START[10] + 0.4), `<g transform="translate(540,1560)">${R(-330, -55, 660, 110, YEL, 55)}${T(0, 20, "ПИШИ В КОММЕНТЫ ↓", 50, O)}</g>`) };
  }
  // финальная карточка: только вопрос, без «подпишись»
  const u = t - DUR, pk = 1 + 0.04 * Math.sin(u * 6);
  let s = sunset(t, 0.35);
  s += at(540, 760, pop(t, DUR + 0.1) * pk, TS(540, 720, "А ТЫ ЖДЁШЬ", 110, "#fff", "Oswald") + TS(540, 850, "GTA 6?", 150, YEL, "Russo One"));
  s += at(540, 1060, pop(t, DUR + 0.5), `<g transform="translate(540,1060)">${R(-330, -55, 660, 110, YEL, 55)}${T(0, 20, "ПИШИ В КОММЕНТЫ ↓", 50, O)}</g>`);
  return { s, noSubs: true };
};

// ---------- звуки ----------
export let SFX = [];
function buildSfx() {
  SFX = [];
  const add = (t, k, v = 1) => SFX.push({ t: +t.toFixed(3), k, v });
  add(wt(0, "перенесли"), "stamp"); add(wt(0, "что"), "whoosh", 0.6);
  add(wt(1, "держишь"), "tick"); add(wt(1, "полночь", 1), "beep"); add(wt(1, "зависает"), "flash", 0.6); add(wt(1, "дата"), "ding");
  ["сто", "тысяча", "десять"].forEach((w) => add(wt(2, w), "beep", 0.8)); add(wt(2, "тысяча") + 0.2, "flutter"); add(wt(2, "телефон"), "puff");
  add(START[3], "swish"); add(wt(3, "перенесла") + 0.5, "pop");
  ["один", "десять", "сотни"].forEach((w) => add(wt(4, w), "pop", 0.7)); add(wt(4, "внутри"), "whoosh", 0.6); add(wt(4, "сколько") + 0.5, "stamp", 0.7); add(wt(4, "понятно"), "pff");
  ["один", "второй"].forEach((w) => add(wt(5, w), "pop", 0.7)); add(wt(5, "миллион"), "cash"); add(wt(5, "сервер"), "tremble");
  add(START[6] + 0.2, "pff"); add(wt(6, "наша"), "whoosh");
  add(START[7], "thud", 0.6); add(wt(7, "двенадцати"), "stamp", 0.7); add(wt(7, "третий"), "beep", 0.6);
  add(wt(8, "двадцать", 0), "swish", 0.6); add(wt(8, "двадцать", 1), "swish", 0.6); add(wt(8, "сороковой"), "swish", 0.6);
  add(wt(9, "уведомление"), "ding"); add(wt(9, "вышла"), "cash", 0.7); add(wt(9, "требуется"), "boom", 0.6); add(wt(9, "ну"), "pff");
  add(START[10] + 0.4, "pop"); add(DUR + 0.3, "ding");
  SFX.sort((a, b) => a.t - b.t);
}
const SHAKES = () => [[wt(0, "перенесли"), 16], [wt(1, "зависает"), 10], [wt(4, "сколько") + 0.5, 12], [wt(5, "сервер"), 10], [wt(7, "двенадцати"), 10], [wt(9, "требуется"), 16]];

// ---------- кадр ----------
export function frame(t) {
  let si = START.findIndex((a, i) => t >= a && t < END[i]);
  if (si < 0) si = NP - 1;
  const u = t - START[si], d = END[si] - START[si];
  const { s, hud = "", noSubs } = SH[si](t, u, d);
  const k = 1 + 0.03 * easeInOut(u / d);
  let sx = 0, sy = 0;
  for (const [ts, a] of SHAKES()) { const v = t - ts; if (v >= 0 && v < 0.5) { const e = a * Math.exp(-v * 9); sx += e * Math.sin(v * 70); sy += e * Math.cos(v * 55); } }
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">${DEFS.replace("</defs>", STAGE_CLIP + "</defs>")}
    <rect width="${W}" height="${H}" fill="#12081F"/>${sunset(t, 0.82)}
    <g transform="translate(${sx},${sy}) translate(540,800) scale(${k}) translate(-540,-800)">${s}</g>
    ${hud}${noSubs ? "" : subtitles(t)}</svg>`;
}
