// Стоп-кадры для согласования ролика «рука и нога поменялись местами».
function timeCard(txt) {
  return `<g transform="translate(540,335) rotate(-2)"><rect x="-200" y="-72" width="400" height="144" rx="20" fill="#fff" stroke="${O}" stroke-width="${SW + 2}"/>
    ${T(0, 38, txt, 108, RED)}</g>${noodle("M-20 430 C80 425 170 415 330 398", 30)}
    <ellipse cx="350" cy="398" rx="34" ry="38" fill="${SKIN}" stroke="${O}" stroke-width="${SW}"/><path d="M336 372 q24 -6 34 12" stroke="${O}" stroke-width="5" fill="none" stroke-linecap="round"/>`;
}
function shame(p) {
  return `<g transform="translate(540,458)"><rect x="-190" y="-36" width="380" height="72" rx="36" fill="${O}"/>
    ${T(-160, 13, "ПОЗОР", 30, "#BDB6D6", "Rubik", 800, "start")}
    <rect x="-40" y="-14" width="120" height="28" rx="14" fill="#4A4166"/><rect x="-40" y="-14" width="${120 * p / 100}" height="28" rx="14" fill="${RED}"/>
    ${T(170, 15, p + "%", 40, YEL, "Rubik", 900, "end")}</g>`;
}
function ach(top, text) {
  return `<g transform="translate(520,1530)"><rect x="-420" y="-50" width="840" height="100" rx="50" fill="${YEL}" stroke="${O}" stroke-width="${SW + 2}"/>
    ${star(-360, 0, 34, "#fff")}${T(-310, -8, top, 26, O, "Rubik", 800, "start", 'opacity=".7"')}${T(-310, 34, text, 44, O, "Rubik", 900, "start")}</g>`;
}
function subs(lines) {
  const size = 118, y0 = 1340 - ((lines.length - 1) * size) / 2;
  return lines.map((ws, i) => `<text x="520" y="${y0 + i * size * 1.02}" text-anchor="middle" font-family="Oswald" font-weight="700" font-size="${size}"
    stroke="${O}" stroke-width="18" stroke-linejoin="round" paint-order="stroke">${ws.map((w) => `<tspan fill="${w.red ? RED : "#fff"}" fill-opacity="${w.dim ? 0.5 : 1}">${w.t}</tspan>`).join(" ")}</text>`).join("");
}
const wob = (s) => `<g filter="url(#wob0)">${s}</g>`;

const STILLS = {
  // 1. Хук 07:00
  "01_hook_0700": () => {
    let s = bgMix(PAL.mint);
    s += `${R(640, 900, 330, 160, "#B9D7F0", 20)}${R(620, 1060, 370, 40, "#8B5A3C", 10)}${R(820, 860, 130, 90, "#fff", 30)}`; // кровать
    s += hero({ x: 470, y: 1150, s: 0.84, build: "swap", eyes: "dots", brows: "raised", mouth: "o", cowlick: "spiral" }).svg;
    s += sticker(330, 560, 6, "НОГА", 60) + arrow("M260 590 Q240 620 230 640", "M218 620 L230 644 L250 628");
    s += sticker(180, 1095, -6, "РУКА", 60) + arrow("M200 1050 Q220 1030 245 1020", "M222 1012 L248 1018 L236 1042");
    return wob(s) + timeCard("07:00") + shame(12) + subs([[{ t: "ПОМЕНЯЛИСЬ" }], [{ t: "МЕСТАМИ", red: true }]]);
  },
  // 2. Метро 09:00
  "02_metro_0900": () => {
    let s = bgMix(PAL.yellow);
    s += `<rect x="96" y="520" width="984" height="26" fill="#9AA3B5" stroke="${O}" stroke-width="${SW}"/>
      ${R(96, 920, 984, 140, "#5B8DEF", 20)}${R(96, 1040, 984, 30, "#3A5CB0")}
      <rect x="140" y="640" width="200" height="140" rx="18" fill="#BFE3F5" stroke="${O}" stroke-width="${SW}"/><rect x="780" y="640" width="200" height="140" rx="18" fill="#BFE3F5" stroke="${O}" stroke-width="${SW}"/>`;
    s += person({ x: 200, y: 1150, s: 0.8, body: "#3FB27F", hat: "cap", faceType: "shock" });
    s += hero({ x: 600, y: 1150, s: 0.82, build: "swap", pose: "kick", eyes: "normal", look: -1, brows: "sad", mouth: "flat", cowlick: "down" }).svg;
    s += person({ x: 900, y: 1150, s: 0.72, body: "#E8607A", hat: "scarf", faceType: "happy" });
    s += sfxText(200, 640, -12, "БАЦ!", 100, YEL);
    return wob(s) + timeCard("09:00") + shame(47) + ach("ДОСТИЖЕНИЕ", "ТЕБЕ УСТУПИЛИ МЕСТО") + subs([[{ t: "КРОССОВКОМ" }], [{ t: "В ЛИЦО", red: true }]]);
  },
  // 3. Работа 11:00
  "03_work_1100": () => {
    let s = bgMix(PAL.pink);
    s += `${R(110, 980, 330, 30, "#C98A5A", 8)}${R(130, 1010, 24, 140, "#A86C42")}${R(396, 1010, 24, 140, "#A86C42")}
      <path d="M150 975 L170 860 L330 860 L330 975 Z" fill="#2E2A44" stroke="${O}" stroke-width="${SW}" stroke-linejoin="round"/>${R(150, 960, 260, 20, "#9AA3B5", 4)}`;
    s += hero({ x: 600, y: 1150, s: 0.82, build: "swap", pose: "type", eyes: "star", brows: "proud", mouth: "grin", cowlick: "up" }).svg;
    s += person({ x: 860, y: 1150, s: 0.8, body: "#2E2A44", hair: "#777", glasses: true, faceType: "happy", holding: "card", cardText: "↑" });
    s += sfxText(260, 800, -8, "ТЫК-ТЫК-ТЫК", 56, "#fff");
    return wob(s) + timeCard("11:00") + shame(31) + ach("НОВЫЙ НАВЫК", "ПЕЧАТЬ НОГОЙ") + subs([[{ t: "БЫСТРЕЕ" }], [{ t: "РУКИ", red: true }]]);
  },
  // 4. Финал: сообщение от девушки
  "04_twist_message": () => {
    let s = bgMix(PAL.purple);
    s += hero({ x: 320, y: 1150, s: 0.84, eyes: "sleepy", brows: "sad", mouth: "sad", cowlick: "down" }).svg;
    s += `<g transform="translate(720,830) rotate(4)"><rect x="-210" y="-330" width="420" height="660" rx="44" fill="#2E2A44" stroke="${O}" stroke-width="${SW}"/>
      <rect x="-185" y="-290" width="370" height="580" rx="24" fill="#F4F6FB"/>
      ${person({ x: -110, y: -150, s: 0.22, long: true, hair: "#C2553D", body: "#FF9EC4", faceType: "calm" })}${T(-60, -215, "Она", 34, O, "Rubik", 900, "start")}
      <rect x="-165" y="-100" width="330" height="170" rx="26" fill="#fff" stroke="${O}" stroke-width="4"/>
      ${T(-140, -50, "Верни ногу.", 34, O, "Rubik", 800, "start")}${T(-140, -6, "С ней ты был", 34, O, "Rubik", 800, "start")}${T(-140, 38, "интереснее", 34, O, "Rubik", 800, "start")}
      ${T(150, 100, "00:01", 24, "#8A8AA0", "Rubik", 800, "end")}</g>`;
    return wob(s) + timeCard("00:01") + shame(0) + subs([[{ t: "ВЕРНИ" }, { t: "НОГУ", red: true }]]);
  },
};
window.renderStill = (k) => { document.getElementById("root").innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">${DEFS}${STILLS[k]()}</svg>`; };
window.STILL_KEYS = Object.keys(STILLS);
