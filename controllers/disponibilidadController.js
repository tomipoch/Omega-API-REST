const disponibilidadModel = require('../models/disponibilidadModel');

const disponibilidadController = {
  // Crear nueva disponibilidad (solo admin)
  async crearDisponibilidad(req, res) {
    try {
      const { fecha, horaInicio, horaFin } = req.body;
      const adminId = req.userId;

      // Validaciones
      if (!fecha || !horaInicio || !horaFin) {
        return res.status(400).json({
          success: false,
          message: 'Fecha, hora de inicio y hora de fin son requeridos'
        });
      }

      // Validar que la fecha no sea pasada
      const fechaSeleccionada = new Date(fecha);
      const hoy = new Date();
      hoy.setHours(0, 0, 0, 0);

      if (fechaSeleccionada < hoy) {
        return res.status(400).json({
          success: false,
          message: 'No se puede crear disponibilidad para fechas pasadas'
        });
      }

      // Validar que hora inicio sea menor que hora fin
      if (horaInicio >= horaFin) {
        return res.status(400).json({
          success: false,
          message: 'La hora de inicio debe ser menor que la hora de fin'
        });
      }

      const disponibilidadId = await disponibilidadModel.crearDisponibilidad(
        fecha, horaInicio, horaFin, adminId
      );

      res.status(201).json({
        success: true,
        message: 'Disponibilidad creada exitosamente',
        data: { disponibilidad_id: disponibilidadId }
      });

    } catch (error) {
      console.error('Error al crear disponibilidad:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor'
      });
    }
  },

  // Obtener disponibilidades (admin)
  async obtenerDisponibilidades(req, res) {
    try {
      const { fecha, estado } = req.query;
      
      const disponibilidades = await disponibilidadModel.obtenerDisponibilidades(fecha, estado);

      res.json({
        success: true,
        data: disponibilidades
      });

    } catch (error) {
      console.error('Error al obtener disponibilidades:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor'
      });
    }
  },

  // Obtener disponibilidades para usuarios (públicas)
  async obtenerDisponibilidadesParaUsuarios(req, res) {
    try {
      const disponibilidades = await disponibilidadModel.obtenerDisponibilidadesParaUsuarios();

      res.json({
        success: true,
        data: disponibilidades
      });

    } catch (error) {
      console.error('Error al obtener disponibilidades para usuarios:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor'
      });
    }
  },

  // Obtener disponibilidades para usuarios con cita actual
  async obtenerDisponibilidadesParaUsuariosConCita(req, res) {
    try {
      const { citaId } = req.query;
      
      const disponibilidades = await disponibilidadModel.obtenerDisponibilidadesParaUsuariosConCitaActual(citaId);

      res.json({
        success: true,
        data: disponibilidades
      });

    } catch (error) {
      console.error('Error al obtener disponibilidades para usuarios con cita:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor'
      });
    }
  },

  // Actualizar disponibilidad (solo admin)
  async actualizarDisponibilidad(req, res) {
    try {
      const { id } = req.params;
      const { fecha, horaInicio, horaFin, estado } = req.body;

      // Validaciones
      if (!fecha || !horaInicio || !horaFin || !estado) {
        return res.status(400).json({
          success: false,
          message: 'Todos los campos son requeridos'
        });
      }

      // Validar estados permitidos
      const estadosPermitidos = ['disponible', 'ocupada', 'cancelada'];
      if (!estadosPermitidos.includes(estado)) {
        return res.status(400).json({
          success: false,
          message: 'Estado no válido'
        });
      }

      // Validar que hora inicio sea menor que hora fin
      if (horaInicio >= horaFin) {
        return res.status(400).json({
          success: false,
          message: 'La hora de inicio debe ser menor que la hora de fin'
        });
      }

      const actualizado = await disponibilidadModel.actualizarDisponibilidad(
        id, fecha, horaInicio, horaFin, estado
      );

      if (!actualizado) {
        return res.status(404).json({
          success: false,
          message: 'Disponibilidad no encontrada'
        });
      }

      res.json({
        success: true,
        message: 'Disponibilidad actualizada exitosamente'
      });

    } catch (error) {
      console.error('Error al actualizar disponibilidad:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor'
      });
    }
  },

  // Eliminar disponibilidad (solo admin)
  async eliminarDisponibilidad(req, res) {
    try {
      const { id } = req.params;

      const eliminado = await disponibilidadModel.eliminarDisponibilidad(id);

      if (!eliminado) {
        return res.status(404).json({
          success: false,
          message: 'Disponibilidad no encontrada'
        });
      }

      res.json({
        success: true,
        message: 'Disponibilidad eliminada exitosamente'
      });

    } catch (error) {
      console.error('Error al eliminar disponibilidad:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor'
      });
    }
  },

  // Obtener disponibilidades por rango de fechas
  async obtenerDisponibilidadesPorRango(req, res) {
    try {
      const { fechaInicio, fechaFin } = req.query;

      if (!fechaInicio || !fechaFin) {
        return res.status(400).json({
          success: false,
          message: 'Fecha de inicio y fecha de fin son requeridas'
        });
      }

      const disponibilidades = await disponibilidadModel.obtenerDisponibilidadesPorRango(
        fechaInicio, fechaFin
      );

      res.json({
        success: true,
        data: disponibilidades
      });

    } catch (error) {
      console.error('Error al obtener disponibilidades por rango:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor'
      });
    }
  }
};

module.exports = disponibilidadController;
