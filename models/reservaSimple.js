// Versión simplificada del modelo de reservas sin asociaciones complejas
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
    allowNull: false
  },
  producto_id: {
    type: DataTypes.INTEGER,
    allowNull: false
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

// Métodos del modelo (versión simplificada usando consultas directas)
Reserva.reservarProducto = async function(usuarioId, productoId, cantidad, tiempoExpiracionMinutos = 30) {
  const { QueryTypes } = require('sequelize');
  
  try {
    // Verificar stock usando query directa
    const [producto] = await sequelize.query(
      'SELECT * FROM productos WHERE producto_id = :productoId',
      {
        replacements: { productoId },
        type: QueryTypes.SELECT
      }
    );
    
    if (!producto) {
      throw new Error('Producto no encontrado');
    }
    
    if (producto.stock < cantidad) {
      throw new Error(`Stock insuficiente. Stock disponible: ${producto.stock}`);
    }
    
    // Calcular fecha de expiración
    const fechaExpiracion = new Date();
    fechaExpiracion.setMinutes(fechaExpiracion.getMinutes() + tiempoExpiracionMinutos);
    
    // Crear la reserva usando Sequelize
    const nuevaReserva = await Reserva.create({
      usuario_id: usuarioId,
      producto_id: productoId,
      cantidad_reservada: cantidad,
      fecha_expiracion: fechaExpiracion,
      estado_reserva: 'activa'
    });
    
    // Reducir el stock usando query directa
    await sequelize.query(
      'UPDATE productos SET stock = stock - :cantidad WHERE producto_id = :productoId',
      {
        replacements: { cantidad, productoId },
        type: QueryTypes.UPDATE
      }
    );
    
    // Obtener producto actualizado
    const [productoActualizado] = await sequelize.query(
      'SELECT * FROM productos WHERE producto_id = :productoId',
      {
        replacements: { productoId },
        type: QueryTypes.SELECT
      }
    );
    
    return {
      reserva: nuevaReserva,
      producto: productoActualizado,
      mensaje: `Producto reservado exitosamente. La reserva expira el ${fechaExpiracion.toLocaleString()}`
    };
    
  } catch (error) {
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
  const { QueryTypes } = require('sequelize');
  
  try {
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
    
    // Devolver el stock usando query directa
    await sequelize.query(
      'UPDATE productos SET stock = stock + :cantidad WHERE producto_id = :productoId',
      {
        replacements: { 
          cantidad: reserva.cantidad_reservada, 
          productoId: reserva.producto_id 
        },
        type: QueryTypes.UPDATE
      }
    );
    
    await reserva.update({ estado_reserva: 'cancelada' });
    return reserva;
    
  } catch (error) {
    throw error;
  }
};

Reserva.limpiarReservasExpiradas = async function() {
  const { QueryTypes } = require('sequelize');
  
  try {
    const reservasExpiradas = await Reserva.findAll({
      where: {
        estado_reserva: 'activa',
        fecha_expiracion: {
          [sequelize.Sequelize.Op.lt]: new Date()
        }
      }
    });
    
    for (const reserva of reservasExpiradas) {
      // Devolver el stock
      await sequelize.query(
        'UPDATE productos SET stock = stock + :cantidad WHERE producto_id = :productoId',
        {
          replacements: { 
            cantidad: reserva.cantidad_reservada, 
            productoId: reserva.producto_id 
          },
          type: QueryTypes.UPDATE
        }
      );
      
      // Marcar como expirada
      await reserva.update({ estado_reserva: 'expirada' });
    }
    
    return reservasExpiradas.length;
    
  } catch (error) {
    throw error;
  }
};

module.exports = Reserva;
