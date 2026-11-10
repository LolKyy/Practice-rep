// «GTA 6 перенесли» — неоновый стиль (закат, пальмы, игровой интерфейс). Без озвучки: текст на экране.
// frame(t) → SVG-строка 1080×1920. Используется и в Remotion (Gta6.tsx), и в превью через Playwright.
export const W = 1080, H = 1920, FPS = 30;
const O = "#12081F", PINK = "#FF3BD4", CYAN = "#29F0FF", YEL = "#FFE14D", RED = "#FF3B5C", ORG = "#FF9A3C", SW = 6;
const SKINS = ["#F3C6A0", "#E8B48F", "#C98A5A", "#F7D2B0", "#8B5A3C"];
const SHIRTS = [PINK, CYAN, YEL, ORG, "#8E7CC3", "#3FB27F", "#5B8DEF", "#FF6F61"];

// ---------- утилиты ----------
const clamp = (x, a = 0, b = 1) => Math.max(a, Math.min(b, x));
const lerp = (a, b, k) => a + (b - a) * k;
const easeOut = (x) => 1 - Math.pow(1 - clamp(x), 3);
const easeInOut = (x) => { x = clamp(x); return x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2; };
const easeOutBack = (x) => { x = clamp(x); const c = 1.6; return 1 + (c + 1) * Math.pow(x - 1, 3) + c * Math.pow(x - 1, 2); };
const pop = (t, t0, d = 0.4) => { const x = (t - t0) / d; if (x <= 0) return 0; if (x >= 1.6) return 1; return 1 - Math.exp(-5 * x) * Math.cos(9 * x); };
const rnd = (i) => { const x = Math.sin(i * 127.1 + 311.7) * 43758.5453; return x - Math.floor(x); };
const at = (cx, cy, k, c) => k <= 0.001 ? "" : `<g transform="translate(${cx},${cy}) scale(${k}) translate(${-cx},${-cy})">${c}</g>`;
const R = (x, y, w, h, fill, rx = 0, extra = "") => `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="${rx}" fill="${fill}" stroke="${O}" stroke-width="${SW}" ${extra}/>`;
const C = (x, y, r, fill, extra = "") => `<circle cx="${x}" cy="${y}" r="${r}" fill="${fill}" stroke="${O}" stroke-width="${SW}" ${extra}/>`;
const T = (x, y, txt, size, fill = "#fff", font = "Russo One", anchor = "middle", extra = "") =>
  `<text x="${x}" y="${y}" text-anchor="${anchor}" font-family="${font}" font-size="${size}" fill="${fill}" ${extra}>${txt}</text>`;
const TS = (x, y, txt, size, fill = "#fff", font = "Russo One", sw = 14) => T(x, y, txt, size, fill, font, "middle", `stroke="${O}" stroke-width="${sw}" stroke-linejoin="round" paint-order="stroke"`);
const neon = (x, y, txt, size, col) => `<text x="${x}" y="${y}" text-anchor="middle" font-family="Russo One" font-size="${size}" fill="${col}" filter="url(#glow)" opacity=".9">${txt}</text>${T(x, y, txt, size, "#fff")}`;

// ---------- фон: неоновый закат ----------
function sunset(t, dim = 0) {
  let s = `<rect width="${W}" height="${H}" fill="url(#sky)"/>`;
  s += `<g clip-path="url(#sunClip)"><circle cx="540" cy="900" r="300" fill="url(#sun)"/></g>`;
  for (let i = 0; i < 6; i++) s += `<rect x="200" y="${905 + i * 34}" width="680" height="${6 + i * 3}" fill="#2B1055"/>`;
  s += `<rect y="1100" width="${W}" height="820" fill="#1A0B33"/>`;
  for (let i = -10; i <= 10; i++) s += `<line x1="540" y1="1100" x2="${540 + i * 260}" y2="1920" stroke="${PINK}" stroke-width="3" opacity=".55"/>`;
  for (let i = 0; i < 9; i++) { const y = 1100 + Math.pow((i + ((t * 0.6) % 1)) / 9, 2) * 820; s += `<line x1="0" y1="${y}" x2="${W}" y2="${y}" stroke="${PINK}" stroke-width="3" opacity=".55"/>`; }
  s += palm(110, 1110, 1.1) + palm(970, 1110, 0.95, true);
  if (dim) s += `<rect width="${W}" height="${H}" fill="${O}" opacity="${dim}"/>`;
  return s;
}
function palm(x, y, s = 1, flip = false) {
  const leaves = [-70, -35, 0, 30, 65, 100].map((a) => `<path d="M0 -420 Q${Math.cos(((a - 90) * Math.PI) / 180) * 150} ${-420 + Math.sin(((a - 90) * Math.PI) / 180) * 150 - 40} ${Math.cos(((a - 90) * Math.PI) / 180) * 260} ${-420 + Math.sin(((a - 90) * Math.PI) / 180) * 260 + 60}" stroke="#12081F" stroke-width="26" fill="none" stroke-linecap="round"/>`).join("");
  return `<g transform="translate(${x},${y}) scale(${flip ? -s : s},${s})"><path d="M-14 0 Q-30 -220 0 -420 L14 -420 Q-6 -220 14 0 Z" fill="#12081F"/>${leaves}</g>`;
}
const DEFS = `<defs>
  <linearGradient id="sky" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#1A0B33"/><stop offset=".35" stop-color="#5B1A7A"/><stop offset=".55" stop-color="#E0457B"/><stop offset=".6" stop-color="#FF9A3C"/></linearGradient>
  <linearGradient id="sun" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#FFE14D"/><stop offset="1" stop-color="#FF3BD4"/></linearGradient>
  <clipPath id="sunClip"><rect x="0" y="0" width="${W}" height="1100"/></clipPath>
  <filter id="glow" x="-30%" y="-30%" width="160%" height="160%"><feGaussianBlur stdDeviation="9"/></filter>
  <radialGradient id="vig" cx="50%" cy="45%" r="70%"><stop offset=".6" stop-color="#000" stop-opacity="0"/><stop offset="1" stop-color="#000" stop-opacity=".6"/></radialGradient>
</defs>`;

