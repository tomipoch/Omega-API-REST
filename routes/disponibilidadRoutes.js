const express = require('express');
const router = express.Router();
const disponibilidadController = require('../controllers/disponibilidadController');
const auth = require('../middleware/authMiddleware');
const verificarRolAdmin = require('../middleware/verificarRolAdmin');
const { idParam, fechaISOQuery } = require('../middleware/validators/commonValidator');
const { handleValidation } = require('../middleware/validators/authValidator');

router.post('/', auth, verificarRolAdmin, disponibilidadController.crearDisponibilidad);
router.get('/admin', auth, verificarRolAdmin, fechaISOQuery('fecha'), handleValidation, disponibilidadController.obtenerDisponibilidades);
router.get('/admin/rango', auth, verificarRolAdmin, fechaISOQuery('fechaInicio'), fechaISOQuery('fechaFin'), handleValidation, disponibilidadController.obtenerDisponibilidadesPorRango);
router.put('/:id', auth, verificarRolAdmin, idParam(), handleValidation, disponibilidadController.actualizarDisponibilidad);
router.delete('/:id', auth, verificarRolAdmin, idParam(), handleValidation, disponibilidadController.eliminarDisponibilidad);
router.get('/publicas', disponibilidadController.obtenerDisponibilidadesParaUsuarios);
router.get('/publicas-con-cita', auth, disponibilidadController.obtenerDisponibilidadesParaUsuariosConCita);

module.exports = router;
