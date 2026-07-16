const multer = require('multer');

const LIMITE_POR_CODIGO = {
  LIMIT_FILE_SIZE: 413,
  LIMIT_FILE_COUNT: 413,
  LIMIT_UNEXPECTED_FILE: 400
};

const MENSAJE_POR_CODIGO = {
  LIMIT_FILE_SIZE: 'Archivo demasiado grande',
  LIMIT_FILE_COUNT: 'Demasiados archivos',
  LIMIT_UNEXPECTED_FILE: 'Campo de archivo inesperado'
};

const handleMulterError = (err, req, res, next) => {
  if (err instanceof multer.MulterError) {
    const status = LIMITE_POR_CODIGO[err.code] || 400;
    return res.status(status).json({
      message: MENSAJE_POR_CODIGO[err.code] || 'Error al procesar el archivo',
      code: err.code,
      ...(err.field && { field: err.field })
    });
  }
  next(err);
};

module.exports = handleMulterError;