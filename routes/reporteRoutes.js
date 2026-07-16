const express = require('express');
const router = express.Router();
const reporteController = require('../controllers/reporteController');
const auth = require('../middleware/authMiddleware');
const verificarRolAdmin = require('../middleware/verificarRolAdmin');

router.get('/reporte/auditoria', auth, verificarRolAdmin, reporteController.obtenerReporteAuditoria);
router.get('/reporte/usuarios/activos', auth, verificarRolAdmin, reporteController.obtenerUsuariosActivos);
router.get('/reporte/usuarios/inactivos', auth, verificarRolAdmin, reporteController.obtenerUsuariosInactivos);
router.get('/reporte/auditoria/exportar/csv', auth, verificarRolAdmin, reporteController.exportarReporteAuditoriaCSV);
router.get('/reporte/auditoria/exportar/pdf', auth, verificarRolAdmin, reporteController.exportarReporteAuditoriaPDF);

module.exports = router;