const pool = require('../db');

// Registrar un nuevo usuario
exports.registrarUsuario = async (nombre, correo_electronico, contrasena, rol_id) => {
    const query = `
      INSERT INTO usuarios (nombre, correo_electronico, contrasena, rol_id)
      VALUES ($1, $2, $3, $4) RETURNING usuario_id, nombre, correo_electronico, rol_id;
    `;
    const { rows } = await pool.query(query, [nombre, correo_electronico, contrasena, rol_id]);
    return rows[0];
  };

// Obtener usuario por correo electrónico
exports.obtenerUsuarioPorCorreo = async (correo_electronico) => {
  const query = 'SELECT * FROM usuarios WHERE correo_electronico = $1';
  const { rows } = await pool.query(query, [correo_electronico]);
  return rows[0];
};

// Obtener usuario por ID
exports.obtenerUsuarioPorId = async (usuario_id) => {
  const query = 'SELECT * FROM usuarios WHERE usuario_id = $1';
  const { rows } = await pool.query(query, [usuario_id]);
  return rows[0];
};

// Actualizar perfil de usuario
exports.actualizarUsuario = async (usuario_id, nombre, correo_electronico, telefono, direccion) => {
  const query = `
    UPDATE usuarios
    SET nombre = $1, correo_electronico = $2, telefono = $3, direccion = $4
    WHERE usuario_id = $5
    RETURNING usuario_id, nombre, correo_electronico, telefono, direccion;
  `;
  const { rows } = await pool.query(query, [nombre, correo_electronico, telefono, direccion, usuario_id]);
  return rows[0];
};

// Eliminar usuario
exports.eliminarUsuario = async (usuario_id) => {
  const query = 'DELETE FROM usuarios WHERE usuario_id = $1 RETURNING *';
  const { rows } = await pool.query(query, [usuario_id]);
  return rows[0];
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
