// Новые локации для ролика «День выхода GTA 6»: сцена Take-Two, поликлиника, магазин, комната ПК-бояра,
// аэропорт, вокзал, пустая улица, дверь офиса, кухня с чайником, круглосуточный магазин.
import React, { useMemo } from "react";
import * as THREE from "three";
import { Box, Cyl, Sign, Screen, Desk, Chair, Shelf, Plant, Lamp, Neon, Room, canvasTex, fitText, useSec, popAt, bonkAt, clamp, lerp, FONT, V3 } from "./kit";
import { rr, drawLogo, drawBg, drawStamp, drawButton, PINK, CYAN, YEL, RED, ORG, INK, Smoke, Web } from "./sets";

type Draw = (g: CanvasRenderingContext2D, s: number, W: number, H: number) => void;

// ------------------------------------------------------------------ экраны
// заставка: неоновый закат + логотип + «19 НОЯБРЯ»
export const titleDraw = (pause?: number): Draw => (g, s, W, H) => {
  const gr = g.createLinearGradient(0, 0, 0, H); gr.addColorStop(0, "#1A0B33"); gr.addColorStop(0.5, "#5B1A7A"); gr.addColorStop(0.85, "#E0457B"); gr.addColorStop(1, "#FF9A3C");
  g.fillStyle = gr; g.fillRect(0, 0, W, H);
  const r = H * 0.32, cx = W / 2, cy = H * 1.0; const sg = g.createLinearGradient(0, cy - r, 0, cy); sg.addColorStop(0, "#FFE14D"); sg.addColorStop(1, "#FF3BD4");
  g.fillStyle = sg; g.beginPath(); g.arc(cx, cy, r, Math.PI, 0); g.fill(); g.fillStyle = "#2B1055"; for (let i = 0; i < 5; i++) g.fillRect(cx - r, cy - r * 0.45 + i * r * 0.09, r * 2, 3 + i * 3);
  drawLogo(g, W, H, H * 0.42, H / 360);
  fitText(g, "19 НОЯБРЯ", W / 2, H * 0.78, W * 0.6, H * 0.12, YEL);
  if (pause !== undefined && s >= pause) { const k = popAt(s, pause, 0.3); g.save(); g.globalAlpha = 0.55 * Math.min(1, k); g.fillStyle = "#000"; g.fillRect(0, 0, W, H); g.restore();
    g.save(); g.translate(W / 2, H / 2); g.scale(k, k); g.fillStyle = "#fff"; g.fillRect(-W * 0.09, -H * 0.2, W * 0.06, H * 0.4); g.fillRect(W * 0.03, -H * 0.2, W * 0.06, H * 0.4); g.restore(); }
};
// предзагрузка / обновление: прогресс-бар по ключам [секунда, процент]
export const loadDraw = (title: string, keys: [number, number][], col = "#2fbf5f", sub?: string): Draw => (g, s, W, H) => {
  drawBg(g, W, H, "#0e0a1e", "#24124a");
  let v = keys[0][1]; for (let i = 0; i < keys.length; i++) if (s >= keys[i][0]) { const nx = keys[i + 1]; v = nx ? lerp(keys[i][1], nx[1], clamp((s - keys[i][0]) / Math.max(0.01, nx[0] - keys[i][0]) * 2.5)) : keys[i][1]; }
  fitText(g, title, W / 2, H * 0.26, W * 0.85, H * 0.13, "#fff");
  g.fillStyle = "#2a2440"; rr(g, W * 0.08, H * 0.48, W * 0.84, H * 0.12, H * 0.06); g.fill();
  g.fillStyle = col; rr(g, W * 0.08, H * 0.48, Math.max(H * 0.12, W * 0.84 * v / 100), H * 0.12, H * 0.06); g.fill();
  fitText(g, `${Math.floor(v)}%`, W / 2, H * 0.75, W * 0.5, H * 0.17, col);
  if (sub) fitText(g, sub, W / 2, H * 0.9, W * 0.8, H * 0.07, "#bbb");
};
// Вайс-Сити на мониторе
export const viceDraw: Draw = (g, s, W, H) => {
  const gr = g.createLinearGradient(0, 0, 0, H); gr.addColorStop(0, "#2a1458"); gr.addColorStop(0.6, "#ff4f9a"); gr.addColorStop(1, "#ffb347"); g.fillStyle = gr; g.fillRect(0, 0, W, H);
  g.fillStyle = "#ffe14d"; g.beginPath(); g.arc(W / 2, H * 0.72, H * 0.22, Math.PI, 0); g.fill();
  g.fillStyle = "#12081F"; for (let i = 0; i < 8; i++) { const bw = W / 8, bh = H * (0.25 + ((i * 37) % 30) / 100); g.fillRect(i * bw, H * 0.72 - bh, bw - 6, bh); }
  g.fillRect(0, H * 0.72, W, H * 0.28); g.strokeStyle = PINK; g.lineWidth = 3; for (let i = 0; i < 6; i++) { const y = H * 0.72 + ((i + (s * 0.8) % 1) / 6) ** 2 * H * 0.28; g.beginPath(); g.moveTo(0, y); g.lineTo(W, y); g.stroke(); }
  // пальмы
  for (const [x, sc] of [[W * 0.1, 1], [W * 0.9, 0.9]] as const) { g.save(); g.translate(x, H * 0.75); g.scale(sc * H / 900, sc * H / 900); g.strokeStyle = "#12081F"; g.lineWidth = 16; g.beginPath(); g.moveTo(0, 0); g.quadraticCurveTo(-20, -150, 0, -300); g.stroke();
    g.lineWidth = 18; g.lineCap = "round"; for (const a of [-70, -35, 0, 35, 70]) { const r1 = ((a - 90) * Math.PI) / 180; g.beginPath(); g.moveTo(0, -300); g.quadraticCurveTo(Math.cos(r1) * 100, -300 + Math.sin(r1) * 100 - 30, Math.cos(r1) * 180, -300 + Math.sin(r1) * 180 + 40); g.stroke(); } g.restore(); }
  fitText(g, "WELCOME TO VICE CITY", W / 2, H * 0.14, W * 0.8, H * 0.08, "#fff");
};
// карта «1 из 5 / 1 из 3»
export const mapDraw = (t3: number): Draw => (g, s, W, H) => {
  g.fillStyle = "#0e1a3a"; g.fillRect(0, 0, W, H);
  g.fillStyle = "#1d3a7a"; rr(g, W * 0.06, H * 0.18, W * 0.88, H * 0.6, 40); g.fill();
  fitText(g, "США", W * 0.5, H * 0.1, W * 0.3, H * 0.09, "#fff");
  const third = s >= t3;
  for (let i = 0; i < 40; i++) { const x = W * 0.1 + (i % 10) * W * 0.08 + W * 0.04, y = H * 0.27 + Math.floor(i / 10) * H * 0.12 + H * 0.05;
    const on = third ? i % 3 === 0 : i % 5 === 0; g.fillStyle = on ? RED : "#e6ecff"; g.beginPath(); g.arc(x, y - 14, 12, 0, 7); g.fill(); g.fillRect(x - 8, y, 16, 26); }
  fitText(g, third ? "МОЛОДЫЕ: 1 ИЗ 3" : "ОТПРОСИЛСЯ КАЖДЫЙ 5-Й", W / 2, H * 0.89, W * 0.9, H * 0.11, third ? YEL : "#fff");
};
// документ с печатью
export const paperDraw = (stampT: number): Draw => (g, s, W, H) => {
  g.fillStyle = "#f8f4e8"; g.fillRect(0, 0, W, H);
  fitText(g, "ОФИЦИАЛЬНОЕ", W / 2, H * 0.12, W * 0.8, H * 0.08, INK); fitText(g, "РАЗРЕШЕНИЕ", W / 2, H * 0.21, W * 0.8, H * 0.08, INK);
  g.fillStyle = "#c9c2b0"; for (let i = 0; i < 7; i++) g.fillRect(W * 0.12, H * (0.34 + i * 0.07), W * (0.76 - (i % 3) * 0.12), 8);
  fitText(g, "19 НОЯБРЯ МОЖНО НЕ РАБОТАТЬ", W / 2, H * 0.86, W * 0.85, H * 0.05, INK);
  if (s >= stampT) { const k = clamp((s - stampT) / 0.12), sc = lerp(2.2, 1, k); g.save(); g.translate(W * 0.55, H * 0.66); g.rotate(-0.2); g.scale(sc, sc); g.globalAlpha = k;
    g.strokeStyle = "#2f8f4f"; g.lineWidth = 10; rr(g, -W * 0.3, -H * 0.06, W * 0.6, H * 0.12, 12); g.stroke(); fitText(g, "ОДОБРЕНО", 0, 4, W * 0.5, H * 0.08, "#2f8f4f"); g.restore(); }
};
// календарь девушки 19–27
export const vacDraw: Draw = (g, s, W, H) => {
  g.fillStyle = "#fbf7ea"; g.fillRect(0, 0, W, H); g.fillStyle = RED; g.fillRect(0, 0, W, H * 0.16); fitText(g, "НОЯБРЬ", W / 2, H * 0.08, W * 0.6, H * 0.1, "#fff");
  for (let d = 1; d <= 30; d++) { const c = (d + 5) % 7, r = Math.floor((d + 5) / 7); const x = W * 0.07 + c * W * 0.127, y = H * 0.22 + r * H * 0.15;
    const on = d >= 19 && d <= 27; if (on) { g.fillStyle = "#ffd6e6"; g.fillRect(x - 4, y - 4, W * 0.12, H * 0.13); }
    fitText(g, String(d), x + W * 0.055, y + H * 0.06, W * 0.1, H * 0.07, on ? RED : INK); }
  g.strokeStyle = RED; g.lineWidth = 8; g.beginPath(); g.ellipse(W * 0.5, H * 0.66, W * 0.47, H * 0.2, 0, 0, Math.PI * 2 * clamp((s % 99) * 2)); g.stroke();
  fitText(g, "ОТПУСК! 🎮", W / 2, H * 0.94, W * 0.6, H * 0.07, RED);
};
// табло аэропорта / вокзала
export const boardDraw = (title: string, rows: [string, string][], status: string): Draw => (g, s, W, H) => {
  g.fillStyle = "#0a0d16"; g.fillRect(0, 0, W, H); g.fillStyle = "#ffd23f"; g.fillRect(0, 0, W, H * 0.16); fitText(g, title, W / 2, H * 0.08, W * 0.8, H * 0.11, INK);
  rows.forEach(([a, b], i) => { const y = H * (0.26 + i * 0.14); fitText(g, a, W * 0.18, y, W * 0.3, H * 0.08, "#fff"); fitText(g, b, W * 0.47, y, W * 0.3, H * 0.08, "#fff");
    const blink = Math.floor(s * 3 + i) % 2 === 0; fitText(g, status, W * 0.8, y, W * 0.34, H * 0.08, blink ? RED : "#7a1a1a"); });
};
// монитор ПК-бояра
export const pcDraw = (t: number): Draw => (g, s, W, H) => {
  drawBg(g, W, H, "#0a1a2a", "#123a5a");
  fitText(g, "GTA 6 · PC", W / 2, H * 0.22, W * 0.7, H * 0.14, "#fff");
  fitText(g, "ДАТА ВЫХОДА:", W / 2, H * 0.48, W * 0.7, H * 0.1, "#9fd8ff");
  const k = s >= t ? popAt(s, t, 0.3) : 1; g.save(); g.translate(W / 2, H * 0.72); g.scale(k, k); fitText(g, "НЕИЗВЕСТНА", 0, 0, W * 0.8, H * 0.18, RED); g.restore();
};

