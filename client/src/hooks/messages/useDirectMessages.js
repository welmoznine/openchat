import { useState, useEffect, useCallback, useRef } from 'react'

/**
 * Custom hook to fetch and manage direct messages between two users.
 *
 * @param {string} otherUserId - The ID of the user in the DM conversation.
 * @param {Object} socket - Socket.io instance for real-time updates.
 * @returns {Object} - Contains messages, loading state, error, and functions for managing messages.
 */
export const useDirectMessages = (otherUserId, socket) => {
  const [messages, setMessages] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  // Use ref to track if we've received socket response
  const socketResponseReceived = useRef(false)
  const fallbackTimeoutRef = useRef(null)

  /**
   * Fetches the DM history from the API.
   */
  const fetchMessages = useCallback(async () => {
    if (!otherUserId) {
      setMessages([])
      return
    }

    setLoading(true)
    setError(null)

    const token = localStorage.getItem('token')

    try {
      const res = await fetch(
        `${import.meta.env.VITE_API_BASE_URL}/api/user/direct-messages/${otherUserId}?limit=50`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        }
      )

      if (!res.ok) throw new Error(`Error ${res.status}`)

      const data = await res.json()
      // Filter out soft-deleted messages
      setMessages(data.filter(msg => !msg.isDeleted))
    } catch (err) {
      setError(err.message)
      console.error('HTTP DM fetch failed:', err)
    } finally {
      setLoading(false)
    }
  }, [otherUserId])

  /**
   * Appends a new message to the existing list.
   *
   * @param {Object} newMessage - The new direct message to append.
   */
  const appendNewMessage = useCallback((newMessage) => {
    setMessages((prevMessages) => {
      // Prevent duplicates
      const isDuplicate = prevMessages.some(msg => msg.id === newMessage.id)
      if (isDuplicate) return prevMessages

      return [...prevMessages, newMessage]
    })
  }, [])

  /**
   * Removes a message from the messages list (for soft deletes).
   *
   * @param {string} messageId - The ID of the message to delete.
   */
  const deleteMessage = useCallback((messageId) => {
    setMessages((prevMessages) =>
      prevMessages.map((msg) =>
        msg.id === messageId ? { ...msg, isDeleted: true, content: 'This message was deleted.' } : msg
      )
    )
  }, [])

  // Socket event listener for real-time DM updates
  useEffect(() => {
    if (!socket || !otherUserId) return

    // Listen for new direct messages
    const handleNewDirectMessage = (dm) => {
      // Check if the message is for the current conversation
      if ((dm.userId === otherUserId || dm.receiverUserId === otherUserId) && !dm.isDeleted) {
        appendNewMessage(dm)
      }
    }

    // Listen for DM history
    const handleDirectMessageHistory = (historyData) => {
      if (historyData.otherUserId === otherUserId) {
        // Filter out soft-deleted messages
        setMessages(historyData.messages)
        setLoading(false)
        socketResponseReceived.current = true

        // Clear the fallback timeout since we got socket response
        if (fallbackTimeoutRef.current) {
          clearTimeout(fallbackTimeoutRef.current)
          fallbackTimeoutRef.current = null
        }
      }
    }

    // Listen for DM sent confirmation
    const handleDirectMessageSent = (dm) => {
      if (dm.receiverUserId === otherUserId && !dm.isDeleted) {
        appendNewMessage(dm)
      }
    }

    // Add event listeners
    socket.on('receive_direct_message', handleNewDirectMessage)
    socket.on('direct_message_history', handleDirectMessageHistory)
    socket.on('direct_message_sent', handleDirectMessageSent)

    // Cleanup function
    return () => {
      socket.off('receive_direct_message', handleNewDirectMessage)
      socket.off('direct_message_history', handleDirectMessageHistory)
      socket.off('direct_message_sent', handleDirectMessageSent)
    }
  }, [socket, otherUserId, appendNewMessage])

  // useEffect for delete event listeners
  useEffect(() => {
    if (!socket || !otherUserId) return

    // Listen for direct message deletion events
    const handleDmDeleted = (deleteData) => {
      // Check if this delete is for the current conversation
      if (deleteData.senderId === otherUserId || deleteData.receiverId === otherUserId) {
        deleteMessage(deleteData.messageId)
      }
    }

    // Listen for delete success
    const handleDmDeleteSuccess = (deleteData) => {
      if (deleteData.senderId === otherUserId || deleteData.receiverId === otherUserId) {
        deleteMessage(deleteData.messageId)
      }
    }

    // Listen for delete errors
    const handleDmDeleteError = (errorData) => {
      console.error('DM delete error received:', errorData)

      if (!errorData.error?.includes('already deleted') && !errorData.error?.includes('not found')) {
        setError(`Failed to delete direct message: ${errorData.error}`)
      } else {
        // Still update UI to show as deleted if the message exists
        if (errorData.messageId) {
          deleteMessage(errorData.messageId)
        }
      }
    }

    // Add event listeners
    socket.on('dm_deleted', handleDmDeleted)
    socket.on('dm_delete_success', handleDmDeleteSuccess)
    socket.on('dm_delete_error', handleDmDeleteError)

    // Cleanup function
    return () => {
      socket.off('dm_deleted', handleDmDeleted)
      socket.off('dm_delete_success', handleDmDeleteSuccess)
      socket.off('dm_delete_error', handleDmDeleteError)
    }
  }, [socket, otherUserId, deleteMessage])

  // Effect to fetch messages when the otherUserId changes
  useEffect(() => {
    // Clear previous state
    socketResponseReceived.current = false
    if (fallbackTimeoutRef.current) {
      clearTimeout(fallbackTimeoutRef.current)
      fallbackTimeoutRef.current = null
    }

    if (otherUserId && socket && socket.connected) {
      setLoading(true)
      setError(null)

      // Fallback to HTTP if socket doesn't respond
      fallbackTimeoutRef.current = setTimeout(() => {
        if (!socketResponseReceived.current) {
          fetchMessages()
        }
      }, 2000) // Increased timeout to 2 seconds
    } else if (otherUserId) {
      // No socket, use HTTP directly
      fetchMessages()
    } else {
      // No otherUserId, clear messages
      setMessages([])
      setLoading(false)
    }

    // Cleanup timeout on unmount or otherUserId change
    return () => {
      if (fallbackTimeoutRef.current) {
        clearTimeout(fallbackTimeoutRef.current)
        fallbackTimeoutRef.current = null
      }
    }
  }, [otherUserId, socket, fetchMessages])

  return {
    messages,
    loading,
    error,
    refresh: fetchMessages,
    appendNewMessage,
    deleteMessage,
  }
}
