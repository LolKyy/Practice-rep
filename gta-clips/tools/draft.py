"""Черновик эдита: сетка ударов + найденные шоты → edits/<id>.json (дальше правится руками).

  python tools/draft.py --id t2_v1 --beats beats/track.json --scenes t2 [launch ...] \
        [--blocks night:0.4,day:0.3,sunset:0.3] [--music track.mp3] [--caption "POV: ... *VICE CITY*"]

Шоты раскладываются по цвет-блокам по порядку (ночь-неон → день-пляж → закат), внутри блока — по score,
без повторов и не ближе 1.5 с к уже взятому месту исходника. Эффекты — по типу удара:
  первый шот: flash + zoom; смена блока: flash; сильная доля: по кругу zoom / shake+rgb / zoom+rgb;
  полудоля: rgb; удар перед кульминацией: speed ramp «in»; последний шот: drift (медленный наезд), 2 удара.
"""
import argparse
import sys

from common import ROOT, FPS, load_json, save_json

STRONG_FX = [["zoom"], ["shake", "rgb"], ["zoom", "rgb"], ["shake"]]


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--id", required=True)
    ap.add_argument("--beats", required=True)
    ap.add_argument("--scenes", nargs="+", required=True)
    ap.add_argument("--blocks", default="night:0.4,day:0.3,sunset:0.3")
    ap.add_argument("--music")
    ap.add_argument("--caption")
    ap.add_argument("--caption-to", type=float, default=2.2)
    ap.add_argument("--gap", type=float, default=1.0, help="мин. расстояние между взятыми местами исходника, с")
    a = ap.parse_args()
    beats = load_json(ROOT / a.beats)
    grid = beats["shots"]
    pool = []
    for sid in a.scenes:
        sc = load_json(ROOT / "scenes" / f"{sid}.json")
        for s in sc["shots"]:
            if s["block"] != "dark" and s["dur"] >= 0.25:
                pool.append(dict(s, src=sid))
    plan = [(b.split(":")[0], float(b.split(":")[1])) for b in a.blocks.split(",")]
    n_slots = len(grid) - 1                         # последний шот занимает 2 удара
    counts, acc = [], 0
    for k, (_, w) in enumerate(plan):
        c = n_slots - acc if k == len(plan) - 1 else round(n_slots * w / sum(x[1] for x in plan))
        counts.append(c); acc += c
    used = []
    shots = []
    fx_i = 0
    climax0 = int(round(beats["climax"][0] * FPS)) if beats.get("climax") else None

    def take(block, need):
        cands = sorted([p for p in pool if p["block"] == block], key=lambda p: -p["score"])
        cands += sorted([p for p in pool if p["block"] not in (block, "dark")], key=lambda p: -p["score"] * 0.6)
        for p in cands:
            lo, hi = p["t_in"] + 0.05 + need / 2, p["t_out"] - 0.05 - need / 2
            if hi < lo:
                continue
            best = min(max((p["best"][0] + p["best"][1]) / 2, lo), hi)
            mids = [best] + [m for m in (lo + k * a.gap for k in range(int((hi - lo) / a.gap) + 1)) if abs(m - best) >= a.gap]
            for mid in mids:
                if any(u[0] == p["src"] and abs(u[1] - mid) < a.gap for u in used):
                    continue
                used.append((p["src"], mid))
                return p, round(mid - need / 2, 3)
        sys.exit("не хватило шотов в исходниках")

    g = 0
    for bk, (block, _) in enumerate(plan):
        for j in range(counts[bk]):
            last = g == len(grid) - 2
            k = 2 if last else 1
            frames = sum(x["frames"] for x in grid[g:g + k])
            need = frames / FPS
            p, t_in = take(block, need)
            fx = []
            if g == 0:
                fx = ["flash", "zoom"]
            elif j == 0:
                fx = ["flash"]
            if grid[g]["strong"] and g > 0:
                fx += [f for f in STRONG_FX[fx_i % len(STRONG_FX)] if f not in fx]; fx_i += 1
            if grid[g]["kind"] == "half":
                fx += ["rgb"] if "rgb" not in fx else []
            shot = dict(src=p["src"], **{"in": t_in}, crop=p["crop_x"], fx=fx, note=f"{block} #{p['id']} score {p['score']}")
            if climax0 is not None and g + 1 < len(grid) and grid[g + 1]["from"] == climax0:
                shot["ramp"] = "in"; shot["speed"] = 1.6
            if last:
                shot["beats"] = 2; shot["drift"] = 0.06
            shots.append(shot)
            g += k
    edit = dict(id=a.id, beats=a.beats, music=a.music, grade="grade/clipso.cube", watermark="CLIPSO",
                captions=[dict(text=a.caption, **{"from": 0.0, "to": a.caption_to}, color="#ff3df2")] if a.caption else [],
                shots=shots)
    save_json(ROOT / "edits" / f"{a.id}.json", edit)
    print(f"{a.id}: {len(shots)} шотов на {len(grid)} ударов, блоки {dict(zip([p[0] for p in plan], counts))}")


if __name__ == "__main__":
    main()
