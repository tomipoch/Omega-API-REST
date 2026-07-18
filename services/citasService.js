const citasModel = require('../models/citasModel');
const { NotFoundError } = require('../utils/errors');

exports.crear = (usuarioId, datos) => citasModel.crearCita(
  usuarioId, datos.fecha_hora, datos.servicio_id, datos.estado_id, datos.notas
);

exports.listarDelUsuario = (usuarioId) => citasModel.obtenerCitas(usuarioId);

exports.listarTodas = () => citasModel.obtenerTodasLasCitas();

exports.actualizar = async (usuarioId, id, datos) => {
  const cita = await citasModel.actualizarCita(
    usuarioId,
    id,
    datos.fecha_hora,
    datos.servicio_id,
    datos.estado_id,
    datos.notas
  );
  if (!cita) throw new NotFoundError('Cita no encontrada o no tienes permiso para actualizarla.');
  return cita;
};

exports.eliminar = async (usuarioId, id) => {
  const eliminada = await citasModel.eliminarCita(usuarioId, id);
  if (!eliminada) throw new NotFoundError('Cita no encontrada o no tienes permiso para eliminarla.');
};
