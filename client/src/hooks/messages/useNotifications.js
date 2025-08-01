import { useEffect } from 'react'

/**
 * Custom hook to manage notification behavior, including auto-dismiss.
 *
 * @param {string|null} notification - The current notification message (or null).
 * @param {Function} setNotification - Function to update the notification state.
 * @returns {Object} - Contains a handler to manually close the notification.
 */
export const useNotifications = (notification, setNotification) => {
  // Effect to auto-dismiss the notification after 5 seconds
  useEffect(() => {
    if (notification) {
      // Start a timeout that clears the notification after 5 seconds
      const timer = setTimeout(() => {
        setNotification(null)
      }, 5000)

      // Clear the timeout if the component unmounts or notification changes before timeout
      return () => clearTimeout(timer)
    }
  }, [notification, setNotification]) // Re-run effect when notification or setNotification changes

  /**
   * Manually closes the notification immediately.
   */
  const handleCloseNotification = () => {
    setNotification(null)
  }

  // Return the manual close handler for use in the UI
  return {
    handleCloseNotification
  }
}
