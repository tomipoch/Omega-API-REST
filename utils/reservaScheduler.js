const cron = require('node-cron');
const Reservas = require('../models/reservasModel');
const logger = require('./logger');

class ReservaScheduler {
  static iniciar() {
    cron.schedule('*/5 * * * *', async () => {
      try {
        const reservasLimpiadas = await Reservas.limpiarReservasExpiradas();
        if (reservasLimpiadas > 0) {
          logger.info(`Se limpiaron ${reservasLimpiadas} reservas expiradas y se devolvió el stock`);
        }
      } catch (error) {
        logger.error(`Error al limpiar reservas expiradas: ${error.message}`);
      }
    });

    cron.schedule('0 * * * *', async () => {
      try {
        const estadisticas = await ReservaScheduler.generarEstadisticas();
        logger.info(`Estadísticas de reservas: ${JSON.stringify(estadisticas)}`);
      } catch (error) {
        logger.error(`Error al generar estadísticas: ${error.message}`);
      }
    });
  }

  static async generarEstadisticas() {
    try {
      const resultados = await Reservas.obtenerEstadisticas24h();
      return {
        fecha: new Date().toISOString(),
        ultimas_24_horas: resultados,
        total_reservas: resultados.reduce((sum, item) => sum + item.cantidad, 0),
        total_productos: resultados.reduce((sum, item) => sum + item.productos_reservados, 0)
      };
    } catch (error) {
      logger.error(`Error al generar estadísticas: ${error.message}`);
      return { error: error.message };
    }
  }

  static detener() {
    cron.getTasks().forEach(task => task.stop());
  }
}

module.exports = ReservaScheduler;