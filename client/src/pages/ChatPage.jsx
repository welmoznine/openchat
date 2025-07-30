// Import React hooks
import { useState, useEffect, useRef, useMemo } from 'react'

// Import custom hooks and context
import { useUser } from '../contexts/UserContext'
import { useLogout } from '../hooks/auth/useLogout'
import { useSocket } from '../hooks/useSocket'
import { useUserChannels } from '../hooks/useUserChannels'
import { useChannelMessages } from '../hooks/useChannelMessages'

// Import components
import Message from '../components/chat/Message'
import Sidebar from '../components/chat/Sidebar'
import ChatHeader from '../components/chat/ChatHeader'
import MessageInput from '../components/chat/MessageInput'
import Notification from '../components/chat/Notification'
import SettingsMenu from '../components/SettingsMenu'

function ChatPage () {
  // State variables
  const [currentMessage, setCurrentMessage] = useState('') // Current message input
  const [connectedUsers, setConnectedUsers] = useState([]) // Array of connected users
  const [typingUsers, setTypingUsers] = useState(new Set()) // Users currently typing
  const [notification, setNotification] = useState(null) // Notification state
  const [activeChannelId, setActiveChannelId] = useState(null)
  const [showSidebar, setShowSidebar] = useState(false) // Sidebar toggle

  // Hooks
  const user = useUser() // Get user from context
  const logout = useLogout() // Get logout function
  const { socket, isConnected: socketConnected } = useSocket() // Get socket and connection status
  const {
    channels,
    loading: channelsLoading,
    error: channelsError,
    refreshChannels,
  } = useUserChannels() // Custom hook for channels
  const {
    messages,
    loading: msgLoading,
    error: msgError,
    appendNewMessage,
  } = useChannelMessages(activeChannelId) // Custom hook for messages in the active channel

  // Refs
  const messagesEndRef = useRef(null) // Ref for auto-scrolling to bottom of messages
  const typingTimeoutRef = useRef(null) // Ref for typing indicator timeout

  // Get the active channel
  const activeChannel = useMemo(() => {
    return channels.find((c) => c.id === activeChannelId) || null
  }, [channels, activeChannelId])

  // Auto-scroll to bottom of messages
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  // Effect to auto-select the general channel when channels are loaded
  useEffect(() => {
    if (channels.length > 0 && !activeChannelId) {
      // Find the general channel by name
      const generalChannel = channels.find((c) => c.name === 'general')
      if (generalChannel) {
        console.log('Auto-selecting general channel:', generalChannel.id)
        setActiveChannelId(generalChannel.id)
      } else {
        // If no general channel exists, select the first available channel
        console.log(
          'No general channel found, selecting first available channel:',
          channels[0].id
        )
        setActiveChannelId(channels[0].id)
      }
    }
  }, [channels, activeChannelId])

  // Effect to handle socket events and user join
  useEffect(() => {
  // Ensure socket, user, and activeChannelId are available before proceeding
    if (!socket || !user || !activeChannelId) {
      console.log(
        'Waiting for socket, user, or activeChannelId to be ready:',
        { socket: !!socket, user: !!user, activeChannelId: !!activeChannelId }
      )
      return // Exit if any crucial dependency is not ready
    }

    console.log('Setting up socket listeners for user:', user.username)
    console.log('Socket connected status:', socketConnected)

    // Emit user_join only when socket is connected AND activeChannelId is set
    // This covers the initial connection and cases where activeChannelId might change after the initial connect
    if (socketConnected) {
      console.log('Emitting user_join for:', user.username, 'to channel:', activeChannelId)
      socket.emit('user_join', {
        username: user.username,
        userId: user.id,
        channel: activeChannelId, // This will now always have a value
      })
    }

    // Define socket event handlers
    const onConnect = () => {
      console.log('Socket connected in ChatPage:', socket.id)
      // Re-emit user_join on reconnect to ensure user state is synchronized
      // This is important if the user was disconnected and then reconnected
      if (user && activeChannelId) {
        console.log('Re-emitting user_join on connect for:', user.username, 'to channel:', activeChannelId)
        socket.emit('user_join', {
          username: user.username,
          userId: user.id,
          channel: activeChannelId,
        })
      }
    }

    const onDisconnect = () => {
      console.log('Socket disconnected in ChatPage')
    }

    const onReceiveMessage = (message) => {
      if (message.channel === activeChannelId) {
        appendNewMessage(message)
      }
    }

    const onMessageSent = (message) => {
      if (message.channel === activeChannelId) {
        appendNewMessage(message)
      }
    }

    const onChannelJoined = (data) => {
      console.log('Successfully joined channel:', data.channel)
      if (data.previousChannel) {
        console.log('Left previous channel:', data.previousChannel)
      }
    }

    const onMessageNotification = (notificationData) => {
      console.log('Received notification:', notificationData)

      const isCurrentChannel = notificationData.channel === activeChannelId
      const isFromSelf = notificationData.username === user.username

      if (isFromSelf) {
        console.log('Skipping notification - message from self')
        return
      }

      if (!isCurrentChannel) {
        console.log('Showing cross-channel notification')
        setNotification({
          title: notificationData.title,
          message: notificationData.message,
          channelId: notificationData.channel,
          channelName: notificationData.channelName,
        })
      }
    }

    const onUsersList = (users) => {
      setConnectedUsers(users)
    }

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

    // Attach listeners
    socket.on('connect', onConnect)
    socket.on('disconnect', onDisconnect)
    socket.on('receive_message', onReceiveMessage)
    socket.on('message_sent', onMessageSent)
    socket.on('channel_joined', onChannelJoined)
    socket.on('message_notification', onMessageNotification)
    socket.on('users_list', onUsersList)
    socket.on('user_typing', onUserTyping)

    // Cleanup
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
  }, [socket, user, socketConnected, activeChannelId, appendNewMessage, activeChannel]) // Add activeChannelId to dependencies

  // Effect to scroll to bottom when messages change
  useEffect(() => {
    scrollToBottom()
  }, [messages])

  // Effect to auto-dismiss notification after 10 seconds
  useEffect(() => {
    if (notification) {
      const timer = setTimeout(() => {
        setNotification(null)
      }, 10000) // Auto-dismiss after 10 seconds

      return () => clearTimeout(timer)
    }
  }, [notification])

  const handleSendMessage = (messageText) => {
    if (!messageText.trim() || !socket) return

    socket.emit('send_message', {
      text: messageText.trim(),
      channel: activeChannelId, // Include the current channel
    })
    setCurrentMessage('') // Clear input after sending
    // Stop typing indicator
    socket.emit('typing_stop', { channel: activeChannelId })
  }

  const handleInputChange = (text) => {
    setCurrentMessage(text)

    if (!socket) return

    // Handle typing indicators
    socket.emit('typing_start', { channel: activeChannelId })

    // Clear existing timeout
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current)
    }

    // Set new timeout to stop typing indicator
    typingTimeoutRef.current = setTimeout(() => {
      socket.emit('typing_stop', { channel: activeChannelId })
    }, 1000)
  }

  const formatTimestamp = (timestamp) => {
    const date = new Date(timestamp)
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  }

  const generateUserInitials = (username) => {
    return username.substring(0, 2).toUpperCase()
  }

  const generateUserColor = (username) => {
    const colors = [
      'bg-blue-500',
      'bg-green-500',
      'bg-purple-500',
      'bg-orange-500',
      'bg-pink-500',
      'bg-red-500',
      'bg-yellow-500',
      'bg-indigo-500',
      'bg-teal-500',
    ]
    const index = username.charCodeAt(0) % colors.length
    return colors[index]
  }

  // Transform your existing data to match the Discord component structure
  const currentUserData = user
    ? {
        name: user.username,
        initials: generateUserInitials(user.username),
        bgColor: generateUserColor(user.username),
        status: socketConnected ? 'online' : 'offline',
      }
    : null

  const directMessages = connectedUsers
    .filter((connectedUser) => connectedUser.id !== user?.id)
    .map((connectedUser) => ({
      user: {
        name: connectedUser.username,
        initials: generateUserInitials(connectedUser.username),
        bgColor: generateUserColor(connectedUser.username),
        status: 'online',
      },
      unreadCount: 0,
    }))

  const onlineMembers = connectedUsers.map((connectedUser) => ({
    name: connectedUser.username,
    initials: generateUserInitials(connectedUser.username),
    bgColor: generateUserColor(connectedUser.username),
    status: 'online',
  }))

  const formattedMessages = messages.map((message) => ({
    id: message.id,
    user: {
      name: message.username,
      initials: generateUserInitials(message.username || 'SY'),
      bgColor: message.isSystem
        ? 'bg-gray-500'
        : generateUserColor(message.username || 'System'),
    },
    timestamp: formatTimestamp(message.timestamp),
    content: message.text,
    isSystem: message.isSystem,
    isOwn: message.username === user?.username,
  }))

  const handleChannelSelect = (channelId) => {
    console.log('Switching from', activeChannelId, 'to', channelId)

    // Clear typing indicators when switching channels
    setTypingUsers(new Set())

    // Update active channel
    setActiveChannelId(channelId)

    // Notify the server about channel switch
    if (socket) {
      socket.emit('join_channel', { channel: channelId })
    }
  }

  const handleDirectMessageSelect = (userName) => {
    // Handle DM selection - you can implement private messaging here
    console.log('Opening DM with:', userName)
  }

  const handleCloseNotification = () => {
    setNotification(null)
  }

  const handleLogout = () => {
    if (socket) {
      socket.disconnect()
    }
    logout()
  }

  const toggleSidebar = () => {
    setShowSidebar((prev) => !prev)
  }

  // Add loading state check
  if (!user) {
    return (
      <div className='h-screen flex items-center justify-center bg-slate-800 text-white'>
        <div className='text-lg'>Loading...</div>
      </div>
    )
  }
  if (channelsLoading) {
    return (
      <div className='h-screen flex items-center justify-center bg-slate-800 text-white'>
        <div>Loading channels...</div>
      </div>
    )
  }

  if (channelsError) {
    return (
      <div className='h-screen flex items-center justify-center bg-slate-800 text-red-500'>
        <div>Error loading channels: {channelsError}</div>
      </div>
    )
  }

  if (msgLoading) {
    return (
      <div className='h-screen flex items-center justify-center bg-slate-800 text-white'>
        <div>Loading messages...</div>
      </div>
    )
  }
  if (msgError) {
    return (
      <div className='h-screen flex items-center justify-center bg-slate-800 text-red-500'>
        <div>Error loading messages: {msgError}</div>
      </div>
    )
  }

  return (
    <>
      <div className='h-full w-full bg-slate-800 text-white md:h-screen md:flex relative'>
        <div
          className={`${
            showSidebar ? 'fixed left-0' : 'hidden'
          } top-0 bottom-0 w-64 bg-slate-900 z-50 md:static md:flex md:w-64`}
        >
          <Sidebar
            currentUser={currentUserData}
            channels={channels}
            activeChannel={activeChannel?.id || null}
            onChannelSelect={handleChannelSelect}
            directMessages={directMessages}
            onDirectMessageSelect={handleDirectMessageSelect}
            onlineMembers={onlineMembers}
            onLogout={handleLogout}
            isConnected={socketConnected}
            SettingsMenuComponent={<SettingsMenu onLogout={handleLogout} />}
            toggleSidebar={toggleSidebar}
            showSidebar={showSidebar}
            onChannelAdded={refreshChannels}
          />
        </div>
        <div className='flex flex-1 flex-col bg-slate-700 h-screen'>
          <ChatHeader
            channelName={activeChannel?.name || 'general'}
            description={activeChannel?.description || ''}
            isConnected={socketConnected}
            toggleSidebar={toggleSidebar}
          />

          <div className='flex-1 overflow-y-auto px-6 py-4 space-y-4'>
            {formattedMessages.map((message) => (
              <Message key={message.id} message={message} />
            ))}

            {/* Typing indicators */}
            {typingUsers.size > 0 && (
              <div className='flex space-x-3 px-2 py-1'>
                <div className='w-10 h-10 bg-gray-500 rounded-full flex items-center justify-center flex-shrink-0'>
                  <span className='text-sm text-white'>💭</span>
                </div>
                <div className='flex-1 min-w-0'>
                  <div className='flex items-baseline space-x-2 mb-1'>
                    <span className='font-medium text-white'>
                      {Array.from(typingUsers).join(', ')}
                    </span>
                  </div>
                  <div className='text-gray-300 italic'>
                    {typingUsers.size === 1 ? 'is' : 'are'} typing...
                  </div>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          <MessageInput
            value={currentMessage}
            onSendMessage={handleSendMessage}
            onInputChange={handleInputChange}
            isConnected={socketConnected}
            placeholder={`Message #${activeChannel?.name || 'general'}`}
          />
        </div>

        {notification && (
          <div className='fixed top-4 right-4 z-50 space-y-2'>
            <Notification
              notification={notification}
              onClose={handleCloseNotification}
            />
          </div>
        )}
      </div>
    </>
  )
}

export default ChatPage
