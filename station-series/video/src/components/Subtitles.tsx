import React, { useMemo } from "react";
import { AbsoluteFill, interpolate, useCurrentFrame, useVideoConfig } from "remotion";
import { COLORS, FONTS, SAFE, VIDEO } from "../lib/theme";

export type TimedWord = { word: string; start: number; end: number };

export type SubtitlesProps = {
  /** Слова из timings.json (секунды). */
  words: TimedWord[];
  /** Ключевые слова, которые красим акцентом (без учёта регистра и пунктуации). */
  keywords?: string[];
  /** Сдвиг субтитров относительно начала композиции/секвенции (сек). */
  offset?: number;
  /** Максимум слов в группе (2–4). */
  maxWords?: number;
  /** Вертикальный центр блока субтитров (px). */
  centerY?: number;
  fontSize?: number;
  accent?: string;
};

const norm = (w: string) => w.toLowerCase().replace(/[^\p{L}\p{N}-]/gu, "");

type Group = { words: TimedWord[]; start: number; end: number; key: number };

/** Режем поток слов на группы по 2–4 слова: по знакам препинания, паузам и лимиту. */
export const groupWords = (words: TimedWord[], maxWords = 4, keywords: string[] = []): Group[] => {
  const kw = new Set(keywords.map(norm));
  const groups: Group[] = [];
  let cur: TimedWord[] = [];
  const flush = () => {
    if (!cur.length) return;
    // одно слово цветом: явное ключевое, иначе самое длинное
    let key = cur.findIndex((w) => kw.has(norm(w.word)));
    if (key < 0) {
      key = cur.reduce((best, w, i) => (norm(w.word).length > norm(cur[best].word).length ? i : best), 0);
    }
    groups.push({ words: cur, start: cur[0].start, end: cur[cur.length - 1].end, key });
    cur = [];
  };
  const SHORT = new Set(["в", "во", "с", "со", "и", "а", "но", "на", "к", "ко", "по", "за", "от", "до", "из", "у", "о", "об", "не", "ни", "что", "как", "для", "без", "под", "над", "при", "через"]);
  words.forEach((w, i) => {
    cur.push(w);
    const next = words[i + 1];
    const punct = /[.!?…,:;—]$/.test(w.word.trim());
    const gap = next ? next.start - w.end : 0;
    const chars = cur.reduce((n, x) => n + x.word.length + 1, 0) + (next ? next.word.length : 0);
    const long = cur.length >= maxWords || chars > 22; // одна строка (макс. две) при 84 px
    // не оставляем одинокое слово, если можно подождать
    // не оставляем предлог/союз висеть в конце строки — он уйдёт в следующую группу
    const dangling = !punct && next && cur.length > 1 && SHORT.has(norm(w.word));
    if (dangling && long) {
      cur.pop();
      flush();
      cur.push(w);
      return;
    }
    if ((punct && cur.length >= 1) || gap > 0.45 || long || !next) flush();
  });
  return groups;
};

export const Subtitles: React.FC<SubtitlesProps> = ({
  words,
  keywords = [],
  offset = 0,
  maxWords = 4,
  centerY = 1290, // 62–72% высоты кадра (библия «ХАРОН», раздел 12)
  fontSize = 84,
  accent = COLORS.accent,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const t = frame / fps - offset;
  const groups = useMemo(() => groupWords(words, maxWords, keywords), [words, maxWords, keywords]);

  // группа держится до старта следующей (но не дольше 0.6 с после последнего слова)
  const idx = groups.findIndex((g, i) => {
    const until = Math.min(groups[i + 1]?.start ?? Infinity, g.end + 0.6);
    return t >= g.start - 0.05 && t < until;
  });
  if (idx < 0) return null;
  const g = groups[idx];
  const appear = interpolate(t, [g.start - 0.05, g.start + 0.1], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const width = VIDEO.width - SAFE.left - SAFE.right + 20;

  return (
    <AbsoluteFill style={{ pointerEvents: "none" }}>
      <div
        style={{
          position: "absolute",
          left: SAFE.left,
          width,
          top: centerY,
          translate: `0px ${-50 + (1 - appear) * 12}%`,
          opacity: appear,
          display: "flex",
          flexWrap: "wrap",
          justifyContent: "center",
          alignItems: "baseline",
          columnGap: fontSize * 0.28,
          rowGap: 0,
          fontFamily: FONTS.sub,
          fontWeight: 900,
          fontSize,
          lineHeight: 1.08,
          textTransform: "uppercase",
          textAlign: "center",
        }}
      >
        {g.words.map((w, i) => {
          const active = t >= w.start - 0.03 && t < (g.words[i + 1]?.start ?? g.end + 0.6);
          const spoken = t >= w.start - 0.03;
          // активное слово крупнее: меняем размер шрифта (а не scale), чтобы соседние слова раздвигались
          const pop = interpolate(t, [w.start - 0.03, w.start + 0.07, w.start + 0.18], [1, 1.16, 1.12], {
            extrapolateLeft: "clamp",
            extrapolateRight: "clamp",
          });
          const isKey = i === g.key;
          return (
            <span
              key={i}
              style={{
                display: "inline-block",
                color: isKey ? accent : COLORS.text,
                opacity: spoken ? 1 : 0.55,
                fontSize: active ? fontSize * pop : fontSize,
                WebkitTextStroke: `${Math.round(fontSize * 0.09)}px #000`,
                paintOrder: "stroke fill",
                textShadow: `0 ${fontSize * 0.06}px 0 rgba(0,0,0,0.85), 0 0 ${fontSize * 0.3}px rgba(0,0,0,0.6)`,
              }}
            >
              {w.word.replace(/[,.;:]+$/, "")}
            </span>
          );
        })}
      </div>
    </AbsoluteFill>
  );
};
