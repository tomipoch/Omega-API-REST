const express = require('express');
const router = express.Router();
const auditoriaController = require('../controllers/auditoriaController');
const auth = require('../middleware/auth');
const verificarRolAdmin = require('../middleware/verificarRolAdmin');

// Ruta para obtener el reporte de auditoría (con filtros opcionales)
router.get('/reporte/auditoria', auth, verificarRolAdmin, auditoriaController.obtenerReporteAuditoria);
// Ruta para obtener el reporte de usuarios activos/inactivos
router.get('/reporte/usuarios', auth, verificarRolAdmin, usuariosController.obtenerReporteUsuarios);
// Ruta para exportar el reporte de auditoría en formato CSV
router.get('/reporte/auditoria/exportar/csv', auth, verificarRolAdmin, auditoriaController.exportarReporteAuditoriaCSV);
// Ruta para exportar el reporte de auditoría en formato PDF
router.get('/reporte/auditoria/exportar/pdf', auth, verificarRolAdmin, auditoriaController.exportarReporteAuditoriaPDF);


module.exports = router;
