const express = require('express');
const router = express.Router();
const usuariosController = require('../controllers/usuariosController');
const auth = require('../middleware/auth'); // Middleware de autenticación
const verificarRolAdmin = require('../middleware/verificarRolAdmin'); // Middleware de autenticación
const upload = require('../middleware/multerConfig'); // Importar multer

// Registro e inicio de sesión
router.post('/register', usuariosController.registrarUsuario);
router.post('/login', (req, res, next) => {
  console.log('LOGIN ROUTE HIT:', req.body);
  usuariosController.iniciarSesion(req, res, next);
});

// Perfil de usuario autenticado
router.get('/perfil', auth, usuariosController.obtenerPerfil);
router.put('/perfil', auth, usuariosController.actualizarPerfil);
router.delete('/perfil', auth, usuariosController.eliminarCuenta);

//Restablecimiento de contraseña
router.post('/restablecer-solicitud', usuariosController.solicitarRestablecimientoContrasena); // Ruta para solicitar el restablecimiento de contraseña
router.post('/restablecer', usuariosController.restablecerContrasena);// Ruta para restablecer la contraseña usando el código

// Obtener todos los usuarios con filtros
router.get('/all', auth, verificarRolAdmin, usuariosController.obtenerTodosLosUsuarios);
router.delete('/:id', auth, verificarRolAdmin, usuariosController.eliminarUsuario);
router.put('/:id/role', auth, verificarRolAdmin, usuariosController.actualizarRolUsuario);
router.put('/:id', auth, verificarRolAdmin, usuariosController.actualizarUsuarioAdmin);

module.exports = router;