const express = require('express');
const router = express.Router();
const productosController = require('../controllers/productosController');
const authMiddleware = require('../middleware/authMiddleware'); // Si usas autenticación
const multerProducto = require('../middleware/multerProducto'); // Importa el middleware de multer

// Obtener productos
router.get('/', productosController.obtenerProductos);

// Obtener stock en tiempo real de un producto específico
router.get('/:id/stock', productosController.obtenerStockProducto);

// Crear producto (con subida de imagen)
router.post(
  '/',
  authMiddleware,
  multerProducto.single('imagen_producto'), // Middleware para manejar la imagen
  productosController.crearProducto
);

// Actualizar producto (con subida de imagen)
router.put(
  '/:id',
  authMiddleware,
  multerProducto.single('imagen_producto'), // Middleware para manejar la imagen
  productosController.actualizarProducto
);

// === RUTAS DE RESERVAS ===

// Reservar producto (requiere autenticación)
router.post('/:id/reservar', authMiddleware, productosController.reservarProducto);

// Confirmar reserva (requiere autenticación)
router.put('/reserva/:reservaId/confirmar', authMiddleware, productosController.confirmarReserva);

// Cancelar reserva (requiere autenticación)
router.delete('/reserva/:reservaId/cancelar', authMiddleware, productosController.cancelarReserva);

// Obtener reservas del usuario autenticado
router.get('/mis-reservas', authMiddleware, productosController.obtenerReservasUsuario);

module.exports = router;