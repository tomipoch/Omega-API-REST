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
    WHERE estado_id = (SELECT estado_id FROM estados WHERE nombre_estado = 'Confirmado')
    ORDER BY fecha_creacion DESC;
  `;
  const { rows } = await pool.query(query);
  return rows;
};

// Actualizar un testimonio
exports.actualizarTestimonio = async (usuario_id, testimonio_id, contenido, estrellas) => {
  const query = `
    UPDATE testimonios
    SET contenido = $1, estrellas = $2, estado_id = (SELECT estado_id FROM estados WHERE nombre_estado = 'Pendiente')
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
    SELECT t.*, u.nombre, u.apellido_paterno, u.apellido_materno
    FROM testimonios t
    JOIN usuarios u ON t.usuario_id = u.usuario_id
    WHERE t.estado_id = (SELECT estado_id FROM estados WHERE nombre_estado = $1)
    ORDER BY t.fecha_creacion DESC;
  `;
  const { rows } = await pool.query(query, [estado]);
  return rows;
};

// Obtener testimonios con filtros (estrellas, usuario, paginación)
exports.obtenerTestimoniosConFiltros = async ({ stars, usuario_id, limit, page }) => {
  let query = `
    SELECT t.*, u.nombre, u.apellido_paterno, u.apellido_materno, e.nombre_estado
    FROM testimonios t
    JOIN usuarios u ON t.usuario_id = u.usuario_id
    JOIN estados e ON t.estado_id = e.estado_id
  `;
  
  const values = [];
  let paramIndex = 1;
  let whereClause = '';

  // Si hay filtro por usuario específico, mostramos todos sus testimonios
  if (usuario_id) {
    whereClause = ` WHERE t.usuario_id = $${paramIndex}`;
    values.push(parseInt(usuario_id));
    paramIndex++;
  } else {
    // Si no hay filtro por usuario, solo mostramos los confirmados
    whereClause = ` WHERE t.estado_id = (SELECT estado_id FROM estados WHERE nombre_estado = 'Confirmado')`;
  }

  query += whereClause;

  // Filtro por estrellas
  if (stars) {
    query += ` AND t.estrellas = $${paramIndex}`;
    values.push(parseInt(stars));
    paramIndex++;
  }

  // Ordenamiento y paginación
  query += ` ORDER BY t.fecha_creacion DESC`;
  
  if (limit && page) {
    const offset = (page - 1) * limit;
    query += ` LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`;
    values.push(limit, offset);
  }

  const { rows } = await pool.query(query, values);
  return rows;
};

// Eliminar un testimonio como administrador (sin restricción de usuario)
exports.eliminarTestimonioAdmin = async (testimonio_id) => {
  const query = `
    DELETE FROM testimonios
    WHERE testimonio_id = $1
    RETURNING *;
  `;
  const { rows } = await pool.query(query, [testimonio_id]);
  return rows[0];
};
