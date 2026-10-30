// Реквизит Ч3 «Ворон»: рапторы, БТР сверху, царапины, фото 1986, люк снизу, рассвет, блокнот Сёмы.
import { PAL, G, Pt, cut, fillP, strokeP, clipTo, rivet, rrectP, ellP, rectP, rng, text, tear, tape, setEdge } from "./cut";
import { btr } from "./props";

export const RAP = { dark: "#4A3424", rust: "#9A5A2E", stripe: "#2A1D15", belly: "#C9B08A", claw: "#F3EDE0" };

// ------------------------------------------------------------------ раптор сбоку (морда вправо). (0,0) — земля между лапами. Длина ~520, бёдра ~150.
export type RapPose = { head?: number; jaw?: number; run?: number; crouch?: number; tilt?: number; arm?: number; claw?: number; eye?: number; leader?: boolean; seed?: number; night?: boolean };
const featherStrip = (g: G, x0: number, y0: number, x1: number, y1: number, w: number, c: string, seed: number) => {
  const n = Math.max(4, Math.round(Math.hypot(x1 - x0, y1 - y0) / 14)); const pts: Pt[] = [];
  const dx = (x1 - x0) / n, dy = (y1 - y0) / n, L = Math.hypot(dx, dy) || 1, nx = -dy / L, ny = dx / L;
  for (let i = 0; i <= n; i++) pts.push([x0 + dx * i, y0 + dy * i]);
  for (let i = n; i >= 0; i--) pts.push([x0 + dx * i + nx * w * (i % 2 ? 1 : 0.55), y0 + dy * i + ny * w * (i % 2 ? 1 : 0.55)]);
  cut(g, pts, c, { seed, edge: 0.5, tear: 0.3 });
};
const leg = (g: G, hx: number, hy: number, ph: number, c: string, claw: number, crouch: number, seed: number) => {
  const th = 0.35 + Math.sin(ph) * 0.55 - crouch * 0.4, sh = -0.9 - Math.max(0, Math.cos(ph)) * 0.7 + crouch * 0.6;
  g.save(); g.translate(hx, hy); g.rotate(th);
  cut(g, [[-26, -10], [24, -12], [16, 70], [-12, 72]], c, { seed, edge: 0.8 });
  g.translate(2, 66); g.rotate(sh);
  cut(g, rrectP(-9, 0, 18, 66, 8), c, { seed: seed + 1, edge: 0.7 });
  g.translate(0, 62); g.rotate(-th - sh);
  cut(g, [[-14, -6], [40, -2], [44, 8], [-12, 8]], "#3A2A1C", { seed: seed + 2, edge: 0.6 });
  // коготь-серп (поднят)
  g.save(); g.translate(8, -4); g.rotate(-0.4 - claw * 0.7);
  cut(g, [[0, 0], [10, -22], [26, -30], [16, -16], [6, 2]], RAP.claw, { seed: seed + 3, edge: 0.5 }); g.restore();
  g.restore();
};
export const raptor = (g: G, p: RapPose = {}) => {
  const s = p.seed ?? 1, r = rng(s * 13 + 1); const ph = p.run ?? 0; const cr = p.crouch ?? 0;
  const bob = Math.abs(Math.sin(ph)) * 8;
  g.save(); g.translate(0, cr * 30 - bob); g.rotate(p.tilt ?? 0);
  const hip: Pt = [0, -150];
  leg(g, hip[0] - 6, hip[1] + 6, ph + Math.PI, "#3B2A1D", p.claw ?? 0, cr, s + 30);                 // дальняя лапа
  // хвост — жёсткий, с бахромой перьев
  const tail: Pt[] = [[20, -175], [-120, -185], [-300, -175], [-320, -168], [-300, -160], [-120, -140], [10, -125]];
  cut(g, tail, RAP.dark, { seed: s + 1, edge: 0.9 });
  for (let i = 0; i < 6; i++) featherStrip(g, -60 - i * 40, -178 + i * 1, -100 - i * 40, -180, 14, i % 2 ? RAP.rust : RAP.dark, s + 40 + i);
  clipTo(g, tail, () => { for (let i = 0; i < 7; i++) fillP(g, rectP(-300 + i * 44, -190, 14, 70), RAP.stripe, 0.7); });
  // тело
  const body = ellP(30, -165, 100, 52, 36);
  cut(g, body, RAP.rust, { seed: s + 2, edge: 1 });
  clipTo(g, body, () => { fillP(g, ellP(40, -125, 100, 30, 30), RAP.belly); for (let i = 0; i < 5; i++) fillP(g, rectP(-50 + i * 34 + r() * 8, -230, 12, 70), RAP.stripe, 0.75); fillP(g, ellP(60, -200, 110, 40, 30), RAP.dark, 0.45); });
  // шея + голова
  g.save(); g.translate(110, -190); g.rotate(-0.55 + (p.head ?? 0));
  cut(g, [[-26, 18], [-14, -16], [70, -40], [84, -14], [10, 30]], RAP.rust, { seed: s + 3, edge: 0.9 });
  featherStrip(g, -10, -16, 70, -40, 12, RAP.dark, s + 50);
  g.translate(84, -28); g.rotate(0.55 - (p.head ?? 0) * 0.5);
  // челюсть
  g.save(); g.translate(0, 8); g.rotate(p.jaw ?? 0);
  cut(g, [[-6, 0], [86, 2], [92, 10], [-4, 16]], RAP.belly, { seed: s + 4, edge: 0.6 });
  for (let x = 10; x < 86; x += 12) cut(g, [[x, 2], [x + 4, -7], [x + 8, 2]], RAP.claw, { seed: x, edge: 0.3, thick: false });
  g.restore();
  const head: Pt[] = [[-20, -18], [20, -30], [70, -16], [100, -2], [96, 8], [10, 10], [-24, 8]];
  cut(g, head, RAP.dark, { seed: s + 5, edge: 0.9 });
  for (let x = 20; x < 92; x += 12) cut(g, [[x, 8], [x + 4, 17], [x + 8, 8]], RAP.claw, { seed: x + 1, edge: 0.3, thick: false });
  fillP(g, ellP(88, -6, 3, 2, 8), "#120E06");
  // гребень перьев на затылке (у вожака — рваное перо)
  featherStrip(g, -22, -16, 10, -32, 14, RAP.rust, s + 60);
  if (p.leader) { cut(g, [[-10, -26], [-30, -66], [-16, -58], [-12, -74], [0, -40]], RAP.rust, { seed: s + 61, edge: 0.6 }); }
  // глаз — жёлтая калька, ночью светится
  const ey = p.eye ?? (p.night ? 1 : 0.4);
  if (ey > 0.5) { const gl = g.createRadialGradient(28, -10, 1, 28, -10, 36); gl.addColorStop(0, `rgba(255,214,90,${0.6 * ey})`); gl.addColorStop(1, "rgba(255,214,90,0)"); g.fillStyle = gl; g.fillRect(-10, -48, 76, 76); }
  cut(g, ellP(28, -10, 8, 6, 14), "#F2C84A", { seed: s + 6, edge: 0.4 }); fillP(g, ellP(29, -10, 1.6, 5, 8), "#120E06");
  g.restore();
  // ближняя лапа
  leg(g, hip[0], hip[1] + 4, ph, RAP.rust, p.claw ?? 0, cr, s + 20);
  // рука-«крыло» с маховыми перьями
  g.save(); g.translate(100, -175); g.rotate(0.9 - (p.arm ?? 0) * 1.6);
  cut(g, rrectP(-8, 0, 16, 60, 6), RAP.dark, { seed: s + 7, edge: 0.6 });
  for (let i = 0; i < 4; i++) featherStrip(g, -6, 12 + i * 12, -46 - i * 6, 40 + i * 14, 10, i % 2 ? RAP.rust : RAP.dark, s + 70 + i);
  g.translate(0, 58); for (let i = -1; i <= 1; i++) cut(g, [[i * 4, 0], [i * 6 + 4, 16], [i * 4 + 2, 2]], RAP.claw, { seed: s + 80 + i, edge: 0.3, thick: false });
  g.restore();
  g.restore();
};

