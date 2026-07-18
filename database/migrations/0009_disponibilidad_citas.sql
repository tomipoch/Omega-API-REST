-- 0009_disponibilidad_citas.sql
-- Time slots admins publish for users to book appointments.

DO $$ BEGIN
    CREATE TYPE estado_disponibilidad AS ENUM ('disponible', 'ocupada', 'cancelada');
EXCEPTION
    WHEN duplicate_object THEN NULL;
END $$;

CREATE TABLE IF NOT EXISTS disponibilidad_citas (
    disponibilidad_id SERIAL PRIMARY KEY,
    fecha DATE NOT NULL,
    hora_inicio TIME NOT NULL,
    hora_fin TIME NOT NULL,
    estado estado_disponibilidad NOT NULL DEFAULT 'disponible',
    admin_id INTEGER NOT NULL REFERENCES usuarios(usuario_id) ON DELETE CASCADE,
    notas TEXT,
    fecha_creacion TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    fecha_actualizacion TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT unique_disponibilidad UNIQUE (fecha, hora_inicio, hora_fin),
    CONSTRAINT chk_horas_validas CHECK (hora_inicio < hora_fin)
);

CREATE INDEX IF NOT EXISTS idx_disponibilidad_fecha ON disponibilidad_citas(fecha);
CREATE INDEX IF NOT EXISTS idx_disponibilidad_estado ON disponibilidad_citas(estado);
CREATE INDEX IF NOT EXISTS idx_disponibilidad_admin ON disponibilidad_citas(admin_id);

CREATE OR REPLACE FUNCTION update_disponibilidad_fecha_actualizacion()
RETURNS TRIGGER AS $$
BEGIN
    NEW.fecha_actualizacion = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS tr_disponibilidad_update_fecha ON disponibilidad_citas;
CREATE TRIGGER tr_disponibilidad_update_fecha
    BEFORE UPDATE ON disponibilidad_citas
    FOR EACH ROW
    EXECUTE FUNCTION update_disponibilidad_fecha_actualizacion();
