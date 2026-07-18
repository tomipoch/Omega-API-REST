const blogModel = require('../models/blogModel');
const { NotFoundError } = require('../utils/errors');

exports.crear = async (autorId, datos) => {
  const secciones = (datos.secciones || []).filter((s) => s.subtitulo && s.contenido);
  return blogModel.crearPublicacionConSecciones(
    autorId,
    datos.titulo,
    datos.contenido,
    secciones
  );
};

exports.listarPaginadas = async (limit, page) => {
  const offset = (page - 1) * limit;
  const articles = await blogModel.obtenerPublicacionesPaginadas(limit, offset);
  const { total } = await blogModel.contarTotalPublicaciones();
  return {
    articles,
    total,
    totalPages: Math.ceil(total / limit)
  };
};

exports.obtenerPorId = async (id) => {
  const publicacion = await blogModel.obtenerPublicacionPorId(id);
  if (!publicacion) throw new NotFoundError('Publicación no encontrada.');
  publicacion.secciones = await blogModel.obtenerSeccionesPorPublicacionId(id);
  return publicacion;
};

exports.actualizar = async (id, datos) => {
  const secciones = (datos.secciones || []).filter((s) => s.subtitulo && s.contenido);
  const actualizada = await blogModel.actualizarPublicacionConSecciones(
    id,
    datos.titulo,
    datos.contenido,
    secciones
  );
  if (!actualizada) throw new NotFoundError('Publicación no encontrada.');
  return actualizada;
};

exports.eliminar = async (id) => {
  const eliminada = await blogModel.eliminarPublicacion(id);
  if (!eliminada) throw new NotFoundError('Publicación no encontrada.');
};
