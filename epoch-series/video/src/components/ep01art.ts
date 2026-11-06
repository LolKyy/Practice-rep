// Декорации и реквизит серии 1 «Заказ для Цезаря» (Рим, 44 г. до н.э.). Всё — та же бумага (paper.ts).
import { G, PAL, cut, rectP, rrectP, ellP, fillP, strokeP, text, inkText, tape, rng, Pt, rivet } from "../engine/paper";

const star = (g: G, x: number, y: number, r: number, c: string, seed: number) => { const P: Pt[] = []; for (let i = 0; i < 10; i++) { const a = -Math.PI / 2 + i * Math.PI / 5; const rr = i % 2 ? r * 0.45 : r; P.push([x + Math.cos(a) * rr, y + Math.sin(a) * rr]); } cut(g, P, c, { seed, edge: 2.4, tear: 0.4 }); };
export const stars = (g: G, x: number, y: number, n: number, r: number, gap: number, seed = 930) => { for (let i = 0; i < n; i++) star(g, x + i * gap, y, r, "#FFB400", seed + i); };

// ---------------------------------------------------------------- экран курьерского приложения (заказ)
export type AppOpts = { title?: string; rows?: [string, string][]; addr?: string; date?: string; client?: string; press?: number; finger?: number; unknown?: boolean };
export const appScreen = (g: G, t: number, o: AppOpts = {}) => {
  const { title = "НОВЫЙ ЗАКАЗ!", rows = [["Шаурма", "× 1"], ["Салат «Цезарь»", "× 1"]], addr = "Рим, Сенат", date = "15 марта 44 г. до н.э.", client = "Юлий Цезарь", press = 0, finger = 1, unknown = false } = o;
  cut(g, rectP(-20, -20, 1120, 1960), "#FFD43B", { tear: 0, noEdge: true, sort: "water", grain: 0.4 });
  for (let i = 0; i < 9; i++) cut(g, ellP(100 + (i % 3) * 440, 150 + Math.floor(i / 3) * 700, 120, 120, 30), "#FFC21A", { seed: 900 + i, edge: 1, grain: 0.2 });
  g.save(); g.translate(540, 640); g.scale(0.86, 0.86); g.rotate(-0.05 + Math.sin(t * 1.3) * 0.006);
  cut(g, rrectP(-330, -640, 660, 1280, 70), "#1E1A17", { seed: 910, edge: 3, tear: 0.2, rim: 0.4 });
  cut(g, rrectP(-300, -600, 600, 1200, 46), "#FFFFFF", { seed: 911, edge: 0, tear: 0, noEdge: true, grain: 0.15 });
  cut(g, rrectP(-300, -600, 600, 200, 46), "#FFC928", { seed: 912, edge: 0, tear: 0, noEdge: true, grain: 0.2 });
  inkText(g, title, 0, -500, 64, PAL.ink);
  rows.forEach(([a, b], i) => { const y = -340 + i * 100; cut(g, rrectP(-260, y - 40, 520, 80, 16), "#F4F1EA", { seed: 913 + i, edge: 1.4, tear: 0.3 }); inkText(g, a, -230, y, 40, PAL.ink, "Montserrat", 900, "left"); inkText(g, b, 230, y, 40, PAL.scarf, "Montserrat", 900, "right"); });
  text(g, "АДРЕС:", -260, -100, 30, "#8a8070", "Montserrat", 900, "left"); inkText(g, addr, -260, -50, unknown ? 90 : 52, unknown ? PAL.scarf : PAL.ink, "Montserrat", 900, "left");
  if (date) text(g, date, -260, 10, 36, PAL.scarf, "Montserrat", 900, "left");
  if (!unknown) {
    cut(g, ellP(-200, 150, 70, 70, 30), "#F0D2A8", { seed: 920, edge: 2 });
    for (let i = 0; i < 7; i++) { const a = Math.PI * 1.05 + i * 0.15; g.save(); g.translate(-200 + Math.cos(a) * 66, 150 + Math.sin(a) * 66); g.rotate(a + 1.2); cut(g, ellP(0, 0, 8, 18, 10), "#5E9A2E", { seed: 921 + i, edge: 1 }); g.restore(); }
    fillP(g, ellP(-222, 145, 6, 8, 8), PAL.ink); fillP(g, ellP(-178, 145, 6, 8, 8), PAL.ink); strokeP(g, [[-212, 180], [-188, 180]], PAL.ink, 4);
    text(g, "КЛИЕНТ", -100, 115, 28, "#8a8070", "Montserrat", 900, "left"); inkText(g, client, -100, 165, 46, PAL.ink, "Montserrat", 900, "left");
    stars(g, -95, 215, 5, 16, 38);
  } else { cut(g, ellP(-200, 150, 70, 70, 30), "#E6E1D6", { seed: 920, edge: 2 }); inkText(g, "?", -200, 150, 90, "#8a8070"); text(g, "КЛИЕНТ", -100, 115, 28, "#8a8070", "Montserrat", 900, "left"); inkText(g, "???", -100, 165, 46, PAL.ink, "Montserrat", 900, "left"); }
  const pr = Math.min(1, press); g.save(); g.translate(0, 355); g.scale(1 - pr * 0.06, 1 - pr * 0.08);
  cut(g, rrectP(-260, -65, 520, 130, 40), pr > 0.5 ? "#2E9A47" : "#3DBE5A", { seed: 940, edge: 2.4, rim: 0.4 }); inkText(g, "ПРИНЯТЬ", 0, 2, 64, "#FFFFFF"); g.restore();
  g.restore();
  if (finger > 0) { // палец Сёмы (горчичный рукав)
    const fy = 1240 - pr * 120 + (1 - finger) * 700; g.save(); g.translate(700, fy); g.rotate(-0.55);
    cut(g, rrectP(-90, 0, 180, 600, 50), PAL.mustard, { seed: 950, edge: 2.4, sort: "felt", rim: 0.5 }); cut(g, rrectP(-95, -10, 190, 60, 20), "#C48F2E", { seed: 951, edge: 2 });
    cut(g, ellP(0, -70, 85, 95, 30), PAL.skin, { seed: 952, edge: 2.4, sort: "water" }); cut(g, rrectP(-24, -260, 48, 210, 24), PAL.skin, { seed: 953, edge: 2.4, sort: "water" }); g.restore();
  }
  tape(g, 140, 120, 200, -0.4, 44);
};

