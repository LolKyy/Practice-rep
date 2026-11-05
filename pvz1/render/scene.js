// «Правила ночной смены в ПВЗ». Требует draw.js, locations.js и window.DATA (audio/words.json).
/* global DATA */
const WORDS = DATA.words;
const NP = DATA.paras.length;
const TAIL = 1.2;
const TOTAL = DATA.duration + TAIL;
const firstOf = (pi) => WORDS.find((w) => w.p === pi);
const START = Array.from({ length: NP }, (_, i) => (i === 0 ? 0 : Math.max(0, firstOf(i).s - 0.12)));
const END = START.map((s, i) => (i + 1 < NP ? START[i + 1] : TOTAL));
function wt(pi, stem, occ = 0) {
  const ws = WORDS.filter((w) => w.p === pi && w.n.startsWith(stem));
  const w = ws[occ] || ws[ws.length - 1];
  if (!w) { console.warn("нет слова", pi, stem); return START[pi]; }
  return w.s;
}

// ---------- данные ----------
const NIGHT = [1, 1, 1, 1, 1, 1, 1, 0, 0, 0, 0];
const PLACE = ["ПВЗ · 03:00", null, null, null, null, null, null, "ПВЗ · УТРО", null, "ПВЗ · 09:00", null];
const RULE = [null, null, 1, 2, 2, 3, 3, null, null, null, null];
const REDW = ["шевелится", "правила", "примерил", "оформлен", "кантовать", "глаза", "паспортом", "звезд", "вешает", "шевелится", "подпишись"];
// когда нарушено правило
const BROKE = [wt(2, "поздно"), wt(3, "сканирует"), wt(5, "смотрит")];
const ACH = [
  { t: wt(3, "оформлен"), top: "НОВЫЙ НАВЫК", text: "ВОЗВРАТ ЧУДОВИЩ" },
  { t: wt(6, "обиженное"), top: "ДОСТИЖЕНИЕ", text: "ОТШИЛ НЕЧИСТЬ" },
  { t: wt(8, "месяца"), top: "ДОСТИЖЕНИЕ", text: "ЖЕКА — СОТРУДНИК МЕСЯЦА" },
];
const SHAKES = [[wt(0, "смотрит"), 14], [wt(5, "заходит"), 12], [wt(9, "шевелится"), 16]];

