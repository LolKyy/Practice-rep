// Библиотека детальных локаций. Каждая рисуется внутри пятна BLOB (окно в мир на тетради).
const LOC_CLIP = `<clipPath id="room"><path d="${BLOB}"/></clipPath>`;
const wrapLoc = (inner, tint = null) => `<g clip-path="url(#room)">${inner}${tint ? `<rect x="0" y="400" width="1080" height="900" fill="${tint}"/>` : ""}</g><path d="${BLOB}" fill="none" stroke="${O}" stroke-width="6"/>`;
const wall = (col, stripe) => { let r = `<rect x="0" y="400" width="1080" height="800" fill="${col}"/>`; if (stripe) for (let x = 60; x < 1080; x += 70) r += `<line x1="${x}" y1="400" x2="${x}" y2="1060" stroke="${stripe}" stroke-width="10"/>`; return r; };
const floorWood = (y = 1060) => `<rect x="0" y="${y}" width="1080" height="240" fill="#C98A5A"/>${[...Array(9)].map((_, i) => `<line x1="0" y1="${y + 20 + i * 22}" x2="1080" y2="${y + 20 + i * 22}" stroke="#A86C42" stroke-width="3"/>`).join("")}`;
const floorTile = (y = 1060, a = "#E3E8F2", b = "#C9D1DE") => `<rect x="0" y="${y}" width="1080" height="240" fill="${a}"/>${[...Array(14)].map((_, i) => `<line x1="${i * 80}" y1="${y}" x2="${i * 80 - 40}" y2="${y + 240}" stroke="${b}" stroke-width="4"/>`).join("")}<line x1="0" y1="${y + 60}" x2="1080" y2="${y + 60}" stroke="${b}" stroke-width="4"/>`;
const windowBox = (x, y, w, h, sky, sun = null, curtains = "#6FB98F") => `<g transform="translate(${x},${y})">${R(-w / 2, -h / 2, w, h, sky, 8)}${sun ? C(w * 0.18, -h * 0.22, 32, sun) : ""}
  <line x1="0" y1="${-h / 2}" x2="0" y2="${h / 2}" stroke="${O}" stroke-width="8"/><line x1="${-w / 2}" y1="0" x2="${w / 2}" y2="0" stroke="${O}" stroke-width="8"/>
  ${curtains ? `<path d="M${-w / 2 - 30} ${-h / 2 - 20} Q${-w / 2 - 10} 0 ${-w / 2 - 40} ${h / 2 + 20} L${-w / 2 + 20} ${h / 2 + 20} Q${-w / 2} 0 ${-w / 2 + 20} ${-h / 2 - 20} Z" fill="${curtains}" stroke="${O}" stroke-width="5"/>
  <path d="M${w / 2 + 30} ${-h / 2 - 20} Q${w / 2 + 10} 0 ${w / 2 + 40} ${h / 2 + 20} L${w / 2 - 20} ${h / 2 + 20} Q${w / 2} 0 ${w / 2 - 20} ${-h / 2 - 20} Z" fill="${curtains}" stroke="${O}" stroke-width="5"/>${R(-w / 2 - 50, -h / 2 - 35, w + 100, 20, "#8B5A3C", 6)}` : ""}</g>`;
