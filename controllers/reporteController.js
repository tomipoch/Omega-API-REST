const pool = require('../db');
const { Parser } = require('json2csv');
const PDFDocument = require('pdfkit');

// Obtener reporte de auditoría (filtrado por fecha, acción, o usuario)
exports.obtenerReporteAuditoria = async (req, res, next) => {
  const { fechaInicio, fechaFin, accion, usuario_id } = req.query;

  try {
    let query = 'SELECT * FROM auditoria_seguridad WHERE 1=1';
    const params = [];

    // Filtros opcionales
    if (fechaInicio) {
      query += ' AND fecha >= $1';
      params.push(fechaInicio);
    }

    if (fechaFin) {
      query += params.length ? ' AND fecha <= $2' : ' AND fecha <= $1';
      params.push(fechaFin);
    }

    if (accion) {
      query += ` AND accion = $${params.length + 1}`;
      params.push(accion);
    }

    if (usuario_id) {
      query += ` AND usuario_id = $${params.length + 1}`;
      params.push(usuario_id);
    }

    query += ' ORDER BY fecha DESC';

    const { rows } = await pool.query(query, params);
    res.json(rows);
  } catch (error) {
    next(error);
  }
};

// Obtener reporte de usuarios activos/inactivos
exports.obtenerReporteUsuarios = async (req, res, next) => {
    const { estado, ultimoInicio } = req.query;  // Ej. "activo", "inactivo"
  
    try {
      let query = 'SELECT * FROM usuarios WHERE 1=1';
      const params = [];
  
      // Filtros opcionales para estado o último inicio de sesión
      if (estado === 'activo') {
        query += ' AND ultimo_inicio_sesion >= NOW() - INTERVAL \'30 days\'';
      } else if (estado === 'inactivo') {
        query += ' AND ultimo_inicio_sesion < NOW() - INTERVAL \'30 days\'';
      }
  
      const { rows } = await pool.query(query, params);
      res.json(rows);
    } catch (error) {
      next(error);
    }
};
  
// Exportar reporte de auditoría a CSV
exports.exportarReporteAuditoriaCSV = async (req, res, next) => {
    const { fechaInicio, fechaFin, accion, usuario_id } = req.query;
  
    try {
      let query = 'SELECT * FROM auditoria_seguridad WHERE 1=1';
      const params = [];
  
      if (fechaInicio) {
        query += ' AND fecha >= $1';
        params.push(fechaInicio);
      }
  
      if (fechaFin) {
        query += params.length ? ' AND fecha <= $2' : ' AND fecha <= $1';
        params.push(fechaFin);
      }
  
      if (accion) {
        query += ` AND accion = $${params.length + 1}`;
        params.push(accion);
      }
  
      if (usuario_id) {
        query += ` AND usuario_id = $${params.length + 1}`;
        params.push(usuario_id);
      }
  
      const { rows } = await pool.query(query, params);
  
      // Convertir a CSV usando json2csv
      const json2csvParser = new Parser();
      const csv = json2csvParser.parse(rows);
  
      // Configurar el encabezado para descargar el CSV
      res.header('Content-Type', 'text/csv');
      res.attachment('reporte_auditoria.csv');
      res.send(csv);
    } catch (error) {
      next(error);
    }
};

// Exportar reporte de auditoría a PDF
exports.exportarReporteAuditoriaPDF = async (req, res, next) => {
    const { fechaInicio, fechaFin, accion, usuario_id } = req.query;
  
    try {
      let query = 'SELECT * FROM auditoria_seguridad WHERE 1=1';
      const params = [];
  
      if (fechaInicio) {
        query += ' AND fecha >= $1';
        params.push(fechaInicio);
      }
  
      if (fechaFin) {
        query += params.length ? ' AND fecha <= $2' : ' AND fecha <= $1';
        params.push(fechaFin);
      }
  
      if (accion) {
        query += ` AND accion = $${params.length + 1}`;
        params.push(accion);
      }
  
      if (usuario_id) {
        query += ` AND usuario_id = $${params.length + 1}`;
        params.push(usuario_id);
      }
  
      const { rows } = await pool.query(query, params);
  
      // Crear el documento PDF
      const doc = new PDFDocument();
  
      // Configurar encabezado para descargar PDF
      res.setHeader('Content-Disposition', 'attachment; filename="reporte_auditoria.pdf"');
      res.setHeader('Content-Type', 'application/pdf');
  
      // Escribir el contenido del PDF
      doc.text('Reporte de Auditoría de Seguridad', { align: 'center', fontSize: 20 });
      doc.moveDown();
  
      rows.forEach((row) => {
        doc.text(`ID Auditoría: ${row.auditoria_id}`);
        doc.text(`ID Usuario: ${row.usuario_id}`);
        doc.text(`Acción: ${row.accion}`);
        doc.text(`Fecha: ${row.fecha}`);
        doc.text(`Detalles: ${row.detalles}`);
        doc.moveDown();
      });
  
      // Finalizar el documento PDF y enviarlo al cliente
      doc.pipe(res);
      doc.end();
    } catch (error) {
      next(error);
    }
  };