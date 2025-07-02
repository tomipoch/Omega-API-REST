const pool = require('../db');

const KpiModel = {
  // --- Reservas ---
  async totalReservas() {
    const result = await pool.query(`SELECT COUNT(*) AS total FROM reservas`);
    return result.rows[0];
  },

  async reservasPorEstado() {
    const result = await pool.query(`
      SELECT estado_reserva, COUNT(*) AS cantidad
      FROM reservas
      GROUP BY estado_reserva
    `);
    return result.rows;
  },

  async productosMasReservados() {
    const result = await pool.query(`
      SELECT p.nombre_producto, SUM(r.cantidad_reservada) AS total_reservado
      FROM reservas r
      JOIN productos p ON r.producto_id = p.producto_id
      GROUP BY p.nombre_producto
      ORDER BY total_reservado DESC
      LIMIT 5
    `);
    return result.rows;
  },

  // --- Usuarios ---
  async totalUsuarios() {
    const result = await pool.query(`SELECT COUNT(*) AS total FROM usuarios`);
    return result.rows[0];
  },

  async nuevosUsuariosPorMes() {
    const result = await pool.query(`
      SELECT TO_CHAR(fecha_registro, 'YYYY-MM') AS mes, COUNT(*) AS cantidad
      FROM usuarios
      GROUP BY mes
      ORDER BY mes DESC
      LIMIT 6
    `);
    return result.rows;
  },

  async usuariosPorRol() {
    const result = await pool.query(`
      SELECT rol_id, COUNT(*) AS cantidad
      FROM usuarios
      GROUP BY rol_id
    `);
    return result.rows;
  },

  // --- Citas ---
  async totalCitas() {
    const result = await pool.query(`SELECT COUNT(*) AS total FROM citas`);
    return result.rows[0];
  },

  async citasPorEstado() {
    const result = await pool.query(`
      SELECT estado_id, COUNT(*) AS cantidad
      FROM citas
      GROUP BY estado_id
    `);
    return result.rows;
  },

  async serviciosMasSolicitadosEnCitas() {
    const result = await pool.query(`
      SELECT s.nombre_servicio, COUNT(*) AS total
      FROM citas c
      JOIN servicios s ON c.servicio_id = s.servicio_id
      GROUP BY s.nombre_servicio
      ORDER BY total DESC
      LIMIT 5
    `);
    return result.rows;
  }
};

module.exports = KpiModel;
