const Productos = require('../models/productosModel');
const Reservas = require('../models/reservasModel');
const { NotFoundError } = require('../utils/errors');

exports.obtenerTodos = () => Productos.obtenerProductos();

exports.obtenerPorId = async (id) => {
  const producto = await Productos.obtenerProductoPorId(id);
  if (!producto) throw new NotFoundError('Producto no encontrado');
  return producto;
};

exports.crear = (datos) => Productos.crearProducto(datos);

exports.actualizar = async (id, datos) => {
  const actualizado = await Productos.actualizarProducto(id, datos);
  if (!actualizado) throw new NotFoundError('Producto no encontrado');
  return actualizado;
};

exports.obtenerStock = async (id) => {
  await Reservas.limpiarReservasExpiradas();
  const producto = await exports.obtenerPorId(id);
  return {
    producto_id: producto.producto_id,
    nombre_producto: producto.nombre_producto,
    stock_disponible: producto.stock,
    precio_producto: producto.precio_producto,
    disponible: producto.stock > 0
  };
};