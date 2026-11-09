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
