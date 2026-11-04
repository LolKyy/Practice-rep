#!/usr/bin/env python3
"""Озвучка серии по episodes/<ep>/lines.json.

  .venv/bin/python tools/make_voice.py ep01            # сгенерировать недостающее, проверить, собрать
  .venv/bin/python tools/make_voice.py ep01 --redo 08  # перегенерировать реплику 08 (тратит кредиты!)
  .venv/bin/python tools/make_voice.py ep01 --dry      # только посчитать символы, ничего не генерировать

Шаги:
 1. raw/NN_роль.mp3 — ElevenLabs eleven_v3 (КЭШ: если файл есть, повторно не генерируется — кредиты не тратятся).
 2. fx/NN_роль.mp3 — эффект роли (tools/voicefx.py); у «earth» провалы сигнала ставятся МЕЖДУ словами.
 3. Whisper по каждой реплике → сверка с текстом (сходство < 0.8 — помечается «ПРОВЕРЬ»).
 4. Таймлайн: реплики подряд, перед каждой пауза pre; слова сценария получают тайминги (сопоставление с Whisper).
    → voice.mp3 (вся дорожка), timings.json (слова, абсолютные секунды), timeline.json (реплики, сцены, длительность).
"""
import argparse
import difflib
import json
import os
import re
import subprocess
import sys

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
PY = sys.executable


def sh(args, **kw):
    return subprocess.run(args, check=True, **kw)


def dur(path):
    out = subprocess.run(["ffprobe", "-v", "error", "-show_entries", "format=duration", "-of", "json", path], capture_output=True, text=True, check=True).stdout
    return float(json.loads(out)["format"]["duration"])


TAG = re.compile(r"\[[^\]]*\]")


def clean_text(t):
    return TAG.sub("", t).strip()


def norm(w):
    return re.sub(r"[^a-zа-я0-9-]", "", w.lower().replace("ё", "е"))


def script_words(text):
    # слова для субтитров: убираем теги, тире-одиночки и многоточия-одиночки
    out = []
    for w in clean_text(text).replace("«", "").replace("»", "").split():
        if re.fullmatch(r"[—–\-…\.]+", w):
            continue
        out.append(w)
    return out


