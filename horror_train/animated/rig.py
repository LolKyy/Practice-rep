"""Персонажи части 4 — риги по CHARACTERS.md.

Каждый персонаж рисуется заново в каждом кадре из позы `P` (словарь) и времени `t`:
дыхание, моргание, микросаккады, поворот и наклон головы, рот по громкости голоса.
Рисуем в двойном разрешении на холсте размером с персонажа и уменьшаем — плоский стиль
без контура, 2–3 тона на объект (свет / тень / рефлекс от огня).
"""

import math

import numpy as np
from PIL import Image, ImageDraw, ImageFilter

SS = 2

# ------------------------------------------------------------------ время и движение


def clip01(u):
    return max(0.0, min(1.0, u))


def ease(u):
    u = clip01(u)
    return u * u * (3 - 2 * u)


def ease_out_back(u, k=1.4):
    u = clip01(u) - 1
    return 1 + (k + 1) * u ** 3 + k * u ** 2


def react(t, t0, dur=.35, overshoot=True):
    """Реакция на слово: упреждение 0.1 с (лёгкий откат), затем движение с перелётом 5–10 %."""
    if t0 is None or t < t0 - .1:
        return 0.0
    if t < t0:
        return -.06 * math.sin(math.pi * (t - (t0 - .1)) / .1)
    u = (t - t0) / dur
    return ease_out_back(u) if overshoot else ease(u)


def noise(t, seed=0, freq=.5):
    """Плавный шум в [-1, 1] — сумма несоизмеримых синусов (дешёвая замена Перлину)."""
    r = np.random.default_rng(seed)
    ph = r.uniform(0, 6.28, 3)
    return (.55 * math.sin(2 * math.pi * freq * t + ph[0]) + .3 * math.sin(2 * math.pi * freq * 2.13 * t + ph[1])
            + .15 * math.sin(2 * math.pi * freq * 4.37 * t + ph[2]))


def flicker(t, seed=0):
    """Мерцание пламени 6–10 Гц, ±15 % яркости."""
    return 1 + .15 * (.55 * math.sin(2 * math.pi * 7.3 * t + seed) + .3 * math.sin(2 * math.pi * 9.7 * t + 2 * seed)
                      + .15 * math.sin(2 * math.pi * 6.1 * t + 3))


_SCHED = {}


def _schedule(seed, lo, hi, n=400):
    if (seed, lo, hi) not in _SCHED:
        r = np.random.default_rng(seed)
        _SCHED[(seed, lo, hi)] = (np.cumsum(r.uniform(lo, hi, n)), r.uniform(-1, 1, (n, 2)))
    return _SCHED[(seed, lo, hi)]


def blink(t, seed=1):
    """Моргание каждые 2.5–5 с: закрытие 80 мс, открытие 120 мс."""
    times, _ = _schedule(seed, 2.5, 5.0)
    i = np.searchsorted(times, t)
    for t0 in (times[i - 1] if i else -9, times[i] if i < len(times) else 1e9):
        u = t - t0
        if 0 <= u < .08:
            return u / .08
        if .08 <= u < .2:
            return 1 - (u - .08) / .12
    return 0.0


def saccade(t, seed=2):
    """Микросаккады каждые 0.6–1.5 с: смещение зрачка на 1–3 px."""
    times, offs = _schedule(seed + 100, .6, 1.5)
    i = int(np.searchsorted(times, t))
    return offs[min(i, len(offs) - 1)] * .5


def breath(t, period=3.5, seed=0):
    """Фаза дыхания 0..1 (1 — вдох) и время последнего выдоха — для облачка пара."""
    ph = (t / period + seed * .37) % 1
    return .5 - .5 * math.cos(2 * math.pi * ph), (t - (ph - .5) * period) if ph >= .5 else t - (ph + .5) * period


# ------------------------------------------------------------------ холст


