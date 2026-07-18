-- 0011_missing_fk_indexes.sql
-- Indexes on FK columns consulted via WHERE/JOIN to avoid sequential scans.

CREATE INDEX IF NOT EXISTS idx_solicitudes_personalizacion_estado
    ON solicitudes_personalizacion(estado_id);

CREATE INDEX IF NOT EXISTS idx_solicitudes_personalizacion_usuario
    ON solicitudes_personalizacion(usuario_id);

CREATE INDEX IF NOT EXISTS idx_inscripciones_eventos_usuario
    ON inscripciones_eventos(usuario_id);

CREATE INDEX IF NOT EXISTS idx_preguntas_frecuentes_estado
    ON preguntas_frecuentes(estado_id);

CREATE INDEX IF NOT EXISTS idx_testimonios_estado
    ON testimonios(estado_id);

CREATE INDEX IF NOT EXISTS idx_citas_estado
    ON citas(estado_id);