const blogModel = require('../models/blogModel');

// Crear una nueva publicación
exports.crearPublicacion = async (req, res, next) => {
  const { titulo, contenido } = req.body;

  try {
    const nuevaPublicacion = await blogModel.crearPublicacion(req.userId, titulo, contenido);
    res.status(201).json(nuevaPublicacion);
  } catch (error) {
    next(error);
  }
};

// Obtener todas las publicaciones
exports.obtenerPublicaciones = async (req, res, next) => {
  try {
    const publicaciones = await blogModel.obtenerPublicaciones();
    res.json(publicaciones);
  } catch (error) {
    next(error);
  }
};

// Obtener una publicación por ID
exports.obtenerPublicacionPorId = async (req, res, next) => {
  const { id } = req.params;

  try {
    const publicacion = await blogModel.obtenerPublicacionPorId(id);
    if (!publicacion) {
      return res.status(404).json({ message: 'Publicación no encontrada.' });
    }
    res.json(publicacion);
  } catch (error) {
    next(error);
  }
};

// Actualizar una publicación
exports.actualizarPublicacion = async (req, res, next) => {
  const { id } = req.params;
  const { titulo, contenido } = req.body;

  try {
    const publicacionActualizada = await blogModel.actualizarPublicacion(id, titulo, contenido);
    if (!publicacionActualizada) {
      return res.status(404).json({ message: 'Publicación no encontrada.' });
    }
    res.json(publicacionActualizada);
  } catch (error) {
    next(error);
  }
};

// Eliminar una publicación
exports.eliminarPublicacion = async (req, res, next) => {
  const { id } = req.params;

  try {
    const resultado = await blogModel.eliminarPublicacion(id);
    if (!resultado) {
      return res.status(404).json({ message: 'Publicación no encontrada.' });
    }
    res.json({ message: 'Publicación eliminada con éxito.' });
  } catch (error) {
    next(error);
  }
};
