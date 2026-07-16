const blogModel = require('../models/blogModel');
const { NotFoundError } = require('../utils/errors');

exports.crear = async (autorId, datos) => {
  const publicacion = await blogModel.crearPublicacion(autorId, datos.titulo, datos.contenido);
  if (datos.secciones?.length) {
    const validas = datos.secciones.filter(s => s.subtitulo && s.contenido);
    if (validas.length) {
      await blogModel.crearSecciones(publicacion.publicacion_id, validas);
    }
  }
  return publicacion;
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
  const actualizada = await blogModel.actualizarPublicacion(id, datos.titulo, datos.contenido);
  if (!actualizada) throw new NotFoundError('Publicación no encontrada.');
  await blogModel.eliminarSeccionesPorPublicacionId(id);
  if (datos.secciones?.length) {
    const validas = datos.secciones.filter(s => s.subtitulo && s.contenido);
    if (validas.length) {
      await blogModel.crearSecciones(id, validas);
    }
  }
  return actualizada;
};

exports.eliminar = async (id) => {
  const eliminada = await blogModel.eliminarPublicacion(id);
  if (!eliminada) throw new NotFoundError('Publicación no encontrada.');
};