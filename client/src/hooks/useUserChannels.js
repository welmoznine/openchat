import { useState, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'

/**
 * useUserChannels is a custom React hook to fetch and manage the current user's channels.
 *
 * Functionality:
 * - Fetches the list of channels the authenticated user belongs to from the backend.
 * - Manages loading and error states during the fetch.
 * - Provides a function to refresh/reload the channel list on demand.
 *
 * Returns an object containing:
 * - channels: An array of channel objects for the current user.
 * - loading: Boolean indicating whether the channel data is currently being fetched.
 * - error: Any error message encountered during the fetch process, or null if none.
 * - refreshChannels: Function to manually trigger re-fetching of the channels.
 */
export const useUserChannels = () => {
  const [channels, setChannels] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const navigate = useNavigate()

  const fetchChannels = useCallback(async () => {
    setLoading(true)
    setError(null)

    const token = localStorage.getItem('token')
    if (!token) {
      setError('Authentication token missing')
      setLoading(false)
      navigate('/login')
      return
    }

    try {
      const res = await fetch('http://localhost:3000/api/user/channels', {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      })

      if (res.status === 401) {
        localStorage.removeItem('token')
        navigate('/login')
        return
      }

      if (!res.ok) {
        throw new Error(`Failed to fetch channels: ${res.status} ${res.statusText}`)
      }

      const data = await res.json()
      setChannels(data)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }, [navigate])

  useEffect(() => {
    fetchChannels()
  }, [fetchChannels])

  return { channels, loading, error, refreshChannels: fetchChannels }
}
