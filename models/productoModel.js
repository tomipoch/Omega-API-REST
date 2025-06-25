const { DataTypes } = require('sequelize');
const sequelize = require('../config/sequelize');

const Producto = sequelize.define('Producto', {
  producto_id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  nombre_producto: {
    type: DataTypes.STRING,
    allowNull: false
  },
  descripcion_producto: {
    type: DataTypes.TEXT,
    allowNull: false
  },
  precio_producto: {
    type: DataTypes.FLOAT,
    allowNull: false
  },
  stock: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  imagen_producto: {
    type: DataTypes.STRING,
    allowNull: true // Permite que la imagen sea opcional
  }
}, {
  tableName: 'productos',
  timestamps: false
});

module.exports = Producto;