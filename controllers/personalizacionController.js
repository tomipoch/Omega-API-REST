const personalizacionService = require('../services/personalizacionService');
const { asyncHandler } = require('../utils/asyncHandler');

exports.crearSolicitud = asyncHandler(async (req, res) => {
  const imagenes = req.files ? req.files.map(f => f.path) : [];
  res.status(201).json(await personalizacionService.crear(req.body, imagenes));
});

exports.obtenerSolicitudes = asyncHandler(async (req, res) => {
  res.status(200).json(await personalizacionService.listar());
});

exports.actualizarEstadoSolicitud = asyncHandler(async (req, res) => {
  res.status(200).json(await personalizacionService.actualizarEstado(req.params.id, req.body.nuevo_estado));
});