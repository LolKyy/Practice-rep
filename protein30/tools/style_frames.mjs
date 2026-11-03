// Стоп-кадры для согласования стиля «Сочный флэт». SVG → PNG через Playwright.
//   node protein30/tools/style_frames.mjs
import fs from "node:fs";
import path from "node:path";
import { createRequire } from "node:module";
const require = createRequire(import.meta.url);
const { chromium } = require("playwright");

const OUT = path.join(path.dirname(new URL(import.meta.url).pathname), "..", "style_frames");
fs.mkdirSync(OUT, { recursive: true });

const W = 1080, H = 1920;
let O = "#231C35", RED = "#FF3B3B", YEL = "#FFE14D", SKIN = "#FFD9B8", SHIRT = "#FF5A3C", HAIR = "#5A3A2A";
let SW = 6;
let SUB = { font: "Oswald", weight: 700, size: 118, box: false };

// ---------- фон ----------
function bgRays(color, light) {
  const cx = 540, cy = 860, R = 2400, n = 28;
  let rays = "";
  for (let i = 0; i < n; i += 2) {
    const a1 = (i / n) * Math.PI * 2, a2 = ((i + 1) / n) * Math.PI * 2;
    rays += `<path d="M${cx} ${cy} L${cx + R * Math.cos(a1)} ${cy + R * Math.sin(a1)} L${cx + R * Math.cos(a2)} ${cy + R * Math.sin(a2)} Z" fill="${light}" opacity=".55"/>`;
  }
  return `<rect width="${W}" height="${H}" fill="${color}"/>${rays}
  <rect width="${W}" height="${H}" fill="url(#dots)" opacity=".10" mask="url(#vig)"/>
  <rect y="1160" width="${W}" height="${H - 1160}" fill="${O}" opacity=".10"/>
  <line x1="0" y1="1160" x2="${W}" y2="1160" stroke="${O}" stroke-width="${SW}" opacity=".35"/>`;
}
let bg = bgRays;
const defs = () => `<defs>
  <pattern id="dots" width="30" height="30" patternUnits="userSpaceOnUse"><circle cx="15" cy="15" r="6" fill="${O}"/></pattern>
  <radialGradient id="vg" cx="50%" cy="45%" r="75%"><stop offset="55%" stop-color="black"/><stop offset="100%" stop-color="white"/></radialGradient>
  <mask id="vig"><rect width="${W}" height="${H}" fill="url(#vg)"/></mask>
  <filter id="wob"><feTurbulence type="fractalNoise" baseFrequency="0.025" numOctaves="2" seed="4"/><feDisplacementMap in="SourceGraphic" scale="7"/></filter>
  <pattern id="ht" width="22" height="22" patternUnits="userSpaceOnUse" patternTransform="rotate(30)"><circle cx="11" cy="11" r="7" fill="#FF4FA3"/></pattern>
  <filter id="glow" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="10"/></filter>
</defs>`;

// ---------- мелкие элементы ----------
const noodle = (d, w = 14, col = SKIN) =>
  `<path d="${d}" fill="none" stroke="${O}" stroke-width="${w + SW * 2}" stroke-linecap="round" stroke-linejoin="round"/>
   <path d="${d}" fill="none" stroke="${col}" stroke-width="${w}" stroke-linecap="round" stroke-linejoin="round"/>`;
const star = (x, y, r, fill = YEL) => {
  let p = [];
  for (let i = 0; i < 10; i++) {
    const a = -Math.PI / 2 + (i * Math.PI) / 5, rr = i % 2 ? r * 0.45 : r;
    p.push(`${x + rr * Math.cos(a)},${y + rr * Math.sin(a)}`);
  }
  return `<polygon points="${p.join(" ")}" fill="${fill}" stroke="${O}" stroke-width="4" stroke-linejoin="round"/>`;
};
const shadow = (x, y, rx) => `<ellipse cx="${x}" cy="${y}" rx="${rx}" ry="${rx * 0.16}" fill="${O}" opacity=".18"/>`;
const sneaker = (x, s = 1) =>
  `<g transform="translate(${x},0) scale(${s})"><rect x="-45" y="-50" width="90" height="48" rx="22" fill="#fff" stroke="${O}" stroke-width="${SW}"/>
   <path d="M-30 -24 L28 -24" stroke="${RED}" stroke-width="8" stroke-linecap="round"/></g>`;

