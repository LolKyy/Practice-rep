// Викинги, Гренландия ~1000 г. Визуал v3 «2D + объём»: 10–12 планов на глубине, псевдо-3D объекты
// (видимая боковая грань меняется с поворотом камеры `turn`), падающий снег на разных глубинах, туман, дым, северное сияние.
import { G, PAL, cut, rectP, rrectP, ellP, fillP, strokeP, text, rng, Pt } from "../engine/paper";

// небо: глубокий синий → лёд, северное сияние лентами
export const auroraSky = (g: G, t: number) => {
  const gr = g.createLinearGradient(0, -300, 0, 1300); gr.addColorStop(0, "#1C2B5A"); gr.addColorStop(0.55, "#4E7DB0"); gr.addColorStop(1, "#BFE3EE");
  cut(g, rectP(-400, -400, 1880, 2700), gr as any, { tear: 0, noEdge: true, sort: "water", grain: 0.3 });
  for (let k = 0; k < 3; k++) { g.save(); g.globalAlpha = 0.35 - k * 0.08; const P: Pt[] = []; const Q: Pt[] = [];
    for (let x = -400; x <= 1500; x += 40) { const y = 160 + k * 90 + Math.sin(x / 210 + t * 0.6 + k) * 70; P.push([x, y]); Q.unshift([x, y + 120 + Math.sin(x / 90 + t + k) * 30]); }
    const ag = g.createLinearGradient(0, 100, 0, 500); ag.addColorStop(0, "rgba(120,255,190,0)"); ag.addColorStop(0.5, ["#7CFFC4", "#8AE0FF", "#C59BFF"][k]); ag.addColorStop(1, "rgba(120,255,190,0)");
    g.fillStyle = ag; g.beginPath(); [...P, ...Q].forEach(([a, b], i) => (i ? g.lineTo(a, b) : g.moveTo(a, b))); g.fill(); g.restore(); }
  const r = rng(3); for (let i = 0; i < 40; i++) fillP(g, ellP(r() * 1500 - 200, r() * 500 - 300, 2, 2, 6), "#FFFFFF", 0.6 + 0.4 * Math.sin(t * 3 + i));
};
// горы слоями: дальняя (лёд) / средняя (скалы со снегом)
export const peaks = (y: number, h: number, col: string, snow: string, seed: number) => (g: G) => {
  const r = rng(seed); const P: Pt[] = [[-400, 2400]]; let x = -400; const tops: Pt[] = [];
  while (x < 1500) { const w = 160 + r() * 220; const top = y - h * (0.5 + r() * 0.5); P.push([x + w / 2, top]); tops.push([x + w / 2, top]); P.push([x + w, y - r() * h * 0.25]); x += w; } P.push([1500, 2400]);
  cut(g, P, col, { seed, sort: "kraft", tear: 1.4, edge: 2.4 });
  for (const [tx, ty] of tops) cut(g, [[tx, ty], [tx + 60, ty + 70], [tx + 25, ty + 55], [tx, ty + 85], [tx - 30, ty + 60], [tx - 60, ty + 72]], snow, { seed: seed + tx, sort: "water", edge: 1.4 });
};
// фьорд: вода с бликами и отражением гор
export const fjord = (y: number) => (g: G, t: number) => {
  cut(g, rectP(-400, y, 1880, 500), "#2F6E96", { tear: 0.6, sort: "water", edge: 2 });
  for (let i = 0; i < 26; i++) { const r = rng(i + 11); const xx = (r() * 1700 - 200 + t * 20 * (r() + 0.3)) % 1700 - 200; fillP(g, rectP(xx, y + 20 + r() * 400, 60 + r() * 120, 4), "#BFE3EE", 0.35 + 0.3 * Math.sin(t * 2 + i)); }
};
// склон со снегом (земля посёлка)
export const snowGround = (y: number, col = "#EEF5F8") => (g: G) => { const P: Pt[] = [[-400, 2400]]; for (let x = -400; x <= 1500; x += 60) P.push([x, y - Math.sin(x / 300) * 40]); P.push([1500, 2400]); cut(g, P, col, { seed: 1200 + y, sort: "water", tear: 1, edge: 2.6 }); };
// ДЛИННЫЙ ДОМ — псевдо-3D: торец (фронт) + боковая стена, видимая при повороте `turn` (−1…1); крыша — дёрн
export const longhouse = (x: number, y: number, s: number, turn: number, seed = 1) => (g: G, t: number) => {
  g.save(); g.translate(x, y); g.scale(s, s);
  const W = 240, H = 140, L = 380 * Math.abs(turn), dir = Math.sign(turn) || 1; // L — видимая длина боковой стены
  // боковая стена (в перспективе: трапеция уходит вглубь)
  if (L > 4) { const sx = dir * W / 2; cut(g, [[sx, 0], [sx + dir * L, -40], [sx + dir * L, -H + 30], [sx, -H]], "#7A5A3E", { seed: seed + 1, sort: "kraft", rim: 0.3 });
    for (let k = 1; k < 6; k++) strokeP(g, [[sx + dir * L * k / 6, -6 - 40 * k / 6], [sx + dir * L * k / 6, -H + 4 + 30 * k / 6]], "rgba(40,25,15,0.35)", 2);
    cut(g, [[sx, -H], [sx + dir * L, -H + 30], [sx + dir * (L - 20), -H - 70], [0, -H - 120]], "#6E8A4E", { seed: seed + 2, sort: "felt", tear: 1.2 }); }
  // торец
  cut(g, [[-W / 2, 0], [W / 2, 0], [W / 2, -H], [0, -H - 120], [-W / 2, -H]], "#8A6644", { seed: seed + 3, sort: "kraft", rim: 0.4 });
  for (let k = -2; k <= 2; k++) strokeP(g, [[k * 44, -2], [k * 44, -H + 6 - (2 - Math.abs(k)) * 30]], "rgba(40,25,15,0.35)", 2);
  cut(g, rrectP(-28, -90, 56, 90, 10), "#3A2618", { seed: seed + 4, edge: 1 }); fillP(g, rrectP(-22, -84, 44, 80, 8), "#FFB45A", 0.35 + 0.15 * Math.sin(t * 6 + seed)); // тёплый свет из двери
  cut(g, [[-W / 2 - 14, -H + 4], [0, -H - 132], [W / 2 + 14, -H + 4], [W / 2, -H + 16], [0, -H - 108], [-W / 2, -H + 16]], "#6E8A4E", { seed: seed + 5, sort: "felt", tear: 1.2 }); // дёрн
  strokeP(g, [[-18, -H - 104], [-40, -H - 150]], "#3A2618", 6); strokeP(g, [[18, -H - 104], [40, -H - 150]], "#3A2618", 6); // резные коньки
  cut(g, [[-W / 2 - 10, -H + 10], [W / 2 + 10, -H + 10], [W / 2, -H + 2], [-W / 2, -H + 2]], "#F4FAFC", { seed: seed + 6, sort: "water", edge: 1 }); // снег на карнизе
  g.restore();
};
// дым из дыры в крыше — несколько слоёв
export const smoke = (x: number, y: number, s = 1, seed = 1) => (g: G, t: number) => { const r = rng(seed); for (let i = 0; i < 6; i++) { const u = (t * 0.25 + i / 6 + r() * 0.1) % 1; fillP(g, ellP(x + Math.sin(u * 5 + seed) * 30 * s + u * 60 * s, y - u * 420 * s, (26 + u * 70) * s, (22 + u * 60) * s, 16), "#D9DCE0", 0.6 * (1 - u)); } };
// ДРАККАР — псевдо-3D: борт + видимая палуба (сверху) зависит от наклона камеры `tiltCam`, щиты по борту, голова дракона
export const drakkar = (x: number, y: number, s: number, tiltCam = 0.25, sail = 1, seed = 1) => (g: G, t: number) => {
  g.save(); g.translate(x, y + Math.sin(t * 1.3 + seed) * 6 * s); g.rotate(Math.sin(t * 1.1 + seed) * 0.02); g.scale(s, s);
  const deckH = 60 * tiltCam; // видимая «глубина» палубы
  cut(g, [[-330, -40 - deckH], [330, -40 - deckH], [350, -40], [-350, -40]], "#B0814E", { seed: seed + 1, sort: "kraft" }); // палуба
  for (let k = -5; k <= 5; k++) strokeP(g, [[k * 60, -40 - deckH], [k * 62, -40]], "rgba(60,40,20,0.35)", 1.5);
  if (sail > 0) { cut(g, rectP(-8, -40 - deckH - 440 * sail, 16, 440 * sail), "#5A3A24", { seed: seed + 2 });
    const sw = 300 * sail, sh = 300 * sail, sy = -40 - deckH - 420 * sail; g.save(); g.beginPath(); g.rect(-sw / 2, sy, sw, sh); g.clip();
    for (let k = 0; k < 6; k++) fillP(g, rectP(-sw / 2 + k * sw / 6, sy, sw / 6, sh), k % 2 ? "#C8352B" : "#F2E6CF"); g.restore(); strokeP(g, [[-sw / 2, sy], [sw / 2, sy]], "#5A3A24", 6); }
  cut(g, [[-360, -40], [-300, 40], [300, 40], [360, -40], [420, -150], [440, -120], [400, -30], [330, 70], [-330, 70], [-400, -30], [-440, -120], [-420, -150]], "#6A4426", { seed: seed + 3, sort: "kraft", rim: 0.5 }); // корпус
  for (let k = 0; k < 4; k++) strokeP(g, [[-340 + k * 6, -30 + k * 22], [340 - k * 6, -30 + k * 22]], "rgba(30,20,10,0.4)", 2); // клинкерные доски
  for (let k = -4; k <= 4; k++) { const cx = k * 70; cut(g, ellP(cx, -32, 30, 30, 20), ["#C8352B", "#F2C14E", "#2E5A8A"][(k + 9) % 3], { seed: seed + 10 + k, sort: "felt", edge: 1 }); fillP(g, ellP(cx, -32, 8, 8, 10), "#9C9C9C"); }
  cut(g, [[420, -150], [470, -210], [500, -200], [470, -170], [450, -140]], "#6A4426", { seed: seed + 4, sort: "kraft" }); fillP(g, ellP(478, -196, 4, 4, 8), "#F2C14E"); // голова дракона
  g.restore();
};
// падающий снег на заданной «глубине» (размер и скорость)
export const snowfall = (n: number, size: number, speed: number, seed: number, alpha = 0.9) => (g: G, t: number) => { const r = rng(seed); for (let i = 0; i < n; i++) { const x0 = r() * 1600 - 260, y0 = r() * 2400, ph = r() * 6; const y = ((y0 + t * speed * (0.7 + r() * 0.6)) % 2600) - 400; fillP(g, ellP(x0 + Math.sin(t + ph) * 30, y, size, size, 10), "#FFFFFF", alpha); } };
// полоса тумана
export const fogBand = (y: number, a = 0.5, seed = 1) => (g: G, t: number) => { const r = rng(seed); for (let i = 0; i < 9; i++) fillP(g, ellP(((r() * 1800 + t * 25) % 1900) - 300, y + r() * 60, 260 + r() * 200, 70 + r() * 40, 20), "#F2F6F8", a * (0.5 + r() * 0.5)); };
// фоновая жизнь: маленькие фигурки, овцы, птицы
export const sheep = (x: number, y: number, s = 1, seed = 1) => (g: G, t: number) => { g.save(); g.translate(x + Math.sin(t * 0.4 + seed) * 10, y); g.scale(s, s); cut(g, ellP(0, 0, 34, 22, 16), "#F4F1EA", { seed, sort: "felt", edge: 1.2 }); cut(g, ellP(30, -8, 12, 10, 12), "#3A3430", { seed: seed + 1 }); for (const k of [-18, 18]) strokeP(g, [[k, 18], [k, 34]], "#3A3430", 4); g.restore(); };
export const tinyFolk = (x: number, y: number, s = 1, col = "#8A3A2A", seed = 1, work = 0) => (g: G, t: number) => { g.save(); g.translate(x, y); g.scale(s, s); cut(g, rrectP(-12, -60, 24, 52, 8), col, { seed, sort: "felt", edge: 1 }); cut(g, ellP(0, -72, 11, 11, 12), "#E2B48E", { seed: seed + 1 }); fillP(g, ellP(0, -79, 12, 6, 10), "#C9A24B");
  if (work) { g.save(); g.translate(10, -48); g.rotate(-0.6 + Math.sin(t * 6 + seed) * 0.7); strokeP(g, [[0, 0], [0, -44]], "#5A3A24", 4); cut(g, [[-8, -44], [10, -50], [10, -36]], "#9C9C9C", { seed: seed + 2 }); g.restore(); }
  for (const k of [-6, 6]) strokeP(g, [[k, -8], [k, 2]], "#3A2A1E", 5); g.restore(); };
