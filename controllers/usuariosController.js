const usuariosModel = require('../models/usuariosModel'); // Importar modelo
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const nodemailer = require('nodemailer');
const auditoriaController = require('../controllers/auditoriaController');
const upload = require('../middleware/multerConfig');
const transporter = require('../middleware/transporter');
const fs = require('fs');
const path = require('path');

// Registrar un nuevo usuario con imagen
exports.registrarUsuario = async (req, res, next) => {
  upload.single('foto_perfil')(req, res, async function (err) {
    if (err) {
      console.error('Error al cargar la imagen:', err.message);
      return res.status(400).json({ message: 'Error al cargar la imagen.' });
    }

    const { nombre, apellido_paterno, apellido_materno, correo_electronico, contrasena } = req.body;

    try {
      // Verificar si ya existe un usuario con el mismo correo electrónico
      const usuarioExistente = await usuariosModel.obtenerUsuarioPorCorreo(correo_electronico);
      if (usuarioExistente) {
        return res.status(400).json({ message: 'El correo electrónico ya está registrado.' });
      }

      console.log('Datos recibidos:', req.body);

      if (!nombre || !apellido_paterno || !apellido_materno || !correo_electronico || !contrasena) {
        console.error('Faltan datos obligatorios.');
        return res.status(400).json({ message: 'Por favor, proporciona todos los datos.' });
      }

      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(contrasena, salt);

      // Registrar el usuario en la base de datos
      const nuevoUsuario = await usuariosModel.registrarUsuario(
        nombre, apellido_paterno, apellido_materno, correo_electronico, hashedPassword, 1, null
      );

      console.log('Usuario registrado correctamente:', nuevoUsuario);

      // Si se subió una imagen, mover la imagen a la carpeta del usuario
      if (req.file) {
        const userFolderPath = `uploads/usuario-${nuevoUsuario.usuario_id}/perfil/`;

        // Crear la carpeta si no existe
        if (!fs.existsSync(userFolderPath)) {
          fs.mkdirSync(userFolderPath, { recursive: true });
        }

        // Mover la imagen desde la carpeta temporal
        const foto_perfil_url = path.join(userFolderPath, 'foto_perfil.png');
        fs.renameSync(req.file.path, foto_perfil_url);

        console.log('Imagen guardada en:', foto_perfil_url);

        // Actualizar el campo de la imagen en la base de datos
        await usuariosModel.actualizarFotoPerfil(nuevoUsuario.usuario_id, `/uploads/usuario-${nuevoUsuario.usuario_id}/perfil/foto_perfil.png`);
      }

      await auditoriaController.registrarEvento(nuevoUsuario.usuario_id, 'registro', `El usuario ${nombre} ${apellido_paterno} se ha registrado con éxito.`);

      res.status(201).json(nuevoUsuario);
    } catch (error) {
      console.error('Error al registrar el usuario:', error);
      next(error);
    }
  });
};

// Iniciar sesión
exports.iniciarSesion = async (req, res, next) => {
  const { correo_electronico, contrasena } = req.body;

  try {
    const usuario = await usuariosModel.obtenerUsuarioPorCorreo(correo_electronico);

    // Log para depuración
    console.log('Usuario obtenido de la base de datos:', usuario);

    if (!usuario) {
      return res.status(400).json({ message: 'Usuario no encontrado.' });
    }

    const esValido = await bcrypt.compare(contrasena, usuario.contrasena);
    if (!esValido) {
      return res.status(400).json({ message: 'Contraseña incorrecta.' });
    }

    const token = jwt.sign({ userId: usuario.usuario_id, rol: usuario.rol_id }, process.env.JWT_SECRET, { expiresIn: '1h' });

    const baseUrl = `http://localhost:4000`;
    const foto_perfil_url_completa = usuario.foto_perfil_url
      ? `${baseUrl}${usuario.foto_perfil_url}`
      : null;

    // Enviar el token, nombre, foto y rol
    res.json({
      token,
      nombre: usuario.nombre,
      apellido_paterno: usuario.apellido_paterno,
      apellido_materno: usuario.apellido_materno,
      foto_perfil_url: foto_perfil_url_completa,
      rol_id: usuario.rol_id, // Incluir el rol en la respuesta
    });
  } catch (error) {
    console.error('Error en iniciarSesion:', error);
    next(error);
  }
};

