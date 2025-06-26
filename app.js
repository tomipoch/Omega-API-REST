const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const path = require('path');

// Importaciones
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
const errorHandler = require('./middleware/errorHandler');
const authMiddleware = require('./middleware/authMiddleware');

const app = express();

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors({
  origin: 'http://localhost:5173',
  methods: 'GET,POST,PUT,DELETE',
  credentials: true,
  allowedHeaders: ['Content-Type', 'Authorization'],
}));
app.use((req, res, next) => {
  res.header('Access-Control-Expose-Headers', 'Authorization');
  next();
});
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
app.use('/productos', authMiddleware, productosRoutes);

app.get('/ping', (req, res) => {
  res.json({ message: 'pong' });
});

app.use(errorHandler);

module.exports = app; // 👈 Esto es lo que supertest necesita
