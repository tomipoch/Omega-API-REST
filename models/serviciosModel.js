const pool = require('../db');

// Obtener todos los servicios
exports.obtenerServicios = async () => {
  const query = `
    SELECT servicio_id, nombre_servicio, descripcion, precio, duracion_estimada
    FROM servicios
    ORDER BY nombre_servicio;
  `;
  const { rows } = await pool.query(query);
  return rows;
};

// Crear un nuevo servicio
exports.crearServicio = async (servicioData) => {
  const { nombre_servicio, descripcion, precio, duracion_estimada } = servicioData;
  const query = `
    INSERT INTO servicios (nombre_servicio, descripcion, precio, duracion_estimada)
    VALUES ($1, $2, $3, $4)
    RETURNING servicio_id, nombre_servicio, descripcion, precio, duracion_estimada;
  `;
  const { rows } = await pool.query(query, [nombre_servicio, descripcion, precio, duracion_estimada]);
  return rows[0];
};

// Actualizar un servicio
exports.actualizarServicio = async (servicioId, servicioData) => {
  const { nombre_servicio, descripcion, precio, duracion_estimada } = servicioData;
  const query = `
    UPDATE servicios 
    SET nombre_servicio = $1, descripcion = $2, precio = $3, duracion_estimada = $4
    WHERE servicio_id = $5
    RETURNING servicio_id, nombre_servicio, descripcion, precio, duracion_estimada;
  `;
  const { rows } = await pool.query(query, [nombre_servicio, descripcion, precio, duracion_estimada, servicioId]);
  return rows[0];
};

// Eliminar un servicio
exports.eliminarServicio = async (servicioId) => {
  const query = `
    DELETE FROM servicios 
    WHERE servicio_id = $1
    RETURNING servicio_id;
  `;
  const { rows } = await pool.query(query, [servicioId]);
  return rows[0];
};
