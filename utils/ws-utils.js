// Función para enviar mensajes al cliente WebSocket
function sendMessage(ws, stream, type, data) {
  ws.send(JSON.stringify({ stream, type, data }))
}

module.exports = { sendMessage }