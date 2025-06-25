const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const path = require('path');
const sequelize = require('./config/sequelize'); 

// Importar rutas
const usuariosRoutes = require('./routes/usuariosRoutes');
const citasRoutes = require('./routes/citasRoutes');
const eventosRoutes = require('./routes/eventosRoutes');
const blogRoutes = require('./routes/blogRoutes');
const testimoniosRoutes = require('./routes/testimoniosRoutes');
const personalizacionRoutes = require('./routes/personalizacionRoutes');
const serviciosRoutes = require('./routes/serviciosRoutes');
const faqRoutes = require('./routes/faqRoutes');
const errorHandler = require('./middleware/errorHandler');
const productosRoutes = require('./routes/productosRoutes');
dotenv.config();

// Crear la aplicación de Express
const app = express();

// Middleware para parsear datos
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Configuración de CORS
app.use(cors({
  origin: 'http://localhost:5173',
  methods: 'GET,POST,PUT,DELETE',
  credentials: true
}));

// Servir archivos estáticos desde la carpeta 'uploads'
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
app.use('/productos', productosRoutes);

// Ruta para verificar si el servidor está activo
app.get('/ping', (req, res) => {
  res.json({ message: 'pong' });
});

// Middleware para manejar errores
app.use(errorHandler);

// Iniciar el servidor SOLO después de sincronizar Sequelize
const PORT = process.env.PORT || 4000;
console.log('Puerto desde .env:', process.env.PORT);  // Depuración de puerto

sequelize.sync().then(() => {
  app.listen(PORT, () => {
    console.log(`Servidor corriendo en el puerto ${PORT}`);
  });
}).catch((err) => {
  console.error('Error al conectar con la base de datos:', err);
});

console.log('Correo:', process.env.EMAIL_USER);

