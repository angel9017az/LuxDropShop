@echo off
setlocal
cd /d "%~dp0"
where node.exe >nul 2>nul
if errorlevel 1 (
  echo Node.js no aparece en PATH. Instala Node.js 22.5 o posterior y vuelve a intentarlo.
  pause
  exit /b 1
)
echo Iniciando LuxDropShop en http://127.0.0.1:3000
node.exe server.js
if errorlevel 1 (
  echo El servidor no pudo iniciar. Si el puerto 3000 esta ocupado, revisa http://127.0.0.1:3000 o configura PORT=3001.
  pause
)
