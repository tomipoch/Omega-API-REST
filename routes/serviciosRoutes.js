const express = require('express');
const router = express.Router();
const serviciosController = require('../controllers/serviciosController');
const auth = require('../middleware/auth'); // Middleware para proteger la ruta
const verificarRolAdmin = require('../middleware/verificarRolAdmin'); // Middleware para verificar rol de admin

// Ruta para obtener todos los servicios (usuarios y admins)
router.get('/', auth, serviciosController.obtenerServicios);

// Rutas solo para administradores
router.post('/', auth, verificarRolAdmin, serviciosController.crearServicio);
router.put('/:id', auth, verificarRolAdmin, serviciosController.actualizarServicio);
router.delete('/:id', auth, verificarRolAdmin, serviciosController.eliminarServicio);

module.exports = router;
