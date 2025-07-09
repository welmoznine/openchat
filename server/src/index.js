import express from 'express'
import { createServer } from 'http'
import { Server as SocketServer } from 'socket.io'
import { PrismaClient } from '@prisma/client'

const app = express()
const server = createServer(app)
const io = new SocketServer(server, {
  cors: {
    origin: "http://localhost:5173", // Vite dev server
    methods: ["GET", "POST"]
  }
})

const PORT = process.env.PORT || 3000

// Database connection
const prisma = new PrismaClient()

// Basic Express route
app.get('/', (req, res) => {
  res.json({ message: 'Server is running!' })
})

// Health check endpoint
app.get('/health', async (req, res) => {
  try {
    await prisma.$queryRaw`SELECT NOW()`
    res.json({
      status: 'healthy',
      database: 'connected'
    })
  } catch (error) {
    res.status(500).json({
      status: 'unhealthy',
      error: error.message
    })
  }
})

// Socket.io connection handling
io.on('connection', (socket) => {
  console.log('User connected:', socket.id)
  
  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id)
  })
})

// Start server
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
}) 