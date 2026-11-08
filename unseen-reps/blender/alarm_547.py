"""
UNSEEN REPS — «5:47 AM» (пробный ролик, ~26 с, 1080x1920, 30 fps).

Две одинаковые спальни в разрезе («кукольный домик») на тёмном глянцевом полу.
Один и тот же будильник: левый встаёт, правый жмёт snooze и уходит в телефон.
Таймлапс DAY 1 → 30 → 180: комнаты меняются. DAY 365: левый просыпается сам до будильника.
Финал: «Same alarm. Different person.»

Запуск (Windows, ваш ПК, рендер Eevee на видеокарте):
  "C:\\Program Files\\Blender Foundation\\Blender 5.2\\blender.exe" -b -P blender\\alarm_547.py -- --out F:\\video\\alarm_547.mp4
Открыть сцену в Blender без рендера (посмотреть/подвигать):
  blender -P blender\\alarm_547.py
Проверочный кадр:  ... -- --still 300 --out F:\\video\\check.png
"""
import math, os, sys
import bpy
from mathutils import Vector

# ----------------------------------------------------------------------------- аргументы
argv = sys.argv[sys.argv.index("--") + 1:] if "--" in sys.argv else []
def arg(name, default=None):
    return argv[argv.index(name) + 1] if name in argv else default
OUT = arg("--out", os.path.join(os.path.dirname(os.path.abspath(__file__)), "..", "out", "alarm_547.mp4"))
STILL = arg("--still")
ENGINE = arg("--engine", "eevee")          # eevee (ваш ПК) | cycles (проверка без видеокарты)
SCALE = int(arg("--scale", "100"))
SAMPLES = int(arg("--samples", "64"))
HERE = os.path.dirname(os.path.abspath(__file__))

FPS = 30
DUR = 26.0
F = lambda s: int(round(s * FPS)) + 1     # секунды → кадр (кадры с 1)

# ----------------------------------------------------------------------------- сцена
scn = bpy.context.scene
for o in list(bpy.data.objects):
    bpy.data.objects.remove(o, do_unlink=True)
scn.frame_start, scn.frame_end = 1, F(DUR)
scn.render.fps = FPS
scn.render.resolution_x, scn.render.resolution_y = 1080, 1920
scn.render.resolution_percentage = SCALE

# ----------------------------------------------------------------------------- материалы
_mats = {}
def mat(name, color, rough=0.5, metal=0.0, emit=None, strength=0.0, alpha=1.0):
    key = name
    if key in _mats:
        return _mats[key]
    m = bpy.data.materials.new(name)
    m.use_nodes = True
    b = m.node_tree.nodes.get("Principled BSDF")
    b.inputs["Base Color"].default_value = (*color, 1)
    b.inputs["Roughness"].default_value = rough
    b.inputs["Metallic"].default_value = metal
    if emit is not None:
        b.inputs["Emission Color"].default_value = (*emit, 1)
        b.inputs["Emission Strength"].default_value = strength
    if alpha < 1:
        b.inputs["Alpha"].default_value = alpha
    _mats[key] = m
    return m

def emit_strength_key(m, frame, value, const=True):
    s = m.node_tree.nodes["Principled BSDF"].inputs["Emission Strength"]
    s.default_value = value
    s.keyframe_insert("default_value", frame=frame)
    if const:
        set_const(m.node_tree)

def set_const(idblock):
    ad = idblock.animation_data
    if not ad or not ad.action:
        return
    for fc in iter_fcurves(ad.action):
        for k in fc.keyframe_points:
            k.interpolation = "CONSTANT"

def iter_fcurves(action):
    """Blender 5: каналы лежат в слоях/полосах/канал-бэгах; старые версии — action.fcurves."""
    if hasattr(action, "fcurves") and len(getattr(action, "fcurves", [])):
        yield from action.fcurves
        return
    for layer in getattr(action, "layers", []):
        for strip in layer.strips:
            for bag in getattr(strip, "channelbags", []):
                yield from bag.fcurves

WHITE = mat("hero", (0.92, 0.92, 0.9), rough=0.35)
WALL = mat("wall", (0.16, 0.16, 0.18), rough=0.9)
WALL_IN_L = mat("wall_in_L", (0.22, 0.21, 0.2), rough=0.9)
WALL_IN_R = mat("wall_in_R", (0.22, 0.21, 0.2), rough=0.9)
FLOOR_IN = mat("floor_in", (0.12, 0.09, 0.07), rough=0.6)
TRIM = mat("trim", (0.05, 0.05, 0.06), rough=0.5)
GROUND = mat("ground", (0.012, 0.012, 0.014), rough=0.12, metal=0.0)
BED = mat("bed", (0.1, 0.1, 0.12), rough=0.7)
SHEET = mat("sheet", (0.55, 0.57, 0.62), rough=0.8)
PILLOW = mat("pillow", (0.85, 0.85, 0.85), rough=0.8)
WOOD = mat("wood", (0.28, 0.17, 0.1), rough=0.55)
DARK = mat("dark", (0.04, 0.04, 0.045), rough=0.4)
CARD = mat("cardboard", (0.45, 0.32, 0.18), rough=0.9)
GREEN = mat("plant", (0.12, 0.35, 0.15), rough=0.7)
IRON = mat("iron", (0.08, 0.08, 0.09), rough=0.3, metal=0.9)
BOOKS = [mat(f"book{i}", c, rough=0.6) for i, c in enumerate([(0.6, 0.12, 0.1), (0.1, 0.25, 0.55), (0.75, 0.6, 0.2), (0.15, 0.4, 0.25), (0.85, 0.85, 0.8)])]

# ----------------------------------------------------------------------------- примитивы
def box(name, loc, size, m, parent=None, bevel=0.01):
    bpy.ops.mesh.primitive_cube_add(size=1, location=loc)
    o = bpy.context.object
    o.name = name
    o.scale = size
    bpy.ops.object.transform_apply(scale=True)
    if bevel:
        mod = o.modifiers.new("bevel", "BEVEL"); mod.width = bevel; mod.segments = 2
    o.data.materials.append(m)
    if parent:
        o.parent = parent
    return o

def sphere(name, loc, r, m, parent=None):
    bpy.ops.mesh.primitive_uv_sphere_add(radius=r, location=loc, segments=32, ring_count=16)
    o = bpy.context.object; o.name = name
    bpy.ops.object.shade_smooth()
    o.data.materials.append(m)
    if parent:
        o.parent = parent; o.location = loc
    return o

