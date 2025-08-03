import { useState } from 'react'

export function useLeaveChannel () {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const leaveChannel = async (channelId) => {
    setLoading(true)
    setError(null)

    const token = localStorage.getItem('token')

    try {
      const res = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/user/channel-members/${channelId}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      })

      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || 'Failed to removed from channel')
      }

      const data = await res.json()
      return data
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return { leaveChannel, loading, error }
}