class Canvas:
    """Холст персонажа в 2× с удобными примитивами и поворотом точек вокруг шеи."""

    def __init__(self, w, h):
        self.w, self.h = w, h
        self.img = Image.new("RGBA", (w * SS, h * SS), (0, 0, 0, 0))
        self.d = ImageDraw.Draw(self.img)
        self.xf = None

    def _p(self, pts):
        if self.xf:
            pts = [self.xf(x, y) for x, y in pts]
        return [(x * SS, y * SS) for x, y in pts]

    def poly(self, pts, c):
        self.d.polygon(self._p(pts), fill=c)

    def ell(self, cx, cy, rx, ry, c, n=36, rot=0.0):
        a = np.linspace(0, 2 * math.pi, n, endpoint=False)
        cr, sr = math.cos(rot), math.sin(rot)
        pts = [(cx + rx * math.cos(t) * cr - ry * math.sin(t) * sr, cy + rx * math.cos(t) * sr + ry * math.sin(t) * cr) for t in a]
        self.poly(pts, c)

    def line(self, pts, c, w):
        self.d.line(self._p(pts), fill=c, width=max(1, int(w * SS)), joint="curve")
        for x, y in self._p([pts[0], pts[-1]]):
            r = w * SS / 2
            self.d.ellipse((x - r, y - r, x + r, y + r), fill=c)

    def done(self):
        return self.img.resize((self.w, self.h), Image.LANCZOS)


def mix(c0, c1, k):
    k = clip01(k)
    return tuple(int(a + (b - a) * k) for a, b in zip(c0, c1))


def rot_about(px, py, deg):
    a = math.radians(deg)
    ca, sa = math.cos(a), math.sin(a)
    return lambda x, y: (px + (x - px) * ca - (y - py) * sa, py + (x - px) * sa + (y - py) * ca)


# ------------------------------------------------------------------ лицо

SKIN = {
    "dima": ((214, 168, 140), (92, 92, 110)),        # свет, тень (синяя)
    "savelyev": ((206, 160, 128), (120, 92, 76)),
    "boy": ((214, 172, 140), (120, 96, 80)),
}


