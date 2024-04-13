const { spawn } = require('child_process')
const { getServerUsage } = require('./utils')
const { sendMessage } = require('./ws-utils')

function startServer(ws) {
  const childProcess = spawn('bash', ['start.sh'], { cwd: '/home/mcadmin' })

  // Maneja los datos de salida del proceso hijo
  childProcess.stdout.on('data', (data) => {
    console.log(`stdout: ${data}`)
    sendMessage(ws, 'console', 'line', data.toString())
  })

  childProcess.stderr.on('data', (data) => {
    console.error(`stderr: ${data}`)
    sendMessage(ws, 'console', 'error', data.toString())
  })

  // Enviar uso de CPU y RAM cada segundo
  const interval = setInterval(() => {
    const serverUsage = getServerUsage()
    sendMessage(ws, 'serverUsage', 'serverUsage', serverUsage)
  }, 1000)

  // Maneja el cierre del proceso hijo
  childProcess.on('close', (code) => {
    clearInterval(interval)
    console.log(`child process exited with code ${code}`)
  })

  return childProcess
}

module.exports = { startServer }