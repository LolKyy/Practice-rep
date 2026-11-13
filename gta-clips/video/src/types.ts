export type Fx = "flash" | "zoom" | "shake" | "rgb" | "whip" | "blur";
export type Shot = {
  i: number; src: string; src_in: number;
  from: number; frames: number;          // место на таймлайне (кадры 60 fps)
  clip: string; pad: number; span: number; // файл фрагмента, запас в кадрах, длина источника в кадрах
  ramp: null | "in" | "out" | "smash";
  fx: Fx[]; strong: boolean; kind: "beat" | "half"; block: string; drift: number;
};
export type Caption = { text: string; color: string; from: number; to: number };
export type Timeline = {
  id: string; comp: string; fps: number; width: number; height: number; frames: number;
  music: null | { file: string; start: number };
  watermark: string; captions: Caption[]; shots: Shot[]; cuts: number[]; strong: number[];
};
