const faqModel = require('../models/faqModel');

// Crear una nueva pregunta frecuente (admin)
exports.crearPregunta = async (req, res, next) => {
  const { pregunta, respuesta } = req.body;

  try {
    const nuevaPregunta = await faqModel.crearPregunta(pregunta, respuesta);
    res.status(201).json(nuevaPregunta);
  } catch (error) {
    next(error);
  }
};

// Obtener todas las preguntas frecuentes
exports.obtenerPreguntas = async (req, res, next) => {
  try {
    const preguntas = await faqModel.obtenerPreguntas();
    res.json(preguntas);
  } catch (error) {
    next(error);
  }
};

// Actualizar una pregunta frecuente (admin)
exports.actualizarPregunta = async (req, res, next) => {
  const { id } = req.params;
  const { pregunta, respuesta } = req.body;

  try {
    const preguntaActualizada = await faqModel.actualizarPregunta(id, pregunta, respuesta);
    if (!preguntaActualizada) {
      return res.status(404).json({ message: 'Pregunta no encontrada.' });
    }
    res.json(preguntaActualizada);
  } catch (error) {
    next(error);
  }
};

// Eliminar una pregunta frecuente (admin)
exports.eliminarPregunta = async (req, res, next) => {
  const { id } = req.params;

  try {
    const resultado = await faqModel.eliminarPregunta(id);
    if (!resultado) {
      return res.status(404).json({ message: 'Pregunta no encontrada.' });
    }
    res.json({ message: 'Pregunta eliminada con éxito.' });
  } catch (error) {
    next(error);
  }
};
