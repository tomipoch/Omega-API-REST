-- 0006_usuarios_ultimo_inicio_sesion.sql
-- Track the last successful login timestamp.

ALTER TABLE usuarios
    ADD COLUMN IF NOT EXISTS ultimo_inicio_sesion TIMESTAMPTZ;
