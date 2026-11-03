// Таймлайн ролика «30 дней только протеин». Требует draw.js и window.DATA (audio/words.json).
/* global DATA */
const WORDS = DATA.words;
const NP = DATA.paras.length;
const TAIL = 1.2;
const TOTAL = DATA.duration + TAIL;
const firstOf = (pi) => WORDS.find((w) => w.p === pi);
const START = Array.from({ length: NP }, (_, i) => (i === 0 ? 0 : Math.max(0, firstOf(i).s - 0.12)));
const END = START.map((s, i) => (i + 1 < NP ? START[i + 1] : TOTAL));
// время слова в абзаце pi, начинающегося на stem (occ — какое по счёту)
function wt(pi, stem, occ = 0) {
  const ws = WORDS.filter((w) => w.p === pi && w.n.startsWith(stem));
  const w = ws[occ] || ws[0];
  if (!w) { console.warn("нет слова", pi, stem); return START[pi]; }
  return w.s;
}

// ---------- данные шотов ----------
const DAY = ["00", "01", "01", "03", "04", "05", "07", "10", "15", "19", "23", "27", "30", "01", "31?", null];
const KG = [60, 60, 60, 58, 59, 64, 66, 82, 140, 170, 210, "???", "???", 60, 60, null];
const COL = [PAL.mint, PAL.yellow, PAL.yellow, PAL.yellow, PAL.pink, PAL.pink, PAL.pink, PAL.pink, PAL.purple, PAL.purple, PAL.orange, null, null, PAL.mint, PAL.mint, PAL.mint];
const REDW = ["протеин", "бицепс", "полкило", "вода", "собаки", "кетчуп", "шоколад", "боится", "лазеры", "бесплатно", "соседей", "спутника", "просыпаешься", "муку", "суперсила", "подпишись"];
const ACH = [
  { t: () => wt(4, "собаки") + 0.2, top: "ДОСТИЖЕНИЕ", text: "ВОЖАК СТАИ" },
  { t: () => wt(8, "лазеры") + 0.1, top: "НОВАЯ СПОСОБНОСТЬ", text: "ЛАЗЕРЫ ИЗ ГЛАЗ" },
  { t: () => wt(9, "бесплатно") + 0.1, top: "ДОСТИЖЕНИЕ", text: "БЕСПЛАТНЫЙ ПРОТЕИН" },
].map((a) => ({ ...a, t: a.t() }));
const SHAKES = [
  [wt(6, "обнаружено") + 0.45, 16], [wt(8, "ударили"), 14], [START[10] + 0.05, 10], [wt(11, "это", 1), 18], [wt(12, "просыпаешься"), 12],
];

