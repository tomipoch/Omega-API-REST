const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors'); // Importar el middleware de CORS
const path = require('path');
const bodyParser = require('body-parser');

// Importar rutas
const usuariosRoutes = require('./routes/usuariosRoutes');
const citasRoutes = require('./routes/citasRoutes');
const eventosRoutes = require('./routes/eventosRoutes');
const blogRoutes = require('./routes/blogRoutes');
const testimoniosRoutes = require('./routes/testimoniosRoutes');
const personalizacionRoutes = require('./routes/personalizacionRoutes');  // Rutas de solicitud personalización
const faqRoutes = require('./routes/faqRoutes');  // Rutas de preguntas frecuentes
const errorHandler = require('./middleware/errorHandler');

// Configurar variables de entorno
dotenv.config();

// Crear la aplicación de Express
const app = express();

// Middleware para manejar solicitudes JSON y datos de formularios
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Configuración de CORS para permitir acceso desde el frontend en localhost:5173
app.use(cors({
  origin: 'http://localhost:5173',
  methods: 'GET,POST,PUT,DELETE',
  credentials: true
}));

// Middleware para parsear JSON
app.use(express.json());

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

// Ruta para verificar si el servidor está activo
app.get('/ping', (req, res) => {
  res.json({ message: 'pong' });
});

// Middleware para manejar errores
app.use(errorHandler);

// Iniciar el servidor
const PORT = process.env.PORT || 4000;
console.log('Puerto desde .env:', process.env.PORT);  // Depuración de puerto

app.listen(PORT, () => {
  console.log(`Servidor corriendo en el puerto ${PORT}`);
});
