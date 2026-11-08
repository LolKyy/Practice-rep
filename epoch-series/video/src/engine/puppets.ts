// Марионетки v2. Сёма Котов (паспорт — bible/HERO.md, основа — characters.md CHAR_SEMA v1.0) и массовка.
// Единицы — «см», (0,0) — точка между ступнями, y вниз. Рост ~170 (голова ≈ 1/3,5 роста — кукольные пропорции).
// Детали на латунных заклёпках; вращаются только на шарнирах. Сменные: рот (4 формы), веко, брови.
import { PAL, G, cut, fillP, strokeP, clipTo, rivet, rrectP, ellP, rectP, rng, Pt, pencil, clamp } from "./paper";

export type Emo = "calm" | "curious" | "fear" | "shock" | "resolve" | "relief" | "facepalm" | "disgust" | "tired" | "proud" | "smile";
export type Outfit = "casual" | "legion";
export type Pose = {
  emo: Emo; talk?: number; blink?: boolean; look?: [number, number];
  aL?: [number, number]; aR?: [number, number]; tilt?: number; lean?: number; facing?: 1 | -1;
  holdR?: (g: G) => void; holdL?: (g: G) => void; bag?: boolean; wind?: number; t?: number; step?: number; squash?: number;
};
export const EMOS: Emo[] = ["calm", "curious", "fear", "shock", "resolve", "relief", "facepalm", "disgust", "tired", "proud"];
export const EMO_RU: Record<Emo, string> = { calm: "спокоен", curious: "любопытство", fear: "страх", shock: "шок", resolve: "решимость", relief: "облегчение",
  facepalm: "«я дурак»", disgust: "отвращение", tired: "усталость", proud: "гордость", smile: "улыбка" };

