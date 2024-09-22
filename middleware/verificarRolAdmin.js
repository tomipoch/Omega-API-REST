module.exports = (req, res, next) => {
  // Verificar si el rol del usuario es admin (rol_id = 2)
  if (req.userRol !== 2) {
    return res.status(403).json({ message: 'Acceso denegado. Necesitas ser admin para realizar esta acción.' });
  }
  next();
};
