"""Сцены части 4 («Савельев»): персонажи-риги, флешбэк 1954, кабина, улики.

Каждая сцена — класс с render(t, ctx): t — время от начала сегмента, ctx — Segment из render.py
(word_time, mouth(speaker, t), flash_level). Камера (микротряска, наезды) — в render.compose.
"""

import math

import numpy as np
from PIL import Image, ImageDraw, ImageEnhance, ImageFilter

import render as R
import rig

W, H = R.W, R.H
BLUE_FLAME = (120, 160, 255)
WARM = (216, 176, 96)


def put(img, spr, x, y):
    """Наложить спрайт с альфой в любой точке, даже если он вылезает за край."""
    x, y = int(round(x)), int(round(y))
    sx, sy = max(0, -x), max(0, -y)
    w, h = min(spr.width - sx, img.width - max(x, 0)), min(spr.height - sy, img.height - max(y, 0))
    if w > 0 and h > 0:
        img.alpha_composite(spr.crop((sx, sy, sx + w, sy + h)), (max(x, 0), max(y, 0)))


def alpha(img, k):
    img = img.copy()
    img.putalpha(img.getchannel("A").point(lambda v: v * max(0.0, min(1.0, k))))
    return img


def zoom(img, z, cx=W / 2, cy=H / 2):
    if abs(z - 1) < 1e-3:
        return img
    cw, ch = W / z, H / z
    return img.crop((cx - cw / 2, cy - ch / 2, cx + cw / 2, cy + ch / 2)).resize((W, H), Image.BICUBIC)


def wt(ctx, word, default=None):
    try:
        return ctx.word_time(word)
    except SystemExit:
        return default


# ------------------------------------------------------------------ персонажи в стиле частей 1–3


def _k(h, base):
    return h / base


def flat_savelyev(t, P, w=600, h=900):
    """Савельев по пояс, плоско, как Петрович из части 1: седой, рубашка с подтяжками, ружьё."""
    p = R.Painter(size=(w, h))
    k = _k(h, 900)
    x = w / 2
    br = .5 - .5 * math.cos(2 * math.pi * t / P.get("breath_period", 3.8))
    doze = P.get("doze", 0.0)
    hy = 230 * k + doze * 40 * k - br * 3 * k
    tx = P.get("turn", 0.0) * 16 * k
    shirt, shirt_d, skin, grey = (200, 192, 168), (156, 148, 128), (204, 160, 128), (196, 194, 188)
    p.rect(x - 110 * k, 340 * k, x + 110 * k, h, shirt, r=34 * k)                      # рубашка
    p.rect(x + 10 * k, 350 * k, x + 110 * k, h, shirt_d, r=30 * k)
    for sgn in (-1, 1):
        p.rect(x + sgn * 62 * k - 10 * k, 345 * k, x + sgn * 62 * k + 10 * k, h, (60, 50, 44))   # подтяжки
    p.line([(x - 14 * k, 350 * k), (x, 470 * k), (x + 14 * k, 350 * k)], (40, 36, 30), 3 * k)
    p.ell(x - 8 * k, 466 * k, x + 8 * k, 490 * k, (186, 170, 110))                     # ключ на шнурке
    p.rect(x - 22 * k, hy + 50 * k, x + 22 * k, 350 * k, skin)                          # шея
    gun = P.get("gun", "knees")
    arm = (190, 144, 112)
    if gun == "knees":
        gy = 760 * k
        p.rect(x - 230 * k, gy, x - 40 * k, gy + 34 * k, (96, 60, 36), r=10 * k)
        p.rect(x - 50 * k, gy + 4 * k, x + 260 * k, gy + 18 * k, (44, 46, 50))
        p.rect(x - 50 * k, gy + 18 * k, x + 260 * k, gy + 30 * k, (56, 58, 62))
        hands = [(x - 140 * k, gy + 14 * k), (x + 90 * k, gy + 12 * k)]
    elif gun == "none":
        hands = [(x - 120 * k, 790 * k), (x + 110 * k, 790 * k)]
    else:
        up = P.get("gun_up_k", 1.0)
        gy = 600 * k - up * 60 * k
        hands = [(x - 90 * k, gy + 90 * k), (x + 80 * k, gy + 80 * k)]
        for sgn in (-1, 1):
            r = 48 * k * (.6 + .4 * up)
            p.ell(x + sgn * 52 * k - r, gy - r, x + sgn * 52 * k + r, gy + r, (90, 94, 102))
            p.ell(x + sgn * 52 * k - r * .6, gy - r * .6, x + sgn * 52 * k + r * .6, gy + r * .6, (0, 0, 0))
    sq = 1 - .08 * P.get("squeeze", 0.0)
    for i, (hx, hy_) in enumerate(hands):
        sx = x + (-100 if i == 0 else 100) * k
        p.line([(sx, 380 * k), (sx + (hx - sx) * .3, 600 * k), (hx, hy_)], shirt, 40 * k)
        p.line([(sx + (hx - sx) * .3, 610 * k), (hx, hy_)], arm, 30 * k)
        p.ell(hx - 26 * k * sq, hy_ - 20 * k, hx + 26 * k * sq, hy_ + 20 * k, arm)
    p.ell(x - 64 * k, hy - 70 * k, x + 64 * k, hy + 72 * k, skin)                      # голова
    p.rect(x - 66 * k, hy - 80 * k, x + 66 * k, hy - 40 * k, grey, r=22 * k)            # седина
    for sgn in (-1, 1):
        p.rect(x + sgn * 62 * k - 7 * k, hy - 50 * k, x + sgn * 62 * k + 7 * k, hy, grey, r=4 * k)
    for sgn in (-1, 1):                                                                  # густые седые брови
        p.rect(x + tx + sgn * 26 * k - 18 * k, hy - 26 * k, x + tx + sgn * 26 * k + 18 * k, hy - 18 * k, grey, r=3 * k)
    look = P.get("look", (0, 0))
    eyes_closed = P.get("eyes_closed") or P.get("blink", 0) > .5
    for sgn in (-1, 1):
        ex, ey = x + tx + sgn * 26 * k, hy - 6 * k
        if eyes_closed:
            p.rect(ex - 9 * k, ey - 1 * k, ex + 9 * k, ey + 2 * k, (40, 30, 26))
        else:
            if P.get("wide"):
                p.ell(ex - 11 * k, ey - 9 * k, ex + 11 * k, ey + 9 * k, (226, 222, 214))
            px, py = ex + look[0] * 5 * k, ey + look[1] * 4 * k
            p.ell(px - 6 * k, py - 6 * k, px + 6 * k, py + 6 * k, (26, 24, 22))
    rng = np.random.default_rng(3)
    for sx_, sy_ in rng.uniform([-44, 20], [44, 62], (40, 2)):                          # щетина
        p.ell(x + tx + sx_ * k - 1.5 * k, hy + sy_ * k - 1.5 * k, x + tx + sx_ * k + 1.5 * k, hy + sy_ * k + 1.5 * k, (130, 122, 112))
    for sgn in (-1, 1):                                                                  # морщины от носа ко рту
        p.line([(x + tx + sgn * 12 * k, hy + 14 * k), (x + tx + sgn * 22 * k, hy + 40 * k)], (150, 110, 88), 3 * k)
    mo = max(0.0, min(1.0, P.get("mouth", 0.0)))
    p.rect(x + tx - 16 * k, hy + 40 * k, x + tx + 16 * k, hy + 43 * k + 14 * k * mo, (60, 26, 22), r=3 * k)
    rub = P.get("rub", 0.0)
    if rub > 0:
        rx = x + tx + 14 * k * math.sin(t * 9)
        p.line([(x + 100 * k, 380 * k), (x + 80 * k, 520 * k), (rx + 20 * k, hy + 60 * k)], shirt, 40 * k * rub)
        p.ell(rx - 30 * k, hy + 30 * k, rx + 30 * k, hy + 70 * k, arm)
    return R.darken(p.done(), .55 + .45 * P.get("light", 1.0)), {"mouth": (x, hy + 40 * k)}


def flat_dima(t, P, w=600, h=900):
    """Дима спереди, плоско: ёжик, бушлат хаки с поднятым воротником, тельняшка, зажигалка в правой руке."""
    p = R.Painter(size=(w, h))
    k = _k(h, 900)
    x = w / 2 + P.get("tilt", 0.0) * 2 * k
    br = .5 - .5 * math.cos(2 * math.pi * t / P.get("breath_period", 1.5))
    hy = 230 * k - br * 4 * k
    khaki, khaki_d, skin = (74, 80, 64), (52, 56, 46), (210, 166, 136)
    p.rect(x - 120 * k, 340 * k, x + 120 * k, h, khaki, r=36 * k)
    p.rect(x + 10 * k, 350 * k, x + 120 * k, h, khaki_d, r=30 * k)
    p.poly([(x - 34 * k, 340 * k), (x + 34 * k, 340 * k), (x, 430 * k)], (230, 232, 236))
    for i in range(4):
        y = 350 * k + i * 20 * k
        half = 30 * k * (1 - (y - 340 * k) / (90 * k))
        p.rect(x - half, y, x + half, y + 7 * k, (40, 60, 120))
    for sgn in (-1, 1):                                                                  # поднятый воротник
        p.poly([(x + sgn * 30 * k, 345 * k), (x + sgn * 90 * k, 350 * k), (x + sgn * 80 * k, 280 * k), (x + sgn * 44 * k, 290 * k)], (60, 66, 52))
    for j in range(3):
        p.ell(x + 8 * k, 480 * k + j * 90 * k, x + 18 * k, 490 * k + j * 90 * k, (60, 58, 40))
    p.rect(x - 22 * k, hy + 50 * k, x + 22 * k, 345 * k, skin)
    pts = {}
    if P.get("lighter", True):
        hx = x + 70 * k + P.get("tremor", 0.0) * 3 * k * math.sin(t * 50)
        hy2 = 600 * k
        p.line([(x + 110 * k, 380 * k), (x + 120 * k, 560 * k), (hx, hy2)], khaki, 40 * k)
        p.rect(hx - 10 * k, hy2 - 52 * k, hx + 10 * k, hy2 - 12 * k, (40, 40, 46))
        p.ell(hx - 26 * k, hy2 - 22 * k, hx + 26 * k, hy2 + 20 * k, skin)
        pts["flame"] = (hx, hy2 - 56 * k)
    lr = P.get("left_raise", 0.0)
    if lr > 0:
        hx, hy3 = x - 150 * k - lr * 10 * k, 640 * k - lr * 400 * k
        p.line([(x - 110 * k, 380 * k), (x - 160 * k, 560 * k - lr * 140 * k), (hx, hy3)], khaki, 40 * k)
        p.ell(hx - 24 * k, hy3 - 30 * k, hx + 24 * k, hy3 + 24 * k, skin)
        for i in range(4):
            fx = hx - 16 * k + i * 11 * k
            p.line([(fx, hy3 - 24 * k), (fx, hy3 - 58 * k)], skin, 9 * k)
    p.ell(x - 58 * k, hy - 70 * k, x + 58 * k, hy + 70 * k, skin)                     # голова
    p.rect(x - 58 * k, hy - 74 * k, x + 58 * k, hy - 36 * k, (58, 46, 36), r=24 * k)   # ёжик
    tx = P.get("turn", 0.0) * 14 * k
    eyes_closed = P.get("blink", 0) > .5
    for sgn in (-1, 1):
        ex, ey = x + tx + sgn * 24 * k, hy - 6 * k
        p.rect(ex - 14 * k, ey - 22 * k, ex + 14 * k, ey - 16 * k, (70, 54, 42), r=2 * k)      # брови
        if P.get("frost", 0) > 0:
            for j in range(4):
                p.ell(ex - 13 * k + j * 8 * k, ey - 25 * k, ex - 10 * k + j * 8 * k, ey - 21 * k, (230, 236, 246))
        if eyes_closed:
            p.rect(ex - 8 * k, ey - 1 * k, ex + 8 * k, ey + 2 * k, (40, 30, 26))
        else:
            if P.get("wide"):
                p.ell(ex - 10 * k, ey - 8 * k, ex + 10 * k, ey + 8 * k, (226, 222, 214))
            look = P.get("look", (0, 0))
            px, py = ex + look[0] * 4 * k, ey + look[1] * 3 * k
            p.ell(px - 5 * k, py - 5 * k, px + 5 * k, py + 5 * k, (26, 24, 22))
    mo = max(0.0, min(1.0, P.get("mouth", 0.0)))
    p.rect(x + tx - 14 * k, hy + 38 * k, x + tx + 14 * k, hy + 41 * k + 14 * k * mo, (110, 50, 46), r=3 * k)
    pts["mouth"] = (x + tx, hy + 40 * k)
    pts["eyes_y"] = hy
    return R.darken(p.done(), .35 + .65 * P.get("light", 1.0)), pts


