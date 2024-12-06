const pool = require('../db');

// Obtener todos los servicios
exports.obtenerServicios = async () => {
  const query = `
    SELECT servicio_id, nombre_servicio, descripcion, precio 
    FROM servicios;
  `;
  const { rows } = await pool.query(query);
  return rows;
};
