const pool = require('../db');  // Archivo donde se configura la conexión a PostgreSQL

// Crear una nueva cita
exports.crearCita = async (usuarioId, fecha_hora, servicio_id, estado_id, notas) => {
  const query = `
    INSERT INTO citas (usuario_id, fecha_hora, servicio_id, estado_id, notas)
    VALUES ($1, $2, $3, $4, $5) RETURNING *;
  `;
  const values = [usuarioId, fecha_hora, servicio_id, estado_id, notas];
  const { rows } = await pool.query(query, values);
  return rows[0];
};

// Obtener citas de un usuario
exports.obtenerCitas = async (usuarioId) => {
  const query = 'SELECT * FROM citas WHERE usuario_id = $1';
  const { rows } = await pool.query(query, [usuarioId]);
  return rows;
};

// Obtener TODAS las citas con el nombre del cliente (para el admin)
exports.obtenerTodasLasCitas = async () => {
  const query = `
    SELECT c.*, u.nombre AS cliente_nombre
    FROM citas c
    JOIN usuarios u ON c.usuario_id = u.usuario_id
    ORDER BY c.fecha_hora DESC
  `;
  const { rows } = await pool.query(query);
  return rows;
};

// Actualizar una cita
exports.actualizarCita = async (usuarioId, citaId, fecha_hora, servicio_id, estado_id, notas) => {
  const query = `
    UPDATE citas 
    SET 
      fecha_hora = COALESCE($1, NOW()), -- Usa NOW() si $1 es nulo
      servicio_id = $2, 
      estado_id = $3, 
      notas = $4
    WHERE 
      cita_id = $5 AND usuario_id = $6 
    RETURNING *;
  `;
  const values = [fecha_hora, servicio_id, estado_id, notas, citaId, usuarioId];
  const { rows } = await pool.query(query, values);
  return rows[0];
};

// Eliminar una cita
exports.eliminarCita = async (usuarioId, citaId) => {
  const query = 'DELETE FROM citas WHERE cita_id = $1 AND usuario_id = $2 RETURNING *;';
  const { rows } = await pool.query(query, [citaId, usuarioId]);
  return rows[0];
};