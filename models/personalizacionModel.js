const pool = require('../db');

// Crear una nueva solicitud de personalización
exports.crearSolicitud = async (usuario_id, servicio_id, detalles) => {
    const query = `
      INSERT INTO solicitudes_personalizacion (usuario_id, servicio_id, detalles)
      VALUES ($1, $2, $3) RETURNING *;
    `;
    const { rows } = await pool.query(query, [usuario_id, servicio_id, detalles]);
    return rows[0];
};

// Agregar una imagen asociada a una solicitud
exports.agregarImagen = async (solicitud_id, imagen_url) => {
  const query = `
    INSERT INTO solicitudes_imagenes (solicitud_id, imagen_url)
    VALUES ($1, $2) RETURNING *;
  `;
  const { rows } = await pool.query(query, [solicitud_id, imagen_url]);
  return rows[0];
};

// Obtener todas las solicitudes de personalización (solo para admin)
exports.obtenerSolicitudes = async () => {
    const query = `
        SELECT sp.*, array_agg(si.imagen_url) AS imagenes
        FROM solicitudes_personalizacion sp
        LEFT JOIN solicitudes_imagenes si ON sp.solicitud_id = si.solicitud_id
        GROUP BY sp.solicitud_id
        ORDER BY sp.fecha_solicitud DESC;
    `;
    const { rows } = await pool.query(query);
    return rows;
};

// Actualizar el estado de una solicitud (aceptar o rechazar)
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
