// Пробные кадры «больше деталей в нашем стиле»: интерьер внутри пятна-маркера на тетради.
const ROOM_CLIP = `<clipPath id="room"><path d="${BLOB}"/></clipPath>`;
const place = (txt) => `<g transform="translate(150,585) rotate(-4)"><rect x="-10" y="-34" width="${txt.length * 21 + 30}" height="54" fill="#FFF6D8" stroke="${O}" stroke-width="4"/>
  <rect x="${txt.length * 10 - 20}" y="-46" width="70" height="22" fill="#fff" opacity=".75" transform="rotate(4)"/>${T(5, 2, txt, 30, O, "Rubik", 900, "start")}</g>`;
const tc = (txt) => `<g transform="translate(540,335) rotate(-2)"><rect x="-200" y="-72" width="400" height="144" rx="20" fill="#fff" stroke="${O}" stroke-width="${SW + 2}"/>${T(0, 38, txt, 108, RED)}</g>
  ${noodle("M-20 430 C80 425 170 415 330 398", 30)}<ellipse cx="350" cy="398" rx="34" ry="38" fill="${SKIN}" stroke="${O}" stroke-width="${SW}"/>`;
const cd = (txt) => `<g transform="translate(540,458)"><rect x="-260" y="-38" width="520" height="76" rx="38" fill="${O}"/>${T(-232, 10, "ДО ВОЗВРАТА", 24, "#BDB6D6", "Rubik", 800, "start")}${T(238, 16, txt, 44, YEL, "Rubik", 900, "end")}</g>`;
const subs2 = (a, b) => `<text x="520" y="1300" text-anchor="middle" font-family="Oswald" font-weight="700" font-size="118" stroke="${O}" stroke-width="18" paint-order="stroke" fill="#fff">${a}</text>
  <text x="520" y="1420" text-anchor="middle" font-family="Oswald" font-weight="700" font-size="118" stroke="${O}" stroke-width="18" paint-order="stroke" fill="${RED}">${b}</text>`;

function room() {
  let r = `<rect x="0" y="400" width="1080" height="800" fill="#F7D9C4"/>`;
  for (let x = 60; x < 1080; x += 70) r += `<line x1="${x}" y1="400" x2="${x}" y2="1060" stroke="#E9BFA5" stroke-width="10"/>` + [0, 1, 2, 3, 4, 5, 6, 7].map((i) => `<circle cx="${x + 35}" cy="${450 + i * 80}" r="5" fill="#E9BFA5"/>`).join("");
  // ковёр на стене
  r += `<g transform="translate(560,700)">${R(-180, -130, 360, 260, "#B23A3A", 10)}${R(-150, -100, 300, 200, "#E8B04B", 6)}
    <path d="M0 -80 L120 0 L0 80 L-120 0 Z" fill="#2E5AA8" stroke="${O}" stroke-width="5"/><path d="M0 -40 L60 0 L0 40 L-60 0 Z" fill="#E8B04B" stroke="${O}" stroke-width="4"/>${C(0, 0, 14, "#B23A3A")}
    ${[...Array(12)].map((_, i) => `<line x1="${-170 + i * 31}" y1="130" x2="${-170 + i * 31}" y2="150" stroke="${O}" stroke-width="4"/>`).join("")}</g>`;
  // окно с утром и шторами
  r += `<g transform="translate(250,700)">${R(-110, -130, 220, 260, "#BFE6FF", 8)}${C(40, -60, 34, "#FFE58A")}<line x1="0" y1="-130" x2="0" y2="130" stroke="${O}" stroke-width="8"/><line x1="-110" y1="0" x2="110" y2="0" stroke="${O}" stroke-width="8"/>
    <path d="M-140 -150 Q-120 0 -150 150 L-90 150 Q-110 0 -90 -150 Z" fill="#6FB98F" stroke="${O}" stroke-width="5"/><path d="M140 -150 Q120 0 150 150 L90 150 Q110 0 90 -150 Z" fill="#6FB98F" stroke="${O}" stroke-width="5"/>${R(-160, -165, 320, 20, "#8B5A3C", 6)}</g>`;
  // постер, полка, лампа
  r += `<g transform="translate(860,620) rotate(4)">${R(-70, -90, 140, 180, "#2E2A44", 6)}${T(0, -30, "ROCK", 40, YEL)}${C(0, 30, 34, RED)}${C(0, 30, 10, "#2E2A44")}</g>`;
  r += `${R(760, 790, 220, 20, "#8B5A3C", 4)}${["#E8607A", "#5B8DEF", "#3FB27F", "#E8B04B"].map((c, i) => R(775 + i * 30, 720 - (i % 2) * 14, 26, 70 + (i % 2) * 14, c, 3)).join("")}<path d="M920 790 q10 -60 30 -60 q-6 30 10 60 Z" fill="#3FB27F" stroke="${O}" stroke-width="4"/>`;
  r += `<line x1="560" y1="400" x2="560" y2="520" stroke="${O}" stroke-width="5"/><path d="M510 560 L610 560 L585 520 L535 520 Z" fill="${YEL}" stroke="${O}" stroke-width="5"/>`;
  // пол, ковёр на полу, тумбочка с будильником и зарядкой, носки
  r += `<rect x="0" y="1060" width="1080" height="200" fill="#C98A5A"/>${[...Array(8)].map((_, i) => `<line x1="0" y1="${1080 + i * 22}" x2="1080" y2="${1080 + i * 22}" stroke="#A86C42" stroke-width="3"/>`).join("")}
    <ellipse cx="520" cy="1130" rx="300" ry="40" fill="#7FB3E8" stroke="${O}" stroke-width="5"/>
    ${R(110, 960, 160, 160, "#A86C42", 8)}<g transform="translate(160,935)">${C(0, -10, 30, "#FF7B7B")}${C(0, -10, 20, "#fff")}</g>${R(205, 925, 40, 30, "#2E2A44", 6)}<path d="M245 940 q30 10 20 60" stroke="${O}" stroke-width="4" fill="none"/>
    <path d="M330 1110 q20 -30 50 -10 l20 20 q-30 20 -70 -10 Z" fill="#fff" stroke="${O}" stroke-width="4"/><path d="M690 1120 q20 -30 50 -10 l20 20 q-30 20 -70 -10 Z" fill="#E8607A" stroke="${O}" stroke-width="4"/>`;
  // кровать с одеялом в клетку
  r += `${R(640, 930, 340, 140, "#6FA8DC", 18)}${[...Array(6)].map((_, i) => `<line x1="${660 + i * 55}" y1="935" x2="${660 + i * 55}" y2="1065" stroke="#fff" stroke-width="6" opacity=".6"/>`).join("")}${R(620, 1060, 380, 40, "#8B5A3C", 10)}${R(850, 880, 120, 80, "#fff", 28)}`;
  return `<g clip-path="url(#room)">${r}</g><path d="${BLOB}" fill="none" stroke="${O}" stroke-width="6"/>`;
}