// ---------------------------------------------------------------- лицо
type FaceSpec = { hr: number; skin: string; skinD: string; glasses: boolean; brow: string; beard?: string; bigEyes?: boolean };
export const mouthShape = (emo: Emo, talk: number): "closed" | "ajar" | "open" | "o" | "smile" | "frown" | "wavy" | "grin" => {
  if (emo === "shock") return talk > 0.5 ? "open" : "o";
  if (emo === "fear") return talk > 0.3 ? "o" : "wavy";
  if (talk > 0.62) return "open"; if (talk > 0.3) return "ajar"; if (talk > 0.12 && (emo === "curious")) return "o";
  if (emo === "relief" || emo === "smile") return "smile"; if (emo === "proud") return "grin";
  if (emo === "disgust" || emo === "tired" || emo === "facepalm") return "frown";
  return "closed";
};
const face = (g: G, F: FaceSpec, p: Pose) => {
  const e = p.emo; const lk = p.look ?? [0, 0]; const hr = F.hr;
  const ex = hr * 0.38, ey = 3; const er = F.bigEyes ? 5.2 : 4.3;
  const closed = e === "relief" || (p.blink && e !== "shock");
  for (const s of [-1, 1]) {
    const x = s * ex + lk[0] * 2.2, y = ey + lk[1] * 1.5;
    if (closed) { strokeP(g, ellP(s * ex, ey - 1, 4.8, 3.2, 10, 0.2, Math.PI - 0.2), PAL.ink, 1.8); continue; }
    if (e === "shock" || e === "fear") {
      fillP(g, ellP(s * ex, ey, 6.4, 7.2, 20), "#FDF8EC"); strokeP(g, ellP(s * ex, ey, 6.4, 7.2, 20), "rgba(30,20,10,0.35)", 0.6, true);
      fillP(g, ellP(x, y + 0.5, 2.5, 2.8, 14), PAL.ink); fillP(g, ellP(x - 0.8, y - 0.6, 0.8, 0.9, 8), "#fff");
    } else {
      fillP(g, ellP(x, y, er * 0.9, er, 16), PAL.ink); fillP(g, ellP(x - 1.3, y - 1.7, 1.3, 1.5, 8), "#FFFFFF");
      // веко: «устал», «отвращение», «решимость», «гордость» — сменная полоска кожи сверху
      const lid = e === "tired" ? 0.55 : e === "disgust" ? 0.4 : e === "resolve" ? 0.32 : e === "proud" ? 0.38 : 0;
      if (lid > 0) { const tilt = e === "resolve" ? s * 0.25 : 0; g.save(); g.translate(s * ex, ey); g.rotate(tilt);
        cut(g, rectP(-7, -er - 3, 14, 3 + er * 2 * lid), F.skin, { tear: 0, edge: 0.6, grain: 0.15, relief: 0, seed: 3 }); g.restore(); }
    }
  }
  // брови на шарнирах — главный носитель эмоции
  const bh: Record<Emo, [number, number, number]> = { // [подъём, наклон внутр. края, асимметрия]
    calm: [0, 0, 0], curious: [-3, 0, -4], fear: [-4, 0.5, 0], shock: [-7, 0, 0], resolve: [1.5, -0.5, 0], relief: [-1.5, 0.25, 0],
    facepalm: [-1, 0.45, 0], disgust: [0, -0.3, 3], tired: [1, 0.3, 0], proud: [-2.5, -0.15, 0], smile: [-1.5, 0, 0] };
  const [dy, tl, asym] = bh[e];
  for (const s of [-1, 1]) {
    const lift = s > 0 ? asym : 0;
    g.save(); g.translate(s * ex, ey - 10 + dy + lift); g.rotate(s * tl);
    cut(g, rrectP(-5.6, -1.5, 11.2, 3.2, 1.4), F.brow, { tear: 0.2, edge: 0.6, grain: 0.1, relief: 0, seed: 7 + s });
    rivet(g, s * 4.5, 0, 0.75);
    g.restore();
  }
  // рот — сменные формы
  const my = hr * 0.5; const ms = mouthShape(e, p.talk ?? 0);
  const dark = "#5A1E1A", tongue = "#D06A60";
  if (F.beard) {
    cut(g, [[-hr * 0.85, -2], [-hr * 0.7, hr * 0.75], [-hr * 0.3, hr * 1.12], [0, hr * 1.2], [hr * 0.3, hr * 1.12], [hr * 0.7, hr * 0.75], [hr * 0.85, -2], [hr * 0.55, hr * 0.28], [0, hr * 0.33], [-hr * 0.55, hr * 0.28]], F.beard, { seed: 31, tear: 1, edge: 0.8, sort: "kraft" });
  }
  if (ms === "open") { fillP(g, ellP(0, my + 2.5, 5.4, 4.5 + (p.talk ?? 0) * 2, 18), dark); fillP(g, ellP(0, my + 5, 3.4, 1.6, 10), tongue); fillP(g, rectP(-4, my - 1.5, 8, 1.8), "#FBF6EA"); }
  else if (ms === "ajar") { fillP(g, ellP(0, my + 1, 4.5, 2.4, 14), dark); }
  else if (ms === "o") { fillP(g, ellP(0, my + 1.5, 2.8, 3.6, 14), dark); }
  else if (ms === "smile") strokeP(g, ellP(0, my - 2.5, 5, 4, 12, 0.35, Math.PI - 0.35), PAL.ink, 1.6);
  else if (ms === "grin") { fillP(g, [...ellP(0, my - 1, 6, 5, 14, 0.1, Math.PI - 0.1)], dark); fillP(g, rectP(-5, my - 1, 10, 1.6), "#FBF6EA"); }
  else if (ms === "frown") strokeP(g, ellP(0, my + 3.5, 4.5, 3, 12, Math.PI + 0.45, Math.PI * 2 - 0.45), PAL.ink, 1.6);
  else if (ms === "wavy") strokeP(g, [[-4.5, my + 1], [-2.2, my], [0, my + 1], [2.2, my], [4.5, my + 1]], PAL.ink, 1.4);
  else strokeP(g, [[-3.5, my], [3.8, my - 0.4]], PAL.ink, 1.6);
  if (e === "disgust") strokeP(g, [[3, my - 4], [6, my - 2]], "rgba(30,20,10,0.5)", 0.8);
  // очки: латунная оправа, линзы-калька с бликом
  if (F.glasses) {
    for (const s of [-1, 1]) {
      const x = s * hr * 0.38, y = 3;
      g.save(); g.globalAlpha = 0.28; fillP(g, ellP(x, y, 8.6, 8.6, 24), "#EEF6F4"); g.restore();
      strokeP(g, ellP(x + 0.4, y + 0.6, 8.7, 8.7, 30), "rgba(60,40,10,0.35)", 2.6, true);
      strokeP(g, ellP(x, y, 8.7, 8.7, 30), "#9C7A2E", 2.6, true); strokeP(g, ellP(x - 0.4, y - 0.4, 8.3, 8.3, 30), "#E8C66A", 1.1, true);
      strokeP(g, [[x - 4.5, y - 4.5], [x - 1.2, y - 6.4]], "rgba(255,255,255,0.95)", 1.5); strokeP(g, [[x + 3.5, y + 4], [x + 4.8, y + 2.2]], "rgba(255,255,255,0.7)", 1);
    }
    strokeP(g, [[-hr * 0.38 + 8.6, 2.5], [hr * 0.38 - 8.6, 2.5]], PAL.brass, 1.8);
  }
};

