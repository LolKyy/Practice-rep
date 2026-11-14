@echo off
chcp 65001 >nul
cd /d "%~dp0"
echo === CLIPSO: 4K рендер mix_v2 ===

echo [1/6] Обновляю проект...
git pull origin ccr-5e45347d-h3f681

echo [2/6] Python-библиотеки...
py -m pip install -q -r tools\requirements.txt
if errorlevel 1 (echo Нужен Python: python.org, галочка Add to PATH & pause & exit /b)

echo [3/6] Remotion...
if not exist video\node_modules (cd video & call npm install --no-audit --no-fund & cd ..)

echo [4/6] AI-апскейлер...
py tools\setup_upscaler.py

echo [5/6] Ищу присланные ролики...
py tools\import_mix.py %1
if not exist sources\tt_launch.mp4 (echo Не нашёл ролики. Перетащи папку с ними на этот файл render_4k.bat & pause & exit /b)

echo [6/6] Рендер 4K, 60 fps (10-30 минут)...
set "UP="
dir /s /b tools\bin\realesrgan-ncnn-vulkan.exe >nul 2>nul && set "UP=--upscale"
set "BR="
if exist "C:\Program Files\Google\Chrome\Application\chrome.exe" set BR=--chrome-mode chrome-for-testing --browser "C:\Program Files\Google\Chrome\Application\chrome.exe"
py tools\plan_mix_v2.py
py tools\render.py edits\mix_v2.json video --res 2 --interp %UP% %BR%
if errorlevel 1 (echo. & echo Рендер упал - пришли скрин последних строк. & pause & exit /b)

echo Готово: out\mix_v2_upload.mp4 (без звука) и out\mix_v2_preview.mp4 (с треком)
explorer out
pause
