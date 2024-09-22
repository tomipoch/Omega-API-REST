const express = require('express');
const dotenv = require('dotenv');
const usuariosRoutes = require('./routes/usuariosRoutes');
const citasRoutes = require('./routes/citasRoutes');
const eventosRoutes = require('./routes/eventosRoutes');
const blogRoutes = require('./routes/blogRoutes');
const testimoniosRoutes = require('./routes/testimoniosRoutes');
const personalizacionRoutes = require('./routes/personalizacionRoutes');  // Rutas de solicitud personalización
const errorHandler = require('./middleware/errorHandler');
const faqRoutes = require('./routes/faqRoutes');  // Rutas de preguntas frecuentes
const path = require('path');

dotenv.config();
const app = express();

// Middleware para parsear JSON
app.use(express.json());

// Servir archivos estáticos (imágenes subidas)
app.use('/uploads', express.static('uploads'));

// Rutas
app.use('/usuarios', usuariosRoutes);  
app.use('/citas', citasRoutes);        
app.use('/eventos', eventosRoutes);    
app.use('/blog', blogRoutes);          
app.use('/testimonios', testimoniosRoutes); 
app.use('/faq', faqRoutes);  // Rutas de preguntas frecuentes
app.use('/personalizacion', personalizacionRoutes);  // Rutas de solicitud de personalización
app.use('/uploads', express.static(path.join(__dirname, 'uploads'))); // Servir archivos estáticos desde la carpeta 'uploads'

// Middleware para manejar errores
app.use(errorHandler);


// Iniciar el servidor
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Servidor corriendo en el puerto ${PORT}`);
});