// ---------------------------------------------------------------- голова Сёмы (общая для всех костюмов)
const HR = 33;
const semaHead = (g: G, p: Pose, outfit: Outfit) => {
  const hr = HR; const skin = PAL.skin;
  cut(g, rectP(-6, hr * 0.6, 12, 12), skin, { seed: 9, edge: 0.6 });
  // волосы сзади (тёмная «шапочка» под затылком)
  if (outfit === "casual") cut(g, ellP(0, -3, hr * 1.04, hr * 1.02, 40, Math.PI * 0.92, Math.PI * 2.08), PAL.hair, { seed: 12, edge: 0.9, sort: "kraft" });
  for (const s of [-1, 1]) cut(g, ellP(s * hr * 0.97, 3, 4.2, 6.5, 14), skin, { seed: 20 + s, edge: 0.7 });
  cut(g, ellP(0, 0, hr, hr, 44), skin, { seed: 1, sort: "water", rim: 0.6 });
  clipTo(g, ellP(0, 0, hr, hr, 40), () => fillP(g, ellP(hr * 0.6, hr * 0.2, hr * 0.7, hr * 1.1, 30), PAL.skinD, 0.32));
  for (const s of [-1, 1]) fillP(g, ellP(s * hr * 0.56, hr * 0.33, 4.8, 3, 14), "#E8806E", 0.38);
  fillP(g, ellP(1, hr * 0.2, 2.4, 2, 10), PAL.skinD, 0.6); // нос-кружок
  if (outfit === "casual") {
    // чёлка + ВИХОР из трёх зубцов вверх-вправо
    cut(g, [[-hr * 0.95, -hr * 0.15], [-hr * 0.8, -hr * 0.62], [-hr * 0.35, -hr * 0.95], [hr * 0.2, -hr * 1.0], [hr * 0.75, -hr * 0.7], [hr * 0.98, -hr * 0.2], [hr * 0.6, -hr * 0.45], [hr * 0.2, -hr * 0.32], [-hr * 0.2, -hr * 0.48], [-hr * 0.6, -hr * 0.3]], PAL.hair, { seed: 77, edge: 0.9, sort: "kraft", rim: 0.5 });
    cut(g, [[hr * 0.0, -hr * 0.92], [hr * 0.2, -hr * 1.42], [hr * 0.32, -hr * 1.0], [hr * 0.52, -hr * 1.38], [hr * 0.58, -hr * 0.95], [hr * 0.86, -hr * 1.2], [hr * 0.75, -hr * 0.72], [hr * 0.3, -hr * 0.7]], PAL.hair, { seed: 78, edge: 0.9, sort: "kraft", rim: 0.7 });
    rivet(g, hr * 0.3, -hr * 0.8, 1.2);
  }
  face(g, { hr, skin, skinD: PAL.skinD, glasses: true, brow: PAL.hair }, p);
  // карандаш за ухом
  if (outfit === "casual") { g.save(); g.translate(hr * 1.02, 8); g.rotate(-0.35);
    cut(g, rectP(-2, -16, 4, 26), "#F2C230", { seed: 41, edge: 0.5, tear: 0.1 }); cut(g, [[-2, -16], [2, -16], [0, -22]], "#E9C9A3", { seed: 42, edge: 0.4, tear: 0 }); fillP(g, [[-0.8, -20], [0.8, -20], [0, -22]], PAL.ink); cut(g, rectP(-2.2, 9, 4.4, 4), "#E58A9A", { seed: 43, edge: 0.4, tear: 0 }); g.restore(); }
  if (outfit === "legion") { g.save(); g.translate(0, -hr * 0.22);
    // галея: бронзовый купол, нащёчники, назатыльник, гребень (тёмный, чтобы красный остался только у горла)
    cut(g, [[-hr * 1.05, -hr * 0.05], [-hr * 1.25, hr * 0.1], [-hr * 1.15, -hr * 0.3]], "#B08A3E", { seed: 60, edge: 0.8 });
    const dome = [...ellP(0, -hr * 0.12, hr * 1.1, hr * 1.02, 40, Math.PI, Math.PI * 2), [hr * 1.12, -hr * 0.05], [-hr * 1.12, -hr * 0.05]] as Pt[];
    cut(g, dome, "#C29A46", { seed: 61, edge: 1, rim: 0.8 });
    clipTo(g, dome, () => { fillP(g, ellP(hr * 0.55, -hr * 0.5, hr * 0.7, hr * 0.9, 20), "#6E4E14", 0.25); fillP(g, ellP(-hr * 0.45, -hr * 0.7, hr * 0.25, hr * 0.35, 12), "#FFF1C0", 0.4); });
    cut(g, rrectP(-hr * 1.18, -hr * 0.2, hr * 2.36, 6, 2), "#9E7C34", { seed: 62, edge: 0.8 }); // козырёк-обод
    for (const s of [-1, 1]) { cut(g, [[s * hr * 0.98, -hr * 0.12], [s * hr * 1.08, hr * 0.55], [s * hr * 0.7, hr * 0.62], [s * hr * 0.62, -hr * 0.05]], "#C29A46", { seed: 63 + s, edge: 0.8 }); rivet(g, s * hr * 0.84, hr * 0.05, 1.4); }
    // гребень из конского волоса (тёмно-коричневый), зубцами
    const crest: Pt[] = [[-hr * 0.9, -hr * 0.95]]; for (let i = 0; i <= 12; i++) { const a = Math.PI * 1.1 + (i / 12) * Math.PI * 0.8; crest.push([Math.cos(a) * hr * 1.0, -hr * 0.3 + Math.sin(a) * hr * 1.12 - (i % 2) * 3]); }
    crest.push([hr * 0.9, -hr * 0.95], [0, -hr * 1.1]);
    cut(g, crest, "#3B2A20", { seed: 64, edge: 0.9, sort: "kraft", rim: 0.6 });
    // вихор выглядывает из-под шлема (узнаваемость!)
    cut(g, [[hr * 0.35, -hr * 0.18], [hr * 0.55, -hr * 0.42], [hr * 0.62, -hr * 0.2], [hr * 0.8, -hr * 0.36], [hr * 0.8, -hr * 0.12]], PAL.hair, { seed: 79, edge: 0.6 });
    rivet(g, 0, -hr * 1.05, 2); g.restore();
  }
};

