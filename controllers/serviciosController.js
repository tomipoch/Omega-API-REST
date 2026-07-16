const serviciosService = require('../services/serviciosService');
const { asyncHandler } = require('../utils/asyncHandler');

exports.obtenerServicios = asyncHandler(async (req, res) => {
  res.json(await serviciosService.listar());
});