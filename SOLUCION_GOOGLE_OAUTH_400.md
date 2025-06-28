# 🔧 Guía Rápida - Solucionar Error 400 Google OAuth

## ❌ Error Actual
**Error 400: invalid_request** al intentar usar Google Sign-In

## 🎯 Solución Rápida (3 pasos)

### 1️⃣ Configurar Google Cloud Console
1. Ve a: https://console.cloud.google.com/apis/credentials
2. Busca tu Client ID: `102613720703-cq73g92su0v8kevc0iuftjak0tm1e1al.apps.googleusercontent.com`
3. Haz clic en el ícono de editar (✏️)
4. En **"Orígenes autorizados de JavaScript"** agrega:
   ```
   http://localhost:8000
   http://localhost:8080
   http://127.0.0.1:5500
   ```
5. Guarda los cambios

### 2️⃣ Usar Servidor HTTP (NO file://)
**Opción A - Python (Recomendado):**
```powershell
# En el directorio del proyecto
python -m http.server 8000
```

**Opción B - PowerShell Script:**
```powershell
.\start-oauth-server.ps1
```

**Opción C - VS Code Live Server:**
- Instala extensión "Live Server"
- Clic derecho en archivo HTML → "Open with Live Server"

### 3️⃣ Probar
1. Abre: http://localhost:8000/google_oauth_diagnostico.html
2. Sigue las instrucciones de diagnóstico
3. Prueba el botón "Iniciar sesión con Google"

## 🚀 URLs de Prueba
- **Diagnóstico:** http://localhost:8000/google_oauth_diagnostico.html
- **Frontend ejemplo:** http://localhost:8000/frontend-google-auth/index.html

## ⚠️ Puntos Importantes
- Los cambios en Google Cloud Console tardan hasta 5 minutos
- NO uses file:// - Google OAuth requiere HTTP/HTTPS
- Limpia caché del navegador después de los cambios
- Asegúrate de que el proyecto esté activo en Google Cloud Console

## 🔍 Si sigue fallando
1. Revisa la consola del navegador (F12)
2. Verifica que la API de Google+ esté habilitada
3. Confirma que el Client ID es correcto
4. Espera 5-10 minutos después de cambios en Google Cloud Console

## 📞 Comandos de Verificación
```powershell
# Verificar si el servidor está corriendo
curl http://localhost:8000

# Ver logs del servidor
# (Los logs aparecen en la terminal donde ejecutaste el comando)
```
