// Реквизит Ч5 «40 лет один»: Ворон, частокол и ворота, вросший ГАЗ-71 с ветряком, печка, огород, кресты, тетрадь-журнал.
import { PAL, G, Pt, cut, fillP, strokeP, clipTo, rivet, rrectP, ellP, rectP, rng, text, tear, tape, fern, setEdge } from "./cut";

export const VORON = { coat: "#8C8A6A", coatD: "#6E6C52", patch: "#A39A70", beard: "#E8E4DA", beardD: "#BDB8AC", hair: "#D8D4CA", skin: "#D9B08C", scarf: "#A8574A", boot: "#4A3424" };

// ------------------------------------------------------------------ ВОРОН (марионетка). (0,0) — между ступнями, рост ~205 «см».
export type VoronPose = { lamp?: number; armL?: number; tilt?: number; talk?: number; blink?: boolean; lampOn?: number; look?: number; hold?: boolean };
export const voron = (g: G, p: VoronPose = {}) => {
  const C = VORON;
  // ноги, сапоги
  for (const s of [-1, 1]) { cut(g, rrectP(s * 12 - 9, -100, 18, 92, 6), "#4E4A3A", { seed: 3 + s }); cut(g, rrectP(s * 12 - 11 + s * 3, -34, 24, 34, 5), C.boot, { seed: 5 + s }); for (let k = 0; k < 3; k++) strokeP(g, [[s * 12 - 10, -30 + k * 9], [s * 12 + 12, -26 + k * 9]], "rgba(20,12,6,0.5)", 1.2); rivet(g, s * 12, -98, 2); }
  // рация Р-105 за спиной + антенна
  cut(g, rrectP(14, -178, 30, 46, 3), "#3E3F30", { seed: 9 }); strokeP(g, [[38, -178], [58, -300]], "#2a2a22", 1.6);
  // штормовка (длинная, сутулая)
  g.save(); g.rotate(-0.06);
  const coat: Pt[] = [[-24, -186], [24, -186], [32, -110], [28, -92], [-28, -92], [-32, -110]];
  cut(g, coat, C.coat, { seed: 11 });
  clipTo(g, coat, () => { fillP(g, rectP(6, -200, 40, 120), "#000", 0.14); cut(g, rrectP(-22, -150, 16, 14, 2), C.patch, { seed: 12, edge: 0.4 }); cut(g, rrectP(8, -120, 14, 12, 2), C.patch, { seed: 13, edge: 0.4 }); strokeP(g, [[0, -186], [0, -92]], "rgba(40,36,24,0.5)", 1.2); });
  // руки: левая (к зрителю правая) держит фонарь, правая висит
  const arm = (x: number, a: number, hold: boolean) => { g.save(); g.translate(x, -178); g.rotate(a); cut(g, rrectP(-6, 0, 12, 58, 5), C.coatD, { seed: x + 20 }); cut(g, ellP(0, 62, 6.5, 7, 12), C.skin, { seed: x + 21, edge: 0.5 });
    if (hold) { // фонарь «летучая мышь»
      g.save(); g.translate(0, 72); g.rotate(-a);
      strokeP(g, ellP(0, 4, 7, 9, 12, Math.PI, Math.PI * 2), "#3A3A30", 1.4);
      const on = p.lampOn ?? 1;
      if (on > 0) { const gl = g.createRadialGradient(0, 22, 2, 0, 22, 120); gl.addColorStop(0, `rgba(242,166,90,${0.55 * on})`); gl.addColorStop(1, "rgba(242,166,90,0)"); g.fillStyle = gl; g.fillRect(-130, -100, 260, 250); }
      cut(g, rrectP(-9, 8, 18, 6, 2), "#3A3A30", { seed: 31, edge: 0.4 }); cut(g, ellP(0, 22, 9, 10, 14), on > 0 ? `rgba(255,${190 + 40 * on},110,1)` : "#5A5040", { seed: 32, edge: 0.5 });
      cut(g, rrectP(-10, 31, 20, 6, 2), "#3A3A30", { seed: 33, edge: 0.4 }); g.restore(); }
    rivet(g, 0, 0, 2); g.restore(); };
  arm(-22, 0.12 + (p.armL ?? 0), false);
  arm(22, -0.25 - (p.lamp ?? 0) * 1.2, true);
  // платок
  cut(g, [[-14, -192], [14, -192], [16, -182], [0, -176], [-16, -182]], C.scarf, { seed: 41, edge: 0.6 });
  // голова
  g.save(); g.translate(2, -210); g.rotate(p.tilt ?? 0.06);
  cut(g, [[-20, -20], [20, -20], [26, 30], [-26, 30]], C.hair, { seed: 51 });                                   // волосы до плеч
  cut(g, ellP(0, -4, 17, 21, 30), C.skin, { seed: 52 });
  clipTo(g, ellP(0, -4, 17, 21, 30), () => { fillP(g, ellP(9, 0, 12, 22, 20), "#8A5B3C", 0.25); for (const y of [-16, -12]) strokeP(g, [[-10, y], [10, y]], "rgba(90,60,40,0.45)", 0.8); });
  cut(g, [[-19, -14], [-8, -28], [12, -27], [19, -12], [10, -20], [-8, -20]], C.hair, { seed: 53, edge: 0.6 });   // седина надо лбом
  // глаза-прищур, очки (одно стекло треснуто, дужка в изоленте)
  const bl = p.blink ? 1 : 0;
  for (const s of [-1, 1]) { const x = s * 7 + (p.look ?? 0) * 1.5; strokeP(g, [[x - 3, -5 + bl], [x + 3, -5 + bl]], PAL.ink, 1.6); strokeP(g, ellP(s * 7, -5, 6, 5.5, 20), "#8A8070", 1.2, true); }
  strokeP(g, [[3, -9], [9, -3], [6, -1]], "rgba(255,255,255,0.9)", 0.7);
  cut(g, rectP(-18, -7, 5, 4), "#2A2A2A", { seed: 54, edge: 0.2, thick: false });
  strokeP(g, [[-7, -12], [-3, -13.5], [3, -13.5], [7, -12]], "rgba(60,50,40,0.8)", 1.4);                         // брови
  // борода лопатой (слои белой и серой бумаги) + рот
  const tk = p.talk ?? 0;
  cut(g, [[-15, 4], [15, 4], [16, 26], [9, 44], [0, 48 + tk * 2], [-9, 44], [-16, 26]], C.beardD, { seed: 55, edge: 0.6 });
  cut(g, [[-13, 2], [13, 2], [13, 22], [7, 38], [0, 42 + tk * 2], [-7, 38], [-13, 22]], C.beard, { seed: 56, edge: 0.5 });
  cut(g, [[-9, 1], [0, 4], [9, 1], [8, 6], [-8, 6]], C.beardD, { seed: 57, edge: 0.3, thick: false });           // усы
  if (tk > 0.15) fillP(g, ellP(0, 9, 3, 1 + tk * 2.5, 10), "#4A2A20"); else strokeP(g, [[-3, 9], [3, 9]], "#4A2A20", 1.2);
  g.restore();
  g.restore();
};

