process.env.NODE_ENV = 'test';

jest.mock('../utils/reservaScheduler', () => ({
  iniciar: jest.fn(),
  detener: jest.fn(),
  generarEstadisticas: jest.fn().mockResolvedValue({})
}));

const pool = require('../database/pgPool');

let dbAvailable = null;
const checkDb = async () => {
  if (dbAvailable !== null) return dbAvailable;
  try {
    await pool.query('SELECT 1');
    dbAvailable = true;
  } catch (err) {
    dbAvailable = false;
  }
  return dbAvailable;
};

global.checkDb = checkDb;
global.testPool = pool;
