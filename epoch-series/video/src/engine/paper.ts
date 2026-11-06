// «Бумажный театр» v2 — бумага на Canvas 2D.
// Наследник cut.ts из «Отряда БТР» (v1): тот же API (cut/fillP/strokeP/rivet/tape…), плюс:
//  • сорта бумаги (крафт, акварельная, гофро, калька, картон) — у каждого своя процедурная фактура;
//  • фактура = многооктавный шум «облачности» волокнистой массы + волокна + вкрапления;
//  • рельеф листа («normal map»): мягкий градиент свет/тень по форме + лёгкое тиснение шумом;
//  • «живые» рваные кромки: неравномерный надрыв + торчащие белые волокна по краю.
export type Pt = [number, number];
export type G = CanvasRenderingContext2D;

export const PAL = {
  edge: "#F6F1E4", ink: "#1E1A17", brass: "#C9A24B", scarf: "#C8352B", mustard: "#D9A23A", navy: "#2E3A57", boots: "#5A3A24",
  kraft: "#B98A5A", kraftL: "#D2A878", kraftD: "#8A6440", skin: "#EAC9A2", skinD: "#C99B72", hair: "#3A2A1E",
  paper: "#F6F2E7", sky: "#BFE0EE", skyL: "#E4F2F2", sun: "#F7C948", grass: "#8DB15A", grassD: "#5F8A3C",
  stone: "#E3D3B4", stoneD: "#C2AA82", terracotta: "#C4693D", olive: "#6E7A3A", sea: "#4E9CC0",
  sticky: "#F7D84A", blueprint: "#2F5D8C",
};

export const rng = (seed: number) => { let s = (seed * 2654435761) >>> 0 || 1; return () => ((s = (s * 1664525 + 1013904223) >>> 0) / 4294967296); };
export const clamp = (x: number, a = 0, b = 1) => Math.max(a, Math.min(b, x));
export const mix = (a: number, b: number, t: number) => a + (b - a) * t;

// ---------------------------------------------------------------- формы → многоугольники
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
export const bbox = (pts: Pt[]) => {
  let x0 = 1e9, y0 = 1e9, x1 = -1e9, y1 = -1e9;
  for (const [x, y] of pts) { x0 = Math.min(x0, x); y0 = Math.min(y0, y); x1 = Math.max(x1, x); y1 = Math.max(y1, y); }
  return { x0, y0, x1, y1, w: x1 - x0, h: y1 - y0 };
};

// «Живой» надрыв: шаг и амплитуда плавают (как настоящая рука с ножницами), иногда — выщерблина.
export const tear = (pts: Pt[], amp = 1.2, step = 4, seed = 1): Pt[] => {
  const r = rng(seed); const out: Pt[] = []; let drift = 0;
  for (let i = 0; i < pts.length; i++) {
    const a = pts[i], b = pts[(i + 1) % pts.length];
    const dx = b[0] - a[0], dy = b[1] - a[1], L = Math.hypot(dx, dy);
    const n = Math.max(1, Math.round(L / step)), nx = -dy / (L || 1), ny = dx / (L || 1);
    for (let k = 0; k < n; k++) {
      const t = k / n; drift = drift * 0.6 + (r() - 0.5) * amp * 1.4;
      const nick = r() < 0.03 ? -amp * 1.6 : 0;
      const j = (r() - 0.5) * amp + drift + nick;
      out.push([a[0] + dx * t + nx * j, a[1] + dy * t + ny * j]);
    }
  }
  return out;
};

const path = (g: G, pts: Pt[]) => { g.beginPath(); pts.forEach((p, i) => (i ? g.lineTo(p[0], p[1]) : g.moveTo(p[0], p[1]))); g.closePath(); };

