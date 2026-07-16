const productosService = require('../services/productosService');
const reservasService = require('../services/reservasService');
const { asyncHandler } = require('../utils/asyncHandler');
const path = require('path');

exports.obtenerProductos = asyncHandler(async (req, res) => {
  res.json(await productosService.obtenerTodos());
});

exports.crearProducto = asyncHandler(async (req, res) => {
  const datos = {
    nombre_producto: req.body.nombre_producto,
    descripcion_producto: req.body.descripcion_producto,
    precio_producto: req.body.precio_producto,
    stock: req.body.stock,
    imagen_producto: req.file
      ? path.join('uploads', 'productos', req.file.filename)
      : null
  };
  res.status(201).json(await productosService.crear(datos));
});

exports.actualizarProducto = asyncHandler(async (req, res) => {
  const datos = {
    nombre_producto: req.body.nombre_producto,
    descripcion_producto: req.body.descripcion_producto,
    precio_producto: req.body.precio_producto,
    stock: req.body.stock,
    imagen_producto: req.file
      ? path.join('uploads', 'productos', req.file.filename)
      : null
  };
  res.json(await productosService.actualizar(req.params.id, datos));
});

exports.obtenerStockProducto = asyncHandler(async (req, res) => {
  res.json(await productosService.obtenerStock(req.params.id));
});

exports.reservarProducto = asyncHandler(async (req, res) => {
  const { cantidad = 1, tiempo_expiracion = 30 } = req.body;
  const resultado = await reservasService.reservar(req.userId, req.params.id, cantidad, tiempo_expiracion);
  res.status(201).json({
    message: 'Producto reservado exitosamente',
    reserva: {
      reserva_id: resultado.reserva.reserva_id,
      producto_id: resultado.reserva.producto_id,
      cantidad_reservada: resultado.reserva.cantidad_reservada,
      fecha_expiracion: resultado.reserva.fecha_expiracion,
      estado: resultado.reserva.estado_reserva
    },
    producto: {
      nombre: resultado.producto.nombre_producto,
      stock_restante: resultado.producto.stock
    },
    instrucciones: 'La reserva es temporal. Confirma tu compra antes de que expire.'
  });
});

exports.confirmarReserva = asyncHandler(async (req, res) => {
  const reserva = await reservasService.confirmar(req.params.reservaId, req.userId);
  res.json({
    message: 'Reserva confirmada exitosamente',
    reserva: {
      reserva_id: reserva.reserva_id,
      estado: reserva.estado_reserva,
      fecha_confirmacion: new Date()
    }
  });
});

exports.cancelarReserva = asyncHandler(async (req, res) => {
  const reserva = await reservasService.cancelar(req.params.reservaId, req.userId);
  res.json({
    message: 'Reserva cancelada exitosamente. El stock ha sido devuelto.',
    reserva: {
      reserva_id: reserva.reserva_id,
      estado: reserva.estado_reserva,
      cantidad_devuelta: reserva.cantidad_reservada
    }
  });
});

exports.obtenerReservasUsuario = asyncHandler(async (req, res) => {
  const reservas = await reservasService.listarDelUsuario(req.userId);
  res.json({ message: 'Reservas obtenidas exitosamente', reservas });
});