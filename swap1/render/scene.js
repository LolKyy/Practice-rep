// Таймлайн ролика «правая рука и правая нога поменялись местами». Требует draw.js и window.DATA (audio/words.json).
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

// ---------- данные шотов ----------
const CLOCK = ["07:00", "07:00", "07:15", "08:00", "08:30", "09:00", "11:00", "13:00", "15:00", "17:00", "19:00", "21:00", "00:00", "08:00", null, null];
const COL = [PAL.mint, PAL.mint, PAL.yellow, PAL.yellow, PAL.yellow, PAL.yellow, PAL.pink, PAL.pink, PAL.pink, PAL.pink, PAL.purple, PAL.purple, null, PAL.mint, PAL.mint, PAL.mint];
const LOC = ["bedroom", "bedroom", "bathroom", "hallway", "street", "metro", "office", "canteen", "breakroom", "corridor", "cafe", "living", "bedroomNight", "kitchen", "bedroom", "bedroom"];
const PLACE = ["ТВОЯ КОМНАТА · УТРО", null, "ВАННАЯ", "ПРИХОЖАЯ", "ДВОР", "МЕТРО · ЧАС ПИК", "ОФИС", "СТОЛОВАЯ", "КУХНЯ В ОФИСЕ", "КОРИДОР", "КАФЕ · ВЕЧЕР", "ДОМА · ВЕЧЕР", "ТВОЯ КОМНАТА · НОЧЬ", "КУХНЯ · УТРО", null, null];
const locBg = (si) => LOC[si] === "bedroomNight" ? LOCS.bedroom(true) : LOCS[LOC[si]]();
const clip = (c) => `<g clip-path="url(#room)">${c}</g>`;
// крупный план героя: голова + плечи внутри пятна
const closeHero = (f) => clip(`<g transform="translate(540,1230) scale(1.5)"><path d="M-200 0 L-170 -120 Q0 -160 170 -120 L200 0 Z" fill="${SHIRT}" stroke="${O}" stroke-width="${SW}"/>${head({ cy: -300, r: 150, ...f })}</g>`);
function placeTag(t, si) {
  const txt = PLACE[si]; if (!txt) return "";
  const u = t - START[si]; if (u > 2.6) return "";
  const k = pop(t, START[si] + 0.15, 0.35) * (1 - clamp((u - 2.3) / 0.3));
  const w = txt.length * 20 + 40;
  return at(540, 205, k, `<g transform="translate(540,205) rotate(-2)"><rect x="${-w / 2}" y="-30" width="${w}" height="56" fill="#FFF6D8" stroke="${O}" stroke-width="4"/><rect x="-35" y="-42" width="70" height="20" fill="#fff" opacity=".75" transform="rotate(4)"/>${T(0, 10, txt, 28, O, "Rubik", 900)}</g>`);
}
const REDW = ["местами", "пяткой", "ухо", "погон", "горилла", "кроссовком", "быстрее", "охрана", "позвонить", "справился", "ногу", "звезда", "минуту", "охуеть", "местами", "подпишись"];
const ACH = [
  { t: wt(5, "уступили"), top: "ДОСТИЖЕНИЕ", text: "ТЕБЕ УСТУПИЛИ МЕСТО" },
  { t: wt(6, "быстрее"), top: "НОВЫЙ НАВЫК", text: "ПЕЧАТЬ НОГОЙ" },
  { t: wt(9, "справился"), top: "ДОСТИЖЕНИЕ", text: "ТЫ СПРАВИЛСЯ" },
  { t: wt(11, "звезда"), top: "ДОСТИЖЕНИЕ", text: "ЗВЕЗДА ИНТЕРНЕТА" },
];
const SHAKES = [[wt(0, "поменялись"), 12], [wt(5, "кроссовком"), 16], [wt(7, "охрана"), 12], [wt(12, "возвращается"), 10]];

