"""Нарезать исходники на отдельные моменты (по склейкам из scenes/*.json) → out/moments/*.mp4 + moments.zip + лист превью.

  python tools/split_moments.py

Водяные знаки платформы стираются (sources.json → delogo), титры/заставки/концовки TikTok пропускаются (SKIP),
длинные непрерывные куски режутся по ~3 с. Без звука, исходное разрешение и частота кадров, без грейда.
"""
import zipfile

from common import ROOT, FFMPEG, load_json, probe, run, source_path
from prep import delogo_filters

OUT = ROOT / "out" / "moments"
# id шотов, которые не берём (титры, реклама, чёрные кадры, концовка TikTok), и обрезки (id: (от, до))
SKIP = {"tt_launch": {0, 7, 42, 54, 55, 56}, "tt_para": {2, 3}, "tt_ocean": {2}, "cc_launch": {5, 7}, "cc_logo": {0}, "cc_club": set(), "cc_flip": set()}
TRIM = {("tt_launch", 53): (77.17, 79.6), ("tt_para", 0): (2.2, 5.6)}
MAX_LEN = 3.2


def main():
    OUT.mkdir(parents=True, exist_ok=True)
    for f in OUT.glob("*.mp4"):
        f.unlink()
    made = []
    for src, skip in SKIP.items():
        try:
            path = source_path(src)
        except FileNotFoundError:
            print("нет", src); continue
        sc = load_json(ROOT / "scenes" / f"{src}.json")["shots"]
        dur_src = probe(path)["duration"]
        for s in sc:
            if s["id"] in skip:
                continue
            a, b = TRIM.get((src, s["id"]), (s["t_in"] + 0.04, min(s["t_out"], dur_src) - 0.04))
            if b - a < 0.35:
                continue
            n = max(1, round((b - a) / MAX_LEN + 0.3))
            step = (b - a) / n
            for k in range(n):
                t0, t1 = a + k * step, a + (k + 1) * step
                name = f"{src}_{s['id']:02d}{chr(97 + k) if n > 1 else ''}_{t0:05.1f}s_{s['block']}.mp4"
                vf = delogo_filters(src, t0, t1 - t0) or ["null"]
                run([FFMPEG, "-v", "error", "-y", "-ss", f"{t0:.3f}", "-i", str(path), "-t", f"{t1 - t0:.3f}", "-an",
                     "-vf", ",".join(vf), "-c:v", "libx264", "-preset", "slow", "-crf", "15", "-pix_fmt", "yuv420p",
                     "-movflags", "+faststart", str(OUT / name)])
                made.append(OUT / name)
    z = OUT.parent / "moments.zip"
    with zipfile.ZipFile(z, "w", zipfile.ZIP_STORED) as zf:
        for f in made:
            zf.write(f, f.name)
    # лист превью: средний кадр каждого момента с именем
    from PIL import Image, ImageDraw, ImageFont
    import subprocess
    tiles = []
    for f in made:
        d = probe(f)["duration"]
        png = f.with_suffix(".jpg")
        subprocess.run([FFMPEG, "-v", "error", "-y", "-ss", f"{d / 2:.2f}", "-i", str(f), "-frames:v", "1",
                        "-vf", "scale=-2:200", str(png)], check=True)
        tiles.append((f.name, Image.open(png).copy())); png.unlink()
    cols, tw, th = 6, 360, 230
    sheet = Image.new("RGB", (cols * tw, ((len(tiles) + cols - 1) // cols) * th), (12, 12, 14))
    dr = ImageDraw.Draw(sheet)
    try:
        font = ImageFont.truetype("DejaVuSans.ttf", 13)
    except OSError:
        font = ImageFont.load_default()
    for i, (nm, im) in enumerate(tiles):
        im.thumbnail((tw - 8, 200))
        x, y = (i % cols) * tw + 4, (i // cols) * th + 4
        sheet.paste(im, (x + (tw - 8 - im.width) // 2, y))
        dr.text((x, y + 204), nm[:-4], fill=(255, 255, 255), font=font)
    sheet.save(OUT.parent / "moments_sheet.jpg", quality=85)
    print(f"{len(made)} моментов → {OUT}, {z} ({z.stat().st_size / 1e6:.1f} МБ)")


if __name__ == "__main__":
    main()
