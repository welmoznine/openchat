import prisma from '../../prisma/prisma.js'
import { Status } from '@prisma/client'

export const handleStatusUpdate = async (
  socket,
  newStatus,
  connectedUsers,
  getUniqueUsers
) => {
  const user = connectedUsers.get(socket.id)
  if (!user) {
    throw new Error('User not found in connected users')
  }

  // Update the user's in-memory status
  const normalizedStatus = newStatus.toLowerCase()
  user.status = normalizedStatus
  console.log(`Updated status for user ${user.username} to ${normalizedStatus}`)

  // Persist the status change to the database
  const statusEnumMap = {
    online: Status.ONLINE,
    away: Status.AWAY,
    busy: Status.BUSY,
    offline: Status.OFFLINE,
  }

  // Find the correct Prisma enum value or throw an error for an invalid status
  const prismaStatus = statusEnumMap[normalizedStatus]
  if (!prismaStatus) {
    throw new Error(`Invalid status: ${newStatus}`)
  }

  await prisma.user.update({
    where: { id: user.userId },
    data: { status: prismaStatus },
  })

  // Get all unique users with their current status
  const uniqueUsers = getUniqueUsers()

  // Broadcast the updated users list
  socket.broadcast.emit('users_list', uniqueUsers)
  socket.emit('users_list', uniqueUsers)
}
