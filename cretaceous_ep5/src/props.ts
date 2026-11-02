// Реквизит «Мелового периода» в «см» (вырезанный картон).
import { PAL, G, Pt, cut, fillP, strokeP, clipTo, rivet, rrectP, ellP, rectP, rng, text, fern, zigTree, tear, fernBush } from "./cut";

// ------------------------------------------------------------------ БТР сбоку (нос вправо). (0,0) — земля под центром.
export const btr = (g: G, o: { wheel?: number; gun?: number; hatch?: boolean; body?: boolean; wheels?: boolean; noTurret?: boolean } = {}) => {
  const wr = o.wheel ?? 0;
  if (o.body !== false) {
    const hull: Pt[] = [[-360, -75], [-372, -150], [-350, -215], [210, -225], [330, -165], [365, -110], [350, -75]];
    cut(g, hull, PAL.khaki, { seed: 317, edge: 1.4 });
    clipTo(g, hull, () => {
      fillP(g, rectP(-400, -150, 800, 80), PAL.khakiD, 0.35);
      fillP(g, [[210, -225], [330, -165], [365, -110], [365, -225]], "#000", 0.15);
      // тиснение панелей
      for (const x of [-250, -110, 40, 180]) strokeP(g, [[x, -210], [x, -82]], "rgba(60,55,30,0.35)", 1.4);
      strokeP(g, [[-360, -150], [345, -150]], "rgba(60,55,30,0.35)", 1.4);
    });
    for (let x = -330; x < 330; x += 34) { rivet(g, x, -205 + (x > 210 ? (x - 210) * 0.45 : 0), 2.4); rivet(g, x, -88, 2.2); }
    text(g, "317", -150, -118, 44, "#D8D0A8", "Montserrat", 900);
    // люк, фара, выхлоп
    cut(g, rrectP(60, -238, 90, 16, 4), PAL.khakiD, { seed: 3 });
    cut(g, ellP(340, -160, 9, 12, 16), "#F3E3A0", { seed: 4 });
    cut(g, rrectP(-385, -150, 22, 12, 3), "#3a3a30", { seed: 5 });
    if (!o.noTurret) {
      // башня + пулемёт
      g.save(); g.translate(-30, -225);
      const tur: Pt[] = [[-80, 0], [-70, -55], [60, -60], [95, -25], [95, 0]];
      cut(g, tur, PAL.khakiL, { seed: 9, edge: 1.2 });
      clipTo(g, tur, () => fillP(g, rectP(20, -70, 100, 80), "#000", 0.15));
      g.save(); g.translate(80, -32); g.rotate(o.gun ?? 0);
      cut(g, rrectP(0, -7, 190, 14, 4), "#3A3B30", { seed: 11 }); cut(g, rrectP(170, -10, 30, 20, 3), "#2E2F26", { seed: 12 });
      g.restore();
      rivet(g, 80, -32, 3); rivet(g, -50, -45, 2.4); rivet(g, 30, -50, 2.4);
      g.restore();
    }
  }
  if (o.wheels !== false) for (const x of [-250, -95, 95, 250]) {
    cut(g, ellP(x, -55, 57, 57, 40), "#262420", { seed: x + 400, edge: 1.2 });
    g.save(); g.translate(x, -55); g.rotate(wr);
    const hex: Pt[] = Array.from({ length: 6 }, (_, i) => [Math.cos(i * Math.PI / 3) * 22, Math.sin(i * Math.PI / 3) * 22] as Pt);
    cut(g, hex, "#6E6A58", { seed: x, edge: 0.8 });
    rivet(g, 0, 0, 6);
    for (let i = 0; i < 6; i++) fillP(g, rectP(40, -3, 12, 6), "#1A1916", 0.9), g.rotate(Math.PI / 3);
    g.restore();
  }
};

