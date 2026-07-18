const express = require('express');
const router = express.Router();
const eventosController = require('../controllers/eventosController');
const auth = require('../middleware/authMiddleware');
const verificarRolAdmin = require('../middleware/verificarRolAdmin');
const { idParam } = require('../middleware/validators/commonValidator');
const { handleValidation } = require('../middleware/validators/authValidator');

router.post('/', auth, verificarRolAdmin, eventosController.crearEvento);
router.put('/:id', auth, verificarRolAdmin, idParam(), handleValidation, eventosController.actualizarEvento);
router.delete('/:id', auth, verificarRolAdmin, idParam(), handleValidation, eventosController.eliminarEvento);
router.get('/', eventosController.obtenerEventos);

router.post('/inscripcion', auth, eventosController.inscribirEvento);
router.delete(
  '/inscripcion/:evento_id',
  auth,
  idParam('evento_id'),
  handleValidation,
  eventosController.cancelarInscripcion
);

module.exports = router;
