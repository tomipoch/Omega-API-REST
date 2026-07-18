# Omega-API-REST

Node.js/Express REST API for a jewelry store. PostgreSQL with raw `pg` queries. MVC architecture with services layer.

## Entry Point
- `server.js` is the single entry point (loads `app.js`, starts scheduler, listens, handles graceful shutdown)
- `app.js` defines Express app, routes, and middleware (no `listen`, no DB sync)

## Commands

| Command | Purpose |
|---|---|
| `npm start` | Production server |
| `npm run dev` | Development with nodemon auto-restart |
| `npm test` | Run Jest tests |
| `npm run test:coverage` | Run tests with coverage report |
| `npm run lint` | ESLint check |
| `npm run lint:fix` | ESLint auto-fix |
| `npm run format` | Prettier write |
| `npm run format:check` | Prettier check |
| `npm run migrate` | Apply pending DB migrations |
| `npm run migrate:status` | Show migration status |
| `npm run check:circular` | Detect circular dependencies |
| `node scripts/migrations-status.js` | CLI wrapper around migrate:status |

## Architecture

```
HTTP → helmet → cors → requestLogger → rate limiter (selectivo)
     → router → authMiddleware? → adminGuard?
              → express-validator → multer?
              → controller (asyncHandler + assert)
              → service → model (raw pg, withTransaction)
              → error handler central → JSON
```

See `docs/ARCHITECTURE.md` for details.

## ORM

Raw `pg` (no Sequelize). Pool defined in `database/pgPool.js`. Migrations in `database/migrations/` applied via `npm run migrate`.

## MVC

- `models/` (raw SQL, one file per feature)
- `controllers/` (HTTP adapters; thin)
- `routes/` (Express routing)
- `services/` (business logic, transactional orchestration)

## Auth

- JWT-based; checks both `Authorization: Bearer <token>` and `x-auth-token` header.
- Most routes protected by `authMiddleware`; public: `/productos`, `/productos/:id/stock`, `/faq`, `/ping`, `/usuarios/auth/*`, `/usuarios/register`, `/usuarios/login`, `/usuarios/restablecer*`, `/health/db`, `/disponibilidad/publicas`.
- Admin routes additionally protected by `verificarRolAdmin`.
- `JWT_EXPIRES_IN` is read from env (default `1h`); payload contains `userId` and `rol` only.
- Google OAuth available via `POST /usuarios/auth/google`.

## Reservation System

- 30-minute reservation expiration.
- Cron job runs every 5 minutes to clean expired reservations (`reservaScheduler.iniciar()` in `server.js`).
- Stock is decremented on reservation, restored on cancellation/expiry (atomic transactions via `withTransaction`).
- Max 10 units per reservation.

## Health & Observability

- `GET /ping` — liveness probe.
- `GET /health/db` — DB connectivity (200/503).
- `GET /api-docs` — Swagger UI (OpenAPI 3.0).
- `GET /api-docs-json` — raw OpenAPI spec.

## Security

- `helmet` for security headers (CSP off, COEP off, CORP cross-origin — JSON API).
- `express-rate-limit` on auth, reservas, chat, and disponibilidad public endpoints.
- CORS configurable via `CORS_ORIGINS` env (CSV).
- `express-validator` on registration, login, reset, Google auth, products, reservations, profile.
- `foto_perfil_url` removed from JWT payload (read from DB on demand).

See `docs/SECURITY.md` for full details.

## Testing Notes

- Tests use Jest with `testMatch: ['**/test/**/*.test.js']`.
- DB-dependent tests skip automatically when no DB connection is available (`test/helpers/dbCheck.js`).
- `npm test` runs in `NODE_ENV=test` (configured in `test/setup.js`).
- `setup.js` mocks `ReservaScheduler.iniciar()` so cron does not run during tests.
- Coverage threshold: 60% lines / 50% branches / 60% functions (configured in `jest.config.js`).

## How to add an endpoint

1. **Add the SQL** (if a new table/column): create `database/migrations/NNNN_*.sql` and run `npm run migrate`.
2. **Add the model function** in `models/<feature>Model.js`.
3. **Add the service function** in `services/<feature>Service.js`. Use `withTransaction` for multi-step ops.
4. **Add the controller** in `controllers/<feature>Controller.js`. Wrap with `asyncHandler`.
5. **Wire the route** in `routes/<feature>Routes.js`. Use `idParam()` for `:id` paths and `handleValidation`.
6. **Add a test** in `test/<feature>.test.js`.

## How to add a migration

1. Find the next number: `ls database/migrations/ | sort | tail -1`.
2. Create `database/migrations/NNNN_description.sql`.
3. Make it idempotent (`IF NOT EXISTS`, `IF EXISTS`, or `DO $$ BEGIN ... EXCEPTION ... END $$`).
4. `npm run migrate`.

## Key Env Variables

See `.env.example` for the complete list. Required:

```
PORT=4000
DB_HOST, DB_PORT, DB_USER, DB_PASSWORD, DB_NAME
JWT_SECRET (min 32 chars in production)
JWT_EXPIRES_IN
EMAIL_USER, EMAIL_PASSWORD
GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET
CORS_ORIGINS
AI_BASE_URL, AI_API_KEY, AI_MODEL
```

## Migrations

See `docs/MIGRATIONS.md`.
