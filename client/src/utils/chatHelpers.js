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
  }))
}

/**
 * Formats the current user's data for display in the UI (e.g., sidebar, profile chip).
 *
 * @param {Object} user - The currently logged-in user object.
 * @param {boolean} socketConnected - Indicates if the socket is connected.
 * @returns {Object|null} - Formatted user object or null if user is not logged in.
 */
export const formatCurrentUserData = (user, socketConnected, userStatus) => {
  return user
    ? {
        name: user.username, // User's name
        initials: generateUserInitials(user.username), // Initials derived from username
        bgColor: generateUserColor(user.username), // Background color assigned from username
        status: user.status?.toLowerCase() || 'online', // Online status based on socket
      }
    : null // Return null if user is not defined
}

/**
 * Formats the list of connected users into direct messaging UI entries.
 *
 * @param {Array} connectedUsers - List of users currently connected via socket.
 * @param {Object} user - The currently logged-in user.
 * @returns {Array} - List of formatted direct message UI entries.
 */
export const formatDirectMessages = (connectedUsers, user) => {
  return connectedUsers
    // Filter out the current user from the list
    .filter((connectedUser) => connectedUser.id !== user?.id)
    .map((connectedUser) => ({
      user: {
        name: connectedUser.username, // Name of the other user
        initials: generateUserInitials(connectedUser.username), // Initials from username
        bgColor: generateUserColor(connectedUser.username), // Background color from username
        status: connectedUser.status?.toLowerCase() || 'online', // Assume all connected users are online
      },
      unreadCount: 0, // Default unread message count
    }))
}

/**
 * Formats the list of connected users into member status chips for display.
 *
 * @param {Array} connectedUsers - List of users currently connected.
 * @returns {Array} - List of formatted online member objects.
 */
export const formatOnlineMembers = (connectedUsers) => {
  return connectedUsers.map((connectedUser) => ({
    name: connectedUser.username, // User's name
    initials: generateUserInitials(connectedUser.username), // User initials
    bgColor: generateUserColor(connectedUser.username), // User background color
    status: connectedUser.status?.toLowerCase() || 'online', // All listed users are online
  }))
}
