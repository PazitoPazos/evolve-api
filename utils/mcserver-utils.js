const { spawn } = require('child_process')
const { getServerUsage } = require('./utils')

function startServer(eventManager) {
  const childProcess = spawn('bash', ['start.sh'], { cwd: '/home/mcadmin' })
  eventManager.eventData = new Map()

  // Maneja los datos de salida del proceso hijo
  childProcess.stdout.on('data', (data) => {
    console.log(`stdout: ${data}`)
    eventManager.emit('console', {
      stream: 'console',
      type: 'line',
      data: data.toString()
    })
  })

  childProcess.stderr.on('data', (data) => {
    console.error(`stderr: ${data}`)
    eventManager.emit('console', {
      stream: 'console',
      type: 'error',
      data: data.toString()
    })
  })

  // Enviar uso de CPU y RAM cada segundo
  const interval = setInterval(() => {
    const serverUsage = getServerUsage()
    eventManager.emit('heap', {
      stream: 'heap',
      type: 'heap',
      data: serverUsage
    })
  }, 1000)

  // Maneja el cierre del proceso hijo
  childProcess.on('close', (code) => {
    eventManager.eventData = new Map()
    clearInterval(interval)
    console.log(`child process exited with code ${code}`)
  })

  return childProcess
}

module.exports = { startServer }
