const transporter = require('./transporter');

/**
 * Envía correo de confirmación de reserva al usuario
 * @param {Object} datos - Datos de la reserva
 * @param {string} datos.emailUsuario - Email del usuario
 * @param {string} datos.nombreUsuario - Nombre completo del usuario
 * @param {string} datos.nombreProducto - Nombre del producto reservado
 * @param {number} datos.cantidadReservada - Cantidad reservada
 * @param {Date} datos.fechaExpiracion - Fecha límite para retirar
 * @param {number} datos.reservaId - ID de la reserva
 * @param {number} datos.precioTotal - Precio total de la reserva
 */
async function enviarCorreoConfirmacionReserva(datos) {
  try {
    const {
      emailUsuario,
      nombreUsuario,
      nombreProducto,
      cantidadReservada,
      fechaExpiracion,
      reservaId,
      precioTotal
    } = datos;

    // Formatear fecha límite
    const fechaLimite = new Date(fechaExpiracion);
    const fechaFormateada = fechaLimite.toLocaleDateString('es-ES', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });

    const horaFormateada = fechaLimite.toLocaleTimeString('es-ES', {
      hour: '2-digit',
      minute: '2-digit'
    });

    // Calcular días restantes
    const ahora = new Date();
    const tiempoRestante = fechaLimite - ahora;
    const diasRestantes = Math.ceil(tiempoRestante / (1000 * 60 * 60 * 24));
    const horasRestantes = Math.ceil(tiempoRestante / (1000 * 60 * 60));

    let tiempoTexto;
    if (diasRestantes > 1) {
      tiempoTexto = `${diasRestantes} días`;
    } else if (horasRestantes > 1) {
      tiempoTexto = `${horasRestantes} horas`;
    } else {
      tiempoTexto = 'menos de 1 hora';
    }

    const htmlContent = `
    <!DOCTYPE html>
    <html lang="es">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Confirmación de Reserva - Omega</title>
        <style>
            body {
                font-family: Arial, sans-serif;
                line-height: 1.6;
                color: #333;
                max-width: 600px;
                margin: 0 auto;
                padding: 20px;
                background-color: #f4f4f4;
            }
            .container {
                background-color: white;
                padding: 30px;
                border-radius: 10px;
                box-shadow: 0 0 20px rgba(0,0,0,0.1);
            }
            .header {
                text-align: center;
                background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                color: white;
                padding: 20px;
                border-radius: 10px;
                margin-bottom: 30px;
            }
            .header h1 {
                margin: 0;
                font-size: 28px;
            }
            .success-icon {
                font-size: 48px;
                margin-bottom: 10px;
            }
            .info-box {
                background-color: #e8f5e8;
                border-left: 4px solid #4CAF50;
                padding: 15px;
                margin: 20px 0;
                border-radius: 5px;
            }
            .warning-box {
                background-color: #fff3cd;
                border-left: 4px solid #ffc107;
                padding: 15px;
                margin: 20px 0;
                border-radius: 5px;
            }
            .product-details {
                background-color: #f8f9fa;
                padding: 20px;
                border-radius: 8px;
                margin: 20px 0;
            }
            .detail-row {
                display: flex;
                justify-content: space-between;
                margin: 10px 0;
                padding: 5px 0;
                border-bottom: 1px solid #eee;
            }
            .detail-label {
                font-weight: bold;
                color: #555;
            }
            .detail-value {
                color: #333;
            }
            .countdown {
                text-align: center;
                background: linear-gradient(135deg, #ff7e5f 0%, #feb47b 100%);
                color: white;
                padding: 20px;
                border-radius: 10px;
                margin: 20px 0;
            }
            .countdown h3 {
                margin: 0 0 10px 0;
                font-size: 20px;
            }
            .countdown p {
                margin: 0;
                font-size: 24px;
                font-weight: bold;
            }
            .instructions {
                background-color: #e3f2fd;
                border-left: 4px solid #2196F3;
                padding: 15px;
                margin: 20px 0;
                border-radius: 5px;
            }
            .instructions ol {
                margin: 10px 0;
                padding-left: 20px;
            }
            .footer {
                text-align: center;
                margin-top: 30px;
                padding-top: 20px;
                border-top: 1px solid #eee;
                color: #666;
                font-size: 14px;
            }
            .button {
                display: inline-block;
                background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                color: white;
                padding: 12px 30px;
                text-decoration: none;
                border-radius: 25px;
                font-weight: bold;
                margin: 10px 0;
            }
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <div class="success-icon">🎉</div>
                <h1>¡Reserva Confirmada!</h1>
                <p>Tu producto ha sido reservado exitosamente</p>
            </div>

            <div class="info-box">
                <h3>🛍️ Hola, ${nombreUsuario}</h3>
                <p>Tu reserva ha sido confirmada. Tu producto te está esperando en nuestra tienda.</p>
            </div>

            <div class="product-details">
                <h3 style="margin-top: 0; color: #333;">📦 Detalles de tu Reserva</h3>
                <div class="detail-row">
                    <span class="detail-label">🆔 Número de Reserva:</span>
                    <span class="detail-value">#${reservaId}</span>
                </div>
                <div class="detail-row">
                    <span class="detail-label">🛒 Producto:</span>
                    <span class="detail-value">${nombreProducto}</span>
                </div>
                <div class="detail-row">
                    <span class="detail-label">📊 Cantidad:</span>
                    <span class="detail-value">${cantidadReservada} unidad(es)</span>
                </div>
                <div class="detail-row">
                    <span class="detail-label">💰 Total a Pagar:</span>
                    <span class="detail-value">$${precioTotal?.toLocaleString('es-ES') || 'Por confirmar'}</span>
                </div>
                <div class="detail-row">
                    <span class="detail-label">📅 Fecha de Reserva:</span>
                    <span class="detail-value">${new Date().toLocaleDateString('es-ES')}</span>
                </div>
            </div>

            <div class="countdown">
                <h3>⏰ Tiempo Límite para Retirar</h3>
                <p>${fechaFormateada}</p>
                <div style="font-size: 16px; margin-top: 10px;">
                    Tienes aproximadamente <strong>${tiempoTexto}</strong> para retirar tu producto
                </div>
            </div>

            <div class="warning-box">
                <h4 style="margin-top: 0;">⚠️ Importante</h4>
                <p><strong>Debes retirar tu producto antes del ${fechaFormateada}</strong>, de lo contrario la reserva será cancelada automáticamente y el producto volverá a estar disponible para otros clientes.</p>
            </div>

            <div class="instructions">
                <h4 style="margin-top: 0;">📋 ¿Qué hacer ahora?</h4>
                <ol>
                    <li><strong>Dirígete a nuestra tienda</strong> en el horario de atención</li>
                    <li><strong>Presenta este correo</strong> o menciona tu número de reserva: <strong>#${reservaId}</strong></li>
                    <li><strong>Realiza el pago</strong> del total: $${precioTotal?.toLocaleString('es-ES') || 'Por confirmar'}</li>
                    <li><strong>¡Llévate tu producto!</strong></li>
                </ol>
            </div>

            <div style="text-align: center; margin: 30px 0;">
                <p><strong>📍 Información de la Tienda</strong></p>
                <p>
                    📍 Dirección: [ 1 Sur 1610, 3460000 Talca, Maule]<br>
                    🕒 Horario: Lunes a Viernes 9:00 AM - 6:00 PM<br>
                    📞 Teléfono: [(71) 221 7205]<br>
                    📧 Email: ${process.env.EMAIL_USER || 'contacto@omega.com'}
                </p>
            </div>

            <div class="footer">
                <p>
                    Este es un correo automático, por favor no respondas a este mensaje.<br>
                    Si tienes alguna pregunta, contáctanos a través de nuestros canales oficiales.
                </p>
                <p style="margin-top: 15px;">
                    <strong>Omega</strong> - Tu tienda de confianza<br>
                    © ${new Date().getFullYear()} Todos los derechos reservados
                </p>
            </div>
        </div>
    </body>
    </html>
    `;

    const mailOptions = {
      from: {
        name: 'Omega - Confirmación de Reserva',
        address: process.env.EMAIL_USER
      },
      to: emailUsuario,
      subject: `🎉 Reserva Confirmada #${reservaId} - ${nombreProducto}`,
      html: htmlContent,
      text: `
¡Hola ${nombreUsuario}!

Tu reserva ha sido confirmada exitosamente.

DETALLES DE LA RESERVA:
- Número de Reserva: #${reservaId}
- Producto: ${nombreProducto}
- Cantidad: ${cantidadReservada} unidad(es)
- Total a Pagar: $${precioTotal?.toLocaleString('es-ES') || 'Por confirmar'}

IMPORTANTE:
Tienes hasta el ${fechaFormateada} para retirar tu producto en la tienda.

¿Qué hacer ahora?
1. Dirígete a nuestra tienda
2. Presenta este correo o menciona tu número de reserva: #${reservaId}
3. Realiza el pago del total
4. ¡Llévate tu producto!

Si no retiras el producto antes de la fecha límite, la reserva será cancelada automáticamente.

Omega - Tu tienda de confianza
      `
    };

    const info = await transporter.sendMail(mailOptions);
    
    console.log('✅ Correo de confirmación de reserva enviado:', info.messageId);
    console.log('📧 Enviado a:', emailUsuario);
    console.log('🆔 Reserva:', reservaId);
    
    return {
      success: true,
      messageId: info.messageId,
      destinatario: emailUsuario
    };

  } catch (error) {
    console.error('❌ Error al enviar correo de confirmación de reserva:', error);
    return {
      success: false,
      error: error.message
    };
  }
}

module.exports = {
  enviarCorreoConfirmacionReserva
};