// ---------- субтитры ----------
const CENSOR = { "сука": "с*ка", "блять": "бл*ть", "охуеть": "ох*еть" };
const GROUPS = [];
{
  let cur = [];
  const flush = () => { if (cur.length) GROUPS.push(cur); cur = []; };
  WORDS.forEach((w) => {
    if (cur.length && cur[0].p !== w.p) flush();
    cur.push(w);
    const len = cur.reduce((a, x) => a + x.n.length, 0);
    const punct = /[.,!?…:»]$/.test(w.w.replace(/\s.*$/, "")) || /[.,!?…:—]/.test(w.w.slice(-1));
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
const hm = (s) => { const [h, m] = s.split(":").map(Number); return h * 3600 + m * 60; };
function clockCard(t, si) {
  const txt = CLOCK[si];
  const changed = si === 0 || CLOCK[si - 1] !== txt;
  const u = t - START[si];
  const dx = changed && si > 0 ? -900 * (1 - easeOutBack(u / 0.45)) : 0;
  const bob = Math.sin(t * 2.2) * 2;
  return `<g transform="translate(${dx},${bob})"><g transform="translate(540,335) rotate(-2)"><rect x="-200" y="-72" width="400" height="144" rx="20" fill="#fff" stroke="${O}" stroke-width="${SW + 2}"/>
    ${T(0, 38, txt, 108, RED)}</g>${noodle("M-20 430 C80 425 170 415 330 398", 30)}
    <ellipse cx="350" cy="398" rx="34" ry="38" fill="${SKIN}" stroke="${O}" stroke-width="${SW}"/><path d="M336 372 q24 -6 34 12" stroke="${O}" stroke-width="5" fill="none" stroke-linecap="round"/></g>`;
}
function countdown(t, si) {
  if (si >= 13) return "";
  const u = t - START[si];
  let rem, red = false;
  if (si === 12) { rem = Math.max(0, 180 * (1 - u / 0.9)); red = rem === 0; }
  else rem = 24 * 3600 - hm(CLOCK[si]) - Math.floor(u);
  rem = Math.round(rem);
  const f = (n) => String(n).padStart(2, "0");
  const txt = `${f(Math.floor(rem / 3600))}:${f(Math.floor((rem % 3600) / 60))}:${f(rem % 60)}`;
  return `<g transform="translate(540,458)"><rect x="-260" y="-38" width="520" height="76" rx="38" fill="${O}"/>
    ${T(-232, 10, "ДО ВОЗВРАТА", 24, "#BDB6D6", "Rubik", 800, "start")}${T(238, 16, txt, 44, red ? RED : YEL, "Rubik", 900, "end")}</g>`;
}
function achievement(t) {
  for (const a of ACH) {
    const u = t - a.t;
    if (u < 0 || u > 2.3) continue;
    const y = u < 0.35 ? lerp(2100, 1530, easeOutBack(u / 0.35)) : u > 1.95 ? lerp(1530, 2100, easeOut((u - 1.95) / 0.35)) : 1530;
    return `<g transform="translate(520,${y})"><rect x="-420" y="-50" width="840" height="100" rx="50" fill="${YEL}" stroke="${O}" stroke-width="${SW + 2}"/>
      ${star(-360, 0, 34, "#fff")}${T(-310, -8, a.top, 26, O, "Rubik", 800, "start", 'opacity=".7"')}${T(-310, 34, a.text, 44, O, "Rubik", 900, "start")}</g>`;
  }
  return "";
}

// ---------- общие куски сцен ----------
const bed = () => `${R(640, 900, 330, 160, "#B9D7F0", 20)}${R(620, 1060, 370, 40, "#8B5A3C", 10)}${R(820, 860, 130, 90, "#fff", 30)}`;
const phone = (x, y, rot, inner, w = 420, h = 660) => `<g transform="translate(${x},${y}) rotate(${rot})"><rect x="${-w / 2}" y="${-h / 2}" width="${w}" height="${h}" rx="44" fill="#2E2A44" stroke="${O}" stroke-width="${SW}"/>
  <rect x="${-w / 2 + 25}" y="${-h / 2 + 40}" width="${w - 50}" height="${h - 80}" rx="24" fill="#F4F6FB"/>${inner}</g>`;
const heart = (x, y, s) => `<path transform="translate(${x},${y}) scale(${s})" d="M0 30 C-60 -10 -40 -60 0 -30 C40 -60 60 -10 0 30 Z" fill="${RED}" stroke="${O}" stroke-width="5"/>`;

// ---------- шоты ----------
const SHOTS = [];

// 1. Хук: лежит в кровати → вскакивает
SHOTS[0] = (t) => {
  const tP = wt(0, "поменялись"), tN = wt(0, "нога", 1), tR = wt(0, "рука", 1);
  let s = "";
  if (t < tP) {
    s += G("translate(800,900) rotate(-90)", hero({ x: 0, y: 0, s: 0.62, build: "swap", eyes: "closed", brows: "neutral", mouth: "smile", cowlick: "down" }).svg);
    s += sfxPop(t, 0.3, 760, 680, -8, "Z-z-z", 70, "#fff", 2.5);
  } else {
    const k = easeOutBack((t - tP) / 0.35);
    s += G(`translate(0,${(1 - k) * 120})`, hero({ x: 470, y: 1150, s: 0.84, build: "swap", eyes: "dots", brows: "raised", mouth: "o", cowlick: "spiral" }).svg);
    s += sfxPop(t, tP, 760, 640, 8, "ЧТО?!", 100, YEL, 1.2);
    s += at(330, 560, pop(t, tN), sticker(330, 560, 6, "НОГА", 60) + arrow("M260 590 Q240 620 230 640", "M218 620 L230 644 L250 628"));
    s += at(180, 1095, pop(t, tR), sticker(180, 1095, -6, "РУКА", 60) + arrow("M200 1050 Q220 1030 245 1020", "M222 1012 L248 1018 L236 1042"));
  }
  return s;
};

// 2. 07:00 будильник пяткой
SHOTS[1] = (t) => {
  const tP = wt(1, "пяткой"), tU = wt(1, "удобно");
  const hit = t >= tP;
  let s = `${R(110, 880, 200, 270, "#A86C42", 10)}`;
  const j = hit ? 0 : Math.sin(t * 50) * 6;
  s += `<g transform="translate(${215 + j},860) rotate(${hit ? 0 : j})">${C(0, -50, 56, "#FF7B7B")}${C(0, -50, 40, "#fff")}<path d="M0 -50 L0 -78 M0 -50 L18 -40" stroke="${O}" stroke-width="6" stroke-linecap="round"/>
    ${C(-40, -104, 16, YEL)}${C(40, -104, 16, YEL)}<path d="M-30 0 L-44 16 M30 0 L44 16" stroke="${O}" stroke-width="7" stroke-linecap="round"/></g>`;
  if (!hit) s += sfxPop(t, START[1] + 0.1, 230, 680, -10, "ДЗЫНЬ!", 80, YEL, tP - START[1]);
  s += hero({ x: 640, y: 1150, s: 0.82, build: "swap", pose: hit ? "kick" : "idle", eyes: hit ? "normal" : "dots", look: -1, brows: t >= tU ? "proud" : "raised", mouth: t >= tU ? "grin" : "flat", cowlick: "up" }).svg;
  s += sfxPop(t, tP, 300, 740, 8, "ТЫК", 80, "#fff", 0.8);
  return s;
};

// 3. 07:15 зубы ногой
SHOTS[2] = (t) => {
  const tU = wt(2, "ухо");
  let s = "";
  s += hero({ x: 560, y: 1150, s: 0.82, build: "swap", pose: "brush", eyes: "normal", brows: "neutral", mouth: "smile", cowlick: "up" }).svg;
  // пена
  const foam = (x, y, k) => k > 0 ? at(x, y, k, [[0, 0, 16], [16, 6, 12], [-12, 8, 11]].map(([a, b, r]) => C(x + a, y + b, r, "#fff")).join("")) : "";
  s += foam(560, 1150 - 0.82 * 530, pop(t, START[2] + 0.8));
  if (t >= tU) { s = closeHero({ eyes: "dots", brows: "raised", mouth: "o", cowlick: "spiral" }); s += clip([[0, 0, 26], [26, 10, 20], [-20, 14, 18], [10, -22, 16]].map(([a, b, r]) => C(540 - 1.5 * 150 + a, 1230 - 1.5 * 300 + b, r, "#fff")).join("")); }
  s += sfxPop(t, tU, 820, 640, 10, "УХО?!", 80, "#fff", 1.4);
  return s;
};

// 4. 08:00 погон, мама честь, перчатка, рукав
SHOTS[3] = (t) => {
  const tPg = wt(3, "погон"), tC = wt(3, "честь"), tPe = wt(3, "перчатку"), tK = wt(3, "кроссовок");
  let s = hero({ x: 470, y: 1150, s: 0.84, build: "swap", glove: t >= tPe ? "#7A6CF0" : null, eyes: "normal", brows: "proud", mouth: "grin", cowlick: "up" }).svg;
  if (t >= tPg) s += at(212, 700, pop(t, tPg), `<g transform="translate(212,694)">${[0, 1, 2, 3, 4].map((i) => `<rect x="${-34 + i * 15}" y="0" width="8" height="34" rx="4" fill="${YEL}" stroke="${O}" stroke-width="3"/>`).join("")}<rect x="-40" y="-14" width="80" height="18" rx="6" fill="${YEL}" stroke="${O}" stroke-width="4"/></g>`);
  s += mom({ x: 840, y: 1150, s: 0.86, pose: t >= tC ? "salute" : "ladle" });
  s += at(250, 560, pop(t, tPg), sticker(250, 560, -6, "ПОГОН", 56));
  if (t >= tK) s += at(790, 640, pop(t, tK), card(790, 640, 300, 150, 6, `${T(0, -10, "РУКАВ:", 34, O, "Rubik", 800)}${T(0, 40, "ТОЛЬКО КРОССОВОК", 26, RED)}`));
  return s;
};

// 5. 08:30 горилла и бабки
SHOTS[4] = (t, u, d) => {
  const tM = wt(4, "молятся");
  let s = "";
  const sc = t >= tM;
  s += person({ x: 730, y: 1150, s: 0.66, body: "#8E7CC3", hat: "scarf", faceType: sc ? "shock" : "calm" }) + person({ x: 900, y: 1150, s: 0.66, body: "#3FB27F", hat: "scarf", faceType: sc ? "shock" : "calm" });
  const x = lerp(200, 520, easeInOut(u / d));
  s += hero({ x, y: 1150, s: 0.78, build: "swap", pose: "walk", walk: u, eyes: "normal", look: 1, brows: "neutral", mouth: "flat", cowlick: "up" }).svg;
  if (sc) s += at(820, 640, pop(t, tM), `<g transform="translate(820,640)"><rect x="-170" y="-55" width="340" height="110" rx="40" fill="#fff" stroke="${O}" stroke-width="${SW}"/><path d="M-20 52 L-40 100 L20 54" fill="#fff" stroke="${O}" stroke-width="${SW}" stroke-linejoin="round"/>${T(0, 18, "ГОСПОДИ...", 46)}</g>`);
  return s;
};

// 6. 09:00 метро: поручень → кроссовком в лицо
SHOTS[5] = (t) => {
  const tK = wt(5, "кроссовком");
  const hit = t >= tK;
  let s = "";
  s += person({ x: 200, y: 1150, s: 0.8, body: "#3FB27F", hat: "cap", faceType: hit ? "shock" : "calm" });
  s += hero({ x: 600, y: 1150, s: 0.82, build: "swap", pose: hit ? "kick" : "pole", eyes: "normal", look: hit ? -1 : 0, brows: hit ? "sad" : "neutral", mouth: hit ? "flat" : "smile", cowlick: hit ? "down" : "up" }).svg;
  s += person({ x: 900, y: 1150, s: 0.72, body: "#E8607A", hat: "scarf", faceType: t >= wt(5, "уступили") ? "happy" : "calm" });
  const tL = wt(5, "лицо");
  if (t >= tL && t < tL + 1.1) s = clip(person({ x: 540, y: 1960, s: 2.1, body: "#3FB27F", hat: "cap", faceType: "shock" }) + sockShoe(330, 900, 95, 2.4));
  s += sfxPop(t, tK, 200, 640, -12, "БАЦ!", 100, YEL, 1.2);
  return s;
};

// 7. 11:00 работа
SHOTS[6] = (t) => {
  const tP = wt(6, "повышает");
  let s = `${R(110, 980, 330, 30, "#C98A5A", 8)}${R(130, 1010, 24, 140, "#A86C42")}${R(396, 1010, 24, 140, "#A86C42")}
    <path d="M150 975 L170 860 L330 860 L330 975 Z" fill="#2E2A44" stroke="${O}" stroke-width="${SW}" stroke-linejoin="round"/>${R(150, 960, 260, 20, "#9AA3B5", 4)}`;
  const fast = t >= wt(6, "быстрее");
  s += hero({ x: 600, y: 1150, s: 0.82, build: "swap", pose: "type", eyes: fast ? "star" : "normal", brows: "proud", mouth: fast ? "grin" : "smile", cowlick: "up" }).svg;
  s += person({ x: 860, y: 1150, s: 0.8, body: "#2E2A44", hair: "#777", glasses: true, faceType: t >= tP ? "happy" : "calm" });
  const tf = Math.floor(t * 6) % 2;
  s += `<text x="${250 + tf * 6}" y="${800 - tf * 6}" transform="rotate(-8 250 800)" text-anchor="middle" font-family="Rubik" font-weight="900" font-size="56" fill="#fff" stroke="${O}" stroke-width="10" paint-order="stroke">ТЫК-ТЫК</text>`;
  s += at(820, 640, pop(t, tP), card(820, 640, 330, 160, 5, `${T(0, -14, "ПОВЫШЕН:", 36, O, "Rubik", 800)}${T(0, 40, "СТАРШИЙ МЕНЕДЖЕР", 26, RED)}`));
  return s;
};

// 8. 13:00 столовая
SHOTS[7] = (t) => {
  const tO = wt(7, "охрана");
  let s = `${R(110, 960, 420, 34, "#E9D3B4", 8)}${R(140, 994, 24, 160, "#A86C42")}${R(480, 994, 24, 160, "#A86C42")}
    ${R(200, 930, 200, 30, "#C9D1E0", 6)}<ellipse cx="260" cy="926" rx="44" ry="14" fill="#fff" stroke="${O}" stroke-width="4"/><ellipse cx="350" cy="922" rx="34" ry="16" fill="#C98A5A" stroke="${O}" stroke-width="4"/>`;
  const caught = t >= tO;
  s += hero({ x: 560, y: 1150, s: 0.82, build: "swap", pose: "type", eyes: caught ? "dots" : "normal", brows: caught ? "raised" : "neutral", mouth: caught ? "o" : "smile", cowlick: caught ? "spiral" : "up" }).svg;
  if (caught) {
    const k = easeOutBack((t - tO) / 0.4), gx = lerp(1250, 850, k);
    s += person({ x: gx, y: 1150, s: 0.86, body: "#2E2A44", hat: "cap", faceType: "calm", skin: "#E8B48F" }) + T(gx, 1150 - 0.86 * 230, "ОХРАНА", 24, "#fff");
    if (k > 0.9) s += noodle("M800 900 C760 880 720 870 680 860", 14, "#E8B48F") + C(675, 858, 18, "#E8B48F");
  }
  return s;
};

// 9. 15:00 сторис бывшей → звонок
SHOTS[8] = (t) => {
  const tC = wt(8, "позвонить"), tV = wt(8, "взяла");
  let inner = `${C(0, -200, 70, "#FFB3CF")}${T(0, -100, "Бывшая ❤", 40)}`;
  if (t < tC) inner += `<rect x="-150" y="-50" width="300" height="240" rx="20" fill="#FFE3EE" stroke="${O}" stroke-width="4"/>${T(0, 80, "сторис", 40, "#8A8AA0", "Rubik", 800)}`;
  else if (t < tV) inner += `${T(0, 0, "Вызов...", 44, O, "Rubik", 800)}${C(0, 160, 50 + Math.sin(t * 12) * 6, "#3FB27F")}`;
  else inner += `${T(0, 0, "00:0" + Math.min(9, Math.floor(t - tV)), 56, "#3FB27F")}${T(0, 60, "разговор", 34, "#8A8AA0", "Rubik", 800)}`;
  let s = phone(400, 820, -3, inner);
  s += hero({ x: 800, y: 1150, s: 0.7, build: "swap", pose: "type", eyes: t >= tV ? "dots" : "normal", look: -1, brows: t >= tC ? "raised" : "neutral", mouth: t >= tC ? "o" : "smile", cowlick: t >= tV ? "spiral" : "up" }).svg;
  if (t >= tV + 0.3) s = closeHero({ eyes: "dots", brows: "raised", mouth: "o", cowlick: "spiral", sweat: true });
  s += sfxPop(t, tC, 640, 600, 8, "ОЙ", 90, "#fff", 0.9);
  return s;
};

// 10. 17:00 туалет
SHOTS[9] = (t) => {
  const tS = wt(9, "спрашивай");
  let s = `${R(330, 560, 420, 600, "#C9A27C", 10)}${R(360, 590, 360, 560, "#E2BE96", 6)}${C(690, 880, 14, YEL)}
    <g transform="translate(540,680)">${R(-70, -50, 140, 100, "#fff", 12)}${T(0, 20, "WC", 56)}</g>`;
  const j = Math.sin(t * 40) * (t < tS ? 3 : 0);
  s = G(`translate(${j},0)`, s);
  s += sfxPop(t, START[9] + 0.6, 260, 800, -8, "...", 110, "#fff", 2.5);
  s += at(800, 980, pop(t, tS), sticker(800, 980, 8, "НЕ СПРАШИВАЙ", 50));
  return s;
};

// 11. 19:00 свидание
SHOTS[10] = (t) => {
  const tR = wt(10, "руку"), tN = wt(10, "ногу"), tO = wt(10, "остается");
  let s = table(470, 1160, 380) + `<rect x="450" y="980" width="30" height="70" rx="6" fill="#fff" stroke="${O}" stroke-width="4"/><path d="M465 980 q-6 -24 0 -36 q8 14 0 36" fill="${YEL}" stroke="${O}" stroke-width="3"/>`;
  s += person({ x: 220, y: 1150, s: 0.8, long: true, hair: "#C2553D", body: "#FF9EC4", faceType: t >= tO ? "happy" : "calm" });
  if (t >= tR) s += noodle("M262 900 C300 900 320 895 345 885", 12, "#F3C6A0") + C(350, 884, 16, "#F3C6A0");
  s += hero({ x: 720, y: 1150, s: 0.8, build: "swap", pose: t >= tN ? "kick" : "idle", eyes: t >= tO ? "star" : "normal", look: -1, brows: "raised", mouth: t >= tO ? "grin" : "smile", cowlick: "up" }).svg;
  if (t >= tO) s += at(250, 640, pop(t, tO), heart(250, 640, 1.4)) + at(340, 580, pop(t, tO + 0.15), heart(340, 580, 0.9));
  return s;
};

// 12. 21:00 звезда интернета
SHOTS[11] = (t, u) => {
  const tSh = wt(11, "шоу");
  const views = Math.min(10000000, Math.round(Math.pow(10, 3 + easeOut(u / 2.5) * 4)));
  let s = phone(330, 830, -5, `<rect x="-160" y="-260" width="320" height="380" rx="16" fill="#2E2A44"/>
    ${hero({ x: 0, y: 100, s: 0.42, build: "swap", pose: "pole", eyes: "normal", brows: "neutral", mouth: "smile", cowlick: "up" }).svg}
    ${T(0, 180, "👁 " + views.toLocaleString("ru-RU"), 34, O, "Rubik", 900)}`, 380, 640);
  if (t >= tSh) s += at(780, 660, pop(t, tSh), `<g transform="translate(780,660) rotate(6)">${R(-180, -120, 360, 240, "#2A1F45", 20)}${T(0, -30, "ШОУ", 54, YEL)}${T(0, 30, "ТАЛАНТОВ", 46, YEL)}${star(-130, 80, 22)}${star(130, 80, 22)}</g>`);
  s += hero({ x: 800, y: 1150, s: 0.5, build: "swap", eyes: "star", brows: "proud", mouth: "grin", cowlick: "up" }).svg;
  return s;
};

// 13. Полночь: всё возвращается
SHOTS[12] = (t) => {
  const tV = wt(12, "возвращается"), tS = wt(12, "счастлив");
  let s = "";
  const back = t >= tV + 0.2;
  s += hero(back ? { x: 540, y: 1150, s: 0.84, eyes: t >= tS ? "star" : "normal", brows: "proud", mouth: "grin", cowlick: "up" }
    : { x: 540, y: 1150, s: 0.84, build: "swap", eyes: "closed", brows: "neutral", mouth: "flat", cowlick: "down" }).svg;
  if (t >= tV) s += puff(540, 900, 1.6, easeOutBack((t - tV) / 0.35) * (1 - clamp((t - tV - 0.5) / 0.4)));
  if (t >= tS) s = closeHero({ eyes: "star", brows: "proud", mouth: "grin", cowlick: "up" });
  s += sfxPop(t, tV, 540, 640, 0, "ПУФ!", 100, "#fff", 1);
  return s;
};

// 14. Утро: всё отбирают
SHOTS[13] = (t) => {
  const tPo = wt(13, "понижает"), tO = wt(13, "отменяет"), tPi = wt(13, "пишет"), tX = wt(13, "охуеть");
  let s = hero({ x: 300, y: 1150, s: 0.84, eyes: t >= tX ? "closed" : "sleepy", brows: "sad", mouth: t >= tX ? "flat" : "sad", cowlick: "down" }).svg;
  if (t < tPi) {
    s += at(760, 720, pop(t, tPo), card(760, 720, 360, 170, -4, `${T(0, -14, "ДОЛЖНОСТЬ:", 34, O, "Rubik", 800)}${T(0, 44, "ПОНИЖЕН", 50, RED)}`));
    s += at(760, 960, pop(t, tO), card(760, 960, 360, 170, 5, `${T(0, -14, "ШОУ ТАЛАНТОВ", 34, O, "Rubik", 800)}${T(0, 44, "ЭФИР ОТМЕНЁН", 40, RED)}`));
  } else {
    s += at(720, 830, pop(t, tPi, 0.4), phone(720, 830, 4, `${person({ x: -110, y: -150, s: 0.22, long: true, hair: "#C2553D", body: "#FF9EC4", faceType: "calm" })}${T(-60, -215, "Она", 34, O, "Rubik", 900, "start")}
      <rect x="-165" y="-100" width="330" height="170" rx="26" fill="#fff" stroke="${O}" stroke-width="4"/>
      ${T(-140, -50, "Верни ногу.", 34, O, "Rubik", 800, "start")}${T(-140, -6, "С ней ты был", 34, O, "Rubik", 800, "start")}${T(-140, 38, "интереснее", 34, O, "Rubik", 800, "start")}`));
  }
  if (t >= tX) s = closeHero({ eyes: "closed", brows: "sad", mouth: "flat", cowlick: "down" });
  s += sfxPop(t, tX + 0.1, 760, 640, 0, "...", 110, "#fff", 1.6);
  return s;
};

// 15. Вопрос
SHOTS[14] = (t, u) => {
  let s = hero({ x: 300, y: 1150, s: 0.8, pose: "think", eyes: "normal", look: 1, brows: "raised", mouth: "flat", cowlick: "spiral" }).svg;
  s += C(470, 640, 18, "#fff") + C(530, 590, 26, "#fff") + at(760, 640, pop(t, START[14] + 0.2), C(760, 640, 190, "#fff"));
  const icons = [
    `${C(700, 640, 36, "#fff")}<circle cx="700" cy="640" r="12" fill="${O}"/>${T(760, 660, "↔", 60)}<path d="M820 600 q40 40 0 80" fill="none" stroke="${O}" stroke-width="10" stroke-linecap="round"/>`,
    `${T(760, 610, "НОС", 48)}${T(760, 660, "↔", 50)}${T(760, 710, "РОТ", 48)}`,
    T(760, 680, "???", 110, RED),
  ];
  if (u > 0.4) s += icons[Math.floor((u - 0.4) / 0.7) % icons.length];
  s += at(540, 1510, pop(t, START[14] + 0.5), `<g transform="translate(540,1510)"><rect x="-330" y="-55" width="660" height="110" rx="55" fill="${YEL}" stroke="${O}" stroke-width="${SW}"/>${T(0, 20, "ПИШИ В КОММЕНТЫ ↓", 52)}</g>`);
  return s;
};

// 16. Заставка
SHOTS[15] = (t, u) => {
  const b = Math.abs(Math.sin(u * 5)) * 18, pk = 1 + 0.05 * Math.sin(u * 7);
  let s = `${T(520, 370, "ПОДПИШИСЬ,", 92, "#fff", "Oswald", 700, "middle", `stroke="${O}" stroke-width="16" paint-order="stroke"`)}
    ${T(520, 460, "ЧТОБЫ НЕ ПРОПУСТИТЬ", 70, "#fff", "Oswald", 700, "middle", `stroke="${O}" stroke-width="14" paint-order="stroke"`)}`;
  s += at(520, 580, pop(t, START[15] + 0.1) * pk, `<rect x="230" y="520" width="580" height="120" rx="60" fill="${RED}" stroke="${O}" stroke-width="${SW + 2}"/>${T(520, 602, "ПОДПИСАТЬСЯ", 62, "#fff")}`);
  s += G(`translate(0,${-b})`, hero({ x: 540, y: 1200, s: 0.6, pose: "wave", eyes: "normal", brows: "proud", mouth: "grin", cowlick: "up" }).svg);
  return s;
};

// ---------- звуки ----------
const SFX = [];
{
  const add = (t, k, v = 1) => SFX.push({ t: +t.toFixed(3), k, v });
  for (let i = 1; i < 14; i++) if (CLOCK[i] !== CLOCK[i - 1]) add(START[i], "swish", 0.7);
  ACH.forEach((a) => add(a.t, "ding"));
  add(wt(0, "поменялись"), "boom", 0.6); add(wt(0, "поменялись") + 0.05, "huh"); add(wt(0, "нога", 1), "pop"); add(wt(0, "рука", 1), "pop");
  add(START[1] + 0.1, "beep", 0.9); add(START[1] + 0.5, "beep", 0.9); add(wt(1, "пяткой"), "thud", 0.7);
  add(START[2] + 0.8, "bul", 0.6); add(wt(2, "ухо"), "pop");
  add(wt(3, "погон"), "pop"); add(wt(3, "честь"), "ding", 0.6); add(wt(3, "кроссовок"), "pop", 0.7);
  add(wt(4, "молятся"), "pop", 0.7);
  add(wt(5, "кроссовком"), "stamp");
  add(START[6] + 0.3, "tick", 0.6); add(START[6] + 0.6, "tick", 0.6); add(wt(6, "повышает"), "cash");
  add(wt(7, "охрана"), "whoosh");
  add(wt(8, "позвонить"), "beep"); add(wt(8, "взяла"), "click");
  add(wt(9, "спрашивай"), "pop", 0.7);
  add(wt(10, "ногу"), "bloop"); add(wt(10, "остается"), "ding", 0.7);
  add(wt(11, "шоу"), "pop");
  add(wt(12, "возвращается"), "puff"); add(wt(12, "возвращается") + 0.05, "flash", 0.6);
  add(wt(13, "понижает"), "stamp", 0.7); add(wt(13, "отменяет"), "stamp", 0.7); add(wt(13, "пишет"), "beep", 0.7); add(wt(13, "охуеть"), "pff");
  add(START[14] + 0.2, "pop"); add(START[14] + 0.5, "pop", 0.7); add(START[15] + 0.1, "ding");
  SFX.sort((a, b) => a.t - b.t);
}

// ---------- кадр ----------
function frame(t) {
  let si = START.findIndex((s, i) => t >= s && t < END[i]);
  if (si < 0) si = NP - 1;
  const u = t - START[si], d = END[si] - START[si];
  const bg = bgPaper() + locBg(si);
  let scene = bg + SHOTS[si](t, u, d);
  const k = 1 + 0.05 * easeInOut(u / d);
  let sx = 0, sy = 0;
  for (const [ts, a] of SHAKES) { const v = t - ts; if (v >= 0 && v < 0.5) { const e = a * Math.exp(-v * 9); sx += e * Math.sin(v * 70); sy += e * Math.cos(v * 55); } }
  scene = `<g filter="url(#wob${Math.floor(t * 8) % 3})"><g transform="translate(${sx},${sy}) translate(540,860) scale(${k}) translate(-540,-860)">${scene}</g></g>`;
  let hud = "";
  if (CLOCK[si]) hud += clockCard(t, si) + countdown(t, si);
  hud += placeTag(t, si);
  hud += achievement(t) + subtitles(t);
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">${DEFS.replace("</defs>", LOC_CLIP + "</defs>")}${scene}${hud}</svg>`;
}
window.TOTAL = TOTAL; window.SFX = SFX; window.START = START;
window.renderFrame = (t) => { document.getElementById("root").innerHTML = frame(t); };
