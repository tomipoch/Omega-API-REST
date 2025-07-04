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

  async stockDisponibleVsVendido() {
    const result = await pool.query(`
      SELECT 
        p.producto_id,
        p.nombre_producto,
        p.stock,
        COALESCE(SUM(r.cantidad_reservada),0) AS vendidos
      FROM productos p
      LEFT JOIN reservas r ON p.producto_id = r.producto_id AND r.estado_reserva = 'confirmada'
      GROUP BY p.producto_id, p.nombre_producto, p.stock
    `);
    return result.rows;
  },

  async tasaCancelacion() {
    const result = await pool.query(`
      SELECT 
        ROUND(
          (SUM(CASE WHEN estado_reserva = 'cancelada' THEN 1 ELSE 0 END)::decimal / COUNT(*)) * 100, 2
        ) AS porcentaje_cancelacion
      FROM reservas
    `);
    return result.rows[0];
  },

  async ingresosMensuales() {
    const result = await pool.query(`
      SELECT 
        TO_CHAR(fecha_reserva, 'YYYY-MM') AS mes,
        SUM(monto_total) AS ingresos
      FROM reservas
      WHERE estado_reserva = 'confirmada'
      GROUP BY mes
      ORDER BY mes DESC
      LIMIT 12
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
  },

  async reservasMensualesActivas() {
    const result = await pool.query(`
      SELECT
        TO_CHAR(fecha_reserva, 'TMMonth') AS mes,
        DATE_TRUNC('month', fecha_reserva) AS mes_fecha,
        COUNT(*) AS total_reservas
      FROM reservas
      WHERE estado_reserva = 'activa'
        AND fecha_reserva >= NOW() - INTERVAL '12 months'
      GROUP BY mes, mes_fecha
      ORDER BY mes_fecha ASC;
    `);
    return result.rows;
  },
};

module.exports = KpiModel;