def flat_mimic(t, P, w=700, h=1500):
    """Оно — тот же высокий тонкий силуэт без лица, что в частях 1–3. Руки до колен, пальцы длинные.
    left_raise / tilt — копия позы Димы с задержкой. Мокрые блики, с пальцев капает."""
    p = R.Painter(size=(w, h))
    x, feet, hh = (w / 2, h - 10, h * .72) if P.get("full") else (w / 2, h + 200, h + 200)
    k = hh / 1000
    c = (8, 8, 12)
    tilt = P.get("tilt", 0.0)
    hx = x + tilt * 3 * k
    p.ell(hx - 20 * k, feet - hh, hx + 20 * k, feet - hh + 72 * k, c)
    p.rect(x - 8 * k, feet - hh + 60 * k, x + 8 * k, feet - hh + 125 * k, c)
    p.ell(x - 60 * k, feet - hh + 110 * k, x + 60 * k, feet - hh + 170 * k, c)
    p.poly([(x - 56 * k, feet - hh + 135 * k), (x + 56 * k, feet - hh + 135 * k), (x + 32 * k, feet - hh + 640 * k), (x - 32 * k, feet - hh + 640 * k)], c)
    for sgn in (-1, 1):                                                              # ноги
        p.line([(x + sgn * 16 * k, feet - hh + 630 * k), (x + sgn * 20 * k, feet)], c, 22 * k)
    lr = P.get("left_raise", 0.0)
    tips = []
    for sgn, raise_ in ((-1, lr), (1, P.get("right_raise", 0.0))):
        spread = P.get("spread", 0.0)                       # руки вскинуты вверх и в стороны
        sx, sy = x + sgn * 54 * k, feet - hh + 145 * k
        ex, ey = x + sgn * (70 + 120 * spread) * k, sy + (340 - 260 * raise_ - 120 * spread) * k
        hx2, hy2 = x + sgn * (66 + 30 * raise_ + 260 * spread) * k, sy + (680 - 760 * raise_ - 220 * spread) * k
        p.line([(sx, sy), (ex, ey), (hx2, hy2)], c, 18 * k)
        for i in range(4):
            fx = hx2 - 9 * k + i * 6 * k
            fy2 = hy2 + (60 if raise_ < .5 else -70) * k
            p.line([(fx, hy2), (fx + (i - 1.5) * 3 * k, fy2)], c, 4 * k)
            tips.append((fx, fy2))
    img = p.done()
    d = ImageDraw.Draw(img)
    for j in range(3):
        u = (t * .25 + j / 3) % 1
        y = feet - hh + 150 * k + u * 450 * k
        d.line([(x - 50 * k + u * 20 * k, y), (x - 46 * k + u * 20 * k, y + 50 * k)], fill=(58, 74, 90, 170), width=4)
    for i, (fx, fy) in enumerate(tips[:4]):
        u = (t * 1.1 + i * .23) % 1
        d.ellipse((fx - 4, fy + 90 * u, fx + 4, fy + 90 * u + 10), fill=(10, 10, 14, int(255 * (1 - u))))
    return img


def flat_boy(t, P, w=500, h=600):
    """Мальчик-1954: огромный отцовский тулуп, шапка сползает на глаза. Плоско, без деталей."""
    p = R.Painter(size=(w, h))
    x = w / 2
    sit = P.get("pose", "sit") == "sit"
    top = h * (.32 if sit else .22)
    p.poly([(x - 90, top + 60), (x + 90, top + 60), (x + 170, h - 10), (x - 170, h - 10)], (120, 84, 50))
    p.poly([(x + 20, top + 64), (x + 90, top + 60), (x + 170, h - 10), (x + 70, h - 10)], (86, 60, 36))
    p.ell(x - 100, top + 40, x + 100, top + 90, (204, 188, 154))
    p.ell(x - 46, top - 50, x + 46, top + 44, (210, 170, 140))
    hat = P.get("hat", 0.0)
    hy = top - 60 + hat * 26
    p.ell(x - 56, hy - 30, x + 56, hy + 34, (84, 66, 50))
    p.rect(x - 58, hy + 10, x + 58, hy + 30, (204, 188, 154), r=8)
    if hat < .7:
        for sgn in (-1, 1):
            p.ell(x + sgn * 18 - 4, top - 6, x + sgn * 18 + 4, top + 2, (30, 26, 22))
    return p.done(), {}


_DBACK = {}


def dima_back_sprite(scale=1.4, c=(40, 38, 42), k=.8):
    key = (scale, c, k)
    if key not in _DBACK:
        p = R.Painter(size=(800, 1000))
        R.dima_back(p, 400, 300, scale, c=c)
        _DBACK[key] = R.darken(p.done(), k)
    return _DBACK[key]


def dima_pose(t, ctx, **kw):
    """Поза Димы: моргание, микросаккады, дыхание испуганного (1.5 с), рот — по его репликам."""
    P = {"blink": 0.0 if kw.pop("scared", False) else rig.blink(t, 11), "saccade": tuple(rig.saccade(t, 12)),
         "mouth": ctx.mouth("dima", t), "breath_period": 1.5}
    P.update(kw)
    return P


def sav_pose(t, ctx, **kw):
    P = {"blink": rig.blink(t, 21), "saccade": tuple(rig.saccade(t, 22)), "mouth": ctx.mouth("savelyev", t),
         "light_from": "top", "light_side": "left", "breath_period": 3.8, "light": .9 * rig.flicker(t, 3) ** .5}
    P.update(kw)
    return P


def sparks(img, t0, t, x, y, n=40, seed=0, k=1.0):
    u = t - t0
    if not 0 <= u < .45:
        return img
    rng = np.random.default_rng(seed)
    d = ImageDraw.Draw(img)
    for vx, vy in rng.uniform([-1, -1.4], [1, .2], (n, 2)):
        px, py = x + vx * 420 * u, y + vy * 360 * u + 500 * u * u
        a = int(255 * (1 - u / .45) * k)
        d.ellipse((px - 3, py - 3, px + 3, py + 3), fill=(255, 220, 140, a))
    return img


# ------------------------------------------------------------------ 01–02: темнота, искры


class Dark4(R.Scene):
    def render(self, t, ctx):
        img = Image.new("RGBA", (W, H), (5, 5, 8, 255))
        pr = self.params
        _, ex = rig.breath(t, 1.2, seed=1)
        u = t - ex
        if 0 <= u < 1:  # пар изо рта едва виден
            layer = Image.new("RGBA", (W, H), (0, 0, 0, 0))
            d = ImageDraw.Draw(layer)
            r = 40 + 120 * u
            d.ellipse((560 - r, 760 - r - 120 * u, 560 + r, 760 + r - 120 * u), fill=(120, 130, 150, int(28 * (1 - u))))
            img = Image.alpha_composite(img, layer.filter(ImageFilter.GaussianBlur(20)))
        words = pr.get("sparks_words", [])
        light = 0.0
        for i, w in enumerate(words):
            tw = wt(ctx, w)
            if tw is not None and 0 <= t - tw < .12:
                light = max(light, 1.0 if i == 0 else .25)
        if words:  # рука с зажигалкой, дрожит; на «раз» — сноп искр освещает пальцы и кусок лица
            tx = 540 + 4 * math.sin(t * 50)        # пальцы трясутся
            fist = R.lighter_layer(t, int(tx), 760, scale=3.0, k=0)
            fist = ImageEnhance.Brightness(fist).enhance(.12 + .88 * light)
            img = Image.alpha_composite(img, fist)
            for i, w in enumerate(words):
                tw = wt(ctx, w)
                if tw is not None:
                    img = sparks(img, tw, t, tx, 800, n=50 if i == 0 else 6, seed=i, k=1 if i == 0 else .4)
            if light > 0:
                img = Image.alpha_composite(img, R.glow(tx, 800, 700, (255, 190, 110), int(160 * light)))
        return img


# ------------------------------------------------------------------ 03, 11: дверь кабины


