# Migrations

## Overview

All schema changes are tracked as versioned SQL files in `database/migrations/`. Files are named `NNNN_short_description.sql` and applied in lexicographic order.

## Commands

```bash
npm run migrate           # apply all pending migrations
npm run migrate:status    # show which migrations are applied / pending
npm run migrate:down      # attempt to roll back (manual SQL required; CLI aborts)
```

## Conventions

- **Idempotent**: every migration uses `IF NOT EXISTS`, `IF EXISTS`, or `DO $$ BEGIN ... EXCEPTION WHEN ... THEN ... END $$` blocks so it can be re-run safely.
- **Wrapped in transactions**: the runner wraps each migration in `BEGIN/COMMIT`. A failing migration rolls back automatically.
- **Tracked in `_migrations`**: each applied file is recorded with name and timestamp.
- **English**: comments, identifiers, and file names are in English.
- **No data migrations**: schema-only. Backfills go in `database/seeds/`.

## File anatomy

```sql
-- 0009_disponibilidad_citas.sql
-- Time slots admins publish for users to book appointments.

DO $$ BEGIN
    CREATE TYPE estado_disponibilidad AS ENUM ('disponible', 'ocupada', 'cancelada');
EXCEPTION
    WHEN duplicate_object THEN NULL;
END $$;

CREATE TABLE IF NOT EXISTS disponibilidad_citas (
    disponibilidad_id SERIAL PRIMARY KEY,
    ...
);

CREATE INDEX IF NOT EXISTS idx_disponibilidad_fecha ON disponibilidad_citas(fecha);
```

## Adding a new migration

1. Pick the next sequence number: `ls database/migrations/ | sort | tail -1`.
2. Create `database/migrations/NNNN_description.sql`.
3. Make it idempotent (`IF NOT EXISTS`, etc.).
4. Run `npm run migrate` to apply.
5. Verify with `npm run migrate:status`.

## Rolling back

Down migrations are **not automated**. To roll back:

1. Write a reverse SQL manually.
2. Run it against the DB.
3. `DELETE FROM _migrations WHERE name = 'NNNN_description.sql';`

## Testing

`test/migraciones.test.js` validates that all migrations apply cleanly on a fresh DB and are idempotent. Tests that depend on a DB connection will skip automatically if no DB is available (see `test/helpers/dbCheck.js`).

## When to add a migration

- New table
- New column (use `ADD COLUMN IF NOT EXISTS`)
- New index
- Constraint change
- Type/enum change
- Function/trigger change

## When NOT to add a migration

- Test fixtures (use `database/seeds/dev.sql` or test factories)
- One-off data cleanup (write a script and run it manually)
