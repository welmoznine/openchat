import { formatTimestamp, generateUserInitials, generateUserColor } from './chatUtils'

/**
 * Formats an array of chat messages for display in the UI.
 *
 * @param {Array} messages - Array of message objects from the backend.
 * @param {Object} user - The currently logged-in user object.
 * @returns {Array} - Array of formatted message objects for UI display.
 */
export const formatMessagesForDisplay = (messages, user) => {
  return messages.map((message) => ({
    id: message.id, // Preserve message ID
    messageType: message.messageType, // Preserve message type
    user: {
      name: message.username, // Original username of the message sender
      initials: generateUserInitials(message.username || 'SY'), // Fallback to 'SY' if no username
      bgColor: message.isSystem
        ? 'bg-gray-500' // System messages get a fixed gray background
        : generateUserColor(message.username || 'System'), // Otherwise assign based on username
    },
    timestamp: formatTimestamp(message.timestamp), // Convert timestamp to human-readable time
    content: message.text, // Message content
    isSystem: message.isSystem, // Boolean flag for system messages
    isOwn: message.username === user?.username, // True if message was sent by current user
    isDeleted: message.isDeleted, // Boolean flag for deleted messages
  }))
}

/**
 * Formats the current user's data for display in the UI (e.g., sidebar, profile chip).
 */
export const formatCurrentUserData = (user) => {
  return user
    ? {
        name: user.username, // User's name
        initials: generateUserInitials(user.username), // Initials derived from username
        bgColor: generateUserColor(user.username), // Background color assigned from username
        status: user.status || 'Online', // Online status based on socket
      }
    : null // Return null if user is not defined
}

/**
 * Formats the list of users for display in the DM list.
 */
export const formatUsersForDMList = (users, connectedUsers) => {
  return users.map((user) => {
    // Find the corresponding connected user to get the online status
    const onlineUser = connectedUsers.find(u => u.userId === user.id)
    const status = onlineUser?.status?.toLowerCase() || 'offline'

    return {
      user: {
        id: user.id,
        name: user.username,
        initials: generateUserInitials(user.username),
        bgColor: generateUserColor(user.username),
        status,
      },
      unreadCount: 0,
    }
  })
}

/**
 * Formats the list of connected users into member status chips for display.
 */
export const formatOnlineMembers = (connectedUsers) => {
  if (!Array.isArray(connectedUsers)) {
    return []
  }

  return connectedUsers
    .filter(connectedUser => {
      return connectedUser &&
             connectedUser.userId &&
             connectedUser.username &&
             connectedUser.userId.trim() !== ''
    })
    .map((connectedUser) => ({
      id: connectedUser.userId,
      userId: connectedUser.userId, // Keep both for compatibility
      name: connectedUser.username,
      initials: generateUserInitials(connectedUser.username),
      bgColor: generateUserColor(connectedUser.username),
      status: connectedUser.status?.toLowerCase() || 'online',
    }))
}
