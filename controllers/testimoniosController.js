const testimoniosService = require('../services/testimoniosService');
const { asyncHandler } = require('../utils/asyncHandler');

exports.crearTestimonio = asyncHandler(async (req, res) => {
  res.status(201).json(await testimoniosService.crear(req.userId, req.body.contenido, req.body.estrellas));
});

exports.obtenerTestimonios = asyncHandler(async (req, res) => {
  res.json(await testimoniosService.listarAprobados());
});

exports.actualizarTestimonio = asyncHandler(async (req, res) => {
  res.json(await testimoniosService.actualizar(req.userId, req.params.id, req.body.contenido, req.body.estrellas));
});

exports.eliminarTestimonio = asyncHandler(async (req, res) => {
  await testimoniosService.eliminar(req.userId, req.params.id);
  res.status(204).end();
});

exports.aceptarTestimonio = asyncHandler(async (req, res) => {
  const testimonio = await testimoniosService.aceptar(req.params.id);
  res.status(200).json({ message: 'Testimonio confirmado con éxito.', testimonio });
});

exports.rechazarTestimonio = asyncHandler(async (req, res) => {
  const testimonio = await testimoniosService.rechazar(req.params.id);
  res.status(200).json({ message: 'Testimonio cancelado con éxito.', testimonio });
});

exports.obtenerTestimoniosPendientes = asyncHandler(async (req, res) => {
  res.json(await testimoniosService.listarPendientes());
});