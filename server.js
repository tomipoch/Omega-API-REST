require('./utils/env');

const app = require('./app');
const env = require('./utils/env');
const logger = require('./utils/logger');
const pool = require('./database/pgPool');
const ReservaScheduler = require('./utils/reservaScheduler');

const PORT = env.PORT;
const server = app.listen(PORT, () => {
  logger.info(`Servidor corriendo en el puerto ${PORT}`);
});

if (env.NODE_ENV !== 'test') {
  ReservaScheduler.iniciar();
}

const shutdown = async (signal) => {
  logger.info(`Received ${signal}. Shutting down gracefully...`);
  server.close(async (err) => {
    if (err) {
      logger.error(`Error closing HTTP server: ${err.stack || err.message}`);
      process.exit(1);
    }
    try {
      await pool.end();
      logger.info('Database pool closed.');
      process.exit(0);
    } catch (poolErr) {
      logger.error(`Error closing DB pool: ${poolErr.message}`);
      process.exit(1);
    }
  });

  setTimeout(() => {
    logger.error('Force exit after 10s timeout.');
    process.exit(1);
  }, 10000).unref();
};

process.on('SIGTERM', () => shutdown('SIGTERM'));
process.on('SIGINT', () => shutdown('SIGINT'));

process.on('uncaughtException', (err) => {
  logger.error(`Uncaught exception: ${err.stack || err.message}`);
  if (env.NODE_ENV === 'production') {
    shutdown('uncaughtException');
  } else {
    process.exit(1);
  }
});

process.on('unhandledRejection', (reason) => {
  logger.error(`Unhandled rejection: ${reason && reason.stack ? reason.stack : reason}`);
});

module.exports = server;
