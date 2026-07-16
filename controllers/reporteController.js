const reporteService = require('../services/reporteService');
const { asyncHandler } = require('../utils/asyncHandler');

exports.obtenerReporteAuditoria = asyncHandler(async (req, res) => {
  res.json(await reporteService.buscarAuditoria(req.query));
});

exports.obtenerUsuariosActivos = asyncHandler(async (req, res) => {
  res.json(await reporteService.buscarUsuariosActivos());
});

exports.obtenerUsuariosInactivos = asyncHandler(async (req, res) => {
  res.json(await reporteService.buscarUsuariosInactivos());
});

exports.exportarReporteAuditoriaCSV = asyncHandler(async (req, res) => {
  const csv = await reporteService.exportarAuditoriaCSV(req.query);
  res.header('Content-Type', 'text/csv')
     .attachment('reporte_auditoria.csv')
     .send(csv);
});

exports.exportarReporteAuditoriaPDF = asyncHandler(async (req, res) => {
  res.setHeader('Content-Disposition', 'attachment; filename="reporte_auditoria.pdf"');
  res.setHeader('Content-Type', 'application/pdf');
  const doc = await reporteService.exportarAuditoriaPDF(req.query);
  doc.pipe(res);
});