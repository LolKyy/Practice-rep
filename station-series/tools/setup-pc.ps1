# Установка студии на ПК пользователя (Windows). ВСЁ кладётся в D:\Video:
#   D:\Video\apps\        — git, Node.js, ffmpeg, uv (где установщик позволяет выбрать папку)
#   D:\Video\cache\       — кэши npm/uv/pip, Python 3.11 от uv, браузеры Playwright, Hugging Face
#   D:\Video\Practice-rep — репозиторий; проект в D:\Video\Practice-rep\station-series
#     (node_modules, .venv, models, браузер Remotion — внутри проекта)
#
# Запуск (PowerShell, из любой папки):
#   powershell -ExecutionPolicy Bypass -File setup-pc.ps1
# Пароль администратора может понадобиться только winget-установщикам.

$ErrorActionPreference = "Stop"
$Root    = "D:\Video"
$Apps    = Join-Path $Root "apps"
$Cache   = Join-Path $Root "cache"
$Repo    = Join-Path $Root "Practice-rep"
$Project = Join-Path $Repo "station-series"
$Branch  = "claude/nifty-dirac-kluj3p"

New-Item -ItemType Directory -Force -Path $Root, $Apps, $Cache | Out-Null

# --- 1. Кэши и загрузки — в D:\Video\cache (переменные пользователя, переживают перезагрузку)
$envVars = @{
  "NPM_CONFIG_CACHE"         = "$Cache\npm"
  "UV_CACHE_DIR"             = "$Cache\uv"
  "UV_PYTHON_INSTALL_DIR"    = "$Cache\uv-python"
  "UV_TOOL_DIR"              = "$Cache\uv-tools"
  "UV_TOOL_BIN_DIR"          = "$Cache\uv-tools\bin"
  "PIP_CACHE_DIR"            = "$Cache\pip"
  "PLAYWRIGHT_BROWSERS_PATH" = "$Cache\ms-playwright"
  "HF_HOME"                  = "$Cache\huggingface"
  "ELEVENLABS_MCP_BASE_PATH" = "$Project\assets"
}
foreach ($k in $envVars.Keys) {
  [Environment]::SetEnvironmentVariable($k, $envVars[$k], "User")
  Set-Item -Path "Env:$k" -Value $envVars[$k]
  Write-Host "env $k = $($envVars[$k])"
}

# --- 2. Программы через winget (с --location, если установщик поддерживает)
function Install-App($id, $name, $exe) {
  if (Get-Command $exe -ErrorAction SilentlyContinue) { Write-Host "[ok] $name уже есть: $((Get-Command $exe).Source)"; return }
  Write-Host "[winget] $name -> $Apps\$name"
  winget install --id $id -e --accept-source-agreements --accept-package-agreements --location "$Apps\$name"
  if ($LASTEXITCODE -ne 0) {
    Write-Host "[winget] $name не поддерживает выбор папки — ставлю в папку по умолчанию"
    winget install --id $id -e --accept-source-agreements --accept-package-agreements
  }
}
Install-App "Git.Git"           "Git"    "git"
Install-App "OpenJS.NodeJS.LTS" "NodeJS" "node"
Install-App "Gyan.FFmpeg"       "FFmpeg" "ffmpeg"
Install-App "astral-sh.uv"      "uv"     "uv"

# обновить PATH в текущем окне
$env:Path = [Environment]::GetEnvironmentVariable("Path", "Machine") + ";" + [Environment]::GetEnvironmentVariable("Path", "User")

# --- 3. Репозиторий
if (-not (Test-Path "$Repo\.git")) {
  git clone --branch $Branch https://github.com/LolKyy/Practice-rep.git $Repo
} else {
  git -C $Repo pull
}
Set-Location $Project

# --- 4. Remotion (node_modules и браузер Remotion — внутри проекта)
Push-Location video
npm ci
npx remotion browser ensure
Pop-Location

# --- 5. Python 3.11 (от uv, лежит в D:\Video\cache\uv-python) + faster-whisper
uv python install 3.11
uv venv --python 3.11 .venv
uv pip install --python .venv faster-whisper fonttools
.\.venv\Scripts\python tools\setup-models.py

# --- 6. Playwright Chromium (в D:\Video\cache\ms-playwright)
npx --yes playwright install chromium

# --- 7. Версии
Write-Host "`n=== Версии ==="
git --version; node -v; npm -v; ffmpeg -version | Select-Object -First 1; uv --version
.\.venv\Scripts\python --version

# --- 8. Бенчмарк рендера под твою видеокарту (пишет tools\bench-results.md и tools\render.config.json)
node tools\bench-render.mjs --repeat 2

Write-Host "`nГотово. Проект: $Project"
Write-Host "Ключ ElevenLabs: claude mcp add -s local elevenlabs -e ELEVENLABS_API_KEY=<ключ> -e ELEVENLABS_MCP_BASE_PATH=$Project\assets -- uvx elevenlabs-mcp"
