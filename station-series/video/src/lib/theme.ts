// Единая тема сериала. Акцентный цвет — один на весь сериал (см. bible/DECISIONS.md).
export const COLORS = {
  bg: "#06080C", // почти чёрный космос
  bg2: "#0C1118", // переборки, дальний план
  panel: "#111820", // плашки HUD / карточки
  panelEdge: "#24303C",
  line: "#3A4A58", // контуры, схемы
  text: "#E8EEF2",
  textDim: "#8A9AA8",
  accent: "#FF3B2F", // ЕДИНСТВЕННЫЙ акцент: тревожный красный (временно, можно сменить)
  ok: "#7CFFB2", // зелень мониторов (только внутри экранов-улик)
  shadow: "rgba(0,0,0,0.55)",
} as const;

export const FONTS = {
  mono: "JetBrains Mono", // HUD, мониторы, журналы
  title: "Oswald", // заголовки, ПРАВИЛО №N
  sub: "Montserrat", // караоке-субтитры
  ui: "Inter", // выноски, подписи
} as const;

export const VIDEO = { width: 1080, height: 1920, fps: 30 } as const;

// Безопасная зона под интерфейс Shorts/Reels/TikTok (в пикселях кадра 1080×1920).
export const SAFE = {
  top: 160, // статус-бар/поиск
  bottom: 420, // описание, ник, музыка
  left: 60,
  right: 140, // колонка лайков/комментов (нижняя половина)
} as const;

// Значение, которое может меняться во времени: число или ключи по секундам.
export type Track = number | { at: number[]; values: number[] };
