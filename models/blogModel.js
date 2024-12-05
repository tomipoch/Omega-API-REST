const pool = require('../db');

// Crear una nueva publicación
exports.crearPublicacion = async (autor_id, titulo, contenido) => {
  const query = `
    INSERT INTO publicaciones_blog (titulo, contenido, autor_id)
    VALUES ($1, $2, $3)
    RETURNING *;
  `;
  const { rows } = await pool.query(query, [titulo, contenido, autor_id]);
  return rows[0];
};

// Obtener todas las publicaciones
exports.obtenerPublicaciones = async () => {
  const query = 'SELECT * FROM publicaciones_blog ORDER BY fecha_publicacion DESC';
  const { rows } = await pool.query(query);
  return rows;
};

// Obtener una publicación por ID
exports.obtenerPublicacionPorId = async (publicacion_id) => {
  const query = 'SELECT * FROM publicaciones_blog WHERE publicacion_id = $1';
  const { rows } = await pool.query(query, [publicacion_id]);
  return rows[0];
};

// Actualizar una publicación
exports.actualizarPublicacion = async (publicacion_id, titulo, contenido) => {
  const query = `
    UPDATE publicaciones_blog
    SET titulo = $1, contenido = $2
    WHERE publicacion_id = $3
    RETURNING *;
  `;
  const { rows } = await pool.query(query, [titulo, contenido, publicacion_id]);
  return rows[0];
};

// Eliminar una publicación
exports.eliminarPublicacion = async (publicacion_id) => {
  const query = 'DELETE FROM publicaciones_blog WHERE publicacion_id = $1 RETURNING *';
  const { rows } = await pool.query(query, [publicacion_id]);
  return rows[0];
};

// Crear secciones asociadas a una publicación
exports.crearSecciones = async (publicacion_id, secciones) => {
  const query = `
    INSERT INTO secciones_blog (publicacion_id, subtitulo, contenido)
    VALUES ($1, $2, $3)
  `;

  const promises = secciones.map((seccion) => {
    if (!seccion.subtitulo || !seccion.contenido) {
      throw new Error('Subtítulo o contenido vacío en las secciones.');
    }
    return pool.query(query, [publicacion_id, seccion.subtitulo, seccion.contenido]);
  });

  await Promise.all(promises);
};

// Obtener las secciones asociadas a una publicación
exports.obtenerSeccionesPorPublicacionId = async (publicacion_id) => {
  const query = `
    SELECT seccion_id, subtitulo, contenido
    FROM secciones_blog
    WHERE publicacion_id = $1
    ORDER BY seccion_id ASC
  `;
  const { rows } = await pool.query(query, [publicacion_id]);
  return rows;
};

// Eliminar todas las secciones asociadas a una publicación
exports.eliminarSeccionesPorPublicacionId = async (publicacion_id) => {
  const query = `
    DELETE FROM secciones_blog WHERE publicacion_id = $1
  `;
  await pool.query(query, [publicacion_id]);
};

exports.obtenerPublicacionesPaginadas = async (limit, offset) => {
  const query = `
    SELECT * FROM publicaciones_blog
    ORDER BY fecha_publicacion DESC
    LIMIT $1 OFFSET $2;
  `;
  const { rows } = await pool.query(query, [limit, offset]);
  return rows;
};

exports.contarTotalPublicaciones = async () => {
  const query = 'SELECT COUNT(*)::int AS total FROM publicaciones_blog';
  const { rows } = await pool.query(query);
  return rows[0]; // Devuelve un objeto { total: <número> }
};
