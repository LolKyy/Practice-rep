#!/usr/bin/env python3
"""Аватарка канала: глаз с полумесяцем. Два варианта + превью в размере аватарки."""
import math
from pathlib import Path

import numpy as np
from PIL import Image, ImageChops, ImageDraw, ImageFilter

OUT = Path(__file__).resolve().parent
N = 1024
SS = 2
S = N * SS
C = S // 2
PURPLE, BLUE, LAVENDER = (132, 70, 255), (58, 104, 255), (214, 196, 255)
BG = (7, 6, 14)


def gradient(c0=PURPLE, c1=BLUE):
    """Диагональный градиент фиолетовый → синий."""
    y, x = np.mgrid[0:S, 0:S] / S
    k = np.clip((x + y) / 2, 0, 1)[..., None]
    return Image.fromarray((np.array(c0) * (1 - k) + np.array(c1) * k).astype(np.uint8))


def clouds(seed=7):
    """Облачная текстура, как у луны за вороном."""
    rng = np.random.default_rng(seed)
    acc = np.zeros((S, S))
    for size, w in ((8, .5), (24, .3), (80, .15), (240, .05)):
        small = Image.fromarray((rng.random((size, size)) * 255).astype(np.uint8))
        acc += np.array(small.resize((S, S), Image.BICUBIC), float) / 255 * w
    return (acc - acc.min()) / (acc.max() - acc.min())


def eye_shape(d, w, h, fill=None, width=0, outline=None):
    """Миндалевидный глаз из двух дуг."""
    pts = []
    for i in range(121):
        t = -1 + 2 * i / 120
        pts.append((C + t * w, C - h * (1 - t * t) ** 0.9))
    for i in range(121):
        t = 1 - 2 * i / 120
        pts.append((C + t * w, C + h * (1 - t * t) ** 0.9))
    if fill is not None:
        d.polygon(pts, fill=fill)
    if outline is not None:
        d.line(pts + [pts[0]], fill=outline, width=width, joint="curve")


def crescent_mask(cx, cy, r):
    """Полумесяц как маска: круг минус смещённый круг — без ободков."""
    full, cut = Image.new("L", (S, S), 0), Image.new("L", (S, S), 0)
    ImageDraw.Draw(full).ellipse((cx - r, cy - r, cx + r, cy + r), fill=255)
    ImageDraw.Draw(cut).ellipse((cx - r * .45, cy - r * 1.05, cx + r * 1.35, cy + r * .75), fill=255)
    return ImageChops.subtract(full, cut)


def almond_mask(w, h):
    m = Image.new("L", (S, S), 0)
    eye_shape(ImageDraw.Draw(m), w, h, fill=255)
    return m


def rays(d, inner, outer, width, fill, angles):
    for a in angles:
        r = math.radians(a)
        d.line([(C + inner * math.cos(r), C - inner * math.sin(r)),
                (C + outer * math.cos(r), C - outer * math.sin(r))], fill=fill, width=width)


def finish(img):
    return img.resize((N, N), Image.LANCZOS)


def silhouette():
    """Вариант A: тёмный глаз на светящейся облачной луне."""
    tex = clouds()
    moon = np.array(gradient(), float) * (0.55 + 0.6 * tex[..., None])
    moon = Image.fromarray(np.clip(moon, 0, 255).astype(np.uint8))
    img = Image.new("RGB", (S, S), BG)
    mask = Image.new("L", (S, S), 0)
    ImageDraw.Draw(mask).ellipse((C - 940, C - 940, C + 940, C + 940), fill=255)
    img.paste(moon, (0, 0), mask.filter(ImageFilter.GaussianBlur(4)))
    d = ImageDraw.Draw(img)
    rays(d, 560, 760, 70, BG, (60, 90, 120, 240, 270, 300))
    eye_shape(d, 760, 380, fill=BG)
    iris = Image.new("L", (S, S), 0)
    ImageDraw.Draw(iris).ellipse((C - 270, C - 270, C + 270, C + 270), fill=255)
    glow = gradient(LAVENDER, (120, 90, 255))
    img.paste(glow, (0, 0), iris)
    img.paste(BG, (0, 0, S, S), crescent_mask(C - 20, C, 170))
    return finish(img)


def lines():
    """Вариант B: исходный линейный глаз, но толстыми линиями и с четырьмя лучами."""
    mask = Image.new("L", (S, S), 0)
    d = ImageDraw.Draw(mask)
    d.ellipse((C - 960, C - 960, C + 960, C + 960), outline=255, width=78)
    rays(d, 560, 730, 74, 255, (65, 115, 245, 295))
    ring = ImageChops.subtract(almond_mask(760, 410), almond_mask(650, 320))
    mask = ImageChops.lighter(mask, ring)
    d = ImageDraw.Draw(mask)
    d.ellipse((C - 230, C - 230, C + 230, C + 230), fill=255)
    mask = ImageChops.subtract(mask, crescent_mask(C - 15, C, 150))
    img = Image.new("RGB", (S, S), BG)
    glow = mask.filter(ImageFilter.GaussianBlur(40))
    img.paste(gradient(), (0, 0), glow.point(lambda v: v * .45))
    img.paste(gradient(), (0, 0), mask)
    return finish(img)


def avatar_preview(imgs, labels):
    """Как это выглядит в TikTok: круг 200 px (профиль) и 48 px (лента комментариев)."""
    sheet = Image.new("RGB", (len(imgs) * 420, 560), (22, 22, 26))
    d = ImageDraw.Draw(sheet)
    for i, (img, label) in enumerate(zip(imgs, labels)):
        for size, y in ((300, 30), (64, 380), (40, 470)):
            m = Image.new("L", (size * 4, size * 4), 0)
            ImageDraw.Draw(m).ellipse((0, 0, size * 4, size * 4), fill=255)
            m = m.resize((size, size), Image.LANCZOS)
            sheet.paste(img.resize((size, size), Image.LANCZOS), (i * 420 + (420 - size) // 2, y), m)
        d.text((i * 420 + 20, 530), label, fill=(200, 200, 205))
    return sheet


if __name__ == "__main__":
    a, b = silhouette(), lines()
    a.save(OUT / "logo_eye_A_silhouette.png")
    b.save(OUT / "logo_eye_B_lines.png")
    avatar_preview([a, b], ["A: silhouette", "B: thick lines"]).save(OUT / "logo_eye_preview.png")
    print("ok")
