const pool = require('../db');

// Registrar un nuevo usuario
exports.registrarUsuario = async (nombre, apellido_paterno, apellido_materno, correo_electronico, contrasena, rol_id, foto_perfil_url) => {
    const query = `
      INSERT INTO usuarios (nombre, apellido_paterno, apellido_materno, correo_electronico, contrasena, rol_id, foto_perfil_url)
      VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING usuario_id, nombre, apellido_paterno, apellido_materno, correo_electronico, rol_id, foto_perfil_url;
    `;
    const { rows } = await pool.query(query, [nombre, apellido_paterno, apellido_materno, correo_electronico, contrasena, rol_id, foto_perfil_url]);
    return rows[0];
};

// Obtener usuario por correo electrónico
exports.obtenerUsuarioPorCorreo = async (correo_electronico) => {
  console.log('Buscando usuario por correo:', correo_electronico);
  const query = `
    SELECT usuario_id, nombre, apellido_paterno, apellido_materno, correo_electronico, contrasena, rol_id, foto_perfil_url
    FROM usuarios
    WHERE correo_electronico = $1
  `;
  const { rows } = await pool.query(query, [correo_electronico]);
  console.log('Resultado de la consulta:', rows);
  return rows[0];
};

// Obtener usuario por ID
exports.obtenerUsuarioPorId = async (usuario_id) => {
  const query = 'SELECT * FROM usuarios WHERE usuario_id = $1';
  const { rows } = await pool.query(query, [usuario_id]);
  return rows[0];
};

// Actualizar perfil de usuario
exports.actualizarUsuario = async (usuario_id, nombre, apellido_paterno, apellido_materno, correo_electronico, telefono, direccion, foto_perfil_url) => {
  const query = `
    UPDATE usuarios
    SET nombre = $1, apellido_paterno = $2, apellido_materno = $3, correo_electronico = $4, telefono = $5, direccion = $6, foto_perfil_url = $7
    WHERE usuario_id = $8
    RETURNING usuario_id, nombre, apellido_paterno, apellido_materno, correo_electronico, telefono, direccion, foto_perfil_url;
  `;
  const { rows } = await pool.query(query, [nombre, apellido_paterno, apellido_materno, correo_electronico, telefono, direccion, foto_perfil_url, usuario_id]);
  return rows[0];
};

// Eliminar usuario
exports.eliminarUsuario = async (usuario_id) => {
  try {
    console.log('Ejecutando eliminación en la base de datos para usuario ID:', usuario_id);
    
    const query = 'DELETE FROM usuarios WHERE usuario_id = $1 RETURNING *';
    const { rows, rowCount } = await pool.query(query, [usuario_id]);
    
    console.log('Filas afectadas por la eliminación:', rowCount);
    
    if (rowCount === 0) {
      console.log('No se encontró usuario con ID:', usuario_id);
      return null;
    }
    
    console.log('Usuario eliminado de la base de datos:', rows[0]?.correo_electronico);
    return rows[0];
  } catch (error) {
    console.error('Error en modelo eliminarUsuario:', error);
    console.error('Código de error:', error.code);
    console.error('Detalle del error:', error.detail);
    throw error; // Re-lanzar el error para que lo maneje el controlador
  }
};

// Eliminar registros relacionados del usuario antes de eliminarlo
exports.eliminarRegistrosRelacionados = async (usuario_id) => {
  try {
    console.log('Eliminando registros relacionados para usuario ID:', usuario_id);
    
    // Eliminar registros de auditoría
    await pool.query('DELETE FROM auditoria_seguridad WHERE usuario_id = $1', [usuario_id]);
    console.log('Registros de auditoría eliminados');
    
    // Eliminar citas del usuario
    await pool.query('DELETE FROM citas WHERE usuario_id = $1', [usuario_id]);
    console.log('Citas eliminadas');
    
    // Eliminar inscripciones a eventos
    await pool.query('DELETE FROM inscripciones_eventos WHERE usuario_id = $1', [usuario_id]);
    console.log('Inscripciones a eventos eliminadas');
    
    // Eliminar publicaciones de blog
    await pool.query('DELETE FROM publicaciones_blog WHERE autor_id = $1', [usuario_id]);
    console.log('Publicaciones de blog eliminadas');
    
    // Eliminar reservas
    await pool.query('DELETE FROM reserva_cabecera WHERE usuario_id = $1', [usuario_id]);
    console.log('Reservas eliminadas');
    
    // Eliminar solicitudes de restablecimiento de contraseña
    await pool.query('DELETE FROM restablecimiento_contrasena WHERE usuario_id = $1', [usuario_id]);
    console.log('Solicitudes de restablecimiento eliminadas');
    
    // Eliminar solicitudes de personalización
    await pool.query('DELETE FROM solicitudes_personalizacion WHERE usuario_id = $1', [usuario_id]);
    console.log('Solicitudes de personalización eliminadas');
    
    // Eliminar testimonios
    await pool.query('DELETE FROM testimonios WHERE usuario_id = $1', [usuario_id]);
    console.log('Testimonios eliminados');
    
    // Eliminar preguntas frecuentes creadas por el usuario
    await pool.query('DELETE FROM preguntas_frecuentes WHERE usuario_id = $1', [usuario_id]);
    console.log('Preguntas frecuentes eliminadas');
    
    console.log('Todos los registros relacionados eliminados exitosamente');
  } catch (error) {
    console.error('Error al eliminar registros relacionados:', error);
    throw error;
  }
};

