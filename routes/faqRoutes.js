const express = require('express');
const router = express.Router();
const faqController = require('../controllers/faqController');
const auth = require('../middleware/authMiddleware');
const verificarRolAdmin = require('../middleware/verificarRolAdmin');
const { idParam } = require('../middleware/validators/commonValidator');
const { handleValidation } = require('../middleware/validators/authValidator');

router.get('/', faqController.obtenerPreguntas);
router.post('/', auth, verificarRolAdmin, faqController.crearPregunta);
router.put('/:id', auth, verificarRolAdmin, idParam(), handleValidation, faqController.actualizarPregunta);
router.delete('/:id', auth, verificarRolAdmin, idParam(), handleValidation, faqController.eliminarPregunta);

module.exports = router;