// ---------------------------------------------------------------- инсула в разрезе: 5 этажей, ценники, огонь сверху
export const insula = (fire = 0) => (g: G, t: number) => {
  const x0 = 110, w = 580, fh = 230, base = 1500; // этаж 1 внизу
  cut(g, rectP(x0 - 30, base - fh * 5 - 40, w + 60, fh * 5 + 60), "#C4693D", { seed: 400, sort: "kraft", rim: 0.4 });
  const room = ["#F2DDB4", "#EED3A4", "#E9C894", "#E2BC86", "#D9AE78"];
  const price = ["ДОРОГО", "ДОРОГО", "НОРМ", "ДЁШЕВО", "КОПЕЙКИ"];
  for (let i = 0; i < 5; i++) {
    const y = base - (i + 1) * fh; cut(g, rectP(x0, y + 12, w, fh - 24), room[i], { seed: 401 + i, sort: "water", edge: 1.2 });
    const r = rng(i + 7); for (let k = 0; k < 3; k++) cut(g, rrectP(x0 + 40 + k * 180, y + 60, 90, 120, 40), "#8FC6E0", { seed: 410 + i * 3 + k, edge: 1 });
    if (i < 2) cut(g, rrectP(x0 + 380, y + 150, 160, 50, 10), "#7A4E2E", { seed: 430 + i }); // мебель на нижних
    if (i >= 3) for (let k = 0; k < 4; k++) fillP(g, ellP(x0 + 60 + r() * 460, y + 190, 30, 10, 10), "#B48A5A", 0.8); // тюфяки
    // ценник на гвоздике
    g.save(); g.translate(x0 + w + 30, y + fh / 2); g.rotate(0.08 * (i % 2 ? 1 : -1));
    cut(g, [[0, 0], [30, -40], [230, -40], [230, 40], [30, 40]], i >= 3 ? "#F7D84A" : "#FBF7EC", { seed: 440 + i, edge: 2, tear: 0.4 });
    rivet(g, 22, 0, 6); inkText(g, `${i + 1} ЭТ.`, 128, -14, 26, "#8a8070"); inkText(g, price[i], 128, 18, i === 4 ? 34 : 30, i >= 3 ? PAL.scarf : PAL.ink); g.restore();
  }
  // крыша
  cut(g, [[x0 - 60, base - fh * 5 - 30], [x0 + w / 2, base - fh * 5 - 170], [x0 + w + 60, base - fh * 5 - 30]], "#A8452A", { seed: 450, sort: "felt", rim: 0.5 });
  if (fire > 0) { // огонь и дым на 5 этаже
    const y = base - fh * 5; for (let k = 0; k < 7; k++) { const fx = x0 + 40 + k * 85, s = fire * (0.8 + 0.4 * Math.sin(t * 9 + k * 2)); g.save(); g.translate(fx, y + fh - 20);
      cut(g, [[-45 * s, 0], [-20 * s, -120 * s], [0, -200 * s], [20 * s, -110 * s], [45 * s, 0]], "#F25C1E", { seed: 460 + k, edge: 2, tear: 1.4 });
      cut(g, [[-25 * s, 0], [-10 * s, -70 * s], [0, -120 * s], [10 * s, -60 * s], [25 * s, 0]], "#FFC93C", { seed: 470 + k, edge: 1.5, tear: 1 }); g.restore(); }
    for (let k = 0; k < 4; k++) { const u = (t * 0.4 + k * 0.25) % 1; fillP(g, ellP(x0 + 150 + k * 110 + u * 60, y - 120 - u * 500, 60 + u * 90, 50 + u * 70, 20), "#6B6560", 0.55 * (1 - u) * fire); }
  }
};

