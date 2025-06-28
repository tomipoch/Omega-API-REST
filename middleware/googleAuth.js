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
  const { googleToken } = req.body;
  
  if (!googleToken) {
    return res.status(400).json({ 
      message: 'Token de Google requerido',
      error: 'GOOGLE_TOKEN_MISSING' 
    });
  }
  
  try {
    const googleUser = await verifyGoogleToken(googleToken);
    
    if (!googleUser.verified) {
      return res.status(401).json({ 
        message: 'Token de Google inválido',
        error: 'INVALID_GOOGLE_TOKEN' 
      });
    }
    
    req.googleUser = googleUser;
    next();
  } catch (error) {
    console.error('Error en el middleware de Google Auth:', error);
    return res.status(500).json({ 
      message: 'Error interno del servidor',
      error: 'GOOGLE_AUTH_ERROR' 
    });
  }
};

module.exports = {
  verifyGoogleToken,
  googleAuthMiddleware,
  client
};
