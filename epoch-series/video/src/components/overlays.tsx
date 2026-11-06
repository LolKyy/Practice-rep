// Инфографика «бумажными предметами» + HUD + субтитры. Всё рисуется на холсте той же бумагой (кромка, тень, фактура).
// Каждый компонент живёт внутри <Sequence>: время t = кадр/30 от его начала.
import React from "react";
import { useCurrentFrame } from "remotion";
import { CanvasArt } from "../engine/CanvasArt";
import { G, PAL, cut, rectP, rrectP, ellP, fillP, strokeP, tape, pencil, text, inkText, thread, rivet, rng, tear, Pt, clamp } from "../engine/paper";
import { FPS, spring, back, eo, keys } from "../engine/stage";

const useSecs = () => useCurrentFrame() / FPS;
const pop = (g: G, t: number, x: number, y: number, delay = 0, dur = 0.45) => { const s = spring((t - delay) / dur); g.translate(x, y); g.scale(Math.max(0.001, s), Math.max(0.001, s)); return s; };
const paperShadow = (g: G, on = true) => { if (on) { g.shadowColor = "rgba(60,36,12,0.35)"; g.shadowBlur = 18; g.shadowOffsetX = 8; g.shadowOffsetY = 12; } else g.shadowColor = "transparent"; };
// «Карандаш пишет»: текст проявляется слева направо
const handWrite = (g: G, s: string, x: number, y: number, size: number, p: number, color = "#2B2A33", align: CanvasTextAlign = "left") => {
  g.save(); g.font = `700 ${size}px "Caveat"`; const w = g.measureText(s).width; const x0 = align === "center" ? x - w / 2 : x;
  g.beginPath(); g.rect(x0 - 4, y - size, (w + 8) * clamp(p), size * 2); g.clip(); text(g, s, x0, y, size, color, "Caveat", 700, "left"); g.restore();
};

// ---------------------------------------------------------------- FactCallout: жёлтый стикер + стрелка-полоска к объекту
export const FactCallout: React.FC<{ text: string; x: number; y: number; to: [number, number]; rot?: number; delay?: number; w?: number }> = ({ text: s, x, y, to, rot = -0.04, delay = 0, w = 420 }) => {
  const t0 = useSecs();
  return <CanvasArt t0={0} draw={(g) => {
    const t = t0; if (t < delay) return; const k = spring((t - delay) / 0.5);
    // стрелка-полоска (бумажная лента) растёт от стикера к объекту
    const ax = x, ay = y + 50; const bx = ax + (to[0] - ax) * eo((t - delay - 0.15) / 0.35), by = ay + (to[1] - ay) * eo((t - delay - 0.15) / 0.35);
    const dx = bx - ax, dy = by - ay, L = Math.hypot(dx, dy);
    if (L > 4) { g.save(); paperShadow(g); g.translate(ax, ay); g.rotate(Math.atan2(dy, dx));
      cut(g, [[0, -7], [L - 26, -6], [L - 28, -18], [L, 0], [L - 28, 18], [L - 26, 6], [0, 7]], "#F4ECD6", { seed: 3, edge: 1.5, tear: 0.5 }); g.restore(); }
    g.save(); g.translate(x, y); g.rotate(rot + (1 - k) * 0.3); g.scale(k, k); paperShadow(g);
    g.font = '900 46px "Montserrat"'; const lines = s.toUpperCase().split("\n"); const tw = Math.max(w, ...lines.map((l) => g.measureText(l).width + 70)); const th = 40 + lines.length * 56;
    cut(g, rectP(-tw / 2, -th / 2, tw, th), PAL.sticky, { seed: 5, edge: 2.2, tear: 0.6, sort: "card", grain: 0.35 }); paperShadow(g, false);
    fillP(g, rectP(-tw / 2, -th / 2, tw, 16), "#E9C53A", 0.8); // клеевая полоса стикера
    lines.forEach((l, i) => inkText(g, l, 0, -th / 2 + 48 + i * 56, 44, PAL.ink));
    tape(g, -tw / 2 + 20, -th / 2 + 4, 80, -0.6);
    g.restore();
  }} />;
};

