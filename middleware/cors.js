const env = require('../utils/env');

const ALLOWED_METHODS = 'GET, POST, PUT, DELETE, OPTIONS';
const ALLOWED_HEADERS = 'Content-Type, Authorization, x-auth-token';
const EXPOSED_HEADERS = 'Authorization';

module.exports = (req, res, next) => {
  const origin = req.headers.origin;

  if (origin) {
    if (!env.CORS_ORIGINS_LIST.includes(origin)) {
      return next(new Error('Origen no permitido por CORS'));
    }
    res.setHeader('Access-Control-Allow-Origin', origin);
  }

  res.setHeader('Vary', 'Origin');
  res.setHeader('Access-Control-Allow-Methods', ALLOWED_METHODS);
  res.setHeader('Access-Control-Allow-Headers', ALLOWED_HEADERS);
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Expose-Headers', EXPOSED_HEADERS);
  res.setHeader('Access-Control-Max-Age', '600');

  if (req.method === 'OPTIONS') {
    return res.status(204).end();
  }

  return next();
};