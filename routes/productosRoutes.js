const express = require('express');
const router = express.Router();
const productoController = require('../controllers/productosController');
const authMiddleware = require('../middleware/auth');
const verificarRolAdmin = require('../middleware/verificarRolAdmin');
const uploadProducto = require('../middleware/multerProducto');

// Obtener todos los productos
router.get('/catalogo', productoController.obtenerProductos);

// Obtener stock en tiempo real
router.get('/stock/:id', productoController.obtenerStockProducto);

// Crear producto (solo admin)
router.post(
  '/',
  authMiddleware,
  verificarRolAdmin,
  uploadProducto.single('imagen_producto'),
  productoController.crearProducto
);

// Actualizar producto (solo admin)
router.put(
  '/:id',
  authMiddleware,
  verificarRolAdmin,
  uploadProducto.single('imagen_producto'),
  productoController.actualizarProducto
);

module.exports = router;