// ---------------------------------------------------------------- Ruler: бумажная линейка роста
export const Ruler: React.FC<{ x: number; top: number; bottom: number; cmTop: number; cmBottom?: number; marks: { cm: number; label: string; color?: string; dy?: number }[]; delay?: number }> = ({ x, top, bottom, cmTop, cmBottom = 0, marks, delay = 0 }) => {
  const t0 = useSecs();
  return <CanvasArt draw={(g) => {
    const t = t0 - delay; if (t < 0) return; const k = spring(t / 0.6);
    const H = (bottom - top) * k; const y0 = bottom - H; const px = (cm: number) => bottom - ((cm - cmBottom) / (cmTop - cmBottom)) * (bottom - top);
    g.save(); paperShadow(g); cut(g, rectP(x - 50, y0, 100, H), "#F1DDA0", { seed: 8, tear: 0.3, edge: 2, sort: "kraft" }); paperShadow(g, false);
    g.beginPath(); g.rect(x - 50, y0, 100, H); g.clip();
    for (let cm = Math.ceil(cmBottom / 5) * 5; cm <= cmTop; cm += 5) { const y = px(cm); const big = cm % 50 === 0; strokeP(g, [[x - 50, y], [x - 50 + (big ? 44 : cm % 10 === 0 ? 28 : 16), y]], PAL.ink, big ? 3 : 1.6); if (cm % 50 === 0) text(g, String(cm), x + 18, y, 24, PAL.ink, "JetBrains Mono", 700); }
    g.restore();
    marks.forEach((m, i) => { const mt = t - 0.5 - i * 0.35; if (mt < 0) return; const y = px(m.cm); const ly = y + (m.dy ?? 0); const kk = back(mt / 0.4);
      g.save(); strokeP(g, [[x + 50, y], [x + 150, y], [x + 50 + 40 * kk, ly]], m.color ?? PAL.scarf, 4); g.translate(x + 60 + 40 * kk, ly); paperShadow(g);
      g.font = '900 30px "Montserrat"'; const w = g.measureText(m.label).width + 30; cut(g, rectP(0, -26, w, 52), "#FBF7EC", { seed: 20 + i, edge: 1.8, tear: 0.5 }); paperShadow(g, false); inkText(g, m.label, w / 2, 0, 28, m.color ?? PAL.ink); g.restore(); });
  }} />;
};

// ---------------------------------------------------------------- PriceTag: ценник на верёвочке
export const PriceTag: React.FC<{ x: number; y: number; title: string; price: string; note?: string; delay?: number; rot?: number }> = ({ x, y, title, price, note, delay = 0, rot = 0.06 }) => {
  const t0 = useSecs();
  return <CanvasArt draw={(g) => {
    const t = t0 - delay; if (t < 0) return; const drop = keys(t, [[0, -900], [0.45, 0]], (u) => back(u, 1.4)); const sw = Math.sin(t * 4) * Math.exp(-t * 1.2) * 0.12;
    thread(g, x, -20, y + drop - 150, 0);
    g.save(); g.translate(x, y + drop - 150); g.rotate(rot + sw); paperShadow(g);
    const P: Pt[] = [[-200, 60], [-120, 0], [200, 0], [200, 300], [-120, 300], [-200, 240]];
    cut(g, P, "#F5E9CC", { seed: 30, edge: 2.5, sort: "kraft", tear: 0.7 }); paperShadow(g, false);
    g.save(); g.translate(-150, 150); fillP(g, ellP(0, 0, 14, 14, 16), "#6a5038"); fillP(g, ellP(0, 0, 9, 9, 16), "#2a2018"); g.restore();
    inkText(g, title.toUpperCase(), 40, 62, 36, PAL.ink); strokeP(g, [[-90, 95], [180, 95]], "rgba(30,26,23,0.35)", 2);
    inkText(g, price, 40, 165, 62, PAL.scarf); if (note) handWrite(g, note, 40, 245, 44, (t - 0.5) / 0.6, "#3B3A45", "center");
    g.restore();
  }} />;
};

// ---------------------------------------------------------------- CalendarCard: отрывной календарь
export const CalendarCard: React.FC<{ x: number; y: number; from: [string, string]; to: [string, string]; flipAt?: number; delay?: number; s?: number }> = ({ x, y, from, to, flipAt = 0.7, delay = 0, s = 1 }) => {
  const t0 = useSecs();
  return <CanvasArt draw={(g) => {
    const t = t0 - delay; if (t < 0) return; const k = spring(t / 0.5);
    g.save(); g.translate(x, y); g.scale(k * s, k * s); paperShadow(g);
    cut(g, rectP(-200, -250, 400, 500), "#FBF7EC", { seed: 40, edge: 2.5, tear: 0.4 }); paperShadow(g, false);
    cut(g, rectP(-200, -250, 400, 110), PAL.scarf, { seed: 41, edge: 1.5, tear: 0.3, sort: "felt" });
    for (let i = 0; i < 6; i++) rivet(g, -150 + i * 60, -238, 7);
    const page = (d: [string, string]) => { inkText(g, d[0].toUpperCase(), 0, -195, 40, "#FBF7EC"); inkText(g, d[1], 0, 40, d[1].length > 4 ? 110 : 170, PAL.ink); pencil(g, [[-160, 200], [160, 200]], 0.3); };
    const ft = t - flipAt;
    if (ft < 0) page(from); else {
      page(to);
      if (ft < 0.6) { // отрываемый лист улетает
        const u = eo(ft / 0.6); g.save(); g.translate(u * 260, -140 + u * 300); g.rotate(u * 0.9); g.globalAlpha = 1 - u * 0.6;
        cut(g, tear(rectP(-200, 0, 400, 390), 0.2, 6, 3).map(([a, b]) => [a, b] as Pt), "#FBF7EC", { seed: 42, edge: 2, tear: 0 });
        inkText(g, from[1], 0, 180, from[1].length > 4 ? 110 : 170, PAL.ink); g.restore();
      }
    }
    g.restore();
  }} />;
};

