import { loadFont } from "@remotion/fonts";
import { staticFile } from "remotion";

// Шрифты лежат в assets/fonts (источник правды) и копируются в public/fonts
// скриптом tools/sync-assets.mjs (запускается автоматически перед dev/render).
const FILES: { family: string; file: string; weight: string }[] = [
  { family: "Inter", file: "Inter-ExtraBold.ttf", weight: "800" },
  { family: "Inter", file: "Inter-Black.ttf", weight: "900" },
  { family: "Montserrat", file: "Montserrat-ExtraBold.ttf", weight: "800" },
  { family: "Montserrat", file: "Montserrat-Black.ttf", weight: "900" },
  { family: "JetBrains Mono", file: "JetBrainsMono-Regular.ttf", weight: "400" },
  { family: "JetBrains Mono", file: "JetBrainsMono-Bold.ttf", weight: "700" },
  { family: "Oswald", file: "Oswald-Bold.ttf", weight: "700" },
];

let loaded: Promise<unknown> | null = null;

export const loadAllFonts = () => {
  if (!loaded) {
    loaded = Promise.all(
      FILES.map((f) =>
        loadFont({
          family: f.family,
          url: staticFile(`fonts/${f.file}`),
          weight: f.weight,
          display: "block",
        }),
      ),
    );
  }
  return loaded;
};

loadAllFonts();
