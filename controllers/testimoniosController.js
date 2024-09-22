const testimoniosModel = require('../models/testimoniosModel');

// Crear un nuevo testimonio
exports.crearTestimonio = async (req, res, next) => {
  const { contenido, estrellas } = req.body;

  try {
    const nuevoTestimonio = await testimoniosModel.crearTestimonio(req.userId, contenido, estrellas);
    res.status(201).json(nuevoTestimonio);
  } catch (error) {
    next(error);
  }
};


// Obtener todos los testimonios aprobados
exports.obtenerTestimonios = async (req, res, next) => {
  try {
    const testimonios = await testimoniosModel.obtenerTestimoniosAprobados();
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
    res.json(testimonioActualizado);
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
