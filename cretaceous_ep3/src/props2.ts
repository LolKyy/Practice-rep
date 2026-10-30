// Новый реквизит Ч2 «Не стреляй» (в «см» / px слоя).
import { PAL, G, Pt, cut, fillP, strokeP, clipTo, rivet, rrectP, ellP, rectP, rng, text, tear, setEdge, zigTree, fernBush } from "./cut";
import { btr } from "./props";

export const NIGHT = { sky: "#121A2B", skyH: "#22304A", sil: "#151A12", rim: "#7E93B8", warm: "#FFB84D" };

// ------------------------------------------------------------------ ночное небо: градиент, луна с ореолом, звёзды (мерцают), крупные звёзды на нитках
export const nightSky = (g: G, w: number, h: number, t: number, moon: [number, number, number] = [w * 0.68, h * 0.16, 95]) => {
  const gr = g.createLinearGradient(0, 0, 0, h); gr.addColorStop(0, NIGHT.sky); gr.addColorStop(0.75, NIGHT.skyH); gr.addColorStop(1, "#2A3A55");
  g.fillStyle = gr; g.fillRect(0, 0, w, h);
  const r = rng(11);
  for (let i = 0; i < 55; i++) { const x = r() * w, y = r() * h * 0.7, s = 1.5 + r() * 3.5, f = 0.5 + r() * 1.5, ph = r() * 6;
    fillP(g, ellP(x, y, s, s, 8), "#F3EDE0", 0.55 + 0.2 * Math.sin(t * f * Math.PI * 2 + ph)); }
  for (let i = 0; i < 6; i++) { const x = (0.1 + 0.8 * r()) * w, y = 80 + r() * h * 0.35, s = 12 + r() * 10, a = 0.75 + 0.2 * Math.sin(t * (0.5 + r()) * 6.28 + i);
    strokeP(g, [[x, -20], [x, y - s]], "rgba(243,237,224,0.35)", 1.2);
    g.save(); g.globalAlpha = a; cut(g, [[x, y - s], [x + s * 0.25, y - s * 0.25], [x + s, y], [x + s * 0.25, y + s * 0.25], [x, y + s], [x - s * 0.25, y + s * 0.25], [x - s, y], [x - s * 0.25, y - s * 0.25]], "#F6EFD6", { edge: 0.4, seed: i, tear: 0.2 }); g.restore(); }
  if (moon) {
    const [mx, my, mr] = moon;
    const halo = g.createRadialGradient(mx, my, mr * 0.8, mx, my, mr * 2.6); halo.addColorStop(0, "rgba(243,237,224,0.35)"); halo.addColorStop(1, "rgba(243,237,224,0)");
    g.fillStyle = halo; g.fillRect(mx - mr * 3, my - mr * 3, mr * 6, mr * 6);
    cut(g, ellP(mx, my, mr, mr, 60), "#F3EDE0", { seed: 3, edge: 1.4, grain: 0.12 });
    for (const [dx, dy, cr] of [[-0.3, -0.2, 0.18], [0.25, 0.15, 0.13], [-0.05, 0.4, 0.1]]) fillP(g, ellP(mx + dx * mr, my + dy * mr, cr * mr, cr * mr * 0.9, 16), "#D9D0BA");
  }
};
// силуэтный лес с холодной кромкой
export const nightTrees = (g: G, w: number, base: number, hMin: number, hMax: number, seed = 1, n = 9) => {
  setEdge(NIGHT.rim); const r = rng(seed);
  for (let i = 0; i < n; i++) zigTree(g, (i + 0.2 + r() * 0.6) * (w / n), base, hMin + r() * (hMax - hMin), 55 + r() * 25, i % 2 ? NIGHT.sil : "#1B2216", seed * 10 + i);
  setEdge();
};
export const nightFerns = (g: G, w: number, base: number, size: number, seed = 1, n = 5) => {
  setEdge(NIGHT.rim); const r = rng(seed);
  for (let i = 0; i < n; i++) fernBush(g, (i + 0.2 + r() * 0.6) * (w / n), base, size * (0.8 + r() * 0.4), [NIGHT.sil, "#1E2618"], seed * 7 + i, 0.9);
  setEdge();
};
// светлячки: count — сколько ещё горят (гаснут по одному)
export const fireflies = (g: G, w: number, h: number, t: number, count = 14, seed = 5) => {
  const r = rng(seed);
  for (let i = 0; i < 14; i++) {
    const x0 = r() * w, y0 = h * (0.35 + r() * 0.45), sp = 0.2 + r() * 0.4, ph = r() * 6;
    if (i >= count) continue;
    const x = x0 + Math.sin(t * sp + ph) * 60 + Math.sin(t * sp * 2.3) * 20, y = y0 + Math.cos(t * sp * 1.3 + ph) * 40;
    const a = 0.45 + 0.55 * Math.max(0, Math.sin(t * (1 + sp) * 2 + ph));
    const gl = g.createRadialGradient(x, y, 1, x, y, 26); gl.addColorStop(0, `rgba(255,230,120,${0.7 * a})`); gl.addColorStop(1, "rgba(255,230,120,0)");
    g.fillStyle = gl; g.fillRect(x - 30, y - 30, 60, 60); fillP(g, ellP(x, y, 4, 4, 8), "#FFF1A8", a);
  }
};
// туман-калька у земли, ползёт влево
export const fog = (g: G, w: number, y: number, t: number, a = 0.22) => {
  for (let k = 0; k < 3; k++) { const off = ((t * (18 + k * 9)) % w); g.save(); g.globalAlpha = a; g.translate(-off, 0);
    for (const dx of [0, w]) fillP(g, tear([[dx - 40, y + k * 40], [dx + w + 40, y + k * 40 - 20], [dx + w + 40, y + k * 40 + 70], [dx - 40, y + k * 40 + 90]], 10, 30, k + 2), "#C9D3E3");
    g.restore(); }
};
// БТР ночью: затемнён, светятся щели и люк, полосы тёплого света на земле
export const btrNight = (g: G, o: { gun?: number } = {}) => {
  // полосы света на землю (рисуем до корпуса)
  for (const x of [-220, -40, 140]) { const gr = g.createLinearGradient(0, -100, 0, 160); gr.addColorStop(0, "rgba(255,184,77,0.45)"); gr.addColorStop(1, "rgba(255,184,77,0)");
    g.fillStyle = gr; g.beginPath(); g.moveTo(x, -110); g.lineTo(x + 40, -110); g.lineTo(x + 120, 170); g.lineTo(x - 30, 170); g.closePath(); g.fill(); }
  g.save(); btr(g, { gun: o.gun }); g.globalCompositeOperation = "source-atop"; g.fillStyle = "rgba(10,14,28,0.72)"; g.fillRect(-500, -500, 1000, 600); g.restore();
  for (const x of [-220, -40, 140]) { const gl = g.createRadialGradient(x + 20, -165, 2, x + 20, -165, 60); gl.addColorStop(0, "rgba(255,184,77,0.6)"); gl.addColorStop(1, "rgba(255,184,77,0)");
    g.fillStyle = gl; g.fillRect(x - 50, -230, 140, 130); fillP(g, rrectP(x, -170, 42, 9, 3), NIGHT.warm); }
  fillP(g, rrectP(66, -232, 78, 6, 2), NIGHT.warm, 0.9);
};