// ------------------------------------------------------------------ локации
// Сцена конференции: подиум, микрофон, экран «TAKE-TWO»
export const StageSet: React.FC<{ screen?: Draw }> = ({ screen }) => (<>
  <Room wall="#141a2e" floor="#20263c" wain="#10152a" ceil="#0a0d18" />
  <Box p={[0, 1.8, -1.97]} s={[4.2, 2.2, 0.06]} c="#05060a" />
  <Screen p={[0, 1.8, -1.92]} w={4.0} h={2.05} res={900} draw={screen ?? ((g, s, W, H) => { drawBg(g, W, H, "#0e1a3a", "#1d3a7a"); fitText(g, "TAKE-TWO", W / 2, H * 0.4, W * 0.7, H * 0.25, "#fff"); fitText(g, "INVESTOR DAY", W / 2, H * 0.68, W * 0.5, H * 0.1, CYAN); })} />
  <Box p={[0, 0.15, -0.8]} s={[4.5, 0.3, 1.6]} c="#2a2f45" />
  <Box p={[0.6, 0.85, -0.5]} s={[0.6, 1.1, 0.4]} c="#3a3f55" />
  <Cyl p={[0.6, 1.55, -0.45]} r={0.015} h={0.4} c="#222" /><mesh position={[0.6, 1.76, -0.42]}><sphereGeometry args={[0.05, 12, 10]} /><meshStandardMaterial color="#333" /></mesh>
  {[-1.8, 1.8].map((x) => <spotLight key={x} position={[x, 2.9, 1]} angle={0.5} penumbra={0.7} intensity={25} decay={1} color="#fff2d8" />)}
  <Lamp p={[0, 2.97, -0.6]} len={3} glow={1.1} />
</>);