def cyl(name, loc, r, depth, m, parent=None, rot=(0, 0, 0)):
    bpy.ops.mesh.primitive_cylinder_add(radius=r, depth=depth, location=loc, rotation=rot, vertices=24)
    o = bpy.context.object; o.name = name
    bpy.ops.object.shade_smooth()
    o.data.materials.append(m)
    if parent:
        o.parent = parent; o.location = loc; o.rotation_euler = rot
    return o

def empty(name, loc=(0, 0, 0), parent=None):
    o = bpy.data.objects.new(name, None)
    o.empty_display_size = 0.05
    scn.collection.objects.link(o)
    o.parent = parent
    o.location = loc
    return o

def text(name, body, size, m, font="Anton-Regular.ttf", parent=None, loc=(0, 0, 0), rot=(0, 0, 0), align="CENTER"):
    cu = bpy.data.curves.new(name, "FONT")
    cu.body = body
    cu.size = size
    cu.align_x = align
    cu.align_y = "CENTER"
    fp = os.path.join(HERE, "fonts", font)
    if os.path.exists(fp):
        cu.font = bpy.data.fonts.load(fp, check_existing=True)
    cu.extrude = 0.0
    o = bpy.data.objects.new(name, cu)
    scn.collection.objects.link(o)
    o.data.materials.append(m)
    o.parent = parent
    o.location = loc
    o.rotation_euler = rot
    return o

# ----------------------------------------------------------------------------- видимость по времени
def show(o, frames):
    """frames: список (кадр, True/False). Резкое включение/выключение (через масштаб и hide_render)."""
    base = tuple(o.scale)
    for fr, on in frames:
        o.hide_render = not on
        o.hide_viewport = not on
        o.keyframe_insert("hide_render", frame=fr)
        o.keyframe_insert("hide_viewport", frame=fr)
    o.scale = base

def pop(o, t_on, t_off=None):
    """Появление предмета на резкой склейке (таймлапс)."""
    fr = [(1, False), (F(t_on), True)]
    if t_off is not None:
        fr.append((F(t_off), False))
    show(o, fr)

# ----------------------------------------------------------------------------- дом и комнаты
W_ROOM, D_ROOM, H_WALL, T = 2.4, 3.0, 2.6, 0.15
CX = {"L": -(W_ROOM / 2 + T / 2), "R": (W_ROOM / 2 + T / 2)}
SIGN = {"L": -1, "R": 1}               # +u — к внешней стене
Y_BACK, Y_FRONT = D_ROOM / 2, -D_ROOM / 2

def ux(side, u):
    return CX[side] + SIGN[side] * u

# глянцевый «бесконечный» пол
bpy.ops.mesh.primitive_plane_add(size=80, location=(0, 0, -0.001))
gnd = bpy.context.object; gnd.name = "Ground"; gnd.data.materials.append(GROUND)

# каркас дома
outer_x = W_ROOM + T * 1.5
box("floor_house", (0, 0, -0.05), (2 * outer_x, D_ROOM + 0.1, 0.1), TRIM)
box("back_wall", (0, Y_BACK + T / 2, H_WALL / 2), (2 * outer_x, T, H_WALL), WALL)
box("divider", (0, 0, H_WALL / 2), (T, D_ROOM, H_WALL), WALL)
# крыша-контур (видна в финальном отъезде)
roof_h = 1.1
for s in (-1, 1):
    L = math.hypot(outer_x, roof_h)
    ang = math.atan2(roof_h, outer_x)
    r = box(f"roof_{s}", (s * outer_x / 2, 0, H_WALL + roof_h / 2), (L + 0.2, D_ROOM + 0.3, 0.06), mat("roof", (0.0, 0.0, 0.0), rough=1.0))
    r.rotation_euler = (0, s * ang, 0)
# торцы стен спереди (тонкая обводка разреза)
for x in (-outer_x + T / 2, 0, outer_x - T / 2):
    box(f"front_trim_{x:.2f}", (x, Y_FRONT, H_WALL / 2), (T + 0.02, 0.04, H_WALL), TRIM)

