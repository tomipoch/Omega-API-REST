const pool = require('../db');
const usuariosModel = require('../models/usuariosModel');

describe('Modelo de Usuarios', () => {
  let usuarioCreado;

  // Limpia los datos creados al finalizar
  afterAll(async () => {
    if (usuarioCreado?.usuario_id) {
      await usuariosModel.eliminarUsuarioPorId(usuarioCreado.usuario_id);
    }
    await pool.end(); // Cierra la conexión a la base de datos
  });

  test('Debe registrar un nuevo usuario', async () => {
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
    const usuario = await usuariosModel.obtenerUsuarioPorCorreo(usuarioCreado.correo_electronico);
    expect(usuario).toBeDefined();
    expect(usuario.usuario_id).toBe(usuarioCreado.usuario_id);
  });

  test('Debe actualizar un usuario', async () => {
    const actualizado = await usuariosModel.actualizarUsuario(
      usuarioCreado.usuario_id,
      'Juan Carlos',
      'Pérez',
      'López',
      usuarioCreado.correo_electronico,
      '123456789',
      'Nueva Dirección 123',
      'http://test.com/nueva_foto.jpg'
    );

    expect(actualizado.nombre).toBe('Juan Carlos');
    expect(actualizado.telefono).toBe('123456789');
  });

  test('Debe eliminar un usuario por ID', async () => {
    const eliminado = await usuariosModel.eliminarUsuarioPorId(usuarioCreado.usuario_id);
    expect(eliminado).toBeDefined();
    expect(eliminado.usuario_id).toBe(usuarioCreado.usuario_id);

    // Verificar que ya no exista
    const buscado = await usuariosModel.obtenerUsuarioPorCorreo(usuarioCreado.correo_electronico);
    expect(buscado).toBeUndefined();

    // Evitar que afterAll lo intente borrar otra vez
    usuarioCreado = null;
  });
});
