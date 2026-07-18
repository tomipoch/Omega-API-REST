const express = require('express');
const router = express.Router();
const personalizacionController = require('../controllers/personalizacionController');
const auth = require('../middleware/authMiddleware');
const verificarRolAdmin = require('../middleware/verificarRolAdmin');
const multer = require('multer');
const fs = require('fs');
const path = require('path');
const { idParam } = require('../middleware/validators/commonValidator');
const { handleValidation } = require('../middleware/validators/authValidator');
const handleMulterError = require('../utils/multerErrorHandler');

const uploadDir = 'uploads/';

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueName = `${Date.now()}-${Math.round(Math.random() * 1e9)}${path.extname(file.originalname)}`;
    cb(null, uniqueName);
  }
});
const upload = multer({ storage });

router.post('/', auth, upload.array('imagenes'), handleMulterError, personalizacionController.crearSolicitud);
router.get('/', auth, verificarRolAdmin, personalizacionController.obtenerSolicitudes);
router.put('/:id/aceptar', auth, verificarRolAdmin, idParam(), handleValidation, (req, res, next) => {
  req.body.nuevo_estado = 'aceptar';
  personalizacionController.actualizarEstadoSolicitud(req, res, next);
});
router.put('/:id/rechazar', auth, verificarRolAdmin, idParam(), handleValidation, (req, res, next) => {
  req.body.nuevo_estado = 'rechazar';
  personalizacionController.actualizarEstadoSolicitud(req, res, next);
});

module.exports = router;
