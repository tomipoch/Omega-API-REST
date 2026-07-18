# Plan de Remediación — Omega-API-REST

> Plan congelado y aprobado. Estado: **en ejecución**.

## Decisiones confirmadas

| # | Decisión |
|---|---|
| 1 | Eliminar scripts legacy directamente (sin wrappers deprecados). |
| 2 | Migrations en inglés. |
| 3 | Coverage threshold: 60%. |
| 4 | Helmet: `CSP off`, `COEP off`, `CORP cross-origin`. |
| 5 | Sin CI; solo ejecución local. |
| 6 | OpenAPI ahora (Fase 4). |
| 7 | `utils/estados.js` ahora (Fase 3). |
| 8 | `/health/db` ahora (Fase 0). |
| 9 | **0 breaking changes**: rutas, status codes y shape de respuesta intactos. |

## Arquitectura objetivo

```
Request → helmet → cors → body parser (1MB) → request logger
        → rate limiter (selectivo)
        → router → authMiddleware? → adminGuard?
                  → express-validator → multer?
                  → controller (asyncHandler + assert)
                  → service → model (raw pg, withTransaction)
                  → error handler central → JSON
```

```
Background:
  ReservaScheduler (cron */5m) → reservasModel.limpiarReservasExpiradas()
                              → reservaScheduler.generarEstadisticas()

  Migrations runner → database/migrations/NNNN_*.sql (idempotente)
```

## Estructura final del repo

```
Omega-API-REST/
├── .editorconfig                  NEW
├── .eslintrc.json                 NEW
├── .gitattributes                 NEW
├── .prettierrc                    NEW
├── database/
│   ├── pgPool.js
│   ├── schema.sql                 NEW
│   ├── migrations/                NEW
│   │   ├── 0001_initial.sql
│   │   ├── 0002_rename_faq_id.sql
│   │   ├── 0003_solicitudes_imagenes_separada.sql
│   │   ├── 0004_usuarios_google_oauth.sql
│   │   ├── 0005_usuarios_apellidos_foto.sql
│   │   ├── 0006_usuarios_ultimo_inicio_sesion.sql
│   │   ├── 0007_reservas.sql
│   │   ├── 0008_secciones_blog.sql
│   │   ├── 0009_disponibilidad_citas.sql
│   │   ├── 0010_kpi_indices.sql
│   │   └── runner.js
│   └── seeds/
│       └── dev.sql                opcional
├── docs/
│   ├── API.md                     NEW
│   ├── ARCHITECTURE.md            NEW
│   ├── MIGRATIONS.md              NEW
│   ├── SECURITY.md                NEW
│   ├── PLAN_REMIDIACION.md        NEW (este archivo)
│   ├── API_STATUS_CODES.md        contrato intacto
│   ├── GOOGLE_OAUTH_README.md
│   ├── SISTEMA_RESERVAS_README.md typo fix
│   └── FOTO_PERFIL_GOOGLE_OAUTH.md
├── middleware/
│   ├── authMiddleware.js
│   ├── errorHandler.js
│   ├── googleAuth.js
│   ├── multerConfig.js
│   ├── multerProducto.js
│   ├── rateLimiters.js            NEW
│   ├── requestLogger.js           NEW
│   ├── transporter.js
│   └── validators/
│       ├── authValidator.js       + actualizarPerfilRules
│       ├── commonValidator.js     NEW
│       └── productosValidator.js
├── models/                        ajustes Fase 2
├── services/                      ajustes Fase 2
├── controllers/                   ajustes Fase 2
├── routes/
├── utils/
│   ├── assert.js                  + idParam, fechaISO
│   ├── asyncHandler.js
│   ├── db.js                      NEW: withTransaction
│   ├── env.js                     NEW
│   ├── errors.js
│   ├── estados.js                 NEW
│   ├── logger.js                  + transports archivo
│   ├── multerErrorHandler.js
│   ├── pagination.js              NEW
│   ├── responseShape.js           NEW
│   └── reservaScheduler.js
├── scripts/
│   ├── check-processes.sh
│   ├── migrations-status.js       NEW
│   └── start-server.sh
│   # ELIMINADOS:
│   # - crear_tabla_reservas.js
│   # - configurar_google_oauth.js
│   # - agregar_google_oauth.sql
│   # - start-nodemon.bat
│   # - start-oauth-server.ps1
│   # - start-server.bat
├── test/
│   ├── setup.js                   NEW
│   ├── app.test.js
│   ├── auth.test.js               NEW
│   ├── blog.test.js               NEW
│   ├── citas.test.js              NEW
│   ├── disponibilidad.test.js     NEW
│   ├── eventos.test.js
│   ├── faq.test.js                NEW
│   ├── kpi.test.js                NEW
│   ├── migraciones.test.js        NEW
│   ├── openapi.test.js            NEW
│   ├── personalizacion.test.js    NEW
│   ├── productos.test.js          NEW
│   ├── reservas.test.js           NEW
│   ├── testimonios.test.js        NEW
│   ├── usuarios.test.js           renombrado desde usuarios.js
│   └── helpers/
│       ├── truncateAll.js         NEW
│       └── factories.js           NEW
├── app.js                         ajustes Fase 0/3
├── server.js                      + graceful shutdown
├── swagger.js                     NEW
├── jest.config.js                 NEW
├── AGENTS.md                      ampliado
├── README.md                      actualizado
└── package.json                   scripts + deps
```

