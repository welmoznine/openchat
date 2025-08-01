import { useState, useEffect, useCallback } from 'react'

/**
 * Custom hook to fetch and manage messages for a given channel.
 *
 * @param {string} channelId - The ID of the current channel.
 * @param {boolean} enabled - Flag to control if the hook should fetch messages.
 * @returns {Object} - Contains messages, loading state, error, and functions for refreshing and appending messages.
 */
export const useChannelMessages = (channelId, enabled = true) => {
  // State to hold the list of messages for the current channel
  const [messages, setMessages] = useState([])

  // State to track the loading status of the message fetch
  const [loading, setLoading] = useState(false)

  // State to store any error messages
  const [error, setError] = useState(null)

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
  }, []) // Only recreate the callback when needed (i.e., no dependencies)

  // Effect to auto-fetch messages when channelId changes (if enabled)
  useEffect(() => {
    if (enabled) {
      fetchMessages() // Fetch messages when the channel is enabled
    } else {
      setMessages([]) // Clear messages if disabled (e.g., no active channel)
    }
  }, [fetchMessages, enabled]) // Run effect when enabled or fetchMessages changes

  // Return the current state of messages, loading, error, and functions to manage messages
  return { messages, loading, error, refresh: fetchMessages, appendNewMessage }
}
