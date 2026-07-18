const fs = require('fs');
const path = require('path');
const pool = require('../../database/pgPool');
const logger = require('../../utils/logger');

const MIGRATIONS_DIR = path.join(__dirname);

const ensureMigrationsTable = async (client) => {
  await client.query(`
    CREATE TABLE IF NOT EXISTS _migrations (
      id SERIAL PRIMARY KEY,
      name TEXT NOT NULL UNIQUE,
      applied_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );
  `);
};

const listMigrationFiles = () => {
  if (!fs.existsSync(MIGRATIONS_DIR)) return [];
  return fs
    .readdirSync(MIGRATIONS_DIR)
    .filter((f) => /^\d{4}_.+\.sql$/.test(f))
    .sort();
};

const readMigration = (file) => fs.readFileSync(path.join(MIGRATIONS_DIR, file), 'utf8');

const up = async () => {
  const client = await pool.connect();
  try {
    await ensureMigrationsTable(client);

    const { rows: applied } = await client.query('SELECT name FROM _migrations');
    const appliedSet = new Set(applied.map((r) => r.name));

    const files = listMigrationFiles();
    let count = 0;

    for (const file of files) {
      if (appliedSet.has(file)) continue;
      const sql = readMigration(file);
      logger.info(`Applying migration: ${file}`);
      try {
        await client.query('BEGIN');
        await client.query(sql);
        await client.query('INSERT INTO _migrations (name) VALUES ($1)', [file]);
        await client.query('COMMIT');
        count++;
      } catch (err) {
        await client.query('ROLLBACK');
        logger.error(`Migration ${file} failed: ${err.stack || err.message}`);
        throw err;
      }
    }

    logger.info(`${count} migration(s) applied.`);
    return count;
  } finally {
    client.release();
  }
};

const status = async () => {
  const client = await pool.connect();
  try {
    await ensureMigrationsTable(client);
    const { rows: applied } = await client.query('SELECT name, applied_at FROM _migrations');
    const appliedMap = new Map(applied.map((r) => [r.name, r.applied_at]));
    const files = listMigrationFiles();

    const result = files.map((file) => ({
      name: file,
      applied: appliedMap.has(file),
      applied_at: appliedMap.get(file) || null
    }));

    return result;
  } finally {
    client.release();
  }
};

const down = async () => {
  const client = await pool.connect();
  try {
    await ensureMigrationsTable(client);
    const { rows } = await client.query(
      'SELECT name FROM _migrations ORDER BY applied_at DESC LIMIT 1'
    );
    if (!rows.length) {
      logger.info('No migrations to rollback.');
      return;
    }
    const last = rows[0].name;
    logger.warn(
      `Automatic rollback not supported. Manually reverse the SQL of ${last} and remove the record.`
    );
    throw new Error(
      'Down migrations are not automated. Please reverse the SQL manually and DELETE FROM _migrations WHERE name = $1;'
    );
  } finally {
    client.release();
  }
};

const main = async () => {
  const cmd = process.argv[2] || 'up';
  try {
    if (cmd === 'up') {
      await up();
    } else if (cmd === 'status') {
      const rows = await status();
      console.table(rows);
    } else if (cmd === 'down') {
      await down();
    } else {
      console.error(`Unknown command: ${cmd}. Use: up | status | down`);
      process.exit(1);
    }
    await pool.end();
    process.exit(0);
  } catch (err) {
    logger.error(err.stack || err.message);
    await pool.end().catch(() => {});
    process.exit(1);
  }
};

if (require.main === module) {
  main();
}

module.exports = { up, down, status };
