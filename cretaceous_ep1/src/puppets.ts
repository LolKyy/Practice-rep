// Бумажные марионетки на латунных шарнирах (паспорта — script/characters.md).
// Рисуются в «см»: (0,0) — точка между ступнями, y вниз (canvas). Рост ~170.
import { PAL, G, cut, fillP, strokeP, clipTo, rivet, rrectP, ellP, rectP, rng, Pt } from "./cut";

export type Who = "kotov" | "bugaev" | "petrov" | "lis";
export type Expr = "calm" | "sleep" | "shock" | "fear" | "realize" | "resolve" | "smirk" | "relief" | "curious" | "whisper" | "yawn" | "stern";
export type Pose = {
  expr: Expr; aL?: [number, number]; aR?: [number, number]; tilt?: number; lean?: number; talk?: number; look?: [number, number];
  blink?: boolean; legs?: boolean; holdR?: (g: G) => void; holdL?: (g: G) => void; bonk?: number; turn?: number;
};

const SPEC = {
  kotov: { tw: 50, th: 56, hr: 27, neck: 2, skin: PAL.skin, helmet: "round" },
  bugaev: { tw: 70, th: 62, hr: 22, neck: 1, skin: "#D8AE88", helmet: "flat" },
  petrov: { tw: 56, th: 52, hr: 29, neck: 0, skin: "#EBC7A0", helmet: "tilt" },
  lis: { tw: 42, th: 64, hr: 25, neck: 12, skin: "#EDD0AE", helmet: "none" },
} as const;

const CAMO = [PAL.olive, PAL.khaki, PAL.oliveD, "#7E8A48"];
const camo = (g: G, x: number, y: number, w: number, h: number, seed: number) => {
  const r = rng(seed); const s = 5;
  for (let i = 0; i < (w * h) / (s * s) * 0.55; i++) {
    const cx = x + Math.floor(r() * w / s) * s, cy = y + Math.floor(r() * h / s) * s;
    g.fillStyle = CAMO[Math.floor(r() * 4)]; g.fillRect(cx, cy, s * (1 + Math.floor(r() * 2)), s);
  }
};

// конечность: два сегмента на шарнирах, ab — [плечо, локоть] в радианах «подъёма» (0 = висит, π/2 = в сторону)
const arm = (g: G, x: number, y: number, side: 1 | -1, ab: [number, number], up: number, fore: number, w: number, sleeve: string, skin: string, seed: number, hold?: (g: G) => void) => {
  g.save(); g.translate(x, y); g.rotate(-side * ab[0]);
  cut(g, rrectP(-w / 2, -w / 2, w, up + w / 2), sleeve, { seed, edge: 0.9 });
  clipTo(g, rrectP(-w / 2, -w / 2, w, up + w / 2), () => camo(g, -w / 2, -w / 2, w, up + w, seed + 3));
  g.save(); g.translate(0, up); g.rotate(-side * ab[1]);
  cut(g, rrectP(-w / 2 + 0.5, -w / 2, w - 1, fore + w / 2), sleeve, { seed: seed + 1, edge: 0.9 });
  clipTo(g, rrectP(-w / 2, -w / 2, w, fore), () => camo(g, -w / 2, -w / 2, w, fore + w, seed + 5));
  cut(g, ellP(0, fore + 3, w * 0.55, w * 0.6, 20), skin, { seed: seed + 2, edge: 0.8 });
  if (hold) { g.save(); g.translate(0, fore + 3); hold(g); g.restore(); }
  rivet(g, 0, 0, 2.1);
  g.restore();
  rivet(g, 0, 0, 2.3);
  g.restore();
};