## Dependencias

**Añadir (devDependencies)**: `eslint`, `eslint-config-airbnb-base` (o `eslint:recommended`), `eslint-plugin-import`, `eslint-plugin-node`, `prettier`, `eslint-config-prettier`, `husky`, `lint-staged`, `swagger-jsdoc`, `swagger-ui-express`, `morgan`, `envalid`, `madge`.

**Quitar**: `passport`, `passport-google-oauth20`, `passport-jwt`, `sequelize`, `safer-buffer`.

**Scripts nuevos**:
```json
{
  "main": "server.js",
  "scripts": {
    "start": "node server.js",
    "dev": "nodemon server.js",
    "test": "jest",
    "test:watch": "jest --watch",
    "test:coverage": "jest --coverage",
    "lint": "eslint .",
    "lint:fix": "eslint . --fix",
    "format": "prettier --write .",
    "format:check": "prettier --check .",
    "migrate": "node database/migrations/runner.js up",
    "migrate:status": "node scripts/migrations-status.js",
    "migrate:down": "node database/migrations/runner.js down",
    "check:circular": "madge --circular models services controllers middleware utils"
  }
}
```

## Fase 0 — Tooling, app.js, server.js, env validation

| Archivo | Cambio |
|---|---|
| `app.js` | `helmet({ contentSecurityPolicy:false, crossOriginEmbedderPolicy:false, crossOriginResourcePolicy:{policy:'cross-origin'} })`. `express.json({ limit:'1mb' })`. Rate limiters extraídos a `middleware/rateLimiters.js`. Añadir `GET /health/db`. Swagger UI en `/api-docs`. Request logger global (excepto `/api-docs`, `/uploads`, `/health/db`, `/ping`). |
| `server.js` | `require('./utils/env')` al inicio (falla rápido). Handlers `uncaughtException` / `unhandledRejection` → `logger.error` + exit 1. Graceful shutdown en `SIGTERM`/`SIGINT`. |
| `utils/env.js` | Valida con `envalid`: `PORT`, `NODE_ENV`, `JWT_SECRET` (min 32), `JWT_EXPIRES_IN`, `DB_*`, `EMAIL_*`, `GOOGLE_CLIENT_ID`, `AI_*`, `CORS_ORIGINS`, `BASE_URL`. |
| `utils/logger.js` | Mantener consola. Añadir `transports.File` para `combined.log` y `error.log` si `NODE_ENV !== 'test'`. |
| `test/setup.js` | `NODE_ENV=test`. Mock de `ReservaScheduler.iniciar()`. Expone `global.testPool`. |
| `jest.config.js` | `testEnvironment:'node'`, `setupFilesAfterEach`, `testMatch:['**/test/**/*.test.js']`, `coverageThreshold.global.lines:60,branches:50,functions:60,statements:60`. |
| ESLint | `extends: ['eslint:recommended', 'plugin:node/recommended']`. `no-console:warn`, `consistent-return`, `prefer-const`. |
| Prettier | `singleQuote:true, semi:true, trailingComma:'es5', printWidth:100, tabWidth:2`. |
| `.editorconfig` | `end_of_line:lf, insert_final_newline:true, indent_style:space, indent_size:2`. |

## Fase 1 — Migrations versionadas

