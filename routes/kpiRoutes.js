const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth'); // Importar tu middleware
const pool = require('../db'); // Asegúrate de que este es tu pool de PostgreSQL

router.get('/kpi', auth, async (req, res) => {
  try {
    if (req.userRol !== 2) {
      return res.status(403).json({ message: 'Acceso denegado: solo administradores.' });
    }

    const [usuarios, reservas, citas, eventos, servicios] = await Promise.all([
      pool.query('SELECT COUNT(*) FROM usuarios'),
      pool.query("SELECT COUNT(*) FROM reservas WHERE estado_reserva = 'confirmada'"),
      pool.query('SELECT COUNT(*) FROM citas WHERE estado_id IS NOT NULL'),
      pool.query('SELECT COUNT(*) FROM eventos'),
      pool.query('SELECT COUNT(*) FROM servicios')
    ]);

    res.json({
      total_usuarios: parseInt(usuarios.rows[0].count),
      reservas_confirmadas: parseInt(reservas.rows[0].count),
      citas_agendadas: parseInt(citas.rows[0].count),
      total_eventos: parseInt(eventos.rows[0].count),
      total_servicios: parseInt(servicios.rows[0].count)
    });
  } catch (error) {
    console.error('Error al obtener los KPIs:', error.message);
    res.status(500).json({ message: 'Error del servidor al obtener los KPIs.' });
  }
});


router.get('/kpi/reservas-mensuales', auth, async (req, res) => {
  try {
    if (req.userRol !== 2) {
      return res.status(403).json({ message: 'Acceso denegado: solo administradores.' });
    }

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

    const meses = [];
    const valores = [];

    result.rows.forEach(row => {
      // Capitalizamos el mes y eliminamos espacios
      const mesFormateado = row.mes.trim().charAt(0).toUpperCase() + row.mes.trim().slice(1);
      meses.push(mesFormateado);
      valores.push(parseInt(row.total_reservas));
    });

    res.json({ meses, valores });
  } catch (error) {
    console.error('Error reservas mensuales:', error);
    res.status(500).json({ message: 'Error interno al obtener reservas mensuales' });
  }
});



module.exports = router;
