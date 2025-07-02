const path = require('path');
const Producto = require('../models/productoModel');

exports.obtenerProductos = async (req, res) => {
  try {
    const productos = await Producto.obtenerTodos();

    // Convertir precio_producto a número explícitamente
    const productosConvertidos = productos.map(p => ({
      ...p,
      precio_producto: p.precio_producto ? Number(p.precio_producto) : 0,
    }));

    res.json(productosConvertidos);
  } catch (error) {
    res.status(500).json({ message: 'Error al obtener productos', error: error.message });
  }
};


exports.crearProducto = async (req, res) => {
  try {
    const { nombre_producto, descripcion_producto, precio_producto, stock } = req.body;

    if (!nombre_producto || !descripcion_producto || !precio_producto || !stock) {
      return res.status(400).json({ message: 'Faltan campos obligatorios' });
    }

    const imagen_producto = req.file
      ? path.join('uploads', 'productos', req.file.filename)
      : null;

    const nuevoProducto = await Producto.crear({
      nombre_producto,
      descripcion_producto,
      precio_producto: Number(precio_producto),
      stock: Number(stock),
      imagen_producto
    });

    res.status(201).json(nuevoProducto);
  } catch (error) {
    console.error('Error al crear producto:', error);
    res.status(400).json({ message: 'Error al crear producto', error: error.message });
  }
};


exports.actualizarProducto = async (req, res) => {
  try {
    const { id } = req.params;
    const imagen_producto = req.file
      ? path.join('uploads', 'productos', req.file.filename)
      : req.body.imagen_producto;

    const productoActualizado = await Producto.actualizar(id, {
      ...req.body,
      imagen_producto
    });

    if (!productoActualizado) {
      return res.status(404).json({ message: 'Producto no encontrado' });
    }

    res.json(productoActualizado);
  } catch (error) {
    res.status(400).json({ message: 'Error al actualizar producto', error: error.message });
  }
};

exports.obtenerStockProducto = async (req, res) => {
  try {
    const { id } = req.params;
    const producto = await Producto.obtenerPorId(id);

    if (!producto) return res.status(404).json({ message: 'Producto no encontrado' });

    res.json({
      producto_id: producto.producto_id,
      nombre_producto: producto.nombre_producto,
      stock_disponible: producto.stock,
      precio_producto: producto.precio_producto,
      disponible: producto.stock > 0
    });
  } catch (error) {
    res.status(500).json({ message: 'Error al obtener stock', error: error.message });
  }
};
