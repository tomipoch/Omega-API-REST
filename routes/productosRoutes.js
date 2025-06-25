const express = require('express');
const router = express.Router();
const productosController = require('../controllers/productosController');
const authMiddleware = require('../middleware/authMiddleware'); // Si usas autenticación

router.get('/', authMiddleware, productosController.obtenerProductos);
router.post('/', authMiddleware, productosController.crearProducto);
router.put('/:id', authMiddleware, productosController.actualizarProducto);

module.exports = router;