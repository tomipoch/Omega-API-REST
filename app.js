const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const path = require('path');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');

dotenv.config();

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

const errorHandler = require('./middleware/errorHandler');
const authMiddleware = require('./middleware/authMiddleware');

const app = express();

// Seguridad
app.use(helmet());

const allowedOrigins = (process.env.CORS_ORIGINS || 'http://localhost:5173')
  .split(',')
  .map(s => s.trim())
  .filter(Boolean);

app.use(cors({
  origin: (origin, cb) => {
    if (!origin || allowedOrigins.includes(origin)) return cb(null, true);
    cb(new Error('Origen no permitido por CORS'));
  },
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  credentials: true,
  allowedHeaders: ['Content-Type', 'Authorization', 'x-auth-token'],
  exposedHeaders: ['Authorization']
}));

// Rate limit en endpoints sensibles
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: 'Demasiados intentos, intente más tarde.' }
});
app.use('/usuarios/login', authLimiter);
app.use('/usuarios/auth/google', authLimiter);
app.use('/usuarios/register', authLimiter);
app.use('/usuarios/restablecer-solicitud', authLimiter);

// Parsers
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Estáticos
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Rutas
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
app.use('/', reporteRoutes);

app.get('/ping', (req, res) => {
  res.json({ message: 'pong' });
});

app.use(errorHandler);

module.exports = app;