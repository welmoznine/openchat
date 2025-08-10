import { useState, useMemo } from 'react'
import { generateUserInitials, generateUserColor } from 'client/src/utils/chatUtils.js'

/**
 * Custom hook to manage the active direct message conversation.
 */
/**
 * Custom hook to manage the active direct message conversation.
 */
export const useActiveDirectMessage = (connectedUsers, dmContacts, allUsers, currentUserId) => {
  const [activeDmId, setActiveDmId] = useState(null)

  const activeDmUser = useMemo(() => {
    if (!activeDmId) {
      return null
    }

    // 1. Try to find the user in the dmContacts list first.
    // The dmContacts should have structure: { id, username, status, ... }
    const contact = dmContacts.find((c) => c.id === activeDmId)

    if (contact) {
      return {
        id: contact.id,
        username: contact.username, // Keep 'username' for consistency
        name: contact.username,
        initials: generateUserInitials(contact.username),
        bgColor: generateUserColor(contact.username),
        status: contact.status || 'offline',
      }
    }

    // 2. Fallback to allUsers to get the name for a brand-new DM.
    const offlineUser = allUsers.find(
      (u) => u.id === activeDmId && u.id !== currentUserId
    )

    if (offlineUser) {
      return {
        id: offlineUser.id,
        username: offlineUser.username,
        name: offlineUser.username,
        initials: generateUserInitials(offlineUser.username),
        bgColor: generateUserColor(offlineUser.username),
        status: 'offline',
      }
    }

    // 3. Fallback to connectedUsers as a last resort
    const connectedUser = connectedUsers.find(
      (u) => u.userId === activeDmId && u.userId !== currentUserId
    )
    if (connectedUser) {
      return {
        id: connectedUser.userId,
        username: connectedUser.username,
        name: connectedUser.username,
        initials: generateUserInitials(connectedUser.username),
        bgColor: generateUserColor(connectedUser.username),
        status: connectedUser.status,
      }
    }

    return null
  }, [connectedUsers, dmContacts, allUsers, activeDmId, currentUserId])

  return {
    activeDmId,
    setActiveDmId,
    activeDmUser,
  }
}
