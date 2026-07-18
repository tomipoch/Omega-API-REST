const usuariosModel = require('../models/usuariosModel');
const authService = require('./authService');
const auditoria = require('./auditoriaService');
const { NotFoundError, RequirePasswordError } = require('../utils/errors');

exports.obtenerPorId = async (id) => {
  const usuario = await usuariosModel.obtenerUsuarioPorId(id);
  if (!usuario) throw new NotFoundError('Usuario no encontrado.');
  return usuario;
};

exports.sanitizar = (usuario) => authService.sanitizarUsuario(usuario);

exports.listar = (filtros) => usuariosModel.obtenerTodosLosUsuarios(filtros);

exports.actualizar = async (id, datos) => {
  const actualizado = await usuariosModel.actualizarUsuario(id, datos);
  if (!actualizado) throw new NotFoundError('Usuario no encontrado.');
  return actualizado;
};

exports.eliminarCuenta = async (usuarioId) => {
  await exports.obtenerPorId(usuarioId);

  await auditoria.registrar(
    usuarioId, 'eliminación de cuenta',
    'El usuario solicitó la eliminación de su cuenta.'
  );
  await usuariosModel.eliminarRegistrosRelacionados(usuarioId);
  const eliminado = await usuariosModel.eliminarUsuarioPorId(usuarioId);

  if (!eliminado) throw new Error('No se pudo eliminar la cuenta.');
  return eliminado;
};

exports.eliminarPorAdmin = async (usuarioId) => {
  await usuariosModel.eliminarRegistrosRelacionados(usuarioId);
  const eliminado = await usuariosModel.eliminarUsuarioPorId(usuarioId);
  if (!eliminado) throw new NotFoundError('Usuario no encontrado.');
};

exports.desvincularGoogle = async (usuarioId) => {
  const usuario = await exports.obtenerPorId(usuarioId);
  if (!usuario.google_id) {
    throw new NotFoundError('La cuenta no está vinculada con Google.');
  }
  if (!usuario.contrasena) {
    throw new RequirePasswordError();
  }
  await usuariosModel.vincularGoogleId(usuarioId, null);
  await auditoria.registrar(usuarioId, 'desvinculación de Google', 'Desvinculó Google.');
};