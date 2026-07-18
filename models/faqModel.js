const pool = require('../database/pgPool');

exports.crearPregunta = async (pregunta, respuesta) => {
  const query = `
    INSERT INTO preguntas_frecuentes (pregunta, respuesta)
    VALUES ($1, $2) RETURNING *;
  `;
  const { rows } = await pool.query(query, [pregunta, respuesta]);
  return rows[0];
};

exports.obtenerPreguntas = async () => {
  const query = 'SELECT * FROM preguntas_frecuentes';
  const { rows } = await pool.query(query);
  return rows;
};

exports.actualizarPregunta = async (faq_id, pregunta, respuesta) => {
  const query = `
    UPDATE preguntas_frecuentes
    SET pregunta = $1, respuesta = $2
    WHERE faq_id = $3
    RETURNING *;
  `;
  const { rows } = await pool.query(query, [pregunta, respuesta, faq_id]);
  return rows[0];
};

exports.eliminarPregunta = async (faq_id) => {
  const query = 'DELETE FROM preguntas_frecuentes WHERE faq_id = $1 RETURNING *';
  const { rows } = await pool.query(query, [faq_id]);
  return rows[0];
};
