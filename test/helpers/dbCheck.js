let dbAvailable = null;

const checkDb = async () => {
  if (dbAvailable !== null) return dbAvailable;
  try {
    const pool = require('../../../database/pgPool');
    await pool.query('SELECT 1');
    dbAvailable = true;
  } catch (err) {
    dbAvailable = false;
  }
  return dbAvailable;
};

const skipIfNoDb = async () => {
  const ok = await checkDb();
  if (!ok) {
    pending('DB no disponible; tests de modelo omitidos.');
  }
};

module.exports = { checkDb, skipIfNoDb };
