const app = require('./app');
const ReservaScheduler = require('./utils/reservaScheduler');

const PORT = process.env.PORT || 4000;

ReservaScheduler.iniciar();

app.listen(PORT, () => {
  console.log(`Servidor corriendo en el puerto ${PORT}`);
});