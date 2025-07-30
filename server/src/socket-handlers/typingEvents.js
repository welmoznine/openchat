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

    // Use the channel from data or fallback to user's current channel
    const channel = data?.channel || user.currentChannel

    // Validate channel
    if (!channel) {
      throw new Error('No channel specified for typing event')
    }

    // Update user's typing status (optional - for tracking)
    user.isTyping = true
    user.typingInChannel = channel
    user.typingStartedAt = new Date().toISOString()

    // Notify other users in the same channel that this user is typing
    socket.to(channel).emit('user_typing', {
      username: user.username,
      userId: user.userId,
      channel,
      isTyping: true,
      timestamp: user.typingStartedAt,
    })

    console.log(`${user.username} is typing`)
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

    // Double-check if the user exists (should be caught by validation in main handler)
    if (!user) {
      throw new Error('User not found in connected users')
    }

    // Use the channel from data or fallback to user's current channel
    const channel = data?.channel || user.currentChannel

    // Validate channel
    if (!channel) {
      throw new Error('No channel specified for typing event')
    }

    // Update user's typing status (optional - for tracking)
    user.isTyping = false
    user.typingInChannel = null
    user.typingStoppedAt = new Date().toISOString()

    // Notify other users in the same channel that this user stopped typing
    socket.to(channel).emit('user_typing', {
      username: user.username,
      userId: user.userId,
      channel,
      isTyping: false,
      timestamp: user.typingStoppedAt,
    })

    console.log(`${user.username} stopped typing`)
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
    if (user && user.isTyping && user.typingInChannel) {
      // Notify others that user stopped typing due to disconnect/channel change
      socket.to(user.typingInChannel).emit('user_typing', {
        username: user.username,
        userId: user.userId,
        channel: user.typingInChannel,
        isTyping: false,
        timestamp: new Date().toISOString(),
        reason: 'user_disconnected',
      })

      // Update user status
      user.isTyping = false
      user.typingInChannel = null

      console.log(`Cleaned up typing status for ${user.username}`)
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