// лицо; cx,cy — центр головы, r — радиус
function face({ cx = 0, cy, r, eyes = "normal", brows = "neutral", mouth = "smile", mustache = false }) {
  const k = r / 150, ex = 58 * k, ey = cy - 5 * k, er = 50 * k;
  let s = "";
  for (const sgn of [-1, 1]) {
    const x = cx + sgn * ex;
    if (eyes === "laser") {
      s += `<circle cx="${x}" cy="${ey}" r="${er}" fill="${RED}" stroke="${O}" stroke-width="${SW}"/><circle cx="${x}" cy="${ey}" r="${er * 0.45}" fill="#fff"/>`;
    } else {
      s += `<circle cx="${x}" cy="${ey}" r="${er}" fill="#fff" stroke="${O}" stroke-width="${SW}"/>`;
      if (eyes === "star") s += star(x, ey, er * 0.75);
      else if (eyes === "sleepy")
        s += `<circle cx="${x + 6 * k}" cy="${ey + 12 * k}" r="${11 * k}" fill="${O}"/>
              <path d="M${x - er} ${ey} A${er} ${er} 0 0 1 ${x + er} ${ey} Z" fill="${SKIN}" stroke="${O}" stroke-width="${SW}"/>`;
      else s += `<circle cx="${x + sgn * -4 * k}" cy="${ey + 4 * k}" r="${11 * k}" fill="${O}"/>`;
    }
    // брови-сосиски
    const by = cy - 70 * k;
    const tilt = { neutral: 0, angry: 18, proud: 10, raised: sgn < 0 ? -22 : 4 }[brows] * k;
    s += `<path d="M${x - sgn * 34 * k} ${by + tilt} L${x + sgn * 34 * k} ${by - tilt * 0.4}" stroke="${O}" stroke-width="${18 * k}" stroke-linecap="round"/>`;
  }
  const my = cy + 70 * k;
  if (mouth === "smile") s += `<path d="M${cx - 45 * k} ${my - 6 * k} Q${cx} ${my + 40 * k} ${cx + 45 * k} ${my - 6 * k}" fill="none" stroke="${O}" stroke-width="${8 * k}" stroke-linecap="round"/>`;
  if (mouth === "grin") s += `<path d="M${cx - 55 * k} ${my - 10 * k} Q${cx} ${my + 55 * k} ${cx + 55 * k} ${my - 10 * k} Z" fill="#fff" stroke="${O}" stroke-width="${SW}" stroke-linejoin="round"/>`;
  if (mouth === "teeth") s += `<rect x="${cx - 55 * k}" y="${my - 18 * k}" width="${110 * k}" height="${36 * k}" rx="${10 * k}" fill="#fff" stroke="${O}" stroke-width="${SW}"/>
     ${[-1, 0, 1].map((i) => `<line x1="${cx + i * 27 * k}" y1="${my - 18 * k}" x2="${cx + i * 27 * k}" y2="${my + 18 * k}" stroke="${O}" stroke-width="4"/>`).join("")}`;
  if (mouth === "flat") s += `<path d="M${cx - 30 * k} ${my} Q${cx} ${my + 8 * k} ${cx + 30 * k} ${my - 4 * k}" fill="none" stroke="${O}" stroke-width="${8 * k}" stroke-linecap="round"/>`;
  if (mustache)
    s += `<path d="M${cx - 70 * k} ${my - 12 * k} Q${cx - 40 * k} ${my - 40 * k} ${cx} ${my - 24 * k} Q${cx + 40 * k} ${my - 40 * k} ${cx + 70 * k} ${my - 12 * k} Q${cx + 40 * k} ${my - 2 * k} ${cx} ${my - 12 * k} Q${cx - 40 * k} ${my - 2 * k} ${cx - 70 * k} ${my - 12 * k} Z" fill="#fff" stroke="${O}" stroke-width="4"/>
          <circle cx="${cx + 85 * k}" cy="${my - 30 * k}" r="${6 * k}" fill="#fff"/><circle cx="${cx - 90 * k}" cy="${my + 4 * k}" r="${5 * k}" fill="#fff"/>`;
  return s;
}

function head({ cy, r, cowlick = "up", ...f }) {
  const k = r / 150;
  const hair = `<path d="M${-140 * k} ${cy - 50 * k} Q${-120 * k} ${cy - 170 * k} 0 ${cy - 155 * k} Q${120 * k} ${cy - 170 * k} ${140 * k} ${cy - 50 * k} Q${100 * k} ${cy - 100 * k} ${40 * k} ${cy - 90 * k} Q${-20 * k} ${cy - 110 * k} ${-60 * k} ${cy - 85 * k} Q${-100 * k} ${cy - 100 * k} ${-140 * k} ${cy - 50 * k} Z" fill="${HAIR}" stroke="${O}" stroke-width="${SW}" stroke-linejoin="round"/>`;
  const cl = { up: `M0 ${cy - 150 * k} C${-20 * k} ${cy - 230 * k} ${70 * k} ${cy - 260 * k} ${45 * k} ${cy - 205 * k}`,
               down: `M0 ${cy - 150 * k} C${40 * k} ${cy - 175 * k} ${85 * k} ${cy - 140 * k} ${75 * k} ${cy - 100 * k}` }[cowlick];
  return `${noodle(cl, 12 * k, HAIR)}
    <circle cx="${-148 * k}" cy="${cy}" r="${26 * k}" fill="${SKIN}" stroke="${O}" stroke-width="${SW}"/>
    <circle cx="${148 * k}" cy="${cy}" r="${26 * k}" fill="${SKIN}" stroke="${O}" stroke-width="${SW}"/>
    <circle cx="0" cy="${cy}" r="${r}" fill="${SKIN}" stroke="${O}" stroke-width="${SW}"/>
    <ellipse cx="${-95 * k}" cy="${cy + 45 * k}" rx="${22 * k}" ry="${12 * k}" fill="#FF8A8A" opacity=".5"/>
    <ellipse cx="${95 * k}" cy="${cy + 45 * k}" rx="${22 * k}" ry="${12 * k}" fill="#FF8A8A" opacity=".5"/>
    ${hair}${face({ cy, r, ...f })}`;
}