// Obtener perfil del usuario autenticado
exports.obtenerPerfil = async (req, res, next) => {
  try {
    const usuario = await usuariosModel.obtenerUsuarioPorId(req.userId);

    if (!usuario) {
      return res.status(404).json({ message: 'Usuario no encontrado.' });
    }

    // Asegúrate de devolver la URL completa de la imagen
    const baseUrl = `http://localhost:4000`; // Este debe ser el dominio de tu API
    const perfilConImagenCompleta = {
      ...usuario,
      foto_perfil_url: usuario.foto_perfil_url ? `${baseUrl}${usuario.foto_perfil_url}` : null
    };

    res.json(perfilConImagenCompleta);
  } catch (error) {
    console.error('Error al obtener el perfil:', error);
    next(error);
  }
};

// Actualizar perfil de usuario con imagen
exports.actualizarPerfil = async (req, res, next) => {
  upload.single('foto_perfil')(req, res, async function (err) {
    if (err) {
      console.error('Error al cargar la imagen:', err.message);
      return res.status(400).json({ message: 'Error al cargar la imagen.', error: err.message });
    }

    const { nombre, apellido_paterno, apellido_materno, correo_electronico, telefono, direccion } = req.body;
    
    // Comprobar si se subió una nueva imagen
    let foto_perfil_url = req.body.foto_perfil_url;

    if (req.file) {
      // Si hay una nueva imagen, moverla a la carpeta del usuario
      const userFolderPath = `uploads/usuario-${req.userId}/perfil/`;

      // Crear la carpeta si no existe
      if (!fs.existsSync(userFolderPath)) {
        fs.mkdirSync(userFolderPath, { recursive: true });
      }

      // Mover la imagen y definir la nueva ruta de la imagen
      foto_perfil_url = path.join(userFolderPath, 'foto_perfil.png');
      fs.renameSync(req.file.path, foto_perfil_url);
      
      console.log('Imagen de perfil actualizada en:', foto_perfil_url);

      // Actualizar el URL de la imagen para que se guarde en la base de datos
      foto_perfil_url = `/uploads/usuario-${req.userId}/perfil/foto_perfil.png`;
    }

    if (!nombre || !apellido_paterno || !apellido_materno || !correo_electronico) {
      return res.status(400).json({ message: 'Todos los campos son obligatorios.' });
    }

    try {
      // Actualizar el perfil del usuario
      const usuarioActualizado = await usuariosModel.actualizarUsuario(
        req.userId, nombre, apellido_paterno, apellido_materno, correo_electronico, telefono, direccion, foto_perfil_url
      );

      if (!usuarioActualizado) {
        return res.status(404).json({ message: 'Usuario no encontrado.' });
      }

      res.json(usuarioActualizado);
    } catch (error) {
      console.error('Error al actualizar el perfil:', error);
      next(error);
    }
  });
};

