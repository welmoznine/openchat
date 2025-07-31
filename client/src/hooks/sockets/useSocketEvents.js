import { useEffect, useState } from 'react'

/**
 * Custom hook to manage socket event listeners related to chat functionality.
 *
 * @param {Socket} socket - The active socket.io connection.
 * @param {Object} user - The current logged-in user.
 * @param {string} activeChannelId - The ID of the currently active chat channel.
 * @param {boolean} socketConnected - Socket connection status flag.
 * @param {Function} appendNewMessage - Function to add new messages to state.
 * @returns {Object} - Contains connected users, typing users, notifications, and setters.
 */
export const useSocketEvents = (socket, user, activeChannelId, socketConnected, appendNewMessage) => {
  // State holding the list of currently connected users
  const [connectedUsers, setConnectedUsers] = useState([])

  // State holding the set of users currently typing in the active channel
  const [typingUsers, setTypingUsers] = useState(new Set())

  // State for showing notifications related to messages or channels
  const [notification, setNotification] = useState(null)

  useEffect(() => {
    // Wait until socket, user, and activeChannelId are all available before setting up listeners
    if (!socket || !user || !activeChannelId) {
      console.log(
        'Waiting for socket, user, or activeChannelId to be ready:',
        { socket: !!socket, user: !!user, activeChannelId: !!activeChannelId }
      )
      return // Exit early if dependencies are not ready
    }

    console.log('Setting up socket listeners for user:', user.username)
    console.log('Socket connected status:', socketConnected)

    // Emit 'user_join' event only if socket is connected and activeChannelId is set
    if (socketConnected) {
      console.log('Emitting user_join for:', user.username, 'to channel:', activeChannelId)
      socket.emit('user_join', {
        username: user.username,
        userId: user.id,
        channel: activeChannelId, // Always provide the current channel
      })
    }

    // Handler for socket connection event
    const onConnect = () => {
      console.log('Socket connected in ChatPage:', socket.id)
      // Re-emit 'user_join' after reconnect to resync user state with the server
      if (user && activeChannelId) {
        console.log('Re-emitting user_join on connect for:', user.username, 'to channel:', activeChannelId)
        socket.emit('user_join', {
          username: user.username,
          userId: user.id,
          channel: activeChannelId,
        })
      }
    }

    // Handler for socket disconnection event
    const onDisconnect = () => {
      console.log('Socket disconnected in ChatPage')
    }

    // Handler for receiving new messages relevant to the active channel
    const onReceiveMessage = (message) => {
      if (message.channel === activeChannelId) {
        appendNewMessage(message)
      }
    }

    // Handler for messages sent by the user or others, also filtered by channel
    const onMessageSent = (message) => {
      if (message.channel === activeChannelId) {
        appendNewMessage(message)
      }
    }

    // Handler confirming the user successfully joined a channel
    const onChannelJoined = (data) => {
      console.log('Successfully joined channel:', data.channel)
      if (data.previousChannel) {
        console.log('Left previous channel:', data.previousChannel)
      }
    }

    // Handler for message notifications from other channels or users
    const onMessageNotification = (notificationData) => {
      console.log('Received notification:', notificationData)

      // Check if notification is from current channel or from self
      const isCurrentChannel = notificationData.channel === activeChannelId
      const isFromSelf = notificationData.username === user.username

      if (isFromSelf) {
        console.log('Skipping notification - message from self')
        return
      }

      if (!isCurrentChannel) {
        console.log('Showing cross-channel notification')
        // Show notification for messages from other channels
        setNotification({
          title: notificationData.title,
          message: notificationData.message,
          channelId: notificationData.channel,
          channelName: notificationData.channelName,
        })
      }
    }

    // Handler to update the list of connected users
    const onUsersList = (users) => {
      setConnectedUsers(users)
    }

    // Handler to update the set of users currently typing in the active channel
    const onUserTyping = (data) => {
      if (data.channel === activeChannelId) {
        setTypingUsers((prev) => {
          const newSet = new Set(prev)
          if (data.isTyping) {
            newSet.add(data.username)
          } else {
            newSet.delete(data.username)
          }
          return newSet
        })
      }
    }

    // Attach all defined socket event listeners
    socket.on('connect', onConnect)
    socket.on('disconnect', onDisconnect)
    socket.on('receive_message', onReceiveMessage)
    socket.on('message_sent', onMessageSent)
    socket.on('channel_joined', onChannelJoined)
    socket.on('message_notification', onMessageNotification)
    socket.on('users_list', onUsersList)
    socket.on('user_typing', onUserTyping)

    // Cleanup function to remove listeners on component unmount or dependency change
    return () => {
      socket.off('connect', onConnect)
      socket.off('disconnect', onDisconnect)
      socket.off('receive_message', onReceiveMessage)
      socket.off('message_sent', onMessageSent)
      socket.off('channel_joined', onChannelJoined)
      socket.off('message_notification', onMessageNotification)
      socket.off('users_list', onUsersList)
      socket.off('user_typing', onUserTyping)
    }
  }, [socket, user, socketConnected, activeChannelId, appendNewMessage]) // Re-run effect if these dependencies change

  // Return current state of connected users, typing users, notification, and setters
  return {
    connectedUsers,
    typingUsers,
    setTypingUsers,
    notification,
    setNotification
  }
}
