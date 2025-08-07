import prisma from '../../prisma/prisma.js'

/**
 * Handles deleting direct messages in real-time
 */
export const handleDeleteDirectMessage = async (socket, deleteData, connectedUsers) => {
  try {
    const user = connectedUsers.get(socket.id)
    if (!user) {
      throw new Error('User not found in connected users')
    }

    const { messageId } = deleteData

    if (!messageId) {
      throw new Error('Invalid delete data: messageId is required')
    }

    // Find the direct message and verify ownership
    const directMessage = await prisma.directMessage.findUnique({
      where: { id: messageId },
      include: {
        sender: { select: { id: true, username: true } },
        receiver: { select: { id: true, username: true } }
      }
    })

    if (!directMessage) {
      throw new Error('Direct message not found')
    }

    if (directMessage.senderId !== user.userId) {
      throw new Error('You can only delete your own direct messages')
    }

    // Soft delete the direct message
    await prisma.directMessage.update({
      where: { id: messageId },
      data: {
        isDeleted: true,
        deletedAt: new Date()
      }
    })

    const deleteResponse = {
      messageId,
      senderId: directMessage.senderId,
      receiverId: directMessage.receiverId,
      deletedBy: user.username,
      timestamp: new Date().toISOString(),
      messageType: 'direct_message'
    }

    // Create DM room identifier (consistent with your DM room naming)
    const dmRoom = [directMessage.senderId, directMessage.receiverId].sort().join('-')

    // Broadcast the deletion to both users in the DM
    socket.to(dmRoom).emit('dm_deleted', deleteResponse)
    socket.emit('dm_deleted', deleteResponse) // Also emit to sender

    // Confirm deletion to sender
    socket.emit('dm_delete_success', deleteResponse)
  } catch (error) {
    console.error(`Error in handleDeleteDirectMessage for socket ${socket.id}:`, error)

    socket.emit('dm_delete_error', {
      messageId: deleteData.messageId,
      error: error.message,
      timestamp: new Date().toISOString()
    })
  }
}
