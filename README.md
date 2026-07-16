# Omega-API-REST

Omega-API-REST es el backend para la página web de una relojería y joyería. Implementa una arquitectura Modelo-Vista-Controlador (MVC) organizada en **Controllers**, **Models**, y **Routes**, junto con **middleware** para diversas funcionalidades como:

- Manejo de autenticación con JWT.
- Creación dinámica de carpetas para almacenar archivos.
- Verificación de roles de usuario.
- Envío de correos electrónicos para notificaciones y restablecimiento de contraseñas.

---

## 📋 **Características**

- **Autenticación Segura**: Uso de JSON Web Tokens (JWT) para autenticar usuarios y proteger rutas.
- **🔐 Autenticación con Google OAuth** 🆕:
  - Login y registro con cuentas de Google
  - Vinculación de cuentas existentes con Google
  - Desvinculación segura de cuentas Google
  - Sistema híbrido: tradicional + OAuth
- **Gestión de Usuarios**:
  - Registro, inicio de sesión y actualización de perfiles.
  - Carga de imágenes de perfil con recorte y almacenamiento en el servidor.
  - Eliminación de cuentas de usuario con confirmación.
- **Sistema de Reservas en Tiempo Real** 🆕:
  - Reserva temporal de productos (30 minutos por defecto)
  - Manejo automático de stock en tiempo real
  - Expiración automática de reservas
  - Prevención de reservas duplicadas
  - Limpieza automática con jobs programados
- **Roles y Permisos**: Control de acceso basado en roles, como administrador o usuario.
- **Notificaciones por Correo**: Envío de correos electrónicos para restablecimiento de contraseñas y confirmaciones.
- **Almacenamiento de Archivos**: Uso de `multer` para subir y procesar imágenes.
- **Auditoría Completa**: Registro de todas las acciones del sistema.

---

## 🛠️ **Requisitos Previos**

Asegúrate de tener instalado:

