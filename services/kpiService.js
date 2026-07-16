const KpiModel = require('../models/kpiModel');

exports.getResumen = () => KpiModel.getResumen();

exports.getReservasMensuales = () => KpiModel.reservasMensuales();

exports.getReservasPorEstado = () => KpiModel.reservasPorEstado();