// Лист бумаги на столе крупно
export const PaperSet: React.FC<{ draw: Draw }> = ({ draw }) => (<>
  <Box p={[0, -0.05, -1]} s={[6, 0.1, 6]} c="#5a3a2a" line={false} />
  <Screen p={[0, 0.01, -0.6]} rot={[-Math.PI / 2, 0, 0.08]} w={0.85} h={1.15} res={700} draw={draw} basic={false} glow={0.35} />
  <Cyl p={[0.6, 0.06, -0.9]} r={0.07} h={0.12} c="#ffffff" />
  <Box p={[-0.6, 0.02, -0.2]} s={[0.15, 0.02, 0.02]} c="#2f6fd6" line={false} rot={[0, 0.6, 0]} />
</>);

// Поликлиника
export const Clinic: React.FC = () => (<>
  <Room wall="#cfe6e0" floor="#9fb8c0" wain="#a8d0c8" ceil="#f0f4f2" />
  <Sign p={[0, 2.55, -1.97]} w={2.4} h={0.36} text="ПОЛИКЛИНИКА №19" bg="#2f8f8f" fg="#fff" glow={0.4} />
  <Sign p={[-1.9, 1.9, -1.97]} w={0.8} h={1.0} text="✚" bg="#ffffff" fg={RED} glow={0.3} sz={260} />
  <Screen p={[1.7, 1.75, -1.96]} w={1.2} h={0.9} res={400} basic={false} glow={0.35} draw={(g, s, W, H) => { g.fillStyle = "#fff"; g.fillRect(0, 0, W, H); fitText(g, "СИМПТОМЫ", W / 2, H * 0.14, W * 0.8, H * 0.12, RED);
    ["• красные глаза", "• трясутся руки", "• хочет угнать", "   машину"].forEach((t, i) => { g.font = `900 ${H * 0.09}px ${FONT}`; g.fillStyle = INK; g.textAlign = "left"; g.fillText(t, W * 0.08, H * (0.36 + i * 0.16)); }); }} />
  {[-2.4, -1.6, -0.8].map((x) => <Box key={x} p={[x, 0.45, -1.6]} s={[0.6, 0.08, 0.5]} c="#4a8fd6" />)}
  <Desk p={[1.6, 0, -1.3]} w={1.4} c="#e9eef0" />
  <Plant p={[2.6, 0, -1.6]} h={0.7} />
  <Lamp p={[0, 2.97, -0.3]} glow={1.3} />
</>);