// ---------------------------------------------------------------- общественная латрина: стена и скамья с дырками
export const latrineWall = (g: G) => {
  cut(g, rectP(-300, 300, 1680, 1400), "#E3D3B4", { tear: 0, sort: "kraft", noEdge: true });
  for (let y = 360; y < 1400; y += 90) for (let x = -280 + ((y / 90) % 2) * 80; x < 1380; x += 160) strokeP(g, rectP(x, y, 160, 90), "rgba(150,120,80,0.35)", 2, true);
  for (let i = 0; i < 3; i++) { cut(g, rrectP(120 + i * 320, 520, 200, 280, 100), "#BFE0EE", { seed: 500 + i, edge: 2 }); }
  cut(g, rectP(-300, 1380, 1680, 600), "#CDB68C", { seed: 505, sort: "kraft", tear: 1 }); // пол
  cut(g, rectP(-300, 1460, 1680, 60), "#7FB3C9", { seed: 506, sort: "water", edge: 1.5 }); // канавка с водой
};
export const latrineBench = (g: G) => {
  cut(g, rrectP(-200, 1120, 1480, 90, 12), "#F1E6CC", { seed: 510, sort: "water", rim: 0.5 }); // сиденье
  cut(g, rectP(-200, 1200, 1480, 230), "#E7D5B0", { seed: 511, sort: "kraft" }); // фасад
  for (let i = 0; i < 7; i++) fillP(g, rrectP(-90 + i * 200, 1230, 70, 140, 30), "#5A4A30", 0.85); // отверстия спереди
};
export const spongeStick = (g: G, s = 1) => { // терсориум
  g.save(); g.scale(s, s); cut(g, rrectP(-8, -10, 16, 240, 6), "#9C6B3E", { seed: 520, sort: "kraft", edge: 1.2 });
  const r = rng(3); const P: Pt[] = []; for (let i = 0; i < 18; i++) { const a = (i / 18) * 6.28; const rr = 48 + r() * 14; P.push([Math.cos(a) * rr * 0.9, -40 + Math.sin(a) * rr * 0.75]); }
  cut(g, P, "#E8C34E", { seed: 521, sort: "felt", edge: 2, tear: 1.2 }); for (let i = 0; i < 10; i++) fillP(g, ellP(-30 + r() * 60, -60 + r() * 45, 4 + r() * 4, 3 + r() * 3, 8), "#B38A22", 0.8); g.restore();
};

