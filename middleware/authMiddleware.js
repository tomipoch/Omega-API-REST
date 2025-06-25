const jwt = require('jsonwebtoken');

module.exports = (req, res, next) => {
  const authHeader = req.headers.authorization || req.headers['x-auth-token']; // Aceptar ambos

  if (!authHeader) {
    console.log("Error: No hay encabezado Authorization o x-auth-token"); // Log
    return res.status(401).json({ message: 'No hay token, autorización denegada.' });
  }

  // Si el token viene en formato Bearer, extraerlo
  const token = authHeader.startsWith('Bearer ')
    ? authHeader.split(' ')[1]
    : authHeader;

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    console.log("Token decodificado:", decoded); // Log para confirmar el contenido del token
    req.userId = decoded.userId;
    req.userRol = decoded.rol;
    next();
  } catch (error) {
    console.error("Error al verificar el token:", error);
    return res.status(401).json({ message: 'Token no válido.' });
  }
};
