-- 0008_secciones_blog.sql
-- Blog posts can have multiple ordered sections (subtitle + content).

CREATE TABLE IF NOT EXISTS secciones_blog (
    seccion_id SERIAL PRIMARY KEY,
    publicacion_id INTEGER NOT NULL REFERENCES publicaciones_blog(publicacion_id) ON DELETE CASCADE,
    subtitulo VARCHAR(255) NOT NULL,
    contenido TEXT NOT NULL,
    orden INTEGER NOT NULL DEFAULT 0
);

CREATE INDEX IF NOT EXISTS idx_secciones_blog_publicacion
    ON secciones_blog(publicacion_id, orden);
