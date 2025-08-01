import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

/**
 * Handles sending messages between users in chat channels
 * Manages message distribution and notifications
 */
export const handleSendMessage = async (socket, messageData, connectedUsers) => {
  try {
    const user = connectedUsers.get(socket.id)
    if (!user) {
      throw new Error('User not found in connected users')
    }

    const channelIdFromClient = messageData.channel || user.currentChannel

    const messageText = messageData.text.trim()

    if (!channelIdFromClient) {
      throw new Error('No channel ID specified and user has no current channel')
    }
    if (messageText.length === 0) {
      throw new Error('Message text cannot be empty after trimming')
    }

    const MAX_MESSAGE_LENGTH = 2000
    if (messageText.length > MAX_MESSAGE_LENGTH) {
      throw new Error(`Message too long. Maximum length is ${MAX_MESSAGE_LENGTH} characters`)
    }

    const channelRecord = await prisma.channel.findUnique({
      where: { id: channelIdFromClient },
      select: {
        id: true,
        name: true,
        description: true,
        isPrivate: true,
        members: {
          select: {
            user: {
              select: {
                id: true
              }
            }
          }
        }
      }
    })

    if (!channelRecord) {
      throw new Error(`Channel #${channelIdFromClient} does not exist`)
    }

    const actualChannelName = channelRecord.name

    // Extract member User IDs from the channelRecord
    const channelMemberUserIds = new Set(channelRecord.members.map(member => member.user.id))

    // Parse mentions (simple @username detection)
    let mentionedUserId = null
    const mentionMatch = messageText.match(/@(\w+)/)
    if (mentionMatch) {
      const mentionedUsername = mentionMatch[1]
      const mentionedUser = await prisma.user.findUnique({
        where: { username: mentionedUsername }
      })
      if (mentionedUser) {
        mentionedUserId = mentionedUser.id
      }
    }

    // Save message to database
    const savedMessage = await prisma.message.create({
      data: {
        content: messageText,
        userId: user.userId,
        channelId: channelRecord.id,
        mentionedUserId
      },
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
      }
    })

    // Create message payload
    const message = {
      id: savedMessage.id,
      text: messageText,
      username: user.username,
      userId: user.userId,
      channel: channelRecord.id,
      channelName: actualChannelName,
      timestamp: savedMessage.createdAt.toISOString(),
      messageType: messageData.messageType || 'text',
      edited: false,
      reactions: {},
      mentionedUser: savedMessage.mentionedUser
        ? {
            id: savedMessage.mentionedUser.id,
            username: savedMessage.mentionedUser.username
          }
        : null
    }

    // Send the message to all users in the same channel
    socket.to(channelRecord.id).emit('receive_message', message)

    // Echo the message back to the sender for confirmation
    socket.emit('message_sent', {
      ...message,
      status: 'delivered',
      deliveredAt: new Date().toISOString(),
    })

    if (mentionedUserId) {
      const mentionedUserSocket = Array.from(connectedUsers.entries())
        .find(([, userData]) => userData.userId === mentionedUserId)

      if (mentionedUserSocket) {
        const [mentionedSocketId] = mentionedUserSocket
        socket.to(mentionedSocketId).emit('mention_notification', {
          title: `You were mentioned in #${actualChannelName}`,
          message: `${message.username}: ${message.text}`,
          channel: channelRecord.id,
          channelName: actualChannelName,
          messageId: message.id,
          username: message.username,
          userId: message.userId,
          timestamp: message.timestamp,
          notificationType: 'mention',
        })
      }
    }

    const notificationPreview = messageText.length > 50
      ? `${messageText.substring(0, 50)}...`
      : messageText

    // Filter connected users to send notifications only if:
    const usersForNotification = Array.from(connectedUsers.values()).filter(
      (onlineUser) =>
        onlineUser.id !== socket.id && // They are not the sender
        onlineUser.currentChannel !== channelIdFromClient && // They are not currently in this channel
        channelMemberUserIds.has(onlineUser.userId) // They are a member of this channel
    )

    if (usersForNotification.length > 0) {
      usersForNotification.forEach((otherUser) => {
        socket.to(otherUser.id).emit('message_notification', {
          title: `New message in #${actualChannelName}`,
          message: `${message.username}: ${notificationPreview}`,
          channel: channelRecord.id,
          channelName: actualChannelName,
          messageId: message.id,
          username: message.username,
          userId: message.userId,
          timestamp: message.timestamp,
          notificationType: 'channel_message',
        })
      })

      console.log(`Sent notification to ${usersForNotification.length} user(s) in other channels`)
    }

    console.log(
      `Message from ${user.username} in #${actualChannelName} (Channel ID: ${channelRecord.id}): ${messageText.substring(0, 100)}${
        messageText.length > 100 ? '...' : ''
      }`
    )
  } catch (error) {
    console.error(`Error in handleSendMessage for socket ${socket.id}:`, error)

    socket.emit('message_send_error', {
      message: 'Failed to send message',
      originalText: messageData.text,
      channel: messageData.channel,
      error: error.message,
      timestamp: new Date().toISOString(),
    })

    throw error
  }
}
