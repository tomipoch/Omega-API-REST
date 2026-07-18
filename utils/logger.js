const winston = require('winston');
const path = require('path');

const isTest = process.env.NODE_ENV === 'test';

const transports = [
  new winston.transports.Console({
    silent: false,
    format: winston.format.combine(
      winston.format.colorize(),
      winston.format.printf(({ level, message, timestamp, stack }) =>
        `${timestamp} [${level}] ${stack || message}`)
    )
  })
];

if (!isTest) {
  transports.push(
    new winston.transports.File({
      filename: path.join(process.cwd(), 'combined.log'),
      level: 'info',
      maxsize: 5 * 1024 * 1024,
      maxFiles: 3
    }),
    new winston.transports.File({
      filename: path.join(process.cwd(), 'error.log'),
      level: 'error',
      maxsize: 5 * 1024 * 1024,
      maxFiles: 3
    })
  );
}

const logger = winston.createLogger({
  level: process.env.NODE_ENV === 'production' ? 'warn' : isTest ? 'error' : 'debug',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.errors({ stack: true }),
    winston.format.printf(({ level, message, timestamp, stack }) =>
      `${timestamp} [${level.toUpperCase()}] ${stack || message}`)
  ),
  transports
});

module.exports = logger;