// ------------------------------------------------------------------ БТР в разрезе (сбоку без стенки). (0,0) — земля под центром; ширина ~760
export const cutawayBack = (g: G, lamp = 1, t = 0) => {
  const hull: Pt[] = [[-370, -75], [-382, -150], [-360, -330], [230, -340], [350, -250], [380, -150], [360, -75]];
  cut(g, hull, PAL.khaki, { seed: 41, edge: 1.4 });
  const inner: Pt[] = [[-345, -95], [-352, -150], [-335, -310], [220, -318], [328, -242], [352, -150], [340, -95]];
  cut(g, inner, "#3E3A26", { seed: 42, edge: 0.8 });
  clipTo(g, inner, () => {
    for (let x = -320; x < 330; x += 80) strokeP(g, [[x, -318], [x, -95]], "rgba(20,18,8,0.45)", 2);
    const lx = -20, ly = -300; const gl = g.createRadialGradient(lx, ly, 6, lx, ly, 360); gl.addColorStop(0, `rgba(255,190,90,${0.5 * lamp})`); gl.addColorStop(1, "rgba(255,190,90,0)");
    g.fillStyle = gl; g.fillRect(-400, -400, 800, 400);
  });
  cut(g, rrectP(-50, -312, 60, 18, 6), `rgb(255,${190 + 40 * lamp},${110})`, { seed: 43, edge: 0.6 });
  // решётка вентиляции на крыше
  cut(g, rrectP(120, -318, 90, 26, 3), "#2E2C1C", { seed: 44, edge: 0.6 }); for (let x = 128; x < 205; x += 12) fillP(g, rectP(x, -314, 5, 18), "#7A7550");
  // рация на стене
  cut(g, rrectP(230, -290, 80, 110, 6), "#2F3324", { seed: 45, edge: 0.8 });
};
export const radioScreen = (g: G, x: number, y: number, w: number, h: number, t: number, alive: number) => {
  cut(g, rrectP(x, y, w, h, 4), alive > 0 ? "#0E2A18" : "#0A120C", { seed: 46, edge: 0.5 });
  if (alive > 0) {
    const gl = g.createRadialGradient(x + w / 2, y + h / 2, 2, x + w / 2, y + h / 2, w * 2.5); gl.addColorStop(0, `rgba(61,220,132,${0.35 * alive})`); gl.addColorStop(1, "rgba(61,220,132,0)");
    g.fillStyle = gl; g.fillRect(x - w * 3, y - w * 3, w * 7, w * 7);
    clipTo(g, rectP(x, y, w, h), () => { const pts: Pt[] = []; for (let i = 0; i <= 30; i++) { const xx = x + (i / 30) * w; pts.push([xx, y + h / 2 + Math.sin(i * 1.3 + t * 18) * h * 0.32 * alive * (0.4 + 0.6 * Math.abs(Math.sin(t * 7 + i)))]); } strokeP(g, pts, "#5CF09A", Math.max(1, w / 40)); });
  }
};
export const cutawayFront = (g: G) => {
  cut(g, rectP(-345, -150, 690, 55), "#2A2616", { seed: 47, edge: 0.8 });          // лавка (перед ногами)
  for (const x of [-250, -95, 95, 250]) { cut(g, ellP(x, -55, 57, 57, 40), "#262420", { seed: x + 400, edge: 1.2 }); rivet(g, x, -55, 6); }
  cut(g, rectP(-372, -100, 742, 28), PAL.khaki, { seed: 48, edge: 1 });
  for (let x = -350; x < 350; x += 34) rivet(g, x, -86, 2.2);
  // срез борта — кромка разреза
  strokeP(g, [[-382, -150], [-360, -330], [230, -340], [350, -250]], PAL.edge, 3);
};

