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
  a(0.02, "riser", 0.4); a(wt(1, "перенесли"), "stamp"); a(wt(1, "что"), "whoosh", 0.6);
  a(wt(2, "без"), "tick", 0.8); a(wt(2, "палец"), "click"); a(wt(2, "полночь", 1), "beep"); a(wt(2, "дата"), "flash", 0.7);
  ["сто", "тысяча", "десять"].forEach((w) => a(wt(3, w), "ding", 0.8)); a(wt(3, "задымится"), "puff");
  a(wt(4, "новости"), "whoosh", 0.7); a(wt(4, "rockstar"), "beep", 0.6); a(wt(4, "конец"), "boom", 0.6);
  a(wt(5, "директор"), "swish"); a(wt(5, "подождут"), "pop"); a(wt(5, "никто"), "bul", 0.6);
  a(wt(6, "один"), "pop"); a(wt(6, "десять"), "pop"); a(wt(6, "сотни"), "flutter"); a(wt(6, "сколько"), "tick"); a(wt(6, "понятно"), "pff");
  a(wt(7, "игроки"), "whoosh", 0.6); a(wt(7, "миллион"), "cash"); a(wt(7, "два"), "cash"); a(wt(7, "сервер"), "strain"); a(wt(7, "пощады"), "puff");
  a(wt(8, "освободившийся"), "swish"); a(wt(8, "half"), "pop"); a(wt(8, "rdr"), "pop"); a(wt(8, "ведьмак"), "pop"); a(wt(8, "наша"), "bul");
  a(wt(9, "инвесторам"), "whoosh", 0.6); a(wt(9, "упали"), "thud"); a(wt(9, "десять"), "boom", 0.5); a(wt(9, "третий"), "stamp");
  a(wt(10, "двадцать"), "flash", 0.5); a(wt(10, "тридцатый"), "flash", 0.5); a(wt(10, "сороковой"), "flash", 0.5); a(wt(10, "подождут"), "pop");
  a(wt(11, "уведомление"), "ding"); a(wt(11, "вышла"), "cash"); a(wt(11, "дрожащей"), "tremble"); a(wt(11, "требуется"), "crunch"); a(wt(11, "ну"), "pff");
  a(wt(12, "а"), "riser", 0.4); a(wt(12, "пиши"), "pop");
  return L;
}
