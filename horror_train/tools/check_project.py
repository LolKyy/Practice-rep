#!/usr/bin/env python3
"""Проверяет монтажные таблицы и показывает, каких исходников не хватает.

    python3 tools/check_project.py

Проверки: кадры идут встык и укладываются в 3–7 сек, сумма = хронометраж; реплики SRT
по порядку и не налезают друг на друга; звуковые метки внутри ролика. Затем — список
кадров, для которых ещё нет файлов в 02_images/ или 03_video_clips/.
"""

import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent))
from project import ROOT, TOTAL_S, format_time, load_cues, load_shots, load_srt  # noqa: E402

MIN_SHOT, MAX_SHOT = 3.0, 7.0


def main():
    errors = []
    shots, subs, cues = load_shots(), load_srt(), load_cues()

    position = 0.0
    for s in shots:
        if abs(s.start - position) > 1e-6:
            errors.append(f"{s.id}: начинается в {format_time(s.start)}, ожидалось {format_time(position)}")
        if abs((s.end - s.start) - s.duration) > 1e-6:
            errors.append(f"{s.id}: duration_s={s.duration} не совпадает с {s.end - s.start:.1f}")
        if not MIN_SHOT <= s.duration <= MAX_SHOT:
            errors.append(f"{s.id}: длительность {s.duration} с вне диапазона {MIN_SHOT}–{MAX_SHOT}")
        position = s.end
    if abs(position - TOTAL_S) > 1e-6:
        errors.append(f"кадры заканчиваются в {format_time(position)}, хронометраж {format_time(TOTAL_S)}")

    for prev, cur in zip(subs, subs[1:]):
        if cur.start < prev.end:
            errors.append(f"SRT {cur.index}: налезает на {prev.index}")
    for sub in subs:
        if sub.end <= sub.start:
            errors.append(f"SRT {sub.index}: конец раньше начала")
        if sub.end > TOTAL_S:
            errors.append(f"SRT {sub.index}: после конца ролика")
        if sub.end - sub.start < 1.0:
            errors.append(f"SRT {sub.index}: меньше секунды на экране — не успеют прочитать")

    for c in cues:
        if not 0 <= c.time <= TOTAL_S:
            errors.append(f"звук {c.cue} в {format_time(c.time)}: вне ролика")

    print(f"Кадров: {len(shots)}, хронометраж {format_time(position)}, реплик: {len(subs)}, звуковых меток: {len(cues)}")
    if errors:
        print("\nОШИБКИ:")
        for e in errors:
            print("  ✗", e)
    else:
        print("Таблицы согласованы ✓")

    sources = [p.stem.lower() for d in ("02_images", "03_video_clips") for p in (ROOT / d).glob("*.*")]
    missing = [s for s in shots if s.type != "BLACK" and not any(name.startswith(s.id.lower()) for name in sources)]
    print(f"\nИсходники: готово {len(shots) - len(missing)} из {len(shots)}")
    for s in missing:
        print(f"  · {s.id:5s} {s.type:10s} нужно: {s.files_needed}")

    return 1 if errors else 0


if __name__ == "__main__":
    sys.exit(main())