// Герой «Ты». x,y — точка между ступнями. Возвращает svg и координаты глаз.
function hero({ x, y, s = 1, build = "skinny", pose = "idle", ...f }) {
  let g = "";
  let headCy, r;
  if (build === "skinny") {
    headCy = -600; r = 150;
    g += noodle("M-38 -180 L-44 -45") + noodle("M38 -180 L44 -45") + sneaker(-50) + sneaker(50);
    g += noodle("M-160 -318 C-180 -280 -178 -255 -165 -225") + `<circle cx="-165" cy="-222" r="20" fill="${SKIN}" stroke="${O}" stroke-width="${SW}"/>`;
    if (pose === "reach") g += noodle("M160 -318 C200 -300 225 -300 255 -310") + `<circle cx="262" cy="-312" r="20" fill="${SKIN}" stroke="${O}" stroke-width="${SW}"/>`;
    else if (pose === "shaker")
      g += noodle("M160 -318 C200 -330 205 -380 190 -420") +
        `<g transform="translate(190,-470) rotate(12)"><rect x="-38" y="-80" width="76" height="130" rx="14" fill="#E8F7FF" fill-opacity=".85" stroke="${O}" stroke-width="${SW}"/>
         <rect x="-38" y="-10" width="76" height="60" rx="10" fill="#F4EEE4"/><rect x="-44" y="-100" width="88" height="28" rx="8" fill="${RED}" stroke="${O}" stroke-width="${SW}"/></g>
         <circle cx="190" cy="-425" r="20" fill="${SKIN}" stroke="${O}" stroke-width="${SW}"/>`;
    else g += noodle("M160 -318 C180 -280 178 -255 165 -225") + `<circle cx="165" cy="-222" r="20" fill="${SKIN}" stroke="${O}" stroke-width="${SW}"/>`;
    g += `<rect x="-14" y="-462" width="28" height="44" fill="${SKIN}" stroke="${O}" stroke-width="${SW}"/>`;
    g += `<path d="M-70 -435 L-130 -412 L-188 -332 L-148 -302 L-132 -340 L-152 -165 Q0 -150 152 -165 L132 -340 L148 -302 L188 -332 L130 -412 L70 -435 Q0 -400 -70 -435 Z" fill="${SHIRT}" stroke="${O}" stroke-width="${SW}" stroke-linejoin="round"/>
      <path d="M-120 -230 Q-60 -215 -20 -235" stroke="${O}" stroke-width="4" fill="none" opacity=".35"/>
      <text x="0" y="-255" text-anchor="middle" font-family="Rubik" font-weight="900" font-size="110" fill="#fff" stroke="${O}" stroke-width="5" paint-order="stroke">0</text>`;
  } else {
    headCy = -660; r = 120;
    g += noodle("M-95 -180 L-105 -50", 48) + noodle("M95 -180 L105 -50", 48) + sneaker(-110, 1.25) + sneaker(110, 1.25);
    g += `<path d="M-70 -560 L70 -560 L95 -515 L-95 -515 Z" fill="${SKIN}" stroke="${O}" stroke-width="${SW}" stroke-linejoin="round"/>`;
    g += `<path d="M-95 -525 L-330 -478 L-370 -330 L-275 -300 L-258 -380 L-205 -165 Q0 -145 205 -165 L258 -380 L275 -300 L370 -330 L330 -478 L95 -525 Q0 -490 -95 -525 Z" fill="${SHIRT}" stroke="${O}" stroke-width="${SW}" stroke-linejoin="round"/>
      <path d="M-240 -420 l15 12 l-12 10 l16 14" stroke="${O}" stroke-width="4" fill="none"/><path d="M230 -300 l-14 10 l12 12 l-15 12" stroke="${O}" stroke-width="4" fill="none"/>
      <path d="M-150 -330 Q0 -290 150 -330" stroke="${O}" stroke-width="5" fill="none" opacity=".35"/>
      <text x="0" y="-330" text-anchor="middle" font-family="Rubik" font-weight="900" font-size="120" fill="#fff" stroke="${O}" stroke-width="5" paint-order="stroke" transform="translate(0,-330) scale(2.1,1) translate(0,330)">0</text>`;
    for (const sgn of [-1, 1]) {
      g += `<ellipse cx="${sgn * 345}" cy="-330" rx="78" ry="98" fill="${SKIN}" stroke="${O}" stroke-width="${SW}"/>
        <ellipse cx="${sgn * 285}" cy="-215" rx="66" ry="80" transform="rotate(${sgn * -40} ${sgn * 285} -215)" fill="${SKIN}" stroke="${O}" stroke-width="${SW}"/>
        <circle cx="${sgn * 195}" cy="-185" r="56" fill="${SKIN}" stroke="${O}" stroke-width="${SW}"/>
        <path d="M${sgn * 175} -215 q${sgn * 18} 12 ${sgn * 36} 0" stroke="${O}" stroke-width="4" fill="none"/>`;
    }
  }
  g += head({ cy: headCy, r, ...f });
  const k = r / 150;
  const eyes = [-1, 1].map((sgn) => [x + s * sgn * 58 * k, y + s * (headCy - 5 * k)]);
  return { svg: `${shadow(x, y - 4, 230 * s * (build === "giant" ? 1.6 : 1))}<g transform="translate(${x},${y}) scale(${s})">${g}</g>`, eyes };
}

