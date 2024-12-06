const express = require('express');
const router = express.Router();
const serviciosController = require('../controllers/serviciosController');
const auth = require('../middleware/auth'); // Middleware para proteger la ruta

// Ruta para obtener todos los servicios
router.get('/', auth, serviciosController.obtenerServicios);

module.exports = router;
