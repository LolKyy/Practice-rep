// Обложка 1080×1920. Всё важное — в зоне обрезки 3:4 (y 240–1680) и левее кнопок TikTok (x < 940).
function cover() {
  let s = bgPaper();
  // две половины цвета дня
  s += `<path d="M96 600 L590 600 L520 900 L600 1200 L500 1520 L96 1520 Z" fill="${PAL.mint}" opacity=".75"/>
        <path d="M590 600 L1000 600 L1000 1520 L500 1520 L600 1200 L520 900 Z" fill="${PAL.purple}" opacity=".75"/>
        <path d="M590 600 L520 900 L600 1200 L500 1520" fill="none" stroke="${O}" stroke-width="10" stroke-linejoin="round"/>`;
  // слева — дрыщ
  s += hero({ x: 290, y: 1400, s: 0.7, pose: "shaker", eyes: "normal", brows: "raised", mouth: "smile", cowlick: "up" }).svg;
  // справа — гигант с лазерами
  const h = hero({ x: 720, y: 1400, s: 0.55, build: "giant", eyes: "laser", brows: "angry", mouth: "teeth", cowlick: "up" });
  const tg = [860, 1540];
  s += h.svg + h.eyes.map(([ex, ey]) => `<line x1="${ex}" y1="${ey}" x2="${tg[0]}" y2="${tg[1]}" stroke="${RED}" stroke-width="34" stroke-linecap="round" opacity=".45" filter="url(#glow)"/>
    <line x1="${ex}" y1="${ey}" x2="${tg[0]}" y2="${tg[1]}" stroke="${RED}" stroke-width="14" stroke-linecap="round"/><line x1="${ex}" y1="${ey}" x2="${tg[0]}" y2="${tg[1]}" stroke="#fff" stroke-width="4" stroke-linecap="round"/>`).join("");
  s += puff(850, 1530, 0.8, 1);
  // подписи дней и веса
  const tag = (x, y, rot, day, kg) => `<g transform="translate(${x},${y}) rotate(${rot})">
    <rect x="-170" y="-60" width="340" height="120" rx="18" fill="#fff" stroke="${O}" stroke-width="${SW + 2}"/>
    ${T(30, 22, "ДЕНЬ", 54, O, "Rubik", 900, "end")}${T(48, 26, day, 72, RED, "Rubik", 900, "start")}
    <rect x="-95" y="66" width="190" height="56" rx="28" fill="${O}"/>${T(0, 106, kg, 36, YEL, "Rubik", 900)}</g>`;
  s += tag(290, 700, -5, "1", "60 КГ") + tag(740, 700, 5, "15", "140 КГ");
  s += sfxText(515, 860, 0, "→", 150, YEL);
  // заголовок
  s += `<g transform="rotate(-3 520 420)">
    ${T(520, 400, "30 ДНЕЙ", 190, "#fff", "Oswald", 700, "middle", `stroke="${O}" stroke-width="22" stroke-linejoin="round" paint-order="stroke"`)}
    ${T(520, 540, "ТОЛЬКО ПРОТЕИН", 112, RED, "Oswald", 700, "middle", `stroke="${O}" stroke-width="18" stroke-linejoin="round" paint-order="stroke"`)}</g>`;
  s += sfxText(860, 300, 14, "?!", 110, YEL);
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">${DEFS}<g filter="url(#wob0)">${s}</g></svg>`;
}
window.renderCover = (safe) => {
  let svg = cover();
  if (safe) svg = svg.replace("</svg>", `<rect y="0" width="${W}" height="240" fill="#000" opacity=".55"/><rect y="1680" width="${W}" height="240" fill="#000" opacity=".55"/>
    <rect x="940" y="700" width="140" height="980" fill="${RED}" opacity=".3"/></svg>`);
  document.getElementById("root").innerHTML = svg;
};