// ------------------------------------------------------------------ небо, солнце, деревья, папоротники
export const skyDay = (g: G, w: number, h: number, sun: [number, number, number] | null = [w * 0.28, h * 0.12, 120]) => {
  const gr = g.createLinearGradient(0, 0, 0, h); gr.addColorStop(0, "#B9C2A8"); gr.addColorStop(1, "#8D9478");
  g.fillStyle = gr; g.fillRect(0, 0, w, h);
  if (sun) { cut(g, ellP(sun[0], sun[1], sun[2], sun[2], 60), "#F2EAC8", { seed: 2, edge: 1.4, grain: 0.1 }); }
};
export const trunks = (g: G, w: number, h: number, seed = 1, color = "#5C5A40", n = 6) => {
  const r = rng(seed);
  for (let i = 0; i < n; i++) { const x = (i + 0.3 + r() * 0.4) * (w / n); const tw = 10 + r() * 14; cut(g, rectP(x, -20, tw, h + 40), color, { seed: seed + i, edge: 0.6 }); }
};
export const zigRow = (g: G, w: number, base: number, hMin: number, hMax: number, colors: string[], seed = 1, n = 7, wid = 60) => {
  const r = rng(seed);
  for (let i = 0; i < n; i++) zigTree(g, (i + 0.2 + r() * 0.6) * (w / n), base, hMin + r() * (hMax - hMin), wid * (0.8 + r() * 0.4), colors[i % colors.length], seed * 10 + i);
};
export const fernRow = (g: G, w: number, base: number, size: number, colors: string[], seed = 1, n = 5) => {
  const r = rng(seed);
  for (let i = 0; i < n; i++) fernBush(g, (i + 0.2 + r() * 0.6) * (w / n), base, size * (0.8 + r() * 0.4), colors, seed * 7 + i, 0.9);
};
export const ground = (g: G, w: number, y: number, h: number, color = "#9C7A4E", seed = 1) => {
  cut(g, tear([[ -20, y], [w + 20, y], [w + 20, y + h], [-20, y + h]], 2, 8, seed), color, { seed, tear: 0, edge: 1.2 });
  clipTo(g, rectP(-20, y, w + 40, h), () => { const gr = g.createLinearGradient(0, y, 0, y + h); gr.addColorStop(0, "rgba(0,0,0,0)"); gr.addColorStop(1, "rgba(30,20,8,0.45)"); g.fillStyle = gr; g.fillRect(-20, y, w + 40, h); });
};

// ------------------------------------------------------------------ салон БТР
export const cabin = (g: G, w: number, h: number, lamp = 1) => {
  g.fillStyle = "#3E3A26"; g.fillRect(0, 0, w, h);
  cut(g, rectP(-10, h * 0.08, w + 20, h * 0.5), "#5A5634", { seed: 21, edge: 1 });
  for (let x = 40; x < w; x += 140) { strokeP(g, [[x, h * 0.08], [x, h * 0.58]], "rgba(25,22,10,0.4)", 3); for (let y = h * 0.1; y < h * 0.56; y += 40) rivet(g, x + 8, y, 3); }
  cut(g, rrectP(w * 0.1, h * 0.12, 220, 120, 10), "#6B6440", { seed: 22 });          // ящик ИРП на стене
  text(g, "ИРП", w * 0.1 + 110, h * 0.12 + 60, 44, "#D8D0A8");
  cut(g, rrectP(w * 0.62, h * 0.1, 160, 200, 10), "#4C4A30", { seed: 23 });           // огнетушитель/щиток
  // лампа-калька
  const lx = w * 0.5, ly = h * 0.06;
  const glow = g.createRadialGradient(lx, ly + 20, 10, lx, ly + 20, 420); glow.addColorStop(0, `rgba(255,190,90,${0.55 * lamp})`); glow.addColorStop(1, "rgba(255,190,90,0)");
  g.fillStyle = glow; g.fillRect(0, 0, w, h);
  cut(g, rrectP(lx - 50, ly, 100, 40, 12), `rgba(255,${200 + 30 * lamp},120,1)`, { seed: 24 });
  // скамья
  cut(g, rectP(-10, h * 0.6, w + 20, 40), "#2E2A1A", { seed: 25 });
  cut(g, rectP(-10, h * 0.63, w + 20, h * 0.4), "#2A2416", { seed: 26 });
};

// ------------------------------------------------------------------ тираннозавр: голова (вправо смотрит влево), челюсть отдельно
export const rexHead = (g: G, jaw = 0, eye = 1) => {
  const dark = "#2E3820", mid = "#3F4A25";
  // шея
  cut(g, [[160, 40], [330, -40], [420, 300], [150, 320]], dark, { seed: 61, edge: 1.4 });
  // нижняя челюсть
  g.save(); g.translate(240, 20); g.rotate(jaw);
  const lower: Pt[] = [[30, 0], [-330, 30], [-360, 55], [-300, 80], [40, 70]];
  cut(g, lower, mid, { seed: 62, edge: 1.4 });
  for (let x = -330; x < 0; x += 34) cut(g, [[x, 32], [x + 12, 6], [x + 22, 32]], "#F3EDE0", { seed: x, edge: 0.4, thick: false });
  g.restore();
  // верхняя голова
  const up: Pt[] = [[300, -40], [180, -150], [-20, -170], [-240, -120], [-380, -50], [-400, 10], [-360, 30], [-60, 28], [240, 40]];
  cut(g, up, mid, { seed: 63, edge: 1.6 });
  clipTo(g, up, () => {
    const r = rng(5);
    for (let i = 0; i < 60; i++) { const x = -380 + r() * 680, y = -170 + r() * 200; cut(g, ellP(x, y, 16, 11, 10, Math.PI, Math.PI * 2), r() > 0.5 ? dark : "#4C5830", { seed: i, edge: 0.4, thick: false, grain: 0.1 }); }
    fillP(g, rectP(-420, -10, 760, 60), "#000", 0.2);
  });
  for (let x = -370; x < -40; x += 34) cut(g, [[x, 22], [x + 12, 50], [x + 24, 22]], "#F3EDE0", { seed: x + 1, edge: 0.4, thick: false });
  // ноздря, бровь, глаз
  fillP(g, ellP(-350, -50, 12, 7, 12), "#151A0E");
  cut(g, [[60, -150], [170, -140], [190, -110], [70, -118]], dark, { seed: 64, edge: 0.8 });
  const glow = g.createRadialGradient(120, -95, 4, 120, -95, 90); glow.addColorStop(0, `rgba(255,220,90,${0.5 * eye})`); glow.addColorStop(1, "rgba(255,220,90,0)");
  g.fillStyle = glow; g.fillRect(20, -190, 200, 200);
  cut(g, ellP(120, -95, 26, 20, 24), `rgb(${230},${190 + 30 * eye},${60})`, { seed: 65, edge: 0.8 });
  fillP(g, ellP(122, -95, 4.5, 17, 12), "#120E06");
};

