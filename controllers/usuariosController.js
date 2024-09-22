const usuariosModel = require('../models/usuariosModel');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const nodemailer = require('nodemailer');
const auditoriaController = require('../controllers/auditoriaController');

// Configuración de NodeMailer para enviar correos
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER, // Tu email
    pass: process.env.EMAIL_PASSWORD // Tu contraseña de email
  }
});

// Registrar un nuevo usuario
exports.registrarUsuario = async (req, res, next) => {
  const { nombre, correo_electronico, contrasena } = req.body;
  
  if (!nombre || !correo_electronico || !contrasena) {
    return res.status(400).json({ message: 'Por favor, proporciona todos los datos.' });
  }

  try {
    // Encriptar la contraseña
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(contrasena, salt);

    // Asignar el rol de usuario (rol_id = 1) por defecto
    const nuevoUsuario = await usuariosModel.registrarUsuario(nombre, correo_electronico, hashedPassword, 1);
    
    // Registrar el evento de auditoría
    await auditoriaController.registrarEvento(nuevoUsuario.usuario_id, 'registro', `El usuario ${nombre} se ha registrado con éxito.`);

    res.status(201).json(nuevoUsuario);
  } catch (error) {
    next(error);
  }
};
  
// Iniciar sesión
exports.iniciarSesion = async (req, res, next) => {
  const { correo_electronico, contrasena } = req.body;

  if (!correo_electronico || !contrasena) {
    return res.status(400).json({ message: 'Por favor, proporciona todos los datos.' });
  }

  try {
    const usuario = await usuariosModel.obtenerUsuarioPorCorreo(correo_electronico);
    
    if (!usuario) {
      // Registrar el intento fallido de inicio de sesión
      await auditoriaController.registrarEvento(null, 'intento fallido', `Intento fallido de inicio de sesión para ${correo_electronico}. Usuario no encontrado.`);
      return res.status(400).json({ message: 'Usuario no encontrado.' });
    }

    // Verificar contraseña
    const esValido = await bcrypt.compare(contrasena, usuario.contrasena);
    if (!esValido) {
      // Registrar el intento fallido de inicio de sesión
      await auditoriaController.registrarEvento(usuario.usuario_id, 'intento fallido', `Intento fallido de inicio de sesión para ${correo_electronico}. Contraseña incorrecta.`);
      return res.status(400).json({ message: 'Contraseña incorrecta.' });
    }

    // Crear el token JWT con el rol incluido
    const token = jwt.sign({ userId: usuario.usuario_id, rol: usuario.rol_id }, process.env.JWT_SECRET, { expiresIn: '1h' });

    // Registrar el intento exitoso de inicio de sesión
    await auditoriaController.registrarEvento(usuario.usuario_id, 'inicio de sesión', `El usuario ${correo_electronico} inició sesión con éxito.`);

    res.json({ token });
  } catch (error) {
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
    res.json(usuario);
  } catch (error) {
    next(error);
  }
};

// Actualizar perfil del usuario autenticado
exports.actualizarPerfil = async (req, res, next) => {
  const { nombre, correo_electronico, telefono, direccion } = req.body;

  try {
    const usuarioActualizado = await usuariosModel.actualizarUsuario(req.userId, nombre, correo_electronico, telefono, direccion);
    if (!usuarioActualizado) {
      return res.status(404).json({ message: 'Usuario no encontrado.' });
    }

    // Registrar el evento de auditoría
    await auditoriaController.registrarEvento(req.userId, 'actualización de perfil', 'El perfil del usuario fue actualizado con éxito.');

    res.json(usuarioActualizado);
  } catch (error) {
    next(error);
  }
};

// Eliminar cuenta del usuario autenticado
exports.eliminarCuenta = async (req, res, next) => {
  try {
    // Registrar el evento de auditoría antes de eliminar
    await auditoriaController.registrarEvento(req.userId, 'eliminación de cuenta', 'El usuario solicitó la eliminación de su cuenta.');

    const resultado = await usuariosModel.eliminarUsuario(req.userId);
    if (!resultado) {
      return res.status(404).json({ message: 'Usuario no encontrado.' });
    }

    res.json({ message: 'Cuenta eliminada con éxito.' });
  } catch (error) {
    next(error);
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

    // Generar un código de 6 dígitos
    const codigo = generarCodigoRestablecimiento();

    // Establecer una fecha de expiración (ej. 15 minutos)
    const fechaExpiracion = new Date(Date.now() + 15 * 60 * 1000);  // 15 minutos

    // Guardar el código en la base de datos
    await usuariosModel.guardarCodigoRestablecimiento(usuario.usuario_id, codigo, fechaExpiracion);

    // Enviar el código por correo electrónico
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: correo_electronico,
      subject: 'Código de Restablecimiento de Contraseña',
      text: `Tu código de restablecimiento de contraseña es: ${codigo}. Tienes 15 minutos para usarlo.`
    };

    await transporter.sendMail(mailOptions);

    // Registrar el evento en la auditoría
    await auditoriaController.registrarEvento(usuario.usuario_id, 'solicitud restablecimiento', `Se envió un código de restablecimiento a ${correo_electronico}.`);

    res.json({ message: 'El código de restablecimiento ha sido enviado a tu correo.' });
  } catch (error) {
    next(error);
  }
};

// Función para generar un código de restablecimiento (6 dígitos)
const generarCodigoRestablecimiento = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};


// Verificar el código y restablecer la contraseña
exports.restablecerContrasena = async (req, res, next) => {
  const { correo_electronico, codigo, nuevaContrasena } = req.body;

  try {
    // Verificar si el usuario existe
    const usuario = await usuariosModel.obtenerUsuarioPorCorreo(correo_electronico);
    if (!usuario) {
      return res.status(404).json({ message: 'Usuario no encontrado.' });
    }

    // Verificar si el código es válido y no ha expirado
    const codigoRestablecimiento = await usuariosModel.verificarCodigoRestablecimiento(usuario.usuario_id, codigo);

    if (!codigoRestablecimiento) {
      return res.status(400).json({ message: 'Código inválido o ha expirado.' });
    }

    // Verificar si el código ya ha sido usado
    if (codigoRestablecimiento.usado) {
      return res.status(400).json({ message: 'El código ya ha sido usado.' });
    }

    // Encriptar la nueva contraseña
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(nuevaContrasena, salt);

    // Actualizar la contraseña del usuario
    await usuariosModel.actualizarContrasena(usuario.usuario_id, hashedPassword);

    // Marcar el código como usado
    await usuariosModel.marcarCodigoComoUsado(codigoRestablecimiento.restablecimiento_id);

    // Registrar el evento en la auditoría
    await auditoriaController.registrarEvento(usuario.usuario_id, 'restablecimiento contraseña', 'El usuario restableció su contraseña con éxito.');

    res.json({ message: 'Contraseña restablecida con éxito.' });
  } catch (error) {
    next(error);
  }
};
