#!/usr/bin/env python3
"""Обложка части: кадр сцены без субтитров + «ЧАСТЬ N» + заголовок.

    python3 animated/make_cover.py --story part3/story_part3.json --seg 08 --word ушли --offset 0.3 \\
        --part "ЧАСТЬ 3" --title "НЕ ОТЗЫВАЙСЯ" --out out/cover_part3.jpg
"""
import argparse
import json
import sys
from pathlib import Path

from PIL import Image, ImageDraw

sys.path.insert(0, str(Path(__file__).resolve().parent))
import render  # noqa: E402

ap = argparse.ArgumentParser()
ap.add_argument("--story", required=True)
ap.add_argument("--seg", required=True)
ap.add_argument("--word", required=True, help="кадр берётся в момент этого слова")
ap.add_argument("--offset", type=float, default=0.0)
ap.add_argument("--part", required=True)
ap.add_argument("--title", required=True)
ap.add_argument("--out", required=True)
ap.add_argument("--zoom", type=float, default=1.0)
ap.add_argument("--center", type=float, nargs=2, default=(540, 700))
args = ap.parse_args()

story_path = (render.HERE / args.story).resolve()
render.VOICE = story_path.parent / "voice"
story = json.loads(story_path.read_text(encoding="utf-8"))
segs, _ = render.build_timeline(story)
seg = next(s for s in segs if s.id == args.seg)
scene = render.SCENES[seg.data["scene"]](seg.data["params"])
img = scene.render(seg.word_time(args.word) + args.offset, seg).convert("RGBA")
if args.zoom > 1:  # приблизить центр действия
    cw, ch = render.W / args.zoom, render.H / args.zoom
    cx, cy = args.center
    img = img.crop((cx - cw / 2, cy - ch / 2, cx + cw / 2, cy + ch / 2)).resize((render.W, render.H), Image.LANCZOS)
img.alpha_composite(render.bottom_shade())
d = ImageDraw.Draw(img)

tf = render.font("bold", 50)
tw = d.textlength(args.part, font=tf)
tag = Image.new("RGBA", (int(tw + 80), 92), (0, 0, 0, 0))
td = ImageDraw.Draw(tag)
td.rounded_rectangle((0, 0, tag.width - 1, 91), radius=16, fill=(240, 200, 60))
td.text((tag.width / 2, 46), args.part, font=tf, fill=(24, 24, 26), anchor="mm")
tag = tag.rotate(2, resample=Image.BICUBIC, expand=True)
img.alpha_composite(tag, (int((render.W - tag.width) / 2), 1150))

f = render.font("bold", 112)
d.text((render.W / 2, 1360), args.title, font=f, fill=(250, 250, 250), anchor="mm",
       stroke_width=10, stroke_fill=(16, 16, 20))
img.convert("RGB").save(render.HERE / args.out, quality=92)
print("обложка →", render.HERE / args.out)