// Магазин техники: пустые полки «PS5 — НЕТ»
export const Shop: React.FC = () => (<>
  <Room wall="#e9e6f2" floor="#c9c4d6" wain="#d6d0e6" ceil="#f4f2f8" />
  <Sign p={[0, 2.6, -1.97]} w={2.6} h={0.4} text="МИР ТЕХНИКИ" bg="#ffd23f" fg="#1a1020" glow={0.5} />
  {[-1.6, 0, 1.6].map((x, i) => <group key={i}>
    <Box p={[x, 1.0, -1.75]} s={[1.4, 2.0, 0.4]} c="#f8f8fb" />
    {[0.4, 0.95, 1.5].map((y) => <Box key={y} p={[x, y, -1.55]} s={[1.4, 0.04, 0.45]} c="#bfbccc" />)}
    <Sign p={[x, 1.2, -1.52]} w={1.0} h={0.3} text={i === 1 ? "PS5 — НЕТ" : "XBOX — НЕТ"} bg={RED} fg="#fff" glow={0.5} />
  </group>)}
  <Box p={[-1.6, 0.55, -1.55]} s={[0.3, 0.25, 0.25]} c="#ddd" />
  <Lamp p={[0, 2.97, -0.4]} len={3} glow={1.4} />
</>);

// Комната ПК-бояра: RGB, огромный системник
export const PcRoom: React.FC<{ mon: Draw }> = ({ mon }) => {
  const sec = useSec(); const hue = (sec * 60) % 360; const rgb = new THREE.Color().setHSL(hue / 360, 1, 0.5);
  return (<>
    <Room wall="#141020" floor="#1a1428" wain="#100c1a" ceil="#0a0814" />
    <mesh position={[0, 2.92, -1.93]}><boxGeometry args={[5.8, 0.05, 0.05]} /><meshBasicMaterial color={rgb.clone().multiplyScalar(2)} toneMapped={false} /></mesh>
    <Desk p={[0.2, 0, -1.4]} w={2.2} c="#1f1f2a" />
    <Box p={[0.2, 1.3, -1.75]} s={[1.6, 0.9, 0.06]} c="#0a0a0a" />
    <Screen p={[0.2, 1.3, -1.71]} w={1.5} h={0.82} res={900} draw={mon} />
    <Box p={[1.55, 1.25, -1.45]} s={[0.4, 0.95, 0.75]} c="#202030" />
    <mesh position={[1.34, 1.25, -1.45]}><boxGeometry args={[0.02, 0.85, 0.65]} /><meshBasicMaterial color={rgb.clone().multiplyScalar(1.6)} toneMapped={false} /></mesh>
    {[1.0, 1.25, 1.5].map((y) => <mesh key={y} position={[1.33, y, -1.45]}><circleGeometry args={[0.1, 20]} /><meshBasicMaterial color={new THREE.Color().setHSL(((hue + y * 90) % 360) / 360, 1, 0.55).multiplyScalar(1.8)} toneMapped={false} /></mesh>)}
    <Sign p={[-1.8, 1.9, -1.98]} w={1.1} h={0.5} text="RTX 9090" bg="#1a1a1a" fg="#3fff8f" glow={0.8} />
    <Box p={[-0.55, 0.82, -1.3]} s={[0.5, 0.04, 0.18]} c="#111" />
    <Neon p={[0.2, 0.79, -1.06]} s={[2.2, 0.02, 0.02]} col={PINK} k={1.6} />
    <Chair p={[0.2, 0, -0.6]} c="#d6304f" rotY={Math.PI} />
  </>);
};

