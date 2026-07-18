const pool = require('../database/pgPool');
const { TESTIMONIO } = require('../utils/estados');

const NOMBRE_A_ESTADO = {
  Pendiente: TESTIMONIO.PENDIENTE,
  Aprobado: TESTIMONIO.APROBADO,
  Confirmado: TESTIMONIO.CONFIRMADO,
  Cancelado: TESTIMONIO.CANCELADO
};

exports.crearTestimonio = async (usuario_id, contenido, estrellas) => {
  const query = `
    INSERT INTO testimonios (usuario_id, contenido, estrellas, estado_id)
    VALUES ($1, $2, $3, (SELECT estado_id FROM estados WHERE nombre_estado = $4))
    RETURNING *;
  `;
  const { rows } = await pool.query(query, [usuario_id, contenido, estrellas, TESTIMONIO.PENDIENTE]);
  return rows[0];
};

exports.obtenerTestimoniosAprobados = async () => {
  const query = `
    SELECT * FROM testimonios
    WHERE estado_id = (SELECT estado_id FROM estados WHERE nombre_estado = $1)
    ORDER BY fecha_creacion DESC;
  `;
  const { rows } = await pool.query(query, [TESTIMONIO.APROBADO]);
  return rows;
};

exports.actualizarTestimonio = async (usuario_id, testimonio_id, contenido, estrellas) => {
  const query = `
    UPDATE testimonios
    SET contenido = $1, estrellas = $2
    WHERE testimonio_id = $3 AND usuario_id = $4
    RETURNING *;
  `;
  const { rows } = await pool.query(query, [contenido, estrellas, testimonio_id, usuario_id]);
  return rows[0];
};

exports.eliminarTestimonio = async (usuario_id, testimonio_id) => {
  const query = `
    DELETE FROM testimonios
    WHERE testimonio_id = $1 AND usuario_id = $2
    RETURNING *;
  `;
  const { rows } = await pool.query(query, [testimonio_id, usuario_id]);
  return rows[0];
};

exports.actualizarEstadoTestimonio = async (testimonio_id, nuevo_estado) => {
  const nombre = NOMBRE_A_ESTADO[nuevo_estado] || nuevo_estado;
  const query = `
    UPDATE testimonios
    SET estado_id = (SELECT estado_id FROM estados WHERE nombre_estado = $1)
    WHERE testimonio_id = $2
    RETURNING *;
  `;
  const { rows } = await pool.query(query, [nombre, testimonio_id]);
  return rows[0];
};

exports.obtenerTestimoniosPorEstado = async (estado) => {
  const nombre = NOMBRE_A_ESTADO[estado] || estado;
  const query = `
    SELECT * FROM testimonios
    WHERE estado_id = (SELECT estado_id FROM estados WHERE nombre_estado = $1)
    ORDER BY fecha_creacion DESC;
  `;
  const { rows } = await pool.query(query, [nombre]);
  return rows;
};
