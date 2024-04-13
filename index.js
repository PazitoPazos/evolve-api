const WebSocket = require('ws')
const os = require('os')
const { spawn } = require('child_process')
const { getCurrentCpuUsage } = require('./utils/getCurrentCpuUsage')

// Crea un servidor WebSocket en el puerto 8080
const wss = new WebSocket.Server({ port: 8080 })

// Maneja las conexiones entrantes
wss.on('connection', (ws) => {
  console.log('Evolve Middleware desconectado')

  let childProcess

  // Maneja los mensajes recibidos
  ws.on('message', (message) => {
    console.log(`Mensaje recibido: ${message}`)
    const msgJson = JSON.parse(message.toString())

    if ('action' in msgJson) {
      switch (msgJson.action) {
        case 'start':
          // Ejecuta el comando "bash start.sh"
          childProcess = spawn('bash', ['start.sh'], { cwd: '/home/mcadmin' })

          childProcess.stdout.on('data', (data) => {
            console.log(`stdout: ${data}`)
            ws.send(
              JSON.stringify({
                stream: 'console',
                type: 'line',
                data: data.toString()
              })
            )
          })

          childProcess.stderr.on('data', (data) => {
            console.error(`stderr: ${data}`)
            ws.send(
              JSON.stringify({
                stream: 'console',
                type: 'error',
                data: data.toString()
              })
            )
          })

          // Enviar uso de CPU y RAM cada segundo
          const interval = setInterval(() => {
            const cpuUsage = getCurrentCpuUsage()
            const totalMem = os.totalmem()
            const freeMem = os.freemem()
            const usedMem = totalMem - freeMem
            const totalMemGB = totalMem / 1024 / 1024 / 1024
            const usedMemGB = usedMem / 1024 / 1024 / 1024

            ws.send(
              JSON.stringify({
                stream: 'serverUsage',
                type: 'serverUsage',
                data: {
                  cpuUsage: cpuUsage,
                  usedMem: usedMemGB,
                  totalMem: totalMemGB
                }
              })
            )
          }, 3000)

          childProcess.on('close', (code) => {
            clearInterval(interval)
            console.log(`child process exited with code ${code}`)
            // ws.send(`child process exited with code ${code}`)
          })

          break
        case 'stop':
          try {
            childProcess.stdin.write('stop\n')
          } catch (error) {
            console.log(error)
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
