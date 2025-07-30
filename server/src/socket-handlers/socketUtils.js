/**
 * Validates user data for joining operations
 * @param {Object} userData - User data to validate
 * @returns {Object} Validation result with isValid boolean and errors array
 */
export const validateUserData = (userData) => {
  const errors = []

  if (!userData) {
    errors.push('User data is required')
    return { isValid: false, errors }
  }

  if (!userData.userId) {
    errors.push('User ID is required')
  }

  if (!userData.username || userData.username.trim().length === 0) {
    errors.push('Username is required and cannot be empty')
  }

  if (!userData.channel || userData.channel.trim().length === 0) {
    errors.push('Channel is required and cannot be empty')
  }

  // Additional validation rules
  if (userData.username && userData.username.length > 50) {
    errors.push('Username cannot exceed 50 characters')
  }

  if (userData.channel && userData.channel.length > 100) {
    errors.push('Channel name cannot exceed 100 characters')
  }

  return {
    isValid: errors.length === 0,
    errors
  }
}

/**
 * Validates message data
 * @param {Object} messageData - Message data to validate
 * @returns {Object} Validation result with isValid boolean and errors array
 */
export const validateMessageData = (messageData) => {
  const errors = []

  if (!messageData) {
    errors.push('Message data is required')
    return { isValid: false, errors }
  }

  if (!messageData.text || messageData.text.trim().length === 0) {
    errors.push('Message text is required and cannot be empty')
  }

  const MAX_MESSAGE_LENGTH = 2000
  if (messageData.text && messageData.text.length > MAX_MESSAGE_LENGTH) {
    errors.push(`Message cannot exceed ${MAX_MESSAGE_LENGTH} characters`)
  }

  return {
    isValid: errors.length === 0,
    errors
  }
}

/**
 * Validates channel data
 * @param {Object} channelData - Channel data to validate
 * @returns {Object} Validation result with isValid boolean and errors array
 */
export const validateChannelData = (channelData) => {
  const errors = []

  if (!channelData) {
    errors.push('Channel data is required')
    return { isValid: false, errors }
  }

  if (!channelData.channel || channelData.channel.trim().length === 0) {
    errors.push('Channel name is required and cannot be empty')
  }

  if (channelData.channel && channelData.channel.length > 100) {
    errors.push('Channel name cannot exceed 100 characters')
  }

  return {
    isValid: errors.length === 0,
    errors
  }
}

/**
 * Emits a standardized error message to a socket
 * @param {Object} socket - Socket.io socket instance
 * @param {string} eventType - Type of event that caused the error
 * @param {Error|string} error - Error object or message
 * @param {Object} additionalData - Additional data to include in error
 */
export const emitError = (socket, eventType, error, additionalData = {}) => {
  const errorMessage = error?.message || error || 'An unexpected error occurred'

  console.error(`Error in ${eventType}:`, error)

  socket.emit('error', {
    type: eventType,
    message: errorMessage,
    timestamp: new Date().toISOString(),
    ...additionalData
  })
}

/**
 * Emits a standardized success message to a socket
 * @param {Object} socket - Socket.io socket instance
 * @param {string} eventType - Type of event that succeeded
 * @param {string} message - Success message
 * @param {Object} additionalData - Additional data to include
 */
export const emitSuccess = (socket, eventType, message, additionalData = {}) => {
  socket.emit(`${eventType}_success`, {
    message,
    timestamp: new Date().toISOString(),
    ...additionalData
  })
}

/**
 * Generates a unique message ID
 * @returns {string} Unique message ID
 */
export const generateMessageId = () => {
  return `msg_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`
}

/**
 * Formats a message for display with proper sanitization
 * @param {Object} messageData - Raw message data
 * @param {Object} user - User object
 * @returns {Object} Formatted message object
 */
export const formatMessage = (messageData, user) => {
  return {
    id: generateMessageId(),
    text: messageData.text,
    username: user.username,
    userId: user.userId,
    channel: messageData.channel || user.currentChannel,
    timestamp: new Date().toISOString(),
    messageType: messageData.messageType || 'text',
    edited: false,
    reactions: {},
  }
}

/**
 * Logs socket events with consistent formatting
 * @param {string} event - Event name
 * @param {string} socketId - Socket ID
 */
export const logSocketEvent = (event, socketId) => {
  const timestamp = new Date().toISOString()
  console.log(`[${timestamp}] ${event} (Socket ID: ${socketId})`)
}

/**
 * Creates a typing timeout handler to automatically stop typing indicators
 * @param {Object} socket - Socket.io socket instance
 * @param {Object} user - User object
 * @param {string} channel - Channel name
 * @param {number} timeout - Timeout in milliseconds (default: 5000ms)
 * @returns {number} Timeout ID
 */
export const createTypingTimeout = (socket, user, channel, timeout = 5000) => {
  return setTimeout(() => {
    if (user.isTyping && user.typingInChannel === channel) {
      // Auto-stop typing if user hasn't sent stop event
      socket.to(channel).emit('user_typing', {
        username: user.username,
        userId: user.userId,
        channel,
        isTyping: false,
        timestamp: new Date().toISOString(),
        reason: 'timeout',
      })

      user.isTyping = false
      user.typingInChannel = null

      console.log(`Auto-stopped typing for ${user.username} in #${channel} due to timeout`)
    }
  }, timeout)
}

/**
 * Validates socket connection and user state
 * @param {Object} socket - Socket.io socket instance
 * @param {Map} connectedUsers - Connected users map
 * @returns {Object} Validation result with user object if valid
 */
export const validateSocketConnection = (socket, connectedUsers) => {
  if (!socket || !socket.id) {
    return { isValid: false, error: 'Invalid socket connection' }
  }

  const user = connectedUsers.get(socket.id)
  if (!user) {
    return { isValid: false, error: 'User not found in connected users' }
  }

  return { isValid: true, user }
}
