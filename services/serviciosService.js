const serviciosModel = require('../models/serviciosModel');

exports.listar = () => serviciosModel.obtenerServicios();