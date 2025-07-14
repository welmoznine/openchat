import { createServer } from 'http'
import { Server as SocketServer } from 'socket.io'
import { createApp, handleSocketConnection } from './app.js'
import {sub, pub} from './redis.js'
const app = createApp()
const server = createServer(app)
const io = new SocketServer(server, {
  cors: {
    origin: "http://localhost:5173", // Vite dev server
    methods: ["GET", "POST"]
  }
})

const PORT = process.env.PORT || 3000

// Socket.io connection handling
io.on('connection', handleSocketConnection)

// Start server
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
}) 