import express from 'express'
import { PrismaClient } from '@prisma/client'
import authRoutes from './routes/auth.js'
import userRoutes from './routes/user.js'
import cors from 'cors'
import { handleUserJoin } from './socket-handlers/userJoin.js'
import { handleJoinChannel } from './socket-handlers/joinChannel.js'
import { handleSendMessage } from './socket-handlers/sendMessage.js'
import { handleDeleteMessage } from './socket-handlers/deleteMessage.js'
import { handleTypingEvents } from './socket-handlers/typingEvents.js'
import { handleDisconnect } from './socket-handlers/disconnect.js'
import {
  validateUserData,
  validateMessageData,
  validateChannelData,
  validateDeleteData,
  emitError,
  logSocketEvent,
  validateSocketConnection,
} from './socket-handlers/socketUtils.js'

// Create Express app factory
export const createApp = () => {
  const app = express()
  const prisma = new PrismaClient()

  app.use(
    cors({
      origin: process.env.PUBLIC_URL || 'http://localhost:5173',
      credentials: true,
    })
  )

  app.use(express.json())
  app.use('/api/auth', authRoutes)
  app.use('/api/user', userRoutes)

  // Basic Express route
  app.get('/', (req, res) => {
    res.json({ message: 'Server is running!' })
  })

  // Health check endpoint
  app.get('/health', async (req, res) => {
    try {
      await prisma.$queryRaw`SELECT NOW()`
      res.json({ status: 'healthy', database: 'connected' })
    } catch (error) {
      res.status(500).json({ status: 'unhealthy', error: error.message })
    }
  })

  // Return both app and prisma
  return { app, prisma }
}

const connectedUsers = new Map() // Store connected users by socket.id for quick lookup
const usersByUserId = new Map() // Map userId to socket.id to enforce one active connection per user

// Utility function to get unique users list
export const getUniqueUsers = () => {
  return Array.from(usersByUserId.keys())
    .map((userId) => {
      const socketId = usersByUserId.get(userId)
      return connectedUsers.get(socketId)
    })
    .filter(Boolean) // Filter out null/undefined
}

// Socket.io connection handler with enhanced error handling
export const handleSocketConnection = (socket) => {
  logSocketEvent('connection_established', socket.id)

  // Wrap each event handler with error handling
  const withErrorHandling = (eventName, handler) => {
    return async (...args) => {
      try {
        await handler(...args)
      } catch (error) {
        emitError(socket, eventName, error)
        logSocketEvent(`error_in_${eventName}`, socket.id, null, { error: error.message })
      }
    }
  }

  // ---------- Handle user joining ----------
  socket.on('user_join', withErrorHandling('user_join', (userData) => {
    // Validate required userData
    const validation = validateUserData(userData)
    if (!validation.isValid) {
      throw new Error(`Invalid user data: ${validation.errors.join(', ')}`)
    }

    handleUserJoin(
      socket,
      userData,
      connectedUsers,
      usersByUserId,
      getUniqueUsers
    )
  }))

  // ---------- Handle channel switching ----------
  socket.on('join_channel', withErrorHandling('join_channel', (channelData) => {
    // Validate channel data
    const validation = validateChannelData(channelData)
    if (!validation.isValid) {
      throw new Error(`Invalid channel data: ${validation.errors.join(', ')}`)
    }

    // Check if user exists in connected users
    const connectionValidation = validateSocketConnection(socket, connectedUsers)
    if (!connectionValidation.isValid) {
      throw new Error(connectionValidation.error)
    }

    handleJoinChannel(socket, channelData, connectedUsers)
  }))

  // ---------- Handle sending messages ----------
  socket.on('send_message', withErrorHandling('send_message', (messageData) => {
    // Validate message data
    const validation = validateMessageData(messageData)
    if (!validation.isValid) {
      throw new Error(`Invalid message data: ${validation.errors.join(', ')}`)
    }

    // Check if user exists in connected users
    const connectionValidation = validateSocketConnection(socket, connectedUsers)
    if (!connectionValidation.isValid) {
      throw new Error(connectionValidation.error)
    }

    handleSendMessage(socket, messageData, connectedUsers)
  }))

  // ---------- Handle message deletion ----------
  socket.on('delete_message', withErrorHandling('delete_message', (deleteData) => {
    const validation = validateDeleteData(deleteData)
    if (!validation.isValid) {
      throw new Error(`Invalid delete data: ${validation.errors.join(', ')}`)
    }

    const connectionValidation = validateSocketConnection(socket, connectedUsers)
    if (!connectionValidation.isValid) {
      throw new Error(connectionValidation.error)
    }

    handleDeleteMessage(socket, deleteData, connectedUsers)
  }))

  // ---------- Handle typing events ----------
  socket.on('typing_start', withErrorHandling('typing_start', (data) => {
    // Check if user exists in connected users
    const connectionValidation = validateSocketConnection(socket, connectedUsers)
    if (!connectionValidation.isValid) {
      throw new Error(connectionValidation.error)
    }

    handleTypingEvents.handleTypingStart(socket, data, connectedUsers)
  }))

  socket.on('typing_stop', withErrorHandling('typing_stop', (data) => {
    // Check if user exists in connected users
    const connectionValidation = validateSocketConnection(socket, connectedUsers)
    if (!connectionValidation.isValid) {
      throw new Error(connectionValidation.error)
    }

    handleTypingEvents.handleTypingStop(socket, data, connectedUsers)
  }))

  // ---------- Handle user disconnecting ----------
  socket.on('disconnect', withErrorHandling('disconnect', (reason) => {
    logSocketEvent('disconnect', socket.id, null, { reason })

    handleDisconnect(
      socket,
      connectedUsers,
      usersByUserId,
      getUniqueUsers
    )
  }))

  // ---------- Handle connection errors ----------
  socket.on('connect_error', (error) => {
    logSocketEvent('connect_error', socket.id, null, { error: error.message })
    emitError(socket, 'connection', error)
  })

  // ---------- Handle socket errors ----------
  socket.on('error', (error) => {
    logSocketEvent('socket_error', socket.id, null, { error: error.message })
    emitError(socket, 'socket', error)
  })

  // Send initial connection success message
  socket.emit('connection_established', {
    socketId: socket.id,
    timestamp: new Date().toISOString(),
    message: 'Successfully connected to the server'
  })
  socket.on('status_update', (newStatus) => {
    const user = connectedUsers.get(socket.id)
    if (user) {
      user.status = newStatus // update status

      // Broadcast updated user list to all clients
      const uniqueUsers = Array.from(usersByUserId.keys()).map(userId => {
        const socketId = usersByUserId.get(userId)
        return connectedUsers.get(socketId)
      }).filter(Boolean)

      console.log('Broadcasting updated users_list:', uniqueUsers)

      socket.broadcast.emit('users_list', uniqueUsers)
      socket.emit('users_list', uniqueUsers) // also send updated list back to sender
    }
  })
}
