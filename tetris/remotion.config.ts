import { Config } from "@remotion/cli/config";
import fs from "node:fs";
Config.setChromiumOpenGlRenderer("angle");
// На Windows берём установленный Google Chrome: скачивание chrome-headless-shell в РФ блокируется (403)
const CHROME = "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe";
if (process.platform === "win32" && fs.existsSync(CHROME)) {
  Config.setChromeMode("chrome-for-testing");
  Config.setBrowserExecutable(CHROME);
}
Config.setVideoBitrate("2200k");
// Общий движок лежит в ../shared/remotion: его импорты (three, react, remotion…) ищем в node_modules ЭТОГО ролика,
// чтобы React/three были в одном экземпляре
import path from "node:path";
Config.overrideWebpackConfig((c) => ({
  ...c,
  resolve: { ...c.resolve, modules: [path.join(process.cwd(), "node_modules"), "node_modules"] },
}));