// ---------------------------------------------------------------- процедурные фактуры
export type Sort = "card" | "kraft" | "water" | "corr" | "trace" | "felt";
const value2 = (n: number, seed: number) => { // гладкий value-noise n×n (тайлится)
  const r = rng(seed); const grid = Array.from({ length: n * n }, () => r());
  return (x: number, y: number) => {
    const xi = Math.floor(x) % n, yi = Math.floor(y) % n, xf = x - Math.floor(x), yf = y - Math.floor(y);
    const s = (t: number) => t * t * (3 - 2 * t);
    const v = (i: number, j: number) => grid[((j + n) % n) * n + ((i + n) % n)];
    const a = v(xi, yi), b = v(xi + 1, yi), c = v(xi, yi + 1), d = v(xi + 1, yi + 1);
    return mix(mix(a, b, s(xf)), mix(c, d, s(xf)), s(yf));
  };
};
const TEX: Partial<Record<Sort, CanvasPattern>> = {};
const makeTex = (g: G, sort: Sort) => {
  if (TEX[sort]) return TEX[sort]!;
  const N = 512; const cv = document.createElement("canvas"); cv.width = cv.height = N;
  const c = cv.getContext("2d")!; const id = c.createImageData(N, N); const r = rng(sort.length * 97 + 3);
  const o1 = value2(8, 11), o2 = value2(32, 23), o3 = value2(128, 37);
  const k = { card: [22, 14, 26, 0.012], kraft: [30, 22, 34, 0.03], water: [46, 26, 22, 0.006], corr: [14, 10, 20, 0.01], trace: [10, 6, 8, 0.002], felt: [20, 30, 40, 0.02] }[sort];
  for (let y = 0; y < N; y++) for (let x = 0; x < N; x++) {
    const u = x / N, v = y / N;
    let val = 128 + (o1(u * 8, v * 8) - 0.5) * k[0] + (o2(u * 32, v * 32) - 0.5) * k[1] + (r() - 0.5) * k[2];
    if (r() < k[3]) val -= 40 + r() * 40;             // вкрапления
    if (sort === "corr") val += Math.sin(x / N * Math.PI * 2 * 24) * 9; // волны гофры
    if (sort === "water") val += (o3(u * 128, v * 128) - 0.5) * 20;     // «зерно» акварельной бумаги
    const i = (y * N + x) * 4; id.data[i] = id.data[i + 1] = id.data[i + 2] = clamp(val, 0, 255); id.data[i + 3] = 255;
  }
  c.putImageData(id, 0, 0);
  // волокна: светлые и тёмные, изогнутые
  const fibers = sort === "trace" ? 60 : sort === "kraft" ? 520 : 300;
  for (let i = 0; i < fibers; i++) {
    const x = r() * N, y = r() * N, a = r() * 6.28, l = 4 + r() * (sort === "kraft" ? 22 : 14);
    c.globalAlpha = 0.10 + r() * 0.18; c.strokeStyle = r() < 0.6 ? "#fff" : "#4a3a28"; c.lineWidth = 0.5 + r() * 0.7;
    c.beginPath(); c.moveTo(x, y); c.quadraticCurveTo(x + Math.cos(a + 1) * l * 0.5, y + Math.sin(a + 1) * l * 0.5, x + Math.cos(a) * l, y + Math.sin(a) * l); c.stroke();
  }
  c.globalAlpha = 1;
  TEX[sort] = g.createPattern(cv, "repeat")!;
  return TEX[sort]!;
};

// ---------------------------------------------------------------- свет сцены (для рельефа и контрового)
let LIGHT = { ang: -2.3, rim: "rgba(255,226,170,0.85)", edge: "#F6F1E4" };
export const setLight = (o: Partial<typeof LIGHT>) => { LIGHT = { ...LIGHT, ...o }; };
export const setEdge = (c?: string) => { LIGHT.edge = c ?? "#F6F1E4"; };

export type CutOpts = { edge?: number; tear?: number; seed?: number; grain?: number; thick?: boolean; stroke?: string; noEdge?: boolean; alpha?: number;
  sort?: Sort; relief?: number; hairs?: number; rim?: number };
