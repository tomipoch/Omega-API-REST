const express = require('express');
const router = express.Router();
const productosController = require('../controllers/productosController');
const authMiddleware = require('../middleware/authMiddleware'); // Si usas autenticación
const multerProducto = require('../middleware/multerProducto'); // Importa el middleware de multer

// Obtener productos
router.get('/', productosController.obtenerProductos);

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

module.exports = router;