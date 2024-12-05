const nodemailer = require('nodemailer');
require('dotenv').config(); // Para cargar variables de entorno

// Configura el transporte de Nodemailer
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD,
  },
});

// Verifica que el transporte esté funcionando
transporter.verify((error, success) => {
  if (error) {
    console.error('Error en la configuración de Nodemailer:', error);
  } else {
    console.log('Nodemailer configurado correctamente');
  }
});

module.exports = transporter;