// ---------------------------------------------------------------- MapCard: карта на крафте с маршрутом пунктиром и «ТЫ ЗДЕСЬ»
export const MapCard: React.FC<{ title: string; route: [number, number][]; places?: { p: [number, number]; name: string }[]; delay?: number }> = ({ title, route, places = [], delay = 0 }) => {
  const t0 = useSecs();
  return <CanvasArt draw={(g) => {
    const t = t0 - delay; if (t < 0) return; const k = spring(t / 0.6);
    g.save(); g.translate(540, 820); g.rotate(-0.02); g.scale(k, k); paperShadow(g);
    cut(g, rectP(-440, -520, 880, 1040), "#C9A26E", { seed: 50, edge: 3, tear: 1.4, sort: "kraft", grain: 0.5 }); paperShadow(g, false);
    const r = rng(5); const coast: Pt[] = []; for (let i = 0; i < 40; i++) { const a = (i / 40) * 6.28; coast.push([Math.cos(a) * (260 + r() * 60) - 40, Math.sin(a) * (360 + r() * 50) + 40]); }
    cut(g, coast, "#DDBE86", { seed: 51, edge: 1.5, tear: 1.6, sort: "kraft" });
    pencil(g, [[-400, -300], [400, -300]], 0.15); pencil(g, [[-400, 300], [400, 300]], 0.15);
    inkText(g, title.toUpperCase(), 0, -455, 46, "#3B2A1A");
    const tr = clamp((t - 0.4) / 1.2); const n = Math.max(2, Math.floor(route.length * tr));
    g.save(); g.setLineDash([16, 14]); strokeP(g, route.slice(0, n).map(([a, b]) => [a - 540, b - 820] as Pt), PAL.scarf, 6); g.restore();
    places.forEach((pl) => { fillP(g, ellP(pl.p[0] - 540, pl.p[1] - 820, 10, 10, 12), "#3B2A1A"); text(g, pl.name, pl.p[0] - 540 + 18, pl.p[1] - 820, 30, "#3B2A1A", "Caveat", 700, "left"); });
    const [ex, ey] = route[n - 1]; g.save(); g.translate(ex - 540, ey - 820);
    cut(g, [[0, 0], [-22, -40], [22, -40]], PAL.scarf, { seed: 52, edge: 1.4, tear: 0 }); cut(g, ellP(0, -50, 26, 26, 20), PAL.scarf, { seed: 53, edge: 1.4 });
    if (tr >= 1) { cut(g, rectP(30, -110, 230, 56), "#FBF7EC", { seed: 54, edge: 1.5 }); inkText(g, "ТЫ ЗДЕСЬ", 145, -82, 34, PAL.ink); }
    g.restore(); g.restore();
  }} />;
};

// ---------------------------------------------------------------- Бирка на нитке (дубль «ДЕНЬ/ШАНС», или «ГОД • МЕСТО»)
export const Tag: React.FC<{ lines: string[]; x?: number; delay?: number; big?: boolean }> = ({ lines, x = 860, delay = 0, big = false }) => {
  const t0 = useSecs();
  return <CanvasArt draw={(g) => {
    const t = t0 - delay; if (t < 0) return; const drop = keys(t, [[0, -400], [0.5, 0]], (u) => back(u, 1.2)); const sw = Math.sin(t * 2.3) * 0.03;
    const fs = big ? 46 : 32; g.font = `700 ${fs}px "JetBrains Mono"`; const w = Math.max(...lines.map((l) => g.measureText(l).width)) + 60; const h = 30 + lines.length * fs * 1.25;
    const ty = (big ? 300 : 250) + drop; thread(g, x, -10, ty);
    g.save(); g.translate(x, ty); g.rotate(sw); paperShadow(g);
    cut(g, [[-w / 2, 16], [-w / 2 + 16, 0], [w / 2, 0], [w / 2, h], [-w / 2, h]], "#FBF7EC", { seed: 60, edge: 2, tear: 0.5 }); paperShadow(g, false);
    fillP(g, ellP(-w / 2 + 22, 20, 6, 6, 10), "#B9A882"); lines.forEach((l, i) => text(g, l, 0, 22 + fs * 0.75 + i * fs * 1.25, fs, i === 0 && big ? PAL.scarf : PAL.ink, "JetBrains Mono", 700));
    g.restore();
  }} />;
};

