const transporter = require('../middleware/transporter');
const logger = require('../utils/logger');

const plantillaConfirmacionReserva = ({ nombre, reservaId, nombreProducto, cantidad }) => `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"></head>
<body style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
  <h1 style="color: #333;">¡Hola ${nombre}!</h1>
  <p>Tu reserva ha sido <strong style="color: #28a745;">confirmada</strong> con éxito.</p>

  <div style="background: #f5f5f5; padding: 20px; border-radius: 8px; margin: 20px 0;">
    <h2 style="margin-top: 0; color: #555;">Detalles de la reserva</h2>
    <p><strong>ID de reserva:</strong> #${reservaId}</p>
    <p><strong>Producto:</strong> ${nombreProducto}</p>
    <p><strong>Cantidad:</strong> ${cantidad}</p>
  </div>

  <p>Puedes retirar tu compra en nuestra tienda:</p>
  <p style="color: #666;">Av. Providencia 2550, Local 45, Providencia, Santiago</p>

  <p style="margin-top: 30px;">Gracias por tu preferencia.<br><strong>Equipo Omega Joyería</strong></p>
</body>
</html>
`;

exports.enviarConfirmacionReserva = async ({ correo, nombre, reservaId, nombreProducto, cantidad }) => {
  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: correo,
    subject: `🎉 Reserva Confirmada #${reservaId} - ${nombreProducto}`,
    html: plantillaConfirmacionReserva({ nombre, reservaId, nombreProducto, cantidad })
  };

  try {
    await transporter.sendMail(mailOptions);
    logger.info(`Email confirmación enviado a ${correo} para reserva ${reservaId}`);
    return true;
  } catch (error) {
    logger.warn(`Error enviando email confirmación a ${correo}: ${error.message}`);
    return false;
  }
};