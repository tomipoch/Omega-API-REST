const express = require('express');
const router = express.Router();
const blogController = require('../controllers/blogController');
const auth = require('../middleware/auth'); // Middleware de autenticación
const verificarRolAdmin = require('../middleware/verificarRolAdmin'); // Middleware para verificar rol de admin

// Rutas de publicaciones del blog
router.post('/', auth, verificarRolAdmin, blogController.crearPublicacion);          // Crear publicación (solo admin)
router.get('/', blogController.obtenerPublicaciones);                                // Obtener todas las publicaciones
router.get('/:id', blogController.obtenerPublicacionPorId);                          // Obtener una publicación por ID
router.put('/:id', auth, verificarRolAdmin, blogController.actualizarPublicacion);   // Actualizar publicación (solo admin)
router.delete('/:id', auth, verificarRolAdmin, blogController.eliminarPublicacion);  // Eliminar publicación (solo admin)

module.exports = router;
