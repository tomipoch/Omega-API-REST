-- 0001_initial.sql
-- Initial schema: roles, estados, usuarios, auditoria, citas, eventos, blog,
-- FAQ, restablecimiento, servicios, personalizacion, testimonios.

CREATE TABLE IF NOT EXISTS roles (
    rol_id SERIAL PRIMARY KEY,
    nombre_rol VARCHAR(50) NOT NULL UNIQUE
);

CREATE TABLE IF NOT EXISTS estados (
    estado_id SERIAL PRIMARY KEY,
    nombre_estado VARCHAR(50) NOT NULL UNIQUE
);

CREATE TABLE IF NOT EXISTS usuarios (
    usuario_id SERIAL PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
    apellido_paterno VARCHAR(100),
    apellido_materno VARCHAR(100),
    correo_electronico VARCHAR(100) NOT NULL UNIQUE,
    contrasena VARCHAR(255),
    telefono VARCHAR(20),
    direccion VARCHAR(255),
    foto_perfil_url VARCHAR(255),
    rol_id INTEGER REFERENCES roles(rol_id) ON DELETE SET NULL,
    google_id VARCHAR(255),
    ultimo_inicio_sesion TIMESTAMPTZ,
    fecha_registro TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT chk_contrasena_o_google CHECK (contrasena IS NOT NULL OR google_id IS NOT NULL)
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_usuarios_google_id_unique ON usuarios(google_id) WHERE google_id IS NOT NULL;

CREATE TABLE IF NOT EXISTS auditoria_seguridad (
    auditoria_id SERIAL PRIMARY KEY,
    usuario_id INTEGER REFERENCES usuarios(usuario_id) ON DELETE SET NULL,
    accion VARCHAR(255) NOT NULL,
    detalles TEXT,
    fecha TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS servicios (
    servicio_id SERIAL PRIMARY KEY,
    nombre_servicio VARCHAR(255) NOT NULL,
    descripcion TEXT,
    precio NUMERIC(10,2) NOT NULL
);

CREATE TABLE IF NOT EXISTS citas (
    cita_id SERIAL PRIMARY KEY,
    usuario_id INTEGER REFERENCES usuarios(usuario_id) ON DELETE CASCADE,
    fecha_hora TIMESTAMPTZ NOT NULL,
    servicio_id INTEGER REFERENCES servicios(servicio_id) ON DELETE SET NULL,
    estado_id INTEGER REFERENCES estados(estado_id) ON DELETE SET NULL,
    notas TEXT,
    fecha_modificacion TIMESTAMPTZ
);

CREATE TABLE IF NOT EXISTS eventos (
    evento_id SERIAL PRIMARY KEY,
    nombre VARCHAR(255) NOT NULL,
    descripcion TEXT,
    fecha_inicio TIMESTAMPTZ NOT NULL,
    fecha_fin TIMESTAMPTZ NOT NULL,
    ubicacion VARCHAR(255),
    capacidad INTEGER
);

CREATE TABLE IF NOT EXISTS inscripciones_eventos (
    inscripcion_id SERIAL PRIMARY KEY,
    evento_id INTEGER REFERENCES eventos(evento_id) ON DELETE CASCADE,
    usuario_id INTEGER REFERENCES usuarios(usuario_id) ON DELETE CASCADE,
    fecha_inscripcion TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    estado VARCHAR(20) DEFAULT 'no inscrito',
    CONSTRAINT estado_valido CHECK (estado IN ('no inscrito', 'inscrito', 'cancelado')),
    CONSTRAINT unique_inscripcion UNIQUE (evento_id, usuario_id)
);

CREATE TABLE IF NOT EXISTS publicaciones_blog (
    publicacion_id SERIAL PRIMARY KEY,
    titulo VARCHAR(255) NOT NULL,
    contenido TEXT NOT NULL,
    fecha_publicacion TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    autor_id INTEGER REFERENCES usuarios(usuario_id) ON DELETE SET NULL
);

CREATE TABLE IF NOT EXISTS preguntas_frecuentes (
    faq_id SERIAL PRIMARY KEY,
    pregunta VARCHAR(255) NOT NULL,
    respuesta TEXT,
    estado_id INTEGER REFERENCES estados(estado_id) ON DELETE SET NULL
);

CREATE TABLE IF NOT EXISTS restablecimiento_contrasena (
    restablecimiento_id SERIAL PRIMARY KEY,
    usuario_id INTEGER REFERENCES usuarios(usuario_id) ON DELETE CASCADE,
    codigo VARCHAR(6) NOT NULL,
    fecha_expiracion TIMESTAMPTZ NOT NULL,
    usado BOOLEAN DEFAULT FALSE
);

CREATE TABLE IF NOT EXISTS solicitudes_personalizacion (
    solicitud_id SERIAL PRIMARY KEY,
    usuario_id INTEGER REFERENCES usuarios(usuario_id) ON DELETE CASCADE,
    servicio_id INTEGER REFERENCES servicios(servicio_id) ON DELETE SET NULL,
    detalles TEXT NOT NULL,
    estado_id INTEGER DEFAULT 1,
    fecha_solicitud TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS testimonios (
    testimonio_id SERIAL PRIMARY KEY,
    usuario_id INTEGER REFERENCES usuarios(usuario_id) ON DELETE CASCADE,
    contenido TEXT NOT NULL,
    fecha_creacion TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    estado_id INTEGER REFERENCES estados(estado_id) ON DELETE SET NULL,
    estrellas INTEGER DEFAULT 3,
    CONSTRAINT estrellas_valida CHECK (estrellas >= 1 AND estrellas <= 5)
);

CREATE OR REPLACE FUNCTION actualizar_fecha_modificacion()
RETURNS TRIGGER AS $$
BEGIN
  NEW.fecha_modificacion = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS tr_citas_fecha_modificacion ON citas;
CREATE TRIGGER tr_citas_fecha_modificacion
    BEFORE UPDATE ON citas
    FOR EACH ROW
    EXECUTE FUNCTION actualizar_fecha_modificacion();

INSERT INTO roles (nombre_rol) VALUES
    ('admin'),
    ('usuario')
ON CONFLICT (nombre_rol) DO NOTHING;

INSERT INTO estados (nombre_estado) VALUES
    ('Pendiente'),
    ('Aprobado'),
    ('Confirmado'),
    ('Cancelado'),
    ('Rechazado'),
    ('Activa'),
    ('Expirada'),
    ('Disponible'),
    ('Ocupada'),
    ('Cancelada')
ON CONFLICT (nombre_estado) DO NOTHING;
