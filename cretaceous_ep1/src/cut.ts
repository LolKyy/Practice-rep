// Бумага на Canvas 2D: вырезанные формы с рваным краем, белой кромкой среза, волокнами и фактурой.
// Координаты рисования — «см» слоя: 100 единиц = 1 м мира (одинаковая толщина кромки на всех слоях).
export type Pt = [number, number];
export type G = CanvasRenderingContext2D;

export const PAL = {
  edge: "#F3EDE0", ink: "#1E1A17", brass: "#C9A24B", scarf: "#C8352B", mustard: "#D9A23A",
  kraft: "#B98A5A", kraftL: "#D2A878", kraftD: "#8A6440", olive: "#6E7A3A", oliveD: "#3F4A25", oliveDD: "#2C341A",
  khaki: "#8C8455", khakiL: "#A39A63", khakiD: "#6B6440", sky: "#CFD8C8", skin: "#E9C9A3", skinD: "#C99B72",
  blue: "#3B8EEA", red: "#E53935", night: "#121A2B", nightB: "#22304A", green: "#3DDC84", paper: "#F6F2E7",
};

// детерминированный шум
export const rng = (seed: number) => { let s = (seed * 2654435761) >>> 0 || 1; return () => ((s = (s * 1664525 + 1013904223) >>> 0) / 4294967296); };

// ------------------------------------------------------------------ формы → многоугольники
export const rectP = (x: number, y: number, w: number, h: number): Pt[] => [[x, y], [x + w, y], [x + w, y + h], [x, y + h]];
export const ellP = (cx: number, cy: number, rx: number, ry: number, n = 48, a0 = 0, a1 = Math.PI * 2): Pt[] => {
  const pts: Pt[] = []; const full = Math.abs(a1 - a0 - Math.PI * 2) < 1e-6;
  for (let i = 0; i < (full ? n : n + 1); i++) { const a = a0 + ((a1 - a0) * i) / n; pts.push([cx + Math.cos(a) * rx, cy + Math.sin(a) * ry]); }
  return pts;
};
export const rrectP = (x: number, y: number, w: number, h: number, r = 4): Pt[] => {
  r = Math.min(r, w / 2, h / 2); const p: Pt[] = [];
  const arc = (cx: number, cy: number, a0: number) => { for (let i = 0; i <= 6; i++) { const a = a0 + (i / 6) * (Math.PI / 2); p.push([cx + Math.cos(a) * r, cy + Math.sin(a) * r]); } };
  arc(x + w - r, y + r, -Math.PI / 2); arc(x + w - r, y + h - r, 0); arc(x + r, y + h - r, Math.PI / 2); arc(x + r, y + r, Math.PI);
  return p;
};

// рваный край: дробим рёбра и сдвигаем точки по нормали
export const tear = (pts: Pt[], amp = 1.2, step = 4, seed = 1): Pt[] => {
  const r = rng(seed); const out: Pt[] = [];
  for (let i = 0; i < pts.length; i++) {
    const a = pts[i], b = pts[(i + 1) % pts.length];
    const dx = b[0] - a[0], dy = b[1] - a[1], L = Math.hypot(dx, dy);
    const n = Math.max(1, Math.round(L / step)), nx = -dy / (L || 1), ny = dx / (L || 1);
    for (let k = 0; k < n; k++) { const t = k / n, j = (r() - 0.5) * 2 * amp; out.push([a[0] + dx * t + nx * j, a[1] + dy * t + ny * j]); }
  }
  return out;
};

const path = (g: G, pts: Pt[]) => { g.beginPath(); pts.forEach((p, i) => (i ? g.lineTo(p[0], p[1]) : g.moveTo(p[0], p[1]))); g.closePath(); };