// ---------- люди ----------
// геймер в наушниках; back = вид со спины
function gamer({ x, y, s = 1, back = false, face = "calm", shirt = PINK, skin = SKINS[0], hair = "#2B1B12", crazy = 0 }) {
  let g = `<path d="M-120 0 L-110 -230 Q0 -270 110 -230 L120 0 Z" fill="${shirt}" stroke="${O}" stroke-width="${SW}" stroke-linejoin="round"/>`;
  g += `<path d="M-40 -250 Q0 -200 40 -250" fill="none" stroke="${O}" stroke-width="5" opacity=".5"/>`;
  g += C(0, -330, 95, skin);
  if (back) g += `<path d="M-95 -330 Q-100 -440 0 -430 Q100 -440 95 -330 Q60 -300 0 -300 Q-60 -300 -95 -330 Z" fill="${hair}" stroke="${O}" stroke-width="${SW}"/>`;
  else {
    const spike = crazy ? [...Array(7)].map((_, i) => `<path d="M${-80 + i * 27} -410 l${-10 + rnd(i) * 20} ${-30 - crazy * 40 * rnd(i + 3)} l20 30 Z" fill="${hair}" stroke="${O}" stroke-width="4"/>`).join("") : "";
    g += spike + `<path d="M-95 -350 Q-90 -440 0 -432 Q90 -440 95 -350 Q50 -390 0 -385 Q-50 -390 -95 -350 Z" fill="${hair}" stroke="${O}" stroke-width="${SW}"/>`;
    for (const sg of [-1, 1]) {
      const ex = sg * 34, ey = -335;
      if (face === "shock") g += `${C(ex, ey, 22, "#fff")}<circle cx="${ex}" cy="${ey}" r="5" fill="${O}"/>`;
      else if (face === "dead") g += `<path d="M${ex - 14} ${ey - 14} l28 28 M${ex + 14} ${ey - 14} l-28 28" stroke="${O}" stroke-width="7"/>`;
      else if (face === "crazy") g += `${C(ex, ey, 24 + sg * 6, "#fff")}<circle cx="${ex + sg * 4}" cy="${ey + 3}" r="${8 - sg * 2}" fill="${O}"/>`;
      else g += `${C(ex, ey, 20, "#fff")}<circle cx="${ex}" cy="${ey + 4}" r="7" fill="${O}"/><path d="M${ex - 20} ${ey} A20 20 0 0 1 ${ex + 20} ${ey} Z" fill="${skin}" stroke="${O}" stroke-width="4"/>`;
      if (crazy > 0.5) g += `<path d="M${ex - 18} ${ey + 26} q18 10 36 0" stroke="#7A3B6E" stroke-width="5" fill="none"/>`;
    }
    const my = -280;
    g += face === "shock" ? `<ellipse cx="0" cy="${my}" rx="16" ry="20" fill="#5A1A2A" stroke="${O}" stroke-width="5"/>`
      : face === "crazy" ? `<path d="M-40 ${my - 6} Q0 ${my + 30} 40 ${my - 6} Z" fill="#fff" stroke="${O}" stroke-width="5"/>`
      : face === "sad" ? `<path d="M-26 ${my + 8} Q0 ${my - 14} 26 ${my + 8}" stroke="${O}" stroke-width="6" fill="none" stroke-linecap="round"/>`
      : `<path d="M-22 ${my} L22 ${my}" stroke="${O}" stroke-width="6" stroke-linecap="round"/>`;
  }
  g += `<path d="M-100 -360 Q0 -480 100 -360" fill="none" stroke="#2E2A44" stroke-width="16"/>${R(-118, -380, 34, 70, "#2E2A44", 12)}${R(84, -380, 34, 70, "#2E2A44", 12)}`;
  return `<g transform="translate(${x},${y}) scale(${s})">${g}</g>`;
}
// маленький человечек толпы
function tiny(x, y, s, i, t = 0, kneel = 0, sign = "") {
  const sk = SKINS[i % SKINS.length], sh = SHIRTS[i % SHIRTS.length];
  const bob = Math.sin(t * 6 + i) * 6 * (1 - kneel);
  let g = `<path d="M-30 ${kneel * 40} L-26 -70 Q0 -84 26 -70 L30 ${kneel * 40} Z" fill="${sh}" stroke="${O}" stroke-width="4"/>${C(0, -100, 28, sk, 'stroke-width="4"')}<circle cx="-9" cy="-102" r="4" fill="${O}"/><circle cx="9" cy="-102" r="4" fill="${O}"/>`;
  if (sign) g += `<line x1="26" y1="-60" x2="40" y2="-190" stroke="${O}" stroke-width="5"/><g transform="translate(40,-215) rotate(${-6 + (i % 3) * 6})">${R(-80, -36, 160, 64, "#fff", 4, 'stroke-width="4"')}${T(0, 10, sign, 22, O, "Russo One")}</g>`;
  return `<g transform="translate(${x},${y + bob + kneel * 30}) scale(${s})">${g}</g>`;
}

