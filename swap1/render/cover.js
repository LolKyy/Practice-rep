// Обложка «рука ↔ нога». Важное — в y 240–1680 и x < 940.
function cover() {
  let s = bgPaper() + `<path d="${BLOB}" transform="translate(0,120)" fill="${PAL.yellow}" opacity=".75"/>`;
  s += hero({ x: 560, y: 1440, s: 1.0, build: "swap", eyes: "dots", brows: "raised", mouth: "o", cowlick: "spiral" }).svg;
  s += sticker(300, 760, -8, "НОГА", 70) + arrow("M300 810 Q290 850 260 870", "M250 846 L258 874 L284 862");
  s += sticker(200, 1500, 6, "РУКА", 70) + arrow("M250 1450 Q300 1420 320 1400", "M296 1396 L324 1398 L318 1424");
  s += `<g transform="rotate(-3 520 420)">
    ${T(520, 400, "РУКА ↔ НОГА", 150, "#fff", "Oswald", 700, "middle", `stroke="${O}" stroke-width="20" stroke-linejoin="round" paint-order="stroke"`)}
    ${T(520, 540, "НА ОДИН ДЕНЬ", 112, RED, "Oswald", 700, "middle", `stroke="${O}" stroke-width="18" stroke-linejoin="round" paint-order="stroke"`)}</g>`;
  s += sfxText(820, 760, 10, "?!", 130, YEL);
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">${DEFS}<g filter="url(#wob0)">${s}</g></svg>`;
}
window.renderCover = (safe) => {
  let svg = cover();
  if (safe) svg = svg.replace("</svg>", `<rect y="0" width="${W}" height="240" fill="#000" opacity=".55"/><rect y="1680" width="${W}" height="240" fill="#000" opacity=".55"/>
    <rect x="940" y="700" width="140" height="980" fill="${RED}" opacity=".3"/></svg>`);
  document.getElementById("root").innerHTML = svg;
};
