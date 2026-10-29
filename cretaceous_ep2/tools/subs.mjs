// Субтитры-полоски из script/voice.srt: время каждого сегмента делится по словам пропорционально слогам.
// DISPLAY — текст на экране для каждого сегмента srt; *слово — красная полоска; слово|N — вес (для цифр).
import fs from "node:fs";
const DISPLAY = [
  "тираннозавр в десяти метрах от тебя.", "и самое умное, что можно сделать...", "*ничего.",
  "палец лежит на спуске.", "Бугаев не отпускает твоё плечо и шепчет: пулемёт его свалит.", "а *дальше?",
  "выстрел слышно за километры.", "а 8|2 тонн свежего мяса — это приглашение для всего *леса.",
  "палеонтологи считают, что *нюх у тираннозавра был одним из лучших среди хищных", "динозавров.", "а у его соседей — не хуже.",
  "вспомни шашлык на даче.", "через 10|3 минут у забора собаки со всего *посёлка.",
  "рекс обнюхивает броню.", "солярка, металл, порох — это не еда.", "он фыркает...", "и *уходит.",
  "Бугаев вводит правила.", "ночуем в БТР|3, люки задраены.", "еду — в ящик, ящик — *подальше от машины.",
  "так делают туристы там, где водятся медведи: еду хранят метрах в *100|1 от палаток.",
  "воды осталось на *четыре дня.", "утром — к реке, которую ты нашёл на карте.", "пешком: солярку бережём.",
  "все спят.", "кроме *Петрова.",
  "тихий щелчок.", "запах тушёнки ползёт через *вентиляцию.",
  "ты открываешь глаза.", "снаружи тишина.", "слишком тихо: цикады *замолчали.",
  "в смотровой щели загораются глаза.", "пара.", "ещё пара.", "*ещё.",
  "а рация, которая молчала весь день, вдруг ожила.", "сквозь шум кто-то зовёт:", "есть кто *живой?",
  "что бы ты сделал *первым?",
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
