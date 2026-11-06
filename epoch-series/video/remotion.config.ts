import { Config } from "@remotion/cli/config";
// angle: быстрее всех и в облаке (замер в CLAUDE.md)
Config.setChromiumOpenGlRenderer("angle");
Config.setConcurrency(4);
