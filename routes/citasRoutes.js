const express = require('express');
const router = express.Router();
const citasController = require('../controllers/citasController');
const auth = require('../middleware/auth'); // Middleware de autenticación

router.post('/', auth, citasController.crearCita);
router.get('/', auth, citasController.obtenerCitas);
router.put('/:id', auth, citasController.actualizarCita);
router.delete('/:id', auth, citasController.eliminarCita);

router.get('/admin', auth, citasController.obtenerTodasLasCitas);
module.exports = router;
