#!/usr/bin/env python3
"""Анимированная версия «Поезд № 317»: плоская иллюстрация, караоке-субтитры, HUD, звук.

    python3 animated/render.py                 # весь ролик → animated/out/train317_part1.mp4
    python3 animated/render.py --preview 3 7   # только сегменты 03–07, быстрее
    python3 animated/render.py --stills        # по кадру из каждого сегмента → out/stills/

Сюжет и тайминг — в story.json. Голос: положи animated/voice/<id>.wav (например 05.wav),
и сегмент подстроится под длину записи, а слова в субтитрах — под темп. Без файла
длительность оценивается по тексту, озвучки в ролике нет.

Нужно: Python 3.10+, numpy, Pillow, ffmpeg в PATH.
"""

import argparse
import json
import math
import subprocess
import sys
import wave
from functools import lru_cache
from pathlib import Path

import numpy as np
from PIL import Image, ImageDraw, ImageEnhance, ImageFilter, ImageFont

HERE = Path(__file__).resolve().parent
sys.path.insert(0, str(HERE.parent / "tools"))
import build_assets as synth  # noqa: E402  — синтез звуков

W, H, FPS, SS = 1080, 1920, 30, 2
SR = synth.SR
OUT = HERE / "out"
VOICE = HERE / "voice"
CHARS_PER_SEC = 14.5
LEAD = 0.15

FONT_DIRS = ["/usr/share/fonts/truetype/dejavu/", "C:/Windows/Fonts/", "/Library/Fonts/"]
FONTS = {
    "bold": ["DejaVuSans-Bold.ttf", "arialbd.ttf", "Arial Bold.ttf"],
    "mono": ["DejaVuSansMono-Bold.ttf", "consolab.ttf", "Courier New Bold.ttf"],
    "serif": ["DejaVuSerif.ttf", "georgia.ttf", "Georgia.ttf"],
}


@lru_cache(None)
def font(kind, size):
    for d in FONT_DIRS:
        for name in FONTS[kind]:
            if Path(d, name).exists():
                return ImageFont.truetype(str(Path(d, name)), size)
    raise SystemExit(f"Нет шрифта {kind}: добавь путь в FONT_DIRS")


# ------------------------------------------------------------------ рисование

