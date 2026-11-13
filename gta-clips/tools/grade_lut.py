"""Единый грейд канала CLIPSO → LUT .cube (используется в prep.py; можно загрузить и в CapCut/DaVinci).

  python tools/grade_lut.py [--out grade/clipso.cube] [--preview <кадр.png>]

«Сочно»: S-кривая контраста, глубокие чёрные, vibrance (сильнее поднимает приглушённые цвета,
не выжигая неон), сплит-тон: тени в холодный сине-пурпурный, света в тёплое золото.
"""
import argparse
from pathlib import Path

import numpy as np

from common import ROOT

P = dict(contrast=2.3, contrast_mix=0.75, black=0.025, vibrance=0.55, sat=1.12,
         shadow=(-0.015, 0.0, 0.045), shadow_m=(0.03, -0.02, 0.03), high=(0.045, 0.018, -0.035))


def grade(rgb):
    x = np.clip(rgb, 0, 1)
    L = x @ np.array([0.2126, 0.7152, 0.0722])
    # S-кривая (tanh) по каналам, частично по яркости — чтобы не уводить оттенок
    s = lambda v: 0.5 + 0.5 * np.tanh(P["contrast"] * (v - 0.5)) / np.tanh(P["contrast"] / 2)
    per = s(x)
    Ls = s(L)
    lum = x * (Ls / np.maximum(L, 1e-4))[..., None]
    x = P["contrast_mix"] * lum + (1 - P["contrast_mix"]) * per
    x = (x - P["black"]) / (1 - P["black"])
    x = np.clip(x, 0, 1)
    # vibrance + общая насыщенность
    L = x @ np.array([0.2126, 0.7152, 0.0722])
    mx, mn = x.max(-1), x.min(-1)
    sat = (mx - mn) / np.maximum(mx, 1e-4)
    k = P["sat"] * (1 + P["vibrance"] * (1 - sat))
    x = L[..., None] + (x - L[..., None]) * k[..., None]
    # сплит-тон
    L = np.clip(x @ np.array([0.2126, 0.7152, 0.0722]), 0, 1)[..., None]
    sh = (1 - L) ** 2.5
    x = x + sh * np.array(P["shadow"]) + (sh * L * 4) * np.array(P["shadow_m"]) * 0.5 + (L ** 2.2) * np.array(P["high"])
    return np.clip(x, 0, 1)


def write_cube(path, n=33):
    g = np.linspace(0, 1, n)
    b, gg, r = np.meshgrid(g, g, g, indexing="ij")      # R меняется быстрее всех
    rgb = np.stack([r, gg, b], -1).reshape(-1, 3)
    out = grade(rgb)
    path.parent.mkdir(parents=True, exist_ok=True)
    with open(path, "w") as f:
        f.write('TITLE "CLIPSO"\n')
        f.write(f"LUT_3D_SIZE {n}\nDOMAIN_MIN 0 0 0\nDOMAIN_MAX 1 1 1\n")
        for v in out:
            f.write(f"{v[0]:.6f} {v[1]:.6f} {v[2]:.6f}\n")
    print("→", path)


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--out", default=str(ROOT / "grade" / "clipso.cube"))
    ap.add_argument("--preview")
    a = ap.parse_args()
    write_cube(Path(a.out))
    if a.preview:
        from PIL import Image
        im = np.asarray(Image.open(a.preview).convert("RGB")).astype(np.float32) / 255
        g = (grade(im) * 255 + 0.5).astype(np.uint8)
        both = np.concatenate([(im * 255).astype(np.uint8), g], 1)
        o = Path(a.preview).with_name(Path(a.preview).stem + "_grade.jpg")
        Image.fromarray(both).save(o, quality=90)
        print("→", o)


if __name__ == "__main__":
    main()