function mom({ x, y, s = 1 }) {
  const g = `
    ${noodle("M-50 -130 L-52 -40")}${noodle("M50 -130 L52 -40")}
    <path d="M-95 -45 h80 v-10 a20 20 0 0 0 -20 -20 h-40 a20 20 0 0 0 -20 20 Z" fill="#8C3B5E" stroke="${O}" stroke-width="${SW}"/>
    <path d="M15 -45 h80 v-10 a20 20 0 0 0 -20 -20 h-40 a20 20 0 0 0 -20 20 Z" fill="#8C3B5E" stroke="${O}" stroke-width="${SW}"/>
    <path d="M-70 -440 L-120 -415 L-165 -120 Q0 -100 165 -120 L120 -415 L70 -440 Q0 -415 -70 -440 Z" fill="#2FA59A" stroke="${O}" stroke-width="${SW}" stroke-linejoin="round"/>
    <path d="M-80 -360 Q0 -345 80 -360 L100 -140 Q0 -125 -100 -140 Z" fill="#FFB3CF" stroke="${O}" stroke-width="${SW}" stroke-linejoin="round"/>
    <rect x="-12" y="-468" width="24" height="36" fill="${SKIN}" stroke="${O}" stroke-width="${SW}"/>
    <circle cx="0" cy="-690" r="52" fill="#7A5C48" stroke="${O}" stroke-width="${SW}"/>
    <circle cx="0" cy="-560" r="120" fill="${SKIN}" stroke="${O}" stroke-width="${SW}"/>
    <path d="M-122 -560 Q-125 -680 0 -682 Q125 -680 122 -560 Q95 -625 30 -630 Q-10 -600 -40 -632 Q-100 -625 -122 -560 Z" fill="#7A5C48" stroke="${O}" stroke-width="${SW}" stroke-linejoin="round"/>
    ${[-1, 1].map((sg) => `<circle cx="${sg * 46}" cy="-555" r="34" fill="#fff" stroke="${O}" stroke-width="${SW}"/>
       <circle cx="${sg * 46 + 3}" cy="-548" r="9" fill="${O}"/>
       <path d="M${sg * 46 - 34} -555 A34 34 0 0 1 ${sg * 46 + 34} -555 Z" fill="${SKIN}" stroke="${O}" stroke-width="4"/>
       <circle cx="${sg * 46}" cy="-555" r="40" fill="none" stroke="${O}" stroke-width="7"/>
       <path d="M${sg * 30} -612 L${sg * 64} -604" stroke="${O}" stroke-width="12" stroke-linecap="round"/>`).join("")}
    <line x1="-8" y1="-558" x2="8" y2="-558" stroke="${O}" stroke-width="7"/>
    <ellipse cx="-80" cy="-512" rx="18" ry="10" fill="#FF8A8A" opacity=".5"/><ellipse cx="80" cy="-512" rx="18" ry="10" fill="#FF8A8A" opacity=".5"/>
    <path d="M-28 -495 Q0 -482 30 -500" fill="none" stroke="${O}" stroke-width="7" stroke-linecap="round"/>
    ${noodle("M-115 -405 C-150 -350 -140 -300 -100 -290")}${noodle("M115 -405 C150 -350 140 -300 100 -290")}
    <!-- банка с мукой -->
    <g transform="translate(0,-260)">
      <path d="M-85 -90 Q-60 -150 -20 -120 Q10 -165 45 -125 Q80 -150 85 -90 Z" fill="#fff" stroke="${O}" stroke-width="${SW}" stroke-linejoin="round"/>
      <rect x="-90" y="-95" width="180" height="190" rx="20" fill="#2E2A44" stroke="${O}" stroke-width="${SW}"/>
      <rect x="-90" y="-40" width="180" height="80" fill="${YEL}" stroke="${O}" stroke-width="${SW}"/>
      <text x="0" y="12" text-anchor="middle" font-family="Rubik" font-weight="900" font-size="34" fill="${O}">ПРОТЕИН</text>
      <g transform="translate(10,-2) rotate(-8)"><rect x="-75" y="-34" width="150" height="66" fill="#FFF6D8" stroke="${O}" stroke-width="4"/>
        <rect x="-30" y="-46" width="60" height="22" fill="#fff" opacity=".7" transform="rotate(6)"/>
        <text x="0" y="18" text-anchor="middle" font-family="Caveat" font-weight="700" font-size="54" fill="${RED}">МУКА</text></g>
    </g>
    <circle cx="-95" cy="-290" r="22" fill="${SKIN}" stroke="${O}" stroke-width="${SW}"/><circle cx="95" cy="-290" r="22" fill="${SKIN}" stroke="${O}" stroke-width="${SW}"/>`;
  return `${shadow(x, y - 4, 200 * s)}<g transform="translate(${x},${y}) scale(${s})">${g}</g>`;
}