def face(cv, cx, cy, s, P, kind):
    """Голова высотой ~s px с центром (cx, cy). P: turn, tilt, blink, look(dx,dy), brow, frown, mouth,
    light (0..1), light_from ('below' | 'top'), frost, eyes_closed, wide."""
    turn, tilt = P.get("turn", 0.0), P.get("tilt", 0.0)
    cv.xf = rot_about(cx, cy + .55 * s, tilt)
    lit, shade = SKIN[kind]
    k = P.get("light", 1.0)
    warm = P.get("light_color", (232, 160, 80))
    base = mix(shade, lit, .35 + .45 * k)
    hi = mix(lit, warm, .35)
    rx, ry = .36 * s, .5 * s

    def head_pts(sc=1.0, y0=None, y1=None):
        out = []
        for a in np.linspace(0, 2 * math.pi, 48, endpoint=False):
            x = rx * sc * math.cos(a) * (1 - .17 * max(0.0, math.sin(a)))
            y = ry * sc * math.sin(a)
            if (y0 is None or y >= y0) and (y1 is None or y <= y1):
                out.append((cx + x, cy + y))
        return out

    # уши
    for sgn in (-1, 1):
        if sgn * turn < .5:
            cv.ell(cx + sgn * (rx * .98 - turn * sgn * .06 * s), cy + .02 * s, .06 * s, .1 * s, mix(base, shade, .25))
    if kind == "dima" or kind == "boy":
        neck_c = mix(base, shade, .3)
    else:
        neck_c = mix(base, shade, .2)
    cv.poly([(cx - .15 * s, cy + .3 * s), (cx + .15 * s, cy + .3 * s), (cx + .17 * s, cy + .68 * s), (cx - .17 * s, cy + .68 * s)], neck_c)
    cv.poly(head_pts(), base)
    # свет: снизу (огонёк) — подбородок, скулы, нижние веки; сверху-сбоку (лампа кабины) — лоб и щека
    if P.get("light_from", "below") == "below":
        if k > 0:
            cv.poly([(x, y) for x, y in head_pts(.97) if y > cy + .05 * s], mix(base, hi, .55 * k))
            for sgn in (-1, 1):
                cv.ell(cx + sgn * .2 * s + turn * .1 * s, cy + .1 * s, .09 * s, .05 * s, mix(base, hi, .6 * k))
    else:
        side = -1 if P.get("light_side", "left") == "left" else 1
        cv.poly([(x, y) for x, y in head_pts(.97) if (x - cx) * side > -.05 * s and y < cy + .35 * s], mix(base, hi, .45 * k))
    # щёки / морщины
    if kind == "dima":
        for sgn in (-1, 1):
            cv.line([(cx + sgn * .23 * s + turn * .1 * s, cy + .08 * s), (cx + sgn * .21 * s + turn * .1 * s, cy + .18 * s)],
                    mix(base, shade, .25), .03 * s)
    if kind == "savelyev":
        for sgn in (-1, 1):
            nx = cx + turn * .12 * s + sgn * .07 * s
            cv.line([(nx, cy + .14 * s), (nx + sgn * .05 * s, cy + .3 * s)], mix(base, shade, .7), .02 * s)
        for i in range(2):
            cv.line([(cx - .16 * s + turn * .08 * s, cy - .3 * s + i * .06 * s), (cx + .16 * s + turn * .08 * s, cy - .31 * s + i * .06 * s)],
                    mix(base, shade, .4), .012 * s)
        rng = np.random.default_rng(7)
        for x, y in rng.uniform([-.27, .12], [.27, .45], (70, 2)):
            if (x / .3) ** 2 + ((y - .1) / .4) ** 2 < 1:
                cv.ell(cx + x * s + turn * .08 * s, cy + y * s, .007 * s, .007 * s, (128, 120, 112), n=6)
    # глаза
    look = P.get("look", (0.0, 0.0))
    sac = P.get("saccade", (0.0, 0.0))
    bl = 1.0 if P.get("eyes_closed") else P.get("blink", 0.0)
    wide = 1.25 if P.get("wide") else 1.0
    for sgn in (-1, 1):
        ex = cx + (sgn * .155 + turn * .12) * s
        ey = cy - .03 * s
        ew = .1 * s * (1 - .4 * max(0.0, turn * sgn)) * (1 + .1 * max(0.0, -turn * sgn))
        eh = .045 * s * wide
        top = [(ex - ew + 2 * ew * i / 10, ey - eh * math.sin(math.pi * i / 10)) for i in range(11)]
        bot = [(ex + ew - 2 * ew * i / 10, ey + eh * .6 * math.sin(math.pi * i / 10)) for i in range(11)]
        cv.poly(top + bot, (226, 224, 216))
        ix = ex + (look[0] * .045 + sac[0] * .012) * s
        iy = ey + (look[1] * .02 + sac[1] * .008) * s
        cv.ell(ix, iy, .028 * s, .028 * s, P.get("iris", (70, 62, 54)))
        cv.ell(ix, iy, .016 * s * P.get("pupil", 1.0), .016 * s * P.get("pupil", 1.0), (10, 10, 12))
        cv.ell(ix - .008 * s, iy - .01 * s, .006 * s, .006 * s, (240, 240, 240), n=8)
        lid_y = ey - eh + (eh * 1.6) * bl
        lid = [(x, min(y, lid_y) if bl > 0 else y) for x, y in top]
        cv.poly([(ex - ew * 1.15, ey - eh * 1.6)] + [(x, y - .003 * s) for x, y in lid] + [(ex + ew * 1.15, ey - eh * 1.6)],
                mix(base, shade, .15))
        if bl > 0:  # веко опускается на глаз
            cv.poly([(x, y) for x, y in top] + [(x, lid_y) for x, _ in top[::-1]], mix(base, shade, .15))
        cv.line([(ex - ew * .8, ey + eh * .55), (ex + ew * .8, ey + eh * .55)], mix(base, shade, .35), .008 * s)
        # брови
        raise_ = P.get("brow", 0.0)
        frown = P.get("frown", 0.0)
        by = ey - .085 * s - raise_ * .035 * s
        bw = .1 * s if kind != "savelyev" else .12 * s
        bc = (70, 54, 42) if kind == "dima" else (200, 198, 192) if kind == "savelyev" else (60, 50, 40)
        inner = ex - sgn * bw * .2
        outer = ex + sgn * bw
        cv.line([(inner - sgn * bw * .3, by + frown * .03 * s), (outer, by - .01 * s)], bc, (.024 if kind != "savelyev" else .034) * s)
        if P.get("frost", 0) > 0:
            for j in range(5):
                fx = inner - sgn * bw * .3 + (outer - inner + sgn * bw * .3) * j / 4
                cv.ell(fx, by - .012 * s, .006 * s * P["frost"], .005 * s * P["frost"], (226, 234, 244), n=6)
    # нос
    nx = cx + turn * .14 * s
    side = 1 if turn >= 0 else -1
    cv.poly([(nx, cy - .02 * s), (nx + side * .05 * s, cy + .16 * s), (nx - side * .02 * s, cy + .18 * s)], mix(base, shade, .45))
    # рот
    mo = clip01(P.get("mouth", 0.0))
    mx, my = cx + turn * .11 * s, cy + .29 * s
    lip = (150, 92, 88) if kind == "dima" else mix(base, (120, 70, 60), .6)
    if mo < .06:
        cv.line([(mx - .07 * s, my), (mx + .07 * s, my + .004 * s)], lip, .014 * s)
    else:
        cv.ell(mx, my + .02 * mo * s, .065 * s * (1 - .2 * mo), (.012 + .055 * mo) * s, (46, 18, 18))
        cv.ell(mx, my + .055 * mo * s, .03 * s, .012 * mo * s, (150, 70, 70))
    # волосы
    if kind == "dima":
        hair = (58, 46, 36)
        pts = [(x, y - .01 * s) for x, y in head_pts(1.03) if y < cy - .2 * s]
        cv.poly(pts, hair)
        for a in np.linspace(math.pi * 1.08, math.pi * 1.92, 16):
            cv.ell(cx + rx * 1.02 * math.cos(a), cy + ry * 1.02 * math.sin(a), .025 * s, .02 * s, hair, n=6)
    elif kind == "savelyev":
        hair = (196, 194, 188)
        cv.poly([(x, y - .01 * s) for x, y in head_pts(1.03) if y < cy - .27 * s], hair)
        for sgn in (-1, 1):
            cv.poly([(cx + sgn * rx * .95, cy - .3 * s), (cx + sgn * rx * 1.02, cy - .05 * s), (cx + sgn * rx * .9, cy - .05 * s)], hair)
    cv.xf = None
    return {"mouth": (mx, my), "eyes_y": cy - .03 * s}


