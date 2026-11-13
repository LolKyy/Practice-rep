"""Рендер эдита.

  python tools/render.py edits/t2_v1.json keyframes        → out/<id>_keyframes.jpg (кадр из каждого шота + удары)
  python tools/render.py edits/t2_v1.json video            → out/<id>_preview.mp4 (с треком) + out/<id>_upload.mp4 (без звука)
        [--browser PATH] [--chrome-mode chrome-for-testing] [--concurrency N] [--gl angle] [--no-prep]

Windows (RTX 4060, Chrome):
  python tools/render.py edits/t2_v1.json video --chrome-mode chrome-for-testing
         --browser "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe"
В облаке браузер подставляется сам (Playwright chromium).
"""
import argparse
import os
import shutil
import subprocess
import sys
from pathlib import Path

from common import ROOT, VIDEO, FPS, FFMPEG, load_json, run

CLOUD_BROWSER = "/opt/pw-browsers/chromium_headless_shell-1243/chrome-headless-shell-linux64/chrome-headless-shell"


def npx():
    return shutil.which("npx.cmd") or shutil.which("npx") or "npx"


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("edit")
    ap.add_argument("mode", choices=["keyframes", "video"])
    ap.add_argument("--browser", default=os.environ.get("REMOTION_BROWSER") or (CLOUD_BROWSER if Path(CLOUD_BROWSER).exists() else None))
    ap.add_argument("--chrome-mode")
    ap.add_argument("--concurrency")
    ap.add_argument("--gl", default="angle")
    ap.add_argument("--no-prep", action="store_true")
    a = ap.parse_args()
    edit = load_json(a.edit)
    if not a.no_prep:
        run([sys.executable, str(ROOT / "tools" / "prep.py"), a.edit])
    tl = load_json(VIDEO / "src" / "timelines" / f"{edit['id']}.json")
    out = ROOT / "out"
    out.mkdir(exist_ok=True)
    bopts = []
    if a.browser:
        bopts += ["--browser", a.browser]
    if a.chrome_mode:
        bopts += ["--chrome-mode", a.chrome_mode]

    if a.mode == "keyframes":
        frames = []
        for s in tl["shots"]:
            frames.append(s["from"] + min(4, s["frames"] - 1) if s["fx"] else s["from"] + s["frames"] // 2)   # кадр 4 — удар виден, вспышка уже сошла
        sd = out / f"{edit['id']}_stills"
        shutil.rmtree(sd, ignore_errors=True)
        run(["node", str(VIDEO / "stills.mjs"), tl["comp"], str(sd), ",".join(map(str, frames))] + bopts, cwd=str(VIDEO))
        from PIL import Image, ImageDraw, ImageFont
        ims = sorted(sd.glob("*.jpg"))
        tw, th, cols = 270, 480, 8
        rows = (len(ims) + cols - 1) // cols
        sheet = Image.new("RGB", (cols * (tw + 6) + 6, rows * (th + 30) + 6), (10, 10, 12))
        dr = ImageDraw.Draw(sheet)
        try:
            font = ImageFont.truetype("DejaVuSans-Bold.ttf", 16)
        except OSError:
            font = ImageFont.load_default()
        for n, (p, s) in enumerate(zip(ims, tl["shots"])):
            x, y = 6 + (n % cols) * (tw + 6), 6 + (n // cols) * (th + 30)
            sheet.paste(Image.open(p).resize((tw, th)), (x, y))
            dr.text((x + 3, y + th + 5), f"{s['i']} {s['from'] / FPS:.2f}s {s['src']}@{s['src_in']:.1f} {'+'.join(s['fx'])}"[:34],
                    fill=(255, 255, 255), font=font)
        f = out / f"{edit['id']}_keyframes.jpg"
        sheet.save(f, quality=86)
        print("→", f)
    else:
        prev = out / f"{edit['id']}_preview.mp4"
        cmd = [npx(), "remotion", "render", "src/index.ts", tl["comp"], str(prev), "--codec=h264", "--crf=16",
               f"--gl={a.gl}", "--x264-preset=slow", "--audio-bitrate=320k"]
        if a.browser:
            cmd.append(f"--browser-executable={a.browser}")
        if a.chrome_mode:
            cmd.append(f"--chrome-mode={a.chrome_mode}")
        if a.concurrency:
            cmd.append(f"--concurrency={a.concurrency}")
        run(cmd, cwd=str(VIDEO))
        up = out / f"{edit['id']}_upload.mp4"
        run([FFMPEG, "-v", "error", "-y", "-i", str(prev), "-an", "-c:v", "copy", "-movflags", "+faststart", str(up)])
        print("→", prev, "\n→", up)


if __name__ == "__main__":
    main()
