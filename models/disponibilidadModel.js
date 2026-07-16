const pool = require('../database/pgPool');

exports.crear = async ({ fecha, hora_inicio, hora_fin, admin_id, notas = null }) => {
  const query = `
    INSERT INTO disponibilidad_citas (fecha, hora_inicio, hora_fin, admin_id, notas)
    VALUES ($1, $2, $3, $4, $5)
    RETURNING *
  `;
  const { rows } = await pool.query(query, [fecha, hora_inicio, hora_fin, admin_id, notas]);
  return rows[0];
};

exports.obtenerTodas = async ({ fecha, estado } = {}) => {
  const condiciones = [];
  const params = [];
  if (fecha) {
    params.push(fecha);
    condiciones.push(`fecha = $${params.length}`);
  }
  if (estado) {
    params.push(estado);
    condiciones.push(`estado = $${params.length}`);
  }
  const where = condiciones.length ? `WHERE ${condiciones.join(' AND ')}` : '';
  const { rows } = await pool.query(
    `SELECT * FROM disponibilidad_citas ${where} ORDER BY fecha ASC, hora_inicio ASC`,
    params
  );
  return rows;
};

exports.obtenerPorId = async (id) => {
  const { rows } = await pool.query(
    'SELECT * FROM disponibilidad_citas WHERE disponibilidad_id = $1',
    [id]
  );
  return rows[0];
};

exports.obtenerPorRango = async (fechaInicio, fechaFin) => {
  const { rows } = await pool.query(
    `SELECT * FROM disponibilidad_citas
     WHERE fecha BETWEEN $1 AND $2
     ORDER BY fecha ASC, hora_inicio ASC`,
    [fechaInicio, fechaFin]
  );
  return rows;
};

exports.obtenerPublicas = async () => {
  const { rows } = await pool.query(
    `SELECT disponibilidad_id, fecha, hora_inicio, hora_fin, notas
     FROM disponibilidad_citas
     WHERE estado = 'disponible' AND fecha >= CURRENT_DATE
     ORDER BY fecha ASC, hora_inicio ASC
     LIMIT 100`
  );
  return rows;
};

exports.obtenerPublicasConCita = async () => {
  const { rows } = await pool.query(
    `SELECT d.disponibilidad_id, d.fecha, d.hora_inicio, d.hora_fin, d.notas,
            COUNT(c.cita_id) FILTER (WHERE c.estado_id NOT IN (SELECT estado_id FROM estados WHERE nombre_estado IN ('cancelada','rechazada'))) AS cupos_ocupados
     FROM disponibilidad_citas d
     LEFT JOIN citas c ON c.disponibilidad_id = d.disponibilidad_id
     WHERE d.estado = 'disponible' AND d.fecha >= CURRENT_DATE
     GROUP BY d.disponibilidad_id
     ORDER BY d.fecha ASC, d.hora_inicio ASC`
  );
  return rows;
};

exports.actualizar = async (id, datos) => {
  const campos = [];
  const params = [];
  let i = 1;
  for (const [key, value] of Object.entries(datos)) {
    if (value !== undefined) {
      campos.push(`${key} = $${i}`);
      params.push(value);
      i++;
    }
  }
  if (!campos.length) return exports.obtenerPorId(id);
  params.push(id);
  const { rows } = await pool.query(
    `UPDATE disponibilidad_citas SET ${campos.join(', ')}
     WHERE disponibilidad_id = $${i} RETURNING *`,
    params
  );
  return rows[0];
};

exports.eliminar = async (id) => {
  const { rows } = await pool.query(
    'DELETE FROM disponibilidad_citas WHERE disponibilidad_id = $1 RETURNING *',
    [id]
  );
  return rows[0];
};