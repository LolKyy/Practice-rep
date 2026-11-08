import { Config } from "@remotion/cli/config";
// "angle" — быстро на видеокарте; если рендер падает на WebGL — поменяйте на "swiftshader".
Config.setChromiumOpenGlRenderer((process.env.GL as "angle" | "swiftshader") ?? "angle");