// ------------------------------------------------------------------ раптор сверху (морда вправо, вдоль оси x). Длина ~500.
export const raptorTop = (g: G, look = 0, seed = 1, leader = false, t = 0) => {
  const sw = Math.sin(t * 3 + seed) * 0.08;
  cut(g, [[-40, -14], [-300, -4 + sw * 80], [-300, 4 + sw * 80], [-40, 14]], RAP.dark, { seed, edge: 0.7 });
  cut(g, ellP(10, 0, 80, 40, 30), RAP.rust, { seed: seed + 1, edge: 0.9 });
  clipTo(g, ellP(10, 0, 80, 40, 30), () => { for (let i = 0; i < 5; i++) fillP(g, rectP(-60 + i * 28, -40, 10, 80), RAP.stripe, 0.7); });
  for (const s of [-1, 1]) cut(g, [[50, s * 28], [30, s * 80], [0, s * 86], [30, s * 40]], RAP.dark, { seed: seed + 2 + s, edge: 0.6 });
  g.save(); g.translate(80, 0); g.rotate(look);
  cut(g, [[0, -14], [60, -10], [130, -5], [130, 5], [60, 10], [0, 14]], RAP.rust, { seed: seed + 4, edge: 0.7 });
  for (const s of [-1, 1]) { const gl = g.createRadialGradient(80, s * 9, 1, 80, s * 9, 20); gl.addColorStop(0, "rgba(255,214,90,0.7)"); gl.addColorStop(1, "rgba(255,214,90,0)"); g.fillStyle = gl; g.fillRect(60, s * 9 - 20, 40, 40); fillP(g, ellP(80, s * 9, 4, 3, 8), "#F2C84A"); }
  if (leader) cut(g, [[20, -6], [-30, -28], [-12, -4]], RAP.rust, { seed: seed + 5, edge: 0.5 });
  g.restore();
};