**Runner (`database/migrations/runner.js`)**: tabla `_migrations`, comandos `up`/`down`/`status`. Cada migration en transacción + idempotencia.

| # | Archivo | Contenido |
|---|---|---|
| 0001 | `0001_initial.sql` | Tablas base: roles, estados, usuarios (con apellido_paterno/materno, foto_perfil_url, telefono, direccion; google_id y ultimo_inicio_sesion nullable), auditoria_seguridad, citas, eventos, inscripciones_eventos, publicaciones_blog, preguntas_frecuentes (PK `faq_id`), restablecimiento_contrasena, servicios, solicitudes_personalizacion, testimonios. FKs y CHECK constraints mínimos. Trigger `actualizar_fecha_modificacion()`. |
| 0002 | `0002_rename_faq_id.sql` | Renombra `pregunta_id` → `faq_id`. Columna `estado_id` FK a `estados`. |
| 0003 | `0003_solicitudes_imagenes_separada.sql` | Crea `solicitudes_imagenes`. Migra desde `imagen_url[]` si existía. |
| 0004 | `0004_usuarios_google_oauth.sql` | `google_id` UNIQUE + índice + `contrasena DROP NOT NULL`. |
| 0005 | `0005_usuarios_apellidos_foto.sql` | Backup para BD legacy. |
| 0006 | `0006_usuarios_ultimo_inicio_sesion.sql` | `ADD COLUMN IF NOT EXISTS ultimo_inicio_sesion TIMESTAMPTZ NULL`. |
| 0007 | `0007_reservas.sql` | Tabla reservas + índices + trigger. |
| 0008 | `0008_secciones_blog.sql` | `secciones_blog(publicacion_id, subtitulo, contenido, orden)`. |
| 0009 | `0009_disponibilidad_citas.sql` | ENUM + tabla + FK + índices + trigger. |
| 0010 | `0010_kpi_indices.sql` | Índices de soporte. |

**Schema canónico**: `database/schema.sql` (snapshot consolidado).

**Eliminaciones Fase 1/5**: `scripts/crear_tabla_reservas.js`, `scripts/configurar_google_oauth.js`, `scripts/agregar_google_oauth.sql`.

**Tests**: `test/migraciones.test.js` (idempotencia + schema esperado), `test/helpers/truncateAll.js`.

## Fase 2 — Inconsistencias de código

| Archivo | Cambio |
|---|---|
| `models/faqModel.js` | `pregunta_id` → `faq_id` (3 queries). |
| `models/personalizacionModel.js` | Solo `solicitudes_imagenes`; sin `imagen_url text[]`. |
| `models/eventosModel.js` | `inscribirEvento` atómico: `INSERT ... ON CONFLICT (evento_id, usuario_id) DO NOTHING RETURNING *`. |
| `models/citasModel.js` | `actualizarCita` sin `COALESCE($1, NOW())`; SQL dinámico en servicio. |
| `models/reservasModel.js` | `confirmarReserva` con `withTransaction`. |
| `models/blogModel.js` | `crearPublicacion+crearSecciones` y `actualizarPublicacion+eliminarSecciones+crearSecciones` con `withTransaction`. |
| `services/reservasService.js` | Importa `models/productosModel` directo (elimina ciclo). |
| `services/authService.js` | Llama `actualizarUltimoInicioSesion` tras login y Google auth. |
| `models/usuariosModel.js` | Nuevo método `actualizarUltimoInicioSesion`. |
| `services/chatbotService.js` | `require` al top + timeout handling. |
| `test/usuarios.js` → `test/usuarios.test.js` | Renombrar para Jest. |
| `docs/SISTEMA_RESERVAS_README.md` | Typo `reservaModel.js` → `reservasModel.js`. Comandos actualizados. |
| `README.md` | Quitar "sequelize" de deps. Actualizar estructura. |
| `package.json` | `"main": "server.js"`. Quitar deps no usadas. |

## Fase 3 — Endurecimiento de seguridad

### Validación numérica universal
- `utils/assert.js`: `idParam(req, name='id')`.
- `middleware/validators/commonValidator.js`: `idParam` con `param('id').isInt({min:1})`.
- Aplicar en TODOS los routers con `:id`.

### Rate limiters selectivos
- `middleware/rateLimiters.js`:
  - `authLimiter` (20/15min).
  - `reservasLimiter` (30/min).
  - `chatLimiter` (10/min).
  - `disponibilidadLimiter` (60/min).
