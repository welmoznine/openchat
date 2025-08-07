import { useEffect, useRef, useState } from 'react'
import { io } from 'socket.io-client'

/**
 * Custom hook to create and manage a Socket.IO connection.
 *
 * @param {string} serverUrl - The server URL to connect to (defaults to VITE_API_BASE_URL).
 * @returns {Object} - Returns the socket instance and connection status.
 */
export const useSocket = (serverUrl = import.meta.env.VITE_API_BASE_URL) => {
  // Ref to persist the socket instance across renders
  const socketRef = useRef(null)

  // State to track whether the socket is currently connected
  const [isConnected, setIsConnected] = useState(false)

  useEffect(() => {
    // Only create a socket if one doesn't already exist
    if (!socketRef.current) {
      // Get auth token from localStorage
      const token = localStorage.getItem('token')

      // Initialize the socket connection with configuration
      socketRef.current = io(serverUrl, {
        transports: ['polling', 'websocket'], // Use fallback transport options
        auth: { token }, // Send token for authentication
        reconnection: true, // Enable automatic reconnection
        reconnectionDelay: 1000, // Delay between reconnection attempts
        reconnectionAttempts: 5, // Max reconnection attempts
        timeout: 20000, // Connection timeout duration
      })

      // Store the socket instance locally for convenience
      const socket = socketRef.current

      // Handle successful connection
      socket.on('connect', () => {
        setIsConnected(true)
      })

      // Handle disconnection
      socket.on('disconnect', (reason) => {
        setIsConnected(false)
      })

      // Handle connection errors
      socket.on('connect_error', (error) => {
        console.error('Connection error:', error)
        console.error('Error type:', error.type)
        console.error('Error message:', error.message)
        setIsConnected(false)
      })

      // Handle successful reconnection
      socket.on('reconnect', (attemptNumber) => {
        setIsConnected(true)
      })

      // Handle failed reconnection attempts
      socket.on('reconnect_error', (error) => {
        console.error('Reconnection error:', error)
      })
    }

    // Cleanup function to disconnect the socket when component unmounts
    return () => {
      if (socketRef.current && socketRef.current.connected) {
        socketRef.current.disconnect()
        setIsConnected(false)
        socketRef.current = null
      }
    }
  }, [serverUrl]) // Re-run effect only if the server URL changes

  // Return the socket instance and its connection status
  return { socket: socketRef.current, isConnected }
}
