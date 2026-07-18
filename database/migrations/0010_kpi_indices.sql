-- 0010_kpi_indices.sql
-- Supporting indexes for KPI / reporting queries.

CREATE INDEX IF NOT EXISTS idx_reservas_fecha_reserva ON reservas(fecha_reserva);
CREATE INDEX IF NOT EXISTS idx_auditoria_fecha ON auditoria_seguridad(fecha);
CREATE INDEX IF NOT EXISTS idx_auditoria_usuario ON auditoria_seguridad(usuario_id);
CREATE INDEX IF NOT EXISTS idx_eventos_fecha_inicio ON eventos(fecha_inicio);
CREATE INDEX IF NOT EXISTS idx_citas_fecha_hora ON citas(fecha_hora);
