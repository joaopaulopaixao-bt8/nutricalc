@echo off
setlocal

set "ROOT_DIR=%~dp0"
for /f "usebackq delims=" %%I in (`powershell -NoProfile -Command "(Get-NetIPAddress -AddressFamily IPv4 | Where-Object { $_.IPAddress -notlike '127.*' -and $_.PrefixOrigin -ne 'WellKnown' } | Select-Object -First 1 -ExpandProperty IPAddress)"`) do set "LAN_IP=%%I"
if not defined LAN_IP set "LAN_IP=SEU-IP-LOCAL"

echo Encerrando instancias antigas do NutriCalc...
taskkill /FI "WINDOWTITLE eq NutriCalc Backend" /T /F >nul 2>nul
taskkill /FI "WINDOWTITLE eq NutriCalc Frontend" /T /F >nul 2>nul
timeout /t 2 /nobreak >nul

echo Iniciando NutriCalc local...
echo.

start "NutriCalc Backend" cmd /k "cd /d "%ROOT_DIR%backend" && node src\index.js"
start "NutriCalc Frontend" cmd /k "cd /d "%ROOT_DIR%frontend" && npm run dev -- --host 0.0.0.0"

echo Backend:  http://127.0.0.1:3001
echo Frontend: http://127.0.0.1:5173
echo Celular:  http://%LAN_IP%:5173
echo.
echo Se o frontend abrir antes do backend, use o botao "Tentar novamente" na tela.

endlocal
