const jwt = require('jsonwebtoken');

// Puedes ajustar la clave y el tiempo de expiración si quieres
exports.generarTokenTest = (payload) => {
  return jwt.sign(payload, process.env.JWT_SECRET || 'clave_para_test', {
    expiresIn: '1h',
  });
};
