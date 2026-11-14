// Математика эффектов. f — кадр от начала шота (60 fps).

// Speed ramp: доля пройденного исходника за долю шота u∈[0,1]. ∫ скорости = 1, четверть линейной — чтобы не было стоп-кадра.
export const rampMap = (ramp: string | null, u: number): number => {
  const c = Math.min(1, Math.max(0, u));
  switch (ramp) {
    case "in":    // медленно → быстро (разгон в удар)
      return 0.25 * c + 0.75 * Math.pow(c, 2.4);
    case "out":   // быстро → слоумо
      return 0.25 * c + 0.75 * (1 - Math.pow(1 - c, 2.4));
    case "glide": // почти обычная скорость → плавное слоумо к концу (для интро)
      return 0.6 * c + 0.4 * (1 - Math.pow(1 - c, 2));
    case "smash": // быстро → слоумо → быстро
      return 0.3 * c + 0.7 * (0.5 + 0.5 * Math.sign(2 * c - 1) * Math.pow(Math.abs(2 * c - 1), 3));
    default:
      return c;
  }
};

export const rampSpeed = (ramp: string | null, u: number, du: number) =>
  (rampMap(ramp, Math.min(1, u + du)) - rampMap(ramp, Math.max(0, u - du))) / (Math.min(1, u + du) - Math.max(0, u - du));

const decay = (f: number, tau: number) => (f < 0 ? 0 : Math.exp(-f / tau));

// zoom punch: резкий наезд на ударе и мягкий отход
export const zoomPunch = (f: number) => 1 + 0.17 * decay(f, 5.5);

// тряска: детерминированный «шум» из синусов, затухает за ~15 кадров
export const shake = (f: number, seed: number) => {
  const e = decay(f, 6);
  const n = (k: number) => Math.sin(f * k + seed * 12.9898) * 0.6 + Math.sin(f * k * 2.31 + seed * 78.233) * 0.4;
  return { x: 34 * e * n(1.9), y: 26 * e * n(2.7), r: 1.6 * e * n(1.3) };
};

// RGB split: смещение каналов в px
export const rgbOffset = (f: number) => 24 * decay(f, 4);

// whip (влёт со смазом): сдвиг по X в % и горизонтальный blur
export const whip = (f: number) => {
  const p = Math.min(1, f / 6);
  const k = 1 - Math.pow(1 - p, 3);
  return { x: (1 - k) * 38, blur: (1 - k) * 60 };
};

// вспышка: белый на 1–2 кадра
export const flash = (f: number, frames = 2) => (f < 0 || f >= frames ? 0 : f === 0 ? 1 : 0.55);
