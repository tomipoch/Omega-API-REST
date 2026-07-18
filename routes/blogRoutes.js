const express = require('express');
const router = express.Router();
const blogController = require('../controllers/blogController');
const auth = require('../middleware/authMiddleware');
const verificarRolAdmin = require('../middleware/verificarRolAdmin');
const { idParam } = require('../middleware/validators/commonValidator');
const { handleValidation } = require('../middleware/validators/authValidator');

router.post('/', auth, verificarRolAdmin, blogController.crearPublicacion);
router.get('/', blogController.obtenerPublicaciones);
router.get('/:id', idParam(), handleValidation, blogController.obtenerPublicacionPorId);
router.put('/:id', auth, verificarRolAdmin, idParam(), handleValidation, blogController.actualizarPublicacion);
router.delete('/:id', auth, verificarRolAdmin, idParam(), handleValidation, blogController.eliminarPublicacion);

module.exports = router;