// ---------- субтитры ----------
const CENSOR = { "сука": "с*ка", "блять": "бл*ть" };
const GROUPS = [];
{
  let cur = [];
  const flush = () => { if (cur.length) GROUPS.push(cur); cur = []; };
  WORDS.forEach((w) => {
    if (cur.length && cur[0].p !== w.p) flush();
    cur.push(w);
    const len = cur.reduce((a, x) => a + x.n.length, 0);
    const punct = /[.,!?…:»—]$/.test(w.w);
    if (cur.length >= 3 || punct || len > 13) flush();
  });
  flush();
}
const redIdx = new Set();
REDW.forEach((stem, pi) => { const ws = WORDS.filter((w) => w.p === pi && w.n.startsWith(stem)); if (ws.length) redIdx.add(WORDS.indexOf(ws[0])); });
function subText(w) {
  let s = w.w.replace(/[«»"]/g, "");
  for (const [k, v] of Object.entries(CENSOR)) s = s.replace(new RegExp(k, "i"), v);
  return s.toUpperCase();
}
function subtitles(t) {
  const gi = GROUPS.findIndex((g, i) => t >= g[0].s - 0.05 && (i + 1 >= GROUPS.length || t < GROUPS[i + 1][0].s - 0.05));
  if (gi < 0) return "";
  const g = GROUPS[gi];
  if (t > g[g.length - 1].e + 0.6 || g[0].p === NP - 1) return "";
  const items = g.map((w) => ({ t: subText(w), red: redIdx.has(WORDS.indexOf(w)), on: t >= w.s - 0.03 }));
  const total = items.reduce((a, x) => a + x.t.length + 1, 0);
  const lines = total > 14 && items.length > 1 ? [items.slice(0, Math.ceil(items.length / 2)), items.slice(Math.ceil(items.length / 2))] : [items];
  const size = 118, k = 0.85 + 0.15 * easeOutBack((t - g[0].s + 0.05) / 0.18), y0 = 1340 - ((lines.length - 1) * size) / 2;
  const txt = lines.map((ws, i) => `<text x="520" y="${y0 + i * size * 1.02}" text-anchor="middle" font-family="Oswald" font-weight="700" font-size="${size}"
    stroke="${O}" stroke-width="18" stroke-linejoin="round" paint-order="stroke" letter-spacing="1">${ws.map((w) =>
    `<tspan fill="${w.red ? RED : "#fff"}" fill-opacity="${w.on ? 1 : 0.5}">${w.t}</tspan>`).join(" ")}</text>`).join("");
  return at(520, 1320, k, txt);
}

// ---------- HUD ----------
const hand = `${noodle("M-20 430 C80 425 170 415 262 398", 30)}<ellipse cx="282" cy="398" rx="34" ry="38" fill="${SKIN}" stroke="${O}" stroke-width="${SW}"/><path d="M268 372 q24 -6 34 12" stroke="${O}" stroke-width="5" fill="none" stroke-linecap="round"/>`;
function topCard(t, si) {
  let inner, key;
  if (RULE[si]) { key = "r" + RULE[si]; inner = `${T(40, 30, "ПРАВИЛО", 56, O, "Rubik", 900, "end")}${T(62, 40, "№" + RULE[si], 96, RED, "Rubik", 900, "start")}`; }
  else { const txt = si < 2 ? "03:00" : si < 9 ? "08:00" : "09:00"; key = txt; inner = T(0, 38, txt, 104, RED); }
  const prevKey = si === 0 ? null : (RULE[si - 1] ? "r" + RULE[si - 1] : (si - 1 < 2 ? "03:00" : si - 1 < 9 ? "08:00" : "09:00"));
  const dx = si > 0 && prevKey !== key ? -900 * (1 - easeOutBack((t - START[si]) / 0.45)) : 0;
  return `<g transform="translate(${dx},${Math.sin(t * 2.2) * 2})"><g transform="translate(540,335) rotate(-2)"><rect x="-260" y="-72" width="520" height="144" rx="20" fill="#FFF6D8" stroke="${O}" stroke-width="${SW + 2}"/>${inner}</g>${hand}</g>`;
}
function brokenBoard(t) {
  const k = BROKE.filter((b) => t >= b).length;
  const last = BROKE[k - 1] ?? -9, p = pop(t, last, 0.35);
  const sc = k > 0 && t - last < 1 ? 1 + 0.25 * (1 - clamp((t - last) / 0.6)) : 1;
  return `<g transform="translate(540,458)"><rect x="-200" y="-38" width="400" height="76" rx="38" fill="${O}"/>${T(-172, 12, "НАРУШЕНО", 28, "#BDB6D6", "Rubik", 800, "start")}
    ${at(130, 0, sc, T(175, 16, k + " / 3", 44, k ? RED : YEL, "Rubik", 900, "end"))}</g>`;
}
function placeTag(t, si) {
  const txt = PLACE[si]; if (!txt) return "";
  const u = t - START[si]; if (u > 2.6) return "";
  const k = pop(t, START[si] + 0.15, 0.35) * (1 - clamp((u - 2.3) / 0.3)), w = txt.length * 20 + 40;
  return at(540, 205, k, `<g transform="translate(540,205) rotate(-2)"><rect x="${-w / 2}" y="-30" width="${w}" height="56" fill="#FFF6D8" stroke="${O}" stroke-width="4"/>${T(0, 10, txt, 28, O, "Rubik", 900)}</g>`);
}
function achievement(t) {
  for (const a of ACH) {
    const u = t - a.t;
    if (u < 0 || u > 2.3) continue;
    const y = u < 0.35 ? lerp(2100, 1530, easeOutBack(u / 0.35)) : u > 1.95 ? lerp(1530, 2100, easeOut((u - 1.95) / 0.35)) : 1530;
    return `<g transform="translate(520,${y})"><rect x="-420" y="-50" width="840" height="100" rx="50" fill="${YEL}" stroke="${O}" stroke-width="${SW + 2}"/>
      ${star(-360, 0, 34, "#fff")}${T(-310, -8, a.top, 26, O, "Rubik", 800, "start", 'opacity=".7"')}${T(-310, 34, a.text, 40, O, "Rubik", 900, "start")}</g>`;
  }
  return "";
}

// ---------- общие куски ----------
const clip = (c) => `<g clip-path="url(#room)">${c}</g>`;
const bubble = (x, y, txt, size = 42, tail = -1, k = 1) => { if (k <= 0) return ""; const w = txt.length * size * 0.66 + 60; return at(x, y, k, `<g transform="translate(${x},${y})"><rect x="${-w / 2}" y="-55" width="${w}" height="110" rx="40" fill="#fff" stroke="${O}" stroke-width="${SW}"/><path d="M${tail * 40} 52 L${tail * 70} 105 L${tail * -10} 54" fill="#fff" stroke="${O}" stroke-width="${SW}" stroke-linejoin="round"/>${T(0, 16, txt, size)}</g>`); };
const scared = (x, s, extra = {}) => hero({ x, y: 1150, s, eyes: "dots", brows: "raised", mouth: "o", cowlick: "spiral", sweat: true, ...extra }).svg;
const RULES_TXT = [["1. Не выдавать посылку,", "   которая шевелится."], ["2. После полуночи —", "   никаких возвратов."], ["3. Клиент без кода в 3:00 —", "   не смотри ему в глаза."]];
function rulesSheet(t, hi = 0) {
  let s = `<g transform="translate(540,830) rotate(-2)">${R(-330, -320, 660, 640, "#FFF6D8", 4)}<rect x="-60" y="-338" width="120" height="34" fill="#fff" opacity=".75"/>
    ${T(0, -240, "ПРАВИЛА НОЧНОЙ СМЕНЫ", 42)}<line x1="-290" y1="-210" x2="290" y2="-210" stroke="${O}" stroke-width="4"/>`;
  RULES_TXT.forEach((r, i) => {
    const y = -140 + i * 150;
    if (hi === i + 1) s += `<rect x="-305" y="${y - 50}" width="610" height="130" rx="12" fill="${YEL}" opacity=".55"/>`;
    s += T(-290, y, r[0], 46, O, "Caveat", 700, "start") + T(-290, y + 62, r[1], 46, O, "Caveat", 700, "start");
    const k = clamp((t - BROKE[i]) / 0.35);
    if (k > 0) s += `<path d="M-300 ${y - 10} Q0 ${y - 25} ${-300 + 580 * k} ${y + 45}" stroke="${RED}" stroke-width="10" fill="none" stroke-linecap="round"/>`;
  });
  return s + "</g>";
}
const scanner = (x, y, beam) => `<g transform="translate(${x},${y}) rotate(-20)">${R(-14, -60, 28, 70, "#2E2A44", 8)}${R(-24, -80, 48, 28, "#2E2A44", 8)}<rect x="-18" y="-72" width="36" height="8" fill="${RED}"/>${beam ? `<path d="M-18 -80 L-90 -220 L90 -220 L18 -80 Z" fill="${RED}" opacity=".35"/>` : ""}</g>`;
const closedBox = (x, y, s = 1, shake = 0, label = "") => `<g transform="translate(${x + shake},${y}) scale(${s}) rotate(${shake * 0.6})">${R(-150, -20, 300, 170, "#C9965E", 8)}${R(-150, -20, 300, 30, "#E8D9A6", 0)}${R(-20, -20, 40, 170, "#E8D9A6", 0)}
  ${R(-150, 30, 300, 26, "#E8D9A6", 0)}${T(0, 52, "ХРУПКОЕ", 22, "#B23A3A")}${label ? `<g transform="rotate(-6)">${T(0, 115, label, 40, O, "Caveat", 700)}</g>` : ""}</g>`;
const door = (open) => clip(`${R(800, 600, 200, 460, "#1B1F3A", 4)}${open < 1 ? `<path d="M800 600 L${800 + 200 * (1 - open)} ${600 + 20 * open} L${800 + 200 * (1 - open)} ${1060 - 20 * open} L800 1060 Z" fill="#8B5A3C" stroke="${O}" stroke-width="5"/>` : ""}`);
const phone = (x, y, rot, inner, w = 440, h = 680) => `<g transform="translate(${x},${y}) rotate(${rot})"><rect x="${-w / 2}" y="${-h / 2}" width="${w}" height="${h}" rx="44" fill="#2E2A44" stroke="${O}" stroke-width="${SW}"/><rect x="${-w / 2 + 25}" y="${-h / 2 + 40}" width="${w - 50}" height="${h - 80}" rx="24" fill="#F4F6FB"/>${inner}</g>`;
const zhekaHead = (x, y, s) => `<g transform="translate(${x},${y}) scale(${s}) translate(0,600)">${zheka({ x: 0, y: 0, s: 1, eyes: "calm", mouth: "smile" }).replace(/^[\s\S]*?<g transform/, "<g transform")}</g>`;

// ---------- шоты ----------
const SHOTS = [];
// 0. Хук: коробка шевелится → тварь → «не мой размер»
SHOTS[0] = (t) => {
  const tS = wt(0, "смотрит"), tZ = wt(0, "зубов"), tR = wt(0, "размер");
  let s = scanner(640, 930, false);
  if (t < tS) s += closedBox(720, 930, 0.95, Math.sin(t * 40) * 6);
  else s += boxMonster(720, 930, 0.95, easeOutBack((t - tS) / 0.4), t);
  s += zheka({ x: 380, y: 1150, s: 0.68, pose: t < tS ? "hold" : "idle", eyes: "calm", mouth: t >= tR - 0.1 ? "talk" : "chew", look: 1 });
  s += scared(940, 0.5);
  if (t >= tZ && t < tZ + 1.1) s = clip(`<rect x="0" y="400" width="1080" height="900" fill="#2A0F2A"/>`) + clip(boxMonster(540, 1150, 2.6, 1, t));
  s += bubble(330, 600, "НЕ МОЙ РАЗМЕР", 40, 1, pop(t, tR - 0.1));
  s += sfxPop(t, 0.2, 760, 700, 8, "ШУРХ", 70, "#fff", 1.6);
  return s;
};
// 1. Три часа ночи, смена за 2000, правила
SHOTS[1] = (t) => {
  const tD = wt(1, "две"), tP = wt(1, "правила");
  let s = scanner(640, 930, false) + closedBox(720, 930, 0.95, 0, "") + zheka({ x: 380, y: 1150, s: 0.68, eyes: "calm", mouth: "chew" }) + scared(940, 0.5);
  s += `<g transform="translate(860,610)">${C(0, 0, 50, "#fff")}<path d="M0 0 L0 -32 M0 0 L22 10" stroke="${O}" stroke-width="6" stroke-linecap="round"/></g>`;
  if (t >= tD && t < tP) s += at(540, 720, pop(t, tD), card(540, 720, 420, 160, -3, `${T(0, -10, "НОЧНАЯ СМЕНА", 36, O, "Rubik", 800)}${T(0, 48, "2 000 ₽", 56, "#3FB27F")}`));
  if (t >= tP) s = rulesSheet(t, 0);
  return s;
};
// 2. Правило 1 → примерил
SHOTS[2] = (t) => {
  const tPr = wt(2, "примерил");
  if (t < tPr) return rulesSheet(t, 1);
  // Жека в примерочной с тварью на голове
  let s = `<g transform="translate(220,760)">${R(-60, -150, 120, 300, "#CDEBFA", 10)}<path d="M-40 -120 L20 -150 M-40 -60 L50 -140" stroke="#fff" stroke-width="10" opacity=".7"/></g>`;
  s += zheka({ x: 560, y: 1150, s: 0.68, eyes: "calm", mouth: "smile", look: -1 });
  { const hx = 560, hy = 1150 - 0.68 * 740; let teeth = "";
    for (let r = 0; r < 3; r++) for (let i = 0; i < 7; i++) teeth += `<path d="M${-90 + i * 26 + r * 6} ${-40 + r * 22} l13 ${r % 2 ? -18 : 18} l13 ${r % 2 ? 18 : -18} Z" fill="#fff" stroke="${O}" stroke-width="3"/>`;
    s += `<g transform="translate(${hx},${hy}) scale(0.62)"><ellipse cx="0" cy="0" rx="120" ry="80" fill="#6B3B6E" stroke="${O}" stroke-width="${SW}"/><ellipse cx="0" cy="12" rx="100" ry="50" fill="#2A0F2A" stroke="${O}" stroke-width="4"/>${teeth}
      ${[-60, 0, 60].map((ex, i) => `${C(ex, -55 - (i === 1 ? 12 : 0), 18, "#FFE14D")}<circle cx="${ex}" cy="${-55 - (i === 1 ? 12 : 0)}" r="6" fill="${O}"/>`).join("")}</g>`; }
  s += scared(900, 0.48);
  s += sfxPop(t, tPr + 0.1, 820, 640, 8, "СИДИТ!", 70, YEL, 1.2);
  return s;
};
// 3. Правило 2 → возврат: в коробку, скотч, сканер «пик»
SHOTS[3] = (t) => {
  const tZ = wt(3, "запихивает"), tSc = wt(3, "сканирует"), tO = wt(3, "оформлен");
  if (t < tZ) return rulesSheet(t, 2);
  let s = scanner(640, 930, t >= tSc && t < tSc + 0.8);
  const closed = t >= wt(3, "клеит");
  s += closed ? closedBox(720, 930, 0.95, 0) : boxMonster(720, 930, 0.95, 1 - easeOut((t - tZ) / 0.6), t);
  s += zheka({ x: 380, y: 1150, s: 0.68, pose: "hold", eyes: "calm", mouth: "chew", look: 1 }) + scared(940, 0.5);
  s += sfxPop(t, tSc + 0.2, 640, 640, -6, "ПИК", 90, YEL, 0.8);
  if (t >= tO) s += at(540, 760, pop(t, tO), card(540, 760, 460, 170, 3, `${T(0, -10, "ВОЗВРАТ", 48, O)}${T(0, 52, "ОФОРМЛЕН ✓", 44, "#3FB27F")}`));
  return s;
};
// 4. Коробка трясётся: «это ошибка» → «не кантовать»
SHOTS[4] = (t) => {
  const tE = wt(4, "это"), tM = wt(4, "маркером");
  const sh = Math.sin(t * 45) * 7;
  let s = scanner(640, 930, false) + closedBox(720, 930, 0.95, sh, t >= tM ? "НЕ КАНТОВАТЬ" : "");
  s += zheka({ x: 380, y: 1150, s: 0.68, pose: t >= tM ? "write" : "idle", eyes: "calm", mouth: "chew", look: 1 }) + scared(940, 0.5);
  s += bubble(760, 650, "ЭТО ОШИБКА", 40, -1, pop(t, tE));
  return s;
};
// 5. Правило 3 → дверь, высокий без лица, Жека смотрит в глаза
SHOTS[5] = (t) => {
  const tD = wt(5, "дверь"), tZa = wt(5, "заходит"), tSm = wt(5, "смотрит");
  if (t < tD) return rulesSheet(t, 3);
  const op = easeOut((t - tD) / 0.6);
  let s = door(op);
  if (t >= tZa) s += faceless(lerp(980, 780, easeOut((t - tZa) / 0.8)), 1150, 0.56, t);
  s += zheka({ x: 330, y: 1150, s: 0.68, eyes: t >= tSm ? "stare" : "calm", mouth: "chew", look: 1 });
  s += `<g transform="translate(110,0)">${scared(0, 0.42)}</g>`;
  if (t >= tSm && t < tSm + 1.6) s = clip(`<rect x="0" y="400" width="540" height="900" fill="#FFE3C2"/><rect x="540" y="400" width="540" height="900" fill="#1B1F3A"/>`) +
    clip(`<g transform="translate(270,1430) scale(1.3)">${zheka({ x: 0, y: 0, s: 1, eyes: "stare", mouth: "chew", look: 1 })}</g><g transform="translate(810,1900) scale(1.4)">${faceless(0, 0, 1, t)}</g>`) +
    `<line x1="540" y1="430" x2="540" y2="1150" stroke="${O}" stroke-width="8"/>`;
  return s;
};
// 6. «Мой заказ» — «код назови» — уходит обиженный
SHOTS[6] = (t) => {
  const tM = wt(6, "мой"), tK = wt(6, "код"), tB = wt(6, "без"), tU = wt(6, "уходит");
  let s = door(1);
  const fx = t >= tU ? lerp(780, 1050, easeInOut((t - tU) / 1.2)) : 780;
  s += faceless(fx, 1150, 0.56, t);
  if (t >= tU) s += `<path d="M${fx + 20} 700 q-12 24 0 34 q12 -10 0 -34 Z" fill="#9FE3FF" stroke="${O}" stroke-width="4"/>`;
  s += zheka({ x: 330, y: 1150, s: 0.68, eyes: "stare", mouth: (t >= tK && t < tU) ? "talk" : "chew", look: 1 }) + `<g transform="translate(110,0)">${scared(0, 0.42)}</g>`;
  if (t < tK) s += bubble(760, 560, "МОЙ ЗАКАЗ", 42, 1, pop(t, tM));
  else if (t < tB) s += bubble(360, 590, "КОД НАЗОВИ, БРАТАН", 36, 1, pop(t, tK));
  else if (t < tU) s += bubble(360, 590, "ПРИХОДИ С ПАСПОРТОМ", 34, 1, pop(t, tB));
  return s;
};
// 7. Утро: отзыв 5 звёзд
SHOTS[7] = (t) => {
  const tO = wt(7, "отзыв"), tS = wt(7, "строго");
  let s = zheka({ x: 300, y: 1150, s: 0.66, eyes: "calm", mouth: "chew", look: 1 });
  s += at(700, 820, pop(t, START[7] + 0.4), phone(700, 820, 4, `${T(0, -250, "Отзывы", 36, O, "Rubik", 900)}
    ${t >= tO ? `${C(-140, -160, 34, "#1E1B2E")}<ellipse cx="-140" cy="-165" rx="18" ry="24" fill="#E8E2EE"/>${T(-90, -170, "Высокий", 28, O, "Rubik", 900, "start")}${T(-90, -138, "без лица", 24, "#8A8AA0", "Rubik", 800, "start")}
      ${[0, 1, 2, 3, 4].map((i) => star(-130 + i * 52, -80, 22)).join("")}` : ""}
    ${t >= tS ? `<rect x="-170" y="-40" width="340" height="170" rx="20" fill="#fff" stroke="${O}" stroke-width="4"/>${T(-150, 6, "Строго, но", 32, O, "Rubik", 800, "start")}${T(-150, 46, "справедливо.", 32, O, "Rubik", 800, "start")}${T(-150, 96, "Приду с паспортом.", 28, "#8A8AA0", "Rubik", 800, "start")}` : ""}`));
  s += sfxPop(t, START[7] + 0.2, 760, 560, 6, "ДЗЫНЬ", 64, YEL, 0.9);
  return s;
};
// 8. Сотрудник месяца
SHOTS[8] = (t) => {
  const tV = wt(8, "вешает"), tT = wt(8, "тебя");
  let s = `<g transform="translate(560,700)">${R(-230, -170, 460, 340, "#8B5A3C", 12)}${R(-210, -150, 420, 300, "#E9D3B4", 6)}${T(0, -105, "СОТРУДНИК МЕСЯЦА", 32, O)}</g>`;
  if (t >= tV) s += at(460, 740, pop(t, tV), `<g transform="translate(460,740) rotate(-4)">${R(-80, -60, 160, 170, "#fff", 4)}<clipPath id="ph"><rect x="-80" y="-60" width="160" height="170"/></clipPath><g clip-path="url(#ph)"><rect x="-80" y="-60" width="160" height="170" fill="#BFE3F5"/>
      <rect x="-70" y="70" width="140" height="60" fill="#fff"/>${[0, 1].map((i) => `<rect x="-70" y="${80 + i * 22}" width="140" height="10" fill="#2E5AA8"/>`).join("")}
      <ellipse cx="0" cy="20" rx="52" ry="58" fill="#F1C29B" stroke="${O}" stroke-width="4"/><path d="M-26 -10 Q-10 -20 6 -14" stroke="#fff" stroke-width="6" opacity=".6" fill="none"/>
      <circle cx="-20" cy="18" r="6" fill="${O}"/><circle cx="20" cy="18" r="6" fill="${O}"/><path d="M-30 6 L-10 8 M10 8 L30 6" stroke="${O}" stroke-width="6" stroke-linecap="round"/><path d="M-14 50 Q0 58 14 50" stroke="${O}" stroke-width="4" fill="none"/></g></g>`);
  s += `<g transform="translate(660,740) rotate(5)">${R(-80, -60, 160, 170, "#fff", 4)}${t >= tT ? T(0, 40, "?", 90, "#C9C1D6") : ""}</g>`;
  s += person({ x: 820, y: 1150, s: 0.74, long: true, hair: "#3B2A20", body: "#2E2A44", glasses: true, faceType: "happy" });
  s += zheka({ x: 300, y: 1150, s: 0.6, eyes: "calm", mouth: "smile" });
  if (t >= tT) s += hero({ x: 560, y: 1150, s: 0.5, eyes: "closed", brows: "sad", mouth: "sad", cowlick: "down" }).svg;
  return s;
};
// 9. Курьер: «получатель — Жека», коробка шевелится
SHOTS[9] = (t) => {
  const tP = wt(9, "получатель"), tSh = wt(9, "шевелится");
  let s = person({ x: 790, y: 1150, s: 0.78, body: "#F28C28", hat: "cap", faceType: t >= tSh ? "shock" : "happy" });
  const jump = t >= tSh ? Math.abs(Math.sin((t - tSh) * 14)) * 40 : 0;
  s += closedBox(560, 1010 - jump, 0.6, t >= tSh ? Math.sin(t * 50) * 6 : 0);
  s += zheka({ x: 300, y: 1150, s: 0.66, eyes: t >= tSh ? "stare" : "calm", mouth: "chew", look: 1 });
  if (t >= tP) s += at(800, 640, pop(t, tP), `<g transform="translate(800,640) rotate(5)">${R(-170, -70, 340, 140, "#fff", 14)}${T(0, -12, "ПОЛУЧАТЕЛЬ:", 32, O, "Rubik", 800)}${T(0, 44, "ЖЕКА", 54, RED)}</g>`);
  s += sfxPop(t, tSh, 560, 840, -8, "ТУК-ТУК", 64, "#fff", 1.4);
  return s;
};
// 10. Заставка
SHOTS[10] = (t, u) => {
  const b = Math.abs(Math.sin(u * 5)) * 18, pk = 1 + 0.05 * Math.sin(u * 7);
  let s = `${T(520, 370, "ПОДПИШИСЬ,", 92, "#fff", "Oswald", 700, "middle", `stroke="${O}" stroke-width="16" paint-order="stroke"`)}
    ${T(520, 460, "ЧТОБЫ НЕ ПРОПУСТИТЬ", 70, "#fff", "Oswald", 700, "middle", `stroke="${O}" stroke-width="14" paint-order="stroke"`)}`;
  s += at(520, 580, pop(t, START[10] + 0.1) * pk, `<rect x="230" y="520" width="580" height="120" rx="60" fill="${RED}" stroke="${O}" stroke-width="${SW + 2}"/>${T(520, 602, "ПОДПИСАТЬСЯ", 62, "#fff")}`);
  s += G(`translate(0,${-b})`, zheka({ x: 380, y: 1180, s: 0.6, eyes: "calm", mouth: "smile" }) + hero({ x: 720, y: 1180, s: 0.55, pose: "wave", eyes: "normal", brows: "proud", mouth: "grin", cowlick: "up" }).svg);
  return s;
};

// ---------- звуки ----------
const SFX = [];
{
  const add = (t, k, v = 1) => SFX.push({ t: +t.toFixed(3), k, v });
  add(0.2, "flutter", 0.8); add(wt(0, "смотрит"), "boom", 0.6); add(wt(0, "смотрит") + 0.05, "huh"); add(wt(0, "размер"), "pop", 0.6);
  add(wt(1, "две"), "cash"); add(wt(1, "правила"), "swish");
  BROKE.forEach((b) => add(b, "stamp", 0.8));
  add(wt(2, "примерил"), "pop"); add(wt(3, "клеит"), "crunch", 0.6); add(wt(3, "сканирует") + 0.2, "beep");
  ACH.forEach((a) => add(a.t, "ding"));
  add(START[4], "tremble"); add(wt(4, "это"), "bloop"); add(wt(4, "маркером"), "flutter", 0.5);
  add(wt(5, "дверь"), "whoosh", 0.8); add(wt(5, "заходит"), "boom", 0.7);
  add(wt(6, "мой"), "huh"); add(wt(6, "уходит"), "whoosh", 0.6);
  add(START[7] + 0.2, "beep", 0.8); add(wt(8, "вешает"), "pop"); add(wt(8, "тебя"), "pff");
  add(wt(9, "получатель"), "pop"); add(wt(9, "шевелится"), "thud"); add(wt(9, "шевелится") + 0.3, "thud", 0.8);
  add(START[10] + 0.1, "ding");
  SFX.sort((a, b) => a.t - b.t);
}

// ---------- кадр ----------
function frame(t) {
  let si = START.findIndex((s, i) => t >= s && t < END[i]);
  if (si < 0) si = NP - 1;
  const u = t - START[si], d = END[si] - START[si];
  let scene = bgPaper() + LOCS.pvz(!!NIGHT[si]) + SHOTS[si](t, u, d);
  const k = 1 + 0.05 * easeInOut(u / d);
  let sx = 0, sy = 0;
  for (const [ts, a] of SHAKES) { const v = t - ts; if (v >= 0 && v < 0.5) { const e = a * Math.exp(-v * 9); sx += e * Math.sin(v * 70); sy += e * Math.cos(v * 55); } }
  scene = `<g filter="url(#wob${Math.floor(t * 8) % 3})"><g transform="translate(${sx},${sy}) translate(540,860) scale(${k}) translate(-540,-860)">${scene}</g></g>`;
  let hud = "";
  if (si < NP - 1) hud += topCard(t, si) + (si >= 2 && si <= 6 ? brokenBoard(t) : "") + placeTag(t, si);
  hud += achievement(t) + subtitles(t);
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">${DEFS.replace("</defs>", LOC_CLIP + "</defs>")}${scene}${hud}</svg>`;
}
window.TOTAL = TOTAL; window.SFX = SFX; window.START = START;
window.renderFrame = (t) => { document.getElementById("root").innerHTML = frame(t); };