class Cabdoor4(R.Scene):
    WIN = (430, 470, 650, 650)

    def __init__(self, params):
        super().__init__(params)
        p = R.Painter()
        p.rect(0, 0, W, H, (110, 104, 92))
        for x in range(0, W, 120):
            p.line([(x, 0), (x, H)], (100, 94, 84), 3)
        p.rect(240, 300, 840, 1180, (24, 22, 20))          # проём
        self.wall = R.darken(p.done(), .5)
        p = R.Painter(size=(600, 880))
        p.rect(0, 0, 600, 880, (70, 74, 80), r=8)
        p.rect(30, 30, 570, 870, (92, 98, 106), r=6)
        x0, y0, x1, y1 = [v - o for v, o in zip(self.WIN, (240, 300, 240, 300))]
        p.rect(x0 - 16, y0 - 16, x1 + 16, y1 + 16, (60, 64, 70), r=6)
        p.rect(x0, y0, x1, y1, (0, 0, 0, 0))
        p.rect(460, 460, 520, 520, (60, 62, 66), r=8)
        for ry in (60, 820):
            for rx in (60, 540):
                p.ell(rx - 8, ry - 8, rx + 8, ry + 8, (120, 124, 132))
        self.door = R.darken(p.done(), .5)
        p = R.Painter()
        p.rect(465, 535, 615, 585, (70, 72, 78), r=24)
        for cx in (505, 575):
            p.ell(cx - 36, 524, cx + 36, 596, (96, 100, 108))
            p.ell(cx - 26, 534, cx + 26, 586, (40, 42, 46))
            p.ell(cx - 17, 543, cx + 17, 577, (0, 0, 0))
        self.barrels = p.done()

    def render(self, t, ctx):
        pr = self.params
        img = self.wall.copy()
        t_open = wt(ctx, pr["open_word"]) if "open_word" in pr else None
        slide = rig.ease((t - t_open) / .45) if t_open is not None else 0.0
        if pr.get("warm_light") or slide > 0:  # тёплый свет кабины в проёме
            inner = Image.new("RGBA", (600, 880), WARM + (255,))
            inner = Image.alpha_composite(inner, R.glow(300, 300, 700, (255, 220, 150), 120, size=(600, 880)))
            put(img, alpha(inner, slide), 240, 300)
        x0, y0, x1, y1 = self.WIN
        win_light = Image.new("RGBA", (x1 - x0, y1 - y0), (40, 30, 20, 255))
        put(img, win_light, x0 - slide * 560, y0)
        if pr.get("barrels") and slide < .3:
            br = self.barrels if "barrels" in pr else None
            put(img, br, -slide * 560, 8 * rig.ease(t / 4))
        put(img, self.door, 240 + slide * 560, 300)
        if slide > 0:  # полоса тёплого света на полу и на Диме
            band = Image.new("RGBA", (W, H), (0, 0, 0, 0))
            ImageDraw.Draw(band).polygon([(240, 1180), (840, 1180), (1080, 1920), (0, 1920)], fill=WARM + (int(90 * slide),))
            img = Image.alpha_composite(img, band.filter(ImageFilter.GaussianBlur(30)))
        # Дима снизу: иней на бровях, расширенные зрачки, губы шевелятся (молится)
        flame_on = "flame_word" not in pr or t >= (wt(ctx, pr["flame_word"], 0) or 0)
        blue = pr.get("flame") == "blue"
        light = (.75 * rig.flicker(t, 5) if flame_on else .05) if not slide else .3 + .7 * slide
        lc = BLUE_FLAME if blue and not slide else (255, 210, 140)
        pull = rig.ease((t - t_open - .5) / .4) if t_open is not None else 0.0
        br = 6 * math.sin(2 * math.pi * t / 1.5)       # частое дыхание — плечи ходят
        put(img, alpha(dima_back_sprite(1.6), 1 - pull), 140 + pull * 60, 620 + br - pull * 520)
        if flame_on and not slide:
            fx, fy = 760, 1010 + br
            img = Image.alpha_composite(img, R.glow(fx, fy, 650, BLUE_FLAME if blue else (240, 160, 70), int(130 * light)))
            img = Image.alpha_composite(img, R.lighter_layer(t, fx, fy, blue=blue, scale=1.3))
            _, ex = rig.breath(t, 1.5, seed=1)
            u = t - ex
            if 0 <= u < 1:  # пар изо рта
                layer = Image.new("RGBA", (W, H), (0, 0, 0, 0))
                r = 30 + 90 * u
                ImageDraw.Draw(layer).ellipse((540 - r, 640 - r - 140 * u, 540 + r, 640 + r - 140 * u), fill=(200, 210, 230, int(70 * (1 - u))))
                img = Image.alpha_composite(img, layer.filter(ImageFilter.GaussianBlur(14)))
        if pull > 0:  # рука Савельева тянет за воротник
            d = ImageDraw.Draw(img)
            hx, hy = 560, 1000 - pull * 520
            d.rounded_rectangle((hx - 70, hy - 50, hx + 80, hy + 40), radius=30, fill=(200, 150, 110))
            d.line([(hx + 60, hy - 10), (760, 520)], fill=(200, 192, 168), width=70)
        return img


# ------------------------------------------------------------------ 04–10: вид из окошка кабины, выстрел


class CabdoorBehind(R.Scene):
    """Вид ИЗ окошка кабины поверх стволов: Дима в синем огоньке, за ним — оно."""

    WIN = (150, 260, 930, 1180)

    def __init__(self, params):
        super().__init__(params)
        p = R.Painter()
        p.rect(0, 0, W, H, (34, 36, 40))
        x0, y0, x1, y1 = self.WIN
        p.rect(x0 - 40, y0 - 40, x1 + 40, y1 + 40, (52, 56, 62), r=12)
        p.rect(x0, y0, x1, y1, (0, 0, 0, 0))
        for x in (x0 - 20, x1 + 20):
            for y in (y0 - 20, y1 + 20):
                p.ell(x - 8, y - 8, x + 8, y + 8, (90, 94, 100))
        self.frame = R.darken(p.done(), .6)
        p = R.Painter()
        for sgn in (-1, 1):  # стволы в упор к камере снизу
            p.poly([(540 + sgn * 30, 1350), (540 + sgn * 230, 1920), (540 + sgn * 70, 1920), (540 + sgn * 8, 1350)], (36, 38, 42))
            p.ell(540 + sgn * 19 - 26, 1335, 540 + sgn * 19 + 26, 1365, (20, 20, 22))
        p.poly([(530, 1360), (550, 1360), (600, 1920), (480, 1920)], (60, 62, 68))
        self.barrels = R.darken(p.done(), .55)
        self.inside = Image.new("RGBA", (W, H), (6, 7, 12, 255))
        self.inside = Image.alpha_composite(self.inside, R.glow(540, 1200, 900, (20, 30, 60), 120))

    def drop(self, t, ctx):
        tw = wt(ctx, self.params["drop_word"]) if "drop_word" in self.params else None
        if tw is None:
            return 0.0, 0.0
        flinch = .04 * math.sin(math.pi * rig.clip01((t - tw + .1) / .1)) if t < tw else 0.0
        return flinch, rig.ease((t - tw) / .25) ** 1.5

    def dima_raise(self, t):
        if not self.params.get("mimic_pose"):
            return 0.0, 0.0
        lr = rig.ease((t - 1.0) / .6) - rig.ease((t - 5.4) / .6)
        tilt = 8 * (rig.ease((t - 3.0) / .5) - rig.ease((t - 4.6) / .5))
        return lr, tilt

    def scene(self, t, ctx, show_dima=True):
        pr = self.params
        img = self.inside.copy()
        t_rev = wt(ctx, pr["reveal_word"]) if "reveal_word" in pr else None
        lift = (rig.ease((t - t_rev) / 2.2) if t_rev is not None else 1.0) if "reveal_word" in pr or pr.get("mimic_pose") or "drop_word" in pr else 0.0
        if "reveal_word" not in pr:
            lift = 1.0
        flinch, fall = self.drop(t, ctx)
        lr, tilt = self.dima_raise(t)
        mlr, mtilt = self.dima_raise(t - .3)         # мимик повторяет с задержкой 0.3 с
        light = (1 - fall) * .8 * rig.flicker(t, 2)
        # оно за спиной: выше на голову, голова уходит за верх рамки
        m = flat_mimic(t, {"left_raise": mlr, "tilt": mtilt}, 1000, 2000)
        a = m.getchannel("A")
        edge = Image.fromarray(np.clip(np.array(a.filter(ImageFilter.MaxFilter(7))).astype(int) - np.array(a), 0, 255).astype(np.uint8))
        rim = Image.new("RGBA", m.size, BLUE_FLAME + (0,))
        rim.putalpha(edge.point(lambda v: v * (.25 + .6 * light)))           # холодный блик огонька по мокрому контуру
        lit = Image.alpha_composite(m, rim)
        vis = (rig.ease((t - t_rev) / 1.2) if t_rev is not None else 1.0) * (.5 + .5 * (1 - fall))
        put(img, alpha(lit, vis), 40, -40 + lift * 160)
        if show_dima and fall < 1:
            P = dima_pose(t, ctx, scared=True, light=.4 + .6 * light, frost=1.0, look=(0, 0), left_raise=lr, tilt=tilt,
                          wide=pr.get("drop_word") is None)
            person, pts = flat_dima(t, P, 720, 1080)
            y = 260 + lift * 160 + flinch * 400 + fall * 900
            put(img, person, 180, y)
            pts = {"flame": (pts["flame"][0] + 90, pts["flame"][1])}
            fx, fy = pts["flame"]
            img = Image.alpha_composite(img, R.glow(90 + fx, y + fy, 600, BLUE_FLAME, int(120 * (1 - fall))))
            img = Image.alpha_composite(img, R.lighter_layer(t, int(90 + fx), int(y + fy + 30), blue=True, scale=.9, k=1.0))
        return img

    def render(self, t, ctx):
        img = self.scene(t, ctx)
        img = Image.alpha_composite(img, self.frame)
        return Image.alpha_composite(img, self.barrels)


