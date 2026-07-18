const express = require('express');
const router = express.Router();
const usuariosController = require('../controllers/usuariosController');
const auth = require('../middleware/authMiddleware');
const verificarRolAdmin = require('../middleware/verificarRolAdmin');
const { googleAuthMiddleware } = require('../middleware/googleAuth');
const {
  registroRules,
  loginRules,
  restablecerSolicitudRules,
  restablecerRules,
  googleAuthRules,
  actualizarPerfilRules,
  handleValidation
} = require('../middleware/validators/authValidator');
const { idParam } = require('../middleware/validators/commonValidator');

router.post('/register', registroRules, handleValidation, usuariosController.registrarUsuario);
router.post('/login', loginRules, handleValidation, usuariosController.iniciarSesion);

router.post('/auth/google', googleAuthRules, handleValidation, googleAuthMiddleware, usuariosController.autenticarConGoogle);
router.delete('/auth/google/unlink', auth, usuariosController.desvincularGoogle);

if (process.env.NODE_ENV !== 'production') {
  router.post('/auth/google/test', (req, res) => {
    const { googleToken } = req.body;

    if (!googleToken) {
      return res.status(400).json({
        message: 'Token de Google requerido para la prueba',
        error: 'GOOGLE_TOKEN_MISSING',
        endpoint: '/usuarios/auth/google/test',
        status: 'FUNCIONANDO'
      });
    }

    return res.json({
      message: '¡Endpoint de Google OAuth funcionando correctamente!',
      status: 'SUCCESS',
      received_token_length: googleToken.length,
      endpoint: '/usuarios/auth/google/test',
      next_step: 'Usar token real de Google en /usuarios/auth/google',
      timestamp: new Date().toISOString()
    });
  });
}

router.get('/perfil', auth, usuariosController.obtenerPerfil);
router.put('/perfil', auth, actualizarPerfilRules, handleValidation, usuariosController.actualizarPerfil);
router.delete('/perfil', auth, usuariosController.eliminarCuenta);

router.post('/restablecer-solicitud', restablecerSolicitudRules, handleValidation, usuariosController.solicitarRestablecimientoContrasena);
router.post('/restablecer', restablecerRules, handleValidation, usuariosController.restablecerContrasena);

router.get('/all', auth, verificarRolAdmin, usuariosController.obtenerTodosLosUsuarios);
router.delete(
  '/admin/:id',
  auth,
  verificarRolAdmin,
  idParam(),
  handleValidation,
  usuariosController.eliminarUsuario
);

module.exports = router;
