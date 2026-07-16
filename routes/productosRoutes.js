const express = require('express');
const router = express.Router();
const productosController = require('../controllers/productosController');
const authMiddleware = require('../middleware/authMiddleware');
const verificarRolAdmin = require('../middleware/verificarRolAdmin');
const multerProducto = require('../middleware/multerProducto');
const handleMulterError = require('../utils/multerErrorHandler');
const { productoRules, reservaRules, handleValidation } = require('../middleware/validators/productosValidator');

// Obtener productos (público)
router.get('/', productosController.obtenerProductos);

// Obtener stock en tiempo real (público)
router.get('/:id/stock', productosController.obtenerStockProducto);

// Crear producto (solo admin)
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

// Actualizar producto (solo admin)
router.put(
  '/:id',
  authMiddleware,
  verificarRolAdmin,
  multerProducto.single('imagen_producto'),
  handleMulterError,
  productoRules,
  handleValidation,
  productosController.actualizarProducto
);

// === RUTAS DE RESERVAS ===

// Reservar producto (requiere autenticación)
router.post('/:id/reservar', authMiddleware, reservaRules, handleValidation, productosController.reservarProducto);

// Confirmar reserva (requiere autenticación)
router.put('/reserva/:reservaId/confirmar', authMiddleware, productosController.confirmarReserva);

// Cancelar reserva (requiere autenticación)
router.delete('/reserva/:reservaId/cancelar', authMiddleware, productosController.cancelarReserva);

// Obtener reservas del usuario autenticado
router.get('/mis-reservas', authMiddleware, productosController.obtenerReservasUsuario);

module.exports = router;