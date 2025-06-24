const express = require('express');
const router = express.Router();
const citasController = require('../controllers/citasController');
const auth = require('../middleware/auth'); // Middleware de autenticación
const verificarRolAdmin = require('../middleware/verificarRolAdmin'); // Middleware para verificar el rol de admin

// Rutas para usuarios autenticados
router.post('/', auth, citasController.crearCita);
router.get('/', auth, citasController.obtenerCitas);
router.put('/:id', auth, citasController.actualizarCita);
router.delete('/:id', auth, citasController.eliminarCita);

// Rutas para administradores
router.get('/admin/todas', auth, verificarRolAdmin, citasController.obtenerTodasLasCitas);
router.post('/admin/crear', auth, verificarRolAdmin, citasController.crearCitaAdmin);
router.put('/admin/:id', auth, verificarRolAdmin, citasController.actualizarCitaAdmin);
router.delete('/admin/:id', auth, verificarRolAdmin, citasController.eliminarCitaAdmin);

module.exports = router;
