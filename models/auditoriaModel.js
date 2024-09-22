const pool = require('../db');

// Registrar un evento de auditoría
exports.registrarAuditoria = async (usuario_id, accion, detalles = null) => {
  const query = `
    INSERT INTO auditoria_seguridad (usuario_id, accion, detalles)
    VALUES ($1, $2, $3) RETURNING *;
  `;
  const { rows } = await pool.query(query, [usuario_id, accion, detalles]);
  return rows[0];
};