// ---------- предметы ----------
const monitor = (x, y, s, inner) => `<g transform="translate(${x},${y}) scale(${s})">${R(-200, -140, 400, 260, "#2E2A44", 14)}<rect x="-180" y="-120" width="360" height="220" rx="6" fill="#0E0A22"/>${inner}${R(-30, 120, 60, 50, "#2E2A44")}${R(-100, 166, 200, 20, "#2E2A44", 8)}</g>`;
function notif(x, y, k, title, body) {
  return at(x, y, k, `<g transform="translate(${x},${y})">${R(-400, -110, 800, 220, "#fff", 28)}${C(-320, -10, 46, RED)}${T(-320, 10, "!", 56, "#fff")}
    ${T(-250, -30, title, 40, O, "Russo One", "start")}${T(-250, 30, body, 34, "#5A4A6A", "Rubik", "start", 'font-weight="800"')}</g>`);
}
function post(x, y, txt, col, rot) {
  return `<g transform="translate(${x},${y}) rotate(${rot})">${R(-150, -45, 300, 90, "#fff", 18, 'stroke-width="4"')}${C(-115, 0, 22, col, 'stroke-width="3"')}${T(15, 12, txt, 26, O, "Russo One")}</g>`;
}
function bubble(x, y, txt, size = 44, tail = -1, k = 1) {
  if (k <= 0) return "";
  const w = txt.length * size * 0.62 + 70;
  return at(x, y, k, `<g transform="translate(${x},${y})"><rect x="${-w / 2}" y="-60" width="${w}" height="120" rx="44" fill="#fff" stroke="${O}" stroke-width="${SW}"/><path d="M${tail * 40} 57 L${tail * 70} 112 L${tail * -10} 59" fill="#fff" stroke="${O}" stroke-width="${SW}" stroke-linejoin="round"/>${T(0, 16, txt, size, O)}</g>`);
}
function building(shutter = 0) {
  let s = `<g>${R(240, 560, 600, 560, "#2B1B4A", 6)}`;
  for (let r = 0; r < 4; r++) for (let c = 0; c < 4; c++) s += `<rect x="${280 + c * 140}" y="${620 + r * 110}" width="100" height="70" fill="${(r + c) % 3 ? "#FFD27A" : "#5BC0EB"}" stroke="${O}" stroke-width="4"/>`;
  if (shutter > 0) for (let r = 0; r < 4; r++) s += `<rect x="270" y="${610 + r * 110}" width="540" height="${90 * shutter}" fill="#6B6A80" stroke="${O}" stroke-width="4"/>${[...Array(Math.floor(shutter * 5))].map((_, i) => `<line x1="270" y1="${614 + r * 110 + i * 17}" x2="810" y2="${614 + r * 110 + i * 17}" stroke="${O}" stroke-width="2"/>`).join("")}`;
  s += `${R(470, 1000, 140, 120, "#12081F")}${R(330, 520, 420, 70, "#12081F", 10)}${neon(540, 572, "ОФИС ROCKSTAR", 40, PINK)}</g>`;
  return s;
}
function smoke(x, y, t, n = 5) {
  let s = "";
  for (let i = 0; i < n; i++) { const ph = (t * 0.7 + i / n) % 1; s += `<circle cx="${x + Math.sin(i * 3 + t) * 30}" cy="${y - ph * 260}" r="${20 + ph * 50}" fill="#B9B4C7" opacity="${0.7 * (1 - ph)}"/>`; }
  return s;
}
// звёзды розыска (интерфейс)
function wanted(n, t) {
  let s = "";
  for (let i = 0; i < 5; i++) {
    const x = 640 + i * 60, on = i < n, blink = on && n === 5 ? 0.6 + 0.4 * Math.sin(t * 10) : 1;
    const p = []; for (let k = 0; k < 10; k++) { const a = -Math.PI / 2 + (k * Math.PI) / 5, r = k % 2 ? 11 : 26; p.push(`${x + r * Math.cos(a)},${300 + r * Math.sin(a)}`); }
    s += `<polygon points="${p.join(" ")}" fill="${on ? YEL : "#3A2E55"}" stroke="${O}" stroke-width="4" opacity="${blink}"/>`;
  }
  return s;
}

