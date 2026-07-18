const express = require('express');
const router = express.Router();
const reporteController = require('../controllers/reporteController');
const auth = require('../middleware/authMiddleware');
const verificarRolAdmin = require('../middleware/verificarRolAdmin');
const { fechaISOQuery } = require('../middleware/validators/commonValidator');
const { handleValidation } = require('../middleware/validators/authValidator');

router.get('/reporte/auditoria', auth, verificarRolAdmin, fechaISOQuery('fechaInicio'), fechaISOQuery('fechaFin'), handleValidation, reporteController.obtenerReporteAuditoria);
router.get('/reporte/usuarios/activos', auth, verificarRolAdmin, reporteController.obtenerUsuariosActivos);
router.get('/reporte/usuarios/inactivos', auth, verificarRolAdmin, reporteController.obtenerUsuariosInactivos);
router.get('/reporte/auditoria/exportar/csv', auth, verificarRolAdmin, fechaISOQuery('fechaInicio'), fechaISOQuery('fechaFin'), handleValidation, reporteController.exportarReporteAuditoriaCSV);
router.get('/reporte/auditoria/exportar/pdf', auth, verificarRolAdmin, fechaISOQuery('fechaInicio'), fechaISOQuery('fechaFin'), handleValidation, reporteController.exportarReporteAuditoriaPDF);

module.exports = router;