const cityWindow = (x, y, w, h, night = false) => {
  let b = "";
  [[-0.4, 0.5], [-0.15, 0.75], [0.12, 0.45], [0.35, 0.65]].forEach(([dx, hh], i) => {
    const bx = x + dx * w, bh = h * hh;
    b += `<rect x="${bx - 35}" y="${y + h / 2 - bh}" width="70" height="${bh}" fill="${night ? "#2E2A55" : "#9AA9C9"}" stroke="${O}" stroke-width="3"/>`;
    for (let k = 0; k < 4; k++) b += `<rect x="${bx - 20 + (k % 2) * 24}" y="${y + h / 2 - bh + 14 + Math.floor(k / 2) * 30}" width="14" height="16" fill="${night && (i + k) % 2 ? "#FFD27A" : "#DDE6F5"}"/>`;
  });
  return `<g><clipPath id="cw${x}"><rect x="${x - w / 2}" y="${y - h / 2}" width="${w}" height="${h}"/></clipPath><rect x="${x - w / 2}" y="${y - h / 2}" width="${w}" height="${h}" fill="${night ? "#1B1F4A" : "#BFE6FF"}"/>
    <g clip-path="url(#cw${x})">${b}</g><rect x="${x - w / 2}" y="${y - h / 2}" width="${w}" height="${h}" fill="none" stroke="${O}" stroke-width="8"/><line x1="${x}" y1="${y - h / 2}" x2="${x}" y2="${y + h / 2}" stroke="${O}" stroke-width="6"/></g>`;
};
const lamp = (x, y = 400, len = 120, col = YEL) => `<line x1="${x}" y1="${y}" x2="${x}" y2="${y + len}" stroke="${O}" stroke-width="5"/><path d="M${x - 50} ${y + len + 40} L${x + 50} ${y + len + 40} L${x + 25} ${y + len} L${x - 25} ${y + len} Z" fill="${col}" stroke="${O}" stroke-width="5"/>`;
const plant = (x, y, s = 1) => `<g transform="translate(${x},${y}) scale(${s})">${R(-30, -60, 60, 60, "#C9744C", 6)}<path d="M0 -60 q-40 -60 -10 -110 q10 50 10 110 q10 -70 50 -90 q-10 60 -50 90" fill="#3FB27F" stroke="${O}" stroke-width="4"/></g>`;
const kover = (x, y, w = 360, h = 260) => `<g transform="translate(${x},${y})">${R(-w / 2, -h / 2, w, h, "#B23A3A", 10)}${R(-w / 2 + 30, -h / 2 + 30, w - 60, h - 60, "#E8B04B", 6)}
  <path d="M0 ${-h / 2 + 50} L${w / 3} 0 L0 ${h / 2 - 50} L${-w / 3} 0 Z" fill="#2E5AA8" stroke="${O}" stroke-width="5"/><path d="M0 -40 L60 0 L0 40 L-60 0 Z" fill="#E8B04B" stroke="${O}" stroke-width="4"/>${C(0, 0, 14, "#B23A3A")}
  ${[...Array(12)].map((_, i) => `<line x1="${-w / 2 + 10 + i * (w - 20) / 11}" y1="${h / 2}" x2="${-w / 2 + 10 + i * (w - 20) / 11}" y2="${h / 2 + 20}" stroke="${O}" stroke-width="4"/>`).join("")}</g>`;
const poster = (x, y, rot, fill, inner) => `<g transform="translate(${x},${y}) rotate(${rot})">${R(-70, -90, 140, 180, fill, 6)}${inner}</g>`;

