// Библиотека рисования (браузер). Стиль «тетрадь + сочный флэт». Всё возвращает SVG-строки.
/* eslint-disable no-unused-vars */
const W = 1080, H = 1920;
let O = "#231C35", RED = "#FF3B3B", YEL = "#FFE14D", SKIN = "#FFD9B8", SHIRT = "#FF5A3C", HAIR = "#5A3A2A";
const SW = 6;
const PAL = { mint: "#7FE3C4", yellow: "#FFD84D", pink: "#FF9EC4", purple: "#A98BFF", orange: "#FFB36B", blue: "#8FC8FF" };

// ---------- утилиты ----------
const clamp = (x, a = 0, b = 1) => Math.max(a, Math.min(b, x));
const lerp = (a, b, k) => a + (b - a) * k;
const easeOut = (x) => 1 - Math.pow(1 - clamp(x), 3);
const easeInOut = (x) => { x = clamp(x); return x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2; };
const easeOutBack = (x) => { x = clamp(x); const c = 1.6; return 1 + (c + 1) * Math.pow(x - 1, 3) + c * Math.pow(x - 1, 2); };
// пружинящее появление: 0 до t0, потом 0→1 с перелётом
const pop = (t, t0, d = 0.45) => { const x = (t - t0) / d; if (x <= 0) return 0; if (x >= 1.6) return 1; return 1 - Math.exp(-5 * x) * Math.cos(9 * x); };
const fade = (t, t0, d = 0.25) => clamp((t - t0) / d);
const G = (tr, c) => `<g transform="${tr}">${c}</g>`;
const at = (cx, cy, k, c, rot = 0) => k <= 0.001 ? "" : `<g transform="translate(${cx},${cy}) scale(${k}) rotate(${rot}) translate(${-cx},${-cy})">${c}</g>`;
const rnd = (i) => { const x = Math.sin(i * 127.1 + 311.7) * 43758.5453; return x - Math.floor(x); };

// ---------- примитивы ----------
const noodle = (d, w = 14, col = SKIN) =>
  `<path d="${d}" fill="none" stroke="${O}" stroke-width="${w + SW * 2}" stroke-linecap="round" stroke-linejoin="round"/>
   <path d="${d}" fill="none" stroke="${col}" stroke-width="${w}" stroke-linecap="round" stroke-linejoin="round"/>`;
const star = (x, y, r, fill = YEL) => {
  const p = [];
  for (let i = 0; i < 10; i++) { const a = -Math.PI / 2 + (i * Math.PI) / 5, rr = i % 2 ? r * 0.45 : r; p.push(`${x + rr * Math.cos(a)},${y + rr * Math.sin(a)}`); }
  return `<polygon points="${p.join(" ")}" fill="${fill}" stroke="${O}" stroke-width="4" stroke-linejoin="round"/>`;
};
const shadow = (x, y, rx) => `<ellipse cx="${x}" cy="${y}" rx="${rx}" ry="${rx * 0.16}" fill="${O}" opacity=".18"/>`;
const sneaker = (x, s = 1) => `<g transform="translate(${x},0) scale(${s})"><rect x="-45" y="-50" width="90" height="48" rx="22" fill="#fff" stroke="${O}" stroke-width="${SW}"/><path d="M-30 -24 L28 -24" stroke="${RED}" stroke-width="8" stroke-linecap="round"/></g>`;
const R = (x, y, w, h, fill, rx = 0, extra = "") => `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="${rx}" fill="${fill}" stroke="${O}" stroke-width="${SW}" ${extra}/>`;
const C = (x, y, r, fill, extra = "") => `<circle cx="${x}" cy="${y}" r="${r}" fill="${fill}" stroke="${O}" stroke-width="${SW}" ${extra}/>`;
const T = (x, y, txt, size, fill = O, font = "Rubik", weight = 900, anchor = "middle", extra = "") =>
  `<text x="${x}" y="${y}" text-anchor="${anchor}" font-family="${font}" font-weight="${weight}" font-size="${size}" fill="${fill}" ${extra}>${txt}</text>`;
const sticker = (x, y, rot, text, size = 54, col = O) => {
  const w = text.length * size * 0.44 + 50;
  return `<g transform="translate(${x},${y}) rotate(${rot})"><rect x="${-w / 2}" y="-42" width="${w}" height="84" fill="#FFF6D8" stroke="${O}" stroke-width="4"/>
    <rect x="-40" y="-56" width="80" height="26" fill="#fff" opacity=".75" transform="rotate(-5)"/>${T(0, size * 0.33, text, size, col, "Caveat", 700)}</g>`;
};
const arrow = (d, head) => `<path d="${d}" fill="none" stroke="${O}" stroke-width="7" stroke-linecap="round"/><path d="${head}" fill="none" stroke="${O}" stroke-width="7" stroke-linecap="round" stroke-linejoin="round"/>`;
const sfxText = (x, y, rot, text, size = 96, fill = YEL) =>
  `<text x="${x}" y="${y}" transform="rotate(${rot} ${x} ${y})" text-anchor="middle" font-family="Rubik" font-weight="900" font-size="${size}" fill="${fill}" stroke="${O}" stroke-width="12" stroke-linejoin="round" paint-order="stroke">${text}</text>`;
