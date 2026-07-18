-- 0005_usuarios_apellidos_foto.sql
-- Backup migration for legacy databases missing these columns.
-- All columns are already present in 0001_initial.sql.

ALTER TABLE usuarios
    ADD COLUMN IF NOT EXISTS apellido_paterno VARCHAR(100),
    ADD COLUMN IF NOT EXISTS apellido_materno VARCHAR(100),
    ADD COLUMN IF NOT EXISTS foto_perfil_url VARCHAR(255),
    ADD COLUMN IF NOT EXISTS telefono VARCHAR(20),
    ADD COLUMN IF NOT EXISTS direccion VARCHAR(255);
