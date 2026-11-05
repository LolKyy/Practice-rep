// Обложка ПВЗ
function cover() {
  let s = bgPaper() + `<g transform="translate(0,140)">${LOCS.pvz(true)}</g>`;
  s += boxMonster(740, 1220, 1.15, 1, 0) + zheka({ x: 330, y: 1460, s: 0.85, eyes: "calm", mouth: "talk", look: 1 });
  s += `<g transform="translate(330,770)"><rect x="-200" y="-55" width="400" height="110" rx="40" fill="#fff" stroke="${O}" stroke-width="${SW}"/><path d="M40 52 L70 105 L-10 54" fill="#fff" stroke="${O}" stroke-width="${SW}" stroke-linejoin="round"/>${T(0, 16, "НЕ МОЙ РАЗМЕР", 40)}</g>`;
  s += `<g transform="rotate(-3 520 420)">${T(520, 380, "ПРАВИЛА", 170, "#fff", "Oswald", 700, "middle", `stroke="${O}" stroke-width="20" stroke-linejoin="round" paint-order="stroke"`)}
    ${T(520, 520, "НОЧНОЙ СМЕНЫ В ПВЗ", 92, RED, "Oswald", 700, "middle", `stroke="${O}" stroke-width="16" stroke-linejoin="round" paint-order="stroke"`)}</g>`;
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">${DEFS.replace("</defs>", LOC_CLIP + "</defs>")}<g filter="url(#wob0)">${s}</g></svg>`;
}
window.renderCover = (safe) => {
  let svg = cover();
  if (safe) svg = svg.replace("</svg>", `<rect y="0" width="${W}" height="240" fill="#000" opacity=".55"/><rect y="1680" width="${W}" height="240" fill="#000" opacity=".55"/><rect x="940" y="700" width="140" height="980" fill="${RED}" opacity=".3"/></svg>`);
  document.getElementById("root").innerHTML = svg;
};
