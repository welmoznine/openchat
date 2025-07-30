/**
 * Formats a timestamp into a human-readable time string.
 * Example: "3:45 PM"
 *
 * @param {string|number|Date} timestamp - The input timestamp.
 * @returns {string} - A time string with 2-digit hour and minute.
 */
export const formatTimestamp = (timestamp) => {
  const date = new Date(timestamp)
  return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
}

/**
 * Generates user initials by taking the first two characters of the username and converting them to uppercase.
 * Example: "john" -> "JO"
 *
 * @param {string} username - The user's username.
 * @returns {string} - Two uppercase initials.
 */
export const generateUserInitials = (username) => {
  return username.substring(0, 2).toUpperCase()
}

/**
 * Generates a consistent background color class for a user based on their username.
 * Uses the character code of the first character in the username to select a color from a fixed list.
 *
 * @param {string} username - The user's username.
 * @returns {string} - A Tailwind CSS background color class.
 */
export const generateUserColor = (username) => {
  const colors = [
    'bg-blue-500',
    'bg-green-500',
    'bg-purple-500',
    'bg-orange-500',
    'bg-pink-500',
    'bg-red-500',
    'bg-yellow-500',
    'bg-indigo-500',
    'bg-teal-500',
  ]
  const index = username.charCodeAt(0) % colors.length
  return colors[index]
}
