const pool = require('../database/pgPool');

exports.totalUsuarios = async () => {
  const { rows: [{ total }] } = await pool.query(
    'SELECT COUNT(*)::int AS total FROM usuarios'
  );
  return total;
};

exports.reservasConfirmadas = async () => {
  const { rows: [{ total }] } = await pool.query(
    `SELECT COUNT(*)::int AS total FROM reservas WHERE estado_reserva = 'confirmada'`
  );
  return total;
};

exports.citasAgendadas = async () => {
  const { rows: [{ total }] } = await pool.query(
    `SELECT COUNT(*)::int AS total FROM citas`
  );
  return total;
};

exports.totalEventos = async () => {
  const { rows: [{ total }] } = await pool.query(
    `SELECT COUNT(*)::int AS total FROM eventos`
  );
  return total;
};

exports.totalServicios = async () => {
  const { rows: [{ total }] } = await pool.query(
    `SELECT COUNT(*)::int AS total FROM servicios`
  );
  return total;
};

exports.reservasMensuales = async () => {
  const { rows } = await pool.query(
    `SELECT TO_CHAR(fecha_reserva, 'YYYY-MM') AS mes,
            COUNT(*)::int AS total,
            SUM(cantidad_reservada)::int AS unidades
     FROM reservas
     WHERE fecha_reserva >= NOW() - INTERVAL '12 months'
     GROUP BY TO_CHAR(fecha_reserva, 'YYYY-MM')
     ORDER BY mes ASC`
  );
  return rows;
};

exports.reservasPorEstado = async () => {
  const { rows } = await pool.query(
    `SELECT estado_reserva, COUNT(*)::int AS total
     FROM reservas
     WHERE fecha_reserva >= NOW() - INTERVAL '30 days'
     GROUP BY estado_reserva`
  );
  return rows;
};

exports.getResumen = async () => {
  const [
    totalUsuarios,
    reservasConfirmadas,
    citasAgendadas,
    totalEventos,
    totalServicios
  ] = await Promise.all([
    exports.totalUsuarios(),
    exports.reservasConfirmadas(),
    exports.citasAgendadas(),
    exports.totalEventos(),
    exports.totalServicios()
  ]);

  return {
    fecha: new Date().toISOString(),
    total_usuarios: totalUsuarios,
    reservas_confirmadas: reservasConfirmadas,
    citas_agendadas: citasAgendadas,
    total_eventos: totalEventos,
    total_servicios: totalServicios
  };
};