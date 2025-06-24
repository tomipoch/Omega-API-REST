const { Pool } = require('pg');
require('dotenv').config();

console.log('Conectando a PostgreSQL en el puerto:', process.env.DB_PORT);

// Configurar timezone de Node.js
process.env.TZ = 'UTC';

const pool = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  password: process.env.DB_PASSWORD,
  port: process.env.DB_PORT,
  ssl: false,
  connectionTimeoutMillis: 30000,
  idleTimeoutMillis: 30000,
  max: 20,
  application_name: 'omega-joyeria',
  // Configurar tipos de datos para fechas
  types: {
    getTypeParser: function() {
      return function(val) { return val; };
    }
  }
});

// Configurar timezone al conectar
pool.on('connect', async (client) => {
  try {
    console.log('Configurando cliente de base de datos...');
    await client.query("SET timezone = 'UTC'");
    await client.query("SET datestyle = 'ISO, MDY'");
    console.log('Cliente configurado correctamente');
  } catch (err) {
    console.error('Error configurando sesión de cliente:', err);
  }
});

// Manejar errores de conexión
pool.on('error', (err, client) => {
  console.error('Error inesperado en cliente de base de datos:', err);
});

module.exports = pool;
