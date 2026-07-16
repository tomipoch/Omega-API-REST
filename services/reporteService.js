const pool = require('../database/pgPool');
const { Parser } = require('json2csv');
const PDFDocument = require('pdfkit');

const construirQueryAuditoria = (filtros = {}) => {
  const { fechaInicio, fechaFin, accion, usuario_id } = filtros;
  const condiciones = [];
  const params = [];

  const agregar = (condicion, valor) => {
    params.push(valor);
    condiciones.push(condicion.replace('?', `$${params.length}`));
  };

  if (fechaInicio) agregar('fecha >= ?', fechaInicio);
  if (fechaFin) agregar('fecha <= ?', fechaFin);
  if (accion) agregar('accion = ?', accion);
  if (usuario_id) agregar('usuario_id = ?', usuario_id);

  const where = condiciones.length ? `WHERE ${condiciones.join(' AND ')}` : '';
  return {
    text: `SELECT * FROM auditoria_seguridad ${where} ORDER BY fecha DESC`,
    params
  };
};

const buscarAuditoria = async (filtros) => {
  const { text, params } = construirQueryAuditoria(filtros);
  const { rows } = await pool.query(text, params);
  return rows;
};

const exportarAuditoriaCSV = async (filtros) => {
  const filas = await buscarAuditoria(filtros);
  return new Parser().parse(filas);
};

const renderAuditoriaPDF = (filas) => {
  const doc = new PDFDocument();
  doc.text('Reporte de Auditoría de Seguridad', { align: 'center', fontSize: 20 });
  filas.forEach(fila => {
    doc.moveDown();
    doc.text(`ID Auditoría: ${fila.auditoria_id}`);
    doc.text(`ID Usuario: ${fila.usuario_id}`);
    doc.text(`Acción: ${fila.accion}`);
    doc.text(`Fecha: ${fila.fecha}`);
    doc.text(`Detalles: ${fila.detalles}`);
  });
  return doc;
};

const exportarAuditoriaPDF = (filtros) => buscarAuditoria(filtros).then(renderAuditoriaPDF);

const buscarUsuariosActivos = () =>
  pool.query(`SELECT * FROM usuarios WHERE ultimo_inicio_sesion >= NOW() - INTERVAL '30 days'`)
    .then(r => r.rows);

const buscarUsuariosInactivos = () =>
  pool.query(`SELECT * FROM usuarios WHERE ultimo_inicio_sesion < NOW() - INTERVAL '30 days'`)
    .then(r => r.rows);

module.exports = {
  construirQueryAuditoria,
  buscarAuditoria,
  exportarAuditoriaCSV,
  exportarAuditoriaPDF,
  buscarUsuariosActivos,
  buscarUsuariosInactivos
};