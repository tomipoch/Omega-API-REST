const Reserva = require('../models/reservaModel');
const auditoriaController = require('./auditoriaController'); // Asumiendo que ya tienes este módulo

exports.obtenerReservasUsuario = async (req, res) => {
  try {
    const usuarioId = req.userId;

    if (!usuarioId) {
      return res.status(401).json({ message: 'Usuario no autenticado' });
    }

    await Reserva.limpiarReservasExpiradas();

    const reservas = await Reserva.obtenerReservasPorUsuario(usuarioId);

    res.json({
      message: 'Reservas obtenidas exitosamente',
      reservas: reservas.map(r => ({
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
        esta_activa: r.estado_reserva === 'activa' && new Date() < new Date(r.fecha_expiracion)
      }))
    });

  } catch (error) {
    console.error('Error al obtener reservas:', error);
    res.status(500).json({ message: 'Error interno al obtener reservas' });
  }
};

exports.reservarProducto = async (req, res) => {
  try {
    const usuarioId = req.userId;
    const { id } = req.params;
    const { cantidad = 1, tiempo_expiracion = 30 } = req.body;

    if (!usuarioId) {
      return res.status(401).json({ message: 'Usuario no autenticado' });
    }

    if (!cantidad || cantidad < 1) {
      return res.status(400).json({ message: 'La cantidad debe ser mayor a 0' });
    }

    if (cantidad > 10) {
      return res.status(400).json({ message: 'No se pueden reservar más de 10 unidades por vez' });
    }

    await Reserva.limpiarReservasExpiradas();

    // Verificar si ya tiene reserva activa para este producto
    const reservasUsuario = await Reserva.obtenerReservasPorUsuario(usuarioId);
    const reservaExistente = reservasUsuario.find(r =>
      r.producto_id === parseInt(id) && r.estado_reserva === 'activa'
    );

    if (reservaExistente) {
      return res.status(409).json({
        message: 'Ya tienes una reserva activa para este producto',
        reserva_existente: {
          reserva_id: reservaExistente.reserva_id,
          cantidad: reservaExistente.cantidad_reservada,
          expira: reservaExistente.fecha_expiracion
        }
      });
    }

    const resultado = await Reserva.reservarProducto(usuarioId, id, cantidad, tiempo_expiracion);

    // Auditoría (si falla, no es crítico)
    try {
      await auditoriaController.registrarEvento(
        usuarioId,
        'reserva_producto',
        `Usuario reservó ${cantidad} unidad(es) del producto ID: ${id}`
      );
    } catch (audError) {
      console.error('Error en auditoría:', audError.message);
    }

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

  } catch (error) {
    console.error('Error al reservar producto:', error);

    if (error.message.includes('Stock insuficiente')) {
      return res.status(409).json({ message: error.message });
    }

    if (error.message.includes('Producto no encontrado')) {
      return res.status(404).json({ message: error.message });
    }

    res.status(500).json({ message: 'Error interno al reservar producto' });
  }
};

exports.confirmarReserva = async (req, res) => {
  try {
    const { reservaId } = req.params;
    const usuarioId = req.userId;

    if (!usuarioId) {
      return res.status(401).json({ message: 'Usuario no autenticado' });
    }

    const reservaConfirmada = await Reserva.confirmarReserva(reservaId, usuarioId);

    try {
      await auditoriaController.registrarEvento(
        usuarioId,
        'confirma_reserva',
        `Usuario confirmó la reserva ID: ${reservaId}`
      );
    } catch (audError) {
      console.error('Error en auditoría:', audError.message);
    }

    res.json({
      message: 'Reserva confirmada exitosamente',
      reserva: {
        reserva_id: reservaConfirmada.reserva_id,
        estado: reservaConfirmada.estado_reserva,
        fecha_confirmacion: new Date()
      }
    });

  } catch (error) {
    console.error('Error al confirmar reserva:', error);

    if (error.message.includes('no encontrada') || error.message.includes('expirado')) {
      return res.status(404).json({ message: error.message });
    }

    res.status(500).json({ message: 'Error interno al confirmar reserva' });
  }
};

exports.cancelarReserva = async (req, res) => {
  try {
    const { reservaId } = req.params;
    const usuarioId = req.userId;

    if (!usuarioId) {
      return res.status(401).json({ message: 'Usuario no autenticado' });
    }

    const reservaCancelada = await Reserva.cancelarReserva(reservaId, usuarioId);

    try {
      await auditoriaController.registrarEvento(
        usuarioId,
        'cancela_reserva',
        `Usuario canceló la reserva ID: ${reservaId}`
      );
    } catch (audError) {
      console.error('Error en auditoría:', audError.message);
    }

    res.json({
      message: 'Reserva cancelada exitosamente. El stock ha sido devuelto.',
      reserva: {
        reserva_id: reservaCancelada.reserva_id,
        estado: reservaCancelada.estado_reserva,
        cantidad_devuelta: reservaCancelada.cantidad_reservada
      }
    });

  } catch (error) {
    console.error('Error al cancelar reserva:', error);

    if (error.message.includes('no encontrada')) {
      return res.status(404).json({ message: error.message });
    }

    res.status(500).json({ message: 'Error interno al cancelar reserva' });
  }
};
