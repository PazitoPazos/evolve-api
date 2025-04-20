const express = require('express');
const { parsePropertiesFile } = require('../utils/propertiesParser');
const router = express.Router();

router.get('/status', (req, res) => {
  res.json({ status: 'OK', message: 'API funcionando' });
});

router.get('/config', (req, res) => {
  const filePath = '/srv/minecraft/server.properties';
  const config = parsePropertiesFile(filePath);

  if (!config) {
    return res.status(500).json({ error: 'No se pudo leer el archivo de configuración' });
  }

  res.json(config);
});

module.exports = router;
