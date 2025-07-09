import express from 'express'
import { createServer } from 'http'
import { Server as SocketServer } from 'socket.io'

const app = express()
const server = createServer(app)
const io = new SocketServer(server, {
  cors: {
    origin: "http://localhost:5173", // Vite dev server
    methods: ["GET", "POST"]
  }
})

const PORT = process.env.PORT || 3000

// Basic Express route
app.get('/', (req, res) => {
  res.json({ message: 'Server is running!' })
})

// Socket.io connection handling
io.on('connection', (socket) => {
  console.log('User connected:', socket.id)
  
  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id)
  })
})

server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
}) 