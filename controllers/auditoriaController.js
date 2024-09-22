const auditoriaModel = require('../models/auditoriaModel');

// Registrar un evento de auditoría
exports.registrarEvento = async (usuario_id, accion, detalles) => {
  try {
    const evento = await auditoriaModel.registrarAuditoria(usuario_id, accion, detalles);
    return evento; // Opcional: puedes devolver el evento registrado si lo necesitas
  } catch (error) {
    console.error('Error al registrar auditoría:', error);
    throw new Error('No se pudo registrar el evento de auditoría');
  }
};
