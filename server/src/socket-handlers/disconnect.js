import { handleTypingEvents } from './typingEvents.js'
import prisma from '../../prisma/prisma.js'
import { Status } from '@prisma/client'

/**
 * Handles user disconnection and cleanup of user state
 * Manages room cleanup and broadcasts updated user lists
 */
export const handleDisconnect = async (
  socket,
  connectedUsers,
  usersByUserId,
  getUniqueUsers
) => {
  try {
    const user = connectedUsers.get(socket.id)

    // If user doesn't exist, log and return early
    if (!user) {
      console.log(`Socket ${socket.id} disconnected but no user data found`)
      return
    }
    // Persist the status change to the database
    await prisma.user.update({
      where: { id: user.userId },
      data: { status: Status.OFFLINE },
    })

    const disconnectTimestamp = new Date().toISOString()

    // Clean up typing status if user was typing
    handleTypingEvents.cleanupTypingStatus(socket, user, connectedUsers)

    // Leave the current channel room
    if (user.currentChannel) {
      socket.leave(user.currentChannel)

      // Notify others in the channel that user disconnected
      socket.to(user.currentChannel).emit('user_channel_left', {
        username: user.username,
        userId: user.userId,
        channel: user.currentChannel,
        timestamp: disconnectTimestamp,
        reason: 'disconnected',
      })
    }

    // Store user info for logging before cleanup
    const userInfo = {
      username: user.username,
      userId: user.userId,
      currentChannel: user.currentChannel,
      socketId: socket.id,
      sessionDuration: user.joinedAt
        ? Math.round((new Date() - new Date(user.joinedAt)) / 1000)
        : null,
    }

    // Clean up the internal maps
    connectedUsers.delete(socket.id)
    usersByUserId.delete(user.userId)

    // Rebuild the active users list after this user disconnects
    const uniqueUsers = getUniqueUsers()

    // Broadcast the updated users list to all remaining connected clients
    socket.broadcast.emit('users_list', uniqueUsers)

    // Broadcast user disconnection event with additional context
    socket.broadcast.emit('user_disconnected', {
      username: user.username,
      userId: user.userId,
      timestamp: disconnectTimestamp,
      activeUsersCount: uniqueUsers.length,
    })

    // Log disconnect information
    console.log(
      `${userInfo.username} (ID: ${userInfo.userId}) disconnected from #${userInfo.currentChannel}. ` +
      `Session duration: ${userInfo.sessionDuration}s. ` +
      `Active users remaining: ${uniqueUsers.length}`
    )
  } catch (error) {
    console.error(`Error handling disconnect for socket ${socket.id}:`, error)

    // Even if there's an error, try to clean up what we can
    try {
      if (connectedUsers.has(socket.id)) {
        const user = connectedUsers.get(socket.id)
        connectedUsers.delete(socket.id)

        if (user && user.userId) {
          usersByUserId.delete(user.userId)
        }
      }

      // Still broadcast updated users list in case of partial cleanup
      const uniqueUsers = getUniqueUsers()
      socket.broadcast.emit('users_list', uniqueUsers)
    } catch (cleanupError) {
      console.error('Error during disconnect cleanup:', cleanupError)
    }

    // Don't re-throw disconnect errors as they can't be handled by the client
  }
}