# ------------------------------------------------------------------ Дима

KHAKI, KHAKI_D = (74, 80, 64), (50, 54, 44)


def dima(t, P, w=900, h=1100):
    """Дима по пояс. Голова ~h/5. P: всё для лица + left_raise (жест «не стреляй»), lighter (рука с зажигалкой),
    breath_period, steam, light, light_from. Возвращает (картинка, точки: flame, mouth)."""
    cv = Canvas(w, h)
    s = h / 3.9
    cx = w / 2 + P.get("dx", 0.0)
    br, last_exhale = breath(t, P.get("breath_period", 1.5), seed=1)
    cy = h * .27 + P.get("dy", 0.0) - br * .01 * s
    k = P.get("light", 1.0)
    coat = mix(KHAKI_D, KHAKI, .4 + .5 * k)
    sh_y = cy + .68 * s
    sw = 1.0 * s * (1 + .012 * br)
    # корпус
    cv.poly([(cx - sw, sh_y + .35 * s), (cx - sw * .8, sh_y + .08 * s), (cx - sw * .45, sh_y - .04 * s), (cx + sw * .45, sh_y - .04 * s),
             (cx + sw * .8, sh_y + .08 * s), (cx + sw, sh_y + .35 * s), (cx + sw * .95, h), (cx - sw * .95, h)], coat)
    cv.poly([(cx + sw * .2, sh_y + .1 * s), (cx + sw * .8, sh_y + .08 * s), (cx + sw, sh_y + .35 * s), (cx + sw * .95, h), (cx + sw * .45, h)],
            mix(coat, (18, 20, 26), .35))
    cv.poly([(cx - .22 * s, sh_y - .02 * s), (cx + .22 * s, sh_y - .02 * s), (cx, sh_y + .55 * s)], (230, 232, 236))
    for i in range(5):  # тельняшка
        y = sh_y + .04 * s + i * .1 * s
        half = .22 * s * (1 - (y - sh_y) / (.57 * s))
        if half > 0:
            cv.line([(cx - half, y), (cx + half, y)], (40, 60, 120), .035 * s)
    for sgn in (-1, 1):  # поднятый воротник
        cv.poly([(cx + sgn * .2 * s, sh_y - .05 * s), (cx + sgn * .55 * s, sh_y - .02 * s), (cx + sgn * .5 * s, sh_y - .45 * s),
                 (cx + sgn * .3 * s, sh_y - .4 * s)], mix(coat, (30, 30, 26), .25))
    cv.line([(cx, sh_y + .6 * s), (cx, h)], mix(coat, (20, 20, 18), .4), .02 * s)
    for j in range(3):
        cv.ell(cx + .06 * s, sh_y + .8 * s + j * .45 * s, .03 * s, .03 * s, (60, 58, 40))
    # рука с зажигалкой (правая, у груди)
    pts = {}
    if P.get("lighter", True):
        hx, hy = cx + .55 * s + P.get("hand_dx", 0.0), sh_y + 1.35 * s + P.get("hand_dy", 0.0)
        hx += P.get("tremor", 0.0) * 4 * math.sin(t * 2 * math.pi * 8)
        cv.line([(cx + sw * .85, sh_y + .4 * s), (cx + sw * .95, sh_y + 1.2 * s), (hx + .12 * s, hy + .1 * s)], coat, .36 * s)
        cv.poly([(hx - .07 * s, hy - .32 * s), (hx + .07 * s, hy - .32 * s), (hx + .07 * s, hy - .05 * s), (hx - .07 * s, hy - .05 * s)], (40, 40, 46))
        cv.ell(hx, hy, .17 * s, .14 * s, mix((110, 80, 64), (230, 160, 110), k))
        cv.ell(hx + .13 * s, hy - .1 * s, .06 * s, .05 * s, mix((120, 88, 70), (236, 170, 120), k))
        pts["flame"] = (hx, hy - .34 * s)
    # левая рука — ладонь вперёд
    lr = P.get("left_raise", 0.0)
    if lr > 0:
        ex, ey = cx - sw * 1.1, sh_y + 1.1 * s - lr * .5 * s
        hx2, hy2 = cx - sw * .95 - lr * .1 * s, sh_y + 1.5 * s - lr * 1.85 * s
        cv.line([(cx - sw * .85, sh_y + .4 * s), (ex, ey), (hx2, hy2)], coat, .34 * s)
        palm = mix((110, 80, 64), (220, 150, 104), k)
        cv.ell(hx2, hy2 - .05 * s, .13 * s, .16 * s, palm)
        for i in range(4):
            fx = hx2 - .09 * s + i * .06 * s
            cv.line([(fx, hy2 - .15 * s), (fx + (i - 1.5) * .015 * s, hy2 - .36 * s)], palm, .05 * s)
        cv.line([(hx2 + .12 * s, hy2 - .02 * s), (hx2 + .22 * s, hy2 - .14 * s)], palm, .05 * s)
        pts["left_hand"] = (hx2, hy2)
    fp = dict(P)
    fp["light"] = k
    pts.update(face(cv, cx, cy, s, fp, "dima"))
    img = cv.done()
    # облачко пара на выдохе
    if P.get("steam", True):
        u = t - last_exhale
        if 0 <= u < 1.0:
            layer = Image.new("RGBA", img.size, (0, 0, 0, 0))
            d = ImageDraw.Draw(layer)
            mx, my = pts["mouth"]
            for j in range(4):
                r = (8 + 40 * u) * (1 + j * .3)
                x = mx + (20 + 70 * u) * (j - 1.5) * .3 + 30 * u
                y = my - 10 - 60 * u * (1 + j * .2)
                d.ellipse((x - r, y - r, x + r, y + r), fill=(220, 226, 236, int(70 * (1 - u) * P.get("steam_k", 1.0))))
            img = Image.alpha_composite(img, layer.filter(ImageFilter.GaussianBlur(6)))
    return img, pts


