const express = require('express');
const router = express.Router();
const eventosController = require('../controllers/eventosController');
const auth = require('../middleware/authMiddleware'); // Middleware de autenticación
const verificarRolAdmin = require('../middleware/verificarRolAdmin'); // Middleware para verificar el rol de admin

// Rutas de eventos
router.post('/', auth, verificarRolAdmin, eventosController.crearEvento);           // Solo admins pueden crear un evento
router.put('/:id', auth, verificarRolAdmin, eventosController.actualizarEvento);    // Solo admins pueden actualizar un evento
router.delete('/:id', auth, verificarRolAdmin, eventosController.eliminarEvento);   // Solo admins pueden eliminar un evento
router.get('/', eventosController.obtenerEventos);                                  // Cualquier usuario puede ver los eventos

// Rutas de inscripciones
router.post('/inscripcion', auth, eventosController.inscribirEvento);   // Usuarios autenticados pueden inscribirse
router.get('/inscripciones', auth, eventosController.obtenerInscripcionesUsuario); // Usuarios autenticados pueden ver sus inscripciones
router.delete('/inscripcion/:evento_id', auth, eventosController.cancelarInscripcion); // Eliminar inscripción

module.exports = router;