// звук-надпись, выскакивает в t0 и исчезает через life
const sfxPop = (t, t0, x, y, rot, text, size = 96, fill = YEL, life = 0.9) => {
  if (t < t0 || t > t0 + life) return "";
  const k = pop(t, t0, 0.35) * (1 - clamp((t - t0 - life + 0.2) / 0.2));
  return at(x, y - size * 0.3, k, sfxText(x, y, rot, text, size, fill));
};
const card = (x, y, w, h, rot, inner) => `<g transform="translate(${x},${y}) rotate(${rot})">
  <rect x="${-w / 2 + 10}" y="${-h / 2 + 12}" width="${w}" height="${h}" rx="18" fill="${O}" opacity=".2"/>
  <rect x="${-w / 2}" y="${-h / 2}" width="${w}" height="${h}" rx="18" fill="#fff" stroke="${O}" stroke-width="${SW}"/>
  <rect x="-60" y="${-h / 2 - 18}" width="120" height="34" fill="#fff" opacity=".75" transform="rotate(-4)"/>${inner}</g>`;

// ---------- лицо и голова героя ----------
function face({ cx = 0, cy, r, eyes = "normal", brows = "neutral", mouth = "smile", mustache = false, look = 0 }) {
  const k = r / 150, ex = 58 * k, ey = cy - 5 * k, er = 50 * k;
  let s = "";
  for (const sgn of [-1, 1]) {
    const x = cx + sgn * ex;
    if (eyes === "laser") {
      s += `<circle cx="${x}" cy="${ey}" r="${er}" fill="${RED}" stroke="${O}" stroke-width="${SW}"/><circle cx="${x}" cy="${ey}" r="${er * 0.45}" fill="#fff"/>`;
    } else if (eyes === "closed") {
      s += `<path d="M${x - er * 0.7} ${ey} Q${x} ${ey + er * 0.5} ${x + er * 0.7} ${ey}" fill="none" stroke="${O}" stroke-width="${8 * k}" stroke-linecap="round"/>`;
    } else {
      s += `<circle cx="${x}" cy="${ey}" r="${er}" fill="#fff" stroke="${O}" stroke-width="${SW}"/>`;
      if (eyes === "star") s += star(x, ey, er * 0.75);
      else if (eyes === "dots") s += `<circle cx="${x}" cy="${ey}" r="${6 * k}" fill="${O}"/>`;
      else if (eyes === "sleepy") s += `<circle cx="${x + 6 * k}" cy="${ey + 12 * k}" r="${11 * k}" fill="${O}"/><path d="M${x - er} ${ey} A${er} ${er} 0 0 1 ${x + er} ${ey} Z" fill="${SKIN}" stroke="${O}" stroke-width="${SW}"/>`;
      else s += `<circle cx="${x + look * 18 * k + sgn * -4 * k}" cy="${ey + 4 * k}" r="${11 * k}" fill="${O}"/>`;
    }
    const by = cy - 70 * k;
    const tilt = { neutral: 0, angry: 18, proud: 10, raised: sgn < 0 ? -22 : 4, sad: -16, up: -10 }[brows] * k;
    s += `<path d="M${x - sgn * 34 * k} ${by + tilt} L${x + sgn * 34 * k} ${by - tilt * 0.4}" stroke="${O}" stroke-width="${18 * k}" stroke-linecap="round"/>`;
  }
  const my = cy + 70 * k;
  if (mouth === "smile") s += `<path d="M${cx - 45 * k} ${my - 6 * k} Q${cx} ${my + 40 * k} ${cx + 45 * k} ${my - 6 * k}" fill="none" stroke="${O}" stroke-width="${8 * k}" stroke-linecap="round"/>`;
  if (mouth === "grin") s += `<path d="M${cx - 55 * k} ${my - 10 * k} Q${cx} ${my + 55 * k} ${cx + 55 * k} ${my - 10 * k} Z" fill="#fff" stroke="${O}" stroke-width="${SW}" stroke-linejoin="round"/>`;
  if (mouth === "teeth") s += `<rect x="${cx - 55 * k}" y="${my - 18 * k}" width="${110 * k}" height="${36 * k}" rx="${10 * k}" fill="#fff" stroke="${O}" stroke-width="${SW}"/>${[-1, 0, 1].map((i) => `<line x1="${cx + i * 27 * k}" y1="${my - 18 * k}" x2="${cx + i * 27 * k}" y2="${my + 18 * k}" stroke="${O}" stroke-width="4"/>`).join("")}`;
  if (mouth === "flat") s += `<path d="M${cx - 30 * k} ${my} Q${cx} ${my + 8 * k} ${cx + 30 * k} ${my - 4 * k}" fill="none" stroke="${O}" stroke-width="${8 * k}" stroke-linecap="round"/>`;
  if (mouth === "sad") s += `<path d="M${cx - 40 * k} ${my + 12 * k} Q${cx} ${my - 20 * k} ${cx + 40 * k} ${my + 12 * k}" fill="none" stroke="${O}" stroke-width="${8 * k}" stroke-linecap="round"/>`;
  if (mouth === "shout") s += `<ellipse cx="${cx}" cy="${my + 6 * k}" rx="${42 * k}" ry="${36 * k}" fill="#7A1F2E" stroke="${O}" stroke-width="${SW}"/><ellipse cx="${cx}" cy="${my + 24 * k}" rx="${22 * k}" ry="${12 * k}" fill="#FF7C8E"/>`;
  if (mouth === "o") s += `<ellipse cx="${cx}" cy="${my}" rx="${18 * k}" ry="${24 * k}" fill="#7A1F2E" stroke="${O}" stroke-width="${SW}"/>`;
  if (mouth === "wavy") s += `<path d="M${cx - 45 * k} ${my} q${11 * k} -12 ${22 * k} 0 t${22 * k} 0 t${22 * k} 0 t${22 * k} 0" fill="none" stroke="${O}" stroke-width="${8 * k}" stroke-linecap="round"/>`;
  if (mustache) s += `<path d="M${cx - 70 * k} ${my - 12 * k} Q${cx - 40 * k} ${my - 40 * k} ${cx} ${my - 24 * k} Q${cx + 40 * k} ${my - 40 * k} ${cx + 70 * k} ${my - 12 * k} Q${cx + 40 * k} ${my - 2 * k} ${cx} ${my - 12 * k} Q${cx - 40 * k} ${my - 2 * k} ${cx - 70 * k} ${my - 12 * k} Z" fill="#fff" stroke="${O}" stroke-width="4"/>`;
  return s;
}
function head({ cy, r, cowlick = "up", tears = 0, sweat = false, ...f }) {
  const k = r / 150;
  const hair = `<path d="M${-140 * k} ${cy - 50 * k} Q${-120 * k} ${cy - 170 * k} 0 ${cy - 155 * k} Q${120 * k} ${cy - 170 * k} ${140 * k} ${cy - 50 * k} Q${100 * k} ${cy - 100 * k} ${40 * k} ${cy - 90 * k} Q${-20 * k} ${cy - 110 * k} ${-60 * k} ${cy - 85 * k} Q${-100 * k} ${cy - 100 * k} ${-140 * k} ${cy - 50 * k} Z" fill="${HAIR}" stroke="${O}" stroke-width="${SW}" stroke-linejoin="round"/>`;
  const cl = { up: `M0 ${cy - 150 * k} C${-20 * k} ${cy - 230 * k} ${70 * k} ${cy - 260 * k} ${45 * k} ${cy - 205 * k}`,
    down: `M0 ${cy - 150 * k} C${40 * k} ${cy - 175 * k} ${85 * k} ${cy - 140 * k} ${75 * k} ${cy - 100 * k}`,
    spiral: `M0 ${cy - 150 * k} C${-10 * k} ${cy - 220 * k} ${60 * k} ${cy - 230 * k} ${55 * k} ${cy - 195 * k} C${50 * k} ${cy - 175 * k} ${25 * k} ${cy - 180 * k} ${30 * k} ${cy - 195 * k}` }[cowlick];
  let extra = "";
  if (tears > 0) for (const sgn of [-1, 1]) for (let i = 0; i < 3; i++) {
    const ph = (tears * 1.4 + i / 3) % 1;
    extra += `<path d="M${sgn * 70 * k} ${cy + 25 * k + ph * 260 * k} q${-12 * k} ${22 * k} 0 ${30 * k} q${12 * k} ${-8 * k} 0 ${-30 * k} Z" fill="#9FE3FF" stroke="${O}" stroke-width="3" opacity="${1 - ph * 0.6}"/>`;
  }
  if (sweat) extra += `<path d="M${120 * k} ${cy - 90 * k} q${-16 * k} ${28 * k} 0 ${40 * k} q${16 * k} ${-12 * k} 0 ${-40 * k} Z" fill="#9FE3FF" stroke="${O}" stroke-width="4"/>`;
  return `${noodle(cl, 12 * k, HAIR)}
    ${C(-148 * k, cy, 26 * k, SKIN)}${C(148 * k, cy, 26 * k, SKIN)}${C(0, cy, r, SKIN)}
    <ellipse cx="${-95 * k}" cy="${cy + 45 * k}" rx="${22 * k}" ry="${12 * k}" fill="#FF8A8A" opacity=".5"/>
    <ellipse cx="${95 * k}" cy="${cy + 45 * k}" rx="${22 * k}" ry="${12 * k}" fill="#FF8A8A" opacity=".5"/>
    ${hair}${face({ cy, r, ...f })}${extra}`;
}

