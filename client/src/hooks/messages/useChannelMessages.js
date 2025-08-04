import { useState, useEffect, useCallback } from 'react'

/**
 * Custom hook to fetch and manage messages for a given channel.
 *
 * @param {string} channelId - The ID of the current channel.
 * @param {Object} socket - Socket.io instance for real-time updates
 * @returns {Object} - Contains messages, loading state, error, and functions for managing messages.
 */
export const useChannelMessages = (channelId, socket) => {
  // State to hold the list of messages for the current channel
  const [messages, setMessages] = useState([])

  // State to track the loading status of the message fetch
  const [loading, setLoading] = useState(false)

  // State to store any error messages
  const [error, setError] = useState(null)

  // Track messages being deleted to prevent duplicates
  const [deletingMessages, setDeletingMessages] = useState(new Set())

  /**
   * Fetches messages from the API for the current channel.
   */
  const fetchMessages = useCallback(async () => {
    // Clear messages if no channel is selected
    if (!channelId) {
      setMessages([])
      return
    }

    // Set loading state and clear previous errors
    setLoading(true)
    setError(null)

    // Get the auth token from localStorage for API request
    const token = localStorage.getItem('token')

    try {
      // Make the fetch request to get the messages for the current channel
      const res = await fetch(
        `${import.meta.env.VITE_API_BASE_URL}/api/user/channels/${channelId}/messages?limit=50`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        }
      )
      // Throw an error if the response is not OK
      if (!res.ok) throw new Error(`Error ${res.status}`)

      // Parse the response data and update the messages state
      const data = await res.json()
      setMessages(data)
    } catch (err) {
      // Set error message if an error occurs
      setError(err.message)
    } finally {
      // Set loading to false once the fetch is done
      setLoading(false)
    }
  }, [channelId]) // Re-run fetchMessages when channelId changes

  /**
   * Appends a new message to the existing list of messages.
   *
   * @param {Object} newMessage - The new message to append.
   */
  const appendNewMessage = useCallback((newMessage) => {
    setMessages((prevMessages) => {
      // Prevent appending duplicate messages (e.g., if message is sent twice)
      const isDuplicate = prevMessages.some(msg => msg.id === newMessage.id)
      if (isDuplicate) {
        return prevMessages
      }
      return [...prevMessages, newMessage]
    })
  }, [])

  /**
   * Removes a message from the messages list (for soft deletes).
   *
   * @param {string} messageId - The ID of the message to delete.
   */
  const deleteMessage = useCallback((messageId) => {
    // Check if message is already being deleted
    if (deletingMessages.has(messageId)) {
      console.log(`Message ${messageId} is already being deleted, skipping...`)
      return Promise.resolve() // Return resolved promise to prevent errors
    }

    // Add to deleting set
    setDeletingMessages(prev => new Set(prev).add(messageId))

    // Remove from messages immediately for optimistic update
    setMessages((prevMessages) =>
      prevMessages.filter((msg) => msg.id !== messageId)
    )

    // Remove from deleting set after a delay
    setTimeout(() => {
      setDeletingMessages(prev => {
        const newSet = new Set(prev)
        newSet.delete(messageId)
        return newSet
      })
    }, 1000)

    return Promise.resolve()
  }, [deletingMessages])

  // Socket event listeners for real-time updates
  useEffect(() => {
    if (!socket) return

    // Listen for message deletion events
    const handleMessageDeleted = (deleteData) => {
      console.log('Message deleted event received:', deleteData)
      if (deleteData.channelId === channelId) {
        deleteMessage(deleteData.messageId)
      }
    }

    // Listen for delete success
    const handleDeleteSuccess = (deleteData) => {
      console.log('Delete success received:', deleteData)
      if (deleteData.channelId === channelId) {
        deleteMessage(deleteData.messageId)
      }
    }

    // Listen for delete errors
    const handleDeleteError = (errorData) => {
      console.error('Delete error received:', errorData)

      // Only set error for non-"already deleted" errors
      if (!errorData.error?.includes('already deleted')) {
        setError(`Failed to delete message: ${errorData.error}`)
      } else {
        console.log('Message already deleted')
        // Still remove from UI if it exists
        if (errorData.messageId) {
          setMessages(prevMessages =>
            prevMessages.filter(msg => msg.id !== errorData.messageId)
          )
        }
      }

      // Remove from deleting set
      if (errorData.messageId) {
        setDeletingMessages(prev => {
          const newSet = new Set(prev)
          newSet.delete(errorData.messageId)
          return newSet
        })
      }
    }

    // Add event listeners
    socket.on('message_deleted', handleMessageDeleted)
    socket.on('message_delete_success', handleDeleteSuccess)
    socket.on('message_delete_error', handleDeleteError)

    // Cleanup function to remove event listeners
    return () => {
      socket.off('message_deleted', handleMessageDeleted)
      socket.off('message_delete_success', handleDeleteSuccess)
      socket.off('message_delete_error', handleDeleteError)
    }
  }, [socket, channelId, deleteMessage])

  // Effect to auto-fetch messages when channelId changes
  useEffect(() => {
    if (channelId) {
      fetchMessages() // Fetch messages when the channel changes
    } else {
      setMessages([]) // Clear messages if no active channel
      setDeletingMessages(new Set()) // Reset deleting messages
    }
  }, [fetchMessages])

  // Return the current state of messages, loading, error, and functions to manage messages
  return {
    messages,
    loading,
    error,
    refresh: fetchMessages,
    appendNewMessage,
    deleteMessage
  }
}
