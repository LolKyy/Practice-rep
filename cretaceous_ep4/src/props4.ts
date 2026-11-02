// Реквизит Ч4 «Двенадцать километров»: трицератопсы, река (синяя калька), водомёт, болото, толстые стволы, котелок, скала с белой полосой.
import { PAL, G, Pt, cut, fillP, strokeP, clipTo, rivet, rrectP, ellP, rectP, rng, text, tear, fernBush } from "./cut";

export const TRI = { body: "#7E7656", dark: "#5E573E", frill: "#A07A48", spot: "#6E4E2C", belly: "#B8A882", horn: "#F1E6CC" };

// ------------------------------------------------------------------ трицератопс сбоку (морда вправо). (0,0) — земля под центром. Взрослый ~ 800 × 380.
export type TriPose = { head?: number; jaw?: number; walk?: number; baby?: boolean; roar?: number; seed?: number };
export const triceratops = (g: G, p: TriPose = {}) => {
  const s = p.seed ?? 1, ph = p.walk ?? 0; const baby = !!p.baby;
  g.save(); if (baby) g.scale(0.38, 0.38);
  const legs = (back: boolean) => { const c = back ? TRI.dark : TRI.body;
    for (const [x, o] of [[-230, 0], [150, Math.PI]] as [number, number][]) { const sw = Math.sin(ph + o + (back ? Math.PI / 2 : 0)) * 0.18;
      g.save(); g.translate(x + (back ? 30 : 0), -150); g.rotate(sw); cut(g, rrectP(-34, 0, 68, 150, 18), c, { seed: s + x + (back ? 7 : 0), edge: 0.9 });
      for (let k = -1; k <= 1; k++) cut(g, ellP(k * 20, 150, 12, 8, 10), TRI.horn, { seed: s + k, edge: 0.4, thick: false }); g.restore(); } };
  legs(true);
  // хвост
  cut(g, [[-330, -250], [-560, -190], [-600, -170], [-540, -165], [-330, -170]], TRI.body, { seed: s + 1, edge: 1 });
  // тело
  const body = ellP(-60, -250, 330, 150, 44);
  cut(g, body, TRI.body, { seed: s + 2, edge: 1.4 });
  clipTo(g, body, () => { fillP(g, ellP(-40, -140, 320, 60, 30), TRI.belly, 0.8); const r = rng(s); for (let i = 0; i < 14; i++) fillP(g, ellP(-320 + r() * 560, -380 + r() * 140, 30 + r() * 30, 10 + r() * 10, 14), TRI.dark, 0.45); fillP(g, ellP(-40, -340, 330, 70, 30), "#000", 0.12); });
  legs(false);
  // голова: воротник-фриль, рога, клюв
  g.save(); g.translate(250, -290); g.rotate((p.head ?? 0) + Math.sin(ph * 0.5) * 0.02);
  const frill: Pt[] = []; for (let i = 0; i <= 12; i++) { const a = -Math.PI * 0.95 + (i / 12) * Math.PI * 1.1; const r = i % 2 ? 175 : 150; frill.push([-20 + Math.cos(a) * r * 0.75, -10 + Math.sin(a) * r]); }
  frill.push([40, 60], [-30, 70]);
  cut(g, frill, TRI.frill, { seed: s + 3, edge: 1.2 });
  clipTo(g, frill, () => { for (let i = 0; i < 6; i++) fillP(g, ellP(-90 + i * 20, -120 + (i % 2) * 70, 18, 14, 12), TRI.spot, 0.7); });
  for (let i = 0; i < 6; i++) { const a = -Math.PI * 0.9 + (i / 5) * Math.PI * 1.0; cut(g, [[-20 + Math.cos(a) * 140, -10 + Math.sin(a) * 160], [-20 + Math.cos(a) * 190, -10 + Math.sin(a) * 200], [-20 + Math.cos(a + 0.1) * 140, -10 + Math.sin(a + 0.1) * 160]], TRI.horn, { seed: s + 10 + i, edge: 0.4 }); }
  // морда
  const face: Pt[] = [[-10, -50], [90, -60], [190, -10], [215, 30], [180, 70], [60, 90], [-20, 60]];
  cut(g, face, TRI.body, { seed: s + 4, edge: 1.1 });
  // нижняя челюсть-клюв (открывается при рёве)
  g.save(); g.translate(150, 55); g.rotate(p.jaw ?? 0); cut(g, [[-90, 0], [60, 0], [80, 18], [-80, 30]], TRI.dark, { seed: s + 5, edge: 0.8 }); g.restore();
  cut(g, [[180, 20], [235, 34], [196, 60]], "#3A3426", { seed: s + 6, edge: 0.6 });                   // клюв
  // рога: два надбровных длинных и носовой
  const hornLen = baby ? 0.35 : 1;
  for (const [x, y, a, l] of [[70, -50, -0.55, 180], [40, -46, -0.75, 170]] as [number, number, number, number][]) { g.save(); g.translate(x, y); g.rotate(a); cut(g, [[-14, 0], [l * hornLen, -6], [-14, 18]], TRI.horn, { seed: s + x, edge: 0.7 }); g.restore(); }
  g.save(); g.translate(175, 0); g.rotate(-1.0); cut(g, [[-10, 0], [60 * (baby ? 0.5 : 1), -2], [-10, 14]], TRI.horn, { seed: s + 9, edge: 0.6 }); g.restore();
  fillP(g, ellP(95, -18, 10, 8, 12), "#1A140C"); fillP(g, ellP(92, -21, 3, 3, 6), "#fff", 0.8);
  if (baby) { fillP(g, ellP(95, -18, 16, 14, 14), "#1A140C"); fillP(g, ellP(90, -24, 5, 5, 8), "#fff"); }
  g.restore();
  g.restore();
};

