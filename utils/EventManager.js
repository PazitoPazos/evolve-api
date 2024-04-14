class EventManager {
  constructor() {
    this.subscriptions = new Map() // Almacena las suscripciones por tipo de evento
    this.eventData = new Map() // Almacena los mensajes de cada tipo de evento
  }

  // Suscribe una función al evento especificado
  subscribe(eventType, callback) {
    // Verificar si el evento está en las suscripciones
    if (!this.subscriptions.has(eventType)) {
      console.error(`El evento '${eventType}' no está registrado`)
      return
    }

    // Obtener el conjunto de callbacks para este tipo de evento
    const eventCallbacks = this.subscriptions.get(eventType)

    // Verificar si el callback ya está suscrito
    if (eventCallbacks.has(callback)) {
      console.warn(`El callback ya está suscrito al evento '${eventType}'`)
      return
    }

    // Agregar la función de callback a las suscripciones
    eventCallbacks.add(callback)

    // Si hay mensajes almacenados para este tipo de evento, se los envía a la nueva suscripción
    if (this.eventData.has(eventType)) {
      const messages = this.eventData.get(eventType)
      for (const message of messages) {
        callback(message)
      }
    }
  }

  // Desuscribe una función del evento especificado
  unsubscribe(eventType, callback) {
    if (this.subscriptions.has(eventType)) {
      const eventCallbacks = this.subscriptions.get(eventType)
      eventCallbacks.delete(callback)
    }
  }

  // Emite un evento con los datos proporcionados
  emit(eventType, eventData) {
    // Verificar si el evento es del tipo "console"
    if (eventType === 'console') {
      // Almacenar los datos del evento
      if (!this.eventData.has(eventType)) {
        this.eventData.set(eventType, [])
      }
      this.eventData.get(eventType).push(eventData)
    }

    // Notificar a todos los suscriptores del evento
    if (this.subscriptions.has(eventType)) {
      for (const callback of this.subscriptions.get(eventType)) {
        callback(eventData)
      }
    }
  }
}

module.exports = EventManager