// ---------- субтитры ----------
const CENSOR = { "ебать": "еб*ть", "нихуя": "них*я", "ахуе": "ах*е", "ебучий": "еб*чий", "блять": "бл*ть", "пиздец": "п*здец" };
const GROUPS = [];
{
  let cur = [];
  const flush = () => { if (cur.length) GROUPS.push(cur); cur = []; };
  WORDS.forEach((w, i) => {
    if (cur.length && cur[0].p !== w.p) flush();
    cur.push(w);
    const len = cur.reduce((a, x) => a + x.n.length, 0);
    const punct = /[.,!?…:»]$/.test(w.w.replace(/\s.*$/, "")) || /[.,!?…:—]/.test(w.w.slice(-1));
    if (cur.length >= 3 || punct || len > 13) flush();
  });
  flush();
}
const redIdx = new Set();
REDW.forEach((stem, pi) => { const ws = WORDS.filter((w) => w.p === pi && w.n.startsWith(stem)); if (ws.length) redIdx.add(WORDS.indexOf(ws[ws.length - 1])); });
function subText(w) {
  let s = w.w.replace(/[«»"]/g, "");
  for (const [k, v] of Object.entries(CENSOR)) s = s.replace(new RegExp(k, "i"), v);
  return s.toUpperCase();
}
function subtitles(t) {
  const gi = GROUPS.findIndex((g, i) => t >= g[0].s - 0.05 && (i + 1 >= GROUPS.length || t < GROUPS[i + 1][0].s - 0.05));
  if (gi < 0) return "";
  const g = GROUPS[gi];
  if (t > g[g.length - 1].e + 0.6) return "";
  if (g[0].p === NP - 1) return ""; // на заставке свой текст
  const items = g.map((w) => ({ t: subText(w), red: redIdx.has(WORDS.indexOf(w)), on: t >= w.s - 0.03 }));
  const total = items.reduce((a, x) => a + x.t.length + 1, 0);
  const lines = total > 14 && items.length > 1 ? [items.slice(0, Math.ceil(items.length / 2)), items.slice(Math.ceil(items.length / 2))] : [items];
  const size = 118;
  const k = 0.85 + 0.15 * easeOutBack((t - g[0].s + 0.05) / 0.18);
  const y0 = 1340 - ((lines.length - 1) * size) / 2;
  const txt = lines.map((ws, i) => `<text x="520" y="${y0 + i * size * 1.02}" text-anchor="middle" font-family="Oswald" font-weight="700" font-size="${size}"
    stroke="${O}" stroke-width="18" stroke-linejoin="round" paint-order="stroke" letter-spacing="1">${ws.map((w) =>
    `<tspan fill="${w.red ? RED : "#fff"}" fill-opacity="${w.on ? 1 : 0.5}">${w.t}</tspan>`).join(" ")}</text>`).join("");
  return at(520, 1320, k, txt);
}

// ---------- HUD ----------
function dayCard(num, t, si, extra = "") {
  const changed = si === 0 || DAY[si - 1] !== num;
  const u = t - START[si];
  const dx = changed ? -900 * (1 - easeOutBack(u / 0.45)) : 0;
  const bob = Math.sin(t * 2.2) * 2;
  return `<g transform="translate(${dx},${bob})"><g transform="translate(540,335) rotate(-2)">
    <rect x="-260" y="-72" width="520" height="144" rx="20" fill="#fff" stroke="${O}" stroke-width="${SW + 2}"/>
    ${T(10, 34, "ДЕНЬ", 78, O, "Rubik", 900, "end")}${T(40, 40, num, 104, RED, "Rubik", 900, "start")}${extra}</g>
    ${noodle("M-20 430 C80 425 170 415 262 398", 30)}
    <ellipse cx="282" cy="398" rx="34" ry="38" fill="${SKIN}" stroke="${O}" stroke-width="${SW}"/>
    <path d="M268 372 q24 -6 34 12" stroke="${O}" stroke-width="5" fill="none" stroke-linecap="round"/></g>`;
}
function weight(t, si) {
  const v = KG[si];
  if (v == null) return "";
  let txt;
  if (typeof v === "number") {
    const prev = si > 0 && typeof KG[si - 1] === "number" ? KG[si - 1] : v;
    const k = easeOut((t - START[si] - 0.3) / 0.8);
    txt = `${Math.round(lerp(prev, v, k))} КГ`;
  } else {
    const f = Math.floor(t * 12);
    txt = `${Math.floor(rnd(f) * 9) + 1}${Math.floor(rnd(f + 1) * 10)}?? КГ`;
  }
  return `<g transform="translate(540,458)"><rect x="-170" y="-36" width="340" height="72" rx="36" fill="${O}"/>
    ${T(-140, 13, "ВЕС", 30, "#BDB6D6", "Rubik", 800, "start")}${T(150, 15, txt, 44, YEL, "Rubik", 900, "end")}</g>`;
}
function achievement(t) {
  for (const a of ACH) {
    const u = t - a.t;
    if (u < 0 || u > 2.3) continue;
    const y = u < 0.35 ? lerp(-120, 600, easeOutBack(u / 0.35)) : u > 1.95 ? lerp(600, -150, easeOut((u - 1.95) / 0.35)) : 600;
    return `<g transform="translate(520,${y})"><rect x="-420" y="-50" width="840" height="100" rx="50" fill="${YEL}" stroke="${O}" stroke-width="${SW + 2}"/>
      ${star(-360, 0, 34, "#fff")}${T(-310, -8, a.top, 26, O, "Rubik", 800, "start", 'opacity=".7"')}${T(-310, 34, a.text, 44, O, "Rubik", 900, "start")}</g>`;
  }
  return "";
}

// ---------- шоты ----------
// каждый: (t, u, d) → svg сцены (без HUD). t — абсолютное время, u — от начала шота, d — длина шота
const SHOTS = [];

// 1. Хук
SHOTS[0] = (t) => {
  const tDr = wt(0, "дрыщ"), tSk = wt(0, "скалой"), tNa = wt(0, "наверное");
  const after = t >= tNa;
  const h = hero({ x: 380, y: 1150, s: 0.86, pose: "reach", brows: after ? "raised" : "proud", mouth: after ? "flat" : "grin", cowlick: "up" });
  let s = jar(720, 1150, 300, 600) + h.svg;
  s += at(200, 700, pop(t, tDr), sticker(200, 700, -6, "ТЫ, 60 КГ") + arrow("M215 750 Q230 800 270 820", "M245 828 L272 822 L268 795"));
  // облако-мечта
  const kc = pop(t, tSk, 0.4) * (1 - easeOut((t - tNa - 0.5) / 0.3));
  if (kc > 0.01) {
    const cl = [[760, 700, 120], [660, 740, 80], [860, 740, 90], [700, 640, 90], [830, 640, 95]].map(([x, y, r]) => C(x, y, r, "#fff")).join("") +
      [[620, 830, 22], [580, 870, 14]].map(([x, y, r]) => C(x, y, r, "#fff")).join("");
    const st = hero({ x: 765, y: 800, s: 0.22, build: "giant", stone: true, brows: "proud", mouth: "grin" }).svg;
    s += at(700, 760, kc, cl + `<rect x="620" y="610" width="290" height="210" fill="#fff"/>` + st);
  }
  s += sfxPop(t, tNa + 0.4, 820, 640, 8, "ПФ", 70, "#fff", 0.7);
  return s;
};

// 2. День 1: шейки → селфи
SHOTS[1] = (t, u) => {
  const tBog = wt(1, "бог"), tFo = wt(1, "фоткаешь");
  let s = "";
  if (t < tFo) {
    const drank = Math.min(10, Math.floor(u * 2.2));
    s += table(780, 1160, 400);
    for (let i = 0; i < 10; i++) { const r = Math.floor(i / 5), c = i % 5; s += shakerSmall(625 + c * 75 - r * 30, 1052 - r * 0, 0.8 - r * 0.0, i < drank ? 0.05 : 0.65); }
    s += at(820, 840, pop(t, START[1] + 0.8), sticker(820, 840, 5, "× 20", 64));
    const god = t >= tBog;
    const h = hero({ x: 330, y: 1150, s: 0.86, pose: "shaker", eyes: god ? "star" : "closed", brows: god ? "proud" : "neutral", mouth: god ? "grin" : "smile", halo: god, cowlick: "up" });
    s += h.svg;
    s += sfxPop(t, START[1] + 0.2, 520, 640, -10, "БУЛЬ", 90) + sfxPop(t, wt(1, "двадцать") + 0.1, 560, 700, 8, "БУЛЬ-БУЛЬ", 80);
  } else {
    // селфи в телефоне
    s += `<g transform="translate(540,820) rotate(-4)"><rect x="-300" y="-450" width="600" height="900" rx="60" fill="#2E2A44" stroke="${O}" stroke-width="${SW}"/>
      <rect x="-270" y="-400" width="540" height="800" rx="30" fill="${PAL.pink}"/>
      <clipPath id="phc"><rect x="-270" y="-400" width="540" height="800" rx="30"/></clipPath>
      <g clip-path="url(#phc)">${hero({ x: 0, y: 520, s: 1.05, pose: "flex", eyes: "normal", brows: "proud", mouth: "grin", cowlick: "up" }).svg}</g>
      <rect x="-60" y="-430" width="120" height="16" rx="8" fill="#111"/>${C(0, 420, 0.1, "#111")}</g>`;
    s += at(250, 560, pop(t, wt(1, "бицепс")), sticker(250, 560, -8, "БИЦЕПС (?)", 50) + arrow("M300 600 Q330 650 360 660", "M335 668 L362 662 L356 636"));
    const fl = 1 - clamp((t - tFo) / 0.18);
    if (fl > 0) s += `<rect width="${W}" height="${H}" fill="#fff" opacity="${fl}"/>`;
  }
  return s;
};

// 3. Калории: весы → чек → кошелёк
SHOTS[2] = (t, u) => {
  const tB = wt(2, "банка"), tK = wt(2, "кошелек");
  const g = Math.round(625 * easeOut((u - 0.3) / 1.2));
  let s = card(520, 800, 640, 520, -3, `
    <rect x="-200" y="60" width="400" height="120" rx="24" fill="#EDEFF5" stroke="${O}" stroke-width="${SW}"/>
    <rect x="-120" y="90" width="240" height="64" rx="10" fill="#C8F0D2" stroke="${O}" stroke-width="5"/>${T(0, 140, `${g} Г`, 52, O, "Rubik", 900)}
    <ellipse cx="0" cy="40" rx="230" ry="34" fill="#fff" stroke="${O}" stroke-width="${SW}"/>
    <path d="M-150 30 Q-80 -110 0 -120 Q90 -110 150 30 Z" fill="#E9D3B4" stroke="${O}" stroke-width="${SW}"/>
    ${[0, 1, 2, 3, 4, 5].map((i) => `<g transform="translate(${-200 + i * 80},${-170 - (i % 2) * 20}) rotate(${-30 + i * 12})"><ellipse cx="0" cy="0" rx="26" ry="18" fill="#fff" stroke="${O}" stroke-width="4"/><rect x="18" y="-5" width="60" height="10" rx="5" fill="#fff" stroke="${O}" stroke-width="4"/></g>`).join("")}
    ${T(0, -210, "ПОРОШОК В ДЕНЬ", 40, O, "Rubik", 800)}`);
  if (t >= tB) s += at(560, 820, pop(t, tB, 0.4), card(560, 820, 620, 470, 4, `
    ${T(0, -160, "СПОРТПИТ", 52)}<line x1="-250" y1="-130" x2="250" y2="-130" stroke="${O}" stroke-width="4" stroke-dasharray="12 10"/>
    ${T(-250, -60, "ПРОТЕИН 1 КГ", 40, O, "Rubik", 800, "start")}${T(250, -60, "2 500 ₽", 40, O, "Rubik", 900, "end")}
    ${T(-250, 10, "ХВАТИТ НА:", 40, O, "Rubik", 800, "start")}${T(250, 10, "1,5 ДНЯ", 46, RED, "Rubik", 900, "end")}
    <line x1="-250" y1="50" x2="250" y2="50" stroke="${O}" stroke-width="4" stroke-dasharray="12 10"/>
    ${T(0, 140, "СПАСИБО ЗА ПОКУПКУ!", 34, O, "Caveat", 700)}`, ""), 0);
  if (t >= tK) {
    const v = t - tK;
    s += at(300, 1060, pop(t, tK), `<g transform="translate(300,1060) rotate(-8)">${R(-130, -70, 260, 140, "#8B5A3C", 22)}<path d="M-130 -70 L-60 -150 L130 -150 L130 -70" fill="#A86C42" stroke="${O}" stroke-width="${SW}" stroke-linejoin="round"/>${C(90, 0, 18, YEL)}</g>`);
    const mx = 300 + v * 160, my = 980 - v * 260, fl = Math.sin(v * 30) * 0.6 + 0.4;
    s += `<g transform="translate(${mx},${my})"><ellipse cx="-24" cy="0" rx="30" ry="${22 * fl + 6}" fill="#D9CBB0" stroke="${O}" stroke-width="4"/><ellipse cx="24" cy="0" rx="30" ry="${22 * fl + 6}" fill="#D9CBB0" stroke="${O}" stroke-width="4"/><ellipse cx="0" cy="0" rx="10" ry="26" fill="#8C7A60" stroke="${O}" stroke-width="4"/></g>`;
  }
  return s;
};

// 4. День 3: весы, рёбра, капля воды
SHOTS[3] = (t) => {
  const tM = wt(3, "минус"), tP = wt(3, "пресс"), tE = wt(3, "это");
  const k = easeOut((t - tM) / 0.8);
  const kg = (60 - 2 * k).toFixed(1).replace(".", ",");
  const happy = t >= tM && t < tE;
  let s = `${shadow(540, 1156, 210)}${R(380, 1100, 320, 58, "#EDEFF5", 20)}<rect x="480" y="1110" width="120" height="38" rx="8" fill="#C8F0D2" stroke="${O}" stroke-width="4"/>${T(540, 1141, kg, 30, O, "Rubik", 900)}`;
  s += hero({ x: 540, y: 1104, s: 0.84, ribs: t >= tP, eyes: happy ? "star" : "normal", brows: happy ? "proud" : t >= tE ? "raised" : "neutral", mouth: happy ? "grin" : "smile", cowlick: "up" }).svg;
  s += at(250, 860, pop(t, tP), sticker(250, 860, -6, "ПРЕСС", 56) + arrow("M300 900 Q360 930 410 920", "M385 932 L412 920 L392 900"));
  if (t >= tE) { const v = t - tE; s += waterDrop(760 + v * 140, 1150, 0.85, v); }
  return s;
};

// 5. День 4: собаки
SHOTS[4] = (t, u) => {
  const tS = wt(4, "собаки");
  let s = "";
  const cols = ["#C98A5A", "#F2E3C6", "#6B4A38", "#E0B040"];
  for (let i = 0; i < 4; i++) if (t >= tS + i * 0.25) s += at(500 - i * 140, 1120, pop(t, tS + i * 0.25), dog(500 - i * 140, 1150, 0.85 - i * 0.04, cols[i], u + i));
  s += hero({ x: 720, y: 1150, s: 0.84, walk: u, drip: u, eyes: "normal", look: -1, brows: "raised", mouth: "smile", cowlick: "up" }).svg;
  s += at(330, 640, pop(t, START[4] + 0.6), sticker(330, 640, -6, "ШОКОЛАДНЫЙ ПОТ", 46) + arrow("M420 680 Q520 720 600 760", "M572 768 L602 760 L590 732"));
  return s;
};

// 6. День 5: правая рука → кетчуп
SHOTS[5] = (t) => {
  const tPr = wt(5, "правой", 1), tL = wt(5, "левой");
  let s = "";
  if (t < tL) {
    s += hero({ x: 400, y: 1150, s: 0.78, build: "armR", brows: "proud", mouth: "grin", cowlick: "up" }).svg;
    const ppl = [["#5B8DEF", "none", "#3B2A20"], ["#3FB27F", "cap", "#000"], ["#E8607A", "scarf", "#000"]];
    ppl.forEach(([b, hat, hair], i) => { s += person({ x: 700 + i * 130, y: 1150 - i * 10, s: 0.8 - i * 0.06, body: b, hat, hair, holding: "jar", faceType: "happy" }); });
    for (let i = 0; i < 3; i++) s += sfxPop(t, tPr + 0.35 + i * 0.45, 640 + i * 90, 700 - i * 40, -8 + i * 8, "ЧПОК", 70, "#fff", 0.6);
  } else {
    const j = Math.sin(t * 60) * 6;
    s += `<g transform="translate(${540 + j},940) rotate(${-8 + j})">
      <path d="M-90 -260 L-70 -330 L70 -330 L90 -260 L110 220 Q0 260 -110 220 Z" fill="${RED}" stroke="${O}" stroke-width="${SW}" stroke-linejoin="round"/>
      ${R(-50, -400, 100, 80, "#fff", 14)}${R(-80, -60, 160, 120, "#fff", 10)}${T(0, 15, "КЕТЧУП", 36)}</g>`;
    s += noodle(`M1120 1090 C940 1070 750 1050 ${625 + j} 990`, 22) + C(610 + j, 985, 34, SKIN);
    s += sfxPop(t, tL + 0.6, 300, 640, -10, "ЫЫЫ!", 90, "#fff", 1.6);
    s += `<path d="M380 760 q-14 26 0 36 q14 -10 0 -36 Z" fill="#9FE3FF" stroke="${O}" stroke-width="4"/>`;
  }
  return s;
};

// 7. День 7: анализ крови
SHOTS[6] = (t) => {
  const rows = [["КРОВЬ", "НЕ ОБНАРУЖЕНО", wt(6, "кровь"), RED], ["ПРОТЕИН", "100%", wt(6, "протеин"), O], ["ВКУС", "ШОКОЛАД", wt(6, "вкус"), "#8B5A3C"]];
  let inner = `${T(0, -250, "АНАЛИЗ КРОВИ", 60, "#2C5BD8")}<line x1="-320" y1="-210" x2="320" y2="-210" stroke="${O}" stroke-width="4"/>`;
  rows.forEach(([a, b, tt, col], i) => {
    const y = -120 + i * 120, k = fade(t, tt, 0.2);
    inner += `<g opacity="${k}">${T(-320, y, a, 44, O, "Rubik", 800, "start")}${T(320, y, b, 44, col, "Rubik", 900, "end")}<line x1="-320" y1="${y + 30}" x2="320" y2="${y + 30}" stroke="${O}" stroke-width="2" stroke-dasharray="8 8"/></g>`;
  });
  let s = card(530, 830, 760, 640, -2, inner);
  const ts = wt(6, "обнаружено") + 0.45;
  if (t >= ts) {
    const k = lerp(2.2, 1, easeOut((t - ts) / 0.18));
    s += at(560, 1000, k, `<g transform="translate(560,1000) rotate(-12)"><rect x="-300" y="-70" width="600" height="140" rx="14" fill="none" stroke="${RED}" stroke-width="12"/>${T(0, -8, "КРОВЬ", 52, RED)}${T(0, 48, "НЕ ОБНАРУЖЕНА", 52, RED)}</g>`);
  }
  return s;
};

// 8. День 10: холодильник → мама
SHOTS[7] = (t) => {
  const tH2 = wt(7, "холодильник", 1), tM = wt(7, "мама"), tB = wt(7, "боится");
  let s = "";
  const fridge = (x, y, rot) => `<g transform="translate(${x},${y}) rotate(${rot})">${R(-95, -330, 190, 330, "#F4F7FB", 20)}<line x1="-95" y1="-200" x2="95" y2="-200" stroke="${O}" stroke-width="5"/>
    <rect x="60" y="-300" width="12" height="70" rx="6" fill="${O}"/><rect x="60" y="-170" width="12" height="90" rx="6" fill="${O}"/>
    <path d="M-95 -330 l-14 -14 M-95 -200 l-16 -8" stroke="${O}" stroke-width="5"/></g>`;
  if (t < tM) {
    s += hero({ x: 400, y: 1150, s: 0.62, build: "giant", brows: "raised", mouth: t >= tH2 ? "o" : "smile", cowlick: "up" }).svg;
    if (t < tH2) s += `${shadow(800, 1156, 120)}` + fridge(800, 1150, 0);
    else { const k = easeOutBack((t - tH2) / 0.35); s += fridge(lerp(800, 560, k), lerp(1150, 1010, k), lerp(0, -12, k)); s += sfxPop(t, tH2, 800, 700, 10, "ХРУСТЬ", 80, "#fff", 0.9); }
  } else {
    const sc = t >= tB, j = sc ? Math.sin(t * 70) * 5 : 0;
    s += `${R(580, 520, 360, 640, "#E9D8C4", 0)}<rect x="610" y="550" width="300" height="610" fill="#5A4636" opacity=".85"/>`;
    s += G(`translate(${j},0)`, mom({ x: 760, y: 1150, s: 0.95, pose: "ladle", scared: sc }));
    s += `${R(560, 500, 40, 660, "#C9A27C")}`;
    if (sc) s += `<path d="M850 600 q-16 28 0 40 q16 -12 0 -40 Z" fill="#9FE3FF" stroke="${O}" stroke-width="4"/>`;
    s += at(300, 760, pop(t, tM + 0.3), sticker(300, 760, -5, "МАМА", 60));
  }
  return s;
};

// 9. День 15: лазеры → пекарня
SHOTS[8] = (t) => {
  const tU = wt(8, "ударили"), tI = wt(8, "испарился"), tP = wt(8, "пекарня"), tZ = wt(8, "закрылась");
  let s = "";
  if (t < tP) {
    const firing = t >= tU && t < tI + 0.4;
    const h = hero({ x: 360, y: 1160, s: 0.74, build: "giant", eyes: t >= tU ? "laser" : "normal", look: 1, brows: "angry", mouth: t >= tU ? "teeth" : "flat", cowlick: "up" });
    s += table(880, 1160, 300) + (t < tI ? loaf(880, 1052, 1) : "") + h.svg;
    if (firing) {
      const tg = [880, 1015];
      s += h.eyes.map(([ex, ey]) => `<line x1="${ex}" y1="${ey}" x2="${tg[0]}" y2="${tg[1]}" stroke="${RED}" stroke-width="40" stroke-linecap="round" opacity=".45" filter="url(#glow)"/>
        <line x1="${ex}" y1="${ey}" x2="${tg[0]}" y2="${tg[1]}" stroke="${RED}" stroke-width="16" stroke-linecap="round"/>
        <line x1="${ex}" y1="${ey}" x2="${tg[0]}" y2="${tg[1]}" stroke="#fff" stroke-width="5" stroke-linecap="round"/>`).join("");
    }
    if (t >= tI) s += puff(880, 1000, 1, easeOutBack((t - tI) / 0.4) * (1 - clamp((t - tI - 1.2) / 0.5)));
    s += sfxPop(t, tU, 700, 820, -10, "ВЖЖЖ", 84, YEL, 1.4) + sfxPop(t, tI, 905, 905, 8, "ПУФ!", 70, "#fff", 0.9);
  } else {
    // фасад пекарни
    s += `${R(110, 520, 860, 640, "#F2C9A0")}${[0, 1, 2, 3, 4, 5, 6].map((i) => `<line x1="110" y1="${600 + i * 80}" x2="970" y2="${600 + i * 80}" stroke="${O}" stroke-width="2" opacity=".2"/>`).join("")}
      ${R(200, 560, 680, 110, "#8B5A3C", 16)}${T(540, 640, "ПЕКАРНЯ", 76, "#FFE9C7")}
      <rect x="160" y="720" width="440" height="440" fill="#BFE3F5" stroke="${O}" stroke-width="${SW}"/>`;
    s += person({ x: 380, y: 1160, s: 0.95, body: "#fff", hat: "toque", faceType: "shock", holding: "baguette", skin: "#F7D2B0" });
    s += `<path d="M190 760 L260 720 M190 860 L330 760" stroke="#fff" stroke-width="10" opacity=".6"/><rect x="160" y="720" width="440" height="440" fill="none" stroke="${O}" stroke-width="${SW + 2}"/>
      ${R(660, 760, 240, 400, "#6B4A38")}${C(870, 970, 10, YEL)}`;
    s += at(780, 880, pop(t, tZ - 0.2), `<g transform="translate(780,880) rotate(${Math.sin((t - tZ) * 6) * 3})"><line x1="-40" y1="-110" x2="0" y2="-150" stroke="${O}" stroke-width="4"/><line x1="40" y1="-110" x2="0" y2="-150" stroke="${O}" stroke-width="4"/>
      ${R(-110, -110, 220, 150, "#fff", 10)}${T(0, -50, "ЗАКРЫТО", 40, RED)}${T(0, 5, "НАВСЕГДА", 34)}</g>`);
    s += sfxPop(t, tP + 0.4, 330, 600 + 0, -6, "?!", 90, "#fff", 1.2);
  }
  return s;
};

// 10. День 19: баннер спортпита → слёзы
SHOTS[9] = (t) => {
  const tB = wt(9, "бесплатно"), tN = wt(9, "навсегда"), tPl = wt(9, "плачеш");
  let s = "";
  if (t < tPl) {
    s += `${R(110, 640, 860, 520, "#E3E8F2")}${R(150, 900, 260, 260, "#BFE3F5")}${R(670, 940, 200, 220, "#6B4A38")}`;
    s += `<g transform="translate(540,640)">${R(-400, -120, 800, 260, "#fff", 20)}${T(-150, 50, "СПОРТПИТ", 74)}</g>`;
    s += G("translate(800,700) scale(0.62)", head({ cy: 0, r: 150, eyes: "star", brows: "proud", mouth: "grin", cowlick: "up" }));
    s += at(540, 1000, pop(t, tB), card(540, 1000, 520, 200, -4, `${T(0, -10, "ПРОТЕИН: 0 ₽", 60, RED)}${T(0, 58, "для тебя", 44, O, "Caveat", 700)}`));
    s += at(840, 860, pop(t, tN), `<g transform="translate(840,860) rotate(12)">${C(0, 0, 90, YEL)}${T(0, 30, "∞", 110)}</g>`);
  } else {
    s += `<g transform="translate(540,1180) scale(1.55)">
      <path d="M-200 0 L-170 -120 Q0 -160 170 -120 L200 0 Z" fill="${SHIRT}" stroke="${O}" stroke-width="${SW}"/>${head({ cy: -300, r: 150, eyes: "closed", brows: "sad", mouth: "wavy", tears: t, cowlick: "down" })}</g>`;
    s += at(830, 980, pop(t, wt(9, "ванили")), sticker(830, 980, 8, "ВАНИЛЬ", 58) + arrow("M770 940 Q720 900 690 860", "M688 888 L688 858 L714 868"));
  }
  return s;
};

// 11. День 23: провалился к соседям
SHOTS[10] = (t, u) => {
  const tB = wt(10, "банки");
  let s = `${R(96, 520, 984, 200, "#DCE8F7")}<path d="M96 720 L330 720 L360 760 L400 735 L430 770 L470 740 L510 772 L550 735 L590 760 L620 720 L1080 720 L1080 770 L96 770 Z" fill="#B8A898" stroke="${O}" stroke-width="${SW}" stroke-linejoin="round"/>
    ${R(96, 770, 984, 390, "#F7E3C8")}<rect x="700" y="820" width="180" height="140" fill="#BFE3F5" stroke="${O}" stroke-width="${SW}"/>${R(860, 990, 160, 170, "#C98A5A", 10)}`;
  for (let i = 0; i < 5; i++) { const fy = 740 + Math.min(1, u * 1.5) * (380 + i * 20) * 1; if (u < 1.2) s += `<rect x="${380 + i * 50}" y="${fy}" width="26" height="20" fill="#B8A898" stroke="${O}" stroke-width="3" transform="rotate(${i * 30} ${390 + i * 50} ${fy})"/>`; }
  s += hero({ x: 450, y: 1150, s: 0.5, build: "giant", brows: "neutral", mouth: "smile", cowlick: "up" }).svg;
  s += person({ x: 780, y: 1150, s: 0.7, body: "#8E7CC3", hat: "scarf", faceType: "happy", holding: "jar", skin: "#F3C6A0" });
  s += sfxPop(t, START[10] + 0.05, 470, 640, -6, "БУМ", 100, "#fff", 0.9) + sfxPop(t, tB + 0.2, 700, 880, 8, "ЧПОК", 70, "#fff", 0.7);
  return s;
};

// 12. День 27: космос
SHOTS[11] = (t) => {
  const tSp = wt(11, "спорят"), tYa = wt(11, "это", 1);
  let s = `<rect width="${W}" height="${H}" fill="#1B1F4A"/>`;
  for (let i = 0; i < 70; i++) s += `<circle cx="${rnd(i) * W}" cy="${rnd(i + 99) * 1400 + 100}" r="${1.5 + rnd(i + 7) * 3}" fill="#fff" opacity="${0.4 + 0.6 * Math.abs(Math.sin(t * 2 + i))}"/>`;
  const ex = 540, ey = 930, er = 300;
  s += `<circle cx="${ex}" cy="${ey}" r="${er}" fill="#4FA3E8" stroke="${O}" stroke-width="${SW}"/>
    <clipPath id="ec"><circle cx="${ex}" cy="${ey}" r="${er - 3}"/></clipPath><g clip-path="url(#ec)">
    <path d="M300 760 Q380 700 470 760 Q520 820 460 880 Q380 900 330 850 Z M560 900 Q660 850 760 920 Q800 1040 700 1100 Q600 1080 580 1000 Z M340 1000 Q420 980 450 1060 Q420 1150 340 1120 Z" fill="#6CCB7A" stroke="${O}" stroke-width="5"/></g>`;
  const shout = t >= tYa;
  s += hero({ x: ex, y: ey - er + 12, s: 0.24, build: "giant", brows: shout ? "angry" : "neutral", mouth: shout ? "shout" : "smile", cowlick: "up" }).svg;
  // облака
  const blow = shout ? easeOut((t - tYa) / 0.8) : 0;
  [[400, 760], [700, 820], [620, 1080], [420, 1000]].forEach(([cx, cy], i) => {
    const dx = (cx - ex) * blow * 1.6, dy = (cy - (ey - er)) * blow * 1.2;
    s += `<g opacity="${1 - blow}" transform="translate(${dx},${dy})">${[[0, 0, 30], [30, 8, 24], [-28, 8, 22]].map(([a, b, r]) => `<circle cx="${cx + a}" cy="${cy + b}" r="${r}" fill="#fff"/>`).join("")}</g>`;
  });
  if (shout) for (let i = 0; i < 4; i++) {
    const v = (t - tYa - i * 0.15) / 1.1;
    if (v > 0 && v < 1) s += `<circle cx="${ex}" cy="${ey - er + 0}" r="${40 + v * 720}" fill="none" stroke="#fff" stroke-width="${14 * (1 - v) + 3}" opacity="${1 - v}"/>`;
  }
  // учёные
  s += person({ x: 190, y: 1160, s: 0.5, coat: true, glasses: true, body: "#5B8DEF", faceType: t >= tYa ? "shock" : "calm" }) + person({ x: 890, y: 1160, s: 0.5, coat: true, glasses: true, body: "#E8607A", hair: "#C0C0C0", faceType: t >= tYa ? "shock" : "calm" });
  const bubble = (x, y, txt, k) => at(x, y, k, `<g transform="translate(${x},${y})"><rect x="-130" y="-55" width="260" height="110" rx="40" fill="#fff" stroke="${O}" stroke-width="${SW}"/><path d="M-20 52 L-40 100 L20 54" fill="#fff" stroke="${O}" stroke-width="${SW}" stroke-linejoin="round"/>${T(0, 18, txt, 48)}</g>`);
  if (t < tYa) s += bubble(220, 830, "ГОРА?", pop(t, tSp)) + bubble(850, 830, "ЧЕЛОВЕК?", pop(t, tSp + 0.5));
  s += sfxPop(t, tYa + 0.05, 790, 620, 8, "ЭТО Я!", 100, YEL, 1.4);
  return s;
};

// 13. День 30: сцена конкурса → вспышка
SHOTS[12] = (t) => {
  const tN = wt(12, "напрягаешься"), tP = wt(12, "просыпаешься");
  let s = `<rect width="${W}" height="${H}" fill="#2A1F45"/>
    <polygon points="200,0 360,0 700,1150 -150,1150" fill="url(#spot)" opacity=".55"/><polygon points="720,0 880,0 1230,1150 380,1150" fill="url(#spot)" opacity=".55"/>
    <ellipse cx="540" cy="1110" rx="480" ry="70" fill="#4A3A70" stroke="${O}" stroke-width="${SW}"/>`;
  const tense = t >= tN ? clamp((t - tN) / Math.max(0.3, tP - tN)) : 0;
  const j = tense * Math.sin(t * 80) * 4;
  if (tense > 0) s += `<circle cx="540" cy="800" r="${260 + tense * 120}" fill="${YEL}" opacity="${0.25 * tense}" filter="url(#glow)"/>`;
  s += G(`translate(${j},0)`, hero({ x: 540, y: 1100, s: 0.5, build: "giant", pose: "flex", brows: "angry", mouth: tense > 0 ? "teeth" : "grin", cowlick: "up" }).svg);
  s += `${R(100, 1120, 880, 60, "#6B4A38", 6)}`;
  [250, 540, 830].forEach((x, i) => { s += person({ x, y: 1185, s: 0.42, body: ["#5B8DEF", "#3FB27F", "#E8607A"][i], faceType: "shock", holding: "card", cardText: "10" }); });
  s += `${R(100, 1130, 880, 70, "#8B5A3C", 6)}${T(540, 1180, "ГЛАВНЫЙ КОНКУРС ПЛАНЕТЫ", 34, "#FFE9C7")}`;
  if (t >= tP) s += `<rect width="${W}" height="${H}" fill="#fff" opacity="${easeOut((t - tP) / 0.25)}"/>`;
  return s;
};

// 14. Твист: мама и мука
SHOTS[13] = (t, u) => {
  const tM = wt(13, "мама"), tMu = wt(13, "муку"), tNu = wt(13, "ну");
  const nu = t >= tNu;
  let s = hero({ x: 320, y: 1150, s: 0.86, pose: "shaker", eyes: nu ? "closed" : "sleepy", brows: nu ? "sad" : "raised", mouth: "flat", mustache: true, cowlick: "down" }).svg;
  if (t >= tM) { const k = easeOutBack((t - tM) / 0.5); s += mom({ x: lerp(1300, 770, k), y: 1150, s: 0.9, pose: "jar", jarSticker: pop(t, tMu) }); }
  s += sfxPop(t, tMu + 0.2, 560, 790, -8, "?!", 110, "#fff", 1.4) + sfxPop(t, tNu + 0.1, 330, 600, 0, "...", 110, "#fff", 1.6);
  const fl = 1 - clamp(u / 0.5);
  if (fl > 0) s += `<rect width="${W}" height="${H}" fill="#fff" opacity="${fl}"/>`;
  return s;
};

// 15. Вопрос
SHOTS[14] = (t, u) => {
  let s = hero({ x: 300, y: 1150, s: 0.8, pose: "think", eyes: "normal", look: 1, brows: "raised", mouth: "flat", cowlick: "spiral" }).svg;
  s += C(470, 640, 18, "#fff") + C(530, 590, 26, "#fff");
  s += at(760, 640, pop(t, START[14] + 0.2), `${C(760, 640, 190, "#fff")}`);
  const icons = [
    `${C(700, 640, 40, RED)}${C(820, 640, 40, RED)}<circle cx="700" cy="640" r="16" fill="#fff"/><circle cx="820" cy="640" r="16" fill="#fff"/>`,
    `${R(700, 540, 120, 200, "#F4F7FB", 14)}<line x1="700" y1="610" x2="820" y2="610" stroke="${O}" stroke-width="5"/>`,
    dog(760, 720, 0.9, "#C98A5A", u),
    T(760, 680, "???", 110, RED),
  ];
  if (u > 0.4) s += icons[Math.floor((u - 0.4) / 0.6) % icons.length];
  s += at(540, 1510, pop(t, START[14] + 0.5), `<g transform="translate(540,1510)"><rect x="-330" y="-55" width="660" height="110" rx="55" fill="${YEL}" stroke="${O}" stroke-width="${SW}"/>${T(0, 20, "ПИШИ В КОММЕНТЫ ↓", 52)}</g>`);
  return s;
};

// 16. Заставка «Подпишись»
SHOTS[15] = (t, u) => {
  const b = Math.abs(Math.sin(u * 5)) * 18;
  let s = `${T(520, 370, "ПОДПИШИСЬ,", 92, "#fff", "Oswald", 700, "middle", `stroke="${O}" stroke-width="16" paint-order="stroke"`)}
    ${T(520, 460, "ЧТОБЫ НЕ ПРОПУСТИТЬ", 70, "#fff", "Oswald", 700, "middle", `stroke="${O}" stroke-width="14" paint-order="stroke"`)}`;
  const pk = 1 + 0.05 * Math.sin(u * 7);
  s += at(520, 580, pop(t, START[15] + 0.1) * pk, `<rect x="230" y="520" width="580" height="120" rx="60" fill="${RED}" stroke="${O}" stroke-width="${SW + 2}"/>${T(520, 602, "ПОДПИСАТЬСЯ", 62, "#fff")}`);
  s += G(`translate(0,${-b})`, hero({ x: 540, y: 1200, s: 0.6, pose: "wave", eyes: "normal", brows: "proud", mouth: "grin", cowlick: "up" }).svg);
  return s;
};

// ---------- звуки (для микса) ----------
const SFX = [];
{
  const add = (t, k, v = 1) => SFX.push({ t: +t.toFixed(3), k, v });
  for (let i = 1; i < NP - 1; i++) if (DAY[i] !== DAY[i - 1]) add(START[i], "swish", 0.7);
  ACH.forEach((a) => add(a.t, "ding"));
  add(wt(0, "дрыщ"), "pop"); add(wt(0, "скалой"), "pop"); add(wt(0, "наверное") + 0.4, "pff");
  add(START[1] + 0.2, "bul"); add(wt(1, "двадцать") + 0.1, "bul"); add(wt(1, "бог"), "ding", 0.7); add(wt(1, "фоткаешь"), "click"); add(wt(1, "бицепс"), "pop", 0.7);
  add(START[2] + 0.3, "beep"); add(wt(2, "банка"), "swish"); add(wt(2, "кошелек"), "flutter");
  add(wt(3, "минус"), "beep"); add(wt(3, "пресс"), "pop"); add(wt(3, "это"), "bloop");
  for (let i = 0; i < 4; i++) add(wt(4, "собаки") + i * 0.25, "pop", 0.6);
  for (let i = 0; i < 3; i++) add(wt(5, "правой", 1) + 0.35 + i * 0.45, "pop");
  add(wt(5, "левой") + 0.6, "strain");
  ["кровь", "протеин", "вкус"].forEach((w) => add(wt(6, w), "tick", 0.8)); add(wt(6, "обнаружено") + 0.45, "stamp");
  add(wt(7, "холодильник", 1), "crunch"); add(wt(7, "мама") + 0.3, "pop", 0.6); add(wt(7, "боится"), "tremble");
  add(wt(8, "ударили"), "laser"); add(wt(8, "испарился"), "puff"); add(wt(8, "пекарня") + 0.4, "pop"); add(wt(8, "закрылась") - 0.2, "thud");
  add(wt(9, "бесплатно"), "cash"); add(wt(9, "навсегда"), "pop"); add(wt(9, "ванили"), "pop", 0.7);
  add(START[10] + 0.05, "boom"); add(wt(10, "банки") + 0.2, "pop");
  add(START[11], "whoosh"); add(wt(11, "спорят"), "pop", 0.6); add(wt(11, "спорят") + 0.5, "pop", 0.6); add(wt(11, "это", 1), "boom", 1.2);
  add(wt(12, "напрягаешься"), "riser"); add(wt(12, "просыпаешься"), "flash");
  add(wt(13, "мама"), "whoosh", 0.6); add(wt(13, "муку"), "pop"); add(wt(13, "муку") + 0.2, "huh"); add(wt(13, "ну"), "pff");
  add(START[14] + 0.2, "pop"); add(START[14] + 0.5, "pop", 0.7);
  add(START[15] + 0.1, "ding");
  SFX.sort((a, b) => a.t - b.t);
}

// ---------- кадр ----------
function frame(t) {
  const si = Math.max(0, START.findIndex((s, i) => t >= s && t < END[i]) === -1 ? NP - 1 : START.findIndex((s, i) => t >= s && t < END[i]));
  const u = t - START[si], d = END[si] - START[si];
  const bg = COL[si] ? bgMix(COL[si], si !== 11 && si !== 12) : "";
  let scene = bg + SHOTS[si](t, u, d);
  // камера: плавный наезд + толчки
  const k = 1 + 0.05 * easeInOut(u / d);
  let sx = 0, sy = 0;
  for (const [ts, a] of SHAKES) { const v = t - ts; if (v >= 0 && v < 0.5) { const e = a * Math.exp(-v * 9); sx += e * Math.sin(v * 70); sy += e * Math.cos(v * 55); } }
  const boil = Math.floor(t * 8) % 3;
  scene = `<g filter="url(#wob${boil})"><g transform="translate(${sx},${sy}) translate(540,860) scale(${k}) translate(-540,-860)">${scene}</g></g>`;
  let hud = "";
  if (DAY[si]) {
    const extra = si === 13 ? `<g transform="translate(205,-60) rotate(8)"><rect x="-58" y="-34" width="116" height="68" rx="10" fill="#FFF6D8" stroke="${O}" stroke-width="4"/>${T(0, 22, "30", 54, O, "Rubik", 900, "middle", 'opacity=".6"')}<path d="M-44 -20 L44 22 M44 -20 L-44 22" stroke="${RED}" stroke-width="8" stroke-linecap="round"/></g>` : "";
    hud += dayCard(DAY[si], t, si, extra) + weight(t, si);
  }
  hud += achievement(t) + subtitles(t);
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">${DEFS}${scene}${hud}</svg>`;
}
window.TOTAL = TOTAL; window.SFX = SFX; window.START = START;
window.renderFrame = (t) => { document.getElementById("root").innerHTML = frame(t); };
