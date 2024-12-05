module.exports = (req, res, next) => {
  console.log("Rol del usuario:", req.userRol); // Log de depuración

  if (req.userRol !== 2) {
    return res.status(403).json({ message: 'Acceso denegado. Necesitas ser admin para realizar esta acción.' });
  }
  next();
};