// ---------------------------------------------------------------- рынок: прилавок и амфора гарума с волнами вони
export const stall = (g: G) => {
  cut(g, rectP(80, 1080, 920, 60), "#8A5A34", { seed: 530, sort: "kraft", rim: 0.4 }); cut(g, rectP(110, 1140, 860, 260), "#B07A48", { seed: 531, sort: "kraft" });
  for (let i = 0; i < 6; i++) cut(g, [[60 + i * 160, 640], [140 + i * 160, 640], [140 + i * 160, 760], [100 + i * 160, 720], [60 + i * 160, 760]], i % 2 ? PAL.scarf : "#FBF7EC", { seed: 532 + i, sort: "felt" }); // навес
  for (const x of [90, 990]) cut(g, rectP(x - 8, 640, 16, 480), "#6A4426", { seed: 540 + x });
};
export const amphora = (stink = 1) => (g: G, t: number) => {
  g.save(); g.translate(400, 1080);
  cut(g, [[-40, -330], [40, -330], [50, -290], [120, -220], [130, -80], [70, 0], [0, 40], [-70, 0], [-130, -80], [-120, -220], [-50, -290]], "#C4693D", { seed: 550, sort: "kraft", rim: 0.5 });
  for (const s of [-1, 1]) strokeP(g, [[s * 40, -300], [s * 110, -300], [s * 110, -230]], "#A8552E", 14);
  fillP(g, rectP(-110, -200, 220, 18), "#8E4A2A"); text(g, "GARVM", 0, -140, 30, "#F3D58A");
  for (let k = 0; k < 3; k++) { const u = (t * 0.5 + k / 3) % 1; g.save(); g.globalAlpha = stink * (1 - u) * 0.9; const P: Pt[] = []; for (let y = 0; y < 14; y++) P.push([Math.sin(y * 0.9 + t * 5 + k) * 26 + (k - 1) * 60, -360 - y * 22 - u * 200]);
    strokeP(g, P, "#7BC043", 16); g.restore(); }
  g.restore();
  for (let i = 0; i < 4; i++) { g.save(); g.translate(620 + i * 90, 1060); cut(g, ellP(0, 0, 40, 16, 16), "#9FB4C8", { seed: 560 + i, edge: 1.2 }); cut(g, [[-35, 0], [30, -10], [45, 0], [30, 10]], "#8AA0B4", { seed: 565 + i, edge: 1 }); g.restore(); } // рыба
};

