const pool = require('../database/pgPool');
const { withTransaction } = require('../utils/db');

exports.crearPublicacion = async (autor_id, titulo, contenido) => {
  const query = `
    INSERT INTO publicaciones_blog (titulo, contenido, autor_id)
    VALUES ($1, $2, $3)
    RETURNING *;
  `;
  const { rows } = await pool.query(query, [titulo, contenido, autor_id]);
  return rows[0];
};

exports.obtenerPublicaciones = async () => {
  const query = 'SELECT * FROM publicaciones_blog ORDER BY fecha_publicacion DESC';
  const { rows } = await pool.query(query);
  return rows;
};

exports.obtenerPublicacionPorId = async (publicacion_id) => {
  const query = 'SELECT * FROM publicaciones_blog WHERE publicacion_id = $1';
  const { rows } = await pool.query(query, [publicacion_id]);
  return rows[0];
};

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

exports.eliminarPublicacion = async (publicacion_id) => {
  const query = 'DELETE FROM publicaciones_blog WHERE publicacion_id = $1 RETURNING *';
  const { rows } = await pool.query(query, [publicacion_id]);
  return rows[0];
};

exports.crearSecciones = async (client, publicacion_id, secciones) => {
  if (!secciones.length) return;
  const query = `
    INSERT INTO secciones_blog (publicacion_id, subtitulo, contenido, orden)
    VALUES ($1, $2, $3, $4)
  `;
  for (let i = 0; i < secciones.length; i++) {
    const seccion = secciones[i];
    if (!seccion.subtitulo || !seccion.contenido) {
      throw new Error('Subtítulo o contenido vacío en las secciones.');
    }
    await client.query(query, [publicacion_id, seccion.subtitulo, seccion.contenido, i]);
  }
};

exports.obtenerSeccionesPorPublicacionId = async (publicacion_id) => {
  const query = `
    SELECT seccion_id, subtitulo, contenido, orden
    FROM secciones_blog
    WHERE publicacion_id = $1
    ORDER BY orden ASC, seccion_id ASC
  `;
  const { rows } = await pool.query(query, [publicacion_id]);
  return rows;
};

exports.eliminarSeccionesPorPublicacionId = async (client, publicacion_id) => {
  await client.query('DELETE FROM secciones_blog WHERE publicacion_id = $1', [publicacion_id]);
};

exports.crearPublicacionConSecciones = async (autor_id, titulo, contenido, secciones) => {
  return withTransaction(async (client) => {
    const { rows: [publicacion] } = await client.query(
      'INSERT INTO publicaciones_blog (titulo, contenido, autor_id) VALUES ($1, $2, $3) RETURNING *',
      [titulo, contenido, autor_id]
    );
    await exports.crearSecciones(client, publicacion.publicacion_id, secciones);
    return publicacion;
  });
};

exports.actualizarPublicacionConSecciones = async (publicacion_id, titulo, contenido, secciones) => {
  return withTransaction(async (client) => {
    const { rows: [actualizada] } = await client.query(
      'UPDATE publicaciones_blog SET titulo = $1, contenido = $2 WHERE publicacion_id = $3 RETURNING *',
      [titulo, contenido, publicacion_id]
    );
    if (!actualizada) return null;
    await exports.eliminarSeccionesPorPublicacionId(client, publicacion_id);
    await exports.crearSecciones(client, publicacion_id, secciones);
    return actualizada;
  });
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
  return rows[0];
};
