const os = require('os')

function getCurrentCpuUsage() {
  // Obtiene los tiempos de CPU para el sistema completo
  const cpuTimes = os.cpus()

  // Suma los tiempos de CPU de todos los núcleos
  const totalCpuUsage = cpuTimes.reduce(
    (acc, cpu) => {
      const total =
        cpu.times.user +
        cpu.times.nice +
        cpu.times.sys +
        cpu.times.idle +
        cpu.times.irq
      const idle = cpu.times.idle
      acc.total += total
      acc.idle += idle
      return acc
    },
    { total: 0, idle: 0 }
  )

  // Calcula el uso de la CPU
  const cpuUsage = 1 - totalCpuUsage.idle / totalCpuUsage.total

  // Devuelve el uso de la CPU como un porcentaje
  return cpuUsage * 100
}

function getServerUsage() {
  const cpuUsage = getCurrentCpuUsage()
  const totalMem = os.totalmem()
  const freeMem = os.freemem()
  const usedMem = totalMem - freeMem
  const totalMemGB = totalMem / 1024 / 1024 / 1024
  const usedMemGB = usedMem / 1024 / 1024 / 1024

  return {
    cpuUsage,
    usedMem: usedMemGB,
    totalMem: totalMemGB
  }
}

module.exports = { getCurrentCpuUsage, getServerUsage }

