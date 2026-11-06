// Зоны кадра «ХАРОНА» (1080×1920). Каждый текстовый элемент живёт в СВОЕЙ зоне — так ничего не наезжает.
//   HUD        Y 160–640   по бокам (таймер, кислород, °C, схема, сканер)
//   CONTENT    Y 660–1010  плашки, штампы, титры, выноски — свободная зона для текста
//   COMM       Y 1030–1150 окно связи Хорунжего (слева, X 60–460)
//   SUBS       Y 1190–1390 караоке-субтитры (центр Y 1290)
//   UNSAFE     Y > 1500    интерфейс TikTok/Shorts — ничего важного
export const ZONES = {
  hud: { top: 160, bottom: 640 },
  content: { top: 660, bottom: 1010 },
  comm: { top: 1030, bottom: 1150, left: 60, right: 460 },
  subs: { top: 1190, bottom: 1390, center: 1290 },
  unsafe: { top: 1500 },
} as const;

/** Запрещённая для плашек полоса (окно связи + субтитры). */
export const NO_TEXT_BAND = { top: ZONES.comm.top - 10, bottom: ZONES.subs.bottom + 40 };

/** Если блок высотой h, поставленный на top, задевает запрещённую полосу — поднимаем его над ней. */
export const safeTop = (top: number, h: number) => {
  const overlaps = top < NO_TEXT_BAND.bottom && top + h > NO_TEXT_BAND.top;
  return overlaps ? Math.max(ZONES.content.top, NO_TEXT_BAND.top - h - 10) : top;
};
