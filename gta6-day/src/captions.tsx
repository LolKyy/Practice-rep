// Субтитры как в референсе: по одному слову, появление за 3 кадра (прозрачность + размытие + лёгкий «удар»),
// числа — цифрами, ключевые слова — красным свечением, мат — со звёздочкой.
import React from "react";
import { AbsoluteFill, useCurrentFrame } from "remotion";
import { WORDS, FPS } from "./timeline.js";

const norm = (s: string) => s.toLowerCase().replace(/ё/g, "е").replace(/[^\p{L}\p{N}\s-]/gu, "");
// [абзац, начала слов подряд, что показать]
const REPL: [number, string[], string][] = [
  [1, ["девятнадцатого", "ноября"], "19 НОЯБРЯ"],
  [2, ["каждый", "пятый"], "1 ИЗ 5"], [2, ["каждый", "третий"], "1 ИЗ 3"],
  [3, ["девятнадцатого"], "19-ГО"],
  [4, ["девятнадцатого"], "19"], [4, ["по", "двадцать", "седьмое"], "ПО 27"], [4, ["восемь", "утра"], "8:00"],
  [6, ["сорок", "лет"], "40 ЛЕТ"],
  [7, ["триста", "тысяч"], "300 000 ₽"],
  [9, ["один", "процент"], "1%"], [9, ["тридцать", "семь"], "37%"], [9, ["девяносто", "девять"], "99%"],
  [10, ["девяноста", "девяти"], "99%"], [10, ["четыре", "раза"], "×4"],
  [11, ["шесть", "утра"], "6:00"],
  [12, ["девятнадцатого"], "19-ГО?"],
];
const RED = ["19 ноября", "паузу", "1 из 5", "1 из 3", "больничный", "разрешение", "грипп", "машину", "нет", "телефона", "задержаны", "ковида",
  "вайс-сити", "обновление", "99%", "начальник", "отгул", "лайк", "40 лет", "300 000"];
const CENSOR: Record<string, string> = { "пиздец": "П*ЗДЕЦ" };

type Cap = { text: string; s: number; red: boolean };
let CAPS: Cap[] | null = null;
const build = (): Cap[] => {
  const out: Cap[] = [];
  for (let i = 0; i < WORDS.length; i++) {
    const w = WORDS[i];
    const rule = REPL.find(([p, st]) => p === w.p + 1 && st.every((x, k) => WORDS[i + k] && WORDS[i + k].p === w.p && norm(WORDS[i + k].w).startsWith(x)));
    let text: string;
    if (rule) { text = rule[2]; i += rule[1].length - 1; }
    else {
      const n = norm(w.w).trim();
      text = CENSOR[n] ?? w.w.replace(/[«»"“”.,:;!?…—–]/g, "").trim().toUpperCase();
    }
    if (!text) continue;
    const key = norm(text);
    out.push({ text, s: w.s, red: RED.some((r) => key.startsWith(r)) });
  }
  return out;
};

export const Captions: React.FC = () => {
  const f = useCurrentFrame();
  if (!CAPS) CAPS = build();
  const t = f / FPS;
  let k = -1;
  for (let i = 0; i < CAPS.length; i++) if (CAPS[i].s - 0.03 <= t) k = i;
  if (k < 0) return null;
  const c = CAPS[k];
  const next = CAPS[k + 1];
  const end = next ? Math.min(next.s - 0.03, c.s + 1.1) : c.s + 1.2;
  if (t > end) return null;
  const u = (t - c.s + 0.03) * FPS; // кадры с появления
  const a = Math.min(1, u / 3);
  const size = c.text.length > 11 ? Math.max(62, Math.round(96 * 11 / c.text.length)) : 96;
  return (
    <AbsoluteFill style={{ alignItems: "center", top: 1430, height: 200 }}>
      <div style={{
        fontFamily: "Rubik", fontWeight: 800, fontSize: size, letterSpacing: 1, color: c.red ? "#ff4848" : "#ffffff", whiteSpace: "nowrap",
        WebkitTextStroke: "14px #1a1020", paintOrder: "stroke fill", opacity: a, filter: `blur(${(1 - a) * 6}px)`,
        transform: `scale(${1.12 - 0.12 * a})`,
        textShadow: c.red ? "0 0 28px rgba(255,40,40,0.85), 0 6px 0 rgba(0,0,0,0.55)" : "0 6px 0 rgba(0,0,0,0.55), 0 0 22px rgba(0,0,0,0.35)",
      }}>{c.text}</div>
    </AbsoluteFill>
  );
};