- [Node.js](https://nodejs.org/) (v14 o superior)
- [PostgreSQL](https://www.postgresql.org/) (v13 o superior)
- Copia de Base de Datos Omega

---

## 🚀 **Instalación**

1. **Clonar el repositorio**:
   ```bash
   git clone https://github.com/tuusuario/Omega-API-REST.git
   cd Omega-API-REST
   ```

2. **Instalar dependencias**:
   ```bash
   npm install
   ```

3. **Configurar variables de entorno**:  
   Crea un archivo `.env` en la raíz del proyecto con las siguientes variables:
   ```plaintext
   PORT=4000
   DB_HOST=localhost
   DB_PORT=5432
   DB_USER=tu_usuario
   DB_PASSWORD=tu_contraseña
   DB_NAME=omega_db
   JWT_SECRET=tu_secreto_jwt
   EMAIL_USER=tu_correo@gmail.com
   EMAIL_PASSWORD=tu_contraseña_correo
   ```

4. **Configurar Base de Datos**:
   ```bash
   # Crear tabla de reservas
   node scripts/crear_tabla_reservas.js
   # Configurar soporte para Google OAuth
   node scripts/configurar_google_oauth.js
   ```

5. **Variables de entorno**:
   Copia `.env.example` a `.env` y completa los valores necesarios.

5. **Iniciar Servidor**:
   ```bash
   npm start
   ```

---

## 📚 **Estructura del Proyecto**

```plaintext
Omega-API-REST/
├── controllers/       # Lógica principal de cada funcionalidad
├── middleware/        # Funciones intermedias para validaciones y manejo de solicitudes
├── models/            # Conexión y consultas a la base de datos
├── routes/            # Definición de rutas para la API
├── uploads/           # Almacenamiento de archivos subidos
├── utils/             # Funciones auxiliares (ej. generación de códigos)
├── db/                # Scripts para la base de datos
├── .env.example       # Ejemplo de configuración de entorno
└── server.js          # Punto de entrada del servidor
```

---

## 📦 **Dependencias Clave**

- **Express**: Framework para manejar rutas y solicitudes HTTP.
- **Multer**: Middleware para manejar subida de archivos.
- **Bcrypt.js**: Cifrado de contraseñas.
- **jsonwebtoken**: Generación y verificación de JWT.
- **Nodemailer**: Envío de correos electrónicos.
- **pg**: Cliente de PostgreSQL para Node.js.
- **node-cron**: Programación de tareas automáticas.
- **sequelize**: ORM para manejo de base de datos.
- **google-auth-library**: Verificación de tokens de Google OAuth 🆕.

---

## 🔐 **Autenticación con Google OAuth**

El sistema ahora soporta autenticación con Google OAuth además del método tradicional.

### **Configuración Rápida**

1. **Variables de entorno**:
   ```bash
   GOOGLE_CLIENT_ID=tu_google_client_id
   GOOGLE_CLIENT_SECRET=tu_google_client_secret
   ```

2. **Configurar base de datos**:
   ```bash
   node scripts/configurar_google_oauth.js
   ```

### **Endpoints Disponibles**

- `POST /usuarios/auth/google` - Login/Registro con Google
- `DELETE /usuarios/auth/google/unlink` - Desvincular cuenta Google

### **Documentación Completa**

📚 Ver [GOOGLE_OAUTH_README.md](./GOOGLE_OAUTH_README.md) para documentación detallada.

---

## 🛒 **Sistema de Reservas**

### **Nuevas APIs de Reservas**

| Método | Endpoint | Descripción | Autenticación |
|--------|----------|-------------|---------------|
| `GET` | `/productos/:id/stock` | Obtener stock en tiempo real | No |
| `POST` | `/productos/:id/reservar` | Reservar producto | Sí |
| `PUT` | `/productos/reserva/:id/confirmar` | Confirmar reserva | Sí |
| `DELETE` | `/productos/reserva/:id/cancelar` | Cancelar reserva | Sí |
| `GET` | `/productos/mis-reservas` | Ver mis reservas | Sí |

### **Características del Sistema de Reservas**

- ⏰ **Reservas Temporales**: 30 minutos de duración (configurable)
- 🔄 **Stock en Tiempo Real**: Actualización inmediata del inventario
- 🧹 **Limpieza Automática**: Job que limpia reservas expiradas cada 5 minutos
- 🛡️ **Validaciones**: Prevención de reservas duplicadas y validación de stock
- 📊 **Monitoreo**: Estadísticas y logs automáticos del sistema
- 🔐 **Seguridad**: Todas las operaciones requieren autenticación

### **Ejemplo de Uso**

```javascript
// Obtener stock actual
GET /productos/1/stock
Respuesta: {
  "producto_id": 1,
  "nombre_producto": "Reloj Omega",
  "stock_disponible": 15,
  "precio_producto": 299.99,
  "disponible": true
}

// Reservar producto
POST /productos/1/reservar
Headers: { "Authorization": "Bearer <token>" }
Body: { "cantidad": 2 }
Respuesta: {
  "message": "Producto reservado exitosamente",
  "reserva": {
    "reserva_id": 123,
    "cantidad_reservada": 2,
    "fecha_expiracion": "2025-06-27T15:30:00.000Z"
  }
}
```

### **Pruebas del Sistema**

```bash
# Ejecutar pruebas automáticas
node test_reservas.js

# Ver ejemplo de frontend
# Abrir: frontend-ejemplo/reservas-ejemplo.html
```

---

## 🔧 **Scripts Disponibles**

| Script | Comando | Descripción |
|--------|---------|-------------|
| Iniciar servidor | `npm start` | Inicia el servidor en producción |
| Desarrollo | `npm run dev` | Inicia con nodemon (auto-restart) |
| Limpiar e iniciar | `./scripts/start-server.sh` (macOS) / `.\scripts\start-server.bat` (Windows) | Limpia procesos y inicia servidor |
| Crear tabla reservas | `node scripts/crear_tabla_reservas.js` | Configura la BD de reservas |
| Probar reservas | `node test/test_reservas.js` | Ejecuta pruebas del sistema |
| Ejecutar tests | `npm test` | Ejecuta suite de Jest |

