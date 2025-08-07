import { useState, useEffect, useMemo, useRef } from 'react'

/**
 * Custom hook to manage the active chat channel.
 *
 * @param {Array} channels - List of available chat channels.
 * @returns {Object} - Contains activeChannelId, setActiveChannelId function, and the activeChannel object.
 */
export const useActiveChannel = (channels, activeDmId) => {
  // State to keep track of the currently active channel ID
  const [activeChannelId, setActiveChannelId] = useState(null)

  // Ref to ensure the default channel logic runs only once
  const isInitialMount = useRef(true)

  // Memoized computation to find the active channel object based on the activeChannelId
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

  return {
    activeChannelId,
    setActiveChannelId,
    activeChannel,
  }
}
