const express = require('express');
const router = express.Router();
const testimoniosController = require('../controllers/testimoniosController');
const auth = require('../middleware/authMiddleware');
const verificarRolAdmin = require('../middleware/verificarRolAdmin');
const { idParam } = require('../middleware/validators/commonValidator');
const { handleValidation } = require('../middleware/validators/authValidator');

router.post('/', auth, testimoniosController.crearTestimonio);
router.get('/', testimoniosController.obtenerTestimonios);
router.put('/:id', auth, idParam(), handleValidation, testimoniosController.actualizarTestimonio);
router.delete('/:id', auth, idParam(), handleValidation, testimoniosController.eliminarTestimonio);

router.put('/:id/aceptar', auth, verificarRolAdmin, idParam(), handleValidation, testimoniosController.aceptarTestimonio);
router.put('/:id/rechazar', auth, verificarRolAdmin, idParam(), handleValidation, testimoniosController.rechazarTestimonio);
router.get('/pendientes', auth, verificarRolAdmin, testimoniosController.obtenerTestimoniosPendientes);

module.exports = router;
