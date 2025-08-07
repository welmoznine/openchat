import { createServer } from 'http'
import { Server as SocketServer } from 'socket.io'
import { createApp, handleSocketConnection } from './app.js'
import { setIO } from './socket-handlers/socket.js'

// Destructure app and prisma from createApp
const { app, prisma } = createApp()

// Set up Socket.io server with CORS
const server = createServer(app)
const io = new SocketServer(server, {
  cors: {
    origin: process.env.PUBLIC_URL || 'http://localhost:5173',
    methods: ['GET', 'POST'],
    credentials: true
  }
})

const PORT = process.env.PORT || 3000

setIO(io)

// Pass 'io' and 'prisma' to the handler
io.on('connection', (socket) => handleSocketConnection(socket, io, prisma))

// Start server
server.listen(PORT, () => {
})