function jar(x, y, w, h) {
  return `${shadow(x, y - 4, w * 0.7)}<g transform="translate(${x - w / 2},${y - h})">
    <rect x="0" y="40" width="${w}" height="${h - 40}" rx="36" fill="#2E2A44" stroke="${O}" stroke-width="${SW}"/>
    <rect x="${w * 0.08}" y="0" width="${w * 0.84}" height="70" rx="16" fill="${RED}" stroke="${O}" stroke-width="${SW}"/>
    <rect x="0" y="${h * 0.3}" width="${w}" height="${h * 0.42}" fill="${YEL}" stroke="${O}" stroke-width="${SW}"/>
    <text x="${w / 2}" y="${h * 0.3 + 92}" text-anchor="middle" font-family="Rubik" font-weight="900" font-size="52" fill="${O}">ПРОТЕИН</text>
    <path transform="translate(${w / 2},${h * 0.3 + 108}) scale(.65)" d="M12 0 l-40 70 h34 l-18 62 l56 -84 h-36 l22 -48 Z" fill="${RED}" stroke="${O}" stroke-width="5" stroke-linejoin="round"/>
    <text x="${w / 2}" y="${h * 0.72 - 16}" text-anchor="middle" font-family="Rubik" font-weight="800" font-size="28" fill="${O}">1 КГ · ШОКОЛАД</text>
    <path d="M${w * 0.12} 110 Q${w * 0.1} ${h * 0.2} ${w * 0.14} ${h * 0.26}" stroke="#fff" stroke-width="12" stroke-linecap="round" opacity=".35" fill="none"/>
  </g>`;
}

// ---------- HUD ----------
function dayCard(num, extra = "") {
  return `<g transform="translate(540,335) rotate(-2)">
    <rect x="-260" y="-72" width="520" height="144" rx="20" fill="#fff" stroke="${O}" stroke-width="${SW + 2}"/>
    <text x="10" y="34" text-anchor="end" font-family="Rubik" font-weight="900" font-size="78" fill="${O}">ДЕНЬ</text>
    <text x="40" y="40" text-anchor="start" font-family="Rubik" font-weight="900" font-size="104" fill="${RED}">${num}</text>
    ${extra}
  </g>
  <g transform="translate(0,0)">${noodle("M-20 430 C80 425 170 415 262 398", 30)}
    <ellipse cx="282" cy="398" rx="34" ry="38" fill="${SKIN}" stroke="${O}" stroke-width="${SW}"/>
    <path d="M268 372 q24 -6 34 12" stroke="${O}" stroke-width="5" fill="none" stroke-linecap="round"/></g>`;
}
function weight(text) {
  return `<g transform="translate(540,458)"><rect x="-170" y="-36" width="340" height="72" rx="36" fill="${O}"/>
    <text x="-140" y="13" font-family="Rubik" font-weight="800" font-size="30" fill="#BDB6D6">ВЕС</text>
    <text x="150" y="15" text-anchor="end" font-family="Rubik" font-weight="900" font-size="44" fill="${YEL}">${text}</text></g>`;
}
function achievement(text) {
  return `<g transform="translate(520,600)"><rect x="-420" y="-50" width="840" height="100" rx="50" fill="${YEL}" stroke="${O}" stroke-width="${SW + 2}"/>
    ${star(-360, 0, 34, "#fff")}
    <text x="-310" y="-8" font-family="Rubik" font-weight="800" font-size="26" fill="${O}" opacity=".7">НОВАЯ СПОСОБНОСТЬ</text>
    <text x="-310" y="34" font-family="Rubik" font-weight="900" font-size="44" fill="${O}">${text}</text></g>`;
}
// субтитры: lines = [[{t, red?, dim?}]]
function subs(lines, size = SUB.size) {
  const y0 = 1340 - ((lines.length - 1) * size) / 2;
  return lines.map((ws, i) => {
    const y = y0 + i * size * 1.05;
    const txt = ws.map((w) => w.t).join(" ");
    const box = SUB.box ? `<rect x="${520 - txt.length * size * 0.37 - 30}" y="${y - size * 0.86}" width="${txt.length * size * 0.74 + 60}" height="${size * 1.08}" fill="${YEL}" stroke="${O}" stroke-width="${SW}" transform="rotate(${i % 2 ? 1.5 : -1.5} 520 ${y})"/>` : "";
    const fillW = SUB.box ? O : "#fff";
    return box + `<text x="520" y="${y}" text-anchor="middle" font-family="${SUB.font}" font-weight="${SUB.weight}" font-size="${size}"
      ${SUB.box ? "" : `stroke="${O}" stroke-width="18" stroke-linejoin="round" paint-order="stroke"`} letter-spacing="1">${ws.map((w) =>
      `<tspan fill="${w.red ? RED : fillW}" fill-opacity="${w.dim ? 0.5 : 1}">${w.t}</tspan>`).join(" ")}</text>`;
  }).join("");
}
function sticker(x, y, rot, text, size = 54) {
  const w = text.length * size * 0.42 + 50;
  return `<g transform="translate(${x},${y}) rotate(${rot})"><rect x="${-w / 2}" y="-42" width="${w}" height="84" fill="#FFF6D8" stroke="${O}" stroke-width="4"/>
    <rect x="-40" y="-56" width="80" height="26" fill="#fff" opacity=".75" transform="rotate(-5)"/>
    <text x="0" y="${size * 0.33}" text-anchor="middle" font-family="Caveat" font-weight="700" font-size="${size}" fill="${O}">${text}</text></g>`;
}
const arrow = (d, head) => `<path d="${d}" fill="none" stroke="${O}" stroke-width="7" stroke-linecap="round"/><path d="${head}" fill="none" stroke="${O}" stroke-width="7" stroke-linecap="round" stroke-linejoin="round"/>`;
const sfx = (x, y, rot, text, size = 96, fill = YEL) =>
  `<text x="${x}" y="${y}" transform="rotate(${rot} ${x} ${y})" text-anchor="middle" font-family="Rubik" font-weight="900" font-size="${size}" fill="${fill}" stroke="${O}" stroke-width="12" stroke-linejoin="round" paint-order="stroke">${text}</text>`;