// ------------------------------------------------------------------ БТР сверху (нос вправо). Центр (0,0), длина ~740.
export const btrTop = (g: G, night = true) => {
  for (const x of [-250, -95, 95, 250]) for (const s of [-1, 1]) cut(g, rrectP(x - 50, s * 150 - 22, 100, 44, 14), "#262420", { seed: x + s, edge: 0.8 });
  cut(g, [[-370, -140], [230, -140], [370, -60], [370, 60], [230, 140], [-370, 140]], PAL.khaki, { seed: 31, edge: 1.4 });
  for (let x = -340; x < 340; x += 40) { rivet(g, x, -125, 3); rivet(g, x, 125, 3); }
  cut(g, ellP(-30, 0, 85, 85, 40), PAL.khakiL, { seed: 32, edge: 1 }); cut(g, rrectP(40, -10, 240, 20, 6), "#3A3B30", { seed: 33 });
  for (const [x, y] of [[-250, -70], [-250, 70], [150, -70], [150, 70]]) cut(g, rrectP(x - 32, y - 26, 64, 52, 8), PAL.khakiD, { seed: x + y, edge: 0.6 });
  cut(g, rrectP(118, -30, 60, 60, 4), "#2E2C1C", { seed: 34, edge: 0.5 }); for (let x = 124; x < 175; x += 9) fillP(g, rectP(x, -26, 4, 52), "#7A7550");
  text(g, "317", -150, 0, 40, "#D8D0A8");
  if (night) { g.save(); g.globalCompositeOperation = "source-atop"; g.fillStyle = "rgba(10,14,28,0.55)"; g.fillRect(-400, -200, 800, 400); g.restore(); fillP(g, rrectP(-280, -78, 60, 16, 4), "#FFB84D", 0.9); fillP(g, rrectP(120, -78, 60, 16, 4), "#FFB84D", 0.9); }
};