class Shot(CabdoorBehind):
    """Выстрел зажигательным: осколки, тварь горит и кричит всеми голосами; потом горящая вода уходит в щели."""

    def __init__(self, params):
        super().__init__(params)
        rng = np.random.default_rng(9)
        self.shards = [(rng.uniform(250, 830), rng.uniform(300, 1100), rng.uniform(-900, 900), rng.uniform(-700, 300),
                        rng.uniform(-8, 8), rng.uniform(18, 60), rng.integers(3, 5)) for _ in range(46)]
        if params.get("burned"):
            p = R.Painter()
            p.rect(0, 0, W, H, (44, 46, 50))
            for y in range(0, H, 160):
                p.line([(0, y), (W, y)], (36, 38, 42), 6)
            for x in range(0, W, 270):
                p.line([(x, 0), (x, H)], (36, 38, 42), 6)
            p.rect(900, 0, W, H, (30, 30, 34))
            p.rect(880, 200, 905, 1500, (8, 8, 10))       # щель у стены
            self.floor = R.darken(p.done(), .7)

    def mimic_frame(self, t, ctx, k_fire):
        pr = self.params
        arch = rig.react(t, wt(ctx, pr["ignite_word"]) if "ignite_word" in pr else -5, .5)
        a_ = min(1, max(0, arch))
        m = flat_mimic(t, {"left_raise": .3 + .7 * a_, "right_raise": a_, "spread": a_, "tilt": -12 * a_, "full": True}, 820, 900)
        if k_fire > 0:
            m = rig.burning(m, t, k_fire, thick=9)
        if pr.get("scream"):  # дробится на куски, которые дёргаются несинхронно
            rng = np.random.default_rng(int(t * 30))
            out = Image.new("RGBA", m.size, (0, 0, 0, 0))
            cuts = [0, 380, 700, 1050, 1500]
            for a, b in zip(cuts, cuts[1:]):
                dx, dy = rng.integers(-28, 29), rng.integers(-10, 11)
                put(out, m.crop((0, a, m.width, b)), dx, a + dy)
            m = out
        return m

    def render(self, t, ctx):
        pr = self.params
        if pr.get("burned"):
            return self.drain(t, ctx)
        img = self.inside.copy()
        k_fire = 0.0
        if pr.get("burning"):
            tw = wt(ctx, pr["ignite_word"]) if "ignite_word" in pr else None
            k_fire = rig.ease((t - tw) / .6) if tw is not None else 1.0
        m = self.mimic_frame(t, ctx, k_fire)
        put(img, m, 130, 300)
        if k_fire > 0:  # оранжевый свет заливает всё — впервые в серии ярко
            img = Image.alpha_composite(img, R.glow(540, 700, 1300, (255, 150, 60), int(150 * k_fire * rig.flicker(t, 7))))
            img = sparks(img, t - (t % .45), t, 540, 900, n=30, seed=int(t / .45))
        img = Image.alpha_composite(img, self.frame)
        tw = wt(ctx, pr["shot_word"]) if "shot_word" in pr else None
        if tw is not None:
            u = t - tw
            if u >= 0:  # осколки окошка веером, крутятся, падают с замедлением
                d = ImageDraw.Draw(img)
                slow = 1 - math.exp(-u * 2.2)
                for x, y, vx, vy, spin, size, nv in self.shards:
                    px = x + vx * slow * .9
                    py = y + vy * slow * .9 + 260 * u * u
                    ang = spin * u
                    pts = [(px + size * math.cos(ang + i * 2 * math.pi / nv), py + size * .6 * math.sin(ang + i * 2 * math.pi / nv)) for i in range(nv)]
                    d.polygon(pts, fill=(170, 190, 210, int(200 * max(0, 1 - u / 3))))
                smoke = Image.new("RGBA", (W, H), (0, 0, 0, 0))
                sd = ImageDraw.Draw(smoke)
                for j in range(6):
                    r = 40 + 160 * slow * (1 + j * .2)
                    sd.ellipse((540 - r + j * 20, 1300 - r - 260 * slow - j * 60, 540 + r + j * 20, 1300 + r - 260 * slow - j * 60),
                               fill=(160, 160, 160, int(70 * max(0, 1 - u / 4))))
                img = Image.alpha_composite(img, smoke.filter(ImageFilter.GaussianBlur(18)))
        return Image.alpha_composite(img, self.barrels)

    def drain(self, t, ctx):
        """Сверху: горящая лужа течёт к щели у стены и гаснет, пар; Дима в углу приподнимается на локте."""
        img = self.floor.copy()
        tw = wt(ctx, self.params.get("drain_word", ""), 0) or 0
        u = rig.ease((t - tw) / 2.2)
        layer = Image.new("RGBA", (W, H), (0, 0, 0, 0))
        d = ImageDraw.Draw(layer)
        for i in range(6):
            cx = 460 + 420 * u + 60 * math.sin(i * 1.7)
            cy = 760 + (i - 2.5) * 70 + 40 * math.sin(i)
            r = (150 - 40 * i % 3) * (1 - .75 * u)
            if r > 4:
                d.ellipse((cx - r, cy - r * .5, cx + r, cy + r * .5), fill=(6, 6, 8, 245))
        img = Image.alpha_composite(img, layer.filter(ImageFilter.GaussianBlur(2)))
        fire = Image.new("RGBA", (W, H), (0, 0, 0, 0))
        fd = ImageDraw.Draw(fire)
        rng = np.random.default_rng(int(t * 20))
        for _ in range(int(60 * (1 - u)) + 2):  # язычки пламени гаснут
            x = rng.uniform(300, 880) * (1 - u) + 880 * u
            y = rng.uniform(600, 920)
            hgt = rng.uniform(30, 110) * (1 - u)
            fd.polygon([(x - 14, y), (x + 14, y), (x + rng.uniform(-8, 8), y - hgt)], fill=(255, rng.integers(140, 220), 60, 220))
        img = Image.alpha_composite(img, R.glow(600 + 280 * u, 760, 700, (255, 150, 60), int(150 * (1 - u))))
        img = Image.alpha_composite(img, fire.filter(ImageFilter.GaussianBlur(1.5)))
        steam = Image.new("RGBA", (W, H), (0, 0, 0, 0))
        sd = ImageDraw.Draw(steam)
        for j in range(10):
            v = (t * .6 + j / 10) % 1
            x = 600 + 300 * u + 120 * math.sin(j * 2.3)
            sd.ellipse((x - 50 - 60 * v, 760 - 300 * v - 50, x + 50 + 60 * v, 760 - 300 * v + 50), fill=(200, 200, 205, int(80 * (1 - v) * u)))
        img = Image.alpha_composite(img, steam.filter(ImageFilter.GaussianBlur(14)))
        P = dima_pose(t, ctx, scared=True, light=.6, look=(1, -.3), lighter=False)
        person, _ = flat_dima(t, P, 600, 900)
        rise = rig.ease(t / 3.0)
        person = person.rotate(70 - 25 * rise, resample=Image.BICUBIC, expand=True)
        put(img, person, -260, 1000 - 120 * rise)
        return img


# ------------------------------------------------------------------ кабина


