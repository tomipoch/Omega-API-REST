const eventosModel = require('../models/eventosModel');

// Crear un nuevo evento
exports.crearEvento = async (req, res, next) => {
  const { nombre, descripcion, fecha_inicio, fecha_fin, ubicacion, capacidad } = req.body;

  try {
    const nuevoEvento = await eventosModel.crearEvento(nombre, descripcion, fecha_inicio, fecha_fin, ubicacion, capacidad);
    res.status(201).json(nuevoEvento);
  } catch (error) {
    next(error);
  }
};

// Obtener todos los eventos
exports.obtenerEventos = async (req, res, next) => {
  try {
    const eventos = await eventosModel.obtenerEventos();
    res.json(eventos);
  } catch (error) {
    next(error);
  }
};

// Actualizar un evento
exports.actualizarEvento = async (req, res, next) => {
  const { nombre, descripcion, fecha_inicio, fecha_fin, ubicacion, capacidad } = req.body;
  const { id } = req.params;

  try {
    const eventoActualizado = await eventosModel.actualizarEvento(id, nombre, descripcion, fecha_inicio, fecha_fin, ubicacion, capacidad);
    if (!eventoActualizado) {
      return res.status(404).json({ message: 'Evento no encontrado.' });
    }
    res.json(eventoActualizado);
  } catch (error) {
    next(error);
  }
};

// Eliminar un evento
exports.eliminarEvento = async (req, res, next) => {
  const { id } = req.params;

  try {
    const resultado = await eventosModel.eliminarEvento(id);
    if (!resultado) {
      return res.status(404).json({ message: 'Evento no encontrado.' });
    }
    res.json({ message: 'Evento eliminado con éxito.' });
  } catch (error) {
    next(error);
  }
};

exports.inscribirEvento = async (req, res, next) => {
  const { evento_id } = req.body;

  try {
    // Verificar si el evento existe antes de la inscripción
    const evento = await eventosModel.obtenerEventoPorId(evento_id);
    if (!evento) {
      return res.status(404).json({ message: 'El evento no existe.' });
    }

    // Inscribir al usuario en el evento
    const inscripcion = await eventosModel.inscribirEvento(req.userId, evento_id);
    res.status(201).json(inscripcion);
  } catch (error) {
    next(error); // Enviar el error al middleware de manejo de errores
  }
};

// Obtener inscripciones del usuario
exports.obtenerInscripcionesUsuario = async (req, res, next) => {
  try {
    const inscripciones = await eventosModel.obtenerInscripcionesUsuario(req.userId);
    res.json(inscripciones);
  } catch (error) {
    next(error);
  }
};

// Cancelar la inscripción de un evento
exports.cancelarInscripcion = async (req, res, next) => {
  const { evento_id } = req.params; // El ID del evento viene como parámetro

  try {
    // Verificar si el usuario está inscrito en el evento
    const inscripcion = await eventosModel.obtenerInscripcion(req.userId, evento_id);
    if (!inscripcion) {
      return res.status(404).json({ message: 'No estás inscrito en este evento.' });
    }

    // Eliminar la inscripción
    await eventosModel.cancelarInscripcion(req.userId, evento_id);
    res.json({ message: 'Inscripción cancelada con éxito.' });
  } catch (error) {
    next(error);
  }
};