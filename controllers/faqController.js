const faqService = require('../services/faqService');
const { asyncHandler } = require('../utils/asyncHandler');

exports.obtenerPreguntas = asyncHandler(async (req, res) => {
  res.json(await faqService.listar());
});

exports.crearPregunta = asyncHandler(async (req, res) => {
  res.status(201).json(await faqService.crear(req.body.pregunta, req.body.respuesta));
});

exports.actualizarPregunta = asyncHandler(async (req, res) => {
  res.json(await faqService.actualizar(req.params.id, req.body.pregunta, req.body.respuesta));
});

exports.eliminarPregunta = asyncHandler(async (req, res) => {
  await faqService.eliminar(req.params.id);
  res.status(204).end();
});