class Cab(R.Scene):
    """Кабина тепловоза: тёплый свет, пульт с лампочками, буран за чистыми стёклами."""

    LAMPS = [(150 + i * 64, 820 + (i % 2) * 34) for i in range(13)]

    def __init__(self, params):
        super().__init__(params)
        p = R.Painter()
        p.rect(0, 0, W, H, (92, 98, 84))
        p.rect(0, 0, W, 170, (70, 74, 66))
        for x0, x1 in ((40, 520), (560, 1040)):
            p.rect(x0 - 16, 194, x1 + 16, 646, (54, 60, 54), r=10)
            p.rect(x0, 210, x1, 630, (12, 18, 32))
        p.poly([(0, 700), (W, 700), (W, 760), (0, 790)], (120, 126, 108))       # верх пульта
        p.rect(0, 760, W, 1060, (78, 86, 74))
        for i, (gx, gy) in enumerate(((180, 930), (360, 930), (720, 930), (900, 930))):
            p.ell(gx - 58, gy - 58, gx + 58, gy + 58, (40, 44, 40))
            p.ell(gx - 50, gy - 50, gx + 50, gy + 50, (220, 214, 190))
            p.line([(gx, gy), (gx + 34 * math.cos(-2 + i), gy + 34 * math.sin(-2 + i))], (160, 30, 30), 5)
        p.rect(500, 880, 580, 1040, (40, 42, 44), r=8)                               # контроллер
        p.rect(0, 1060, W, H, (52, 50, 46))
        img = p.done()
        self.bg = Image.alpha_composite(img, R.glow(160, 120, 1000, (255, 220, 150), 110))
        self.snow = R.Blizzard(n=320, seed=41, speed=.6)
        self.thaw = R.Blizzard(n=1, seed=1)

    def base(self, t):
        img = self.bg
        for x0, x1 in ((40, 520), (560, 1040)):
            img = self.snow.draw(img, t, clip=(x0, 210, x1, 630))
        d = ImageDraw.Draw(img)
        for i, (x, y) in enumerate(self.LAMPS):  # лампочки, несколько мигают
            on = (i % 4 != 0) or (math.sin(t * (2 + i * .3) + i) > 0)
            c = [(220, 60, 50), (90, 210, 90), (240, 200, 70)][i % 3]
            d.ellipse((x - 11, y - 11, x + 11, y + 11), fill=c if on else (50, 46, 40))
        return img

    def icon(self, img, t, x=560, y=620):
        d = ImageDraw.Draw(img)
        d.rectangle((x - 70, y - 90, x + 70, y + 80), fill=(190, 150, 60))           # оклад
        d.rectangle((x - 52, y - 72, x + 52, y + 62), fill=(70, 40, 24))
        d.ellipse((x - 22, y - 50, x + 22, y - 6), fill=(170, 130, 90))
        d.ellipse((x - 40, y - 70, x + 40, y + 10), outline=(230, 200, 90), width=4)
        cx = x + 140
        d.rectangle((cx - 16, y + 10, cx + 16, y + 80), fill=(226, 214, 180))       # огарок, воск стекает
        drip = (t * 8) % 50
        d.ellipse((cx + 10, y + 20 + drip, cx + 20, y + 34 + drip), fill=(226, 214, 180))
        fl = rig.flicker(t, 9)
        d.ellipse((cx - 9, y - 30 - 6 * fl, cx + 9, y + 10), fill=(255, 190, 80))
        d.ellipse((cx - 4, y - 14, cx + 4, y + 8), fill=(255, 240, 190))
        return Image.alpha_composite(img, R.glow(cx, y - 10, 340, (255, 190, 90), int(110 * fl)))

    def console_close(self, t, ctx):
        """Крупно часы и три зажигательных патрона с красными гильзами — камера проезжает с часов на патроны."""
        p = R.Painter(size=(2000, H))
        p.rect(0, 0, 2000, H, (78, 86, 74))
        p.ell(260, 560, 860, 1160, (40, 44, 40))
        p.ell(290, 590, 830, 1130, (222, 216, 192))
        for i in range(12):
            a = i * math.pi / 6
            p.line([(560 + 230 * math.cos(a), 860 + 230 * math.sin(a)), (560 + 255 * math.cos(a), 860 + 255 * math.sin(a))], (40, 40, 40), 8)
        for i in range(3):
            x = 1180 + i * 230
            p.rect(x, 700, x + 110, 1020, (176, 40, 34), r=14)
            p.rect(x, 1000, x + 110, 1060, (200, 170, 80), r=6)
            p.ell(x + 30, 1018, x + 80, 1048, (150, 120, 60))
        base = Image.alpha_composite(p.done(), R.glow(1000, 500, 1300, (255, 220, 150), 90, size=(2000, H)))
        d = ImageDraw.Draw(base)
        m, s = 8, t % 60  # 04:08, секундная стрелка движется
        for ang, ln, wd in ((math.radians(30 * 4 + m * .5) - math.pi / 2, 140, 14), (math.radians(6 * m) - math.pi / 2, 210, 9),
                            (math.radians(6 * s * 6) - math.pi / 2, 230, 4)):
            d.line([(560, 860), (560 + ln * math.cos(ang), 860 + ln * math.sin(ang))], fill=(30, 30, 30), width=wd)
        tw = wt(ctx, self.params["shells_word"], 1.5) if "shells_word" in self.params else 1.5
        x = 60 + 760 * rig.ease((t - tw + .3) / 1.4)
        return base.crop((x, 0, x + W, H))

    def render(self, t, ctx):
        pr = self.params
        view = pr.get("view", "wide")
        if "shells_word" in pr:
            return self.console_close(t, ctx)
        img = self.base(t).copy()
        if view == "epilogue":  # год спустя: Дима у пульта, со спины
            bob = 4 * math.sin(2 * math.pi * t / 3.5)
            put(img, dima_back_sprite(1.3, c=(40, 46, 60), k=.85), 140, 560 + bob)
            return zoom(img, 1 + .05 * rig.ease(t / ctx.dur), 540, 960)
        if pr.get("icon"):
            img = self.icon(img, t)
        speaking = "savelyev" if ctx.mouth("savelyev", t) > .05 else "dima" if ctx.mouth("dima", t) > .05 else None
        if view == "wide":
            doze = rig.ease(t / 4) if pr.get("driver_dozing") else 0.0
            S = sav_pose(t, ctx, turn=.35 if speaking != "savelyev" else .55, eyes_closed=bool(pr.get("driver_dozing")), doze=doze)
            sav, _ = flat_savelyev(t, S, 560, 840)
            put(img, sav, -20, 620)
            dturn = -.55 if speaking == "dima" or pr.get("dima_turn") else -.2
            frost = max(0.0, 1 - t / 5) if pr.get("thaw", True) else 0
            P = dima_pose(t, ctx, light_from="top", light_side="left", light=.85, turn=dturn, frost=frost, steam=False, lighter=False,
                          breath_period=2.4)
            P["left_raise"] = .5 * (math.sin(t * 5) * .5 + .5) if speaking == "dima" else 0.0   # жестикулирует
            dim_, _ = flat_dima(t, P, 540, 810)
            put(img, dim_, 520, 650)
            if pr.get("thaw", True):  # от бушлата идёт пар — оттаивает
                layer = Image.new("RGBA", (W, H), (0, 0, 0, 0))
                d = ImageDraw.Draw(layer)
                for j in range(12):
                    v = (t * .35 + j / 12) % 1
                    x = 640 + (j % 6) * 60 + 20 * math.sin(v * 5 + j)
                    d.ellipse((x - 20 - 20 * v, 1000 - 380 * v - 20, x + 20 + 20 * v, 1000 - 380 * v + 20), fill=(230, 230, 230, int(60 * (1 - v))))
                img = Image.alpha_composite(img, layer.filter(ImageFilter.GaussianBlur(8)))
            if pr.get("icon"):  # камера переходит на пульт
                img = zoom(img, 1 + .35 * rig.ease((t - 2.5) / 2.5), 620, 640)
            return img
        # средний план Савельева, Дима в профиль на переднем плане справа
        t_away = wt(ctx, pr["look_away_word"]) if "look_away_word" in pr else None
        t_rub = wt(ctx, pr["rub_word"]) if "rub_word" in pr else None
        t_creak = wt(ctx, pr["wake_word"]) if "wake_word" in pr else None
        look, turn = (.0, .1), .45 if speaking else .15
        if speaking == "savelyev" and t_rub is None:
            turn = .55
        rub = 0.0
        if t_rub is not None and t >= t_rub:
            look = (.0, 1.0)
            turn = .1
            rub = rig.ease((t - t_rub) / .4) * (1 - rig.ease((t - t_rub - 1.6) / .4))
        if t_away is not None and t >= t_away:
            look = (-1.0, .3)
            turn = .45 - 1.0 * rig.ease((t - t_away - .15) / .4)
        eyes_open = pr.get("eyes_open", False)
        doze = 0.0
        if t_creak is not None:
            doze = 1 - rig.react(t, t_creak, .5)
        gun, gk = ("up" if pr.get("gun_up") else pr.get("gun", "knees")), rig.ease(t / 1.2)
        if "gun_down_word" in pr:  # ружьё опускается
            gk = 1 - rig.ease((t - (wt(ctx, pr["gun_down_word"]) or 0)) / .7)
            gun = "up" if gk > .05 else "none"
        S = sav_pose(t, ctx, look=look, turn=turn, rub=rub, squeeze=1.0 if t_away is not None and t >= t_away else 0.0,
                     gun=gun, gun_up_k=gk if gun == "up" and "gun_down_word" in pr else rig.ease(t / 1.2), doze=doze,
                     tilt=10 * rig.ease((t - 1.5) / 3) if pr.get("gun_up") else 0.0)
        if eyes_open:
            S.update(blink=0.0, look=(0.0, 0.0), wide=True, turn=0.0)
        sav, _ = flat_savelyev(t, S, 900, 1350)
        put(img, sav, 40, 230)
        frozen = eyes_open and t_creak is not None and t >= t_creak
        bob = 0 if frozen else 5 * math.sin(2 * math.pi * t / 2.2)
        put(img, dima_back_sprite(1.5, c=(46, 44, 48), k=.85), 600, 640 + bob)
        return img


# ------------------------------------------------------------------ флешбэк 1954


def sepia(img, t, seed=0):
    g = np.array(img.convert("L")).astype(float) / 255
    dark, light = np.array((40, 28, 18)), np.array((236, 214, 170))
    out = dark + (light - dark) * g[..., None]
    rng = np.random.default_rng(int(t * 24) + seed)
    out += rng.normal(0, 14, g.shape)[..., None]                      # зерно
    yy, xx = np.mgrid[0:H, 0:W]
    vig = 1 - .55 * (((xx - W / 2) / (W * .7)) ** 2 + ((yy - H / 2) / (H * .62)) ** 2)
    out *= np.clip(vig, .25, 1)[..., None]
    res = Image.fromarray(np.clip(out, 0, 255).astype(np.uint8))
    d = ImageDraw.Draw(res)
    for _ in range(rng.integers(0, 3)):                                 # царапины
        x = rng.uniform(0, W)
        d.line([(x, 0), (x + rng.uniform(-20, 20), H)], fill=(250, 236, 200), width=1)
    dy = int(rng.integers(-3, 4))                                       # дрожание плёнки
    return res.transform(res.size, Image.AFFINE, (1, 0, 0, 0, 1, dy)).convert("RGBA")


class Flashback(R.Scene):
    """Сепия 1954: эшелон в буране, мальчик в теплушке, весна, мальчик один у состава."""

    def __init__(self, params):
        super().__init__(params)
        shot = params.get("shot", "echelon")
        self.snow = R.Blizzard(n=360, seed=51)
        if shot in ("echelon", "spring"):
            self.pano = self.panorama(spring=shot == "spring")
        if shot == "boy":
            p = R.Painter()
            p.rect(0, 0, W, H, (70, 50, 34))
            for x in range(0, W, 130):
                p.rect(x, 0, x + 120, H, (92, 66, 44))
            p.rect(0, 1300, W, H, (58, 42, 30))
            self.wall = p.done()
        if params.get("boy_alone") or shot == "spring":
            p = R.Painter()
            p.ell(200, 1250, 900, 1420, (12, 12, 14))
            self.ice = p.done()

    def panorama(self, spring):
        PW = 2800
        p = R.Painter(size=(PW, H))
        p.vgrad(0, 1000, (90, 92, 96) if spring else (50, 52, 58), (150, 150, 150) if spring else (110, 112, 118), x1=PW)
        p.rect(0, 1000, PW, H, (130, 120, 104) if spring else (200, 204, 210))
        if spring:
            for i in range(30):
                x = (i * 397) % PW
                p.ell(x, 1080 + (i * 53) % 400, x + 260, 1140 + (i * 53) % 400, (210, 212, 214))
        p.rect(0, 1090, PW, 1110, (40, 40, 40))
        # паровоз
        p.rect(60, 700, 560, 1000, (24, 24, 26), r=20)
        p.rect(440, 600, 620, 1000, (30, 30, 32))
        p.rect(140, 560, 200, 700, (24, 24, 26))
        for wx in (130, 270, 410):
            p.ell(wx - 70, 960, wx + 70, 1100, (60, 30, 26))
        # теплушки
        self.windows = []
        for i in range(5):
            x0 = 700 + i * 420
            p.rect(x0, 650, x0 + 390, 1010, (96, 62, 40))
            p.rect(x0, 630, x0 + 390, 660, (200, 200, 200) if not spring else (110, 80, 56))
            p.rect(x0 + 150, 720, x0 + 250, 1000, (80, 52, 34))
            for wx in (x0 + 40, x0 + 300):
                p.rect(wx, 700, wx + 60, 760, (20, 16, 14))
                self.windows.append((wx, 700))
            for wx in (x0 + 70, x0 + 320):
                p.ell(wx - 40, 980, wx + 40, 1060, (30, 26, 24))
        img = p.done()
        if spring:  # в окнах — силуэты лицом наружу
            d = ImageDraw.Draw(img)
            for wx, wy in self.windows:
                d.ellipse((wx + 14, wy + 8, wx + 46, wy + 46), fill=(6, 6, 6))
                d.rectangle((wx + 8, wy + 40, wx + 52, wy + 60), fill=(6, 6, 6))
        return img

    def render(self, t, ctx):
        pr = self.params
        shot = pr.get("shot", "echelon")
        dur = ctx.dur
        if shot == "echelon":
            x = 1500 * (t / dur)
            img = self.pano.crop((x, 0, x + W, H))
            layer = Image.new("RGBA", (W, H), (0, 0, 0, 0))
            d = ImageDraw.Draw(layer)
            for j in range(8):  # паровозный дым
                v = (t * .3 + j / 8) % 1
                cx = 170 - x + 400 * v
                d.ellipse((cx - 60 - 140 * v, 520 - 300 * v - 60, cx + 60 + 140 * v, 520 - 300 * v + 60), fill=(60, 60, 64, int(200 * (1 - v))))
            img = Image.alpha_composite(img, layer.filter(ImageFilter.GaussianBlur(10)))
            img = self.snow.draw(img, t)
        elif shot == "boy":
            img = self.wall.copy()
            third = dur / 3
            ph = (t % third) / third
            day = [1, 0, 1][min(2, int(t / third))]
            light = day * (1 - rig.ease((ph - .85) / .15)) + (1 - day) * .15
            d = ImageDraw.Draw(img)
            for x in range(120, W, 130):  # свет сквозь щели досок
                d.line([(x + 4, 0), (x + 4, H)], fill=(255, 240, 200, int(255 * light)), width=6)
            img = Image.alpha_composite(img, R.glow(540, 900, 900, (255, 230, 180), int(70 * light)))
            hat = (t % 3.2) / 3.2 * .8
            b, _ = flat_boy(t, {"pose": "sit", "hat": hat}, 600, 720)
            put(img, b, 240, 760)
            img = ImageEnhance.Brightness(img).enhance(.4 + .6 * light)
        else:
            alone = pr.get("boy_alone")
            if not alone:
                x = 1200 * rig.ease(t / (dur * .7))
                img = self.pano.crop((x, 0, x + W, H)).convert("RGBA")
                d = ImageDraw.Draw(img)
                for j in range(14):  # капель
                    v = (t * 1.2 + j / 14) % 1
                    dx = (j * 197) % W
                    d.ellipse((dx - 3, 640 + 300 * v, dx + 3, 652 + 300 * v), fill=(220, 230, 240, int(220 * (1 - v))))
                k = rig.ease((t - dur * .65) / (dur * .2))
                if k > 0:  # наезд вниз под лавку — чёрный лёд блестит
                    under = Image.new("RGBA", (W, H), (40, 30, 22, 255))
                    ImageDraw.Draw(under).rectangle((0, 0, W, 420), fill=(90, 64, 42))
                    under = Image.alpha_composite(under, self.ice)
                    gx = 250 + 600 * ((t * .4) % 1)
                    ImageDraw.Draw(under).ellipse((gx - 50, 1300, gx + 50, 1330), fill=(240, 240, 240, 200))
                    img = Image.blend(img, under, k)
            else:
                z = 1.25 - .25 * rig.ease(t / dur)
                img = self.pano.crop((900, 0, 900 + W, H)).convert("RGBA")
                b, _ = flat_boy(t, {"pose": "stand", "hat": .4}, 160, 190)
                put(img, b, 470, 930)
                img = zoom(img, z, 550, 1000)
        out = sepia(img, t)
        if pr.get("boy_alone"):  # возврат в цвет — через белую вспышку
            k = rig.ease((t - (dur - .45)) / .4)
            if k > 0:
                out = Image.blend(out, Image.new("RGBA", (W, H), (255, 255, 255, 255)), k)
        return out


