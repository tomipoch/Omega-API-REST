const pool = require('../database/pgPool');

exports.crearSolicitud = async (usuario_id, servicio_id, detalles) => {
  const query = `
    INSERT INTO solicitudes_personalizacion (usuario_id, servicio_id, detalles)
    VALUES ($1, $2, $3) RETURNING *;
  `;
  const { rows } = await pool.query(query, [usuario_id, servicio_id, detalles]);
  return rows[0];
};

exports.agregarImagen = async (solicitud_id, imagen_url) => {
  const query = `
    INSERT INTO solicitudes_imagenes (solicitud_id, imagen_url)
    VALUES ($1, $2) RETURNING *;
  `;
  const { rows } = await pool.query(query, [solicitud_id, imagen_url]);
  return rows[0];
};

exports.agregarImagenes = async (solicitud_id, imagenes) => {
  if (!imagenes.length) return [];
  const placeholders = imagenes.map((_, i) => `($1, $${i + 2})`).join(', ');
  const { rows } = await pool.query(
    `INSERT INTO solicitudes_imagenes (solicitud_id, imagen_url) VALUES ${placeholders} RETURNING *`,
    [solicitud_id, ...imagenes]
  );
  return rows;
};

exports.obtenerSolicitudes = async () => {
  const query = `
    SELECT sp.solicitud_id, sp.usuario_id, sp.servicio_id, sp.detalles,
           sp.estado_id, sp.fecha_solicitud,
           COALESCE(
               (SELECT array_agg(si.imagen_url ORDER BY si.created_at)
                  FROM solicitudes_imagenes si
                 WHERE si.solicitud_id = sp.solicitud_id),
               ARRAY[]::TEXT[]
           ) AS imagenes
    FROM solicitudes_personalizacion sp
    ORDER BY sp.fecha_solicitud DESC;
  `;
  const { rows } = await pool.query(query);
  return rows;
};

exports.actualizarEstadoSolicitud = async (solicitud_id, nuevo_estado) => {
  const query = `
    UPDATE solicitudes_personalizacion
    SET estado_id = (SELECT estado_id FROM estados WHERE nombre_estado = $1)
    WHERE solicitud_id = $2
    RETURNING *;
  `;
  const { rows } = await pool.query(query, [nuevo_estado, solicitud_id]);
  return rows[0];
};
