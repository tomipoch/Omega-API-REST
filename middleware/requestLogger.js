const logger = require('../utils/logger');

const SKIP_PREFIXES = ['/api-docs', '/uploads'];
const SKIP_PATHS = ['/health/db', '/ping'];

const shouldSkip = (path) => {
  if (SKIP_PATHS.includes(path)) return true;
  return SKIP_PREFIXES.some((p) => path.startsWith(p));
};

module.exports = (req, res, next) => {
  const start = Date.now();
  res.on('finish', () => {
    const path = req.originalUrl || req.url;
    if (shouldSkip(path)) return;
    logger.info(
      `${req.ip} ${req.method} ${path} ${res.statusCode} ${Date.now() - start}ms`
    );
  });
  next();
};