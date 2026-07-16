const eventosModel = require('../models/eventosModel');
const { NotFoundError, ConflictError } = require('../utils/errors');

const EVENTO_NO_ENCONTRADO = 'Evento no encontrado.';
const YA_INSCRITO = 'Ya estás inscrito en este evento.';

exports.crear = (datos) => eventosModel.crearEvento(
  datos.nombre, datos.descripcion, datos.fecha_inicio,
  datos.fecha_fin, datos.ubicacion, datos.capacidad
);

exports.listar = () => eventosModel.obtenerEventos();

exports.actualizar = async (id, datos) => {
  const actualizado = await eventosModel.actualizarEvento(
    id, datos.nombre, datos.descripcion, datos.fecha_inicio,
    datos.fecha_fin, datos.ubicacion, datos.capacidad
  );
  if (!actualizado) throw new NotFoundError(EVENTO_NO_ENCONTRADO);
  return actualizado;
};

exports.eliminar = async (id) => {
  const eliminado = await eventosModel.eliminarEvento(id);
  if (!eliminado) throw new NotFoundError(EVENTO_NO_ENCONTRADO);
};

exports.inscribir = async (usuarioId, eventoId) => {
  const evento = await eventosModel.obtenerEventoPorId(eventoId);
  if (!evento) throw new NotFoundError('El evento no existe.');

  try {
    return await eventosModel.inscribirEvento(usuarioId, eventoId);
  } catch (error) {
    if (error.message === 'Ya estás inscrito en este evento.') {
      throw new ConflictError(YA_INSCRITO);
    }
    throw error;
  }
};

exports.cancelarInscripcion = async (usuarioId, eventoId) => {
  const inscripcion = await eventosModel.obtenerInscripcion(usuarioId, eventoId);
  if (!inscripcion) throw new NotFoundError('No estás inscrito en este evento.');
  await eventosModel.cancelarInscripcion(usuarioId, eventoId);
};