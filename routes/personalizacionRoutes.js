const express = require('express');
const router = express.Router();
const personalizacionController = require('../controllers/personalizacionController');
const auth = require('../middleware/auth'); // Middleware de autenticación
const verificarRolAdmin = require('../middleware/verificarRolAdmin'); // Middleware para verificar el rol de admin

// Ruta para crear una nueva solicitud de personalización con imágenes
router.post('/', auth, personalizacionController.uploadImages, personalizacionController.crearSolicitud);

// Rutas para admin (ver todas las solicitudes y cambiar el estado)
router.get('/', auth, verificarRolAdmin, personalizacionController.obtenerSolicitudes);
router.put('/:id/aceptar', auth, verificarRolAdmin, personalizacionController.aceptarSolicitud);
router.put('/:id/rechazar', auth, verificarRolAdmin, personalizacionController.rechazarSolicitud);

module.exports = router;
