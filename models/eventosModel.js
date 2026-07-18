const pool = require('../database/pgPool');

exports.crearEvento = async (nombre, descripcion, fecha_inicio, fecha_fin, ubicacion, capacidad) => {
  const query = `
    INSERT INTO eventos (nombre, descripcion, fecha_inicio, fecha_fin, ubicacion, capacidad)
    VALUES ($1, $2, $3, $4, $5, $6) RETURNING *;
  `;
  const { rows } = await pool.query(query, [nombre, descripcion, fecha_inicio, fecha_fin, ubicacion, capacidad]);
  return rows[0];
};

exports.obtenerEventos = async () => {
  const query = 'SELECT * FROM eventos';
  const { rows } = await pool.query(query);
  return rows;
};

exports.actualizarEvento = async (evento_id, nombre, descripcion, fecha_inicio, fecha_fin, ubicacion, capacidad) => {
  const query = `
    UPDATE eventos
    SET nombre = $1, descripcion = $2, fecha_inicio = $3, fecha_fin = $4, ubicacion = $5, capacidad = $6
    WHERE evento_id = $7 RETURNING *;
  `;
  const { rows } = await pool.query(query, [nombre, descripcion, fecha_inicio, fecha_fin, ubicacion, capacidad, evento_id]);
  return rows[0];
};

exports.eliminarEvento = async (evento_id) => {
  const query = 'DELETE FROM eventos WHERE evento_id = $1 RETURNING *';
  const { rows } = await pool.query(query, [evento_id]);
  return rows[0];
};

exports.inscribirEvento = async (usuario_id, evento_id) => {
  const query = `
    INSERT INTO inscripciones_eventos (evento_id, usuario_id, estado)
    VALUES ($1, $2, 'inscrito')
    ON CONFLICT (evento_id, usuario_id) DO NOTHING
    RETURNING *;
  `;
  const { rows } = await pool.query(query, [evento_id, usuario_id]);
  return rows[0];
};

exports.obtenerEventoPorId = async (evento_id) => {
  const query = 'SELECT * FROM eventos WHERE evento_id = $1';
  const { rows } = await pool.query(query, [evento_id]);
  return rows[0];
};

exports.obtenerInscripcion = async (usuario_id, evento_id) => {
  const query = `
    SELECT * FROM inscripciones_eventos
    WHERE usuario_id = $1 AND evento_id = $2;
  `;
  const { rows } = await pool.query(query, [usuario_id, evento_id]);
  return rows[0];
};

exports.cancelarInscripcion = async (usuario_id, evento_id) => {
  const query = `
    DELETE FROM inscripciones_eventos
    WHERE usuario_id = $1 AND evento_id = $2 RETURNING *;
  `;
  const { rows } = await pool.query(query, [usuario_id, evento_id]);
  return rows[0];
};
