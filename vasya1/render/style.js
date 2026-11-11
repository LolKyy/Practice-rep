const tc = (txt) => `<g transform="translate(540,335) rotate(-2)"><rect x="-200" y="-72" width="400" height="144" rx="20" fill="#fff" stroke="${O}" stroke-width="${SW + 2}"/>${T(0, 38, txt, 108, RED)}</g>${noodle("M-20 430 C80 425 170 415 330 398", 30)}<ellipse cx="350" cy="398" rx="34" ry="38" fill="${SKIN}" stroke="${O}" stroke-width="${SW}"/>`;
const lvl = (p) => `<g transform="translate(540,458)"><rect x="-260" y="-38" width="520" height="76" rx="38" fill="${O}"/>${T(-232, 10, "ВАСЬ-УРОВЕНЬ", 24, "#BDB6D6", "Rubik", 800, "start")}<rect x="-40" y="-14" width="160" height="28" rx="14" fill="#4A4166"/><rect x="-40" y="-14" width="${160 * p / 100}" height="28" rx="14" fill="#B5C48E"/>${T(238, 16, p + "%", 40, YEL, "Rubik", 900, "end")}</g>`;
const bub = (x, y, txt, size = 46, tail = -1) => { const w = txt.length * size * 0.66 + 60; return `<g transform="translate(${x},${y})"><rect x="${-w / 2}" y="-55" width="${w}" height="110" rx="40" fill="#fff" stroke="${O}" stroke-width="${SW}"/><path d="M${tail * 40} 52 L${tail * 70} 105 L${tail * -10} 54" fill="#fff" stroke="${O}" stroke-width="${SW}" stroke-linejoin="round"/>${T(0, 16, txt, size)}</g>`; };
const sub = (a, b) => `<text x="520" y="1300" text-anchor="middle" font-family="Oswald" font-weight="700" font-size="118" stroke="${O}" stroke-width="18" paint-order="stroke" fill="#fff">${a}</text><text x="520" y="1420" text-anchor="middle" font-family="Oswald" font-weight="700" font-size="118" stroke="${O}" stroke-width="18" paint-order="stroke" fill="${RED}">${b}</text>`;
const STILLS = {
  "01_door": () => {
    let s = bgPaper() + LOCS.hallway();
    s += `${R(560, 560, 330, 600, "#6B4A38", 6)}<rect x="590" y="590" width="270" height="570" fill="#2E2A44"/>`;
    s += vasya({ x: 720, y: 1150, s: 0.66, pose: "wave", mouth: "talk" });
    s += hero({ x: 330, y: 1150, s: 0.66, eyes: "dots", brows: "raised", mouth: "o", cowlick: "spiral" }).svg;
    s += bub(760, 560, "А ВАСЬ?", 52, -1);
    return `<g filter="url(#wob0)">${s}</g>` + tc("07:00") + lvl(35) + sub("НА ПОРОГЕ", "ПРИШЕЛЕЦ");
  },
  "02_gopniki": () => {
    let s = bgPaper() + LOCS.street();
    s += person({ x: 700, y: 1150, s: 0.7, body: "#2E2A44", hat: "cap", faceType: "calm" }) + person({ x: 880, y: 1150, s: 0.66, body: "#3A3550", hat: "cap", faceType: "calm" });
    s += vasya({ x: 420, y: 1150, s: 0.64, item: "seeds", mouth: "small", look: 1 });
    s += bub(790, 570, "САДИСЬ, ВАСЬ", 40, 1);
    return `<g filter="url(#wob0)">${s}</g>` + tc("20:00") + lvl(90) + sub("СЕМКИ", "БУДУТ?");
  },
};
window.renderStill = (k) => { document.getElementById("root").innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">${DEFS.replace("</defs>", LOC_CLIP + "</defs>")}${STILLS[k]()}</svg>`; };
window.STILL_KEYS = Object.keys(STILLS);
