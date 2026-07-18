const logger = require('../utils/logger');
const { AppError } = require('../utils/errors');

module.exports = (err, req, res, _next) => {
  logger.error(err.stack || err.message);

  if (err instanceof AppError) {
    return res.status(err.statusCode).json({
      message: err.message,
      code: err.code,
      ...(err.details && { details: err.details }),
      ...(err.data && { data: err.data })
    });
  }

  if (err instanceof SyntaxError && 'body' in err) {
    return res.status(400).json({ message: 'JSON malformado', code: 'MALFORMED_JSON' });
  }
  if (err.type === 'entity.too.large') {
    return res.status(413).json({ message: 'Cuerpo de la solicitud demasiado grande', code: 'PAYLOAD_TOO_LARGE' });
  }
  if (err.code === '23503') {
    return res.status(409).json({ message: 'Conflicto con datos relacionados', code: 'FK_VIOLATION' });
  }
  if (err.code === '23505') {
    return res.status(409).json({ message: 'Registro duplicado', code: 'UNIQUE_VIOLATION' });
  }
  if (err.name === 'JsonWebTokenError' || err.name === 'TokenExpiredError') {
    return res.status(401).json({ message: 'Token inválido o expirado', code: 'INVALID_TOKEN' });
  }
  if (err.message && err.message.includes('CORS')) {
    return res.status(403).json({ message: 'Origen no permitido', code: 'CORS_DENIED' });
  }

  return res.status(500).json({
    message: 'Error interno del servidor',
    ...(process.env.NODE_ENV === 'development' && { error: err.message })
  });
};