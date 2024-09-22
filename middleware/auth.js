const jwt = require('jsonwebtoken');

module.exports = (req, res, next) => {
  const token = req.header('x-auth-token');
  if (!token) return res.status(401).json({ message: 'No hay token, autorización denegada.' });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.userId = decoded.userId;
    req.userRol = decoded.rol;  // Guardar el rol en el request
    next();
  } catch (error) {
    res.status(401).json({ message: 'Token no es válido.' });
  }
};