// Аэропорт: табло рейсов
export const Airport: React.FC = () => (<>
  <Room wall="#d8dde6" floor="#a8b0c0" wain="#c0c8d6" ceil="#eef1f6" />
  <Box p={[0, 1.85, -1.97]} s={[4.2, 2.0, 0.06]} c="#05060a" />
  <Screen p={[0, 1.85, -1.92]} w={4.0} h={1.85} res={900} draw={boardDraw("ВЫЛЕТ / DEPARTURES", [["SU 1911", "МОСКВА"], ["AA 0666", "MIAMI"], ["LH 2026", "BERLIN"], ["EK 0019", "DUBAI"], ["BA 1119", "LONDON"]], "ЗАДЕРЖАН")} />
  <Sign p={[-2.3, 2.6, -1.97]} w={1.0} h={0.32} text="✈ GATE 6" bg="#2f6fd6" fg="#fff" glow={0.5} />
  {[-1.8, -0.9, 0, 0.9, 1.8].map((x) => <Box key={x} p={[x, 0.45, -0.9]} s={[0.7, 0.08, 0.5]} c="#3a4a6a" />)}
  <Lamp p={[0, 2.97, -0.3]} len={3} glow={1.3} />
</>);

// Вокзал: поезд + табло «ОПАЗДЫВАЕТ», в кабине записка
export const Station: React.FC = () => (<>
  <Box p={[0, -0.05, -2]} s={[14, 0.1, 10]} c="#6a6a78" line={false} />
  <Box p={[0, 1.6, -6]} s={[14, 3.2, 0.1]} c="#3a4a5a" />
  <Box p={[0, 0.75, -3.4]} s={[9, 1.5, 1.4]} c="#d64545" />
  <Box p={[0, 1.6, -3.4]} s={[9, 0.2, 1.4]} c="#f2f2f2" />
  {[-3.2, -1.6, 0, 1.6].map((x) => <Box key={x} p={[x, 1.0, -2.68]} s={[0.9, 0.55, 0.02]} c="#9fd0f0" e="#9fd0f0" ei={0.2} />)}
  <Box p={[3.4, 1.0, -2.68]} s={[0.9, 0.55, 0.02]} c="#9fd0f0" />
  <Sign p={[3.4, 0.95, -2.66]} w={0.6} h={0.28} text="УШЁЛ В GTA" bg="#fff" fg={RED} glow={0.3} />
  <Box p={[-2.5, 2.4, -1.8]} s={[2.6, 1.0, 0.08]} c="#05060a" />
  <Screen p={[-2.5, 2.4, -1.75]} w={2.5} h={0.92} res={700} draw={boardDraw("ПОЕЗДА", [["№ 19", "08:00"], ["№ 66", "09:30"], ["№ 06", "11:11"]], "ОПАЗДЫВАЕТ")} />
  <Cyl p={[-2.5, 1.2, -1.8]} r={0.05} h={2.4} c="#333" />
</>);