// ---------- кадры ----------
function frameHook() {
  const h = hero({ x: 380, y: 1150, s: 0.86, pose: "reach", eyes: "normal", brows: "proud", mouth: "grin", cowlick: "up" });
  return bg("#7FE3C4", "#B6F4E1") + jar(720, 1150, 300, 600) + h.svg +
    sticker(200, 700, -6, "ТЫ, 60 КГ") + arrow("M215 750 Q230 800 270 820", "M245 828 L272 822 L268 795") +
    dayCard("00") + weight("60 КГ") +
    subs([[{ t: "ТОЛЬКО" }], [{ t: "ПРОТЕИН", red: true }]]);
}
function frameLasers() {
  const h = hero({ x: 360, y: 1160, s: 0.74, build: "giant", eyes: "laser", brows: "angry", mouth: "teeth", cowlick: "up" });
  const target = [880, 1015];
  const beams = h.eyes.map(([ex, ey]) => `
    <line x1="${ex}" y1="${ey}" x2="${target[0]}" y2="${target[1]}" stroke="${RED}" stroke-width="40" stroke-linecap="round" opacity=".45" filter="url(#glow)"/>
    <line x1="${ex}" y1="${ey}" x2="${target[0]}" y2="${target[1]}" stroke="${RED}" stroke-width="16" stroke-linecap="round"/>
    <line x1="${ex}" y1="${ey}" x2="${target[0]}" y2="${target[1]}" stroke="#fff" stroke-width="5" stroke-linecap="round"/>`).join("");
  const table = `${shadow(870, 1158, 170)}<rect x="720" y="1050" width="300" height="30" rx="8" fill="#C98A5A" stroke="${O}" stroke-width="${SW}"/>
    <rect x="745" y="1080" width="24" height="76" fill="#A86C42" stroke="${O}" stroke-width="${SW}"/><rect x="972" y="1080" width="24" height="76" fill="#A86C42" stroke="${O}" stroke-width="${SW}"/>
    <path d="M800 1050 Q790 1010 830 1005 L870 1002 L860 1050 Z" fill="#E8A75C" stroke="${O}" stroke-width="${SW}" stroke-linejoin="round"/>
    <path d="M818 1020 l8 -10 M838 1018 l8 -10" stroke="${O}" stroke-width="4"/>`;
  const puff = [[880, 1000, 46], [930, 980, 38], [910, 940, 30], [850, 960, 34], [960, 1015, 30]].map(([cx, cy, r]) =>
    `<circle cx="${cx}" cy="${cy}" r="${r}" fill="#fff" stroke="${O}" stroke-width="${SW}"/>`).join("") +
    [[820, 930], [990, 950], [960, 900], [800, 980]].map(([cx, cy]) => `<rect x="${cx}" y="${cy}" width="14" height="10" rx="3" fill="#E8A75C" stroke="${O}" stroke-width="3" transform="rotate(25 ${cx} ${cy})"/>`).join("");
  return bg("#A98BFF", "#C6B5FF") + table + h.svg + beams + puff +
    sfx(700, 820, -10, "ВЖЖЖ", 84) + sfx(905, 905, 8, "ПУФ!", 70, "#fff") +
    dayCard("15") + weight("140 КГ") + achievement("ЛАЗЕРЫ ИЗ ГЛАЗ") +
    subs([[{ t: "ИЗ" }, { t: "ГЛАЗ" }, { t: "—" }], [{ t: "ЛАЗЕРЫ", red: true }]]);
}
function frameTwist() {
  const h = hero({ x: 320, y: 1150, s: 0.86, pose: "shaker", eyes: "sleepy", brows: "raised", mouth: "flat", mustache: true, cowlick: "down" });
  const crossed = `<g transform="translate(205,-60) rotate(8)"><rect x="-58" y="-34" width="116" height="68" rx="10" fill="#FFF6D8" stroke="${O}" stroke-width="4"/>
    <text x="0" y="22" text-anchor="middle" font-family="Rubik" font-weight="900" font-size="54" fill="${O}" opacity=".6">30</text>
    <path d="M-44 -20 L44 22 M44 -20 L-44 22" stroke="${RED}" stroke-width="8" stroke-linecap="round"/></g>`;
  const flour = [[700, 760], [745, 720], [800, 745], [690, 700], [830, 690], [760, 680]].map(([cx, cy], i) =>
    `<circle cx="${cx}" cy="${cy}" r="${6 + (i % 3) * 3}" fill="#fff" opacity=".9"/>`).join("");
  return bg("#7FE3C4", "#B6F4E1") + h.svg + mom({ x: 770, y: 1150, s: 0.9 }) + flour +
    sfx(560, 790, -8, "?!", 110, "#fff") +
    dayCard("01", crossed) + weight("60 КГ") +
    subs([[{ t: "Я" }, { t: "ТАМ" }, { t: "МУКУ", red: true }], [{ t: "ХРАНЮ", dim: true }]]);
}
function safeOverlay() {
  return `<g opacity=".9">
    <rect x="0" y="1620" width="${W}" height="300" fill="${RED}" opacity=".35"/>
    <rect x="940" y="700" width="140" height="920" fill="${RED}" opacity=".35"/>
    <line x1="0" y1="240" x2="${W}" y2="240" stroke="#fff" stroke-width="5" stroke-dasharray="24 16"/>
    <line x1="0" y1="1680" x2="${W}" y2="1680" stroke="#fff" stroke-width="5" stroke-dasharray="24 16"/>
    <text x="30" y="225" font-family="Rubik" font-weight="800" font-size="30" fill="#fff" stroke="${O}" stroke-width="6" paint-order="stroke">обложка 3:4 — верх (240)</text>
    <text x="30" y="1720" font-family="Rubik" font-weight="800" font-size="30" fill="#fff" stroke="${O}" stroke-width="6" paint-order="stroke">обложка 3:4 — низ (1680) · ниже — интерфейс TikTok</text>
    <text x="1010" y="1150" transform="rotate(-90 1010 1150)" text-anchor="middle" font-family="Rubik" font-weight="800" font-size="30" fill="#fff" stroke="${O}" stroke-width="6" paint-order="stroke">кнопки TikTok</text>
  </g>`;
}

