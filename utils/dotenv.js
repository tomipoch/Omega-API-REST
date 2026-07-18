const fs = require('fs');

const stripQuotes = (value) => {
  if (value.length >= 2) {
    const first = value[0];
    const last = value[value.length - 1];
    if ((first === '"' && last === '"') || (first === "'" && last === "'")) {
      return value.slice(1, -1);
    }
  }
  return value;
};

const loadEnvFile = (path = '.env') => {
  let content;
  try {
    content = fs.readFileSync(path, 'utf8');
  } catch (err) {
    if (err.code === 'ENOENT') return;
    throw err;
  }

  for (const rawLine of content.split('\n')) {
    const line = rawLine.trim();
    if (!line || line.startsWith('#')) continue;
    const eq = line.indexOf('=');
    if (eq < 0) continue;
    const key = line.slice(0, eq).trim();
    if (!key) continue;
    const value = stripQuotes(line.slice(eq + 1).trim());
    if (!(key in process.env)) {
      process.env[key] = value;
    }
  }
};

module.exports = { loadEnvFile };