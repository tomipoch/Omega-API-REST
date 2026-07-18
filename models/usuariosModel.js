const pool = require('../database/pgPool');

exports.registrarUsuario = async (
  nombre,
  apellido_paterno,
  apellido_materno,
  correo_electronico,
  contrasena,
  rol_id,
  foto_perfil_url
) => {
  const query = `
    INSERT INTO usuarios (nombre, apellido_paterno, apellido_materno, correo_electronico, contrasena, rol_id, foto_perfil_url)
    VALUES ($1, $2, $3, $4, $5, $6, $7)
    RETURNING usuario_id, nombre, apellido_paterno, apellido_materno, correo_electronico, rol_id, foto_perfil_url;
  `;
  const { rows } = await pool.query(query, [
    nombre,
    apellido_paterno,
    apellido_materno,
    correo_electronico,
    contrasena,
    rol_id,
    foto_perfil_url
  ]);
  return rows[0];
};

exports.obtenerUsuarioPorCorreo = async (correo_electronico) => {
  const query = `
    SELECT usuario_id, nombre, apellido_paterno, apellido_materno, correo_electronico, contrasena, rol_id, foto_perfil_url
    FROM usuarios
    WHERE correo_electronico = $1
  `;
  const { rows } = await pool.query(query, [correo_electronico]);
  return rows[0];
};

exports.obtenerUsuarioPorId = async (usuario_id) => {
  const query = 'SELECT * FROM usuarios WHERE usuario_id = $1';
  const { rows } = await pool.query(query, [usuario_id]);
  return rows[0];
};

exports.actualizarUsuario = async (usuario_id, datos) => {
  const { nombre, apellido_paterno, apellido_materno, correo_electronico, telefono, direccion, foto_perfil_url } =
    datos;
  const query = `
    UPDATE usuarios
    SET nombre = $1, apellido_paterno = $2, apellido_materno = $3, correo_electronico = $4, telefono = $5, direccion = $6, foto_perfil_url = $7
    WHERE usuario_id = $8
    RETURNING usuario_id, nombre, apellido_paterno, apellido_materno, correo_electronico, telefono, direccion, foto_perfil_url;
  `;
  const { rows } = await pool.query(query, [
    nombre,
    apellido_paterno,
    apellido_materno,
    correo_electronico,
    telefono,
    direccion,
    foto_perfil_url,
    usuario_id
  ]);
  return rows[0];
};

const TABLAS_DEPENDIENTES = [
  'auditoria_seguridad',
  'citas',
  'inscripciones_eventos',
  'publicaciones_blog',
  'reservas',
  'restablecimiento_contrasena',
  'solicitudes_personalizacion',
  'solicitudes_imagenes',
  'testimonios',
  'preguntas_frecuentes'
];

exports.eliminarRegistrosRelacionados = async (usuario_id) => {
  const queries = TABLAS_DEPENDIENTES.map((tabla) =>
    pool.query(`DELETE FROM ${tabla} WHERE usuario_id = $1`, [usuario_id])
  );
  await Promise.all(queries);
};

exports.guardarCodigoRestablecimiento = async (usuario_id, codigo, fechaExpiracion) => {
  const query = `
    INSERT INTO restablecimiento_contrasena (usuario_id, codigo, fecha_expiracion)
    VALUES ($1, $2, $3) RETURNING *;
  `;
  const { rows } = await pool.query(query, [usuario_id, codigo, fechaExpiracion]);
  return rows[0];
};

exports.verificarCodigoRestablecimiento = async (usuario_id, codigo) => {
  const query = `
    SELECT * FROM restablecimiento_contrasena
    WHERE usuario_id = $1 AND codigo = $2 AND fecha_expiracion > NOW() AND usado = FALSE;
  `;
  const { rows } = await pool.query(query, [usuario_id, codigo]);
  return rows[0];
};

exports.actualizarContrasena = async (usuario_id, nuevaContrasena) => {
  const query = `
    UPDATE usuarios
    SET contrasena = $1
    WHERE usuario_id = $2 RETURNING *;
  `;
  const { rows } = await pool.query(query, [nuevaContrasena, usuario_id]);
  return rows[0];
};

exports.marcarCodigoComoUsado = async (restablecimiento_id) => {
  const query = `
    UPDATE restablecimiento_contrasena
    SET usado = TRUE
    WHERE restablecimiento_id = $1 RETURNING *;
  `;
  const { rows } = await pool.query(query, [restablecimiento_id]);
  return rows[0];
};

