@echo off
echo ===================================
echo  LIMPIANDO PROCESOS ANTERIORES
echo ===================================

REM Buscar y matar procesos Node.js que usen el puerto 4000
echo Buscando procesos en puerto 4000...
for /f "tokens=5" %%a in ('netstat -ano ^| findstr :4000') do (
    echo Matando proceso PID: %%a
    taskkill /PID %%a /F >nul 2>&1
)

REM Matar todos los procesos node.js relacionados con este proyecto
echo Matando procesos Node.js antiguos...
taskkill /IM node.exe /F >nul 2>&1
taskkill /IM nodemon.exe /F >nul 2>&1

REM Esperar un poco para que se liberen los recursos
echo Esperando liberación de recursos...
timeout /t 2 /nobreak >nul

echo ===================================
echo  INICIANDO SERVIDOR
echo ===================================

REM Iniciar el servidor
npm start

pause
