const path = require('path');
const Producto = require('../models/productoModel');

exports.obtenerProductos = async (req, res) => {
  try {
    const productos = await Producto.findAll();
    res.json(productos);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.crearProducto = async (req, res) => {
  try {
    // Asegura que todos los campos estén presentes y explícitos
    let datosProducto = {
      nombre_producto: req.body.nombre_producto,
      descripcion_producto: req.body.descripcion_producto,
      precio_producto: req.body.precio_producto,
      stock: req.body.stock,
      imagen_producto: null, // valor por defecto
    };

    if (req.file) {
      datosProducto.imagen_producto = path.join('uploads', 'productos', req.file.filename);
    }

    const nuevoProducto = await Producto.create(datosProducto);
    res.status(201).json(nuevoProducto);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

exports.actualizarProducto = async (req, res) => {
  try {
    const { id } = req.params;
    let datosProducto = {
      nombre_producto: req.body.nombre_producto,
      descripcion_producto: req.body.descripcion_producto,
      precio_producto: req.body.precio_producto,
      stock: req.body.stock,
    };

    if (req.file) {
      datosProducto.imagen_producto = path.join('uploads', 'productos', req.file.filename);
    }

    const [updated] = await Producto.update(datosProducto, { where: { producto_id: id } });
    if (updated) {
      const productoActualizado = await Producto.findByPk(id);
      res.json(productoActualizado);
    } else {
      res.status(404).json({ message: 'Producto no encontrado' });
    }
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};
