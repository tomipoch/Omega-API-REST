const pool = require('../db');

// Crear un nuevo testimonio
exports.crearTestimonio = async (usuario_id, contenido, estrellas) => {
  const query = `
    INSERT INTO testimonios (usuario_id, contenido, estrellas, estado_id)
    VALUES ($1, $2, $3, (SELECT estado_id FROM estados WHERE nombre_estado = 'Pendiente'))
    RETURNING *;
  `;
  const { rows } = await pool.query(query, [usuario_id, contenido, estrellas]);
  return rows[0];
};


// Obtener todos los testimonios aprobados
exports.obtenerTestimoniosAprobados = async () => {
  const query = `
    SELECT * FROM testimonios
    WHERE estado_id = (SELECT estado_id FROM estados WHERE nombre_estado = 'Aprobado')
    ORDER BY fecha_creacion DESC;
  `;
  const { rows } = await pool.query(query);
  return rows;
};

// Actualizar un testimonio
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


// Eliminar un testimonio
exports.eliminarTestimonio = async (usuario_id, testimonio_id) => {
  const query = `
    DELETE FROM testimonios
    WHERE testimonio_id = $1 AND usuario_id = $2
    RETURNING *;
  `;
  const { rows } = await pool.query(query, [testimonio_id, usuario_id]);
  return rows[0];
};

// Actualizar el estado de un testimonio (confirmar o cancelar)
exports.actualizarEstadoTestimonio = async (testimonio_id, nuevo_estado) => {
  const query = `
    UPDATE testimonios
    SET estado_id = (SELECT estado_id FROM estados WHERE nombre_estado = $1)
    WHERE testimonio_id = $2
    RETURNING *;
  `;
  const { rows } = await pool.query(query, [nuevo_estado, testimonio_id]);
  return rows[0];
};

// Obtener testimonios por estado
exports.obtenerTestimoniosPorEstado = async (estado) => {
  const query = `
    SELECT * FROM testimonios
    WHERE estado_id = (SELECT estado_id FROM estados WHERE nombre_estado = $1)
    ORDER BY fecha_creacion DESC;
  `;
  const { rows } = await pool.query(query, [estado]);
  return rows;
};
