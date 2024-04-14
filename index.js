const WebSocket = require('ws')
const EventManager = require('./utils/EventManager')
const { startServer } = require('./utils/mcserver-utils')
const { sendMessage } = require('./utils/ws-utils')
const fs = require('fs')

// Crea un servidor WebSocket en el puerto 8080
const wss = new WebSocket.Server({ port: 8080 })

// Crear una instancia de EventManager
const eventManager = new EventManager()

// Añadir el evento "console" al mapa de suscripciones
eventManager.subscriptions.set('console', new Set())
eventManager.subscriptions.set('heap', new Set())

let childProcess

// Maneja las conexiones entrantes
wss.on('connection', (ws) => {
  console.log('Evolve Middleware conectado')

  // Callback para enviar mensaje
  const callbackSendMessage = (message) => {
    sendMessage(ws, message)
  }

  // TODO: Hacer un enum con los diferentes mensajes que pueda haber
  // Maneja los mensajes recibidos
  ws.on('message', (message) => {
    console.log(`Mensaje recibido: ${message}`)
    const msgJson = JSON.parse(message.toString())

    if (!('action' in msgJson)) {
      console.log('No se reconoce ese comando')
      return
    }

    switch (msgJson.action) {
      case 'start':
        if (childProcess) {
          console.log('El servidor ya está en ejecución')
          return
        }

        childProcess = startServer(eventManager)
        sendMessage(ws, {
          stream: 'console',
          type: 'started',
          data: {}
        })

        break
      case 'stop':
        if (!childProcess) {
          console.log('No hay ningún servidor en ejecución')
          return
        }

        childProcess.stdin.write('stop\n')
        sendMessage(ws, {
          stream: 'console',
          type: 'stopped',
          data: {}
        })

        childProcess = null

        break
      case 'subscribe':
        if (!('type' in msgJson)) {
          console.log('Debe indicar el tipo de evento')
          return
        }

        switch (msgJson.type) {
          case 'console':
            // Suscribir una función al evento "console"
            eventManager.subscribe(msgJson.type, callbackSendMessage)
            break

          case 'heap':
            // Suscribir una función al evento "server"
            eventManager.subscribe(msgJson.type, callbackSendMessage)
            break

          default:
            break
        }

        break
      case 'unsubscribe':
        if (!('type' in msgJson)) {
          console.log('Debe indicar el tipo de evento')
          return
        }

        switch (msgJson.type) {
          case 'console':
            // Desuscribir una función del evento "console"
            eventManager.unsubscribe(msgJson.type, callbackSendMessage)
            break

          case 'heap':
            // Desuscribir una función del evento "server"
            eventManager.unsubscribe(msgJson.type, callbackSendMessage)
            break

          default:
            break
        }

        break
      case 'log':
        // Ruta al archivo que deseas vigilar
        const filePath = '/mcserver/logs/latest.log'

        fs.readFile(filePath, 'utf8', (err, data) => {
          if (err) {
            console.error(err)
            return
          }

          sendMessage(ws, {
            stream: 'log',
            type: 'log',
            data: data
          })
        })
        break
      default:
        console.log(`Acción no reconocida`)
        break
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
