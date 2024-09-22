const express = require('express');
const router = express.Router();
const usuariosController = require('../controllers/usuariosController');
const auth = require('../middleware/auth'); // Middleware de autenticación

// Registro e inicio de sesión
router.post('/register', usuariosController.registrarUsuario);
router.post('/login', usuariosController.iniciarSesion);

// Perfil de usuario autenticado
router.get('/perfil', auth, usuariosController.obtenerPerfil);
router.put('/perfil', auth, usuariosController.actualizarPerfil);
router.delete('/perfil', auth, usuariosController.eliminarCuenta);

//Restablecimiento de contraseña
router.post('/restablecer-solicitud', usuariosController.solicitarRestablecimientoContrasena); // Ruta para solicitar el restablecimiento de contraseña
router.post('/restablecer', usuariosController.restablecerContrasena);// Ruta para restablecer la contraseña usando el código

module.exports = router;
