import React from "react";
import { AbsoluteFill, Audio, useCurrentFrame, staticFile, delayRender, continueRender } from "remotion";
import words from "./words.json";
import { frame, setData, FPS } from "./story.js";

setData(words);

// Шрифты лежат в public/fonts (OFL) — рендер не зависит от интернета.
const FONTS: [string, string, string][] = [
  ["Oswald", "fonts/Oswald.ttf", "700"],
  ["Russo One", "fonts/RussoOne.ttf", "400"],
  ["Rubik", "fonts/Rubik.ttf", "800"],
];
const handle = delayRender("fonts");
Promise.all(FONTS.map(([fam, file, weight]) => new FontFace(fam, `url(${staticFile(file)})`, { weight }).load().then((f) => (document as any).fonts.add(f))))
  .then(() => continueRender(handle))
  .catch((e) => { console.error(e); continueRender(handle); });

export const Gta6Delay: React.FC = () => {
  const f = useCurrentFrame();
  return (
    <AbsoluteFill style={{ backgroundColor: "#12081F" }}>
      <AbsoluteFill dangerouslySetInnerHTML={{ __html: frame(f / FPS) }} />
      <Audio src={staticFile("audio.mp3")} />
    </AbsoluteFill>
  );
};
