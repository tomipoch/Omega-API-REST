const eventosService = require('../services/eventosService');
const { asyncHandler } = require('../utils/asyncHandler');

exports.crearEvento = asyncHandler(async (req, res) => {
  res.status(201).json(await eventosService.crear(req.body));
});

exports.obtenerEventos = asyncHandler(async (req, res) => {
  res.json(await eventosService.listar());
});

exports.actualizarEvento = asyncHandler(async (req, res) => {
  res.json(await eventosService.actualizar(req.params.id, req.body));
});

exports.eliminarEvento = asyncHandler(async (req, res) => {
  await eventosService.eliminar(req.params.id);
  res.status(204).end();
});

exports.inscribirEvento = asyncHandler(async (req, res) => {
  res.status(201).json(await eventosService.inscribir(req.userId, req.body.evento_id));
});

exports.cancelarInscripcion = asyncHandler(async (req, res) => {
  await eventosService.cancelarInscripcion(req.userId, req.params.evento_id);
  res.status(204).end();
});