// ---------------------------------------------------------------- руки (два сегмента на шарнирах)
const arm = (g: G, x: number, y: number, side: 1 | -1, ab: [number, number], up: number, fore: number, w: number, sleeve: string, cuff: string | null, skin: string, seed: number, hold?: (g: G) => void, hand: "open" | "fist" | "point" = "open") => {
  g.save(); g.translate(x, y); g.rotate(-side * ab[0]);
  cut(g, rrectP(-w / 2, -w / 2, w, up + w / 2), sleeve, { seed, edge: 0.9, sort: "felt" });
  g.save(); g.translate(0, up); g.rotate(-side * ab[1]);
  cut(g, rrectP(-w / 2 + 0.5, -w / 2, w - 1, fore + w / 2), sleeve, { seed: seed + 1, edge: 0.9, sort: "felt" });
  if (cuff) cut(g, rrectP(-w / 2, fore - 3, w, 5, 1.5), cuff, { seed: seed + 9, edge: 0.6 });
  // кисть: ладонь + большой палец
  g.save(); g.translate(0, fore + 4);
  cut(g, ellP(0, 1, w * 0.52, w * 0.6, 20), skin, { seed: seed + 2, edge: 0.8 });
  if (hand === "point") cut(g, rrectP(-1.5, 2, 3.2, 10, 1.5), skin, { seed: seed + 4, edge: 0.6 });
  else if (hand === "open") for (let i = -1; i <= 1; i++) cut(g, rrectP(i * 2.6 - 1.2, 3, 2.6, 6, 1.2), skin, { seed: seed + 5 + i, edge: 0.5, tear: 0.2 });
  cut(g, ellP(side * -w * 0.45, -1, 2.2, 4, 10), skin, { seed: seed + 3, edge: 0.5 });
  if (hold) hold(g);
  g.restore();
  rivet(g, 0, 0, 2.1);
  g.restore();
  rivet(g, 0, 0, 2.3);
  g.restore();
};