- Mensaje `{ message:'Demasiadas solicitudes.', code:'RATE_LIMITED' }`.

### Request logger
- `middleware/requestLogger.js`: `morgan('combined', { stream })`. Excluir `/api-docs`, `/uploads`, `/health/db`, `/ping`.

### Sanitización fechas
- `commonValidator.fechaISO(field)` para query params de `disponibilidadRoutes` y `reporteRoutes`.

### `/health/db`
- `GET /health/db → { db:'up'|'down', latency_ms } (200 o 503)`.

### Validación perfil
- `authValidator.actualizarPerfilRules` en `PUT /usuarios/perfil`.

### `utils/estados.js`
```js
module.exports = {
  RESERVA: { ACTIVA:'activa', CONFIRMADA:'confirmada', CANCELADA:'cancelada', EXPIRADA:'expirada' },
  TESTIMONIO: { PENDIENTE:'Pendiente', APROBADO:'Aprobado', CONFIRMADO:'Confirmado', CANCELADO:'Cancelado' },
  DISPONIBILIDAD: { DISPONIBLE:'disponible', OCUPADA:'ocupada', CANCELADA:'cancelada' },
  PERSONALIZACION: { PENDIENTE:'pendiente', ACEPTAR:'aceptar', RECHAZAR:'rechazar' }
};
```
Refactor: `models/testimoniosModel.js`, `models/disponibilidadModel.js`, `models/personalizacionModel.js`, `models/reservasModel.js`, `services/testimoniosService.js` consumen constantes.

### Helmet
- `app.js`: `contentSecurityPolicy:false, crossOriginEmbedderPolicy:false, crossOriginResourcePolicy:{policy:'cross-origin'}`.

## Fase 4 — Calidad, logs, OpenAPI, tests

### OpenAPI / Swagger
- `swagger.js`: usa `swagger-jsdoc`. Spec OpenAPI 3.0.
- JSDoc en controllers clave (`usuariosController`, `productosController`, `citasController`).
- `app.js`: `app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(spec))`.
- `test/openapi.test.js`: valida spec parseable + paths clave.

### Tests faltantes (60% coverage)

| Archivo | Cobertura |
|---|---|
| `test/auth.test.js` | register, login, reset, Google con mock |
| `test/reservas.test.js` | reservar, confirmar, cancelar, expiración |
| `test/blog.test.js` | CRUD + secciones |
| `test/citas.test.js` | CRUD + bug fix |
| `test/disponibilidad.test.js` | admin CRUD, públicas |
| `test/faq.test.js` | CRUD con `faq_id` |
| `test/kpi.test.js` | resumen + agregaciones |
| `test/personalizacion.test.js` | CRUD + imágenes |
| `test/productos.test.js` | CRUD + stock |
| `test/testimonios.test.js` | CRUD + aceptar/rechazar |
| `test/migraciones.test.js` | idempotencia |
| `test/openapi.test.js` | spec parseable |

`test/helpers/factories.js`: builders de seed.

### Documentación
- `docs/ARCHITECTURE.md`: capas, patrones, decisiones.
- `docs/MIGRATIONS.md`: cómo crear/rollback.
- `docs/SECURITY.md`: controles aplicados.
- `docs/API.md`: referencia + link a `/api-docs`.
- `AGENTS.md`: secciones "How to add endpoint/model/test/migration".

### Graceful shutdown (Fase 0)
- `SIGTERM`/`SIGINT` → `server.close()` → `pool.end()` → exit 0.

## Fase 5 — Cleanup

| Acción |
|---|
| Borrar `scripts/crear_tabla_reservas.js`, `scripts/configurar_google_oauth.js`, `scripts/agregar_google_oauth.sql`, `scripts/start-nodemon.bat`, `scripts/start-oauth-server.ps1`, `scripts/start-server.bat`. |
| Borrar `combined.log`, `error.log` legacy. |
| `package.json`: `"main": "server.js"`. Quitar `passport*`, `sequelize`, `safer-buffer`. |
| `README.md`: actualizar estructura, comandos, stack. |
| `AGENTS.md`: comandos y convenciones finales. |

## Plan de ejecución (commits sugeridos)

