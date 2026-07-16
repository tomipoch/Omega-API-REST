const chatbotService = require('../services/chatbotService');
const auditoria = require('../services/auditoriaService');
const { asyncHandler } = require('../utils/asyncHandler');
const { UnauthorizedError } = require('../utils/errors');
const logger = require('../utils/logger');

exports.procesarMensaje = asyncHandler(async (req, res) => {
  if (!req.userId) {
    throw new UnauthorizedError('No autenticado.');
  }

  const { mensaje } = req.body;
  const resultado = await chatbotService.procesarMensaje({ mensaje });

  logger.debug(`Chatbot: tipo=${resultado.tipo} mensaje=${mensaje?.slice(0, 50)}`);
  await auditoria.registrar(req.userId, 'consulta_chatbot', `tipo=${resultado.tipo}`);

  res.status(200).json(resultado);
});