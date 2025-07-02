const pool = require('../db');

const ReservaModel = {

  async reservarProducto(usuarioId, productoId, cantidad, tiempoExpiracionMinutos = 30) {
    const client = await pool.connect();
    try {
      await client.query('BEGIN');

      // Obtener producto con lock FOR UPDATE para evitar condiciones de carrera
      const { rows } = await client.query(
        'SELECT * FROM productos WHERE producto_id = $1 FOR UPDATE',
        [productoId]
      );

      if (rows.length === 0) {
        throw new Error('Producto no encontrado');
      }

      const producto = rows[0];
      if (producto.stock < cantidad) {
        throw new Error(`Stock insuficiente. Stock disponible: ${producto.stock}`);
      }

      // Calcular fecha expiración
      const fechaExpiracion = new Date();
      fechaExpiracion.setMinutes(fechaExpiracion.getMinutes() + tiempoExpiracionMinutos);

      // Crear reserva
      const insertReservaQuery = `
        INSERT INTO reservas
          (usuario_id, producto_id, cantidad_reservada, estado_reserva, fecha_reserva, fecha_expiracion)
        VALUES
          ($1, $2, $3, 'activa', NOW(), $4)
        RETURNING *`;
      const reservaResult = await client.query(insertReservaQuery, [
        usuarioId,
        productoId,
        cantidad,
        fechaExpiracion
      ]);
      const nuevaReserva = reservaResult.rows[0];

      // Reducir stock temporalmente
      await client.query(
        'UPDATE productos SET stock = stock - $1 WHERE producto_id = $2',
        [cantidad, productoId]
      );

      await client.query('COMMIT');

      // Obtener producto actualizado
      const productoActualizadoResult = await pool.query('SELECT * FROM productos WHERE producto_id = $1', [productoId]);
      const productoActualizado = productoActualizadoResult.rows[0];

      return {
        reserva: nuevaReserva,
        producto: productoActualizado,
        mensaje: `Producto reservado exitosamente. La reserva expira el ${fechaExpiracion.toLocaleString()}`
      };

    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  },

  async confirmarReserva(reservaId, usuarioId) {
    // Buscar reserva activa
    const reservaResult = await pool.query(`
      SELECT * FROM reservas
      WHERE reserva_id = $1 AND usuario_id = $2 AND estado_reserva = 'activa'`,
      [reservaId, usuarioId]
    );
    if (reservaResult.rows.length === 0) {
      throw new Error('Reserva no encontrada o no válida');
    }

    const reserva = reservaResult.rows[0];
    if (new Date() > reserva.fecha_expiracion) {
      // Actualizar a expirada
      await pool.query('UPDATE reservas SET estado_reserva = $1 WHERE reserva_id = $2', ['expirada', reservaId]);
      throw new Error('La reserva ha expirado');
    }

    // Confirmar reserva
    await pool.query('UPDATE reservas SET estado_reserva = $1 WHERE reserva_id = $2', ['confirmada', reservaId]);

    // Retornar reserva actualizada
    const reservaActualizadaResult = await pool.query('SELECT * FROM reservas WHERE reserva_id = $1', [reservaId]);
    return reservaActualizadaResult.rows[0];
  },

  async cancelarReserva(reservaId, usuarioId) {
    const client = await pool.connect();
    try {
      await client.query('BEGIN');

      // Buscar reserva activa
      const reservaResult = await client.query(`
        SELECT * FROM reservas
        WHERE reserva_id = $1 AND usuario_id = $2 AND estado_reserva = 'activa' FOR UPDATE`,
        [reservaId, usuarioId]
      );

      if (reservaResult.rows.length === 0) {
        throw new Error('Reserva no encontrada o no válida');
      }
      const reserva = reservaResult.rows[0];

      // Devolver stock al producto
      await client.query(
        'UPDATE productos SET stock = stock + $1 WHERE producto_id = $2',
        [reserva.cantidad_reservada, reserva.producto_id]
      );

      // Marcar reserva como cancelada
      await client.query(
        'UPDATE reservas SET estado_reserva = $1 WHERE reserva_id = $2',
        ['cancelada', reservaId]
      );

      await client.query('COMMIT');

      return reserva;

    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  },

  async limpiarReservasExpiradas() {
    const client = await pool.connect();
    try {
      await client.query('BEGIN');

      // Obtener reservas activas expiradas
      const expiradasResult = await client.query(`
        SELECT * FROM reservas
        WHERE estado_reserva = 'activa' AND fecha_expiracion < NOW() FOR UPDATE
      `);

      const reservasExpiradas = expiradasResult.rows;

      for (const reserva of reservasExpiradas) {
        // Devolver stock
        await client.query(
          'UPDATE productos SET stock = stock + $1 WHERE producto_id = $2',
          [reserva.cantidad_reservada, reserva.producto_id]
        );
        // Marcar reserva como expirada
        await client.query(
          'UPDATE reservas SET estado_reserva = $1 WHERE reserva_id = $2',
          ['expirada', reserva.reserva_id]
        );
      }

      await client.query('COMMIT');

      return reservasExpiradas.length;

    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  },

  async obtenerReservasPorUsuario(usuarioId) {
    const result = await pool.query(`
      SELECT r.*, p.nombre_producto, p.precio_producto, p.imagen_producto
      FROM reservas r
      LEFT JOIN productos p ON r.producto_id = p.producto_id
      WHERE r.usuario_id = $1
      ORDER BY r.fecha_reserva DESC
    `, [usuarioId]);

    return result.rows;
  }

};

module.exports = ReservaModel;
