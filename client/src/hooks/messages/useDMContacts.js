import { useState, useEffect } from 'react'

/**
 * Custom hook to fetch users with who the current user has an existing DM conversation history
 */
export const useDMContacts = () => {
  const [contacts, setContacts] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const fetchContacts = async () => {
    try {
      setLoading(true)
      setError(null)

      const token = localStorage.getItem('token')
      const res = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/user/dm-contacts`, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      })

      if (!res.ok) {
        throw new Error(`HTTP ${res.status}: Failed to fetch DM contacts`)
      }

      const data = await res.json()
      setContacts(data)
    } catch (err) {
      console.error('Error fetching DM contacts:', err)
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchContacts()
  }, [])

  // Refresh contacts when a new DM is sent/received
  const addContact = (newContact) => {
    setContacts(prevContacts => {
      const existingIndex = prevContacts.findIndex(c => c.id === newContact.id)

      if (existingIndex >= 0) {
        // Move existing contact to top
        const updated = [...prevContacts]
        const [existing] = updated.splice(existingIndex, 1)
        return [{ ...existing, lastMessageAt: new Date().toISOString() }, ...updated]
      } else {
        // Add new contact at top
        return [{
          ...newContact,
          lastMessageAt: new Date().toISOString()
        }, ...prevContacts]
      }
    })
  }

  return {
    contacts,
    loading,
    error,
    refresh: fetchContacts,
    addContact
  }
}