// ---------- таймлайн ----------
// подписи на экране (без голоса): [start, end, текст, ключевое слово]
const CAPS = [
  [0.3, 3.2, "GTA 6 ПЕРЕНЕСЛИ!", "ПЕРЕНЕСЛИ!"],
  [3.2, 6.6, "А что будет, если игра снова не выйдет 19 ноября?", "19 ноября?"],
  [10.6, 14.5, "Интернет начинает плавиться", "плавиться"],
  [17.2, 21, "У офиса — один фанат…", "один"],
  [21, 24, "…потом десять…", "десять"],
  [24, 27.5, "…потом армия", "армия"],
  [43.5, 47.5, "Но что будет на самом деле?", "на самом деле?"],
  [47.5, 52.5, "Игроки массово вернутся в GTA Online", "GTA Online"],
  [52.5, 58.5, "Акции издателя полетят вниз — после переноса GTA 5 в 2013 году бумаги Take-Two теряли 6–12% за день", "6–12%"],
  [58.5, 63.5, "Другие игры ринутся занимать освободившийся ноябрь", "ноябрь"],
  [63.5, 69.5, "Третий перенос — это уже не «полируем», а «а выйдет ли вообще?»", "вообще?"],
  [73.5, 78.5, "А что сделаешь ТЫ, если GTA 6 перенесут?", "ТЫ"],
];
export const TOTAL = 82;
const SC = [0, 6.6, 10.6, 17.2, 31.5, 43.5, 47.5, 69.5, 73.5, 78.5, TOTAL]; // границы сцен
const SHAKES = [[6.8, 14], [16.3, 10], [28.5, 12], [41.5, 12], [64, 10]];

