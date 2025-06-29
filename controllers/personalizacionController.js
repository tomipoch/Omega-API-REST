const personalizacionModel = require('../models/personalizacionModel'); 

// Crear una nueva solicitud de personalización con imágenes
exports.crearSolicitud = async (req, res, next) => {
  const { usuario_id, servicio_id, detalles } = req.body;
  const imagenes = req.files ? req.files.map(file => file.path) : [];

  try {
    const nuevaSolicitud = await personalizacionModel.crearSolicitud(usuario_id, servicio_id, detalles);
    // Guardar las imágenes asociadas
    for (const imagen of imagenes) {
      await personalizacionModel.agregarImagen(nuevaSolicitud.solicitud_id, imagen);
    }
    res.status(201).json(nuevaSolicitud);
  } catch (error) {
    next(error);
  }
};

// Obtener todas las solicitudes de personalización
exports.obtenerSolicitudes = async (req, res, next) => {
  try {
    const solicitudes = await personalizacionModel.obtenerSolicitudes();
    res.json(solicitudes);
  } catch (error) {
    console.error('Error al obtener solicitudes:', error.message);
    res.status(500).json({ 
      message: 'Error interno del servidor al obtener solicitudes',
      error: error.message 
    });
  }
};

// Actualizar el estado de una solicitud (aceptar o rechazar)
exports.actualizarEstadoSolicitud = async (req, res, next) => {
  const { id } = req.params; // ID de la solicitud
  const { nuevo_estado } = req.body; // El estado nuevo, que puede ser "aceptar" o "rechazar"

  try {
    const solicitudActualizada = await personalizacionModel.actualizarEstadoSolicitud(id, nuevo_estado);
    if (!solicitudActualizada) {
      return res.status(404).json({ message: 'Solicitud no encontrada.' });
    }
    res.json(solicitudActualizada);
  } catch (error) {
    next(error);
  }
};
