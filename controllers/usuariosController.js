const upload = require('../middleware/multerConfig');
const authService = require('../services/authService');
const usuarioService = require('../services/usuarioService');
const fileService = require('../services/fileService');
const { asyncHandler } = require('../utils/asyncHandler');
const handleMulterError = require('../utils/multerErrorHandler');
const assert = require('../utils/assert');

const conUpload = (campo) => (req, res, next) =>
  upload.single(campo)(req, res, (err) => err ? next(err) : next());

exports.registrarUsuario = [
  conUpload('foto_perfil'),
  handleMulterError,
  asyncHandler(async (req, res) => {
    const usuario = await authService.registrar(req.body);
    if (req.file) {
      const urlFoto = await fileService.moverFotoTemporal(req.file.path, usuario.usuario_id);
      await require('../models/usuariosModel').actualizarFotoPerfil(usuario.usuario_id, urlFoto);
    }
    res.status(201).json(usuario);
  })
];

exports.iniciarSesion = asyncHandler(async (req, res) => {
  res.json(await authService.login(req.body.correo_electronico, req.body.contrasena));
});

exports.solicitarRestablecimientoContrasena = asyncHandler(async (req, res) => {
  res.json(await authService.solicitarReset(req.body.correo_electronico));
});

exports.restablecerContrasena = asyncHandler(async (req, res) => {
  await authService.restablecer(
    req.body.correo_electronico,
    req.body.codigo,
    req.body.nuevaContrasena
  );
  res.status(200).json({ message: 'Contraseña restablecida con éxito.' });
});

exports.obtenerPerfil = asyncHandler(async (req, res) => {
  const usuario = await usuarioService.obtenerPorId(req.userId);
  res.json(usuarioService.sanitizar(usuario));
});

exports.actualizarPerfil = [
  conUpload('foto_perfil'),
  handleMulterError,
  asyncHandler(async (req, res) => {
    const datos = { ...req.body };
    if (req.file) {
      datos.foto_perfil_url = await fileService.moverFotoTemporal(req.file.path, req.userId);
    }
    res.json(await usuarioService.actualizar(req.userId, datos));
  })
];

exports.eliminarCuenta = asyncHandler(async (req, res) => {
  assert.authenticated(req);
  await usuarioService.eliminarCuenta(req.userId);
  res.status(204).end();
});

exports.obtenerTodosLosUsuarios = asyncHandler(async (req, res) => {
  const { nombre, rol } = req.query;
  const usuarios = await usuarioService.listar({
    nombre: nombre || '',
    rol: rol || null
  });
  res.status(200).json({ message: 'Usuarios obtenidos con éxito', data: usuarios });
});

exports.eliminarUsuario = asyncHandler(async (req, res) => {
  const userId = assert.positiveInt(req.params.id, 'ID de usuario');
  await usuarioService.eliminarPorAdmin(userId);
  res.status(204).end();
});

exports.autenticarConGoogle = asyncHandler(async (req, res) => {
  assert.notEmpty(req.googleUser, 'Datos de usuario de Google');
  const { esNuevo, resultado } = await authService.autenticarConGoogle(req.googleUser);
  res.status(esNuevo ? 201 : 200).json(resultado);
});

exports.desvincularGoogle = asyncHandler(async (req, res) => {
  await usuarioService.desvincularGoogle(req.userId);
  res.status(200).json({ message: 'Cuenta de Google desvinculada exitosamente.' });
});