// Пустая улица: мигающий светофор, перекати-поле
export const EmptyStreet: React.FC<{ t0: number }> = ({ t0 }) => {
  const sec = useSec(); const u = sec - t0;
  return (<>
    <mesh position={[0, 7, -18]}><planeGeometry args={[50, 22]} /><meshBasicMaterial color="#9fc8e8" /></mesh>
    <Box p={[0, -0.05, -3]} s={[40, 0.1, 30]} c="#4a4a56" line={false} />
    <Box p={[0, 0.05, -4.2]} s={[40, 0.1, 2.2]} c="#a8a0b0" line={false} />
    {Array.from({ length: 12 }, (_, i) => <Box key={i} p={[-15 + i * 2.8, 0.01, -1.4]} s={[1.2, 0.02, 0.12]} c="#f2e6a0" line={false} shadow={false} />)}
    {[[-7.5, 5, "#e8a0b8"], [-3.2, 7, "#9fd0c9"], [1.4, 4.5, "#e8d0a0"], [6, 6.2, "#c0a8e8"]].map(([x, h, c], i) => <Box key={i} p={[x as number, (h as number) / 2, -8]} s={[4, h as number, 3]} c={c as string} />)}
    <group position={[1.6, 0, -3.3]}><Cyl p={[0, 1.4, 0]} r={0.06} h={2.8} c="#333" /><Box p={[0, 2.95, 0]} s={[0.35, 0.9, 0.3]} c="#222" />
      <mesh position={[0, 2.95, 0.16]}><circleGeometry args={[0.11, 20]} /><meshBasicMaterial color={new THREE.Color(YEL).multiplyScalar(Math.floor(sec * 2) % 2 ? 2 : 0.3)} toneMapped={false} /></mesh></group>
    <group position={[lerp(-4, 4, clamp(u / 3.2)), 0.35 + Math.abs(Math.sin(u * 5)) * 0.25, -1]} rotation={[0, 0, -u * 4]}>
      {Array.from({ length: 10 }, (_, i) => <mesh key={i} rotation={[i, i * 2, i * 3]}><torusGeometry args={[0.3, 0.02, 6, 16]} /><meshStandardMaterial color="#a8844a" /></mesh>)}
    </group>
  </>);
};

