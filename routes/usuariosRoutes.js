const express = require('express');
const router = express.Router();
const usuariosController = require('../controllers/usuariosController');
const auth = require('../middleware/authMiddleware'); // Middleware de autenticación
const verificarRolAdmin = require('../middleware/verificarRolAdmin'); // Middleware de autenticación
const upload = require('../middleware/multerConfig'); // Importar multer
const { googleAuthMiddleware } = require('../middleware/googleAuth'); // Middleware de Google Auth

// Registro e inicio de sesión
router.post('/register', usuariosController.registrarUsuario);
router.post('/login', usuariosController.iniciarSesion);

// Autenticación con Google OAuth
router.post('/auth/google', googleAuthMiddleware, usuariosController.autenticarConGoogle);
router.delete('/auth/google/unlink', auth, usuariosController.desvincularGoogle);

// Endpoint de prueba para Google OAuth (sin validación real)
router.post('/auth/google/test', (req, res) => {
  console.log('🧪 [Test] Endpoint de prueba de Google OAuth');
  console.log('   - Body recibido:', req.body);
  
  const { googleToken } = req.body;
  
  if (!googleToken) {
    return res.status(400).json({
      message: 'Token de Google requerido para la prueba',
      error: 'GOOGLE_TOKEN_MISSING',
      endpoint: '/usuarios/auth/google/test',
      status: 'FUNCIONANDO'
    });
  }
  
  res.json({
    message: '¡Endpoint de Google OAuth funcionando correctamente!',
    status: 'SUCCESS',
    received_token_length: googleToken.length,
    endpoint: '/usuarios/auth/google/test',
    next_step: 'Usar token real de Google en /usuarios/auth/google',
    timestamp: new Date().toISOString()
  });
});

// Perfil de usuario autenticado
router.get('/perfil', auth, usuariosController.obtenerPerfil);
router.put('/perfil', auth, usuariosController.actualizarPerfil);
router.delete('/perfil', auth, usuariosController.eliminarCuenta);

//Restablecimiento de contraseña
router.post('/restablecer-solicitud', usuariosController.solicitarRestablecimientoContrasena); // Ruta para solicitar el restablecimiento de contraseña
router.post('/restablecer', usuariosController.restablecerContrasena);// Ruta para restablecer la contraseña usando el código

// Rutas administrativas (deben ir después de las rutas específicas)
router.get('/all', auth, verificarRolAdmin, usuariosController.obtenerTodosLosUsuarios);
router.delete('/admin/:id', auth, verificarRolAdmin, usuariosController.eliminarUsuario);

module.exports = router;