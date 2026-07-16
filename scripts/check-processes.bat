@echo off
echo ========================================
echo  VERIFICANDO PROCESOS EN PUERTO 4000
echo ========================================

REM Mostrar procesos que usan el puerto 4000
echo Procesos usando el puerto 4000:
netstat -ano | findstr :4000

echo.
echo ========================================
echo  PROCESOS NODE.JS ACTIVOS
echo ========================================

REM Mostrar todos los procesos Node.js
tasklist | findstr node.exe
tasklist | findstr nodemon.exe

echo.
echo ========================================
echo  OPCIONES:
echo ========================================
echo 1. Para matar solo el puerto 4000: start-server.bat
echo 2. Para matar todos los Node.js: taskkill /IM node.exe /F
echo 3. Para matar nodemon: taskkill /IM nodemon.exe /F
echo ========================================

pause
