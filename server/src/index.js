import { createServer } from 'http'
import { Server as SocketServer } from 'socket.io'
import { createAdapter } from '@socket.io/redis-adapter'
import { createApp, handleSocketConnection } from './app.js'
import { setIO } from './socket-handlers/socket.js'
import { createRedisPubSubClients } from './utils/redis.js'

const { app, prisma } = createApp()

const server = createServer(app)
const io = new SocketServer(server, {
  cors: {
    origin: process.env.PUBLIC_URL || 'http://localhost:5173',
    methods: ['GET', 'POST'],
    credentials: true
  }
})

const PORT = process.env.PORT || 3000

const setupRedisAdapter = () => {
  try {
    const { pubClient, subClient, redis } = createRedisPubSubClients()
    
    if (pubClient && subClient) {
      io.adapter(createAdapter(pubClient, subClient))
      console.log('Socket.io Redis adapter enabled')
    } else {
      console.warn('Socket.io running without Redis adapter (single instance mode)')
    }

    if (redis) {
      global.redis = redis
      console.log('Redis client available for presence management')
    }
  } catch (error) {
    console.error('Failed to setup Redis adapter:', error)
    console.warn('Socket.io running without Redis adapter (single instance mode)')
  }
}

setupRedisAdapter()
setIO(io)

io.on('connection', (socket) => handleSocketConnection(socket, io, prisma))

// Start server
server.listen(PORT, () => {
  console.log(`HTTP server listening on port ${PORT}`)
})
