const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const usuariosModel = require('../models/usuariosModel');
const transporter = require('../middleware/transporter');
const auditoria = require('./auditoriaService');
const { UnauthorizedError, NotFoundError, ConflictError, ValidationError } = require('../utils/errors');

const BASE_URL = process.env.BASE_URL || `http://localhost:${process.env.PORT || 4000}`;
const MINUTOS_EXPIRACION_RESET = 15;
const EXPIRACION_RESET_MS = MINUTOS_EXPIRACION_RESET * 60 * 1000;

const generarToken = (usuario) => jwt.sign(
  { userId: usuario.usuario_id, rol: usuario.rol_id },
  process.env.JWT_SECRET,
  { expiresIn: process.env.JWT_EXPIRES_IN || '1h' }
);

const sanitizarUsuario = (usuario) => ({
  usuario_id: usuario.usuario_id,
  nombre: usuario.nombre,
  apellido_paterno: usuario.apellido_paterno,
  apellido_materno: usuario.apellido_materno,
  correo_electronico: usuario.correo_electronico,
  rol_id: usuario.rol_id,
  foto_perfil_url: usuario.foto_perfil_url ? `${BASE_URL}${usuario.foto_perfil_url}` : null
});

const generarCodigo6Digitos = () => Math.floor(100000 + Math.random() * 900000).toString();

const construirRespuestaGoogle = async (usuario, googleUser) => {
  await usuariosModel.actualizarUltimoInicioSesion(usuario.usuario_id).catch(() => null);
  return {
    token: generarToken(usuario),
    nombre: usuario.nombre,
    apellido_paterno: usuario.apellido_paterno,
    apellido_materno: usuario.apellido_materno,
    foto_perfil_url: usuario.foto_perfil_url || googleUser.picture || null,
    email: googleUser.email,
    rol_id: usuario.rol_id,
    loginMethod: 'google'
  };
};

const actualizarFotoSiVacia = async (usuarioId, fotoActual, fotoGoogle) => {
  if (!fotoActual && fotoGoogle) {
    await usuariosModel.actualizarFotoPerfilGoogle(usuarioId, fotoGoogle);
    return fotoGoogle;
  }
  return fotoActual;
};

const parsearNombreGoogle = (googleUser) => {
  const partes = (googleUser.name || '').split(' ');
  return {
    nombre: googleUser.given_name || partes[0] || '',
    apellido_paterno: googleUser.family_name || partes[1] || '',
    apellido_materno: partes[2] || ''
  };
};

const loginExistenteConGoogle = async (usuario, googleUser) => {
  usuario.foto_perfil_url = await actualizarFotoSiVacia(
    usuario.usuario_id, usuario.foto_perfil_url, googleUser.picture
  );
  await auditoria.registrar(usuario.usuario_id, 'inicio de sesión con Google', 'Login con Google.');
  return construirRespuestaGoogle(usuario, googleUser);
};

const vincularYLogin = async (usuarioExistente, googleUser) => {
  const usuario = await usuariosModel.vincularGoogleId(usuarioExistente.usuario_id, googleUser.googleId);
  usuario.foto_perfil_url = await actualizarFotoSiVacia(
    usuario.usuario_id, usuarioExistente.foto_perfil_url, googleUser.picture
  );
  await auditoria.registrar(usuario.usuario_id, 'vinculación de cuenta Google', 'Vinculó Google.');
  return construirRespuestaGoogle(usuario, googleUser);
};

const registrarYLoginConGoogle = async (googleUser) => {
  const datos = parsearNombreGoogle(googleUser);
  const nuevo = await usuariosModel.registrarUsuarioGoogle(
    datos.nombre, datos.apellido_paterno, datos.apellido_materno,
    googleUser.email, googleUser.googleId, googleUser.picture
  );
  await auditoria.registrar(nuevo.usuario_id, 'registro con Google', 'Registro con Google.');
  return construirRespuestaGoogle(nuevo, googleUser);
};

