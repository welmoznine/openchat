// Import React hooks
import { useState, useEffect } from 'react'

// Import custom hooks and context for user and auth management
import { useUser } from '../contexts/UserContext'
import { useLogout } from '../hooks/auth/useLogout'
import { useSocket } from '../hooks/sockets/useSocket'
import { useUserChannels } from '../hooks/channels/useUserChannels'
import { useChannelMessages } from '../hooks/messages/useChannelMessages'

// Import custom hooks for chat state management
import { useActiveChannel } from '../hooks/channels/useActiveChannel'
import { useSocketEvents } from '../hooks/sockets/useSocketEvents'
import { useMessageInput } from '../hooks/messages/useMessageInput'
import { useNotifications } from '../hooks/messages/useNotifications'
import { useScrollToBottom } from '../hooks/messages/useScrollToBottom'
import { useActiveDirectMessage } from '../hooks/messages/useActiveDirectMessage'
import { useDirectMessages } from '../hooks/messages/useDirectMessages'
import { useDeleteMessages } from '../hooks/messages/useDeleteMessages'
import { useAllUsers } from '../hooks/users/useAllUsers'
import { useDMContacts } from '../hooks/messages/useDMContacts'

// Import utility functions
import {
  formatMessagesForDisplay,
  formatCurrentUserData,
  formatOnlineMembers,
  formatUsersForDMList
} from '../utils/chatHelpers'

// Import components
import Message from '../components/chat/Message'
import Sidebar from '../components/chat/Sidebar'
import ChatHeader from '../components/chat/ChatHeader'
import MessageInput from '../components/chat/MessageInput'
import Notification from '../components/chat/Notification'

function ChatPage () {
  // State variables
  const [showSidebar, setShowSidebar] = useState(false) // Sidebar toggle
  const [userStatus, setUserStatus] = useState('Online') // default lower-case
  const [connectedUsers, setConnectedUsers] = useState([])

  // Hooks
  const user = useUser() // Get user from context
  const logout = useLogout() // Get logout function
  const { socket, isConnected: socketConnected } = useSocket() // Get socket and connection status
  const { deleteMessage: apiDeleteMessage } = useDeleteMessages()

  const {
    channels,
    loading: channelsLoading,
    error: channelsError,
    refreshChannels,
  } = useUserChannels() // Custom hook for channels

  // DM management hooks
  const { users: allUsers, loading: usersLoading } = useAllUsers()
  const { contacts: dmContacts, addContact: addDMContact } = useDMContacts()

  const { activeDmId, setActiveDmId, activeDmUser } = useActiveDirectMessage(connectedUsers, dmContacts, allUsers, user?.id) // Active DM management

  const { activeChannelId, setActiveChannelId, activeChannel } = useActiveChannel(channels, activeDmId) // Active channel management
  const {
    messages,
    loading: msgLoading,
    error: msgError,
    appendNewMessage,
  } = useChannelMessages(activeChannelId, socket) // Custom hook for messages in the active channel

  // Socket events management
  const {
    typingUsers,
    setTypingUsers,
    notification,
    setNotification
  } = useSocketEvents(
    socket,
    user,
    activeChannelId,
    activeDmId,
    socketConnected,
    appendNewMessage,
    refreshChannels,
    setConnectedUsers
  )

  const {
    messages: dmMessages,
  } = useDirectMessages(activeDmId, socket) // Custom hook for direct messages

  const isDMActive = activeDmId !== null

  // Select the correct list of messages
  const currentMessages = isDMActive ? dmMessages : messages

  // Select the correct chat name and placeholder for the UI
  const chatName = isDMActive ? activeDmUser?.username : activeChannel?.name
  const chatDescription = isDMActive ? `Direct Message with ${activeDmUser?.username}` : activeChannel?.description
  const inputPlaceholder = isDMActive ? `Message ${activeDmUser?.username}` : `Message #${activeChannel?.name}`

  // Message input management
  const {
    currentMessage,
    handleSendMessage,
    handleInputChange
  } = useMessageInput(socket, activeChannelId, activeDmId)

  // Notification management
  const { handleCloseNotification } = useNotifications(notification, setNotification)

  // Scroll to bottom management
  const { messagesEndRef } = useScrollToBottom(messages)

  // Format data for display
  const formattedMessages = formatMessagesForDisplay(currentMessages, user)
  const currentUserData = formatCurrentUserData(user, socketConnected)
  const formattedDMContacts = formatUsersForDMList(dmContacts, connectedUsers)
  const onlineMembers = formatOnlineMembers(connectedUsers)

  // Handle message deletion
  const handleDeleteMessage = async (messageId, messageType) => {
    try {
      await apiDeleteMessage(messageId, messageType)
    } catch (error) {
      console.error('Failed to delete message:', error)
    }
  }

  const handleChannelSelect = (channelId) => {
    // Clear typing indicators and active DM when switching channels
    setTypingUsers(new Set())
    setActiveDmId(null)

    // Update active channel
    setActiveChannelId(channelId)

    // Notify the server about channel switch
    if (socket) {
      socket.emit('join_channel', { channel: channelId })
    }
  }

  const handleDirectMessageSelect = (userId) => {
    // Clear active channel when switching to a DM
    setActiveChannelId(null)

    // Update the active DM ID
    setActiveDmId(userId)

    // Notify the server about DM switch
    if (socket) {
      socket.emit('join_dm_room', { otherUserId: userId })
    }
  }

  // Handle starting a new DM conversation
  const handleStartNewDM = (userId, userInfo) => {
    // Add to contacts if not already there
    const existingContact = dmContacts.find(c => c.id === userId)
    if (!existingContact) {
      addDMContact({
        id: userId,
        username: userInfo.username,
        status: userInfo.status || 'offline'
      })
    }

    // Switch to the DM conversation
    handleDirectMessageSelect(userId)
  }

  const handleStatusChange = (newStatus) => {
    setUserStatus(newStatus)
    if (socket && socket.connected) {
      socket.emit('status_update', newStatus)
    }
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
  if (channelsLoading || usersLoading) {
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
            activeDmId={activeDmId}
            onChannelSelect={handleChannelSelect}
            dmContacts={formattedDMContacts}
            onDirectMessageSelect={handleDirectMessageSelect}
            onlineMembers={onlineMembers}
            onLogout={handleLogout}
            isConnected={socketConnected}
            toggleSidebar={toggleSidebar}
            showSidebar={showSidebar}
            onChannelUpdate={refreshChannels}
            currentStatus={userStatus}
            onStatusChange={handleStatusChange}
            allUsers={allUsers}
            connectedUsers={connectedUsers}
            onStartNewDM={handleStartNewDM}
          />
        </div>
        <div className='flex flex-1 flex-col bg-slate-700 h-screen'>
          <ChatHeader
            channelName={chatName || ''}
            description={chatDescription || ''}
            isConnected={socketConnected}
            toggleSidebar={toggleSidebar}
          />

          <div className='flex-1 overflow-y-auto px-6 py-4 space-y-4'>
            {formattedMessages.map((message) => (
              <Message key={message.id} message={message} onDeleteMessage={handleDeleteMessage} socket={socket} />
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
            placeholder={inputPlaceholder}
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