# ------------------------------------------------------------------ Савельев

SHIRT, SHIRT_D = (200, 192, 168), (140, 132, 112)


def savelyev(t, P, w=900, h=1300):
    """Савельев сидя, средний план. P: лицо + gun ('knees' | 'up'), rub (0..1 рука трёт щетину), squeeze."""
    cv = Canvas(w, h)
    s = h / 4.6
    cx = w / 2 + P.get("dx", 0.0)
    br, _ = breath(t, P.get("breath_period", 3.8), seed=3)
    doze = P.get("doze", 0.0)
    cy = h * .2 + doze * .25 * s - br * .008 * s
    k = P.get("light", 1.0)
    shirt = mix(SHIRT_D, SHIRT, .5 + .4 * k)
    sh_y = h * .2 + .7 * s
    sw = 1.0 * s * (1 + .01 * br)
    cv.poly([(cx - sw, sh_y + .2 * s), (cx - sw * .5, sh_y - .05 * s), (cx + sw * .5, sh_y - .05 * s), (cx + sw, sh_y + .2 * s),
             (cx + sw * .95, h * .82), (cx - sw * .95, h * .82)], shirt)
    cv.poly([(cx + sw * .1, sh_y), (cx + sw * .95, sh_y + .2 * s), (cx + sw * .95, h * .82), (cx + sw * .3, h * .82)], mix(shirt, SHIRT_D, .5))
    for sgn in (-1, 1):  # подтяжки
        cv.line([(cx + sgn * .55 * s, sh_y), (cx + sgn * .5 * s, h * .82)], (60, 50, 44), .1 * s)
    cv.line([(cx - .12 * s, sh_y - .02 * s), (cx, sh_y + .9 * s), (cx + .12 * s, sh_y - .02 * s)], (40, 36, 30), .015 * s)
    cv.ell(cx, sh_y + .95 * s, .05 * s, .09 * s, (180, 170, 120))  # ключ на шнурке
    # колени и ружьё
    cv.poly([(cx - sw * 1.05, h * .8), (cx + sw * 1.05, h * .8), (cx + sw * 1.15, h), (cx - sw * 1.15, h)], (54, 56, 62))
    arm = mix((150, 112, 90), (214, 160, 124), k)
    gun = P.get("gun", "knees")
    if gun == "knees":
        gy = h * .8
        cv.poly([(cx - sw * 1.3, gy + .1 * s), (cx - sw * .2, gy - .05 * s), (cx - sw * .2, gy + .15 * s), (cx - sw * 1.3, gy + .35 * s)], (92, 58, 36))
        cv.line([(cx - sw * .2, gy + .02 * s), (cx + sw * 1.6, gy - .2 * s)], (40, 42, 46), .12 * s)
        cv.line([(cx - sw * .2, gy + .1 * s), (cx + sw * 1.6, gy - .12 * s)], (52, 54, 58), .1 * s)
        hands = [(cx - sw * .55, gy + .05 * s), (cx + sw * .5, gy - .05 * s)]
    else:
        up = P.get("gun_up_k", 1.0)
        gx, gy = cx + .1 * s, h * .66 - up * .25 * s
        hands = [(gx - .45 * s, gy + .35 * s), (gx + .35 * s, gy + .25 * s)]
        cv.poly([(gx - .5 * s, gy + .1 * s), (gx + .5 * s, gy + .1 * s), (gx + .45 * s, gy + .55 * s), (gx - .45 * s, gy + .55 * s)], (92, 58, 36))
        for sgn in (-1, 1):
            r = .27 * s * (.6 + .4 * up)
            bx = gx + sgn * .28 * s
            cv.ell(bx, gy, r, r, (90, 94, 102))
            cv.ell(bx, gy, r * .72, r * .72, (40, 42, 46))
            cv.ell(bx, gy, r * .5, r * .5, (0, 0, 0))
    sq = P.get("squeeze", 0.0)
    for i, (hx, hy) in enumerate(hands):
        sx = cx + (-sw * .9 if i == 0 else sw * .9)
        ex_, ey_ = sx + (hx - sx) * .25 + (-.15 * s if i == 0 else .15 * s), sh_y + 1.25 * s
        cv.line([(sx, sh_y + .3 * s), (ex_, ey_)], shirt, .4 * s)                 # плечо в рукаве
        cv.line([(ex_, ey_ - .1 * s), (ex_, ey_ + .08 * s)], mix(shirt, SHIRT_D, .6), .42 * s)  # закатанный рукав
        cv.line([(ex_, ey_ + .05 * s), (hx, hy)], arm, .28 * s)                   # предплечье
        cv.ell(hx, hy, .17 * s * (1 - .08 * sq), .13 * s, arm)
        for f in range(4):
            cv.ell(hx - .1 * s + f * .065 * s, hy + .1 * s, .035 * s, .05 * s, mix(arm, (90, 60, 44), .25), n=10)
    rub = P.get("rub", 0.0)
    fp = dict(P)
    info = face(cv, cx, cy, s, fp, "savelyev")
    if rub > 0:  # ладонь трёт щетину
        rx_ = cx + .1 * s + .06 * s * math.sin(t * 9)
        ry_ = cy + .38 * s
        cv.line([(cx + sw * .9, sh_y + .3 * s), (cx + sw * .6, sh_y + .9 * s), (rx_ + .2 * s, ry_ + .3 * s)], shirt, .36 * rub * s + .01)
        cv.ell(rx_, ry_, .2 * s, .14 * s, arm)
    img = cv.done()
    return img, info