exports.autenticarConGoogle = async (googleUser) => {
  const porGoogle = await usuariosModel.obtenerUsuarioPorGoogleId(googleUser.googleId);
  if (porGoogle) {
    return { esNuevo: false, resultado: await loginExistenteConGoogle(porGoogle, googleUser) };
  }

  const porCorreo = await usuariosModel.obtenerUsuarioPorCorreo(googleUser.email);
  if (porCorreo) {
    return { esNuevo: false, resultado: await vincularYLogin(porCorreo, googleUser) };
  }

  return { esNuevo: true, resultado: await registrarYLoginConGoogle(googleUser) };
};

exports.registrar = async ({ nombre, apellido_paterno, apellido_materno, correo_electronico, contrasena }) => {
  const existente = await usuariosModel.obtenerUsuarioPorCorreo(correo_electronico);
  if (existente) throw new ConflictError('El correo electrónico ya está registrado.');

  const hashed = await bcrypt.hash(contrasena, 10);
  const nuevo = await usuariosModel.registrarUsuario(
    nombre, apellido_paterno, apellido_materno,
    correo_electronico, hashed, 1, null
  );
  await auditoria.registrar(
    nuevo.usuario_id, 'registro',
    `El usuario ${nombre} ${apellido_paterno} se ha registrado con éxito.`
  );
  return nuevo;
};

exports.login = async (correo, contrasena) => {
  const usuario = await usuariosModel.obtenerUsuarioPorCorreo(correo);
  if (!usuario) throw new UnauthorizedError('Credenciales inválidas.');

  const valida = await bcrypt.compare(contrasena, usuario.contrasena);
  if (!valida) throw new UnauthorizedError('Credenciales inválidas.');

  await usuariosModel.actualizarUltimoInicioSesion(usuario.usuario_id).catch(() => null);

  return { token: generarToken(usuario), ...sanitizarUsuario(usuario) };
};

exports.solicitarReset = async (correo) => {
  const usuario = await usuariosModel.obtenerUsuarioPorCorreo(correo);
  if (!usuario) throw new NotFoundError('Usuario no encontrado.');

  const codigo = generarCodigo6Digitos();
  const expiracion = new Date(Date.now() + EXPIRACION_RESET_MS);

  await usuariosModel.guardarCodigoRestablecimiento(usuario.usuario_id, codigo, expiracion);
  await transporter.sendMail({
    from: process.env.EMAIL_USER,
    to: correo,
    subject: 'Restablecimiento de Contraseña',
    text: `Tu código de restablecimiento de contraseña es: ${codigo}. Tienes ${MINUTOS_EXPIRACION_RESET} minutos para usarlo.`
  });

  await auditoria.registrar(
    usuario.usuario_id, 'solicitud restablecimiento',
    `Se envió un código de restablecimiento a ${correo}.`
  );

  return { message: 'El código de restablecimiento ha sido enviado a tu correo.' };
};

exports.restablecer = async (correo, codigo, nuevaContrasena) => {
  const usuario = await usuariosModel.obtenerUsuarioPorCorreo(correo);
  if (!usuario) throw new NotFoundError('Usuario no encontrado.');

  const registro = await usuariosModel.verificarCodigoRestablecimiento(usuario.usuario_id, codigo);
  if (!registro) throw new ValidationError('Código inválido o ha expirado.');
  if (registro.usado) throw new ConflictError('El código ya ha sido usado.');

  const hashed = await bcrypt.hash(nuevaContrasena, 10);
  await usuariosModel.actualizarContrasena(usuario.usuario_id, hashed);
  await usuariosModel.marcarCodigoComoUsado(registro.restablecimiento_id);

  await auditoria.registrar(
    usuario.usuario_id, 'restablecimiento contraseña',
    'El usuario restableció su contraseña con éxito.'
  );
};

exports.sanitizarUsuario = sanitizarUsuario;