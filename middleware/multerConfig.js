const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Configuración del almacenamiento (sin usar el usuario_id aquí)
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const tempFolderPath = 'uploads/temp/';
    
    // Crear la carpeta si no existe
    if (!fs.existsSync(tempFolderPath)) {
      fs.mkdirSync(tempFolderPath, { recursive: true });
    }

    cb(null, tempFolderPath); // Guardar la imagen en la carpeta temporal
  },
  filename: (req, file, cb) => {
    cb(null, 'foto_perfil.png'); // Guardar siempre como foto_perfil.png para evitar duplicados
  }
});

const fileFilter = (req, file, cb) => {
  const allowedTypes = /jpeg|jpg|png|gif/;
  const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
  const mimetype = allowedTypes.test(file.mimetype);

  if (mimetype && extname) {
    return cb(null, true);
  } else {
    cb(new Error('Solo se permiten imágenes en formato jpeg, jpg, png o gif.'));
  }
};

const upload = multer({
  storage,
  limits: { fileSize: 1024 * 1024 * 5 }, // Límite de tamaño de 5 MB
  fileFilter
});

module.exports = upload;
