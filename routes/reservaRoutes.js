const express = require('express');
const router = express.Router();
const reservaController = require('../controllers/reservaController');
const authMiddleware = require('../middleware/auth');

router.get('/', authMiddleware, reservaController.obtenerReservasUsuario);

router.post('/producto/:id', authMiddleware, reservaController.reservarProducto);

router.post('/confirmar/:reservaId', authMiddleware, reservaController.confirmarReserva);

router.delete('/cancelar/:reservaId', authMiddleware, reservaController.cancelarReserva);

module.exports = router;