// ------------------------------------------------------------------ частокол и ворота (вид спереди). open: 0..1
export const palisade = (g: G, x0: number, x1: number, base: number, h: number, seed = 1, night = true) => {
  const r = rng(seed);
  for (let x = x0; x < x1; x += 46) { const hh = h * (0.9 + r() * 0.15); cut(g, [[x, base], [x, base - hh + 30], [x + 21, base - hh], [x + 42, base - hh + 30], [x + 42, base]], night ? (r() > 0.5 ? "#2E2A1E" : "#36301F") : "#6E5232", { seed: x, edge: 0.7 }); }
  cut(g, rectP(x0, base - h * 0.62, x1 - x0, 16), night ? "#241F15" : "#4E3A24", { seed: seed + 9, edge: 0.6 }); cut(g, rectP(x0, base - h * 0.25, x1 - x0, 16), night ? "#241F15" : "#4E3A24", { seed: seed + 10, edge: 0.6 });
};
export const gates = (g: G, cx: number, base: number, w: number, h: number, open: number, night = true) => {
  const leaf = (s: number) => { g.save(); g.translate(cx + s * (w / 2) * (1 + open * 0.95), base); for (let i = 0; i < 4; i++) { const x = -s * (i * (w / 8) + w / 16) - (w / 16); cut(g, [[x - w / 16, 0], [x - w / 16, -h + 30], [x, -h], [x + w / 16, -h + 30], [x + w / 16, 0]], night ? "#3A3422" : "#7A5A38", { seed: i * 7 + s, edge: 0.7 }); }
    cut(g, rectP(-s * w / 2 - (s > 0 ? 0 : 0) - (s > 0 ? w / 2 : 0) + (s < 0 ? 0 : 0), -h * 0.55, w / 2, 14), "#241F15", { seed: s + 30, edge: 0.5 }); g.restore(); };
  leaf(-1); leaf(1);
  // верёвочный блок над воротами
  strokeP(g, [[cx - w / 2 - 20, base - h - 40], [cx + w / 2 + 20, base - h - 40]], "#5A4A30", 5); fillP(g, ellP(cx, base - h - 40, 12, 12, 12), "#3A3A30"); strokeP(g, [[cx, base - h - 40], [cx - w * 0.3 * (1 - open), base - h * 0.55]], "#C9B080", 2.5);
};