const face = (g: G, who: Who, p: Pose, hr: number) => {
  const e = p.expr; const lk = p.look ?? [0, 0];
  const big = who === "lis"; const ey = who === "bugaev" ? 2 : 3;
  const ex = hr * (big ? 0.36 : 0.38);
  const closed = e === "sleep" || e === "relief" || (p.blink && e !== "shock");
  // глаза
  for (const s of [-1, 1]) {
    const x = s * ex + lk[0] * 2.2, y = ey + lk[1] * 1.5;
    if (closed) { strokeP(g, ellP(x, y - 1, 4.5, 3, 10, 0.2, Math.PI - 0.2), PAL.ink, 1.6); continue; }
    if (e === "shock" || e === "realize" || e === "fear") {
      fillP(g, ellP(s * ex, ey, big ? 7.5 : 6.2, big ? 8.5 : 7, 20), "#FBF6EA");
      fillP(g, ellP(x, y + 0.5, 2.6, 2.9, 14), PAL.ink);
    } else if (e === "resolve" || e === "stern") {
      fillP(g, ellP(x, y + 1, big ? 4 : 3.4, big ? 4 : 3, 14), PAL.ink);
      fillP(g, rectP(s * ex - 6, ey - 4.5, 12, 3.5), who === "kotov" ? "#E9C9A3" : SPEC[who].skin);
    } else if (e === "smirk") {
      fillP(g, ellP(x, y + 1, 3.6, s > 0 ? 3.6 : 2.4, 14), PAL.ink);
    } else {
      fillP(g, ellP(x, y, big ? 5.2 : 3.8, big ? 6 : 4.4, 16), PAL.ink);
      fillP(g, ellP(x - 1.2, y - 1.6, 1.2, 1.4, 8), "#FFFFFF");
    }
  }
  // брови
  const bh: Record<string, [number, number]> = { calm: [0, 0], sleep: [1, 0], shock: [-6, 0], fear: [-4, 0.45], realize: [-5, 0.1], resolve: [1, -0.45], stern: [1, -0.5],
    smirk: [-1, 0], relief: [-1, 0.2], curious: [-3, 0], whisper: [-1, 0.25], yawn: [0, 0.2] };
  const [dy, tilt] = bh[e] ?? [0, 0];
  if (who !== "lis" || true) for (const s of [-1, 1]) {
    const lift = e === "curious" && s > 0 ? -3 : e === "smirk" && s > 0 ? -4 : 0;
    g.save(); g.translate(s * ex, ey - (big ? 11 : 9.5) + dy + lift); g.rotate(s * tilt);
    if (who === "bugaev") fillP(g, [[-6.5, 1.5], [0, -2.5], [6.5, 1.5], [6.5, 3.5], [0, 0], [-6.5, 3.5]], PAL.ink);
    else fillP(g, rrectP(-5, -1.3, 10, 2.6, 1.2), who === "lis" ? "#7A3A18" : PAL.ink);
    g.restore();
  }
  // рот
  const my = hr * 0.5; const tk = p.talk ?? 0;
  if (who === "bugaev") { // усы
    cut(g, [[-11, my - 5], [-4, my - 8], [0, my - 6.5], [4, my - 8], [11, my - 5], [9, my - 1.5], [0, my - 3.5], [-9, my - 1.5]], "#1C1714", { edge: 0.5, tear: 0.4, seed: 4, thick: false });
  }
  const mo = e === "shock" || e === "yawn" ? 1 : e === "fear" || e === "realize" ? 0.55 : tk;
  if (mo > 0.12) {
    const w = e === "realize" ? 3 : 4.5, h = 2 + mo * 5;
    fillP(g, ellP(0, my + h * 0.3, w, h, 16), "#5A1E1A"); fillP(g, ellP(0, my + h * 0.75, w * 0.6, h * 0.3, 10), "#C9605A");
  } else if (e === "smirk") strokeP(g, [[-4, my], [1, my + 1.5], [5, my - 2]], PAL.ink, 1.5);
  else if (e === "relief" || e === "calm" && who === "petrov") strokeP(g, ellP(0, my - 2, 4.5, 3.5, 10, 0.3, Math.PI - 0.3), PAL.ink, 1.5);
  else if (e === "fear") strokeP(g, [[-4, my + 1], [-2, my], [0, my + 1], [2, my], [4, my + 1]], PAL.ink, 1.3);
  else if (e === "sleep") fillP(g, ellP(0, my + 1, 1.8, 1.6, 10), "#5A1E1A");
  else strokeP(g, [[-3.5, my], [3.5, my]], PAL.ink, 1.5);
};