// ---------------------------------------------------------------- SurvivalNotebook: блокнот Сёмы (главная фишка)
// rows: значения ДО и ПОСЛЕ — старое зачёркивается карандашом, новое вписывается.
export type NoteRow = { label: string; from: string; to: string };
export const SurvivalNotebook: React.FC<{ rows: NoteRow[]; delay?: number; rewriteAt?: number; title?: string }> = ({ rows, delay = 0, rewriteAt = 0.8, title = "ЗАПИСКИ СЁМЫ" }) => {
  const t0 = useSecs();
  return <CanvasArt draw={(g) => {
    const t = t0 - delay; if (t < 0) return; const k = spring(t / 0.55);
    g.save(); g.translate(540, 700 + (1 - k) * 900); g.rotate(-0.035); paperShadow(g);
    // обложка-картон и лист в клетку
    cut(g, rrectP(-400, -380, 800, 760, 18), "#3E5A7A", { seed: 70, edge: 2.5, sort: "kraft", rim: 0.4 });
    cut(g, rectP(-370, -350, 740, 710), "#FBF8EF", { seed: 71, edge: 1.5, tear: 0.4, sort: "water" }); paperShadow(g, false);
    for (let x = -370; x < 370; x += 34) strokeP(g, [[x, -350], [x, 360]], "rgba(90,140,200,0.18)", 1); for (let y = -350; y < 360; y += 34) strokeP(g, [[-370, y], [370, y]], "rgba(90,140,200,0.18)", 1);
    strokeP(g, [[-300, -350], [-300, 360]], "rgba(200,53,43,0.45)", 2);
    for (let i = 0; i < 10; i++) { fillP(g, ellP(-340 + i * 76, -378, 9, 9, 12), "#2a2a2a"); strokeP(g, ellP(-340 + i * 76, -392, 9, 22, 14, Math.PI, Math.PI * 2), "#B8BCC4", 4); }
    handWrite(g, title, 0, -280, 62, (t - 0.2) / 0.5, "#2B2A33", "center");
    rows.forEach((r, i) => {
      const y = -160 + i * 160; text(g, r.label.toUpperCase(), -270, y, 40, PAL.ink, "Montserrat", 900, "left");
      const vx = 70; handWrite(g, r.from, vx, y + 60, 76, (t - 0.3 - i * 0.1) / 0.3);
      const st = t - rewriteAt - i * 0.25; // зачеркнул → написал
      if (st > 0 && r.from !== r.to) {
        g.save(); g.font = '700 76px "Caveat"'; const w = g.measureText(r.from).width; strokeP(g, [[vx - 6, y + 60], [vx - 6 + (w + 12) * clamp(st / 0.18), y + 52]], "#2B2A33", 6); g.restore();
        handWrite(g, r.to, vx + w + 40, y + 60, 84, (st - 0.2) / 0.35, i === rows.length - 1 ? PAL.scarf : "#2B2A33");
      }
    });
    // карандаш, который пишет (бегает к активной строке)
    const ai = Math.min(rows.length - 1, Math.max(0, Math.floor((t - rewriteAt) / 0.25))); const py = -160 + ai * 160 + 30 + Math.sin(t * 30) * 4;
    g.save(); g.translate(300 + Math.sin(t * 9) * 20, py); g.rotate(-0.7); cut(g, rectP(-9, -150, 18, 150), "#F2C230", { seed: 75, edge: 1, tear: 0.1 }); cut(g, [[-9, 0], [9, 0], [0, 26]], "#E9C9A3", { seed: 76, edge: 0.8, tear: 0 }); fillP(g, [[-3, 18], [3, 18], [0, 26]], PAL.ink); g.restore();
    tape(g, 330, -340, 120, 0.5, 26);
    g.restore();
  }} />;
};

