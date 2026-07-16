class AppError extends Error {
  constructor(message, statusCode, code) {
    super(message);
    this.statusCode = statusCode;
    this.code = code;
    this.name = this.constructor.name;
  }
}

class NotFoundError extends AppError {
  constructor(msg = 'Recurso no encontrado') { super(msg, 404, 'NOT_FOUND'); }
}
class UnauthorizedError extends AppError {
  constructor(msg = 'No autorizado') { super(msg, 401, 'UNAUTHORIZED'); }
}
class ForbiddenError extends AppError {
  constructor(msg = 'Acceso denegado') { super(msg, 403, 'FORBIDDEN'); }
}
class ConflictError extends AppError {
  constructor(msg = 'Conflicto', data) {
    super(msg, 409, 'CONFLICT');
    this.data = data;
  }
}
class ValidationError extends AppError {
  constructor(msg, details) {
    super(msg, 400, 'VALIDATION');
    this.details = details;
  }
}

class RequirePasswordError extends AppError {
  constructor(msg = 'Debes establecer una contraseña antes de realizar esta acción.') {
    super(msg, 400, 'REQUIRE_PASSWORD');
  }
}

module.exports = {
  AppError,
  NotFoundError,
  UnauthorizedError,
  ForbiddenError,
  ConflictError,
  ValidationError,
  RequirePasswordError
};