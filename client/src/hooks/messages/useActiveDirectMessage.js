import { useState, useMemo } from 'react'

/**
 * Custom hook to manage the active direct message conversation.
 *
 * @param {Array} connectedUsers - List of currently connected users from the socket.
 * @param {string} currentUserId - The ID of the current authenticated user.
 * @returns {Object} - Contains activeDmId, setActiveDmId function, and the activeDmUser object.
 */
export const useActiveDirectMessage = (connectedUsers, currentUserId) => {
  // State to track the ID of the other user in the active DM conversation
  const [activeDmId, setActiveDmId] = useState(null)

  // Memoized computation to find the active DM user object
  const activeDmUser = useMemo(() => {
    // Find the user whose ID matches the activeDmId
    const user = connectedUsers.find(
      (u) => u.userId === activeDmId && u.userId !== currentUserId
    )
    return user || null
  }, [connectedUsers, activeDmId, currentUserId])

  return {
    activeDmId,
    setActiveDmId,
    activeDmUser,
  }
}