// ---------------------------------------------------------------- трибуна (ростры) и Сенат
export const rostra = (g: G) => {
  cut(g, rectP(140, 1120, 800, 340), "#E7D5B0", { seed: 570, sort: "kraft", rim: 0.4 }); cut(g, rectP(120, 1090, 840, 50), "#F1E6CC", { seed: 571, sort: "water" });
  for (let i = 0; i < 4; i++) { g.save(); g.translate(240 + i * 200, 1270); cut(g, [[-60, -30], [60, -10], [70, 20], [-60, 30]], "#8E8A80", { seed: 572 + i, edge: 1.4, rim: 0.6 }); rivet(g, -40, 0, 8); g.restore(); } // носы кораблей
  text(g, "ROSTRA", 540, 1400, 44, "#9C7A2E");
};
export const senate = (doors = 0, dark = 0) => (g: G) => { // doors 0 — открыты, 1 — закрыты; dark — тени внутри
  cut(g, rectP(60, 520, 960, 1000), "#EFE4CA", { seed: 580, sort: "kraft", rim: 0.4 });
  cut(g, [[30, 540], [540, 330], [1050, 540]], "#F6EEDB", { seed: 581, sort: "water", rim: 0.5 }); text(g, "CVRIA", 540, 480, 52, "#9C7A2E");
  cut(g, rectP(330, 760, 420, 640), "#2A2018", { seed: 582, edge: 1 }); // проём
  if (dark > 0) { g.save(); g.globalAlpha = dark; for (let i = 0; i < 6; i++) { const x = 380 + i * 62; fillP(g, ellP(x, 1000, 22, 26, 14), "#0E0A08"); fillP(g, rrectP(x - 34, 1030, 68, 260, 24), "#0E0A08"); } g.restore(); }
  const dw = 210 * doors; cut(g, rectP(330, 760, dw, 640), "#7A4E2E", { seed: 583, sort: "kraft", edge: 1.5 }); cut(g, rectP(750 - dw, 760, dw, 640), "#7A4E2E", { seed: 584, sort: "kraft", edge: 1.5 });
  if (doors > 0.3) { rivet(g, 330 + dw - 30, 1080, 12); rivet(g, 750 - dw + 30, 1080, 12); }
  for (let i = 0; i < 6; i++) { const x = 100 + i * 175 + (i >= 3 ? 70 : 0) - (i >= 3 ? 70 : 0); if (x > 300 && x < 760) continue; cut(g, rectP(x, 600, 70, 820), "#F6EEDB", { seed: 585 + i, edge: 1.2 }); }
  for (let i = 0; i < 4; i++) cut(g, rectP(-60 - i * 40, 1400 + i * 70, 1200 + i * 80, 74), i % 2 ? "#E7D5B0" : "#F1E6CC", { seed: 590 + i, sort: "kraft", edge: 1.5 }); // ступени
};
export const pigeon = (g: G, t: number) => {
  const peck = Math.max(0, Math.sin(t * 7)) ** 3; g.save(); g.translate(600, 1760); g.scale(1.4, 1.4);
  cut(g, ellP(0, 0, 70, 46, 24), "#9AA3AD", { seed: 600, sort: "felt", rim: 0.5 }); cut(g, [[-60, -10], [-130, -30], [-120, 10]], "#7E8792", { seed: 601, edge: 1.2 });
  g.save(); g.translate(50, -40); g.rotate(0.3 + peck * 0.9); cut(g, ellP(10, -10, 30, 28, 18), "#7E8792", { seed: 602, sort: "felt" }); fillP(g, ellP(18, -16, 5, 5, 8), PAL.ink); cut(g, [[36, -8], [56, -2], [36, 2]], "#E2A03A", { seed: 603, edge: 0.8 }); g.restore();
  for (const s of [-15, 15]) strokeP(g, [[s, 40], [s, 70]], "#D96A4A", 6); g.restore();
};
export const saladBox = (g: G) => { g.save(); g.rotate(0.1); cut(g, rrectP(-30, -16, 60, 26, 5), "#E9F1EE", { seed: 610, edge: 0.8, sort: "trace" }); for (let i = 0; i < 6; i++) fillP(g, ellP(-20 + i * 8, -10 + (i % 2) * 3, 6, 4, 8), i % 3 ? "#6BAF3A" : "#E9C27A"); cut(g, rrectP(-32, -20, 64, 8, 3), "#C9DAD4", { seed: 611, edge: 0.6 }); g.restore(); };
export const saladFloor = (g: G) => { g.save(); g.translate(400, 1800); g.scale(5, 5); saladBox(g); g.restore(); };
export const shieldProp = (g: G) => { g.save(); cut(g, rrectP(-22, -34, 44, 68, 8), "#A8452A", { seed: 620, sort: "felt", edge: 1, rim: 0.5 }); fillP(g, ellP(0, 0, 8, 8, 12), "#D9B04A"); strokeP(g, [[-18, -24], [18, -24]], "#D9B04A", 2); strokeP(g, [[-18, 24], [18, 24]], "#D9B04A", 2); g.restore(); };
export const laurelFly = (g: G, x: number, y: number, rot: number) => { g.save(); g.translate(x, y); g.rotate(rot); for (let i = 0; i < 9; i++) { const a = Math.PI * 1.05 + i * 0.11; g.save(); g.translate(Math.cos(a) * 120, Math.sin(a) * 60 + 60); g.rotate(a + 1.2); cut(g, ellP(0, 0, 14, 32, 10), "#5E9A2E", { seed: 630 + i, edge: 1 }); g.restore(); } g.restore(); };
// толпа: ряды голов и плеч (дальний план)
export const crowd = (rows = 3, seed = 1) => (g: G, t: number) => {
  const cols = ["#E07B39", "#4E8FD0", "#F2EEE4", "#B9A27A", "#7DB848", "#C8A2D8", "#D9534F", "#F2C14E"];
  for (let r = 0; r < rows; r++) { const R = rng(seed + r * 13); const y = 1080 + r * 120; for (let i = 0; i < 12; i++) { const x = -120 + i * 115 + R() * 50 + (r % 2) * 55; const b = Math.sin(t * 6 + i + r) * 4;
    cut(g, rrectP(x - 50, y + b, 100, 220, 40), cols[Math.floor(R() * cols.length)], { seed: seed * 100 + r * 20 + i, sort: "felt", edge: 1.4 }); cut(g, ellP(x, y - 40 + b, 38, 40, 18), R() > 0.5 ? "#D9AE86" : "#C99B72", { seed: seed * 100 + r * 20 + i + 7, edge: 1.4 });
    fillP(g, ellP(x, y - 72 + b, 36, 16, 14), "#3A2A1E"); } }
};