// ------------------------------------------------------------------ река: слои синей кальки, качаются в противофазе
export const river = (g: G, w: number, y: number, h: number, t: number, a = 1) => {
  const cols = ["#5FA8E8", "#4B98E0", "#3B8EEA", "#2C78D2"];
  for (let k = 0; k < 4; k++) { const pts: Pt[] = []; const yy = y + k * (h / 6), ph = t * (0.8 + k * 0.25) * (k % 2 ? -1 : 1);
    for (let i = 0; i <= 40; i++) pts.push([-100 + (i / 40) * (w + 200), yy + Math.sin(i * 0.6 + ph) * 10]);
    pts.push([w + 100, y + h + 200], [-100, y + h + 200]);
    g.save(); g.globalAlpha = a * (0.55 + k * 0.1); cut(g, pts, cols[k], { seed: k + 3, edge: 0.6, tear: 0.2, thick: false, grain: 0.1 }); g.restore();
    for (let i = 0; i < 6; i++) { const x = ((i * 230 + t * 40 * (k + 1)) % (w + 200)) - 100; strokeP(g, [[x, yy + 24], [x + 60, yy + 22]], "rgba(240,248,255,0.6)", 3); } }
};
// водомёт: струя из кормы
export const jet = (g: G, x: number, y: number, t: number) => { for (let i = 0; i < 10; i++) { const k = (t * 2 + i / 10) % 1; g.save(); g.globalAlpha = 0.7 * (1 - k); cut(g, ellP(x - k * 260, y - Math.sin(k * Math.PI) * 30, 16 + k * 30, 9 + k * 14, 14), "#EAF4FF", { seed: i, edge: 0.4, thick: false }); g.restore(); } };
// болото: бурая жижа
export const swamp = (g: G, w: number, y: number, t: number) => {
  cut(g, tear([[-60, y], [w + 60, y + 10], [w + 60, y + 600], [-60, y + 600]], 4, 14, 3), "#4A4628", { seed: 4, tear: 0, edge: 0.8 });
  for (let i = 0; i < 12; i++) { const x = (i * 97) % w, k = (t * 0.6 + i * 0.13) % 1; strokeP(g, ellP(x, y + 30 + (i % 3) * 30, 14 + k * 30, 5 + k * 8, 18), `rgba(120,110,70,${0.6 * (1 - k)})`, 3, true); }
};
// толстый ствол
export const bigTrunk = (g: G, x: number, w: number, h: number, seed = 1) => {
  cut(g, rectP(x, -40, w, h + 80), "#4E4630", { seed, edge: 1.2 });
  clipTo(g, rectP(x, -40, w, h + 80), () => { const r = rng(seed); for (let i = 0; i < 14; i++) strokeP(g, [[x + r() * w, -40], [x + r() * w, h + 40]], "rgba(30,24,12,0.35)", 3 + r() * 4); fillP(g, rectP(x + w * 0.6, -40, w * 0.4, h + 80), "#000", 0.18); });
};
// котелок над костром (кипит при boil > 0)
export const pot = (g: G, t: number, boil = 0) => {
  for (let i = 0; i < 5; i++) { const a = -0.4 + i * 0.2; g.save(); g.rotate(a); cut(g, rrectP(-8, -10, 16, 120, 6), "#5A3A24", { seed: i, edge: 0.6 }); g.restore(); }
  for (let i = 0; i < 4; i++) { const k = (t * 3 + i / 4) % 1; cut(g, [[-40 + i * 20, -10], [-30 + i * 20, -60 - Math.sin(k * 6) * 20], [-20 + i * 20, -10]], i % 2 ? "#F07A2A" : "#F2C44A", { seed: i + 7, edge: 0.4, thick: false }); }
  const gl = g.createRadialGradient(0, -30, 4, 0, -30, 160); gl.addColorStop(0, "rgba(240,122,42,0.5)"); gl.addColorStop(1, "rgba(240,122,42,0)"); g.fillStyle = gl; g.fillRect(-170, -190, 340, 260);
  strokeP(g, ellP(0, -200, 70, 80, 30, Math.PI, Math.PI * 2), "#3A3A36", 5);
  cut(g, [[-80, -160], [80, -160], [70, -60], [-70, -60]], "#5E6168", { seed: 21, edge: 1 }); cut(g, ellP(0, -160, 80, 16, 30), "#3B8EEA", { seed: 22, edge: 0.6 });
  if (boil > 0) for (let i = 0; i < 6; i++) { const k = (t * 0.7 + i / 6) % 1; g.save(); g.globalAlpha = (1 - k) * 0.5 * boil; cut(g, ellP(Math.sin(t + i) * 30, -180 - k * 260, 18 + k * 40, 12 + k * 20, 16), "#F6F2E7", { seed: i, edge: 0.4, thick: false }); g.restore(); }
};
// скала с белой полосой (на горизонте) + фонарик на вершине
export const rock = (g: G, t: number, blink = 0) => {
  const pts: Pt[] = [[-260, 0], [-200, -260], [-120, -420], [-20, -520], [70, -470], [150, -380], [230, -180], [280, 0]];
  cut(g, pts, "#5A4E52", { seed: 31, edge: 1.4 });
  clipTo(g, pts, () => { fillP(g, [[-250, -150], [260, -230], [270, -180], [-250, -100]], "#F3EDE0", 0.95); fillP(g, rectP(30, -560, 300, 600), "#000", 0.2); });
  if (blink > 0) { const gl = g.createRadialGradient(-20, -535, 2, -20, -535, 90); gl.addColorStop(0, `rgba(255,240,180,${blink})`); gl.addColorStop(1, "rgba(255,240,180,0)"); g.fillStyle = gl; g.fillRect(-120, -640, 200, 200); fillP(g, ellP(-20, -535, 9, 9, 12), "#FFF6D0", blink); }
};
// закатное небо
export const sunsetSky = (g: G, w: number, h: number, sun: [number, number, number] = [w * 0.6, h * 0.55, 140]) => {
  const gr = g.createLinearGradient(0, 0, 0, h); gr.addColorStop(0, "#4A3E66"); gr.addColorStop(0.5, "#D9703C"); gr.addColorStop(0.85, "#F2B45A"); gr.addColorStop(1, "#F6CF8A");
  g.fillStyle = gr; g.fillRect(0, 0, w, h); cut(g, ellP(sun[0], sun[1], sun[2], sun[2], 50), "#FBD58A", { seed: 4, edge: 1.2 });
};
// ровная бумажная лента-надпись по диагонали (как «НЕ ШУМЕТЬ» в Ч1)
export { fernBush };
