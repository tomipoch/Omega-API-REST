const express = require('express');
const router = express.Router();
const productosController = require('../controllers/productosController');
const authMiddleware = require('../middleware/authMiddleware');
const verificarRolAdmin = require('../middleware/verificarRolAdmin');
const multerProducto = require('../middleware/multerProducto');
const handleMulterError = require('../utils/multerErrorHandler');
const { productoRules, reservaRules, handleValidation } = require('../middleware/validators/productosValidator');
const { idParam } = require('../middleware/validators/commonValidator');
const { handleValidation: commonHandle } = require('../middleware/validators/authValidator');

router.get('/', productosController.obtenerProductos);

router.get('/:id/stock', idParam(), commonHandle, productosController.obtenerStockProducto);

router.post(
  '/',
  authMiddleware,
  verificarRolAdmin,
  multerProducto.single('imagen_producto'),
  handleMulterError,
  productoRules,
  handleValidation,
  productosController.crearProducto
);

router.put(
  '/:id',
  authMiddleware,
  verificarRolAdmin,
  idParam(),
  commonHandle,
  multerProducto.single('imagen_producto'),
  handleMulterError,
  productoRules,
  handleValidation,
  productosController.actualizarProducto
);

router.post(
  '/:id/reservar',
  authMiddleware,
  idParam(),
  commonHandle,
  reservaRules,
  handleValidation,
  productosController.reservarProducto
);

router.put(
  '/reserva/:reservaId/confirmar',
  authMiddleware,
  idParam('reservaId'),
  commonHandle,
  productosController.confirmarReserva
);

router.delete(
  '/reserva/:reservaId/cancelar',
  authMiddleware,
  idParam('reservaId'),
  commonHandle,
  productosController.cancelarReserva
);

router.get('/mis-reservas', authMiddleware, productosController.obtenerReservasUsuario);

module.exports = router;
