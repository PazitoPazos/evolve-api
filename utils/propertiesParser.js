const fs = require('fs');
const path = require('path');

function parsePropertiesFile(filePath) {
  const properties = {};

  try {
    const content = fs.readFileSync(filePath, 'utf8');
    const lines = content.split('\n');

    for (let line of lines) {
      line = line.trim();
      if (line === '' || line.startsWith('#')) continue;

      const [key, ...rest] = line.split('=');
      const value = rest.join('=').trim();
      properties[key.trim()] = value;
    }
  } catch (err) {
    console.error(`Error leyendo ${filePath}:`, err);
    return null;
  }

  return properties;
}

module.exports = { parsePropertiesFile };