// ------------------------------------------------------------------ царапины на броне (count — сколько видно)
export const scratches = (g: G, x: number, y: number, count = 5, glow = 0) => {
  for (let i = 0; i < count; i++) { const sx = x + i * 46; const pts = tear([[sx, y], [sx + 14, y - 6], [sx + 120, y + 190], [sx + 104, y + 198]], 2.5, 8, i + 3);
    cut(g, pts, "#F3EDE0", { seed: i, edge: 0.4, thick: false }); strokeP(g, [[sx + 8, y], [sx + 112, y + 194]], "rgba(120,110,80,0.5)", 2);
    if (glow > 0) { g.save(); g.globalAlpha = glow; strokeP(g, [[sx + 6, y], [sx + 112, y + 194]], "rgba(255,230,180,0.9)", 8); g.restore(); } }
};

// ------------------------------------------------------------------ фото экспедиции 1986 (сепия, белые поля, загнутый уголок)
export const photo1986 = (g: G, age = 0) => {
  cut(g, rectP(-330, -260, 660, 520), "#F1E9D6", { seed: 91, edge: 1 });
  const inner = rectP(-300, -230, 600, 400);
  clipTo(g, inner, () => {
    const gr = g.createLinearGradient(0, -230, 0, 170); gr.addColorStop(0, "#D9C6A0"); gr.addColorStop(1, "#B39A72"); g.fillStyle = gr; g.fillRect(-300, -230, 600, 400);
    fillP(g, rectP(-300, 40, 600, 140), "#8E7756");
    for (let i = 0; i < 7; i++) fillP(g, [[-300 + i * 95, 40], [-260 + i * 95, -120 - (i % 3) * 30], [-220 + i * 95, 40]], "#7A6648", 0.8);
    // палатки
    for (const [x, s] of [[-210, 1], [-90, 0.8]] as [number, number][]) { fillP(g, [[x - 70 * s, 80], [x, 80 - 90 * s], [x + 70 * s, 80]], "#6E5A40"); fillP(g, [[x - 14 * s, 80], [x, 50], [x + 14 * s, 80]], "#3E3222"); }
    // вездеход
    fillP(g, rrectP(40, 0, 170, 70, 8), "#5E4C36"); fillP(g, rrectP(170, -30, 60, 50, 6), "#5E4C36"); fillP(g, rrectP(30, 60, 210, 34, 16), "#3A2E20");
    for (let x = 50; x < 230; x += 32) fillP(g, ellP(x, 77, 11, 11, 10), "#2A2018");
    // люди в штормовках
    for (const [x, h] of [[-20, 1], [-40, 0.9], [250, 1.05], [-260, 0.95]] as [number, number][]) { fillP(g, ellP(x, 40 - 70 * h, 13, 14, 12), "#3A2E20"); fillP(g, [[x - 20, 100 - 20 * h], [x - 16, 50 - 50 * h], [x + 16, 50 - 50 * h], [x + 20, 100 - 20 * h]], "#3A2E20"); }
    // старение: зерно, пятна
    const r = rng(9); for (let i = 0; i < 300; i++) fillP(g, ellP(-300 + r() * 600, -230 + r() * 400, 1 + r() * 2, 1 + r() * 2, 6), r() > 0.5 ? "#F4E8CC" : "#5A4A34", 0.2 + age * 0.2);
    g.fillStyle = `rgba(200,150,60,${0.12 + age * 0.18})`; g.fillRect(-300, -230, 600, 400);
  });
  text(g, "ЭКСП. 1986", -200, 210, 28, "rgba(40,40,80,0.75)", "JetBrains Mono", 700);
  cut(g, [[330, -260], [260, -260], [330, -190]], "#D8CDB4", { seed: 92, edge: 0.8 });   // загнутый уголок
  tape(g, -300, -250, 120, -0.5); tape(g, 300, 250, 120, -0.5);
};