ROOM = {}
for side in ("L", "R"):
    s = SIGN[side]
    R = ROOM[side] = {}
    wall_in = WALL_IN_L if side == "L" else WALL_IN_R
    box(f"floor_{side}", (CX[side], 0, 0.005), (W_ROOM, D_ROOM, 0.01), FLOOR_IN, bevel=0)
    box(f"backpaint_{side}", (CX[side], Y_BACK - 0.005, H_WALL / 2), (W_ROOM, 0.01, H_WALL), wall_in, bevel=0)
    # внешняя стена с дверным проёмом (y ∈ [-0.4, 0.4])
    xo = ux(side, W_ROOM / 2 + T / 2)
    box(f"outer_a_{side}", (xo, (Y_FRONT - 0.4) / 2, H_WALL / 2), (T, -0.4 - Y_FRONT, H_WALL), WALL)
    box(f"outer_b_{side}", (xo, (Y_BACK + 0.4) / 2, H_WALL / 2), (T, Y_BACK - 0.4, H_WALL), WALL)
    box(f"outer_c_{side}", (xo, 0, (H_WALL + 2.05) / 2), (T, 0.8, H_WALL - 2.05), WALL)
    # свет снаружи двери (виден, когда дверь открыта)
    out_m = mat(f"outside_{side}", (1, 0.85, 0.6), emit=(1, 0.8, 0.55), strength=0.0)
    R["outside_mat"] = out_m
    box(f"outside_{side}", (ux(side, W_ROOM / 2 + T + 0.05), 0, 1.0), (0.02, 0.8, 2.05), out_m, bevel=0)
    # дверь на петле
    hinge = empty(f"door_hinge_{side}", (ux(side, W_ROOM / 2 + 0.02), -0.4, 0))
    d = box(f"door_{side}", (0, 0.4, 1.02), (0.05, 0.78, 2.03), WOOD, parent=hinge)
    d.location = (0, 0.4, 1.02)
    R["hinge"] = hinge
    # кровать (изголовье у задней стены)
    bu = -0.25
    bx = ux(side, bu)
    box(f"bed_{side}", (bx, 0.5, 0.2), (1.0, 2.0, 0.4), BED)
    box(f"mattress_{side}", (bx, 0.5, 0.45), (0.94, 1.95, 0.1), SHEET)
    box(f"pillow_{side}", (bx, 1.25, 0.54), (0.6, 0.32, 0.1), PILLOW, bevel=0.04)
    box(f"headboard_{side}", (bx, Y_BACK - 0.05, 0.6), (1.04, 0.08, 0.9), BED)
    # тумбочка + будильник
    nx = ux(side, -0.95)
    box(f"nightstand_{side}", (nx, 1.2, 0.27), (0.38, 0.38, 0.54), WOOD)
    clock = empty(f"clock_{side}", (nx, 1.12, 0.6))
    box(f"clock_body_{side}", (0, 0, 0), (0.26, 0.1, 0.12), DARK, parent=clock).location = (0, 0, 0)
    R["clock"] = clock
    R["clock_txt"] = {}
    for t_ in ("5:47", "5:46", "6:15", "6:40"):
        cm = mat(f"clock_{side}_{t_}", (0.1, 0, 0), emit=(1, 0.08, 0.06), strength=6.0)
        to = text(f"clock_{side}_{t_}", t_, 0.075, cm, font="JetBrainsMono.ttf", parent=clock, loc=(0, -0.052, 0.0), rot=(math.pi / 2, 0, 0))
        R["clock_txt"][t_] = (to, cm)
    # окно (предрассвет) на задней стене
    win_m = mat(f"window_{side}", (0.05, 0.08, 0.2), emit=(0.25, 0.35, 0.8), strength=1.2)
    R["window_mat"] = win_m
    wx = ux(side, 0.72)
    box(f"window_{side}", (wx, Y_BACK - 0.02, 1.5), (0.7, 0.02, 0.8), win_m, bevel=0)
    for dz in (-0.42, 0.42):
        box(f"wframe_h{dz}_{side}", (wx, Y_BACK - 0.04, 1.5 + dz), (0.78, 0.04, 0.05), TRIM, bevel=0)
    for du in (-0.37, 0.37):
        box(f"wframe_v{du}_{side}", (ux(side, 0.72 + du), Y_BACK - 0.04, 1.5), (0.05, 0.04, 0.88), TRIM, bevel=0)
    box(f"wframe_m_{side}", (wx, Y_BACK - 0.04, 1.5), (0.03, 0.04, 0.8), TRIM, bevel=0)
    # полка над кроватью
    box(f"shelf_{side}", (bx, Y_BACK - 0.13, 1.55), (0.9, 0.22, 0.03), WOOD)
    # свет комнаты (потолочный, скрытый)
    bpy.ops.object.light_add(type="AREA", location=(CX[side], 0.2, H_WALL - 0.05))
    lamp = bpy.context.object; lamp.name = f"lamp_{side}"
    lamp.data.size = 1.6
    R["lamp"] = lamp
    # свет из окна (холодный, слабый)
    bpy.ops.object.light_add(type="AREA", location=(wx, Y_BACK - 0.4, 1.5), rotation=(math.radians(90), 0, 0))
    wl = bpy.context.object; wl.name = f"winlight_{side}"; wl.data.size = 0.8
    wl.data.color = (0.5, 0.6, 1.0); wl.data.energy = 15
    R["winlight"] = wl
    # красный отсвет будильника
    bpy.ops.object.light_add(type="POINT", location=(nx, 0.95, 0.7))
    cl = bpy.context.object; cl.name = f"clocklight_{side}"; cl.data.color = (1, 0.1, 0.05); cl.data.shadow_soft_size = 0.1
    R["clocklight"] = cl

# ----------------------------------------------------------------------------- реквизит таймлапса
P = {}
# левая комната: книги, гантели, коврик, растение, календарь с крестиками
def books_on_shelf(side, n, tag):
    bx = ux(side, -0.25)
    objs = []
    x0 = bx - 0.4
    for i in range(n):
        w = 0.035 + (i * 7 % 4) * 0.008
        h = 0.18 + (i * 5 % 3) * 0.03
        objs.append(box(f"book_{tag}_{i}", (x0 + w / 2, Y_BACK - 0.13, 1.565 + h / 2), (w, 0.15, h), BOOKS[i % 5], bevel=0.003))
        x0 += w + 0.006
    return objs
P["L_books1"] = books_on_shelf("L", 3, "a")
P["L_books2"] = books_on_shelf("L", 16, "b")
P["L_mat"] = [box("yoga_mat", (ux("L", 0.55), -0.5, 0.012), (0.6, 1.5, 0.012), mat("matblue", (0.1, 0.3, 0.45), rough=0.8), bevel=0)]
P["L_dumb"] = []
for k, dy in enumerate((-1.0, -1.25)):
    g = empty(f"dumbbell_{k}", (ux("L", 0.95), dy, 0.06))
    cyl(f"db_bar_{k}", (0, 0, 0), 0.015, 0.3, IRON, parent=g, rot=(0, math.pi / 2, 0))
    for e in (-0.13, 0.13):
        cyl(f"db_w_{k}_{e}", (e, 0, 0), 0.06, 0.06, IRON, parent=g, rot=(0, math.pi / 2, 0))
    P["L_dumb"].append(g)
def plant(side, u, y, h, tag):
    g = empty(f"plant_{tag}", (ux(side, u), y, 0))
    cyl(f"pot_{tag}", (0, 0, 0.12), 0.11, 0.24, mat("pot", (0.55, 0.3, 0.2), rough=0.8), parent=g)
    for i in range(7):
        a = i * 2 * math.pi / 7
        lf = box(f"leaf_{tag}_{i}", (0, 0, 0), (0.05, 0.015, h), GREEN, parent=g, bevel=0.005)
        lf.location = (math.cos(a) * 0.04, math.sin(a) * 0.04, 0.24 + h / 2)
        lf.rotation_euler = (math.sin(a) * 0.35, math.cos(a) * 0.35, a)
    return g
P["L_plant1"] = [plant("L", 1.0, 1.25, 0.25, "small")]
P["L_plant2"] = [plant("L", 1.0, 1.25, 0.6, "big")]
cal = box("calendar", (ux("L", 0.72), Y_BACK - 0.02, 0.75), (0.45, 0.01, 0.4), mat("paper", (0.9, 0.88, 0.82), rough=0.9), bevel=0)
P["L_cal"] = [cal]
for i in range(12):
    r, c = divmod(i, 4)
    P["L_cal"].append(text(f"x_{i}", "X", 0.07, mat("red_ink", (0.7, 0.05, 0.05), rough=0.9), parent=None,
                           loc=(ux("L", 0.72) + (c - 1.5) * 0.095 * SIGN["L"], Y_BACK - 0.035, 0.83 - r * 0.09), rot=(math.pi / 2, 0, 0)))
# правая комната: коробки доставки, пицца, одежда, бутылки
def cbox(tag, u, y, z, s):
    return box(f"box_{tag}", (ux("R", u), y, z + s[2] / 2), s, CARD, bevel=0.004)
