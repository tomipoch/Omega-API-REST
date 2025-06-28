const { OAuth2Client } = require('google-auth-library');
require('dotenv').config();

// Crear una instancia del cliente OAuth2 de Google
const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

// Función para verificar el token de Google
async function verifyGoogleToken(token) {
  try {
    const ticket = await client.verifyIdToken({
      idToken: token,
      audience: process.env.GOOGLE_CLIENT_ID,
    });
    
    const payload = ticket.getPayload();
    const { sub: googleId, email, name, picture, given_name, family_name } = payload;
    
    console.log('📋 [GoogleAuth] Datos extraídos del token:');
    console.log('   📧 Email:', email);
    console.log('   👤 Nombre:', name);
    console.log('   📸 Foto URL:', picture || 'Sin foto');
    console.log('   🆔 Google ID:', googleId);
    
    return {
      googleId,
      email,
      name,
      picture,
      given_name,
      family_name,
      verified: true
    };
  } catch (error) {
    console.error('Error al verificar el token de Google:', error);
    return { verified: false, error: error.message };
  }
}

// Middleware para autenticación con Google
const googleAuthMiddleware = async (req, res, next) => {
  console.log('🔍 [GoogleAuth] Procesando autenticación con Google');
  
  const { googleToken } = req.body;
  
  if (!googleToken) {
    console.log('❌ [GoogleAuth] Token de Google faltante');
    return res.status(400).json({ 
      message: 'Token de Google requerido',
      error: 'GOOGLE_TOKEN_MISSING',
      example: {
        googleToken: "eyJhbGciOiJSUzI1NiIs..."
      }
    });
  }
  
  console.log('✅ [GoogleAuth] Token de Google recibido');
  
  try {
    console.log('🔐 [GoogleAuth] Verificando token con Google...');
    const googleUser = await verifyGoogleToken(googleToken);
    
    if (!googleUser.verified) {
      console.log('❌ [GoogleAuth] Token inválido:', googleUser.error);
      return res.status(401).json({ 
        message: 'Token de Google inválido',
        error: 'INVALID_GOOGLE_TOKEN',
        details: googleUser.error
      });
    }
    
    console.log('✅ [GoogleAuth] Token verificado exitosamente para:', googleUser.email);
    req.googleUser = googleUser;
    next();
  } catch (error) {
    console.error('❌ [GoogleAuth] Error en el middleware:', error);
    return res.status(500).json({ 
      message: 'Error interno del servidor',
      error: 'GOOGLE_AUTH_ERROR',
      details: error.message
    });
  }
};

module.exports = {
  verifyGoogleToken,
  googleAuthMiddleware,
  client
};
