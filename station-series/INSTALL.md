# INSTALL — что установлено, версии, команды

## Где это установлено сейчас
Студия собрана и проверена в **облачной сессии Claude Code** (Linux-контейнер Ubuntu 24.04, 4 ядра CPU, 15 ГБ RAM,
**без видеокарты**). Контейнер одноразовый — в репозиторий сохранено всё, кроме `node_modules/`, `.venv/` и `models/`,
которые восстанавливаются командами ниже. На твоём ПК (Windows/Mac с видеокартой) повтори раздел «Установка на ПК»
и перезапусти бенчмарк — выбор `--gl`/`--concurrency` зависит от железа.

## Версии (облачная сессия, 2026-11-04)
| Что | Версия | Как поставлено |
|---|---|---|
| ОС | Ubuntu 24.04.5 LTS (linux x64) | — |
| git | 2.43.0 | предустановлен |
| Node.js / npm | 22.23.4 / 10.9.9 | предустановлен |
| Python (системный) | 3.13.18 | предустановлен |
| Python (.venv) | 3.11.18 | `uv venv --python 3.11 .venv` |
| uv | 0.11.32 | предустановлен |
| ffmpeg / ffprobe | 6.1.1 | предустановлен (apt) |
| Remotion (+cli, fonts, google-fonts, transitions, media) | 4.0.540 | `npx create-video@latest --yes --blank --no-tailwind video` + `npm install @remotion/google-fonts@4.0.540 @remotion/transitions@4.0.540 @remotion/fonts@4.0.540 @remotion/media@4.0.540` |
| React | 19.3.1 | шаблон Blank |
| TypeScript | 5.9.3 | шаблон Blank |
| Навыки Remotion (13 шт.) | remotion-dev/skills (см. `skills-lock.json`) | `npx skills add remotion-dev/skills --yes` → `.agents/skills`, симлинки в `.claude/skills` |
| faster-whisper / CTranslate2 | 1.2.1 / 4.8.5 | `uv pip install faster-whisper` в `.venv` |
| Модель Whisper small (int8, CTranslate2) | sha256 `ca732cb1…dc404ce73` | `tools/setup-models.py` → `models/whisper-small` |
| fonttools | 4.68.0 | `uv pip install fonttools` (нарезка статичных начертаний) |
| elevenlabs-mcp | 0.12.2 | `uvx elevenlabs-mcp` (запускается Claude Code из `.mcp.json`) |
| Браузер для рендера | chrome-headless-shell (Playwright 1243) | предустановлен в контейнере (`/opt/pw-browsers`) |

### Особенности облачной сессии (обходы)
- **Hugging Face закрыт прокси** → модель Whisper small собрана из npm-зеркала `@skillninja/shortmovie-telop-model-p0..p3`
  (это та же Systran faster-whisper-small в int8, sha256 сверен с файлом из пакета). На ПК `tools/setup-models.py`
  сначала пробует официальный HF.
- **remotion.media закрыт** → Remotion не может скачать свой Chrome Headless Shell; `video/remotion.config.ts` в этом
  случае берёт предустановленный `chrome-headless-shell` Playwright. На ПК этого пути нет — Remotion скачает браузер сам.
- `npx playwright install chromium` **не запускался**: в контейнере Chromium уже стоит (`/opt/pw-browsers`), повторная
  установка ломает связку. На ПК — запусти (см. ниже).
- **fonts.google.com закрыт** → шрифты взяты из официального репозитория `github.com/google/fonts` (raw.githubusercontent.com).
- **ElevenLabs** — ключ подставляет прокси облачной сессии (в `.mcp.json` стоит заглушка `proxy-injected`).
  У текущего ключа нет права `sound_generation` (звуковые эффекты) — см. `bible/STATE.md`.
- `nvidia-smi` нет, `/dev/dri` нет — GPU в контейнере отсутствует, рендер идёт на CPU (SwiftShader/SwANGLE).

## Шрифты (assets/fonts, OFL — `assets/fonts/OFL.txt`)
Источник: `github.com/google/fonts/ofl/*` (вариативные TTF) → статичные начертания через `fontTools.varLib.instancer`.
Кириллица проверена в каждом файле (А–Я, а–я, Ё/ё, №).
| Файл | Семейство в CSS | weight | Где |
|---|---|---|---|
| Inter-ExtraBold.ttf / Inter-Black.ttf | Inter | 800 / 900 | выноски, текст карточек |
| Montserrat-ExtraBold.ttf / Montserrat-Black.ttf | Montserrat | 800 / 900 | караоке-субтитры |
| JetBrainsMono-Regular.ttf / JetBrainsMono-Bold.ttf | JetBrains Mono | 400 / 700 | HUD, мониторы, журналы |
| Oswald-Bold.ttf | Oswald | 700 | заголовки, «ПРАВИЛО №N», «ЧАСТЬ N» |

## ElevenLabs MCP
Зарегистрирован на уровне проекта (`station-series/.mcp.json`, коммитится):
```bash
claude mcp add -s project elevenlabs -e ELEVENLABS_API_KEY=<ключ> -e ELEVENLABS_MCP_BASE_PATH=<полный путь к station-series/assets> -- uvx elevenlabs-mcp
```
В `.mcp.json` значения подставляются из переменных окружения: `${ELEVENLABS_API_KEY:-proxy-injected}` и
`${ELEVENLABS_MCP_BASE_PATH:-/home/user/Practice-rep/station-series/assets}`.
**На ПК** не клади ключ в `.mcp.json` (он в git) — задай переменные окружения или добавь сервер в локальную область:
```bash
claude mcp add -s local elevenlabs -e ELEVENLABS_API_KEY=<ключ> -e ELEVENLABS_MCP_BASE_PATH=<путь>/station-series/assets -- uvx elevenlabs-mcp
```
Запасной путь без MCP: `tools/eleven.py` (REST API, тот же ключ).

## Рендер: бенчмарк
См. `tools/bench-results.md` (таблица) и `tools/render.config.json` (выбранный вариант, его читают render-скрипты).
Перезапуск на новом компьютере: `node tools/bench-render.mjs --repeat 2`.

## Установка на ПК (Windows / macOS)
### Windows (PowerShell; пакетный менеджер winget)
```powershell
winget install --id Git.Git -e
winget install --id OpenJS.NodeJS.LTS -e
winget install --id Python.Python.3.11 -e
winget install --id Gyan.FFmpeg -e
winget install --id astral-sh.uv -e
```
### macOS (Homebrew)
```bash
brew install git node python@3.11 ffmpeg uv
```
### Проект (одинаково везде, из папки station-series/)
```bash
cd video && npm ci && cd ..
uv venv --python 3.11 .venv
uv pip install --python .venv faster-whisper fonttools
# Mac на Apple Silicon дополнительно:
uv pip install --python .venv mlx-whisper
.venv/bin/python tools/setup-models.py          # Windows: .venv\Scripts\python tools\setup-models.py
npx playwright install chromium
node tools/bench-render.mjs --repeat 2          # выберет --gl и --concurrency под твою видеокарту
```
