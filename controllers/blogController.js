const blogModel = require('../models/blogModel');

// Crear una nueva publicación
exports.crearPublicacion = async (req, res, next) => {
  const { titulo, contenido, secciones } = req.body;

  try {
    // Crear la publicación principal
    const nuevaPublicacion = await blogModel.crearPublicacion(req.userId, titulo, contenido);

    // Validar y agregar secciones asociadas
    if (secciones && secciones.length > 0) {
      const validSecciones = secciones.filter(
        (section) => section.subtitulo && section.contenido
      );

      if (validSecciones.length > 0) {
        await blogModel.crearSecciones(nuevaPublicacion.publicacion_id, validSecciones);
      }
    }

    res.status(201).json({ message: 'Publicación creada con éxito', publicacion: nuevaPublicacion });
  } catch (error) {
    console.error('Error al crear la publicación:', error);
    next(error);
  }
};

exports.obtenerPublicaciones = async (req, res, next) => {
  const limit = parseInt(req.query.limit, 10) || 10; // Número de artículos por página
  const page = parseInt(req.query.page, 10) || 1;   // Página actual
  const offset = (page - 1) * limit;

  try {
    // Obtener los artículos con paginación
    const articles = await blogModel.obtenerPublicacionesPaginadas(limit, offset);

    // Contar el número total de artículos en la tabla
    const totalArticlesResult = await blogModel.contarTotalPublicaciones();
    const totalArticles = totalArticlesResult.total;

    // Calcular el número total de páginas
    const totalPages = Math.ceil(totalArticles / limit);

    res.json({ articles, totalPages });
  } catch (error) {
    console.error('Error al obtener las publicaciones:', error);
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

    // Obtener las secciones asociadas
    const secciones = await blogModel.obtenerSeccionesPorPublicacionId(id);
    publicacion.secciones = secciones;

    res.json(publicacion);
  } catch (error) {
    console.error('Error al obtener la publicación:', error);
    next(error);
  }
};

// Actualizar una publicación
exports.actualizarPublicacion = async (req, res, next) => {
  const { id } = req.params;
  const { titulo, contenido, secciones } = req.body;

  try {
    const publicacionActualizada = await blogModel.actualizarPublicacion(id, titulo, contenido);

    if (!publicacionActualizada) {
      return res.status(404).json({ message: 'Publicación no encontrada.' });
    }

    // Eliminar secciones existentes
    await blogModel.eliminarSeccionesPorPublicacionId(id);

    // Agregar las nuevas secciones
    if (secciones && secciones.length > 0) {
      const validSecciones = secciones.filter(
        (section) => section.subtitulo && section.contenido
      );

      if (validSecciones.length > 0) {
        await blogModel.crearSecciones(id, validSecciones);
      }
    }

    res.json({ message: 'Publicación actualizada con éxito', publicacion: publicacionActualizada });
  } catch (error) {
    console.error('Error al actualizar la publicación:', error);
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
    console.error('Error al eliminar la publicación:', error);
    next(error);
  }
};