// Дверь офиса с табличкой
export const OfficeDoor: React.FC = () => (<>
  <Room wall="#8a9aaa" floor="#5a6070" wain="#6a7a8a" ceil="#d0d4d8" />
  <Box p={[0, 1.15, -1.95]} s={[1.3, 2.3, 0.1]} c="#7fb8d8" metal={0.3} r={0.2} />
  <Box p={[0, 2.38, -1.95]} s={[1.5, 0.16, 0.12]} c="#555" />
  <Screen p={[0, 1.35, -1.88]} w={0.95} h={0.62} res={500} basic={false} glow={0.4} draw={(g, s, W, H) => { g.fillStyle = "#fff"; g.fillRect(0, 0, W, H); g.strokeStyle = RED; g.lineWidth = 12; g.strokeRect(6, 6, W - 12, H - 12);
    fitText(g, "ЗАКРЫТО", W / 2, H * 0.3, W * 0.8, H * 0.22, RED); fitText(g, "МЫ В ВАЙС-СИТИ 🌴", W / 2, H * 0.68, W * 0.85, H * 0.14, INK); }} />
  <Sign p={[-1.6, 2.2, -1.97]} w={1.1} h={0.36} text="ООО «РАБОТА»" bg="#2a2f45" fg="#fff" glow={0.3} />
  <Plant p={[1.6, 0, -1.6]} h={0.8} />
  <Lamp p={[0, 2.97, -0.4]} glow={1.0} />
</>);

// Кухня: чайник с паром и счётчиком
export const Kitchen: React.FC<{ t0: number }> = ({ t0 }) => {
  const sec = useSec(); const n = Math.min(4, 1 + Math.floor((sec - t0) * 2.2));
  return (<>
    <Room wall="#e8d8b8" floor="#a88a6a" wain="#d8c4a0" ceil="#f4ecdc" />
    <Box p={[0, 0.45, -1.5]} s={[3.6, 0.9, 0.8]} c="#f4f0e8" /><Box p={[0, 0.92, -1.5]} s={[3.7, 0.05, 0.85]} c="#6a5a4a" />
    <group position={[0.2, 0.95, -1.4]}><Cyl p={[0, 0.17, 0]} r={0.17} h={0.34} c="#d64545" /><Box p={[0.22, 0.2, 0]} s={[0.1, 0.18, 0.04]} c="#222" /><Box p={[-0.2, 0.3, 0]} s={[0.12, 0.04, 0.04]} c="#d64545" /></group>
    <Smoke p={[-0.0, 1.35, -1.4]} t0={t0 - 1} n={10} col="#f4f4f4" size={0.6} />
    <Sign p={[1.2, 2.0, -1.97]} w={0.9} h={0.5} text={`×${n}`} bg="#1a1020" fg={YEL} glow={0.8} />
    <Box p={[-1.3, 1.9, -1.8]} s={[1.2, 0.7, 0.35]} c="#f4f0e8" />
    <Lamp p={[0, 2.97, -0.6]} glow={1.1} />
  </>);
};