def align(sw, ww):
    """sw — слова сценария, ww — слова Whisper [{word,start,end}]. Возвращает тайминги для sw."""
    if not ww:
        return []
    a = [norm(x) for x in sw]
    b = [norm(x["word"]) for x in ww]
    sm = difflib.SequenceMatcher(a=a, b=b, autojunk=False)
    res = [None] * len(sw)
    for blk in sm.get_matching_blocks():
        for k in range(blk.size):
            w = ww[blk.b + k]
            res[blk.a + k] = (w["start"], w["end"])
    t0, t1 = ww[0]["start"], ww[-1]["end"]
    # заполняем пропуски пропорционально длине слов между якорями
    i = 0
    while i < len(sw):
        if res[i] is not None:
            i += 1
            continue
        j = i
        while j < len(sw) and res[j] is None:
            j += 1
        left = res[i - 1][1] if i > 0 else t0
        right = res[j][0] if j < len(sw) else t1
        if right <= left:
            right = left + 0.25 * (j - i)
        lens = [max(2, len(norm(sw[k]))) for k in range(i, j)]
        tot = sum(lens)
        cur = left
        for k, L in zip(range(i, j), lens):
            d = (right - left) * L / tot
            res[k] = (cur, cur + d)
            cur += d
        i = j
    return res


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("ep")
    ap.add_argument("--redo", nargs="*", default=[])
    ap.add_argument("--dry", action="store_true")
    a = ap.parse_args()
    ep_dir = os.path.join(ROOT, "episodes", a.ep)
    spec = json.load(open(os.path.join(ep_dir, "lines.json"), encoding="utf-8"))
    raw_dir = os.path.join(ep_dir, "voice", "raw")
    fx_dir = os.path.join(ep_dir, "voice", "fx")
    os.makedirs(raw_dir, exist_ok=True)
    os.makedirs(fx_dir, exist_ok=True)

    todo = []
    for ln in spec["lines"]:
        raw = os.path.join(raw_dir, f"{ln['id']}_{ln['role']}.mp3")
        if ln["id"] in a.redo and os.path.exists(raw):
            os.remove(raw)
        if not os.path.exists(raw):
            todo.append((ln, raw))
    chars = sum(len(ln["text"]) for ln, _ in todo)
    print(f"[voice] к генерации: {len(todo)} реплик, {chars} символов (≈ кредитов)")
    if a.dry:
        return
    for ln, raw in todo:
        v = spec["voices"][ln["role"]]
        sh([PY, os.path.join(ROOT, "tools", "eleven.py"), "tts", ln["text"], raw, "--voice", v["id"], "--model", "eleven_v3"])

    from faster_whisper import WhisperModel

    model = WhisperModel(os.path.join(ROOT, "models", "whisper-small"), device="cpu", compute_type="int8")

    def transcribe(path, prompt):
        segs, _ = model.transcribe(path, language="ru", word_timestamps=True, beam_size=5, initial_prompt=prompt)
        ww, text = [], []
        for s in segs:
            text.append(s.text.strip())
            for w in s.words or []:
                ww.append({"word": w.word.strip(), "start": w.start, "end": w.end})
        return ww, " ".join(text)

    timeline, words, inputs = [], [], []
    t = 0.0
    report = []
    for ln in spec["lines"]:
        v = spec["voices"][ln["role"]]
        raw = os.path.join(raw_dir, f"{ln['id']}_{ln['role']}.mp3")
        fx = os.path.join(fx_dir, f"{ln['id']}_{ln['role']}.mp3")
        prompt = clean_text(ln["text"])
        # подрезка тишины (начало/конец, внутренние паузы > 0.32 с → 0.28 с) и темп роли — без новых кредитов
        tight = os.path.join(fx_dir, f"{ln['id']}_{ln['role']}.tight.wav")
        tempo = float(v.get("tempo", 1.0))
        af = (
            "silenceremove=start_periods=1:start_threshold=-45dB:start_silence=0.05,"
            "areverse,silenceremove=start_periods=1:start_threshold=-45dB:start_silence=0.08,areverse,"
            "silenceremove=stop_periods=-1:stop_duration=0.32:stop_threshold=-42dB:stop_silence=0.28"
            + (f",atempo={tempo}" if abs(tempo - 1) > 1e-3 else "")
        )
        sh(["ffmpeg", "-nostdin", "-hide_banner", "-loglevel", "error", "-y", "-i", raw, "-af", af, "-ar", "44100", tight])
        raw = tight
        if v["fx"] == "earth":
            ww_raw, _ = transcribe(raw, prompt)
            gaps = [(ww_raw[i]["end"] + ww_raw[i + 1]["start"]) / 2 for i in range(len(ww_raw) - 1)]
            pick = gaps[2::4][:3] if len(gaps) > 6 else gaps[1::3][:2]
            sh([PY, os.path.join(ROOT, "tools", "voicefx.py"), "earth", raw, fx, "--gaps", ",".join(f"{g:.2f}" for g in pick)], stdout=subprocess.DEVNULL)
        else:
            sh([PY, os.path.join(ROOT, "tools", "voicefx.py"), v["fx"], raw, fx], stdout=subprocess.DEVNULL)
        ww, _ = transcribe(fx, prompt)  # тайминги: с подсказкой текста
        _, heard = transcribe(fx, None)  # проверка: БЕЗ подсказки (иначе Whisper может повторить подсказку)
        num = {"двенадцать": "12", "тридцать": "30", "четыреста": "400", "четырнадцать": "14", "семь": "7"}
        exp = " ".join(num.get(norm(w), norm(w)) for w in script_words(ln["text"]))
        got = " ".join(norm(w) for w in heard.split())
        sim = difflib.SequenceMatcher(a=exp, b=got).ratio() if heard else 0
        sw = script_words(ln["text"])
        al = align(sw, ww)
        t += ln.get("pre", 0.4) * spec.get("preScale", 1.0)
        d = dur(fx)
        for w, (s0, s1) in zip(sw, al):
            words.append({"word": w, "start": round(t + s0, 3), "end": round(t + s1, 3), "line": ln["id"], "role": ln["role"]})
        timeline.append({"id": ln["id"], "scene": ln["scene"], "role": ln["role"], "start": round(t, 3), "end": round(t + d, 3), "file": os.path.relpath(fx, ROOT).replace("\\", "/"), "text": clean_text(ln["text"])})
        inputs.append((fx, t))
        report.append((ln["id"], ln["role"], round(d, 2), round(sim, 2), clean_text(ln["text"]), heard))
        t += d
        os.remove(tight)
    total = round(t + spec.get("tail", 2.0), 3)

    # сцены: от начала первой реплики сцены (минус её pre) до начала следующей сцены
    scenes = []
    for i, item in enumerate(timeline):
        ln = spec["lines"][i]
        if not scenes or scenes[-1]["id"] != item["scene"]:
            scenes.append({"id": item["scene"], "start": round(item["start"] - ln.get("pre", 0.4) * spec.get("preScale", 1.0), 3)})
    for i, sc in enumerate(scenes):
        sc["end"] = scenes[i + 1]["start"] if i + 1 < len(scenes) else total

    # общая дорожка голоса
    args, filt = [], []
    for i, (f, st) in enumerate(inputs):
        args += ["-i", f]
        ms = int(st * 1000)
        filt.append(f"[{i}:a]adelay={ms}|{ms}[d{i}]")
    mix = "".join(f"[d{i}]" for i in range(len(inputs)))
    filt.append(f"{mix}amix=inputs={len(inputs)}:normalize=0:duration=longest,apad=whole_dur={total}[out]")
    voice_mp3 = os.path.join(ep_dir, "voice.mp3")
    sh(["ffmpeg", "-nostdin", "-hide_banner", "-loglevel", "error", "-y", *args, "-filter_complex", ";".join(filt), "-map", "[out]", "-ac", "2", "-ar", "44100", "-b:a", "192k", voice_mp3])

    json.dump({"audio": f"episodes/{a.ep}/voice.mp3", "language": "ru", "duration": total, "words": words}, open(os.path.join(ep_dir, "timings.json"), "w", encoding="utf-8"), ensure_ascii=False, indent=1)
    json.dump({"duration": total, "scenes": scenes, "lines": timeline}, open(os.path.join(ep_dir, "timeline.json"), "w", encoding="utf-8"), ensure_ascii=False, indent=1)

    print(f"\n[voice] дорожка {total:.1f} с → {voice_mp3}")
    for sc in scenes:
        print(f"  сцена {sc['id']:<9} {sc['start']:6.1f} – {sc['end']:6.1f}")
    print()
    for rid, role, d, sim, txt, heard in report:
        flag = "OK " if sim >= 0.8 else "ПРОВЕРЬ"
        print(f"{flag} {rid} {role:<4} {d:5.2f}с  сходство {sim:.2f}\n     текст:  {txt}\n     слышно: {heard}")


if __name__ == "__main__":
    main()
