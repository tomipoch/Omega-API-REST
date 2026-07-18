module.exports = (req, res, next) => {
  if (req.userRol !== 1) {
    return res.status(403).json({ message: 'Acceso denegado. Necesitas ser admin para realizar esta acción.' });
  }
  return next();
};
