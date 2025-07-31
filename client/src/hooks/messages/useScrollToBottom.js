import { useEffect, useRef } from 'react'

/**
 * Custom hook to automatically scroll to the bottom of a message list when messages change.
 *
 * @param {Array} messages - The list of messages to observe.
 * @returns {Object} - Contains the ref to attach to the bottom of the list and a manual scroll function.
 */
export const useScrollToBottom = (messages) => {
  // Ref pointing to the end of the messages list
  const messagesEndRef = useRef(null)

  /**
   * Scrolls the container to the bottom smoothly using the ref
   */
  const scrollToBottom = () => {
    // Only scroll if the ref is attached
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  // Run scrollToBottom every time the messages array changes
  useEffect(() => {
    scrollToBottom()
  }, [messages]) // Dependency: re-run effect when messages update

  // Return the ref and scroll function for use in components
  return {
    messagesEndRef,
    scrollToBottom
  }
}
