const { body, validationResult } = require('express-validator');

exports.registroRules = [
  body('nombre').trim().notEmpty().withMessage('Nombre requerido').isLength({ max: 100 }),
  body('apellido_paterno').trim().notEmpty().withMessage('Apellido paterno requerido').isLength({ max: 100 }),
  body('apellido_materno').trim().notEmpty().withMessage('Apellido materno requerido').isLength({ max: 100 }),
  body('correo_electronico').isEmail().withMessage('Correo inválido').normalizeEmail(),
  body('contrasena').isLength({ min: 8 }).withMessage('La contraseña debe tener al menos 8 caracteres')
];

exports.loginRules = [
  body('correo_electronico').isEmail().withMessage('Correo inválido').normalizeEmail(),
  body('contrasena').notEmpty().withMessage('Contraseña requerida')
];

exports.restablecerSolicitudRules = [
  body('correo_electronico').isEmail().withMessage('Correo inválido').normalizeEmail()
];

exports.restablecerRules = [
  body('correo_electronico').isEmail().withMessage('Correo inválido').normalizeEmail(),
  body('codigo').isLength({ min: 6, max: 6 }).withMessage('El código debe tener 6 dígitos'),
  body('nuevaContrasena').isLength({ min: 8 }).withMessage('La nueva contraseña debe tener al menos 8 caracteres')
];

exports.googleAuthRules = [
  body('googleToken').notEmpty().withMessage('Token de Google requerido')
];

exports.handleValidation = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(422).json({
      message: 'Datos inválidos',
      code: 'VALIDATION_FAILED',
      errors: errors.array().map(e => ({ field: e.path, message: e.msg }))
    });
  }
  next();
};