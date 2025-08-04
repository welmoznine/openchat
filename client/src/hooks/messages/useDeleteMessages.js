import { useState } from 'react'

export function useDeleteMessages () {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const deleteMessage = async (messageId) => {
    setLoading(true)
    setError(null)

    // Retrieve the auth token from local storage
    const token = localStorage.getItem('token')

    try {
      // Make the DELETE request to the API endpoint
      const res = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/user/messages/${messageId}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      })

      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || 'Failed to delete message')
      }

      // Return the successful response data
      const data = await res.json()
      return data
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return { deleteMessage, loading, error }
}
