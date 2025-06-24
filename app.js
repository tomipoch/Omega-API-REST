const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const path = require('path');

// Configurar dotenv para cargar las variables de entorno
dotenv.config();

// Importar rutas
const usuariosRoutes = require('./routes/usuariosRoutes');
const citasRoutes = require('./routes/citasRoutes');
const eventosRoutes = require('./routes/eventosRoutes');
const blogRoutes = require('./routes/blogRoutes');
const testimoniosRoutes = require('./routes/testimoniosRoutes');
const personalizacionRoutes = require('./routes/personalizacionRoutes');  // Rutas de solicitud personalización
const serviciosRoutes = require('./routes/serviciosRoutes');
const faqRoutes = require('./routes/faqRoutes');  // Rutas de preguntas frecuentes
const disponibilidadRoutes = require('./routes/disponibilidadRoutes');  // Rutas de disponibilidad
const errorHandler = require('./middleware/errorHandler');

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
app.use('/disponibilidad', disponibilidadRoutes);  // Nueva ruta para disponibilidad

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

console.log('Correo:', process.env.EMAIL_USER); // Esto debe mostrar tu correo sin errores