exports.actualizarFotoPerfil = async (usuario_id, foto_perfil_url) => {
  const query = `
    UPDATE usuarios
    SET foto_perfil_url = $1
    WHERE usuario_id = $2
    RETURNING usuario_id, foto_perfil_url;
  `;
  const { rows } = await pool.query(query, [foto_perfil_url, usuario_id]);
  return rows[0];
};

exports.actualizarUltimoInicioSesion = async (usuario_id) => {
  const query = `
    UPDATE usuarios
    SET ultimo_inicio_sesion = NOW()
    WHERE usuario_id = $1
    RETURNING usuario_id, ultimo_inicio_sesion;
  `;
  const { rows } = await pool.query(query, [usuario_id]);
  return rows[0];
};

exports.obtenerTodosLosUsuarios = async (filtros) => {
  const { nombre, rol } = filtros;

  let query = `
    SELECT usuario_id, nombre, apellido_paterno, apellido_materno, correo_electronico, rol_id, foto_perfil_url
    FROM usuarios
    WHERE 1 = 1
  `;
  const params = [];

  if (nombre) {
    query += ` AND (LOWER(nombre) LIKE $${params.length + 1} OR LOWER(apellido_paterno) LIKE $${params.length + 1})`;
    params.push(`%${nombre.toLowerCase()}%`);
  }

  if (rol) {
    query += ` AND rol_id = $${params.length + 1}`;
    params.push(rol);
  }

  query += ` ORDER BY usuario_id`;

  const { rows } = await pool.query(query, params);
  return rows;
};

exports.eliminarUsuarioPorId = async (usuario_id) => {
  const query = 'DELETE FROM usuarios WHERE usuario_id = $1 RETURNING *';
  const { rows } = await pool.query(query, [usuario_id]);
  return rows[0];
};

exports.obtenerUsuarioPorGoogleId = async (google_id) => {
  const query = `
    SELECT usuario_id, nombre, apellido_paterno, apellido_materno, correo_electronico, rol_id, foto_perfil_url, google_id
    FROM usuarios
    WHERE google_id = $1
  `;
  const { rows } = await pool.query(query, [google_id]);
  return rows[0];
};

exports.registrarUsuarioGoogle = async (
  nombre,
  apellido_paterno,
  apellido_materno,
  correo_electronico,
  google_id,
  foto_perfil_url
) => {
  const rol_id = 1;
  const query = `
    INSERT INTO usuarios (nombre, apellido_paterno, apellido_materno, correo_electronico, google_id, rol_id, foto_perfil_url)
    VALUES ($1, $2, $3, $4, $5, $6, $7)
    RETURNING usuario_id, nombre, apellido_paterno, apellido_materno, correo_electronico, rol_id, foto_perfil_url, google_id;
  `;
  const { rows } = await pool.query(query, [
    nombre,
    apellido_paterno,
    apellido_materno,
    correo_electronico,
    google_id,
    rol_id,
    foto_perfil_url
  ]);
  return rows[0];
};

exports.vincularGoogleId = async (usuario_id, google_id) => {
  const query = `
    UPDATE usuarios
    SET google_id = $1
    WHERE usuario_id = $2
    RETURNING usuario_id, nombre, apellido_paterno, apellido_materno, correo_electronico, rol_id, foto_perfil_url, google_id;
  `;
  const { rows } = await pool.query(query, [google_id, usuario_id]);
  return rows[0];
};

exports.verificarCorreoExistente = async (correo_electronico) => {
  const query = `
    SELECT usuario_id, nombre, correo_electronico, google_id, contrasena, foto_perfil_url
    FROM usuarios
    WHERE correo_electronico = $1
  `;
  const { rows } = await pool.query(query, [correo_electronico]);
  return rows[0];
};

exports.actualizarFotoPerfilGoogle = async (usuario_id, foto_perfil_url) => {
  const query = `
    UPDATE usuarios
    SET foto_perfil_url = $1
    WHERE usuario_id = $2
    RETURNING usuario_id, nombre, apellido_paterno, apellido_materno, correo_electronico, rol_id, foto_perfil_url, google_id;
  `;
  const { rows } = await pool.query(query, [foto_perfil_url, usuario_id]);
  return rows[0];
};
