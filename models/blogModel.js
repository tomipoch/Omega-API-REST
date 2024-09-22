const pool = require('../db');

// Crear una nueva publicación
exports.crearPublicacion = async (autor_id, titulo, contenido) => {
  const query = `
    INSERT INTO publicaciones_blog (titulo, contenido, autor_id)
    VALUES ($1, $2, $3) RETURNING *;
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
