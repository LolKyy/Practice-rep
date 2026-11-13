"""Ручная раскладка эдита mix_v1 (исходники пользователя) → edits/mix_v1.json.
Шот задаётся (src, время-подсказка, crop, fx, доп.) — точное начало ставится внутри шота исходника по scenes/*.json."""
import json
from common import ROOT, FPS, load_json, save_json

B = load_json(ROOT / "beats/launch_tt.json")["shots"]
SC = {}
def scene(src, t):
    if src not in SC:
        SC[src] = load_json(ROOT / "scenes" / f"{src}.json")["shots"]
    return next(s for s in SC[src] if s["t_in"] <= t < s["t_out"])

BAND = {"aspect": 1.78, "zoom": 1.5}
plan = [  # (src, t, crop, fx, extra)                        блок
 ("tt_launch", 22.6, .5, ["flash", "zoom"], {"band": BAND}),  # крючок: лого GTA VI на розовой воде
 ("tt_launch", 64.4, .5, ["flash"], {}),                       # ночь: бирюзовый кадр с пистолетом
 ("tt_launch", 34.5, .5, ["rgb"], {}),                         # силуэт в дыму
 ("cc_club", 0.5, .5, ["zoom"], {}),
 ("tt_launch", 37.3, .45, ["shake", "rgb"], {}),
 ("tt_launch", 41.7, .5, [], {}),
 ("tt_launch", 59.2, .45, ["zoom", "rgb"], {}),
 ("cc_launch", 1.3, .5, [], {}),
 ("tt_launch", 33.0, .5, ["shake"], {}),
 ("tt_launch", 70.84, .55, [], {"out": 71.15}),
 ("tt_launch", 71.2, .45, ["zoom"], {}),
 ("tt_launch", 69.2, .5, [], {}),
 ("tt_launch", 67.8, .45, ["rgb"], {}),
 ("cc_launch", 2.4, .5, [], {}),
 ("tt_launch", 52.2, .5, ["shake", "rgb"], {}),
 ("tt_launch", 73.4, .5, [], {}),
 ("tt_para", 3.0, .63, ["flash", "zoom"], {"zoom": 1.35}),      # день
 ("tt_launch", 5.6, .45, [], {}),
 ("tt_ocean", 0.6, .75, [], {"zoom": 1.3}),
 ("tt_launch", 13.45, .5, ["zoom"], {}),
 ("tt_launch", 20.5, .5, ["shake"], {}),
 ("tt_ocean", 10.1, .3, [], {"zoom": 1.35}),
 ("tt_launch", 9.4, .55, ["rgb"], {}),
 ("tt_para", 6.2, .37, [], {"zoom": 1.35}),
 ("tt_launch", 54.5, .5, ["flash", "zoom"], {}),               # кульминация, полудоли
 ("cc_flip", 0.35, .5, ["rgb"], {}),
 ("tt_launch", 39.8, .5, [], {}),
 ("tt_ocean", 17.6, .3, ["rgb"], {"zoom": 1.35}),
 ("tt_launch", 11.3, .4, ["flash"], {}),                       # закат
 ("tt_launch", 21.68, .5, ["rgb"], {}),
 ("tt_launch", 72.05, .5, ["shake"], {}),
 ("tt_launch", 53.78, .5, ["rgb"], {}),
 ("tt_launch", 38.3, .5, ["zoom"], {}),
 ("tt_launch", 32.05, .5, ["rgb"], {}),
 ("tt_launch", 25.7, .5, [], {}),
 ("tt_launch", 35.8, .5, ["rgb"], {}),
 ("tt_launch", 62.45, .5, ["zoom", "shake"], {}),
 ("tt_launch", 27.2, .5, ["rgb"], {}),
 ("tt_launch", 66.45, .5, [], {}),
 ("cc_launch", 9.45, .6, ["rgb"], {}),
 ("tt_launch", 77.5, .5, ["flash", "zoom"], {"band": BAND, "beats": 2, "drift": 0.05}),  # финал: лого GTA VI
]
shots, g = [], 0
for src, t, crop, fx, ex in plan:
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
    d.update({k2: v for k2, v in ex.items() if k2 not in ("in_exact",)})
    shots.append(d)
assert g == len(B), (g, len(B))
save_json(ROOT / "edits/mix_v1.json", {"id": "mix_v1", "beats": "beats/launch_tt.json", "music": "launch_tt.mp3",
          "grade": "grade/clipso.cube", "watermark": "CLIPSO", "captions": [], "shots": shots})
for d in shots:
    if "speed" in d: print("speed", d)
