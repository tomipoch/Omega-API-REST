// server.js
const app = require('./app');
const sequelize = require('./config/sequelize');

const PORT = process.env.PORT || 4000;

sequelize.sync().then(() => {
  app.listen(PORT, () => {
    console.log(`Servidor corriendo en el puerto ${PORT}`);
  });
}).catch((err) => {
  console.error('Error al conectar con la base de datos:', err);
});