// ---------- герой «Ты» ----------
// build: skinny | armR | giant;  pose: idle | reach | shaker | flex | wave | think | walk
function hero({ x, y, s = 1, build = "skinny", pose = "idle", halo = false, ribs = false, drip = 0, stone = false, walk = 0, ...f }) {
  const keep = [SKIN, SHIRT, HAIR];
  if (stone) { SKIN = "#C9C4D6"; SHIRT = "#9A93B0"; HAIR = "#6E6880"; }
  let g = "", headCy, r;
  const hand = (hx, hy, rr = 20) => C(hx, hy, rr, SKIN);
  if (build !== "giant") {
    headCy = -600; r = 150;
    const lw = Math.sin(walk * 9) * 14;
    g += noodle(`M-38 -180 L${-44 + lw} -45`) + noodle(`M38 -180 L${44 - lw} -45`) + G(`translate(${lw},0)`, sneaker(-50)) + G(`translate(${-lw},0)`, sneaker(50));
    // левая рука
    if (pose === "wave" || pose === "flex") g += noodle("M-160 -318 C-210 -360 -220 -420 -205 -470") + hand(-205, -476);
    else if (pose === "think") g += noodle("M-160 -318 C-150 -380 -110 -420 -80 -470") + hand(-78, -476);
    else g += noodle("M-160 -318 C-180 -280 -178 -255 -165 -225") + hand(-165, -222);
    // правая рука
    if (build === "armR") {
      g += `<ellipse cx="235" cy="-330" rx="100" ry="80" transform="rotate(-25 235 -330)" fill="${SKIN}" stroke="${O}" stroke-width="${SW}"/>
        <ellipse cx="315" cy="-215" rx="78" ry="105" transform="rotate(18 315 -215)" fill="${SKIN}" stroke="${O}" stroke-width="${SW}"/>
        ${C(330, -105, 66, SKIN)}<path d="M300 -130 q30 18 60 0" stroke="${O}" stroke-width="5" fill="none"/>
        <path d="M200 -360 q20 -30 50 -18" stroke="${O}" stroke-width="5" fill="none" opacity=".5"/>`;
    } else if (pose === "reach") g += noodle("M160 -318 C200 -300 225 -300 255 -310") + hand(262, -312);
    else if (pose === "shaker") g += noodle("M160 -318 C200 -330 205 -380 190 -420") +
      `<g transform="translate(190,-470) rotate(12)"><rect x="-38" y="-80" width="76" height="130" rx="14" fill="#E8F7FF" fill-opacity=".9" stroke="${O}" stroke-width="${SW}"/>
       <rect x="-38" y="-10" width="76" height="60" rx="10" fill="#C99A6B"/><rect x="-44" y="-100" width="88" height="28" rx="8" fill="${RED}" stroke="${O}" stroke-width="${SW}"/></g>` + hand(190, -425);
    else if (pose === "flex") g += noodle("M160 -318 C215 -330 245 -380 230 -440") + `<ellipse cx="205" cy="-345" rx="16" ry="12" fill="${SKIN}" stroke="${O}" stroke-width="4"/>` + hand(228, -446);
    else if (pose === "wave") g += noodle("M160 -318 C210 -360 220 -420 205 -470") + hand(205, -476);
    else g += noodle("M160 -318 C180 -280 178 -255 165 -225") + hand(165, -222);
    g += `<rect x="-14" y="-462" width="28" height="44" fill="${SKIN}" stroke="${O}" stroke-width="${SW}"/>`;
    if (ribs) {
      g += `<path d="M-70 -435 L-130 -412 L-188 -332 L-148 -302 L-132 -340 L-140 -300 Q0 -290 140 -300 L132 -340 L148 -302 L188 -332 L130 -412 L70 -435 Q0 -400 -70 -435 Z" fill="${SHIRT}" stroke="${O}" stroke-width="${SW}" stroke-linejoin="round"/>
        <path d="M-120 -302 L-112 -170 Q0 -160 112 -170 L120 -302 Z" fill="${SKIN}" stroke="${O}" stroke-width="${SW}"/>
        ${[0, 1, 2, 3].map((i) => `<path d="M-90 ${-280 + i * 26} Q-45 ${-268 + i * 26} -12 ${-280 + i * 26} M12 ${-280 + i * 26} Q45 ${-268 + i * 26} 90 ${-280 + i * 26}" stroke="${O}" stroke-width="4" fill="none"/>`).join("")}`;
    } else {
      g += `<path d="M-70 -435 L-130 -412 L-188 -332 L-148 -302 L-132 -340 L-152 -165 Q0 -150 152 -165 L132 -340 L148 -302 L188 -332 L130 -412 L70 -435 Q0 -400 -70 -435 Z" fill="${SHIRT}" stroke="${O}" stroke-width="${SW}" stroke-linejoin="round"/>
        <path d="M-120 -230 Q-60 -215 -20 -235" stroke="${O}" stroke-width="4" fill="none" opacity=".35"/>
        ${T(0, -255, "0", 110, "#fff", "Rubik", 900, "middle", `stroke="${O}" stroke-width="5" paint-order="stroke"`)}`;
    }
    if (drip > 0) for (let i = 0; i < 4; i++) {
      const ph = (drip * 1.2 + i * 0.27) % 1, dx = [-110, -40, 50, 120][i];
      g += `<path d="M${dx} ${-170 + ph * 150} q-10 18 0 26 q10 -8 0 -26 Z" fill="#8B5A3C" stroke="${O}" stroke-width="3" opacity="${1 - ph}"/>`;
    }
  } else {
    headCy = -660; r = 120;
    g += noodle("M-95 -180 L-105 -50", 48) + noodle("M95 -180 L105 -50", 48) + sneaker(-110, 1.25) + sneaker(110, 1.25);
    g += `<path d="M-70 -560 L70 -560 L95 -515 L-95 -515 Z" fill="${SKIN}" stroke="${O}" stroke-width="${SW}" stroke-linejoin="round"/>`;
    if (pose === "flex") for (const sgn of [-1, 1]) g += `<ellipse cx="${sgn * 400}" cy="-470" rx="110" ry="80" transform="rotate(${sgn * 10} ${sgn * 400} -470)" fill="${SKIN}" stroke="${O}" stroke-width="${SW}"/>
        <ellipse cx="${sgn * 470}" cy="-600" rx="62" ry="100" fill="${SKIN}" stroke="${O}" stroke-width="${SW}"/>${C(sgn * 470, -705, 58, SKIN)}`;
    g += `<path d="M-95 -525 L-330 -478 L-370 -330 L-275 -300 L-258 -380 L-205 -165 Q0 -145 205 -165 L258 -380 L275 -300 L370 -330 L330 -478 L95 -525 Q0 -490 -95 -525 Z" fill="${SHIRT}" stroke="${O}" stroke-width="${SW}" stroke-linejoin="round"/>
      <path d="M-240 -420 l15 12 l-12 10 l16 14" stroke="${O}" stroke-width="4" fill="none"/><path d="M230 -300 l-14 10 l12 12 l-15 12" stroke="${O}" stroke-width="4" fill="none"/>
      <path d="M-150 -330 Q0 -290 150 -330" stroke="${O}" stroke-width="5" fill="none" opacity=".35"/>
      <text x="0" y="-330" text-anchor="middle" font-family="Rubik" font-weight="900" font-size="120" fill="#fff" stroke="${O}" stroke-width="5" paint-order="stroke" transform="translate(0,-330) scale(2.1,1) translate(0,330)">0</text>`;
    if (pose !== "flex") for (const sgn of [-1, 1]) g += `<ellipse cx="${sgn * 345}" cy="-330" rx="78" ry="98" fill="${SKIN}" stroke="${O}" stroke-width="${SW}"/>
        <ellipse cx="${sgn * 285}" cy="-215" rx="66" ry="80" transform="rotate(${sgn * -40} ${sgn * 285} -215)" fill="${SKIN}" stroke="${O}" stroke-width="${SW}"/>
        ${C(sgn * 195, -185, 56, SKIN)}<path d="M${sgn * 175} -215 q${sgn * 18} 12 ${sgn * 36} 0" stroke="${O}" stroke-width="4" fill="none"/>`;
  }
  if (halo) g += `<ellipse cx="0" cy="${headCy - r - 70}" rx="${r * 0.8}" ry="${r * 0.2}" fill="none" stroke="${YEL}" stroke-width="22"/><ellipse cx="0" cy="${headCy - r - 70}" rx="${r * 0.8}" ry="${r * 0.2}" fill="none" stroke="${O}" stroke-width="4"/>`;
  g += head({ cy: headCy, r, ...f });
  const k = r / 150;
  const eyes = [-1, 1].map((sgn) => [x + s * sgn * 58 * k, y + s * (headCy - 5 * k)]);
  const out = { svg: `${shadow(x, y - 4, 230 * s * (build === "giant" ? 1.6 : 1))}<g transform="translate(${x},${y}) scale(${s})">${g}</g>`, eyes, headTop: y + s * (headCy - r) };
  [SKIN, SHIRT, HAIR] = keep;
  return out;
}

