// Configuración de asociaciones entre modelos
const Usuario = require('./usuarioSequelize');
const Producto = require('./productoModel');
const Reserva = require('./reservaModel');

// Configurar asociaciones
function configurarAsociaciones() {
  // Un usuario puede tener muchas reservas
  Usuario.hasMany(Reserva, {
    foreignKey: 'usuario_id',
    as: 'reservas'
  });

  // Una reserva pertenece a un usuario
  Reserva.belongsTo(Usuario, {
    foreignKey: 'usuario_id',
    as: 'usuario'
  });

  // Un producto puede tener muchas reservas
  Producto.hasMany(Reserva, {
    foreignKey: 'producto_id',
    as: 'reservas'
  });

  // Una reserva pertenece a un producto
  Reserva.belongsTo(Producto, {
    foreignKey: 'producto_id',
    as: 'producto'
  });

  console.log('✅ Asociaciones de modelos configuradas correctamente');
}

module.exports = configurarAsociaciones;
