const { body, validationResult } = require('express-validator');

exports.productoRules = [
  body('nombre_producto').trim().notEmpty().withMessage('Nombre requerido').isLength({ max: 255 }),
  body('descripcion_producto').trim().notEmpty().withMessage('Descripción requerida'),
  body('precio_producto').isFloat({ min: 0 }).withMessage('Precio inválido'),
  body('stock').isInt({ min: 0 }).withMessage('Stock inválido')
];

exports.reservaRules = [
  body('cantidad').optional().isInt({ min: 1, max: 10 }).withMessage('La cantidad debe estar entre 1 y 10'),
  body('tiempo_expiracion').optional().isInt({ min: 1, max: 1440 }).withMessage('Tiempo de expiración inválido')
];

exports.handleValidation = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(422).json({
      message: 'Datos inválidos',
      code: 'VALIDATION_FAILED',
      errors: errors.array().map((e) => ({ field: e.path, message: e.msg }))
    });
  }
  return next();
};