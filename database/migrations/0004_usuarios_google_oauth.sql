-- 0004_usuarios_google_oauth.sql
-- Add google_id column for Google OAuth support.
-- google_id is already declared in 0001; this migration is kept for legacy
-- databases that pre-date that column.

ALTER TABLE usuarios
    ADD COLUMN IF NOT EXISTS google_id VARCHAR(255);

CREATE UNIQUE INDEX IF NOT EXISTS idx_usuarios_google_id_unique
    ON usuarios(google_id)
    WHERE google_id IS NOT NULL;

ALTER TABLE usuarios
    ALTER COLUMN contrasena DROP NOT NULL;

DROP CONSTRAINT IF EXISTS chk_contrasena_o_google;
ALTER TABLE usuarios
    ADD CONSTRAINT chk_contrasena_o_google CHECK (contrasena IS NOT NULL OR google_id IS NOT NULL);
