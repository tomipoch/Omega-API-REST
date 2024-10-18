const express = require('express');
const router = express.Router();
const personalizacionController = require('../controllers/personalizacionController');
const auth = require('../middleware/auth'); // Middleware de autenticación
const verificarRolAdmin = require('../middleware/verificarRolAdmin'); // Middleware para verificar el rol de admin

// Ruta para crear una nueva solicitud de personalización con imágenes
router.post('/', auth, personalizacionController.crearSolicitud);

// Rutas para admin (ver todas las solicitudes y cambiar el estado)
router.get('/', auth, verificarRolAdmin, personalizacionController.obtenerSolicitudes);
router.put('/:id/aceptar', auth, verificarRolAdmin, (req, res, next) => {
  req.body.nuevo_estado = 'aceptar'; // Pasamos el estado "aceptar" al controlador
  personalizacionController.actualizarEstadoSolicitud(req, res, next);
});
router.put('/:id/rechazar', auth, verificarRolAdmin, (req, res, next) => {
  req.body.nuevo_estado = 'rechazar'; // Pasamos el estado "rechazar" al controlador
  personalizacionController.actualizarEstadoSolicitud(req, res, next);
});

module.exports = router;