P["R_pizza"] = [box("pizza", (ux("R", 0.7), -0.9, 0.025), (0.4, 0.4, 0.05), CARD, bevel=0.003)]
P["R_boxes1"] = [cbox("a", 0.9, -0.2, 0, (0.45, 0.4, 0.35)), cbox("b", 0.85, 0.35, 0, (0.4, 0.35, 0.3))]
P["R_boxes2"] = [cbox("c", 0.9, -0.2, 0.35, (0.4, 0.35, 0.3)), cbox("d", 0.88, -0.22, 0.65, (0.35, 0.3, 0.25)),
                 cbox("e", 0.6, 1.0, 0, (0.5, 0.4, 0.4)), box("pizza2", (ux("R", 0.65), -0.85, 0.075), (0.4, 0.4, 0.05), CARD, bevel=0.003)]
P["R_clothes"] = [box(f"cloth_{i}", (ux("R", 0.3 + i * 0.2), -1.0 + i * 0.25, 0.03), (0.45, 0.3, 0.05), mat(f"cloth{i}", c, rough=0.95), bevel=0.02)
                  for i, c in enumerate([(0.3, 0.3, 0.35), (0.5, 0.15, 0.15), (0.2, 0.25, 0.4)])]
P["R_bottles"] = [cyl(f"bottle_{i}", (ux("R", -0.95) + (i - 1) * 0.06, 1.1, 0.64), 0.025, 0.18, mat("glass", (0.1, 0.3, 0.12), rough=0.15), rot=(0, 0, 0)) for i in range(3)]

# расписание таймлапса
T_DAY1, T_DAY30, T_DAY180, T_DAY365 = 14.0, 15.7, 17.3, 19.0
pop_rules = [
    ("L_books1", T_DAY1, None), ("L_mat", T_DAY30, None), ("L_dumb", T_DAY30, None), ("L_plant1", T_DAY30, T_DAY180),
    ("L_books2", T_DAY180, None), ("L_plant2", T_DAY180, None), ("L_cal", T_DAY180, None),
    ("R_pizza", T_DAY1, None), ("R_boxes1", T_DAY30, None), ("R_clothes", T_DAY30, None),
    ("R_boxes2", T_DAY180, None), ("R_bottles", T_DAY180, None),
]
for key, a, b in pop_rules:
    for o in P[key]:
        targets = [o] + [c for c in o.children_recursive] if o.type == "EMPTY" else [o]
        for t_ in targets:
            pop(t_, a, b)

# ----------------------------------------------------------------------------- персонаж (FK-скелет на пустышках)
# Высоты, м: таз 0.92, торс 0.55, голова r=0.14. Оси героя: смотрит в −Y, вверх +Z.
TH, SH_L, UA, FA, TORSO, HEAD_R, R_LIMB = 0.44, 0.44, 0.29, 0.27, 0.52, 0.135, 0.034
HIP_H = TH + SH_L + 0.04

class Hero:
    def __init__(self, name):
        self.name = name
        self.root = empty(f"{name}_root", (0, 0, HIP_H))
        self.root.rotation_mode = "XYZ"
        self.spine = empty(f"{name}_spine", (0, 0, 0.02), self.root)
        cyl(f"{name}_torso", (0, 0, TORSO / 2), 0.07, TORSO - 0.06, WHITE, parent=self.spine)
        sphere(f"{name}_chest", (0, 0, TORSO - 0.04), 0.075, WHITE, parent=self.spine)
        sphere(f"{name}_pelvis", (0, 0, 0.02), 0.075, WHITE, parent=self.spine)
        self.neck = empty(f"{name}_neck", (0, 0, TORSO), self.spine)
        cyl(f"{name}_neckc", (0, 0, 0.04), 0.03, 0.08, WHITE, parent=self.neck)
        sphere(f"{name}_head", (0, 0, 0.08 + HEAD_R), HEAD_R, WHITE, parent=self.neck)
        self.sh, self.el, self.hip, self.kn, self.hand = {}, {}, {}, {}, {}
        for k, sx in (("p", 1), ("n", -1)):
            sh = empty(f"{name}_sh_{k}", (sx * 0.15, 0, TORSO - 0.06), self.spine)
            sphere(f"{name}_shb_{k}", (0, 0, 0), 0.042, WHITE, parent=sh)
            cyl(f"{name}_ua_{k}", (0, 0, -UA / 2), R_LIMB, UA, WHITE, parent=sh)
            el = empty(f"{name}_el_{k}", (0, 0, -UA), sh)
            sphere(f"{name}_elb_{k}", (0, 0, 0), R_LIMB + 0.004, WHITE, parent=el)
            cyl(f"{name}_fa_{k}", (0, 0, -FA / 2), R_LIMB, FA, WHITE, parent=el)
            hand = empty(f"{name}_hand_{k}", (0, 0, -FA - 0.03), el)
            sphere(f"{name}_handb_{k}", (0, 0, 0), 0.045, WHITE, parent=hand)
            hp = empty(f"{name}_hip_{k}", (sx * 0.085, 0, 0), self.root)
            sphere(f"{name}_hipb_{k}", (0, 0, 0), 0.045, WHITE, parent=hp)
            cyl(f"{name}_th_{k}", (0, 0, -TH / 2), R_LIMB + 0.006, TH, WHITE, parent=hp)
            kn = empty(f"{name}_kn_{k}", (0, 0, -TH), hp)
            sphere(f"{name}_knb_{k}", (0, 0, 0), R_LIMB + 0.008, WHITE, parent=kn)
            cyl(f"{name}_sh_l_{k}", (0, 0, -SH_L / 2), R_LIMB + 0.004, SH_L, WHITE, parent=kn)
            ft = box(f"{name}_foot_{k}", (0, 0, 0), (0.08, 0.17, 0.05), WHITE, parent=kn, bevel=0.02)
            ft.location = (0, -0.04, -SH_L - 0.02)
            for d, o in ((self.sh, sh), (self.el, el), (self.hip, hp), (self.kn, kn), (self.hand, hand)):
                d[k] = o
        self.all_parts = [o for o in [self.root] + self.root.children_recursive]

    # поза: углы в градусах; fwd>0 — вперёд (к −Y героя)
    def pose(self, frame, loc=None, rot=(0, 0, 0), spine=0, nod=0, arms=None, legs=None, interp="BEZIER"):
        arms = arms or {}
        legs = legs or {}
        if loc is not None:
            self.root.location = loc
            self.root.keyframe_insert("location", frame=frame)
        self.root.rotation_euler = [math.radians(a) for a in rot]
        self.root.keyframe_insert("rotation_euler", frame=frame)
        self.spine.rotation_euler = (math.radians(spine), 0, 0)
        self.spine.keyframe_insert("rotation_euler", frame=frame)
        self.neck.rotation_euler = (math.radians(nod), 0, 0)
        self.neck.keyframe_insert("rotation_euler", frame=frame)
        for k, sx in (("p", 1), ("n", -1)):
            fwd, out, bend = arms.get(k, (5, 8, 10))
            self.sh[k].rotation_euler = (math.radians(-fwd), math.radians(-sx * out), 0)
            self.el[k].rotation_euler = (math.radians(-bend), 0, 0)
            hf, kb = legs.get(k, (0, 0))
            self.hip[k].rotation_euler = (math.radians(-hf), 0, 0)
            self.kn[k].rotation_euler = (math.radians(kb), 0, 0)
            for o in (self.sh[k], self.el[k], self.hip[k], self.kn[k]):
                o.keyframe_insert("rotation_euler", frame=frame)

    def hold(self, frame):
        """Повторить текущую позу (держать до кадра frame)."""
        for o in [self.root, self.spine, self.neck] + list(self.sh.values()) + list(self.el.values()) + list(self.hip.values()) + list(self.kn.values()):
            o.keyframe_insert("rotation_euler", frame=frame)
        self.root.keyframe_insert("location", frame=frame)

    def visible(self, frames):
        for o in self.all_parts:
            if o.type != "EMPTY":
                show(o, frames)

