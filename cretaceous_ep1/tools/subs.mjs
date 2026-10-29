// Субтитры-полоски из script/voice.srt: время каждого сегмента делится по словам пропорционально слогам.
// DISPLAY — текст на экране для каждого сегмента srt; *слово — красная полоска; слово|N — вес (для цифр).
import fs from "node:fs";
const DISPLAY = [
  "ты уснул в БТР|3 на учениях.", "а проснулся...", "на 66|5 млн|3 лет *раньше.",
  "ночью над полигоном полыхнула зелёная *вспышка.", "утром вместо степи папоротники выше *брони.", "и жара, как в *бане.",
  "сержант Бугаев решает: *заблудились.", "Петров, *заводи.", "найдём дорогу.", "и вы час ломитесь через лес, сжигая *солярку.",
  "Лисицын крутит рацию.", "на всех частотах *тишина.", "GPS|3 ищет спутники, которых ещё *нет.",
  "и ты делаешь то, что надо было сделать сразу.", "считаешь *запасы.", "сухпайков *40.|2", "на четверых это *10|2 дней.",
  "воды 4|2 канистры по 20|3 литров.", "в такую жару нужно 3–4|5 литра на человека в день.", "значит, воды хватит...", "дней на *пять.",
  "солярки полный бак.", "это около *600|3 километров по трассе.", "только трасс тут *нет.",
  "пулемёт.", "4|2 автомата.", "и ящик *тушёнки, который Петров тайком спрятал под сиденьем.",
  "над лесом проходит *тень.", "крылья как у дельтаплана.", "это не *птица.",
  "и тут до тебя доходит, почему здесь нет *дорог.", "первую построят...", "через 66|5 млн|3 *лет.",
  "Бугаев глушит двигатель.", "правило первое: беречь *солярку.", "правило второе: не *шуметь.",
  "земля *вздрагивает.", "ещё раз.", "*шаги.",
  "из папоротников поднимается голова размером с *холодильник.", "ты уже за пулемётом.", "а сержант шепчет: не *стреляй.",
  "а ты бы *выстрелил?",
];
const ts = (s) => { const [h, m, r] = s.split(":"); return +h * 3600 + +m * 60 + parseFloat(r.replace(",", ".")); };
const srt = fs.readFileSync("script/voice.srt", "utf8").trim().split(/\n\s*\n/).map((b) => { const l = b.split("\n"); const [a, c] = l[1].split(" --> "); return { s: ts(a), e: ts(c) }; });
if (srt.length !== DISPLAY.length) throw new Error(`srt ${srt.length} != display ${DISPLAY.length}`);
const vow = (w) => Math.max(1, (w.toLowerCase().match(/[аеёиоуыэюяaeiou]/g) || []).length);
const groups = [];
srt.forEach((seg, i) => {
  const ws = DISPLAY[i].split(/\s+/).map((raw) => { const [tx, wt] = raw.split("|"); const hl = tx.startsWith("*"); const t = tx.replace("*", "").toUpperCase(); return { t, hl, wt: wt ? +wt : vow(t) + 0.4 }; });
  const tot = ws.reduce((a, w) => a + w.wt, 0); let acc = seg.s;
  ws.forEach((w) => { w.s = +acc.toFixed(3); acc += ((seg.e - seg.s) * w.wt) / tot; });
  // группы по 1–3 слова: ≤ 16 букв, разрыв после знаков препинания
  let cur = [];
  ws.forEach((w, k) => {
    cur.push(w); const len = cur.reduce((a, x) => a + x.t.length, 0);
    const next = ws[k + 1];
    if (!next || /[.,:!?…]$/.test(w.t) || cur.length >= 3 || len + (next?.t.length ?? 0) > 17) {
      groups.push({ s: cur[0].s, e: next ? next.s : seg.e + 0.25, words: cur.map((x) => ({ t: x.t, hl: x.hl, s: x.s })) }); cur = [];
    }
  });
});
for (let i = 0; i < groups.length - 1; i++) groups[i].e = Math.min(Math.max(groups[i].e, groups[i].s + 0.3), groups[i + 1].s);
fs.writeFileSync("src/subs.json", JSON.stringify(groups));
console.log(groups.length, "групп; конец голоса", srt[srt.length - 1].e);