// ------------------------------------------------------------------ спуск пулемёта крупно + палец
export const trigger = (g: G, t: number, press = 0) => {
  cut(g, [[-320, -60], [420, -80], [440, 40], [-300, 60]], "#2E2F26", { seed: 51, edge: 1.4 });      // ствольная коробка
  for (let x = -280; x < 420; x += 60) rivet(g, x, -10, 6);
  cut(g, [[60, 40], [150, 40], [190, 330], [100, 340]], "#3A2F22", { seed: 52, edge: 1.2 });         // рукоять
  strokeP(g, ellP(10, 110, 95, 70, 30, -0.2, Math.PI + 0.4), "#26271F", 18);                         // скоба
  g.save(); g.translate(-10, 70); g.rotate(-0.25 - press * 0.15); cut(g, rrectP(-10, 0, 22, 90, 8), "#4A4A3C", { seed: 53, edge: 0.8 }); g.restore();
  // рука: ладонь на рукояти, указательный палец на спуске (дрожит)
  const tr = Math.sin(t * 23) * 2 + Math.sin(t * 9) * 2;
  cut(g, rrectP(70, 60, 180, 210, 70), "#E9C9A3", { seed: 54, edge: 1.2 });
  clipTo(g, rrectP(70, 60, 180, 210, 70), () => fillP(g, ellP(220, 180, 90, 140, 30), "#C99B72", 0.45));
  g.save(); g.translate(90 + tr, 110); g.rotate(-1.75 - press * 0.1); cut(g, rrectP(-18, 0, 36, 150, 18), "#E9C9A3", { seed: 55, edge: 1 }); fillP(g, rrectP(-10, 118, 20, 26, 8), "#F3DCC4"); g.restore();
  cut(g, rrectP(180, 230, 220, 160, 30), PAL.olive, { seed: 56, edge: 1.2 });                        // рукав
};

