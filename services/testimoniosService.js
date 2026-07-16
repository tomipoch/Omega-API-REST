const testimoniosModel = require('../models/testimoniosModel');
const { NotFoundError } = require('../utils/errors');

exports.crear = (usuarioId, contenido, estrellas) =>
  testimoniosModel.crearTestimonio(usuarioId, contenido, estrellas);

exports.listarAprobados = () => testimoniosModel.obtenerTestimoniosAprobados();

exports.actualizar = async (usuarioId, id, contenido, estrellas) => {
  const actualizado = await testimoniosModel.actualizarTestimonio(usuarioId, id, contenido, estrellas);
  if (!actualizado) throw new NotFoundError('Testimonio no encontrado o no tienes permiso para actualizarlo.');
  return actualizado;
};

exports.eliminar = async (usuarioId, id) => {
  const eliminado = await testimoniosModel.eliminarTestimonio(usuarioId, id);
  if (!eliminado) throw new NotFoundError('Testimonio no encontrado o no tienes permiso para eliminarlo.');
};

exports.aceptar = async (id) => {
  const testimonio = await testimoniosModel.actualizarEstadoTestimonio(id, 'Confirmado');
  if (!testimonio) throw new NotFoundError('Testimonio no encontrado.');
  return testimonio;
};

exports.rechazar = async (id) => {
  const testimonio = await testimoniosModel.actualizarEstadoTestimonio(id, 'Cancelado');
  if (!testimonio) throw new NotFoundError('Testimonio no encontrado.');
  return testimonio;
};

exports.listarPendientes = () => testimoniosModel.obtenerTestimoniosPorEstado('Pendiente');