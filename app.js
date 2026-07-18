require('./utils/env');

const express = require('express');
const path = require('path');
const logger = require('./utils/logger');

const usuariosRoutes = require('./routes/usuariosRoutes');
const citasRoutes = require('./routes/citasRoutes');
const eventosRoutes = require('./routes/eventosRoutes');
const blogRoutes = require('./routes/blogRoutes');
const testimoniosRoutes = require('./routes/testimoniosRoutes');
const personalizacionRoutes = require('./routes/personalizacionRoutes');
const serviciosRoutes = require('./routes/serviciosRoutes');
const faqRoutes = require('./routes/faqRoutes');
const productosRoutes = require('./routes/productosRoutes');
const reporteRoutes = require('./routes/reporteRoutes');
const chatRoutes = require('./routes/chatRoutes');
const disponibilidadRoutes = require('./routes/disponibilidadRoutes');
const kpiRoutes = require('./routes/kpiRoutes');

const errorHandler = require('./middleware/errorHandler');
const authMiddleware = require('./middleware/authMiddleware');
const requestLogger = require('./middleware/requestLogger');
const securityHeaders = require('./middleware/securityHeaders');
const corsMiddleware = require('./middleware/cors');
const {
  authLimiter,
  reservasLimiter,
  chatLimiter,
  disponibilidadLimiter
} = require('./middleware/rateLimiters');

const pool = require('./database/pgPool');
const swaggerSpec = require('./swagger');

const app = express();

app.set('trust proxy', 1);

app.use(securityHeaders);
app.use(corsMiddleware);
app.use(requestLogger);

app.use('/usuarios/login', authLimiter);
app.use('/usuarios/auth/google', authLimiter);
app.use('/usuarios/register', authLimiter);
app.use('/usuarios/restablecer-solicitud', authLimiter);
app.use('/chat', chatLimiter);
app.use('/disponibilidad/publicas', disponibilidadLimiter);
app.use('/disponibilidad/publicas-con-cita', disponibilidadLimiter);
app.use('/productos/:id/reservar', reservasLimiter);

app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true }));

app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

const SWAGGER_HTML = `<!DOCTYPE html>
<html lang="es">
<head>
<meta charset="utf-8">
<title>Omega Joyería API</title>
<link rel="stylesheet" href="https://unpkg.com/swagger-ui-dist@5.17.14/swagger-ui.css">
</head>
<body>
<div id="swagger-ui"></div>
<script src="https://unpkg.com/swagger-ui-dist@5.17.14/swagger-ui-bundle.js"></script>
<script>
  window.onload = () => {
    window.ui = SwaggerUIBundle({ url: '/api-docs-json', dom_id: '#swagger-ui' });
  };
</script>
</body>
</html>`;

app.get('/api-docs', (_req, res) => {
  res.set('Content-Type', 'text/html').send(SWAGGER_HTML);
});
app.get('/api-docs-json', (_req, res) => res.json(swaggerSpec));

app.get('/ping', (_req, res) => {
  res.json({ message: 'pong' });
});

app.get('/health/db', async (_req, res) => {
  const start = Date.now();
  try {
    await pool.query('SELECT 1');
    res.status(200).json({ db: 'up', latency_ms: Date.now() - start });
  } catch (err) {
    logger.error(`Health check DB failed: ${err.stack || err.message}`);
    res.status(503).json({ db: 'down', latency_ms: Date.now() - start, error: err.message });
  }
});

app.use('/faq', faqRoutes);
app.use('/usuarios', usuariosRoutes);
app.use('/citas', authMiddleware, citasRoutes);
app.use('/eventos', authMiddleware, eventosRoutes);
app.use('/blog', authMiddleware, blogRoutes);
app.use('/testimonios', authMiddleware, testimoniosRoutes);
app.use('/personalizacion', authMiddleware, personalizacionRoutes);
app.use('/servicios', authMiddleware, serviciosRoutes);
app.use('/productos', productosRoutes);
app.use('/chat', authMiddleware, chatRoutes);
app.use('/disponibilidad', disponibilidadRoutes);
app.use('/admin', kpiRoutes);
app.use('/', reporteRoutes);

app.use(errorHandler);

module.exports = app;