// ------------------------------------------------------------------ вросший ГАЗ-71 с ветряком (вид сбоку). spin — угол лопастей
export const gaz71 = (g: G, spin = 0, warm = 0) => {
  // гусеница, наполовину ушедшая в землю
  cut(g, rrectP(-310, -120, 640, 80, 34), "#24231C", { seed: 61 });
  for (let x = -280; x < 300; x += 26) fillP(g, rectP(x, -118, 12, 10), "#3A382C");
  for (const x of [-230, -120, -10, 100, 210]) { cut(g, ellP(x, -78, 30, 30, 20), "#33322A", { seed: x, edge: 0.6 }); rivet(g, x, -78, 5); }
  // корпус: кузов-будка + кабина со скошенным носом
  const body: Pt[] = [[-310, -120], [-310, -330], [70, -330], [90, -350], [250, -350], [320, -250], [330, -120]];
  cut(g, body, "#6A6E4A", { seed: 62, edge: 1.4 });
  clipTo(g, body, () => {
    for (let x = -300; x < 330; x += 70) strokeP(g, [[x, -330], [x, -125]], "rgba(30,32,20,0.35)", 2);
    strokeP(g, [[-310, -230], [330, -230]], "rgba(30,32,20,0.35)", 2);
    const r = rng(7); for (let i = 0; i < 9; i++) fillP(g, ellP(-300 + r() * 620, -150 - r() * 160, 18 + r() * 26, 8 + r() * 10, 14), "#8A5A30", 0.45);   // ржавчина
    fillP(g, rectP(120, -360, 260, 260), "#000", 0.16);
  });
  for (let x = -300; x < 320; x += 30) rivet(g, x, -318, 2.4);
  // окна заколочены досками, из щелей — тёплый свет
  for (const [x, y, w] of [[-260, -300, 90], [-130, -300, 90], [150, -335, 80]] as [number, number, number][]) {
    cut(g, rrectP(x, y, w, 60, 4), warm > 0 ? `rgba(242,166,90,${0.55 + warm * 0.45})` : "#1E2418", { seed: x, edge: 0.5 });
    for (let k = 0; k < 2; k++) { g.save(); g.translate(x + w / 2, y + 18 + k * 26); g.rotate(k ? 0.12 : -0.1); cut(g, rectP(-w / 2 - 8, -9, w + 16, 18), "#7A5A38", { seed: x + k, edge: 0.4 }); rivet(g, -w / 2, 0, 2); rivet(g, w / 2, 0, 2); g.restore(); }
  }
  // дверь кузова
  cut(g, rrectP(-60, -310, 90, 185, 4), "#5A5E3C", { seed: 63, edge: 0.8 }); fillP(g, rectP(10, -230, 12, 8), "#2A2A20");
  // мох по верхним кромкам и лианы свисают с крыши
  const moss = (x0: number, x1: number, y: number) => { const r = rng(x0 + 3); for (let x = x0; x < x1; x += 22) cut(g, ellP(x, y + 2, 16 + r() * 10, 9 + r() * 6, 12), r() > 0.5 ? "#4E6A2C" : "#3F5A26", { seed: x, edge: 0.4, thick: false }); };
  moss(-310, 80, -332); moss(90, 250, -352);
  for (let i = 0; i < 7; i++) { const x = -290 + i * 85, L = 60 + (i % 3) * 50; const pts: Pt[] = Array.from({ length: 7 }, (_, k) => [x + Math.sin(k * 1.3 + i) * 8, -330 + (k / 6) * L] as Pt); strokeP(g, pts, "#3F5A26", 4); for (let k = 1; k < 7; k += 2) cut(g, ellP(pts[k][0] + 6, pts[k][1], 7, 4, 8), "#4E6A2C", { seed: i * 10 + k, edge: 0.3, thick: false }); }
  // земля, наползшая на гусеницу, трава
  cut(g, [[-360, -60], [-200, -96], [0, -88], [200, -100], [380, -64], [380, 10], [-360, 10]], "#3A3426", { seed: 64, edge: 0.6 });
  for (let x = -340; x < 360; x += 34) cut(g, [[x, -70], [x + 8, -112], [x + 14, -74]], "#3F5A26", { seed: x + 1, edge: 0.3, thick: false });
  // ветряк: мачта на растяжках, лопасти из разрезанной бочки, хвост-флюгер
  strokeP(g, [[-150, -330], [-150, -500]], "#4A4A40", 8); strokeP(g, [[-150, -500], [-230, -330]], "rgba(200,200,190,0.5)", 1.2); strokeP(g, [[-150, -500], [-70, -330]], "rgba(200,200,190,0.5)", 1.2);
  cut(g, [[-150, -500], [-60, -512], [-60, -486]], "#9AA0A6", { seed: 65, edge: 0.4 });
  g.save(); g.translate(-150, -500); g.rotate(spin); for (let i = 0; i < 3; i++) { g.rotate((Math.PI * 2) / 3); cut(g, [[0, -5], [76, -20], [82, 0], [0, 7]], "#8E949E", { seed: 66 + i, edge: 0.5 }); } rivet(g, 0, 0, 7); g.restore();
};
// тропическое дерево (цикас / древовидный папоротник): кольчатый ствол + веер листьев
export const palm = (g: G, x: number, base: number, h: number, seed = 1, cols: [string, string] = ["#1B2216", "#151A12"]) => {
  setEdge("#7E93B8"); const r = rng(seed); const bend = (r() - 0.5) * 60;
  const pts: Pt[] = Array.from({ length: 10 }, (_, k) => [x + bend * (k / 9) ** 2, base - (k / 9) * h] as Pt);
  for (let k = 0; k < 9; k++) { const [x0, y0] = pts[k], [x1, y1] = pts[k + 1]; cut(g, [[x0 - 16, y0], [x1 - 13, y1], [x1 + 13, y1], [x0 + 16, y0]], k % 2 ? cols[0] : cols[1], { seed: seed * 10 + k, edge: 0.5 }); }
  const [tx, ty] = pts[9];
  for (let i = 0; i < 9; i++) { const a = -Math.PI / 2 + (i - 4) * 0.42 + (r() - 0.5) * 0.1; fern(g, tx, ty, h * (0.42 + r() * 0.12), a, i % 2 ? cols[0] : cols[1], seed * 31 + i, { droop: 0.55 * Math.sign(Math.cos(a)), w: h * 0.12 }); }
  setEdge();
};
// ------------------------------------------------------------------ печка из камней + искры
export const stove = (g: G, t: number) => {
  const gl = g.createRadialGradient(0, -60, 6, 0, -60, 420); gl.addColorStop(0, "rgba(242,166,90,0.55)"); gl.addColorStop(1, "rgba(242,166,90,0)"); g.fillStyle = gl; g.fillRect(-460, -480, 920, 600);
  cut(g, rrectP(-90, -120, 180, 120, 30), "#4E4A44", { seed: 71 }); for (let i = 0; i < 8; i++) cut(g, ellP(-80 + i * 23, -10 - (i % 2) * 40, 22, 16, 12), i % 2 ? "#6A645C" : "#5A554E", { seed: 72 + i, edge: 0.5 });
  cut(g, rrectP(-50, -170, 100, 60, 8), "#3A3A36", { seed: 80 });
  for (let i = 0; i < 4; i++) { const k = (t * 3 + i / 4) % 1; cut(g, [[-30 + i * 18, -110], [-22 + i * 18, -150 - Math.sin(k * 6) * 18], [-14 + i * 18, -110]], i % 2 ? "#F07A2A" : "#F2C44A", { seed: i + 81, edge: 0.3, thick: false }); }
  const r = rng(Math.floor(t * 6)); for (let i = 0; i < 10; i++) { const k = ((t * 0.5 + i / 10) % 1); fillP(g, ellP(Math.sin(i * 2.1 + t) * 50, -180 - k * 420, 3, 3, 6), "#FFC877", 1 - k); }
};
export const crosses = (g: G, n = 6) => { for (let i = 0; i < n; i++) { const x = i * 90, h = 120 + (i % 3) * 14; cut(g, rectP(x - 7, -h, 14, h), "#5A4630", { seed: i + 91, edge: 0.6 }); cut(g, rectP(x - 32, -h + 26, 64, 13), "#5A4630", { seed: i + 97, edge: 0.6 }); } };
export const garden = (g: G, w: number) => { for (let i = 0; i < 4; i++) { cut(g, rrectP(i * (w / 4) + 10, -40, w / 4 - 20, 40, 8), "#4A3A26", { seed: i + 101, edge: 0.6 }); for (let k = 0; k < 4; k++) fern(g, i * (w / 4) + 30 + k * ((w / 4 - 60) / 3), -36, 70, -Math.PI / 2 + (k - 1.5) * 0.3, "#4E6A2C", i * 9 + k, { droop: 0.2 }); } };

