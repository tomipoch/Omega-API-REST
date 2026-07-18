const citasService = require('../services/citasService');
const { asyncHandler } = require('../utils/asyncHandler');

exports.crearCita = asyncHandler(async (req, res) => {
  res.status(201).json(await citasService.crear(req.userId, req.body));
});

exports.obtenerCitas = asyncHandler(async (req, res) => {
  res.json(await citasService.listarDelUsuario(req.userId));
});

exports.obtenerTodasLasCitas = asyncHandler(async (req, res) => {
  res.json(await citasService.listarTodas());
});

exports.actualizarCita = asyncHandler(async (req, res) => {
  const datos = { ...req.body };
  if (datos.fecha_hora === '' || datos.fecha_hora === null) {
    delete datos.fecha_hora;
  }
  res.json(await citasService.actualizar(req.userId, req.params.id, datos));
});

exports.eliminarCita = asyncHandler(async (req, res) => {
  await citasService.eliminar(req.userId, req.params.id);
  res.status(204).end();
});
