const kpiService = require('../services/kpiService');
const { asyncHandler } = require('../utils/asyncHandler');
const assert = require('../utils/assert');

exports.getResumenKPIs = asyncHandler(async (req, res) => {
  assert.admin(req);
  res.json(await kpiService.getResumen());
});

exports.getReservasMensuales = asyncHandler(async (req, res) => {
  assert.admin(req);
  res.json(await kpiService.getReservasMensuales());
});

exports.getReservasEstados = asyncHandler(async (req, res) => {
  assert.admin(req);
  res.json(await kpiService.getReservasPorEstado());
});