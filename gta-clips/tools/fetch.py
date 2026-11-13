"""Официальные исходники GTA 6 и референсы.

  python tools/fetch.py list                       — реестр sources.json и что уже скачано
  python tools/fetch.py get t2 [launch ...]        — скачать официальные видео (yt-dlp) в sources/<id>.mp4
        --max-height 2160 (по умолч.; 4K даёт чёткий вертикальный кроп 9:16)   --dry   — только показать форматы
  python tools/fetch.py add <id> <url> "<title>"   — добавить официальное видео Rockstar в реестр
  python tools/fetch.py import <id> <файл>         — взять уже скачанный файл (присланный вручную) как sources/<id>.*
  python tools/fetch.py ref <url> [name]           — скачать референс-шортс в refs/ (только для разбора, не исходник!)

Любые дополнительные аргументы после `--` уходят в yt-dlp как есть.
Трейлеры целиком лежат только локально (sources/ в .gitignore); в эдит попадают фрагменты ≤1–2 с.
"""
import argparse
import shutil
import sys

from common import ROOT, SOURCES, REFS, load_json, save_json, probe, run

REG = ROOT / "sources.json"


def ytdlp(url, out_tmpl, max_h, extra, dry):
    fmt = (f"bv*[height<={max_h}][fps>=50]+ba/bv*[height<={max_h}]+ba/b[height<={max_h}]/b")
    cmd = [sys.executable, "-m", "yt_dlp", "--no-playlist", "-f", fmt, "--merge-output-format", "mp4",
           "-o", out_tmpl, "--no-part", "--retries", "5"]
    if dry:
        cmd = [sys.executable, "-m", "yt_dlp", "-F", "--no-playlist"]
    run(cmd + list(extra) + [url])


def main():
    argv = sys.argv[1:]
    extra = []
    if "--" in argv:
        i = argv.index("--")
        argv, extra = argv[:i], argv[i + 1:]
    ap = argparse.ArgumentParser()
    sub = ap.add_subparsers(dest="cmd", required=True)
    sub.add_parser("list")
    g = sub.add_parser("get"); g.add_argument("ids", nargs="+"); g.add_argument("--max-height", type=int, default=2160)
    g.add_argument("--dry", action="store_true"); g.add_argument("--force", action="store_true")
    a = sub.add_parser("add"); a.add_argument("id"); a.add_argument("url"); a.add_argument("title")
    im = sub.add_parser("import"); im.add_argument("id"); im.add_argument("file")
    r = sub.add_parser("ref"); r.add_argument("url"); r.add_argument("name", nargs="?")
    args = ap.parse_args(argv)
    reg = load_json(REG)

    if args.cmd == "list":
        for k, v in reg.items():
            if k.startswith("_"):
                continue
            have = [p for p in SOURCES.glob(f"{k}.*")] if SOURCES.exists() else []
            st = ""
            if have:
                i = probe(have[0])
                st = f"✔ {have[0].name} {i.get('width')}×{i.get('height')} {i.get('fps', 0):.0f}fps {i['duration']:.0f}s"
            print(f"{k:10} {v['title']:50} {st or '—'}")
    elif args.cmd == "add":
        reg[args.id] = {"title": args.title, "url": args.url}
        save_json(REG, reg)
    elif args.cmd == "get":
        SOURCES.mkdir(exist_ok=True)
        for k in args.ids:
            if k not in reg:
                sys.exit(f"нет '{k}' в sources.json (fetch.py add …)")
            if not args.force and list(SOURCES.glob(f"{k}.*")) and not args.dry:
                print(f"{k}: уже есть"); continue
            ytdlp(reg[k]["url"], str(SOURCES / f"{k}.%(ext)s"), args.max_height, extra, args.dry)
    elif args.cmd == "import":
        SOURCES.mkdir(exist_ok=True)
        src = shutil.os.path.abspath(args.file)
        ext = shutil.os.path.splitext(src)[1].lower() or ".mp4"
        dst = SOURCES / f"{args.id}{ext}"
        shutil.copy2(src, dst)
        i = probe(dst)
        print(f"{dst.name}: {i.get('width')}×{i.get('height')} {i.get('fps', 0):.2f}fps {i['duration']:.1f}s")
        if i.get("height", 0) < 2160:
            print("  ! меньше 4K: вертикальный кроп 9:16 будет апскейлом (1080p → ×1.78)")
    elif args.cmd == "ref":
        REFS.mkdir(exist_ok=True)
        name = args.name or "%(id)s"
        run([sys.executable, "-m", "yt_dlp", "--no-playlist", "-f", "bv*+ba/b", "--merge-output-format", "mp4",
             "-o", str(REFS / f"{name}.%(ext)s"), "--write-info-json"] + extra + [args.url])


if __name__ == "__main__":
    main()
