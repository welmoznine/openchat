import prisma from '../../prisma/prisma.js'
import { Status } from '@prisma/client'

/**
 * Handles user joining the chat application
 * Enforces one active connection per user and manages user state
 */
export const handleUserJoin = async (
  socket,
  userData,
  connectedUsers,
  usersByUserId,
  getUniqueUsers
) => {
  try {
    // Check if this user already has a socket
    const existingSocketId = usersByUserId.get(userData.userId)

    // If another socket is already connected for this user, disconnect it
    if (existingSocketId && existingSocketId !== socket.id) {
      const existingSocket =
        socket.server.sockets.sockets.get(existingSocketId)
      if (existingSocket) {
        existingSocket.emit('force_disconnect', {
          reason: 'new_session',
          message: 'You have been logged in from another device'
        })
        existingSocket.disconnect(true)
      }

      // Clean up the old connection data
      connectedUsers.delete(existingSocketId)
      usersByUserId.delete(userData.userId)
    }

    // Get channel record to validate it exists and get its name
    const channelRecord = await prisma.channel.findUnique({
      where: { id: userData.channel },
      select: {
        id: true,
        name: true,
        description: true,
        isPrivate: true
      }
    })

    // If channel does not exist, throw an error
    if (!channelRecord) {
      throw new Error(`Channel with ID ${userData.channel} does not exist`)
    }

    const actualChannelName = channelRecord.name

    // Fetch the user's data from the database, including the status field
    const userFromDb = await prisma.user.update({
      where: { id: userData.userId },
      data: {
        lastLoginAt: new Date(),
        status: Status.ONLINE,
      },
      select: {
        username: true,
        status: true,
      },
    })

    // Create a user object associated with this socket
    const user = {
      id: socket.id,
      username: userData.username,
      userId: userData.userId,
      status: userFromDb.status,
      currentChannel: userData.channel,
      joinedAt: new Date().toISOString(),
    }

    // Save user in memory maps
    connectedUsers.set(socket.id, user)
    usersByUserId.set(userData.userId, socket.id)

    // Join the default channel room
    socket.join(user.currentChannel)

    // Fetch message history for the channel
    try {
      const messages = await prisma.message.findMany({
        where: { channelId: channelRecord.id },
        include: {
          user: {
            select: {
              id: true,
              username: true
            }
          },
          mentionedUser: {
            select: {
              id: true,
              username: true
            }
          }
        },
        orderBy: { createdAt: 'asc' },
        take: 50 // Limit to last 50 messages
      })

      // Format messages for the client
      const formattedMessages = messages.map(msg => ({
        id: msg.id,
        text: msg.content,
        username: msg.user.username,
        userId: msg.user.id,
        channel: user.currentChannel,
        timestamp: msg.createdAt.toISOString(),
        messageType: 'channel',
        isDeleted: msg.isDeleted,
        edited: false,
        reactions: {},
        mentionedUser: msg.mentionedUser
          ? {
              id: msg.mentionedUser.id,
              username: msg.mentionedUser.username
            }
          : null
      }))

      // Send message history to the user
      socket.emit('message_history', {
        channel: user.currentChannel,
        messages: formattedMessages,
        timestamp: new Date().toISOString()
      })
    } catch (historyError) {
      console.error(`Error fetching message history for ${actualChannelName}:`, historyError)
    }

    // Prepare a list of all currently connected users
    const uniqueUsers = getUniqueUsers()

    // Emit the updated user list to the current user and broadcast to all others
    socket.emit('users_list', uniqueUsers)
    socket.broadcast.emit('users_list', uniqueUsers)

    // Emit successful join confirmation to the user
    socket.emit('user_joined', {
      user: {
        username: user.username,
        userId: user.userId,
        currentChannel: user.currentChannel,
      },
      message: `Successfully joined channel #${actualChannelName}`,
      timestamp: user.joinedAt,
    })

    // Broadcast to others in the same channel that a new user joined
    socket.to(user.currentChannel).emit('user_channel_joined', {
      username: user.username,
      userId: user.userId,
      channel: user.currentChannel,
      timestamp: user.joinedAt,
    })
  } catch (error) {
    console.error(`Error in handleUserJoin for user ${userData.username}:`, error)

    // Clean up any partial state that might have been created
    if (connectedUsers.has(socket.id)) {
      connectedUsers.delete(socket.id)
    }
    if (usersByUserId.get(userData.userId) === socket.id) {
      usersByUserId.delete(userData.userId)
    }

    // Emit error to the client
    socket.emit('join_error', {
      message: 'Failed to join the chat',
      error: error.message,
      timestamp: new Date().toISOString(),
    })

    throw error
  }
}
