const Reservas = require('../models/reservasModel');
const ProductosModel = require('../models/productosModel');
const Usuarios = require('../models/usuariosModel');
const auditoria = require('./auditoriaService');
const emailService = require('./emailService');
const { ConflictError, ValidationError } = require('../utils/errors');
const { RESERVA } = require('../utils/estados');

const CANTIDAD_MAXIMA = 10;

exports.reservar = async (usuarioId, productoId, cantidad, tiempoExpiracion = 30) => {
  if (!cantidad || cantidad < 1) {
    throw new ValidationError('La cantidad debe ser mayor a 0');
  }
  if (cantidad > CANTIDAD_MAXIMA) {
    throw new ValidationError(`No se pueden reservar más de ${CANTIDAD_MAXIMA} unidades por vez`);
  }

  await Reservas.limpiarReservasExpiradas();

  const reservasUsuario = await Reservas.obtenerReservasUsuario(usuarioId);
  const existente = reservasUsuario.find(
    (r) => r.producto_id === Number(productoId) && r.estado_reserva === RESERVA.ACTIVA
  );
  if (existente) {
    throw new ConflictError('Ya tienes una reserva activa para este producto', {
      reserva_existente: {
        reserva_id: existente.reserva_id,
        cantidad: existente.cantidad_reservada,
        expira: existente.fecha_expiracion
      }
    });
  }

  const resultado = await Reservas.reservarProducto(usuarioId, productoId, cantidad, tiempoExpiracion);

  await auditoria.registrar(
    usuarioId,
    'reserva_producto',
    `Usuario reservó ${cantidad} unidad(es) del producto ID: ${productoId}`
  );

  return resultado;
};

exports.confirmar = async (reservaId, usuarioId) => {
  if (!usuarioId) throw new ValidationError('Usuario no autenticado');
  const reserva = await Reservas.confirmarReserva(reservaId, usuarioId);
  await auditoria.registrar(usuarioId, 'confirma_reserva', `Confirmó reserva ${reservaId}`);

  try {
    const usuario = await Usuarios.obtenerUsuarioPorId(usuarioId);
    const producto = await ProductosModel.obtenerProductoPorId(reserva.producto_id);
    if (usuario && producto) {
      await emailService.enviarConfirmacionReserva({
        correo: usuario.correo_electronico,
        nombre: usuario.nombre,
        reservaId,
        nombreProducto: producto.nombre_producto,
        cantidad: reserva.cantidad_reservada
      });
    }
  } catch (emailError) {
    // Email no afecta el flujo principal
  }

  return reserva;
};

exports.cancelar = async (reservaId, usuarioId) => {
  if (!usuarioId) throw new ValidationError('Usuario no autenticado');
  const reserva = await Reservas.cancelarReserva(reservaId, usuarioId);
  await auditoria.registrar(usuarioId, 'cancela_reserva', `Canceló reserva ${reservaId}`);
  return reserva;
};

exports.listarDelUsuario = async (usuarioId) => {
  if (!usuarioId) throw new ValidationError('Usuario no autenticado');
  await Reservas.limpiarReservasExpiradas();
  const reservas = await Reservas.obtenerReservasUsuario(usuarioId);
  return reservas.map((r) => ({
    reserva_id: r.reserva_id,
    cantidad_reservada: r.cantidad_reservada,
    estado_reserva: r.estado_reserva,
    fecha_reserva: r.fecha_reserva,
    fecha_expiracion: r.fecha_expiracion,
    producto: {
      producto_id: r.producto_id,
      nombre: r.nombre_producto,
      precio: r.precio_producto,
      imagen: r.imagen_producto
    },
    esta_activa: r.estado_reserva === RESERVA.ACTIVA && new Date() < new Date(r.fecha_expiracion)
  }));
};
