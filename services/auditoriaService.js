const auditoriaModel = require('../models/auditoriaModel');

exports.registrar = async (usuarioId, accion, detalles) => {
  try {
    return await auditoriaModel.registrarAuditoria(usuarioId, accion, detalles);
  } catch (error) {
    return null;
  }
};