function metro() {
  let r = `<rect x="0" y="400" width="1080" height="800" fill="#DCE3EE"/>`;
  // окна с тоннелем
  for (const x of [130, 440, 750]) r += `${R(x, 600, 220, 170, "#1B1F3A", 22)}${[0, 1, 2].map((i) => `<line x1="${x + 20 + i * 70}" y1="${640 + i * 30}" x2="${x + 70 + i * 70}" y2="${640 + i * 30}" stroke="#FFD27A" stroke-width="6" opacity=".7"/>`).join("")}`;
  // рекламная полоса
  r += `${R(110, 520, 860, 60, "#fff", 8)}${T(140, 562, "ПРОТЕИН 1 КГ — 2 500 ₽", 30, RED, "Rubik", 900, "start")}${T(940, 562, "СХЕМА ЛИНИЙ", 26, O, "Rubik", 800, "end")}
    <path d="M700 548 C760 530 820 570 880 548" stroke="#E8607A" stroke-width="6" fill="none"/><path d="M700 562 C760 580 820 540 880 562" stroke="#3FB27F" stroke-width="6" fill="none"/>`;
  // поручни
  r += `<rect x="0" y="500" width="1080" height="16" fill="#9AA3B5" stroke="${O}" stroke-width="4"/>${[380, 700].map((x) => `<rect x="${x}" y="500" width="16" height="560" fill="#C9D1DE" stroke="${O}" stroke-width="4"/>`).join("")}
    ${[200, 330, 900].map((x) => `<line x1="${x}" y1="516" x2="${x}" y2="560" stroke="${O}" stroke-width="4"/><circle cx="${x}" cy="576" r="16" fill="none" stroke="${O}" stroke-width="5"/>`).join("")}`;
  // сиденья и пол
  r += `${R(96, 930, 984, 130, "#5B8DEF", 20)}${R(96, 1040, 984, 30, "#3A5CB0")}<rect x="0" y="1070" width="1080" height="200" fill="#8C93A3"/>${[...Array(6)].map((_, i) => `<line x1="${i * 200}" y1="1070" x2="${i * 200 + 80}" y2="1260" stroke="#7A8090" stroke-width="4"/>`).join("")}`;
  // пассажиры на заднем плане
  r += person({ x: 520, y: 1030, s: 0.5, body: "#8E7CC3", hat: "none", hair: "#222", faceType: "calm" }) + person({ x: 860, y: 1030, s: 0.5, body: "#E0B040", hat: "cap", faceType: "shock" });
  return `<g clip-path="url(#room)">${r}</g><path d="${BLOB}" fill="none" stroke="${O}" stroke-width="6"/>`;
}

const STILLS = {
  demo_room_0700: () => {
    let s = bgPaper() + room();
    s += hero({ x: 450, y: 1150, s: 0.84, build: "swap", eyes: "dots", brows: "raised", mouth: "o", cowlick: "spiral" }).svg;
    s += sfxText(800, 640, 8, "ЧТО?!", 96, YEL);
    return `<g filter="url(#wob0)">${s}</g>` + place("ТВОЯ КОМНАТА · УТРО") + tc("07:00") + cd("16:59:57") + subs2("ПОМЕНЯЛИСЬ", "МЕСТАМИ");
  },
  demo_metro_0900: () => {
    let s = bgPaper() + metro();
    s += person({ x: 210, y: 1150, s: 0.8, body: "#3FB27F", hat: "cap", faceType: "shock" });
    s += hero({ x: 600, y: 1150, s: 0.82, build: "swap", pose: "kick", eyes: "normal", look: -1, brows: "sad", mouth: "flat", cowlick: "down" }).svg;
    s += person({ x: 910, y: 1150, s: 0.72, body: "#E8607A", hat: "scarf", faceType: "happy" });
    s += sfxText(210, 640, -12, "БАЦ!", 100, YEL);
    return `<g filter="url(#wob0)">${s}</g>` + place("МЕТРО · ЧАС ПИК") + tc("09:00") + cd("14:59:57") + subs2("КРОССОВКОМ", "В ЛИЦО");
  },
};
window.renderStill = (k) => { document.getElementById("root").innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">${DEFS.replace("</defs>", ROOM_CLIP + "</defs>")}${STILLS[k]()}</svg>`; };
window.STILL_KEYS = Object.keys(STILLS);
