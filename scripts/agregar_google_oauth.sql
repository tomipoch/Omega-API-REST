-- Script para agregar soporte de Google OAuth a la tabla usuarios
-- Ejecutar este script en la base de datos PostgreSQL

-- Agregar columna google_id a la tabla usuarios
ALTER TABLE usuarios 
ADD COLUMN IF NOT EXISTS google_id VARCHAR(255);

-- Agregar restricción UNIQUE solo si la columna no la tiene
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE table_name = 'usuarios' 
        AND constraint_name = 'usuarios_google_id_key'
    ) THEN
        ALTER TABLE usuarios ADD CONSTRAINT usuarios_google_id_key UNIQUE (google_id);
    END IF;
END $$;

-- Crear índice para mejorar el rendimiento de búsquedas por google_id
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_indexes 
        WHERE tablename = 'usuarios' 
        AND indexname = 'idx_usuarios_google_id'
    ) THEN
        CREATE INDEX idx_usuarios_google_id ON usuarios(google_id);
    END IF;
END $$;

-- Permitir que la contraseña sea opcional para usuarios de Google
ALTER TABLE usuarios 
ALTER COLUMN contrasena DROP NOT NULL;

-- Agregar comentarios para documentación
COMMENT ON COLUMN usuarios.google_id IS 'ID único de Google OAuth para autenticación';
