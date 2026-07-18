-- 0007_reservas.sql
-- Temporary product reservations with automatic expiration.

CREATE TABLE IF NOT EXISTS reservas (
    reserva_id SERIAL PRIMARY KEY,
    usuario_id INTEGER NOT NULL REFERENCES usuarios(usuario_id) ON DELETE CASCADE,
    producto_id INTEGER NOT NULL REFERENCES productos(producto_id) ON DELETE CASCADE,
    cantidad_reservada INTEGER NOT NULL CHECK (cantidad_reservada > 0),
    estado_reserva VARCHAR(20) NOT NULL DEFAULT 'activa'
        CHECK (estado_reserva IN ('activa', 'confirmada', 'cancelada', 'expirada')),
    fecha_reserva TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    fecha_expiracion TIMESTAMPTZ NOT NULL,
    notas TEXT,
    fecha_creacion TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    fecha_actualizacion TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_reserva_usuario ON reservas(usuario_id);
CREATE INDEX IF NOT EXISTS idx_reserva_producto ON reservas(producto_id);
CREATE INDEX IF NOT EXISTS idx_reserva_estado ON reservas(estado_reserva);
CREATE INDEX IF NOT EXISTS idx_reserva_fecha_expiracion ON reservas(fecha_expiracion);
CREATE INDEX IF NOT EXISTS idx_reserva_usuario_producto_activa
    ON reservas(usuario_id, producto_id)
    WHERE estado_reserva = 'activa';

CREATE OR REPLACE FUNCTION update_reserva_fecha_actualizacion()
RETURNS TRIGGER AS $$
BEGIN
    NEW.fecha_actualizacion = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS tr_reservas_update_fecha ON reservas;
CREATE TRIGGER tr_reservas_update_fecha
    BEFORE UPDATE ON reservas
    FOR EACH ROW
    EXECUTE FUNCTION update_reserva_fecha_actualizacion();
