/**
 * Конфиг Remotion CLI (studio / render).
 * Настройки рендера (gl, concurrency) выбраны бенчмарком — см. INSTALL.md и tools/render.config.json.
 */
import fs from "node:fs";
import { Config } from "@remotion/cli/config";

Config.setRspack(true);
Config.setVideoImageFormat("jpeg");
Config.setOverwriteOutput(true);
Config.setDefaultPremountInSeconds(2);

// Облачный контейнер Claude Code: Remotion не может скачать свой браузер (remotion.media закрыт),
// поэтому используем предустановленный chrome-headless-shell от Playwright.
// На обычном ПК этот путь не существует — Remotion скачает свой браузер сам.
const PW_SHELL = "/opt/pw-browsers/chromium_headless_shell-1243/chrome-headless-shell-linux64/chrome-headless-shell";
const browser = process.env.REMOTION_BROWSER_EXECUTABLE || (fs.existsSync(PW_SHELL) ? PW_SHELL : null);
if (browser) Config.setBrowserExecutable(browser);
