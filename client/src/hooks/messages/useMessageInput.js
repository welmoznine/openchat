import { useState, useRef } from 'react'

/**
 * Custom hook to manage message input logic and typing indicators.
 *
 * @param {Socket} socket - The active socket.io connection.
 * @param {string} activeChannelId - ID of the currently active channel.
 * @returns {Object} - Includes message state and input handling functions.
 */
export const useMessageInput = (socket, activeChannelId) => {
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

    // Emit the message to the server along with the active channel ID
    socket.emit('send_message', {
      text: messageText.trim(),
      channel: activeChannelId,
    })

    // Clear the input after sending the message
    setCurrentMessage('')

    // Emit event to stop the typing indicator
    socket.emit('typing_stop', { channel: activeChannelId })
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

    // Notify the server that the user started typing
    socket.emit('typing_start', { channel: activeChannelId })

    // Clear any existing timeout to avoid duplicate 'typing_stop' events
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current)
    }

    // Set a timeout to emit 'typing_stop' after 1 second of inactivity
    typingTimeoutRef.current = setTimeout(() => {
      socket.emit('typing_stop', { channel: activeChannelId })
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