// ------------------------------------------------------------------ люк снизу (POV): круг неба в тёмном кольце
export const hatchUp = (g: G, w: number, h: number, sky: (g: G) => void, open = 1, r = 330) => {
  g.save(); g.beginPath(); g.arc(w / 2, h * 0.42, r, 0, Math.PI * 2); g.clip(); sky(g); g.restore();
  g.fillStyle = "#1A180F"; g.beginPath(); g.rect(-200, -200, w + 400, h + 400); g.arc(w / 2, h * 0.42, r, 0, Math.PI * 2, true); g.fill();
  strokeP(g, ellP(w / 2, h * 0.42, r + 10, r + 10, 60), "#4A4630", 26, true);
  for (let i = 0; i < 16; i++) { const a = (i / 16) * Math.PI * 2; rivet(g, w / 2 + Math.cos(a) * (r + 34), h * 0.42 + Math.sin(a) * (r + 34), 7); }
  // крышка люка (отброшена вверх-вправо)
  if (open < 1) { g.save(); g.translate(w / 2 + r, h * 0.42); g.scale(1, 1); cut(g, ellP(-r * open, 0, r * (1 - open * 0.0), r * (1 - open * 0.85), 50), "#3E3A26", { seed: 5 }); g.restore(); }
};

// ------------------------------------------------------------------ рассветное небо
export const dawnSky = (g: G, w: number, h: number, sun: [number, number, number] | null = [w * 0.62, h * 0.5, 120], k = 1) => {
  const gr = g.createLinearGradient(0, 0, 0, h); gr.addColorStop(0, "#2A3A5A"); gr.addColorStop(0.45, "#B98AA0"); gr.addColorStop(0.8, "#F2B48A"); gr.addColorStop(1, "#F6CFA0");
  g.fillStyle = gr; g.fillRect(0, 0, w, h);
  if (sun) { const [x, y, r] = sun; const gl = g.createRadialGradient(x, y, r * 0.8, x, y, r * 3); gl.addColorStop(0, "rgba(255,226,170,0.55)"); gl.addColorStop(1, "rgba(255,226,170,0)"); g.fillStyle = gl; g.fillRect(x - r * 3, y - r * 3, r * 6, r * 6); cut(g, ellP(x, y, r, r, 50), "#FFE2AA", { seed: 2, edge: 1.2 }); }
  for (let i = 0; i < 3; i++) cut(g, tear([[w * (0.1 + i * 0.3), h * (0.15 + i * 0.07)], [w * (0.3 + i * 0.3), h * (0.14 + i * 0.07)], [w * (0.33 + i * 0.3), h * (0.18 + i * 0.07)], [w * (0.12 + i * 0.3), h * (0.19 + i * 0.07)]], 5, 14, i), "#F6D8C0", { seed: i + 7, edge: 0.6 });
};

