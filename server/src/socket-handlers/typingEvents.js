/**
 * Handle typing indicator events when a user starts typing
 */
const handleTypingStart = (socket, data, connectedUsers) => {
  try {
    // Get the user associated with this socket
    const user = connectedUsers.get(socket.id)

    // Double-check if the user exists (should be caught by validation in main handler)
    if (!user) {
      throw new Error('User not found in connected users')
    }

    const { messageType, targetId } = data

    if (!targetId || !messageType) {
      throw new Error('Target ID and message type are required for typing event')
    }

    // Update user's typing status
    user.isTyping = true
    user.typingStartedAt = new Date().toISOString()

    if (messageType === 'channel') {
      const channelId = targetId
      user.typingInChannel = channelId
      // Emit to channel with the structure the client expects
      socket.to(channelId).emit('user_typing', {
        username: user.username,
        userId: user.userId,
        channel: channelId, // Client expects 'channel' property
        isTyping: true,
        timestamp: user.typingStartedAt,
      })
    } else if (messageType === 'direct_message') {
      const otherUserId = targetId
      const dmRoom = [user.userId, otherUserId].sort().join('-')
      user.typingInDM = otherUserId
      // Make sure user is in the DM room
      socket.join(dmRoom)
      // Emit to DM room with consistent structure
      socket.to(dmRoom).emit('user_typing', {
        username: user.username,
        userId: user.userId,
        messageType: 'direct_message',
        targetId: otherUserId,
        dmRoom,
        isTyping: true,
        timestamp: user.typingStartedAt,
      })
    } else {
      throw new Error(`Unsupported message type for typing event: ${messageType}`)
    }
  } catch (error) {
    console.error(`Error in handleTypingStart for socket ${socket.id}:`, error)

    // Emit error to the client
    socket.emit('typing_error', {
      message: 'Failed to broadcast typing status',
      event: 'typing_start',
      error: error.message,
      timestamp: new Date().toISOString(),
    })

    throw error
  }
}

/**
 * Handle typing indicator events when a user stops typing
 */
const handleTypingStop = (socket, data, connectedUsers) => {
  try {
    // Get the user associated with this socket
    const user = connectedUsers.get(socket.id)

    // Double-check if the user exists
    if (!user) {
      throw new Error('User not found in connected users')
    }

    const { messageType, targetId } = data

    if (!targetId || !messageType) {
      throw new Error('Target ID and message type are required for typing event')
    }

    // Update user's typing status
    user.isTyping = false
    user.typingStoppedAt = new Date().toISOString()

    if (messageType === 'channel') {
      const channelId = targetId
      user.typingInChannel = null
      // Emit to channel with the structure the client expects
      socket.to(channelId).emit('user_typing', {
        username: user.username,
        userId: user.userId,
        channel: channelId, // Client expects 'channel' property
        isTyping: false,
        timestamp: user.typingStoppedAt,
      })
    } else if (messageType === 'direct_message') {
      const otherUserId = targetId
      const dmRoom = [user.userId, otherUserId].sort().join('-')
      user.typingInDM = null
      // Emit to DM room
      socket.to(dmRoom).emit('user_typing', {
        username: user.username,
        userId: user.userId,
        messageType: 'direct_message',
        targetId: otherUserId,
        dmRoom,
        isTyping: false,
        timestamp: user.typingStoppedAt,
      })
    } else {
      throw new Error(`Unsupported message type for typing event: ${messageType}`)
    }
  } catch (error) {
    console.error(`Error in handleTypingStop for socket ${socket.id}:`, error)

    // Emit error to the client
    socket.emit('typing_error', {
      message: 'Failed to broadcast typing status',
      event: 'typing_stop',
      error: error.message,
      timestamp: new Date().toISOString(),
    })

    throw error
  }
}

/**
 * Utility function to clean up typing status when user disconnects or changes channels
 */
const cleanupTypingStatus = (socket, user, connectedUsers) => {
  try {
    if (user && user.isTyping) {
      const timestamp = new Date().toISOString()

      // Clean up channel typing
      if (user.typingInChannel) {
        socket.to(user.typingInChannel).emit('user_typing', {
          username: user.username,
          userId: user.userId,
          channel: user.typingInChannel,
          isTyping: false,
          timestamp,
          reason: 'user_disconnected',
        })

        user.typingInChannel = null
      }

      // Clean up DM typing
      if (user.typingInDM) {
        const dmRoom = [user.userId, user.typingInDM].sort().join('-')

        socket.to(dmRoom).emit('user_typing', {
          username: user.username,
          userId: user.userId,
          messageType: 'direct_message',
          targetId: user.typingInDM,
          dmRoom,
          isTyping: false,
          timestamp,
          reason: 'user_disconnected',
        })

        user.typingInDM = null
      }

      // Reset typing state
      user.isTyping = false
    }
  } catch (error) {
    console.error('Error cleaning up typing status:', error)
  }
}

export const handleTypingEvents = {
  handleTypingStart,
  handleTypingStop,
  cleanupTypingStatus,
}
