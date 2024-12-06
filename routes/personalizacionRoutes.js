const express = require('express');
const router = express.Router();
const personalizacionController = require('../controllers/personalizacionController');
const auth = require('../middleware/auth'); // Middleware de autenticación con x-auth-token
const verificarRolAdmin = require('../middleware/verificarRolAdmin'); // Middleware para verificar el rol de admin
const multer = require('multer'); // Middleware para manejar archivos

// Configurar multer para subir imágenes
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/'); // Carpeta donde se guardarán las imágenes
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + '-' + file.originalname); // Nombre único para cada archivo
  }
});
const upload = multer({ storage });

// Ruta para crear una nueva solicitud de personalización con imágenes
router.post('/', auth, upload.array('imagenes'), personalizacionController.crearSolicitud);

// Rutas para admin (ver todas las solicitudes y cambiar el estado)
router.get('/', auth, verificarRolAdmin, personalizacionController.obtenerSolicitudes);
router.put('/:id/aceptar', auth, verificarRolAdmin, (req, res, next) => {
  req.body.nuevo_estado = 'aceptar'; // Pasamos el estado "aceptar" al controlador
  personalizacionController.actualizarEstadoSolicitud(req, res, next);
});
router.put('/:id/rechazar', auth, verificarRolAdmin, (req, res, next) => {
  req.body.nuevo_estado = 'rechazar'; // Pasamos el estado "rechazar" al controlador
  personalizacionController.actualizarEstadoSolicitud(req, res, next);
});

module.exports = router;
