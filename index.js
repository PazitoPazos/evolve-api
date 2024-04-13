const WebSocket = require('ws')
const { startServer } = require('./utils/mcserver-utils')

// Crea un servidor WebSocket en el puerto 8080
const wss = new WebSocket.Server({ port: 8080 })

// Maneja las conexiones entrantes
wss.on('connection', (ws) => {
  console.log('Evolve Middleware conectado')

  let childProcess

  // Maneja los mensajes recibidos
  ws.on('message', (message) => {
    console.log(`Mensaje recibido: ${message}`)
    const msgJson = JSON.parse(message.toString())

    if ('action' in msgJson) {
      switch (msgJson.action) {
        case 'start':
          if (!childProcess) {
            childProcess = startServer(ws)
          } else {
            console.log('El servidor ya está en ejecución')
          }

          break
        case 'stop':
          if (childProcess) {
            childProcess.stdin.write('stop\n')
          } else {
            console.log('No hay ningún servidor en ejecución')
          }
          break
        default:
          console.log(`Acción no reconocida: ${msgJson.action}`)
          break
      }
    }
  })

  // Maneja los errores
  ws.on('error', (error) => {
    console.error('Error en la conexión:', error)
  })

  // Maneja la desconexión del cliente
  ws.on('close', () => {
    console.log('Evolve Middleware desconectado')
  })
})