// ------------------------------------------------------------------ череп рекса в разрезе (схема нюха)
export const skull = (g: G, t: number, glow = 1, color = "#E6D9BC") => {
  const sk: Pt[] = [[-380, 10], [-400, -40], [-300, -120], [-120, -190], [80, -210], [250, -170], [330, -90], [320, 20], [180, 60], [-120, 50]];
  cut(g, sk, color, { seed: 61, edge: 1.6 });
  fillP(g, ellP(130, -90, 55, 45, 24), "#3A3226");                                                     // глазница
  fillP(g, ellP(-90, -70, 70, 40, 24), "#3A3226", 0.8); fillP(g, ellP(-330, -50, 26, 14, 16), "#3A3226");
  fillP(g, ellP(250, -40, 50, 34, 20), "#3A3226", 0.7);
  for (let x = -370; x < 120; x += 32) cut(g, [[x, 14], [x + 12, 50], [x + 24, 14]], "#F3EDE0", { seed: x, edge: 0.4, thick: false });
  pencil2(g, [[-360, -20], [200, -150]]);
  // мозг + обонятельная луковица (жёлтая калька, пульсирует)
  strokeP(g, ellP(250, -120, 70, 38, 30), "rgba(60,50,30,0.6)", 3, true);
  const p = glow * (0.75 + 0.25 * Math.sin(t * 5));
  const gl = g.createRadialGradient(130, -150, 4, 130, -150, 110); gl.addColorStop(0, `rgba(255,220,90,${0.75 * p})`); gl.addColorStop(1, "rgba(255,220,90,0)");
  g.fillStyle = gl; g.fillRect(10, -270, 240, 240);
  cut(g, ellP(130, -150, 62, 26, 30), `rgba(255,${200 + 30 * p},90,${0.6 + 0.35 * p})`, { seed: 62, edge: 0.6 });
  strokeP(g, [[190, -145], [205, -130]], "rgba(60,50,30,0.6)", 3);
};
const pencil2 = (g: G, pts: Pt[]) => strokeP(g, pts, "rgba(60,55,50,0.2)", 0.8);
export const smell = (g: G, t: number, x0: number, y0: number, x1: number, y1: number, n = 3, color = "rgba(243,237,224,0.75)", w = 6) => {
  for (let k = 0; k < n; k++) { const pts: Pt[] = []; const ph = t * 4 + k * 2;
    for (let i = 0; i <= 24; i++) { const u = i / 24; const nx = -(y1 - y0), ny = x1 - x0, L = Math.hypot(nx, ny) || 1;
      const off = Math.sin(u * 12 - ph) * 18 + (k - (n - 1) / 2) * 26; pts.push([x0 + (x1 - x0) * u + (nx / L) * off, y0 + (y1 - y0) * u + (ny / L) * off]); }
    strokeP(g, pts, color, w); }
};

// ------------------------------------------------------------------ дача: забор, мангал, собаки
export const fence = (g: G, x0: number, x1: number, y: number, h: number) => {
  cut(g, rectP(x0, y - h * 0.75, x1 - x0, 22), "#8A6440", { seed: 71, edge: 0.8 });
  cut(g, rectP(x0, y - h * 0.3, x1 - x0, 22), "#8A6440", { seed: 72, edge: 0.8 });
  for (let x = x0; x < x1; x += 62) cut(g, [[x, y], [x, y - h + 18], [x + 26, y - h], [x + 52, y - h + 18], [x + 52, y]], x % 124 ? "#B98A5A" : "#A87C50", { seed: x, edge: 0.9 });
};
export const dogHead = (g: G, kind: number, color: string) => {
  cut(g, ellP(0, 0, 46, 40, 30), color, { seed: kind + 80 });
  cut(g, rrectP(-78, -6, 60, 34, 14), color, { seed: kind + 81 });
  fillP(g, ellP(-74, 4, 9, 7, 12), PAL.ink);
  if (kind % 2) for (const s of [-1, 1]) cut(g, [[s * 14 - 14, -30], [s * 24 - 4, -78], [s * 30 + 10, -26]], color, { seed: kind + 82 + s });
  else cut(g, [[10, -20], [44, -16], [40, 40], [16, 30]], "#5A3A24", { seed: kind + 84 });
  fillP(g, ellP(-20, -10, 6, 7, 10), PAL.ink); fillP(g, ellP(-22, -12, 2, 2, 6), "#fff");
  cut(g, rrectP(-60, 24, 26, 30, 10), "#D9605A", { seed: kind + 85, edge: 0.5 });
};
export const grill = (g: G, t: number) => {
  cut(g, rrectP(-150, -60, 300, 70, 6), "#2B2A26", { seed: 91 });
  for (const s of [-1, 1]) cut(g, rectP(s * 120 - 8, 0, 16, 160), "#2B2A26", { seed: 92 + s });
  for (let i = 0; i < 5; i++) { strokeP(g, [[-170, -70 - i * 2], [170, -70 - i * 2]], "#B9BCC4", 3); for (let k = 0; k < 4; k++) cut(g, rrectP(-120 + i * 55 - 14, -84 + (k % 2) * 4, 28, 26, 8), k % 2 ? "#8A4A2A" : "#A55B30", { seed: i * 5 + k, edge: 0.5 }); }
  const gl = g.createRadialGradient(0, -40, 4, 0, -40, 160); gl.addColorStop(0, "rgba(240,122,42,0.6)"); gl.addColorStop(1, "rgba(240,122,42,0)"); g.fillStyle = gl; g.fillRect(-180, -200, 360, 240);
  for (let i = 0; i < 6; i++) { const k = (t * 0.35 + i / 6) % 1; g.save(); g.globalAlpha = (1 - k) * 0.45; cut(g, ellP(Math.sin(t + i) * 40, -110 - k * 520, 30 + k * 70, 22 + k * 40, 18), "#D8D2C4", { seed: i, edge: 0.4, thick: false }); g.restore(); }
};

