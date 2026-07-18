const pool = require('../database/pgPool');
const reservasModel = require('../models/reservasModel');

describe('Modelo de Reservas (transaccional)', () => {
  let usuarioId;
  let productoId;
  let dbUp = false;

  beforeAll(async () => {
    dbUp = await global.checkDb();
    if (!dbUp) return;

    await pool.query('BEGIN');
    const u = await pool.query(
      `INSERT INTO usuarios (nombre, correo_electronico, contrasena, rol_id)
       VALUES ('ResTest', 'restest@test.com', 'x', 1) RETURNING usuario_id`
    );
    usuarioId = u.rows[0].usuario_id;

    const p = await pool.query(
      `INSERT INTO productos (nombre_producto, descripcion_producto, precio_producto, stock)
       VALUES ('P', 'D', 100, 10) RETURNING producto_id`
    );
    productoId = p.rows[0].producto_id;
  });

  afterAll(async () => {
    if (!dbUp) return;
    await pool.query('ROLLBACK');
    await pool.end();
  });

  test('Reservar producto decrementa stock', async () => {
    if (!dbUp) return;
    const { reserva, producto } = await reservasModel.reservarProducto(usuarioId, productoId, 2);
    expect(reserva.cantidad_reservada).toBe(2);
    expect(producto.stock).toBe(8);
  });

  test('Reservar más stock del disponible lanza error', async () => {
    if (!dbUp) return;
    await expect(reservasModel.reservarProducto(usuarioId, productoId, 999)).rejects.toThrow(/Stock insuficiente/);
  });

  test('Cancelar reserva devuelve stock', async () => {
    if (!dbUp) return;
    const { reserva } = await reservasModel.reservarProducto(usuarioId, productoId, 1);
    const cancelada = await reservasModel.cancelarReserva(reserva.reserva_id, usuarioId);
    expect(cancelada.estado_reserva).toBe('cancelada');

    const prod = await pool.query('SELECT stock FROM productos WHERE producto_id = $1', [productoId]);
    expect(prod.rows[0].stock).toBe(7);
  });

  test('Confirmar reserva cambia estado', async () => {
    if (!dbUp) return;
    const { reserva } = await reservasModel.reservarProducto(usuarioId, productoId, 1);
    const confirmada = await reservasModel.confirmarReserva(reserva.reserva_id, usuarioId);
    expect(confirmada.estado_reserva).toBe('confirmada');
  });

  test('Confirmar reserva expirada lanza error', async () => {
    if (!dbUp) return;
    const { reserva } = await reservasModel.reservarProducto(usuarioId, productoId, 1);
    await pool.query(
      "UPDATE reservas SET fecha_expiracion = NOW() - INTERVAL '1 minute' WHERE reserva_id = $1",
      [reserva.reserva_id]
    );
    await expect(reservasModel.confirmarReserva(reserva.reserva_id, usuarioId)).rejects.toThrow(/expirado/);
  });
});
