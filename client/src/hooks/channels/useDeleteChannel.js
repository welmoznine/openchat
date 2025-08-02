import { useState } from 'react'

export function useDeleteChannel () {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const deleteChannel = async (channelId) => {
    setLoading(true)
    setError(null)

    const token = localStorage.getItem('token')

    try {
      const res = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/user/channels/${channelId}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      })

      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || 'Failed to create channel')
      }

      const data = await res.json()
      return data
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return { deleteChannel, loading, error }
}
