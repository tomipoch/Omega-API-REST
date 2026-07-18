# Architecture

## Overview

Omega-API-REST is a Node.js/Express REST API for a jewelry store. It uses PostgreSQL via the raw `pg` driver (no ORM), JWT authentication, and follows a layered MVC + services architecture.

## Layers

```
┌─────────────────────────────────────────────────────────┐
│ HTTP Request                                            │
└────────────────────────┬────────────────────────────────┘
                         ▼
┌─────────────────────────────────────────────────────────┐
│ Express Middleware Stack                                │
│   helmet → cors → requestLogger → rate limiter          │
│   → body parser → auth? → admin?                        │
└────────────────────────┬────────────────────────────────┘
                         ▼
┌─────────────────────────────────────────────────────────┐
│ Router (routes/*.js)                                    │
│   • mounts controllers                                  │
│   • applies per-route validators (idParam, fechaISO)    │
│   • applies multer for file uploads                     │
└────────────────────────┬────────────────────────────────┘
                         ▼
┌─────────────────────────────────────────────────────────┐
│ Controller (controllers/*.js)                           │
│   • thin HTTP adapter                                   │
│   • uses asyncHandler to forward errors                 │
│   • maps req → service call                             │
└────────────────────────┬────────────────────────────────┘
                         ▼
┌─────────────────────────────────────────────────────────┐
│ Service (services/*.js)                                 │
│   • business logic                                      │
│   • transactional orchestration (withTransaction)        │
│   • throws AppError subtypes                            │
└────────────────────────┬────────────────────────────────┘
                         ▼
┌─────────────────────────────────────────────────────────┐
│ Model (models/*.js)                                     │
│   • raw SQL queries via pg pool                         │
│   • one file per table/feature                          │
│   • no business logic                                   │
└────────────────────────┬────────────────────────────────┘
                         ▼
┌─────────────────────────────────────────────────────────┐
│ PostgreSQL                                              │
└─────────────────────────────────────────────────────────┘
```

## Key Patterns

### Error handling
- Custom `AppError` hierarchy in `utils/errors.js` (NotFound, Unauthorized, Forbidden, Conflict, Validation, RequirePassword).
- `asyncHandler(fn)` wraps controllers; rejects forward to `errorHandler` middleware.
- `errorHandler` maps `AppError` instances to JSON responses and translates PG error codes (`23503`, `23505`).

### Transactions
- `utils/db.js` exposes `withTransaction(fn)` which:
  1. acquires a pool client
  2. `BEGIN`
  3. calls `fn(client)` (passes client so model can use the same connection)
  4. `COMMIT` or `ROLLBACK` on error
  5. releases the client

Used for: reservas (reservar, confirmar, cancelar, limpiar), blog (crear con secciones, actualizar con secciones), eventos inscription (atomic via `ON CONFLICT`).

### Validation
- `express-validator` for body validation (`middleware/validators/`).
- `utils/assert.js` for runtime checks (`positiveInt`, `idParam`, `fechaISO`).
- `commonValidator.idParam(name)` validates path params as positive integers.

### State names
- All status names live in `utils/estados.js` as frozen constants:
  - `RESERVA`: activa, confirmada, cancelada, expirada
  - `TESTIMONIO`: Pendiente, Aprobado, Confirmado, Cancelado
  - `DISPONIBILIDAD`: disponible, ocupada, cancelada
  - `PERSONALIZACION`: pendiente, aceptar, rechazar
  - `CITAS_ESTADOS_NOMBRE`: pendiente, confirmada, cancelada, rechazada

### Logging
- `utils/logger.js` (Winston) writes to console + (rotating) files outside test mode.
- `middleware/requestLogger.js` uses `morgan` to stream HTTP logs to Winston, skipping `/api-docs`, `/uploads`, `/health/db`, `/ping`.

### Security headers
- `helmet()` with `contentSecurityPolicy:false, crossOriginEmbedderPolicy:false, crossOriginResourcePolicy:'cross-origin'`.
- CORS origin allowlist from `CORS_ORIGINS` env (comma-separated).
- Rate limiters on auth, reservas, chat, and disponibilidad public endpoints.
- `express.json({ limit: '1mb' })`.

### Migrations
- `database/migrations/runner.js` reads `NNNN_*.sql` files in order, applies each in a transaction, records in `_migrations`.
- Migrations are idempotent (use `IF NOT EXISTS`, `DO $$ BEGIN ... EXCEPTION ... END $$`).
- New migrations append to the end of the directory.

### Env validation
- `utils/env.js` validates required vars (`DB_HOST`, `DB_USER`, `DB_NAME`, `DB_PORT`, `JWT_SECRET`) on import.
- In production, missing `JWT_SECRET` (< 32 chars) causes immediate exit.

### OpenAPI
- `swagger.js` builds an OpenAPI 3.0 spec via `swagger-jsdoc`.
- Endpoints are listed manually (when no JSDoc is present) so `/api-docs` always renders a navigable spec.
- `/api-docs` (Swagger UI) and `/api-docs-json` (raw spec) are mounted in `app.js`.

## File layout

```
app.js                    Express app: middleware, routes, error handler
server.js                 Bootstrap: env, server.listen, graceful shutdown
swagger.js                OpenAPI spec
database/pgPool.js        pg.Pool singleton
database/migrations/      Versioned SQL migrations + runner.js
models/                   Raw SQL per feature (no business logic)
services/                 Business logic; orchestrates models in transactions
controllers/              Thin HTTP adapters (req → service → res)
routes/                   Express routers + per-route validators
middleware/               Cross-cutting: auth, multer, helmet helpers, rate limiters, validators
utils/                    Shared helpers: env, logger, errors, db, estados, pagination, asyncHandler, assert
test/                     Jest tests; *.test.js (auto-discovered)
docs/                     Architecture, migrations, security, plan
```
