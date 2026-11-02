// Субтитры-полоски: слова сценария (script/voice_display.txt, *слово — красное) ← время из распознавания (script/words_full.json).
import fs from "node:fs";
const disp = fs.readFileSync("script/voice_display.txt", "utf8").replace(/[«»"]/g, "").split("\n").filter(Boolean);
const asr = JSON.parse(fs.readFileSync("script/words_full.json", "utf8"));
const norm = (w) => w.toLowerCase().replace(/ё/g, "е").replace(/[^\p{L}\p{N}]/gu, "");
const NUM = { "40": "сорок", "13": "тринадцать", "7": "семь" };
const mine = [];
disp.forEach((line, li) => line.replace(/\s[—–-]\s/g, " ").split(/\s+/).filter(Boolean).forEach((raw) => { const hl = raw.startsWith("*"); const t = raw.replace("*", ""); mine.push({ t: t.toUpperCase(), hl, key: norm(NUM[t.replace(/[^\d]/g, "")] ?? t), line: li }); }));
const sim = (a, b) => { if (!a || !b) return 0; if (a === b) return 1; let k = 0; while (k < Math.min(a.length, b.length) && a[k] === b[k]) k++; return k >= 3 ? 0.7 : 0; };
const n = mine.length, m = asr.length, D = Array.from({ length: n + 1 }, () => new Float64Array(m + 1)), B = Array.from({ length: n + 1 }, () => new Int8Array(m + 1));
for (let i = 1; i <= n; i++) { D[i][0] = -0.4 * i; B[i][0] = 1; } for (let j = 1; j <= m; j++) { D[0][j] = -0.4 * j; B[0][j] = 2; }
for (let i = 1; i <= n; i++) for (let j = 1; j <= m; j++) { const s = sim(mine[i - 1].key, norm(asr[j - 1].t)); const c = [D[i - 1][j - 1] + (s > 0 ? s : -0.6), D[i - 1][j] - 0.4, D[i][j - 1] - 0.4]; const k = c.indexOf(Math.max(...c)); D[i][j] = c[k]; B[i][j] = k; }
const at = new Array(n).fill(null), en = new Array(n).fill(null);
for (let i = n, j = m; i > 0 || j > 0;) { const k = B[i][j]; if (i > 0 && j > 0 && k === 0) { if (sim(mine[i - 1].key, norm(asr[j - 1].t)) > 0) { at[i - 1] = asr[j - 1].s; en[i - 1] = asr[j - 1].e; } i--; j--; } else if (i > 0 && (j === 0 || k === 1)) i--; else j--; }
for (let i = 0; i < n; i++) if (at[i] == null) { let a = i - 1; while (a >= 0 && at[a] == null) a--; let b = i + 1; while (b < n && at[b] == null) b++; const ta = a >= 0 ? at[a] : 0, tb = b < n ? at[b] : asr[m - 1].e; at[i] = ta + ((tb - ta) * (i - a)) / (b - a); en[i] = at[i] + 0.3; }
const groups = []; let cur = [];
mine.forEach((w, k) => { cur.push({ t: w.t, hl: w.hl, s: +at[k].toFixed(2) }); const len = cur.reduce((a, x) => a + x.t.length, 0), nx = mine[k + 1];
  if (!nx || /[.,:!?…]$/.test(w.t) || cur.length >= 3 || len + (nx?.t.length ?? 0) > 17 || nx.line !== w.line) { groups.push({ s: cur[0].s, e: nx ? +at[k + 1].toFixed(2) : +(en[k] + 0.4).toFixed(2), words: cur }); cur = []; } });
for (let i = 0; i < groups.length - 1; i++) groups[i].e = Math.min(Math.max(groups[i].e, groups[i].s + 0.3), groups[i + 1].s, groups[i].words[groups[i].words.length - 1].s + 1.6);
fs.writeFileSync("src/subs.json", JSON.stringify(groups));
const miss = at.filter((x, i) => en[i] === x + 0.3).length;
console.log(groups.length, "групп; слов", n, "; без точного времени", miss);
