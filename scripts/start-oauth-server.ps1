# Script para iniciar servidor HTTP local para Google OAuth
# Ejecuta: .\start-oauth-server.ps1

Write-Host "🔧 Iniciando servidor HTTP para Google OAuth..." -ForegroundColor Green
Write-Host ""

# Verificar si Python está disponible
$pythonAvailable = $false
try {
    $pythonVersion = python --version 2>$null
    if ($pythonVersion) {
        $pythonAvailable = $true
        Write-Host "✅ Python encontrado: $pythonVersion" -ForegroundColor Green
    }
} catch {
    Write-Host "❌ Python no encontrado" -ForegroundColor Yellow
}

# Verificar si Node.js está disponible
$nodeAvailable = $false
try {
    $nodeVersion = node --version 2>$null
    if ($nodeVersion) {
        $nodeAvailable = $true
        Write-Host "✅ Node.js encontrado: $nodeVersion" -ForegroundColor Green
    }
} catch {
    Write-Host "❌ Node.js no encontrado" -ForegroundColor Yellow
}

Write-Host ""
Write-Host "📁 Directorio actual: $PWD" -ForegroundColor Cyan
Write-Host ""

# Mostrar opciones disponibles
Write-Host "Opciones disponibles:" -ForegroundColor White
Write-Host "1. Python HTTP Server (Puerto 8000) - Recomendado" -ForegroundColor White
Write-Host "2. Node.js http-server (Puerto 8080)" -ForegroundColor White
Write-Host "3. Instrucciones para VS Code Live Server" -ForegroundColor White
Write-Host "4. Salir" -ForegroundColor White
Write-Host ""

$choice = Read-Host "Selecciona una opción (1-4)"

switch ($choice) {
    "1" {
        if ($pythonAvailable) {
            Write-Host "🐍 Iniciando Python HTTP Server en puerto 8000..." -ForegroundColor Green
            Write-Host ""
            Write-Host "📱 URLs de prueba:" -ForegroundColor Yellow
            Write-Host "   Diagnóstico OAuth: http://localhost:8000/google_oauth_diagnostico.html" -ForegroundColor Cyan
            Write-Host "   Frontend ejemplo:  http://localhost:8000/frontend-google-auth/index.html" -ForegroundColor Cyan
            Write-Host ""
            Write-Host "💡 Presiona Ctrl+C para detener el servidor" -ForegroundColor Yellow
            Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Gray
            Write-Host ""
            
            python -m http.server 8000
        } else {
            Write-Host "❌ Python no está disponible. Instala Python desde https://python.org" -ForegroundColor Red
        }
    }
    "2" {
        if ($nodeAvailable) {
            Write-Host "🟢 Verificando http-server..." -ForegroundColor Green
            
            # Verificar si http-server está instalado
            try {
                npx http-server --version 2>$null | Out-Null
                Write-Host "✅ http-server disponible" -ForegroundColor Green
            } catch {
                Write-Host "📦 Instalando http-server..." -ForegroundColor Yellow
                npm install -g http-server
            }
            
            Write-Host "🟢 Iniciando Node.js HTTP Server en puerto 8080..." -ForegroundColor Green
            Write-Host ""
            Write-Host "📱 URLs de prueba:" -ForegroundColor Yellow
            Write-Host "   Diagnóstico OAuth: http://localhost:8080/google_oauth_diagnostico.html" -ForegroundColor Cyan
            Write-Host "   Frontend ejemplo:  http://localhost:8080/frontend-google-auth/index.html" -ForegroundColor Cyan
            Write-Host ""
            Write-Host "💡 Presiona Ctrl+C para detener el servidor" -ForegroundColor Yellow
            Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Gray
            Write-Host ""
            
            npx http-server -p 8080
        } else {
            Write-Host "❌ Node.js no está disponible. Instala Node.js desde https://nodejs.org" -ForegroundColor Red
        }
    }
    "3" {
        Write-Host ""
        Write-Host "📋 Instrucciones para VS Code Live Server:" -ForegroundColor Yellow
        Write-Host ""
        Write-Host "1. Abre VS Code" -ForegroundColor White
        Write-Host "2. Instala la extensión 'Live Server' de Ritwick Dey" -ForegroundColor White
        Write-Host "3. Haz clic derecho en 'google_oauth_diagnostico.html'" -ForegroundColor White
        Write-Host "4. Selecciona 'Open with Live Server'" -ForegroundColor White
        Write-Host "5. Se abrirá automáticamente en el navegador" -ForegroundColor White
        Write-Host ""
        Write-Host "📱 URL típica: http://127.0.0.1:5500/google_oauth_diagnostico.html" -ForegroundColor Cyan
        Write-Host ""
        Read-Host "Presiona Enter para continuar"
    }
    "4" {
        Write-Host "👋 ¡Hasta luego!" -ForegroundColor Green
        exit
    }
    default {
        Write-Host "❌ Opción no válida" -ForegroundColor Red
    }
}

Write-Host ""
Write-Host "🔧 Configuración de Google Cloud Console:" -ForegroundColor Yellow
Write-Host "   Asegúrate de agregar estos orígenes en Google Cloud Console:" -ForegroundColor White
Write-Host "   - http://localhost:8000" -ForegroundColor Cyan
Write-Host "   - http://localhost:8080" -ForegroundColor Cyan
Write-Host "   - http://127.0.0.1:5500" -ForegroundColor Cyan
Write-Host ""
Write-Host "🔗 Google Cloud Console: https://console.cloud.google.com/apis/credentials" -ForegroundColor Cyan
Write-Host "🔑 Tu Client ID: 102613720703-cq73g92su0v8kevc0iuftjak0tm1e1al.apps.googleusercontent.com" -ForegroundColor Cyan
