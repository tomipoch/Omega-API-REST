const pool = require('../database/pgPool');

const status = async () => {
  const { rows } = await pool.query(
    'SELECT name, applied_at FROM _migrations ORDER BY applied_at ASC'
  );
  return rows;
};

const main = async () => {
  try {
    const { status: runnerStatus } = require('../database/migrations/runner');
    const files = require('fs')
      .readdirSync(require('path').join(__dirname, '..', 'database', 'migrations'))
      .filter((f) => /^\d{4}_.+\.sql$/.test(f))
      .sort();

    const applied = await status();
    const appliedMap = new Map(applied.map((r) => [r.name, r.applied_at]));

    console.log('\nMigrations status:\n');
    console.log('  Status | Name                                  | Applied at');
    console.log('  -------+---------------------------------------+--------------------------');
    for (const file of files) {
      const at = appliedMap.get(file);
      const tag = at ? '[x]' : '[ ]';
      const ts = at ? new Date(at).toISOString() : '-';
      console.log(`  ${tag}    | ${file.padEnd(38)} | ${ts}`);
    }
    console.log('');
    process.exit(0);
  } catch (err) {
    console.error(`Failed: ${err.message}`);
    process.exit(1);
  }
};

if (require.main === module) main();

module.exports = { status };
