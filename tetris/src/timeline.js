// Общая шкала времени (секунды голоса): тайминги слов, начала абзацев, звуки.
// Используется и роликом (Video.tsx), и сведением звука (tools/build_audio.mjs).
export const FPS = 30;
// реклама (правила CLOUDY): стоп-кадр ровно в середине ролика, баннер 1080×500 по центру, ускорен в 1.3 раза
export const AD_T = 44.45, AD_F = 161; // секунда стоп-кадра (пауза после «…принадлежат государству.»), длина баннера в кадрах
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
  a(0.02, "riser", 0.35); a(wt(1, "компьютер"), "pff");
  a(wt(2, "москва"), "whoosh", 0.6); a(wt(2, "вычислительный"), "tick"); a(wt(2, "молодой"), "beep", 0.5); a(wt(2, "графики"), "swish");
  a(wt(3, "пять"), "pop"); a(wt(3, "четыре"), "stamp", 0.7); a(wt(3, "фигуры"), "beep", 0.5); a(wt(3, "исчезают"), "ding");
  a(wt(4, "показывает"), "pop"); a(wt(4, "копируют"), "flutter"); a(wt(4, "носят"), "whoosh", 0.6);
  a(wt(5, "школьник"), "pop"); a(wt(5, "цветной"), "flash", 0.7);
  a(wt(6, "потом"), "whoosh", 0.6); a(wt(6, "венгрии"), "pop"); a(wt(6, "англии"), "pop"); a(wt(6, "америке"), "pop"); a(wt(6, "ещё"), "tremble");
  a(wt(7, "государству"), "stamp"); a(wt(7, "ничего"), "pff"); a(wt(7, "компьютер"), "ding");
  a(wt(8, "тысяча"), "whoosh", 0.6); a(wt(8, "три"), "tick"); a(wt(8, "одно"), "thud", 0.6);
  a(wt(9, "побеждает"), "boom", 0.6); a(wt(9, "игру"), "swish"); a(wt(9, "вместо"), "stamp", 0.6);
  a(wt(10, "больше"), "riser", 0.4); a(wt(10, "мир"), "flash", 0.6);
  a(wt(11, "автор"), "tick"); a(wt(11, "копейки"), "pff");
  a(wt(12, "возвращает"), "swish"); a(wt(12, "наконец"), "ding");
  a(wt(13, "алексей"), "riser", 0.4); a(wt(13, "тетрис"), "boom", 0.7);
  a(wt(14, "каждый"), "ding"); a(wt(14, "двенадцать"), "thud", 0.6);
  a(wt(15, "москве"), "stamp"); a(wt(15, "лайк"), "pop");
  return L;
}