let grainCv: HTMLCanvasElement | null = null;
const grain = (g: G) => {
  if (!grainCv) {
    grainCv = document.createElement("canvas"); grainCv.width = grainCv.height = 256;
    const c = grainCv.getContext("2d")!; const id = c.createImageData(256, 256); const r = rng(7);
    for (let i = 0; i < 256 * 256; i++) { const v = 128 + (r() - 0.5) * 70 + (r() < 0.015 ? -60 : 0); id.data[i * 4] = id.data[i * 4 + 1] = id.data[i * 4 + 2] = v; id.data[i * 4 + 3] = 255; }
    c.putImageData(id, 0, 0);
    // волокна
    c.globalAlpha = 0.18; c.strokeStyle = "#fff"; c.lineWidth = 0.7;
    for (let i = 0; i < 90; i++) { const x = r() * 256, y = r() * 256, a = r() * 6.28, l = 3 + r() * 10; c.beginPath(); c.moveTo(x, y); c.quadraticCurveTo(x + Math.cos(a + 1) * l * 0.5, y + Math.sin(a + 1) * l * 0.5, x + Math.cos(a) * l, y + Math.sin(a) * l); c.stroke(); }
  }
  return g.createPattern(grainCv, "repeat")!;
};

export type CutOpts = { edge?: number; tear?: number; seed?: number; grain?: number; thick?: boolean; stroke?: string; noEdge?: boolean; alpha?: number };
// Вырезанная форма: тень толщины → белая кромка → цвет → фактура
export const cut = (g: G, pts: Pt[], color: string | CanvasGradient, o: CutOpts = {}) => {
  const P = o.tear === 0 ? pts : tear(pts, o.tear ?? 0.9, 3.5, o.seed ?? 1);
  const e = (o.edge ?? 1.1) * 0.5;
  g.save();
  if (o.alpha != null) g.globalAlpha = o.alpha;
  g.lineJoin = "round";
  if (o.thick !== false && !o.noEdge) { g.save(); g.translate(0.5, 0.7); path(g, P); g.fillStyle = "rgba(40,28,15,0.35)"; g.fill(); g.lineWidth = e * 2; g.strokeStyle = "rgba(40,28,15,0.25)"; g.stroke(); g.restore(); }
  if (!o.noEdge) { path(g, P); g.lineWidth = e * 2; g.strokeStyle = o.stroke ?? PAL.edge; g.stroke(); }
  path(g, P); g.fillStyle = color; g.fill();
  if ((o.grain ?? 0.22) > 0) { g.save(); path(g, P); g.clip(); g.globalCompositeOperation = "multiply"; g.globalAlpha *= o.grain ?? 0.22; g.fillStyle = grain(g); g.fill(); g.restore(); }
  g.restore();
  return P;
};
// плоская заливка без кромки (детали внутри формы: камуфляж, тени-полутона)
export const fillP = (g: G, pts: Pt[], color: string, alpha = 1) => { g.save(); g.globalAlpha *= alpha; path(g, pts); g.fillStyle = color; g.fill(); g.restore(); };
export const strokeP = (g: G, pts: Pt[], color: string, w: number, close = false) => {
  g.save(); g.beginPath(); pts.forEach((p, i) => (i ? g.lineTo(p[0], p[1]) : g.moveTo(p[0], p[1]))); if (close) g.closePath();
  g.strokeStyle = color; g.lineWidth = w; g.lineCap = "round"; g.lineJoin = "round"; g.stroke(); g.restore();
};
export const clipTo = (g: G, pts: Pt[], fn: () => void) => { g.save(); path(g, pts); g.clip(); fn(); g.restore(); };

// латунная заклёпка-шарнир
export const rivet = (g: G, x: number, y: number, r = 2.2) => {
  g.save();
  g.fillStyle = "rgba(30,20,10,0.35)"; g.beginPath(); g.arc(x + 0.4, y + 0.6, r, 0, 7); g.fill();
  const gr = g.createRadialGradient(x - r * 0.35, y - r * 0.35, r * 0.1, x, y, r);
  gr.addColorStop(0, "#F4DE97"); gr.addColorStop(0.55, PAL.brass); gr.addColorStop(1, "#7E6224");
  g.fillStyle = gr; g.beginPath(); g.arc(x, y, r, 0, 7); g.fill(); g.restore();
};

// карандашная разметка
export const pencil = (g: G, pts: Pt[], alpha = 0.25) => strokeP(g, pts, `rgba(60,55,50,${alpha})`, 0.35);

