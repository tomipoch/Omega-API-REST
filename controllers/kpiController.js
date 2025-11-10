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
  },


  async getReservasEstados(req, res) {
    try {
      if (req.userRol !== 2) {
        return res.status(403).json({ message: 'Acceso denegado: solo administradores.' });
      }

      const rows = await KpiModel.reservasEstados();

      const labels = [];           // Para los nombres de los estados
      const data = [];            // Para los valores numéricos
      const backgroundColor = [];

      const colorMap = {
        'confirmada': '#4CAF50',  // Verde
        'expirada': '#FF9800',    // Naranja  
        'cancelada': '#F44336'    // Rojo
      };

      rows.forEach(row => {
        const estado = row.estado_reserva;
        const estadoFormateado = estado.charAt(0).toUpperCase() + estado.slice(1);
        const valor = parseInt(row.total);

        labels.push(estadoFormateado);
        data.push(valor);
        backgroundColor.push(colorMap[estado] || '#9E9E9E');
      });

      const chartData = {
        labels: labels,
        datasets: [{
          data: data,
          backgroundColor: backgroundColor
        }]
      };

      res.json(chartData);
    } catch (error) {
      console.error('Error reservas mensuales:', error);
      res.status(500).json({ message: 'Error interno al obtener reservas mensuales' });
    }
  }

};

module.exports = KpiController;
