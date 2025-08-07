import prisma from '../../prisma/prisma.js'

export const handleSendDirectMessage = async (socket, messageData, connectedUsers) => {
  try {
    const sender = connectedUsers.get(socket.id)
    if (!sender) {
      throw new Error('Sender not found in connected users')
    }

    const { receiverUserId, text } = messageData
    const messageText = text.trim()

    if (!receiverUserId) {
      throw new Error('Receiver user ID is required')
    }

    if (messageText.length === 0) {
      throw new Error('Message text cannot be empty')
    }

    const MAX_MESSAGE_LENGTH = 2000
    if (messageText.length > MAX_MESSAGE_LENGTH) {
      throw new Error(`Message too long. Maximum length is ${MAX_MESSAGE_LENGTH} characters`)
    }

    // Verify receiver exists
    const receiver = await prisma.user.findUnique({
      where: { id: receiverUserId },
      select: { id: true, username: true }
    })

    if (!receiver) {
      throw new Error('Receiver not found')
    }

    // Save direct message to database
    const savedMessage = await prisma.directMessage.create({
      data: {
        content: messageText,
        senderId: sender.userId,
        receiverId: receiverUserId,
      },
      include: {
        sender: {
          select: { id: true, username: true }
        },
        receiver: {
          select: { id: true, username: true }
        }
      }
    })

    // Create message payload
    const message = {
      id: savedMessage.id,
      text: messageText,
      username: sender.username,
      userId: sender.userId,
      receiverUserId,
      receiverUsername: receiver.username,
      timestamp: savedMessage.createdAt.toISOString(),
      messageType: 'direct_message',
      isDeleted: savedMessage.isDeleted
    }

    // Find receiver's socket
    const receiverSocket = Array.from(connectedUsers.entries())
      .find(([, userData]) => userData.userId === receiverUserId)

    // Send to receiver if online
    if (receiverSocket) {
      const [receiverSocketId] = receiverSocket

      // Send the direct message itself
      socket.to(receiverSocketId).emit('receive_direct_message', message)

      // Send a specific notification event
      const notificationPreview = messageText.length > 50
        ? `${messageText.substring(0, 50)}...`
        : messageText

      socket.to(receiverSocketId).emit('dm_notification', {
        title: `New message from ${sender.username}`,
        message: notificationPreview,
        senderId: sender.userId,
        senderUsername: sender.username,
        timestamp: new Date().toISOString(),
        notificationType: 'direct_message',
      })
    }

    // Confirm to sender
    socket.emit('direct_message_sent', {
      ...message,
      status: 'delivered',
      deliveredAt: new Date().toISOString()
    })
  } catch (error) {
    console.error('Error in handleSendDirectMessage:', error)
    socket.emit('direct_message_error', {
      message: 'Failed to send direct message',
      error: error.message,
      timestamp: new Date().toISOString()
    })
  }
}

export const handleGetDirectMessageHistory = async (socket, requestData, connectedUsers) => {
  try {
    const user = connectedUsers.get(socket.id)
    if (!user) {
      throw new Error('User not found')
    }

    const { otherUserId, limit = 50, before } = requestData

    if (!otherUserId) {
      throw new Error('Other user ID is required')
    }

    // Build query conditions
    const whereConditions = {
      OR: [
        { senderId: user.userId, receiverId: otherUserId },
        { senderId: otherUserId, receiverId: user.userId }
      ],
      // isDeleted: false // Filter out soft-deleted messages
    }

    if (before) {
      whereConditions.createdAt = { lt: new Date(before) }
    }

    const messages = await prisma.directMessage.findMany({
      where: whereConditions,
      orderBy: { createdAt: 'desc' },
      take: parseInt(limit),
      include: {
        sender: {
          select: { id: true, username: true }
        },
        receiver: {
          select: { id: true, username: true }
        }
      }
    })

    // Format messages for frontend
    const formattedMessages = messages.reverse().map((msg) => ({
      id: msg.id,
      text: msg.content,
      username: msg.sender.username,
      userId: msg.senderId,
      receiverUserId: msg.receiverId,
      receiverUsername: msg.receiver.username,
      timestamp: msg.createdAt.toISOString(),
      messageType: 'direct_message',
      isDeleted: msg.isDeleted
    }))

    socket.emit('direct_message_history', {
      otherUserId,
      messages: formattedMessages
    })
  } catch (error) {
    console.error('Error fetching DM history:', error)
    socket.emit('direct_message_history_error', {
      error: error.message,
      timestamp: new Date().toISOString()
    })
  }
}