class Painter:
    """Рисует в двойном разрешении и уменьшает — сглаженные края у плоской графики."""

    def __init__(self, bg=(0, 0, 0, 0), size=(W, H)):
        self.img = Image.new("RGBA", (size[0] * SS, size[1] * SS), bg)
        self.d = ImageDraw.Draw(self.img)

    @staticmethod
    def s(pts):
        return [(x * SS, y * SS) for x, y in pts]

    def poly(self, pts, c):
        self.d.polygon(self.s(pts), fill=c)

    def rect(self, x0, y0, x1, y1, c, r=0):
        box = (x0 * SS, y0 * SS, x1 * SS, y1 * SS)
        if r:
            self.d.rounded_rectangle(box, radius=r * SS, fill=c)
        else:
            self.d.rectangle(box, fill=c)

    def ell(self, x0, y0, x1, y1, c):
        self.d.ellipse((x0 * SS, y0 * SS, x1 * SS, y1 * SS), fill=c)

    def line(self, pts, c, w):
        self.d.line(self.s(pts), fill=c, width=max(1, int(w * SS)), joint="curve")

    def vgrad(self, y0, y1, c0, c1, x0=0, x1=W):
        for y in range(int(y0 * SS), int(y1 * SS)):
            k = (y / SS - y0) / max(1, y1 - y0)
            self.d.line([(x0 * SS, y), (x1 * SS, y)], fill=tuple(int(a + (b - a) * k) for a, b in zip(c0, c1)))

    def done(self):
        return self.img.resize((self.img.width // SS, self.img.height // SS), Image.LANCZOS)


def glow(cx, cy, r, color, alpha, size=(W, H)):
    yy, xx = np.mgrid[0:size[1], 0:size[0]]
    k = np.clip(1 - np.hypot(xx - cx, yy - cy) / r, 0, 1) ** 2
    layer = np.zeros((size[1], size[0], 4), np.uint8)
    layer[..., :3] = color
    layer[..., 3] = (k * alpha).astype(np.uint8)
    return Image.fromarray(layer, "RGBA")


def over(base, layer, pos=(0, 0)):
    base = base.convert("RGBA")
    if layer.size != base.size or pos != (0, 0):
        full = Image.new("RGBA", base.size, (0, 0, 0, 0))
        full.paste(layer, pos, layer)
        layer = full
    return Image.alpha_composite(base, layer)


def darken(img, k, tint=(18, 26, 44)):
    """Ночное освещение: темнее и в синеву. Прозрачность слоя сохраняется."""
    alpha = img.convert("RGBA").getchannel("A")
    dark = ImageEnhance.Brightness(img.convert("RGB")).enhance(k)
    out = Image.blend(dark, Image.new("RGB", img.size, tint), 0.25).convert("RGBA")
    out.putalpha(alpha)
    return out


def lerp(c0, c1, k):
    return tuple(int(a + (b - a) * k) for a, b in zip(c0, c1))


class Blizzard:
    """Снег, летящий почти горизонтально."""

    def __init__(self, n=420, seed=7, area=(0, 0, W, H), speed=1.0):
        r = np.random.default_rng(seed)
        self.x0 = r.uniform(0, W + 200, n)
        self.y = r.uniform(area[1], area[3], n)
        self.v = r.uniform(500, 1300, n) * speed
        self.len = r.uniform(4, 22, n)
        self.a = r.integers(90, 230, n)
        self.wob = r.uniform(0, 6.28, n)

    def draw(self, img, t, clip=None):
        layer = Image.new("RGBA", img.size, (0, 0, 0, 0))
        d = ImageDraw.Draw(layer)
        xs = (self.x0 - self.v * t) % (W + 200) - 100
        ys = self.y + 14 * np.sin(t * 2 + self.wob) + self.v * 0.12 * (t % 3)
        for x, y, ln, a in zip(xs, ys % H, self.len, self.a):
            if clip and not (clip[0] < x < clip[2] and clip[1] < y < clip[3]):
                continue
            d.line([(x, y), (x + ln, y + ln * 0.15)], fill=(225, 232, 240, int(a)), width=2 if ln > 12 else 1)
        return Image.alpha_composite(img.convert("RGBA"), layer)


# ------------------------------------------------------------------ персонажи

def figure_tall(p, x, feet, h, c=(12, 14, 20)):
    """Высокий тонкий силуэт без деталей."""
    k = h / 1000
    p.ell(x - 18 * k, feet - h, x + 18 * k, feet - h + 70 * k, c)
    p.rect(x - 7 * k, feet - h + 60 * k, x + 7 * k, feet - h + 120 * k, c)
    p.ell(x - 55 * k, feet - h + 105 * k, x + 55 * k, feet - h + 165 * k, c)
    p.poly([(x - 52 * k, feet - h + 130 * k), (x + 52 * k, feet - h + 130 * k), (x + 30 * k, feet - h + 640 * k),
            (x - 30 * k, feet - h + 640 * k)], c)
    for sgn in (-1, 1):
        p.line([(x + sgn * 50 * k, feet - h + 140 * k), (x + sgn * 64 * k, feet - h + 480 * k),
                (x + sgn * 58 * k, feet - h + 820 * k)], c, 13 * k)
        p.line([(x + sgn * 15 * k, feet - h + 630 * k), (x + sgn * 20 * k, feet)], c, 20 * k)


def petrovich(p, x, feet, h=640):
    """Проводник: тёмно-синяя форма, фуражка, седые усы, связка ключей."""
    k = h / 640
    navy, navy_d, skin, grey = (40, 50, 74), (28, 34, 52), (206, 164, 134), (190, 190, 186)
    p.rect(x - 52 * k, feet - 260 * k, x - 6 * k, feet, (30, 32, 40))           # ноги
    p.rect(x + 6 * k, feet - 260 * k, x + 52 * k, feet, (30, 32, 40))
    p.rect(x - 62 * k, feet - 18 * k, x - 2 * k, feet, (16, 16, 18), r=6)       # ботинки
    p.rect(x + 2 * k, feet - 18 * k, x + 62 * k, feet, (16, 16, 18), r=6)
    p.rect(x - 92 * k, feet - 520 * k, x + 92 * k, feet - 210 * k, navy, r=26)  # китель
    p.rect(x - 6 * k, feet - 500 * k, x + 6 * k, feet - 220 * k, navy_d)
    for i in range(4):
        p.ell(x + 14 * k, feet - (470 - i * 66) * k, x + 28 * k, feet - (456 - i * 66) * k, (214, 180, 80))
    p.line([(x - 86 * k, feet - 490 * k), (x - 116 * k, feet - 330 * k), (x - 98 * k, feet - 240 * k)], navy, 40 * k)
    p.line([(x + 86 * k, feet - 490 * k), (x + 150 * k, feet - 380 * k), (x + 196 * k, feet - 360 * k)], navy, 40 * k)
    p.ell(x - 118 * k, feet - 262 * k, x - 80 * k, feet - 224 * k, skin)            # кисти
    p.ell(x + 182 * k, feet - 380 * k, x + 220 * k, feet - 342 * k, skin)
    p.ell(x + 206 * k, feet - 360 * k, x + 232 * k, feet - 334 * k, (0, 0, 0, 0))
    p.line([(x + 214 * k, feet - 346 * k), (x + 226 * k, feet - 318 * k)], (200, 200, 205), 6 * k)  # ключи
    p.ell(x + 208 * k, feet - 330 * k, x + 238 * k, feet - 300 * k, (180, 180, 186))
    p.rect(x - 20 * k, feet - 560 * k, x + 20 * k, feet - 512 * k, skin)               # шея
    p.ell(x - 60 * k, feet - 660 * k, x + 60 * k, feet - 540 * k, skin)               # голова
    p.rect(x - 40 * k, feet - 592 * k, x + 40 * k, feet - 576 * k, grey, r=8)         # усы
    p.ell(x - 30 * k, feet - 622 * k, x - 16 * k, feet - 608 * k, (30, 30, 30))
    p.ell(x + 16 * k, feet - 622 * k, x + 30 * k, feet - 608 * k, (30, 30, 30))
    p.rect(x - 66 * k, feet - 700 * k, x + 66 * k, feet - 640 * k, navy_d, r=16)      # фуражка
    p.rect(x - 74 * k, feet - 652 * k, x + 74 * k, feet - 636 * k, (16, 18, 26), r=6)
    p.ell(x - 12 * k, feet - 690 * k, x + 12 * k, feet - 666 * k, (214, 180, 80))


def dima_back(p, x, y, s=1.0, c=(20, 20, 24)):
    """Дима со спины: голова в ушанке и плечи шинели — передний план."""
    p.ell(x - 190 * s, y + 110 * s, x + 190 * s, y + 420 * s, c)
    p.ell(x - 92 * s, y - 70 * s, x + 92 * s, y + 140 * s, (30, 28, 30))
    p.rect(x - 100 * s, y - 92 * s, x + 100 * s, y - 10 * s, (44, 40, 38), r=30)
    p.rect(x - 110 * s, y - 20 * s, x - 70 * s, y + 90 * s, (44, 40, 38), r=16)
    p.rect(x + 70 * s, y - 20 * s, x + 110 * s, y + 90 * s, (44, 40, 38), r=16)


# ------------------------------------------------------------------ сцены

class Scene:
    exterior = False

    def __init__(self, params):
        self.params = params

    def render(self, t, ctx):
        raise NotImplementedError


def sky_and_steppe(p, horizon, lit=False):
    p.vgrad(0, horizon, (12, 18, 30), (50, 62, 80))
    p.poly([(0, horizon)] + [(x, horizon - 8 - 14 * math.sin(x / 140) - 6 * math.sin(x / 47)) for x in range(0, W + 1, 30)]
           + [(W, horizon)], (34, 42, 56))
    p.vgrad(horizon, H, (96, 110, 128) if not lit else (196, 210, 226), (44, 50, 62))


class TrainScene(Scene):
    exterior = True
    CAR, GAP, TOP, BOT = 600, 22, 790, 1000

    def __init__(self, params):
        super().__init__(params)
        p = Painter()
        sky_and_steppe(p, 900)
        p.line([(0, 640), (W, 650)], (26, 30, 38), 3)
        p.line([(0, 662), (W, 668)], (26, 30, 38), 2)
        if params.get("watcher"):
            figure_tall(p, 990, 902, 92, (24, 30, 40))
        p.rect(0, 1030, W, 1040, (36, 40, 46))
        self.bg = p.done()

        p = Painter()
        self.windows = []
        for x0 in range(-150, W + 200, self.CAR + self.GAP):
            x1 = x0 + self.CAR
            p.rect(x0, self.TOP - 18, x1, self.TOP + 10, (64, 72, 82), r=14)
            for bx in range(x0 + 10, x1 - 10, 38):
                p.ell(bx, self.TOP - 34, bx + 52, self.TOP - 8, (186, 198, 212))
            p.rect(x0, self.TOP, x1, self.BOT, (44, 72, 60), r=6)
            p.rect(x0, 952, x1, 960, (178, 150, 66))
            p.rect(x0 + 6, self.TOP + 14, x0 + 46, 990, (36, 60, 50), r=4)
            p.rect(x1 - 46, self.TOP + 14, x1 - 6, 990, (36, 60, 50), r=4)
            p.rect(x0, self.BOT, x1, self.BOT + 18, (26, 28, 32))
            for bx in (x0 + 70, x1 - 190):
                p.rect(bx, self.BOT + 6, bx + 120, self.BOT + 30, (18, 18, 20), r=8)
                for wx in (bx + 22, bx + 98):
                    p.ell(wx - 18, self.BOT + 12, wx + 18, self.BOT + 48, (14, 14, 16))
            p.rect(x0, self.BOT - 30, x1, self.BOT, (150, 162, 176, 120))
            for i in range(7):
                wx = x0 + 70 + i * 70
                self.windows.append((wx, 838, wx + 50, 886))
        self.train = p.done()
        self.under_glow = Image.new("RGBA", (W, H), (0, 0, 0, 0))
        for x0, *_ in self.windows:
            self.under_glow = Image.alpha_composite(self.under_glow, glow(x0 + 25, 1080, 90, (236, 196, 110), 70))
        self.snow = Blizzard()

    def light(self, t, ctx):
        mode = self.params.get("lights", "on")
        if mode == "on":
            return 1.0
        tf = ctx.word_time(self.params["fail_word"])
        if t >= tf:
            return 0.0
        if t > tf - 1.4:
            return 1.0 if math.sin(t * 47) + math.sin(t * 13) > 0 else 0.15
        return 1.0

    def render(self, t, ctx):
        img = self.bg.copy()
        d = ImageDraw.Draw(img)
        shift = (t * 460) % 340 if self.params.get("moving") else 120
        for px in np.arange(-shift, W + 340, 340):
            d.line([(px, 600), (px, 1010)], fill=(24, 28, 34), width=10)
            d.line([(px - 4, 632), (px + 60, 632)], fill=(24, 28, 34), width=6)
        L = self.light(t, ctx)
        if L > 0:
            ug = self.under_glow.copy()
            ug.putalpha(ug.getchannel("A").point(lambda v: v * L))
            img = Image.alpha_composite(img, ug)
        img = Image.alpha_composite(img, self.train)
        d = ImageDraw.Draw(img)
        for box in self.windows:
            d.rounded_rectangle(box, radius=6, fill=lerp((30, 38, 48), (238, 198, 112), L))
        if self.params.get("moving"):
            for i in range(26):
                gx = (i * 97 - t * 1400) % (W + 100) - 50
                gy = 1060 + (i * 53) % 220
                d.line([(gx, gy), (gx + 40, gy)], fill=(150, 162, 178), width=2)
        return self.snow.draw(img, t)


class CorridorScene(Scene):
    N, F = (-60, -120, 1140, 1700), (452, 600, 628, 960)

    @classmethod
    def at(cls, z):
        return tuple(a + (b - a) * z for a, b in zip(cls.N, cls.F))

    @staticmethod
    def depth(s):
        return (1 - 1 / (1 + 4 * s)) / 0.8

    def draw(self, lit, ajar=False):
        p = Painter()
        N, F = self.N, self.F
        wall, wall_r = (178, 166, 142), (160, 148, 126)
        p.poly([(N[0], N[1]), (N[2], N[1]), (F[2], F[1]), (F[0], F[1])], (150, 146, 136))
        p.poly([(N[0], N[1]), (F[0], F[1]), (F[0], F[3]), (N[0], N[3])], wall)
        p.poly([(N[2], N[1]), (F[2], F[1]), (F[2], F[3]), (N[2], N[3])], wall_r)
        p.poly([(N[0], N[3]), (N[2], N[3]), (F[2], F[3]), (F[0], F[3])], (90, 70, 56))

        def wall_pt(s, frac, side):
            r = self.at(self.depth(s))
            return (r[0] if side == "L" else r[2], r[1] + (r[3] - r[1]) * frac)

        def floor_pt(s, frac):
            r = self.at(self.depth(s))
            return (r[0] + (r[2] - r[0]) * frac, r[3])

        p.poly([floor_pt(0, .28), floor_pt(0, .72), floor_pt(1, .72), floor_pt(1, .28)], (122, 38, 36))
        for f in (.33, .67):
            p.poly([floor_pt(0, f - .012), floor_pt(0, f + .012), floor_pt(1, f + .012), floor_pt(1, f - .012)], (46, 86, 60))
        win = (34, 52, 76) if lit else (52, 74, 104)
        for i in range(5):
            s0, s1 = i / 5 + .03, (i + 1) / 5 - .05
            p.poly([wall_pt(s0, .3, "L"), wall_pt(s1, .3, "L"), wall_pt(s1, .62, "L"), wall_pt(s0, .62, "L")], (92, 68, 50))
            m0, m1 = s0 + .012, s1 - .012
            p.poly([wall_pt(m0, .33, "L"), wall_pt(m1, .33, "L"), wall_pt(m1, .59, "L"), wall_pt(m0, .59, "L")], win)
            ds0, ds1 = i / 5 + .04, (i + 1) / 5 - .03
            p.poly([wall_pt(ds0, .16, "R"), wall_pt(ds1, .16, "R"), wall_pt(ds1, .97, "R"), wall_pt(ds0, .97, "R")], (104, 74, 52))
            hx, hy = wall_pt(ds1 - .02, .55, "R")
            p.ell(hx - 6, hy - 6, hx + 6, hy + 6, (196, 196, 190))
        p.line([wall_pt(0, .67, "L"), wall_pt(1, .67, "L")], (196, 200, 206), 10)
        fw, fh = F[2] - F[0], F[3] - F[1]
        p.rect(F[0], F[1], F[2], F[3], (126, 118, 104))
        dx0, dx1, dy0 = F[0] + fw * .2, F[2] - fw * .2, F[1] + fh * .14
        p.rect(dx0, dy0, dx1, F[3], (86, 92, 100))
        p.rect(dx0 + fw * .14, dy0 + fh * .1, dx1 - fw * .14, dy0 + fh * .34, (150, 172, 192))
        if ajar:
            p.poly([(dx1 - 14, dy0), (dx1, dy0), (dx1, F[3]), (dx1 - 14, F[3])], (6, 8, 12))
        if lit:
            for s in (.06, .3, .55, .8):
                r = self.at(self.depth(s))
                cx, w_ = (r[0] + r[2]) / 2, (r[2] - r[0]) * .1
                p.ell(cx - w_, r[1] + 6, cx + w_, r[1] + 6 + w_ * .5, (238, 238, 222))
        p.rect(F[0] + fw * .42, F[1] + fh * .03, F[2] - fw * .42, F[1] + fh * .09, (230, 150, 60))
        img = p.done()
        if not lit:
            img = darken(img, .32)
            img = Image.alpha_composite(img, glow((F[0] + F[2]) / 2, F[1] + fh * .06, 520, (230, 150, 60), 120))
        return img

    def __init__(self, params):
        super().__init__(params)
        self.on, self.off = self.draw(True), self.draw(False)
        self.off_ajar = self.draw(False, ajar=True) if params.get("far_door_word") else None

    def render(self, t, ctx):
        if self.off_ajar is not None and t >= ctx.word_time(self.params["far_door_word"]):
            return self.off_ajar
        return self.on if self.params.get("lights") == "on" else self.off


class TambourScene(Scene):
    PIVOT = (712, 800)

    def __init__(self, params, with_conductor=False):
        super().__init__(params)
        p = Painter()
        p.rect(0, 0, W, 1170, (140, 128, 108))
        for x in range(0, W, 180):
            p.line([(x, 0), (x, 1170)], (124, 114, 96), 3)
        p.rect(0, 1170, W, H, (64, 58, 52))
        p.rect(270, 340, 810, 1176, (70, 74, 80), r=6)
        p.rect(300, 370, 780, 1170, (98, 104, 112), r=4)
        p.rect(340, 700, 740, 1120, (90, 96, 104), r=4)
        p.rect(410, 440, 670, 650, (60, 64, 70), r=6)
        p.rect(424, 454, 656, 636, (150, 172, 192))
        p.rect(500, 274, 580, 322, (46, 44, 40), r=6)
        p.rect(512, 282, 568, 314, (238, 160, 64), r=4)
        p.ell(310, 1158, 770, 1186, (200, 210, 222))
        if with_conductor:
            petrovich(p, 150, 1180, 700)
        else:
            dima_back(p, 900, 1180, 1.3)
        img = darken(p.done(), .42)
        frost = np.random.default_rng(3).random((182, 232))
        frost = Image.fromarray((np.clip((frost - .55) * 3, 0, 1) * 255).astype(np.uint8)).filter(ImageFilter.GaussianBlur(1.6))
        fl = Image.new("RGBA", frost.size, (210, 225, 238, 0))
        fl.putalpha(frost.point(lambda v: v * .7))
        img = over(img, fl, (424, 454))
        self.base = Image.alpha_composite(img, glow(540, 300, 620, (236, 152, 60), 130))

    def render(self, t, ctx):
        img = self.base.copy()
        ang = 0.0
        if "handle_word" in self.params:
            th = ctx.word_time(self.params["handle_word"])
            if t > th:
                u = t - th
                ang = 26 * (min(u / .5, 1) if u < 1.6 else max(0, 1 - (u - 1.6) / 1.2))
        x, y = self.PIVOT
        a = math.radians(ang)
        d = ImageDraw.Draw(img)
        d.line([(x, y), (x - 110 * math.cos(a), y + 110 * math.sin(a))], fill=(150, 154, 160), width=18)
        d.ellipse((x - 16, y - 16, x + 16, y + 16), fill=(120, 124, 130))
        return img


class ConductorScene(TambourScene):
    def __init__(self, params):
        super().__init__(params, with_conductor=True)


class WindowScene(Scene):
    exterior = True
    GLASS = (190, 310, 890, 1010)

    def __init__(self, params):
        super().__init__(params)
        p = Painter()
        p.rect(0, 0, W, H, (6, 10, 18))
        self.under = p.done()
        p = Painter()
        x0, y0, x1, y1 = self.GLASS
        p.rect(0, 0, W, y0 - 40, (126, 114, 96))
        p.rect(0, y1 + 40, W, H, (126, 114, 96))
        p.rect(0, 0, x0 - 40, H, (126, 114, 96))
        p.rect(x1 + 40, 0, W, H, (126, 114, 96))
        wood = (78, 58, 44)
        p.rect(x0 - 40, y0 - 40, x1 + 40, y0, wood)
        p.rect(x0 - 40, y1, x1 + 40, y1 + 40, wood)
        p.rect(x0 - 40, y0 - 40, x0, y1 + 40, wood)
        p.rect(x1, y0 - 40, x1 + 40, y1 + 40, wood)
        p.rect(x0, y0 + 230, x1, y0 + 254, wood)
        p.poly([(x0 - 120, y0 - 70), (x0 + 90, y0 - 70), (x0 + 40, y0 + 380), (x0 - 120, y0 + 420)], (116, 40, 38))
        p.poly([(x1 - 90, y0 - 70), (x1 + 120, y0 - 70), (x1 + 120, y0 + 420), (x1 - 40, y0 + 380)], (116, 40, 38))
        p.rect(0, y0 - 92, W, y0 - 70, (150, 150, 146))
        p.rect(60, y1 + 60, W - 60, y1 + 160, (96, 66, 46), r=8)
        dima_back(p, 230, 1180, 1.25)
        frame = darken(p.done(), .45)
        rng = np.random.default_rng(11)
        gw, gh = x1 - x0, y1 - y0
        yy, xx = np.mgrid[0:gh, 0:gw]
        edge = np.minimum.reduce([xx, yy, gw - xx, gh - yy]) / 150
        fmask = np.clip((rng.random((gh, gw)) * 1.3 - edge) * 1.6, 0, 1) * 220
        fimg = Image.new("RGBA", (gw, gh), (120, 138, 156, 0))
        fimg.putalpha(Image.fromarray(fmask.astype(np.uint8)).filter(ImageFilter.GaussianBlur(2.5)))
        self.over = over(Image.new("RGBA", (W, H), (0, 0, 0, 0)), fimg, (x0, y0))
        self.over = Image.alpha_composite(self.over, frame)
        self.over = Image.alpha_composite(self.over, glow(160, 1100, 700, (236, 152, 60), 70))
        self.hand = self.make_hand()
        self.snow = Blizzard(n=260, seed=5, speed=.8)

    @staticmethod
    def make_hand():
        """Отпечаток ладони на инее: пальцы на треть длиннее человеческих."""
        p = Painter()
        c = (214, 228, 240)
        cx, cy = 590, 760
        p.rect(cx - 72, cy - 70, cx + 72, cy + 100, c, r=60)
        for i, (ang, length) in enumerate(((-11, 210), (-3, 250), (5, 240), (13, 200))):
            a = math.radians(ang)
            bx = cx - 52 + i * 35
            p.line([(bx, cy - 40), (bx + length * math.sin(a), cy - 40 - length * math.cos(a))], c, 30)
            ex, ey = bx + length * math.sin(a), cy - 40 - length * math.cos(a)
            p.ell(ex - 15, ey - 15, ex + 15, ey + 15, c)
        p.line([(cx + 60, cy + 40), (cx + 120, cy - 20), (cx + 150, cy - 90)], c, 30)
        p.ell(cx + 135, cy - 105, cx + 165, cy - 75, c)
        img = p.done().filter(ImageFilter.GaussianBlur(5))
        img.putalpha(img.getchannel("A").point(lambda v: v * .8))
        return img

    def render(self, t, ctx):
        img = self.snow.draw(self.under, t, clip=self.GLASS)
        if "handprint_word" in self.params:
            k = np.clip((t - ctx.word_time(self.params["handprint_word"])) / 1.6, 0, 1)
            if k > 0:
                h = self.hand.copy()
                h.putalpha(h.getchannel("A").point(lambda v: v * .85 * k))
                img = Image.alpha_composite(img, h)
        return Image.alpha_composite(img, self.over)


class JournalScene(Scene):
    LINES = [
        ("02:40", "Чай разнесён. Пассажиров 31."),
        ("03:17", "Остановка. Питания нет."),
        ("03:19", "Тамбуры заперты. Ключ у меня."),
        ("03:30", "Вышел проверить сцепку."),
    ]

    def __init__(self, params):
        super().__init__(params)
        p = Painter()
        p.rect(0, 0, W, H, (58, 42, 32))
        for y in range(0, H, 150):
            p.line([(0, y), (W, y)], (44, 32, 24), 4)
        p.ell(800, 1150, 1020, 1230, (30, 22, 18))
        p.poly([(820, 910), (1000, 910), (980, 1190), (840, 1190)], (150, 70, 30))
        p.rect(810, 1030, 1010, 1200, (150, 150, 156), r=10)
        p.line([(1010, 1050), (1070, 1080), (1060, 1160), (1010, 1170)], (150, 150, 156), 14)
        desk = darken(p.done(), .6)
        paper = Image.new("RGBA", (800, 820), (232, 222, 196, 255))
        d = ImageDraw.Draw(paper)
        for y in range(150, 820, 64):
            d.line([(30, y), (770, y)], fill=(180, 190, 214), width=2)
        d.line([(150, 110), (150, 800)], fill=(206, 120, 120), width=2)
        d.text((40, 40), "ЖУРНАЛ ПРОВОДНИКА · ВАГОН № 7", font=font("bold", 30), fill=(40, 40, 44))
        d.text((640, 84), "14.01.99", font=font("serif", 26), fill=(40, 52, 110))
        self.paper = paper
        self.desk = desk
        self.rows = []
        for i, (tm, txt) in enumerate(self.LINES):
            row = Image.new("RGBA", (760, 60), (0, 0, 0, 0))
            rd = ImageDraw.Draw(row)
            ink = (40, 52, 110) if i < 3 else (150, 30, 30)
            rd.text((10, 8), tm, font=font("serif", 32), fill=ink)
            rd.text((130, 8), txt, font=font("serif", 34), fill=ink)
            self.rows.append(row.transform(row.size, Image.AFFINE, (1, .22, -8, 0, 1, 0), Image.BICUBIC))

    def render(self, t, ctx):
        paper = self.paper.copy()
        reveal = np.clip((t - ctx.word_time(self.params["reveal_word"]) + .3) / 1.4, 0, 1)
        for i, row in enumerate(self.rows):
            y = 168 + i * 128
            if i < 3:
                paper.alpha_composite(row, (20, y))
            elif reveal > 0:
                part = row.crop((0, 0, int(row.width * reveal), row.height))
                paper.alpha_composite(part, (20, y))
        rot = paper.rotate(-2.2, resample=Image.BICUBIC, expand=True)
        img = self.desk.copy()
        img.alpha_composite(rot, (130, 390))
        return Image.alpha_composite(img, glow(540, 600, 900, (240, 180, 90), 50))


class FootprintsScene(Scene):
    exterior = True

    def __init__(self, params):
        super().__init__(params)
        self.lit = self.draw()
        self.dark = darken(self.lit, .3)
        self.snow = Blizzard(seed=9)

    def draw(self):
        p = Painter()
        sky_and_steppe(p, 640, lit=True)
        p.rect(0, 250, 300, 1090, (44, 72, 60))
        p.rect(0, 380, 300, 388, (178, 150, 66))
        p.rect(80, 300, 260, 1080, (36, 60, 50), r=6)
        p.rect(120, 360, 220, 500, (24, 30, 36), r=6)
        p.rect(70, 1080, 300, 1100, (60, 62, 66))
        p.rect(90, 1110, 290, 1124, (60, 62, 66))
        for i in range(16):
            u = i / 15
            x = 320 + 420 * u + 50 * math.sin(u * 3)
            y = 1180 - 330 * u
            s = 1 - .6 * u
            off = 22 * s * (1 if i % 2 else -1)
            p.ell(x - 22 * s + off, y - 38 * s, x + 22 * s + off, y + 38 * s, (70, 84, 104))
        cx, cy = 768, 838
        p.ell(cx - 44, cy - 4, cx + 44, cy + 22, (16, 18, 26))
        p.ell(cx - 34, cy - 30, cx + 34, cy + 10, (28, 34, 52))
        p.ell(cx - 8, cy - 22, cx + 8, cy - 8, (214, 180, 80))
        p.ell(cx - 60, cy + 6, cx + 60, cy + 30, (196, 210, 226))
        return p.done()

    def render(self, t, ctx):
        img = Image.blend(self.dark.convert("RGB"), self.lit.convert("RGB"), ctx.flash_level(t, hold=.45)).convert("RGBA")
        return self.snow.draw(img, t)


class CircleScene(Scene):
    exterior = True
    FIGS = [(110, 1230, 560), (250, 860, 250), (430, 846, 220), (650, 852, 236), (860, 870, 260),
            (1000, 1260, 600), (560, 1330, 470)]

    def __init__(self, params):
        super().__init__(params)
        p = Painter()
        sky_and_steppe(p, 830, lit=True)
        for x0 in range(-60, W + 60, 300):
            p.rect(x0, 858, x0 + 288, 946, (44, 72, 60), r=4)
            p.rect(x0, 848, x0 + 288, 862, (180, 192, 206), r=6)
            p.rect(x0, 924, x0 + 288, 928, (178, 150, 66))
            for i in range(5):
                p.rect(x0 + 30 + i * 50, 878, x0 + 58 + i * 50, 902, (30, 38, 48), r=3)
            p.rect(x0, 946, x0 + 288, 958, (24, 26, 30))
        p.rect(0, 958, W, 964, (36, 40, 46))
        for x, feet, h in self.FIGS:
            figure_tall(p, x, feet, h)
        figure_tall(p, 352, 952, 150, (8, 10, 14))  # восьмой — у двери вагона, в тени
        self.lit = p.done()
        self.dark = darken(self.lit, .22)
        self.snow = Blizzard(seed=13)

    def render(self, t, ctx):
        img = Image.blend(self.dark.convert("RGB"), self.lit.convert("RGB"), ctx.flash_level(t, hold=.5)).convert("RGBA")
        img = self.snow.draw(img, t)
        t0 = ctx.word_time(self.params["count_word"])
        d = ImageDraw.Draw(img)
        for i, (x, feet, h) in enumerate(self.FIGS):
            if t >= t0 + .25 + i * .14:
                y = feet - h - 46
                d.ellipse((x - 26, y - 26, x + 26, y + 26), fill=(16, 16, 20), outline=(236, 236, 236), width=3)
                d.text((x, y), str(i + 1), font=font("bold", 30), fill=(240, 240, 240), anchor="mm")
        return img


class SpeakerScene(Scene):
    C = (540, 640)

    def __init__(self, params):
        super().__init__(params)
        p = Painter()
        p.rect(0, 0, W, H, (150, 144, 132))
        for x in range(-200, W + 200, 260):
            p.line([(x, 0), (x + 120, H)], (134, 128, 116), 4)
        cx, cy = self.C
        p.ell(cx - 270, cy - 270, cx + 270, cy + 270, (120, 116, 108))
        p.ell(cx - 250, cy - 250, cx + 250, cy + 250, (206, 200, 188))
        for gx in range(-220, 221, 26):
            for gy in range(-220, 221, 26):
                if gx * gx + gy * gy < 215 ** 2:
                    p.ell(cx + gx - 7, cy + gy - 7, cx + gx + 7, cy + gy + 7, (52, 50, 48))
        p.ell(cx - 40, cy - 40, cx + 40, cy + 40, (176, 170, 160))
        self.base = Image.alpha_composite(darken(p.done(), .42), glow(900, 300, 900, (236, 152, 60), 90))

    def render(self, t, ctx):
        img = self.base.copy()
        u = t - ctx.word_time(self.params["talk_word"])
        if u > 0:
            layer = Image.new("RGBA", (W, H), (0, 0, 0, 0))
            d = ImageDraw.Draw(layer)
            cx, cy = self.C
            for i in range(3):
                r = 290 + ((u * 160 + i * 90) % 270)
                a = int(150 * (1 - (r - 290) / 270))
                d.arc((cx - r, cy - r, cx + r, cy + r), 200, 340, fill=(240, 190, 110, a), width=8)
                d.arc((cx - r, cy - r, cx + r, cy + r), 20, 160, fill=(240, 190, 110, a), width=8)
            img = Image.alpha_composite(img, layer)
        return img


class ChoiceScene(Scene):
    def __init__(self, params, thumbs):
        super().__init__(params)
        self.thumbs = thumbs

    def panel(self, img, y, letter, title, sub, thumb, active):
        x0, x1, h = 60, 1020, 380
        th = thumb.convert("RGB").crop((0, 260, W, 260 + int(W * h / (x1 - x0)))).resize((x1 - x0, h))
        th = ImageEnhance.Brightness(th).enhance(.55 if active else .3)
        mask = Image.new("L", th.size, 0)
        ImageDraw.Draw(mask).rounded_rectangle((0, 0, th.width, th.height), radius=24, fill=255)
        img.paste(th, (x0, y), mask)
        d = ImageDraw.Draw(img)
        d.rounded_rectangle((x0, y, x1, y + h), radius=24, outline=(240, 200, 60) if active else (70, 74, 84),
                            width=8 if active else 4)
        d.text((x0 + 36, y + 24), letter, font=font("bold", 80), fill=(250, 250, 250))
        d.text((x0 + 36, y + 250), title, font=font("bold", 44), fill=(250, 250, 250))
        d.text((x0 + 36, y + 306), sub, font=font("bold", 32), fill=(240, 200, 60))

    def render(self, t, ctx):
        img = Image.new("RGBA", (W, H), (16, 18, 24, 255))
        d = ImageDraw.Draw(img)
        f = font("bold", 64)
        a, b = "ЧТО ДЕЛАТЬ ", "ДИМЕ?"
        wa = d.textlength(a, font=f)
        x = (W - wa - d.textlength(b, font=f)) / 2
        d.text((x, 150), a, font=f, fill=(250, 250, 250))
        d.text((x + wa, 150), b, font=f, fill=(232, 52, 48))
        final = self.params.get("final")
        on_b = final or ("b_word" in self.params and t >= ctx.word_time(self.params["b_word"]))
        self.panel(img, 270, "А", "ОТКРЫТЬ ДВЕРЬ", "ЭТО ЖЕ ГОЛОС ПЕТРОВИЧА", self.thumbs["a"], final or not on_b)
        self.panel(img, 690, "Б", "ИДТИ К ЛОКОМОТИВУ", "12 ВАГОНОВ В ТЕМНОТЕ", self.thumbs["b"], on_b)
        if final:
            d.text((W / 2, 1720), "ЧАСТЬ 2 — СКОРО", font=font("bold", 44), fill=(240, 200, 60), anchor="mm")
        return img


# ------------------------------------------------------------------ тайминг

PUNCT = ".,!?:;—«»…\"()"


def norm(word):
    return word.lower().replace("ё", "е").strip(PUNCT + "-")


def read_mono(path):
    with wave.open(str(path)) as wf:
        pcm = np.frombuffer(wf.readframes(wf.getnframes()), "<i2").astype(float) / 32768
        if wf.getnchannels() == 2:
            pcm = pcm.reshape(-1, 2).mean(1)
        return pcm, wf.getframerate()


class Segment:
    aligned = False

    def __init__(self, data, start):
        self.data, self.id, self.start = data, data["id"], start
        self.words = data["text"].split()
        weights = []
        for w in self.words:
            core = len(w.strip(PUNCT)) or 1
            bonus = 7 if w.rstrip("»\"").endswith((".", "?", "!", "…")) else 3 if w.endswith((",", ":", "—")) or w == "—" else 0
            weights.append(core + 1 + bonus)
        voice = VOICE / f"{self.id}.wav"
        cum = np.concatenate([[0], np.cumsum(weights)[:-1]]) / sum(weights)
        self.voice = voice if voice.exists() else None
        cues = voice.with_suffix(".cues.json")
        if self.voice:
            pcm, rate = read_mono(voice)
            self.speech = len(pcm) / rate
            if cues.exists():
                self.word_starts = LEAD + self.from_cues(json.loads(cues.read_text(encoding="utf-8")), weights)
            else:
                self.word_starts = LEAD + self.align(pcm, rate, cum)
        else:
            self.speech = sum(weights) / CHARS_PER_SEC
            self.word_starts = LEAD + cum * self.speech
        self.dur = LEAD + self.speech + data.get("pause", .45)
        self.red = {norm(r) for r in data.get("red", [])}
        self.pages = self.paginate()
        self.events = [dict(e, t=self.event_time(e)) for e in data.get("events", [])]
        self.labels = [dict(lb, t=self.event_time(lb)) for lb in data.get("labels", [])]

    def paginate(self, limit=60):
        """Делит текст на экраны поровну; разрыв лучше всего после точки, хуже — посреди фразы."""
        n = len(self.words)
        lens = [len(w) + 1 for w in self.words]
        pages_n = math.ceil(sum(lens) / limit)
        target = sum(lens) / pages_n

        def penalty(i):  # разрыв после слова i
            w = self.words[i].rstrip("»\"")
            return 0 if w.endswith((".", "?", "!", "…")) else 60 if w.endswith((",", ":", "—")) else 600

        best = {0: (0.0, [])}
        for end in range(1, n + 1):
            options = []
            for start in best:
                length = sum(lens[start:end])
                if start < end and length <= limit + 16:
                    cost = best[start][0] + (length - target) ** 2 + (penalty(end - 1) if end < n else 0)
                    options.append((cost, best[start][1] + [list(range(start, end))]))
            if options:
                best[end] = min(options, key=lambda o: o[0])
        return best[n][1]

    def from_cues(self, cues, weights):
        """Тайминг из субтитров озвучки (SRT ElevenLabs): каждая фраза — свой отрезок,
        слова внутри фразы — по длине."""
        times, i = [], 0
        for cue in cues:
            n = len(cue["text"].split())
            w = np.array(weights[i:i + n], float)
            local = np.concatenate([[0], np.cumsum(w)[:-1]]) / w.sum()
            times.extend(cue["start"] + local * (cue["end"] - cue["start"]))
            i += n
        if i != len(self.words):
            raise SystemExit(f"Сегмент {self.id}: текст в .cues.json не совпадает с story.json")
        self.aligned = True
        return np.array(times)

    def align(self, pcm, rate, cum):
        """Привязывает фразы к паузам в записи: слова после знака препинания начинаются
        с очередного куска речи. Если число пауз не совпало с числом фраз — равномерно."""
        hop = int(rate * .01)
        rms = np.sqrt(np.convolve(pcm ** 2, np.ones(hop) / hop, mode="same")[::hop])
        voiced = rms > 10 ** (-40 / 20)
        starts, run = [], 0
        for i, v in enumerate(voiced):
            if v and (not starts or run >= 12):  # пауза ≥ 0.12 с — новый кусок речи
                starts.append(i * .01)
            run = 0 if v else run + 1
        phrase_starts = [0] + [i + 1 for i, w in enumerate(self.words[:-1])
                               if w.rstrip("»\"").endswith((".", "?", "!", "…", ",", ":", "—")) or w == "—"]
        if len(starts) != len(phrase_starts):
            return cum * len(pcm) / rate
        ends = starts[1:] + [len(pcm) / rate]
        times = np.empty(len(self.words))
        bounds = phrase_starts + [len(self.words)]
        for k, (a, b) in enumerate(zip(bounds, bounds[1:])):
            local = cum[a:b] - cum[a]
            span = (cum[b] if b < len(cum) else 1.0) - cum[a]
            times[a:b] = starts[k] + local / span * (ends[k] - starts[k])
        self.aligned = True
        return times

    def word_time(self, word):
        target = norm(word)
        for w, t in zip(self.words, self.word_starts):
            if norm(w).startswith(target):
                return t
        raise SystemExit(f"Сегмент {self.id}: слово «{word}» не найдено в тексте")

    def event_time(self, e):
        if "word" in e:
            return self.word_time(e["word"]) + e.get("offset", 0)
        return e.get("at", 0)

    def flash_level(self, t, hold=.4):
        level = 0.0
        for e in self.events:
            if e["type"] == "flash" and t >= e["t"]:
                u = t - e["t"]
                level = max(level, 1.0 if u < .12 else hold + (1 - hold) * math.exp(-(u - .12) / .35))
        return level


# ------------------------------------------------------------------ оформление

def bottom_shade():
    a = np.zeros((H, W, 4), np.uint8)
    a[..., :3] = (34, 36, 42)
    ys = np.arange(H)
    a[..., 3] = np.clip((ys - 1000) / 260, 0, 1)[:, None] * 238
    return Image.fromarray(a, "RGBA")


@lru_cache(None)
def caption(seg_id, page, spoken, words, red):
    f = font("bold", 68)
    img = Image.new("RGBA", (W, H), (0, 0, 0, 0))
    d = ImageDraw.Draw(img)
    space = d.textlength(" ", font=f)
    lines, line, width = [], [], 0
    for i in page:
        wl = d.textlength(words[i].upper(), font=f)
        if line and width + space + wl > 950:
            lines.append(line)
            line, width = [], 0
        width += (space if line else 0) + wl
        line.append((i, wl))
    lines.append(line)
    y = 1330 - len(lines) * 84 / 2
    for line in lines:
        x = (W - (sum(wl for _, wl in line) + space * (len(line) - 1))) / 2
        for i, wl in line:
            if i < spoken:
                color = (236, 50, 46) if norm(words[i]) in red else (250, 250, 250)
            else:
                color = (112, 116, 124)
            d.text((x, y), words[i].upper(), font=f, fill=color, stroke_width=7, stroke_fill=(20, 22, 26))
            x += wl + space
        y += 84
    return img


@lru_cache(None)
def hud(title, label, place, time, count):
    img = Image.new("RGBA", (W, H), (0, 0, 0, 0))
    d = ImageDraw.Draw(img)
    top = " · ".join([" ".join(place), " ".join(time)])
    d.text((W / 2, 148), top, font=font("mono", 30), fill=(212, 216, 222), anchor="mm", stroke_width=2, stroke_fill=(20, 22, 26))
    tf = font("bold", 42)
    tw = d.textlength(title, font=tf)
    tag = Image.new("RGBA", (int(tw + 70), 80), (0, 0, 0, 0))
    td = ImageDraw.Draw(tag)
    td.rounded_rectangle((0, 0, tag.width - 1, 79), radius=14, fill=(232, 222, 196))
    td.text((tag.width / 2, 40), title, font=tf, fill=(28, 28, 30), anchor="mm")
    tag = tag.rotate(2, resample=Image.BICUBIC, expand=True)
    img.alpha_composite(tag, (int((W - tag.width) / 2), 182))
    cf = font("mono", 32)
    text = f"{label}: {count}"
    cw = d.textlength(text, font=cf) + 40 + max(count, 1) * 16
    x0 = (W - cw) / 2
    d.rounded_rectangle((x0, 286, x0 + cw, 344), radius=29, fill=(20, 22, 28, 230))
    d.text((x0 + 22, 315), text, font=cf, fill=(240, 240, 240), anchor="lm")
    bx = x0 + 30 + d.textlength(text, font=cf)
    for i in range(count):
        d.rounded_rectangle((bx + i * 16, 300, bx + i * 16 + 10, 330), radius=3, fill=(226, 60, 50))
    return img


def label_img(text, k):
    f = font("bold", 34)
    w = int(ImageDraw.Draw(Image.new("RGB", (1, 1))).textlength(text, font=f) + 44)
    img = Image.new("RGBA", (w, 62), (0, 0, 0, 0))
    d = ImageDraw.Draw(img)
    d.rounded_rectangle((0, 0, w - 1, 61), radius=12, fill=(240, 200, 60))
    d.text((w / 2, 31), text, font=f, fill=(24, 24, 26), anchor="mm")
    if k < 1:
        s = .6 + .4 * k
        img = img.resize((max(1, int(img.width * s)), max(1, int(img.height * s))))
    return img


# ------------------------------------------------------------------ сборка

SCENES = {"train": TrainScene, "corridor": CorridorScene, "tambour": TambourScene, "conductor": ConductorScene,
          "window": WindowScene, "journal": JournalScene, "footprints": FootprintsScene, "circle": CircleScene,
          "speaker": SpeakerScene}


def build_timeline(story):
    segs, t = [], 0.0
    for data in story["segments"]:
        seg = Segment(data, t)
        segs.append(seg)
        t += seg.dur
    return segs, t


def make_scenes(segs):
    scenes = {}
    thumbs = None
    for seg in segs:
        name = seg.data["scene"]
        if name == "choice":
            if thumbs is None:
                ctx_stub = segs[0]
                thumbs = {"a": TambourScene({}).render(0, ctx_stub),
                          "b": CorridorScene({"lights": "off"}).render(0, ctx_stub)}
            scenes[seg.id] = ChoiceScene(seg.data["params"], thumbs)
        else:
            scenes[seg.id] = SCENES[name](seg.data["params"])
    return scenes


def compose(seg, scene, t, title, label, shade):
    img = scene.render(t, seg).convert("RGB")
    is_choice = isinstance(scene, ChoiceScene)
    if not is_choice:
        z = 1 + .035 * t / seg.dur
        dx = dy = 0.0
        for e in seg.events:
            if e["type"] == "knock" and 0 <= t - e["t"] < .28:
                u = 1 - (t - e["t"]) / .28
                dx, dy = 14 * u * math.sin(t * 90), 8 * u * math.cos(t * 70)
        cw, ch = W / z, H / z
        cx, cy = W / 2 + dx, 700 + (H / 2 - 700) / z + dy
        img = img.crop((cx - cw / 2, cy - ch / 2, cx + cw / 2, cy + ch / 2)).resize((W, H), Image.BILINEAR)
        fl = seg.flash_level(t, hold=0)
        if fl > .05:
            img = Image.blend(img, Image.new("RGB", (W, H), (214, 228, 250)), .55 * fl)
    img = img.convert("RGBA")
    if not is_choice:
        img.alpha_composite(shade)
    hd = seg.data.get("hud")
    if hd:
        knocks = sum(1 for e in seg.events if e["type"] == "knock" and t >= e["t"])
        img.alpha_composite(hud(title, label, hd["place"], hd["time"], hd["count"] + knocks))
    for lb in seg.labels:
        if t >= lb["t"]:
            li = label_img(lb["text"], min(1, (t - lb["t"]) / .15))
            img.alpha_composite(li, (int(lb["x"] - li.width / 2), int(lb["y"] - li.height / 2)))
    spoken = int(np.searchsorted(seg.word_starts, t, side="right"))
    page = next((pg for pg in reversed(seg.pages) if seg.word_starts[pg[0]] <= max(t, seg.word_starts[0])), seg.pages[0])
    img.alpha_composite(caption(seg.id, tuple(page), spoken, tuple(seg.words), frozenset(seg.red)))
    return img.convert("RGB")


def render_video(story, segs, total, scenes, path, only=None):
    shade = bottom_shade()
    chosen = [s for s in segs if only is None or s.id in only]
    proc = subprocess.Popen(
        ["ffmpeg", "-y", "-loglevel", "error", "-f", "rawvideo", "-pix_fmt", "rgb24", "-s", f"{W}x{H}",
         "-r", str(FPS), "-i", "-", "-c:v", "libx264", "-preset", "medium", "-crf", "20",
         "-pix_fmt", "yuv420p", str(path)], stdin=subprocess.PIPE)
    for seg in chosen:
        for i in range(int(round(seg.dur * FPS))):
            frame = compose(seg, scenes[seg.id], i / FPS, story["title"], story["counter_label"], shade)
            proc.stdin.write(frame.tobytes())
        print(f"  сегмент {seg.id} готов", flush=True)
    proc.stdin.close()
    if proc.wait():
        raise SystemExit("ffmpeg: ошибка кодирования видео")
    return sum(int(round(s.dur * FPS)) for s in chosen) / FPS


def snd_lock(_=None):
    return synth.metal_hit(.5, 620, .05)


def snd_drone(duration):
    t = synth.t_axis(duration)
    am = .6 + .4 * np.sin(2 * np.pi * .07 * t)
    s = np.sin(2 * np.pi * 55 * t) + .5 * np.sin(2 * np.pi * 82.4 * t + 1) + .3 * synth.norm(
        synth.band(synth.rng.standard_normal(len(t)), 60, 300))
    return synth.norm(s * am)


def render_audio(segs, total, path, only=None):
    chosen = [s for s in segs if only is None or s.id in only]
    offset = {s.id: sum(x.dur for x in chosen[:i]) for i, s in enumerate(chosen)}
    length = sum(s.dur for s in chosen) + .5
    n = int(length * SR)
    mix = np.zeros((n, 2))
    db = synth.db

    def place(mono, at, gain, pan=0.0):
        s = int(at * SR)
        if s >= n:
            return
        seg = mono[: n - s] * db(gain)
        mix[s:s + len(seg), 0] += seg * (1 - max(pan, 0))
        mix[s:s + len(seg), 1] += seg * (1 + min(pan, 0))

    wind_db = []
    for s in chosen:
        name = s.data["scene"]
        level = -15 if name in ("train", "footprints", "circle") else -30 if name == "choice" else -23
        wind_db += [(offset[s.id] + .05, level), (offset[s.id] + s.dur - .05, level)]
    times, gains = zip(*wind_db)
    level = db(np.interp(synth.t_axis(length), times, gains))
    mix += synth.snd_wind(length) * level[:, None]

    drone_from = next((offset[s.id] for s in chosen if s.data["scene"] not in ("train",)), None)
    if drone_from is not None:
        place(snd_drone(length - drone_from) * np.clip(synth.t_axis(length - drone_from) / 3, 0, 1), drone_from, -30)

    cues = {"brake_screech": synth.snd_brake, "power_down": synth.snd_power_down, "relay_click": synth.snd_relay,
            "pa_static": synth.snd_pa_static, "bass_hit": synth.snd_bass_hit, "lock": snd_lock}
    for s in chosen:
        base = offset[s.id]
        if s.data["scene"] == "train" and s.data["params"].get("moving"):
            place(synth.snd_train_run(s.dur + .1)[: int(s.dur * SR)], base, -14)
        for e in s.events:
            at = base + e["t"]
            if e["type"] == "knock":
                place(synth.snd_knock_metal() if e.get("metal") else synth.snd_knock_glass(), at, -4,
                      0 if e.get("metal") else -.2)
            elif e["type"] == "flash":
                place(synth.snd_arc(.5), at, -9)
            elif e["type"] == "sfx":
                fn = cues[e["cue"]]
                place(fn(e.get("dur", 2.5)), at, e.get("gain", -12))
        if s.voice:
            with wave.open(str(s.voice)) as wf:
                pcm = np.frombuffer(wf.readframes(wf.getnframes()), "<i2").astype(float) / 32768
                if wf.getnchannels() == 2:
                    pcm = pcm.reshape(-1, 2).mean(1)
            place(pcm, base + LEAD, 0)

    peak = np.max(np.abs(mix))
    if peak > db(-1):
        mix *= db(-1) / peak
    synth.write_wav(path, mix)


def main():
    ap = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument("--preview", nargs=2, metavar=("ОТ", "ДО"), help="рендер только сегментов с ОТ по ДО")
    ap.add_argument("--stills", action="store_true", help="по одному кадру из каждого сегмента")
    args = ap.parse_args()

    story = json.loads((HERE / "story.json").read_text(encoding="utf-8"))
    segs, total = build_timeline(story)
    print(f"Сегментов: {len(segs)}, хронометраж {total:.1f} с"
          + ("" if any(s.voice for s in segs) else " (оценка по тексту, без голоса)"))
    scenes = make_scenes(segs)
    OUT.mkdir(exist_ok=True)

    if args.stills:
        (OUT / "stills").mkdir(exist_ok=True)
        shade = bottom_shade()
        for seg in segs:
            t = min(seg.dur - .05, seg.word_starts[-1] + .2)
            compose(seg, scenes[seg.id], t, story["title"], story["counter_label"], shade).save(OUT / "stills" / f"{seg.id}.jpg", quality=88)
        print("кадры →", OUT / "stills")
        return

    only = None
    name = "train317_part1"
    if args.preview:
        a, b = (int(x) for x in args.preview)
        only = {s.id for s in segs if a <= int(s.id) <= b}
        name = f"preview_{a:02d}-{b:02d}"
    video, audio = OUT / f"_{name}_video.mp4", OUT / f"_{name}_audio.wav"
    render_video(story, segs, total, scenes, video, only)
    render_audio(segs, total, audio, only)
    subprocess.run(["ffmpeg", "-y", "-loglevel", "error", "-i", str(video), "-i", str(audio), "-c:v", "copy",
                    "-c:a", "aac", "-b:a", "192k", "-shortest", "-movflags", "+faststart", str(OUT / f"{name}.mp4")],
                   check=True)
    video.unlink()
    audio.unlink()
    print("готово →", OUT / f"{name}.mp4")


if __name__ == "__main__":
    main()