// ------------------------------------------------------------------ схема «палатка — 100 м — ящик», медведь
export const tent = (g: G) => {
  cut(g, [[-170, 0], [0, -230], [170, 0]], "#6E7A3A", { seed: 101, edge: 1.2 });
  cut(g, [[-40, 0], [0, -120], [40, 0]], "#2C341A", { seed: 102, edge: 0.6 });
  strokeP(g, [[0, -230], [0, -270]], "#3a3020", 4);
};
export const foodBox = (g: G) => { cut(g, rrectP(-80, -90, 160, 90, 6), "#8A6440", { seed: 111 }); text(g, "ЕДА", 0, -45, 34, "#2A1D12"); };
export const bear = (g: G, t: number) => {
  const sn = Math.sin(t * 4) * 6;
  cut(g, [[-170, 0], [-180, -90], [-120, -170], [40, -180], [120, -140], [150, -90 + sn], [190, -70 + sn], [200, -40 + sn], [150, -30], [140, 0], [90, 0], [80, -50], [-60, -50], [-80, 0]], "#15161B", { seed: 121, edge: 1 });
  cut(g, ellP(120, -160, 16, 14, 12), "#15161B", { seed: 122, edge: 0.8 });
};

// ------------------------------------------------------------------ банка тушёнки + консервный ключ
export const can = (g: G, open: number, t: number) => {
  cut(g, rrectP(-150, -90, 300, 200, 20), "#B9BCC4", { seed: 131, edge: 1.4 });
  clipTo(g, rrectP(-150, -90, 300, 200, 20), () => { for (let x = -150; x < 160; x += 28) strokeP(g, [[x, -90], [x, 120]], "rgba(90,95,105,0.35)", 3); fillP(g, rectP(50, -90, 120, 220), "#000", 0.12); });
  cut(g, rectP(-150, -40, 300, 90), "#C8352B", { seed: 132, edge: 0.8 }); text(g, "ТУШЁНКА", 0, 5, 44, "#F3EDE0");
  cut(g, ellP(0, -90, 150, 34, 40), "#D2D5DC", { seed: 133, edge: 1 });
  if (open > 0) { fillP(g, ellP(0, -90, 130 * open, 26 * open, 40), "#7A4A2A"); g.save(); g.translate(-130, -90); g.rotate(-open * 1.2); cut(g, ellP(130, 0, 130, 28, 40, Math.PI, Math.PI * 2), "#D2D5DC", { seed: 134, edge: 0.8 }); g.restore(); }
  g.save(); g.translate(100, -110); g.rotate(-0.4 + Math.sin(t * 12) * 0.05 * (open < 1 ? 1 : 0)); cut(g, rrectP(-14, -150, 28, 160, 8), "#8E949E", { seed: 135, edge: 0.8 }); rivet(g, 0, 0, 7); g.restore();
};

// ------------------------------------------------------------------ хвост рекса (уходит в папоротники)
export const rexTail = (g: G) => cut(g, [[0, -60], [-260, -110], [-520, -60], [-260, -30], [0, 30]], "#2E3820", { seed: 141, edge: 1.2 });
export { btr, PAL };
