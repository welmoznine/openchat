import { useState, useRef } from 'react'

/**
 * Custom hook to manage message input logic and typing indicators.
 *
 * @param {Socket} socket - The active socket.io connection.
 * @param {string} activeChannelId - ID of the currently active channel.
 * @param {string} activeDmId - ID of the user in active DM conversation.
 * @returns {Object} - Includes message state and input handling functions.
 */
export const useMessageInput = (socket, activeChannelId, activeDmId) => {
  // State for tracking the current text in the input field
  const [currentMessage, setCurrentMessage] = useState('')

  // Ref to manage the timeout for stopping the typing indicator
  const typingTimeoutRef = useRef(null)

  /**
   * Sends a message to the server via socket.
   *
   * @param {string} messageText - The message to send.
   */
  const handleSendMessage = (messageText) => {
    // Ignore empty messages or if socket is not available
    if (!messageText.trim() || !socket) return

    // Conditionally emit the correct event
    if (activeDmId) {
      socket.emit('send_direct_message', {
        text: messageText.trim(),
        receiverUserId: activeDmId,
      })
    } else if (activeChannelId) {
      socket.emit('send_message', {
        text: messageText.trim(),
        channel: activeChannelId,
      })
    }

    // Clear the input after sending the message
    setCurrentMessage('')

    // Clear typing timeout
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current)
    }

    // Emit event to stop the typing indicator
    if (activeDmId) {
      socket.emit('typing_stop', { messageType: 'direct_message', targetId: activeDmId })
    } else if (activeChannelId) {
      socket.emit('typing_stop', { messageType: 'channel', targetId: activeChannelId })
    }
  }

  /**
   * Updates the current message and handles typing indicators.
   *
   * @param {string} text - The new input text.
   */
  const handleInputChange = (text) => {
    // Update the message state with the latest text
    setCurrentMessage(text)

    // Do nothing if the socket is unavailable
    if (!socket) return

    // Conditionally emit the correct typing event
    if (activeDmId) {
      socket.emit('typing_start', { messageType: 'direct_message', targetId: activeDmId })
    } else if (activeChannelId) {
      socket.emit('typing_start', { messageType: 'channel', targetId: activeChannelId })
    }

    // Clear any existing timeout to avoid duplicate 'typing_stop' events
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current)
    }

    // Set a timeout to emit 'typing_stop' after 1 second of inactivity
    typingTimeoutRef.current = setTimeout(() => {
      if (activeDmId) {
        socket.emit('typing_stop', { messageType: 'direct_message', targetId: activeDmId })
      } else if (activeChannelId) {
        socket.emit('typing_stop', { messageType: 'channel', targetId: activeChannelId })
      }
    }, 1000)
  }

  // Return all relevant state and handlers for use in the message input component
  return {
    currentMessage,
    setCurrentMessage,
    handleSendMessage,
    handleInputChange
  }
}
