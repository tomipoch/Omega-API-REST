const KpiModel = require('../models/kpiModel');

const KpiController = {
  async getResumenKPIs(req, res) {
    try {
      if (req.userRol !== 2) {
        return res.status(403).json({ message: 'Acceso denegado: solo administradores.' });
      }

      const [
        totalUsuarios,
        reservasConfirmadas,
        citasAgendadas,
        totalEventos,
        totalServicios
      ] = await Promise.all([
        KpiModel.totalUsuarios(),
        KpiModel.reservasConfirmadas(),
        KpiModel.citasAgendadas(),
        KpiModel.totalEventos(),
        KpiModel.totalServicios()
      ]);

      res.json({
        total_usuarios: parseInt(totalUsuarios.total),
        reservas_confirmadas: parseInt(reservasConfirmadas.total),
        citas_agendadas: parseInt(citasAgendadas.total),
        total_eventos: parseInt(totalEventos.total),
        total_servicios: parseInt(totalServicios.total)
      });
    } catch (error) {
      console.error('Error al obtener los KPIs:', error);
      res.status(500).json({ message: 'Error del servidor al obtener los KPIs.' });
    }
  },

  async getReservasMensuales(req, res) {
    try {
      if (req.userRol !== 2) {
        return res.status(403).json({ message: 'Acceso denegado: solo administradores.' });
      }

      const rows = await KpiModel.reservasMensualesActivas();

      const meses = [];
      const valores = [];

      rows.forEach(row => {
        const mesFormateado = row.mes.trim().charAt(0).toUpperCase() + row.mes.trim().slice(1);
        meses.push(mesFormateado);
        valores.push(parseInt(row.total_reservas));
      });

      res.json({ meses, valores });
    } catch (error) {
      console.error('Error reservas mensuales:', error);
      res.status(500).json({ message: 'Error interno al obtener reservas mensuales' });
    }
  }
};

module.exports = KpiController;
