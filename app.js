const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const path = require('path');
const sequelize = require('./config/sequelize');
const configurarAsociaciones = require('./models/asociaciones'); // Importar asociaciones

// Importar rutas y middlewares
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
const authMiddleware = require('./middleware/authMiddleware'); // Importa el middleware de autenticación
const ReservaScheduler = require('./utils/reservaScheduler'); // Importar el programador de reservas

dotenv.config();

const app = express();

// Middleware para parsear datos
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Configuración de CORS
app.use(cors({
  origin: 'http://localhost:5173',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  credentials: true,
  allowedHeaders: ['Content-Type', 'Authorization', 'x-auth-token'],
  exposedHeaders: ['Authorization']
}));

// Servir archivos estáticos desde la carpeta 'uploads'
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Rutas públicas
app.use('/faq', faqRoutes);
app.use('/usuarios', usuariosRoutes);

// Rutas protegidas (requieren autenticación)
app.use('/citas', authMiddleware, citasRoutes);
app.use('/eventos', authMiddleware, eventosRoutes);
app.use('/blog', authMiddleware, blogRoutes);
app.use('/testimonios', authMiddleware, testimoniosRoutes);
app.use('/personalizacion', authMiddleware, personalizacionRoutes);
app.use('/servicios', authMiddleware, serviciosRoutes);
app.use('/productos', productosRoutes);

// Ruta para verificar si el servidor está activo
app.get('/ping', (req, res) => {
  res.json({ message: 'pong' });
});

// Middleware para manejar errores
app.use(errorHandler);

// Iniciar el servidor SOLO después de sincronizar Sequelize
const PORT = process.env.PORT || 4000;
console.log('Puerto desde .env:', process.env.PORT);

// Configurar asociaciones antes de sincronizar
// configurarAsociaciones(); // Comentado temporalmente

sequelize.sync().then(() => {
  // Iniciar el programador de reservas después de sincronizar la BD
  ReservaScheduler.iniciar();
  
  app.listen(PORT, () => {
    console.log(`Servidor corriendo en el puerto ${PORT}`);
  });
}).catch((err) => {
  console.error('Error al conectar con la base de datos:', err);
});

console.log('Correo:', process.env.EMAIL_USER);