const head = (g: G, who: Who, p: Pose) => {
  const S = SPEC[who]; const hr = S.hr; const seed = who.length * 13;
  // шея
  cut(g, rectP(-6, hr * 0.6, 12, 10 + S.neck), S.skin, { seed: seed + 9, edge: 0.6 });
  // лицо
  if (who === "petrov") cut(g, [...ellP(0, 2, hr * 1.02, hr * 0.98, 40)], S.skin, { seed });
  else cut(g, ellP(0, 0, hr, hr, 40), S.skin, { seed });
  // полутон-тень справа (свет слева)
  clipTo(g, ellP(0, 0, hr, hr, 40), () => fillP(g, ellP(hr * 0.55, hr * 0.15, hr * 0.75, hr * 1.1, 30), PAL.skinD, 0.35));
  // уши
  for (const s of [-1, 1]) if (who !== "lis") cut(g, ellP(s * hr * 0.97, 3, 4, 6, 14), S.skin, { seed: seed + s, edge: 0.6 });
  // румянец
  if (who === "petrov" || who === "kotov" || who === "lis") for (const s of [-1, 1]) fillP(g, ellP(s * hr * 0.55, hr * 0.32, who === "petrov" ? 6 : 4.5, who === "petrov" ? 4 : 3, 14), "#E07A6A", who === "petrov" ? 0.7 : 0.35);
  face(g, who, p, hr);
  // очки Котова
  if (who === "kotov") for (const s of [-1, 1]) {
    const x = s * hr * 0.38, y = 3;
    g.save(); g.globalAlpha = 0.22; fillP(g, ellP(x, y, 8.5, 8.5, 24), "#EEF4F0"); g.restore();
    strokeP(g, ellP(x, y, 8.6, 8.6, 30), "#9C7A2E", 2.4, true); strokeP(g, ellP(x - 0.5, y - 0.5, 8.2, 8.2, 30), PAL.brass, 1.4, true);
    strokeP(g, [[x - 4, y - 5], [x - 1, y - 6.5]], "rgba(255,255,255,0.8)", 1.2);
  }
  if (who === "kotov") strokeP(g, [[-hr * 0.38 + 8.6, 3], [hr * 0.38 - 8.6, 3]], PAL.brass, 1.6);
  // каска
  const helm = (lift: number, rx: number, ry: number, rot: number) => {
    g.save(); g.translate(0, -hr * 0.18 - lift); g.rotate(rot);
    const dome = ellP(0, 0, rx, ry, 40, Math.PI, Math.PI * 2);
    const shape: Pt[] = [...dome, [rx + 3, 1], [rx + 3, 5], [-rx - 3, 5], [-rx - 3, 1]];
    cut(g, shape, PAL.olive, { seed: seed + 20, edge: 1.1 });
    clipTo(g, shape, () => { const r = rng(seed); for (let i = 0; i < 7; i++) fillP(g, ellP((r() - 0.5) * rx * 1.6, -r() * ry * 0.85, 4 + r() * 4, 3 + r() * 3, 12), PAL.oliveD, 0.85);
      fillP(g, ellP(rx * 0.5, -ry * 0.3, rx * 0.7, ry * 1.2, 20), "#000", 0.12); });
    fillP(g, rectP(-rx - 3, 1, rx * 2 + 6, 4), PAL.oliveD, 0.6);
    strokeP(g, [[-rx * 0.85, -ry * 0.25], [rx * 0.85, -ry * 0.25]], "rgba(30,35,15,0.3)", 0.8);
    g.restore();
  };
  if (who === "kotov") {
    // вихор из-под каски
    cut(g, [[hr * 0.05, -hr * 0.5], [hr * 0.25, -hr * 0.78], [hr * 0.3, -hr * 0.55], [hr * 0.5, -hr * 0.8], [hr * 0.5, -hr * 0.52], [hr * 0.72, -hr * 0.66], [hr * 0.62, -hr * 0.4], [hr * 0.15, -hr * 0.38]], "#3A2A1E", { seed: 77, edge: 0.6 });
    helm(2, hr * 1.12, hr * 1.0, 0);
  } else if (who === "bugaev") helm(0, hr * 1.25, hr * 0.75, 0);
  else if (who === "petrov") {
    helm(1, hr * 1.1, hr * 0.95, 0.16);
    // ложка за ремешком
    g.save(); g.translate(hr * 0.9, -hr * 0.55); g.rotate(0.5);
    cut(g, rectP(-1.2, -14, 2.4, 18), "#C7CCD6", { seed: 5, edge: 0.6 }); cut(g, ellP(0, -16, 3.6, 5, 16), "#C7CCD6", { seed: 6, edge: 0.6 });
    fillP(g, ellP(-1, -17, 1.2, 2.5, 8), "#fff", 0.6); g.restore();
    strokeP(g, [[-hr * 0.9, -hr * 0.1], [-hr * 0.6, hr * 0.7]], "#3a3a22", 1.4);
  } else if (who === "lis") {
    // рыжие волосы-«шапочка», наушники с антенной
    cut(g, [...ellP(0, -hr * 0.15, hr * 1.06, hr * 0.95, 30, Math.PI * 0.95, Math.PI * 2.05), [hr * 0.6, -hr * 0.3], [hr * 0.2, -hr * 0.42], [-hr * 0.3, -hr * 0.36], [-hr * 0.7, -hr * 0.25]], "#C46A2C", { seed: 33 });
    strokeP(g, ellP(0, -2, hr * 1.12, hr * 1.12, 30, Math.PI * 1.05, Math.PI * 1.95), "#2A2A2A", 4);
    for (const s of [-1, 1]) cut(g, rrectP(s * hr * 1.02 - 6, -6, 12, 18, 5), "#2F2F2F", { seed: 40 + s, edge: 0.8 });
    strokeP(g, [[hr * 1.05, -6], [hr * 1.3, -hr * 1.6]], "#3a3a3a", 1.4); fillP(g, ellP(hr * 1.3, -hr * 1.6, 2, 2, 8), "#C8352B");
  }
};