# ------------------------------------------------------------------ памятка из двух кусков


class MemoPiece(R.Scene):
    TOP = ["1. Не открывай дверь.", "2. Они стучат три раза.", "3. Не отзывайся, если", "   зовут по имени."]
    LINE4 = "4. Если в кабине тепло —"
    LINE5 = "5. Держись огня. Чёрная вода боится тепла."

    def __init__(self, params):
        super().__init__(params)
        p = R.Painter()
        p.rect(0, 0, W, H, (58, 42, 32))
        for y in range(0, H, 150):
            p.line([(0, y), (W, y)], (44, 32, 24), 4)
        self.desk = Image.alpha_composite(R.darken(p.done(), .6), R.glow(300, 300, 1100, (255, 210, 140), 110))
        rng = np.random.default_rng(54)
        self.tear = [(x, int(rng.integers(-24, 24))) for x in range(0, 860, 40)] + [(860, 0)]
        self.f = R.font("mono", 34)

    def paper(self, lines, torn_bottom, reveal=None, strike=0.0):
        h = 480
        img = Image.new("RGBA", (860, h + 40), (0, 0, 0, 0))
        d = ImageDraw.Draw(img)
        if torn_bottom:
            d.polygon([(0, 0), (860, 0)] + [(x, h + y) for x, y in self.tear[::-1]], fill=(214, 196, 146, 255))
        else:
            d.polygon([(x, 30 + y) for x, y in self.tear] + [(860, h + 30), (0, h + 30)], fill=(206, 186, 136, 255))
        for i, line in enumerate(lines):
            y = 60 + i * 80
            text = line if reveal is None or i != len(lines) - 1 else line[:int(len(line) * reveal)]
            d.text((40, y), text, font=self.f, fill=(40, 34, 30))
        if strike > 0:  # строка 4 закрашена в несколько слоёв
            y = 60
            rng = np.random.default_rng(4)
            for layer in range(3):
                k = rig.clip01(strike * 3 - layer)
                for j in range(int(26 * k)):
                    x0 = 30 + j * 26
                    d.line([(x0, y + rng.uniform(0, 40)), (x0 + 40, y + rng.uniform(0, 40))], fill=(24, 22, 40, 230), width=7)
        return img

    def render(self, t, ctx):
        pr = self.params
        img = self.desk.copy()
        t_piece = wt(ctx, pr["piece_word"]) if "piece_word" in pr else None
        joined = pr.get("joined", False)
        t_strike = wt(ctx, pr["struck_word"]) if "struck_word" in pr else None
        strike = 1.0 if (joined and t_strike is None) else (rig.ease((t - t_strike) / 1.4) if t_strike is not None else 0.0)
        reveal = None
        if pr.get("reveal"):
            tw = wt(ctx, pr["reveal_words"][0]) or 0
            reveal = rig.clip01((t - tw - .3) / max(.5, ctx.speech - tw - .2))
        lines = [self.LINE4] + ([self.LINE5] if reveal is not None or joined else [])
        if reveal is None and joined and "reveal" not in pr:
            lines = [self.LINE4]
        if "line4" in pr:  # чернила просвечивают у лампы — проступает пункт 4
            lines = [pr["line4"]]
            tw = wt(ctx, pr.get("unstrike_word", ""), 0) or 0
            strike = 1 - rig.ease((t - tw) / 1.6)
        piece = self.paper(lines, torn_bottom=False, reveal=reveal, strike=strike)
        memo = self.paper(self.TOP, torn_bottom=True)
        if joined:
            snap = 1.0
            unfold = 1.0
            py = 860
        else:
            u = rig.ease((t - (t_piece or 0)) / 1.2)
            unfold = .3 + .7 * u
            py = -600 + 1460 * u
            snap = rig.react(t, ctx.dur - .9, .5)
        piece = piece.resize((piece.width, max(1, int(piece.height * unfold))))
        my = 1500 - (1500 - 360) * rig.ease(t / 1.5) if not joined else 360
        my = my + (1 - snap) * 60 if not joined else my
        put(img, memo.rotate(-1.2, resample=Image.BICUBIC, expand=True), 100, my)
        put(img, piece.rotate(1.0 - snap, resample=Image.BICUBIC, expand=True), 100, py if not joined else my + 500)
        if not joined and t_piece is not None:  # руки Савельева держат клочок
            d = ImageDraw.Draw(img)
            for hx in (130, 920):
                d.rounded_rectangle((hx - 60, py + 100, hx + 60, py + 230), radius=40, fill=(196, 146, 110))
        if reveal is not None and 0 < reveal < 1:  # тень пальца ведёт по строке
            fx = 140 + 760 * reveal
            shadow = Image.new("RGBA", (W, H), (0, 0, 0, 0))
            ImageDraw.Draw(shadow).ellipse((fx - 30, my + 600, fx + 40, my + 700), fill=(0, 0, 0, 90))
            img = Image.alpha_composite(img, shadow.filter(ImageFilter.GaussianBlur(12)))
        if strike > 0 and joined:
            img = zoom(img, 1 + .15 * rig.ease(t / ctx.dur), 540, my + 560)
        return Image.alpha_composite(img, R.glow(540, 700, 1000, (255, 200, 120), int(40 * rig.flicker(t, 4))))


# ------------------------------------------------------------------ сапог с пятном


class Boot(R.Scene):
    def __init__(self, params):
        super().__init__(params)
        p = R.Painter()
        p.rect(0, 0, W, H, (52, 50, 46))
        self.floor = Image.alpha_composite(R.darken(p.done(), .8), R.glow(540, 500, 1000, (255, 210, 140), 90))

    def sole(self, img, t, grow):
        d = ImageDraw.Draw(img)
        cx, cy = 540, 800
        sole = [(cx + 230 * math.cos(a) * (1 - .25 * max(0, math.sin(a))) * (.8 if math.sin(a) > .2 else 1.0),
                 cy + 470 * math.sin(a)) for a in np.linspace(0, 2 * math.pi, 60)]
        d.polygon(sole, fill=(96, 84, 70))                                            # рант
        d.polygon([(cx + (x - cx) * .9, cy + (y - cy) * .94) for x, y in sole], fill=(44, 40, 36))
        for i in range(12):                                                           # протектор
            y = cy - 400 + i * 52
            if abs(y - (cy + 230)) > 30:
                d.line([(cx - 170, y), (cx + 170, y + 8)], fill=(62, 56, 50), width=9)
        d.rectangle((cx - 190, cy + 220, cx + 190, cy + 236), fill=(24, 22, 20))          # край каблука
        r = 60 * grow
        d.ellipse((cx - r, cy - 120 - r * .9, cx + r, cy - 120 + r * .9), fill=(4, 4, 6))
        hx = cx - r * .5 + r * ((t * .5) % 1)
        d.ellipse((hx - 14, cy - 150, hx + 14, cy - 136), fill=(120, 140, 170))  # блик бежит по пятну

    def render(self, t, ctx):
        pr = self.params
        img = self.floor.copy()
        if pr.get("spot_grow") or pr.get("sole") or pr.get("spot_shrink"):
            grow = 1 + .15 * rig.ease(t / ctx.dur) if pr.get("spot_grow") else 1.0
            if pr.get("spot_shrink"):
                grow = 1 - .55 * rig.ease((t - 0.4) / (ctx.dur - .4))
            self.sole(img, t, grow)
            if pr.get("spot_shrink"):  # дымится
                layer = Image.new("RGBA", (W, H), (0, 0, 0, 0))
                d = ImageDraw.Draw(layer)
                for j in range(10):
                    v = (t * .7 + j / 10) % 1
                    x = 540 + 40 * math.sin(j * 2.1 + v * 4)
                    d.ellipse((x - 26 - 50 * v, 680 - 380 * v - 26, x + 26 + 50 * v, 680 - 380 * v + 26), fill=(210, 212, 216, int(110 * (1 - v))))
                img = Image.alpha_composite(img, layer.filter(ImageFilter.GaussianBlur(12)))
            if pr.get("spot_grow"):  # пальцы в портянке поджимаются
                d = ImageDraw.Draw(img)
                curl = .5 + .5 * math.sin(t * 2.5)
                d.ellipse((620, 1260, 1100, 1700), fill=(200, 190, 160))
                for i in range(5):
                    x = 680 + i * 70
                    d.ellipse((x - 30, 1230 + curl * 30 - i * 6, x + 30, 1300 + curl * 30 - i * 6), fill=(214, 204, 174))
            return img
        tw = wt(ctx, pr.get("spot_word", ""), ctx.dur * .8) or ctx.dur * .8
        if t < ctx.dur * .3:  # трёт руки, дышит на ладони — пар
            d = ImageDraw.Draw(img)
            rub = 30 * math.sin(t * 12)
            d.rounded_rectangle((330 + rub, 760, 560 + rub, 960), radius=90, fill=(190, 140, 106))
            d.rounded_rectangle((520 - rub, 770, 750 - rub, 970), radius=90, fill=(176, 128, 96))
            _, ex = rig.breath(t, 1.4, seed=8)
            u = t - ex
            if 0 <= u < 1:
                layer = Image.new("RGBA", (W, H), (0, 0, 0, 0))
                r = 60 + 140 * u
                ImageDraw.Draw(layer).ellipse((540 - r, 700 - r - 100 * u, 540 + r, 700 + r - 100 * u), fill=(230, 232, 236, int(110 * (1 - u))))
                img = Image.alpha_composite(img, layer.filter(ImageFilter.GaussianBlur(16)))
            return img
        if t < tw - .15:  # стягивает сапог рывками
            u = (t - ctx.dur * .3) / max(.3, tw - .15 - ctx.dur * .3)
            jerk = rig.ease(u) * 260 + 25 * math.sin(u * 18)
            d = ImageDraw.Draw(img)
            d.polygon([(380, 400 - jerk), (600, 400 - jerk), (620, 1000 - jerk), (900, 1050 - jerk), (900, 1200 - jerk), (360, 1200 - jerk)], fill=(30, 26, 22))
            d.rounded_rectangle((300, 520 - jerk, 520, 700 - jerk), radius=60, fill=(190, 140, 106))
            d.rounded_rectangle((560, 600 - jerk, 760, 780 - jerk), radius=60, fill=(176, 128, 96))
            return img
        self.sole(img, t, 1.0)
        k = rig.clip01((t - tw + .15) / .2)
        if k < 1:  # переворот подошвой к камере — смаз
            img = img.filter(ImageFilter.BoxBlur(int(20 * (1 - k)) + 1))
        return img


