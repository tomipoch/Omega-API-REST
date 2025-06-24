const express = require('express');
const router = express.Router();
const disponibilidadController = require('../controllers/disponibilidadController');
const auth = require('../middleware/auth');
const verificarRolAdmin = require('../middleware/verificarRolAdmin');

// Rutas para administradores (gestión completa)
router.post('/', auth, verificarRolAdmin, disponibilidadController.crearDisponibilidad);
router.get('/admin', auth, verificarRolAdmin, disponibilidadController.obtenerDisponibilidades);
router.put('/:id', auth, verificarRolAdmin, disponibilidadController.actualizarDisponibilidad);
router.delete('/:id', auth, verificarRolAdmin, disponibilidadController.eliminarDisponibilidad);
router.get('/admin/rango', auth, verificarRolAdmin, disponibilidadController.obtenerDisponibilidadesPorRango);

// Ruta pública para usuarios (solo ver disponibilidades disponibles)
router.get('/publicas', disponibilidadController.obtenerDisponibilidadesParaUsuarios);

// Ruta para obtener disponibilidades incluyendo slot de cita específica (para edición)
router.get('/publicas-con-cita', disponibilidadController.obtenerDisponibilidadesParaUsuariosConCita);

module.exports = router;
