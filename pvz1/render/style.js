// Кадры на утверждение: «Правила ночной смены в ПВЗ»
const ruleCard = (n) => `<g transform="translate(540,335) rotate(-2)"><rect x="-260" y="-72" width="520" height="144" rx="20" fill="#FFF6D8" stroke="${O}" stroke-width="${SW + 2}"/>
  ${T(40, 30, "ПРАВИЛО", 56, O, "Rubik", 900, "end")}${T(62, 40, "№" + n, 96, RED, "Rubik", 900, "start")}</g>
  ${noodle("M-20 430 C80 425 170 415 262 398", 30)}<ellipse cx="282" cy="398" rx="34" ry="38" fill="${SKIN}" stroke="${O}" stroke-width="${SW}"/>`;
const broken = (k) => `<g transform="translate(540,458)"><rect x="-200" y="-38" width="400" height="76" rx="38" fill="${O}"/>${T(-172, 12, "НАРУШЕНО", 28, "#BDB6D6", "Rubik", 800, "start")}${T(175, 16, k + " / 3", 44, RED, "Rubik", 900, "end")}</g>`;
const tag = (txt) => { const w = txt.length * 20 + 40; return `<g transform="translate(540,205) rotate(-2)"><rect x="${-w / 2}" y="-30" width="${w}" height="56" fill="#FFF6D8" stroke="${O}" stroke-width="4"/>${T(0, 10, txt, 28, O, "Rubik", 900)}</g>`; };
const bubble = (x, y, txt, size = 44, tail = -1) => { const w = txt.length * size * 0.66 + 60; return `<g transform="translate(${x},${y})"><rect x="${-w / 2}" y="-55" width="${w}" height="110" rx="40" fill="#fff" stroke="${O}" stroke-width="${SW}"/><path d="M${tail * 40} 52 L${tail * 70} 105 L${tail * -10} 54" fill="#fff" stroke="${O}" stroke-width="${SW}" stroke-linejoin="round"/>${T(0, 16, txt, size)}</g>`; };
function subs(a, b) {
  return `<text x="520" y="${b ? 1300 : 1340}" text-anchor="middle" font-family="Oswald" font-weight="700" font-size="118" stroke="${O}" stroke-width="18" paint-order="stroke" fill="#fff">${a}</text>` +
    (b ? `<text x="520" y="1420" text-anchor="middle" font-family="Oswald" font-weight="700" font-size="118" stroke="${O}" stroke-width="18" paint-order="stroke" fill="${RED}">${b}</text>` : "");
}
const wob = (s) => `<g filter="url(#wob0)">${s}</g>`;
const scared = (x, s) => hero({ x, y: 1150, s, eyes: "dots", brows: "raised", mouth: "o", cowlick: "spiral", sweat: true }).svg;

const STILLS = {
  "01_hook": () => {
    let s = bgPaper() + LOCS.pvz(true);
    s += boxMonster(720, 930, 0.95, 1);
    s += zheka({ x: 380, y: 1150, s: 0.68, eyes: "calm", mouth: "talk", look: 1 });
    s += scared(940, 0.5);
    s += bubble(330, 600, "НЕ МОЙ РАЗМЕР", 40, 1);
    return wob(s) + tag("ПВЗ · 03:00") + ruleCard(1) + broken(1) + subs("НЕ МОЙ", "РАЗМЕР");
  },
  "02_rules": () => {
    let s = bgPaper() + LOCS.pvz(true);
    s += `<g transform="translate(540,830) rotate(-2)">${R(-330, -320, 660, 640, "#FFF6D8", 4)}<rect x="-60" y="-338" width="120" height="34" fill="#fff" opacity=".75"/>
      ${T(0, -240, "ПРАВИЛА НОЧНОЙ СМЕНЫ", 42)}<line x1="-290" y1="-210" x2="290" y2="-210" stroke="${O}" stroke-width="4"/>
      ${["1. Не выдавать посылку,", "   которая шевелится.", "2. После полуночи —", "   никаких возвратов.", "3. Клиент без кода в 3:00 —", "   не смотри ему в глаза."].map((l, i) => T(-290, -140 + i * 62 + Math.floor(i / 2) * 26, l, 46, O, "Caveat", 700, "start")).join("")}
      <path d="M-300 -150 Q0 -165 280 -105" stroke="${RED}" stroke-width="10" fill="none" stroke-linecap="round"/><path d="M-300 -2 Q0 -18 280 40" stroke="${RED}" stroke-width="10" fill="none" stroke-linecap="round"/></g>`;
    return wob(s) + ruleCard(2) + broken(2) + subs("НИКАКИХ", "ВОЗВРАТОВ");
  },
  "03_client": () => {
    let s = bgPaper() + LOCS.pvz(true);
    s += faceless(780, 1150, 0.62);
    s += zheka({ x: 330, y: 1150, s: 0.68, eyes: "stare", mouth: "talk", look: 1 });
    s += `<g transform="translate(110,0)">${scared(0, 0.42)}</g>`;
    s += bubble(360, 590, "КОД НАЗОВИ, БРАТАН", 36, 1);
    return wob(s) + tag("ПВЗ · 03:00") + ruleCard(3) + broken(3) + subs("КОД НАЗОВИ,", "БРАТАН");
  },
  "04_courier": () => {
    let s = bgPaper() + LOCS.pvz(false);
    s += person({ x: 760, y: 1150, s: 0.78, body: "#F28C28", hat: "cap", faceType: "happy" });
    s += boxMonster(560, 1010, 0.6, 0.05, 0.3);
    s += zheka({ x: 300, y: 1150, s: 0.66, eyes: "calm", mouth: "chew", look: 1 });
    s += `<g transform="translate(800,640) rotate(5)">${R(-170, -70, 340, 140, "#fff", 14)}${T(0, -12, "ПОЛУЧАТЕЛЬ:", 32, O, "Rubik", 800)}${T(0, 44, "ЖЕКА", 54, RED)}</g>`;
    s += sfxText(560, 880, -8, "ТУК-ТУК", 60, "#fff");
    return wob(s) + tag("ПВЗ · 09:00") + subs("И КОРОБКА", "ШЕВЕЛИТСЯ");
  },
};
window.renderStill = (k) => { document.getElementById("root").innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">${DEFS.replace("</defs>", LOC_CLIP + "</defs>")}${STILLS[k]()}</svg>`; };
window.STILL_KEYS = Object.keys(STILLS);
