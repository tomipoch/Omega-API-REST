const path = require('path');
const Producto = require('../models/productoModel');
const Reserva = require('../models/reservaSimple');
const auditoriaController = require('./auditoriaController');

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

// Obtener stock en tiempo real de un producto
exports.obtenerStockProducto = async (req, res) => {
  try {
    const { id } = req.params;
    const producto = await Producto.findByPk(id);
    
    if (!producto) {
      return res.status(404).json({ message: 'Producto no encontrado' });
    }
    
    // Limpiar reservas expiradas antes de mostrar el stock
    await Reserva.limpiarReservasExpiradas();
    
    // Obtener producto actualizado después de limpiar reservas
    const productoActualizado = await Producto.findByPk(id);
    
    res.json({
      producto_id: productoActualizado.producto_id,
      nombre_producto: productoActualizado.nombre_producto,
      stock_disponible: productoActualizado.stock,
      precio_producto: productoActualizado.precio_producto,
      disponible: productoActualizado.stock > 0
    });
  } catch (error) {
    console.error('Error al obtener stock:', error);
    res.status(500).json({ message: 'Error al obtener stock del producto' });
  }
};

// Reservar producto
exports.reservarProducto = async (req, res) => {
  try {
    const { id } = req.params;
    const { cantidad = 1, tiempo_expiracion = 30 } = req.body;
    const usuarioId = req.userId;
    
    // Validaciones
    if (!usuarioId) {
      return res.status(401).json({ message: 'Usuario no autenticado' });
    }
    
    if (!cantidad || cantidad < 1) {
      return res.status(400).json({ message: 'La cantidad debe ser mayor a 0' });
    }
    
    if (cantidad > 10) {
      return res.status(400).json({ message: 'No se pueden reservar más de 10 unidades por vez' });
    }
    
    // Limpiar reservas expiradas antes de crear nueva reserva
    await Reserva.limpiarReservasExpiradas();
    
    // Verificar si el usuario ya tiene una reserva activa para este producto
    const reservaExistente = await Reserva.findOne({
      where: {
        usuario_id: usuarioId,
        producto_id: id,
        estado_reserva: 'activa'
      }
    });
    
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
    
    // Crear la reserva
    const resultado = await Reserva.reservarProducto(usuarioId, id, cantidad, tiempo_expiracion);
    
    // Registrar evento de auditoría
    try {
      await auditoriaController.registrarEvento(
        usuarioId, 
        'reserva_producto', 
        `Usuario reservó ${cantidad} unidad(es) del producto ID: ${id}`
      );
    } catch (auditoriaError) {
      console.error('Error en auditoría (no crítico):', auditoriaError.message);
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

// Confirmar reserva
exports.confirmarReserva = async (req, res) => {
  try {
    const { reservaId } = req.params;
    const usuarioId = req.userId;
    
    if (!usuarioId) {
      return res.status(401).json({ message: 'Usuario no autenticado' });
    }
    
    const reservaConfirmada = await Reserva.confirmarReserva(reservaId, usuarioId);
    
    // Registrar evento de auditoría
    try {
      await auditoriaController.registrarEvento(
        usuarioId, 
        'confirma_reserva', 
        `Usuario confirmó la reserva ID: ${reservaId}`
      );
    } catch (auditoriaError) {
      console.error('Error en auditoría (no crítico):', auditoriaError.message);
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

// Cancelar reserva
exports.cancelarReserva = async (req, res) => {
  try {
    const { reservaId } = req.params;
    const usuarioId = req.userId;
    
    if (!usuarioId) {
      return res.status(401).json({ message: 'Usuario no autenticado' });
    }
    
    const reservaCancelada = await Reserva.cancelarReserva(reservaId, usuarioId);
    
    // Registrar evento de auditoría
    try {
      await auditoriaController.registrarEvento(
        usuarioId, 
        'cancela_reserva', 
        `Usuario canceló la reserva ID: ${reservaId}`
      );
    } catch (auditoriaError) {
      console.error('Error en auditoría (no crítico):', auditoriaError.message);
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

// Obtener reservas del usuario
exports.obtenerReservasUsuario = async (req, res) => {
  try {
    const usuarioId = req.userId;
    
    if (!usuarioId) {
      return res.status(401).json({ message: 'Usuario no autenticado' });
    }
    
    // Limpiar reservas expiradas
    await Reserva.limpiarReservasExpiradas();
    
    const reservas = await Reserva.findAll({
      where: { usuario_id: usuarioId },
      include: [{
        model: Producto,
        as: 'producto',
        attributes: ['producto_id', 'nombre_producto', 'precio_producto', 'imagen_producto']
      }],
      order: [['fecha_reserva', 'DESC']]
    });
    
    res.json({
      message: 'Reservas obtenidas exitosamente',
      reservas: reservas.map(reserva => ({
        reserva_id: reserva.reserva_id,
        cantidad_reservada: reserva.cantidad_reservada,
        estado_reserva: reserva.estado_reserva,
        fecha_reserva: reserva.fecha_reserva,
        fecha_expiracion: reserva.fecha_expiracion,
        producto: reserva.producto ? {
          producto_id: reserva.producto.producto_id,
          nombre: reserva.producto.nombre_producto,
          precio: reserva.producto.precio_producto,
          imagen: reserva.producto.imagen_producto
        } : null,
        esta_activa: reserva.estado_reserva === 'activa' && new Date() < reserva.fecha_expiracion
      }))
    });
    
  } catch (error) {
    console.error('Error al obtener reservas:', error);
    res.status(500).json({ message: 'Error interno al obtener reservas' });
  }
};
