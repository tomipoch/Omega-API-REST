const pool = require('../database/pgPool');
const usuariosModel = require('../models/usuariosModel');

describe('Modelo de Usuarios', () => {
  let usuarioCreado;
  let dbUp = false;

  beforeAll(async () => {
    dbUp = await global.checkDb();
    if (!dbUp) return;
    await pool.query('BEGIN');
  });

  afterAll(async () => {
    if (!dbUp) return;
    if (usuarioCreado?.usuario_id) {
      try {
        await usuariosModel.eliminarUsuarioPorId(usuarioCreado.usuario_id);
      } catch (_err) {
        // best-effort cleanup
      }
    }
    await pool.query('ROLLBACK');
    await pool.end();
  });

  test('Debe registrar un nuevo usuario', async () => {
    if (!dbUp) return;
    const datosUsuario = {
      nombre: 'Juan',
      apellido_paterno: 'Pérez',
      apellido_materno: 'López',
      correo_electronico: `juanprueba${Date.now()}@test.com`,
      contrasena: 'secreta123',
      rol_id: 1,
      foto_perfil_url: 'http://test.com/foto.jpg'
    };

    usuarioCreado = await usuariosModel.registrarUsuario(
      datosUsuario.nombre,
      datosUsuario.apellido_paterno,
      datosUsuario.apellido_materno,
      datosUsuario.correo_electronico,
      datosUsuario.contrasena,
      datosUsuario.rol_id,
      datosUsuario.foto_perfil_url
    );

    expect(usuarioCreado).toHaveProperty('usuario_id');
    expect(usuarioCreado.correo_electronico).toBe(datosUsuario.correo_electronico);
  });

  test('Debe obtener un usuario por correo electrónico', async () => {
    if (!dbUp) return;
    const usuario = await usuariosModel.obtenerUsuarioPorCorreo(usuarioCreado.correo_electronico);
    expect(usuario).toBeDefined();
    expect(usuario.usuario_id).toBe(usuarioCreado.usuario_id);
  });

  test('Debe actualizar un usuario', async () => {
    if (!dbUp) return;
    const actualizado = await usuariosModel.actualizarUsuario(usuarioCreado.usuario_id, {
      nombre: 'Juan Carlos',
      apellido_paterno: 'Pérez',
      apellido_materno: 'López',
      correo_electronico: usuarioCreado.correo_electronico,
      telefono: '123456789',
      direccion: 'Nueva Dirección 123',
      foto_perfil_url: 'http://test.com/nueva_foto.jpg'
    });

    expect(actualizado.nombre).toBe('Juan Carlos');
    expect(actualizado.telefono).toBe('123456789');
  });

  test('Debe eliminar un usuario por ID', async () => {
    if (!dbUp) return;
    const eliminado = await usuariosModel.eliminarUsuarioPorId(usuarioCreado.usuario_id);
    expect(eliminado).toBeDefined();
    expect(eliminado.usuario_id).toBe(usuarioCreado.usuario_id);

    const buscado = await usuariosModel.obtenerUsuarioPorCorreo(usuarioCreado.correo_electronico);
    expect(buscado).toBeUndefined();
    usuarioCreado = null;
  });
});
