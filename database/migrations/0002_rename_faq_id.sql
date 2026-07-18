-- 0002_rename_faq_id.sql
-- Ensure preguntas_frecuentes PK is named faq_id (legacy name was pregunta_id).

DO $$
BEGIN
    IF EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'preguntas_frecuentes' AND column_name = 'pregunta_id'
    ) THEN
        ALTER TABLE preguntas_frecuentes RENAME COLUMN pregunta_id TO faq_id;
    END IF;
END $$;
