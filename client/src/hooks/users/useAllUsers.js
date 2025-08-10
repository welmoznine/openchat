import { useState, useEffect } from 'react'

/**
 * Custom hook to fetch all registered users (excluding current user)
 * Used for starting new DM conversations
 */
export const useAllUsers = () => {
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const fetchUsers = async () => {
    try {
      setLoading(true)
      setError(null)

      const token = localStorage.getItem('token')
      const res = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/user/all-users`, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      })

      if (!res.ok) {
        throw new Error(`HTTP ${res.status}: Failed to fetch users`)
      }

      const data = await res.json()
      setUsers(data)
    } catch (err) {
      console.error('Error fetching all users:', err)
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchUsers()
  }, [])

  return {
    users,
    loading,
    error,
    refresh: fetchUsers
  }
}
