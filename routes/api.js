const express = require('express');
const router = express.Router();

router.get('/status', (req, res) => {
  res.json({ status: 'OK', message: 'API funcionando' });
});

router.post('/data', (req, res) => {
  console.log('Datos recibidos:', req.body);
  res.json({ success: true });
});

module.exports = router;