const LOCS = {
  bedroom(night = false) {
    let r = wall("#F7D9C4", "#E9BFA5") + kover(560, 700);
    r += night ? windowBox(250, 700, 220, 260, "#1B1F4A", "#FFF6C0") : windowBox(250, 700, 220, 260, "#BFE6FF", "#FFE58A");
    r += poster(870, 620, 4, "#2E2A44", `${T(0, -30, "ROCK", 40, YEL)}${C(0, 30, 34, RED)}${C(0, 30, 10, "#2E2A44")}`);
    r += `${R(760, 790, 220, 20, "#8B5A3C", 4)}${["#E8607A", "#5B8DEF", "#3FB27F", "#E8B04B"].map((c, i) => R(775 + i * 30, 720 - (i % 2) * 14, 26, 70 + (i % 2) * 14, c, 3)).join("")}`;
    r += lamp(560) + floorWood() + `<ellipse cx="520" cy="1130" rx="300" ry="40" fill="#7FB3E8" stroke="${O}" stroke-width="5"/>`;
    r += `${R(640, 930, 340, 140, "#6FA8DC", 18)}${[...Array(6)].map((_, i) => `<line x1="${660 + i * 55}" y1="935" x2="${660 + i * 55}" y2="1065" stroke="#fff" stroke-width="6" opacity=".6"/>`).join("")}${R(620, 1060, 380, 40, "#8B5A3C", 10)}${R(850, 880, 120, 80, "#fff", 28)}`;
    r += `<path d="M330 1110 q20 -30 50 -10 l20 20 q-30 20 -70 -10 Z" fill="#fff" stroke="${O}" stroke-width="4"/>`;
    return wrapLoc(r, night ? "rgba(20,20,60,.45)" : null);
  },
  bathroom() {
    let r = wall("#CFEFE8") + `${[...Array(13)].map((_, i) => `<line x1="${i * 90}" y1="400" x2="${i * 90}" y2="1060" stroke="#A9D9CF" stroke-width="4"/>`).join("")}${[...Array(8)].map((_, i) => `<line x1="0" y1="${430 + i * 90}" x2="1080" y2="${430 + i * 90}" stroke="#A9D9CF" stroke-width="4"/>`).join("")}`;
    r += `<rect x="320" y="540" width="440" height="380" rx="30" fill="#CDEBFA" stroke="${O}" stroke-width="${SW}"/><path d="M380 600 L460 560 M380 680 L520 580" stroke="#fff" stroke-width="12" opacity=".7"/>
      ${R(330, 980, 420, 70, "#F4F7FB", 20)}${R(500, 1050, 80, 110, "#E3E8F2")}${R(800, 820, 120, 160, "#fff", 10)}<line x1="800" y1="900" x2="920" y2="900" stroke="${O}" stroke-width="4"/>
      ${R(170, 640, 90, 30, "#fff", 6)}<rect x="185" y="600" width="18" height="40" rx="6" fill="#5BC0EB" stroke="${O}" stroke-width="3"/><rect x="215" y="610" width="18" height="30" rx="6" fill="#E8607A" stroke="${O}" stroke-width="3"/>
      <path d="M140 760 q40 -10 60 40 l0 160 q-30 10 -60 0 Z" fill="#E8607A" stroke="${O}" stroke-width="4"/>`;
    return wrapLoc(r + floorTile(1060, "#E3E8F2", "#C9D1DE"));
  },
  hallway() {
    let r = wall("#E8D8C0", "#D9C5A6") + `${R(620, 560, 260, 600, "#8B5A3C", 8)}${C(840, 860, 12, YEL)}${R(650, 600, 200, 220, "#A86C42", 6)}
      ${R(160, 600, 300, 18, "#8B5A3C", 4)}${[200, 280, 360, 430].map((x) => `<circle cx="${x}" cy="630" r="8" fill="${O}"/>`).join("")}
      <path d="M190 630 l-30 160 l80 0 Z" fill="#5B8DEF" stroke="${O}" stroke-width="4"/><path d="M350 630 l-40 200 l90 0 Z" fill="#3FB27F" stroke="${O}" stroke-width="4"/>
      <ellipse cx="530" cy="700" rx="60" ry="90" fill="#CDEBFA" stroke="${O}" stroke-width="6"/>`;
    r += floorWood() + `${R(150, 1110, 90, 30, "#2E2A44", 10)}${R(250, 1115, 90, 30, "#E8607A", 10)}${R(380, 1120, 200, 24, "#B23A3A", 6)}`;
    return wrapLoc(r);
  },
  street() {
    let r = `<rect x="0" y="400" width="1080" height="800" fill="#BFE6FF"/>${C(900, 520, 50, "#FFE58A")}
      ${R(96, 520, 460, 640, "#E3D2C0")}${[...Array(3)].map((_, i) => R(140 + i * 140, 560, 90, 80, "#9FD8F5", 4)).join("")}${R(220, 760, 200, 400, "#6B4A38")}${R(160, 700, 320, 50, "#8B5A3C", 6)}${T(320, 738, "ПОДЪЕЗД №3", 28, "#FFE9C7")}
      <rect x="600" y="640" width="20" height="440" fill="#5A5A6A" stroke="${O}" stroke-width="4"/><path d="M610 640 q40 -30 80 0" stroke="${O}" stroke-width="8" fill="none"/>${C(690, 650, 14, YEL)}
      <path d="M880 1080 L880 780" stroke="#8B5A3C" stroke-width="22"/>${C(880, 740, 90, "#6CCB7A")}${C(830, 790, 60, "#5BB86B")}${C(940, 790, 60, "#5BB86B")}
      <rect x="0" y="1060" width="1080" height="240" fill="#9AA0AE"/><line x1="0" y1="1080" x2="1080" y2="1080" stroke="#7A8090" stroke-width="6"/>
      ${R(640, 1060, 360, 30, "#8B5A3C", 6)}${R(660, 1090, 20, 70, "#6B4A38")}${R(960, 1090, 20, 70, "#6B4A38")}`;
    return wrapLoc(r);
  },
  metro() {
    let r = `<rect x="0" y="400" width="1080" height="800" fill="#DCE3EE"/>`;
    for (const x of [130, 440, 750]) r += `${R(x, 620, 220, 170, "#1B1F3A", 22)}${[0, 1, 2].map((i) => `<line x1="${x + 20 + i * 70}" y1="${660 + i * 30}" x2="${x + 70 + i * 70}" y2="${660 + i * 30}" stroke="#FFD27A" stroke-width="6" opacity=".7"/>`).join("")}`;
    r += `${R(140, 545, 800, 56, "#fff", 8)}${T(170, 584, "ПРОТЕИН 1 КГ — 2 500 ₽", 28, RED, "Rubik", 900, "start")}${T(910, 584, "СХЕМА ЛИНИЙ", 24, O, "Rubik", 800, "end")}
      <rect x="0" y="520" width="1080" height="16" fill="#9AA3B5" stroke="${O}" stroke-width="4"/>${[380, 700].map((x) => `<rect x="${x}" y="520" width="16" height="540" fill="#C9D1DE" stroke="${O}" stroke-width="4"/>`).join("")}
      ${R(96, 930, 984, 130, "#5B8DEF", 20)}${R(96, 1040, 984, 30, "#3A5CB0")}<rect x="0" y="1070" width="1080" height="200" fill="#8C93A3"/>${[...Array(6)].map((_, i) => `<line x1="${i * 200}" y1="1070" x2="${i * 200 + 80}" y2="1260" stroke="#7A8090" stroke-width="4"/>`).join("")}`;
    r += person({ x: 520, y: 1030, s: 0.48, body: "#8E7CC3", hair: "#222", faceType: "calm" });
    return wrapLoc(r);
  },
  office() {
    let r = wall("#E6ECF5") + cityWindow(300, 700, 360, 280) + `${R(560, 560, 300, 200, "#fff", 8)}${T(710, 610, "KPI", 40, "#2C5BD8")}<path d="M590 730 L650 690 L710 710 L780 640 L840 620" stroke="${RED}" stroke-width="8" fill="none"/>
      ${R(900, 760, 90, 200, "#DDE6F5", 10)}${R(915, 680, 60, 90, "#9FD8F5", 20)}${plant(150, 1060, 1.1)}`;
    return wrapLoc(r + floorTile(1060, "#C9CFDB", "#B3BAC8"));
  },
  canteen() {
    let r = wall("#FCE7C8", "#F3D7AE") + `${R(560, 540, 380, 260, "#2E2A44", 10)}${T(750, 590, "МЕНЮ", 40, "#fff")}${T(600, 650, "КОТЛЕТА ........ 89 ₽", 24, YEL, "Rubik", 800, "start")}${T(600, 700, "ПЮРЕ ............ 45 ₽", 24, YEL, "Rubik", 800, "start")}${T(600, 750, "КОМПОТ ......... 30 ₽", 24, YEL, "Rubik", 800, "start")}
      ${R(96, 820, 984, 110, "#C9D1E0", 8)}${[...Array(5)].map((_, i) => `<ellipse cx="${200 + i * 170}" cy="815" rx="60" ry="18" fill="#E8B04B" stroke="${O}" stroke-width="4"/>`).join("")}${plant(180, 800, 0.8)}`;
    return wrapLoc(r + floorTile(1060, "#E9D3B4", "#D2B791"));
  },
  breakroom() {
    let r = wall("#E9F3E2", "#D6E8CB") + `${R(600, 560, 320, 18, "#8B5A3C", 4)}${R(620, 480, 80, 80, "#fff", 8)}${R(720, 500, 70, 60, "#E8607A", 8)}
      ${R(120, 640, 220, 160, "#2E2A44", 12)}${R(140, 660, 140, 120, "#1B1F3A", 6)}${C(310, 690, 8, "#3FB27F")}
      ${R(96, 860, 984, 30, "#C98A5A", 6)}${R(96, 890, 984, 170, "#E3D2C0")}${R(560, 790, 70, 70, "#fff", 8)}<path d="M630 800 q30 0 20 30" stroke="${O}" stroke-width="5" fill="none"/>${plant(900, 860, 0.9)}`;
    return wrapLoc(r + floorTile(1060, "#D8DEE8", "#C0C8D6"));
  },
  corridor() {
    let r = wall("#E6ECF5") + `<rect x="0" y="860" width="1080" height="20" fill="#C9D1DE"/>${R(120, 580, 120, 160, "#fff", 6)}${T(180, 640, "ВЫХОД", 26, "#3FB27F")}<path d="M150 700 l50 0 l-14 -14 M200 700 l-14 14" stroke="#3FB27F" stroke-width="6" fill="none"/>
      ${R(830, 620, 140, 100, "#FFE58A", 6)}${T(900, 680, "!", 50)}${plant(940, 1060, 1)}`;
    return wrapLoc(r + floorTile(1060, "#C9CFDB", "#B3BAC8"));
  },
  cafe() {
    let r = wall("#5A3E5E") + cityWindow(540, 680, 700, 300, true);
    for (let i = 0; i < 12; i++) { const x = 140 + i * 72; r += `<circle cx="${x}" cy="${560 + Math.sin(i) * 14}" r="10" fill="${["#FFD27A", "#FF9EC4", "#9FE3FF"][i % 3]}" stroke="${O}" stroke-width="3"/>`; }
    r += `<path d="M110 560 Q540 600 980 560" stroke="${O}" stroke-width="3" fill="none"/>`;
    return wrapLoc(r + floorWood(), "rgba(255,190,90,.12)");
  },
  living() {
    let r = wall("#F2E1C9", "#E6CFAE") + kover(780, 680, 300, 220) + `${R(160, 620, 300, 190, "#2E2A44", 12)}${R(180, 640, 260, 150, "#5B8DEF", 6)}${star(310, 715, 30)}${R(280, 810, 60, 50, "#2E2A44")}
      ${R(560, 900, 420, 140, "#8E7CC3", 26)}${R(560, 860, 420, 70, "#A595D6", 26)}${lamp(900, 400, 80, "#FFD27A")}`;
    return wrapLoc(r + floorWood(), "rgba(255,170,60,.1)");
  },
  kitchen() {
    let r = wall("#FFF1D6") + `${[...Array(13)].map((_, i) => `<rect x="${i * 90}" y="820" width="88" height="60" fill="${i % 2 ? "#BFE6FF" : "#fff"}" stroke="#9FC4E0" stroke-width="2"/>`).join("")}
      ${windowBox(300, 650, 240, 220, "#BFE6FF", "#FFE58A", "#E8607A")}${R(680, 560, 260, 500, "#F4F7FB", 18)}<line x1="680" y1="760" x2="940" y2="760" stroke="${O}" stroke-width="5"/>${R(905, 600, 12, 120, O, 6)}
      ${R(96, 880, 560, 180, "#C98A5A", 8)}${C(560, 860, 34, "#E8607A")}<path d="M560 826 q10 -20 0 -40" stroke="${O}" stroke-width="4" fill="none"/>`;
    return wrapLoc(r + floorTile(1060, "#E9D3B4", "#D2B791"));
  },
};

// пункт выдачи заказов (нейтральный, без брендов)
LOCS.pvz = function (night = true) {
  let r = wall("#DDE6F0");
  // стеллажи с ячейками и коробками
  for (let c = 0; c < 4; c++) {
    const x0 = 560 + c * 120;
    r += R(x0, 520, 110, 540, "#B9C4D6", 4);
    for (let k = 0; k < 4; k++) {
      const yy = 540 + k * 130;
      r += `<line x1="${x0}" y1="${yy + 120}" x2="${x0 + 110}" y2="${yy + 120}" stroke="${O}" stroke-width="5"/>`;
      r += R(x0 + 10, yy + 40 + ((c + k) % 2) * 20, 90, 80 - ((c + k) % 2) * 20, ["#C9965E", "#D9AA74", "#B8865A"][(c + k) % 3], 4);
      r += T(x0 + 55, yy + 30, `${c + 1}${k + 1}`, 20, O, "Rubik", 800);
    }
  }
  // примерочная со шторкой, лист правил
  r += `${R(120, 560, 200, 380, "#8E7CC3", 6)}<path d="M120 560 q25 30 50 0 q25 30 50 0 q25 30 50 0 q25 30 50 0" fill="none" stroke="${O}" stroke-width="5"/>${T(220, 990, "ПРИМЕРОЧНАЯ", 22)}
    <g transform="translate(410,640) rotate(-3)">${R(-70, -90, 140, 180, "#FFF6D8", 2)}${T(0, -55, "ПРАВИЛА", 20)}${[0, 1, 2].map((i) => `<line x1="-50" y1="${-25 + i * 40}" x2="50" y2="${-25 + i * 40}" stroke="${O}" stroke-width="4"/>`).join("")}</g>`;
  // стойка выдачи со сканером и монитором
  r += `${R(96, 960, 984, 100, "#2E5AA8", 8)}${R(96, 940, 984, 26, "#4A78C8", 6)}${R(420, 840, 140, 100, "#2E2A44", 8)}${R(432, 852, 116, 70, "#5BC0EB", 4)}${R(470, 940, 40, 20, "#2E2A44")}
    <g transform="translate(640,930) rotate(-20)">${R(-14, -60, 28, 70, "#2E2A44", 8)}${R(-24, -80, 48, 28, "#2E2A44", 8)}<rect x="-18" y="-72" width="36" height="8" fill="${RED}"/></g>`;
  r += floorTile(1060, "#C9CFDB", "#B3BAC8") + lamp(360, 400, 60, "#FFF6C0");
  return wrapLoc(r, night ? "rgba(20,20,60,.32)" : null);
};