// ---------- мама ----------
function mom({ x, y, s = 1, pose = "jar", scared = false, jarSticker = 1 }) {
  const eyes = [-1, 1].map((sg) => scared
    ? `${C(sg * 46, -555, 34, "#fff")}<circle cx="${sg * 46}" cy="-555" r="7" fill="${O}"/><circle cx="${sg * 46}" cy="-555" r="40" fill="none" stroke="${O}" stroke-width="7"/><path d="M${sg * 26} -618 L${sg * 66} -626" stroke="${O}" stroke-width="12" stroke-linecap="round"/>`
    : `${C(sg * 46, -555, 34, "#fff")}<circle cx="${sg * 46 + 3}" cy="-548" r="9" fill="${O}"/><path d="M${sg * 46 - 34} -555 A34 34 0 0 1 ${sg * 46 + 34} -555 Z" fill="${SKIN}" stroke="${O}" stroke-width="4"/><circle cx="${sg * 46}" cy="-555" r="40" fill="none" stroke="${O}" stroke-width="7"/><path d="M${sg * 30} -612 L${sg * 64} -604" stroke="${O}" stroke-width="12" stroke-linecap="round"/>`).join("");
  let arms, jarG = "";
  if (pose === "jar") {
    arms = noodle("M-115 -405 C-150 -350 -140 -300 -100 -290") + noodle("M115 -405 C150 -350 140 -300 100 -290");
    jarG = `<g transform="translate(0,-260)">
      <path d="M-85 -90 Q-60 -150 -20 -120 Q10 -165 45 -125 Q80 -150 85 -90 Z" fill="#fff" stroke="${O}" stroke-width="${SW}" stroke-linejoin="round"/>
      ${R(-90, -95, 180, 190, "#2E2A44", 20)}${R(-90, -40, 180, 80, YEL)}${T(0, 12, "ПРОТЕИН", 34)}
      ${at(10, -2, jarSticker, `<g transform="translate(10,-2) rotate(-8)"><rect x="-75" y="-34" width="150" height="66" fill="#FFF6D8" stroke="${O}" stroke-width="4"/>
        <rect x="-30" y="-46" width="60" height="22" fill="#fff" opacity=".7" transform="rotate(6)"/>${T(0, 18, "МУКА", 54, RED, "Caveat", 700)}</g>`)}
    </g>${C(-95, -290, 22, SKIN)}${C(95, -290, 22, SKIN)}`;
  } else { // половник
    arms = noodle("M-115 -405 C-150 -350 -140 -300 -100 -290") + noodle("M115 -405 C170 -420 190 -470 175 -520") +
      `<path d="M175 -520 L175 -700" stroke="#9AA3B5" stroke-width="16" stroke-linecap="round"/><path d="M175 -520 L175 -700" stroke="${O}" stroke-width="4" stroke-linecap="round" opacity=".5"/>
       <path d="M130 -700 a45 35 0 0 0 90 0 Z" fill="#B9C2D3" stroke="${O}" stroke-width="${SW}"/>${C(175, -525, 22, SKIN)}${C(-100, -290, 22, SKIN)}`;
  }
  const g = `
    ${noodle("M-50 -130 L-52 -40")}${noodle("M50 -130 L52 -40")}
    <path d="M-95 -45 h80 v-10 a20 20 0 0 0 -20 -20 h-40 a20 20 0 0 0 -20 20 Z" fill="#8C3B5E" stroke="${O}" stroke-width="${SW}"/>
    <path d="M15 -45 h80 v-10 a20 20 0 0 0 -20 -20 h-40 a20 20 0 0 0 -20 20 Z" fill="#8C3B5E" stroke="${O}" stroke-width="${SW}"/>
    <path d="M-70 -440 L-120 -415 L-165 -120 Q0 -100 165 -120 L120 -415 L70 -440 Q0 -415 -70 -440 Z" fill="#2FA59A" stroke="${O}" stroke-width="${SW}" stroke-linejoin="round"/>
    <path d="M-80 -360 Q0 -345 80 -360 L100 -140 Q0 -125 -100 -140 Z" fill="#FFB3CF" stroke="${O}" stroke-width="${SW}" stroke-linejoin="round"/>
    <rect x="-12" y="-468" width="24" height="36" fill="${SKIN}" stroke="${O}" stroke-width="${SW}"/>
    ${C(0, -690, 52, "#7A5C48")}${C(0, -560, 120, SKIN)}
    <path d="M-122 -560 Q-125 -680 0 -682 Q125 -680 122 -560 Q95 -625 30 -630 Q-10 -600 -40 -632 Q-100 -625 -122 -560 Z" fill="#7A5C48" stroke="${O}" stroke-width="${SW}" stroke-linejoin="round"/>
    ${eyes}<line x1="-8" y1="-558" x2="8" y2="-558" stroke="${O}" stroke-width="7"/>
    <ellipse cx="-80" cy="-512" rx="18" ry="10" fill="#FF8A8A" opacity=".5"/><ellipse cx="80" cy="-512" rx="18" ry="10" fill="#FF8A8A" opacity=".5"/>
    ${scared ? `<rect x="-26" y="-505" width="52" height="30" rx="6" fill="#fff" stroke="${O}" stroke-width="5"/>` : `<path d="M-28 -495 Q0 -482 30 -500" fill="none" stroke="${O}" stroke-width="7" stroke-linecap="round"/>`}
    ${arms}${jarG}`;
  return `${shadow(x, y - 4, 200 * s)}<g transform="translate(${x},${y}) scale(${s})">${g}</g>`;
}

