// «Друг стал Васей». Требует draw.js, locations.js и window.DATA (audio/words.json).
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
const CLOCK = ["06:59", "07:00", "08:00", "09:00", "11:00", "13:00", "15:00", "18:00", "20:00", "00:00", "00:05", null, null];
const LVL = [10, 30, 40, 50, 60, 68, 76, 84, 95, 0, 12, null, null];
const LOCN = ["bedroom", "hallway", "kitchen", "classroom", "classroom", "shawarma", "street", "cafe", "street", "streetNight", "bathroom", "bedroom", "bedroom"];
const PLACE = ["ТВОЯ КОМНАТА", "ПОДЪЕЗД", "КУХНЯ ЖЕКИ", "УНИВЕР", null, "ШАУРМИЧНАЯ", "ДВОР", "КАФЕ", "ПОДЪЕЗД", "НОЧЬ", "ВАННАЯ", null, null];
const REDW = ["пришельцем", "вась", "остынет", "присутствует", "палок", "обычно", "хороший", "реально", "садись", "свась", "антенна", "отметь", "подпишись"];
const ACH = [
  { t: wt(3, "присутствует"), top: "ДОСТИЖЕНИЕ", text: "ПРИСУТСТВИЕ ЗАСЧИТАНО" },
  { t: wt(4, "пять"), top: "НОВЫЙ НАВЫК", text: "ВАСЬ, СВЯЗЬ" },
  { t: wt(8, "садись"), top: "ДОСТИЖЕНИЕ", text: "ПРИНЯТ НА РАЙОНЕ" },
];
const SHAKES = [[wt(0, "пришельцем"), 12], [wt(9, "свась"), 10], [wt(10, "антенна"), 16]];
// ---------- субтитры ----------
const CENSOR = { "сука": "с*ка", "похуй": "пох*й" };
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
const hand = `${noodle("M-20 430 C80 425 170 415 330 398", 30)}<ellipse cx="350" cy="398" rx="34" ry="38" fill="${SKIN}" stroke="${O}" stroke-width="${SW}"/><path d="M336 372 q24 -6 34 12" stroke="${O}" stroke-width="5" fill="none" stroke-linecap="round"/>`;
function topCard(t, si) {
  const txt = CLOCK[si], changed = si > 0 && CLOCK[si - 1] !== txt;
  const dx = changed ? -900 * (1 - easeOutBack((t - START[si]) / 0.45)) : 0;
  return `<g transform="translate(${dx},${Math.sin(t * 2.2) * 2})"><g transform="translate(540,335) rotate(-2)"><rect x="-200" y="-72" width="400" height="144" rx="20" fill="#fff" stroke="${O}" stroke-width="${SW + 2}"/>${T(0, 38, txt, 108, RED)}</g>${hand}</g>`;
}
function lvlBar(t, si) {
  const prev = si > 0 && LVL[si - 1] != null ? LVL[si - 1] : 0;
  const p = Math.round(lerp(prev, LVL[si], easeOut((t - START[si] - 0.2) / 0.7)));
  return `<g transform="translate(540,458)"><rect x="-270" y="-38" width="540" height="76" rx="38" fill="${O}"/>${T(-244, 10, "ВАСЬ-УРОВЕНЬ", 22, "#BDB6D6", "Rubik", 800, "start")}
    <rect x="-30" y="-14" width="160" height="28" rx="14" fill="#4A4166"/><rect x="-30" y="-14" width="${160 * p / 100}" height="28" rx="14" fill="#B5C48E"/>${T(248, 16, p + "%", 40, YEL, "Rubik", 900, "end")}</g>`;
}
function placeTag(t, si) {
  const txt = PLACE[si]; if (!txt || (si > 0 && LOCN[si - 1] === LOCN[si] && PLACE[si - 1])) return "";
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
const me = (x, s, f = {}) => hero({ x, y: 1150, s, eyes: "dots", brows: "raised", mouth: "o", cowlick: "spiral", ...f }).svg;
const phone = (x, y, rot, inner, w = 400, h = 620) => `<g transform="translate(${x},${y}) rotate(${rot})"><rect x="${-w / 2}" y="${-h / 2}" width="${w}" height="${h}" rx="44" fill="#2E2A44" stroke="${O}" stroke-width="${SW}"/><rect x="${-w / 2 + 25}" y="${-h / 2 + 40}" width="${w - 50}" height="${h - 80}" rx="24" fill="#F4F6FB"/>${inner}</g>`;
const signal = (x, y, k = 1) => at(x, y, k, `<g transform="translate(${x},${y})">${[0, 1, 2, 3, 4].map((i) => `<rect x="${i * 26}" y="${-20 - i * 16}" width="18" height="${20 + i * 16}" rx="4" fill="#3FB27F" stroke="${O}" stroke-width="3"/>`).join("")}</g>`);
function car(x, y, inside = "") {
  return `<g transform="translate(${x},${y})"><path d="M-330 -60 L-260 -170 L170 -170 L260 -70 L340 -50 L340 40 L-340 40 Z" fill="#141220" stroke="${O}" stroke-width="${SW}" stroke-linejoin="round"/>
    <path d="M-230 -150 L-40 -150 L-40 -70 L-290 -70 Z" fill="#3A3A55"/><path d="M-20 -150 L150 -150 L225 -70 L-20 -70 Z" fill="#3A3A55"/>${inside}
    ${C(-200, 40, 60, "#2E2A44")}${C(-200, 40, 26, "#9AA3B5")}${C(220, 40, 60, "#2E2A44")}${C(220, 40, 26, "#9AA3B5")}<rect x="300" y="-40" width="40" height="20" fill="#FFE58A"/></g>`;
}
const LOCX = {
  classroom: () => wrapLoc(wall("#E6ECF5") + `${R(220, 540, 640, 280, "#2E5A3E", 10)}${T(540, 620, "ЛЕКЦИЯ №7", 44, "#fff")}<path d="M300 700 L480 700 M300 750 L620 750" stroke="#fff" stroke-width="5" opacity=".7"/>${R(96, 900, 984, 30, "#C98A5A", 6)}${R(96, 930, 984, 130, "#A86C42")}` + floorWood()),
  shawarma: () => wrapLoc(wall("#FCE7C8", "#F3D7AE") + `${R(200, 540, 640, 120, "#B23A3A", 10)}${T(520, 620, "ШАУРМА 24/7", 56, "#FFE9C7")}${R(560, 700, 120, 240, "#C98A5A", 20)}<path d="M580 720 L660 720 L650 920 L590 920 Z" fill="#E8A75C" stroke="${O}" stroke-width="4"/>${R(96, 900, 984, 160, "#9AA3B5", 8)}` + floorTile(1060, "#E9D3B4", "#D2B791")),
  streetNight: () => LOCS.street().replace('fill="#BFE6FF"', 'fill="#1B1F4A"').replace('fill="#FFE58A"', 'fill="#FFF6C0"'),
};
const locBg = (si) => LOCX[LOCN[si]] ? LOCX[LOCN[si]]() : LOCS[LOCN[si]]();

// ---------- шоты ----------
const SHOTS = [];
SHOTS[0] = (t) => {
  const tP = wt(0, "пришельцем"), tN = wt(0, "похуй");
  let s = "";
  if (t < tP) s += G("translate(800,900) rotate(-90)", zheka({ x: 0, y: 0, s: 0.5, eyes: "calm", mouth: "smile" }));
  else s += vasya({ x: 760, y: 1150, s: 0.62, pose: "wave", mouth: "small" }) + sfxPop(t, tP, 800, 560, 6, "ВАСЬ!", 80, YEL, 1.1);
  s += me(380, 0.64);
  if (t >= tN) s += at(330, 600, pop(t, tN), sticker(330, 600, -6, "ВСЕМ ПОХ*Й", 50));
  return s;
};
SHOTS[1] = (t) => {
  const tG = wt(1, "голосовое"), tD = wt(1, "открываешь");
  if (t < tD) {
    let s = me(320, 0.62, { eyes: "normal", mouth: "flat", cowlick: "up" });
    s += at(720, 820, pop(t, tG), phone(720, 820, 3, `${T(0, -220, "Жека", 36, O, "Rubik", 900)}<rect x="-150" y="-40" width="300" height="90" rx="40" fill="#5BC0EB" stroke="${O}" stroke-width="4"/>${C(-110, 5, 24, "#fff")}<path d="M-118 -8 L-96 5 L-118 18 Z" fill="#5BC0EB"/>${[...Array(9)].map((_, i) => `<rect x="${-70 + i * 22}" y="${-10 - (i % 3) * 8}" width="10" height="${20 + (i % 3) * 16}" rx="4" fill="#fff"/>`).join("")}${T(0, 120, "«А Вась?»", 40, O, "Rubik", 900)}`));
    return s;
  }
  let s = `${R(560, 560, 330, 600, "#6B4A38", 6)}<rect x="590" y="590" width="270" height="570" fill="#2E2A44"/>`;
  s += vasya({ x: 720, y: 1150, s: 0.62, pose: "wave", mouth: "talk" }) + me(330, 0.62);
  return s;
};
SHOTS[2] = (t) => {
  const tV = wt(2, "вась");
  let s = `${R(96, 960, 600, 30, "#C98A5A", 6)}<ellipse cx="380" cy="955" rx="70" ry="22" fill="#fff" stroke="${O}" stroke-width="5"/><ellipse cx="380" cy="948" rx="52" ry="12" fill="#F2E3C6"/>`;
  s += vasya({ x: 330, y: 1150, s: 0.58, mouth: "small" }) + mom({ x: 760, y: 1150, s: 0.86, pose: "ladle" });
  s += bubble(760, 560, "ВАСЬ, ЕШЬ, ОСТЫНЕТ", 34, 1, pop(t, tV));
  return s;
};
SHOTS[3] = (t) => {
  const tZ = wt(3, "жеков"), tV = wt(3, "вась"), tP = wt(3, "присутствует");
  let s = person({ x: 820, y: 1150, s: 0.78, body: "#5A4A3A", coat: true, glasses: true, hair: "#888", faceType: "calm", holding: "card", cardText: "✓" });
  s += vasya({ x: 420, y: 1150, s: 0.58, pose: t >= tV ? "wave" : "idle", mouth: t >= tV && t < tP ? "talk" : "small" });
  if (t < tV) s += bubble(780, 560, "ЖЕКОВ?", 44, 1, pop(t, tZ));
  else if (t < tP) s += bubble(420, 560, "ВАСЬ.", 44, -1, pop(t, tV));
  else s += bubble(780, 560, "ПРИСУТСТВУЕТ", 38, 1, pop(t, tP));
  return s;
};
SHOTS[4] = (t, u) => {
  const tG = wt(4, "группа"), tP = wt(4, "пять");
  let s = vasya({ x: 540, y: 1150, s: 0.6, mouth: "small" });
  for (let i = 0; i < 6; i++) { const x = [200, 320, 760, 880, 260, 820][i], sc = 0.5; if (t >= tG + i * 0.15) s += at(x, 1100, pop(t, tG + i * 0.15), person({ x, y: 1150, s: sc, body: ["#5B8DEF", "#E8607A", "#3FB27F", "#E0B040", "#8E7CC3", "#F28C28"][i], hat: i % 2 ? "cap" : "none", faceType: "happy" })); }
  const r = (u * 120) % 200;
  s += `<circle cx="${540 + 0.6 * 30}" cy="${1150 - 0.6 * 910}" r="${40 + r}" fill="none" stroke="#3FB27F" stroke-width="6" opacity="${1 - r / 200}"/>`;
  s += signal(760, 640, pop(t, tP));
  return s;
};
SHOTS[5] = (t) => {
  const tO = wt(5, "тебе"), tF = wt(5, "впервые");
  let s = person({ x: 760, y: 1150, s: 0.8, body: "#fff", hat: "cap", faceType: "happy", skin: "#E8B48F" });
  s += vasya({ x: 380, y: 1150, s: 0.6, mouth: "small" });
  s += bubble(740, 560, "КАК ОБЫЧНО, ВАСЬ?", 34, 1, pop(t, tO));
  if (t >= tF) s += at(330, 600, pop(t, tF), sticker(330, 600, -6, "ВПЕРВЫЕ ТУТ", 48));
  return s;
};
SHOTS[6] = (t, u) => {
  const tH = wt(6, "хороший");
  let s = `<g transform="translate(560,980)">${R(-90, -150, 180, 280, "#2E2A44", 16)}${C(0, -70, 50, "#4A4166")}${C(0, -70, 18, "#1B1F3A")}${C(0, 60, 36, "#4A4166")}</g>`;
  s += noodle("M530 830 C520 760 600 700 640 640", 6, "#2E2A44");
  for (let i = 0; i < 4; i++) { const ph = (u * 0.9 + i * 0.25) % 1; s += T(660 + i * 40, 820 - ph * 220, i % 2 ? "♪" : "♫", 56, YEL, "Rubik", 900, "middle", `opacity="${1 - ph}"`); }
  const b = Math.abs(Math.sin(u * 8)) * 14;
  s += G(`translate(0,${-b})`, vasya({ x: 330, y: 1150, s: 0.6, pose: "wave", mouth: "small" }));
  s += person({ x: 880, y: 1150, s: 0.55, body: "#E0B040", faceType: "happy" });
  s += bubble(780, 560, "ХОРОШИЙ ЗВУК, ВАСЬ!", 34, 1, pop(t, tH));
  return s;
};
SHOTS[7] = (t) => {
  const tR = wt(7, "реально"), tP = wt(7, "пишет");
  let s = table(560, 1160, 360) + vasya({ x: 330, y: 1150, s: 0.58, mouth: "small" });
  s += person({ x: 800, y: 1150, s: 0.78, long: true, hair: "#C2553D", body: "#FF9EC4", faceType: "happy" });
  s += bubble(800, 560, "РЕАЛЬНО, ВАСЬ", 38, 1, pop(t, tR));
  if (t >= tP) s += at(560, 700, pop(t, tP), heart(560, 700, 1.3));
  return s;
};
const heart = (x, y, sc) => `<path transform="translate(${x},${y}) scale(${sc})" d="M0 30 C-60 -10 -40 -60 0 -30 C40 -60 60 -10 0 30 Z" fill="${RED}" stroke="${O}" stroke-width="5"/>`;
SHOTS[8] = (t) => {
  const tK = wt(8, "кто"), tV1 = wt(8, "вась", 0), tS = wt(8, "семки"), tA = wt(8, "вась", 1), tG = wt(8, "главный"), tSd = wt(8, "садись");
  let s = person({ x: 700, y: 1150, s: 0.7, body: "#2E2A44", hat: "cap", faceType: "calm" }) + person({ x: 880, y: 1150, s: 0.66, body: "#3A3550", hat: "cap", faceType: t >= tA && t < tG ? "shock" : "calm" });
  s += vasya({ x: 380, y: 1150, s: 0.6, item: t >= tG ? "seeds" : "", mouth: "small", look: 1 });
  if (t < tV1) s += bubble(760, 560, "СЛЫШЬ, ТЫ КТО ТАКОЙ?", 32, 1, pop(t, tK));
  else if (t < tS) s += bubble(380, 560, "ВАСЬ.", 44, -1, pop(t, tV1));
  else if (t < tA) s += bubble(760, 560, "СЕМКИ БУДУТ?", 40, 1, pop(t, tS));
  else if (t < tSd) s += bubble(380, 560, "...А ВАСЬ?", 40, -1, pop(t, tA));
  else s += bubble(760, 560, "САДИСЬ, ВАСЬ", 40, 1, pop(t, tSd));
  return s;
};
SHOTS[9] = (t) => {
  const tC = wt(9, "машина"), tSt = wt(9, "стекло"), tSv = wt(9, "свась"), tU = wt(9, "уезжает");
  let s = me(260, 0.6, { eyes: t >= tU ? "closed" : "normal", mouth: t >= tU ? "sad" : "flat", brows: "sad", cowlick: "down" });
  if (t >= tU) s += `<g transform="translate(330,1000)"><path d="M0 0 l40 0 l-8 50 l-24 0 Z" fill="#fff" stroke="${O}" stroke-width="4"/></g>`;
  const cx = t < tC ? 1500 : t < tU ? lerp(1500, 720, easeOut((t - tC) / 1.2)) : lerp(720, 1700, easeInOut((t - tU) / 1.6));
  let inside = "";
  if (t >= tSt) {
    const g = (dx, col, op) => `<g transform="translate(${dx},0)" opacity="${op}">${vasya({ x: -120, y: 120, s: 0.3, mouth: t >= tSv && t < tU ? "talk" : "small", antenna: false }).replace(/fill="#B5C48E"/g, `fill="${col}"`)}</g>`;
    inside = `<clipPath id="win"><path d="M-230 -150 L-40 -150 L-40 -70 L-290 -70 Z"/></clipPath><g clip-path="url(#win)">${t >= tSv ? g(-6, "#FF4D6D", 0.5) + g(6, "#4DD9FF", 0.5) : ""}${g(0, "#B5C48E", 1)}</g>`;
  }
  s += clip(car(cx, 1110, inside));
  if (t >= tSv && t < tU + 0.4) s += at(560, 640, pop(t, tSv), `<g transform="translate(560,640)">${T(0, 0, "СВАСЬ", 110, "#fff", "Oswald", 700, "middle", `stroke="${O}" stroke-width="14" paint-order="stroke"`)}</g>`);
  return s;
};
SHOTS[10] = (t) => {
  const tA = wt(10, "антенна"), tM = wt(10, "слышь");
  let s = `<g transform="translate(560,760)">${R(-230, -230, 460, 420, "#CDEBFA", 20)}</g>`;
  const refl = hero({ x: 560, y: 1150, s: 0.66, eyes: t >= tA ? "dots" : "normal", brows: t >= tA ? "raised" : "neutral", mouth: t >= tA ? "o" : "smile", cowlick: "up" }).svg;
  s += `<clipPath id="mir"><rect x="330" y="530" width="460" height="420" rx="20"/></clipPath><g clip-path="url(#mir)">${refl}${t >= tA ? `<path d="M590 ${1150 - 0.66 * 760} Q610 ${1150 - 0.66 * 860} 590 ${1150 - 0.66 * 900}" stroke="${O}" stroke-width="6" fill="none"/>${C(590, 1150 - 0.66 * 910, 14, YEL)}` : ""}</g>`;
  s += `<path d="M380 600 L460 560 M380 680 L520 580" stroke="#fff" stroke-width="12" opacity=".6"/>${R(330, 980, 460, 70, "#F4F7FB", 20)}`;
  s += bubble(250, 580, "СЛЫШЬ, ВАСЬ?", 40, 1, pop(t, tM));
  return s;
};
SHOTS[11] = (t, u) => {
  let s = vasya({ x: 330, y: 1150, s: 0.58, pose: "wave", mouth: "small" }) + me(720, 0.6, { eyes: "normal", mouth: "grin", brows: "proud", cowlick: "up" });
  s += at(540, 1510, pop(t, START[11] + 0.3), `<g transform="translate(540,1510)"><rect x="-330" y="-55" width="660" height="110" rx="55" fill="${YEL}" stroke="${O}" stroke-width="${SW}"/>${T(0, 20, "ОТМЕТЬ ДРУГА ↓", 54)}</g>`);
  return s;
};
SHOTS[12] = (t, u) => {
  const b = Math.abs(Math.sin(u * 5)) * 18, pk = 1 + 0.05 * Math.sin(u * 7);
  let s = `${T(520, 370, "ПОДПИШИСЬ,", 92, "#fff", "Oswald", 700, "middle", `stroke="${O}" stroke-width="16" paint-order="stroke"`)}${T(520, 460, "ЧТОБЫ НЕ ПРОПУСТИТЬ", 70, "#fff", "Oswald", 700, "middle", `stroke="${O}" stroke-width="14" paint-order="stroke"`)}`;
  s += at(520, 580, pop(t, START[12] + 0.1) * pk, `<rect x="230" y="520" width="580" height="120" rx="60" fill="${RED}" stroke="${O}" stroke-width="${SW + 2}"/>${T(520, 602, "ПОДПИСАТЬСЯ", 62, "#fff")}`);
  s += G(`translate(0,${-b})`, vasya({ x: 380, y: 1180, s: 0.56, pose: "wave" }) + hero({ x: 720, y: 1180, s: 0.6, pose: "wave", eyes: "normal", brows: "proud", mouth: "grin", cowlick: "up" }).svg);
  return s;
};

// ---------- звуки ----------
const SFX = [];
{
  const add = (t, k, v = 1) => SFX.push({ t: +t.toFixed(3), k, v });
  for (let i = 1; i < 11; i++) if (CLOCK[i] !== CLOCK[i - 1]) add(START[i], "swish", 0.6);
  ACH.forEach((a) => add(a.t, "ding"));
  add(wt(0, "пришельцем"), "boom", 0.6); add(wt(0, "пришельцем") + 0.05, "huh"); add(wt(0, "похуй"), "pop", 0.7);
  add(wt(1, "голосовое"), "beep", 0.7); add(wt(1, "открываешь"), "whoosh", 0.6);
  add(wt(2, "вась"), "pop", 0.6); add(wt(3, "присутствует"), "tick");
  add(wt(5, "впервые"), "pop", 0.7); add(wt(6, "хороший"), "pop", 0.7);
  add(wt(7, "пишет"), "bloop"); add(wt(8, "главный"), "flutter", 0.5);
  add(wt(9, "машина"), "whoosh"); add(wt(9, "свась"), "flash", 0.5); add(wt(9, "уезжает"), "whoosh");
  add(wt(10, "антенна"), "stamp", 0.8); add(START[11] + 0.3, "pop"); add(START[12] + 0.1, "ding");
  SFX.sort((a, b) => a.t - b.t);
}

// ---------- кадр ----------
function frame(t) {
  let si = START.findIndex((s, i) => t >= s && t < END[i]);
  if (si < 0) si = NP - 1;
  const u = t - START[si], d = END[si] - START[si];
  let scene = bgPaper() + locBg(si) + SHOTS[si](t, u, d);
  const k = 1 + 0.05 * easeInOut(u / d);
  let sx = 0, sy = 0;
  for (const [ts, a] of SHAKES) { const v = t - ts; if (v >= 0 && v < 0.5) { const e = a * Math.exp(-v * 9); sx += e * Math.sin(v * 70); sy += e * Math.cos(v * 55); } }
  scene = `<g filter="url(#wob${Math.floor(t * 8) % 3})"><g transform="translate(${sx},${sy}) translate(540,860) scale(${k}) translate(-540,-860)">${scene}</g></g>`;
  let hud = "";
  if (CLOCK[si]) hud += topCard(t, si) + lvlBar(t, si) + placeTag(t, si);
  hud += achievement(t) + subtitles(t);
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">${DEFS.replace("</defs>", LOC_CLIP + "</defs>")}${scene}${hud}</svg>`;
}
window.TOTAL = TOTAL; window.SFX = SFX; window.START = START;
window.renderFrame = (t) => { document.getElementById("root").innerHTML = frame(t); };
