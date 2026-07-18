const { param, query } = require('express-validator');

exports.idParam = (name = 'id') => [
  param(name)
    .isInt({ min: 1 })
    .withMessage(`${name} debe ser entero positivo.`)
    .toInt()
];

exports.fechaISOQuery = (field) => [
  query(field)
    .optional()
    .isISO8601()
    .withMessage(`${field} debe ser fecha ISO 8601 (YYYY-MM-DD).`)
];

exports.paginationRules = [
  query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('limit fuera de rango.'),
  query('offset').optional().isInt({ min: 0 }).withMessage('offset fuera de rango.'),
  query('page').optional().isInt({ min: 1 }).withMessage('page fuera de rango.')
];
