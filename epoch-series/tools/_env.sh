# общие настройки рендера (подобраны замером, см. CLAUDE.md)
ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
VIDEO="$ROOT/video"
CONC="${CONC:-4}"
GL="${GL:-angle}"     # замер: angle 1.3 с/кадр, swiftshader 1.5, swangle 11 (облако, 4 ядра)
BX=""; [ -x /opt/pw-browsers/chromium_headless_shell-1243/chrome-headless-shell-linux64/chrome-headless-shell ] && BX="--browser-executable=/opt/pw-browsers/chromium_headless_shell-1243/chrome-headless-shell-linux64/chrome-headless-shell"