// Вырезанная форма: тень толщины → белая кромка (+волокна) → цвет → фактура → рельеф листа → контровой край
export const cut = (g: G, pts: Pt[], color: string | CanvasGradient, o: CutOpts = {}) => {
  const P = o.tear === 0 ? pts : tear(pts, o.tear ?? 0.9, 3.5, o.seed ?? 1);
  const e = (o.edge ?? 1.1) * 0.55; const sort = o.sort ?? "card";
  g.save();
  if (o.alpha != null) g.globalAlpha = o.alpha;
  g.lineJoin = "round";
  if (o.thick !== false && !o.noEdge && sort !== "trace") { // тень от толщины картона
    g.save(); g.translate(0.7, 1.0); path(g, P); g.fillStyle = "rgba(60,38,18,0.30)"; g.fill(); g.lineWidth = e * 2.4; g.strokeStyle = "rgba(60,38,18,0.18)"; g.stroke(); g.restore();
  }
  if (!o.noEdge) {
    path(g, P); g.lineWidth = e * 2; g.strokeStyle = o.stroke ?? LIGHT.edge; g.stroke();
    // торчащие волокна по кромке
    const hairs = o.hairs ?? (o.tear === 0 ? 0 : 0.12);
    if (hairs > 0 && e > 0.2) {
      const r = rng((o.seed ?? 1) * 7 + 5); g.save(); g.strokeStyle = o.stroke ?? LIGHT.edge; g.lineWidth = Math.max(0.35, e * 0.45); g.globalAlpha *= 0.9;
      g.beginPath();
      for (let i = 0; i < P.length; i++) if (r() < hairs) {
        const a = P[i], b = P[(i + 1) % P.length]; const dx = b[0] - a[0], dy = b[1] - a[1], L = Math.hypot(dx, dy) || 1;
        const nx = dy / L, ny = -dx / L; const l = e * (1.5 + r() * 3.5); const tw = (r() - 0.5) * 0.9;
        g.moveTo(a[0], a[1]); g.quadraticCurveTo(a[0] + nx * l * 0.6 + dx / L * tw * l, a[1] + ny * l * 0.6 + dy / L * tw * l, a[0] + nx * l + dx / L * tw * l * 1.5, a[1] + ny * l + dy / L * tw * l * 1.5);
      }
      g.stroke(); g.restore();
    }
  }
  path(g, P); g.fillStyle = color; g.fill();
  const gr = o.grain ?? (sort === "trace" ? 0.12 : 0.3);
  if (gr > 0 || (o.relief ?? 1) > 0) {
    g.save(); path(g, P); g.clip();
    if (gr > 0) { g.save(); g.globalCompositeOperation = "multiply"; g.globalAlpha *= gr; g.fillStyle = makeTex(g, sort); g.fill(); g.restore();
      g.save(); g.globalCompositeOperation = "screen"; g.globalAlpha *= gr * 0.35; g.fillStyle = makeTex(g, sort); g.translate(37, 59); g.fillRect(-4000, -4000, 8000, 8000); g.restore(); }
    const rel = (o.relief ?? 1) * (sort === "trace" ? 0.3 : 1);
    if (rel > 0) { // рельеф: свет сверху-слева, лист чуть выгнут
      const b = bbox(P); const cx = (b.x0 + b.x1) / 2, cy = (b.y0 + b.y1) / 2; const R = Math.max(b.w, b.h) * 0.6 + 1;
      const lx = Math.cos(LIGHT.ang), ly = Math.sin(LIGHT.ang);
      const lg = g.createLinearGradient(cx + lx * R, cy + ly * R, cx - lx * R, cy - ly * R);
      lg.addColorStop(0, `rgba(255,248,230,${0.22 * rel})`); lg.addColorStop(0.5, "rgba(255,255,255,0)"); lg.addColorStop(1, `rgba(40,25,10,${0.22 * rel})`);
      g.fillStyle = lg; g.fillRect(b.x0 - 2, b.y0 - 2, b.w + 4, b.h + 4);
      // мягкая «вогнутость» по краю — лист не идеально плоский
      g.globalAlpha *= 0.5 * rel; g.lineWidth = Math.max(2, e * 6); g.strokeStyle = "rgba(60,40,20,0.10)"; path(g, P); g.stroke();
    }
    g.restore();
  }
  if ((o.rim ?? 0) > 0) { // контровой: подсвеченная кромка со стороны света
    g.save(); g.globalAlpha *= o.rim!; g.translate(Math.cos(LIGHT.ang) * 1.3, Math.sin(LIGHT.ang) * 1.3); path(g, P);
    g.lineWidth = e * 1.6; g.strokeStyle = LIGHT.rim; g.globalCompositeOperation = "screen"; g.stroke(); g.restore();
  }
  g.restore();
  return P;
};
export const fillP = (g: G, pts: Pt[], color: string, alpha = 1) => { g.save(); g.globalAlpha *= alpha; path(g, pts); g.fillStyle = color; g.fill(); g.restore(); };
export const strokeP = (g: G, pts: Pt[], color: string, w: number, close = false) => {
  g.save(); g.beginPath(); pts.forEach((p, i) => (i ? g.lineTo(p[0], p[1]) : g.moveTo(p[0], p[1]))); if (close) g.closePath();
  g.strokeStyle = color; g.lineWidth = w; g.lineCap = "round"; g.lineJoin = "round"; g.stroke(); g.restore();
};
export const clipTo = (g: G, pts: Pt[], fn: () => void) => { g.save(); path(g, pts); g.clip(); fn(); g.restore(); };

