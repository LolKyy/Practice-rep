"""Скачать Real-ESRGAN (ncnn-vulkan, Windows) в tools/bin — AI-апскейл ×4 на видеокарте. Если уже есть или не вышло — тихо пропускает."""
import io
import sys
import urllib.request
import zipfile

from common import ROOT

URL = "https://github.com/xinntao/Real-ESRGAN/releases/download/v0.2.5.0/realesrgan-ncnn-vulkan-20220424-windows.zip"
BIN = ROOT / "tools" / "bin"

if list(BIN.glob("**/realesrgan-ncnn-vulkan.exe")):
    print("Real-ESRGAN уже есть")
    sys.exit(0)
if sys.platform != "win32":
    print("Real-ESRGAN: автоустановка только для Windows")
    sys.exit(0)
try:
    print("Качаю Real-ESRGAN (~45 МБ)...")
    data = urllib.request.urlopen(URL, timeout=120).read()
    BIN.mkdir(parents=True, exist_ok=True)
    zipfile.ZipFile(io.BytesIO(data)).extractall(BIN)
    print("Real-ESRGAN готов:", next(BIN.glob("**/realesrgan-ncnn-vulkan.exe")))
except Exception as e:
    print("! Real-ESRGAN не скачался (рендер пойдёт без AI-апскейла):", e)
