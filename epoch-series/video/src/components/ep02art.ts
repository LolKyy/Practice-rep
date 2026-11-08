// Декорации серии «Доставка на абордаж» (пираты, Карибы, 1718). Та же бумага (paper.ts).
import { G, PAL, cut, rectP, rrectP, ellP, fillP, strokeP, text, rng, Pt, cloud, thread, rivet } from "../engine/paper";

export type SeaTod = "day" | "storm" | "gold";
const SKY2: Record<SeaTod, [string, string]> = { day: ["#4FB3F0", "#CFF1F7"], storm: ["#5E6E86", "#B9C6CF"], gold: ["#FF9F4A", "#FFE29A"] };
export const seaSky = (tod: SeaTod) => (g: G, t: number) => {
  const [a, b] = SKY2[tod]; const gr = g.createLinearGradient(0, -200, 0, 1100); gr.addColorStop(0, a); gr.addColorStop(1, b);
  cut(g, rectP(-400, -400, 1880, 2700), gr as any, { tear: 0, noEdge: true, sort: "water", grain: 0.35 });
  if (tod !== "storm") { const sy = 300 + Math.sin(t * 0.8) * 6; thread(g, 820, -400, sy - 90); cut(g, ellP(820, sy, 90, 90, 40), PAL.sun, { seed: 1, sort: "water", edge: 3, rim: 0.4 }); }
  cloud(g, 220 + Math.sin(t * 0.5) * 8, 330, 300, 11, tod === "storm" ? "#8E99A8" : "#FFFFFF", 50); cloud(g, 960 + Math.sin(t * 0.4 + 2) * 8, 500, 240, 12, tod === "storm" ? "#A3ADB9" : "#FBFBF6", 120);
};
// волна-полоса: y — уровень, amp — высота гребней, col — цвет, ph — фаза
export const wave = (y: number, amp: number, col: string, ph: number, speed = 1, seed = 1) => (g: G, t: number) => {
  const P: Pt[] = [[-400, 2400]]; for (let x = -400; x <= 1500; x += 30) P.push([x, y + Math.sin(x / 90 + t * 1.6 * speed + ph) * amp + Math.sin(x / 37 + t * 2.3 * speed) * amp * 0.3]); P.push([1500, 2400]);
  cut(g, P, col, { seed, sort: "water", tear: 0.6, edge: 2.2 });
  for (let x = -380; x < 1500; x += 180) { const yy = y + Math.sin(x / 90 + t * 1.6 * speed + ph) * amp; fillP(g, ellP(x + 40, yy + 10, 26, 6, 10), "#FFFFFF", 0.55); }
};
// пристань Нассау: дощатый настил, хижины, пальма
export const harbor = (g: G) => {
  for (let i = 0; i < 3; i++) { const x = 60 + i * 330; cut(g, rectP(x, 860, 260, 220), ["#E9D3A6", "#D8B98A", "#F0DFC0"][i], { seed: 700 + i, sort: "kraft", rim: 0.4 }); cut(g, [[x - 30, 870], [x + 130, 760], [x + 290, 870]], "#B98A5A", { seed: 710 + i, sort: "kraft" }); cut(g, rectP(x + 100, 960, 60, 120), "#6A4426", { seed: 720 + i }); }
  text(g, "TAVERN", 225, 930, 30, "#6A4426");
  g.save(); g.translate(1010, 1080); cut(g, [[-14, 0], [-6, -420], [8, -420], [16, 0]], "#9C6B3E", { seed: 730, sort: "kraft" });
  for (let i = 0; i < 6; i++) { g.save(); g.translate(0, -420); g.rotate(-2.6 + i * 0.75); cut(g, ellP(0, -110, 34, 120, 16), i % 2 ? "#4E8A3C" : "#6FA84E", { seed: 731 + i, sort: "kraft" }); g.restore(); } g.restore();
};
export const dock = (g: G) => { cut(g, rectP(-400, 1260, 1880, 900), "#B07A48", { tear: 0.6, sort: "kraft", edge: 2.5 }); for (let x = -380; x < 1500; x += 110) strokeP(g, [[x, 1262], [x - 40, 2100]], "rgba(70,40,20,0.35)", 3); for (const x of [120, 960]) cut(g, rrectP(x - 22, 1150, 44, 160, 10), "#7A4E2E", { seed: 740 + x, sort: "kraft" }); };
// фрегат (вид сбоку). flag: "jolly" | "pist" (флаг Пистолетова — череп в треуголке)
export const frigate = (o: { x?: number; y?: number; s?: number; flag?: "jolly" | "pist"; hull?: string; broken?: number; fire?: number } = {}) => (g: G, t: number) => {
  const { x = 540, y = 1180, s = 1, flag = "jolly", hull = "#7A4E2E", broken = 0, fire = 0 } = o; g.save(); g.translate(x, y + Math.sin(t * 1.4) * 8); g.rotate(Math.sin(t * 1.1) * 0.025 + broken * 0.35); g.scale(s, s);
  for (const [mx, mh] of [[-170, 520], [10, 600], [180, 470]] as [number, number][]) { cut(g, rectP(mx - 8, -mh, 16, mh), "#5A3A24", { seed: 750 + mx, sort: "kraft" });
    for (let k = 0; k < 2; k++) { const sy = -mh + 60 + k * 200, sw = 150 - k * 10; cut(g, [[mx - sw / 2, sy], [mx + sw / 2, sy], [mx + sw / 2 + 14, sy + 160], [mx - sw / 2 - 14, sy + 160]], "#F4ECD8", { seed: 760 + mx + k, sort: "water", rim: 0.5, tear: 0.8 }); } }
  // флаг
  g.save(); g.translate(18, -600); const fw = Math.sin(t * 6) * 6; cut(g, [[0, 0], [130, fw], [130, 80 + fw], [0, 80]], "#1E1A17", { seed: 770, edge: 1.4, tear: 0.6 });
  fillP(g, ellP(62, 34, 16, 15, 14), "#F4ECD8"); fillP(g, ellP(56, 32, 4, 4, 8), "#1E1A17"); fillP(g, ellP(68, 32, 4, 4, 8), "#1E1A17");
  if (flag === "pist") cut(g, [[36, 24], [62, 6], [88, 24], [62, 18]], "#D9B04A", { seed: 771, edge: 0.8 }); else { strokeP(g, [[38, 52], [86, 70]], "#F4ECD8", 5); strokeP(g, [[86, 52], [38, 70]], "#F4ECD8", 5); } g.restore();
  // корпус
  cut(g, [[-330, -40], [330, -40], [380, -110], [400, -100], [300, 120], [-290, 120], [-360, -20]], hull, { seed: 780, sort: "kraft", rim: 0.5 });
  cut(g, rectP(-320, -40, 640, 26), "#D9B04A", { seed: 781, edge: 1 });
  for (let i = 0; i < 7; i++) { cut(g, rectP(-260 + i * 80, 10, 40, 34), "#2A1E16", { seed: 790 + i, edge: 0.8 }); cut(g, rrectP(-252 + i * 80, 20, 30, 12, 5), "#3A3A3A", { seed: 800 + i, edge: 0.6 }); }
  if (fire > 0) for (let i = 0; i < 7; i++) { const u = ((t * 1.8 + i * 0.37) % 1); if (u < 0.5) { const k = u / 0.5; fillP(g, ellP(-240 + i * 80 - 30 - k * 120, 28, 18 + k * 60, 14 + k * 46, 16), "#E9E4DA", (1 - k) * 0.9 * fire); if (k < 0.2) fillP(g, ellP(-250 + i * 80, 28, 22, 16, 12), "#FFB13B", fire); } }
  g.restore();
};
// щупальца осьминога: hold 0…1 — насколько обвили корабль
export const tentacles = (hold: number, x0 = 540, y0 = 1300) => (g: G, t: number) => {
  const cols = ["#C0507A", "#A8436A"];
  for (let i = 0; i < 5; i++) { const bx = x0 - 380 + i * 190, w = 46 - i % 2 * 8, h = 300 + hold * 380 + (i % 2) * 80; const P: Pt[] = []; const Q: Pt[] = [];
    for (let k = 0; k <= 20; k++) { const u = k / 20; const yy = y0 - u * h; const xx = bx + Math.sin(u * 4 + t * 2 + i) * 60 * u + (i < 2 ? 1 : -1) * Math.sin(u * 3) * 90 * hold * u; const ww = w * (1 - u * 0.85); P.push([xx - ww, yy]); Q.unshift([xx + ww, yy]); }
    cut(g, [...P, ...Q], cols[i % 2], { seed: 820 + i, sort: "felt", rim: 0.5, edge: 2 });
    for (let k = 2; k < 14; k += 3) { const u = k / 20; const yy = y0 - u * h; const xx = bx + Math.sin(u * 4 + t * 2 + i) * 60 * u + (i < 2 ? 1 : -1) * Math.sin(u * 3) * 90 * hold * u; fillP(g, ellP(xx + w * 0.4 * (1 - u), yy, 9 * (1 - u * 0.6), 9 * (1 - u * 0.6), 10), "#F2B8CB"); } }
};
export const octoEye = (x: number, y: number, s = 1, squint = 0) => (g: G) => { g.save(); g.translate(x, y); g.scale(s, s); cut(g, ellP(0, 0, 210, 170, 40), "#C0507A", { seed: 840, sort: "felt", rim: 0.5 }); cut(g, ellP(-60, -20, 46, 50 * (1 - squint * 0.85), 24), "#FFF6D8", { seed: 841, edge: 1.2 }); cut(g, ellP(60, -20, 46, 50 * (1 - squint * 0.85), 24), "#FFF6D8", { seed: 842, edge: 1.2 }); if (squint < 0.5) { fillP(g, rectP(-72, -36, 22, 34), "#1E1A17"); fillP(g, rectP(50, -36, 22, 34), "#1E1A17"); } g.restore(); };
export const lemon = (g: G, x = 0, y = 0, r = 1, seed = 850) => { g.save(); g.translate(x, y); g.scale(r, r); cut(g, [...ellP(0, 0, 20, 14, 20)], "#F7D84A", { seed, edge: 1, sort: "felt" }); fillP(g, ellP(-6, -4, 5, 2.5, 8), "#FFFFFF", 0.6); cut(g, [[16, -4], [24, -8], [22, 2]], "#6FA84E", { seed: seed + 1, edge: 0.5 }); g.restore(); };
export const lemonCrate = (g: G) => { g.save(); cut(g, rrectP(-34, -22, 68, 30, 4), "#B07A48", { seed: 860, sort: "kraft", edge: 0.8 }); for (let i = 0; i < 5; i++) lemon(g, -24 + i * 12, -24 - (i % 2) * 5, 0.38, 861 + i); g.restore(); };
export const cannonball = (x: number, y: number, r = 26) => (g: G) => { cut(g, ellP(x, y, r, r, 20), "#2A2A2E", { seed: 870, edge: 1.2, rim: 0.8 }); fillP(g, ellP(x - r * 0.35, y - r * 0.35, r * 0.25, r * 0.18, 10), "#FFFFFF", 0.4); };
export const smokePuffs = (x: number, y: number, n = 5, seed = 1) => (g: G, t: number) => { const r = rng(seed); for (let i = 0; i < n; i++) { const u = (t * 0.35 + r()) % 1; fillP(g, ellP(x + (r() - 0.5) * 300 + u * 80, y - u * 260, 70 + u * 110, 60 + u * 90, 20), "#E9E4DA", 0.75 * (1 - u)); } };
export const sabre = (g: G) => { g.save(); g.rotate(Math.PI); cut(g, [[-3, 6], [4, 6], [8, 44], [2, 56], [-3, 40]], "#D5DBE0", { seed: 880, edge: 0.7, rim: 0.8 }); cut(g, ellP(0, 4, 10, 6, 12), "#D9B04A", { seed: 881, edge: 0.6 }); cut(g, rrectP(-3, -12, 6, 14, 2), "#6A4426", { seed: 882 }); g.restore(); };
export { rivet };
