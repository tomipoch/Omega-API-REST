const express = require('express');
const router = express.Router();
const disponibilidadController = require('../controllers/disponibilidadController');
const auth = require('../middleware/authMiddleware');
const verificarRolAdmin = require('../middleware/verificarRolAdmin');

router.post('/', auth, verificarRolAdmin, disponibilidadController.crearDisponibilidad);
router.get('/admin', auth, verificarRolAdmin, disponibilidadController.obtenerDisponibilidades);
router.get('/admin/rango', auth, verificarRolAdmin, disponibilidadController.obtenerDisponibilidadesPorRango);
router.put('/:id', auth, verificarRolAdmin, disponibilidadController.actualizarDisponibilidad);
router.delete('/:id', auth, verificarRolAdmin, disponibilidadController.eliminarDisponibilidad);
router.get('/publicas', disponibilidadController.obtenerDisponibilidadesParaUsuarios);
router.get('/publicas-con-cita', auth, disponibilidadController.obtenerDisponibilidadesParaUsuariosConCita);

module.exports = router;