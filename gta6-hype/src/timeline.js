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
  a(0.02, "riser", 0.4); a(wt(1, "зря"), "thud", 0.7);
  a(wt(2, "пролог"), "ding"); a(wt(2, "рвануть"), "whoosh", 0.6); a(wt(2, "туфельке"), "pop"); a(wt(2, "все", 1), "swish");
  a(wt(2, "а"), "whoosh", 0.6); a(wt(2, "туфелька"), "bloop"); a(wt(2, "оправдает"), "pff");
  a(wt(3, "rockstar"), "whoosh", 0.6); a(wt(3, "журналисты"), "beep", 0.6); a(wt(3, "почти"), "pop"); a(wt(3, "а"), "riser", 0.4);
  a(wt(4, "хочешь"), "whoosh", 0.6); a(wt(4, "а"), "beep", 0.7); a(wt(4, "лицо"), "stamp", 0.6); a(wt(4, "одежду"), "stamp", 0.6); a(wt(4, "машину"), "stamp", 0.6);
  a(wt(4, "перевернул"), "thud"); a(wt(4, "обратно"), "tremble");
  a(ps(5) + 0.55, "boom", 0.5); a(wt(5, "запомнил"), "pop"); a(wt(5, "обиделся"), "pff");
  a(wt(6, "механики"), "tick"); a(wt(6, "заправь"), "swish"); a(wt(6, "сходи"), "swish"); a(wt(6, "поешь"), "crunch"); a(wt(6, "переешь"), "stamp"); a(wt(6, "лишнее"), "thud", 0.7);
  a(wt(7, "доедь"), "pop"); a(wt(7, "забери"), "pop"); a(wt(7, "убеги"), "pop");
  a(wt(8, "главное"), "whoosh", 0.6); a(wt(8, "тридцать"), "tremble"); a(wt(8, "даже"), "thud", 0.7);
  a(wt(9, "зато"), "flash", 0.6); a(wt(9, "тачки"), "swish"); a(wt(9, "стволы"), "swish"); a(wt(9, "плюшки"), "ding");
  a(wt(10, "вопросы"), "bloop"); a(wt(10, "увидим"), "riser", 0.4);
  a(wt(11, "переоценена"), "stamp"); a(wt(11, "комменты"), "pop");
  return L;
}
