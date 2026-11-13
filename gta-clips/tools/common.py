"""Общие помощники: пути проекта, ffprobe, чтение кадров через ffmpeg в numpy."""
import json
import os
import shutil
import subprocess
import sys
from pathlib import Path

import numpy as np

ROOT = Path(__file__).resolve().parent.parent          # gta-clips/
SOURCES = ROOT / "sources"
REFS = ROOT / "refs"
WORK = ROOT / "work"
VIDEO = ROOT / "video"
PUBLIC = VIDEO / "public"
FPS = 60
W, H = 1080, 1920

FFMPEG = shutil.which("ffmpeg") or "ffmpeg"
FFPROBE = shutil.which("ffprobe") or "ffprobe"


def run(cmd, **kw):
    print("$", " ".join(str(c) for c in cmd)[:400], file=sys.stderr)
    return subprocess.run([str(c) for c in cmd], check=True, **kw)


def probe(path):
    out = subprocess.run([FFPROBE, "-v", "error", "-print_format", "json", "-show_streams", "-show_format", str(path)],
                         check=True, capture_output=True, text=True).stdout
    d = json.loads(out)
    v = next((s for s in d["streams"] if s["codec_type"] == "video"), None)
    a = next((s for s in d["streams"] if s["codec_type"] == "audio"), None)
    info = {"duration": float(d["format"].get("duration", 0)), "has_audio": a is not None}
    if v:
        num, den = (v.get("avg_frame_rate") or v.get("r_frame_rate") or "0/1").split("/")
        info.update(width=int(v["width"]), height=int(v["height"]), fps=float(num) / max(float(den), 1), vcodec=v["codec_name"])
    return info


def source_path(src_id):
    """sources/<id>.(mp4|mkv|webm|mov) — первый найденный."""
    for ext in (".mp4", ".mkv", ".webm", ".mov"):
        p = SOURCES / f"{src_id}{ext}"
        if p.exists():
            return p
    p = Path(src_id)
    if p.exists():
        return p
    raise FileNotFoundError(f"нет исходника '{src_id}' в {SOURCES} (см. tools/fetch.py)")


def iter_frames(path, w, h, fps, start=None, dur=None, vf_extra=""):
    """Кадры видео как uint8 RGB массивы (h, w, 3), сжатые до w×h, с частотой fps."""
    cmd = [FFMPEG, "-v", "error"]
    if start is not None:
        cmd += ["-ss", f"{start:.3f}"]
    cmd += ["-i", str(path)]
    if dur is not None:
        cmd += ["-t", f"{dur:.3f}"]
    vf = f"fps={fps},scale={w}:{h}:flags=area"
    if vf_extra:
        vf = vf_extra + "," + vf
    cmd += ["-an", "-vf", vf, "-pix_fmt", "rgb24", "-f", "rawvideo", "-"]
    p = subprocess.Popen(cmd, stdout=subprocess.PIPE)
    n = w * h * 3
    try:
        while True:
            buf = p.stdout.read(n)
            if len(buf) < n:
                break
            yield np.frombuffer(buf, np.uint8).reshape(h, w, 3)
    finally:
        p.stdout.close()
        p.wait()


def grab_frame(path, t, out_png, vf=None):
    cmd = [FFMPEG, "-v", "error", "-y", "-ss", f"{t:.3f}", "-i", str(path), "-frames:v", "1"]
    if vf:
        cmd += ["-vf", vf]
    run(cmd + [str(out_png)])


def rgb_to_hsv(rgb):
    """rgb float 0..1 (..., 3) → h(0..360), s, v."""
    r, g, b = rgb[..., 0], rgb[..., 1], rgb[..., 2]
    mx = rgb.max(-1)
    mn = rgb.min(-1)
    d = mx - mn
    s = np.where(mx > 1e-6, d / np.maximum(mx, 1e-6), 0)
    h = np.zeros_like(mx)
    dd = np.maximum(d, 1e-6)
    h = np.where(mx == r, ((g - b) / dd) % 6, h)
    h = np.where(mx == g, (b - r) / dd + 2, h)
    h = np.where(mx == b, (r - g) / dd + 4, h)
    h = np.where(d < 1e-6, 0, h) * 60
    return h, s, mx


def save_json(path, data):
    path = Path(path)
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text(json.dumps(data, ensure_ascii=False, indent=1), encoding="utf-8")
    print("→", path, file=sys.stderr)


def load_json(path):
    return json.loads(Path(path).read_text(encoding="utf-8"))
