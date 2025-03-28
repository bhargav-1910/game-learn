import { io } from 'socket.io-client'

class WebSocketService {
  constructor() {
    this.socket = null
    this.subscribers = new Map()
  }

  // Initialize WebSocket connection
  connect(userId) {
    if (this.socket) return

    this.socket = io(import.meta.env.VITE_WEBSOCKET_URL, {
      auth: { userId },
      transports: ['websocket'],
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      reconnectionAttempts: 5
    })

    this.setupEventListeners()
  }

  // Set up event listeners for WebSocket events
  setupEventListeners() {
    this.socket.on('connect', () => {
      console.log('WebSocket connected')
    })

    this.socket.on('disconnect', () => {
      console.log('WebSocket disconnected')
    })

    this.socket.on('game_update', (data) => {
      this.notifySubscribers('game_update', data)
    })

    this.socket.on('leaderboard_update', (data) => {
      this.notifySubscribers('leaderboard_update', data)
    })

    this.socket.on('challenge_received', (data) => {
      this.notifySubscribers('challenge_received', data)
    })

    this.socket.on('hint_received', (data) => {
      this.notifySubscribers('hint_received', data)
    })

    this.socket.on('achievement_unlocked', (data) => {
      this.notifySubscribers('achievement_unlocked', data)
    })
  }

  // Subscribe to specific WebSocket events
  subscribe(event, callback) {
    if (!this.subscribers.has(event)) {
      this.subscribers.set(event, new Set())
    }
    this.subscribers.get(event).add(callback)

    return () => {
      const eventSubscribers = this.subscribers.get(event)
      if (eventSubscribers) {
        eventSubscribers.delete(callback)
      }
    }
  }

  // Notify subscribers of events
  notifySubscribers(event, data) {
    const eventSubscribers = this.subscribers.get(event)
    if (eventSubscribers) {
      eventSubscribers.forEach(callback => callback(data))
    }
  }

  // Send game actions
  sendGameAction(action, data) {
    if (!this.socket) return
    this.socket.emit('game_action', { action, data })
  }

  // Send challenge to other players
  sendChallenge(targetUserId, challengeData) {
    if (!this.socket) return
    this.socket.emit('send_challenge', { targetUserId, challengeData })
  }

  // Request hints during gameplay
  requestHint(gameId, questionId) {
    if (!this.socket) return
    this.socket.emit('request_hint', { gameId, questionId })
  }

  // Disconnect WebSocket
  disconnect() {
    if (this.socket) {
      this.socket.disconnect()
      this.socket = null
      this.subscribers.clear()
    }
  }
}

const webSocketService = new WebSocketService()
export default webSocketService