// ------------------------------------------------------------------ тетрадь-журнал (вид сверху). page 0 — карта, 1 — Ан-2; lit — сколько кружков горит, pulse — пульс повторяющегося
export const journal = (g: G, o: { page?: number; lit?: number; pulse?: number; flip?: number; t?: number; finger?: number } = {}) => {
  const t = o.t ?? 0;
  cut(g, rectP(60, 300, 960, 1240), "#6E4E2C", { seed: 111, edge: 2 });                                         // обложка
  const L = rectP(90, 330, 440, 1180), R = rectP(550, 330, 440, 1180);
  for (const pg of [L, R]) { cut(g, pg, "#EDE3C8", { seed: pg[0][0], edge: 1 }); clipTo(g, pg, () => { for (let y = 380; y < 1500; y += 40) strokeP(g, [[pg[0][0], y], [pg[0][0] + 440, y]], "rgba(70,110,170,0.22)", 1.5); fillP(g, rectP(pg[0][0], 330, 440, 1180), "#8A6A3A", 0.08); }); }
  strokeP(g, [[540, 330], [540, 1510]], "rgba(60,40,20,0.5)", 4);
  const pen = (pts: Pt[], w = 3, a = 0.7) => strokeP(g, pts, `rgba(55,50,45,${a})`, w);
  if ((o.page ?? 0) === 0) {
    // левая страница: столбец дат
    const r = rng(5); for (let i = 0; i < 22; i++) { const y = 400 + i * 48; text(g, `${1986 + Math.floor(i * 1.8)}.${String(1 + Math.floor(r() * 12)).padStart(2, "0")}`, 130, y, 24, "rgba(55,50,45,0.75)", "JetBrains Mono", 700, "left"); pen([[270, y], [270 + 60 + r() * 140, y]], 2, 0.4); if (i % 5 === 3) text(g, "✝", 480, y, 26, "rgba(160,40,30,0.75)", "Montserrat", 900); }
    // правая: карта-схема с кружками
    pen([[580, 700], [700, 640], [820, 700], [960, 660]], 3); pen([[600, 1100], [760, 1000], [900, 1120]], 3); text(g, "СКАЛА", 790, 860, 22, "rgba(55,50,45,0.8)", "JetBrains Mono", 700);
    const pts: Pt[] = [[620, 420], [900, 470], [700, 560], [960, 820], [600, 900], [880, 1000], [650, 1250], [940, 1300], [760, 1420], [610, 1350]];
    const lit = o.lit ?? 10; pts.slice(0, lit).forEach(([x, y], i) => strokeP(g, ellP(x, y, 16, 16, 20), "rgba(40,170,90,0.85)", 3, true));
    // повторяющийся кружок — много колец в одной точке
    const px = 760, py = 1180, pu = o.pulse ?? 0;
    for (let k = 0; k < 7; k++) strokeP(g, ellP(px, py, 14 + k * 4, 14 + k * 4, 24), `rgba(40,170,90,${0.25 + 0.1 * k})`, 2.5, true);
    if (pu > 0) { const gl = g.createRadialGradient(px, py, 4, px, py, 90); gl.addColorStop(0, `rgba(61,220,132,${0.6 * pu})`); gl.addColorStop(1, "rgba(61,220,132,0)"); g.fillStyle = gl; g.fillRect(px - 100, py - 100, 200, 200); }
  } else {
    // разворот с Ан-2 и «2000»
    pen([[150, 800], [460, 800]], 4); pen([[150, 700], [460, 700]], 4); for (const x of [200, 410]) pen([[x, 700], [x, 800]], 2.5);
    pen([[160, 750], [470, 750], [500, 740], [480, 770], [160, 770], [120, 740], [160, 750]], 3); pen([[120, 740], [100, 690], [130, 700], [150, 750]], 2.5); pen([[480, 735], [520, 720], [520, 790], [480, 775]], 2.5);
    text(g, "АН-2", 300, 880, 40, "rgba(55,50,45,0.85)", "JetBrains Mono", 700); text(g, "2000", 300, 980, 64, "rgba(200,53,43,0.9)", "JetBrains Mono", 700);
    text(g, "раз в 13 лет", 300, 1080, 30, "rgba(55,50,45,0.8)", "JetBrains Mono", 700);
    const px = 760, py = 900; for (let k = 0; k < 7; k++) strokeP(g, ellP(px, py, 18 + k * 6, 18 + k * 6, 24), `rgba(40,170,90,${0.25 + 0.1 * k})`, 3, true);
    text(g, "1987 · 2000 · 2013 · 2026", 770, 1080, 24, "rgba(55,50,45,0.85)", "JetBrains Mono", 700);
    const pu = o.pulse ?? 0; if (pu > 0) { const gl = g.createRadialGradient(px, py, 4, px, py, 120); gl.addColorStop(0, `rgba(61,220,132,${0.6 * pu})`); gl.addColorStop(1, "rgba(61,220,132,0)"); g.fillStyle = gl; g.fillRect(px - 130, py - 130, 260, 260); }
  }
  // переворачиваемая страница (листание)
  const f = o.flip ?? 0; if (f > 0 && f < 1) { const w = 440 * Math.cos(f * Math.PI); g.save(); g.globalAlpha = 0.95; cut(g, rectP(540 + Math.min(0, w), 330, Math.abs(w), 1180), "#F3EAD0", { seed: 120, edge: 0.8 }); g.restore(); }
  tape(g, 120, 340, 100, -0.4);
};
export const fingerHand = (g: G) => { cut(g, rrectP(-60, 0, 120, 160, 50), VORON.skin, { seed: 131 }); cut(g, rrectP(-14, -150, 30, 170, 14), VORON.skin, { seed: 132 }); fillP(g, rrectP(-8, -146, 18, 24, 8), "#EAC7A6"); cut(g, rrectP(-80, 140, 160, 120, 20), VORON.coat, { seed: 133 }); };
