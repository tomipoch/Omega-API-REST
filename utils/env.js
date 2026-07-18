const logger = require('./logger');
const { loadEnvFile } = require('./dotenv');

loadEnvFile();

const isProd = process.env.NODE_ENV === 'production';

const required = ['DB_HOST', 'DB_USER', 'DB_NAME', 'DB_PORT', 'JWT_SECRET'];
const optional = {
  PORT: 4000,
  NODE_ENV: 'development',
  DB_PASSWORD: '',
  JWT_EXPIRES_IN: '1h',
  EMAIL_USER: '',
  EMAIL_PASSWORD: '',
  GOOGLE_CLIENT_ID: '',
  GOOGLE_CLIENT_SECRET: '',
  CORS_ORIGINS: 'http://localhost:5173',
  BASE_URL: '',
  AI_BASE_URL: 'https://api.openai.com/v1',
  AI_API_KEY: '',
  AI_MODEL: 'gpt-4o-mini',
  AI_TIMEOUT_MS: '15000',
  UPLOAD_DIR: 'uploads',
  MAX_UPLOAD_SIZE_MB: '5'
};

const missing = required.filter((k) => !process.env[k]);

if (missing.length) {
  logger.error(`Missing required environment variables: ${missing.join(', ')}`);
  if (isProd) {
    process.exit(1);
  }
}

const parsed = {};
for (const [key, fallback] of Object.entries(optional)) {
  parsed[key] = process.env[key] || fallback;
}
for (const key of required) {
  parsed[key] = process.env[key] || '';
}

parsed.PORT = Number(parsed.PORT);
parsed.DB_PORT = Number(parsed.DB_PORT);
parsed.MAX_UPLOAD_SIZE_MB = Number(parsed.MAX_UPLOAD_SIZE_MB);
parsed.AI_TIMEOUT_MS = Number(parsed.AI_TIMEOUT_MS);

if (isProd && (!parsed.JWT_SECRET || parsed.JWT_SECRET.length < 32)) {
  logger.error('JWT_SECRET must be at least 32 characters in production.');
  process.exit(1);
}

parsed.CORS_ORIGINS_LIST = parsed.CORS_ORIGINS.split(',')
  .map((s) => s.trim())
  .filter(Boolean);

module.exports = Object.freeze(parsed);