# ------------------------------------------------------------------ рубильник, лицо Димы


class Breaker(R.Scene):
    def __init__(self, params):
        super().__init__(params)
        p = R.Painter()
        p.rect(0, 0, W, H, (84, 92, 80))
        p.rect(240, 400, 840, 500, (60, 64, 56), r=10)
        p.rect(300, 560, 780, 1340, (46, 48, 44), r=16)
        for y in (640, 1240):
            p.rect(400, y - 30, 680, y + 30, (180, 120, 60), r=8)
        p.rect(510, 640, 570, 1180, (150, 156, 164), r=20)   # ручка вниз — ВЫКЛ
        p.rect(460, 1150, 620, 1220, (30, 30, 30), r=18)
        self.panel = Image.alpha_composite(p.done(), R.glow(300, 200, 1000, (255, 210, 140), 90))
        d = ImageDraw.Draw(self.panel)
        d.text((540, 450), "ОТОПЛЕНИЕ СОСТАВА", font=R.font("bold", 40), fill=(220, 214, 190), anchor="mm")
        d.text((540, 600), "ВКЛ", font=R.font("bold", 36), fill=(200, 196, 180), anchor="mm")
        d.text((540, 1400), "ВЫКЛ", font=R.font("bold", 36), fill=(200, 196, 180), anchor="mm")

    def wire(self, img, t):
        d = ImageDraw.Draw(img)
        for i in range(9):
            y = 840 + i * 34
            d.arc((470, y - 30, 610, y + 30), 0, 360, fill=(170, 172, 176), width=7)
        d.line([(610, 840), (700, 780), (690, 760), (720, 740)], fill=(170, 172, 176), width=7)
        d.line([(470, 1140), (400, 1200), (420, 1220)], fill=(170, 172, 176), width=7)
        hy = 840 + 300 * ((t * .35) % 1)  # тёплый блик скользит по проволоке
        d.ellipse((520, hy - 8, 560, hy + 8), fill=(255, 230, 170))

    def face(self, t, ctx, z=1.0):
        """Дима стоит у пульта спиной к нам, тёплая лампа мигает, камера медленно наезжает."""
        img = self.panel.copy()
        self.wire(img, t)
        img = Image.alpha_composite(img, R.glow(540, 300, 900, (255, 200, 120), int(70 * rig.flicker(t, 6))))
        put(img, dima_back_sprite(1.3, c=(36, 34, 38), k=.9), -170, 760)
        return zoom(img, z, 540, 860)

    def wire_off(self, img, t, u):
        """Витки проволоки разлетаются и падают."""
        d = ImageDraw.Draw(img)
        for i in range(9):
            y = 840 + i * 34 + 600 * u * u
            dx = (i - 4) * 60 * u
            d.arc((470 + dx, y - 30, 610 + dx, y + 30), 0, 360, fill=(170, 172, 176, int(255 * (1 - u))), width=7)

    def flip(self, img, t, u):
        """Рычаг уходит вверх — ВКЛ, загорается зелёная лампа."""
        d = ImageDraw.Draw(img)
        d.rectangle((455, 630, 625, 1230), fill=(46, 48, 44))
        for y in (640, 1240):
            d.rounded_rectangle((400, y - 30, 680, y + 30), radius=8, fill=(180, 120, 60))
        top = 1180 - 540 * u
        d.rounded_rectangle((510, min(top, 640), 570, max(top, 640) + 1), radius=20, fill=(150, 156, 164))
        d.rounded_rectangle((460, top - 70 if u > .5 else top - 30, 620, top if u > .5 else top + 40), radius=18, fill=(30, 30, 30))
        if u >= 1:
            img.alpha_composite(R.glow(760, 600, 240, (80, 230, 110), int(180 * rig.flicker(t, 3) ** 2)))
            d.ellipse((740, 580, 780, 620), fill=(120, 255, 140))

    def render(self, t, ctx):
        pr = self.params
        if "wire_off_word" in pr or "flip_word" in pr:
            img = self.panel.copy()
            tw = wt(ctx, pr.get("wire_off_word", ""), None)
            if tw is not None:
                u = rig.clip01((t - tw) / .6)
                if u <= 0:
                    self.wire(img, t)
                elif u < 1:
                    self.wire_off(img, t, u)
            if "flip_word" in pr:
                u = rig.ease((t - (wt(ctx, pr["flip_word"]) or 0)) / .18)
                if u > 0:
                    self.flip(img, t, u)
            return img
        if pr.get("face"):
            return self.face(t, ctx, 1.0 + .3 * rig.ease(t / ctx.dur))
        img = self.panel.copy()
        if pr.get("wire") or "zoom_word" in pr:
            self.wire(img, t)
        if "zoom_word" in pr:
            z = 1 + .15 * rig.ease((t - (wt(ctx, pr["zoom_word"]) or 0)) / .3)
            img = zoom(img, z, 540, 960)
        if "reveal_word" in pr:  # глаза Димы, зрачки сужаются — и резкая панорама на пульт
            tw = wt(ctx, pr["reveal_word"]) or 1.0
            if t < tw + .25:  # сначала Дима со спины в тёмной кабине — резкая панорама на пульт
                face = Image.new("RGBA", (W, H), (26, 28, 30, 255))
                face = Image.alpha_composite(face, R.glow(700, 600, 900, (255, 200, 120), 60))
                put(face, dima_back_sprite(1.8, c=(36, 34, 38), k=.9), 140, 560)
                k = rig.clip01((t - tw) / .25)
                if k <= 0:
                    return face
                shift = int(W * k)
                out = Image.new("RGBA", (W, H))
                out.paste(face.crop((shift, 0, W, H)), (0, 0))
                out.paste(img.crop((0, 0, shift, H)), (W - shift, 0))
                return out.filter(ImageFilter.BoxBlur(int(14 * math.sin(math.pi * k)) + 1))
        if pr.get("dima_turn"):  # Дима медленно поворачивает голову к спящему Савельеву
            turn = rig.ease((t - .5) / 1.5)
            put(img, dima_back_sprite(1.5, c=(36, 34, 38), k=.85), -260 + 120 * turn, 960)
        return img


# ------------------------------------------------------------------ журнал машиниста


class Logbook(R.Scene):
    YEARS = ["1979", "1986", "1993"]

    def __init__(self, params):
        super().__init__(params)
        p = R.Painter()
        p.rect(0, 0, W, H, (54, 40, 30))
        self.desk = R.darken(p.done(), .7)
        self.fs = R.font("serif", 40)

    def page(self, header, entries, reveal=1.0, wobble=0.0, t=0.0):
        img = Image.new("RGBA", (440, 900), (226, 214, 184, 255))
        d = ImageDraw.Draw(img)
        for y in range(160, 900, 64):
            d.line([(20, y), (420, y)], fill=(180, 190, 214), width=2)
        d.text((220, 80), header, font=self.fs, fill=(40, 52, 110), anchor="mm")
        for i, (tm, txt) in enumerate(entries):
            y = 180 + i * 128
            last = i == len(entries) - 1
            k = reveal if last else 1.0
            line = Image.new("RGBA", (420, 120), (0, 0, 0, 0))
            ld = ImageDraw.Draw(line)
            for j, ch in enumerate(tm):
                ld.text((10 + j * 22, 6 + (wobble * 6 * math.sin(t * 6 + j) if last else 0)), ch, font=self.fs, fill=(40, 52, 110))
            ld.text((10, 60), txt, font=R.font("serif", 34), fill=(40, 52, 110))
            line = line.transform(line.size, Image.AFFINE, (1, .2, -10, 0, 1, 0), Image.BICUBIC)
            if k > 0:
                img.alpha_composite(line.crop((0, 0, max(1, int(line.width * k)), line.height)), (10, y))
        return img

    def render(self, t, ctx):
        pr = self.params
        img = self.desk.copy()
        fl = rig.flicker(t, 13)
        img = Image.alpha_composite(img, R.glow(900, 350, 900, (255, 190, 100), int(110 * fl)))
        d = ImageDraw.Draw(img)
        d.rectangle((880, 300, 920, 420), fill=(226, 214, 180))                       # свеча
        d.ellipse((888, 250 - 6 * fl, 912, 300), fill=(255, 190, 80))
        entries = [tuple(e) for e in pr["entries"]] if "entries" in pr else [("02:40", "Отпр. Норм."), ("03:16", "143 км. Остановка.")]
        tw = wt(ctx, pr.get("entry_word", ""), 0) or 0
        reveal = rig.clip01((t - tw - .2) / 1.6) if "entry_word" in pr and pr.get("entry_word") in ("запись", "почерком") else 1.0
        wob = 1.0 if pr.get("entry_word") == "минуту" else 0.0
        left = self.page(pr.get("date", "14.01.99"), [], t=t)
        right = self.page("", entries, reveal=reveal, wobble=wob, t=t)
        if pr.get("flip"):
            times = [wt(ctx, w) for w in pr.get("years_words", [])]
            idx = sum(1 for x in times if x is not None and t >= x - .1)
            t_start = wt(ctx, "листнул") or 0
            if idx == 0 and t > t_start:
                right = self.page("", [("03:16", "143 км. Остановка.")], t=t)
                header = str(1999 - int((t - t_start) / .25) % 20)
                left = self.page(header, [], t=t)
            elif idx > 0:
                year = self.YEARS[min(idx, 3) - 1]
                left = self.page(year, [], t=t)
                right = self.page("", [("03:16", "143-й. Остановка.")], t=t)
            ph = ((t - t_start) % .25) / .25 if t > t_start and (idx == 0 or any(x and 0 < x - t < .25 for x in times)) else None
        else:
            ph = None
        open_k = rig.ease(t / .6) if pr.get("entry_word") in ("запись", "почерком") else 1.0
        put(img, left.resize((max(1, int(440 * open_k)), 900)), 100 + 440 * (1 - open_k), 380)
        put(img, right, 540, 380)
        if ph is not None:  # перелистываемая страница
            wpage = int(440 * abs(math.cos(math.pi * ph)))
            pg = Image.new("RGBA", (max(1, wpage), 900), (236, 226, 198, 255))
            put(img, pg, 540 - wpage if ph > .5 else 540, 380)
        if pr.get("entry_word") == "минуту":
            img = zoom(img, 1.6 + .2 * rig.ease(t / ctx.dur), 680, 720)
        return img


