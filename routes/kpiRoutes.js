const express = require('express');
const router = express.Router();
const kpiController = require('../controllers/kpiController');
const auth = require('../middleware/authMiddleware');
const verificarRolAdmin = require('../middleware/verificarRolAdmin');

router.get('/kpi', auth, verificarRolAdmin, kpiController.getResumenKPIs);
router.get('/kpi/reservas-mensuales', auth, verificarRolAdmin, kpiController.getReservasMensuales);
router.get('/kpi/reservas-estados', auth, verificarRolAdmin, kpiController.getReservasEstados);

module.exports = router;