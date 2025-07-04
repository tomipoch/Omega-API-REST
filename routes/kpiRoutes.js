const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const KpiController = require('../controllers/kpiController');

router.get('/kpi', auth, KpiController.getResumenKPIs);
router.get('/kpi/reservas-mensuales', auth, KpiController.getReservasMensuales);

module.exports = router;
