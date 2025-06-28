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