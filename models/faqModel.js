const pool = require('../db');

// Crear una nueva pregunta frecuente
exports.crearPregunta = async (pregunta, respuesta) => {
  const query = `
    INSERT INTO preguntas_frecuentes (pregunta, respuesta)
    VALUES ($1, $2) RETURNING *;
  `;
  const { rows } = await pool.query(query, [pregunta, respuesta]);
  return rows[0];
};

// Obtener todas las preguntas frecuentes
exports.obtenerPreguntas = async () => {
  const query = 'SELECT * FROM preguntas_frecuentes';
  const { rows } = await pool.query(query);
  return rows;
};

// Actualizar una pregunta frecuente
exports.actualizarPregunta = async (pregunta_id, pregunta, respuesta) => {
  const query = `
    UPDATE preguntas_frecuentes
    SET pregunta = $1, respuesta = $2
    WHERE pregunta_id = $3
    RETURNING *;
  `;
  const { rows } = await pool.query(query, [pregunta, respuesta, pregunta_id]);
  return rows[0];
};

// Eliminar una pregunta frecuente
exports.eliminarPregunta = async (pregunta_id) => {
  const query = 'DELETE FROM preguntas_frecuentes WHERE pregunta_id = $1 RETURNING *';
  const { rows } = await pool.query(query, [pregunta_id]);
  return rows[0];
};
