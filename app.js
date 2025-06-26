// app.js
const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const path = require('path');

// Cargar variables de entorno
dotenv.config();

// Importar rutas y middlewares
const usuariosRoutes = require('./routes/usuariosRoutes');
const citasRoutes = require('./routes/citasRoutes');
const eventosRoutes = require('./routes/eventosRoutes');
const blogRoutes = require('./routes/blogRoutes');
const testimoniosRoutes = require('./routes/testimoniosRoutes');
const personalizacionRoutes = require('./routes/personalizacionRoutes');
const serviciosRoutes = require('./routes/serviciosRoutes');
const faqRoutes = require('./routes/faqRoutes');
const disponibilidadRoutes = require('./routes/disponibilidadRoutes');
const errorHandler = require('./middleware/errorHandler');

// Crear app
const app = express();

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(cors({
  origin: 'http://localhost:5173',
  methods: 'GET,POST,PUT,DELETE',
  credentials: true
}));

// Archivos estáticos
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Rutas
app.use('/usuarios', usuariosRoutes);
app.use('/citas', citasRoutes);
app.use('/eventos', eventosRoutes);
app.use('/blog', blogRoutes);
app.use('/testimonios', testimoniosRoutes);
app.use('/faq', faqRoutes);
app.use('/personalizacion', personalizacionRoutes);
app.use('/servicios', serviciosRoutes);
app.use('/disponibilidad', disponibilidadRoutes);

// Ping
app.get('/ping', (req, res) => {
  res.json({ message: 'pong' });
});

// Error handler
app.use(errorHandler);

// Exportar para usar en `server.js` o test
module.exports = app;
