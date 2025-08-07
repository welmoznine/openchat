import { useState } from 'react'

export const useDeleteMessages = () => {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const deleteMessage = async (messageId, messageType) => {
    setLoading(true)
    setError(null)

    const token = localStorage.getItem('token')

    // Determine the correct endpoint based on message type
    const endpoint = messageType === 'direct_message'
      ? `/api/user/direct-messages/${messageId}`
      : `/api/user/messages/${messageId}`

    try {
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}${endpoint}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || `Error ${response.status}`)
      }

      const result = await response.json()
      return result
    } catch (err) {
      console.error('Delete message error:', err)
      setError(err.message)
      throw err
    } finally {
      setLoading(false)
    }
  }

  return {
    deleteMessage,
    loading,
    error
  }
}
