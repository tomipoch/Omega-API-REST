const serviciosModel = require('../models/serviciosModel');

// Obtener todos los servicios
exports.obtenerServicios = async (req, res, next) => {
  try {
    const servicios = await serviciosModel.obtenerServicios();
    res.status(200).json(servicios);
  } catch (error) {
    console.error('Error al obtener los servicios:', error);
    next(error);
  }
};
