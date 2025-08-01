import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

/**
 * Handles user switching between different chat channels
 * Manages room memberships and channel transitions
 */
export const handleJoinChannel = async (socket, channelData, connectedUsers) => {
  try {
    // Get the user associated with this socket
    const user = connectedUsers.get(socket.id)

    // Double-check if the user exists
    if (!user) {
      throw new Error('User not found in connected users')
    }

    const previousChannel = user.currentChannel
    const newChannelId = channelData.channel.trim()

    // Validate channel ID
    if (newChannelId.length === 0) {
      throw new Error('Channel ID cannot be empty')
    }

    // Get channel record to validate it exists and get its name
    const channelRecord = await prisma.channel.findUnique({
      where: { id: newChannelId },
      select: {
        id: true,
        name: true,
        description: true,
        isPrivate: true
      }
    })

    // If channel does not exist, throw an error
    if (!channelRecord) {
      throw new Error(`Channel with ID ${newChannelId} does not exist`)
    }

    // Get the actual channel name for logging and notifications
    const actualChannelName = channelRecord.name

    // Leave the previous channel room if one exists
    if (previousChannel) {
      socket.leave(previousChannel)

      // Get previous channel name for logging
      let previousChannelName = previousChannel
      try {
        const prevChannelRecord = await prisma.channel.findUnique({
          where: { id: previousChannel },
          select: { name: true }
        })
        if (prevChannelRecord) {
          previousChannelName = prevChannelRecord.name
        }
      } catch (error) {
        // Use ID if name lookup fails
      }

      console.log(`${user.username} (ID: ${user.userId}) has left channel #${previousChannelName}`)

      // Notify others in the previous channel that user left
      socket.to(previousChannel).emit('user_channel_left', {
        username: user.username,
        userId: user.userId,
        channel: previousChannel,
        newChannel: newChannelId,
        timestamp: new Date().toISOString(),
      })
    }

    // Join the new channel room and update the user's current channel
    socket.join(newChannelId)
    user.currentChannel = newChannelId
    user.lastChannelSwitch = new Date().toISOString()

    // Fetch message history for the new channel
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
        channel: newChannelId,
        timestamp: msg.createdAt.toISOString(),
        messageType: 'text',
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
        channel: newChannelId,
        messages: formattedMessages,
        timestamp: new Date().toISOString()
      })
    } catch (historyError) {
      console.error(`Error fetching message history for ${actualChannelName}:`, historyError)
      // Continue with channel join even if history fetch fails
    }

    console.log(`${user.username} (ID: ${user.userId}) has joined channel #${actualChannelName}`)

    // Notify the client that the switch succeeded
    socket.emit('channel_joined', {
      channel: newChannelId,
      previousChannel,
      timestamp: user.lastChannelSwitch,
      message: `Successfully joined channel #${actualChannelName}`,
    })

    // Notify others in the new channel that user joined
    socket.to(newChannelId).emit('user_channel_joined', {
      username: user.username,
      userId: user.userId,
      channel: newChannelId,
      previousChannel,
      timestamp: user.lastChannelSwitch,
    })
  } catch (error) {
    console.error(`Error in handleJoinChannel for socket ${socket.id}:`, error)

    // Emit error to the client
    socket.emit('channel_join_error', {
      message: 'Failed to join channel',
      requestedChannel: channelData.channel,
      error: error.message,
      timestamp: new Date().toISOString(),
    })

    throw error // Re-throw to be caught by the main error handler
  }
}