// Котик (плоский, на канвасе) — уходит в дверь
export const Cat: React.FC<{ x0: number; x1: number; z: number; t0: number; d?: number }> = ({ x0, x1, z, t0, d = 1.6 }) => {
  const sec = useSec(); const u = clamp((sec - t0) / d);
  const tex = useMemo(() => canvasTex(256, 200, (g) => { g.fillStyle = "#ff9a3c"; g.strokeStyle = INK; g.lineWidth = 8;
    g.beginPath(); g.ellipse(120, 120, 80, 45, 0, 0, 7); g.fill(); g.stroke(); g.beginPath(); g.arc(190, 80, 40, 0, 7); g.fill(); g.stroke();
    g.beginPath(); g.moveTo(170, 50); g.lineTo(178, 22); g.lineTo(192, 46); g.fill(); g.stroke(); g.beginPath(); g.moveTo(200, 46); g.lineTo(215, 22); g.lineTo(222, 54); g.fill(); g.stroke();
    g.fillStyle = INK; g.beginPath(); g.arc(182, 78, 5, 0, 7); g.arc(205, 78, 5, 0, 7); g.fill();
    g.beginPath(); g.moveTo(40, 110); g.quadraticCurveTo(5, 60, 30, 30); g.stroke(); for (const x of [70, 100, 140, 165]) { g.beginPath(); g.moveTo(x, 155); g.lineTo(x, 190); g.stroke(); } }), []);
  return <mesh position={[lerp(x0, x1, u), 0.35 + Math.abs(Math.sin(sec * 12)) * 0.03, z]} scale={[x1 > x0 ? 1 : -1, 1, 1]}><planeGeometry args={[0.7, 0.55]} />
    <meshBasicMaterial map={tex} transparent alphaTest={0.5} side={THREE.DoubleSide} /></mesh>;
};

// Круглосуточный магазин: касса и гора энергетиков
export const Store24: React.FC = () => (<>
  <Room wall="#e8f0f0" floor="#b8c4c8" wain="#cfe0e0" ceil="#f4f8f8" />
  <Sign p={[0, 2.6, -1.97]} w={1.6} h={0.4} text="24 ЧАСА" bg="#3fb27f" fg="#fff" glow={0.6} />
  <Shelf p={[-2.2, 0, -1.6]} w={1.2} h={1.8} /><Shelf p={[2.2, 0, -1.6]} w={1.2} h={1.8} />
  <Box p={[0.3, 0.5, -0.9]} s={[1.6, 1.0, 0.6]} c="#2f6fd6" /><Box p={[0.3, 1.02, -0.9]} s={[1.7, 0.05, 0.65]} c="#e9eef8" />
  {Array.from({ length: 9 }, (_, i) => <Cyl key={i} p={[-0.2 + (i % 3) * 0.13, 1.12 + Math.floor(i / 3) * 0.2, -0.85]} r={0.05} h={0.18} c={["#3fff8f", "#2f2f2f", "#ffd23f"][i % 3]} />)}
  <Box p={[0.85, 1.15, -0.9]} s={[0.3, 0.22, 0.25]} c="#444" />
  <Lamp p={[0, 2.97, -0.4]} len={3} glow={1.4} />
</>);
