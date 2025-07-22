// hooks/useSocket.js

import { useEffect, useRef, useState } from 'react'
import { io } from 'socket.io-client'

export const useSocket = (serverUrl = 'http://localhost:3000') => {
  const socketRef = useRef(null)
  const [isConnected, setIsConnected] = useState(false)

  useEffect(() => {
    if (!socketRef.current) {
      const token = localStorage.getItem('token')

      socketRef.current = io(serverUrl, {
        transports: ['websocket'],
        upgrade: false,
        auth: { token },
        reconnection: true,
        reconnectionDelay: 1000,
        reconnectionAttempts: 5,
        timeout: 20000,
      })

      const socket = socketRef.current

      socket.on('connect', () => {
        console.log('Socket connected:', socket.id)
        setIsConnected(true)
      })

      socket.on('disconnect', (reason) => {
        console.log('Socket disconnected:', reason)
        setIsConnected(false)
      })

      socket.on('connect_error', (error) => {
        console.error('Connection error:', error)
        setIsConnected(false)
      })

      socket.on('reconnect', (attemptNumber) => {
        console.log(`Reconnected after ${attemptNumber} attempts`)
        setIsConnected(true)
      })

      socket.on('reconnect_error', (error) => {
        console.error('Reconnection error:', error)
      })
    }

    return () => {
      if (socketRef.current && socketRef.current.connected) {
        socketRef.current.disconnect()
        console.log('Socket disconnected on unmount')
        setIsConnected(false)
        socketRef.current = null
      }
    }
  }, [serverUrl])

  return { socket: socketRef.current, isConnected }
}
