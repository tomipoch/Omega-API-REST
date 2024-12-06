const citasModel = require('../models/citasModel');

// Crear una nueva cita
exports.crearCita = async (req, res, next) => {
  const { fecha_hora, servicio_id, estado_id, notas } = req.body;
  try {
    const cita = await citasModel.crearCita(req.userId, fecha_hora, servicio_id, estado_id, notas);
    res.status(201).json(cita);
  } catch (error) {
    next(error);
  }
};

// Obtener todas las citas del usuario
exports.obtenerCitas = async (req, res, next) => {
  try {
    const citas = await citasModel.obtenerCitas(req.userId);
    res.json(citas);
  } catch (error) {
    next(error);
  }
};

exports.actualizarCita = async (req, res, next) => {
  let { fecha_hora, servicio_id, estado_id, notas } = req.body;
  const { id } = req.params;

  // Si fecha_hora no se envía, asigna la fecha/hora actual (o cualquier otro valor predeterminado)
  if (!fecha_hora) {
    fecha_hora = new Date().toISOString(); // Fecha/hora actual en formato ISO
  }

  try {
    const cita = await citasModel.actualizarCita(req.userId, id, fecha_hora, servicio_id, estado_id, notas);
    if (!cita) {
      return res.status(404).json({ message: 'Cita no encontrada o no tienes permiso para actualizarla.' });
    }
    res.json(cita);
  } catch (error) {
    next(error);
  }
};

// Eliminar una cita
exports.eliminarCita = async (req, res, next) => {
  const { id } = req.params;
  try {
    const resultado = await citasModel.eliminarCita(req.userId, id);
    if (!resultado) {
      return res.status(404).json({ message: 'Cita no encontrada o no tienes permiso para eliminarla.' });
    }
    res.json({ message: 'Cita eliminada con éxito.' });
  } catch (error) {
    next(error);
  }
};
