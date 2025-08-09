import { useState, useEffect, useMemo, useRef } from 'react'

/**
 * Custom hook to manage the active chat channel.
 *
 * @param {Array} channels - List of available chat channels.
 * @param {string|null} activeDmId - ID of the currently active direct message (if any).
 * @returns {Object} - Contains:
 *   - activeChannelId: The currently active channel's ID
 *   - setActiveChannelId: Function to update the active channel ID
 *   - activeChannel: The full channel object for the currently active channel
 */
export const useActiveChannel = (channels, activeDmId) => {
  // State to keep track of the currently active channel ID
  const [activeChannelId, setActiveChannelId] = useState(null)

  // Ref that persists across renders to track whether this is the initial mount
  const isInitialMount = useRef(true)

  // Memoized computation to find the active channel object based on the activeChannelId
  // Avoids recomputing unless either the channel list or activeChannelId changes
  const activeChannel = useMemo(() => {
    // Find the channel whose ID matches the activeChannelId, or return null if not found
    return channels.find((c) => c.id === activeChannelId) || null
  }, [channels, activeChannelId]) // Recompute if channels or activeChannelId change

  useEffect(() => {
    if (isInitialMount.current && channels.length > 0 && activeChannelId === null && activeDmId === null) {
      const generalChannel = channels.find((c) => c.name === 'general')
      if (generalChannel) {
        setActiveChannelId(generalChannel.id)
      } else {
        setActiveChannelId(channels[0].id)
      }
      isInitialMount.current = false
    }
  }, [channels, activeDmId, activeChannelId])

  // Handles redirection if the active channel is deleted.
  useEffect(() => {
    // Skip if this is still the first render; let the initial logic handle it
    if (isInitialMount.current) return

    // If the current active channel doesn't exist anymore
    if (activeChannelId && !activeChannel) {
      const generalChannel = channels.find((c) => c.name === 'general')
      if (generalChannel) {
        // Redirect to #general
        setActiveChannelId(generalChannel.id)
      } else if (channels.length > 0) {
        // Fallback if #general is somehow deleted
        setActiveChannelId(channels[0].id)
      } else {
        // No channels left at all
        setActiveChannelId(null)
      }
    }
  }, [channels, activeChannel, activeChannelId])

  return {
    activeChannelId,
    setActiveChannelId,
    activeChannel,
  }
}