# стандартные позы
STAND = dict(spine=0, nod=0, arms={"p": (4, 6, 10), "n": (4, 6, 10)}, legs={"p": (0, 0), "n": (0, 0)})

def lie(side):
    """Лёжа на спине в кровати: голова к подушке (+Y)."""
    return dict(loc=(ux(side, -0.25), 0.38, 0.6), rot=(-90, 0, 0), spine=0, nod=-10,
                arms={"p": (2, 10, 5), "n": (2, 10, 5)}, legs={"p": (0, 2), "n": (0, 2)})

def sit_in_bed(side):
    return dict(loc=(ux(side, -0.25), 0.38, 0.58), rot=(0, 0, 0), spine=8, nod=5,
                arms={"p": (25, 15, 40), "n": (25, 15, 40)}, legs={"p": (90, 3), "n": (90, 3)})

def sit_edge(side):
    """Сидит на краю кровати лицом к внешней стене, ноги на полу."""
    return dict(loc=(ux(side, 0.3), 0.35, 0.5), rot=(0, 0, SIGN[side] * 90), spine=12, nod=15,
                arms={"p": (30, 10, 50), "n": (30, 10, 50)}, legs={"p": (88, 88), "n": (88, 88)})

L = Hero("L")
R = Hero("R")

def walk(h, t0, t1, p0, p1, face_deg, steps_per_s=2.0):
    """Шаги от p0 к p1 (лицом face_deg вокруг Z)."""
    n = max(2, int((t1 - t0) * steps_per_s * 2))
    for i in range(n + 1):
        k = i / n
        t = t0 + (t1 - t0) * k
        ph = math.sin(i * math.pi / 2)
        sw = 28 * (1 if i % 2 else -1) if 0 < i < n else 0
        loc = (p0[0] + (p1[0] - p0[0]) * k, p0[1] + (p1[1] - p0[1]) * k, HIP_H + (0.015 if i % 2 else 0))
        h.pose(F(t), loc=loc, rot=(0, 0, face_deg), spine=4, nod=0,
               arms={"p": (-sw * 0.8, 6, 20), "n": (sw * 0.8, 6, 20)},
               legs={"p": (sw, 10 if sw < 0 else 30), "n": (-sw, 10 if sw > 0 else 30)})

# ===== ЛЕВЫЙ: встаёт
L.pose(1, **lie("L"))
L.hold(F(5.0))
# 5.0–5.4: рука к будильнику (будильник у стены-перегородки = сторона −u; у левого героя это его «p»-рука? — тянемся к тумбочке)
reach_L = dict(lie("L")); reach_L["arms"] = {"p": (20, 70, 10), "n": (2, 10, 5)}
L.pose(F(5.4), **reach_L)
L.pose(F(5.7), **lie("L"))
L.pose(F(6.4), **sit_in_bed("L"))      # садится
L.hold(F(7.0))                          # пауза-сомнение
L.pose(F(7.6), **sit_edge("L"))         # поворачивается, ноги на пол
L.hold(F(8.1))
up_L = dict(STAND); up_L.update(loc=(ux("L", 0.45), 0.3, HIP_H), rot=(0, 0, SIGN["L"] * 90), spine=0)
L.pose(F(8.8), **up_L)                  # встаёт
# надевает кроссовки: наклон
bend_L = dict(up_L); bend_L.update(spine=55, nod=20, arms={"p": (70, 5, 10), "n": (70, 5, 10)}, legs={"p": (20, 25), "n": (5, 10)})
L.pose(F(9.4), **bend_L)
L.pose(F(10.3), **bend_L)
L.pose(F(10.8), **up_L)
# идёт к двери (внешняя стена, y≈0) и выходит
walk(L, 11.0, 12.6, (ux("L", 0.45), 0.3), (ux("L", 1.45), 0.0), SIGN["L"] * 90)
L.visible([(1, True), (F(12.7), False), (F(T_DAY1), True)])

# ===== ПРАВЫЙ: snooze, телефон
R.pose(1, **lie("R"))
R.hold(F(5.2))
reach_R = dict(lie("R")); reach_R["arms"] = {"p": (2, 10, 5), "n": (20, 70, 10)}
# у правого героя тумбочка со стороны его «n» руки? проверяем геометрию: тумбочка при u=−0.95 (к перегородке)
R.pose(F(5.6), **reach_R)
R.pose(F(5.9), **lie("R"))
R.hold(F(7.6))
phone_R = dict(lie("R")); phone_R["arms"] = {"p": (80, 8, 95), "n": (80, 8, 95)}; phone_R["nod"] = 10
R.pose(F(8.2), **phone_R)
R.hold(F(T_DAY1 - 0.05))

# телефон в руках правого
phone = empty("phone", (0, 0, 0), R.hand["p"])
box("phone_body", (0, 0, 0), (0.075, 0.015, 0.15), DARK, parent=phone, bevel=0.005).location = (-0.08, -0.02, 0)
scr_m = mat("phone_screen", (0.02, 0.05, 0.1), emit=(0.35, 0.6, 1.0), strength=0.0)
box("phone_screen", (0, 0, 0), (0.065, 0.004, 0.13), scr_m, parent=phone, bevel=0).location = (-0.08, -0.03, 0)
bpy.ops.object.light_add(type="POINT", location=(0, 0, 0))
plight = bpy.context.object; plight.name = "phone_light"; plight.parent = phone; plight.location = (-0.08, -0.25, 0)
plight.data.color = (0.4, 0.6, 1.0); plight.data.shadow_soft_size = 0.05
def phone_on(t, on):
    emit_strength_key(scr_m, F(t), 8.0 if on else 0.0)
    plight.data.energy = 25 if on else 0
    plight.data.keyframe_insert("energy", frame=F(t))
