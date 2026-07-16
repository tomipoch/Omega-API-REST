const disponibilidadService = require('../services/disponibilidadService');
const { asyncHandler } = require('../utils/asyncHandler');
const assert = require('../utils/assert');

exports.crearDisponibilidad = asyncHandler(async (req, res) => {
  assert.admin(req);
  const { fecha, hora_inicio, hora_fin, notas } = req.body;
  const disponibilidad = await disponibilidadService.crear({
    fecha, hora_inicio, hora_fin,
    admin_id: req.userId,
    notas
  });
  res.status(201).json(disponibilidad);
});

exports.obtenerDisponibilidades = asyncHandler(async (req, res) => {
  assert.admin(req);
  const { fecha, estado } = req.query;
  res.json(await disponibilidadService.obtenerTodas({ fecha, estado }));
});

exports.obtenerDisponibilidadesPorRango = asyncHandler(async (req, res) => {
  assert.admin(req);
  const { fechaInicio, fechaFin } = req.query;
  res.json(await disponibilidadService.obtenerPorRango(fechaInicio, fechaFin));
});

exports.actualizarDisponibilidad = asyncHandler(async (req, res) => {
  assert.admin(req);
  const actualizada = await disponibilidadService.actualizar(req.params.id, req.body);
  res.json(actualizada);
});

exports.eliminarDisponibilidad = asyncHandler(async (req, res) => {
  assert.admin(req);
  await disponibilidadService.eliminar(req.params.id);
  res.status(204).end();
});

exports.obtenerDisponibilidadesParaUsuarios = asyncHandler(async (req, res) => {
  res.json(await disponibilidadService.obtenerPublicas());
});

exports.obtenerDisponibilidadesParaUsuariosConCita = asyncHandler(async (req, res) => {
  assert.authenticated(req);
  res.json(await disponibilidadService.obtenerPublicasConCita());
});