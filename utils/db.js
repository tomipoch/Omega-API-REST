const pool = require('../database/pgPool');

const withTransaction = async (fn) => {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    const result = await fn(client);
    await client.query('COMMIT');
    return result;
  } catch (err) {
    try {
      await client.query('ROLLBACK');
    } catch (rbErr) {
      // swallow rollback errors
    }
    throw err;
  } finally {
    client.release();
  }
};

module.exports = { withTransaction };
