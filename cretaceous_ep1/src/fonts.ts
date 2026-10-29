import "@fontsource/montserrat/cyrillic-900.css";
import "@fontsource/montserrat/latin-900.css";
import "@fontsource/jetbrains-mono/cyrillic-700.css";
import "@fontsource/jetbrains-mono/latin-700.css";
import { continueRender, delayRender } from "remotion";
const h = delayRender("fonts");
Promise.all([document.fonts.load('900 40px "Montserrat"', "АБВ abc"), document.fonts.load('700 40px "JetBrains Mono"', "АБВ 0123")])
  .then(() => continueRender(h)).catch(() => continueRender(h));