// Полная марионетка. Возвращает ничего; рисует в текущей системе координат (ступни в 0,0).
export const puppet = (g: G, who: Who, p: Pose, seed = 1) => {
  const S = SPEC[who]; const tw = S.tw, th = S.th;
  const hipY = -78; const shY = hipY - th + 8;
  g.save(); g.rotate(p.lean ?? 0);
  // ноги
  if (p.legs !== false) for (const s of [-1, 1]) {
    cut(g, rrectP(s * tw * 0.22 - 8, hipY - 4, 16, 70, 5), PAL.oliveD, { seed: seed + s });
    clipTo(g, rrectP(s * tw * 0.22 - 8, hipY - 4, 16, 70, 5), () => camo(g, s * tw * 0.22 - 8, hipY - 4, 16, 70, seed + 11 + s));
    cut(g, rrectP(s * tw * 0.22 - 10 + s * 3, -12, 22, 12, 4), "#3A2A1C", { seed: seed + 5 + s });
    rivet(g, s * tw * 0.22, hipY + 2, 2);
  }
  // задняя рука (слева на экране = левая для зрителя): рисуем позже передней? — обе по бокам, перед торсом не проходят
  const aL = p.aL ?? [0.12, 0.1], aR = p.aR ?? [0.12, 0.1];
  // торс
  const torso: Pt[] = who === "petrov"
    ? [[-tw * 0.38, shY - 2], [tw * 0.38, shY - 2], [tw * 0.55, hipY - 12], [tw * 0.5, hipY + 4], [-tw * 0.5, hipY + 4], [-tw * 0.55, hipY - 12]]
    : rrectP(-tw / 2, shY - 4, tw, hipY - shY + 10, 9);
  cut(g, torso, PAL.olive, { seed: seed + 30 });
  clipTo(g, torso, () => { camo(g, -tw, shY - 6, tw * 2, th + 20, seed + 31); fillP(g, rectP(tw * 0.12, shY - 10, tw, th + 30), "#000", 0.16); });
  // разгрузка
  const vest = rrectP(-tw * 0.42, shY + 4, tw * 0.84, (hipY - shY) * 0.78, 4);
  cut(g, vest, "#4B5530", { seed: seed + 40, edge: 0.8 });
  for (let i = 0; i < 3; i++) { const px = -tw * 0.33 + i * tw * 0.235; cut(g, rrectP(px, hipY - 26, tw * 0.2, 16, 2), "#3E4727", { seed: seed + 41 + i, edge: 0.7 }); fillP(g, rectP(px + tw * 0.07, hipY - 26, tw * 0.06, 4), "#2C331B"); }
  strokeP(g, [[-tw * 0.42, shY + 14], [tw * 0.42, shY + 14]], "rgba(20,24,10,0.5)", 1.2);
  // рация Бугаева на плече / Лисицына на груди
  if (who === "bugaev") { cut(g, rrectP(-tw * 0.48, shY + 2, 13, 20, 2), "#2F2F2F", { seed: 70 }); strokeP(g, [[-tw * 0.4, shY + 2], [-tw * 0.43, shY - 18]], "#2a2a2a", 1.5); }
  if (who === "lis") cut(g, rrectP(tw * 0.05, shY + 10, 16, 12, 2), "#2F2F2F", { seed: 71 });
  // бафф / шарф
  const buff: Pt[] = [[-13, shY - 8], [13, shY - 8], [15, shY + 3], [0, shY + 6], [-15, shY + 3]];
  cut(g, buff, who === "kotov" ? PAL.scarf : "#4B5530", { seed: seed + 50, edge: 0.9 });
  if (who === "kotov") cut(g, [[10, shY - 2], [26, shY + 6], [24, shY + 12], [9, shY + 4]], PAL.scarf, { seed: seed + 51, edge: 0.8 });
  // руки
  arm(g, -tw / 2 + 3, shY + 4, -1, aL, 30, 27, 12.5, PAL.olive, S.skin, seed + 60, p.holdL);
  arm(g, tw / 2 - 3, shY + 4, 1, aR, 30, 27, 12.5, PAL.olive, S.skin, seed + 64, p.holdR);
  // голова
  const hr = S.hr;
  g.save(); g.translate(0, shY - 8 - S.neck - hr * 0.78); g.rotate(p.tilt ?? 0);
  const b = 1 + 0.08 * (p.bonk ?? 0); g.scale(b, b);
  head(g, who, p);
  g.restore();
  g.restore();
};

// служебные: моргание и «говорение» по времени
export const blinkAt = (t: number, seed: number) => ((t * 30 + seed * 37) % 97) < 4;
export const talkAt = (t: number, ranges: [number, number][]) => (ranges.some(([a, b]) => t >= a && t < b) ? 0.3 + 0.7 * Math.abs(Math.sin(t * 17)) : 0);
