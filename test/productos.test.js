const pool = require('../database/pgPool');
const productosModel = require('../models/productosModel');

describe('Modelo de Productos', () => {
  let dbUp = false;

  beforeAll(async () => {
    dbUp = await global.checkDb();
    if (!dbUp) return;
    await pool.query('BEGIN');
  });

  afterAll(async () => {
    if (!dbUp) return;
    await pool.query('ROLLBACK');
    await pool.end();
  });

  test('Crear producto', async () => {
    if (!dbUp) return;
    const p = await productosModel.crearProducto({
      nombre_producto: 'Anillo de prueba',
      descripcion_producto: 'Anillo de oro 18k',
      precio_producto: 999.99,
      stock: 5,
      imagen_producto: null
    });
    expect(p.producto_id).toBeDefined();
    expect(p.stock).toBe(5);
  });

  test('Obtener todos', async () => {
    if (!dbUp) return;
    const list = await productosModel.obtenerProductos();
    expect(Array.isArray(list)).toBe(true);
  });

  test('Obtener por id', async () => {
    if (!dbUp) return;
    const p = await productosModel.crearProducto({
      nombre_producto: 'Pulsera',
      descripcion_producto: 'Plata',
      precio_producto: 199.5,
      stock: 3,
      imagen_producto: null
    });
    const got = await productosModel.obtenerProductoPorId(p.producto_id);
    expect(got.nombre_producto).toBe('Pulsera');
  });

  test('Actualizar producto preservando imagen si null', async () => {
    if (!dbUp) return;
    const p = await productosModel.crearProducto({
      nombre_producto: 'Collar',
      descripcion_producto: 'Oro',
      precio_producto: 500,
      stock: 1,
      imagen_producto: 'uploads/productos/old.png'
    });
    const updated = await productosModel.actualizarProducto(p.producto_id, {
      nombre_producto: 'Collar v2',
      descripcion_producto: 'Oro',
      precio_producto: 600,
      stock: 2,
      imagen_producto: null
    });
    expect(updated.imagen_producto).toBe('uploads/productos/old.png');
  });
});
