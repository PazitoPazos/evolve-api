// Función para enviar mensajes al cliente WebSocket
function sendMessage(ws, data) {
  ws.send(JSON.stringify(data))
}

module.exports = { sendMessage }