import prisma from '../../prisma/prisma.js'

/**
 * Handles deleting messages in real-time
 */
export const handleDeleteMessage = async (socket, deleteData, connectedUsers) => {
  try {
    const user = connectedUsers.get(socket.id)
    if (!user) {
      throw new Error('User not found in connected users')
    }

    const { messageId } = deleteData

    if (!messageId) {
      throw new Error('Invalid delete data: messageId is required')
    }

    // Find the message and verify ownership
    const message = await prisma.message.findUnique({
      where: { id: messageId },
      include: {
        user: { select: { id: true, username: true } },
        channel: { select: { id: true, name: true } }
      }
    })

    if (!message) {
      throw new Error('Message not found')
    }

    if (message.userId !== user.userId) {
      throw new Error('You can only delete your own messages')
    }

    // If message is already deleted
    if (message.isDeleted) {
      const deleteResponse = {
        messageId,
        channelId: message.channelId,
        deletedBy: user.username,
        timestamp: new Date().toISOString(),
        alreadyDeleted: true
      }

      socket.to(message.channelId).emit('message_deleted', deleteResponse)
      socket.emit('message_deleted', deleteResponse)
      socket.emit('message_delete_success', deleteResponse)

      return
    }

    // Soft delete the message
    await prisma.message.update({
      where: { id: messageId },
      data: {
        isDeleted: true,
        deletedAt: new Date()
      }
    })

    const deleteResponse = {
      messageId,
      channelId: message.channelId,
      deletedBy: user.username,
      timestamp: new Date().toISOString()
    }

    // Broadcast the deletion to all users in the channel
    socket.to(message.channelId).emit('message_deleted', deleteResponse)
    socket.emit('message_deleted', deleteResponse) // Also emit to sender

    // Confirm deletion to sender
    socket.emit('message_delete_success', deleteResponse)

    console.log(`Message (ID ${messageId}) deleted by ${user.username} in channel ${message.channel.name}`)
  } catch (error) {
    console.error(`Error in handleDeleteMessage for socket ${socket.id}:`, error)

    socket.emit('message_delete_error', {
      messageId: deleteData.messageId,
      error: error.message,
      timestamp: new Date().toISOString()
    })
  }
}
