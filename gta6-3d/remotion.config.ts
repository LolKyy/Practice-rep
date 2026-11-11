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
