// Рисовалки декораций: комната Сёмы и фоны эпохи (Рим). Каждый план — отдельная функция, ставится в <Plane z=…>.
import { G, PAL, cut, rectP, rrectP, ellP, fillP, strokeP, tape, pencil, glue, cloud, leafy, thread, rng, Pt, rivet, text } from "../engine/paper";

// ======================= КОМНАТА (интро, светлый уютный кадр) =======================
export const room = {
  wall: (g: G) => {
    cut(g, rectP(-300, -300, 1680, 2500), "#F2DDB4", { tear: 0, noEdge: true, sort: "water", grain: 0.4 });
    for (let x = -260; x < 1400; x += 90) fillP(g, rectP(x, -300, 38, 2500), "#E9CFA0", 0.55); // обои-полоски
    // окно с городом
    cut(g, rectP(560, 260, 400, 520), "#FBF6EA", { seed: 3, edge: 3 });
    cut(g, rectP(585, 285, 350, 470), "#BFE3F2", { seed: 4, tear: 0.4, sort: "water" });
    for (let i = 0; i < 7; i++) { const h = 120 + ((i * 53) % 160); cut(g, rectP(590 + i * 50, 755 - h, 46, h), i % 2 ? "#9FB4C8" : "#B5C6D6", { seed: 10 + i, edge: 0.8 }); for (let k = 0; k < h / 30 - 1; k++) fillP(g, rectP(600 + i * 50, 770 - h + k * 28, 10, 12), "#F7E7A8", 0.8); }
    cloud(g, 700, 360, 120, 5); fillP(g, ellP(860, 340, 30, 30, 20), PAL.sun);
    strokeP(g, [[760, 285], [760, 755]], "#FBF6EA", 10); strokeP(g, [[585, 520], [935, 520]], "#FBF6EA", 10);
    // постер и полка
    cut(g, rectP(110, 330, 260, 340), "#4E9CC0", { seed: 20, edge: 2.5, sort: "kraft" }); fillP(g, ellP(240, 470, 70, 70, 30), PAL.sun); fillP(g, [[130, 640], [240, 520], [350, 640]], "#2E3A57");
    tape(g, 130, 335, 70, -0.5); tape(g, 350, 335, 70, 0.5); pencil(g, [[100, 700], [390, 700]], 0.25);
    glue(g, 470, 900, 30, 16, 2);
  },
  sofa: (g: G) => { // диван (задняя часть) — герой сидит перед ней
    cut(g, rrectP(120, 1020, 840, 330, 50), "#3E8F87", { seed: 30, sort: "felt", rim: 0.5 });
    for (const x of [140, 540]) cut(g, rrectP(x, 1060, 400, 250, 30), "#4BA59A", { seed: 31 + x, sort: "felt" });
  },
  sofaFront: (g: G) => { // сиденье и подлокотники — перекрывают ноги героя
    for (const x of [70, 900]) cut(g, rrectP(x, 1180, 120, 380, 44), "#357A73", { seed: 40 + x, sort: "felt", rim: 0.5 });
    cut(g, rrectP(150, 1340, 780, 230, 28), "#4BA59A", { seed: 45, sort: "felt" });
    for (const x of [230, 840]) cut(g, rectP(x, 1560, 26, 60), "#5A3A24", { seed: x });
  },
  floor: (g: G) => { cut(g, rectP(-300, 1520, 1680, 900), "#C79A64", { tear: 0, sort: "kraft", noEdge: true }); for (let y = 1560; y < 2300; y += 70) pencil(g, [[-300, y], [1380, y + 6]], 0.18, 1.2); cut(g, ellP(540, 1720, 520, 120, 40), "#D96A4A", { seed: 50, sort: "felt" }); },
  lamp: (g: G) => { // торшер на переднем плане (размыт)
    cut(g, rectP(-30, 600, 18, 1400), "#3A3A3A", { seed: 60 }); cut(g, [[-140, 440], [100, 440], [60, 620], [-100, 620]], "#F7D38A", { seed: 61, sort: "trace", alpha: 0.95 });
    fillP(g, ellP(-20, 640, 220, 160, 30), "rgba(255,230,160,0.35)");
  },
  plant: (g: G) => { for (let i = 0; i < 7; i++) { g.save(); g.translate(1060, 1950); g.rotate(-0.9 + i * 0.28); cut(g, ellP(0, -230, 52, 230, 24), i % 2 ? "#4E8A3C" : "#6FA84E", { seed: 70 + i, sort: "kraft" }); g.restore(); } },
};
// телефон в руке
export const phone = (g: G) => { g.save(); g.rotate(-0.25); cut(g, rrectP(-9, -14, 18, 30, 3), "#1E1A17", { seed: 2, edge: 0.6, tear: 0 }); fillP(g, rrectP(-7, -12, 14, 25, 2), "#6FD3D0"); fillP(g, rectP(-5, -8, 10, 3), "#fff", 0.8); fillP(g, rectP(-5, -3, 7, 3), "#fff", 0.6); g.restore(); };