// ---------- альтернативные стили ----------
function bgComic(color) {
  let lines = "";
  for (let i = 0; i < 90; i++) {
    const a = (i / 90) * Math.PI * 2, r1 = 420 + (i * 37 % 120);
    lines += `<line x1="${540 + r1 * Math.cos(a)}" y1="${860 + r1 * Math.sin(a)}" x2="${540 + 1800 * Math.cos(a)}" y2="${860 + 1800 * Math.sin(a)}" stroke="#111" stroke-width="${2 + (i % 3)}" opacity=".35"/>`;
  }
  return `<rect width="${W}" height="${H}" fill="#FFF1D0"/>
    <rect width="${W}" height="${H}" fill="url(#ht)" opacity=".35" mask="url(#vig)"/>${lines}
    <rect y="1160" width="${W}" height="${H - 1160}" fill="${color}" opacity=".25"/>
    <line x1="0" y1="1160" x2="${W}" y2="1160" stroke="#111" stroke-width="8"/>`;
}
const comicFrame = `<rect x="18" y="18" width="${W - 36}" height="${H - 36}" fill="none" stroke="#111" stroke-width="14"/>`;
function bgMarker() {
  let g = "";
  for (let x = 0; x <= W; x += 45) g += `<line x1="${x}" y1="0" x2="${x}" y2="${H}" stroke="#8DB6E8" stroke-width="2" opacity=".55"/>`;
  for (let y = 0; y <= H; y += 45) g += `<line x1="0" y1="${y}" x2="${W}" y2="${y}" stroke="#8DB6E8" stroke-width="2" opacity=".55"/>`;
  return `<rect width="${W}" height="${H}" fill="#FBF8EF"/>${g}<line x1="96" y1="0" x2="96" y2="${H}" stroke="#F07A7A" stroke-width="4"/>
    <path d="M60 1165 Q300 1150 540 1162 T1040 1158" stroke="#2B2B2B" stroke-width="5" fill="none"/>`;
}
function bgRoom(kind) {
  const wall = kind === "lasers" ? "#E7DBFF" : "#FFE6D6";
  let stripes = "";
  for (let x = 0; x < W; x += 70) stripes += `<rect x="${x}" y="0" width="30" height="1160" fill="#fff" opacity=".28"/>`;
  return `<rect width="${W}" height="${H}" fill="${wall}"/>${stripes}
    <rect x="600" y="560" width="300" height="330" rx="10" fill="#9FD8F5"/><circle cx="820" cy="640" r="40" fill="#FFF3A6"/>
    <rect x="600" y="560" width="300" height="330" rx="10" fill="none" stroke="#fff" stroke-width="18"/><line x1="750" y1="560" x2="750" y2="890" stroke="#fff" stroke-width="14"/>
    <rect x="580" y="885" width="340" height="24" rx="8" fill="#D9C2B0"/>
    <rect x="60" y="760" width="170" height="120" rx="12" fill="#F7C9A8"/><rect x="80" y="700" width="40" height="60" rx="6" fill="#7BC59A"/>
    <rect y="1160" width="${W}" height="${H - 1160}" fill="#E8B88E"/>
    ${Array.from({ length: 8 }, (_, i) => `<line x1="0" y1="${1230 + i * 90}" x2="${W}" y2="${1230 + i * 90}" stroke="#D5A276" stroke-width="4"/>`).join("")}
    <rect y="1150" width="${W}" height="18" fill="#D5A276"/>`;
}

