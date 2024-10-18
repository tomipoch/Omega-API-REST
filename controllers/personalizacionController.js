const personalizacionModel = require('../models/personalizacionModel');

// Crear una nueva solicitud de personalización con imágenes
exports.crearSolicitud = (req, res, next) => {
  const { usuario_id, servicio_id, detalles } = req.body;
  const imagenes = req.files ? req.files.map(file => file.path) : null;

  personalizacionModel.crearSolicitud(usuario_id, servicio_id, detalles, imagenes)
    .then(nuevaSolicitud => {
      res.status(201).json(nuevaSolicitud);
    })
    .catch(error => next(error));
};

// Obtener todas las solicitudes de personalización
exports.obtenerSolicitudes = (req, res, next) => {
  personalizacionModel.obtenerSolicitudes()
    .then(solicitudes => {
      res.json(solicitudes);
    })
    .catch(error => next(error));
};

// Actualizar el estado de una solicitud (aceptar o rechazar)
exports.actualizarEstadoSolicitud = (req, res, next) => {
  const { id } = req.params; // ID de la solicitud
  const { nuevo_estado } = req.body; // El estado nuevo, que puede ser "aceptar" o "rechazar"

  personalizacionModel.actualizarEstadoSolicitud(id, nuevo_estado)
    .then(solicitudActualizada => {
      if (!solicitudActualizada) {
        return res.status(404).json({ message: 'Solicitud no encontrada.' });
      }
      res.json(solicitudActualizada);
    })
    .catch(error => next(error));
};
