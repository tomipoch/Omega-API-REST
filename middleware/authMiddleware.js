const jwt = require('jsonwebtoken');

const extraerToken = (req) => {
  const authHeader = req.headers.authorization || req.headers['x-auth-token'];
  if (!authHeader) return null;
  return authHeader.startsWith('Bearer ') ? authHeader.split(' ')[1] : authHeader;
};

module.exports = (req, res, next) => {
  const token = extraerToken(req);
  if (!token) {
    return res.status(401).json({ message: 'No hay token, autorización denegada.' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    if (!decoded.userId) {
      return res.status(401).json({ message: 'Token inválido: falta información del usuario.' });
    }

    req.userId = decoded.userId;
    req.userRol = decoded.rol;
    next();
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ message: 'Token expirado.' });
    }
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({ message: 'Token malformado.' });
    }
    return res.status(401).json({ message: 'Token no válido.' });
  }
};