# ------------------------------------------------------------------ часть 5


class Train5(R.TrainScene):
    """Поезд снаружи. lights: wave — вагоны загораются один за другим со слова wave_word; dawn — рассвет, буран стих."""

    def __init__(self, params):
        super().__init__(dict({"lights": "on"}, **params))
        if params.get("dawn"):
            self.snow = R.Blizzard(n=60, seed=7, speed=.25)

    def render(self, t, ctx):
        pr = self.params
        img = super().render(t, ctx)
        if pr.get("wave_word") is not None or pr.get("dark"):
            t0 = wt(ctx, pr.get("wave_word", ""), 1e9) if pr.get("wave_word") else 1e9
            d = ImageDraw.Draw(img)
            for box in self.windows:  # ещё не загоревшиеся окна — тёмные
                car = int((box[0] + 150) // (self.CAR + self.GAP))
                if t < t0 + car * .35:
                    d.rounded_rectangle(box, radius=6, fill=(30, 38, 48))
        if pr.get("dawn"):  # рассвет: светлее, тёплый розоватый тон
            warm = Image.new("RGBA", (W, H), (236, 196, 176, 255))
            img = Image.blend(ImageEnhance.Brightness(img.convert("RGB")).enhance(1.35).convert("RGBA"), warm, .28)
        return img


def tall_layer(figs, size=(W, H), c=(10, 10, 14)):
    p = R.Painter(size=size)
    for x, feet, h in figs:
        R.figure_tall(p, x, feet, h, c)
    return p.done()


class Horde(R.Scene):
    """Освещённый поезд в буране, вокруг — десятки высоких фигур до горизонта. retreat_word — отступают от тёплых окон."""

    def __init__(self, params):
        super().__init__(params)
        p = R.Painter()
        R.sky_and_steppe(p, 830, lit=False)
        for x0 in range(-60, W + 60, 300):
            p.rect(x0, 858, x0 + 288, 946, (44, 72, 60), r=4)
            p.rect(x0, 848, x0 + 288, 862, (180, 192, 206), r=6)
            p.rect(x0, 924, x0 + 288, 928, (178, 150, 66))
            for i in range(5):
                p.rect(x0 + 30 + i * 50, 878, x0 + 58 + i * 50, 902, (240, 200, 110), r=3)
            p.rect(x0, 946, x0 + 288, 958, (24, 26, 30))
        self.bg = Image.alpha_composite(p.done(), R.glow(540, 960, 900, (240, 190, 100), 90))
        rng = np.random.default_rng(143)
        figs = []
        for i in range(34):  # от горизонта до переднего плана
            depth = rng.uniform(0, 1) ** 1.5
            x = rng.uniform(-40, W + 40)
            feet = 846 + depth * 520
            if 820 < feet < 990 and 0 < x < W:
                feet = 846
            figs.append((x, feet, 120 + depth * 420))
        self.figs = tall_layer(sorted(figs, key=lambda f: f[1]))
        self.snow = R.Blizzard(seed=21)

    def render(self, t, ctx):
        pr = self.params
        img = self.bg.copy()
        show = rig.ease((t - (wt(ctx, pr.get("see_word", ""), -1) or -1)) / .8) if pr.get("see_word") else 1.0
        tr = wt(ctx, pr["retreat_word"]) if "retreat_word" in pr else None
        back = rig.ease((t - tr) / 3.0) if tr is not None else 0.0
        figs = self.figs
        if back > 0:  # отходят от поезда: разлетаются от центра и тают в метели
            z = 1 + .35 * back
            figs = figs.resize((int(W * z), int(H * z)), Image.BICUBIC).crop((int(W * (z - 1) / 2), int(900 * (z - 1)),
                                                                              int(W * (z - 1) / 2) + W, int(900 * (z - 1)) + H))
        img = Image.alpha_composite(img, alpha(figs, show * (1 - .7 * back)))
        return self.snow.draw(img, t)


class Exit(R.Scene):
    """Савельев открывает дверь кабины и уходит в буран; оборачивается: «Не открывай»."""

    def __init__(self, params):
        super().__init__(params)
        p = R.Painter()
        p.rect(0, 0, W, H, (40, 44, 40))
        p.rect(240, 300, 840, 1300, (60, 64, 60), r=8)
        p.rect(270, 330, 810, 1280, (0, 0, 0, 0))            # проём двери — прозрачный
        self.frame = R.darken(p.done(), .55)
        self.snow = R.Blizzard(n=500, seed=61)

    def render(self, t, ctx):
        pr = self.params
        img = Image.new("RGBA", (W, H), (0, 0, 0, 255))
        door = Image.new("RGBA", (W, H), (0, 0, 0, 0))
        dd = ImageDraw.Draw(door)
        dd.rectangle((270, 330, 810, 1280), fill=(44, 54, 70))
        dd.rectangle((270, 1050, 810, 1280), fill=(150, 162, 178))
        img = Image.alpha_composite(img, door)
        t_step = wt(ctx, pr.get("step_word", ""), 0) or 0
        t_turn = wt(ctx, pr.get("turn_word", ""), 1e9) or 1e9
        away = rig.ease((t - t_step) / 2.5)
        turn = rig.react(t, t_turn, .4) if t >= t_turn - .1 else 0.0
        S = sav_pose(t, ctx, gun="none", turn=.8 * max(0, min(1, turn)), light=.5, look=(0, 0), wide=True)
        sc = 1 - .55 * away
        sav, _ = flat_savelyev(t, S, int(520 * sc), int(780 * sc))
        put(img, sav, 540 - 260 * sc, 1000 - 520 * sc - 60 * away)
        img = self.snow.draw(img, t, clip=(270, 330, 810, 1280))
        img = Image.alpha_composite(img, self.frame)
        return Image.alpha_composite(img, R.glow(540, 200, 700, (216, 176, 96), 80))


class Ring(R.Scene):
    """Фигуры смыкаются вокруг Савельева. На секунду их девять — потом снова восемь."""

    START = [(120, 1180, 470), (300, 980, 330), (560, 940, 300), (800, 990, 340), (980, 1200, 480),
             (220, 1340, 520), (870, 1360, 540), (540, 1420, 560)]

    def __init__(self, params):
        super().__init__(params)
        p = R.Painter()
        R.sky_and_steppe(p, 830, lit=False)
        self.bg = Image.alpha_composite(p.done(), R.glow(-100, 900, 800, (240, 190, 100), 110))
        self.snow = R.Blizzard(seed=71)

    def render(self, t, ctx):
        pr = self.params
        img = self.bg.copy()
        close = rig.ease(t / (ctx.dur * .7))
        cx, cfeet = 540, 1120
        figs = [(x + (cx - x) * .55 * close, f + (cfeet - f) * .55 * close, h * (1 - .1 * close)) for x, f, h in self.START]
        t9 = wt(ctx, pr.get("nine_word", ""), 1e9) or 1e9
        t8 = wt(ctx, pr.get("eight_word", ""), 1e9) or 1e9
        sav_k = 1.0 if t < t9 else max(0.0, 1 - (t - t9) / .5)
        if t9 <= t < t8:  # девятый — высокий, на месте Савельева
            figs.append((cx, cfeet, 430 * rig.ease((t - t9) / .5)))
        if sav_k > 0:
            S = sav_pose(t, ctx, gun="none", turn=0, light=.45)
            sav, _ = flat_savelyev(t, S, 220, 330)
            put(img, alpha(sav, sav_k), cx - 110, cfeet - 330)
        img = Image.alpha_composite(img, tall_layer(sorted(figs, key=lambda f: f[1])))
        return self.snow.draw(img, t)


class Compartment5(R.CompartmentScene):
    """Утро: пассажиры спят в рассветном свете, на полу — просто вода."""

    def render(self, t, ctx):
        img = super().render(t, ctx)
        img = Image.blend(ImageEnhance.Brightness(img.convert("RGB")).enhance(1.5).convert("RGBA"),
                          Image.new("RGBA", (W, H), (236, 200, 176, 255)), .22)
        d = ImageDraw.Draw(img)
        d.ellipse((380, 1010, 760, 1080), fill=(150, 176, 200, 160))   # прозрачная лужа
        d.ellipse((470, 1025, 560, 1040), fill=(230, 240, 250, 160))
        return img


class EndCard(R.Scene):
    def render(self, t, ctx):
        img = Image.new("RGBA", (W, H), (6, 6, 9, 255))
        k = rig.ease((t - .3) / 1.0)
        d = ImageDraw.Draw(img)
        d.text((W / 2, 760), "КОНЕЦ", font=R.font("bold", 120), fill=(240, 240, 240, int(255 * k)), anchor="mm")
        d.text((W / 2, 880), "«НЕ ОТКРЫВАЙ ДВЕРЬ»", font=R.font("bold", 44), fill=(240, 200, 60, int(255 * k)), anchor="mm")
        return img


SCENES4 = {"train": Train5, "horde": Horde, "exit": Exit, "ring": Ring, "compartment": Compartment5, "endcard": EndCard,
           "dark": Dark4, "cabdoor": Cabdoor4, "cabdoor_behind": CabdoorBehind, "shot": Shot, "cab": Cab,
           "flashback": Flashback, "memo_piece": MemoPiece, "boot": Boot, "breaker": Breaker, "logbook": Logbook}
THUMBS4 = {"breaker": {"wire": True}, "boot": {"sole": True}}
