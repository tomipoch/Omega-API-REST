const pool = require('../db');

// Crear una nueva solicitud de personalización con imágenes
exports.crearSolicitud = async (usuario_id, servicio_id, detalles, imagenes) => {
    const query = `
      INSERT INTO solicitudes_personalizacion (usuario_id, servicio_id, detalles, imagen_url)
      VALUES ($1, $2, $3, $4) RETURNING *;
    `;
    const { rows } = await pool.query(query, [usuario_id, servicio_id, detalles, imagenes]);
    return rows[0];
};
  
// Obtener todas las solicitudes de personalización (solo para admin)
exports.obtenerSolicitudes = async () => {
    const query = `
        SELECT * FROM solicitudes_personalizacion
        ORDER BY fecha_solicitud DESC;
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