// ---------- второстепенные люди ----------
// face: calm | shock | happy ; hat: none | toque | scarf | cap ; holding: none | jar | baguette | card
function person({ x, y, s = 1, body = "#5B8DEF", skin = "#F3C6A0", hair = "#3B2A20", hat = "none", faceType = "calm", holding = "none", coat = false, glasses = false, cardText = "" }) {
  const eye = (sx) => faceType === "shock" ? `${C(sx, -455, 26, "#fff")}<circle cx="${sx}" cy="-455" r="5" fill="${O}"/>` : `${C(sx, -455, 22, "#fff")}<circle cx="${sx + 3}" cy="-452" r="8" fill="${O}"/>`;
  let g = `${noodle("M-35 -110 L-38 -30", 14, "#3A3550")}${noodle("M35 -110 L38 -30", 14, "#3A3550")}
    <ellipse cx="-42" cy="-28" rx="34" ry="16" fill="#3A3550" stroke="${O}" stroke-width="${SW}"/><ellipse cx="42" cy="-28" rx="34" ry="16" fill="#3A3550" stroke="${O}" stroke-width="${SW}"/>
    <path d="M-60 -345 Q0 -365 60 -345 L95 -110 Q0 -95 -95 -110 Z" fill="${coat ? "#fff" : body}" stroke="${O}" stroke-width="${SW}" stroke-linejoin="round"/>
    ${coat ? `<path d="M0 -350 L0 -110" stroke="${O}" stroke-width="4"/><path d="M-30 -350 L0 -300 L30 -350" fill="${body}" stroke="${O}" stroke-width="4"/>` : ""}
    ${C(0, -450, 95, skin)}`;
  if (hat === "toque") g += `<path d="M-70 -520 Q-110 -600 -50 -610 Q-30 -670 20 -640 Q80 -660 85 -600 Q115 -560 70 -520 Z" fill="#fff" stroke="${O}" stroke-width="${SW}"/><rect x="-72" y="-535" width="144" height="34" rx="8" fill="#fff" stroke="${O}" stroke-width="${SW}"/>`;
  else if (hat === "scarf") g += `<path d="M-100 -440 Q-110 -560 0 -565 Q110 -560 100 -440 Q90 -520 0 -525 Q-90 -520 -100 -440 Z" fill="#E8607A" stroke="${O}" stroke-width="${SW}"/><path d="M-60 -380 Q0 -350 60 -380 L50 -340 Q0 -330 -50 -340 Z" fill="#E8607A" stroke="${O}" stroke-width="${SW}"/>`;
  else if (hat === "cap") g += `<path d="M-92 -480 Q-90 -560 0 -560 Q90 -560 92 -480 Z" fill="${body}" stroke="${O}" stroke-width="${SW}"/><path d="M60 -490 L150 -485 L150 -470 L70 -470 Z" fill="${body}" stroke="${O}" stroke-width="${SW}"/>`;
  else g += `<path d="M-92 -470 Q-95 -560 0 -555 Q95 -560 92 -470 Q60 -520 0 -515 Q-60 -520 -92 -470 Z" fill="${hair}" stroke="${O}" stroke-width="${SW}"/>`;
  g += eye(-35) + eye(35);
  if (glasses) g += `<circle cx="-35" cy="-455" r="30" fill="none" stroke="${O}" stroke-width="6"/><circle cx="35" cy="-455" r="30" fill="none" stroke="${O}" stroke-width="6"/><line x1="-5" y1="-455" x2="5" y2="-455" stroke="${O}" stroke-width="6"/>`;
  g += faceType === "shock" ? `<rect x="-22" y="-410" width="44" height="34" rx="6" fill="#7A1F2E" stroke="${O}" stroke-width="5"/>`
    : faceType === "happy" ? `<path d="M-30 -405 Q0 -380 30 -405" fill="none" stroke="${O}" stroke-width="7" stroke-linecap="round"/>`
    : `<path d="M-22 -400 L22 -400" stroke="${O}" stroke-width="7" stroke-linecap="round"/>`;
  if (holding === "jar") g += `${noodle("M-60 -320 C-90 -280 -60 -240 -30 -240", 12, skin)}${noodle("M60 -320 C90 -280 60 -240 30 -240", 12, skin)}
      ${R(-40, -300, 80, 90, "#BFE6A8", 12)}${R(-44, -318, 88, 22, "#E0B040", 6)}${C(-32, -240, 16, skin)}${C(32, -240, 16, skin)}`;
  else if (holding === "baguette") g += `<g transform="translate(0,-250) rotate(-35)"><rect x="-120" y="-22" width="240" height="44" rx="22" fill="#E8A75C" stroke="${O}" stroke-width="${SW}"/>${[-60, 0, 60].map((d) => `<path d="M${d - 14} -12 l20 20" stroke="${O}" stroke-width="4"/>`).join("")}</g>${C(-50, -230, 18, skin)}${C(40, -290, 18, skin)}`;
  else if (holding === "card") g += `${noodle("M60 -320 C110 -360 120 -420 110 -470", 12, skin)}${R(70, -560, 90, 70, "#fff", 6)}${T(115, -510, cardText, 46)}${C(110, -472, 16, skin)}`;
  return `${shadow(x, y - 4, 120 * s)}<g transform="translate(${x},${y}) scale(${s})">${g}</g>`;
}
function dog(x, y, s = 1, col = "#C98A5A", ph = 0) {
  const b = Math.sin(ph * 12) * 6;
  return `${shadow(x, y - 2, 70 * s)}<g transform="translate(${x},${y + b}) scale(${s})">
    ${noodle("M-40 -40 L-44 -5", 12, col)}${noodle("M40 -40 L44 -5", 12, col)}
    <ellipse cx="0" cy="-60" rx="70" ry="38" fill="${col}" stroke="${O}" stroke-width="${SW}"/>
    <path d="M-68 -70 q-40 -30 -30 -60" stroke="${O}" stroke-width="16" fill="none" stroke-linecap="round"/><path d="M-68 -70 q-40 -30 -30 -60" stroke="${col}" stroke-width="6" fill="none" stroke-linecap="round"/>
    ${C(60, -100, 40, col)}<ellipse cx="88" cy="-92" rx="18" ry="13" fill="${O}"/>
    <path d="M40 -130 q-8 -30 14 -38 q6 22 2 40 Z" fill="${col}" stroke="${O}" stroke-width="5"/>
    <circle cx="66" cy="-108" r="6" fill="${O}"/><path d="M80 -78 q6 18 -4 26" stroke="#FF6F8A" stroke-width="10" fill="none" stroke-linecap="round"/></g>`;
}
function waterDrop(x, y, s, ph) {
  const b = Math.abs(Math.sin(ph * 10)) * 14;
  return `<g transform="translate(${x},${y - b}) scale(${s})">${noodle("M-14 -6 L-18 14", 6, "#9FE3FF")}${noodle("M14 -6 L18 14", 6, "#9FE3FF")}
    <path d="M0 -130 Q60 -40 50 -10 Q40 30 0 30 Q-40 30 -50 -10 Q-60 -40 0 -130 Z" fill="#9FE3FF" stroke="${O}" stroke-width="${SW}"/>
    <circle cx="-14" cy="-24" r="6" fill="${O}"/><circle cx="16" cy="-24" r="6" fill="${O}"/><path d="M-12 -4 Q2 8 16 -4" stroke="${O}" stroke-width="5" fill="none"/>
    ${noodle(`M40 -30 Q70 -60 ${70 + Math.sin(ph * 14) * 14} -90`, 6, "#9FE3FF")}</g>`;
}
function jar(x, y, w, h) {
  return `${shadow(x, y - 4, w * 0.7)}<g transform="translate(${x - w / 2},${y - h})">
    ${R(0, 40, w, h - 40, "#2E2A44", 36)}${R(w * 0.08, 0, w * 0.84, 70, RED, 16)}${R(0, h * 0.3, w, h * 0.42, YEL)}
    ${T(w / 2, h * 0.3 + 88, "ПРОТЕИН", w * 0.17)}
    <path transform="translate(${w / 2},${h * 0.3 + 104}) scale(${w / 460})" d="M12 0 l-40 70 h34 l-18 62 l56 -84 h-36 l22 -48 Z" fill="${RED}" stroke="${O}" stroke-width="5" stroke-linejoin="round"/>
    ${T(w / 2, h * 0.72 - 16, "1 КГ · ШОКОЛАД", w * 0.093, O, "Rubik", 800)}
    <path d="M${w * 0.12} 110 Q${w * 0.1} ${h * 0.2} ${w * 0.14} ${h * 0.26}" stroke="#fff" stroke-width="12" stroke-linecap="round" opacity=".35" fill="none"/></g>`;
}
function shakerSmall(x, y, s = 1, fill = 0.6) {
  return `<g transform="translate(${x},${y}) scale(${s})"><rect x="-30" y="-110" width="60" height="110" rx="12" fill="#E8F7FF" stroke="${O}" stroke-width="5"/>
    <rect x="-30" y="${-110 * fill}" width="60" height="${110 * fill}" rx="10" fill="#C99A6B"/><rect x="-30" y="-110" width="60" height="110" rx="12" fill="none" stroke="${O}" stroke-width="5"/>
    <rect x="-36" y="-130" width="72" height="24" rx="7" fill="${RED}" stroke="${O}" stroke-width="5"/></g>`;
}
function table(x, y, w = 300) {
  return `${shadow(x, y - 2, w * 0.56)}${R(x - w / 2, y - 108, w, 30, "#C98A5A", 8)}${R(x - w / 2 + 25, y - 78, 24, 76, "#A86C42")}${R(x + w / 2 - 49, y - 78, 24, 76, "#A86C42")}`;
}
function loaf(x, y, s = 1) {
  return `<g transform="translate(${x},${y}) scale(${s})"><path d="M-70 0 Q-80 -50 -30 -55 L50 -58 Q85 -50 75 0 Z" fill="#E8A75C" stroke="${O}" stroke-width="${SW}" stroke-linejoin="round"/>
    <path d="M-30 -40 l12 -14 M5 -42 l12 -14 M40 -42 l12 -14" stroke="${O}" stroke-width="4"/></g>`;
}
function puff(x, y, s, k = 1) {
  if (k <= 0) return "";
  const cs = [[0, 0, 46], [50, -20, 38], [30, -60, 30], [-30, -40, 34], [80, 15, 30], [-50, 10, 28]];
  return `<g transform="translate(${x},${y}) scale(${s * k})" opacity="${Math.min(1, 1.6 - k * 0.6)}">${cs.map(([cx, cy, r]) => C(cx, cy, r, "#fff")).join("")}</g>`;
}

