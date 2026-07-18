# Omega-API-REST

Omega-API-REST es el backend para la página web de una relojería y joyería. Implementa una arquitectura Modelo-Vista-Controlador (MVC) organizada en **Controllers**, **Models**, y **Routes**, junto con **middleware** y **services** para diversas funcionalidades como:

- Manejo de autenticación con JWT.
- Carga de imágenes con multer.
- Verificación de roles de usuario.
- Envío de correos electrónicos.
- Sistema de reservas temporales con expiración automática.
- Reportes CSV/PDF.
- Documentación OpenAPI en `/api-docs`.

---

## Características

- **Autenticación Segura**: JSON Web Tokens (JWT).
- **Google OAuth**: Login/registro con cuentas Google; vinculación y desvinculación.
- **Gestión de Usuarios**: Registro, login, perfil, carga de foto, eliminación de cuenta.
- **Sistema de Reservas**: 30 min por defecto, expiración automática, stock atómico, máximo 10 unidades.
- **Roles y Permisos**: Control basado en roles (admin / usuario).
- **Notificaciones por Correo**: Restablecimiento de contraseña y confirmación de reservas.
- **Almacenamiento de Archivos**: multer para imágenes de perfil y productos.
- **Auditoría Completa**: Todas las acciones se registran.
- **Documentación OpenAPI**: Swagger UI en `/api-docs`.

---

## Requisitos Previos

- Node.js 18+
- PostgreSQL 13+
- npm

---

## Instalación

```bash
git clone https://github.com/tuusuario/Omega-API-REST.git
cd Omega-API-REST
npm install
cp .env.example .env
# Editar .env con tus credenciales
npm run migrate
npm start
```

---

## Estructura del Proyecto

```
Omega-API-REST/
├── app.js                    Express app
├── server.js                 Bootstrap + graceful shutdown
├── swagger.js                OpenAPI spec
├── jest.config.js
├── .eslintrc.json
├── .prettierrc
├── .editorconfig
├── database/
│   ├── pgPool.js
│   └── migrations/           Versioned SQL migrations
├── controllers/              Thin HTTP adapters
├── middleware/               auth, multer, validators, rate limiters
├── models/                   Raw SQL per feature
├── routes/                   Express routers
├── services/                 Business logic
├── utils/                    env, logger, errors, db, estados, etc.
├── test/                     *.test.js (auto-discovered)
└── docs/                     ARCHITECTURE, MIGRATIONS, SECURITY, API
```

---

## Dependencias Clave

- **Express**: Framework HTTP.
- **Multer**: Subida de archivos.
- **Bcrypt.js**: Hash de contraseñas.
- **jsonwebtoken**: JWT.
- **Nodemailer**: Email.
- **pg**: Cliente PostgreSQL.
- **node-cron**: Tareas programadas (limpieza de reservas).
- **google-auth-library**: Verificación de tokens Google.
- **openai**: Cliente IA (OpenAI-compatible).
- **swagger-jsdoc** + **swagger-ui-express**: OpenAPI.
- **morgan** + **winston**: HTTP logs.

---

## Scripts

| Script | Comando |
|---|---|
| Iniciar (prod) | `npm start` |
| Desarrollo (nodemon) | `npm run dev` |
| Tests | `npm test` |
| Tests con coverage | `npm run test:coverage` |
| Lint | `npm run lint` |
| Format | `npm run format` |
| Migraciones (aplicar) | `npm run migrate` |
| Estado de migraciones | `npm run migrate:status` |
| Verificar ciclos | `npm run check:circular` |

---

## Documentación Adicional

- [docs/API.md](docs/API.md) — referencia rápida + link a `/api-docs`
- [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md) — capas, patrones, decisiones
- [docs/MIGRATIONS.md](docs/MIGRATIONS.md) — cómo crear migrations
- [docs/SECURITY.md](docs/SECURITY.md) — controles de seguridad
- [docs/API_STATUS_CODES.md](docs/API_STATUS_CODES.md) — códigos HTTP por endpoint
- [docs/SISTEMA_RESERVAS_README.md](docs/SISTEMA_RESERVAS_README.md) — sistema de reservas
- [docs/GOOGLE_OAUTH_README.md](docs/GOOGLE_OAUTH_README.md) — Google OAuth
- [docs/PLAN_REMIDIACION.md](docs/PLAN_REMIDIACION.md) — plan de remediación ejecutado

---

## Health checks

- `GET /ping` → `{ message: 'pong' }`
- `GET /health/db` → `{ db: 'up', latency_ms: N }` (200 / 503)
- `GET /api-docs` → Swagger UI