export const rivet = (g: G, x: number, y: number, r = 2.2) => {
  g.save();
  g.fillStyle = "rgba(30,20,10,0.35)"; g.beginPath(); g.arc(x + 0.5, y + 0.7, r, 0, 7); g.fill();
  const gr = g.createRadialGradient(x - r * 0.35, y - r * 0.35, r * 0.1, x, y, r);
  gr.addColorStop(0, "#FBE9AE"); gr.addColorStop(0.5, PAL.brass); gr.addColorStop(1, "#7E6224");
  g.fillStyle = gr; g.beginPath(); g.arc(x, y, r, 0, 7); g.fill();
  g.strokeStyle = "rgba(90,66,20,0.6)"; g.lineWidth = r * 0.18; g.beginPath(); g.moveTo(x - r * 0.5, y); g.lineTo(x + r * 0.5, y); g.stroke();
  g.restore();
};

// ---------------------------------------------------------------- тактильные мелочи
export const pencil = (g: G, pts: Pt[], alpha = 0.3, w = 0.8) => {
  const r = rng(pts.length * 13); g.save(); g.strokeStyle = `rgba(70,64,58,${alpha})`; g.lineWidth = w; g.lineCap = "round";
  for (let pass = 0; pass < 2; pass++) { g.beginPath(); pts.forEach((p, i) => { const j = (r() - 0.5) * w; i ? g.lineTo(p[0] + j, p[1] + j) : g.moveTo(p[0] + j, p[1] - j); }); g.stroke(); }
  g.restore();
};
export const tape = (g: G, x: number, y: number, w: number, rot = 0, h = 16) => {
  g.save(); g.translate(x, y); g.rotate(rot);
  const P = tear(rectP(-w / 2, -h / 2, w, h), 0.5, 2.5, Math.round(x + y));
  g.shadowColor = "rgba(40,30,10,0.18)"; g.shadowBlur = 3; g.shadowOffsetY = 1.5;
  fillP(g, P, "rgba(244,236,205,0.72)"); g.shadowColor = "transparent";
  // зубчатые торцы и блик
  strokeP(g, [[-w / 2 + 3, -h / 2 + 3], [w / 2 - 3, -h / 2 + 3]], "rgba(255,255,255,0.45)", 1.5);
  g.restore();
};
export const glue = (g: G, x: number, y: number, rx: number, ry: number, seed = 1) => {
  const P = tear(ellP(x, y, rx, ry, 18), rx * 0.18, 4, seed);
  g.save(); g.globalAlpha = 0.16; path(g, P); g.fillStyle = "#fffbe8"; g.fill(); g.globalAlpha = 0.12; g.strokeStyle = "#8a7a50"; g.lineWidth = 1; g.stroke(); g.restore();
};
export const thread = (g: G, x: number, y0: number, y1: number, sway = 0) => {
  g.save(); g.strokeStyle = "rgba(245,240,225,0.9)"; g.lineWidth = 1.6; g.beginPath(); g.moveTo(x, y0); g.quadraticCurveTo(x + sway * 0.5, (y0 + y1) / 2, x + sway, y1); g.stroke();
  g.strokeStyle = "rgba(60,50,40,0.25)"; g.lineWidth = 0.8; g.beginPath(); g.moveTo(x + 1.2, y0); g.quadraticCurveTo(x + 1.2 + sway * 0.5, (y0 + y1) / 2, x + 1.2 + sway, y1); g.stroke(); g.restore();
};

