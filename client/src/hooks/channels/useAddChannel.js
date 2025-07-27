import { useState } from 'react'

export function useAddChannel () {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const addChannel = async (channelData) => {
    setLoading(true)
    setError(null)

    const token = localStorage.getItem('token')

    try {
      const res = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/user/channels`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(channelData),
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

  return { addChannel, loading, error }
}
