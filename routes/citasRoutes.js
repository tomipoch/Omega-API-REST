const express = require('express');
const router = express.Router();
const citasController = require('../controllers/citasController');
const auth = require('../middleware/authMiddleware');
const { idParam } = require('../middleware/validators/commonValidator');
const { handleValidation } = require('../middleware/validators/authValidator');

router.post('/', auth, citasController.crearCita);
router.get('/', auth, citasController.obtenerCitas);
router.put('/:id', auth, idParam(), handleValidation, citasController.actualizarCita);
router.delete('/:id', auth, idParam(), handleValidation, citasController.eliminarCita);

router.get('/admin', auth, citasController.obtenerTodasLasCitas);

module.exports = router;
