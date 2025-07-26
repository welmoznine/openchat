import { createServer } from 'http'
import { Server as SocketServer } from 'socket.io'
import { createApp, handleSocketConnection } from './app.js'
const app = createApp()
const server = createServer(app)
const io = new SocketServer(server, {
  cors: {
    origin: process.env.PUBLIC_URL || 'http://localhost:5173', // Frontend URL
    methods: ['GET', 'POST']
  }
})

const PORT = process.env.PORT || 3000

// Socket.io connection handling
io.on('connection', (socket) => handleSocketConnection(socket, io))

// Start server
server.listen(PORT, () => {
  console.log(`HTTP server listening on port ${PORT}`)
})