// текст на бумаге
export const text = (g: G, s: string, x: number, y: number, size: number, color = PAL.ink, font = "Montserrat", weight = 900, align: CanvasTextAlign = "center", rot = 0) => {
  g.save(); g.translate(x, y); g.rotate(rot); g.font = `${weight} ${size}px "${font}"`; g.fillStyle = color; g.textAlign = align; g.textBaseline = "middle"; g.fillText(s, 0, 0); g.restore();
};

// папоротник «ёлочкой»: стебель + зубчатые листочки
export const fern = (g: G, x: number, y: number, len: number, ang: number, color: string, seed = 1, o: { droop?: number; w?: number; edge?: number } = {}) => {
  const r = rng(seed); const n = Math.max(6, Math.round(len / 7)); const w = o.w ?? len * 0.28; const droop = o.droop ?? 0.25;
  const spine: Pt[] = [];
  for (let i = 0; i <= n; i++) { const t = i / n; const a = ang + droop * t * t * Math.sign(Math.cos(ang) || 1); spine.push([x + Math.cos(a) * len * t, y + Math.sin(a) * len * t]); }
  // контур: вверх по левой стороне зубцами, вниз по правой
  const left: Pt[] = [], right: Pt[] = [];
  for (let i = 0; i < n; i++) {
    const p = spine[i], q = spine[i + 1]; const dx = q[0] - p[0], dy = q[1] - p[1], L = Math.hypot(dx, dy) || 1;
    const nx = -dy / L, ny = dx / L; const t = i / n; const ww = w * Math.sin(Math.PI * (0.15 + 0.85 * t)) * (1 - t * 0.55) * (0.85 + r() * 0.3);
    left.push([p[0] + nx * 1.2, p[1] + ny * 1.2], [q[0] - dx * 0.1 + nx * ww + dx * 0.8, q[1] - dy * 0.1 + ny * ww + dy * 0.8]);
    right.push([p[0] - nx * 1.2, p[1] - ny * 1.2], [q[0] - nx * ww + dx * 0.8, q[1] - ny * ww + dy * 0.8]);
  }
  const pts = [...left, spine[n], ...right.reverse()];
  cut(g, pts, color, { tear: 0.3, edge: o.edge ?? 0.5, seed, grain: 0.15 });
  strokeP(g, spine, "rgba(20,25,10,0.35)", 0.6);
};
// куст папоротника: веер листьев из точки
export const fernBush = (g: G, x: number, y: number, size: number, colors: string[], seed = 1, spread = 1.0) => {
  const r = rng(seed); const n = 7;
  for (let i = 0; i < n; i++) {
    const a = -Math.PI / 2 + (i / (n - 1) - 0.5) * 2.3 * spread + (r() - 0.5) * 0.2;
    fern(g, x + (r() - 0.5) * size * 0.1, y, size * (0.7 + r() * 0.4), a, colors[i % colors.length], seed * 31 + i, { droop: 0.35 * Math.sign(Math.cos(a)) });
  }
};
// ель-«зигзаг» (как на референсах): вертикальная полоса зубцов
export const zigTree = (g: G, x: number, y: number, h: number, w: number, color: string, seed = 1) => {
  const r = rng(seed); const pts: Pt[] = [[x, y - h]]; const n = Math.round(h / 9);
  for (let i = 1; i <= n; i++) { const t = i / n; const ww = w * (0.25 + 0.75 * t) * (0.85 + r() * 0.3); pts.push([x + ww, y - h + t * h - 4], [x + ww * 0.35, y - h + t * h]); }
  const left: Pt[] = [];
  for (let i = n; i >= 1; i--) { const t = i / n; const ww = w * (0.25 + 0.75 * t) * (0.85 + r() * 0.3); left.push([x - ww * 0.35, y - h + t * h], [x - ww, y - h + t * h - 4]); }
  cut(g, [...pts, ...left], color, { tear: 0.4, seed, grain: 0.2, edge: 0.5 });
};
// кусок скотча
export const tape = (g: G, x: number, y: number, w: number, rot = 0) => {
  g.save(); g.translate(x, y); g.rotate(rot);
  fillP(g, tear(rectP(-w / 2, -3, w, 6), 0.4, 2, 3), "rgba(240,232,200,0.6)"); g.restore();
};