export const birds = (g: G, t: number) => { for (let i = 0; i < 5; i++) { const x = ((i * 260 + t * 70) % 1600) - 200, y = 520 + i * 26 + Math.sin(t + i) * 12, w = Math.sin(t * 8 + i) * 8; strokeP(g, [[x - 18, y - w], [x, y], [x + 18, y - w]], "#1C2B3A", 3); } };
export const runestone = (x: number, y: number, s = 1) => (g: G) => { g.save(); g.translate(x, y); g.scale(s, s); cut(g, [[-50, 0], [-60, -160], [-20, -230], [40, -220], [60, -150], [50, 0]], "#9AA0A6", { seed: 1300, sort: "kraft", rim: 0.4 });
  g.strokeStyle = "#C8352B"; g.lineWidth = 6; g.beginPath(); g.moveTo(-34, -30); g.bezierCurveTo(-60, -140, 40, -200, 30, -60); g.stroke(); text(g, "ᚱᚢᚾ", 0, -110, 34, "#3A2A1E"); g.restore(); };

// ---------------------------------------------------------------- КАРТА МИРА ВИКИНГОВ (своя, «пергамент + Ёрмунганд в море»)
// берег: каждую сторону делим на 8 частей и «изрезаем» шумом — фьорды и бухты вместо углов
const coast = (pts: Pt[], seed: number, amp = 22): Pt[] => { const r = rng(seed); const out: Pt[] = []; pts.forEach((a, i) => { const b = pts[(i + 1) % pts.length]; const dx = b[0] - a[0], dy = b[1] - a[1], L = Math.hypot(dx, dy) || 1;
  for (let k = 0; k < 8; k++) { const u = k / 8; const n = (r() - 0.5) * 2 * amp + Math.sin(u * 9 + seed) * amp * 0.4; out.push([a[0] + dx * u - dy / L * n, a[1] + dy * u + dx / L * n]); } }); return out; };