# ------------------------------------------------------------------ мальчик-1954 (сепия)

def boy(t, P, w=600, h=700):
    """Мальчик 9 лет в огромном отцовском тулупе. P: pose ('sit' | 'stand'), hat (0..1 — шапка сползла)."""
    cv = Canvas(w, h)
    s = h / 4.2
    cx = w / 2
    br, _ = breath(t, 2.6, seed=5)
    tulup, tulup_d, fur = (120, 84, 50), (86, 60, 36), (200, 184, 150)
    if P.get("pose", "sit") == "sit":
        cy = h * .3 - br * .01 * s
        cv.poly([(cx - .75 * s, cy + .55 * s), (cx + .75 * s, cy + .55 * s), (cx + 1.25 * s, h * .97), (cx - 1.25 * s, h * .97)], tulup)
        cv.poly([(cx + .2 * s, cy + .6 * s), (cx + .75 * s, cy + .55 * s), (cx + 1.25 * s, h * .97), (cx + .5 * s, h * .97)], tulup_d)
        cv.ell(cx - .2 * s, h * .76, .55 * s, .45 * s, (90, 70, 50))  # колени
        cv.ell(cx + .45 * s, h * .78, .5 * s, .4 * s, (90, 70, 50))
        cv.line([(cx - .9 * s, h * .55), (cx - .2 * s, h * .82), (cx + .6 * s, h * .82)], tulup, .38 * s)
        cv.ell(cx, cy + .55 * s, .75 * s, .3 * s, fur)
    else:
        cy = h * .22 - br * .01 * s
        cv.poly([(cx - .9 * s, cy + .6 * s), (cx + .9 * s, cy + .6 * s), (cx + 1.1 * s, h * .88), (cx - 1.1 * s, h * .88)], tulup)
        cv.ell(cx, cy + .6 * s, .7 * s, .25 * s, fur)
        for sgn in (-1, 1):
            cv.poly([(cx + sgn * .5 * s, h * .86), (cx + sgn * .15 * s, h * .86), (cx + sgn * .15 * s, h), (cx + sgn * .55 * s, h)], (60, 50, 40))
    info = face(cv, cx, cy, s * .95, dict(P, light_from="top", light=.7), "boy")
    hat = P.get("hat", 0.0)
    hy = cy - .42 * s + hat * .22 * s
    cv.ell(cx, hy, .55 * s, .32 * s, (80, 64, 48))
    cv.poly([(cx - .55 * s, hy), (cx + .55 * s, hy), (cx + .6 * s, hy + .2 * s), (cx - .6 * s, hy + .2 * s)], fur)
    for sgn in (-1, 1):
        cv.ell(cx + sgn * .55 * s, hy + .35 * s, .14 * s, .3 * s, fur)
    return cv.done(), info


