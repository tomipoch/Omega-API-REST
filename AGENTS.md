# Omega-API-REST

Node.js/Express REST API for a jewelry store. PostgreSQL with raw `pg` queries. MVC architecture.

## Entry Point
- `server.js` is the single entry point (loads `app.js`, starts scheduler, listens)
- `app.js` defines Express app, routes, and middleware (no `listen`, no DB sync)

## Commands
- `npm start` - Production server
- `npm run dev` - Development with nodemon auto-restart
- `npm test` - Run Jest tests
- `node scripts/crear_tabla_reservas.js` - Create reservations table
- `node scripts/configurar_google_oauth.js` - Configure Google OAuth

## Architecture
- ORM: raw `pg` (no Sequelize). Pool defined in `database/pgPool.js`.
- MVC: `models/` (raw SQL), `controllers/` (business logic), `routes/` (Express routing)
- Reservation logic in `models/reservasModel.js` (transactions `BEGIN/COMMIT/ROLLBACK`)

## Auth
- JWT-based; checks both `Authorization: Bearer <token>` and `x-auth-token` header
- Most routes protected by `authMiddleware`; public: `/productos`, `/productos/:id/stock`, `/faq`, `/ping`, `/usuarios/auth/*`, `/usuarios/register`, `/usuarios/login`, `/usuarios/restablecer*`
- Admin routes additionally protected by `verificarRolAdmin`
- `JWT_EXPIRES_IN` is read from env (default `1h`); payload contains `userId` and `rol` only

## Reservation System
- 30-min reservation expiration
- Cron job runs every 5 minutes to clean expired reservations (`reservaScheduler.iniciar()` in `server.js`)
- Stock is decremented on reservation, restored on cancellation/expiry (atomic transactions)
- Max 10 units per reservation

## Security
- `helmet` for security headers
- `express-rate-limit` on auth endpoints (20 req / 15 min)
- CORS configurable via `CORS_ORIGINS` env (CSV)
- `express-validator` on registration, login, reset, Google auth, products, reservations
- `foto_perfil_url` removed from JWT payload (read from DB on demand)

## CORS
- Configurable via `CORS_ORIGINS` env (comma-separated origins)
- Default: `http://localhost:5173`

## File Uploads
- Served static from `/uploads` directory
- `multerProducto.js` auto-creates `uploads/productos/` directory
- `multerConfig.js` (profile photos) uses temp folder

## Testing Notes
- Tests use database transactions with `BEGIN`/`ROLLBACK` (no data persists)
- Test file imports `app` directly, not `server.js`
- Tests use raw `pg` pool (`database/pgPool.js`)

## Key Env Variables
See `.env.example` for the complete list. Required:
```
PORT=4000
DB_HOST, DB_PORT, DB_USER, DB_PASSWORD, DB_NAME
JWT_SECRET
JWT_EXPIRES_IN
EMAIL_USER, EMAIL_PASSWORD
GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET
CORS_ORIGINS
```