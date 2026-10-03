import { io } from 'socket.io-client'

// In dev, Vite proxy forwards /api → localhost:5001.
// Socket.io connects to same origin (Vite dev server) which proxy forwards correctly.
// In production the backend serves the static build, so same origin works too.
let socket = null

export function connectSocket(userId) {
  if (socket && socket.connected) return socket

  socket = io('/', {
    withCredentials: true,
    query: { userId },
  })

  socket.on('connect', () => console.log('Socket connected:', socket.id))
  socket.on('disconnect', () => console.log('Socket disconnected'))

  return socket
}

export function disconnectSocket() {
  if (socket) {
    socket.disconnect()
    socket = null
  }
}

export function getSocket() {
  return socket
}
