const { OAuth2Client } = require('google-auth-library');
const logger = require('../utils/logger');

const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

async function verifyGoogleToken(token) {
  try {
    const ticket = await client.verifyIdToken({
      idToken: token,
      audience: process.env.GOOGLE_CLIENT_ID,
    });

    const payload = ticket.getPayload();
    const { sub: googleId, email, name, picture, given_name, family_name } = payload;

    return {
      googleId, email, name, picture, given_name, family_name,
      verified: true
    };
  } catch (error) {
    logger.debug(`Error verificando token Google: ${error.message}`);
    return { verified: false, error: error.message };
  }
}

const googleAuthMiddleware = async (req, res, next) => {
  const { googleToken } = req.body;

  if (!googleToken) {
    return res.status(400).json({
      message: 'Token de Google requerido',
      error: 'GOOGLE_TOKEN_MISSING',
      example: { googleToken: 'eyJhbGciOiJSUzI1NiIs...' }
    });
  }

  try {
    const googleUser = await verifyGoogleToken(googleToken);

    if (!googleUser.verified) {
      return res.status(401).json({
        message: 'Token de Google inválido',
        error: 'INVALID_GOOGLE_TOKEN',
        details: googleUser.error
      });
    }

    req.googleUser = googleUser;
    return next();
  } catch (error) {
    logger.error(`Error en middleware Google: ${error.message}`);
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
