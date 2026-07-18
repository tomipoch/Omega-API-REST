const pool = require('../../../database/pgPool');

const TABLES = [
  'reservas',
  'solicitudes_imagenes',
  'solicitudes_personalizacion',
  'inscripciones_eventos',
  'publicaciones_blog',
  'secciones_blog',
  'testimonios',
  'citas',
  'preguntas_frecuentes',
  'restablecimiento_contrasena',
  'eventos',
  'productos',
  'disponibilidad_citas',
  'auditoria_seguridad',
  'usuarios',
  'servicios',
  'estados',
  'roles'
];

const truncateAll = async (client = pool) => {
  await client.query('TRUNCATE TABLE ' + TABLES.join(', ') + ' RESTART IDENTITY CASCADE');
};

module.exports = { truncateAll };
