import { useState, useEffect, useMemo } from 'react'

/**
 * Custom hook to manage the active chat channel.
 *
 * @param {Array} channels - List of available chat channels.
 * @returns {Object} - Contains activeChannelId, setActiveChannelId function, and the activeChannel object.
 */
export const useActiveChannel = (channels) => {
  // State to keep track of the currently active channel ID
  const [activeChannelId, setActiveChannelId] = useState(null)

  // Memoized computation to find the active channel object based on the activeChannelId
  const activeChannel = useMemo(() => {
    // Find the channel whose ID matches the activeChannelId, or return null if not found
    return channels.find((c) => c.id === activeChannelId) || null
  }, [channels, activeChannelId]) // Recompute if channels or activeChannelId change

  // Effect to auto-select a default channel when channels are loaded
  useEffect(() => {
    // Only run if channels are available and no channel is currently selected
    if (channels.length > 0 && !activeChannelId) {
      // Try to find a channel named 'general'
      const generalChannel = channels.find((c) => c.name === 'general')
      if (generalChannel) {
        // If found, set it as the active channel
        console.log('Auto-selecting general channel:', generalChannel.id)
        setActiveChannelId(generalChannel.id)
      } else {
        // If 'general' is not found, select the first available channel
        console.log(
          'No general channel found, selecting first available channel:',
          channels[0].id
        )
        setActiveChannelId(channels[0].id)
      }
    }
  }, [channels, activeChannelId]) // Re-run if channels or activeChannelId change

  // Return the current active channel ID, setter, and the active channel object
  return {
    activeChannelId,
    setActiveChannelId,
    activeChannel
  }
}
