const auditoriaModel = require('../models/auditoriaModel');
const logger = require('../utils/logger');

exports.registrarEvento = async (usuario_id, accion, detalles) => {
  try {
    const evento = await auditoriaModel.registrarAuditoria(usuario_id, accion, detalles);
    return evento;
  } catch (error) {
    logger.warn(`Auditoría no crítica falló: ${error.message}`);
    return null;
  }
};
