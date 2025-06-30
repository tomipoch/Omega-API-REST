const auditoriaModel = require('../models/auditoriaModel');

// Registrar un evento de auditoría
exports.registrarEvento = async (usuario_id, accion, detalles) => {
  try {
    console.log('Registrando evento de auditoría:', { usuario_id, accion, detalles });
    const evento = await auditoriaModel.registrarAuditoria(usuario_id, accion, detalles);
    console.log('Evento de auditoría registrado exitosamente');
    return evento; // Opcional: puedes devolver el evento registrado si lo necesitas
  } catch (error) {
    console.error('Error al registrar auditoría:', error);
    console.error('Error code:', error.code);
    console.error('Error detail:', error.detail);
    // No lanzar error para evitar que bloquee la operación principal
    return null;
  }
};
