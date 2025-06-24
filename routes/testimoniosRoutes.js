const express = require('express');
const router = express.Router();
const testimoniosController = require('../controllers/testimoniosController');
const auth = require('../middleware/auth'); // Middleware de autenticación
const optionalAuth = require('../middleware/optionalAuth'); // Middleware de autenticación opcional
const verificarRolAdmin = require('../middleware/verificarRolAdmin'); // Middleware para verificar el rol de admin

// Rutas de testimonios
router.post('/', auth, testimoniosController.crearTestimonio);          // Crear testimonio (usuario autenticado)
router.get('/', optionalAuth, testimoniosController.obtenerTestimonios);              // Obtener testimonios (con auth opcional para filtro por usuario)
router.put('/:id', auth, testimoniosController.actualizarTestimonio);   // Actualizar testimonio (solo propietario)

// Rutas para aceptar, rechazar o eliminar testimonios (solo admin) - DEBEN IR ANTES DE LA RUTA GENÉRICA DELETE
router.put('/:id/aceptar', auth, verificarRolAdmin, testimoniosController.aceptarTestimonio);
router.put('/:id/rechazar', auth, verificarRolAdmin, testimoniosController.rechazarTestimonio);
router.delete('/:id/admin', auth, verificarRolAdmin, testimoniosController.eliminarTestimonioAdmin); // Eliminar testimonio como admin
router.get('/pendientes', auth, verificarRolAdmin, testimoniosController.obtenerTestimoniosPendientes);

// Ruta genérica para eliminar (solo propietario) - DEBE IR AL FINAL
router.delete('/:id', auth, testimoniosController.eliminarTestimonio);  // Eliminar testimonio (solo propietario)


module.exports = router;
