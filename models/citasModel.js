const pool = require('../database/pgPool');

exports.crearCita = async (usuarioId, fecha_hora, servicio_id, estado_id, notas) => {
  const query = `
    INSERT INTO citas (usuario_id, fecha_hora, servicio_id, estado_id, notas)
    VALUES ($1, $2, $3, $4, $5) RETURNING *;
  `;
  const values = [usuarioId, fecha_hora, servicio_id, estado_id, notas];
  const { rows } = await pool.query(query, values);
  return rows[0];
};

exports.obtenerCitas = async (usuarioId) => {
  const query = 'SELECT * FROM citas WHERE usuario_id = $1';
  const { rows } = await pool.query(query, [usuarioId]);
  return rows;
};

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

exports.actualizarCita = async (usuarioId, citaId, fecha_hora, servicio_id, estado_id, notas) => {
  const campos = [];
  const valores = [];
  let i = 1;

  if (fecha_hora !== undefined) {
    campos.push(`fecha_hora = $${i++}`);
    valores.push(fecha_hora);
  }
  if (servicio_id !== undefined) {
    campos.push(`servicio_id = $${i++}`);
    valores.push(servicio_id);
  }
  if (estado_id !== undefined) {
    campos.push(`estado_id = $${i++}`);
    valores.push(estado_id);
  }
  if (notas !== undefined) {
    campos.push(`notas = $${i++}`);
    valores.push(notas);
  }

  if (!campos.length) {
    const { rows } = await pool.query(
      'SELECT * FROM citas WHERE cita_id = $1 AND usuario_id = $2',
      [citaId, usuarioId]
    );
    return rows[0];
  }

  valores.push(citaId);
  valores.push(usuarioId);

  const query = `
    UPDATE citas
    SET ${campos.join(', ')}
    WHERE cita_id = $${i++} AND usuario_id = $${i}
    RETURNING *;
  `;
  const { rows } = await pool.query(query, valores);
  return rows[0];
};

exports.eliminarCita = async (usuarioId, citaId) => {
  const query = 'DELETE FROM citas WHERE cita_id = $1 AND usuario_id = $2 RETURNING *;';
  const { rows } = await pool.query(query, [citaId, usuarioId]);
  return rows[0];
};
