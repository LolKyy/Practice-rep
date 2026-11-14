"""Ручная раскладка эдита mix_v1 (исходники пользователя) → edits/mix_v2.json.
Шот задаётся (src, время-подсказка, crop, fx, доп.) — точное начало ставится внутри шота исходника по scenes/*.json."""
import json
from common import ROOT, FPS, load_json, save_json, source_path

B = load_json(ROOT / "beats/launch_tt_slow.json")["shots"]
SC = {}
def scene(src, t):
    if src not in SC:
        SC[src] = load_json(ROOT / "scenes" / f"{src}.json")["shots"]
    return next(s for s in SC[src] if s["t_in"] <= t < s["t_out"])

BAND = {"aspect": 1.78, "zoom": 1.5}
plan = [  # (src, t, crop, fx, extra) — спокойный темп: 2 доли на шот, в кульминации по доле
 ("tt_launch", 23.6, .5, ["flash", "zoom"], {"band": BAND}),   # крючок: лого GTA VI на розовой воде
 ("tt_launch", 74.2, .5, [], {}),                              # ночь: бассейн с неоном
 ("tt_launch", 59.2, .45, ["zoom"], {"ramp": "out"}),          # маски, в слоумо
 ("tt_launch", 41.7, .5, [], {}),                              # неоновый бар
 ("tt_launch", 33.3, .5, ["rgb"], {}),                         # солдат в синем дыму
 ("tt_launch", 69.6, .5, ["zoom"], {}),                        # ночной город сверху
 ("tt_para", 3.0, .63, ["flash"], {"zoom": 1.35, "alt": ("tt_launch", 5.6, .45)}),             # день: прыжок
 ("tt_launch", 55.0, .5, [], {}),                              # пляж сверху
 ("tt_ocean", 0.9, .75, ["zoom"], {"zoom": 1.3, "alt": ("tt_launch", 10.0, .55)}),              # Ocean Drive, розовый суперкар
 ("tt_launch", 13.45, .5, [], {}),                             # причал, вода
 ("tt_launch", 20.9, .5, ["zoom"], {}),                        # игуана
 ("tt_para", 7.0, .37, [], {"zoom": 1.35, "ramp": "out", "alt": ("tt_launch", 2.8, .5)}),      # парашют над городом
 ("tt_ocean", 17.6, .3, ["flash", "rgb"], {"zoom": 1.35, "alt": ("tt_launch", 32.4, .5)}),     # кульминация: лоурайдер
 ("tt_launch", 39.8, .5, ["shake"], {}),
 ("tt_launch", 27.6, .5, ["rgb"], {}),                         # закат: дерево-силуэт
 ("tt_launch", 72.05, .5, ["shake"], {}),                      # огонь
 ("tt_launch", 53.78, .5, ["rgb"], {}),                        # лазер
 ("tt_launch", 38.3, .5, ["zoom"], {}),                        # прыжок машины
 ("tt_launch", 25.8, .5, [], {}),                              # Лусия на закате
 ("tt_launch", 66.45, .5, [], {}),                             # поцелуй
 ("tt_launch", 77.6, .5, ["flash", "zoom"], {"band": BAND, "beats": 2, "drift": 0.06}),  # финал: лого GTA VI
]
shots, g = [], 0
def have(src):
    try:
        source_path(src); return True
    except FileNotFoundError:
        return False


for src, t, crop, fx, ex in plan:
    if "alt" in ex and not have(src):          # нет мелкого ролика у пользователя → запасной кадр из трейлера
        print(f"нет {src} → беру запасной шот {ex['alt']}")
        src, t, crop = ex["alt"]
        ex = {k: v for k, v in ex.items() if k not in ("zoom",)}
    k = ex.get("beats", 1)
    need = sum(x["frames"] for x in B[g:g + k]) / FPS
    g += k
    s = scene(src, t)
    if "out" in ex:
        t_in = t
    elif "in_exact" in ex:
        t_in = ex["in_exact"]
    else:
        lo, hi = s["t_in"] + 0.04, s["t_out"] - 0.04 - need
        t_in = t if hi < lo else min(max(t - need / 2, lo), hi)
        if hi < lo:
            ex = dict(ex, speed=round((s["t_out"] - s["t_in"] - 0.08) / need, 2)); t_in = lo
    d = {"src": src, "in": round(t_in, 3), "crop": crop, "fx": fx, "note": f"{src}#{s['id']} {s['block']}"}
    d.update({k2: v for k2, v in ex.items() if k2 not in ("in_exact", "alt")})
    shots.append(d)
assert g == len(B), (g, len(B))
save_json(ROOT / "edits/mix_v2.json", {"id": "mix_v2", "beats": "beats/launch_tt_slow.json", "music": "launch_tt.mp3",
          "grade": "grade/clipso.cube", "watermark": "CLIPSO", "captions": [], "outro": 0.9, "res": 2, "interp": True, "shots": shots})
for d in shots:
    if "speed" in d: print("speed", d)