phone_on(0, False); phone_on(8.0, True)

# ===== ТАЙМЛАПС (резкие склейки на каждый DAY)
def cut(h, t, **p):
    h.pose(F(t) - 1, **p) if False else None
    h.pose(F(t), **p)

# DAY 1: левый читает книгу стоя у полки; правый сидит на краю с телефоном
read_L = dict(STAND); read_L.update(loc=(ux("L", 0.4), 0.6, HIP_H), rot=(0, 0, 0), nod=25,
                                    arms={"p": (55, 15, 70), "n": (55, 15, 70)})
slump_R = dict(sit_edge("R")); slump_R.update(spine=30, nod=40, arms={"p": (55, 8, 95), "n": (55, 8, 95)}, rot=(0, 0, 0), loc=(ux("R", -0.25), -0.2, 0.5))
def hard(h, t, pose_dict):
    h.pose(F(t) - 1 if F(t) > 2 else F(t), **pose_dict)  # предыдущая поза держится до склейки
for h, pd_prev in ((L, up_L), (R, phone_R)):
    pass
# вставляем «держи предыдущее» перед склейкой и новую позу на склейке
L.hold(F(T_DAY1) - 1); L.pose(F(T_DAY1), **read_L)
R.hold(F(T_DAY1) - 1); R.pose(F(T_DAY1), **slump_R)
book_hand = box("book_in_hand", (0, 0, 0), (0.2, 0.03, 0.26), BOOKS[1], parent=L.hand["p"], bevel=0.005)
book_hand.location = (-0.11, -0.03, 0)
pop(book_hand, T_DAY1, T_DAY30)
# телефон в руке правого и в таймлапсе
# DAY 30: левый — отжимания на коврике (качается), правый — лежит с телефоном
plank = lambda up: dict(loc=(ux("L", 0.55), -0.45, 0.34 if up else 0.18), rot=(84, 0, 0), spine=0, nod=-20,
                        arms={"p": (90 if up else 60, 12, 0 if up else 70), "n": (90 if up else 60, 12, 0 if up else 70)},
                        legs={"p": (0, 0), "n": (0, 0)})
L.hold(F(T_DAY30) - 1); L.pose(F(T_DAY30), **plank(True))
t = T_DAY30
while t + 0.4 < T_DAY180:
    L.pose(F(t + 0.2), **plank(False)); L.pose(F(t + 0.4), **plank(True)); t += 0.4
R.hold(F(T_DAY30) - 1); R.pose(F(T_DAY30), **phone_R)
# DAY 180: левый стоит прямо с гантелей (подъём на бицепс); правый ссутулился на краю, больше
curl = lambda up: dict(STAND, loc=(ux("L", 0.5), -0.2, HIP_H), rot=(0, 0, 0), nod=-5,
                       arms={"p": (10, 8, 140 if up else 15), "n": (4, 6, 10)})
L.hold(F(T_DAY180) - 1); L.pose(F(T_DAY180), **curl(False))
t = T_DAY180
while t + 0.5 < T_DAY365:
    L.pose(F(t + 0.25), **curl(True)); L.pose(F(t + 0.5), **curl(False)); t += 0.5
db_hand = empty("db_hand", (0, 0, 0), L.hand["p"])
cyl("dbh_bar", (0, 0, 0), 0.015, 0.26, IRON, parent=db_hand, rot=(0, math.pi / 2, 0))
for e in (-0.11, 0.11):
    cyl(f"dbh_w{e}", (e, 0, 0), 0.055, 0.05, IRON, parent=db_hand, rot=(0, math.pi / 2, 0))
for o in [db_hand] + db_hand.children_recursive:
    if o.type != "EMPTY":
        pop(o, T_DAY180, T_DAY365)
R.hold(F(T_DAY180) - 1); R.pose(F(T_DAY180), **dict(slump_R, spine=40, nod=50))
R.hold(F(T_DAY365) - 1)
L.hold(F(T_DAY365) - 1)

# ===== DAY 365: ночь снова. Левый просыпается сам до будильника (5:46) и выключает его
L.pose(F(T_DAY365), **lie("L"))
L.hold(F(19.5))
L.pose(F(20.1), **sit_in_bed("L"))
reach_sit = dict(sit_in_bed("L")); reach_sit["arms"] = {"p": (60, 55, 10), "n": (25, 15, 40)}
L.pose(F(20.5), **reach_sit)
L.pose(F(20.9), **sit_in_bed("L"))
L.pose(F(21.5), **sit_edge("L"))
L.pose(F(22.2), **up_L)
L.hold(F(DUR))
R.pose(F(T_DAY365), **lie("R"))
R.hold(F(20.6))
R.pose(F(21.0), **reach_R)
R.pose(F(21.3), **lie("R"))
R.pose(F(22.0), **phone_R)
R.hold(F(DUR))
phone_on(T_DAY1 - 0.01, True)       # телефон горит в таймлапсе (в руках правого)
phone_on(T_DAY365, False)
phone_on(22.0, True)
# телефон виден только у правого в нужные моменты
for o in [phone] + phone.children_recursive:
    if o.type != "EMPTY" and o.type != "LIGHT":
        show(o, [(1, False), (F(8.0), True), (F(T_DAY365), False), (F(22.0), True)])

# ===== будильники
def clock_show(side, segs):
    """segs: [(t, '5:47' | None)] — какое время горит с момента t."""
    for t_, (o, m) in ROOM[side]["clock_txt"].items():
        fr = [(1, False)]
        for t, val in segs:
            fr.append((F(t), val == t_))
        show(o, fr)

