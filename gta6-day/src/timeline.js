// Общая шкала времени (секунды голоса): тайминги слов, начала абзацев, звуки.
// Используется и роликом (Video.tsx), и сведением звука (tools/build_audio.mjs).
export const FPS = 30;
let D = { words: [], paras: [], duration: 90 };
export let WORDS = [], NP = 0, START = [], TOTAL = 92;
export function setData(d) {
  D = d; NP = d.paras.length; TOTAL = +(d.duration + 1.6).toFixed(2);
  // склеенные выравнивателем куски («игры: Half-Life 3, RDR 3,») делим на слова, время — пропорционально длине
  WORDS = [];
  d.words.forEach((w, i) => {
    const toks = [];
    for (const t of w.w.split(/\s+/).filter(Boolean)) {
      if (toks.length && /^[\d«»"'.,:;!?…—–-]+$/.test(t)) toks[toks.length - 1] += " " + t; else toks.push(t);
    }
    const nx = d.words[i + 1] ? d.words[i + 1].s : w.e;
    const end = toks.length > 1 ? Math.max(w.e, nx - 0.05) : w.e;
    const len = toks.map((t) => t.replace(/[^\p{L}\p{N}]/gu, "").length + 1), tot = len.reduce((a, b) => a + b, 0);
    let acc = 0;
    toks.forEach((t, k) => { const s0 = w.s + ((end - w.s) * acc) / tot; acc += len[k]; WORDS.push({ w: t, p: w.p, s: +s0.toFixed(3), e: +(w.s + ((end - w.s) * acc) / tot).toFixed(3) }); });
  });
  START = Array.from({ length: NP }, (_, i) => (i === 0 ? 0 : Math.max(0, WORDS.find((w) => w.p === i).s - 0.12)));
}
const norm = (s) => s.toLowerCase().replace(/ё/g, "е");
// время слова: абзац (1..12, как в сценарии), начало слова, какое по счёту
export function wt(p, stem, occ = 0) {
  const ws = WORDS.filter((w) => w.p === p - 1 && norm(w.w).replace(/[^\p{L}\p{N}\s-]/gu, "").split(/\s+/).some((x) => x.startsWith(norm(stem))));
  const w = ws[occ] || ws[ws.length - 1];
  if (!w) throw new Error(`нет слова «${stem}» в абзаце ${p}`);
  return w.s;
}
export const ps = (p) => START[p - 1];                          // начало абзаца
export const pe = (p) => (p < NP ? START[p] : TOTAL);            // конец абзаца

// звуки (мягкие, синтез tools/sfx.py): [секунда, вид, громкость]
export function sfxList() {
  const L = [];
  const a = (t, k, v = 1) => L.push({ t: +t.toFixed(3), k, v });
  a(0.02, "riser", 0.4); a(wt(1, "выходит"), "ding"); a(wt(1, "паузу"), "stamp");
  a(wt(2, "ночь"), "whoosh", 0.6); a(wt(2, "приставка"), "swish"); a(wt(2, "чипсы"), "crunch"); a(wt(2, "каждый"), "pop"); a(wt(2, "каждый", 1), "pop");
  a(wt(3, "даже"), "whoosh", 0.6); a(wt(3, "многие"), "beep", 0.6); a(wt(3, "официальное"), "stamp");
  a(wt(4, "одна"), "bloop"); a(wt(4, "звонишь"), "beep", 0.7); a(wt(4, "кха"), "pff");
  a(wt(5, "англии"), "whoosh", 0.6); a(wt(5, "трясущиеся"), "tremble"); a(wt(5, "угнать"), "thud");
  a(wt(6, "приставки"), "swish"); a(wt(6, "сына", 1), "pff");
  a(wt(7, "пк"), "laser", 0.4); a(wt(7, "даты"), "thud");
  a(wt(8, "утро"), "whoosh", 0.6); a(wt(8, "задержаны"), "beep", 0.7); a(wt(8, "поезда"), "swish"); a(wt(8, "улицы"), "flutter"); a(wt(8, "закрыто"), "stamp");
  a(wt(9, "полночь"), "tick"); a(wt(9, "требуется"), "crunch"); ["один", "тридцать", "девяносто"].forEach((w) => a(wt(9, w), "beep", 0.6));
  a(wt(10, "чайник"), "puff"); a(wt(10, "кот"), "bloop"); a(wt(10, "вайс"), "flash", 0.6);
  a(wt(11, "выбегаешь"), "whoosh", 0.6); a(wt(11, "оборачивается"), "riser", 0.5); a(wt(11, "начальник"), "boom", 0.6); a(wt(11, "киваете"), "pop");
  a(wt(12, "а"), "riser", 0.4); a(wt(12, "лайк"), "pop");
  return L;
}
