const createLimiter = ({ windowMs, max, message }) => {
  const hits = new Map();

  const cleanup = setInterval(() => {
    const now = Date.now();
    for (const [key, val] of hits.entries()) {
      if (now > val.resetAt) hits.delete(key);
    }
  }, windowMs);
  cleanup.unref();

  return (req, res, next) => {
    const key = req.ip || req.connection?.remoteAddress || 'unknown';
    const now = Date.now();
    let entry = hits.get(key);

    if (!entry || now > entry.resetAt) {
      entry = { count: 0, resetAt: now + windowMs };
      hits.set(key, entry);
    }

    entry.count++;
    const remaining = Math.max(0, max - entry.count);
    res.setHeader('X-RateLimit-Limit', String(max));
    res.setHeader('X-RateLimit-Remaining', String(remaining));
    res.setHeader('X-RateLimit-Reset', String(Math.ceil(entry.resetAt / 1000)));

    if (entry.count > max) {
      return res.status(429).json(message);
    }
    return next();
  };
};

const RATE_LIMITED = { message: 'Demasiadas solicitudes, intente más tarde.', code: 'RATE_LIMITED' };

const authLimiter = createLimiter({ windowMs: 15 * 60 * 1000, max: 20, message: RATE_LIMITED });
const reservasLimiter = createLimiter({ windowMs: 60 * 1000, max: 30, message: RATE_LIMITED });
const chatLimiter = createLimiter({ windowMs: 60 * 1000, max: 10, message: RATE_LIMITED });
const disponibilidadLimiter = createLimiter({ windowMs: 60 * 1000, max: 60, message: RATE_LIMITED });

module.exports = {
  authLimiter,
  reservasLimiter,
  chatLimiter,
  disponibilidadLimiter
};