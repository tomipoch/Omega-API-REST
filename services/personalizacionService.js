const personalizacionModel = require('../models/personalizacionModel');
const { NotFoundError } = require('../utils/errors');

exports.crear = async (datos, imagenes = []) => {
  const solicitud = await personalizacionModel.crearSolicitud(
    datos.usuario_id, datos.servicio_id, datos.detalles
  );
  await Promise.all(
    imagenes.map(imagen => personalizacionModel.agregarImagen(solicitud.solicitud_id, imagen))
  );
  return solicitud;
};

exports.listar = () => personalizacionModel.obtenerSolicitudes();

exports.actualizarEstado = async (id, nuevoEstado) => {
  const actualizada = await personalizacionModel.actualizarEstadoSolicitud(id, nuevoEstado);
  if (!actualizada) throw new NotFoundError('Solicitud no encontrada.');
  return actualizada;
};