// ---------- фоны ----------
function bgPaper() {
  let g = "";
  for (let x = 0; x <= W; x += 45) g += `<line x1="${x}" y1="0" x2="${x}" y2="${H}" stroke="#8DB6E8" stroke-width="2" opacity=".55"/>`;
  for (let y = 0; y <= H; y += 45) g += `<line x1="0" y1="${y}" x2="${W}" y2="${y}" stroke="#8DB6E8" stroke-width="2" opacity=".55"/>`;
  return `<rect width="${W}" height="${H}" fill="#FBF8EF"/>${g}<line x1="96" y1="0" x2="96" y2="${H}" stroke="#F07A7A" stroke-width="4"/>`;
}
const BLOB = "M170 620 C260 470 560 500 760 540 C960 580 1010 760 960 930 C910 1100 700 1150 480 1140 C250 1130 90 1060 100 880 C110 760 120 700 170 620 Z";
function bgMix(color, floor = true) {
  return bgPaper() + `<path d="${BLOB}" fill="${color}" opacity=".7"/><path d="M150 700 C300 560 700 560 900 640" stroke="${color}" stroke-width="40" stroke-linecap="round" opacity=".45" fill="none"/>` +
    (floor ? `<path d="M60 1165 Q300 1150 540 1162 T1040 1158" stroke="#2B2B2B" stroke-width="5" fill="none"/>` : "");
}
const DEFS = `<defs>
  ${[0, 1, 2].map((i) => `<filter id="wob${i}" x="-5%" y="-5%" width="110%" height="110%"><feTurbulence type="fractalNoise" baseFrequency="0.025" numOctaves="2" seed="${4 + i * 7}"/><feDisplacementMap in="SourceGraphic" scale="7"/></filter>`).join("")}
  <filter id="glow" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="10"/></filter>
  <radialGradient id="spot" cx="50%" cy="0%" r="100%"><stop offset="0%" stop-color="#FFF6C0" stop-opacity=".85"/><stop offset="100%" stop-color="#FFF6C0" stop-opacity="0"/></radialGradient>
  <clipPath id="earthClip"><circle cx="540" cy="1000" r="330"/></clipPath>
</defs>`;
