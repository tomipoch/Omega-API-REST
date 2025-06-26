const express = require('express');
const router = express.Router();
const faqController = require('../controllers/faqController');
const auth = require('../middleware/authMiddleware'); // Middleware de autenticación
const verificarRolAdmin = require('../middleware/verificarRolAdmin'); // Middleware para verificar el rol de admin

// Rutas de preguntas frecuentes
router.get('/', faqController.obtenerPreguntas);                           // Obtener todas las preguntas frecuentes
router.post('/', auth, verificarRolAdmin, faqController.crearPregunta);     // Crear una nueva pregunta frecuente (admin)
router.put('/:id', auth, verificarRolAdmin, faqController.actualizarPregunta); // Actualizar pregunta frecuente (admin)
router.delete('/:id', auth, verificarRolAdmin, faqController.eliminarPregunta); // Eliminar pregunta frecuente (admin)

module.exports = router;
