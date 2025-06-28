const cron = require('node-cron');
const Reserva = require('../models/reservaModel');

class ReservaScheduler {
  static iniciar() {
    // Ejecutar cada 5 minutos para limpiar reservas expiradas
    cron.schedule('*/5 * * * *', async () => {
      try {
        console.log('🧹 Iniciando limpieza de reservas expiradas...');
        const reservasLimpiadas = await Reserva.limpiarReservasExpiradas();
        
        if (reservasLimpiadas > 0) {
          console.log(`✅ Se limpiaron ${reservasLimpiadas} reservas expiradas y se devolvió el stock`);
        } else {
          console.log('✅ No hay reservas expiradas que limpiar');
        }
      } catch (error) {
        console.error('❌ Error al limpiar reservas expiradas:', error);
      }
    });

    // Ejecutar cada hora para generar reporte de reservas
    cron.schedule('0 * * * *', async () => {
      try {
        const estadisticas = await ReservaScheduler.generarEstadisticas();
        console.log('📊 Estadísticas de reservas:', estadisticas);
      } catch (error) {
        console.error('❌ Error al generar estadísticas:', error);
      }
    });

    console.log('🕐 Programador de reservas iniciado');
    console.log('   - Limpieza de reservas expiradas: cada 5 minutos');
    console.log('   - Estadísticas de reservas: cada hora');
  }

  static async generarEstadisticas() {
    try {
      const sequelize = require('../config/sequelize');
      
      const [resultados] = await sequelize.query(`
        SELECT 
          estado_reserva,
          COUNT(*) as cantidad,
          SUM(cantidad_reservada) as productos_reservados
        FROM reservas 
        WHERE fecha_reserva >= NOW() - INTERVAL '24 hours'
        GROUP BY estado_reserva
      `);

      const estadisticas = {
        fecha: new Date().toISOString(),
        ultimas_24_horas: resultados,
        total_reservas: resultados.reduce((sum, item) => sum + parseInt(item.cantidad), 0),
        total_productos: resultados.reduce((sum, item) => sum + parseInt(item.productos_reservados), 0)
      };

      return estadisticas;
    } catch (error) {
      console.error('Error al generar estadísticas:', error);
      return { error: error.message };
    }
  }

  static detener() {
    cron.getTasks().forEach(task => task.stop());
    console.log('🛑 Programador de reservas detenido');
  }
}

module.exports = ReservaScheduler;
