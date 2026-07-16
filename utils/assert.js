const { UnauthorizedError, ForbiddenError, ValidationError } = require('./errors');

const assert = {
  authenticated: (req) => {
    if (!req.userId) throw new UnauthorizedError('No autenticado.');
  },

  admin: (req) => {
    assert.authenticated(req);
    if (req.userRol !== 1) {
      throw new ForbiddenError('Requiere rol de administrador.');
    }
  },

  positiveInt: (val, name = 'ID') => {
    const n = Number(val);
    if (!Number.isInteger(n) || n <= 0) {
      throw new ValidationError(`${name} inválido.`);
    }
    return n;
  },

  notEmpty: (val, name) => {
    if (val == null || val === '') {
      throw new ValidationError(`${name} es obligatorio.`);
    }
    return val;
  },

  oneOf: (val, allowed, name = 'valor') => {
    if (!allowed.includes(val)) {
      throw new ValidationError(`${name} debe ser uno de: ${allowed.join(', ')}.`);
    }
    return val;
  }
};

module.exports = assert;