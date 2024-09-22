const logger = require('../logger'); // Si tienes configurado winston para logging

module.exports = (err, req, res, next) => {
  logger.error(err.message); // Log del error (si tienes logging configurado)
  res.status(500).json({ message: 'Error interno del servidor.', error: err.message });
};