// Eliminar cuenta del usuario autenticado
exports.eliminarCuenta = async (req, res, next) => {
  try {
    console.log('Iniciando eliminación de cuenta para usuario ID:', req.userId);
    
    // Validar que el userId existe y es válido
    if (!req.userId) {
      console.error('Error: No se encontró userId en la request');
      return res.status(400).json({ message: 'Usuario no autenticado correctamente.' });
    }

    // Verificar que el usuario existe antes de intentar eliminarlo
    const usuarioExistente = await usuariosModel.obtenerUsuarioPorId(req.userId);
    if (!usuarioExistente) {
      console.error('Error: Usuario no encontrado con ID:', req.userId);
      return res.status(404).json({ message: 'Usuario no encontrado.' });
    }

    console.log('Usuario encontrado:', usuarioExistente.correo_electronico);

    // Registrar el evento de auditoría antes de eliminar
    try {
      await auditoriaController.registrarEvento(req.userId, 'eliminación de cuenta', 'El usuario solicitó la eliminación de su cuenta.');
    } catch (auditoriaError) {
      console.error('Error en auditoría (no crítico):', auditoriaError.message);
      // Continuar con la eliminación aunque falle la auditoría
    }

    // Eliminar registros relacionados antes de eliminar el usuario
    console.log('Eliminando registros relacionados...');
    await usuariosModel.eliminarRegistrosRelacionados(req.userId);

    // Intentar eliminar el usuario
    const resultado = await usuariosModel.eliminarUsuario(req.userId);
    
    if (!resultado) {
      console.error('Error: No se pudo eliminar el usuario con ID:', req.userId);
      return res.status(500).json({ message: 'Error interno: No se pudo eliminar la cuenta.' });
    }

    console.log('Usuario eliminado exitosamente:', resultado.correo_electronico);
    res.json({ 
      message: 'Cuenta eliminada con éxito.',
      usuario_eliminado: {
        id: resultado.usuario_id,
        correo: resultado.correo_electronico
      }
    });
  } catch (error) {
    console.error('Error al eliminar cuenta:', error);
    
    // Manejar errores específicos de la base de datos
    if (error.code === '23503') {
      return res.status(409).json({ 
        message: 'No se puede eliminar la cuenta porque tiene datos relacionados. Por favor, contacte al administrador.',
        error_code: 'FOREIGN_KEY_VIOLATION'
      });
    }
    
    if (error.code === '23505') {
      return res.status(409).json({ 
        message: 'Error de integridad en la base de datos.',
        error_code: 'UNIQUE_VIOLATION'
      });
    }

    // Error genérico
    res.status(500).json({ 
      message: 'Error interno del servidor al eliminar la cuenta.',
      error_details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// Solicitar restablecimiento de contraseña
exports.solicitarRestablecimientoContrasena = async (req, res, next) => {
  const { correo_electronico } = req.body;

  try {
    // Verificar si el usuario existe
    const usuario = await usuariosModel.obtenerUsuarioPorCorreo(correo_electronico);
    if (!usuario) {
      return res.status(404).json({ message: 'Usuario no encontrado.' });
    }

    // Generar el código de restablecimiento
    const codigo = generarCodigoRestablecimiento();

    // Establecer una fecha de expiración (15 minutos)
    const fechaExpiracion = new Date(Date.now() + 15 * 60 * 1000);

    // Guardar el código y la fecha de expiración en la base de datos
    await usuariosModel.guardarCodigoRestablecimiento(usuario.usuario_id, codigo, fechaExpiracion);

    // Configurar el correo
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: correo_electronico,
      subject: 'Restablecimiento de Contraseña',
      text: `Tu código de restablecimiento de contraseña es: ${codigo}. Tienes 15 minutos para usarlo.`,
    };

    // Enviar el correo
    await transporter.sendMail(mailOptions);

    // Registrar el evento en auditoría
    await auditoriaController.registrarEvento(
      usuario.usuario_id,
      'solicitud restablecimiento',
      `Se envió un código de restablecimiento a ${correo_electronico}.`
    );

    res.json({ message: 'El código de restablecimiento ha sido enviado a tu correo.' });
  } catch (error) {
    console.error('Error al solicitar restablecimiento de contraseña:', error);
    res.status(500).json({ message: 'Error interno del servidor.', error: error.message });
  }
};

// Función para generar un código aleatorio de 6 dígitos
const generarCodigoRestablecimiento = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

// Verificar el código y restablecer la contraseña
exports.restablecerContrasena = async (req, res, next) => {
  const { correo_electronico, codigo, nuevaContrasena } = req.body;

  try {
    const usuario = await usuariosModel.obtenerUsuarioPorCorreo(correo_electronico);
    if (!usuario) {
      return res.status(404).json({ message: 'Usuario no encontrado.' });
    }

    const codigoRestablecimiento = await usuariosModel.verificarCodigoRestablecimiento(usuario.usuario_id, codigo);

    if (!codigoRestablecimiento) {
      return res.status(400).json({ message: 'Código inválido o ha expirado.' });
    }

    if (codigoRestablecimiento.usado) {
      return res.status(400).json({ message: 'El código ya ha sido usado.' });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(nuevaContrasena, salt);

    await usuariosModel.actualizarContrasena(usuario.usuario_id, hashedPassword);
    await usuariosModel.marcarCodigoComoUsado(codigoRestablecimiento.restablecimiento_id);

    await auditoriaController.registrarEvento(usuario.usuario_id, 'restablecimiento contraseña', 'El usuario restableció su contraseña con éxito.');

    res.json({ message: 'Contraseña restablecida con éxito.' });
  } catch (error) {
    next(error);
  }
};

exports.obtenerTodosLosUsuarios = async (req, res) => {
  try {
    console.log("Usuario autenticado:", { userId: req.userId, userRol: req.userRol }); // Log
    const { nombre, rol } = req.query;

    const usuarios = await usuariosModel.obtenerTodosLosUsuarios({
      nombre: nombre || "",
      rol: rol || null,
    });

    res.status(200).json({
      message: "Usuarios obtenidos con éxito",
      data: usuarios,
    });
  } catch (error) {
    console.error("Error al obtener usuarios:", error);
    res.status(500).json({ message: "Error interno del servidor." });
  }
};

// Eliminar un usuario por ID
exports.eliminarUsuario = async (req, res) => {
  const { id } = req.params;

  try {
    // Validar que el ID sea un número válido
    const userId = parseInt(id);
    if (isNaN(userId) || userId <= 0) {
      console.error('ID de usuario inválido:', id);
      return res.status(400).json({ message: 'ID de usuario inválido.' });
    }

    console.log('Eliminando usuario con ID:', userId);
    
    // Eliminar registros relacionados primero
    await usuariosModel.eliminarRegistrosRelacionados(userId);
    console.log('Registros relacionados eliminados para usuario ID:', userId);
    
    const usuarioEliminado = await usuariosModel.eliminarUsuarioPorId(userId);

    if (!usuarioEliminado) {
      return res.status(404).json({ message: 'Usuario no encontrado.' });
    }

    console.log('Usuario eliminado exitosamente:', usuarioEliminado.correo_electronico);
    res.json({ message: 'Usuario eliminado con éxito.' });
  } catch (error) {
    console.error('Error al eliminar usuario:', error); // Log del error
    
    // Manejar errores específicos de la base de datos
    if (error.code === '23503') {
      return res.status(409).json({ 
        message: 'No se puede eliminar el usuario porque tiene datos relacionados.',
        error_code: 'FOREIGN_KEY_VIOLATION'
      });
    }
    
    res.status(500).json({ message: 'Error al eliminar usuario.' });
  }
};

// Autenticación con Google OAuth
exports.autenticarConGoogle = async (req, res, next) => {
  try {
    const { googleUser } = req; // Datos del usuario verificados por el middleware
    
    // Buscar si ya existe un usuario con este Google ID
    let usuario = await usuariosModel.obtenerUsuarioPorGoogleId(googleUser.googleId);
    
    if (usuario) {
      // Usuario ya existe con Google ID, iniciar sesión
      const token = jwt.sign({ userId: usuario.usuario_id, rol: usuario.rol_id }, process.env.JWT_SECRET, { expiresIn: '1h' });
      
      const baseUrl = `http://localhost:4000`;
      const foto_perfil_url_completa = usuario.foto_perfil_url
        ? `${baseUrl}${usuario.foto_perfil_url}`
        : googleUser.picture || null;
      
      await auditoriaController.registrarEvento(usuario.usuario_id, 'inicio de sesión con Google', 'El usuario inició sesión con Google OAuth.');
      
      return res.json({
        token,
        nombre: usuario.nombre,
        apellido_paterno: usuario.apellido_paterno,
        apellido_materno: usuario.apellido_materno,
        foto_perfil_url: foto_perfil_url_completa,
        rol_id: usuario.rol_id,
        loginMethod: 'google'
      });
    }
    
    // Verificar si existe un usuario con el mismo correo
    const usuarioExistente = await usuariosModel.verificarCorreoExistente(googleUser.email);
    
    if (usuarioExistente && !usuarioExistente.google_id) {
      // Usuario existe pero no tiene Google ID vinculado
      // Vincular la cuenta de Google a la cuenta existente
      usuario = await usuariosModel.vincularGoogleId(usuarioExistente.usuario_id, googleUser.googleId);
      
      const token = jwt.sign({ userId: usuario.usuario_id, rol: usuario.rol_id }, process.env.JWT_SECRET, { expiresIn: '1h' });
      
      const baseUrl = `http://localhost:4000`;
      const foto_perfil_url_completa = usuario.foto_perfil_url
        ? `${baseUrl}${usuario.foto_perfil_url}`
        : googleUser.picture || null;
      
      await auditoriaController.registrarEvento(usuario.usuario_id, 'vinculación de cuenta Google', 'El usuario vinculó su cuenta con Google OAuth.');
      
      return res.json({
        token,
        nombre: usuario.nombre,
        apellido_paterno: usuario.apellido_paterno,
        apellido_materno: usuario.apellido_materno,
        foto_perfil_url: foto_perfil_url_completa,
        rol_id: usuario.rol_id,
        loginMethod: 'google',
        accountLinked: true
      });
    }
    
    // Crear nuevo usuario con Google
    const nombreCompleto = googleUser.name || '';
    const partesNombre = nombreCompleto.split(' ');
    const nombre = googleUser.given_name || partesNombre[0] || '';
    const apellido_paterno = googleUser.family_name || partesNombre[1] || '';
    const apellido_materno = partesNombre[2] || '';
    
    usuario = await usuariosModel.registrarUsuarioGoogle(
      nombre,
      apellido_paterno,
      apellido_materno,
      googleUser.email,
      googleUser.googleId,
      googleUser.picture
    );
    
    const token = jwt.sign({ userId: usuario.usuario_id, rol: usuario.rol_id }, process.env.JWT_SECRET, { expiresIn: '1h' });
    
    const baseUrl = `http://localhost:4000`;
    const foto_perfil_url_completa = usuario.foto_perfil_url
      ? `${baseUrl}${usuario.foto_perfil_url}`
      : googleUser.picture || null;
    
    await auditoriaController.registrarEvento(usuario.usuario_id, 'registro con Google', 'El usuario se registró usando Google OAuth.');
    
    res.status(201).json({
      token,
      nombre: usuario.nombre,
      apellido_paterno: usuario.apellido_paterno,
      apellido_materno: usuario.apellido_materno,
      foto_perfil_url: foto_perfil_url_completa,
      rol_id: usuario.rol_id,
      loginMethod: 'google',
      newUser: true
    });
    
  } catch (error) {
    console.error('Error en autenticación con Google:', error);
    next(error);
  }
};

// Desvincular cuenta de Google
exports.desvincularGoogle = async (req, res, next) => {
  try {
    const usuario = await usuariosModel.obtenerUsuarioPorId(req.userId);
    
    if (!usuario) {
      return res.status(404).json({ message: 'Usuario no encontrado.' });
    }
    
    if (!usuario.google_id) {
      return res.status(400).json({ message: 'La cuenta no está vinculada con Google.' });
    }
    
    if (!usuario.contrasena) {
      return res.status(400).json({ 
        message: 'No puedes desvincular Google sin establecer una contraseña primero.',
        requirePassword: true 
      });
    }
    
    // Desvincular removiendo el google_id
    await usuariosModel.vincularGoogleId(req.userId, null);
    
    await auditoriaController.registrarEvento(req.userId, 'desvinculación de Google', 'El usuario desvinculó su cuenta de Google.');
    
    res.json({ message: 'Cuenta de Google desvinculada exitosamente.' });
    
  } catch (error) {
    console.error('Error al desvincular Google:', error);
    next(error);
  }
};