// Guardar el código de restablecimiento en la base de datos
exports.guardarCodigoRestablecimiento = async (usuario_id, codigo, fechaExpiracion) => {
  const query = `
    INSERT INTO restablecimiento_contrasena (usuario_id, codigo, fecha_expiracion)
    VALUES ($1, $2, $3) RETURNING *;
  `;
  const { rows } = await pool.query(query, [usuario_id, codigo, fechaExpiracion]);
  return rows[0];
};

// Verificar si el código es válido y no ha expirado
exports.verificarCodigoRestablecimiento = async (usuario_id, codigo) => {
  const query = `
    SELECT * FROM restablecimiento_contrasena
    WHERE usuario_id = $1 AND codigo = $2 AND fecha_expiracion > NOW() AND usado = FALSE;
  `;
  const { rows } = await pool.query(query, [usuario_id, codigo]);
  return rows[0];
};

// Actualizar la contraseña del usuario
exports.actualizarContrasena = async (usuario_id, nuevaContrasena) => {
  const query = `
    UPDATE usuarios
    SET contrasena = $1
    WHERE usuario_id = $2 RETURNING *;
  `;
  const { rows } = await pool.query(query, [nuevaContrasena, usuario_id]);
  return rows[0];
};

// Marcar el código de restablecimiento como usado
exports.marcarCodigoComoUsado = async (restablecimiento_id) => {
  const query = `
    UPDATE restablecimiento_contrasena
    SET usado = TRUE
    WHERE restablecimiento_id = $1 RETURNING *;
  `;
  const { rows } = await pool.query(query, [restablecimiento_id]);
  return rows[0];
};

// Actualizar la foto de perfil del usuario
exports.actualizarFotoPerfil = async (usuario_id, foto_perfil_url) => {
  console.log(`Actualizando foto de perfil para usuario ${usuario_id} con URL: ${foto_perfil_url}`); // Depuración
  const query = `
      UPDATE usuarios
      SET foto_perfil_url = $1
      WHERE usuario_id = $2
      RETURNING usuario_id, foto_perfil_url;
  `;
  const { rows } = await pool.query(query, [foto_perfil_url, usuario_id]);
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

// Eliminar un usuario por ID
exports.eliminarUsuarioPorId = async (usuario_id) => {
  try {
    const query = 'DELETE FROM usuarios WHERE usuario_id = $1 RETURNING *';
    const { rows } = await pool.query(query, [usuario_id]);

    return rows[0]; // Devuelve el usuario eliminado o `undefined` si no existe
  } catch (error) {
    console.error('Error en eliminarUsuarioPorId:', error); // Log del error en el modelo
    throw error; // Re-lanzar el error para que el controlador lo maneje
  }
};

// Obtener usuario por Google ID
exports.obtenerUsuarioPorGoogleId = async (google_id) => {
  const query = `
    SELECT usuario_id, nombre, apellido_paterno, apellido_materno, correo_electronico, rol_id, foto_perfil_url, google_id
    FROM usuarios
    WHERE google_id = $1
  `;
  const { rows } = await pool.query(query, [google_id]);
  return rows[0];
};

// Registrar usuario con Google OAuth
exports.registrarUsuarioGoogle = async (nombre, apellido_paterno, apellido_materno, correo_electronico, google_id, foto_perfil_url) => {
  const query = `
    INSERT INTO usuarios (nombre, apellido_paterno, apellido_materno, correo_electronico, google_id, rol_id, foto_perfil_url)
    VALUES ($1, $2, $3, $4, $5, $6, $7) 
    RETURNING usuario_id, nombre, apellido_paterno, apellido_materno, correo_electronico, rol_id, foto_perfil_url, google_id;
  `;
  const rol_id = 1; // Rol de usuario regular por defecto
  const { rows } = await pool.query(query, [nombre, apellido_paterno, apellido_materno, correo_electronico, google_id, rol_id, foto_perfil_url]);
  return rows[0];
};

// Actualizar Google ID para usuario existente
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

// Verificar si un correo ya está registrado (incluyendo Google)
exports.verificarCorreoExistente = async (correo_electronico) => {
  const query = `
    SELECT usuario_id, nombre, correo_electronico, google_id, contrasena, foto_perfil_url
    FROM usuarios
    WHERE correo_electronico = $1
  `;
  const { rows } = await pool.query(query, [correo_electronico]);
  return rows[0];
};

// Actualizar foto de perfil de usuario Google
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
