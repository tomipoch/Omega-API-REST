-- 0003_solicitudes_imagenes_separada.sql
-- Create a separate child table for personalization request images.

CREATE TABLE IF NOT EXISTS solicitudes_imagenes (
    imagen_id SERIAL PRIMARY KEY,
    solicitud_id INTEGER NOT NULL REFERENCES solicitudes_personalizacion(solicitud_id) ON DELETE CASCADE,
    imagen_url TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_solicitudes_imagenes_solicitud
    ON solicitudes_imagenes(solicitud_id);

DO $$
BEGIN
    IF EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'solicitudes_personalizacion' AND column_name = 'imagen_url'
    ) THEN
        INSERT INTO solicitudes_imagenes (solicitud_id, imagen_url)
        SELECT solicitud_id, UNNEST(imagen_url)
        FROM solicitudes_personalizacion
        WHERE imagen_url IS NOT NULL AND array_length(imagen_url, 1) > 0;

        ALTER TABLE solicitudes_personalizacion DROP COLUMN imagen_url;
    END IF;
END $$;
