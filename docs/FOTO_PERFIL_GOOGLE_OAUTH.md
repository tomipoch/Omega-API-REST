# 📸 Funcionalidad de Foto de Perfil - Google OAuth

## ✅ IMPLEMENTADO EXITOSAMENTE

Tu backend ahora **extrae, guarda y devuelve automáticamente** la foto de perfil de Google OAuth.

## 🔄 **Flujo Implementado:**

### 1. **Extracción del Token**
- El middleware `googleAuth.js` decodifica el token de Google
- Extrae automáticamente el campo `picture` (URL de la foto)
- Logs de depuración muestran la foto extraída

### 2. **Guardado en Base de Datos**
- **Usuario NUEVO**: Se guarda la foto de Google directamente en `foto_perfil_url`
- **Usuario EXISTENTE sin foto**: Se actualiza `foto_perfil_url` con la foto de Google
- **Usuario EXISTENTE con foto**: Se mantiene la foto actual

### 3. **Respuesta del Endpoint**
- El endpoint `/usuarios/auth/google` incluye `foto_perfil_url` en la respuesta
- El JWT generado incluye la foto de perfil
- Se incluye el campo `email` en la respuesta

## 📡 **Respuesta del Endpoint:**

```json
{
  "token": "jwt_con_foto_incluida",
  "nombre": "Juan",
  "apellido_paterno": "Pérez",
  "apellido_materno": "",
  "foto_perfil_url": "https://lh3.googleusercontent.com/a/ACg8ocJ...",
  "email": "usuario@gmail.com",
  "rol_id": 1,
  "loginMethod": "google",
  "newUser": true // o accountLinked: true
}
```

## 🔧 **Archivos Modificados:**

### 1. `middleware/googleAuth.js`
- ✅ Extrae campo `picture` del token de Google
- ✅ Logs de depuración para mostrar foto extraída

### 2. `models/usuariosModel.js`
- ✅ Método `actualizarFotoPerfilGoogle()` para actualizar foto
- ✅ Campo `foto_perfil_url` incluido en consultas

### 3. `controllers/usuariosController.js`
- ✅ Lógica para usuarios nuevos: guarda foto de Google
- ✅ Lógica para usuarios existentes sin foto: actualiza con foto de Google
- ✅ JWT incluye `foto_perfil_url`
- ✅ Respuesta incluye `foto_perfil_url` y `email`

## 🧪 **Tests Ejecutados:**

✅ **test_foto_perfil_logic.js** - Lógica de base de datos
✅ **test_endpoint_foto_final.js** - Endpoint funcionando
✅ **Validación de estructura** - Response correcta

## 🎯 **Para el Frontend:**

Tu frontend debe enviar exactamente esto:

```javascript
fetch('http://localhost:4000/usuarios/auth/google', {
    method: 'POST',
    headers: {
        'Content-Type': 'application/json',
    },
    body: JSON.stringify({
        googleToken: token_jwt_real_de_google
    })
})
.then(response => response.json())
.then(data => {
    // data.foto_perfil_url contiene la URL de la foto de Google
    // data.token contiene el JWT de tu sistema con la foto incluida
    console.log('Foto de perfil:', data.foto_perfil_url);
    localStorage.setItem('authToken', data.token);
});
```

## 🔍 **Casos Cubiertos:**

1. ✅ **Usuario nuevo con foto de Google** → Guarda foto y la devuelve
2. ✅ **Usuario existente sin foto** → Actualiza con foto de Google
3. ✅ **Usuario existente con foto** → Mantiene foto actual
4. ✅ **Vinculación de cuenta** → Actualiza foto si no tenía
5. ✅ **JWT incluye foto** → Para uso en futuras requests
6. ✅ **Response incluye email** → Para mostrar en UI

## 🎉 **RESULTADO:**

**Tu backend está 100% listo** para recibir tokens de Google desde el frontend y automáticamente extraer, guardar y devolver la foto de perfil del usuario.

**El siguiente paso es implementar esto en tu frontend real.**
