module.exports = (req, res, next) => {
  console.log("Rol del usuario:", req.userRol, "Tipo:", typeof req.userRol); // Log de depuración

  // Convertir a número para comparar
  const userRol = parseInt(req.userRol);
  
  if (userRol !== 2) {
    return res.status(403).json({ message: 'Acceso denegado. Necesitas ser admin para realizar esta acción.' });
  }
  next();
};
