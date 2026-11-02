import fs from "node:fs";
export const writeWav = (file, ch, SR = 44100) => {
  const len = ch[0].length, n = ch.length;
  const buf = Buffer.alloc(44 + len * n * 2);
  buf.write("RIFF", 0); buf.writeUInt32LE(36 + len * n * 2, 4); buf.write("WAVE", 8);
  buf.write("fmt ", 12); buf.writeUInt32LE(16, 16); buf.writeUInt16LE(1, 20); buf.writeUInt16LE(n, 22);
  buf.writeUInt32LE(SR, 24); buf.writeUInt32LE(SR * n * 2, 28); buf.writeUInt16LE(n * 2, 32); buf.writeUInt16LE(16, 34);
  buf.write("data", 36); buf.writeUInt32LE(len * n * 2, 40);
  let o = 44;
  for (let i = 0; i < len; i++) for (let c = 0; c < n; c++) { buf.writeInt16LE(Math.round(Math.max(-1, Math.min(1, ch[c][i])) * 32767), o); o += 2; }
  fs.writeFileSync(file, buf);
};