// ---------------------------------------------------------------- СЁМА
export const sema = (g: G, outfit: Outfit, p: Pose) => {
  const t = p.t ?? 0; const wind = p.wind ?? 1;
  const tw = 52, hipY = -80, shY = hipY - 58;
  g.save(); if ((p.facing ?? 1) < 0) g.scale(-1, 1);
  const breath = Math.sin(t * 2.2) * 0.012; g.rotate((p.lean ?? 0) + breath * 0.6);
  if (p.squash) g.scale(1 + p.squash * 0.06, 1 - p.squash * 0.06);
  // шарф (длинный хвост сзади, развевается)
  if (outfit === "casual") {
    const sw = Math.sin(t * 3.1) * 6 * wind, sw2 = Math.sin(t * 3.1 - 0.8) * 9 * wind;
    cut(g, [[-14, shY - 4], [-24 - sw * 0.3, shY + 20], [-34 - sw, shY + 52], [-26 - sw2, shY + 58], [-16 - sw * 0.6, shY + 30], [-6, shY + 2]], "#A82A22", { seed: 51, edge: 0.9, sort: "felt" });
  }
  // жёлтый термокороб курьера за спиной (выглядывает над плечами и по бокам)
  if (p.bag) {
    cut(g, rrectP(-tw / 2 - 22, shY - 46, tw + 44, 112, 8), "#FFC928", { seed: 140, edge: 1.2, rim: 0.8 });
    fillP(g, rectP(-tw / 2 - 22, shY - 46, tw + 44, 12), "#F2A900"); strokeP(g, [[-tw / 2 - 16, shY - 30], [tw / 2 + 16, shY - 30]], "rgba(140,90,0,0.35)", 1.5);
    cut(g, ellP(0, shY - 26, 9, 9, 16), PAL.scarf, { seed: 141, edge: 0.8 }); // наш значок
  }
  // ноги
  const st = p.step ?? 0;
  for (const s of [-1, 1]) {
    const lift = s === 1 ? Math.max(0, st) * 10 : Math.max(0, -st) * 10;
    const legC = outfit === "casual" ? PAL.navy : "#D8C9A8";
    g.save(); g.translate(0, -lift);
    if (outfit === "legion") {
      cut(g, rrectP(s * tw * 0.2 - 7, hipY + 8, 14, 60, 5), PAL.skin, { seed: 80 + s, edge: 0.8 });
      // калиги: сандалии с ремешками
      cut(g, rrectP(s * tw * 0.2 - 10 + s * 3, -11, 23, 11, 4), "#7A4A28", { seed: 85 + s, sort: "kraft" });
      for (let k = 0; k < 4; k++) strokeP(g, [[s * tw * 0.2 - 8, -14 - k * 7], [s * tw * 0.2 + 8, -10 - k * 7]], "#6A3E20", 2.2);
    } else {
      cut(g, rrectP(s * tw * 0.22 - 9, hipY - 4, 18, 70, 6), legC, { seed: 80 + s, sort: "felt" });
      strokeP(g, [[s * tw * 0.22 + s * 3, hipY + 20], [s * tw * 0.22 + s * 3, -14]], "rgba(255,255,255,0.12)", 1);
      cut(g, rrectP(s * tw * 0.22 - 11 + s * 4, -13, 25, 13, 5), PAL.boots, { seed: 85 + s, sort: "kraft", rim: 0.4 });
      fillP(g, rectP(s * tw * 0.22 - 11 + s * 4, -3, 25, 3), "#3A2416");
      strokeP(g, [[s * tw * 0.22 - 4 + s * 4, -10], [s * tw * 0.22 + 4 + s * 4, -10]], "#EAD9B0", 1);
    }
    rivet(g, s * tw * 0.22, hipY + 2, 2);
    g.restore();
  }
  // торс
  const aL = p.aL ?? [0.12, 0.1], aR = p.aR ?? [0.12, 0.1];
  if (outfit === "casual") {
    const torso: Pt[] = [[-tw / 2 - 2, shY], [tw / 2 + 2, shY], [tw / 2 + 5, hipY + 12], [-tw / 2 - 5, hipY + 12]];
    // капюшон за спиной
    cut(g, ellP(0, shY - 2, 22, 10, 20, Math.PI, Math.PI * 2), "#C08A2C", { seed: 29, sort: "felt" });
    cut(g, torso, PAL.mustard, { seed: 30, sort: "felt", rim: 0.6 });
    clipTo(g, torso, () => { fillP(g, rectP(tw * 0.15, shY - 10, tw, 120), "#8A5A10", 0.18); });
    strokeP(g, [[0, shY + 8], [0, hipY + 10]], "#8C6420", 1.6); // молния
    for (let k = 0; k < 9; k++) strokeP(g, [[-1.5, shY + 12 + k * 7], [1.5, shY + 12 + k * 7]], "#6E4E18", 0.8);
    for (const s of [-1, 1]) { cut(g, rrectP(s * 6 + (s < 0 ? -16 : 0), hipY - 18, 16, 14, 2), "#C48F2E", { seed: 33 + s, edge: 0.6, sort: "felt" }); pencil(g, [[s * 6 + (s < 0 ? -14 : 2), hipY - 15], [s * 6 + (s < 0 ? -2 : 14), hipY - 15]], 0.35, 0.6); }
    cut(g, rrectP(-tw / 2 - 5, hipY + 4, tw + 10, 9, 3), "#C48F2E", { seed: 36, edge: 0.6, sort: "felt" });
  } else {
    // туника (некрашеная шерсть) + лорика сегментата (полосы) + цингулум с подвесками
    const tunic: Pt[] = [[-tw / 2, shY], [tw / 2, shY], [tw / 2 + 9, hipY + 28], [-tw / 2 - 9, hipY + 28]];
    cut(g, tunic, "#D9CBAE", { seed: 30, sort: "felt" });
    for (let k = 0; k < 4; k++) strokeP(g, [[-tw / 2 - 6 + k * 18, hipY + 6], [-tw / 2 - 8 + k * 19, hipY + 28]], "rgba(90,70,40,0.25)", 1);
    for (let i = 0; i < 6; i++) {
      const y = shY + 6 + i * 9.5; const sh = i < 2 ? 2 : 0;
      cut(g, rrectP(-tw / 2 - 3 - sh, y, tw + 6 + sh * 2, 10.5, 2.5), i % 2 ? "#AEB6BE" : "#C3CAD1", { seed: 90 + i, edge: 0.7, tear: 0.2, rim: 0.6 });
      fillP(g, rectP(-tw / 2, y + 7.5, tw, 2.5), "#7D858E", 0.4);
    }
    for (const s of [-1, 1]) { cut(g, rrectP(s * 8 - 10, shY - 4, 20, 16, 4), "#C3CAD1", { seed: 96 + s, edge: 0.7 }); rivet(g, s * 8, shY + 4, 1.6); }
    cut(g, rrectP(-tw / 2 - 2, hipY - 4, tw + 4, 7, 2), "#6A4426", { seed: 98, sort: "kraft" });
    for (let i = 0; i < 4; i++) { cut(g, rrectP(-8 + i * 5, hipY + 2, 3.2, 20, 1.2), "#6A4426", { seed: 99 + i, edge: 0.4 }); rivet(g, -6.4 + i * 5, hipY + 20, 1.2); }
    // гладиус на боку
    cut(g, rrectP(tw / 2 - 2, hipY - 18, 8, 34, 2), "#5B3A22", { seed: 105, sort: "kraft" }); rivet(g, tw / 2 + 2, hipY - 12, 1.5);
  }
  // ЗАДНЯЯ рука (левая для зрителя)
  const sleeve = outfit === "casual" ? PAL.mustard : "#D9CBAE";
  arm(g, -tw / 2 + 2, shY + 5, -1, aL, 30, 28, 13, sleeve, outfit === "casual" ? "#C48F2E" : null, PAL.skin, 60, p.holdL);
  // КРАСНАЯ ДЕТАЛЬ У ГОРЛА — всегда (шарф / фокале легионера)
  if (outfit === "casual") {
    cut(g, [[-15, shY - 9], [15, shY - 9], [17, shY + 5], [0, shY + 9], [-17, shY + 5]], PAL.scarf, { seed: 52, edge: 1, sort: "felt", rim: 0.7 });
    const sw = Math.sin(t * 3.4 + 1) * 4 * wind;
    cut(g, [[6, shY + 2], [16, shY + 4], [15 + sw * 0.4, shY + 34], [19 + sw, shY + 50], [9 + sw, shY + 51], [7, shY + 30]], PAL.scarf, { seed: 53, edge: 1, sort: "felt" });
    for (let k = 0; k < 4; k++) strokeP(g, [[11 + sw + k * 2.4 - 3, shY + 51], [11 + sw + k * 2.4 - 3, shY + 55]], PAL.scarf, 1.4);
  } else {
    cut(g, [[-15, shY - 9], [15, shY - 9], [16, shY + 4], [0, shY + 9], [-16, shY + 4]], PAL.scarf, { seed: 52, edge: 1, sort: "felt", rim: 0.7 });
    cut(g, [[0, shY + 4], [8, shY + 4], [6, shY + 18], [1, shY + 16]], PAL.scarf, { seed: 54, edge: 0.8, sort: "felt" });
  }
  // голова
  g.save(); g.translate(0, shY - 12 - HR * 0.78); g.rotate((p.tilt ?? 0) + Math.sin(t * 1.7) * 0.015);
  semaHead(g, p, outfit);
  g.restore();
  // ПЕРЕДНЯЯ рука; «я дурак» — ладонь на лоб
  let ar = aR; let hand: "open" | "fist" | "point" = "open";
  if (p.emo === "facepalm") ar = [3.14, 0.5];
  if (p.holdR) hand = "fist";
  arm(g, tw / 2 - 2, shY + 5, 1, ar, 30, 28, 13, sleeve, outfit === "casual" ? "#C48F2E" : null, PAL.skin, 64, p.holdR, hand);
  g.restore();
};

