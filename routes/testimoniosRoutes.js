const express = require('express');
const router = express.Router();
const testimoniosController = require('../controllers/testimoniosController');
const auth = require('../middleware/authMiddleware'); // Middleware de autenticación
const verificarRolAdmin = require('../middleware/verificarRolAdmin'); // Middleware para verificar el rol de admin

// Rutas de testimonios
router.post('/', auth, testimoniosController.crearTestimonio);          // Crear testimonio (usuario autenticado)
router.get('/', testimoniosController.obtenerTestimonios);              // Obtener todos los testimonios aprobados
router.put('/:id', auth, testimoniosController.actualizarTestimonio);   // Actualizar testimonio (solo propietario)
router.delete('/:id', auth, testimoniosController.eliminarTestimonio);  // Eliminar testimonio (solo propietario)

// Rutas para aceptar o rechazar testimonios (solo admin)
router.put('/:id/aceptar', auth, verificarRolAdmin, testimoniosController.aceptarTestimonio);
router.put('/:id/rechazar', auth, verificarRolAdmin, testimoniosController.rechazarTestimonio);
router.get('/pendientes', auth, verificarRolAdmin, testimoniosController.obtenerTestimoniosPendientes);


module.exports = router;