const land = (g: G, pts: Pt[], col: string, seed: number) => { cut(g, coast(pts, seed), col, { seed, sort: "kraft", tear: 1.2, edge: 2.4, rim: 0.3 }); };
export const vikingMap = (route = 1) => (g: G, t: number) => {
  cut(g, rectP(-400, -400, 1880, 2700), "#E9D2A4", { tear: 0, noEdge: true, sort: "kraft", grain: 0.6 });
  cut(g, rrectP(40, 260, 1000, 1400, 30), "#C8C9C2", { seed: 1400, sort: "water", tear: 1.4, edge: 2.4 }); // море
  for (let i = 0; i < 40; i++) { const r = rng(i + 50); const x = 80 + r() * 920, y = 300 + r() * 1320; strokeP(g, [[x, y], [x + 14, y - 5], [x + 28, y]], "rgba(90,90,90,0.35)", 2); } // рябь
  // суши
  land(g, [[60, 300], [380, 290], [330, 470], [220, 560], [120, 520], [60, 600]], "#F4F6F2", 1401); // Гренландия (лёд)
  land(g, [[220, 560], [330, 470], [360, 640], [300, 820], [240, 760]], "#D9B47A", 1402);
  land(g, [[60, 1050], [200, 1000], [260, 1120], [220, 1300], [90, 1420], [60, 1420]], "#D9B47A", 1403); // Винланд
  land(g, [[470, 700], [600, 660], [640, 730], [560, 800], [470, 780]], "#D9B47A", 1404); // Исландия
  land(g, [[820, 300], [1040, 290], [1040, 1000], [960, 960], [880, 800], [840, 620], [900, 520], [830, 420]], "#D9B47A", 1405); // Скандинавия
  land(g, [[880, 1000], [960, 980], [980, 1080], [900, 1100]], "#D9B47A", 1406); // Дания
  land(g, [[700, 980], [800, 960], [840, 1150], [810, 1300], [720, 1320], [690, 1150]], "#D9B47A", 1407); // Британия
  land(g, [[600, 1150], [680, 1130], [690, 1240], [610, 1260]], "#D9B47A", 1408); // Ирландия
  const lbl = (s: string, x: number, y: number, z = 30) => text(g, s, x, y, z, "#B23A2A", "Montserrat", 900);
  lbl("ГРЕНЛАНДИЯ", 230, 420, 30); lbl("ВИНЛАНД", 150, 1200, 32); lbl("ИСЛАНДИЯ", 560, 740, 26); lbl("НОРВЕГИЯ", 930, 620, 28); lbl("ДАНИЯ", 930, 1045, 22); lbl("АНГЛИЯ", 770, 1180, 24);
  // Ёрмунганд: тело ныряет в море и выныривает арками (кольца с узором)
  for (let k = 0; k < 5; k++) { const cx = 380 + k * 140, cy = 1470 + Math.sin(k * 1.7 + t * 0.8) * 30; const P: Pt[] = []; const Q: Pt[] = [];
    for (let a = 0; a <= 16; a++) { const u = a / 16, ang = Math.PI * (1 + u); P.push([cx + Math.cos(ang) * 60, cy + Math.sin(ang) * 70]); Q.unshift([cx + Math.cos(ang) * 34, cy + Math.sin(ang) * 46]); }
    cut(g, [...P, ...Q], "#5E7A4A", { seed: 1410 + k, sort: "felt", edge: 1.8, rim: 0.4 }); for (let a = 2; a < 15; a += 3) { const ang = Math.PI * (1 + a / 16); fillP(g, ellP(cx + Math.cos(ang) * 47, cy + Math.sin(ang) * 58, 6, 6, 8), "#B23A2A"); } }
  g.save(); g.translate(330, 1470 + Math.sin(t * 0.8) * 30); g.rotate(-0.25); g.scale(1.5, 1.5); cut(g, [[0, 0], [-90, -30], [-120, 0], [-90, 26]], "#5E7A4A", { seed: 1420, sort: "felt", edge: 1.6, rim: 0.4 }); fillP(g, ellP(-80, -8, 7, 6, 10), "#F2C14E"); strokeP(g, [[-120, 2], [-150, 10]], "#B23A2A", 3); g.restore();
  text(g, "МИДГАРД", 540, 1600, 60, "#B23A2A", "Montserrat", 900);
  // маршрут Норвегия → Исландия → Гренландия → Винланд
  const R: Pt[] = [[900, 620], [720, 640], [560, 730], [420, 640], [300, 640], [260, 820], [200, 980], [160, 1150]]; const n = Math.max(2, Math.floor(R.length * Math.min(1, route)));
  g.save(); g.setLineDash([18, 14]); strokeP(g, R.slice(0, n), "#B23A2A", 6); g.restore();
  // рамка-узор
  for (let i = 0; i < 2; i++) strokeP(g, rrectP(30 - i * 12, 250 - i * 12, 1020 + i * 24, 1420 + i * 24, 34), i ? "#3A2A1E" : "#8A6A40", 8, true);
};
// детали посёлка
export const fishRack = (x: number, y: number, s = 1) => (g: G, t: number) => { g.save(); g.translate(x, y); g.scale(s, s); for (const k of [-70, 70]) cut(g, [[k - 50, 0], [k, -150], [k + 50, 0]], "#6A4A30", { seed: 1500 + k, sort: "kraft", edge: 1 }); strokeP(g, [[-90, -130], [90, -130]], "#5A3A24", 6);
  for (let i = 0; i < 7; i++) { const sw = Math.sin(t * 2 + i) * 0.06; g.save(); g.translate(-75 + i * 25, -128); g.rotate(sw); cut(g, [[-7, 0], [7, 0], [9, 50], [0, 62], [-9, 50]], "#B9A88A", { seed: 1510 + i, edge: 0.8 }); g.restore(); } g.restore(); };
