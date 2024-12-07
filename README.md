
# Omega-API-REST

Omega-API-REST es el backend para la página web de una relojería y joyería. Implementa una arquitectura Modelo-Vista-Controlador (MVC) organizada en **Controllers**, **Models**, y **Routes**, junto con **middleware** para diversas funcionalidades como:

- Manejo de autenticación con JWT.
- Creación dinámica de carpetas para almacenar archivos.
- Verificación de roles de usuario.
- Envío de correos electrónicos para notificaciones y restablecimiento de contraseñas.

---

## 📋 **Características**

- **Autenticación Segura**: Uso de JSON Web Tokens (JWT) para autenticar usuarios y proteger rutas.
- **Gestión de Usuarios**:
  - Registro, inicio de sesión y actualización de perfiles.
  - Carga de imágenes de perfil con recorte y almacenamiento en el servidor.
  - Eliminación de cuentas de usuario con confirmación.
- **Roles y Permisos**: Control de acceso basado en roles, como administrador o usuario.
- **Notificaciones por Correo**: Envío de correos electrónicos para restablecimiento de contraseñas y confirmaciones.
- **Almacenamiento de Archivos**: Uso de `multer` para subir y procesar imágenes.

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

4. **Importar BD a PostgreSQL**:
   Usa herramientas como `pgAdmin` o ejecuta directamente los scripts SQL en la carpeta `db/`.

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