// ---------------------------------------------------------------- ChoiceCard: «КУДА ДАЛЬШЕ?»
export const ChoiceCard: React.FC<{ options: { label: string; icon: string; color: string }[]; delay?: number }> = ({ options, delay = 0 }) => {
  const t0 = useSecs();
  return <CanvasArt draw={(g) => {
    const t = t0 - delay; if (t < 0) return; const k = spring(t / 0.5);
    g.save(); g.translate(540, 760); g.rotate(-0.015); g.scale(k, k); paperShadow(g);
    cut(g, rectP(-420, -470, 840, 940), "#FBF7EC", { seed: 80, edge: 3, tear: 0.6, sort: "water" }); paperShadow(g, false);
    cut(g, rectP(-420, -470, 840, 150), PAL.scarf, { seed: 81, edge: 1.5, tear: 0.5, sort: "felt" }); inkText(g, "КУДА ДАЛЬШЕ?", 0, -395, 70, "#FBF7EC");
    const all = [...options, { label: "СВОЙ ВАРИАНТ", icon: "+", color: "#9CCB7A" }];
    all.forEach((o, i) => { const tt = t - 0.3 - i * 0.18; if (tt < 0) return; const s = spring(tt / 0.4); const y = -230 + i * 170;
      g.save(); g.translate(0, y); g.scale(s, s); g.rotate((i % 2 ? 1 : -1) * 0.012); fillP(g, rrectP(-352, -54, 720, 132, 16), "rgba(60,36,12,0.25)");
      cut(g, rrectP(-360, -66, 720, 132, 16), "#F3EBD8", { seed: 82 + i, edge: 2, tear: 0.5 }); paperShadow(g, false);
      cut(g, ellP(-280, 0, 50, 50, 24), o.color, { seed: 90 + i, edge: 1.5, sort: "felt" }); inkText(g, o.icon, -280, 3, 46, "#FBF7EC");
      inkText(g, o.label.toUpperCase(), -200, 2, 46, PAL.ink, "Montserrat", 900, "left"); g.restore(); });
    tape(g, -360, -470, 120, -0.6, 28); tape(g, 360, -470, 120, 0.6, 28);
    g.restore();
  }} />;
};

// ---------------------------------------------------------------- Subtitles: бумажные полоски-караоке из timings.json
export type Word = { w: string; s: number; e: number; shot?: number };
export const Subtitles: React.FC<{ words: Word[]; keywords?: string[]; y?: number; perGroup?: number }> = ({ words, keywords = [], y = 1240, perGroup = 3 }) => {
  const t = useCurrentFrame() / FPS;
  // группы по 1–3 слова; разрыв на знаках препинания
  const groups: Word[][] = []; let cur: Word[] = [];
  words.forEach((w, i) => { cur.push(w); const nx = words[i + 1]; if (cur.length >= perGroup || /[.,!?—:]$/.test(w.w) || !nx || nx.s - w.e > 0.25) { groups.push(cur); cur = []; } });
  const g = groups.find((gr) => t >= gr[0].s - 0.05 && t < gr[gr.length - 1].e + 0.15);
  if (!g) return null;
  const clean = (s: string) => s.replace(/[.,!?:;«»"]/g, "").toUpperCase();
  const kwIdx = g.findIndex((w) => keywords.some((k) => clean(w.w).startsWith(k.toUpperCase())));
  const age = t - g[0].s; const s = 0.85 + 0.15 * spring(age / 0.25); const rot = ((g[0].s * 100) % 3 - 1) * 0.015;
  return (
    <div style={{ position: "absolute", left: 0, right: 0, top: y, display: "flex", justifyContent: "center", gap: 14, transform: `scale(${s}) rotate(${rot}rad)`, flexWrap: "wrap", padding: "0 90px", filter: "drop-shadow(0 0 3px #F6F1E4) drop-shadow(8px 12px 8px rgba(60,36,12,0.4))" }}>
      {g.map((w, i) => { const key = i === kwIdx; const on = t >= w.s - 0.02; const txt = clean(w.w); if (!txt || txt === "—") return null;
        return <span key={i} style={{ fontFamily: "Montserrat", fontWeight: 900, fontSize: 74, lineHeight: 1, padding: "14px 22px 12px", color: key ? "#FBF7EC" : PAL.ink,
          background: key ? PAL.scarf : "#FBF7EC", opacity: on ? 1 : 0.0,
          clipPath: "polygon(0% 4%, 6% 0%, 30% 3%, 55% 0%, 80% 2%, 100% 0%, 99% 50%, 100% 96%, 70% 100%, 40% 97%, 12% 100%, 0% 97%, 1% 50%)",
          transform: `rotate(${(i % 2 ? 1 : -1) * 1.2}deg) translateY(${on ? 0 : 20}px)` }}>{txt}</span>; })}
    </div>
  );
};