// ------------------------------------------------------------------ птерозавр (чёрный силуэт)
export const ptero = (g: G, flap = 0) => {
  const f = flap * 40;
  const body: Pt[] = [[-30, 0], [0, -14], [60, -10], [120, -26], [150, -20], [110, 0], [60, 10], [0, 12]];
  const wingL: Pt[] = [[0, -6], [-120, -60 - f], [-330, -20 - f * 1.5], [-180, 10], [-40, 14]];
  const wingR: Pt[] = [[40, -6], [120, -70 - f], [340, -40 - f * 1.5], [180, 4], [60, 10]];
  for (const p of [wingL, wingR, body]) cut(g, p, "#15161B", { seed: p.length, edge: 0.8, grain: 0.05 });
  cut(g, [[120, -26], [100, -60], [140, -30]], "#15161B", { seed: 71, edge: 0.6 });
};

// ------------------------------------------------------------------ канистра с водой (синяя калька); level 0..1
export const jerrycan = (g: G, level: number, t = 0, seed = 1) => {
  const body = rrectP(-70, -230, 140, 230, 14);
  cut(g, body, "#2F3A22", { seed, edge: 1.2 });
  cut(g, rrectP(-40, -262, 80, 34, 8), "#2F3A22", { seed: seed + 1, edge: 1 });
  fillP(g, rrectP(-28, -254, 56, 16, 6), "#1A2010");
  const win = rrectP(-54, -212, 108, 196, 10);
  cut(g, win, "#CFE0EA", { seed: seed + 2, edge: 0.6 });
  clipTo(g, win, () => {
    const top = -16 - 196 * level;
    for (let k = 0; k < 3; k++) {
      const wv = Math.sin(t * 2 + k * 2 + seed) * 4;
      fillP(g, [[-60, top + wv + k * 6], [60, top - wv + k * 6], [60, 0], [-60, 0]], ["#4B9BEF", "#3B8EEA", "#2C78D2"][k], 0.75);
    }
    strokeP(g, [[-60, 10], [60, -230]], "rgba(20,30,20,0.85)", 10);
  });
};

// ------------------------------------------------------------------ автомат (силуэт), ящик тушёнки
export const rifle = (g: G, seed = 1) => {
  cut(g, [[-90, -6], [40, -10], [60, -16], [110, -14], [110, -4], [60, 0], [40, 6], [10, 30], [-6, 30], [0, 6], [-60, 8], [-90, 22], [-104, 18]], "#2E2B22", { seed, edge: 0.8 });
  cut(g, [[0, 6], [20, 6], [30, 40], [14, 44]], "#3A2F22", { seed: seed + 1, edge: 0.6 });
};
export const crate = (g: G, open = 0) => {
  cut(g, rrectP(-110, -100, 220, 100, 6), "#8A6440", { seed: 81 });
  for (const y of [-70, -40]) strokeP(g, [[-108, y], [108, y]], "rgba(40,25,10,0.4)", 2);
  text(g, "ТУШЁНКА", 0, -50, 30, "#2A1D12");
  for (let i = 0; i < 5; i++) if (open > 0.5) { cut(g, ellP(-80 + i * 40, -112, 18, 9, 18), "#C7CCD6", { seed: i + 90, edge: 0.6 }); }
  g.save(); g.translate(-110, -100); g.rotate(-open * 1.9);
  cut(g, rrectP(0, -14, 220, 16, 4), "#9C744A", { seed: 82 }); g.restore();
};
export { PAL, fern, zigTree, fernBush };