const themes = {
  A_juicy: { set() {}, wrap: (b) => b },
  B_comic: {
    set() { O = "#111"; SW = 9; SKIN = "#FFD2B0"; SHIRT = "#FF2E63"; YEL = "#FFE500"; RED = "#E8112D"; SUB = { font: "Rubik", weight: 900, size: 100, box: true };
      bg = (c) => bgComic(c); },
    wrap: (b) => b + comicFrame,
  },
  C_marker: {
    set() { O = "#2B2B2B"; SW = 5; SKIN = "#FFE7D4"; SHIRT = "#FF8C72"; YEL = "#FFE98A"; RED = "#E8433A"; HAIR = "#6B4A38"; SUB = { font: "Caveat", weight: 700, size: 150, box: false };
      bg = () => bgMarker(); },
    wrap: (b) => `<g filter="url(#wob)">${b}</g>`,
  },
  D_cozy: {
    set() { O = "#6A4A5E"; SW = 3; SKIN = "#FFD3B5"; SHIRT = "#F2665A"; YEL = "#FFD45C"; RED = "#FF4A4A"; HAIR = "#4E3427"; SUB = { font: "Montserrat", weight: 800, size: 96, box: false };
      bg = (c) => bgRoom(c === "#A98BFF" ? "lasers" : "hook"); },
    wrap: (b) => b,
  },
};
const base = { O, RED, YEL, SKIN, SHIRT, HAIR, SW, SUB };

const fontsCss = "https://fonts.googleapis.com/css2?family=Oswald:wght@700&family=Rubik:wght@800;900&family=Caveat:wght@700&family=Montserrat:wght@800&display=block";
const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: W, height: H }, deviceScaleFactor: 1 });
const only = process.argv[2];
for (const [tname, th] of Object.entries(themes)) {
  if (only && !tname.startsWith(only)) continue;
  ({ O, RED, YEL, SKIN, SHIRT, HAIR, SW, SUB } = base); bg = bgRays; th.set();
  const frames = tname === "A_juicy"
    ? { "01_hook_day00": frameHook(), "02_lasers_day15": frameLasers(), "03_twist_flour": frameTwist(), "04_hook_safezones": frameHook() + safeOverlay() }
    : { [`${tname}_hook`]: th.wrap(frameHook()), [`${tname}_lasers`]: th.wrap(frameLasers()) };
  for (const [name, body] of Object.entries(frames)) {
    await page.setContent(`<!doctype html><html><head><meta charset="utf-8"><link rel="stylesheet" href="${fontsCss}">
      <style>html,body{margin:0;background:#000}svg{display:block}</style></head>
      <body><svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">${defs()}${body}</svg></body></html>`, { waitUntil: "networkidle" });
    await page.evaluate(async () => {
      await Promise.all(["700 40px Oswald", "900 40px Rubik", "800 40px Rubik", "700 40px Caveat", "800 40px Montserrat"].map((f) => document.fonts.load(f, "АБВ")));
      await document.fonts.ready;
    });
    await page.screenshot({ path: path.join(OUT, `${name}.png`) });
    console.log("saved", name);
  }
}
await browser.close();