// ---------------------------------------------------------------- МАССОВКА (та же база, другие накладки)
export type ExtraSpec = { bald?: boolean; toga?: boolean; skin?: string; tunic?: string; hat?: "none" | "galea" | "laurel" | "hood" | "cap" | "tricorn" | "bandana"; vest?: string; bigBeard?: boolean; beard?: string; hair?: string; armor?: boolean; scale?: number; seed?: number; cloak?: string };
export const extra = (g: G, x: ExtraSpec, p: Pose) => {
  const t = p.t ?? 0; const skin = x.skin ?? "#D9AE86"; const tunic = x.tunic ?? "#B9A27A"; const sd = x.seed ?? 1; const r = rng(sd);
  const tw = 48 + r() * 10, hipY = -78, shY = hipY - 54; const hr = 25 + r() * 3;
  g.save(); g.scale(x.scale ?? 1, x.scale ?? 1); if ((p.facing ?? 1) < 0) g.scale(-1, 1); g.rotate((p.lean ?? 0) + Math.sin(t * 2 + sd) * 0.01);
  if (x.cloak) cut(g, [[-tw / 2 - 4, shY], [tw / 2 + 4, shY], [tw / 2 + 12, hipY + 30], [-tw / 2 - 12, hipY + 30]], x.cloak, { seed: sd + 3, sort: "felt" });
  for (const s of [-1, 1]) { cut(g, rrectP(s * tw * 0.2 - 7, hipY + 8, 14, 62, 5), skin, { seed: sd + s, edge: 0.7 }); cut(g, rrectP(s * tw * 0.2 - 10 + s * 3, -11, 22, 11, 4), "#6E4426", { seed: sd + 5 + s, sort: "kraft" }); }
  const body: Pt[] = [[-tw / 2, shY], [tw / 2, shY], [tw / 2 + 8, hipY + 26], [-tw / 2 - 8, hipY + 26]];
  cut(g, body, tunic, { seed: sd + 10, sort: "felt", rim: 0.4 });
  if (x.toga) { const tg: Pt[] = [[-tw / 2 - 4, shY + 2], [-tw / 2 + 10, shY - 4], [tw / 2 + 10, hipY + 30], [tw / 2 - 12, hipY + 30]];
    cut(g, tg, "#FBF8F0", { seed: sd + 11, sort: "felt", rim: 0.5 }); strokeP(g, [[-tw / 2 + 4, shY - 2], [tw / 2 + 2, hipY + 28]], "#7B2D8E", 5); }
  if (x.armor) for (let i = 0; i < 5; i++) cut(g, rrectP(-tw / 2 - 2, shY + 6 + i * 9.5, tw + 4, 10, 2.5), i % 2 ? "#AEB6BE" : "#C3CAD1", { seed: sd + 20 + i, edge: 0.6, tear: 0.2 });
  if (x.vest) { // распахнутый жилет поверх (голого) торса: грудь и пресс карандашом
    strokeP(g, [[-tw * 0.32, shY + 22], [-4, shY + 26]], "rgba(120,70,40,0.45)", 1.6); strokeP(g, [[4, shY + 26], [tw * 0.32, shY + 22]], "rgba(120,70,40,0.45)", 1.6);
    for (let i = 0; i < 3; i++) strokeP(g, [[-7, shY + 34 + i * 9], [7, shY + 34 + i * 9]], "rgba(120,70,40,0.3)", 1.2); strokeP(g, [[0, shY + 30], [0, hipY - 4]], "rgba(120,70,40,0.3)", 1.2);
    for (const s2 of [-1, 1]) cut(g, [[s2 * tw / 2 + s2 * 2, shY - 2], [s2 * tw * 0.2, shY - 2], [s2 * tw * 0.3, hipY + 4], [s2 * tw / 2 + s2 * 8, hipY + 4]], x.vest, { seed: sd + 35 + s2, sort: "felt", rim: 0.4 });
  }
  cut(g, rrectP(-tw / 2 - 1, hipY - 2, tw + 2, 6, 2), "#6A4426", { seed: sd + 30, sort: "kraft" });
  arm(g, -tw / 2 + 2, shY + 5, -1, p.aL ?? [0.1, 0.1], 28, 26, 12, tunic, null, skin, sd + 40, p.holdL);
  g.save(); g.translate(0, shY - 10 - hr * 0.78); g.rotate(p.tilt ?? 0);
  cut(g, rectP(-6, hr * 0.6, 12, 10), skin, { seed: sd + 50, edge: 0.6 });
  for (const s of [-1, 1]) cut(g, ellP(s * hr * 0.97, 3, 4, 6, 14), skin, { seed: sd + 51 + s, edge: 0.6 });
  if (x.hat === "hood") cut(g, [...ellP(0, 0, hr * 1.25, hr * 1.22, 30, Math.PI * 0.9, Math.PI * 2.1), [hr * 1.2, hr * 1.1], [-hr * 1.2, hr * 1.1]], x.cloak ?? "#7A6A55", { seed: sd + 80, sort: "felt" }); // капюшон: задняя часть за лицом
  cut(g, ellP(0, 0, hr, hr, 40), skin, { seed: sd + 53, sort: "water" });
  clipTo(g, ellP(0, 0, hr, hr, 40), () => fillP(g, ellP(hr * 0.6, hr * 0.2, hr * 0.7, hr * 1.1, 30), "#000", 0.08));
  if (x.bald) { cut(g, [...ellP(0, 2, hr * 1.06, hr * 0.95, 30, Math.PI * 0.82, Math.PI * 1.18)], x.hair ?? "#4A3A2A", { seed: sd + 55, edge: 0.6 }); cut(g, [...ellP(0, 2, hr * 1.06, hr * 0.95, 30, -Math.PI * 0.18, Math.PI * 0.18)], x.hair ?? "#4A3A2A", { seed: sd + 56, edge: 0.6 });
    fillP(g, ellP(-hr * 0.3, -hr * 0.62, hr * 0.28, hr * 0.14, 16), "#FFFFFF", 0.85); }
  else if (x.hair) cut(g, [...ellP(0, -2, hr * 1.04, hr * 1.0, 30, Math.PI * 1.02, Math.PI * 1.98), [hr * 0.5, -hr * 0.5], [-hr * 0.5, -hr * 0.5]], x.hair, { seed: sd + 54, sort: "kraft", edge: 0.8 });
  face(g, { hr, skin, skinD: "#000", glasses: false, brow: x.hair ?? "#2A1E16", beard: x.beard }, p);
  if (x.bigBeard) { // Чёрная Борода: длинная борода с косичками и тлеющими фитилями
    const bc = x.beard ?? "#1A1614"; cut(g, [[-hr * 0.95, hr * 0.15], [-hr * 0.9, hr * 1.1], [-hr * 0.5, hr * 2.3], [0, hr * 2.6], [hr * 0.5, hr * 2.3], [hr * 0.9, hr * 1.1], [hr * 0.95, hr * 0.15], [hr * 0.55, hr * 0.62], [0, hr * 0.7], [-hr * 0.55, hr * 0.62]], bc, { seed: sd + 90, sort: "felt", edge: 1 });
    
    for (const k of [-0.5, 0, 0.5]) { strokeP(g, [[k * hr, hr * 1.4], [k * hr * 1.1, hr * 2.4]], "rgba(255,255,255,0.18)", 1.5); cut(g, rrectP(k * hr * 1.1 - 3, hr * 2.4, 6, 8, 2), "#C8352B", { seed: sd + 91, edge: 0.4 }); }
    const tt = p.t ?? 0; for (const [fx, fy] of [[-hr * 0.9, hr * 0.6], [hr * 0.95, hr * 0.5], [-hr * 0.6, hr * 1.8], [hr * 0.7, hr * 1.7]] as Pt[]) {
      strokeP(g, [[fx, fy], [fx * 1.25, fy - hr * 0.35]], "#8A6A40", 2); fillP(g, ellP(fx * 1.25, fy - hr * 0.35, 2.5, 2.5, 8), "#FF7A1A");
      for (let i = 0; i < 3; i++) { const u = (tt * 0.8 + i / 3 + fx * 0.01) % 1; fillP(g, ellP(fx * 1.25 + Math.sin(u * 6 + fx) * 6, fy - hr * 0.4 - u * hr * 1.6, 4 + u * 9, 4 + u * 8, 10), "#9A948C", 0.5 * (1 - u)); } }
  }
  if (x.hat === "galea") {
    const dome = [...ellP(0, -hr * 0.12, hr * 1.1, hr * 1.02, 30, Math.PI, Math.PI * 2), [hr * 1.12, -hr * 0.05], [-hr * 1.12, -hr * 0.05]] as Pt[];
    cut(g, dome, "#B79143", { seed: sd + 60, edge: 0.9, rim: 0.6 }); cut(g, rrectP(-hr * 1.16, -hr * 0.2, hr * 2.32, 5, 2), "#94742F", { seed: sd + 61, edge: 0.7 });
    const crest: Pt[] = []; for (let i = 0; i <= 10; i++) { const a = Math.PI * 1.12 + (i / 10) * Math.PI * 0.76; crest.push([Math.cos(a) * hr * 1.3, -hr * 0.12 + Math.sin(a) * hr * 1.4 - (i % 2) * 4]); } crest.push([0, -hr * 1.05]);
    cut(g, crest, "#3B2A20", { seed: sd + 62, edge: 0.8, sort: "kraft" });
  } else if (x.hat === "laurel") {
    for (let i = 0; i < 9; i++) { const a = Math.PI * 1.05 + (i / 8) * Math.PI * 0.9; g.save(); g.translate(Math.cos(a) * hr * 0.98, Math.sin(a) * hr * 0.9 - 4); g.rotate(a + 1.2); cut(g, ellP(0, 0, 3, 7, 12), "#6E8A3A", { seed: sd + 70 + i, edge: 0.5 }); g.restore(); }
  } else if (x.hat === "hood") cut(g, [...ellP(0, -hr * 0.42, hr * 1.14, hr * 0.78, 24, Math.PI, Math.PI * 2)], x.cloak ?? "#7A6A55", { seed: sd + 82, sort: "felt" }); // козырёк над лбом, лицо открыто
  else if (x.hat === "tricorn") { cut(g, [[-hr * 1.75, -hr * 0.35], [-hr * 0.9, -hr * 1.55], [0, -hr * 1.15], [hr * 0.9, -hr * 1.55], [hr * 1.75, -hr * 0.35], [0, -hr * 0.62]], "#1E1A17", { seed: sd + 83, sort: "felt", rim: 0.6 });
    strokeP(g, [[-hr * 1.75, -hr * 0.35], [0, -hr * 0.62], [hr * 1.75, -hr * 0.35]], "#D9B04A", 2.4); }
  else if (x.hat === "bandana") { cut(g, [...ellP(0, -hr * 0.3, hr * 1.05, hr * 0.85, 24, Math.PI, Math.PI * 2), [hr * 1.05, -hr * 0.2], [-hr * 1.05, -hr * 0.2]], "#C8352B", { seed: sd + 84, sort: "felt" }); cut(g, [[hr * 0.9, -hr * 0.4], [hr * 1.6, -hr * 0.1], [hr * 1.4, hr * 0.3]], "#C8352B", { seed: sd + 85, sort: "felt" }); }
  else if (x.hat === "cap") cut(g, [...ellP(0, -hr * 0.3, hr * 0.9, hr * 0.8, 24, Math.PI, Math.PI * 2), [hr * 0.9, -hr * 0.2], [-hr * 0.9, -hr * 0.2]], "#8C5A3A", { seed: sd + 81, sort: "felt" });
  g.restore();
  arm(g, tw / 2 - 2, shY + 5, 1, p.aR ?? [0.1, 0.1], 28, 26, 12, tunic, null, skin, sd + 44, p.holdR, p.holdR ? "fist" : "open");
  g.restore();
};

