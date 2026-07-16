const pool = require('../database/pgPool');

const TIEMPO_EXPIRACION_MINUTOS = 30;

exports.reservarProducto = async (usuarioId, productoId, cantidad, tiempoExpMin = TIEMPO_EXPIRACION_MINUTOS) => {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    const { rows: [producto] } = await client.query(
      'SELECT producto_id, stock, nombre_producto FROM productos WHERE producto_id = $1 FOR UPDATE',
      [productoId]
    );
    if (!producto) throw new Error('Producto no encontrado');
    if (producto.stock < cantidad) {
      throw new Error(`Stock insuficiente. Stock disponible: ${producto.stock}`);
    }

    const fechaExp = new Date(Date.now() + tiempoExpMin * 60 * 1000);

    const { rows: [reserva] } = await client.query(
      `INSERT INTO reservas (usuario_id, producto_id, cantidad_reservada, estado_reserva, fecha_expiracion)
       VALUES ($1, $2, $3, 'activa', $4) RETURNING *`,
      [usuarioId, productoId, cantidad, fechaExp]
    );

    const { rows: [productoActualizado] } = await client.query(
      'UPDATE productos SET stock = stock - $1 WHERE producto_id = $2 RETURNING stock, nombre_producto',
      [cantidad, productoId]
    );

    await client.query('COMMIT');
    return { reserva, producto: productoActualizado };
  } catch (e) {
    await client.query('ROLLBACK');
    throw e;
  } finally {
    client.release();
  }
};

exports.confirmarReserva = async (reservaId, usuarioId) => {
  const { rows: [reserva] } = await pool.query(
    `SELECT * FROM reservas
     WHERE reserva_id = $1 AND usuario_id = $2 AND estado_reserva = 'activa'`,
    [reservaId, usuarioId]
  );
  if (!reserva) throw new Error('Reserva no encontrada o no válida');

  if (new Date() > new Date(reserva.fecha_expiracion)) {
    await pool.query(
      `UPDATE reservas SET estado_reserva = 'expirada' WHERE reserva_id = $1`,
      [reservaId]
    );
    throw new Error('La reserva ha expirado');
  }

  const { rows: [actualizada] } = await pool.query(
    `UPDATE reservas SET estado_reserva = 'confirmada' WHERE reserva_id = $1 RETURNING *`,
    [reservaId]
  );
  return actualizada;
};

exports.cancelarReserva = async (reservaId, usuarioId) => {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    const { rows: [reserva] } = await client.query(
      `SELECT * FROM reservas
       WHERE reserva_id = $1 AND usuario_id = $2 AND estado_reserva = 'activa' FOR UPDATE`,
      [reservaId, usuarioId]
    );
    if (!reserva) throw new Error('Reserva no encontrada o no válida');

    await client.query(
      'UPDATE productos SET stock = stock + $1 WHERE producto_id = $2',
      [reserva.cantidad_reservada, reserva.producto_id]
    );

    const { rows: [actualizada] } = await client.query(
      `UPDATE reservas SET estado_reserva = 'cancelada' WHERE reserva_id = $1 RETURNING *`,
      [reservaId]
    );

    await client.query('COMMIT');
    return actualizada;
  } catch (e) {
    await client.query('ROLLBACK');
    throw e;
  } finally {
    client.release();
  }
};

exports.limpiarReservasExpiradas = async () => {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    const { rows: expiradas } = await client.query(
      `SELECT reserva_id, producto_id, cantidad_reservada FROM reservas
       WHERE estado_reserva = 'activa' AND fecha_expiracion < NOW() FOR UPDATE`
    );

    for (const r of expiradas) {
      await client.query(
        'UPDATE productos SET stock = stock + $1 WHERE producto_id = $2',
        [r.cantidad_reservada, r.producto_id]
      );
      await client.query(
        `UPDATE reservas SET estado_reserva = 'expirada' WHERE reserva_id = $1`,
        [r.reserva_id]
      );
    }

    await client.query('COMMIT');
    return expiradas.length;
  } catch (e) {
    await client.query('ROLLBACK');
    throw e;
  } finally {
    client.release();
  }
};

exports.obtenerReservasUsuario = async (usuarioId) => {
  const { rows } = await pool.query(
    `SELECT r.reserva_id, r.cantidad_reservada, r.estado_reserva,
            r.fecha_reserva, r.fecha_expiracion,
            p.producto_id, p.nombre_producto, p.precio_producto, p.imagen_producto
     FROM reservas r
     LEFT JOIN productos p ON p.producto_id = r.producto_id
     WHERE r.usuario_id = $1
     ORDER BY r.fecha_reserva DESC`,
    [usuarioId]
  );
  return rows;
};

exports.obtenerEstadisticas24h = async () => {
  const { rows } = await pool.query(
    `SELECT estado_reserva,
            COUNT(*)::int AS cantidad,
            COALESCE(SUM(cantidad_reservada), 0)::int AS productos_reservados
     FROM reservas
     WHERE fecha_reserva >= NOW() - INTERVAL '24 hours'
     GROUP BY estado_reserva`
  );
  return rows;
};