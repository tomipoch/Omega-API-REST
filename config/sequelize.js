const { Sequelize } = require('sequelize');
require('dotenv').config();

// Logs de depuración para ver los valores y tipos de las variables de entorno
console.log('DB_USER:', process.env.DB_USER);
console.log('DB_PASSWORD:', process.env.DB_PASSWORD, typeof process.env.DB_PASSWORD);
console.log('DB_HOST:', process.env.DB_HOST);
console.log('DB_NAME:', process.env.DB_NAME);
console.log('DB_PORT:', process.env.DB_PORT, typeof process.env.DB_PORT);

const sequelize = new Sequelize(
  process.env.DB_NAME,
  process.env.DB_USER,
  String(process.env.DB_PASSWORD), // Forzar a string
  {
    host: process.env.DB_HOST,
    port: Number(process.env.DB_PORT), // Forzar a número
    dialect: 'postgres',
    logging: false
  }
);

module.exports = sequelize;