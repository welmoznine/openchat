import { useState } from 'react'

export function useAddChannelMember () {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const addChannelMember = async (channelId, username) => {
    setLoading(true)
    setError(null)

    const token = localStorage.getItem('token')

    try {
      const res = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/user/channels/${channelId}/members`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username }),
      })

      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || 'Failed to add channel member')
      }

      const data = await res.json()
      return data
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return { addChannelMember, loading, error }
}
