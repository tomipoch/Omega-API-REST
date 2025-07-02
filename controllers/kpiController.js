const KpiModel = require('../models/kpiModel');

const KpiController = {
  async getKPIs(req, res) {
    try {
      const [
        totalReservas,
        reservasPorEstado,
        productosTop,
        totalUsuarios,
        nuevosUsuarios,
        usuariosPorRol,
        totalCitas,
        citasPorEstado,
        serviciosTop
      ] = await Promise.all([
        KpiModel.totalReservas(),
        KpiModel.reservasPorEstado(),
        KpiModel.productosMasReservados(),
        KpiModel.totalUsuarios(),
        KpiModel.nuevosUsuariosPorMes(),
        KpiModel.usuariosPorRol(),
        KpiModel.totalCitas(),
        KpiModel.citasPorEstado(),
        KpiModel.serviciosMasSolicitadosEnCitas()
      ]);

      res.json({
        reservas: {
          total: totalReservas.total,
          porEstado: reservasPorEstado,
          productosTop
        },
        usuarios: {
          total: totalUsuarios.total,
          nuevosPorMes: nuevosUsuarios,
          porRol: usuariosPorRol
        },
        citas: {
          total: totalCitas.total,
          porEstado: citasPorEstado,
          serviciosTop
        }
      });
    } catch (error) {
      console.error('Error en KPIs:', error);
      res.status(500).json({ error: 'Error al obtener KPIs' });
    }
  }
};

module.exports = KpiController;
