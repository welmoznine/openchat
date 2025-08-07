/**
 * Handle users joining DM rooms for real-time messaging
 */
export const handleJoinDM = async (socket, data, connectedUsers) => {
  try {
    const user = connectedUsers.get(socket.id)

    if (!user) {
      throw new Error('User not found in connected users')
    }

    const { otherUserId } = data

    if (!otherUserId) {
      throw new Error('Other user ID is required for joining DM')
    }

    // Create room name (consistent with typing events)
    const dmRoom = [user.userId, otherUserId].sort().join('-')

    // Join the socket to the DM room
    socket.join(dmRoom)

    // Store current DM info on user object
    user.currentDM = otherUserId
    user.currentDMRoom = dmRoom

    // Emit success back to client
    socket.emit('dm_joined', {
      otherUserId,
      dmRoom,
      timestamp: new Date().toISOString()
    })
    return dmRoom
  } catch (error) {
    console.error('Error in handleJoinDM:', error)
    socket.emit('dm_join_error', {
      message: 'Failed to join DM room',
      error: error.message,
      timestamp: new Date().toISOString()
    })
    throw error
  }
}