| # | Commit | Archivos clave | Riesgo |
|---|---|---|---|
| 0 | `chore: tooling` | config + env + jest + setup | bajo |
| 1 | `chore: app.js helmet/limits, /health/db, logger, rate limiters` | `app.js`, `server.js`, `middleware/*` | bajo |
| 2 | `chore(schema): runner + 0001_initial` | `database/migrations/*` | medio |
| 3 | `chore(schema): migrations 0002..0010` | migrations | medio |
| 4 | `chore: remove legacy scripts` | deletions | bajo |
| 5 | `fix: align code with schema (faq_id, solicitudes_imagenes)` | models | medio |
| 6 | `fix: citas actualizar without COALESCE-NOW` | `models/citasModel.js` | bajo |
| 7 | `fix: eventos inscripcion atómica` | `models/eventosModel.js` | bajo |
| 8 | `refactor: withTransaction helper` | `utils/db.js`, models | bajo |
| 9 | `feat: update ultimo_inicio_sesion on login` | models, services | bajo |
| 10 | `refactor: utils/estados.js + apply` | `utils/estados.js` | bajo |
| 11 | `feat(security): idParam validation` | routers, validators | medio |
| 12 | `feat(security): rate limiters` | `middleware/rateLimiters.js` | bajo |
| 13 | `feat(security): sanitize fechas + actualizarPerfilRules` | validators | bajo |
| 14 | `chore(deps): remove passport, sequelize, safer-buffer` | `package.json` | bajo |
| 15 | `test: rename usuarios.js → usuarios.test.js` | renames | bajo |
| 16 | `test: missing suites` | `test/**` | medio |
| 17 | `test: migraciones + openapi suites` | tests | bajo |
| 18 | `feat: OpenAPI / swagger-ui` | `swagger.js`, `app.js` | bajo |
| 19 | `chore: package.json main → server.js` | `package.json` | bajo |
| 20 | `docs: ARCHITECTURE / MIGRATIONS / SECURITY / API.md + AGENTS.md` | docs | bajo |
| 21 | `chore: cleanup legacy logs` | deletions | bajo |

## Checklist de aceptación

### Build & infra
- [ ] `npm install` sin warnings críticos.
- [ ] BD limpia + `npm run migrate` → 10 applied.
- [ ] `npm run migrate` segunda vez → 0 pending.
- [ ] `npm start` arranca; falla si falta `JWT_SECRET`.
- [ ] `SIGTERM` → shutdown limpio.

### Calidad
- [ ] `npm run lint` 0 errores.
- [ ] `npm run format:check` sin diff.
- [ ] `npm run check:circular` 0 ciclos.
- [ ] `npm run test:coverage` ≥ 60% lines / 50% branches / 60% functions.
- [ ] `grep -r "pregunta_id" models/ controllers/ services/ routes/` → 0.
- [ ] `grep -r "sequelize\|passport\|safer-buffer" package.json` → 0.

### Seguridad
- [ ] `curl -I localhost:4000/productos` muestra `Cross-Origin-Resource-Policy: cross-origin`, sin `Content-Security-Policy`.
- [ ] `curl -I localhost:4000/health/db` → 200 con BD up, 503 con BD down.
- [ ] Ráfaga de 31 reservas/min → 429.
- [ ] `PUT /usuarios/perfil/:abc` → 400 (`idParam`).
- [ ] `POST /citas` con body vacío → 422.

### API pública
- [ ] `docs/API_STATUS_CODES.md` sin cambios.
- [ ] Todas las rutas existentes responden en mismos paths con mismos status codes.
- [ ] `curl localhost:4000/api-docs` renderiza spec navegable.
- [ ] `curl localhost:4000/api-docs-json` devuelve JSON OpenAPI válido.

### Documentación
- [ ] `README.md` actualizado.
- [ ] `AGENTS.md` documenta convenciones y cómo agregar.
- [ ] `docs/ARCHITECTURE.md`, `docs/MIGRATIONS.md`, `docs/SECURITY.md`, `docs/API.md` existen.

## Resumen ejecutivo

| Métrica | Valor |
|---|---|
| Fases | 6 (0–5) |
| Commits sugeridos | 22 |
| Archivos nuevos | ~38 |
| Archivos modificados | ~30 |
| Archivos eliminados | 6 |
| Dependencias añadidas | 11 (dev) |
| Dependencias quitadas | 5 |
| Tests añadidos | ~12 archivos |
| Riesgo global | medio-bajo |
| Cobertura objetivo | 60% |
| Breaking changes | 0 |
