const faqModel = require('../models/faqModel');
const { NotFoundError } = require('../utils/errors');

exports.listar = () => faqModel.obtenerPreguntas();

exports.crear = (pregunta, respuesta) => faqModel.crearPregunta(pregunta, respuesta);

exports.actualizar = async (id, pregunta, respuesta) => {
  const actualizada = await faqModel.actualizarPregunta(id, pregunta, respuesta);
  if (!actualizada) throw new NotFoundError('Pregunta no encontrada.');
  return actualizada;
};

exports.eliminar = async (id) => {
  const eliminada = await faqModel.eliminarPregunta(id);
  if (!eliminada) throw new NotFoundError('Pregunta no encontrada.');
};