# ------------------------------------------------------------------ мимик

def mimic(t, P, w=1000, h=1500):
    """ОНО: силуэт выше человека на голову, руки длиннее, пальцы в 1.5 раза длиннее. Лица нет.
    P: left_raise, tilt (копии позы Димы с задержкой), sway — только при копировании."""
    cv = Canvas(w, h)
    s = h / 5.0
    cx = w / 2 + P.get("dx", 0.0)
    cy = h * .12
    body = (6, 6, 9)
    cv.xf = rot_about(cx, cy + .6 * s, P.get("tilt", 0.0) * 1.2)
    cv.ell(cx, cy, .33 * s, .52 * s, body)
    cv.xf = None
    sh_y = cy + .75 * s
    sw = 1.05 * s
    cv.poly([(cx - sw, sh_y + .35 * s), (cx - sw * .45, sh_y), (cx + sw * .45, sh_y), (cx + sw, sh_y + .35 * s),
             (cx + sw * .6, sh_y + 2.4 * s), (cx + sw * .7, h), (cx - sw * .7, h), (cx - sw * .6, sh_y + 2.4 * s)], body)
    cv.poly([(cx - .1 * s, cy + .3 * s), (cx + .1 * s, cy + .3 * s), (cx + .12 * s, sh_y + .1 * s), (cx - .12 * s, sh_y + .1 * s)], body)
    lr = P.get("left_raise", 0.0)
    tips = []
    for sgn, raise_ in ((-1, lr), (1, 0.0)):
        ex, ey = cx + sgn * sw * 1.15, sh_y + 1.5 * s - raise_ * .7 * s
        hx, hy = cx + sgn * (sw * 1.0 + raise_ * .1 * s), sh_y + 2.6 * s - raise_ * 3.0 * s
        cv.line([(cx + sgn * sw * .85, sh_y + .4 * s), (ex, ey), (hx, hy)], body, .3 * s)
        cv.ell(hx, hy, .13 * s, .17 * s, body)
        for i in range(4):
            a = math.radians(-20 + i * 13) if raise_ > .3 else math.radians(160 + i * 13)
            fx, fy = hx - .08 * s + i * .055 * s, hy
            L = .62 * s
            ex2, ey2 = fx + L * math.sin(a) * .35, fy - L * math.cos(a)
            cv.line([(fx, fy), (ex2, ey2)], body, .045 * s)
            tips.append((ex2, ey2))
    img = cv.done()
    layer = Image.new("RGBA", img.size, (0, 0, 0, 0))
    d = ImageDraw.Draw(layer)
    hl = (58, 74, 90)
    for j in range(4):  # мокрые блики скользят по контуру
        u = (t * .25 + j / 4) % 1
        yy = sh_y + u * (h - sh_y) * .8
        xx = cx - sw * (1 - .1 * u) + 10
        d.line([(xx, yy), (xx + 6, yy + 70)], fill=hl + (180,), width=5)
        d.line([(cx + sw * .55 - 30 * u, sh_y + 10 + 20 * u), (cx + sw * .7 - 30 * u, sh_y + 40 + 20 * u)], fill=hl + (140,), width=4)
    for k, (x, y) in enumerate(tips):  # с пальцев капает
        u = (t * 1.1 + k * .23) % 1
        d.ellipse((x - 5, y + 120 * u, x + 5, y + 120 * u + 12), fill=(10, 10, 14, int(255 * (1 - u))))
    return Image.alpha_composite(img, layer)


