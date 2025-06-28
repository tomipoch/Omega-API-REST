const { DataTypes } = require('sequelize');
const sequelize = require('../config/sequelize');

const Reserva = sequelize.define('Reserva', {
  reserva_id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  usuario_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'usuarios',
      key: 'usuario_id'
    }
  },
  producto_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'productos',
      key: 'producto_id'
    }
  },
  cantidad_reservada: {
    type: DataTypes.INTEGER,
    allowNull: false,
    validate: {
      min: 1
    }
  },
  estado_reserva: {
    type: DataTypes.ENUM('activa', 'confirmada', 'cancelada', 'expirada'),
    allowNull: false,
    defaultValue: 'activa'
  },
  fecha_reserva: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: DataTypes.NOW
  },
  fecha_expiracion: {
    type: DataTypes.DATE,
    allowNull: false
  },
  notas: {
    type: DataTypes.TEXT,
    allowNull: true
  }
}, {
  tableName: 'reservas',
  timestamps: true,
  createdAt: 'fecha_creacion',
  updatedAt: 'fecha_actualizacion'
});

// Métodos del modelo
Reserva.reservarProducto = async function(usuarioId, productoId, cantidad, tiempoExpiracionMinutos = 30) {
  const transaction = await sequelize.transaction();
  
  try {
    // Verificar stock disponible
    const Producto = require('./productoModel');
    const producto = await Producto.findByPk(productoId, { transaction });
    
    if (!producto) {
      throw new Error('Producto no encontrado');
    }
    
    if (producto.stock < cantidad) {
      throw new Error(`Stock insuficiente. Stock disponible: ${producto.stock}`);
    }
    
    // Calcular fecha de expiración
    const fechaExpiracion = new Date();
    fechaExpiracion.setMinutes(fechaExpiracion.getMinutes() + tiempoExpiracionMinutos);
    
    // Crear la reserva
    const nuevaReserva = await Reserva.create({
      usuario_id: usuarioId,
      producto_id: productoId,
      cantidad_reservada: cantidad,
      fecha_expiracion: fechaExpiracion,
      estado_reserva: 'activa'
    }, { transaction });
    
    // Reducir el stock temporalmente
    await producto.update({
      stock: producto.stock - cantidad
    }, { transaction });
    
    await transaction.commit();
    
    return {
      reserva: nuevaReserva,
      producto: await Producto.findByPk(productoId),
      mensaje: `Producto reservado exitosamente. La reserva expira el ${fechaExpiracion.toLocaleString()}`
    };
    
  } catch (error) {
    await transaction.rollback();
    throw error;
  }
};

Reserva.confirmarReserva = async function(reservaId, usuarioId) {
  const reserva = await Reserva.findOne({
    where: { 
      reserva_id: reservaId,
      usuario_id: usuarioId,
      estado_reserva: 'activa'
    }
  });
  
  if (!reserva) {
    throw new Error('Reserva no encontrada o no válida');
  }
  
  if (new Date() > reserva.fecha_expiracion) {
    await reserva.update({ estado_reserva: 'expirada' });
    throw new Error('La reserva ha expirado');
  }
  
  await reserva.update({ estado_reserva: 'confirmada' });
  return reserva;
};

Reserva.cancelarReserva = async function(reservaId, usuarioId) {
  const transaction = await sequelize.transaction();
  
  try {
    const reserva = await Reserva.findOne({
      where: { 
        reserva_id: reservaId,
        usuario_id: usuarioId,
        estado_reserva: 'activa'
      },
      transaction
    });
    
    if (!reserva) {
      throw new Error('Reserva no encontrada o no válida');
    }
    
    // Devolver el stock
    const Producto = require('./productoModel');
    const producto = await Producto.findByPk(reserva.producto_id, { transaction });
    
    await producto.update({
      stock: producto.stock + reserva.cantidad_reservada
    }, { transaction });
    
    await reserva.update({ estado_reserva: 'cancelada' }, { transaction });
    
    await transaction.commit();
    return reserva;
    
  } catch (error) {
    await transaction.rollback();
    throw error;
  }
};

Reserva.limpiarReservasExpiradas = async function() {
  const transaction = await sequelize.transaction();
  
  try {
    const reservasExpiradas = await Reserva.findAll({
      where: {
        estado_reserva: 'activa',
        fecha_expiracion: {
          [sequelize.Sequelize.Op.lt]: new Date()
        }
      },
      transaction
    });
    
    const Producto = require('./productoModel');
    
    for (const reserva of reservasExpiradas) {
      // Devolver el stock
      const producto = await Producto.findByPk(reserva.producto_id, { transaction });
      await producto.update({
        stock: producto.stock + reserva.cantidad_reservada
      }, { transaction });
      
      // Marcar como expirada
      await reserva.update({ estado_reserva: 'expirada' }, { transaction });
    }
    
    await transaction.commit();
    return reservasExpiradas.length;
    
  } catch (error) {
    await transaction.rollback();
    throw error;
  }
};

module.exports = Reserva;
