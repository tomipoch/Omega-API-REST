const Producto = require('../models/productoModel.js');
const sequelize = require('../config/sequelize');

describe('Modelo Producto', () => {
  let productoCreado;
  const productoData = {
    nombre_producto: 'Teclado Mecánico',
    descripcion_producto: 'Teclado retroiluminado con switches azules.',
    precio_producto: 49990,
    stock: 50,
    imagen_producto: 'https://ejemplo.com/teclado.jpg'
  };

  beforeAll(async () => {
    await sequelize.sync(); // crea la tabla si no existe
  });

  afterAll(async () => {
    await sequelize.close(); // cierra la conexión al final
  });

  test('Debe crear un nuevo producto', async () => {
    productoCreado = await Producto.create(productoData);
    expect(productoCreado).toHaveProperty('producto_id');
    expect(productoCreado.nombre_producto).toBe(productoData.nombre_producto);
  });

  test('Debe obtener un producto por ID', async () => {
    const productoObtenido = await Producto.findByPk(productoCreado.producto_id);
    expect(productoObtenido).not.toBeNull();
    expect(productoObtenido.nombre_producto).toBe(productoData.nombre_producto);
  });
});