function wrapText(txt, max = 16) {
  const words = txt.split(" "), lines = [];
  let cur = "";
  for (const w of words) { if ((cur + " " + w).trim().length > max && cur) { lines.push(cur); cur = w; } else cur = (cur + " " + w).trim(); }
  if (cur) lines.push(cur);
  return lines;
}
function caption(t) {
  const c = CAPS.find(([a, b]) => t >= a && t < b);
  if (!c) return "";
  const [a, , txt, key] = c;
  const lines = wrapText(txt, txt.length > 60 ? 20 : 16);
  const size = lines.length > 3 ? 72 : 96, lh = size * 1.08, y0 = 1330 - ((lines.length - 1) * lh) / 2;
  const k = 0.85 + 0.15 * easeOutBack((t - a) / 0.2);
  const keyWords = key.split(" ");
  const out = lines.map((ln, i) => `<text x="520" y="${y0 + i * lh}" text-anchor="middle" font-family="Oswald" font-weight="700" font-size="${size}" stroke="${O}" stroke-width="16" stroke-linejoin="round" paint-order="stroke">${ln.split(" ").map((w) => `<tspan fill="${keyWords.includes(w) ? YEL : "#fff"}">${w.toUpperCase()}</tspan>`).join(" ")}</text>`).join("");
  return at(520, 1320, k, out);
}
function dateCard(t, txt) {
  return `<g transform="translate(540,330) rotate(-2)">${R(-250, -70, 500, 140, "#fff", 18)}${T(0, 30, txt, 80, RED, "Russo One")}</g>`;
}

// ---------- сцены ----------
function s1(t) { // 0–6.6: 19 ноября, 23:59, обновляет — перенос
  let s = sunset(t, 0.55) + `<g transform="translate(540,1110)">${R(-420, -20, 840, 40, "#2E2A44", 8)}</g>`;
  const tN = 2.0;
  const scr = t < tN ? `${T(0, -10, "ЗАГРУЗКА…", 40, CYAN, "Russo One")}<rect x="-140" y="30" width="${280 * ((t * 0.6) % 1)}" height="16" fill="${CYAN}"/>` : `${T(0, -20, "ПЕРЕНЕСЕНА", 46, RED, "Russo One")}${T(0, 40, "GTA VI", 40, "#fff")}`;
  s += monitor(540, 860, 1.3, scr) + gamer({ x: 540, y: 1300, s: 1.05, back: true, shirt: PINK });
  s += notif(540, 600, pop(t, tN), "ОФИЦИАЛЬНО", "GTA VI перенесена…");
  const clk = t < 1.2 ? "23:59" : "00:00";
  return { scene: s, hud: dateCard(t, "19.11 · " + clk) };
}
function s2(t) { // 6.6–10.6: «Нет…» + клоны
  let s = sunset(t, 0.55);
  const u = t - 6.6;
  for (let i = 0; i < 8; i++) { const k = pop(t, 7.6 + i * 0.25); if (k > 0) s += at(140 + (i % 4) * 270, 1000, k, gamer({ x: 140 + (i % 4) * 270, y: 1000 + Math.floor(i / 4) * 80, s: 0.45, face: "shock", shirt: SHIRTS[i] })); }
  s += gamer({ x: 540, y: 1500, s: 1.2, face: "sad", shirt: PINK });
  s += bubble(540, 620, "НЕТ…", 64, 1, pop(t, 7.0));
  return { scene: s, hud: "" };
}
function s3(t) { // 10.6–17.2: интернет плавится, сервер дымится
  let s = sunset(t, 0.7);
  const u = t - 10.6;
  const msgs = ["ПЕРЕНОС???", "GTA 6 DELAYED", "19 НОЯБРЯ???", "BRO…", "ROCKSTAR WHY", "НЕ ВЕРЮ", "ОПЯТЬ?!", "ВЕРНИТЕ 2013"];
  const n = Math.min(60, Math.floor(Math.pow(2, u * 1.6)));
  for (let i = 0; i < n; i++) s += post(80 + rnd(i) * 920, 560 + rnd(i + 50) * 560, msgs[i % msgs.length], SHIRTS[i % 8], -12 + rnd(i + 9) * 24);
  if (u > 3) { s += `<g transform="translate(540,880)">${R(-140, -260, 280, 520, "#2E2A44", 10)}${[...Array(6)].map((_, i) => `${R(-110, -230 + i * 80, 220, 50, "#1B1F3A", 6)}<circle cx="80" cy="${-205 + i * 80}" r="8" fill="${(Math.floor(t * 8) + i) % 2 ? RED : "#3FB27F"}"/>`).join("")}</g>` + smoke(540, 620, t, 7); }
  const memes = Math.min(10000000, Math.round(Math.pow(10, 1 + u * 1.1)));
  const hud = `<g transform="translate(540,330)">${R(-330, -60, 660, 120, O, 60, `stroke="${PINK}"`)}${T(-300, 16, "МЕМОВ:", 44, CYAN, "Russo One", "start")}${T(300, 18, memes.toLocaleString("ru-RU"), 50, YEL, "Russo One", "end")}</g>`;
  return { scene: s, hud };
}
function s4(t) { // 17.2–31.5: офис, толпа растёт, камера отъезжает, ставни, крики
  const u = t - 17.2;
  const zoom = u < 4 ? 1.35 : u < 10 ? lerp(1.35, 0.72, easeInOut((u - 4) / 6)) : 0.72;
  let world = building(clamp((t - 28) / 1.2));
  const count = u < 3.8 ? 1 : u < 6.8 ? 10 : 140;
  const signs = ["ОТДАВАЙТЕ GTA 6", "МЫ ЖДАЛИ 13 ЛЕТ", "ВЫХОДИ, ROCKSTAR", "19.11 !!!"];
  for (let i = 0; i < count; i++) {
    const row = Math.floor(i / 14), col = i % 14;
    const x = i === 0 ? 540 : 540 + (col - 6.5) * 120 + (row % 2) * 60, y = 1180 + row * 70;
    world += tiny(x, y, 1 - row * 0.03, i, t, 0, i % 9 === 3 && row < 4 ? signs[i % 4] : "");
  }
  let s = sunset(t, 0.35) + `<g transform="translate(540,1100) scale(${zoom}) translate(-540,-1100)">${world}</g>`;
  s += bubble(330, 640, "РЕБЯТ, СПОКОЙНО! ДАВАЙТЕ ПРОСТО ПОГОВОРИМ!", 30, 1, t >= 24.6 && t < 27 ? pop(t, 24.6) : 0);
  if (t >= 27 && t < 28.2) s += at(540, 700, pop(t, 27), TS(540, 720, "ДА!!!", 150, YEL));
  if (t >= 28.5) s += bubble(540, 520, "ОТКЛЮЧАЙТЕ ИНТЕРНЕТ!", 44, 1, t < 30 ? pop(t, 28.5) : 0) + bubble(540, 520, "СЕРВЕРЫ СОЦСЕТЕЙ НЕ СПРАВЛЯЮТСЯ!", 32, 1, pop(t, 30));
  return { scene: s, hud: `<g transform="translate(540,330)">${R(-340, -60, 680, 120, O, 60, `stroke="${CYAN}"`)}${T(-310, 16, "ФАНАТОВ:", 44, CYAN, "Russo One", "start")}${T(310, 18, count === 140 ? "12 000 000" : String(count), 50, YEL, "Russo One", "end")}</g>` };
}
function s5(t) { // 31.5–43.5: внутри офиса, «НАС 12 МИЛЛИОНОВ», жалюзи, толпа на коленях
  let s = `<rect width="${W}" height="${H}" fill="#2B1B4A"/>`;
  s += `<g transform="translate(540,760)">${R(-380, -240, 760, 420, "#5B1A7A", 10)}</g>`;
  const big = pop(t, 33);
  if (t < 41) s += at(540, 760, big, `${TS(540, 720, "НАС", 90, YEL)}${TS(540, 840, "12 МИЛЛИОНОВ", 92, YEL)}`);
  const blinds = clamp((t - 38.6) / 1.2);
  for (let i = 0; i < 10; i++) s += `<rect x="160" y="${520 + i * 42}" width="760" height="${42 * blinds}" fill="#C9C1D6" stroke="${O}" stroke-width="3"/>`;
  s += `<rect x="96" y="1080" width="888" height="40" fill="#8B5A3C" stroke="${O}" stroke-width="${SW}"/>`;
  s += gamer({ x: 330, y: 1300, s: 0.75, face: t >= 36.2 ? "sad" : "shock", shirt: "#3A3550", hair: "#555" }) + gamer({ x: 760, y: 1300, s: 0.75, face: "calm", shirt: "#2E2A44", hair: "#222" });
  if (t >= 34.2 && t < 36.4) s += bubble(330, 560, "МОЖЕТ, ВСЁ-ТАКИ ВЫПУСТИМ?", 34, -1, pop(t, 34.2));
  if (t >= 36.4 && t < 38.8) s += bubble(720, 560, "НЕТ. НУЖНО ЕЩЁ ВРЕМЕНИ.", 34, 1, pop(t, 36.4));
  if (t >= 40.8) { // снаружи: все на коленях
    let w = sunset(t, 0.35);
    for (let i = 0; i < 140; i++) { const row = Math.floor(i / 14), col = i % 14; w += tiny(540 + (col - 6.5) * 86 + (row % 2) * 43, 1150 + row * 52, 0.72, i, t, easeOut((t - 41.2) / 0.5)); }
    s = w + TS(540, 700, "…", 160, "#fff");
  }
  return { scene: s, hud: "" };
}
function s6(t) { // 43.5–47.5: «Но что будет на самом деле?»
  let s = sunset(t, 0.6) + `<g transform="translate(540,800)">${R(-340, -150, 680, 300, O, 30, `stroke="${CYAN}"`)}${neon(540 - 540, 20, "ТЕОРИЯ", 110, CYAN)}</g>`;
  return { scene: s, hud: wanted(1, t) };
}
function s7(t) { // 47.5–69.5: факты + геймер сходит с ума (мониторы множатся)
  const idx = t < 52.5 ? 0 : t < 58.5 ? 1 : t < 63.5 ? 2 : 3;
  const nMon = [3, 8, 14, 20][idx];
  let s = sunset(t, 0.6);
  for (let i = 0; i < nMon; i++) {
    const col = i % 5, row = Math.floor(i / 5);
    const inner = idx === 1 ? `<path d="M-160 -80 L-60 -60 L20 20 L160 90" stroke="${RED}" stroke-width="10" fill="none"/>` : idx === 0 ? T(0, 10, "ONLINE", 50, CYAN) : idx === 2 ? T(0, 10, "НОЯБРЬ?", 46, YEL) : T(0, 10, "???", 60, RED);
    s += monitor(160 + col * 190, 640 + row * 150, 0.42, inner);
  }
  const face = ["calm", "shock", "crazy", "crazy"][idx];
  s += gamer({ x: 540, y: 1400, s: 1.05, face, shirt: PINK, crazy: idx / 3 });
  if (idx === 1) s += `<g transform="translate(800,560)">${R(-150, -60, 300, 120, O, 20, `stroke="${RED}"`)}${T(0, 20, "TTWO ▼", 56, RED)}</g>`;
  return { scene: s, hud: wanted(Math.min(5, idx + 2), t) };
}
function s8(t) { // 69.5–73.5: спокойно — «Ну… увидимся в GTA 7»
  let s = sunset(t, 0.3) + gamer({ x: 540, y: 1460, s: 1.25, face: "calm", shirt: PINK });
  s += bubble(540, 620, "НУ… УВИДИМСЯ В GTA 7.", 52, 1, pop(t, 70.2));
  return { scene: s, hud: "" };
}
function s9(t) { // 73.5–78.5: вопрос в комменты
  let s = sunset(t, 0.45);
  for (let i = 0; i < 28; i++) s += tiny(140 + (i % 7) * 135, 1050 + Math.floor(i / 7) * 60, 0.8, i + 3, t);
  s += at(540, 1540, pop(t, 74.2), `<g transform="translate(540,1540)">${R(-330, -55, 660, 110, YEL, 55)}${T(0, 20, "ПИШИ В КОММЕНТЫ ↓", 50, O)}</g>`);
  return { scene: s, hud: "" };
}
function s10(t) { // 78.5–82: подпишись
  const u = t - 78.5, pk = 1 + 0.05 * Math.sin(u * 7);
  let s = sunset(t, 0.3) + TS(540, 520, "ПОДПИШИСЬ,", 96, "#fff", "Oswald") + TS(540, 620, "ЧТОБЫ НЕ ПРОПУСТИТЬ", 70, "#fff", "Oswald");
  s += at(540, 780, pop(t, 78.7) * pk, `${R(250, 720, 580, 120, RED, 60)}${T(540, 802, "ПОДПИСАТЬСЯ", 60, "#fff")}`);
  return { scene: s, hud: "" };
}
const SCENES = [s1, s2, s3, s4, s5, s6, s7, s8, s9, s10];

export function frame(t) {
  let si = SC.findIndex((a, i) => t >= a && t < SC[i + 1]);
  if (si < 0) si = SCENES.length - 1;
  const { scene, hud } = SCENES[si](t);
  const u = t - SC[si], d = SC[si + 1] - SC[si];
  const k = 1 + 0.04 * easeInOut(u / d);
  let sx = 0, sy = 0;
  for (const [ts, a] of SHAKES) { const v = t - ts; if (v >= 0 && v < 0.5) { const e = a * Math.exp(-v * 9); sx += e * Math.sin(v * 70); sy += e * Math.cos(v * 55); } }
  const flash = SC.includes(Math.round(t * 30) / 30) ? 0 : 0;
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">${DEFS}
    <g transform="translate(${sx},${sy}) translate(540,960) scale(${k}) translate(-540,-960)">${scene}</g>
    <rect width="${W}" height="${H}" fill="url(#vig)"/>${hud}${caption(t)}</svg>`;
}

// ---------- ЧЕРНОВИК v2: новые сцены (кадры на утверждение) ----------
// субтитры как в наших роликах: 1–3 слова, внизу по центру, ключевое слово жёлтым
function sub(words, key = -1) {
  const size = 112;
  return `<text x="520" y="1330" text-anchor="middle" font-family="Oswald" font-weight="700" font-size="${size}" stroke="${O}" stroke-width="20" stroke-linejoin="round" paint-order="stroke">${words.split(" ").map((w, i) => `<tspan fill="${i === key ? YEL : "#fff"}">${w}</tspan>`).join(" ")}</text>`;
}
const sticky = (x, y, rot, txt, col = YEL) => { const w = txt.length * 19 + 50; return `<g transform="translate(${x},${y}) rotate(${rot})">${R(-w / 2, -48, w, 96, col, 4, 'stroke-width="4"')}${T(0, 12, txt, 30, O, "Russo One")}</g>`; };
const consoleBox = (x, y, s = 1) => `<g transform="translate(${x},${y}) scale(${s})">${R(-50, -70, 100, 120, "#F4F6FB", 10, 'stroke-width="4"')}<rect x="-12" y="-60" width="24" height="100" fill="#12081F"/>${T(0, 70, "КОНСОЛЬ", 18, O, "Russo One")}</g>`;
function hudWrap(scene, hud = "") {
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">${DEFS}${scene}<rect width="${W}" height="${H}" fill="url(#vig)"/>${hud}</svg>`;
}
export const DRAFTS = {
  // 23:59, F5, чек-лист «отпуск / чипсы / девушке»
  "01_f5": () => {
    let s = sunset(0, 0.55) + monitor(540, 760, 1.5, `${T(0, -20, "ЗАГРУЗКА…", 44, CYAN)}<rect x="-140" y="20" width="200" height="16" fill="${CYAN}"/>`);
    s += sticky(170, 560, -8, "ОТПУСК ✓") + sticky(910, 600, 7, "ЧИПСЫ ✓", "#7CFFB2") + sticky(300, 1000, 5, "ДЕВУШКЕ: МЕНЯ НЕТ", PINK);
    s += `<g transform="translate(780,1010) rotate(-6)">${R(-90, -70, 180, 140, "#E9E4F5", 16)}${T(0, 26, "F5", 80, O)}</g>` + T(820, 900, "×100", 56, YEL, "Russo One");
    s += gamer({ x: 420, y: 1190, s: 0.9, back: true, shirt: PINK });
    return hudWrap(s, dateCard(0, "19.11 · 23:59") + sub("ЖМЁШЬ F5", 1));
  },
  // утро: очередь на возврат консолей
  "02_returns": () => {
    let s = sunset(0, 0.45) + `${R(560, 560, 440, 120, RED, 10)}${T(780, 640, "ВОЗВРАТ ТОВАРА", 44, "#fff")}${R(600, 700, 360, 380, "#2B1B4A", 8)}${R(560, 1000, 440, 80, "#5B1A7A", 8)}`;
    s += gamer({ x: 780, y: 1000, s: 0.55, face: "sad", shirt: "#3FB27F" }) + `<path d="M750 840 q-6 16 0 22 q6 -6 0 -22 Z" fill="#9FE3FF"/><path d="M810 840 q-6 16 0 22 q6 -6 0 -22 Z" fill="#9FE3FF"/>`;
    for (let i = 0; i < 9; i++) { const x = 470 - i * 62, y = 1150 - (i % 2) * 10; s += tiny(x, y, 1.6 - i * 0.06, i, 0) + consoleBox(x + 38, y - 120, 0.7); }
    return hudWrap(s, dateCard(0, "20.11 · 09:00") + sub("НА ВОЗВРАТ", 1));
  },
  // крупно плакаты в толпе
  "03_signs": () => {
    let s = sunset(0, 0.35);
    const signs = ["МЫ ЖДАЛИ 13 ЛЕТ", "ОТДАВАЙТЕ GTA 6", "19.11 !!!", "Я ВЗЯЛ ОТПУСК"];
    signs.forEach((txt, i) => { const x = 200 + i * 230; s += `<g transform="translate(${x},${640 + (i % 2) * 70}) rotate(${-6 + i * 4})">${R(-120, -60, 240, 120, "#fff", 6)}${(() => { const ws = txt.split(" "); const a = ws.slice(0, Math.ceil(ws.length / 2)).join(" "), b = ws.slice(Math.ceil(ws.length / 2)).join(" "); return b ? T(0, -2, a, 32, O, "Russo One") + T(0, 40, b, 32, RED, "Russo One") : T(0, 14, a, 36, O, "Russo One"); })()}</g><line x1="${x}" y1="${700 + (i % 2) * 70}" x2="${x}" y2="1000" stroke="${O}" stroke-width="10"/>`; });
    for (let i = 0; i < 4; i++) s += `<g transform="translate(${200 + i * 230},1180) scale(2.2)">${tiny(0, 0, 1, i + 2, 0).replace(/^<g transform="[^"]*">/, "<g>")}</g>`;
    return hudWrap(s, sub("13 ЛЕТ", 0));
  },
  // внутри: «бум-бум-бум», «кажется, им не понравилось»
  "04_boom": () => {
    let s = `<rect width="${W}" height="${H}" fill="#2B1B4A"/>${R(760, 560, 220, 520, "#6B4A38", 6)}${C(800, 830, 12, YEL)}`;
    [["БУМ!", 860, 620, -12], ["БУМ!", 900, 760, 8], ["БУМ!", 840, 900, -4]].forEach(([w, x, y, r]) => { s += `<g transform="translate(${x},${y}) rotate(${r})">${TS(0, 0, w, 72, YEL)}</g>`; });
    s += `${R(96, 1000, 640, 40, "#8B5A3C")}` + gamer({ x: 260, y: 1180, s: 0.72, face: "shock", shirt: "#3A3550", hair: "#555" }) + gamer({ x: 560, y: 1180, s: 0.72, face: "sad", shirt: "#2E2A44", hair: "#222" });
    s += bubble(420, 600, "КАЖЕТСЯ, ИМ НЕ ПОНРАВИЛОСЬ", 32, 1);
    return hudWrap(s, sub("БУМ. БУМ. БУМ.", 2));
  },
  // блогеры переименовывают каналы
  "05_bloggers": () => {
    let s = sunset(0, 0.55) + `<g transform="translate(540,800)">${R(-250, -380, 500, 760, "#2E2A44", 44)}<rect x="-225" y="-340" width="450" height="680" rx="24" fill="#F4F6FB"/>
      ${C(0, -230, 70, PINK)}${T(0, -210, "▶", 56, "#fff")}
      ${T(0, -110, "GTA 6 СКОРО", 44, "#8A8AA0", "Russo One")}<line x1="-150" y1="-125" x2="150" y2="-125" stroke="${RED}" stroke-width="8"/>
      ${T(0, -40, "GTA 7 СКОРО", 52, O, "Russo One")}${T(0, 20, "2,4 млн подписчиков", 30, "#8A8AA0", "Rubik", "middle", 'font-weight="800"')}
      ${R(-170, 70, 340, 80, RED, 40)}${T(0, 124, "ПЕРЕИМЕНОВАТЬ", 32, "#fff")}</g>`;
    return hudWrap(s, sub("GTA 7 СКОРО", 1));
  },
  // кредит за PS5 закончится раньше
  "06_credit": () => {
    let s = sunset(0, 0.55);
    s += `<g transform="translate(330,760) rotate(-4)">${R(-230, -170, 460, 340, "#fff", 20)}${T(0, -100, "КРЕДИТ ЗА КОНСОЛЬ", 30, O)}${T(0, -20, "последний платёж", 30, "#8A8AA0", "Rubik", "middle", 'font-weight="800"')}${T(0, 60, "МАЙ 2027", 64, "#3FB27F")}</g>`;
    s += `<g transform="translate(770,900) rotate(5)">${R(-210, -150, 420, 300, "#fff", 20)}${T(0, -70, "GTA 6", 44, O)}${T(0, 30, "выход: ???", 52, RED)}</g>`;
    s += TS(560, 1130, "VS", 90, YEL);
    return hudWrap(s, sub("КРЕДИТ РАНЬШЕ", 0));
  },
};
