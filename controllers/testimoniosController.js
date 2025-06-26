const testimoniosModel = require('../models/testimoniosModel');

// Crear un nuevo testimonio
exports.crearTestimonio = async (req, res, next) => {
  const { contenido, estrellas } = req.body;

  try {
    // Verificar que el usuario no sea administrador (solo usuarios normales pueden crear testimonios)
    if (req.userRol === 2) { // Asumiendo que rol_id 2 es administrador
      return res.status(403).json({ message: 'Los administradores no pueden crear testimonios.' });
    }

    const nuevoTestimonio = await testimoniosModel.crearTestimonio(req.userId, contenido, estrellas);
    res.status(201).json(nuevoTestimonio);
  } catch (error) {
    next(error);
  }
};


// Obtener todos los testimonios aprobados
exports.obtenerTestimonios = async (req, res, next) => {
  try {
    const { stars, usuario_id, limit = 10, page = 1 } = req.query;
    
    // Si se solicita filtrar por usuario_id, verificar que coincida con el usuario autenticado
    let filtroUsuario = null;
    if (usuario_id) {
      if (!req.userId || parseInt(usuario_id) !== parseInt(req.userId)) {
        return res.status(403).json({ message: 'No tienes permiso para ver las reseñas de este usuario.' });
      }
      filtroUsuario = parseInt(usuario_id);
    }
    
    const testimonios = await testimoniosModel.obtenerTestimoniosConFiltros({
      stars,
      usuario_id: filtroUsuario,
      limit: parseInt(limit),
      page: parseInt(page)
    });
    res.json(testimonios);
  } catch (error) {
    next(error);
  }
};

// Actualizar un testimonio (solo el propietario)
exports.actualizarTestimonio = async (req, res, next) => {
  const { id } = req.params;
  const { contenido, estrellas } = req.body;

  try {
    const testimonioActualizado = await testimoniosModel.actualizarTestimonio(req.userId, id, contenido, estrellas);
    if (!testimonioActualizado) {
      return res.status(404).json({ message: 'Testimonio no encontrado o no tienes permiso para actualizarlo.' });
    }
    res.json({ 
      message: 'Testimonio actualizado con éxito. Será revisado por un administrador antes de ser publicado.',
      testimonio: testimonioActualizado 
    });
  } catch (error) {
    next(error);
  }
};


// Eliminar un testimonio (solo el propietario)
exports.eliminarTestimonio = async (req, res, next) => {
  const { id } = req.params;

  try {
    const resultado = await testimoniosModel.eliminarTestimonio(req.userId, id);
    if (!resultado) {
      return res.status(404).json({ message: 'Testimonio no encontrado o no tienes permiso para eliminarlo.' });
    }
    res.json({ message: 'Testimonio eliminado con éxito.' });
  } catch (error) {
    next(error);
  }
};

// Aceptar un testimonio (Cambiar estado a Confirmado)
exports.aceptarTestimonio = async (req, res, next) => {
  const { id } = req.params;

  try {
    const testimonio = await testimoniosModel.actualizarEstadoTestimonio(id, 'Confirmado');
    if (!testimonio) {
      return res.status(404).json({ message: 'Testimonio no encontrado.' });
    }
    res.json({ message: 'Testimonio confirmado con éxito.', testimonio });
  } catch (error) {
    next(error);
  }
};


// Rechazar un testimonio (Cambiar estado a Cancelado)
exports.rechazarTestimonio = async (req, res, next) => {
  const { id } = req.params;

  try {
    const testimonio = await testimoniosModel.actualizarEstadoTestimonio(id, 'Cancelado');
    if (!testimonio) {
      return res.status(404).json({ message: 'Testimonio no encontrado.' });
    }
    res.json({ message: 'Testimonio cancelado con éxito.', testimonio });
  } catch (error) {
    next(error);
  }
};

// Obtener todos los testimonios pendientes (para admins)
exports.obtenerTestimoniosPendientes = async (req, res, next) => {
  try {
    const testimonios = await testimoniosModel.obtenerTestimoniosPorEstado('Pendiente');
    res.json(testimonios);
  } catch (error) {
    next(error);
  }
};

// Eliminar cualquier testimonio como admin
exports.eliminarTestimonioAdmin = async (req, res, next) => {
  const { id } = req.params;

  try {
    const resultado = await testimoniosModel.eliminarTestimonioAdmin(id);
    if (!resultado) {
      return res.status(404).json({ message: 'Testimonio no encontrado.' });
    }
    res.json({ message: 'Testimonio eliminado con éxito por administrador.' });
  } catch (error) {
    next(error);
  }
};

// Obtener testimonios públicos (sin autenticación) - solo testimonios aprobados
exports.obtenerTestimoniosPublicos = async (req, res, next) => {
  try {
    const { stars, limit = 10, page = 1 } = req.query;
    
    const testimonios = await testimoniosModel.obtenerTestimoniosConFiltros({
      stars,
      usuario_id: null, // No filtrar por usuario específico
      limit: parseInt(limit),
      page: parseInt(page)
    });
    res.json(testimonios);
  } catch (error) {
    next(error);
  }
};