def burning(layer, t, k):
    """Силуэт горит: оранжево-белое пламя по контуру, языки вверх, тело тлеет изнутри.
    k — 0..1, как далеко огонь пробежал снизу вверх."""
    a = layer.getchannel("A")
    w, h = layer.size
    A = np.array(a).astype(float) / 255
    outer = np.array(a.filter(ImageFilter.MaxFilter(31))).astype(float) / 255 - A
    inner = A - np.array(a.filter(ImageFilter.MinFilter(17))).astype(float) / 255
    yy = np.arange(h)[:, None] / h
    front = np.clip((yy - (1 - k * 1.15)) / .08, 0, 1)
    rng = np.random.default_rng(int(t * 24))
    n = rng.random((h // 10 + 1, w // 10 + 1))
    n = np.array(Image.fromarray((n * 255).astype(np.uint8)).resize((w, h), Image.BICUBIC)) / 255
    fl = np.clip((outer * 1.4 + inner) * front * (.45 + n), 0, 1)
    tongues = np.zeros_like(fl)
    for i, sh in enumerate((18, 40, 70, 110, 150)):
        tongues[:-sh] = np.maximum(tongues[:-sh], fl[sh:] * (.95 - i * .16) * (n[sh:] > .3 + i * .1))
    fl = np.maximum(fl, tongues)
    big = np.array(Image.fromarray((rng.random((h // 60 + 1, w // 60 + 1)) * 255).astype(np.uint8))
                   .resize((w, h), Image.BICUBIC)) / 255
    ember = A * front * np.clip(big - .45, 0, 1) * 1.4   # редкие тлеющие пятна, тело остаётся чёрным
    rgb = np.zeros((h, w, 4), np.uint8)
    rgb[..., 0] = 255
    rgb[..., 1] = (120 + 120 * fl).astype(np.uint8)
    rgb[..., 2] = (30 + 170 * fl ** 2).astype(np.uint8)
    rgb[..., 3] = (np.clip(fl, 0, 1) * 255).astype(np.uint8)
    flames = Image.fromarray(rgb, "RGBA")
    body = np.array(layer).astype(float)
    body[..., 0] += ember * 120
    body[..., 1] += ember * 34
    body = Image.fromarray(np.clip(body, 0, 255).astype(np.uint8), "RGBA")
    glow = flames.filter(ImageFilter.GaussianBlur(40))
    return Image.alpha_composite(Image.alpha_composite(Image.alpha_composite(glow, body), flames), flames.filter(ImageFilter.GaussianBlur(6)))
