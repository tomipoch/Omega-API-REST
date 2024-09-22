const multer = require('multer');
const path = require('path');
const fs = require('fs');
const personalizacionModel = require('../models/personalizacionModel');

// Función para asegurarse de que el directorio existe, si no, lo crea
const ensureDirectoryExistence = (dir) => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
};

// Configuración de multer para manejar la subida de imágenes
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const userId = req.userId; // Asumimos que el ID del usuario está en el request (autenticado)
    const now = new Date();
    const year = now.getFullYear();
    const month = (now.getMonth() + 1).toString().padStart(2, '0'); // Mes en formato de dos dígitos

    // Crear la ruta dinámica: uploads/usuario_{id}/{año}/{mes}/
    const uploadPath = path.join('uploads', `usuario_${userId}`, year.toString(), month);

    // Asegurarse de que el directorio existe, si no, crearlo
    ensureDirectoryExistence(uploadPath);
    cb(null, uploadPath); // Asignar la carpeta de destino
  },
  filename: function (req, file, cb) {
    // Crear un nombre único para el archivo basado en la fecha y un sufijo aleatorio
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + path.extname(file.originalname)); // Usar la extensión original
  }
});

// Filtrar tipos de archivo permitidos (JPEG, PNG)
const fileFilter = (req, file, cb) => {
  const allowedTypes = /jpeg|jpg|png/;
  const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
  const mimetype = allowedTypes.test(file.mimetype);

  if (extname && mimetype) {
    cb(null, true);
  } else {
    cb(new Error('Formato de archivo no permitido. Solo se permiten archivos JPEG o PNG.'));
  }
};

// Middleware de multer para subir múltiples imágenes (hasta 5)
const upload = multer({
  storage: storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // Tamaño máximo del archivo: 5MB
  fileFilter: fileFilter
});

// Exportar el middleware de multer para su uso en las rutas
exports.uploadImages = upload.array('imagenes', 5); // Máximo 5 imágenes

// Crear una nueva solicitud de personalización con imágenes
exports.crearSolicitud = async (req, res, next) => {
    const { servicio_id, detalles } = req.body; // Cambiamos tipo_personalizacion a servicio_id
  
    // Obtener las URLs de las imágenes subidas
    const imagenes = req.files.map(file => {
      // Generar la URL relativa de las imágenes
      return `/uploads/usuario_${req.userId}/${new Date().getFullYear()}/${(new Date().getMonth() + 1).toString().padStart(2, '0')}/${file.filename}`;
    });
  
    try {
      // Llamar al modelo para crear la solicitud
      const nuevaSolicitud = await personalizacionModel.crearSolicitud(req.userId, servicio_id, detalles, imagenes);
      res.status(201).json(nuevaSolicitud);
    } catch (error) {
      next(error);
    }
  };
  

// Obtener todas las solicitudes de personalización (admin)
exports.obtenerSolicitudes = async (req, res, next) => {
  try {
    const solicitudes = await personalizacionModel.obtenerSolicitudes();
    res.json(solicitudes);
  } catch (error) {
    next(error);
  }
};

// Aceptar una solicitud de personalización (admin)
exports.aceptarSolicitud = async (req, res, next) => {
  const { id } = req.params;

  try {
    const solicitud = await personalizacionModel.actualizarEstadoSolicitud(id, 'Aceptado');
    if (!solicitud) {
      return res.status(404).json({ message: 'Solicitud no encontrada.' });
    }
    res.json({ message: 'Solicitud aceptada con éxito.', solicitud });
  } catch (error) {
    next(error);
  }
};

// Rechazar una solicitud de personalización (admin)
exports.rechazarSolicitud = async (req, res, next) => {
  const { id } = req.params;

  try {
    const solicitud = await personalizacionModel.actualizarEstadoSolicitud(id, 'Rechazado');
    if (!solicitud) {
      return res.status(404).json({ message: 'Solicitud no encontrada.' });
    }
    res.json({ message: 'Solicitud rechazada con éxito.', solicitud });
  } catch (error) {
    next(error);
  }
};