// ---------------------------------------------------------------- служебные: моргание, «говорение», жесты
export const blinkAt = (t: number, seed = 0) => ((Math.floor(t * 15) + seed * 37) % 52) < 2;
// громкость голоса → раскрытие рта. env — массив [t, amp] (из timings/огибающей); без него — по словам.
export const talkFromWords = (t: number, words: { s: number; e: number }[]) => {
  for (const w of words) if (t >= w.s && t < w.e) { const u = (t - w.s) / Math.max(0.05, w.e - w.s); return clamp(0.25 + 0.75 * Math.abs(Math.sin(u * Math.PI * Math.max(1, Math.round((w.e - w.s) * 6))))); }
  return 0;
};
// жест на каждую реплику: по номеру фразы выбираем позу рук
export const GESTURES: [number, number][][] = [
  [[0.12, 0.1], [0.12, 0.1]],   // руки вниз
  [[0.12, 0.1], [1.2, 0.9]],    // ладонь вперёд (объясняет)
  [[0.5, 1.6], [0.5, 1.6]],     // руки к груди
  [[1.9, 0.3], [1.9, 0.3]],     // руки вверх «ура/шок»
  [[0.12, 0.1], [2.2, -0.1]],   // указывает вверх
  [[0.9, 0.6], [0.12, 0.1]],    // пожимает плечом
];