// ------------------------------------------------------------------ блокнот Сёмы (страница из Ч2) + новые пометки Ворона
const pen = (g: G, pts: Pt[], w = 3, a = 0.75) => { strokeP(g, pts, `rgba(55,50,45,${a})`, w); strokeP(g, pts.map(([x, y], i) => [x + 1.5 + (i % 2), y - 1.2] as Pt), `rgba(55,50,45,${a * 0.45})`, w * 0.7); };
const partial = (pts: Pt[], k: number): Pt[] => { if (k <= 0) return []; const n = (pts.length - 1) * Math.min(1, k); const i = Math.floor(n); const out = pts.slice(0, i + 1); if (i < pts.length - 1) { const a = pts[i], b = pts[i + 1], f = n - i; out.push([a[0] + (b[0] - a[0]) * f, a[1] + (b[1] - a[1]) * f]); } return out; };
export const notebook = (g: G, o: { arrow?: number; rock?: number; label?: number } = {}) => {
  cut(g, rectP(80, 200, 920, 1480), PAL.paper, { seed: 7, edge: 2 });
  clipTo(g, rectP(80, 200, 920, 1480), () => { for (let y = 320; y < 1680; y += 46) strokeP(g, [[80, y], [1000, y]], "rgba(70,110,170,0.3)", 2); strokeP(g, [[170, 200], [170, 1680]], "rgba(200,60,50,0.55)", 2.5); });
  for (let x = 120; x < 990; x += 46) { fillP(g, ellP(x, 232, 10, 10, 12), "#3B3428"); strokeP(g, ellP(x, 220, 11, 17, 14, Math.PI, Math.PI * 2), "#8A8478", 3); }
  // старое (Ч2): река, БТР, «≈ 1 час», маршрут к реке
  const river = (dy: number): Pt[] => Array.from({ length: 30 }, (_, i) => [180 + i * 28, 1040 + dy + Math.sin(i * 0.7) * 22 + i * 1.6] as Pt);
  for (let i = 0; i < 30; i++) strokeP(g, [[180 + i * 28, 1048 + Math.sin(i * 0.7) * 22 + i * 1.6], [196 + i * 28, 1072 + Math.sin(i * 0.7) * 22 + i * 1.6]], "rgba(75,134,200,0.55)", 5);
  pen(g, river(0)); pen(g, river(36));
  text(g, "РЕКА?", 830, 990, 34, "rgba(55,50,45,0.85)", "JetBrains Mono", 700);
  pen(g, [[500, 1450], [580, 1450], [590, 1470], [580, 1490], [500, 1490], [500, 1450]]);
  text(g, "БТР", 640, 1472, 32, "rgba(55,50,45,0.85)", "JetBrains Mono", 700, "left");
  for (let y = 1440; y > 1100; y -= 34) strokeP(g, [[540, y], [540, y - 18]], "rgba(200,53,43,0.8)", 5);
  const r = rng(15); for (let i = 0; i < 18; i++) { const x = 230 + r() * 720, y = 300 + r() * 1300; if (Math.abs(y - 1060) < 90 || (x > 470 && y > 1380) || (Math.abs(x - 540) < 120 && y < 1000) || (x > 720 && y > 920 && y < 1020)) continue;
    const pts: Pt[] = []; for (let k = 0; k <= 14; k++) { const a = (k / 14) * Math.PI * 2; const rr = 24 + Math.sin(k * 2.7 + i) * 6; pts.push([x + Math.cos(a) * rr, y + Math.sin(a) * rr * 0.8]); } pen(g, pts, 2.4, 0.55); }
  pen(g, [[900, 1700 - 1290], [900, 1700 - 1370]], 3); text(g, "С", 900, 300, 30, "rgba(55,50,45,0.85)", "JetBrains Mono", 700);
  // новое: стрелка на север «12 КМ», скала с белой полосой, «ВОРОН?»
  const arr: Pt[] = [[540, 1000], [530, 820], [550, 640], [540, 520]];
  const ap = partial(arr, o.arrow ?? 0); if (ap.length > 1) pen(g, ap, 4, 0.85);
  if ((o.arrow ?? 0) >= 1) { pen(g, [[518, 548], [540, 520], [562, 548]], 4, 0.85); text(g, "12 КМ", 640, 760, 40, "rgba(55,50,45,0.9)", "JetBrains Mono", 700); }
  const rock: Pt[] = [[420, 500], [470, 380], [540, 340], [620, 370], [670, 500]];
  const rp = partial(rock, o.rock ?? 0); if (rp.length > 1) pen(g, rp, 4, 0.85);
  if ((o.rock ?? 0) >= 1) { pen(g, [[440, 470], [520, 420], [650, 450]], 3, 0.6); strokeP(g, [[450, 445], [520, 400], [640, 425]], "rgba(255,255,255,0.95)", 9); }
  if ((o.label ?? 0) > 0) { g.save(); g.globalAlpha = Math.min(1, o.label!); text(g, "ВОРОН?", 760, 380, 36, "rgba(200,53,43,0.9)", "JetBrains Mono", 700); g.restore(); }
  tape(g, 960, 230, 140, 0.4); tape(g, 130, 1660, 140, 0.5);
};
export { btr, setEdge };
