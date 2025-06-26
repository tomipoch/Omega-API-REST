const jwt = require('jsonwebtoken');

module.exports = (req, res, next) => {
  console.log('=== AUTH MIDDLEWARE ===');
  console.log('Headers recibidos:', req.headers);
  console.log('Método:', req.method);
  console.log('URL:', req.url);
  
  const authHeader = req.headers.authorization || req.headers['x-auth-token']; // Aceptar ambos

  if (!authHeader) {
    console.log("Error: No hay encabezado Authorization o x-auth-token");
    return res.status(401).json({ message: 'No hay token, autorización denegada.' });
  }

  // Si el token viene en formato Bearer, extraerlo
  const token = authHeader.startsWith('Bearer ')
    ? authHeader.split(' ')[1]
    : authHeader;

  console.log('Token extraído:', token ? 'Presente' : 'Ausente');

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    console.log("Token decodificado exitosamente:", {
      userId: decoded.userId,
      rol: decoded.rol,
      exp: new Date(decoded.exp * 1000).toISOString()
    });
    
    // Validar que el token contiene los datos necesarios
    if (!decoded.userId) {
      console.error("Error: Token no contiene userId");
      return res.status(401).json({ message: 'Token inválido: falta información del usuario.' });
    }
    
    req.userId = decoded.userId;
    req.userRol = decoded.rol;
    
    console.log("Usuario autenticado correctamente - ID:", req.userId);
    next();
  } catch (error) {
    console.error("Error al verificar el token:", error.message);
    
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ message: 'Token expirado.' });
    } else if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({ message: 'Token malformado.' });
    } else {
      return res.status(401).json({ message: 'Token no válido.' });
    }
  }
};
