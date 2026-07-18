# Security

## Authentication

- **JWT** signed with `JWT_SECRET` (HS256 by default). Payload: `{ userId, rol }` only.
- Expiration: `JWT_EXPIRES_IN` (default `1h`).
- Tokens are read from either `Authorization: Bearer <token>` or `x-auth-token: <token>`.
- Google OAuth supported as an alternative login (`POST /usuarios/auth/google`).
- Account unlinking requires a local password (`RequirePasswordError` 400 if missing).

## Authorization

- `authMiddleware` rejects any request without a valid JWT (401).
- `verificarRolAdmin` rejects non-admin requests to admin routes (403).
- Per-resource ownership is enforced inside services (`actualizarCita`, `eliminarReserva`, etc.) by filtering on `usuario_id`.

## Password handling

- Hashed with `bcryptjs` (cost 10).
- Minimum length: 8 characters (`authValidator.registroRules`).
- Reset flow uses a 6-digit code with 15-minute expiration (`restablecimiento_contrasena` table).

## Input validation

- `express-validator` on auth endpoints (`registroRules`, `loginRules`, `restablecer*`, `googleAuthRules`, `actualizarPerfilRules`).
- `productoRules` and `reservaRules` for products/reservations.
- `commonValidator.idParam` for `:id` path params (positive integer).
- `commonValidator.fechaISOQuery` for date query params.
- `express.json({ limit: '1mb' })` prevents oversized payloads.

## Rate limiting

| Limiter | Window | Max | Scope |
|---|---|---|---|
| `authLimiter` | 15 min | 20 | `/usuarios/login`, `/usuarios/auth/google`, `/usuarios/register`, `/usuarios/restablecer-solicitud` |
| `reservasLimiter` | 1 min | 30 | `POST /productos/:id/reservar` |
| `chatLimiter` | 1 min | 10 | `/chat` |
| `disponibilidadLimiter` | 1 min | 60 | `/disponibilidad/publicas*` |

Standard 429 response: `{ message: 'Demasiadas solicitudes, intente más tarde.', code: 'RATE_LIMITED' }`.

## Security headers (helmet)

```js
helmet({
  contentSecurityPolicy: false,           // JSON API; not a document
  crossOriginEmbedderPolicy: false,       // allows cross-origin uploads
  crossOriginResourcePolicy: { policy: 'cross-origin' }  // images servable cross-origin
})
```

This applies: `X-Content-Type-Options: nosniff`, `X-Frame-Options: SAMEORIGIN`, `Strict-Transport-Security`, `Referrer-Policy`, `X-DNS-Prefetch-Control`, `Origin-Agent-Cluster`.

## CORS

- Origins from `CORS_ORIGINS` env (CSV). Default `http://localhost:5173`.
- Credentials enabled (cookies if used in future).
- Methods: `GET, POST, PUT, DELETE, OPTIONS`.
- Headers: `Content-Type, Authorization, x-auth-token`.

## File uploads

- `multerProducto.js`: stored under `uploads/productos/` with random filename.
- `multerConfig.js`: stored temporarily in `uploads/temp/`, then moved to `uploads/usuario-<id>/perfil/foto_perfil.png`.
- Type whitelist: jpeg, jpg, png, gif.
- Size limit: 5 MB.
- `multerErrorHandler` translates `MulterError` codes to 413/400.

## Database

- Raw `pg` with parameterized queries (no string interpolation → no SQL injection).
- Transactions for multi-step operations (`withTransaction` in `utils/db.js`).
- Idempotent migrations with `IF NOT EXISTS` clauses.

## Health & observability

- `GET /ping` — liveness probe.
- `GET /health/db` — DB connectivity check (200 if up, 503 if down).
- `requestLogger` writes HTTP logs to Winston (rotating files + console).
- Errors are logged with stack via `errorHandler` middleware.

## Process lifecycle

- `server.js` handles `SIGTERM` / `SIGINT` with graceful shutdown (closes server, then pool, with 10s force-exit timeout).
- `uncaughtException` and `unhandledRejection` are logged and exit (production).

## Known limitations / TODO

- No refresh tokens; users must re-login after `JWT_EXPIRES_IN`.
- No account lockout on repeated failed logins (rate limit gives basic protection).
- No password breach check (HaveIBeenPwned).
- HTTPS termination expected at the load balancer / reverse proxy (not handled here).
- HTML content in `testimonios`, `publicaciones_blog`, `solicitudes_personalizacion` is not sanitized server-side.
