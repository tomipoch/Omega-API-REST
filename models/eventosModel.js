const pool = require('../db');

// Crear un nuevo evento
exports.crearEvento = async (nombre, descripcion, fecha_inicio, fecha_fin, ubicacion, capacidad) => {
  const query = `
    INSERT INTO eventos (nombre, descripcion, fecha_inicio, fecha_fin, ubicacion, capacidad)
    VALUES ($1, $2, $3, $4, $5, $6) RETURNING *;
  `;
  const { rows } = await pool.query(query, [nombre, descripcion, fecha_inicio, fecha_fin, ubicacion, capacidad]);
  return rows[0];
};

// Obtener todos los eventos
exports.obtenerEventos = async () => {
  const query = 'SELECT * FROM eventos';
  const { rows } = await pool.query(query);
  return rows;
};

// Actualizar un evento
exports.actualizarEvento = async (evento_id, nombre, descripcion, fecha_inicio, fecha_fin, ubicacion, capacidad) => {
  const query = `
    UPDATE eventos
    SET nombre = $1, descripcion = $2, fecha_inicio = $3, fecha_fin = $4, ubicacion = $5, capacidad = $6
    WHERE evento_id = $7 RETURNING *;
  `;
  const { rows } = await pool.query(query, [nombre, descripcion, fecha_inicio, fecha_fin, ubicacion, capacidad, evento_id]);
  return rows[0];
};

// Eliminar un evento
exports.eliminarEvento = async (evento_id) => {
  const query = 'DELETE FROM eventos WHERE evento_id = $1 RETURNING *';
  const { rows } = await pool.query(query, [evento_id]);
  return rows[0];
};

// Inscribir usuario a un evento
exports.inscribirEvento = async (usuario_id, evento_id) => {
  // Verificar si el usuario ya está inscrito en el evento para evitar duplicados
  const checkQuery = `
    SELECT * FROM inscripciones_eventos WHERE usuario_id = $1 AND evento_id = $2;
  `;
  const checkResult = await pool.query(checkQuery, [usuario_id, evento_id]);

  if (checkResult.rows.length > 0) {
    throw new Error('Ya estás inscrito en este evento.'); // Evitar duplicados
  }

  // Si no está inscrito, proceder con la inscripción
  const insertQuery = `
    INSERT INTO inscripciones_eventos (usuario_id, evento_id)
    VALUES ($1, $2) RETURNING *;
  `;
  const { rows } = await pool.query(insertQuery, [usuario_id, evento_id]);
  return rows[0];
};

// Obtener un evento por ID
exports.obtenerEventoPorId = async (evento_id) => {
  const query = 'SELECT * FROM eventos WHERE evento_id = $1';
  const { rows } = await pool.query(query, [evento_id]);
  return rows[0];
};

// Obtener inscripción de un usuario en un evento
exports.obtenerInscripcion = async (usuario_id, evento_id) => {
  const query = `
    SELECT * FROM inscripciones_eventos
    WHERE usuario_id = $1 AND evento_id = $2;
  `;
  const { rows } = await pool.query(query, [usuario_id, evento_id]);
  return rows[0];
};

// Cancelar inscripción de un usuario en un evento
exports.cancelarInscripcion = async (usuario_id, evento_id) => {
  const query = `
    DELETE FROM inscripciones_eventos
    WHERE usuario_id = $1 AND evento_id = $2 RETURNING *;
  `;
  const { rows } = await pool.query(query, [usuario_id, evento_id]);
  return rows[0];
};