// ======================= РИМ (EraBackground: лагерь/город/поле, смена времени суток) =======================
export type TOD = "day" | "gold" | "dusk" | "night";
export const SKY: Record<TOD, [string, string]> = { day: ["#9ED3EC", "#E6F4F1"], gold: ["#F2B872", "#FBE3B0"], dusk: ["#6E6AA8", "#F09A78"], night: ["#1D2A4A", "#3A4D78"] };
export const rome = {
  sky: (tod: TOD) => (g: G, t: number) => {
    const [a, b] = SKY[tod]; const gr = g.createLinearGradient(0, -200, 0, 1300); gr.addColorStop(0, a); gr.addColorStop(1, b);
    cut(g, rectP(-400, -400, 1880, 2700), gr as any, { tear: 0, noEdge: true, sort: "water", grain: 0.35 });
    // солнце на нитке
    const sx = 800, sy = 300 + Math.sin(t * 0.8) * 6; thread(g, sx, -400, sy - 90);
    cut(g, ellP(sx, sy, 95, 95, 40), tod === "night" ? "#F4F0DC" : PAL.sun, { seed: 1, sort: "water", edge: 3, rim: 0.4 });
  },
  clouds: (g: G, t: number) => { cloud(g, 230 + Math.sin(t * 0.5) * 8, 330, 300, 11, "#FFFFFF", 50); cloud(g, 980 + Math.sin(t * 0.4 + 2) * 8, 520, 240, 12, "#FBFBF6", 120); },
  hills: (g: G) => {
    const hill = (y: number, amp: number, col: string, seed: number) => { const p: Pt[] = [[-400, 2300]]; for (let x = -400; x <= 1500; x += 60) p.push([x, y - Math.sin(x / 260 + seed) * amp - Math.sin(x / 90 + seed * 2) * amp * 0.2]); p.push([1500, 2300]); cut(g, p, col, { seed, sort: "kraft", tear: 1.5, edge: 2.5 }); };
    hill(1000, 60, "#B9C98E", 2); hill(1080, 40, "#A3B978", 5);
    for (let i = 0; i < 6; i++) { const x = -150 + i * 260 + (i % 2) * 70; cut(g, rrectP(x - 5, 870 + (i % 3) * 30, 10, 140, 3), "#5A4A30", { seed: 80 + i }); cut(g, ellP(x, 830 + (i % 3) * 30, 26, 95, 20), "#5E7A3A", { seed: 90 + i, sort: "kraft" }); } // кипарисы
  },
  city: (g: G) => { // акведук и храм вдали
    for (let i = 0; i < 9; i++) { const x = -260 + i * 170; cut(g, rectP(x, 860, 150, 200), "#E7D5B0", { seed: 100 + i, sort: "kraft" }); fillP(g, [...ellP(x + 75, 960, 52, 70, 20, Math.PI, Math.PI * 2), [x + 127, 1065], [x + 23, 1065]], "#BFE0EE"); }
    cut(g, rectP(-300, 830, 1700, 34), "#D8C49A", { seed: 120, sort: "kraft" });
    // храм
    const tx = 760, ty = 980; cut(g, [[tx - 210, ty - 260], [tx, ty - 360], [tx + 210, ty - 260]], "#F1E6CC", { seed: 130, sort: "water", rim: 0.5 });
    for (let i = 0; i < 6; i++) cut(g, rectP(tx - 190 + i * 72, ty - 255, 26, 230), "#F6EEDB", { seed: 131 + i, edge: 1.2 }); cut(g, rectP(tx - 220, ty - 30, 440, 40), "#E7D5B0", { seed: 140 });
    text(g, "SPQR", tx, ty - 290, 34, "#9C7A2E", "Montserrat", 900);
  },
  camp: (g: G) => { // палатки-контубернии из кожи
    const tent = (x: number, y: number, s: number, seed: number) => { cut(g, [[x - 120 * s, y], [x, y - 140 * s], [x + 120 * s, y]], "#C9A16A", { seed, sort: "kraft", rim: 0.5 }); fillP(g, [[x - 26 * s, y], [x, y - 70 * s], [x + 26 * s, y]], "#6E4E2E"); strokeP(g, [[x, y - 140 * s], [x, y]], "rgba(80,50,20,0.3)", 2); };
    tent(170, 1260, 1.1, 1); tent(470, 1230, 0.85, 2); tent(980, 1270, 1.2, 3);
    // штандарт-аквила
    cut(g, rectP(330, 900, 10, 380), "#6A4426", { seed: 4 }); cut(g, [[300, 900], [335, 860], [370, 900], [335, 915]], "#D9B04A", { seed: 5, rim: 0.7 }); cut(g, rectP(300, 930, 70, 90), PAL.scarf, { seed: 6, sort: "felt" }); text(g, "LEG", 335, 965, 20, "#F3D58A");
  },
  ground: (tint = "#D9C08E") => (g: G) => { cut(g, rectP(-400, 1240, 1880, 1100), tint, { tear: 1, sort: "kraft", edge: 3 }); for (let i = 0; i < 40; i++) { const r = rng(i + 1); fillP(g, ellP(r() * 1500 - 200, 1300 + r() * 700, 10 + r() * 22, 5 + r() * 8, 12), "#B99B68", 0.6); } pencil(g, [[-100, 1330], [1200, 1310]], 0.15); },
  foreground: (g: G) => { // размытый передний план: трава и щит
    for (let i = 0; i < 14; i++) { g.save(); g.translate(-60 + i * 22, 2050); g.rotate(-0.5 + i * 0.07); cut(g, [[-12, 0], [0, -300 - (i % 3) * 60], [12, 0]], i % 2 ? "#6F9445" : "#86AC56", { seed: 200 + i }); g.restore(); }
    g.save(); g.translate(1030, 1700); g.rotate(0.15); cut(g, rrectP(-150, -260, 300, 520, 40), "#8E4A32", { seed: 210, sort: "felt", rim: 0.5 }); fillP(g, ellP(0, 0, 45, 45, 24), "#D9B04A"); rivet(g, 0, 0, 14); g.restore();
  },
};
