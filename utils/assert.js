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
  },

  idParam: (req, name = 'id') => {
    return assert.positiveInt(req.params[name], name);
  },

  fechaISO: (val, name = 'fecha') => {
    if (!val) return null;
    const d = new Date(val);
    if (Number.isNaN(d.getTime())) {
      throw new ValidationError(`${name} inválida (se esperaba ISO 8601).`);
    }
    return d;
  }
};

module.exports = assert;