export const text = (g: G, s: string, x: number, y: number, size: number, color = PAL.ink, font = "Montserrat", weight = 900, align: CanvasTextAlign = "center", rot = 0) => {
  g.save(); g.translate(x, y); g.rotate(rot); g.font = `${weight} ${size}px "${font}"`; g.fillStyle = color; g.textAlign = align; g.textBaseline = "middle"; g.fillText(s, 0, 0); g.restore();
};
// надпись «тушью» с лёгкой неровностью краёв (штамп)
export const inkText = (g: G, s: string, x: number, y: number, size: number, color = PAL.ink, font = "Montserrat", weight = 900, align: CanvasTextAlign = "center", rot = 0) => {
  g.save(); g.globalAlpha *= 0.25; text(g, s, x + 0.6, y + 0.4, size, color, font, weight, align, rot); g.restore();
  text(g, s, x, y, size, color, font, weight, align, rot);
};

// облако из кальки/бумаги, висит на нитках
export const cloud = (g: G, x: number, y: number, w: number, seed = 1, color = "#FFFFFF", hang = 0) => {
  const r = rng(seed); const pts: Pt[] = [];
  const n = 5; for (let i = 0; i <= n; i++) { const cx = x - w / 2 + (w * i) / n; const rr = w * (0.12 + r() * 0.1) * (i === 0 || i === n ? 0.7 : 1); for (const p of ellP(cx, y - rr * 0.4, rr, rr, 10, Math.PI, Math.PI * 2)) pts.push(p); }
  pts.push([x + w / 2 + 4, y + 6], [x - w / 2 - 4, y + 6]);
  if (hang > 0) { thread(g, x - w * 0.25, y - hang - 200, y - w * 0.12); thread(g, x + w * 0.25, y - hang - 200, y - w * 0.1); }
  cut(g, pts, color, { seed, tear: 1.2, edge: 2.2, sort: "water", grain: 0.25 });
};
export const leafy = (g: G, x: number, y: number, r0: number, color: string, seed = 1) => { // крона-«облачко» из листа
  const r = rng(seed); const pts: Pt[] = []; const n = 14;
  for (let i = 0; i < n; i++) { const a = (i / n) * Math.PI * 2; const rr = r0 * (0.82 + r() * 0.3); pts.push([x + Math.cos(a) * rr, y + Math.sin(a) * rr * 0.85]); }
  cut(g, pts, color, { seed, tear: 2, edge: 2, sort: "kraft", grain: 0.25 });
};