def ring(side, t0, t1):
    """Будильник звенит: дрожит и мигает отсвет."""
    c = ROOM[side]["clock"]; lt = ROOM[side]["clocklight"]
    base = Vector(c.location)
    c.keyframe_insert("location", frame=F(t0) - 1)
    fr = F(t0)
    i = 0
    while fr < F(t1):
        c.location = base + Vector(((0.008 if i % 2 else -0.008), 0, 0.004 * (i % 3 - 1)))
        c.keyframe_insert("location", frame=fr)
        lt.data.energy = 6 if (i // 4) % 2 == 0 else 1
        lt.data.keyframe_insert("energy", frame=fr)
        fr += 2; i += 1
    c.location = base; c.keyframe_insert("location", frame=F(t1))
    lt.data.energy = 1.5; lt.data.keyframe_insert("energy", frame=F(t1))

for side in ("L", "R"):
    ROOM[side]["clocklight"].data.energy = 1.5
    ROOM[side]["clocklight"].data.keyframe_insert("energy", frame=1)
clock_show("L", [(0, "5:47"), (5.45, None), (T_DAY365, "5:46"), (20.55, None)])
clock_show("R", [(0, "5:47"), (11.4, "6:15"), (12.8, "6:40"), (T_DAY1, None), (T_DAY365, "5:46"), (20.5, "5:47")])
ring("L", 1.0, 5.45)
ring("R", 1.0, 5.65)
ring("R", 20.5, 21.05)
for side, offs in (("L", [(5.45, 0.0), (T_DAY365, 1.5), (20.55, 0.0)]), ("R", [(T_DAY1, 0.0), (T_DAY365, 1.5)])):
    lt = ROOM[side]["clocklight"]
    for t, e in offs:
        lt.data.energy = e; lt.data.keyframe_insert("energy", frame=F(t))

# ===== свет комнат (ночь → левый включает тёплый, правый остаётся в холоде)
NIGHT = ((0.55, 0.65, 1.0), 6)
WARM = ((1.0, 0.78, 0.55), 220)
DIM = ((0.45, 0.5, 0.8), 12)
def lamp(side, t, preset):
    lo = ROOM[side]["lamp"]
    lo.data.color, lo.data.energy = preset
    lo.data.keyframe_insert("color", frame=F(t)); lo.data.keyframe_insert("energy", frame=F(t))
lamp("L", 0, NIGHT); lamp("L", 8.6, NIGHT); lamp("L", 9.0, WARM)
lamp("R", 0, NIGHT); lamp("R", 8.6, NIGHT); lamp("R", 9.2, DIM)
lamp("L", T_DAY365 - 0.01, WARM); lamp("L", T_DAY365, NIGHT); lamp("L", 21.6, NIGHT); lamp("L", 22.0, WARM)
lamp("R", T_DAY365 - 0.01, DIM); lamp("R", T_DAY365, NIGHT); lamp("R", 22.0, DIM)
for side in ("L", "R"):
    set_const(ROOM[side]["lamp"].data) if False else None
# в таймлапсе левый ещё теплее и ярче к DAY 180
lamp("L", T_DAY180 - 0.01, WARM); lamp("L", T_DAY180, ((1.0, 0.8, 0.58), 300))
lamp("R", T_DAY180 - 0.01, DIM); lamp("R", T_DAY180, ((0.4, 0.45, 0.75), 6))
# дверь левого и свет снаружи
h = ROOM["L"]["hinge"]
h.rotation_euler = (0, 0, 0); h.keyframe_insert("rotation_euler", frame=F(11.6))
h.rotation_euler = (0, 0, math.radians(100)); h.keyframe_insert("rotation_euler", frame=F(12.1))
h.keyframe_insert("rotation_euler", frame=F(13.2))
h.rotation_euler = (0, 0, 0); h.keyframe_insert("rotation_euler", frame=F(13.7))
emit_strength_key(ROOM["L"]["outside_mat"], 1, 0.0, const=False)
emit_strength_key(ROOM["L"]["outside_mat"], F(11.6), 0.0, const=False)
emit_strength_key(ROOM["L"]["outside_mat"], F(12.1), 6.0, const=False)
emit_strength_key(ROOM["L"]["outside_mat"], F(13.2), 6.0, const=False)
emit_strength_key(ROOM["L"]["outside_mat"], F(13.7), 0.0, const=False)
# окно: в таймлапсе у левого — утро (тёплое), у правого — темно
for side, segs in (("L", [(0, 1.2), (T_DAY1, 3.0), (T_DAY365, 1.2)]), ("R", [(0, 1.2), (T_DAY1, 0.5), (T_DAY365, 1.2)])):
    for t, v in segs:
        emit_strength_key(ROOM[side]["window_mat"], F(t), v)

# ----------------------------------------------------------------------------- камера
bpy.ops.object.camera_add(location=(0, -3.8, 1.7))
cam = bpy.context.object; cam.name = "Camera"
scn.camera = cam
cam.data.sensor_fit = "HORIZONTAL"; cam.data.sensor_width = 36
cam.data.clip_start = 0.05; cam.data.clip_end = 200
target = empty("cam_target", (0, 0.4, 1.0))
tc = cam.constraints.new("TRACK_TO"); tc.target = target; tc.track_axis = "TRACK_NEGATIVE_Z"; tc.up_axis = "UP_Y"
cam.data.dof.use_dof = False   # глубина резкости размывает титры — выключена
cam.data.dof.focus_object = target
cam.data.dof.aperture_fstop = 2.8

hud = empty("hud", (0, 0, -0.25), cam)
hud.scale = (0.25, 0.25, 0.25)   # титры в 25 см от камеры — их ничто не перекрывает
def camkey(t, pos, look, lens):
    k = lens / 24.0
    hud.location = (0, 0, -0.25 * k)
    hud.keyframe_insert("location", frame=F(t))
    cam.location = pos; cam.keyframe_insert("location", frame=F(t))
    target.location = look; target.keyframe_insert("location", frame=F(t))
    cam.data.lens = lens; cam.data.keyframe_insert("lens", frame=F(t))
    fst = 2.8 if lens > 30 else 8.0
    cam.data.dof.aperture_fstop = fst; cam.data.dof.keyframe_insert("aperture_fstop", frame=F(t))

# 0–2: крупно два будильника по обе стороны перегородки
camkey(0.0, (0.42, -0.15, 0.78), (0.33, 1.12, 0.62), 40)
camkey(1.8, (0.45, -0.35, 0.82), (0.33, 1.12, 0.62), 40)
# 2–4.5: отъезд на общий план «домика»
camkey(4.5, (0, -3.9, 1.65), (0, 0.4, 1.0), 24)
# 5–14: медленный дрейф
camkey(8.0, (0.25, -3.5, 1.55), (0, 0.4, 0.95), 24)
camkey(13.9, (-0.2, -3.4, 1.55), (0, 0.4, 0.95), 24)
# 14–19: таймлапс — камера стоит
camkey(14.0, (0, -3.7, 1.6), (0, 0.4, 1.0), 24)
camkey(18.95, (0, -3.6, 1.6), (0, 0.4, 1.0), 24)
# 19–22: DAY 365 — ближе
camkey(19.0, (0, -3.2, 1.35), (0, 0.5, 0.8), 24)
camkey(22.0, (0, -3.0, 1.3), (0, 0.5, 0.8), 24)
# 22–26: отъезд наружу, видно дом целиком, крышу и отражение в полу
camkey(25.5, (0, -10.5, 2.4), (0, 0, 1.6), 24)
# склейки таймлапса — камера без плавности между 13.9→14.0 и 18.95→19.0 (резко)

# ----------------------------------------------------------------------------- титры (привязаны к камере)
TXT = mat("txt", (1, 1, 1), emit=(1, 1, 1), strength=4.0)
ACC = mat("txt_acc", (0.3, 0.9, 1), emit=(0.31, 0.89, 1.0), strength=6.0)
def title(name, body, y, size, t_on, t_off, m=TXT, font="Anton-Regular.ttf"):
    o = text(name, body, size, m, font=font, parent=hud, loc=(0, y, 0))
    show(o, [(1, False), (F(t_on), True), (F(t_off), False)] if t_off else [(1, False), (F(t_on), True)])
    return o
# кадр при lens 24 и расстоянии 1 м: ширина ~1.5 м, высота ~2.67 м
title("t_547", "5:47 AM", 0.75, 0.22, 0.15, 2.2)
title("t_day1", "DAY 1", 0.85, 0.16, T_DAY1, T_DAY30)
title("t_day30", "DAY 30", 0.85, 0.16, T_DAY30, T_DAY180)
title("t_day180", "DAY 180", 0.85, 0.16, T_DAY180, T_DAY365)
title("t_day365", "DAY 365", 0.85, 0.16, T_DAY365, 22.3)
title("t_same", "SAME ALARM.", 0.86, 0.15, 22.6, None)
title("t_diff", "DIFFERENT PERSON.", 0.68, 0.13, 23.4, None, m=ACC)

# ----------------------------------------------------------------------------- мир и рендер
world = bpy.data.worlds.new("W") if not scn.world else scn.world
scn.world = world
world.use_nodes = True
bg = world.node_tree.nodes.get("Background")
bg.inputs["Color"].default_value = (0.003, 0.003, 0.004, 1)
bg.inputs["Strength"].default_value = 1.0

# все ключи у видимости/склеек — CONSTANT уже по природе булевых; для таймлапс-склеек делаем резко
for o in bpy.data.objects:
    ad = o.animation_data
    if ad and ad.action:
        for fc in iter_fcurves(ad.action):
            if fc.data_path.startswith("hide"):
                for k in fc.keyframe_points:
                    k.interpolation = "CONSTANT"
# камера: резкие склейки в таймлапс и из него
for fc in iter_fcurves(cam.animation_data.action):
    for k in fc.keyframe_points:
        if abs(k.co[0] - F(14.0)) < 0.5 or abs(k.co[0] - F(19.0)) < 0.5:
            k.interpolation = "CONSTANT"
for fc in iter_fcurves(target.animation_data.action):
    for k in fc.keyframe_points:
        if abs(k.co[0] - F(13.9)) < 0.5 or abs(k.co[0] - F(18.95)) < 0.5:
            k.interpolation = "CONSTANT"
for ob in (cam, hud):
    for fc in iter_fcurves(ob.animation_data.action):
        for k in fc.keyframe_points:
            if abs(k.co[0] - F(13.9)) < 0.5 or abs(k.co[0] - F(18.95)) < 0.5:
                k.interpolation = "CONSTANT"

engines = [e.identifier for e in bpy.types.RenderSettings.bl_rna.properties["engine"].enum_items]
if ENGINE == "cycles":
    scn.render.engine = "CYCLES"
    scn.cycles.samples = SAMPLES
    scn.cycles.use_denoising = True
    scn.cycles.device = "CPU"
else:
    scn.render.engine = "BLENDER_EEVEE_NEXT" if "BLENDER_EEVEE_NEXT" in engines else "BLENDER_EEVEE"
    ee = scn.eevee
    for attr, val in (("taa_render_samples", SAMPLES), ("use_raytracing", True), ("use_shadows", True),
                      ("use_volumetric_shadows", False), ("use_gtao", True), ("use_bloom", True)):
        if hasattr(ee, attr):
            setattr(ee, attr, val)
    if hasattr(ee, "ray_tracing_options"):
        ee.ray_tracing_options.resolution_scale = "1"
scn.view_settings.view_transform = "AgX" if "AgX" in [i.identifier for i in scn.view_settings.bl_rna.properties["view_transform"].enum_items] else "Filmic"
try:
    scn.view_settings.look = "AgX - Medium High Contrast"
except Exception:
    pass

# глоу на эмиссии (компоновщик): мягкое свечение будильников/текста/телефона
try:
    scn.use_nodes = True
    nt = scn.node_tree
    rl = nt.nodes.get("Render Layers"); comp = nt.nodes.get("Composite")
    glare = nt.nodes.new("CompositorNodeGlare")
    for attr, val in (("glare_type", "BLOOM"), ("quality", "HIGH"), ("threshold", 0.9), ("size", 7)):
        try:
            setattr(glare, attr, val)
        except Exception:
            pass
    nt.links.new(rl.outputs["Image"], glare.inputs[0])
    nt.links.new(glare.outputs[0], comp.inputs["Image"])
except Exception as e:
    print("compositor glare skipped:", e)

def set_output_video(path):
    r = scn.render
    try:
        r.image_settings.media_type = "VIDEO"
    except Exception:
        pass
    r.image_settings.file_format = "FFMPEG"
    r.ffmpeg.format = "MPEG4"
    r.ffmpeg.codec = "H264"
    r.ffmpeg.constant_rate_factor = "HIGH"
    r.ffmpeg.audio_codec = "NONE"
    r.filepath = path

if STILL is not None:
    scn.frame_set(int(STILL))
    try:
        scn.render.image_settings.media_type = "IMAGE"
    except Exception:
        pass
    scn.render.image_settings.file_format = "PNG"
    scn.render.filepath = OUT
    bpy.ops.render.render(write_still=True)
    print("still ->", OUT)
elif bpy.app.background:
    os.makedirs(os.path.dirname(os.path.abspath(OUT)), exist_ok=True)
    set_output_video(OUT)
    bpy.ops.render.render(animation=True)
    print("video ->", OUT)
else:
    set_output_video(OUT)
    scn.frame_set(F(6))
    print("Сцена собрана. Ctrl+F12 — рендер анимации.")
