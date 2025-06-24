const pool = require('../db');  // Archivo donde se configura la conexión a PostgreSQL

// Crear una nueva cita con disponibilidad
exports.crearCita = async (usuarioId, disponibilidadId, servicioId, notas) => {
  const client = await pool.connect();
  
  try {
    await client.query('BEGIN');
    
    // 1. Verificar que la disponibilidad esté disponible
    const verificarQuery = `
      SELECT disponibilidad_id, fecha, hora_inicio, hora_fin, estado 
      FROM disponibilidad_citas 
      WHERE disponibilidad_id = $1 AND estado = 'disponible'
        AND fecha >= CURRENT_DATE
        AND (fecha > CURRENT_DATE OR hora_inicio > CURRENT_TIME)
    `;
    const { rows: disponibilidad } = await client.query(verificarQuery, [disponibilidadId]);
    
    if (!disponibilidad.length) {
      throw new Error('La disponibilidad seleccionada no está disponible');
    }
    
    // 2. Crear la cita
    const crearCitaQuery = `
      INSERT INTO citas (usuario_id, disponibilidad_id, fecha_hora, servicio_id, estado_id, notas)
      VALUES ($1, $2, $3, $4, 1, $5) RETURNING *;
    `;
    
    // Combinar fecha y hora_inicio para crear timestamp
    const fechaHora = `${disponibilidad[0].fecha}T${disponibilidad[0].hora_inicio}`;
    const { rows: cita } = await client.query(crearCitaQuery, [
      usuarioId, 
      disponibilidadId, 
      fechaHora, 
      servicioId, 
      notas
    ]);
    
    // 3. Marcar disponibilidad como ocupada
    const actualizarDisponibilidadQuery = `
      UPDATE disponibilidad_citas 
      SET estado = 'ocupada' 
      WHERE disponibilidad_id = $1
    `;
    await client.query(actualizarDisponibilidadQuery, [disponibilidadId]);
    
    await client.query('COMMIT');
    return cita[0];
    
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
};

// Obtener citas de un usuario con información de disponibilidad
exports.obtenerCitas = async (usuarioId) => {
  const query = `
    SELECT 
      c.*,
      d.fecha,
      d.hora_inicio,
      d.hora_fin,
      s.nombre_servicio as servicio_nombre,
      s.precio as servicio_precio,
      e.nombre_estado as estado_nombre
    FROM citas c
    LEFT JOIN disponibilidad_citas d ON c.disponibilidad_id = d.disponibilidad_id
    LEFT JOIN servicios s ON c.servicio_id = s.servicio_id
    LEFT JOIN estados e ON c.estado_id = e.estado_id
    WHERE c.usuario_id = $1
    ORDER BY d.fecha DESC, d.hora_inicio DESC
  `;
  const { rows } = await pool.query(query, [usuarioId]);
  return rows;
};

// Obtener todas las citas (para admin)
exports.obtenerTodasLasCitas = async () => {
  const query = `
    SELECT 
      c.*,
      u.nombre as usuario_nombre,
      u.apellido_paterno as usuario_apellido,
      u.correo_electronico as usuario_email,
      d.fecha,
      d.hora_inicio,
      d.hora_fin,
      s.nombre_servicio as servicio_nombre,
      s.precio as servicio_precio,
      e.nombre_estado as estado_nombre
    FROM citas c
    LEFT JOIN usuarios u ON c.usuario_id = u.usuario_id
    LEFT JOIN disponibilidad_citas d ON c.disponibilidad_id = d.disponibilidad_id
    LEFT JOIN servicios s ON c.servicio_id = s.servicio_id
    LEFT JOIN estados e ON c.estado_id = e.estado_id
    ORDER BY d.fecha DESC, d.hora_inicio DESC
  `;
  const { rows } = await pool.query(query);
  return rows;
};

// Actualizar una cita
exports.actualizarCita = async (usuarioId, citaId, nuevaDisponibilidadId, servicioId, notas) => {
  const client = await pool.connect();
  
  try {
    await client.query('BEGIN');
    
    // 1. Obtener la cita actual
    const citaActualQuery = `
      SELECT disponibilidad_id FROM citas 
      WHERE cita_id = $1 AND usuario_id = $2
    `;
    const { rows: citaActual } = await client.query(citaActualQuery, [citaId, usuarioId]);
    
    if (!citaActual.length) {
      throw new Error('Cita no encontrada');
    }
    
    // 2. Si se cambia la disponibilidad
    if (nuevaDisponibilidadId && nuevaDisponibilidadId !== citaActual[0].disponibilidad_id) {
      // Verificar nueva disponibilidad
      const verificarQuery = `
        SELECT disponibilidad_id, fecha, hora_inicio, hora_fin, estado 
        FROM disponibilidad_citas 
        WHERE disponibilidad_id = $1 AND estado = 'disponible'
          AND fecha >= CURRENT_DATE
          AND (fecha > CURRENT_DATE OR hora_inicio > CURRENT_TIME)
      `;
      const { rows: nuevaDisponibilidad } = await client.query(verificarQuery, [nuevaDisponibilidadId]);
      
      if (!nuevaDisponibilidad.length) {
        throw new Error('La nueva disponibilidad seleccionada no está disponible');
      }
      
      // Liberar disponibilidad anterior
      await client.query(
        'UPDATE disponibilidad_citas SET estado = \'disponible\' WHERE disponibilidad_id = $1',
        [citaActual[0].disponibilidad_id]
      );
      
      // Ocupar nueva disponibilidad
      await client.query(
        'UPDATE disponibilidad_citas SET estado = \'ocupada\' WHERE disponibilidad_id = $1',
        [nuevaDisponibilidadId]
      );
      
      // Actualizar cita con nueva fecha/hora
      const fechaHora = `${nuevaDisponibilidad[0].fecha}T${nuevaDisponibilidad[0].hora_inicio}`;
      const actualizarQuery = `
        UPDATE citas 
        SET disponibilidad_id = $1, fecha_hora = $2, servicio_id = $3, notas = $4
        WHERE cita_id = $5 AND usuario_id = $6 
        RETURNING *;
      `;
      const { rows } = await client.query(actualizarQuery, [
        nuevaDisponibilidadId, fechaHora, servicioId, notas, citaId, usuarioId
      ]);
      
      await client.query('COMMIT');
      return rows[0];
    } else {
      // Solo actualizar servicio y notas
      const actualizarQuery = `
        UPDATE citas 
        SET servicio_id = $1, notas = $2
        WHERE cita_id = $3 AND usuario_id = $4 
        RETURNING *;
      `;
      const { rows } = await client.query(actualizarQuery, [servicioId, notas, citaId, usuarioId]);
      
      await client.query('COMMIT');
      return rows[0];
    }
    
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
};

// Eliminar una cita y liberar disponibilidad
exports.eliminarCita = async (usuarioId, citaId) => {
  const client = await pool.connect();
  
  try {
    await client.query('BEGIN');
    
    // 1. Obtener información de la cita
    const citaQuery = 'SELECT disponibilidad_id FROM citas WHERE cita_id = $1 AND usuario_id = $2';
    const { rows: cita } = await client.query(citaQuery, [citaId, usuarioId]);
    
    if (!cita.length) {
      throw new Error('Cita no encontrada');
    }
    
    // 2. Eliminar la cita
    const eliminarQuery = 'DELETE FROM citas WHERE cita_id = $1 AND usuario_id = $2 RETURNING *';
    const { rows: citaEliminada } = await client.query(eliminarQuery, [citaId, usuarioId]);
    
    // 3. Liberar la disponibilidad
    if (cita[0].disponibilidad_id) {
      await client.query(
        'UPDATE disponibilidad_citas SET estado = \'disponible\' WHERE disponibilidad_id = $1',
        [cita[0].disponibilidad_id]
      );
    }
    
    await client.query('COMMIT');
    return citaEliminada[0];
    
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
};

// Eliminar una cita como administrador (sin restricciones de usuario)
exports.eliminarCitaAdmin = async (citaId) => {
  const client = await pool.connect();
  
  try {
    await client.query('BEGIN');
    
    // 1. Obtener información de la cita
    const citaQuery = 'SELECT disponibilidad_id FROM citas WHERE cita_id = $1';
    const { rows: cita } = await client.query(citaQuery, [citaId]);
    
    if (!cita.length) {
      throw new Error('Cita no encontrada');
    }
    
    // 2. Eliminar la cita
    const eliminarQuery = 'DELETE FROM citas WHERE cita_id = $1 RETURNING *';
    const { rows: citaEliminada } = await client.query(eliminarQuery, [citaId]);
    
    // 3. Liberar la disponibilidad
    if (cita[0].disponibilidad_id) {
      await client.query(
        'UPDATE disponibilidad_citas SET estado = \'disponible\' WHERE disponibilidad_id = $1',
        [cita[0].disponibilidad_id]
      );
    }
    
    await client.query('COMMIT');
    return citaEliminada[0];
    
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
};

// ===============================
// MÉTODOS PARA ADMINISTRADORES
// ===============================

// Crear una cita como administrador (para cualquier usuario)
exports.crearCitaAdmin = async (usuarioId, disponibilidadId, servicioId, notas) => {
  const client = await pool.connect();
  
  try {
    await client.query('BEGIN');
    
    // 1. Verificar que el usuario existe
    const verificarUsuarioQuery = 'SELECT usuario_id FROM usuarios WHERE usuario_id = $1';
    const { rows: usuario } = await client.query(verificarUsuarioQuery, [usuarioId]);
    
    if (!usuario.length) {
      throw new Error('El usuario especificado no existe');
    }
    
    // 2. Verificar que la disponibilidad existe y está disponible
    const verificarQuery = `
      SELECT disponibilidad_id, fecha, hora_inicio, hora_fin, estado 
      FROM disponibilidad_citas 
      WHERE disponibilidad_id = $1 AND estado = 'disponible'
        AND fecha >= CURRENT_DATE
        AND (fecha > CURRENT_DATE OR hora_inicio > CURRENT_TIME)
    `;
    const { rows: disponibilidad } = await client.query(verificarQuery, [disponibilidadId]);
    
    if (!disponibilidad.length) {
      throw new Error('La disponibilidad seleccionada no está disponible o ha expirado');
    }
    
    // 3. Verificar que el servicio existe
    const verificarServicioQuery = 'SELECT servicio_id FROM servicios WHERE servicio_id = $1';
    const { rows: servicio } = await client.query(verificarServicioQuery, [servicioId]);
    
    if (!servicio.length) {
      throw new Error('El servicio especificado no existe');
    }
    
    // 4. Crear la cita
    const fechaHora = `${disponibilidad[0].fecha}T${disponibilidad[0].hora_inicio}`;
    const crearQuery = `
      INSERT INTO citas (usuario_id, fecha_hora, servicio_id, estado_id, notas, disponibilidad_id) 
      VALUES ($1, $2, $3, 1, $4, $5) 
      RETURNING *;
    `;
    const { rows: nuevaCita } = await client.query(crearQuery, [
      usuarioId, fechaHora, servicioId, notas || null, disponibilidadId
    ]);
    
    // 5. Marcar la disponibilidad como ocupada
    await client.query(
      'UPDATE disponibilidad_citas SET estado = \'ocupada\' WHERE disponibilidad_id = $1',
      [disponibilidadId]
    );
    
    await client.query('COMMIT');
    return nuevaCita[0];
    
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
};

// Actualizar una cita como administrador
exports.actualizarCitaAdmin = async (citaId, nuevaDisponibilidadId, servicioId, notas, nuevoUsuarioId) => {
  const client = await pool.connect();
  
  try {
    await client.query('BEGIN');
    
    // 1. Obtener la cita actual
    const citaActualQuery = `
      SELECT cita_id, usuario_id, disponibilidad_id 
      FROM citas 
      WHERE cita_id = $1
    `;
    const { rows: citaActual } = await client.query(citaActualQuery, [citaId]);
    
    if (!citaActual.length) {
      throw new Error('Cita no encontrada');
    }
    
    // 2. Si se cambia el usuario, verificar que existe
    if (nuevoUsuarioId && nuevoUsuarioId !== citaActual[0].usuario_id) {
      const verificarUsuarioQuery = 'SELECT usuario_id FROM usuarios WHERE usuario_id = $1';
      const { rows: usuario } = await client.query(verificarUsuarioQuery, [nuevoUsuarioId]);
      
      if (!usuario.length) {
        throw new Error('El nuevo usuario especificado no existe');
      }
    }
    
    // 3. Si se cambia la disponibilidad
    if (nuevaDisponibilidadId && nuevaDisponibilidadId !== citaActual[0].disponibilidad_id) {
      // Verificar nueva disponibilidad
      const verificarQuery = `
        SELECT disponibilidad_id, fecha, hora_inicio, hora_fin, estado 
        FROM disponibilidad_citas 
        WHERE disponibilidad_id = $1 AND estado = 'disponible'
          AND fecha >= CURRENT_DATE
          AND (fecha > CURRENT_DATE OR hora_inicio > CURRENT_TIME)
      `;
      const { rows: nuevaDisponibilidad } = await client.query(verificarQuery, [nuevaDisponibilidadId]);
      
      if (!nuevaDisponibilidad.length) {
        throw new Error('La nueva disponibilidad seleccionada no está disponible');
      }
      
      // Liberar disponibilidad anterior
      await client.query(
        'UPDATE disponibilidad_citas SET estado = \'disponible\' WHERE disponibilidad_id = $1',
        [citaActual[0].disponibilidad_id]
      );
      
      // Ocupar nueva disponibilidad
      await client.query(
        'UPDATE disponibilidad_citas SET estado = \'ocupada\' WHERE disponibilidad_id = $1',
        [nuevaDisponibilidadId]
      );
      
      // Actualizar cita con nueva fecha/hora
      const fechaHora = `${nuevaDisponibilidad[0].fecha}T${nuevaDisponibilidad[0].hora_inicio}`;
      const actualizarQuery = `
        UPDATE citas 
        SET disponibilidad_id = $1, fecha_hora = $2, servicio_id = $3, notas = $4, usuario_id = $5
        WHERE cita_id = $6 
        RETURNING *;
      `;
      const { rows } = await client.query(actualizarQuery, [
        nuevaDisponibilidadId, fechaHora, servicioId, notas, 
        nuevoUsuarioId || citaActual[0].usuario_id, citaId
      ]);
      
      await client.query('COMMIT');
      return rows[0];
    } else {
      // Solo actualizar servicio, notas y/o usuario
      const actualizarQuery = `
        UPDATE citas 
        SET servicio_id = $1, notas = $2, usuario_id = $3
        WHERE cita_id = $4 
        RETURNING *;
      `;
      const { rows } = await client.query(actualizarQuery, [
        servicioId, notas, nuevoUsuarioId || citaActual[0].usuario_id, citaId
      ]);
      
      await client.query('COMMIT');
      return rows[0];
    }
    
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
};
