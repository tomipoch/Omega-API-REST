const db = require('../db');

const disponibilidadModel = {
  // Crear nueva disponibilidad
  async crearDisponibilidad(fecha, horaInicio, horaFin, adminId) {
    const query = `
      INSERT INTO disponibilidad_citas (fecha, hora_inicio, hora_fin, admin_id, estado)
      VALUES ($1, $2, $3, $4, 'disponible')
      RETURNING disponibilidad_id
    `;
    const result = await db.query(query, [fecha, horaInicio, horaFin, adminId]);
    return result.rows[0].disponibilidad_id;
  },

  // Obtener todas las disponibilidades
  async obtenerDisponibilidades(fecha = null, estado = null) {
    let query = `
      SELECT 
        d.disponibilidad_id,
        d.fecha,
        d.hora_inicio,
        d.hora_fin,
        d.estado,
        d.fecha_creacion,
        u.nombre as admin_nombre,
        u.apellido_paterno as admin_apellido,
        c.cita_id,
        c.usuario_id as cita_usuario_id,
        c.notas as cita_notas,
        uc.nombre as cliente_nombre,
        uc.apellido_paterno as cliente_apellido,
        uc.correo_electronico as cliente_email,
        s.nombre_servicio as servicio_nombre,
        s.precio as servicio_precio
      FROM disponibilidad_citas d
      LEFT JOIN usuarios u ON d.admin_id = u.usuario_id
      LEFT JOIN citas c ON d.disponibilidad_id = c.disponibilidad_id
      LEFT JOIN usuarios uc ON c.usuario_id = uc.usuario_id
      LEFT JOIN servicios s ON c.servicio_id = s.servicio_id
      WHERE 1=1
    `;
    const params = [];
    let paramCount = 1;

    if (fecha) {
      query += ` AND d.fecha = $${paramCount}`;
      params.push(fecha);
      paramCount++;
    }

    if (estado) {
      query += ` AND d.estado = $${paramCount}`;
      params.push(estado);
      paramCount++;
    }

    query += ' ORDER BY d.fecha ASC, d.hora_inicio ASC';

    const result = await db.query(query, params);
    return result.rows;
  },

  // Obtener disponibilidades para usuarios (solo futuras y disponibles)
  async obtenerDisponibilidadesParaUsuarios() {
    const query = `
      SELECT 
        d.disponibilidad_id,
        d.fecha,
        d.hora_inicio,
        d.hora_fin,
        d.estado
      FROM disponibilidad_citas d
      WHERE d.estado = 'disponible' 
        AND d.fecha >= CURRENT_DATE
        AND (d.fecha > CURRENT_DATE OR d.hora_inicio > CURRENT_TIME)
      ORDER BY d.fecha ASC, d.hora_inicio ASC
    `;
    const result = await db.query(query);
    return result.rows;
  },

  // Obtener disponibilidades para usuarios incluyendo el slot actual de una cita específica
  async obtenerDisponibilidadesParaUsuariosConCitaActual(citaId = null) {
    let query = `
      SELECT 
        d.disponibilidad_id,
        d.fecha,
        d.hora_inicio,
        d.hora_fin,
        d.estado
      FROM disponibilidad_citas d
      WHERE (d.estado = 'disponible' 
        AND d.fecha >= CURRENT_DATE
        AND (d.fecha > CURRENT_DATE OR d.hora_inicio > CURRENT_TIME))
    `;

    const params = [];

    // Si se proporciona un citaId, incluir también el slot actual de esa cita
    if (citaId) {
      query += `
        OR d.disponibilidad_id = (
          SELECT disponibilidad_id 
          FROM citas 
          WHERE cita_id = $1::integer
        )
      `;
      params.push(parseInt(citaId, 10));
    }

    query += ' ORDER BY d.fecha ASC, d.hora_inicio ASC';

    const result = await db.query(query, params);
    return result.rows;
  },

  // Actualizar disponibilidad
  async actualizarDisponibilidad(id, fecha, horaInicio, horaFin, estado) {
    const query = `
      UPDATE disponibilidad_citas 
      SET fecha = $1, hora_inicio = $2, hora_fin = $3, estado = $4
      WHERE disponibilidad_id = $5
    `;
    const result = await db.query(query, [fecha, horaInicio, horaFin, estado, id]);
    return result.rowCount > 0;
  },

  // Eliminar disponibilidad
  async eliminarDisponibilidad(id) {
    const query = 'DELETE FROM disponibilidad_citas WHERE disponibilidad_id = $1';
    const result = await db.query(query, [id]);
    return result.rowCount > 0;
  },

  // Marcar disponibilidad como ocupada
  async marcarComoOcupada(id) {
    const query = `
      UPDATE disponibilidad_citas 
      SET estado = 'ocupada'
      WHERE disponibilidad_id = $1
    `;
    const result = await db.query(query, [id]);
    return result.rowCount > 0;
  },

  // Verificar si una disponibilidad existe y está disponible
  async verificarDisponibilidad(id) {
    const query = `
      SELECT disponibilidad_id, fecha, hora_inicio, hora_fin, estado
      FROM disponibilidad_citas 
      WHERE disponibilidad_id = $1 AND estado = 'disponible'
        AND fecha >= CURRENT_DATE
        AND (fecha > CURRENT_DATE OR hora_inicio > CURRENT_TIME)
    `;
    const result = await db.query(query, [id]);
    return result.rows[0] || null;
  },

  // Obtener disponibilidades por rango de fechas
  async obtenerDisponibilidadesPorRango(fechaInicio, fechaFin) {
    const query = `
      SELECT 
        d.disponibilidad_id,
        d.fecha,
        d.hora_inicio,
        d.hora_fin,
        d.estado,
        u.nombre as admin_nombre,
        u.apellido_paterno as admin_apellido
      FROM disponibilidad_citas d
      LEFT JOIN usuarios u ON d.admin_id = u.usuario_id
      WHERE d.fecha BETWEEN $1 AND $2
      ORDER BY d.fecha ASC, d.hora_inicio ASC
    `;
    const result = await db.query(query, [fechaInicio, fechaFin]);
    return result.rows;
  }
};

module.exports = disponibilidadModel;