export const woodpile = (x: number, y: number, s = 1) => (g: G) => { g.save(); g.translate(x, y); g.scale(s, s); for (let r = 0; r < 3; r++) for (let i = 0; i < 5 - r; i++) { cut(g, ellP(-80 + i * 40 + r * 20, -16 - r * 30, 20, 16, 14), "#9C6B3E", { seed: 1520 + r * 10 + i, sort: "kraft", edge: 1 }); fillP(g, ellP(-80 + i * 40 + r * 20, -16 - r * 30, 9, 7, 10), "#D9B47A"); } g.restore(); };
export const barrels = (x: number, y: number, s = 1) => (g: G) => { g.save(); g.translate(x, y); g.scale(s, s); for (const k of [-40, 40]) { cut(g, rrectP(k - 30, -80, 60, 80, 14), "#8A5A34", { seed: 1530 + k, sort: "kraft", rim: 0.3 }); for (const yy of [-66, -16]) strokeP(g, [[k - 30, yy], [k + 30, yy]], "#3A2A1E", 4); } g.restore(); };
export const fence = (x0: number, x1: number, y: number) => (g: G) => { for (let x = x0; x <= x1; x += 46) cut(g, rrectP(x - 5, y - 70, 10, 74, 3), "#7A5A3E", { seed: 1540 + x, sort: "kraft", edge: 0.8 }); strokeP(g, [[x0, y - 50], [x1, y - 50]], "#6A4A30", 5); strokeP(g, [[x0, y - 22], [x1, y - 22]], "#6A4A30", 5); };
export const forgeGlow = (x: number, y: number) => (g: G, t: number) => { const f = 1 + Math.sin(t * 11) * 0.08; const gr = g.createRadialGradient(x, y, 4, x, y, 140 * f); gr.addColorStop(0, "rgba(255,170,70,0.85)"); gr.addColorStop(1, "rgba(255,120,40,0)"); g.fillStyle = gr; g.fillRect(x - 160, y - 160, 320, 320);
  cut(g, rrectP(x - 40, y - 10, 80, 50, 8), "#5A5A5E", { seed: 1550, edge: 1 }); for (let i = 0; i < 4; i++) { const u = (t * 1.5 + i / 4) % 1; fillP(g, ellP(x + Math.sin(i * 3 + t * 4) * 20, y - 20 - u * 90, 3, 3, 6), "#FFC45A", 1 - u); } };
export const boathouse = (x: number, y: number, s = 1) => (g: G) => { g.save(); g.translate(x, y); g.scale(s, s); cut(g, [[-160, 0], [160, 0], [140, -90], [0, -170], [-140, -90]], "#5E7A4A", { seed: 1560, sort: "felt", tear: 1.2, rim: 0.3 }); cut(g, [[-90, 0], [90, 0], [70, -70], [0, -110], [-70, -70]], "#2A1E16", { seed: 1561, edge: 1 }); g.restore(); };
