const express = require('express');
const http = require('http');
const cors = require('cors');
const WebSocket = require('ws')
const apiRoutes = require('./routes/api');
const EventManager = require('./utils/EventManager')
const handleWSConnection = require('./ws/handler');

const app = express();

// CORS
app.use(cors({
  origin: 'http://localhost:3000'
}));

// Rutas API
app.use('/api', apiRoutes);

// Crea un servidor HTTP
const server = http.createServer(app);

// Crea un servidor WebSocket en el puerto 8080
const wss = new WebSocket.Server({ port: 8080 })

// Crear una instancia de EventManager
const eventManager = new EventManager()

// Añadir el evento "console" al mapa de suscripciones
eventManager.subscriptions.set('console', new Set())
eventManager.subscriptions.set('heap', new Set())

wss.on('connection', (ws) => handleWSConnection(ws, eventManager));

const PORT = 5000;
server.listen(PORT, () => {
  console.log(`Servidor REST + WebSocket escuchando en http://localhost:${PORT}`);
});